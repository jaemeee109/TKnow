package ticketnow.modules.member.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import ticketnow.modules.member.domain.MemberVO;
import java.time.LocalDateTime;
/**
 * Member 테이블 CRUD용 MyBatis Mapper
 * - SQL은 MemberMapper.xml에 작성 (annotation이 아닌 XML 매핑 방식)
 */
@Mapper
public interface MemberMapper {

    // CREATE: 신규 회원 저장
    int insertMember(MemberVO vo);

    // READ: 단건 조회(기본키: member_id)
    MemberVO selectMemberById(@Param("memberId") String memberId);

    // READ: 페이지 목록 조회 (offset/limit 기반)
    List<MemberVO> selectMemberPage(@Param("offset") int offset, @Param("limit") int limit);

    // READ: 총 레코드 수 (페이지 카운트용)
    long countMembers();

    // UPDATE: 회원 정보 변경
    int updateMember(MemberVO vo);

    // DELETE(소프트): deleted_at에 현재시간 기록
    int softDeleteMember(@Param("memberId") String memberId);
    

    // 최근 한 달 신규 가입 회원 수 (ROLE = 'USER')

    long countNewMembersInPeriod(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );


    // 최근 한 달 탈퇴 회원 수 (ROLE = 'WITHDRAWN')

    long countWithdrawnMembersInPeriod(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
