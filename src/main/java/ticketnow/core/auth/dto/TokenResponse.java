package ticketnow.core.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 토큰 응답 
@Getter
@AllArgsConstructor
public class TokenResponse {
    private final String accessToken;
    private final String refreshToken;
    private final String tokenType = "Bearer";
}
