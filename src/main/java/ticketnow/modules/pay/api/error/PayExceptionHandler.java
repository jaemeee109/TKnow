package ticketnow.modules.pay.api.error;

import lombok.extern.slf4j.Slf4j;
import ticketnow.modules.pay.dto.error.PayErrorResponse;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

// Pay 모듈 공통 예외 처리기
//  프론트가 디버깅하기 쉬운 JSON 포맷으로 에러 응답
@Slf4j
@RestControllerAdvice(basePackages = "ticketnow.modules.pay")
public class PayExceptionHandler {

    private PayErrorResponse build(HttpServletRequest req, HttpStatus status, String message) {
        String requestId = req.getHeader("X-Request-Id"); // 프론트/백엔드 로그 상호추적용
        return PayErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(req.getRequestURI())
                .method(req.getMethod())
                .requestId(requestId)
                .build();
    }

    // 400: JSON 파싱 실패, 바디 누락/잘못된 형식
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<PayErrorResponse> handleBadJson(HttpMessageNotReadableException e, HttpServletRequest req) {
        log.warn("[PAY][BAD_JSON] {} {} | msg={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(build(req, HttpStatus.BAD_REQUEST, "요청 본문(JSON) 형식이 올바르지 않습니다."));
    }

    // 400: 타입 불일치(예: amount 자리에 문자열 전송)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<PayErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException e, HttpServletRequest req) {
        String field = e.getName();
        log.warn("[PAY][TYPE_MISMATCH] {} {} | field={} | msg={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), field, e.getMessage(), req.getHeader("X-Request-Id"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(build(req, HttpStatus.BAD_REQUEST, "요청 파라미터 타입이 올바르지 않습니다: " + field));
    }

    // 400: 명시적 검증 실패 (서비스/컨트롤러에서 IllegalArgumentException 던진 경우)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<PayErrorResponse> handleBadRequest(IllegalArgumentException e, HttpServletRequest req) {
        log.warn("[PAY][BAD_REQUEST] {} {} | msg={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(build(req, HttpStatus.BAD_REQUEST, e.getMessage()));
    }

    // 404: 결제대상 주문/레코드 없음 (필요 시 커스텀 NotFound 예외를 Pay 모듈에서도 사용)
    @ExceptionHandler({org.springframework.web.server.ResponseStatusException.class})
    public ResponseEntity<PayErrorResponse> handleStatusException(org.springframework.web.server.ResponseStatusException e, HttpServletRequest req) {
        HttpStatus status = e.getStatus();
        log.info("[PAY][{}] {} {} | msg={} | X-Request-Id={}",
                status, req.getMethod(), req.getRequestURI(), e.getReason(), req.getHeader("X-Request-Id"));
        return ResponseEntity.status(status)
                .body(build(req, status, e.getReason()));
    }

    // 500: 그 외 예기치 못한 오류
    @ExceptionHandler(Exception.class)
    public ResponseEntity<PayErrorResponse> handleServerError(Exception e, HttpServletRequest req) {
        log.error("[PAY][SERVER_ERROR] {} {} | msg={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(build(req, HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."));
    }
}
