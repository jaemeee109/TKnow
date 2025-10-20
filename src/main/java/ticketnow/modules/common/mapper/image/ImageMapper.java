package ticketnow.modules.common.mapper.image;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import ticketnow.modules.common.domain.ImageVO;

import java.util.List;


// 이미지 테이블에 대한 CRUD Mapper (MyBatis)
// 컬럼명은 snake_case, VO 필드는 camelCase (전역 자동매핑)

@Mapper
public interface ImageMapper {

    // 이미지 1건 등록 
    int insertImage(ImageVO vo);

    // 메타데이터만 업데이트
    int updateImageMeta(@Param("imageUuid") String imageUuid,
                        @Param("isPrimary") Boolean isPrimary,
                        @Param("imageSort") Integer imageSort,
                        @Param("imageType") String imageType);

    // PK(UUID)로 삭제 
    int deleteImageByUuid(@Param("imageUuid") String imageUuid);

    // 소유자별 조회
    List<ImageVO> selectImagesByBoard(@Param("boardId") Long boardId);
    List<ImageVO> selectImagesByMember(@Param("memberId") String memberId);
    List<ImageVO> selectImagesByTicket(@Param("ticketId") Long ticketId);
    
    // 댓글 이미지 조회
    List<ImageVO> selectImagesByReply(@Param("replyId") Long replyId);

    // 티켓의 대표 이미지 1건 조회 
    ImageVO selectPrimaryImageByTicket(@Param("ticketId") Long ticketId);
    
}
