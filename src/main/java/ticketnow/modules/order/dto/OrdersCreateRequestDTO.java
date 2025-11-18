package ticketnow.modules.order.dto;

import lombok.*;
import java.util.List;


// 주문 생성 요청 DTO

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdersCreateRequestDTO {

   
    private Integer ordersTotalAmount;  // 총 결제 금액 

   
    private Integer ordersTicketQuantity;  // 총 예매 수량

   
    private List<Long> seatIdList;  // 선택한 좌석 ID 목록
}