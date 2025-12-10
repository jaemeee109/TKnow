package ticketnow.modules.member.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.common.mapper.image.ImageMapper;
import ticketnow.modules.member.constant.MemberRole;
import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.member.dto.MemberCreateRequestDTO;
import ticketnow.modules.member.dto.MemberUpdateRequestDTO;
import ticketnow.modules.member.dto.MemberResponseDTO;
import ticketnow.modules.member.mapper.MemberMapper;
import ticketnow.modules.common.domain.ImageVO;
import ticketnow.modules.common.constant.ImageType;
/**
 * Member 비즈니스 서비스 - 트랜잭션 경계에서 Mapper호출 - 비밀번호 해시, 기본 ROLE, 소프트삭제 등 도메인 규칙 담당 -
 * 모든 퍼블릭 메서드에 입력/출력/영향행수 디버깅 로그 포함
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MemberServiceImpl implements MemberService {

	private final MemberMapper memberMapper;
	 private final ImageMapper imageMapper;
	// 간단 데모용. 실무에선 @Bean 으로 관리하거나 PasswordEncoder 주입 권장
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	// =================================================================================
	// 유틸: VO -> ResponseDTO 매핑 (컨트롤러/외부 노출 안전 필드만)
	// =================================================================================
	private MemberResponseDTO toResponse(MemberVO vo) {
		if (vo == null)
			return null;
		return MemberResponseDTO.builder().memberId(vo.getMemberId())
				.memberName(vo.getMemberName())
				.memberEmail(vo.getMemberEmail())
				.memberPhone(vo.getMemberPhone())
				.memberZip(vo.getMemberZip())
				.memberAddr1(vo.getMemberAddr1())
				.memberAddr2(vo.getMemberAddr2())
				.memberGrade(vo.getMemberGrade())
				.memberRole(vo.getMemberRole())
				.createdAt(vo.getCreatedAt())
				.updatedAt(vo.getUpdatedAt())
				.deletedAt(vo.getDeletedAt())
				.build();
	}

	// 요청 파라미터 방어 로깅 (null/빈 값 탐지용)
	private void debugRequest(Object req, String tag) {
		log.debug("[MemberService][{}] req={}", tag, req);
	}

	// VO 스냅샷 로깅(핵심 필드만)
	private void debugSnapshot(MemberVO vo, String tag) {
		if (vo == null) {
			log.debug("[MemberService][{}] snapshot=null", tag);
			return;
		}
		log.debug("[MemberService][{}] snapshot id={}, name={}, role={}, deletedAt={}", tag, vo.getMemberId(),
				vo.getMemberName(), vo.getMemberRole(), vo.getDeletedAt());
	}

	// =================================================================================
	// 생성
	// =================================================================================
	@Override
	@Transactional
	public MemberResponseDTO createMember(MemberCreateRequestDTO req) {
		final long t0 = System.nanoTime();
		debugRequest(req, "CREATE:REQ");

		// 1) 키 중복 방지
		MemberVO existing = memberMapper.selectMemberById(req.getMemberId());
		if (existing != null) {
			log.warn("[MemberService][CREATE] duplicated memberId={}", req.getMemberId());
			throw new IllegalStateException("이미 존재하는 회원ID입니다: " + req.getMemberId());
		}

		// 2) VO 구성 + 정책값 세팅
		MemberVO vo = new MemberVO();
		vo.setMemberId(req.getMemberId());
		vo.setMemberPw(passwordEncoder.encode(req.getMemberPw())); // 비밀번호 해시
		vo.setMemberName(req.getMemberName());
		vo.setMemberEmail(req.getMemberEmail());
		vo.setMemberPhone(req.getMemberPhone());
		vo.setMemberZip(req.getMemberZip());
		vo.setMemberAddr1(req.getMemberAddr1());
		vo.setMemberAddr2(req.getMemberAddr2());
		vo.setMemberRole(MemberRole.USER); // 기본 ROLE
		vo.setCreatedAt(LocalDateTime.now());
		vo.setUpdatedAt(LocalDateTime.now());

		debugSnapshot(vo, "CREATE:BEFORE");

		// 3) INSERT
		int rows = memberMapper.insertMember(vo);
		log.info("[MemberService][CREATE] insert rows={}", rows);

		// 4) 저장 결과 재조회
		MemberVO saved = memberMapper.selectMemberById(vo.getMemberId());
		debugSnapshot(saved, "CREATE:AFTER");
		log.debug("[MemberService][CREATE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);

		return toResponse(saved);
	}

	// =================================================================================
	// 단건 조회
	// =================================================================================
	@Override
	@Transactional(readOnly = true)
	public MemberResponseDTO getMember(String memberId) {
	    final long t0 = System.nanoTime();
	    log.debug("[MemberService][GET] memberId={}", memberId);

	    MemberVO vo = memberMapper.selectMemberById(memberId);
	    if (vo == null) {
	        log.warn("[MemberService][GET] not found memberId={}", memberId);
	        throw new IllegalStateException("회원이 존재하지 않습니다: " + memberId);
	    }

	    debugSnapshot(vo, "GET:FOUND");

	    // 기본 회원 정보 매핑
	    MemberResponseDTO res = toResponse(vo);

	    // ===== 프로필 이미지 조회 =====
	    String profileImageUrl = null;

	    // 이미지 테이블에서 해당 회원의 이미지 목록 조회
	    List<ImageVO> images = imageMapper.selectImagesByMember(memberId);

	    if (images != null && !images.isEmpty()) {
	        // MEMBER_PROFILE + isPrimary=true 를 우선으로 선택
	        ImageVO profile = images.stream()
	                .filter(img -> img.getImageType() == ImageType.MEMBER_PROFILE
	                        && Boolean.TRUE.equals(img.getIsPrimary()))
	                .findFirst()
	                // 없으면 그냥 첫 번째 이미지라도 사용
	                .orElse(images.get(0));

	        profileImageUrl = profile.getImgUrl();
	    }

	    // DTO에 프로필 이미지 경로 세팅
	    res.setProfileImageUrl(profileImageUrl);
	    // ============================

	    log.debug("[MemberService][GET] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);
	    return res;
	}


	// =================================================================================
	// 페이지 조회
	// =================================================================================
	@Override
	@Transactional(readOnly = true)
	public PageResponseDTO<MemberResponseDTO> getMemberPage(PageRequestDTO pageReq) {
		final long t0 = System.nanoTime();
		debugRequest(pageReq, "PAGE:REQ");

		// 1) 오프셋/리밋 계산(1-base page)
		int page = Math.max(1, pageReq.getPage());
		int size = Math.max(1, pageReq.getSize());
		int offset = (page - 1) * size;
		int limit = size;
		log.debug("[MemberService][PAGE] page={}, size={}, offset={}, limit={}", page, size, offset, limit);

		// 2) 데이터 조회
		List<MemberVO> list = memberMapper.selectMemberPage(offset, limit);
		long total = memberMapper.countMembers();
		log.debug("[MemberService][PAGE] total={}, fetched={}", total, list.size());

		// 3) 매핑 + 프로필 이미지 조회 
		List<MemberResponseDTO> rows = list.stream().map(vo -> {
		    MemberResponseDTO dto = toResponse(vo);

		    // ===== 프로필 이미지 조회 (목록용) =====
		    String profileImageUrl = null;
		    List<ImageVO> images = imageMapper.selectImagesByMember(vo.getMemberId());

		    if (images != null && !images.isEmpty()) {
		        ImageVO profile = images.stream()
		                .filter(img -> img.getImageType() == ImageType.MEMBER_PROFILE
		                        && Boolean.TRUE.equals(img.getIsPrimary()))
		                .findFirst()
		                .orElse(images.get(0));

		        profileImageUrl = profile.getImgUrl();
		    }

		    dto.setProfileImageUrl(profileImageUrl);
		    // ============================

		    return dto;
		}).collect(Collectors.toList());

		// 4) 응답 DTO 구성 (PageResponseDTO: list/totalCount/page/size)
		PageResponseDTO<MemberResponseDTO> resp = new PageResponseDTO<>();
		resp.setList(rows);
		resp.setTotalCount(total);
		resp.setPage(page);
		resp.setSize(size);

		log.debug("[MemberService][PAGE] resp.totalPages={}, hasPrev={}, hasNext={}", resp.getTotalPages(),
				resp.isHasPrev(), resp.isHasNext());
		log.debug("[MemberService][PAGE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);

		return resp;
	}

	// =================================================================================
	// 수정(Partial Update)
	// =================================================================================
	@Override
	@Transactional
	public MemberResponseDTO updateMember(String memberId, MemberUpdateRequestDTO req) {
	    final long t0 = System.nanoTime();
	    debugRequest(req, "UPDATE:REQ");
	    log.debug("[MemberService][UPDATE] memberId={}", memberId);

	    MemberVO vo = memberMapper.selectMemberById(memberId);
	    if (vo == null) {
	        log.warn("[MemberService][UPDATE] not found memberId={}", memberId);
	        throw new IllegalStateException("회원이 존재하지 않습니다: " + memberId);
	    }
	    debugSnapshot(vo, "UPDATE:BEFORE");

	    // null 필드 무시 후 부분 갱신
	    if (req.getMemberPw() != null)
	        vo.setMemberPw(passwordEncoder.encode(req.getMemberPw()));
	    if (req.getMemberName() != null)
	        vo.setMemberName(req.getMemberName());
	    if (req.getMemberEmail() != null)
	        vo.setMemberEmail(req.getMemberEmail());
	    if (req.getMemberPhone() != null)
	        vo.setMemberPhone(req.getMemberPhone());
	    if (req.getMemberZip() != null)
	        vo.setMemberZip(req.getMemberZip());
	    if (req.getMemberAddr1() != null)
	        vo.setMemberAddr1(req.getMemberAddr1());
	    if (req.getMemberAddr2() != null)
	        vo.setMemberAddr2(req.getMemberAddr2());

	    // ★ 관리자 화면에서 넘어온 memberRole 이 있으면 권한도 함께 수정
	    if (req.getMemberRole() != null)
	        vo.setMemberRole(req.getMemberRole());

	    vo.setUpdatedAt(LocalDateTime.now());

	    int rows = memberMapper.updateMember(vo);
	    log.info("[MemberService][UPDATE] update rows={}", rows);

	    MemberVO updated = memberMapper.selectMemberById(memberId);
	    debugSnapshot(updated, "UPDATE:AFTER");
	    log.debug("[MemberService][UPDATE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);

	    return toResponse(updated);
	}


	// =================================================================================
	// 삭제(소프트)
	// =================================================================================
	@Override
	@Transactional
	public void deleteMember(String memberId) {
		final long t0 = System.nanoTime();
		log.debug("[MemberService][DELETE] memberId={}", memberId);

		int rows = memberMapper.softDeleteMember(memberId); // deleted_at NOW(), updated_at NOW()
		log.info("[MemberService][DELETE] soft delete rows={}, memberId={}", rows, memberId);
		log.debug("[MemberService][DELETE] elapsed={} ms", (System.nanoTime() - t0) / 1_000_000.0);
	}
}
