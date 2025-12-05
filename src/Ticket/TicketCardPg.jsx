// src/Ticket/TicketCardPg.jsx
import React, { useEffect, useState } from "react";
import "../css/ticket.css";
import "../css/style.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function TicketCardPg() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [cardCompany, setCardCompany] = useState("BC카드");
  const [cardNumber, setCardNumber] = useState("1234-5678-0000-0000");
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);

  // 결제 정보 로드 (location.state → lastPayment 순서)
  useEffect(() => {
    const info =
      location.state || JSON.parse(localStorage.getItem("lastPayment") || "{}");

    if (!info || !info.totalPrice) {
      alert("결제 정보가 없습니다. 다시 시도해주세요.");
      navigate(`/Ticket/Buy5/${id}`);
      return;
    }

    setPaymentInfo(info);
  }, [location, id, navigate]);

  const handleCancel = () => {
    if (processing) return;
    // 바로 이전 단계로
    navigate(-1);
  };

  const handleApprove = async () => {
    if (!paymentInfo) return;

    if (!agree) {
      alert("결제 약관에 동의해 주세요.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setProcessing(true);

    try {
      // 1) 주문 생성 (orders + order_ticket)
      const totalCount =
        (paymentInfo.normalCount || 0) +
        (paymentInfo.discount1Count || 0) +
        (paymentInfo.discount2Count || 0) +
        (paymentInfo.discount3Count || 0);

      const orderReq = {
        ordersTotalAmount: paymentInfo.totalPrice,
        ordersTicketQuantity: totalCount,
        seatIdList: paymentInfo.seatIdList || [],
      };

      console.log("주문 생성 요청:", orderReq);

      const orderRes = await api.post("/orders", orderReq, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ordersId = orderRes.data;
      console.log("주문 생성 완료 ordersId =", ordersId);

      // 2) 카드 승인 가상 모듈 호출
      const memberId = localStorage.getItem("memberId") || "";

      const approveReq = {
        ordersId,
        memberId,
        amount: paymentInfo.totalPrice,
        cardCompany,
        maskedCardNo: cardNumber || "1234-****-****-5678",
        agreeTerms: true,
      };

      console.log("카드 승인 요청:", approveReq);

      const res = await api.post("/pay/card/approve", approveReq, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("카드 승인 결과:", res.data);

      alert("결제가 완료되었습니다.");

      // Buy6에서 사용할 수 있도록 주문번호를 state + localStorage 에 같이 저장
      const nextState = {
        ...paymentInfo,
        orderId: ordersId,
      };
      localStorage.setItem("lastPayment", JSON.stringify(nextState));

      navigate(`/Ticket/Buy6/${id}`, { state: nextState });
   // src/Ticket/TicketCardPg.jsx - handleApprove 내부 catch 부분 교체
} catch (err) {
  console.error("결제 처리 중 오류:", err);

  // 서버에서 내려준 에러 메시지 추출
  const serverMessage =
    err?.response?.data?.message || err?.response?.data?.error;

  if (serverMessage) {
    alert(
      `결제 처리 중 오류가 발생했습니다.\n\n서버 메시지: ${serverMessage}`
    );
  } else {
    alert("결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
} finally {
  setProcessing(false);
}

  };

  if (!paymentInfo) {
    // useEffect 에서 처리 후 이전 페이지로 돌려보내기 때문에 여기선 빈 화면만
    return null;
  }

  return (
    <div className="pg-fullscreen">
      <div className="pg-dialog">
        <h2 className="pg-title">가상 카드 결제</h2>

        <div className="pg-body">
          <p className="pg-amount">
            결제 금액{" "}
            <strong>{paymentInfo.totalPrice?.toLocaleString()}원</strong>
          </p>

          <div className="pg-field">
            <label>카드사 선택</label>
            <select
              value={cardCompany}
              onChange={(e) => setCardCompany(e.target.value)}
            >
              <option value="BC카드">BC카드</option>
              <option value="신한카드">신한카드</option>
              <option value="국민카드">국민카드</option>
              <option value="농협카드">농협카드</option>
            </select>
          </div>

          <div className="pg-field">
            <label>카드 번호</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234-5678-0000-0000"
            />
          </div>

          <div className="pg-agree">
            <label>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />{" "}
              결제 약관에 동의합니다.
            </label>
          </div>
        </div>

        <div className="pg-actions">
          <button
            type="button"
            className="pg-btn pg-btn-secondary"
            onClick={handleCancel}
            disabled={processing}
          >
            결제 취소
          </button>
          <button
            type="button"
            className="pg-btn pg-btn-primary"
            onClick={handleApprove}
            disabled={processing || !agree}
          >
            {processing ? "결제 처리 중..." : "결제하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
