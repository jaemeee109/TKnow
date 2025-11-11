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
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Setter
    private JwtTokenProvider jwtTokenProvider;

    @Setter
    private BlacklistTokenMapper blacklistTokenMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

    	  String requestURI = request.getRequestURI();
    	    String method = request.getMethod();
    	    
    	    log.info("🔍 JWT Filter - Method: {}, URI: {}", method, requestURI);
    	    
        // OPTIONS는 바로 통과
    	    if ("OPTIONS".equalsIgnoreCase(method)) {
                log.info("OPTIONS request detected - Adding CORS headers and bypassing");
                
                // CORS 헤더 추가
                response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
                response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-Id");
                response.setHeader("Access-Control-Allow-Credentials", "true");
                response.setHeader("Access-Control-Max-Age", "3600");
                response.setStatus(HttpServletResponse.SC_OK);
                
                // ⭐ 필터 체인을 호출하지 않고 즉시 종료!
                return;
            }

        String token = resolveToken(request);
        log.info("🎫 Token present: {}", token != null);

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            log.debug("No Bearer token for {} {}", request.getMethod(), request.getRequestURI());
            chain.doFilter(request, response);
            return;
        }

        String accessToken = header.substring(7);

        // 1) JWT 서명/만료 검증
        if (!jwtTokenProvider.validate(accessToken)) {
            log.warn("Invalid or expired JWT");
            chain.doFilter(request, response);
            return;
        }

        // 2) 블랙리스트 체크
        String hash = sha256(accessToken);
        try {
            if (blacklistTokenMapper != null && blacklistTokenMapper.existsByHash(hash) > 0) {
                log.warn("JWT is blacklisted");
                chain.doFilter(request, response);
                return;
            }
        } catch (Exception e) {
            log.warn("Blacklist check failed: {}", e.getMessage());
        }

        // 3) Claims 파싱
        Claims claims = jwtTokenProvider.getClaims(accessToken);
        String memberId = claims.getSubject();
        
        if (memberId == null || memberId.trim().isEmpty()) {
            log.warn("JWT subject is empty");
            chain.doFilter(request, response);
            return;
        }

        // 4) roles 또는 role 클레임 읽기
        List<String> roles = new ArrayList<>();
        
        // "roles" 배열로 시도
        Object rolesObj = claims.get("roles");
        
        if (rolesObj instanceof String s) {
            roles = (List<String>) rolesObj;
        } 
        // "role" 단일 문자열로 시도
        else {
            Object roleObj = claims.get("role");
            if (roleObj instanceof String) {
                roles.add((String) roleObj);
            }
        }

        // 기본 역할 보장
        if (roles.isEmpty()) {
            log.warn("JWT has no roles - using default USER");
            roles.add("USER");
        }

        // 5) GrantedAuthority 변환 (ROLE_ 접두사 보장)
        List<GrantedAuthority> authorities = roles.stream()
                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        // 6) Authentication 생성 및 저장
        Authentication auth = new UsernamePasswordAuthenticationToken(memberId, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
        
        log.info("JWT 인증 성공: memberId={}, roles={}", memberId, roles);

        // 7) 다음 필터로 (한 번만!)
        chain.doFilter(request, response);
    }

    private static String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : d) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
    
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " 제거
        }
        return null;
    }
}