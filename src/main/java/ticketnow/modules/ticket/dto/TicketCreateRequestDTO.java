// TicketCreateRequestDTO.java
package ticketnow.modules.ticket.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.*;
import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor @Builder
public class TicketCreateRequestDTO {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    @NotNull(message = "시작일시는 필수입니다.")
    private LocalDateTime startAt;

    @NotNull(message = "종료일시는 필수입니다.")
    private LocalDateTime endAt;

    @NotBlank(message = "공연장 명은 필수입니다.")
    private String venueName;

    private String venueAddress;

    @Min(value = 1, message = "총 좌석 수는 1 이상이어야 합니다.")
    private int totalSeats;

    @DecimalMin(value = "0.0", inclusive = false, message = "가격은 0보다 커야 합니다.")
    private BigDecimal price;
}
