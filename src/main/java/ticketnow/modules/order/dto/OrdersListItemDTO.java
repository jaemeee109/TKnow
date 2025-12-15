// src/main/java/ticketnow/modules/order/dto/OrdersListItemDTO.java
package ticketnow.modules.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ticketnow.modules.common.dto.image.ImageDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 회원별 구매내역 목록용 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdersListItemDTO {


    private Long ordersId;     // 주문 PK


    private String ordersStatus; // 주문 상태 (CREATED, PAID, CANCELED, REFUNDED)

   
    private Long ticketId; //  티켓 PK 

   
    private String ticketTitle; // 공연 제목

    private String ticketImageUrl;
   
    private ImageDTO ticketThumbnail; //  공연 메인 이미지(URL) 

    private String venueName; // 공연장 이름


    private LocalDate ticketDate; //  공연 날짜


    private LocalTime showStartTime; // 공연 시작 시각


    private String ddayText; // D-Day 표시용 텍스트


    private LocalDateTime createdAt; // 주문 생성일시
}
