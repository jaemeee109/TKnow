package ticketnow.modules.common.service.image;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ticketnow.modules.common.constant.ImageType;
import ticketnow.modules.common.domain.ImageVO;
import ticketnow.modules.common.dto.image.ExistingImageDTO;
import ticketnow.modules.common.dto.image.ImageListDTO;
import ticketnow.modules.common.dto.image.NewImageDTO;
import ticketnow.modules.common.mapper.image.ImageMapper;
import ticketnow.modules.board.domain.BoardVO;
import ticketnow.modules.board.domain.ReplyVO;
import ticketnow.modules.member.domain.MemberVO;
import ticketnow.modules.ticket.domain.TicketVO;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Log4j2
public class FileService {

    private final LocalStorage storage;
    private final ImageMapper imageMapper;

    // 새 이미지 업로드 + 기존 이미지 메타 업데이트/삭제를 한 번에 처리
    // (boardId | memberId | ticketId) 중 하나를 지정
    // enum은 문자열(name)로 전달받아 ImageType.valueOf(...)로 변환
    @Transactional
    public List<ImageVO> upsertImages(ImageListDTO req) throws IOException {

        // 0) 회원 프로필 이미지 업로드인 경우: 기존 MEMBER_PROFILE 대표이미지 전부 대표 해제
        if (req.getMemberId() != null && req.getNewImages() != null) {
            boolean hasProfilePrimary = false;

            // 이번 요청에 MEMBER_PROFILE + isPrimary=true 가 포함되어 있는지 확인
            for (NewImageDTO ni : req.getNewImages()) {
                String type = ni.getImageType();
                Boolean isPrimary = ni.getIsPrimary();

                if (type != null
                        && type.equals(ImageType.MEMBER_PROFILE.name())
                        && Boolean.TRUE.equals(isPrimary)) {
                    hasProfilePrimary = true;
                    break;
                }
            }

            // 새 대표 프로필이 올라오는 경우에만 기존 대표 프로필들 isPrimary=false로 변경
            if (hasProfilePrimary) {
                // 해당 회원의 기존 이미지 목록 조회
                List<ImageVO> existing = imageMapper.selectImagesByMember(req.getMemberId());
                if (existing != null) {
                    for (ImageVO img : existing) {
                        if (img.getImageType() == ImageType.MEMBER_PROFILE
                                && Boolean.TRUE.equals(img.getIsPrimary())) {
                            // 기존 대표 프로필 이미지는 isPrimary=false 로 업데이트
                            imageMapper.updateImageMeta(
                                    false,                                           // is_primary = 0
                                    img.getImageSort(),                             // img_sort (그대로 유지)
                                    img.getImageType() != null
                                            ? img.getImageType().name()
                                            : null,                                  // img_type
                                    img.getImageUuid()                              // WHERE img_uuid = ?
                            );
                        }
                    }
                }
            }
        }

        // 1) 신규 업로드 처리
        if (req.getNewImages() != null) {
            for (NewImageDTO ni : req.getNewImages()) {
                MultipartFile file = ni.getFile();
                if (file == null || file.isEmpty()) continue;

                // 1-1) 실제 파일 저장 후 접근 URL 반환
                String url = storage.save(file);

                // 1-2) VO 구성 (DB 스키마 컬럼과 자동 매핑)
                ImageVO vo = ImageVO.builder()
                        .imageUuid(UUID.randomUUID().toString())
                        .imageExt(getExt(file.getOriginalFilename()))
                        .orginName(file.getOriginalFilename())
                        .fileName(extractFileName(url))
                        .imgUrl(url)
                        .imageType(ImageType.valueOf(ni.getImageType()))
                        .imageSort(ni.getImageSort())
                        .isPrimary(Boolean.TRUE.equals(ni.getIsPrimary()))
                        .build();

                // 소유자 FK 모두 설정 가능 (NULL 아닌 경우 각각 설정)
                if (req.getBoardId() != null)
                    vo.setBoard(BoardVO.builder().boardId(req.getBoardId()).build());

                if (req.getMemberId() != null)
                    vo.setMember(MemberVO.builder().memberId(req.getMemberId()).build());

                if (req.getTicketId() != null)
                    vo.setTicket(TicketVO.builder().ticketId(req.getTicketId()).build());

                if (req.getReplyId() != null)
                    vo.setReply(ReplyVO.builder().replyId(req.getReplyId()).build());

                imageMapper.insertImage(vo);
            }
        }

        // 2) 기존 이미지 메타 수정/삭제
        if (req.getExistingImages() != null) {
            for (ExistingImageDTO ei : req.getExistingImages()) {
                if (ei.isDelete()) {
                    imageMapper.deleteImageByUuid(ei.getImageUuid());
                } else {
                    // null 방어
                    Boolean primary = ei.getIsPrimary();
                    Boolean safePrimary = (primary != null) ? primary : Boolean.FALSE; // null -> false(0)
                    Integer safeSort = ei.getImageSort(); // null 허용(미지정이면 변경 안할 수도)
                    String safeType = ei.getImageType();  // null 허용

                    // ⚠️ 매퍼 XML의 '?' 순서: is_primary, img_sort, img_type, img_uuid
                    imageMapper.updateImageMeta(
                            safePrimary,     // is_primary = ?
                            safeSort,        // img_sort   = ?
                            safeType,        // img_type   = ?
                            ei.getImageUuid()// WHERE img_uuid = ?
                    );
                }
            }
        }

        // 3) 최종 목록 반환 (board > member > ticket 우선)
        if (req.getBoardId() != null)  return imageMapper.selectImagesByBoard(req.getBoardId());
        if (req.getMemberId() != null) return imageMapper.selectImagesByMember(req.getMemberId());
        if (req.getTicketId() != null) return imageMapper.selectImagesByTicket(req.getTicketId());
        
        
     // 업로드된 이미지 목록 다시 조회해서 반환
        if (req.getMemberId() != null) {
            List<ImageVO> result = imageMapper.selectImagesByMember(req.getMemberId());
            log.info("[FileService] upsertImages memberId={} resultSize={}",
                     req.getMemberId(), result != null ? result.size() : 0);
            return result;
        }
        
        return Collections.emptyList();
    }

    private String getExt(String original) {
        if (original == null) return "";
        int idx = original.lastIndexOf('.');
        return (idx >= 0) ? original.substring(idx + 1) : "";
    }

    private String extractFileName(String url) {
        if (url == null) return null;
        int idx = url.lastIndexOf('/');
        return (idx >= 0) ? url.substring(idx + 1) : url;
    }

    // 이미지 삭제 로직
    @Transactional
    public void deleteAllByTicketId(Long ticketId) {
        if (ticketId == null) {
            return;
        }

        // 1) 해당 티켓에 연결된 이미지 목록 조회
        List<ImageVO> images = imageMapper.selectImagesByTicket(ticketId);
        if (images == null || images.isEmpty()) {
            return; // 삭제할 이미지 없음
        }

        // 2) 각 이미지 UUID 기준으로 삭제
        for (ImageVO image : images) {
            if (image.getImageUuid() != null) {
                // DB row 삭제
                imageMapper.deleteImageByUuid(image.getImageUuid());
            }
        }
    }

}
