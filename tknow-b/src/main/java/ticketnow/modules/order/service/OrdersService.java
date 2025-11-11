package ticketnow.modules.order.service;

import ticketnow.modules.common.dto.paging.PageRequestDTO;
import ticketnow.modules.common.dto.paging.PageResponseDTO;
import ticketnow.modules.order.dto.pay.PayPageDTO;
import ticketnow.modules.order.dto.pay.PayReadySubmitDTO;
import ticketnow.modules.order.dto.receive.ReceiveOptionPageDTO;
import ticketnow.modules.order.dto.OrdersListItemDTO;
import ticketnow.modules.order.dto.OrdersDetailDTO;

public interface OrdersService {

    // 티켓수령방법 선택 페이지 데이터
    ReceiveOptionPageDTO getReceiveOptionPage(Long ordersId);

    // 결제하기 페이지 데이터
    PayPageDTO getPayPage(Long ordersId);

    // 구매내역 목록(회원별, 페이징)
    PageResponseDTO<OrdersListItemDTO> getOrdersList(String memberId, PageRequestDTO req);

    // 구매내역 상세
    OrdersDetailDTO getOrdersDetail(Long ordersId);

    // 결제하기 버튼 클릭(결제 준비) - Pay 모듈로 넘길 최소 데이터 리턴
    // 실제 결제/승인/환불은 pay 패키지가 담당
    String readyToPay(PayReadySubmitDTO dto);
    
    
}
