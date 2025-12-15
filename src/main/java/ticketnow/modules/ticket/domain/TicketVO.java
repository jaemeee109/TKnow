package ticketnow.modules.ticket.domain;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;
import ticketnow.modules.common.domain.BaseVO;
import ticketnow.modules.common.domain.ImageVO;
import ticketnow.modules.ticket.constant.TicketCategory;
import ticketnow.modules.ticket.constant.TicketStatus;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketVO extends BaseVO {

    private Long ticketId;                // 공연번호 (PK)
    private String ticketTitle;           // 공연제목
    private LocalDateTime ticketDate;     // 공연날짜
    private Integer ticketPrice;          // 공연가격
    private String venueName;			  // 공연장 이름
    private Integer ticketStock;          // 좌석수
    private String ticketDetail;          // 상세설명
    private TicketCategory ticketCategory;// 카테고리
    private TicketStatus ticketStatus;    // 판매상태
    
    private LocalDateTime startAt;    // 공연 시작일시
    private LocalDateTime endAt;      // 공연 종료일시

    // 첨부 이미지
    private List<ImageVO> image;
}
