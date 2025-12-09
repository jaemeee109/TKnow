package ticketnow.modules.order.api;


import lombok.*;
import ticketnow.modules.order.dto.admin.AdminOrdersListItemDTO;
import ticketnow.modules.order.dto.admin.AdminOrdersStatusUpdateRequestDTO;
import ticketnow.modules.order.dto.OrdersCreateRequestDTO;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.order.dto.pay.PayPageDTO;
import ticketnow.modules.order.dto.pay.PayReadySubmitDTO;
import ticketnow.modules.order.dto.receive.ReceiveOptionPageDTO;
import ticketnow.modules.order.dto.receive.ReceiveOptionSubmitDTO;
import ticketnow.modules.order.dto.OrdersListItemDTO;
import ticketnow.modules.order.dto.OrdersDetailDTO;
import ticketnow.modules.order.service.OrdersService;
import ticketnow.modules.order.dto.admin.AdminSalesSummaryDTO;
// 주문(Order) API
@Slf4j
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrdersService ordersService;
    
    private String currentMemberId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? String.valueOf(auth.getPrincipal()) : null;
    }
    
    
    //  주문 생성
    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Long> createOrder(@RequestBody OrdersCreateRequestDTO req) {

        String memberId = currentMemberId();
        log.info("[API] createOrder memberId={} req={}", memberId, req);

        Long ordersId = ordersService.createOrder(memberId, req);
        return ResponseEntity.ok(ordersId);
    }

    

    // 수령방법 선택 페이지 데이터 조회
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{ordersId}/receive-option")
    public ResponseEntity<ReceiveOptionPageDTO> getReceiveOptionPage(@PathVariable Long ordersId,
    		 @RequestHeader(value="X-Request-Id", required=false) String requestId) { // 트래킹용 요청 헤더
    	 log.info("[GET] /orders/{}/receive-option | X-Request-Id={}", ordersId, requestId); // 접근 로깅
        return ResponseEntity.ok(ordersService.getReceiveOptionPage(ordersId)); // 서비스 호출
    }

    // 수령방법 저장
    // 현재 스키마에 수령방법 컬럼이 없으므로, DB 저장 없이 OK만 반환
    // 결제 직전 페이지에서 선택한 수령방법은 Pay 준비 요청과 함께 전달
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/{ordersId}/receive-option")
    public ResponseEntity<Void> submitReceiveOption(@PathVariable Long ordersId,
										    	    @RequestBody ReceiveOptionSubmitDTO req,
										            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	
    	log.info("[POST] /orders/{}/receive-option | X-Request-Id={} | body={}", ordersId, requestId, req);								       
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    // 결제하기 페이지 데이터 조회
    @GetMapping("/{ordersId}/pay-page")
    public ResponseEntity<PayPageDTO> getPayPage(@PathVariable Long ordersId,
    					@RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	 log.info("[GET] /orders/{}/pay-page | X-Request-Id={}", ordersId, requestId);
        return ResponseEntity.ok(ordersService.getPayPage(ordersId));
    }

    // 결제 준비(결제하기 버튼 클릭) → Pay 모듈로 넘길 준비
    // 응답으로 토큰/리다이렉트 정보 등을 내려주면 프론트가 Pay 모듈로 이동
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/pay/ready")
    public ResponseEntity<String> readyToPay(@RequestBody PayReadySubmitDTO req,
    		  @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	 
    	log.info("[POST] /orders/pay/ready | X-Request-Id={} | ordersId={} | method={} | instrument={}",
                  requestId, req.getOrdersId(), req.getPayMethod(), req.getPayInstrument());
    	
        String token = ordersService.readyToPay(req); // 결제 준비 토큰 발급 요청
        return ResponseEntity.ok(token);
    }

    // 구매내역 목록 (마이페이지 - 결제내역 리스트)
    // memberId는 로그인 세션/JWT에서 읽어오는 것이 보통이지만,
    // 여기서는 파라미터로 받도록 구성(팀 규칙에 맞게 변경 가능)
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<OrdersListItemDTO>> getOrdersList(
            PageRequestDTO req, // page, size 자동 바인딩
            @RequestHeader(value="X-Request-Id", required=false) String requestId) { 
    	
    	 String memberId = currentMemberId();
    	 log.info("[GET] /orders | memberId={} | page={} size={} | X-Request-Id={}",
                 memberId, req.getPage(), req.getSize(), requestId); // 목록 조회 로깅
    	 
        return ResponseEntity.ok(ordersService.getOrdersList(memberId, req)); // 서비스 페이징 결과 반환
    }

    // 구매내역 상세
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{ordersId}")
    public ResponseEntity<OrdersDetailDTO> getOrdersDetail(@PathVariable Long ordersId,
    		 @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	 log.info("[GET] /orders/{} | X-Request-Id={}", ordersId, requestId); // 접근 로깅
        return ResponseEntity.ok(ordersService.getOrdersDetail(ordersId)); // 서비스 상세 DTO 반환
    }
    
    // 관리자: 판매 요약 통계 
    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminSalesSummaryDTO> getAdminSummary() {
        AdminSalesSummaryDTO dto = ordersService.getAdminSalesSummary();
        return ResponseEntity.ok(dto);
    }
    
    // 관리자용 주문 목록 (페이징) 
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponseDTO<AdminOrdersListItemDTO>> getAdminOrdersList(
            PageRequestDTO req,
            @RequestHeader(value="X-Request-Id", required = false) String requestId) {

        log.info("[GET] /orders/admin | page={} size={} | X-Request-Id={}",
                req.getPage(), req.getSize(), requestId);

        return ResponseEntity.ok(ordersService.getAdminOrdersList(req));
    }

    //  관리자용 주문 상태 변경
    @PatchMapping("/admin/{ordersId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateOrdersStatus(
            @PathVariable Long ordersId,
            @RequestBody AdminOrdersStatusUpdateRequestDTO req,
            @RequestHeader(value="X-Request-Id", required = false) String requestId) {

        log.info("[PATCH] /orders/admin/{}/status | status={} | X-Request-Id={}",
                ordersId, req.getOrdersStatus(), requestId);

        ordersService.updateOrdersStatus(ordersId, req.getOrdersStatus());
        return ResponseEntity.noContent().build();
    }
}


