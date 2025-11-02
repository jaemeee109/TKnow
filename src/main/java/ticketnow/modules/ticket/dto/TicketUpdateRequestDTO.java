// TicketUpdateRequestDTO.java
package ticketnow.modules.ticket.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.*;
import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor @Builder
public class TicketUpdateRequestDTO {
    private String title;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String venueName;
    private String venueAddress;
    private Integer totalSeats;
    private Integer remainingSeats;
    private BigDecimal price;
    private String ticketStatus; // 문자열로 받아 enum 변환(서비스에서)
}
