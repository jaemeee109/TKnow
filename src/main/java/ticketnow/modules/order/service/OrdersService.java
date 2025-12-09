package ticketnow.modules.order.service;

import ticketnow.modules.common.dto.paging.PageRequestDTO;

import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.order.dto.pay.PayPageDTO;
import ticketnow.modules.order.dto.pay.PayReadySubmitDTO;
import ticketnow.modules.order.dto.receive.ReceiveOptionPageDTO;
import ticketnow.modules.pay.dto.PayResultDTO;
import ticketnow.modules.order.dto.OrdersListItemDTO;
import ticketnow.modules.order.dto.OrdersDetailDTO;
import ticketnow.modules.order.dto.OrdersCreateRequestDTO;
import ticketnow.modules.order.dto.admin.AdminSalesSummaryDTO;
import ticketnow.modules.order.dto.admin.AdminOrdersListItemDTO;

public interface OrdersService {
	
	// 주문 생성
	Long createOrder(String memberId, OrdersCreateRequestDTO req);

    // 티켓수령방법 선택 페이지 데이터
    ReceiveOptionPageDTO getReceiveOptionPage(Long ordersId);

    // 결제하기 페이지 데이터
    PayPageDTO getPayPage(Long ordersId);

    // 구매내역 목록(회원별, 페이징)
    PageResponseDTO<OrdersListItemDTO> getOrdersList(String memberId, PageRequestDTO req);

    // 구매내역 상세
    OrdersDetailDTO getOrdersDetail(Long ordersId);
    
    // 관리자용 전체 매출 요약 (AdminInven 하단 카드)
    AdminSalesSummaryDTO getAdminSalesSummary();

    // 결제하기 버튼 클릭(결제 준비) - Pay 모듈로 넘길 최소 데이터 리턴
    // 실제 결제/승인/환불은 pay 패키지가 담당
    String readyToPay(PayReadySubmitDTO dto);


    //  관리자용 전체 주문 목록 (페이징) 
    PageResponseDTO<AdminOrdersListItemDTO> getAdminOrdersList(PageRequestDTO req);

    // 주문 상태 변경 
    void updateOrdersStatus(Long ordersId, String ordersStatus);
}
