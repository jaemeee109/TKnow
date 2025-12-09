package ticketnow.modules.board.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ticketnow.modules.board.constant.CategoryType;
import ticketnow.modules.board.domain.BoardVO;
import ticketnow.modules.board.domain.ReplyVO;
import ticketnow.modules.board.dto.inquiry.InquiryCreateRequestDTO;
import ticketnow.modules.board.dto.inquiry.InquiryDetailDTO;
import ticketnow.modules.board.dto.inquiry.InquiryListItemDTO;
import ticketnow.modules.board.dto.inquiry.InquiryUpdateRequestDTO;
import ticketnow.modules.board.dto.reply.ReplyCURequestDTO;
import ticketnow.modules.board.dto.reply.ReplyItemDTO;
import ticketnow.modules.board.mapper.BoardMapper;

import ticketnow.modules.common.dto.image.ExistingImageDTO;
import ticketnow.modules.common.dto.image.ImageDTO;
import ticketnow.modules.common.dto.image.ImageListDTO;
import ticketnow.modules.common.dto.image.NewImageDTO;
import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.common.domain.ImageVO;
import ticketnow.modules.common.mapper.image.ImageMapper;
import ticketnow.modules.common.service.image.FileService;

import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.member.mapper.MemberMapper;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

// 1:1 문의(Board) 서비스 구현체
// 회원 글 수정은 "댓글이 하나라도 있으면" 불가

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardMapper boardMapper;      // 게시글/댓글용 매퍼 
    private final ImageMapper imageMapper;      // 이미지 조회용 매퍼    
    private final FileService fileService;      // 업로드/메타 수정/삭제 서비스 
    private final MemberMapper memberMapper;	 // 회원 정보 조회용 매퍼
    // ====== 유틸: MultipartFile -> NewImageDTO 변환 (BOARD_IMAGE 기본) ======
    private List<NewImageDTO> toNewImageDTOs(List<org.springframework.web.multipart.MultipartFile> files) {
        if (files == null) return null;
        List<NewImageDTO> out = new ArrayList<>();
        int sort = 1;
        for (var f : files) {
            if (f == null || f.isEmpty()) continue;
            out.add(NewImageDTO.builder()
                    .file(f)
                    .isPrimary(sort == 1)      // 첫 번째 이미지를 대표로
                    .imageSort(sort++)
                    .imageType("BOARD_IMAGE") 
                    .build());
        }
        return out;
    }

    // ====== 유틸: ImageVO -> ImageDTO 변환 ======
    private List<ImageDTO> toImageDTOs(List<ImageVO> list) {
        if (list == null) return List.of();
        return list.stream().map(vo -> ImageDTO.builder()
                        .imageUrl(vo.getImgUrl())
                        .isPrimary(vo.getIsPrimary())
                        .imageSort(vo.getImageSort())
                        .imageType(vo.getImageType() != null ? vo.getImageType().name() : null)
                        .build())
                .collect(Collectors.toList());
    }

    // ====== 유틸: ReplyVO -> ReplyItemDTO 변환(+이미지 조회) ======
    private ReplyItemDTO toReplyItemDTO(ReplyVO vo) {
        List<ImageVO> imgs = imageMapper.selectImagesByReply(vo.getReplyId()); // 댓글 이미지 조회
        return ReplyItemDTO.builder()
                .replyId(vo.getReplyId())
                .memberId(vo.getMember() != null ? vo.getMember().getMemberId() : null)
                .content(vo.getReplyContent())
                .createdAt(vo.getCreatedAt())
                .updatedAt(vo.getUpdatedAt())
                .attachments(toImageDTOs(imgs))
                .build();
    }

    // ===== 글 생성 =====
    @Transactional
    @Override
    public Long createInquiry(InquiryCreateRequestDTO req) throws IOException {
        // 디버그 로깅
        log.info("[SERVICE] createInquiry | memberId={} | title={} | categoryType={} | files={}",
                req.getMemberId(), req.getTitle(), req.getCategoryType(),
                (req.getAttachments() != null ? req.getAttachments().size() : 0));

       
     // categoryType 유효성 검사 + 변환
        String rawCt = req.getCategoryType();
        if (rawCt == null || rawCt.isBlank()) {
            throw new IllegalArgumentException("categoryType is required");
        }
        CategoryType ct;
        try {
            ct = CategoryType.valueOf(rawCt.trim());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("invalid categoryType: " + rawCt);
        }

        BoardVO vo = BoardVO.builder()
                .member(MemberVO.builder().memberId(req.getMemberId()).build())
                .boardTitle(req.getTitle())
                .boardContent(req.getContent())
                .categoryType(ct)
                .build();                                                

        // INSERT
        int inserted = boardMapper.insertBoard(vo);
        if (inserted <= 0 || vo.getBoardId() == null) {
            throw new IllegalStateException("게시글 생성에 실패했습니다.");
        }

        // 이미지 업로드
        if (req.getAttachments() != null && !req.getAttachments().isEmpty()) {
            ImageListDTO imgReq = ImageListDTO.builder()
                    .boardId(vo.getBoardId())
                    .newImages(toNewImageDTOs(req.getAttachments()))
                    .build();                                            
            fileService.upsertImages(imgReq); // 파일 저장 + DB 삽입
        }

      
        return vo.getBoardId();
    }

    // ===== 내 문의 목록 =====
    @Override
    public PageResponseDTO<InquiryListItemDTO> getMyInquiries(String memberId, PageRequestDTO pageReq) {
    	// 디버그 로깅
        log.info("[SERVICE] getMyInquiries | memberId={} | page={} size={}",
                memberId, pageReq.getPage(), pageReq.getSize());

        List<InquiryListItemDTO> list = boardMapper.selectMyBoards(memberId, pageReq.getOffset(), pageReq.getLimit());
        long total = boardMapper.countMyBoards(memberId);

        PageResponseDTO<InquiryListItemDTO> resp = new PageResponseDTO<>();
        resp.setList(list);
        resp.setTotalCount(total);
        resp.setPage(pageReq.getPage());
        resp.setSize(pageReq.getSize());
        return resp;                     
    }

    // ===== 내 문의 상세 =====
    @Override
    public InquiryDetailDTO getMyInquiryDetail(Long boardId, String memberId) {
    	// 디버그 로깅
        log.info("[SERVICE] getMyInquiryDetail | boardId={} | memberId={}", boardId, memberId);

        BoardVO board = boardMapper.selectBoardById(boardId);
        if (board == null) throw new IllegalArgumentException("존재하지 않는 게시글입니다.");

        // 본인 글 체크
        String ownerId = (board.getMember() != null) ? board.getMember().getMemberId() : null;
        if (ownerId == null || !ownerId.equals(memberId)) {
            throw new IllegalArgumentException("본인 게시글만 조회할 수 있습니다.");
        }

        int replyCount = boardMapper.countReplies(boardId);

        // 게시글 이미지
        List<ImageVO> boardImgs = imageMapper.selectImagesByBoard(boardId);

        // 댓글 목록(+이미지)
        List<ReplyVO> replies = boardMapper.selectReplies(boardId);
        List<ReplyItemDTO> replyDTOs = replies.stream().map(this::toReplyItemDTO).collect(Collectors.toList());

        // 멤버 이메일/연락처는 BoardMapper에서 member 조인 시에만 채워질 수 있음(DB에는 저장안되는 프론트용)
        String email = (board.getMember() != null) ? board.getMember().getMemberEmail() : null;
        String phone = (board.getMember() != null) ? board.getMember().getMemberPhone() : null;

        return InquiryDetailDTO.builder()
                .boardId(board.getBoardId())
                .memberId(ownerId)
                .email(email)          //(프론트용)
                .phone(phone)           //(프론트용)
                .title(board.getBoardTitle())
                .categoryType(board.getCategoryType() != null ? board.getCategoryType().name() : null)
                .orderTicketId(null)     // (프론트용)
                .content(board.getBoardContent())
                .replyCount(replyCount)
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .attachments(toImageDTOs(boardImgs))
                .editable(replyCount == 0)   // 답변 달리면 false
                .deletable(false)            // 회원은 삭제 불가
                .replies(replyDTOs)
                .build();
    }

    // ===== 내 문의 수정 (답변 X일 때만) =====
    @Transactional
    @Override
    public void updateMyInquiry(Long boardId, InquiryUpdateRequestDTO req) throws IOException {
    	// 디버그 로깅
        log.info("[SERVICE] updateMyInquiry | boardId={} | memberId={} | title={} | files(new)={} | files(existing)={}",
                boardId, req.getMemberId(), req.getTitle(),
                (req.getNewAttachments() != null ? req.getNewAttachments().size() : 0),
                (req.getExistingImages() != null ? req.getExistingImages().size() : 0));

        BoardVO board = boardMapper.selectBoardById(boardId);
        if (board == null) throw new IllegalArgumentException("존재하지 않는 게시글입니다.");

        String ownerId = (board.getMember() != null) ? board.getMember().getMemberId() : null;
        if (ownerId == null || !ownerId.equals(req.getMemberId())) {
            throw new IllegalArgumentException("본인 게시글만 수정할 수 있습니다.");
        }

        int replyCount = boardMapper.countReplies(boardId);
        if (replyCount > 0) {
            throw new IllegalArgumentException("답변이 등록된 게시글은 수정할 수 없습니다.");
        }

     // categoryType 유효성 검사 + 변환
        String rawCt = req.getCategoryType();
        if (rawCt == null || rawCt.isBlank()) {
            throw new IllegalArgumentException("categoryType is required");
        }
        CategoryType ct;
        try {
            ct = CategoryType.valueOf(rawCt.trim());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("invalid categoryType: " + rawCt);
        }
        // 제목/본문/카테고리만 업데이트 (db에 저장되는 필드만)
        BoardVO toUpdate = BoardVO.builder()
                .boardId(boardId)
                .boardTitle(req.getTitle())
                .boardContent(req.getContent())
                .categoryType(CategoryType.valueOf(req.getCategoryType()))
                .build();
        boardMapper.updateBoard(toUpdate);

        // 이미지 upsert (boardId 기준)
        ImageListDTO imgReq = ImageListDTO.builder()
                .boardId(boardId)
                .newImages(toNewImageDTOs(req.getNewAttachments()))
                .existingImages(req.getExistingImages() != null ? req.getExistingImages() : List.of())
                .build();
        fileService.upsertImages(imgReq);
    }

    // ===== 전체 목록(관리자) =====
    @Override
    public PageResponseDTO<InquiryListItemDTO> getAllInquiries(PageRequestDTO pageReq) {
        log.info("[SERVICE] getAllInquiries | page={} size={}", pageReq.getPage(), pageReq.getSize());

        List<InquiryListItemDTO> list = boardMapper.selectAllBoards(pageReq.getOffset(), pageReq.getLimit());
        long total = boardMapper.countAllBoards();

        PageResponseDTO<InquiryListItemDTO> resp = new PageResponseDTO<>();
        resp.setList(list);
        resp.setTotalCount(total);
        resp.setPage(pageReq.getPage());
        resp.setSize(pageReq.getSize());
        return resp;                                                      
    }

    // ===== 상세(관리자) =====
    public InquiryDetailDTO getAdminInquiryDetail(Long boardId) {
    	// 디버그 로깅
        log.info("[SERVICE] getAdminInquiryDetail | boardId={}", boardId);

        BoardVO board = boardMapper.selectBoardById(boardId);
        if (board == null) throw new IllegalArgumentException("존재하지 않는 게시글입니다.");

        int replyCount = boardMapper.countReplies(boardId);

        List<ImageVO> boardImgs = imageMapper.selectImagesByBoard(boardId);
        List<ReplyVO> replies = boardMapper.selectReplies(boardId);
        List<ReplyItemDTO> replyDTOs = replies.stream()
                .map(this::toReplyItemDTO)
                .collect(Collectors.toList());

        // 작성자 ID
        String writerId = (board.getMember() != null)
                ? board.getMember().getMemberId()
                : null;

        // 이메일/전화번호는 MemberMapper 로 한 번 더 조회해서 채우기
        String email = null;
        String phone = null;

        if (writerId != null) {
            MemberVO member = memberMapper.selectMemberById(writerId);
            if (member != null) {
                email = member.getMemberEmail();
                phone = member.getMemberPhone();
            }
        }

        return InquiryDetailDTO.builder()
                .boardId(board.getBoardId())
                .memberId(writerId)
                .email(email)   // 회원 정보에서 가져온 이메일
                .phone(phone)   // 회원 정보에서 가져온 연락처
                .title(board.getBoardTitle())
                .categoryType(
                        board.getCategoryType() != null
                                ? board.getCategoryType().name()
                                : null
                )
                .orderTicketId(null) // 스키마 컬럼 없음
                .content(board.getBoardContent())
                .replyCount(replyCount)
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .attachments(toImageDTOs(boardImgs))
                .editable(false)    // 관리자 화면에는 의미 없음
                .deletable(false)   // 회원만 삭제 금지 
                .replies(replyDTOs)
                .build();
    }


    // ===== 댓글 생성(관리자) =====
    @Transactional
    @Override
    public Long createReply(Long boardId, ReplyCURequestDTO req) throws IOException {
    	// 디버그 로깅
        log.info("[SERVICE] createReply | boardId={} | adminId={} | files(new)={} | files(existing)={}",
                boardId, req.getAdminId(),
                (req.getNewAttachments() != null ? req.getNewAttachments().size() : 0),
                (req.getExistingImages() != null ? req.getExistingImages().size() : 0));

        BoardVO board = boardMapper.selectBoardById(boardId);
        if (board == null) throw new IllegalArgumentException("존재하지 않는 게시글입니다.");

        ReplyVO reply = ReplyVO.builder()
                .board(BoardVO.builder().boardId(boardId).build())
                .member(MemberVO.builder().memberId(req.getAdminId()).build())
                .replyContent(req.getContent())
                .build();

        int ins = boardMapper.insertReply(reply);
        if (ins <= 0 || reply.getReplyId() == null) {
            throw new IllegalStateException("댓글 생성에 실패했습니다.");
        }

        // 댓글 이미지 upsert (replyId 지정)
        ImageListDTO imgReq = ImageListDTO.builder()
                .replyId(reply.getReplyId())
                .newImages(toNewImageDTOs(req.getNewAttachments()))
                .existingImages(req.getExistingImages() != null ? req.getExistingImages() : List.of())
                .build();
        fileService.upsertImages(imgReq);

        return reply.getReplyId();
    }

    // ===== 댓글 수정(관리자) =====
    @Transactional
    @Override
    public void updateReply(Long boardId, Long replyId, ReplyCURequestDTO req) throws IOException {
    	// 디버그 로깅
        log.info("[SERVICE] updateReply | boardId={} | replyId={} | adminId={} | files(new)={} | files(existing)={}",
                boardId, replyId, req.getAdminId(),
                (req.getNewAttachments() != null ? req.getNewAttachments().size() : 0),
                (req.getExistingImages() != null ? req.getExistingImages().size() : 0));

        // 검증
        ReplyVO existing = boardMapper.selectReplyById(replyId);
        if (existing == null || existing.getBoard() == null || !boardId.equals(existing.getBoard().getBoardId())) {
            throw new IllegalArgumentException("해당 게시글의 댓글이 아닙니다.");
        }

        ReplyVO toUpdate = ReplyVO.builder()
                .replyId(replyId)
                .replyContent(req.getContent())
                .build();
        boardMapper.updateReply(toUpdate);

        // 댓글 이미지 upsert
        ImageListDTO imgReq = ImageListDTO.builder()
                .replyId(replyId)
                .newImages(toNewImageDTOs(req.getNewAttachments()))
                .existingImages(req.getExistingImages() != null ? req.getExistingImages() : List.of())
                .build();
        fileService.upsertImages(imgReq);
    }

    // ===== 댓글 삭제(관리자) =====
    @Transactional
    @Override
    public void deleteReply(Long boardId, Long replyId) {
        log.info("[SERVICE] deleteReply | boardId={} | replyId={}", boardId, replyId);

        ReplyVO existing = boardMapper.selectReplyById(replyId);
        if (existing == null || existing.getBoard() == null || !boardId.equals(existing.getBoard().getBoardId())) {
            throw new IllegalArgumentException("해당 게시글의 댓글이 아닙니다.");
        }
        boardMapper.deleteReply(replyId);
        // 이미지(파일) 삭제는 FileService가 물리 파일 삭제 API를 제공하지 않아서 불가능
    }
}
