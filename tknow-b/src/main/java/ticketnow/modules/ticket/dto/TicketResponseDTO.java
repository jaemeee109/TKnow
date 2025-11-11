// TicketResponseDTO.java
package ticketnow.modules.ticket.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;
import ticketnow.modules.ticket.constant.TicketStatus;

@Getter @Setter @ToString @Builder
@AllArgsConstructor @NoArgsConstructor
public class TicketResponseDTO {
    private Long ticketId;
    private String title;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String venueName;
    private String venueAddress;
    private int totalSeats;
    private int remainingSeats;
    private BigDecimal price;
    private TicketStatus ticketStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
