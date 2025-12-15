package ticketnow.modules.ticket.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import ticketnow.modules.common.domain.ImageVO;
import ticketnow.modules.common.dto.image.ImageListDTO;
import ticketnow.modules.common.dto.image.NewImageDTO;
import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.common.service.image.FileService;
import ticketnow.modules.ticket.constant.TicketStatus;
import ticketnow.modules.ticket.dto.*;
import ticketnow.modules.ticket.mapper.TicketMapper;
import ticketnow.modules.common.mapper.image.ImageMapper;
import ticketnow.modules.ticket.dto.SeatDetailDTO;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {

    /** MyBatis Mapper (DB CRUD) */
    private final TicketMapper ticketMapper;

    // 공통 이미지 업로드 서비스
    private final FileService fileService;

    // 티켓 대표 이미지 조회용 Mapper
    private final ImageMapper imageMapper;

    // =================================================================================
    // 생성
    // =================================================================================
    @Override
    @Transactional
    public TicketResponseDTO createTicket(TicketCreateRequestDTO req) {
        final long t0 = System.nanoTime(); // 경과시간 측정(성능 확인용)
        log.debug("[Ticket][CREATE][REQ] {}", req); // 입력 파라미터 스냅샷

        TicketStatus ticketStatus = TicketStatus.SCHEDULED;

        // === 회차 목록 기반으로 startAt / endAt 자동 계산 ===
        LocalDateTime startAt = req.getStartAt();
        LocalDateTime endAt = req.getEndAt();

        List<TicketScheduleCreateDTO> schedules = req.getSchedules();

        if (schedules != null && !schedules.isEmpty()) {
            // showAt 기준으로 최소/최대 계산
            LocalDateTime minShowAt = schedules.stream()
                    .filter(s -> s.getShowAt() != null)
                    .map(TicketScheduleCreateDTO::getShowAt)
                    .min(LocalDateTime::compareTo)
                    .orElse(null);

            LocalDateTime maxShowAt = schedules.stream()
                    .filter(s -> s.getShowAt() != null)
                    .map(TicketScheduleCreateDTO::getShowAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            if (minShowAt != null) {
                startAt = minShowAt; // 공연 시작일시 = 가장 이른 회차
            }
            if (maxShowAt != null) {
                // 공연 종료일시는 마지막 회차 날짜의 자정
                LocalDate lastDate = maxShowAt.toLocalDate();
                endAt = lastDate.atTime(23, 59, 59);
            }

            // DTO에도 반영해 두면 이후 로직에서 동일 값 사용 가능
            req.setStartAt(startAt);
            req.setEndAt(endAt);
        }

        // TicketVO를 거치지 않고 Map 파라미터로 INSERT 수행
        // 장점: VO 게터/세터 의존 제거, 동적 필드/부분 갱신에 유연
        Map<String, Object> p = new HashMap<>();
        p.put("title", req.getTitle());
        p.put("startAt", req.getStartAt());
        p.put("endAt", req.getEndAt());
        p.put("venueName", req.getVenueName());
        p.put("category", req.getCategory());
        p.put("totalSeats", req.getTotalSeats());
        p.put("remainingSeats", req.getTotalSeats()); // 디폴트: 남은 좌석 = 총좌석
        p.put("price", req.getPrice());
        p.put("ticketDetail", req.getTicketDetail());

        // 생성 요청에 판매상태가 함께 온 경우 우선 사용, 아니면 날짜 기준 기본값 사용
        if (req.getTicketStatus() != null && !req.getTicketStatus().isBlank()) {
            p.put("ticketStatus", req.getTicketStatus());
        } else {
            p.put("ticketStatus", ticketStatus.name());
        }

        log.debug("[Ticket][CREATE][BEFORE] params={}", p); // INSERT 전 파라미터 확인
        int rows = ticketMapper.insertTicketFromMap(p); // ★ keyProperty로 ticketId 채워짐
        log.info("[Ticket][CREATE] rows={}, newId={}", rows, p.get("ticketId"));

        // MyBatis useGeneratedKeys로 주입된 PK를 안전하게 꺼냄
        Long newId = (p.get("ticketId") instanceof Number)
                ? ((Number) p.get("ticketId")).longValue()
                : null;

        // 🔹 회차(스케줄) INSERT: ticket_schedule 테이블에 저장
        List<ticketnow.modules.ticket.domain.TicketScheduleVO> scheduleVOs = new ArrayList<>();

        if (newId != null && schedules != null && !schedules.isEmpty()) {
            int autoRound = 1;

            for (TicketScheduleCreateDTO s : schedules) {
                if (s == null || s.getShowAt() == null) {
                    continue;
                }

                Integer roundNo = s.getRoundNo();
                if (roundNo == null || roundNo <= 0) {
                    roundNo = autoRound;
                }

                scheduleVOs.add(
                        ticketnow.modules.ticket.domain.TicketScheduleVO.builder()
                                .ticketId(newId)
                                .roundNo(roundNo)
                                .showAt(s.getShowAt())
                                .build()
                );
                autoRound++;
            }

            if (!scheduleVOs.isEmpty()) {
                int scheduleRows = ticketMapper.insertTicketSchedules(newId, scheduleVOs);
                log.info("[Ticket][CREATE][SCHEDULE] rows={} ticketId={}", scheduleRows, newId);
            } else {
                log.debug("[Ticket][CREATE][SCHEDULE] 유효한 회차가 없어 INSERT 생략 ticketId={}", newId);
            }
        } else {
            log.debug("[Ticket][CREATE][SCHEDULE] 회차 정보 없음 또는 ticketId null");
        }

     // 티켓 생성 시 좌석 자동 생성 (회차별 동일 좌석)
        if (newId != null && req.getTotalSeats() > 0) {
            generateSeatsForTicket(newId, req.getTotalSeats(), scheduleVOs);
        }



        //  티켓 생성 시 이미지가 같이 넘어온 경우, 공통 FileService로 업로드
        if (newId != null && req.getImages() != null && !req.getImages().isEmpty()) {
            try {
                // 1) ImageListDTO 구성 (어느 티켓의 이미지인지 지정)
                ImageListDTO imageReq = ImageListDTO.builder()
                        .ticketId(newId) // ticket FK
                        .build();

                // newImages 리스트 생성
                List<NewImageDTO> newImages = new ArrayList<>();

                int sort = 1;
                for (MultipartFile file : req.getImages()) {
                    if (file == null || file.isEmpty()) {
                        continue; // 빈 파일은 스킵
                    }

                    newImages.add(
                            NewImageDTO.builder()
                                    .file(file)
                                    .isPrimary(sort == 1)      // 첫 번째 이미지를 대표로 설정
                                    .imageSort(sort)           // 정렬 순서 1,2,3...
                                    .imageType("TICKET_IMAGE") // 티켓 이미지 타입 명시
                                    .build()
                    );
                    sort++;
                }

                imageReq.setNewImages(newImages);

                if (!newImages.isEmpty()) {
                    List<ImageVO> images = fileService.upsertImages(imageReq);
                    log.debug("[Ticket][CREATE][IMAGE] uploaded {} images for ticketId={}",
                            images != null ? images.size() : 0, newId);
                } else {
                    log.debug("[Ticket][CREATE][IMAGE] no valid image files to upload for ticketId={}", newId);
                }

            } catch (IOException e) {
                // 파일 처리 예외는 IllegalStateException으로 래핑해서 전파
                log.error("[Ticket][CREATE][IMAGE] 이미지 업로드 중 오류 발생 ticketId={}", newId, e);
                throw new IllegalStateException("티켓 이미지 저장 중 오류가 발생했습니다.", e);
            }
        } else {
            log.debug("[Ticket][CREATE][IMAGE] no images in request or ticketId is null.");
        }

        // 최종 저장본을 DTO로 재조회하여 응답 (응답 일관성 보장)
        TicketResponseDTO saved = ticketMapper.selectTicketDTOById(newId);
        log.debug("[Ticket][CREATE][AFTER] {}", saved);
        log.debug("[Ticket][CREATE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);

        return saved;
    }

    /**=====================================================
     * 총 좌석 수에 따라 F1~F4 구역으로 좌석을 자동 생성
     * - schedules 가 존재하면: 각 회차(round_no)마다 totalSeats 만큼 생성
     * - schedules 가 비어 있으면: 기존처럼 1회차 기준으로 한 번만 생성
     =====================================================*/
    private void generateSeatsForTicket(
            Long ticketId,
            int totalSeats,
            List<ticketnow.modules.ticket.domain.TicketScheduleVO> schedules
    ) {
        if (ticketId == null || totalSeats <= 0) {
            return;
        }

        final int ZONE_COUNT = 4;
        final String[] ZONES = {"F1", "F2", "F3", "F4"};

        List<Map<String, Object>> seats = new ArrayList<>();

        // (1) 회차 정보가 없으면: 기존 방식 + roundNo = 1 고정
        if (schedules == null || schedules.isEmpty()) {

            int basePerZone = totalSeats / ZONE_COUNT;
            int remainder = totalSeats % ZONE_COUNT;

            for (int z = 0; z < ZONE_COUNT; z++) {
                int zoneSeats = basePerZone + (z < remainder ? 1 : 0);
                if (zoneSeats <= 0) {
                    continue;
                }

                // 앞 10%는 최소 1석은 S석으로
                int sCount = (int) Math.ceil(zoneSeats * 0.1);
                if (sCount < 1) {
                    sCount = 1;
                }

                for (int i = 1; i <= zoneSeats; i++) {
                    Map<String, Object> seat = new HashMap<>();
                    seat.put("roundNo", 1); // 회차 정보 없으면 1회차
                    seat.put("seatCode", ZONES[z] + "-" + String.format("%03d", i));
                    seat.put("seatStatus", "AVAILABLE");
                    seat.put("seatClass", i <= sCount ? "S" : "R");
                    seats.add(seat);
                }
            }

        } else {
            // (2) 회차가 여러 개 있으면: 각 회차마다 totalSeats 만큼 동일 좌석 생성
            for (ticketnow.modules.ticket.domain.TicketScheduleVO schedule : schedules) {
                Integer roundNo = schedule.getRoundNo();
                if (roundNo == null || roundNo <= 0) {
                    roundNo = 1;
                }

                int basePerZone = totalSeats / ZONE_COUNT;
                int remainder = totalSeats % ZONE_COUNT;

                for (int z = 0; z < ZONE_COUNT; z++) {
                    int zoneSeats = basePerZone + (z < remainder ? 1 : 0);
                    if (zoneSeats <= 0) {
                        continue;
                    }

                    int sCount = (int) Math.ceil(zoneSeats * 0.1);
                    if (sCount < 1) {
                        sCount = 1;
                    }

                    for (int i = 1; i <= zoneSeats; i++) {
                        Map<String, Object> seat = new HashMap<>();
                        seat.put("roundNo", roundNo); // ★ 회차별로 좌석 구분
                        seat.put("seatCode", ZONES[z] + "-" + String.format("%03d", i));
                        seat.put("seatStatus", "AVAILABLE");
                        seat.put("seatClass", i <= sCount ? "S" : "R");
                        seats.add(seat);
                    }
                }

                log.info("[Ticket][SEAT] roundNo={} 에 대해 좌석 {}개 생성 예정 (ticketId={})",
                        roundNo, totalSeats, ticketId);
            }
        }

        if (!seats.isEmpty()) {
            ticketMapper.insertSeatsForTicket(ticketId, seats);
            log.info("[Ticket][SEAT] 좌석 {}개 자동 생성 완료 - ticketId={}", seats.size(), ticketId);
        }
    }


    // =================================================================================
    // 종료일시가 지난 티켓은 자동으로 CLOSED 로 변경
    // =================================================================================
    private void applyAutoClose(TicketResponseDTO dto) {
        if (dto == null) {
            return;
        }
        if (dto.getEndAt() == null) {
            return;
        }
        // 이미 CLOSED 이면 처리 불필요
        if (dto.getTicketStatus() == TicketStatus.CLOSED) {
            return;
        }
        // 종료일시가 현재보다 과거이면 CLOSED 로 전환
        if (dto.getEndAt().isBefore(LocalDateTime.now())) {
            ticketMapper.updateTicketStatus(dto.getTicketId(), "CLOSED");
            dto.setTicketStatus(TicketStatus.CLOSED);
        }
    }

    // =================================================================================
    // 단건
    // =================================================================================
    @Override
    @Transactional(readOnly = true)
    public TicketResponseDTO getTicket(Long ticketId) {
        final long t0 = System.nanoTime();
        log.debug("[Ticket][GET] id={}", ticketId);

        // DTO로 직접 조회 (컨트롤러 응답과 동일 스키마)
        TicketResponseDTO dto = ticketMapper.selectTicketDTOById(ticketId);
        if (dto == null) {
            log.warn("[Ticket][GET] not found id={}", ticketId);
            throw new IllegalArgumentException("티켓을 찾을 수 없습니다: id=" + ticketId);
        }

        // 대표 이미지 1장(primary) 조회 → mainImageUrl 설정
        ImageVO primary = imageMapper.selectPrimaryImageByTicket(ticketId);
        if (primary != null) {
            dto.setMainImageUrl(primary.getImgUrl());
        }

        // 상품 설명용 이미지(detailImageUrl) 설정
        List<ImageVO> images = imageMapper.selectImagesByTicket(ticketId);
        if (images != null && !images.isEmpty()) {
            images.stream()
                    .filter(img -> primary == null
                            || !Objects.equals(img.getImageUuid(), primary.getImageUuid()))
                    .findFirst()
                    .ifPresent(detail -> dto.setDetailImageUrl(detail.getImgUrl()));
        }

        // === 회차 스케줄 목록 세팅 ===
        List<TicketScheduleDTO> schedules = ticketMapper.selectTicketSchedulesByTicketId(ticketId);
        dto.setSchedule(schedules);

        // 종료일시가 지난 경우 자동으로 CLOSED 처리
        applyAutoClose(dto);

        log.debug("[Ticket][GET] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);
        return dto;
    }


    // =================================================================================
    // 페이지
    // =================================================================================
    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<TicketResponseDTO> getTicketPage(PageRequestDTO pageReq) {
        final long t0 = System.nanoTime();

        int page = Math.max(1, pageReq.getPage());
        int size = Math.max(1, pageReq.getSize());
        int offset = (page - 1) * size;

        log.debug("[Ticket][PAGE] page={}, size={}, offset={}", page, size, offset);

        List<TicketResponseDTO> rows = ticketMapper.selectTicketDTOPage(offset, size);
        long total = ticketMapper.countTickets();

        if (rows != null) {
            for (TicketResponseDTO dto : rows) {
                ImageVO primary = imageMapper.selectPrimaryImageByTicket(dto.getTicketId());
                if (primary != null && primary.getImgUrl() != null) {
                    dto.setMainImageUrl(primary.getImgUrl());
                } else {
                    dto.setMainImageUrl("");
                }
                applyAutoClose(dto);
            }
        }

        PageResponseDTO<TicketResponseDTO> resp = new PageResponseDTO<>();
        resp.setList(rows);
        resp.setTotalCount(total);
        resp.setPage(page);
        resp.setSize(size);

        log.debug("[Ticket][PAGE] total={}, totalPages={}, fetched={}", total, resp.getTotalPages(), rows != null ? rows.size() : 0);
        log.debug("[Ticket][PAGE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);
        return resp;
    }

    // =================================================================================
    // 수정
    // =================================================================================
    @Override
    @Transactional
    public TicketResponseDTO updateTicket(Long ticketId, TicketUpdateRequestDTO req) {
        final long t0 = System.nanoTime();
        log.debug("[Ticket][UPDATE][REQ] id={}, req={}", ticketId, req);

        if (ticketMapper.selectTicketDTOById(ticketId) == null) {
            log.warn("[Ticket][UPDATE] not found id={}", ticketId);
            throw new IllegalStateException("티켓이 존재하지 않습니다: " + ticketId);
        }

        Map<String, Object> p = new HashMap<>();
        p.put("ticketId", ticketId);
        p.put("title", req.getTitle());
        p.put("startAt", req.getStartAt());
        p.put("endAt", req.getEndAt());
        p.put("venueName", req.getVenueName());
        p.put("totalSeats", req.getTotalSeats());
        p.put("remainingSeats", req.getRemainingSeats());
        p.put("price", req.getPrice());

        if (req.getTicketStatus() != null) {
            p.put("ticketStatus", req.getTicketStatus());
        }

        int rows = ticketMapper.updateTicketFromMap(p);
        log.info("[Ticket][UPDATE] rows={}", rows);

        if (req.getImages() != null && !req.getImages().isEmpty()) {
            try {
                ImageListDTO imageReq = ImageListDTO.builder()
                        .ticketId(ticketId)
                        .build();

                List<NewImageDTO> newImages = new ArrayList<>();
                int sort = 1;
                for (MultipartFile file : req.getImages()) {
                    if (file == null || file.isEmpty()) continue;

                    newImages.add(
                            NewImageDTO.builder()
                                    .file(file)
                                    .isPrimary(sort == 1)
                                    .imageSort(sort)
                                    .imageType("TICKET_IMAGE")
                                    .build()
                    );
                    sort++;
                }

                imageReq.setNewImages(newImages);

                if (!newImages.isEmpty()) {
                    List<ImageVO> uploaded = fileService.upsertImages(imageReq);
                    log.debug("[Ticket][UPDATE][IMAGE] updated {} images for ticketId={}",
                            uploaded != null ? uploaded.size() : 0, ticketId);
                }
            } catch (IOException e) {
                log.error("[Ticket][UPDATE][IMAGE] 이미지 업로드 중 오류 ticketId={}", ticketId, e);
                throw new IllegalStateException("티켓 이미지 수정 중 오류가 발생했습니다.", e);
            }
        } else {
            log.debug("[Ticket][UPDATE][IMAGE] no new images in request for ticketId={}", ticketId);
        }

        TicketResponseDTO updated = ticketMapper.selectTicketDTOById(ticketId);
        log.debug("[Ticket][UPDATE][AFTER] {}", updated);
        log.debug("[Ticket][UPDATE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);

        return updated;
    }

    // =================================================================================
    // 삭제
    // =================================================================================
    @Override
    @Transactional
    public void deleteTicket(Long ticketId) {
        final long t0 = System.nanoTime();
        log.debug("[Ticket][DELETE] id={}", ticketId);

        // 1) 티켓에 연결된 이미지 먼저 삭제
        fileService.deleteAllByTicketId(ticketId);

        // 2) 티켓 하드 삭제
        int rows = ticketMapper.hardDeleteTicket(ticketId);
        log.info("[Ticket][DELETE] hard delete rows={}, id={}", rows, ticketId);

        log.debug("[Ticket][DELETE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);
    }
    @Override
    @Transactional(readOnly = true)
    public List<SeatStatsDTO> getSeatStats(Long ticketId) {
        log.info("getSeatStats ticketId={}", ticketId);
        return ticketMapper.selectSeatStatsByTicket(ticketId);
    }
    
    @Override
    public List<SeatSummaryDTO> getSeatSummary(Long ticketId) {
        return ticketMapper.selectSeatSummaryByTicket(ticketId);
    }

    // 티켓 구역
    @Override
    @Transactional(readOnly = true)
    public List<SeatDetailDTO> getSeatsForZone(Long ticketId, Integer roundNo, String zone) {
        if (ticketId == null) {
            return Collections.emptyList();
        }

        // 회차 선택 안 되어 있으면 1회차로 고정
        if (roundNo == null || roundNo <= 0) {
            roundNo = 1;
        }

        // 구역 기본값 F1
        if (zone == null || zone.isBlank()) {
            zone = "F1";
        }
        zone = zone.toUpperCase();

        if (!zone.equals("F1") && !zone.equals("F2") && !zone.equals("F3") && !zone.equals("F4")) {
            throw new IllegalArgumentException("존재하지 않는 구역입니다: " + zone);
        }

        return ticketMapper.selectSeatsByTicketAndRoundAndZone(ticketId, roundNo, zone);
    }

    
}
