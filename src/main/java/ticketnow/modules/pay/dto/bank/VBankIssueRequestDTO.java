package ticketnow.modules.pay.dto.bank;

import lombok.*;

// [무통장입금] 가상계좌 발급 요청 DTO

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VBankIssueRequestDTO {
    private Long ordersId;    // 주문서번호
    private String memberId;  // 회원아이디
    private Integer amount;   //  입금해야 할 금액(주문총액)
    private String bankName;  // 표기용(예: "국민은행")
    private boolean agreeTerms;// 약관 동의
}
