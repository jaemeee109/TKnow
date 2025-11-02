package ticketnow.modules.ticket.domain;

import java.time.LocalDateTime;
import lombok.*;
import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.ticket.constant.SeatStatus;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatVO {

    private Long seatId;                 // 좌석번호 (PK)
    private TicketVO ticket;             // 공연번호 (FK: ticket_id)
    private String seatCode;             // 좌석구역 (ticket_id + seat_code UNIQUE)
    private SeatStatus seatStatus;       // 좌석예매상태
    private String seatClass;            // 좌석등급
    private LocalDateTime holdUntil;     // 선점만료시간
    private MemberVO holdSeatMember;     // 좌석선점자 (FK: member_id)
}
