package ticketnow.modules.order.dto.admin;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSalesSummaryDTO {
	
	/** 판매 티켓 수량 (PAID 상태 전체 수량 합계) */
    private Long totalTicketQuantity;

    /** 판매액 (PAID 상태 주문 총 금액 합계) */
    private Long totalSalesAmount;

    /** 매출 원가 (판매액의 80%) */
    private Long totalCostAmount;

    /** 매출 이익 (판매액의 20%) */
    private Long totalProfitAmount;

    /** 환불 금액 (REFUNDED 상태 주문 총 금액 합계) */
    private Long totalRefundAmount;
	
}
