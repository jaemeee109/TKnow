package ticketnow.modules.order.mapper;

import java.util.List;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import ticketnow.modules.order.dto.pay.PayPageDTO;
import ticketnow.modules.order.dto.receive.ReceiveOptionPageDTO;
import ticketnow.modules.order.dto.OrdersListItemDTO;
import ticketnow.modules.order.dto.OrdersDetailDTO;

import org.apache.ibatis.annotations.Param;
import ticketnow.modules.order.domain.OrdersVO;
import ticketnow.modules.order.dto.admin.AdminSalesSummaryDTO;
import ticketnow.modules.order.dto.admin.AdminOrdersListItemDTO;
// 주문(Order) 조회 전용 Mapper
//카멜<->스네이크 자동매핑: root-context.xml에서 mapUnderscoreToCamelCase=true 설정됨

@Mapper
public interface OrdersMapper {
	
	
	 int insertOrders(OrdersVO orders); // 주문 생성 (orders 테이블)

	 // 주문<-> 좌석 매핑 생성 (order_ticket 테이블)
	 int insertOrderTicket(@Param("ordersId") Long ordersId,
             @Param("seatId") Long seatId,
             @Param("orderPrice") Integer orderPrice,
             @Param("orderQuantity") Integer orderQuantity);

	// 티켓수령방법 선택 페이지 (뷰) 데이터 조회 
    ReceiveOptionPageDTO selectReceiveOptionPage(@Param("ordersId") Long ordersId);

   // 결제하기 페이지(뷰) 데이터 조회 
    PayPageDTO selectPayPage(@Param("ordersId") Long ordersId);

   // 구매내역 목록(회원별) 
    List<OrdersListItemDTO> selectOrdersListByMember(
            @Param("memberId") String memberId,
            @Param("offset") int offset, // 데이터를 가져올 시작위치
            @Param("limit") int limit); // 한 번에 가져올 데이터 개수

    // 목록용 전체 카운트(회원별)
    long countOrdersByMember(@Param("memberId") String memberId);

   // 구매내역 상세(주문ID 기준)
    OrdersDetailDTO selectOrdersDetail(@Param("ordersId") Long ordersId);
    
    // 썸네일 조회
    Long selectTicketIdByOrdersId(@Param("ordersId") Long ordersId);
    
    // ====== 관리자용 전체 매출 요약 (AdminInven 하단 카드) ======
    AdminSalesSummaryDTO selectAdminSalesSummary();
    
    // ====== 관리자용 전체 주문 목록 (페이징) ======
    List<AdminOrdersListItemDTO> selectAdminOrdersList(
            @Param("offset") int offset,
            @Param("limit") int limit);

    // 관리자용 전체 주문 카운트
    long countAdminOrders();

    // ======  주문 상태 변경 ======
    int updateOrdersStatus(@Param("ordersId") Long ordersId,
                           @Param("ordersStatus") String ordersStatus);

    // 주문 취소/환불 시: 해당 주문에 연결된 좌석들을 다시 AVAILABLE 로 되돌리기
    int resetSeatStatusByOrdersId(@Param("ordersId") Long ordersId);

}


