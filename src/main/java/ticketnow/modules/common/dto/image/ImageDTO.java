package ticketnow.modules.common.dto.image;

import lombok.*;


// 뷰에 내려주거나 간단한 응답으로 사용할 수 있는 이미지 DTO
//- 파일 경로 대신 접근 URL(imageUrl) 위주로 사용

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImageDTO {
	private String imageUrl;
    private Boolean isPrimary;
    private Integer imageSort;
    private String imageType; // enum 문자열 (예: "BOARD_IMAGE")
}
