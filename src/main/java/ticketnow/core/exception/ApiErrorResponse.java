package ticketnow.core.exception;

import lombok.*;
import java.time.LocalDateTime;


// 공통 에러 응답 포맷
// 프론트(React)에서 상태/원인/추적을 즉시 파악할 수 있도록 표준화

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ApiErrorResponse {
    private LocalDateTime timestamp; // 에러 발생 시각
    private int status;              // HTTP 상태 코드 (예: 400, 404, 500)
    private String error;            // 상태 텍스트 (예: "Bad Request", "Not Found")
    private String message;          // 에러 메시지(요약)
    private String path;             // 요청 경로
    private String method;           // HTTP 메서드
    private String requestId;        // X-Request-Id (프론트-백엔드 로그 추적용)

   
    private String code;             // 도메인 에러 코드(있으면 프론트 분기/번역에 유용)
    private Object detail;           // 검증 오류 목록 등(배열/맵 등 자유 형식)
}
