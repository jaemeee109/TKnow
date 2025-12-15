package ticketnow.modules.order.dto.pay;

import lombok.*;

// 결제하기 버튼 클릭 시 서버로 보내는 요청 DTO
// 주문(ordersId)와 사용자가 선택한 결제 방식/수단을 서버에 전달
// 서버는 이 정보를 바탕으로 Pay 모듈과 연동(결제창 이동/세션/토큰 발급 등) 준비
// 실제 결제 승인/실패 처리는 Pay 모듈에서 수행

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayReadySubmitDTO {

 
    private Long ordersId;    // 주문서번호 OrdersVO.ordersId


    private String payMethod; // 결제 방식 (카드, 계좌 등) PayVO.payMethod
 

    private String payInstrument; // 결제수단, 카드종류 등

    
    private boolean agreeTerms; // 약관동의
}