package ticketnow.modules.member.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


/**
 * 회원 생성 요청 DTO
 * - Controller 에서 @RequestBody로 바인딩하여 사용
 * - 유효성 검사 애너테이션(@NotBlank등) 포함
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MemberCreateRequestDTO {

    @NotBlank(message = "회원ID는 필수입니다.")
    private String memberId;          // PK(문자열 ID)

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    private String memberPw;          // 비밀번호(실무: BCrypt 등으로 해시 필요)

    @NotBlank(message = "이름은 필수입니다.")
    private String memberName;        // 이름
    
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String memberEmail;       // 이메일 (선택)
    
    @NotBlank
    private String memberSex; 		  // 성별

    private String memberPhone;       // 연락처 (선택)
    private String memberZip;         // 우편번호
    private String memberAddr1;       // 주소1
    private String memberAddr2;       // 주소2
   
}
