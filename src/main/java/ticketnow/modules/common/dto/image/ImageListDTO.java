package ticketnow.modules.common.dto.image;

import lombok.*;
import java.util.List;


// 여러 장 이미지를 한 번에 처리하기 위한 요청 래퍼
// 이미지가 어떤 VO (board, member, ticket)에 속하는지를 지정
//   (예: 회원이 작성한 게시글의 티켓 이미지처럼 관계가 복합적인 경우)

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImageListDTO {

    // 게시글 번호 (board.board_id FK) 
    private Long boardId;

    // 회원 아이디 (member.member_id FK) 
    private String memberId;

    // 티켓 번호 (ticket.ticket_id FK) 
    private Long ticketId;

    // 댓글 번호 (reply.reply_id FK)
    private Long replyId;    
    
    // 새로 업로드할 이미지 목록 
    private List<NewImageDTO> newImages;

    // 기존 이미지(메타 수정/삭제용) 목록 
    private List<ExistingImageDTO> existingImages;
    
    
}
