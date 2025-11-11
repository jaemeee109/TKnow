package ticketnow.modules.order.api;

import lombok.RequiredArgsConstructor;
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
    
    

    // 수령방법 선택 페이지 데이터 조회
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{ordersId}/receive-option")
    public ResponseEntity<ReceiveOptionPageDTO> getReceiveOptionPage(
            @PathVariable Long ordersId,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
        
        log.info("[GET] /orders/{}/receive-option | X-Request-Id={}", ordersId, requestId);
        return ResponseEntity.ok(ordersService.getReceiveOptionPage(ordersId));
    }

    // 수령방법 저장
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/{ordersId}/receive-option")
    public ResponseEntity<Void> submitReceiveOption(
            @PathVariable Long ordersId,
            @RequestBody ReceiveOptionSubmitDTO req,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
        
        log.info("[POST] /orders/{}/receive-option | X-Request-Id={} | body={}", ordersId, requestId, req);
        return ResponseEntity.ok().build();
    }

    // 결제하기 페이지 데이터 조회
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{ordersId}/pay-page")
    public ResponseEntity<PayPageDTO> getPayPage(
            @PathVariable Long ordersId,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
        
        log.info("[GET] /orders/{}/pay-page | X-Request-Id={}", ordersId, requestId);
        return ResponseEntity.ok(ordersService.getPayPage(ordersId));
    }

    // 결제 준비
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/pay/ready")
    public ResponseEntity<String> readyToPay(
            @RequestBody PayReadySubmitDTO req,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
        
        log.info("[POST] /orders/pay/ready | X-Request-Id={} | ordersId={} | method={} | instrument={}",
                requestId, req.getOrdersId(), req.getPayMethod(), req.getPayInstrument());
        
        String token = ordersService.readyToPay(req);
        return ResponseEntity.ok(token);
    }

    // 구매내역 목록
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<OrdersListItemDTO>> getOrdersList(
            PageRequestDTO req,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {

        String memberId = currentMemberId();
        
        
        // ✨ 이 로그들 추가!
        log.info("[GET] /orders | X-Request-Id={} | memberId={} | page={} size={}", 
                 requestId, memberId, req.getPage(), req.getSize());
        
        if (memberId == null) {
            log.error("❌ memberId is null!");
            return ResponseEntity.status(401).build();
        }

        PageResponseDTO<OrdersListItemDTO> result = ordersService.getOrdersList(memberId, req);
        log.info("✅ Orders fetched: {} items", result.getList().size());
        
        return ResponseEntity.ok(result);
    }
  

    // 구매내역 상세
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{ordersId}")
    public ResponseEntity<OrdersDetailDTO> getOrdersDetail(
            @PathVariable Long ordersId,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
        
        log.info("[GET] /orders/{} | X-Request-Id={}", ordersId, requestId);
        return ResponseEntity.ok(ordersService.getOrdersDetail(ordersId));
    }
}