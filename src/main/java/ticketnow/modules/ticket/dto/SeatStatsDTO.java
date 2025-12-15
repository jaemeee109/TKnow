package ticketnow.modules.ticket.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatsDTO {
	 /** 회차 번호 (round_no) */
    private Integer roundNo;
    
    /** 좌석 등급 (R / S 등) */
    private String seatClass;

    /** 해당 회차의 전체 좌석 수 */
    private Integer totalSeats;

    /** 해당 회차의 잔여 좌석 수 */
    private Integer remainingSeats;
}
