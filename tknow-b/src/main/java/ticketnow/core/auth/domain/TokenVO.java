package ticketnow.core.auth.domain;

import java.time.LocalDateTime;
import lombok.*;
import ticketnow.modules.member.domain.MemberVO;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenVO {

    private Long tokenNo;             // 토큰번호
    private MemberVO member;          // (FK)
    private String refreshToken;
    private LocalDateTime expiresAt;  // 토큰만료시간
    private LocalDateTime revokedAt;  // 무효화시각
    private LocalDateTime createdAt;  // 생성일
    private LocalDateTime updatedAt;  // 수정일
}
