package ticketnow.modules.pay.dto.error;

import lombok.*;
import java.time.LocalDateTime;

// 프론트가 오류 원인을 즉시 파악할 수 있도록 공통 에러 응답 포맷

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayErrorResponse {
    private LocalDateTime timestamp; // 에러 발생 시각
    private int status;              // HTTP 상태 코드 (예: 400, 404, 500)
    private String error;            // 상태 텍스트 (예: "Bad Request", "Not Found")
    private String message;          // 에러 메시지
    private String path;             // 요청 경로
    private String method;           // HTTP 메서드
    private String requestId;        // X-Request-Id (프론트-백엔드 로그 추적용)


    // - JSON 파싱 실패(잘못된 형식) → 400
    // - 타입 불일치(문자→숫자 필드 등) → 400
    // - 필수 파라미터 누락 → 400
    // - 리소스 없음(주문ID 미존재) → 404
    // - 서버 내부 예외(NullPointer 등) → 500
    
}
