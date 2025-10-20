package ticketnow.modules.pay.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ticketnow.modules.pay.constant.PayStatus;
import ticketnow.modules.pay.domain.PayVO;
import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.order.domain.OrdersVO;
import ticketnow.modules.pay.dto.*;
import ticketnow.modules.pay.dto.bank.VBankDepositRequestDTO;
import ticketnow.modules.pay.dto.bank.VBankIssueRequestDTO;
import ticketnow.modules.pay.dto.card.CardApproveRequestDTO;
import ticketnow.modules.pay.mapper.PayMapper;

import java.time.LocalDateTime;
import java.util.UUID;

// 가상 결제 서비스 구현

@Slf4j
@Service
@RequiredArgsConstructor
public class PayServiceImpl implements PayService {

    private final PayMapper payMapper;

    // 공통: 주문 완료 & 좌석 완료로 반영 
    private void markOrderAndSeatsPaid(Long ordersId) {
        int up1 = payMapper.updateOrdersStatus(ordersId, "PAID");  // orders.orders_status = 'PAID'
        log.debug("[PAY-MAPPER] updateOrdersStatus affectedRows={}", up1); // 디버그 로깅
        
        if (up1 == 0) {
            throw new IllegalStateException("주문 상태가 갱신되지 않았습니다(ordersId=" + ordersId + ").");
        }

        int up2 = payMapper.updateSeatStatusPaidByOrdersId(ordersId); // seat.seat_status = 'PAID'
        log.debug("[PAY-MAPPER] updateSeatStatusPaidByOrdersId affectedRows={}", up2); // 디버그 로깅
        if (up2 == 0) {
            throw new IllegalStateException("좌석 상태가 갱신되지 않았습니다(ordersId=" + ordersId + ").");
        }
    }

    
    @Override
    @Transactional
    public PayResultDTO approveCard(CardApproveRequestDTO req) {
    	
    	// 디버그 로깅
    	 log.debug("[PAY-SVC] approveCard start | ordersId={} amount={} memberId={} company={}",
                 req.getOrdersId(), req.getAmount(), req.getMemberId(), req.getCardCompany());
    	 
        //  가상의 승인번호/거래번호 생성
        String tid = "TID-" + UUID.randomUUID();         //  임의 거래번호
        String approvalNo = "AP-" + System.currentTimeMillis(); // 임의 승인번호

        
        PayVO vo = PayVO.builder()
                .member(MemberVO.builder().memberId(req.getMemberId()).build()) //  FK
                .orders(OrdersVO.builder().ordersId(req.getOrdersId()).build()) //  FK
                .payMethod("CARD")                 //  결제수단
                .payAmount(req.getAmount())        //  금액
                .payStatus(PayStatus.APPROVED)     //  즉시 승인
                .pgProvider("VIRTUAL-PG")         //  가상 PG사
                .pgTid(tid)                        // 거래번호
                .approvalNo(approvalNo)            // 승인번호
                .approvedAt(LocalDateTime.now())   // 승인시각
                .build();

        // DB insert (승인 완료 상태로)
        int ins = payMapper.insertCardApproved(vo);
        log.debug("[PAY-MAPPER] insertCardApproved affectedRows={}", ins);
        if (ins == 0) {
            throw new IllegalStateException("카드 승인 레코드가 저장되지 않았습니다(ordersId=" + req.getOrdersId() + ").");
        }
        
        
        //  주문/좌석 상태를 결제완료로 반영
        markOrderAndSeatsPaid(req.getOrdersId());

        PayResultDTO res = payMapper.selectPayResultByOrdersId(req.getOrdersId());
        log.info("[PAY-SVC][OK] approveCard complete | ordersId={} payId={} status={}",
                req.getOrdersId(), res != null ? res.getPayId() : null, res != null ? res.getPayStatus() : null);
        return res;
    }

    
    
    @Override
    @Transactional
    public PayResultDTO issueVBank(VBankIssueRequestDTO req) {
    	
    	 log.debug("[PAY-SVC] issueVBank start | ordersId={} amount={} bank={}",
                 req.getOrdersId(), req.getAmount(), req.getBankName()); // 디버그로깅
    	 
        //  가상의 계좌 문자열 생성
        String va = "VB-" + (int)(Math.random()*900000 + 100000); 

        // 결제준비중(READY) 상태로 pay 레코드 삽입(가상계좌 발급)
        PayVO vo = PayVO.builder()
                .member(MemberVO.builder().memberId(req.getMemberId()).build())
                .orders(OrdersVO.builder().ordersId(req.getOrdersId()).build())
                .payMethod("VBANK")                //  무통장입금
                .payAmount(req.getAmount())        //  금액
                .payStatus(PayStatus.READY)        //  대기상태
                .pgProvider("VIRTUAL-PG")         //  가상 PG
                .virtualAccount(va)                //  발급한 가상계좌
                .build();

        int ins = payMapper.insertVBankReady(vo);
        log.debug("[PAY-MAPPER] insertVBankReady affectedRows={}", ins); // 디버그로깅
        if (ins == 0) {
            throw new IllegalStateException("가상계좌 발급 레코드가 저장되지 않았습니다(ordersId=" + req.getOrdersId() + ").");
        }

        PayResultDTO res = payMapper.selectPayResultByOrdersId(req.getOrdersId());
        log.info("[PAY-SVC][OK] issueVBank complete | ordersId={} va={}", // 디버그 로깅
                req.getOrdersId(), res != null ? res.getVirtualAccount() : null);
        return res;
    }

    @Override
    @Transactional
    public PayResultDTO depositVBank(VBankDepositRequestDTO req) {
    	
    	  log.debug("[PAY-SVC] depositVBank start | ordersId={} amount={} memberId={}",
                  req.getOrdersId(), req.getAmount(), req.getMemberId()); // 디버그로깅
    	  
        //  입금 확인 시 결제승인완료(APPROVED) va_paid_at=NOW()
    	  int up = payMapper.approveVBank(req.getOrdersId());
          log.debug("[PAY-MAPPER] approveVBank affectedRows={}", up);
          if (up == 0) {
              throw new IllegalStateException("가상계좌 입금 반영이 이루어지지 않았습니다(ordersId=" + req.getOrdersId() + ").");
          }
          
          
        //  주문/좌석 상태를 결제완료로 반영
        markOrderAndSeatsPaid(req.getOrdersId());
        

        PayResultDTO res = payMapper.selectPayResultByOrdersId(req.getOrdersId());
        log.info("[PAY-SVC][OK] depositVBank complete | ordersId={} vaPaidAt={}",
                req.getOrdersId(), res != null ? res.getVaPaidAt() : null);
        return res;
        
        
    }

    @Override
    @Transactional(readOnly = true) // 읽기 전용
    public PayResultDTO getPayResult(Long ordersId) {
    	  log.debug("[PAY-SVC] getPayResult | ordersId={}", ordersId); // 디버그 로깅
    	  
          PayResultDTO res = payMapper.selectPayResultByOrdersId(ordersId);
          
          log.debug("[PAY-SVC] getPayResult done | ordersId={} status={}", ordersId, res != null ? res.getPayStatus() : null);
         
          return res;
    }
}
