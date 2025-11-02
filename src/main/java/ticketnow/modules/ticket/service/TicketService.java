package ticketnow.modules.ticket.service;

import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.ticket.dto.*;

public interface TicketService {
	TicketResponseDTO createTicket(TicketCreateRequestDTO req);

	TicketResponseDTO getTicket(Long ticketId);

	PageResponseDTO<TicketResponseDTO> getTicketPage(PageRequestDTO pageReq);

	TicketResponseDTO updateTicket(Long ticketId, TicketUpdateRequestDTO req);

	void deleteTicket(Long ticketId);
}
