package ticketnow.core.auth.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.web.AuthenticationEntryPoint;

import javax.servlet.http.*;
import javax.servlet.ServletException;
import java.io.IOException;
import java.util.Map;

// 미인증(401)일 때 JSON 응답을 내려주는 엔트리 포인트 (진입점)
/* JwtAuthenticationEntryPoint : 미인증(로그인 안함/ 토큰없음/ 무효화) 상태에서 보호 자원 접근시 -> 401 Json 반환
 * 
 * */
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper om = new ObjectMapper(); // JSON 변환기(Object → JSON 문자열)

    @Override
    public void commence(HttpServletRequest req, HttpServletResponse res,
                         org.springframework.security.core.AuthenticationException ex)
            throws IOException, ServletException { // 401 상황 발생 시 호출되는 메서드
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // HTTP 상태코드 401 설정
        res.setContentType("application/json;charset=UTF-8"); // 응답 본문 타입을 JSON + UTF-8로 지정
        om.writeValue(res.getWriter(), Map.of(  // Map을 JSON으로 직렬화하여 응답 본문에 씀
                "status", 401, // 상태코드
                "error", "Unauthorized", // 에러 문자열 (표준 표현)
                "message", "인증이 필요합니다." // 클라이언트 안내 메세지
        ));
    }
}
