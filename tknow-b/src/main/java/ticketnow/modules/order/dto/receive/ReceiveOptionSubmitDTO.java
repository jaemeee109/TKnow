package ticketnow.modules.order.dto.receive;

import lombok.*;


// 티켓수령방법 선택 페이지 요청 DTO

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReceiveOptionSubmitDTO {


    private Long ordersId; // 주문서번호 OrdersVO.ordersId 

   
    private String deliveryMethod; // 선택된 수령방법 (ex. 현장수령, 모바일티켓)

    
    private String memberPhone;  // 예매자 연락처
    private String memberEmail;  // 예매자 이메일

   
    private boolean agreeTerms; // 약관동의
}
