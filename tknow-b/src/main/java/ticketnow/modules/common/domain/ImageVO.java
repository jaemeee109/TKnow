package ticketnow.modules.common.domain;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;
import ticketnow.modules.board.domain.BoardVO;
import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.ticket.domain.TicketVO;
import ticketnow.modules.common.constant.ImageType;
import ticketnow.modules.board.domain.ReplyVO; 
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageVO extends BaseVO {

    private String imageUuid;        // 이미지번호 (PK)
    private String imageExt;       // 이미지확장자
    private String orginName;      // 원본파일명  (schema는 orgin_name)
    private String fileName;       // 저장파일명
    private String imageUrl;       // 접근URL
    private ImageType imageType;   // 이미지용도
    private Integer imageSort;     // 정렬순서
    private Boolean isPrimary;     // 대표이미지

    private BoardVO board;         // 게시글번호 (FK)
    private MemberVO member;       // 회원번호 (FK)
    private TicketVO ticket;       // 티켓번호 (FK)
    private ReplyVO reply; 		  // 댓글번호 (FK)
}
