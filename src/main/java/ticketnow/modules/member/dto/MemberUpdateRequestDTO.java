package ticketnow.modules.member.dto;


import javax.validation.constraints.Email;
import javax.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import ticketnow.modules.member.constant.MemberRole;
/**
 * 회원 수정 요청 DTO
 * - 부분 수정(Partial Update) 가정: null 인 필드는 변경하지 않음
 */
@Getter @Setter @ToString
public class MemberUpdateRequestDTO {
    // 비밀번호는 선택 변경. 입력이 있으면 해시 후 교체
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    private String memberPw;

    private String memberName;

    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String memberEmail;

    private String memberPhone;
    private String memberZip;
    private String memberAddr1;
    private String memberAddr2;
    
    private MemberRole memberRole;
}
