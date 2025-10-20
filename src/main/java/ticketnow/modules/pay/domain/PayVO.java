package ticketnow.modules.pay.domain;

import java.time.LocalDateTime;
import lombok.*;
import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.order.domain.OrdersVO;
import ticketnow.modules.pay.constant.PayStatus;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayVO {

    private Integer payId;           // 결제번호 (PK)
    private MemberVO member;         // 회원아이디 (FK)
    private OrdersVO orders;         // 주문번호 (FK)
    private String  payMethod;       // 결제수단
    private Integer payAmount;       // 결제금액
    private PayStatus payStatus;     // 결제상태  ※ 설계표 철자 유지
    private String  pgProvider;      // 결제PG사
    private String  pgTid;           // 거래번호
    private String  approvalNo;      // 승인번호
    private LocalDateTime approvedAt;// 승인시간
    private LocalDateTime canceledAt;// 결제취소시간
    private Integer refundAmount;    // 환불액
    private String  virtualAccount;  // 가상계좌발급
    private LocalDateTime vaPaidAt;  // 입금완료(계좌)
    private LocalDateTime createdAt; // 생성일
    private LocalDateTime updatedAt; // 수정일
}
