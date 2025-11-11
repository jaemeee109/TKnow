package ticketnow.modules.admin.domain;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerVO {

    private Long bannerId;            // 배너번호
    private String imageUrl;          // 이미지경로
    private String linkUrl;           // 이동경로
    private boolean active;           // 노출여부
    private Integer bannerSort;       // 정렬 순서
    private LocalDateTime createdAt;  // 배너 생성일
    private LocalDateTime deleteAt;   // 배너 종료일
}
