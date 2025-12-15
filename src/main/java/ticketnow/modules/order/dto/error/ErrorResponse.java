package ticketnow.modules.order.dto.error;

import lombok.*;
import java.time.LocalDateTime;


// 프론트(React)에서 에러 원인을 쉽게 파악하도록 공통 에러 응답 포맷

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ErrorResponse {
    private LocalDateTime timestamp; // 에러 발생 시각
    private int status;              // HTTP 상태 코드 (예: 400, 404, 500)
    private String error;            // 상태 텍스트 (예: "Bad Request", "Not Found")
    private String message;          // 에러 메시지
    private String path;             // 요청 경로
    private String method;           // HTTP 메서드
    private String requestId;        // X-Request-Id (프론트가 넣어주면 로그 매칭 쉬움)
}
