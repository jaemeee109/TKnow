package ticketnow.modules.board.dto.inquiry;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import ticketnow.modules.board.dto.reply.ReplyItemDTO;
import ticketnow.modules.common.dto.image.ImageDTO;

// 상세 페이지 DTO
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InquiryDetailDTO {
    private Long boardId; // 게시글 번호
    private String memberId; // 회원id
    private String email;    // 이메일
    private String phone;    // 연락처
    private String title; // 게시글 제목
    private String categoryType; // 문의유형
    private Long orderTicketId;         // 주문 티켓 번호
    private String content;               // 본문내용
    private int replyCount; // 댓글수
    private LocalDateTime createdAt; // 생성일
    private LocalDateTime updatedAt; // 수정일

    private List<ImageDTO> attachments;   // 게시글 첨부 이미지 (board_id)
    private boolean editable;             // 회원: 답변 전까지만 true ( 답변 후 글 수정/삭제 금지)
    private boolean deletable;            // 회원: 명세상 false

    private List<ReplyItemDTO> replies;   // 댓글 목록 (각 댓글별 이미지 포함)
}