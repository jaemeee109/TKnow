package ticketnow.modules.order.dto;

import lombok.*;
import java.time.LocalDateTime;

import ticketnow.modules.order.constant.OrdersStatus; 
import ticketnow.modules.pay.constant.PayStatus;     
import ticketnow.modules.common.dto.image.ImageDTO;


// 주문내역 상세 페이지 DTO

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrdersDetailDTO {

 // =================== 기본 =================== 
    private Long ordersId;            // 주문서번호(OrdersVO.ordersId)
    private Long orderTicketId;         // 주문공연번호 (OrderTicketVO.orderTicketId)

 // =================== 공연,티켓 정보 =================== 
    private String ticketTitle; // 공연제목
    private ImageDTO ticketThumbnail; // 썸네일

    private String memberName;        // 예매자 이름 (MemberVO.memberName)
    private String ticketDate;          // 공연 날짜 (TicketVO.ticketDate)
    private String showStartTime;     // 공연 시작시간 (프론트용)
    private String ticketVenue;       // 공연 장소 (프론트용)

    private String seatClass;   // 좌석등급
    private String seatCode;    // 좌석구역
    private String seatNumber;  // 좌석번호(프론트 용)
    private Long seatId;  // 좌석번호 (FK)

 // =================== 수령방법 =================== 
    private String deliveryMethod;    // "현장수령"  or "모바일티켓" ..
    private String qrImageUrl;        // 모바일티켓 QR 이미지(서버에서 생성해 접근 URL 제공) 
    private String qrCodeNumber;      // QR 코드/권종 번호(난수)

 // =================== 결제 수단 방법 =================== 
    private OrdersStatus ordersStatus; // 주문상태 (CREATED/PAID/CANCELED/REFUNDED)
    private PayStatus payStatus;       // 결제상태 (READY/APPROVED/...)
    private String payMethod;          // 결제수단(PayVO.payMethod: "CARD"|"VIRTUAL_ACCOUNT"|...) 

    private Integer ticketPrice;       // 공연가격(개당)
    private Integer serviceFee;        // 수수료 (프론트용)
    private Integer quantity;          // 구매수량 (OrdersVO.ordersTicketQuantity)
    private Integer totalPayAmount;    // 총결제금액 (OrdersVO.ordersTotalAmount)

    // =================== 취소 환불 =================== 
    private boolean cancelable;         // 취소 가능 여부(서버 계산)
    private LocalDateTime cancelDeadline; // 취소 마감 시각(서버 계산)   [변경 가능]
    private String cancelFeePeriodText;   // "취소수수료 기간" 표기용 문구     [변경 가능]

    // =================== 시간 =================== 
    private LocalDateTime createdAt;     // 주문 생성일 (OrdersVO extends BaseVO ⇒ createdAt)
    private LocalDateTime updatedAt;     // 주문 수정일 (OrdersVO extends BaseVO ⇒ updatedAt)
}
