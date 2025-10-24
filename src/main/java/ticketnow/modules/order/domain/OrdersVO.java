package ticketnow.modules.order.domain;

import java.time.LocalDateTime;
import lombok.*;
import ticketnow.modules.common.domain.BaseVO;
import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.order.constant.OrdersStatus;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdersVO extends BaseVO {

    private Long ordersId;                 // 주문서번호 (PK)
    private MemberVO member;               // 회원 (FK)
    private Integer ordersTotalAmount;     // 주문가격
    private Integer ordersTicketQuantity;  // 주문수량
    private OrdersStatus ordersStatus;     // 주문상태
}
