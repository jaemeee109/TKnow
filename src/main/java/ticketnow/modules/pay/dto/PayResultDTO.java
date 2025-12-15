package ticketnow.modules.pay.dto;

import lombok.*;
import java.time.LocalDateTime;

// 결제 결과/상태 조회 DTO (카드/무통장 공용)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayResultDTO {
    private Integer payId;           //  결제 PK
    private Long ordersId;           // 주문서번호
    private String memberId;         //  회원아이디
    private String payMethod;        //  "CARD" | "VBANK"
    private Integer payAmount;       //  결제금액
    
    private String payStatus;        
    //  READY, APPROVED, CANCELED, PARTIAL_REFUND, FAILED
    // 결제준비중, 결제승인완료, 결제취소완료, 부분환불완료, 결제실패
    
    private String pgProvider;       //  (가상)PG사명
    private String pgTid;            //  거래번호(가상)
    private String approvalNo;       //  승인번호(가상, 카드일 때)
    private LocalDateTime approvedAt;//  승인일시
    private String virtualAccount;   //  가상계좌(무통장일 때)
    private LocalDateTime vaPaidAt;  //  입금일시(무통장일 때)
    private LocalDateTime createdAt; //  생성일
    private LocalDateTime updatedAt; //  수정일
}
