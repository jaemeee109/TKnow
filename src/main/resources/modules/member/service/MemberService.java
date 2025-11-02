package ticketnow.modules.member.service;

import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.member.dto.MemberCreateRequestDTO;
import ticketnow.modules.member.dto.MemberUpdateRequestDTO;
import ticketnow.modules.member.dto.MemberResponseDTO;

/**
 * Member 도메인 비즈니스 로직 인터페이스
 * - 컨트롤러에서 직접 Mapper를 호출하지 않고, 서비스 계층을 통해 접근
 */
public interface MemberService {

    MemberResponseDTO createMember(MemberCreateRequestDTO req);

    MemberResponseDTO getMember(String memberId);

    PageResponseDTO<MemberResponseDTO> getMemberPage(PageRequestDTO pageReq);

    MemberResponseDTO updateMember(String memberId, MemberUpdateRequestDTO req);

    void deleteMember(String memberId);
}
