package ticketnow.modules.ticket.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import ticketnow.modules.ticket.dto.TicketResponseDTO;

@Mapper
public interface TicketMapper {

    // INSERT (Map 기반, useGeneratedKeys 로 ticketId 채워짐)
    int insertTicketFromMap(Map<String, Object> params);

    // 단건 DTO 조회
    TicketResponseDTO selectTicketDTOById(@Param("ticketId") Long ticketId);

    // 페이지 DTO 조회
    List<TicketResponseDTO> selectTicketDTOPage(@Param("offset") int offset,
                                                @Param("limit")  int limit);

    // 총 개수
    long countTickets();

    // 부분 수정
    int updateTicketFromMap(Map<String, Object> params);

    // 소프트 삭제 대체: 상태 CLOSED 전환
    int softDeleteTicket(@Param("ticketId") Long ticketId);
}
