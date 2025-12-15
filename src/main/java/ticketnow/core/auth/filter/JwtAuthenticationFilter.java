package ticketnow.core.auth.filter;

import io.jsonwebtoken.Claims;

import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import ticketnow.core.auth.util.JwtTokenProvider;
import ticketnow.core.auth.mapper.BlacklistTokenMapper;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;


/* 사용 흐름
 * 요청 헤더의 Authorization: Bearer <JWT> 를 읽음
 * -> jwtTokenProvider.validate()로 서명/만료 검증
 * -> 해시로 블랙리스트 테이블 조회 (차단이면 통과만 시키고 인증은 세팅 안 함)
 * -> 유효하면 memberId의 role을 꺼내 Authentication 생성 
 * -> securityContextHolder에 저장
 * -> 다음 필터로 계속 진행
 * */


@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter { // 매 요청마다 한 번 실행되는 커스텀 필터

    @Setter
    private JwtTokenProvider jwtTokenProvider; 
    // xml에서 setter로 주입
    // 토큰 검증/ 파싱 유틸

    @Setter
    private BlacklistTokenMapper blacklistTokenMapper; 
    // xml에서 setter로 주입
    // 블랙리스트 토큰 조회

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException { // 실제 필터 로직 동작 메서드 (요청마다 호출)

        String header = request.getHeader("Authorization");  // 요청 헤더에서 Authorization 값 추출
        if (header != null && header.startsWith("Bearer ")) { // "Bearer <토큰>" 형태인지 확인
            String accessToken = header.substring(7); // "Bearer " 이후 문자열만 잘라서 실제 JWT 토큰 획득

            // 1) 기본 서명/만료 검증
            if (jwtTokenProvider.validate(accessToken)) { // 서명 유효 & 만료 안됨 -> true

                // 2) 블랙리스트(로그아웃/강제차단) 여부 확인
                String hash = sha256(accessToken); // 토큰 원문 대신 해시로 보관 / 조회 (보안상 안전)
                try {
                    if (blacklistTokenMapper != null && blacklistTokenMapper.existsByHash(hash) > 0) {
                        // 해시가 존재하면 차단 : 블랙리스트면 인증정보 세팅하지 않고 통과(보호 자원 접근 시 401/403 처리) 
                        chain.doFilter(request, response); // 다음 필터로
                        return; // 현재 필터 로직 종료
                    }
                } catch (Exception e) {
                    log.warn("Blacklist check failed: {}", e.getMessage()); // 블랙리스트 조회 실패 시 경고 로그
                }

                // 3) 클레임에서 사용자/권한 추출
                Claims claims = jwtTokenProvider.getClaims(accessToken); // 서명 확인 후 클레임 파싱
                String memberId = claims.getSubject(); // 표준 sub = 사용자 식별자
                String role = claims.get("role", String.class); // 커스텀 클레임인 role 추출

                // Spring Security 권한은 ROLE_ 접두어 사용 ( 컨벤션 )
                GrantedAuthority authz = new SimpleGrantedAuthority("ROLE_" + role); 
                //  ex) ROLE_USER, ROLE_ADMIN, ROLE_WITHDRAW
                Authentication auth = new UsernamePasswordAuthenticationToken(
                		memberId, // 인증된 사용자 아이디 (Principal로 사용)
                		null, // 자격증명 (credentials)은 JWT라 null로 둠
                        Collections.singletonList(authz)); // 단일 권한을 리스트로 전달

                SecurityContextHolder.getContext().setAuthentication(auth);
                // 현재 요청의 시큐리티 컨텍스트에 인증 저장
            }
        }

        chain.doFilter(request, response); // 다음 필터로 요청을 전달
    }

    // 토큰 문자열을 SHA-256 해시(HEX)로 변환 
    private static String sha256(String value) {  // 평문 토큰 대신 해시를 DB에 보관하기 위함
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256"); //  SHA-256 해시 인스턴스 생성
            byte[] d = md.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)); // UTF-8 바이트로 변환 후 해시 계산
            StringBuilder sb = new StringBuilder(); // 바이트 -> 16진수 문자열 변환용 버퍼
            for (byte b : d) { // 각 바이트를 2자리 16진수로 누적
                sb.append(String.format("%02x", b));
            }
            return sb.toString();  // 최종 16진수 해시 문자열 반환
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e); // 이론상 발생하지 않음(표준 알고리즘) -> 런타임 예외로 전환
        }
    }
}
