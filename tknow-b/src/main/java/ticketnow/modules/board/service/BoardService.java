package ticketnow.modules.board.service;

import ticketnow.modules.board.dto.*;
import ticketnow.modules.board.dto.inquiry.InquiryCreateRequestDTO;
import ticketnow.modules.board.dto.inquiry.InquiryDetailDTO;
import ticketnow.modules.board.dto.inquiry.InquiryListItemDTO;
import ticketnow.modules.board.dto.inquiry.InquiryUpdateRequestDTO;
import ticketnow.modules.board.dto.reply.ReplyCURequestDTO;
import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;

// 1:1 문의 서비스 인터페이스
public interface BoardService {

    Long createInquiry(InquiryCreateRequestDTO req) throws java.io.IOException;

    PageResponseDTO<InquiryListItemDTO> getMyInquiries(String memberId, PageRequestDTO pageReq);

    InquiryDetailDTO getMyInquiryDetail(Long boardId, String memberId);

    void updateMyInquiry(Long boardId, InquiryUpdateRequestDTO req) throws java.io.IOException;

    PageResponseDTO<InquiryListItemDTO> getAllInquiries(PageRequestDTO pageReq);

    InquiryDetailDTO getAdminInquiryDetail(Long boardId);

    Long createReply(Long boardId, ReplyCURequestDTO req) throws java.io.IOException;
    void updateReply(Long boardId, Long replyId, ReplyCURequestDTO req) throws java.io.IOException;
    void deleteReply(Long boardId, Long replyId);
}
