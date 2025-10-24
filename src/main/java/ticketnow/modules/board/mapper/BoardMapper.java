package ticketnow.modules.board.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import ticketnow.modules.board.domain.BoardVO;
import ticketnow.modules.board.domain.ReplyVO;
import ticketnow.modules.board.dto.inquiry.InquiryListItemDTO;

import java.util.List;

// 1:1 문의용 Mapper
@Mapper
public interface BoardMapper {

    // ===== 글 =====
    int insertBoard(BoardVO vo);
    int updateBoard(BoardVO vo);
    BoardVO selectBoardById(@Param("boardId") Long boardId);
    int countReplies(@Param("boardId") Long boardId);

    List<InquiryListItemDTO> selectMyBoards(@Param("memberId") String memberId,
                                            @Param("offset") int offset,
                                            @Param("limit") int limit);
    long countMyBoards(@Param("memberId") String memberId);

    List<InquiryListItemDTO> selectAllBoards(@Param("offset") int offset,
                                             @Param("limit") int limit);
    long countAllBoards();

    // ===== 댓글 =====
    int insertReply(ReplyVO vo);
    int updateReply(ReplyVO vo);
    int deleteReply(@Param("replyId") Long replyId);
    List<ReplyVO> selectReplies(@Param("boardId") Long boardId);
    ReplyVO selectReplyById(@Param("replyId") Long replyId);
}
