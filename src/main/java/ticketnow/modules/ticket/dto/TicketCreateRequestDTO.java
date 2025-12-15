// TicketCreateRequestDTO.java
package ticketnow.modules.ticket.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import javax.validation.constraints.*;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import lombok.*;


@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor @Builder
public class TicketCreateRequestDTO {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    @NotNull(message = "시작일시는 필수입니다.")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startAt;

    @NotNull(message = "종료일시는 필수입니다.")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endAt;

    @NotBlank(message = "공연장 명은 필수입니다.")
    private String venueName;
    
    @NotBlank(message = "카테고리는 필수입니다.")
    private String category;

    @NotBlank(message = "상세 설명은 필수입니다.")
    private String ticketDetail;
    

    @Min(value = 1, message = "총 좌석 수는 1 이상이어야 합니다.")
    private int totalSeats;

    @DecimalMin(value = "0.0", inclusive = false, message = "가격은 0보다 커야 합니다.")
    private BigDecimal price;
    
    @NotEmpty(message = "이미지는 최소 1장 이상 첨부해야 합니다.")
    private List<MultipartFile> images;
    
    // 생성 시 선택적으로 전달하는 판매상태 (ON_SALE / SCHEDULED / CLOSED 등)
    private String ticketStatus;
    
    private List<TicketScheduleCreateDTO> schedules; // 공연 회차
}

//================== ★ 추가한 부분: 티켓 생성 시 첨부할 이미지 파일들 ==================
// - multipart/form-data 요청에서 전달되는 이미지 파일 리스트
// - 컨트롤러 쪽에서 @ModelAttribute 또는 @RequestPart로 바인딩 예정
// - 앞으로 서비스에서 이 필드를 이용해서 공용 이미지 폴더에 저장 + DB 등록 처리
