package ticketnow.modules.order.service;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ticketnow.modules.common.dto.image.ImageDTO;
import ticketnow.modules.common.domain.ImageVO;
import ticketnow.modules.common.mapper.image.ImageMapper;
import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.order.dto.pay.PayPageDTO;
import ticketnow.modules.order.dto.pay.PayReadySubmitDTO;
import ticketnow.modules.order.dto.receive.ReceiveOptionPageDTO;
import ticketnow.modules.order.dto.OrdersListItemDTO;
import ticketnow.modules.order.api.error.ResourceNotFoundException;
import ticketnow.modules.order.dto.OrdersDetailDTO;
import ticketnow.modules.order.mapper.OrdersMapper;
import ticketnow.modules.ticket.domain.SeatVO;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.order.domain.OrderTicketVO;
import ticketnow.modules.order.domain.OrdersVO;
import ticketnow.modules.order.dto.OrdersCreateRequestDTO;
import ticketnow.modules.order.dto.admin.AdminSalesSummaryDTO;
import ticketnow.modules.order.dto.admin.AdminOrdersListItemDTO;
 // 주문(Order) 모듈 서비스 구현체 - 비즈니스 로직/조립, 트랜잭션 관리 책임
// 화면에 맞게 DTO를 완성해서 Controller로 반환
@Slf4j 
@Service
@RequiredArgsConstructor
public class OrdersServiceImpl implements OrdersService {

	private final OrdersMapper ordersMapper; // 주문 관련 조회
	private final ImageMapper imageMapper; // 티켓 썸네일" 조회용 Mapper (공용)


	// 주문 생성
	// 주문 생성
	@Override
	@Transactional
	public Long createOrder(String memberId, OrdersCreateRequestDTO req) {

	    log.debug("[Service] createOrder memberId={} req={}", memberId, req);

	    // 기본 유효성 검증
	    if (memberId == null || memberId.isBlank()) {
	        throw new IllegalArgumentException("주문 생성에는 회원 ID가 필요합니다.");
	    }
	    if (req == null) {
	        throw new IllegalArgumentException("주문 요청 데이터가 비어 있습니다.");
	    }
	    if (req.getOrdersTicketQuantity() == null || req.getOrdersTicketQuantity() <= 0) {
	        throw new IllegalArgumentException("주문 수량은 1개 이상이어야 합니다.");
	    }
	    if (req.getOrdersTotalAmount() == null || req.getOrdersTotalAmount() < 0) {
	        throw new IllegalArgumentException("주문 총 금액이 올바르지 않습니다.");
	    }
	    if (req.getSeatIdList() == null || req.getSeatIdList().isEmpty()) {
	        throw new IllegalArgumentException("최소 1개 이상의 좌석이 필요합니다.");
	    }

	    //  OrdersVO 생성
	    OrdersVO orders = OrdersVO.builder()
	            .member(MemberVO.builder().memberId(memberId).build())
	            .ordersTotalAmount(req.getOrdersTotalAmount())
	            .ordersTicketQuantity(req.getOrdersTicketQuantity())
	            .build();

	    //  orders 생성
	    int inserted = ordersMapper.insertOrders(orders);
	    if (inserted <= 0 || orders.getOrdersId() == null) {
	        throw new IllegalStateException("주문 생성에 실패했습니다.");
	    }

	    Long ordersId = orders.getOrdersId();

	    //  1장당 가격 계산
	    //    - 현재 스키마/코드 상 별도의 정책 정의가 없어,
	    //      총 금액 / 수량 으로 1장 가격을 계산합니다.
	    //      (수수료를 분리할지 여부 등은 팀에서 합의하면,
	    //       이 부분의 계산식만 조정하면 됩니다.)
	    int quantity = req.getOrdersTicketQuantity();
	    int perPrice = (quantity > 0) ? (req.getOrdersTotalAmount() / quantity) : 0;

	    // 선택된 좌석 각각에 대해 order_ticket 생성
	    for (Long seatId : req.getSeatIdList()) {
	        if (seatId == null) continue;
	        ordersMapper.insertOrderTicket(ordersId, seatId, perPrice, 1);
	    }

	    log.info("[Service] createOrder success ordersId={}", ordersId);
	    return ordersId;
	}

	 
	//  티켓 수령방법 선택 페이지
	@Override
	@Transactional(readOnly = true)
	public ReceiveOptionPageDTO getReceiveOptionPage(Long ordersId) {
		
		 log.debug("[Service] getReceiveOptionPage ordersId={}", ordersId);		// 디버그 로깅 
		// 주문ID 기준으로, 기본 정보들을 한 번에 가져옴
		ReceiveOptionPageDTO dto = ordersMapper.selectReceiveOptionPage(ordersId); // 매퍼 호출
		
		 if (dto == null) {
	            log.info("[Service] receive-option not found | ordersId={}", ordersId); // 정보 로그
	            throw new ResourceNotFoundException("주문을 찾을 수 없습니다: " + ordersId); // 404 성격의 커스텀 예외
	        }
		 
		// 썸네일
		// 주문ID -> ticketId 보조조회 → 대표 이미지 1건 조회 → DTO에 set 
		injectTicketThumbnailInto(dto, ordersId);


		return dto;
	}


	// 결제하기 페이지
	@Override
	@Transactional(readOnly = true) // 읽기 전용
	public PayPageDTO getPayPage(Long ordersId) {
		  log.debug("[Service] getPayPage ordersId={}", ordersId); // 디버그 로깅
		// 결제 페이지에 필요한 요약(공연/좌석/금액 등)을 1건으로 조회
		PayPageDTO dto = ordersMapper.selectPayPage(ordersId); // 매퍼 호출
		 if (dto == null) { // 결과 없으면 예외
	            log.info("[Service] pay-page not found | ordersId={}", ordersId); // 정보 로그
	            throw new ResourceNotFoundException("주문을 찾을 수 없습니다: " + ordersId); // 예외처리
	        }
		// 썸네일 주문ID -> ticketId 보조조회 → 대표 이미지 주입
		injectTicketThumbnailInto(dto, ordersId); // 공통 썸네일 주입

		return dto;
	}


	// 구매내역 목록(회원별) - 페이징
	@Override
	@Transactional(readOnly = true)
	public PageResponseDTO<OrdersListItemDTO> getOrdersList(String memberId, PageRequestDTO req) {
	    // PageRequestDTO는 (page, size)로부터 offset/limit을 계산해주는 공용 DTO
	    log.debug("[Service] getOrdersList memberId={} page={} size={}", memberId, req.getPage(), req.getSize());

	    // 페이징용 offset / limit 계산
	    int offset = req.getOffset(); // 페이지 시작 위치
	    int limit  = req.getLimit();  // 한 페이지당 개수

	    // 1) 목록 데이터 조회
	    List<OrdersListItemDTO> rows =
	            ordersMapper.selectOrdersListByMember(memberId, offset, limit);

	    // 2) 각 항목에 티켓 썸네일 주입
	    if (rows != null) {
	        for (OrdersListItemDTO row : rows) {
	            if (row != null && row.getOrdersId() != null) {
	                // 주문 ID 기준으로 ticket_id → 대표 이미지 조회 후 DTO에 세팅
	                injectTicketThumbnailInto(row, row.getOrdersId());
	            }
	        }
	    }

	    // 3) 총 건수 조회
	    long totalCount = ordersMapper.countOrdersByMember(memberId);

	    // 4) PageResponseDTO 구성
	    PageResponseDTO<OrdersListItemDTO> res = new PageResponseDTO<>();
	    res.setList(rows);
	    res.setTotalCount(totalCount);
	    res.setPage(req.getPage());
	    res.setSize(req.getSize());

	    return res;
	}


	// 구매내역 상세
	@Override
	@Transactional(readOnly = true) // 읽기 전용
	public OrdersDetailDTO getOrdersDetail(Long ordersId) {
		 log.debug("[Service] getOrdersDetail ordersId={}", ordersId); // 디버그 로깅
		// 주문ID로 상세 정보를 조회
		OrdersDetailDTO dto = ordersMapper.selectOrdersDetail(ordersId); // 매퍼 호출
		 if (dto == null) { // 결과가 없으면
	            log.info("[Service] detail not found | ordersId={}", ordersId); // 정보로그
	            throw new ResourceNotFoundException("주문을 찾을 수 없습니다: " + ordersId); // 예외처리
	        }
		// 썸네일 주입 주문ID -> ticketId 보조조회 → 대표 이미지 주입
		injectTicketThumbnailInto(dto, ordersId);

		// 취소 가능/마감/수수료 안내 — 정책에 따라 서버에서 계산해 DTO에 채움
		applyCancelPolicy(dto);

		// 결제 완료 & 모바일티켓인 경우 QR 이미지/코드 세팅은 pay 모듈 연동 후 처리
		return dto;
	}
	
	// 관리자용 전체 매출 요약 
    @Override
    @Transactional(readOnly = true)
    public AdminSalesSummaryDTO getAdminSalesSummary() {

        AdminSalesSummaryDTO raw = ordersMapper.selectAdminSalesSummary();
        if (raw == null) {
            raw = new AdminSalesSummaryDTO();
        }

        long sales   = (raw.getTotalSalesAmount()     != null) ? raw.getTotalSalesAmount()     : 0L;
        long qty     = (raw.getTotalTicketQuantity()  != null) ? raw.getTotalTicketQuantity()  : 0L;
        long refund  = (raw.getTotalRefundAmount()    != null) ? raw.getTotalRefundAmount()    : 0L;

        // 원가 = 판매액의 80%, 이익 = 판매액의 20%
        long cost    = (long) Math.floor(sales * 0.8);
        long profit  = sales - cost;

        raw.setTotalSalesAmount(sales);
        raw.setTotalTicketQuantity(qty);
        raw.setTotalRefundAmount(refund);
        raw.setTotalCostAmount(cost);
        raw.setTotalProfitAmount(profit);

        return raw;
    }



	// 결제 준비 (결제하기 버튼 클릭)
	@Override
	@Transactional // 쓰기 트랜잭션(토큰 생성/상태 변경 등이 들어올 수 있음)
	public String readyToPay(PayReadySubmitDTO dto) {
		// 결제 모듈로 이동하기 위한 "준비 토큰/키"를 만들어 반환
		 log.info("[Service] readyToPay ordersId={} method={} instrument={}",
				  dto.getOrdersId(), dto.getPayMethod(), dto.getPayInstrument()); // 주요 정보 로깅
		String token = "payReady-" + dto.getOrdersId() + "-" + System.currentTimeMillis(); // 간단한 토큰 예시
		return token; // 프론트로 토큰 반환 -> Pay모듈로 흐름 진행
	}


	// 대표 썸네일 주입 (주문ID → ticketId → 이미지 조회 → DTO set)
	// - 스키마/DTO를 변경하지 않고도 이미지 표시를 가능하게 하려는 목적
	// - PayPageDTO / OrdersDetailDTO / ReceiveOptionPageDTO 전부 지원

	private void injectTicketThumbnailInto(Object targetDto, Long ordersId) {
		// 주문ID로 ticket_id(대표 1건)를 가져옴 (Mapper XML에 selectTicketIdByOrdersId 필요)
		Long ticketId = ordersMapper.selectTicketIdByOrdersId(ordersId); // 보조 쿼리
		if (ticketId == null)
			return; // 주문에 좌석/티켓이 없으면 주입 불필요

		// 해당 ticket_id로 대표 이미지 1건을 조회
		ImageVO img = imageMapper.selectPrimaryImageByTicket(ticketId); // 대표 이미지 조회
		if (img == null)
			return; // 이미지가 없는 티켓일 수 있음

		// 화면 표시에 맞게 ImageDTO로 변환
		ImageDTO imageDTO = ImageDTO.builder()
				.imageUrl(img.getImgUrl()) // 이미지 URL
				.isPrimary(img.getIsPrimary()) // 대표 여부
				.imageSort(img.getImageSort()) // 정렬 순서
				.imageType(img.getImageType() != null ? img.getImageType().name() : null)
				.build(); // dto생성
		 // DTO 타입별로 알맞게 set
	    if (targetDto instanceof ticketnow.modules.order.dto.pay.PayPageDTO) {
	        ((ticketnow.modules.order.dto.pay.PayPageDTO) targetDto).setTicketThumbnail(imageDTO);
	    } else if (targetDto instanceof ticketnow.modules.order.dto.OrdersDetailDTO) {
	        ((ticketnow.modules.order.dto.OrdersDetailDTO) targetDto).setTicketThumbnail(imageDTO);
	    } else if (targetDto instanceof ticketnow.modules.order.dto.receive.ReceiveOptionPageDTO) {
	        ((ticketnow.modules.order.dto.receive.ReceiveOptionPageDTO) targetDto).setTicketThumbnail(imageDTO);
	    } else if (targetDto instanceof ticketnow.modules.order.dto.OrdersListItemDTO) {
	        ((ticketnow.modules.order.dto.OrdersListItemDTO) targetDto).setTicketThumbnail(imageDTO);
	    }
	}


	//  취소 정책 적용
	// - 예시 정책: "관람일 2일 전 23:59:59까지 취소 가능"
	// - 수수료 문구도 간단히 계산하여 DTO에 넣음
	private static final DateTimeFormatter D_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final DateTimeFormatter D_TIME = DateTimeFormatter.ofPattern("HH:mm");

	private void applyCancelPolicy(OrdersDetailDTO dto) {
		// DTO 안의 문자열(showDate: yyyy-MM-dd, showStartTime: HH:mm)을 LocalDateTime으로 변환
		LocalDateTime showAt = toShowDateTimeByStrings(dto.getTicketDate(), dto.getShowStartTime());
		if (showAt == null)
			return; // 정보가 없으면 계산 불가

		// 취소 마감 시각 = 관람일 2일 전 23:59:59 (예시)
		LocalDateTime deadline = showAt.minusDays(2).withHour(23).withMinute(59).withSecond(59);

		// 현재 시각 기준으로 취소 가능 여부 계산
		boolean cancelable = LocalDateTime.now().isBefore(deadline);

		// 수수료 문구 계산( 예시)
		long days = Duration.between(LocalDateTime.now(), showAt).toDays();
		String feeText;
		if (days >= 3) {
			feeText = "취소 수수료 0%";
		} else if (days >= 1) {
			feeText = "취소 수수료 30%";
		} else {
			feeText = "취소 수수료 50%";
		}

		// DTO에 반영
		dto.setCancelable(cancelable); // 취소 가능 여부
		dto.setCancelDeadline(deadline); // 취소 마감일시
		dto.setCancelFeePeriodText(feeText); // 수수료 안내 문구
	}

	// DTO 필드명이 ticketDate 인 경우를 지원 (널/포맷 방어 포함)
	private LocalDateTime toShowDateTimeByStrings(String dateStr, String timeStr) {
		try {
			if (dateStr == null || timeStr == null)
				return null;
			LocalDate date = LocalDate.parse(dateStr, D_DATE); // yyyy-MM-dd
			LocalTime time = LocalTime.parse(timeStr, D_TIME); // HH:mm
			return LocalDateTime.of(date, time);
		} catch (Exception e) {
			// 포맷이 다르면 계산 생략
			return null;
		}
	}
	
	  //  관리자용 전체 주문 목록 (페이징) ======
    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<AdminOrdersListItemDTO> getAdminOrdersList(PageRequestDTO req) {
        log.debug("[Service] getAdminOrdersList page={} size={}", req.getPage(), req.getSize());

        int offset = req.getOffset();
        int limit  = req.getLimit();

        PageResponseDTO<AdminOrdersListItemDTO> res = new PageResponseDTO<>();
        res.setList(ordersMapper.selectAdminOrdersList(offset, limit));
        res.setTotalCount(ordersMapper.countAdminOrders());
        res.setPage(req.getPage());
        res.setSize(req.getSize());

        return res;
    }

    // 주문 상태 변경 ======
    @Override
    @Transactional
    public void updateOrdersStatus(Long ordersId, String ordersStatus) {
        log.info("[Service] updateOrdersStatus ordersId={} status={}", ordersId, ordersStatus);
        int updated = ordersMapper.updateOrdersStatus(ordersId, ordersStatus);
        if (updated == 0) {
            throw new ResourceNotFoundException("주문을 찾을 수 없습니다: " + ordersId);
        }
    }

}
