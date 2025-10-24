package ticketnow.modules.board.domain;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;
import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.common.domain.ImageVO;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplyVO {

    private Long replyId;          // 댓글번호 (PK)
    private MemberVO member;       // 작성자 (FK)
    private BoardVO board;         // 게시글번호 (FK)
    private String replyContent;   // 댓글내용
    private List<ImageVO> image;   // 이미지

    private LocalDateTime createdAt; // 생성일
    private LocalDateTime updatedAt; // 수정일
}
