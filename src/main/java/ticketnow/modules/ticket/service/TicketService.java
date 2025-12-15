package ticketnow.modules.ticket.service;

import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.ticket.dto.*;
import java.util.List;

public interface TicketService {
	TicketResponseDTO createTicket(TicketCreateRequestDTO req);

	TicketResponseDTO getTicket(Long ticketId);

	PageResponseDTO<TicketResponseDTO> getTicketPage(PageRequestDTO pageReq);

	TicketResponseDTO updateTicket(Long ticketId, TicketUpdateRequestDTO req);

	void deleteTicket(Long ticketId);
	
    
   // 티켓별 회차 좌석 통계 조회
    List<SeatStatsDTO> getSeatStats(Long ticketId);

    List<SeatSummaryDTO> getSeatSummary(Long ticketId);


    // 특정 티켓 / 회차 / 구역(F1~F4) 기준 좌석 목록 조회
    List<SeatDetailDTO> getSeatsForZone(Long ticketId, Integer roundNo, String zone);

    
}
