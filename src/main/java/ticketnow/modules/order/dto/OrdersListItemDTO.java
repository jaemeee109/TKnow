package ticketnow.modules.order.dto;

import lombok.*;
import ticketnow.modules.common.dto.image.ImageDTO;


//  주문내역 목록 DTO

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrdersListItemDTO {

	// 티켓 대표 이미지 URL (썸네일)
    private String ticketImageUrl;
   
    private ImageDTO ticketThumbnail; // 썸네일

   
    private String ticketTitle; // 공연제목
    private String ticketVenue;     // 공연장소 (프론트용)
    private String ticketDate;        // 공연날짜
    private String showStartTime;   // 공연 시작 시간 (프론트용)

    
    private String ddayText; // 공연 n일전

  
    private Long ordersId; // 주문서번호
    
 
}
