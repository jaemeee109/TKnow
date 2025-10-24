package ticketnow.modules.board.dto.reply;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import ticketnow.modules.common.dto.image.ImageDTO;

// 댓글 DTO
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReplyItemDTO {
    private Long replyId;                   // 댓글 PK
    private String memberId;                // 작성자 ID(관리자)
    private String content;                 // 댓글 내용
    private LocalDateTime createdAt;        // 생성일
    private LocalDateTime updatedAt;        // 수정일
    private List<ImageDTO> attachments;     // 댓글 첨부 이미지 
}