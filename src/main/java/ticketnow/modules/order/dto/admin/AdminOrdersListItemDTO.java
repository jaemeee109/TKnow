package ticketnow.modules.order.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminOrdersListItemDTO {

    /** 주문 번호 */
    private Long ordersId;

    /** 주문 일시 (yyyy-MM-dd HH:mm 형식 문자열) */
    private String orderDate;

    /** 공연명 */
    private String ticketTitle;

    /** 판매 티켓 수량 */
    private Integer ticketQuantity;

    /** 결제 금액(총 결제 금액) */
    private Integer totalAmount;

    /** 주문 상태 (CREATED / PAID / CANCELED / REFUNDED 등) */
    private String ordersStatus;

    /** 결제 상태 (예: READY / APPROVED / CANCELED 등) */
    private String payStatus;
}
