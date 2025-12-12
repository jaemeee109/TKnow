package ticketnow.modules.ticket.api;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ticketnow.modules.ticket.constant.TicketStatus;
import ticketnow.modules.ticket.dto.TicketResponseDTO;
import ticketnow.modules.ticket.mapper.TicketMapper;

@Slf4j
@RestController
@RequestMapping("/tickets/admin")
@RequiredArgsConstructor
public class TicketAdminController {

    private final TicketMapper ticketMapper;

    /**
     * 티켓 판매 상태 변경 (관리자용)
     * - URL : PATCH /tickets/admin/{ticketId}/status
     * - Body : { "ticketStatus": "ON_SALE" } 와 같이 enum 이름 전달
     */
    @PatchMapping("/{ticketId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable("ticketId") Long ticketId,
            @RequestBody TicketStatusUpdateRequestDTO request
    ) {
        if (request == null || request.getTicketStatus() == null) {
            return ResponseEntity.badRequest().build();
        }

        String statusStr = request.getTicketStatus().trim();
        if (statusStr.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        TicketStatus newStatus;
        try {
            newStatus = TicketStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            log.warn("[ADMIN][TicketStatus] 잘못된 상태 값입니다. ticketId={} status={}", ticketId, statusStr);
            return ResponseEntity.badRequest().build();
        }

        // DB 업데이트
        int updated = ticketMapper.updateTicketStatus(ticketId, newStatus.name());
        if (updated == 0) {
            // 해당 티켓이 없는 경우
            return ResponseEntity.notFound().build();
        }

        // 변경된 티켓 정보 다시 조회해서 반환
        TicketResponseDTO dto = ticketMapper.selectTicketDTOById(ticketId);
        return ResponseEntity.ok(dto);
    }

    @Data
    public static class TicketStatusUpdateRequestDTO {
        private String ticketStatus;
    }
}
