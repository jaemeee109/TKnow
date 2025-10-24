package ticketnow.modules.board.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ticketnow.modules.board.dto.inquiry.InquiryCreateRequestDTO;
import ticketnow.modules.board.dto.inquiry.InquiryDetailDTO;
import ticketnow.modules.board.dto.inquiry.InquiryListItemDTO;
import ticketnow.modules.board.dto.inquiry.InquiryUpdateRequestDTO;
import ticketnow.modules.board.dto.reply.ReplyCURequestDTO;
import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.board.service.BoardService;

import java.io.IOException;

// 문의 게시판 API
@Slf4j
@RestController
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService; // 서비스 인터페이스 그대로 주입 
    
    private String currentMemberId() { // 현재 로그인한 사용자의 ID (인증된 사용자 호출)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication(); // 인증정보 호출
        return (auth != null) ? String.valueOf(auth.getPrincipal()) : null; // 로그인하지 않았다면 null 반환
    }

    // ======================== 회원용 페이지 ========================
    
    // 문의 등록
    @PreAuthorize("hasAnyRole('USER','ADMIN')") // 로그인한 사용자만 가능
    @PostMapping(value = "/boards/inquiry", consumes = {"multipart/form-data"})
    public ResponseEntity<Long> createInquiry(
            @ModelAttribute InquiryCreateRequestDTO req,
            @RequestParam(value = "categoryType", required = false) String categoryTypeParam,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) throws IOException {
    
    	 // 바인딩 누락 보강 
        if (req.getCategoryType() == null && categoryTypeParam != null) {
            req.setCategoryType(categoryTypeParam);
        }
       req.setMemberId(currentMemberId());
        

        // 디버그 로깅 
	    log.info("[POST] /boards/inquiry | X-Request-Id={} | memberId={} | title={} | categoryType={} | files={}",
	            requestId, req.getMemberId(), req.getTitle(), req.getCategoryType(),
	            (req.getAttachments() != null ? req.getAttachments().size() : 0));

        Long boardId = boardService.createInquiry(req);
        return ResponseEntity.ok(boardId);
    }

    // 내 문의 목록
    @PreAuthorize("hasAnyRole('USER','ADMIN')") // 로그인한 사용자만 가능
    @GetMapping("/boards/my")
    public ResponseEntity<PageResponseDTO<InquiryListItemDTO>> getMyInquiries(
            PageRequestDTO pageReq,       // page,size 자동 바인딩
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
    	 String memberId = currentMemberId();
    	// 디버그 로깅
    	 log.info("[GET] /boards/my | X-Request-Id={} | memberId={} | page={} size={}",
                 requestId, memberId, pageReq.getPage(), pageReq.getSize());
         return ResponseEntity.ok(boardService.getMyInquiries(memberId, pageReq));
    }

    // 내 문의 상세
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/boards/my/{boardId}")
    public ResponseEntity<InquiryDetailDTO> getMyInquiryDetail(
            @PathVariable Long boardId,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
    	 String memberId = currentMemberId();
    	// 디버그 로깅
    	 log.info("[GET] /boards/my/{} | X-Request-Id={} | memberId={}", boardId, requestId, memberId);
         return ResponseEntity.ok(boardService.getMyInquiryDetail(boardId, memberId));
    }

    // 내 문의 수정(답변 등록되면 불가)
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PutMapping(value = "/boards/my/{boardId}", consumes = {"multipart/form-data"})
    public ResponseEntity<Void> updateMyInquiry(
            @PathVariable Long boardId,
            @ModelAttribute InquiryUpdateRequestDTO req,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) throws IOException {
    	
    	 req.setMemberId(currentMemberId());

    	// 디버그 로깅
        log.info("[PUT] /boards/my/{} | X-Request-Id={} | memberId={} | title={} | files(new)={} | files(existing)={}",
                boardId, requestId, req.getMemberId(), req.getTitle(),
                (req.getNewAttachments() != null ? req.getNewAttachments().size() : 0),
                (req.getExistingImages() != null ? req.getExistingImages().size() : 0));
        boardService.updateMyInquiry(boardId, req);
        return ResponseEntity.ok().build();
    }

    // ======================== 관리자용 페이지 ========================
    
    // 전체 목록
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/boards")
    public ResponseEntity<PageResponseDTO<InquiryListItemDTO>> getAllInquiries(
            PageRequestDTO pageReq,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
        log.info("[GET] /admin/boards | X-Request-Id={} | page={} size={}",
                requestId, pageReq.getPage(), pageReq.getSize());
        return ResponseEntity.ok(boardService.getAllInquiries(pageReq));
    }

    // 상세 페이지
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/boards/{boardId}")
    public ResponseEntity<InquiryDetailDTO> getAdminInquiryDetail(
            @PathVariable Long boardId,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
    	// 디버그 로깅
        log.info("[GET] /admin/boards/{} | X-Request-Id={}", boardId, requestId);
        return ResponseEntity.ok(boardService.getAdminInquiryDetail(boardId));
    }

    // 댓글 등록
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/admin/boards/{boardId}/replies", consumes = {"multipart/form-data"})
    public ResponseEntity<Long> createReply(
            @PathVariable Long boardId,
            @ModelAttribute ReplyCURequestDTO req,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) throws IOException {
    	 req.setAdminId(currentMemberId());
    	// 디버그 로깅
        log.info("[POST] /admin/boards/{}/replies | X-Request-Id={} | adminId={} | files(new)={} | files(existing)={}",
                boardId, requestId, req.getAdminId(),
                (req.getNewAttachments() != null ? req.getNewAttachments().size() : 0),
                (req.getExistingImages() != null ? req.getExistingImages().size() : 0));
        Long replyId = boardService.createReply(boardId, req);
        return ResponseEntity.ok(replyId);
    }

    // 댓글 수정
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/admin/boards/{boardId}/replies/{replyId}", consumes = {"multipart/form-data"})
    public ResponseEntity<Void> updateReply(
            @PathVariable Long boardId,
            @PathVariable Long replyId,
            @ModelAttribute ReplyCURequestDTO req,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) throws IOException {
    	req.setAdminId(currentMemberId());
    	// 디버그 로깅
        log.info("[PUT] /admin/boards/{}/replies/{} | X-Request-Id={} | adminId={} | files(new)={} | files(existing)={}",
                boardId, replyId, requestId, req.getAdminId(),
                (req.getNewAttachments() != null ? req.getNewAttachments().size() : 0),
                (req.getExistingImages() != null ? req.getExistingImages().size() : 0));
        boardService.updateReply(boardId, replyId, req);
        return ResponseEntity.ok().build();
    }

    // 댓글 삭제
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/boards/{boardId}/replies/{replyId}")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long boardId,
            @PathVariable Long replyId,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
    	// 디버그 로깅
        log.info("[DELETE] /admin/boards/{}/replies/{} | X-Request-Id={}",
                boardId, replyId, requestId);
        boardService.deleteReply(boardId, replyId);
        return ResponseEntity.ok().build();
    }
}
