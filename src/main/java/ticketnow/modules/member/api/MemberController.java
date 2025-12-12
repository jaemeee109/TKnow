package ticketnow.modules.member.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import ticketnow.modules.member.dto.MemberCreateRequestDTO;
import ticketnow.modules.member.dto.MemberUpdateRequestDTO;
import ticketnow.modules.member.dto.MemberResponseDTO;
import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.member.service.MemberService;

//★ 이미지 관련 import
import ticketnow.modules.common.constant.ImageType;
import ticketnow.modules.common.domain.ImageVO;
import ticketnow.modules.common.dto.image.ImageDTO;
import ticketnow.modules.common.dto.image.ImageListDTO;
import ticketnow.modules.common.dto.image.NewImageDTO;
import ticketnow.modules.common.service.image.FileService;
import java.util.HashMap;
import java.util.Map;


import ticketnow.modules.member.dto.AdminMemberStatsDTO;

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
    
    // ★ 추가: 이미지 처리 서비스
    private final FileService fileService;

    /**
     * 회원 생성(등록)
     * POST /members
     * 요청 바디: MemberCreateRequestDTO(JSON)
     * 응답 바디: 생성된 회원 정보(MemberResponseDTO)
     */
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
    
    /**
     * 회원 프로필 이미지 업로드/교체
     * POST /members/{memberId}/profile-image
     * - Multipart/form-data, field name = "file"
     * - FileService.upsertImages() 재사용 (ImageType.MEMBER_PROFILE)
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping(
            value = "/{memberId}/profile-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<List<ImageDTO>> uploadProfileImage(
            @PathVariable @NotBlank String memberId,
            @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) throws IOException {

        log.info("[POST] /members/{}/profile-image | X-Request-Id={} | filename={}",
                memberId, requestId, file != null ? file.getOriginalFilename() : null);

        // 1) FileService가 요구하는 ImageListDTO 구성
        ImageListDTO req = ImageListDTO.builder()
                .memberId(memberId)  // 어떤 회원의 이미지인지 지정
                .newImages(Collections.singletonList(
                        NewImageDTO.builder()
                                .file(file)
                                .isPrimary(true)                    // 대표 이미지
                                .imageSort(1)                       // 정렬순서 1
                                .imageType(ImageType.MEMBER_PROFILE.name()) // enum 문자열
                                .build()
                ))
                .build();

        // 2) 공통 FileService로 업로드 + DB 등록
        List<ImageVO> images = fileService.upsertImages(req);
        log.info("[MemberController] uploadProfileImage after upsert size={}",
                images != null ? images.size() : 0);

        List<ImageDTO> resp;

        if (images == null || images.isEmpty()) {
            // 정말 아무 것도 없으면 기존대로 빈 배열 반환
            resp = List.of();
        } else {
            // 1차: MEMBER_PROFILE + 대표 이미지만 필터
            resp = images.stream()
                    .filter(vo -> vo.getImageType() == ImageType.MEMBER_PROFILE
                            && Boolean.TRUE.equals(vo.getIsPrimary()))
                    .map(vo -> ImageDTO.builder()
                            .imageUrl(vo.getImgUrl())
                            .isPrimary(vo.getIsPrimary())
                            .imageSort(vo.getImageSort())
                            .imageType(vo.getImageType() != null ? vo.getImageType().name() : null)
                            .build())
                    .collect(Collectors.toList());

            // 2차: 필터 결과가 비어 있으면, 가장 마지막 이미지를 강제로 '대표 프로필'로 만들어 응답
            if (resp.isEmpty()) {
                ImageVO last = images.get(images.size() - 1);

                ImageDTO dto = ImageDTO.builder()
                        .imageUrl(last.getImgUrl())
                        .isPrimary(true)
                        .imageSort(
                                last.getImageSort() != null
                                        ? last.getImageSort()
                                        : 1
                        )
                        .imageType(ImageType.MEMBER_PROFILE.name())
                        .build();

                resp = List.of(dto);
            }
        }

        return ResponseEntity.ok(resp);
    }
    
 // [GET] /members/admin/{memberId}/tickets/refunds
 // - 관리자용: 특정 회원의 취소/환불 요약 정보 (현재는 기본값 0으로 응답)
 @PreAuthorize("hasRole('ADMIN')")
 @GetMapping("/admin/{memberId}/tickets/refunds")
 public ResponseEntity<Map<String, Object>> getMemberTicketsRefundSummary(
         @PathVariable("memberId") String memberId
 ) {
     Map<String, Object> body = new HashMap<>();

     // 기본 정보 (현재 UI에서 이 값들을 사용하진 않음)
     body.put("memberId", memberId);
     body.put("refundedOrdersCount", 0);   // 환불 완료 주문 개수
     body.put("refundedTotalAmount", 0);   // 환불 완료 금액 합계

     // 필요 시 나중에 취소 요청 건수/금액 등을 여기 추가 가능
     return ResponseEntity.ok(body);
 }

 // 관리자용 회원 통계 

 @GetMapping("/admin/dashboard-stats")
 @PreAuthorize("hasRole('ADMIN')")
 public ResponseEntity<AdminMemberStatsDTO> getAdminDashboardStatsForLastMonth() {

     AdminMemberStatsDTO stats = memberService.getAdminMemberStatsForLastMonth();
     return ResponseEntity.ok(stats);
 }

}

