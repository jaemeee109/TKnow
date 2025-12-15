package ticketnow.modules.ticket.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketScheduleVO {

	

	    private Long scheduleId;
	    private Long ticketId;
	    private Integer roundNo;
	    private LocalDateTime showAt;

}

