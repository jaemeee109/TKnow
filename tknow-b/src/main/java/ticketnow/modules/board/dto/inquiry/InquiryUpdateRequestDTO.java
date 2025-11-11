package ticketnow.modules.board.dto.inquiry;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import ticketnow.modules.common.dto.image.ExistingImageDTO;

// 회원용 수정 DTO (댓글 달리기 전까지만 허용)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InquiryUpdateRequestDTO {
    private String memberId;                 // 본인 확인
    private String title;                    // 제목
    private String categoryType;             // CategoryType.name()
    private Long orderTicketId;              // 주문 티켓 번호
    private String content;                  // 본문

    // 게시글 이미지 수정 및 삭제
    private List<MultipartFile> newAttachments;   // 새 이미지
    private List<ExistingImageDTO> existingImages; // 기존 이미지 메타/삭제
}