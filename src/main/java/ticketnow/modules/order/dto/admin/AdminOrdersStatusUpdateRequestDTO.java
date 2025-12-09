package ticketnow.modules.order.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminOrdersStatusUpdateRequestDTO {

    /** 변경할 주문 상태 문자열 (예: CREATED, PAID, CANCELED, REFUNDED) */
    private String ordersStatus;
}
