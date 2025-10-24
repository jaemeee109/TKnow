package ticketnow.core.auth.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import ticketnow.core.auth.dto.LoginRequest;
import ticketnow.core.auth.dto.TokenResponse;
import ticketnow.core.auth.util.JwtTokenProvider;
import ticketnow.core.auth.mapper.TokenMapper;
import ticketnow.core.auth.mapper.BlacklistTokenMapper;
import ticketnow.core.auth.domain.TokenVO;
import ticketnow.core.auth.domain.BlacklistTokenVO;
import ticketnow.modules.member.constant.MemberRole;
import ticketnow.modules.member.domain.MemberVO;

import javax.sql.DataSource;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;

// 인증(로그인/리프레시/로그아웃) API
// JDBC로 멤버 조회 부분은 그대로 두되
// refresh 토큰은 token 테이블에 저장/검증
// logout 시 access 토큰은 blacklist_token 테이블에 해시로 저장

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final DataSource dataSource; // DB 연결 풀
    private final JwtTokenProvider jwtTokenProvider; // JWT 생성/검증 도구
    private final TokenMapper tokenMapper; // refresh 토큰 저장/검증 매퍼
    private final BlacklistTokenMapper blacklistTokenMapper; // access 블랙리스트 매퍼

    // 로그인: 아이디/비밀번호 검증 -> 탈퇴 계정 차단 -> 토큰 발급 + refresh 저장
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) { // JSON body로 memberId/password 수신
       
    	// ========= 디버그 로그 =========
    	 final String reqMemberId = req.getMemberId(); // 요청한 회원 아이디(로그에 사용)
         log.info("[AUTH][LOGIN] 시작 memberId={}", reqMemberId); // 주요 단계 INFO 로그
         log.debug("[AUTH][LOGIN] raw request = {}", req); // 디버그: 요청 DTO (비번 필드 포함됨 주의!)
      // ========= 디버그 로그 종료 =========
         
    	JdbcTemplate jdbc = new JdbcTemplate(dataSource); // 쿼리 수행 객체 생성
        Map<String, Object> row = jdbc.queryForMap( // 단일 행 조회 (없으면 예외 발생)
                "SELECT member_id, member_pw, member_role FROM member WHERE member_id=?",
                req.getMemberId()
        );
       // 디버그: DB 조회 
        log.debug("[AUTH][LOGIN] DB row loaded for memberId={}", reqMemberId); 

        String dbPw = (row.get("member_pw") != null) ? row.get("member_pw").toString() : ""; // DB 비번(필수)
        dbPw = dbPw.startsWith("{noop}") ? dbPw.substring(6) : dbPw; // {noop} 제거(plain 저장 관례)
        if (!dbPw.equals(req.getPassword())) {  // 비밀번호 일치 검사(샘플: 평문 비교)
        	
        	// 경고 로그
        	 log.warn("[AUTH][LOGIN] 비밀번호 불일치 memberId={}", reqMemberId); 
        	 
            return ResponseEntity.status(401).body(Map.of( // 401 반환
                    "status", 401, "error", "Unauthorized", "message", "아이디 또는 비밀번호가 올바르지 않습니다."
            ));
        }
        
      // 디버그 로그 : 패스
        log.debug("[AUTH][LOGIN] 비밀번호 일치 memberId={}", reqMemberId); 
        
        

        String memberId = row.get("member_id").toString(); // 최종 인증된 memberId
        String role = (row.get("member_role") != null) ? row.get("member_role").toString() : "USER"; // 기본 USER
       
        // 디버그 로그
        log.debug("[AUTH][LOGIN] role resolve memberId={} role={}", memberId, role);
        
        // 탈퇴 회원은 로그인 차단 (403)
        if (MemberRole.WITHDRAWN.name().equals(role)) {
        	log.info("[AUTH][LOGIN] WITHDRAWN 차단 memberId={}", memberId); // 정보 로그
            return ResponseEntity.status(403).body(Map.of(
                    "status", 403, "error", "Forbidden", "message", "탈퇴한 회원은 로그인할 수 없습니다."
            ));
        }
        
        // Access/Refresh 발급(민감정보: 원문은 절대 로그 금지)
        String access = jwtTokenProvider.createAccessToken(memberId, role);  // 액세스 토큰
        String refresh = jwtTokenProvider.createRefreshToken(memberId); // 리프레시 토큰
        log.info("[AUTH][LOGIN] 토큰 발급 완료 memberId={}", memberId); // 정보 로그
        

        // refresh 토큰 만료일 = JWT exp 사용
        Date refreshExp = jwtTokenProvider.getClaims(refresh).getExpiration(); // exp 파싱
        LocalDateTime expiresAt = LocalDateTime.ofInstant(refreshExp.toInstant(), ZoneId.systemDefault()); // LDT 변환
        // 디버그 로그
        log.debug("[AUTH][LOGIN] refresh exp(local) memberId={} exp={}", memberId, expiresAt); 
       
        // token 테이블 저장
        TokenVO token = TokenVO.builder()
                .member(MemberVO.builder().memberId(memberId).build()) // // FK: member_id
                .refreshToken(refresh) //  원문 저장
                .expiresAt(expiresAt)  // 만료 시각
                .build();
        tokenMapper.insert(token);  // INSERT 수행

        // 응답 액세스/리프레시
        log.debug("[AUTH][LOGIN] 종료 OK memberId={}", memberId); // 디버그 로그
        return ResponseEntity.ok(new TokenResponse(access, refresh)); // 200OK
    }

    // 리프레시 토큰으로 액세스 재발급
    // 헤더 Authorization : Bearer <refresh>
    // JWT 유효 + DB유효 (만료 / 철회 미해당) 모두 통과해야 재발급
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestHeader("Authorization") String bearer) { // 헤더로 refresh 수신
    
    	log.info("[AUTH][REFRESH] 시작"); // 정보 로그
        log.debug("[AUTH][REFRESH] Authorization header exists = {}", bearer != null); // 디버그 로그

    	
    	if (bearer == null || !bearer.startsWith("Bearer ")) { // 헤더 형식 확인
    		 log.warn("[AUTH][REFRESH] 잘못된 Authorization 헤더"); // 경고 로그
            return ResponseEntity.status(401).body(Map.of("status", 401, "error", "Unauthorized"));
        }
        String refresh = bearer.substring(7); // Bearer 제거 후 원문 추출
        log.debug("[AUTH][REFRESH] refresh 수신(masked)={}", mask(refresh)); // 디버그(마스킹)
        
        if (!jwtTokenProvider.validate(refresh)) { // JWT 검증
        	 log.warn("[AUTH][LOGOUT] access JWT 검증 실패"); // 경고 로그
            return ResponseEntity.status(401).body(Map.of("status", 401, "error", "Unauthorized"));
        }

        // DB에 아직 유효한 리프레시가 존재해야 함
        if (tokenMapper.existsValidRefresh(refresh) <= 0) { // 0이하 -> 없음/만료/철회
        	 log.warn("[AUTH][REFRESH] DB 유효성 실패(존재하지 않음 또는 만료/철회)"); // 경고 로그
            return ResponseEntity.status(401).body(Map.of("status", 401, "error", "Unauthorized"));
        }

        String memberId = jwtTokenProvider.getClaims(refresh).getSubject(); // sub=memberId
        log.debug("[AUTH][REFRESH] memberId={}", memberId); // 디버그 로그

        // 최신 role 재조회(탈퇴 등 상태 변경 반영)
        JdbcTemplate jdbc = new JdbcTemplate(dataSource); // JDBC 유틸 생성
        String role = jdbc.queryForObject( // 단일 값 조회
                "SELECT COALESCE(member_role, 'USER') FROM member WHERE member_id=?",
                String.class, memberId);
        log.debug("[AUTH][REFRESH] role reloaded memberId={} role={}", memberId, role); // 디버그 로그

        // 탈퇴 회원은 재발급 차단
        if (MemberRole.WITHDRAWN.name().equals(role)) { // 탈퇴자는 재발급 차단
        	log.info("[AUTH][REFRESH] WITHDRAWN 차단 memberId={}", memberId); // 정보 로그
            return ResponseEntity.status(403).body(Map.of(
                    "status", 403, "error", "Forbidden", "message", "탈퇴한 회원은 이용할 수 없습니다."
            ));
        }

        String newAccess = jwtTokenProvider.createAccessToken(memberId, role); // 새 access 발급
        log.info("[AUTH][REFRESH] 재발급 성공 memberId={}", memberId); // 정보 로그
        return ResponseEntity.ok(Map.of("accessToken", newAccess, "tokenType", "Bearer")); // 200 OK
    }

   // 로그아웃: 액세스 해시 블랙리스트 저장 +  리프레시 철회
   // 헤더 Authorization: Bearer <access>
   //  헤더 X-Refresh-Token: Bearer <refresh> (있으면 revoke)
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader("Authorization") String bearer, // access 토큰 위치
            @RequestHeader(value = "X-Refresh-Token", required = false) String refreshHeader) { // 선택적 refresh

    	// ===== 디버그 로그 ===== 
    	log.info("[AUTH][LOGOUT] 시작"); // 정보 로그
        log.debug("[AUTH][LOGOUT] Authorization exists={}, X-Refresh-Token exists={}",
                bearer != null, refreshHeader != null); // 디버그
        // ===== 디버그 로그 종료 ===== 
        
        if (bearer == null || !bearer.startsWith("Bearer ")) { // access 헤더체크
        	log.warn("[AUTH][LOGOUT] 잘못된 Authorization 헤더"); // 경고 로그
            return ResponseEntity.badRequest().body(Map.of("status", 400, "error", "Bad Request"));
        }
        String access = bearer.substring(7); // access 추출
        log.debug("[AUTH][LOGOUT] access(masked)={}", mask(access)); // 디버그(마스킹)
        
        if (!jwtTokenProvider.validate(access)) { // JWT 검증
        	 log.warn("[AUTH][LOGOUT] access JWT 검증 실패"); // 경고 로그
            return ResponseEntity.status(401).body(Map.of("status", 401, "error", "Unauthorized"));
        }

        // access 해시 -> 블랙리스트 저장
        Date exp = jwtTokenProvider.getClaims(access).getExpiration(); // exp 추출
        LocalDateTime expiresAt = LocalDateTime.ofInstant(exp.toInstant(), ZoneId.systemDefault()); // LDT 변환
        String hash = sha256(access); // 해시 계산
        
        // 디버그 로그	: 앞 8글자만
        log.debug("[AUTH][LOGOUT] access hash(prefix8)={}", hash.substring(0, 8)); 
        
        blacklistTokenMapper.insert(BlacklistTokenVO.builder() // INSERT
                .accessTokenHash(hash) // 원문 대신 해시 저장
                .expiresAt(expiresAt) // 만료 시각 (자동 삭제 스케줄에 활용)
                .build()); 

        log.info("[AUTH][LOGOUT] 블랙리스트 등록 완료 exp={}", expiresAt); // 정보 로그
        
        // 리프레시가 헤더로 전달되면 revoke 처리
        if (refreshHeader != null && refreshHeader.startsWith("Bearer ")) {
            String refresh = refreshHeader.substring(7); // refresh 추출
            log.debug("[AUTH][LOGOUT] refresh revoke 시도(masked)={}", mask(refresh)); // 디버그 로그
            try {
                tokenMapper.revokeByRefreshToken(refresh); // 철회 (구현은 mapper에 따름)
                log.info("[AUTH][LOGOUT] refresh revoke 완료"); // 정보 로그
            } catch (Exception ignore) {
            	log.warn("[AUTH][LOGOUT] refresh revoke 실패(무시): {}", ignore.getMessage()); // 경고 로그
            }
            
        }
        log.debug("[AUTH][LOGOUT] 종료 OK"); // 디버그 로그
        return ResponseEntity.ok(Map.of("result", "OK"));
    }

    // 토큰 문자열을 SHA-256 해시(HEX)로 변환 
    // 블랙리스트 / 로그 등에서 원문 저장을 피하기 위함 (보안)
    private static String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256"); // 표준 해시 인스턴스
            byte[] d = md.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)); // UTF-8 바이트 → 해시
            StringBuilder sb = new StringBuilder(); // 바이트 → HEX 변환 버퍼
            for (byte b : d) sb.append(String.format("%02x", b)); // 2자리 16진수로 변환하여 누적
            return sb.toString(); // 최종 해시 문자열
        } catch (Exception e) {
            throw new IllegalStateException(e); // 런타임 예외로 변환
        }
    }
    
    // =============== 디버그용 메서드 ===============
    // 민감 문자열 마스킹 (앞 4~8글자만 노출)
    // 로그에서 토큰/해시가 노출되지 않도록 보호
    private static String mask(String s) {
        if (s == null) return "null";
        int keep = Math.min(8, Math.max(4, s.length() / 8)); // 문자열 길이에 따른 보존 길이
        String head = s.substring(0, keep);
        return head + "*****(" + s.length() + ")";
    }
    
    
}
