package ticketnow.modules.order.domain;

import java.time.LocalDateTime;
import lombok.*;
import ticketnow.modules.ticket.domain.SeatVO;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTicketVO {

    private Long orderTicketId;   // 주문공연번호 (PK)
    private OrdersVO orders;      // 주문서번호 (FK)
    private SeatVO seat;          // 좌석번호 (FK, UNIQUE)
    private Integer orderPrice;   // 주문가격
    private Integer orderQuantity;// 주문수량

    private LocalDateTime createdAt; // 생성일
    private LocalDateTime updatedAt; // 수정일
}