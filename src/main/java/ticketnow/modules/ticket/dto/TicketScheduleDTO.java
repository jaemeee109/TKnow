package ticketnow.modules.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


// 티켓 회차 응답 DTO

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketScheduleDTO {

    // 회차 번호 (1회차, 2회차...)
    private Integer roundNo;

    // 공연 일시 (ticket_schedule.show_at)
    private LocalDateTime showAt;
}
