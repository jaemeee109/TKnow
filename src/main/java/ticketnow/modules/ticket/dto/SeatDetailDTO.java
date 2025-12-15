package ticketnow.modules.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 좌석 선택 UI용 상세 정보 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatDetailDTO {

    private Long seatId;       // seat.seat_id
    private Long ticketId;     // seat.ticket_id
    private Integer roundNo;   // seat.round_no
    private String zone;       // F1 / F2 / F3 / F4
    private String seatCode;   // 예시: F2-003
    private String seatClass;  // S / R 좌석등급
    private String seatStatus; // AVAILABLE / HOLD / RESERVED / PAID ...
}
