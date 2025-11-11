package ticketnow.modules.ticket.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

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
@RequestMapping("/admin/tickets") // 공통 URL prefix
@RequiredArgsConstructor // final 필드 생성자 주입
@Validated // 컨트롤러 레벨 Bean Validation 활성화
@Slf4j // SLF4J 로그 사용
public class TicketAdminController {

	// 비즈니스 로직 계층(트랜잭션/도메인 규칙) 의존
	private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<?> createTicket(
            @Validated @ModelAttribute TicketCreateRequestDTO dto,
            @RequestHeader(value="X-Request-Id", required=false) String requestId) {
        
    	  log.info("[POST] /admin/tickets | X-Request-Id={}", requestId);
    	    log.info("DTO: {}", dto);

    	    try {
    	        //  주입받은 서비스 인스턴스로 호출해야 함
    	        TicketResponseDTO ticketResponse = ticketService.createTicket(dto);

    	        log.info("티켓 생성 완료 - ticketId={}", ticketResponse.getTicketId());

    	        //  DTO 기반으로 응답 반환
    	        return ResponseEntity.ok()
    	                .body(Map.of(
    	                    "success", true,
    	                    "ticketId", ticketResponse.getTicketId(),
    	                    "message", "티켓이 성공적으로 등록되었습니다."
    	                ));
    	    } catch (Exception e) {
    	        log.error("티켓 등록 실패", e);
    	        return ResponseEntity.badRequest()
    	                .body(Map.of(
    	                    "success", false,
    	                    "message", e.getMessage()
    	                ));
        }
    }
}