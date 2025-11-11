package ticketnow.core.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

//전역 공통 예외 처리기

@Slf4j
@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE) // 모듈 전용 @RestControllerAdvice(있다면)보다 낮게 처리
public class GlobalExceptionHandler {

    // === 공통 빌더 ===
    private ApiErrorResponse build(HttpServletRequest req, HttpStatus status, String message) {
        String requestId = req.getHeader("X-Request-Id"); // 프론트 추적용(선택 헤더)
        return ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(req.getRequestURI())
                .method(req.getMethod())
                .requestId(requestId)
                .build();
    }

    // === 400: JSON 파싱/형식 오류 ===
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleBadJson(
            HttpMessageNotReadableException e, HttpServletRequest req) {

        log.warn("[BAD_JSON] {} {} | msg={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"));

        ApiErrorResponse body = build(req, HttpStatus.BAD_REQUEST, "요청 본문(JSON) 형식이 올바르지 않습니다.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // === 400: 파라미터 타입 불일치 (예: Integer 자리에 문자열) ===
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException e, HttpServletRequest req) {

        String field = e.getName();
        log.warn("[TYPE_MISMATCH] {} {} | field={} | msg={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), field, e.getMessage(), req.getHeader("X-Request-Id"));

        ApiErrorResponse body = build(req, HttpStatus.BAD_REQUEST,
                "요청 파라미터 타입이 올바르지 않습니다: " + field);
        body.setDetail(Map.of(
                "parameter", field,
                "requiredType", e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : null,
                "value", Objects.toString(e.getValue(), null)
        ));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // === 400: 필수 파라미터 누락 ===
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingParam(
            MissingServletRequestParameterException e, HttpServletRequest req) {

        log.warn("[MISSING_PARAM] {} {} | name={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), e.getParameterName(), req.getHeader("X-Request-Id"));

        ApiErrorResponse body = build(req, HttpStatus.BAD_REQUEST,
                "필수 파라미터가 누락되었습니다: " + e.getParameterName());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // === 400: @Valid 바인딩/검증 실패 (폼/DTO 검증) ===
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException e, HttpServletRequest req) {

        var errors = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of(
                        "field", fe.getField(),
                        "rejectedValue", Objects.toString(fe.getRejectedValue(), null),
                        "message", fe.getDefaultMessage()))
                .collect(Collectors.toList());

        log.warn("[VALIDATION] {} {} | errors={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), errors.size(), req.getHeader("X-Request-Id"));

        ApiErrorResponse body = build(req, HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다.");
        body.setDetail(errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // === 400: 제약조건 위반(javax.validation.*) ===
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException e, HttpServletRequest req) {

        var errors = e.getConstraintViolations().stream()
                .map(v -> Map.of(
                        "property", v.getPropertyPath() != null ? v.getPropertyPath().toString() : null,
                        "invalidValue", Objects.toString(v.getInvalidValue(), null),
                        "message", v.getMessage()))
                .collect(Collectors.toList());

        log.warn("[CONSTRAINT] {} {} | violations={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), errors.size(), req.getHeader("X-Request-Id"));

        ApiErrorResponse body = build(req, HttpStatus.BAD_REQUEST, "입력값 제약조건을 위반했습니다.");
        body.setDetail(errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // === 400: 명시적 잘못된 요청 (서비스/컨트롤러에서 IllegalArgumentException 던짐) ===
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException e, HttpServletRequest req) {

        log.warn("[BAD_REQUEST] {} {} | msg={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"));

        ApiErrorResponse body = build(req, HttpStatus.BAD_REQUEST, e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // === 404: 도메인 Not Found (주문에서 이미 사용 중인 예외 타입 재사용) ===
    @ExceptionHandler(ticketnow.modules.order.api.error.ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            RuntimeException e, HttpServletRequest req) {

        // 주문 모듈은 전용 핸들러가 있으므로 통상 그쪽에서 처리되지만
        // 다른 패키지에서 동일 예외를 재사용하는 경우를 대비해 전역에서도 커버
        log.info("[NOT_FOUND] {} {} | msg={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"));

        ApiErrorResponse body = build(req, HttpStatus.NOT_FOUND, e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // === 그 외 예기치 못한 500 ===
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleServerError(
            Exception e, HttpServletRequest req) {

        log.error("[SERVER_ERROR] {} {} | msg={} | X-Request-Id={}",
                req.getMethod(), req.getRequestURI(), e.getMessage(), req.getHeader("X-Request-Id"), e);

        ApiErrorResponse body = build(req, HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
