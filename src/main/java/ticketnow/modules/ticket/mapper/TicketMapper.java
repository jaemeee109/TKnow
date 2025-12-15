package ticketnow.modules.ticket.mapper;

import java.util.List;


import ticketnow.modules.ticket.dto.TicketScheduleDTO;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import ticketnow.modules.ticket.domain.TicketScheduleVO;
import ticketnow.modules.ticket.dto.SeatStatsDTO;
import ticketnow.modules.ticket.dto.SeatSummaryDTO;
import ticketnow.modules.ticket.dto.TicketResponseDTO;
import java.util.List;
import ticketnow.modules.ticket.dto.SeatDetailDTO;
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
    
    // 티켓 상태만 단순 변경 (예: 자동 판매 종료)
    int updateTicketStatus(@Param("ticketId") Long ticketId,
                           @Param("ticketStatus") String ticketStatus);
    
    // 티켓 생성 시 좌석 일괄 생성
    int insertSeatsForTicket(@Param("ticketId") Long ticketId,
                             @Param("seats") List<Map<String, Object>> seats);

    
    // 소프트 삭제 대체: 상태 CLOSED 전환
    // int softDeleteTicket(@Param("ticketId") Long ticketId);
    
	 // 회차 목록 INSERT
	    int insertTicketSchedules(@Param("ticketId") Long ticketId,
	                              @Param("schedules") List<TicketScheduleVO> schedules);
	  
	   // 좌석 상세
	    List<SeatDetailDTO> selectSeatsByTicketAndRoundAndZone(
	            @Param("ticketId") Long ticketId,
	            @Param("roundNo") Integer roundNo,
	            @Param("zone") String zone
	    );

    
    /**
     * 티켓 물리 삭제 (DELETE FROM ticket ...)
     * @param ticketId 삭제할 티켓 PK
     * @return 삭제된 행 수 (0 또는 1)
     */
    int hardDeleteTicket(@Param("ticketId") Long ticketId);
    
    // 특정 티켓의 회차별 좌석 통계 조회

    List<SeatStatsDTO> selectSeatStatsByTicket(@Param("ticketId") Long ticketId);
    
    // 단일 티켓의 회차 스케줄 목록 조회
    List<TicketScheduleDTO> selectTicketSchedulesByTicketId(@Param("ticketId") Long ticketId);
    
    List<SeatSummaryDTO> selectSeatSummaryByTicket(Long ticketId);


}