package ticketnow.core.auth.dto;

import lombok.Getter;
import lombok.Setter;

// auth/login 요청 DTO
@Getter @Setter
public class LoginRequest {
    // DB member.member_id / member_pw 컬럼 기준
    private String memberId; 
    private String password;
}
