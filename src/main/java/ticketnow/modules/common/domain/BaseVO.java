package ticketnow.modules.common.domain;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BaseVO {
   
    private LocalDateTime createdAt; // 생성일
   
    private LocalDateTime updatedAt; // 수정일
}
