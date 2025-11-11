package ticketnow.modules.board.dto.inquiry;

import lombok.*;
import java.time.LocalDateTime;

// 목록 DTO (제목/댓글수/작성일)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InquiryListItemDTO {
    private Long boardId; // 게시글 번호
    private String title; // 게시글 제목
    private int replyCount; // 댓글수
    private LocalDateTime createdAt; // 등록일
}