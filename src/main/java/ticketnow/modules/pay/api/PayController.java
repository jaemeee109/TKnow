package ticketnow.modules.pay.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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
    @PostMapping("/card/approve")
    public ResponseEntity<PayResultDTO> approveCard(@RequestBody CardApproveRequestDTO req,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	
    	 // === 프론트 추적용 디버깅 로그 ===
        log.info("[PAY][REQ] POST /pay/card/approve | X-Request-Id={} | ordersId={} memberId={} amount={} company={}",
                requestId, req.getOrdersId(), req.getMemberId(), req.getAmount(), req.getCardCompany());

        try {
            PayResultDTO res = payService.approveCard(req); // 서비스 호출
            log.debug("[PAY][RES] approveCard ok | ordersId={} payStatus={} payId={}",
                    res.getOrdersId(), res.getPayStatus(), res.getPayId());
            return ResponseEntity.ok(res);
            
        } catch (Exception e) {
            // 에러는 PayExceptionHandler에서 JSON으로 변환되어 처리
            log.error("[PAY][ERR] approveCard fail | ordersId={} | msg={} | X-Request-Id={}",
                    req.getOrdersId(), e.getMessage(), requestId, e);
            throw e;
        }
    }  
    
    
    

    // [무통장] 가상계좌 발급
    @PostMapping("/vbank/issue")
    public ResponseEntity<PayResultDTO> issueVBank(@RequestBody VBankIssueRequestDTO req,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	
    	 // === 프론트 추적용 디버깅 로그 ===
    	   log.info("[PAY][REQ] POST /pay/vbank/issue | X-Request-Id={} | ordersId={} memberId={} amount={} bank={}",
                   requestId, req.getOrdersId(), req.getMemberId(), req.getAmount(), req.getBankName());
           try {
               PayResultDTO res = payService.issueVBank(req);
               log.debug("[PAY][RES] issueVBank ok | ordersId={} va={}",
                       res.getOrdersId(), res.getVirtualAccount());
               return ResponseEntity.ok(res);
           } catch (Exception e) {
               log.error("[PAY][ERR] issueVBank fail | ordersId={} | msg={} | X-Request-Id={}",
                       req.getOrdersId(), e.getMessage(), requestId, e);
               throw e;
           }
       }
    
    

    // [무통장] 입금(확인) 시뮬레이션
    @PostMapping("/vbank/deposit")
    public ResponseEntity<PayResultDTO> depositVBank(@RequestBody VBankDepositRequestDTO req,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	
    	 // === 프론트 추적용 디버깅 로그 ===
    	  log.info("[PAY][REQ] POST /pay/vbank/deposit | X-Request-Id={} | ordersId={} memberId={} amount={}",
                  requestId, req.getOrdersId(), req.getMemberId(), req.getAmount());
          try {
              PayResultDTO res = payService.depositVBank(req);
              log.debug("[PAY][RES] depositVBank ok | ordersId={} vaPaidAt={}",
                      res.getOrdersId(), res.getVaPaidAt());
              return ResponseEntity.ok(res);
          } catch (Exception e) {
              log.error("[PAY][ERR] depositVBank fail | ordersId={} | msg={} | X-Request-Id={}",
                      req.getOrdersId(), e.getMessage(), requestId, e);
              throw e;
          }
      }

    
    
    
    // 결제 결과 조회 (화면 갱신 등)
    @GetMapping("/{ordersId}/result")
    public ResponseEntity<PayResultDTO> getResult(@PathVariable Long ordersId,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
    	
    	 // === 프론트 추적용 디버깅 로그 ===
    	   log.info("[PAY][REQ] GET /pay/{}/result | X-Request-Id={}", ordersId, requestId);
           try {
               PayResultDTO res = payService.getPayResult(ordersId);
               log.debug("[PAY][RES] getResult ok | ordersId={} status={}", ordersId, res != null ? res.getPayStatus() : null);
               return ResponseEntity.ok(res);
           } catch (Exception e) {
               log.error("[PAY][ERR] getResult fail | ordersId={} | msg={} | X-Request-Id={}",
                       ordersId, e.getMessage(), requestId, e);
               throw e;
           }
       }
    
}
