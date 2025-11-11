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
    
    // 추가 필드
    private String seatInfo;      // F2 구역 - B 열 - 129 형식
    private String priceLevel;    // 가격 등급
    private Boolean cancelable;   // 취소 가능 여부
}