package ticketnow.modules.ticket.dto;

import java.time.LocalDateTime;

import javax.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketScheduleCreateDTO {

	  @NotNull(message = "공연 일시는 필수입니다.")
	   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
	    private LocalDateTime showAt;   // 1회차, 2회차…의 시작 일시

	    private Integer roundNo;        // 1, 2, 3… (없으면 서버에서 1부터 자동 부여해도 됨)
}
