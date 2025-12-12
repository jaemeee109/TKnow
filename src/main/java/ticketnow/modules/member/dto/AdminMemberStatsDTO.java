package ticketnow.modules.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 관리자용 회원 통계 DTO
 * - 최근 한 달 신규 회원 수 (ROLE=USER)
 * - 최근 한 달 탈퇴 회원 수 (ROLE=WITHDRAWN)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMemberStatsDTO {

	
	// 최근 한 달 동안 새로 가입한 회원 수 (member_role = 'USER')

    private long newMembers;

    //  최근 한 달 동안 탈퇴한 회원 수 (member_role = 'WITHDRAWN')

    private long withdrawnMembers;
}
