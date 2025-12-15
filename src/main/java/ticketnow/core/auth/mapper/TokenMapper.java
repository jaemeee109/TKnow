package ticketnow.core.auth.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import ticketnow.core.auth.domain.TokenVO;

@Mapper
public interface TokenMapper {

    // 새 리프레시 토큰 저장 
    int insert(TokenVO token);

    // 주어진 리프레시 토큰을 revoke(무효화) 처리 
    int revokeByRefreshToken(@Param("refreshToken") String refreshToken);

    // 아직 만료/무효화되지 않은 리프레시 토큰 존재 여부 
    int existsValidRefresh(@Param("refreshToken") String refreshToken);
}
