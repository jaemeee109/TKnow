package ticketnow.modules.board.dto.inquiry;

import lombok.*;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

// 회원용 문의 등록 폼 DTO
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InquiryCreateRequestDTO {
    private String memberId;                     // 작성자 ID (세션/JWT 없으므로 파라미터로 수신)
    private String email;                        // 화면 표시/검증용 (member 조인 확장 시 사용)
    private String phone;                        // 화면 표시/검증용
    private String title;                        // 문의 제목
    private String categoryType;                 // CategoryType.name() 문자열
    private Long orderTicketId;                  // 주문공연번호
    private String content;                      // 본문 내용
    private List<MultipartFile> attachments; // 게시글 첨부 이미지(여러개)
}