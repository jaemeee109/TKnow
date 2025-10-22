package ticketnow.core.auth.domain;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlacklistTokenVO {

    private Long blackNo;             // 블랙리스트번호
    private String accessTokenHash;
    private LocalDateTime expiresAt;  // 만료시간
}
