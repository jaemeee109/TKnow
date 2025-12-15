package ticketnow.modules.pay.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import ticketnow.modules.pay.domain.PayVO;
import ticketnow.modules.pay.dto.PayResultDTO;


@Mapper
public interface PayMapper {

 
    int insertCardApproved(PayVO vo); //[카드] 즉시 승인 (pay_status=APPROVED)

   
    int insertVBankReady(PayVO vo);  // [무통장] 가상계좌 발급 (pay_status=READY)

   
    int approveVBank(@Param("ordersId") Long ordersId);  // [무통장] 입금 처리 → APPROVED + va_paid_at

    
    // 주문상태 갱신 (예: PAID)
    int updateOrdersStatus(@Param("ordersId") Long ordersId,
                           @Param("status") String status);

    
    // 좌석상태 갱신: ordersId 기준으로 연결된 seat들을 일괄 PAID로 변경
    int updateSeatStatusPaidByOrdersId(@Param("ordersId") Long ordersId);

    
    // 주문 상세의 최신 결제 상태 조회 (표시/검증용)
    PayResultDTO selectPayResultByOrdersId(@Param("ordersId") Long ordersId);
    
}
