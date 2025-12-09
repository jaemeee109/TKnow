// TicketUpdateRequestDTO.java
package ticketnow.modules.ticket.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import javax.validation.constraints.*;

import org.springframework.web.multipart.MultipartFile;

import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor @Builder
public class TicketUpdateRequestDTO {
    private String title;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String venueName;
    private Integer totalSeats;
    private Integer remainingSeats;
    private BigDecimal price;
    private String ticketStatus; // 문자열로 받아 enum 변환(서비스에서)
    
    private List<MultipartFile> images;
}

//================== ★ 추가: 수정 시 새로 첨부할 이미지 파일들 (선택) ==================
// - PUT /tickets/{ticketId} 에서 multipart/form-data 로 받을 예정
// - 비어 있으면 "이미지 변경 없이 나머지 필드만 수정"
// - 값이 있으면 "기존 이미지 교체 or 추가" 로 서비스 로직에서 처리할 수 있음
