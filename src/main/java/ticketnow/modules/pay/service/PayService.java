package ticketnow.modules.pay.service;

import ticketnow.modules.pay.dto.*;
import ticketnow.modules.pay.dto.bank.VBankDepositRequestDTO;
import ticketnow.modules.pay.dto.bank.VBankIssueRequestDTO;
import ticketnow.modules.pay.dto.card.CardApproveRequestDTO;

public interface PayService {

    // [카드] 즉시 승인 (가상)
    PayResultDTO approveCard(CardApproveRequestDTO req);

    // [무통장] 가상계좌 발급
    PayResultDTO issueVBank(VBankIssueRequestDTO req);

    // [무통장] 입금(확인) 처리
    PayResultDTO depositVBank(VBankDepositRequestDTO req);

    // 결제 결과/상태 조회
    PayResultDTO getPayResult(Long ordersId);
}
