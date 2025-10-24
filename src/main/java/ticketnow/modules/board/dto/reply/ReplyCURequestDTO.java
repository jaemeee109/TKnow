package ticketnow.modules.board.dto.reply;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import ticketnow.modules.common.dto.image.ExistingImageDTO;

// 관리자 댓글 등록/수정 DTO
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReplyCURequestDTO {
    private String adminId;                      // 관리자 ID
    private String content;                      // 댓글 내용
    private List<MultipartFile> newAttachments;  // 이미지 수정(reply_id 로 저장)
    private List<ExistingImageDTO> existingImages;// 댓글 이미지 삭제
}