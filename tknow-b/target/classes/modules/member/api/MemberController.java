package ticketnow.modules.member.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import ticketnow.modules.member.dto.MemberCreateRequestDTO;
import ticketnow.modules.member.dto.MemberUpdateRequestDTO;
import ticketnow.modules.member.dto.MemberResponseDTO;
import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.member.service.MemberService;

/**
 * 회원(Member) 관련 CRUD API
 */
@RestController // REST API 컨트롤러임을 표시 (JSON 반환)
@RequestMapping("/members") // 모든 엔드포인트의 공통 URL prefix
@RequiredArgsConstructor // final 필드로 선언된 의존성(MemberService)을 생성자 주입으로 연결
@Validated // @Valid, @NotBlank 등 Bean Validation 활성화
@Slf4j // 로그 출력용(디버깅/운영 로깅)
public class MemberController {

    private final MemberService memberService; // 서비스 계층 의존성

    /**
     * 회원 생성(등록)
     * POST /members
     * 요청 바디: MemberCreateRequestDTO(JSON)
     * 응답 바디: 생성된 회원 정보(MemberResponseDTO)
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')") // 로그인 사용자만 접근 (예시)
    @PostMapping
    public ResponseEntity<MemberResponseDTO> createMember(
            @Valid @RequestBody MemberCreateRequestDTO req,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId // 추적용 선택 헤더
    ) {
        log.info("[POST] /members | X-Request-Id={} | memberId={}, email={}", requestId, req.getMemberId(), req.getMemberEmail());
        MemberResponseDTO created = memberService.createMember(req);
        return ResponseEntity.ok(created);
    }

    /**
     * 회원 단건 조회
     * GET /members/{memberId}
     * 경로변수: memberId(String)
     * 응답 바디: MemberResponseDTO
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{memberId}")
    public ResponseEntity<MemberResponseDTO> getMember(
            @PathVariable @NotBlank String memberId,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
        log.info("[GET] /members/{} | X-Request-Id={}", memberId, requestId);
        return ResponseEntity.ok(memberService.getMember(memberId));
    }

    /**
     * 회원 목록 조회(페이지네이션)
     * GET /members?page=1&size=10
     * 응답: PageResponseDTO<MemberResponseDTO>
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<MemberResponseDTO>> getMemberPage(
            @Valid PageRequestDTO pageReq, // page, size, sort 등을 한 번에 바인딩
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
        log.info("[GET] /members | X-Request-Id={} | page={}, size={}", requestId, pageReq.getPage(), pageReq.getSize());
        return ResponseEntity.ok(memberService.getMemberPage(pageReq));
    }

    /**
     * 회원 수정
     * PUT /members/{memberId}
     * 요청 바디: MemberUpdateRequestDTO
     * 응답 바디: MemberResponseDTO(수정 결과)
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PutMapping("/{memberId}")
    public ResponseEntity<MemberResponseDTO> updateMember(
            @PathVariable @NotBlank String memberId,
            @Valid @RequestBody MemberUpdateRequestDTO req,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
        log.info("[PUT] /members/{} | X-Request-Id={} | update fields={}", memberId, requestId, req);
        return ResponseEntity.ok(memberService.updateMember(memberId, req));
    }

    /**
     * 회원 삭제(소프트 삭제 예시: deleted_at에 현재시간 기록)
     * DELETE /members/{memberId}
     * 응답: 200 OK (바디 없음) 혹은 삭제 후 최종 상태 응답
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> deleteMember(
            @PathVariable @NotBlank String memberId,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
        log.info("[DELETE] /members/{} | X-Request-Id={}", memberId, requestId);
        memberService.deleteMember(memberId);
        return ResponseEntity.ok().build();
    }
}
