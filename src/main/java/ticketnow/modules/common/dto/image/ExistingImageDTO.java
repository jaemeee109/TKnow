package ticketnow.modules.common.dto.image;

import lombok.*;


//  이미 저장된 이미지(파일은 교체 없이) 메타데이터 수정/삭제할 때 사용하는 DTO
// delete=true 이면 해당 이미지 삭제 처리

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExistingImageDTO {
    private String imageUuid;   // PK (CHAR(36) 문자열)
    private Boolean isPrimary;  // 대표 여부
    private Integer imageSort;  // 정렬 순서 (오름차순)
    private String imageType;   // ImageType의 name() 문자열
    private boolean delete;     // true면 삭제
}
