package ticketnow.modules.member.domain;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;
import ticketnow.modules.common.domain.BaseVO;
import ticketnow.modules.common.domain.ImageVO;
import ticketnow.modules.member.constant.MemberRole;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberVO extends BaseVO {

    private String memberId;     // 아이디 (PK)
    private String memberPw;     // 비밀번호
    private String memberName;   // 이름
    private java.sql.Date memberBirth; // 생년월일
    private String memberPhone;  // 연락처
    private String memberEmail;  // 이메일
    private String memberZip;    // 우편번호
    private String memberAddr1;  // 도로명주소
    private String memberAddr2;  // 상세주소
    private String memberGrade;  // 회원등급
    private MemberRole memberRole; // 관리자,회원,탈퇴
    private LocalDateTime deletedAt; // 탈퇴일

    // 회원프로필 이미지들
    private List<ImageVO> image;
}
