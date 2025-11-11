package ticketnow.modules.member.dto;

import java.time.LocalDateTime;
import lombok.*;
import ticketnow.modules.member.constant.MemberRole;

/**
 * 회원 응답 DTO
 * - API 응답에 사용되는 안전한 형태
 * - 비밀번호 등 민감정보는 포함하지 않음
 */
@Getter @Setter @ToString @Builder
@AllArgsConstructor @NoArgsConstructor
public class MemberResponseDTO {
    private String memberId;
    private String memberName;
    private String memberEmail;
    private String memberPhone;
    private String memberZip;
    private String memberAddr1;
    private String memberAddr2;
    private String memberGrade;
    private MemberRole memberRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
