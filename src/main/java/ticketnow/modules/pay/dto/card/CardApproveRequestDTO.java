package ticketnow.modules.pay.dto.card;

import lombok.*;

// [카드 결제 승인] 요청 DTO 
//  실제 카드번호는 저장하지 않고, 마스킹된 일부만 로그에 남김
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CardApproveRequestDTO {
    // 
    private Long ordersId;            // 주문서번호 (FK) 프론트에서 넘어오는 주문아이디
    
    private String memberId;          // 회원아이디 (FK) - 로그인 세션/JWT에서 주입하거나 파라미터로 전달
    
    private Integer amount;           // 총 결제금액

    private String cardCompany;       // 카드사 이름 (표시/로그용)
    
    private String maskedCardNo;      // 마스킹된 카드번호 (보안상 일부만) 예시: "****-****-****-1234"
   
    private boolean agreeTerms;       //  // 약관 동의 여부
}
