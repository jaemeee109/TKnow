package ticketnow.modules.order.dto.pay;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import ticketnow.modules.common.dto.image.ImageDTO;

// 결제하기 페이지 뷰 DTO
// 수령선택 이후, 결제 직전 화면에 필요한 모든 정보를 한 번에 제공

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayPageDTO {

    // ================== 결제 방식/수단 선택 ================== 


    private List<String> payMethodOptions; // 결제 방식 옵션 (카드, 무통장입금, 가상계좌 등) 

    private String selectedPayMethod; // 선택된 결제 방식 (PayVO.payMethod로 전달)


    private List<String> payInstrumentOptions; // 결제수단 옵션 (카드 회사 종류 등)

    // 선택된 결제수단(카드종류 등) [변경 가능]
    private String selectedPayInstrument; // 선택된 결제 수단 (카드 회사 종류 등)


   // ==================  공연 정보 (표시용) ==================

    private ImageDTO ticketThumbnail; // 티켓 썸네일

    private String ticketTitle;     // 공연 제목

    private String ticketPeriod;    // 공연 기간(프론트용) 
    private String ticketVenue;     // 공연 장소(프론트용) 
    private String audienceGrade;   // 관람 등급(프론트용)  
    private String showStartTime;   // 공연 시작 시간(프론트용) 
    private String runningTime;     // 관람 시간(프론트용)   


    /* ================== 예매 정보 (표시용) ================== */

    private String ticketDate;  // 공연 날짜(표시 포맷)  // TicketVO.ticketDate 포맷

    private String seatClass;   // 좌석 등급     
    private String seatCode;    // 좌석 구역  
    private String seatNumber;  // 좌석 번호(프론트용)
    private Long   seatId;      // 좌석 식별자(FK)

    private Integer ticketPrice;     // 공연 개당 가격
    private Integer serviceFee;      // 수수료(프론트용)
    private Integer purchaseQty;     // 주문 수량 OrdersVO.ordersTicketQuantity
    private Integer totalPayAmount;  // 총 결제 금액 OrdersVO.ordersTotalAmount


  
    private String cancelDeadlineText; // 취소기한 ex) "관람일 2일 전 23:59까지"
    private String cancelFeePolicy;    // 취소수수료 ex)"관람일 3일전~당일: 30~90%"  


    // ================== 공통 ================== */

    private Long ordersId;                // 주문서 식별자  // OrdersVO.ordersId
    private LocalDateTime generatedAt;    // 화면 생성 시각(디버깅·표시용)
}