package ticketnow.modules.ticket.service;

import java.time.LocalDateTime;
import java.util.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.ticket.constant.TicketStatus;
import ticketnow.modules.ticket.dto.*;
import ticketnow.modules.ticket.mapper.TicketMapper;

/**
 * Ticket 도메인의 비즈니스 서비스 구현체 - 트랜잭션 경계에서 Mapper 호출 - 생성/조회/페이지/수정/소프트삭제 책임 - 주석은
 * 실무 디버깅/운영 관점으로 상세 기술
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {

	/** MyBatis Mapper (DB CRUD) */
	private final TicketMapper ticketMapper;

	// =================================================================================
	// 생성
	// =================================================================================
	@Override
	@Transactional // 생성은 쓰기 트랜잭션
	public TicketResponseDTO createTicket(TicketCreateRequestDTO req) {
		final long t0 = System.nanoTime(); // 경과시간 측정(성능 확인용)
		log.debug("[Ticket][CREATE][REQ] {}", req); // 입력 파라미터 스냅샷

		// 현재 시각 기준으로 초기 상태 결정:
		// 시작 전: SCHEDULED
		// 시작 시각 경과: ON_SALE (좌석/판매조건에 따라 추가 정책 가능)
		// 시작시간 기준으로 기본 상태 보정
		final TicketStatus status = LocalDateTime.now().isBefore(req.getStartAt()) ? TicketStatus.SCHEDULED
				: TicketStatus.ON_SALE;

		// TicketVO를 거치지 않고 Map 파라미터로 INSERT 수행
		// 장점: VO 게터/세터 의존 제거, 동적 필드/부분 갱신에 유연
		Map<String, Object> p = new HashMap<>();
		p.put("title", req.getTitle());
		p.put("startAt", req.getStartAt());
		p.put("endAt", req.getEndAt());
		p.put("venueName", req.getVenueName());
		p.put("venueAddress", req.getVenueAddress());
		p.put("totalSeats", req.getTotalSeats());
		p.put("remainingSeats", req.getTotalSeats()); // 디폴트: 남은 좌석 = 총좌석
		p.put("price", req.getPrice());
		p.put("ticketStatus", status.name());

		log.debug("[Ticket][CREATE][BEFORE] params={}", p); // INSERT 전 파라미터 확인
		int rows = ticketMapper.insertTicketFromMap(p); // ★ keyProperty로 ticketId 채워짐
		log.info("[Ticket][CREATE] rows={}, newId={}", rows, p.get("ticketId"));

		// MyBatis useGeneratedKeys로 주입된 PK를 안전하게 꺼냄
		Long newId = (p.get("ticketId") instanceof Number) ? ((Number) p.get("ticketId")).longValue() : null;

		// 최종 저장본을 DTO로 재조회하여 응답 (응답 일관성 보장)
		TicketResponseDTO saved = ticketMapper.selectTicketDTOById(newId);
		log.debug("[Ticket][CREATE][AFTER] {}", saved);
		log.debug("[Ticket][CREATE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);

		// [DEBUG TIP] 좌석 합계/잔여 수 논리 검증이 필요하면 여기서 assert/log 추가 가능
		return saved;
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
			// 존재하지 않으면 도메인 예외(여기서는 IllegalStateException 사용)
			log.warn("[Ticket][GET] not found id={}", ticketId);
			throw new IllegalStateException("티켓이 존재하지 않습니다: " + ticketId);
		}
		
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

		// 페이지 파라미터 보정(1-base page, 최소 size=1)
		int page = Math.max(1, pageReq.getPage());
		int size = Math.max(1, pageReq.getSize());
		int offset = (page - 1) * size;

		log.debug("[Ticket][PAGE] page={}, size={}, offset={}", page, size, offset);

		// 목록은 DTO로 직접 조회 (프리젠테이션 스키마에 딱 맞춤)
		List<TicketResponseDTO> rows = ticketMapper.selectTicketDTOPage(offset, size);
		long total = ticketMapper.countTickets();

		// 표준 페이징 응답 조립
		PageResponseDTO<TicketResponseDTO> resp = new PageResponseDTO<>();
		resp.setList(rows);
		resp.setTotalCount(total);
		resp.setPage(page);
		resp.setSize(size);

		log.debug("[Ticket][PAGE] total={}, totalPages={}, fetched={}", total, resp.getTotalPages(), rows.size());
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

		// 선 존재확인 (낙관적 업데이트 / 예외 메시지 일관성 유지)
		if (ticketMapper.selectTicketDTOById(ticketId) == null) {
			log.warn("[Ticket][UPDATE] not found id={}", ticketId);
			throw new IllegalStateException("티켓이 존재하지 않습니다: " + ticketId);
		}

		// 부분 갱신을 위해 Map으로 전달(null 필드는 XML에서 무시)
		Map<String, Object> p = new HashMap<>();
		p.put("ticketId", ticketId);
		p.put("title", req.getTitle());
		p.put("startAt", req.getStartAt());
		p.put("endAt", req.getEndAt());
		p.put("venueName", req.getVenueName());
		p.put("venueAddress", req.getVenueAddress());
		p.put("totalSeats", req.getTotalSeats());
		p.put("remainingSeats", req.getRemainingSeats());
		p.put("price", req.getPrice());

		if (req.getTicketStatus() != null) {
			// ENUM 유효성은 컨트롤러/서비스단에서 미리 검증하거나 DB 제약으로 보완 가능
			p.put("ticketStatus", req.getTicketStatus()); // 문자열 그대로(ENUM 체크는 XML/DB 제약 혹은 서비스단 validation 로커버)
		}

		int rows = ticketMapper.updateTicketFromMap(p);
		log.info("[Ticket][UPDATE] rows={}", rows);

		// 갱신본 재조회 후 반환
		TicketResponseDTO updated = ticketMapper.selectTicketDTOById(ticketId);
		log.debug("[Ticket][UPDATE][AFTER] {}", updated);
		log.debug("[Ticket][UPDATE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);
		
		// [DEBUG TIP] 좌석 값(total vs remaining) 일관성 체크 로깅 포인트
		return updated;
	}

	// =================================================================================
	// 삭제(소프트)
	// =================================================================================
	@Override
	@Transactional
	public void deleteTicket(Long ticketId) {
		final long t0 = System.nanoTime();
		log.debug("[Ticket][DELETE] id={}", ticketId);
		int rows = ticketMapper.softDeleteTicket(ticketId);
		log.info("[Ticket][DELETE] soft delete rows={}, id={}", rows, ticketId);
		log.debug("[Ticket][DELETE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);
	}
}
