package ticketnow.modules.ticket.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.ticket.dto.*;
import ticketnow.modules.ticket.service.TicketService;

/**
 * 티켓(Ticket) CRUD REST 컨트롤러 - 계층 역할: HTTP 요청 수신 → DTO 바인딩/검증 → Service 위임 → 응답
 * 변환 - 인증/인가: @PreAuthorize 로 ROLE(USER/ADMIN) 보호 - 유효성: @Validated + @Valid 로
 * Bean Validation 적용 - 로깅: 각 엔드포인트 진입/핵심 파라미터 로그 출력(운영 추적/디버깅용)
 */
@RestController // JSON 기반 REST 컨트롤러
@RequestMapping("/tickets") // 공통 URL prefix
@RequiredArgsConstructor // final 필드 생성자 주입
@Validated // 컨트롤러 레벨 Bean Validation 활성화
@Slf4j // SLF4J 로그 사용
public class TicketController {

	// 비즈니스 로직 계층(트랜잭션/도메인 규칙) 의존
	private final TicketService ticketService;

	/**
	 * 티켓 생성 POST /tickets - 입력: TicketCreateRequestDTO (바디 JSON) - 보안: USER/ADMIN
	 * 접근 허용 - 검증: @Valid 로 필수값/형식 점검 → 실패 시 400 Bad Request - 로깅: 제목(title) 중심으로 주요
	 * 입력값 로그
	 */
	@PreAuthorize("hasAnyRole('USER','ADMIN')")
	@PostMapping
	public ResponseEntity<TicketResponseDTO> create(@Valid @RequestBody TicketCreateRequestDTO req) {
		// 운영 추적: 어떤 티켓을 생성하려는지 간략 로그
		log.info("[POST] /tickets | title={}", req.getTitle());
		// 서비스에 위임(트랜잭션 내부에서 insert → select)
		TicketResponseDTO created = ticketService.createTicket(req);
		// 200 OK + 생성된 리소스 본문 반환(여기서는 간단히 OK로 처리; 필요 시 201 Created로 변경 가능)
		return ResponseEntity.ok(created);
	}

	/**
	 * 티켓 단건 조회 GET /tickets/{ticketId} - 입력: PathVariable ticketId - 검증: @NotNull
	 * (null 방지) → 바인딩 실패 시 400 - 예외: 서비스에서 존재하지 않으면 IllegalStateException → 글로벌
	 * 핸들러로 404/400 매핑 권장
	 */
	@PreAuthorize("hasAnyRole('USER','ADMIN')")
	@GetMapping("/{ticketId}")
	public ResponseEntity<TicketResponseDTO> get(@PathVariable @NotNull Long ticketId) {
		// 접근 로그(리소스 키)
		log.info("[GET] /tickets/{}", ticketId);
		// 조회 위임
		TicketResponseDTO dto = ticketService.getTicket(ticketId);
		// 200 OK + DTO
		return ResponseEntity.ok(dto);
	}

	/**
	 * 티켓 목록(페이지네이션) GET /tickets?page=1&size=10 - 입력: PageRequestDTO (page/size
	 * 쿼리스트링 자동 바인딩) - 출력: PageResponseDTO<TicketResponseDTO>
	 * (list/totalCount/page/size) - 정렬/검색 고도화는 PageRequestDTO 확장을 통해 추후 반영 가능
	 */
	@PreAuthorize("hasAnyRole('USER','ADMIN')")
	@GetMapping
	public ResponseEntity<PageResponseDTO<TicketResponseDTO>> list(@Valid PageRequestDTO pageReq) {
		// 페이지 파라미터 진입 로그
		log.info("[GET] /tickets | page={}, size={}", pageReq.getPage(), pageReq.getSize());
		// 서비스 위임(오프셋 계산/조회/카운트/매핑)
		PageResponseDTO<TicketResponseDTO> page = ticketService.getTicketPage(pageReq);
		return ResponseEntity.ok(page);
	}

	/**
	 * 티켓 수정(부분 수정 허용) PUT /tickets/{ticketId} - 입력: PathVariable +
	 * TicketUpdateRequestDTO(바디 JSON) - 정책: DTO의 null 필드는 변경하지 않음(서비스에서 Partial
	 * Update 적용) - 검증: @Valid (필드 제약 조건 위반 시 400)
	 */
	@PreAuthorize("hasAnyRole('USER','ADMIN')")
	@PutMapping("/{ticketId}")
	public ResponseEntity<TicketResponseDTO> update(@PathVariable @NotNull Long ticketId,
			@Valid @RequestBody TicketUpdateRequestDTO req) {
		// 어떤 필드가 들어왔는지 요약 로그(객체 toString)
		log.info("[PUT] /tickets/{} | fields={}", ticketId, req);
		TicketResponseDTO updated = ticketService.updateTicket(ticketId, req);
		return ResponseEntity.ok(updated);
	}

	/**
	 * 티켓 삭제(소프트 삭제) DELETE /tickets/{ticketId} - 정책: 실제 삭제 대신 deleted_at 타임스탬프 갱신 -
	 * 응답: 본문 없이 200 OK(또는 204 No Content 사용 가능)
	 */
	@PreAuthorize("hasAnyRole('USER','ADMIN')")
	@DeleteMapping("/{ticketId}")
	public ResponseEntity<Void> delete(@PathVariable @NotNull Long ticketId) {
		// 키 기반 삭제 요청 로깅
		log.info("[DELETE] /tickets/{}", ticketId);
		ticketService.deleteTicket(ticketId);
		return ResponseEntity.ok().build();
	}
}
