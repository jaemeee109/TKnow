// TicketResponseDTO.java
package ticketnow.modules.ticket.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.*;
import ticketnow.modules.ticket.constant.TicketStatus;
import ticketnow.modules.ticket.constant.TicketCategory;

@Getter @Setter @ToString @Builder
@AllArgsConstructor @NoArgsConstructor
public class TicketResponseDTO {
    private Long ticketId;
    private String title;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String venueName;
    private int totalSeats;
    private int remainingSeats;
    private BigDecimal price;
    
    // 티켓 대표 이미지 URL (목록/상세에서 썸네일로 사용)
    private String mainImageUrl;
    
    private TicketStatus ticketStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    
    // 티켓 상세 설명 텍스트
    private String ticketDetail;
    // 상품 설명용 이미지 URL
    private String detailImageUrl;
    
    // 티켓 카테고리
    private TicketCategory ticketCategory;
    // 회차 스케줄 목록
    private List<TicketScheduleDTO> schedule;

    
}
