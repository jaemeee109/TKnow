package ticketnow.modules.board.domain;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;
import ticketnow.modules.common.domain.BaseVO;
import ticketnow.modules.common.domain.ImageVO;
import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.board.constant.CategoryType;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardVO extends BaseVO {

    private Long boardId;              // 게시물번호 (PK)
    private MemberVO member;           // 작성자 (FK)
    private String boardTitle;         // 게시물제목
    private String boardContent;       // 게시물내용 (DB는 board_Content로 매핑)
    private String boardReactionType;  // C/S평가
    private CategoryType categoryType; // 카테고리 종류

    private List<ImageVO> image;       // 이미지
}
