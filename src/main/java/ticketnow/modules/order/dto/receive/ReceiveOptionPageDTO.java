package ticketnow.modules.order.dto.receive;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import ticketnow.modules.common.dto.image.ImageDTO;

// 티켓수령방법선택 화면용 DTO 

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReceiveOptionPageDTO {

	  //================== 수령 방법 ==================
    
    private List<String> deliveryMethodOptions; // 선택 가능한 수령방법 (ex. 현장수령 , 모바일티켓)
    private String selectedDeliveryMethod; // 선택된 수령방법 (ex.현장수령 , 모바일티켓)

    //================== 회원 정보==================
    private String memberName; // 회원이름
    private String memberBirth; // 생년월일
    private String memberPhone; // 연락처
    private String memberEmail; // 이메일
    

    //================== 공연 정보 ==================
    private ImageDTO ticketThumbnail; // 티켓 썸네일
    
    private String ticketTitle;  // 공연 제목
    
   
    private String ticketPeriod; //  // 공연 기간 (프론트용)

  
    private String ticketVenue;    // 공연 장소 (프론트용)


    private String audienceGrade; // 관람 나이 등급  (프론트용)

   
    private String showStartTime;  // 공연 시작 시간 (프론트용)

  
    private String runningTime;     // 관람 시간 (프론트용)

    //================== 예매 정보 ==================
   
    private String ticketDate; // 공연날짜 
    private String seatClass;   // 좌석등급
    private String seatCode;    // 좌석구역
    private String seatNumber; // 좌석번호 (프론트용)
    private Long seatId;  // 좌석 식별자(FK)
    

 
    private Integer ticketPrice; // 공연 개당 가격
    private Integer serviceFee;     // 수수료
    private Integer purchaseQty;    // 주문수량 OrdersVO.ordersTicketQuantity 연동
    private Integer totalPayAmount; // 주문가격 OrdersVO.ordersTotalAmount 연동

    
    private String cancelDeadlineText; // // 취소 기한(프론트용) ex) "관람일 2일 전 23:59까지" 
    private String cancelFeePolicy;    // 취소 수수료 (프론트용) ex) "관람일 3일전~당일: 30~90%" [변경 가능]

    //================== 공통 ==================
    
    private Long ordersId; // 주문서 식별자 OrdersVO.ordersId (nullable)

   
    private LocalDateTime generatedAt; // 화면 생성 시각(디버깅·표시용)
}