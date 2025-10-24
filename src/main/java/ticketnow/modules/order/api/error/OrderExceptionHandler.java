package ticketnow.modules.order.api.error;

import lombok.extern.slf4j.Slf4j;
import ticketnow.modules.order.dto.error.ErrorResponse;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

// Order 모듈 공통 예외 처리
//  모든 Controller에서 발생한 예외를 JSON으로 포맷팅
//  로그에 핵심 컨텍스트(경로, 파라미터, 요청헤더 일부) 남김
@Slf4j
@RestControllerAdvice(basePackages = "ticketnow.modules.order")
public class OrderExceptionHandler {
	  private ErrorResponse build(HttpServletRequest req, HttpStatus status, String message) {
	        String requestId = req.getHeader("X-Request-Id"); // 프론트가 세팅하면 로그 추적 쉬움
	        return ErrorResponse.builder()
	                .timestamp(LocalDateTime.now())
	                .status(status.value())
	                .error(status.getReasonPhrase())
	                .message(message)
	                .path(req.getRequestURI())
	                .method(req.getMethod())
	                .requestId(requestId)
	                .build();
	    }

	    // 잘못된 요청(검증 실패 등)
	    @ExceptionHandler(IllegalArgumentException.class)
	    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException e, HttpServletRequest req) {
	        log.warn("[BAD_REQUEST] {} {} | msg={} | X-Request-Id={}",
	                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"));
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                .body(build(req, HttpStatus.BAD_REQUEST, e.getMessage()));
	    }

	    // 찾을 수 없음(주문ID 없음 등)
	    @ExceptionHandler(ResourceNotFoundException.class)
	    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException e, HttpServletRequest req) {
	        log.info("[NOT_FOUND] {} {} | msg={} | X-Request-Id={}",
	                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"));
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(build(req, HttpStatus.NOT_FOUND, e.getMessage()));
	    }

	    // 그 외 예기치 못한 오류
	    @ExceptionHandler(Exception.class)
	    public ResponseEntity<ErrorResponse> handleServerError(Exception e, HttpServletRequest req) {
	        log.error("[SERVER_ERROR] {} {} | msg={} | X-Request-Id={}",
	                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"), e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(build(req, HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."));
	    }
}
