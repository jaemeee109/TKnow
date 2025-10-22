package ticketnow.modules.pay.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ticketnow.modules.pay.dto.*;
import ticketnow.modules.pay.dto.bank.VBankDepositRequestDTO;
import ticketnow.modules.pay.dto.bank.VBankIssueRequestDTO;
import ticketnow.modules.pay.dto.card.CardApproveRequestDTO;
import ticketnow.modules.pay.service.PayService;
// Pay API (가상 결제)
// 실제 PG 호출 없이 서버 내부에서 승인/입금을 시뮬레이션
@Slf4j
@RestController
@RequestMapping("/pay")
@RequiredArgsConstructor
public class PayController {

    private final PayService payService;

    // [카드] 결제 승인(가상)
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/card/approve")
    public ResponseEntity<PayResultDTO> approveCard(@RequestBody CardApproveRequestDTO req,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	
    	 // === 프론트 추적용 디버깅 로그 ===
        log.info("[PAY][REQ] POST /pay/card/approve | X-Request-Id={} | ordersId={} memberId={} amount={} company={}",
                requestId, req.getOrdersId(), req.getMemberId(), req.getAmount(), req.getCardCompany());

        PayResultDTO res = payService.approveCard(req);
        return ResponseEntity.ok(res);
    }  
    
    
    

    // [무통장] 가상계좌 발급
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/vbank/issue")
    public ResponseEntity<PayResultDTO> issueVBank(@RequestBody VBankIssueRequestDTO req,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	
    	 // === 프론트 추적용 디버깅 로그 ===
    	   log.info("[PAY][REQ] POST /pay/vbank/issue | X-Request-Id={} | ordersId={} memberId={} amount={} bank={}",
                   requestId, req.getOrdersId(), req.getMemberId(), req.getAmount(), req.getBankName());
    	   PayResultDTO res = payService.issueVBank(req);
           return ResponseEntity.ok(res);
       }
    
    

    // [무통장] 입금(확인) 시뮬레이션
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/vbank/deposit")
    public ResponseEntity<PayResultDTO> depositVBank(@RequestBody VBankDepositRequestDTO req,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	
    	 // === 프론트 추적용 디버깅 로그 ===
    	  log.info("[PAY][REQ] POST /pay/vbank/deposit | X-Request-Id={} | ordersId={} memberId={} amount={}",
                  requestId, req.getOrdersId(), req.getMemberId(), req.getAmount());
    	  PayResultDTO res = payService.depositVBank(req);
          return ResponseEntity.ok(res);
      }

    
    
    
    // 결제 결과 조회 (화면 갱신 등)
    @GetMapping("/{ordersId}/result")
    public ResponseEntity<PayResultDTO> getResult(@PathVariable Long ordersId,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	
    	 // === 프론트 추적용 디버깅 로그 ===
    	   log.info("[PAY][REQ] GET /pay/{}/result | X-Request-Id={}", ordersId, requestId);
    	   PayResultDTO res = payService.getPayResult(ordersId);
           return ResponseEntity.ok(res);
       }
    
}
