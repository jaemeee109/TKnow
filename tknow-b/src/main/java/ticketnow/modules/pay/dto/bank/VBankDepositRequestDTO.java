package ticketnow.modules.pay.dto.bank;

import lombok.*;

// [무통장입금] 입금(확인) 요청 DTO
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VBankDepositRequestDTO {
    private Long ordersId;       //  어떤 주문의 가상계좌인지
    private String memberId;     // 입금자(확인용)
    private Integer amount;      //  실제 입금 금액(검증 용도로만 사용)
}
