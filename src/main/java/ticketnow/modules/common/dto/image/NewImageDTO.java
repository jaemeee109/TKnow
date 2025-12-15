package ticketnow.modules.common.dto.image;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;


//새로 업로드할 이미지 1건
// 실제 파일(MultipartFile) + 메타데이터

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NewImageDTO {
    private MultipartFile file;  // 업로드 파일
    private Boolean isPrimary;   // 대표 여부
    private Integer imageSort;   // 정렬 순서
    private String imageType;    // ImageType의 name() 문자열
}
