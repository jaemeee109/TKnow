package ticketnow.core.auth.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import javax.servlet.http.*;
import java.io.IOException;
import java.util.Map;

// 권한부족(403)일 때 JSON 응답을 내려주는 핸들러
// JwtAccessDenieHandler : 인증은 되었지만 권한(role)이 부족할 때 동작 -> 403 JSON 반환
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper om = new ObjectMapper(); // JSON 변환기(Object -> JSON 문자열)

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse res,
                       AccessDeniedException ex) throws IOException { // 403 상황 발생 시 호출되는 메서드
        res.setStatus(HttpServletResponse.SC_FORBIDDEN); // HTTP 상태코드 403 설정
        res.setContentType("application/json;charset=UTF-8"); // 응답 본문 타입을 JSON + UTF-8로 지정
        om.writeValue(res.getWriter(), Map.of( // Map을 JSON으로 직렬화하여 응답 본문에 씀
                "status", 403, // 상태코드
                "error", "Forbidden", // 에러 문자열 (표준 표현)
                "message", "접근 권한이 없습니다." // 클라이언트가 이해하기 쉬운 안내 메세지
        ));
    }
}
