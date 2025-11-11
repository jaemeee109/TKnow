package ticketnow.core.auth.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Setter;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.javassist.compiler.ast.Member;
import org.springframework.security.core.userdetails.User;

// JWT 생성/검증 유틸
// security-context.xml에서 secret(비밀키)와 만료시간을 주입받아 사용

/* createAccessToken() : 로그인시 사용자 정보(ID,ROLE)을 담은 JWT 생성
 * createRefreshToken() : 재로그인용 긴 만료시간의 토큰 생성
 * validate() : 서명 및 만료 검증 (false면 위조 또는 만료)
 * getClaims() : 토큰에서 사용자 정보(클레임) 추출
 * */

public class JwtTokenProvider {

		@Setter private String secret;                 // 서명 비밀키(문자열) XML에서 setter로 주입받음
	    @Setter private long accessTokenValidityMs;    // 액세스 토큰 유효기간(ms) XML에서 주입받음
	    @Setter private long refreshTokenValidityMs;   // 리프레시 토큰 유효기간(ms) XML에서 주입받음

	    private Key signingKey; // 실제 서명에 사용될 Key 객체 (비밀키를 기반으로 생성)

	    @PostConstruct// Bean 생성 후 자동 초기화 (secret->Key 변환)	    
	    			  // 문자열 형태의 secret을  HMAC-SHA 알고리즘용 Key 객체로 변환
	    public void init() {
	        // secret 문자열을 바이트로 변환하고 HMAC-SHA256 서명용 Key 생성
	        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
	    }

	    // [액세스 토큰 생성]: 사용자의 memberId, role을 JWT 내부에 담음
	    // 만료 시간과 서명 정보를 포함해 JWT 문자열로 반환
	    public String createAccessToken(String memberId, String role) {
	        Date now = new Date(); // 현재 시각
	        Date exp = new Date(now.getTime() + accessTokenValidityMs); // 만료 시각 계산
	        
	        // JWT 빌더를 이용해 토큰 생성
	        return Jwts.builder()
	                .setSubject(memberId)                 // 표준 클레임 : 사용자 ID를 'sub'로 저장
	                .addClaims(Map.of("role",  role))  // 커스텀 클레임 : 사용자 역할(role)을 추가
	                .setIssuedAt(now) // 발급시간 (iat)
	                .setExpiration(exp) // 만료 시간 (exp)
	                .signWith(signingKey, SignatureAlgorithm.HS256) // HMAC-SHA256 알고리즘으로 서명
	                .compact(); // JWT 문자열로 변환 및 반환
	    }

	    // [리프레시 토큰 생성]
	    // 주로 재로그인 없이 액세스 토큰을 재발급 하기 위해서 사용
	    // 사용자의 ID만 저장 (역할 등은 포함하지 않음)
	    public String createRefreshToken(String memberId) {
	        Date now = new Date(); // 현재 시각
	        Date exp = new Date(now.getTime() + refreshTokenValidityMs); // 만료 시각 계산
	        
	        // 리프레시 토큰 생성
	        return Jwts.builder()
	                .setSubject(memberId) // 사용자 ID 저장
	                .setIssuedAt(now) // 발급 시간
	                .setExpiration(exp) // 만료 시간
	                .signWith(signingKey, SignatureAlgorithm.HS256) // 동일한 알고리즘으로 서명
	                .compact(); // 문자열로 반환
	    }

	    // [토큰 유효성 검사] (서명 검증/ 만료여부) -> 둘중 하나라도 실패하면 false 반환
	    public boolean validate(String token) {
	        try {
	            Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token);
	            // 서명 키로 파서(parser) 생성 후 토큰을 해석 (서명/만료 모두 검사)
	            return true; // 예외가 없으면 유효한 토큰
	        } catch (JwtException | IllegalArgumentException e) {
	            return false; // 서명 오류, 만료, 포맷 오류 등 발생 시 false
	        }
	    }

	    // [토큰에서 사용자 정보(클레임) 추출]
	    // 토큰 안에 저장 된 memberId, role 등 사용자 정보를 얻을 수 있음
	    // 검증 절차 포함 (서명 확인)
	    public Claims getClaims(String token) {
	        return Jwts.parserBuilder()
	        		.setSigningKey(signingKey) // 동일한 서명 키 설정
	        		.build()
	                .parseClaimsJws(token) // 토큰을 해석하고 검증 수행
	                .getBody(); // 실제 데이터(클레임) 부분 반환)
	        
	    }
	}