package ticketnow.modules.ticket.dto;

import lombok.Data;


// * 티켓별 회차/등급 좌석 요약 DTO

@Data
public class SeatSummaryDTO {

    private Long ticketId;          // 티켓 PK
    private Integer roundNo;        // 회차 번호
    private String seatClass;       // 좌석 등급 (S / R)
    private Integer totalSeats;     // 해당 등급 전체 좌석 수
    private Integer remainingSeats; // 해당 등급 잔여 좌석 수
}
