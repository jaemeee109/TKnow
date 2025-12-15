package ticketnow.core.auth.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import ticketnow.core.auth.domain.BlacklistTokenVO;

@Mapper
public interface BlacklistTokenMapper {

    // 액세스 토큰 해시 저장(로그아웃/강제차단) 
    int insert(BlacklistTokenVO vo);

    // 블랙리스트에 같은 해시가 존재하는지 여부 
    int existsByHash(@Param("accessTokenHash") String accessTokenHash);
}
