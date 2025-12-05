// src/Ticket/TicketBuy6.jsx
import React, { useEffect, useState } from "react";
import "../css/ticket.css";
import "../css/style.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cons from "../images/cons.png";
import Ticket from "../images/ticket.png";
import TKNOW_w from "../images/TKNOW_w.png";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import api from "../api";

const API_BASE = (process.env.REACT_APP_API_BASE || api.defaults.baseURL || "").replace(/\/$/, "");


export default function TicketBuy6() {

  const location = useLocation();
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState(null);
  
  const normal = paymentInfo?.normalCount || 1;
  const discount1 = paymentInfo?.discount1Count || 0;
  const discount2 = paymentInfo?.discount2Count || 0;
  const discount3 = paymentInfo?.discount3Count || 0;
  const total = normal + discount1 + discount2 + discount3;
  
  // 결제 정보 불러오기
  useEffect(() => {
    const info = location.state || JSON.parse(localStorage.getItem("lastPayment") || "{}");
    console.log("결제 정보 로드:");
    console.log("  normalCount:", info?.normalCount);
    console.log("  discount1Count:", info?.discount1Count);
    console.log("  discount2Count:", info?.discount2Count);
    console.log("  discount3Count:", info?.discount3Count);
    console.log("  전체 info:", info);
    setPaymentInfo(info);
  }, [location]);

    // 주문 데이터 DB 저장 + 결제 데이터 DB 저장 + 창 닫기 / 홈 이동
  const handleClose = async () => {
    if (!paymentInfo?.seatIdList || paymentInfo.seatIdList.length === 0) {
      alert("좌석이 선택되지 않았습니다.");
      return;
    }

    // 수량 검증
    if (total < 1) {
      alert("주문 수량이 올바르지 않습니다.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // 💰 결제 금액 안전 계산 (Buy5에서 넘어온 값이 undefined 인 경우 대비)
    const finalTotalPrice =
      typeof paymentInfo.totalPrice === "number"
        ? paymentInfo.totalPrice
        : (paymentInfo.basePrice || 0) +
          (paymentInfo.serviceFee || 0) +
          (paymentInfo.deliveryFee || 0) -
          (paymentInfo.discountPrice || 0);

    // 백엔드 OrdersCreateRequestDTO 에 맞는 필드명
    const orderData = {
      ordersTotalAmount: finalTotalPrice,
      ordersTicketQuantity: total,
      seatIdList: paymentInfo.seatIdList,
    };

    console.log(" 주문 데이터 전송:", orderData);

    try {
      // 1) 주문 생성 (/orders)
      const orderResponse = await api.post("/orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const createdOrdersId = orderResponse.data;
      console.log(" 주문 생성 성공 ordersId =", createdOrdersId);

      // 2) 결제 수단 확인 - 현재는 신용카드만 실제 가상 모듈 연동
      if (paymentInfo.paymentMethod !== "신용카드") {
        alert("현재는 신용카드 결제만 실제 처리됩니다.");
        navigate("/member/myticket");
        return;
      }

      // 3) 카드 결제 가상 모듈 호출용 DTO (CardApproveRequestDTO 매핑)
      const cardApproveRequest = {
        ordersId: createdOrdersId,
        amount: finalTotalPrice,
        cardCompany: paymentInfo.cardType || "BC카드",
        maskedCardNo: paymentInfo.maskedCardNo || "1234-****-****-5678",
        agreeTerms: true,
      };

      console.log(" 카드 결제 가상 모듈 호출:", cardApproveRequest);

      const payResponse = await api.post("/pay/card/approve", cardApproveRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ 카드 결제 성공:", payResponse.data);

      alert("예매가 완료되었습니다.");
      navigate("/member/myticket");
    } catch (error) {
      console.error("❌ 주문/결제 처리 중 오류:", error);
      alert("주문 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };


  if (!paymentInfo || !paymentInfo.orderId) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>결제 정보를 찾을 수 없습니다.</h2>
        <Link to="/">홈으로 가기</Link>
      </div>
    );
  }

  const serialNumber = paymentInfo.orderId;

  return (
    <div className="ticket-buy-main">
      <div className="ticket-buy-page">
        <div className="ticket-buy-top">
          <button className="ticket-buy-button2">01&nbsp;
            <span className="ticket-buy-button-text1">날짜 선택</span></button>
          <button className="ticket-buy-button2">02&nbsp;
            <span className="ticket-buy-button-text1">좌석 선택</span></button>
          <button className="ticket-buy-button2">03&nbsp;
            <span className="ticket-buy-button-text1">가격 선택</span></button>
          <button className="ticket-buy-button2">04&nbsp;
            <span className="ticket-buy-button-text1">배송 선택</span></button>
          <button className="ticket-buy-button1">05&nbsp;
            <span className="ticket-buy-button-text1">결제하기</span></button>
        </div><br />

        <br />
        <div className="ticket-buy-middle">
          <div className="ticket-buy-middle-box">
            <div className="ticket-buy-middle-box1">
              <div className="ticket-buy6-box2">
                <div className="ticket-buy6-center1">
                  <div className="cons-img">
                    <img src={Cons} alt="콘서트 썸네일" />
                    <div className="ticket-buy6-table1">
                      <table>
                        <tbody>
                          <tr>{paymentInfo.ticketTitle}</tr><br />
                          <tr>{paymentInfo.ticketVenue}</tr><br />
                          <tr>
                            <td colSpan={3}>{paymentInfo?.ticketDate ? new Date(paymentInfo.ticketDate).toLocaleString("ko-KR") : ''}</td>
                          </tr><br />
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <br />
                <strong>결제 내역</strong><br /><br />

                <table className="ticket-buy6-center2">
                  <tbody>
                    <tr>
                      <th>예매일</th><td>｜</td>
                      <td>{new Date(paymentInfo.paymentDate).toLocaleString("ko-KR")}</td>
                      <th>상태</th><td>｜</td>
                      <td style={{ color: "#FFA6C9", fontWeight: "bold" }}>결제 완료</td>
                      <th>결제수단</th><td>｜</td>
                      <td>{paymentInfo.paymentMethod}</td>
                    </tr>
                  </tbody>
                </table>
                <br />

                <strong>예매 내역</strong><br /><br />
                <table className="ticket-buy6-center2">
                  <tbody>
                    <tr>
                      <th>예매 번호</th><td>｜</td><td>{paymentInfo.orderId}</td>
                      <th>배송</th><td>｜</td><td>{paymentInfo.deliveryMethod || "현장"}</td>
                      <th>가격 등급</th><td>｜</td><td>일반 {normal}매</td>
                    </tr>
                    <tr>
                      <th>좌석번호</th><td>｜</td><td>{paymentInfo.seatInfo}</td>
                      <th>가격</th><td>｜</td><td>{paymentInfo.basePrice?.toLocaleString()} 원</td>
                      <th>취소 여부</th><td>｜</td><td>가능</td>
                    </tr>
                    <tr>
                      <th>수수료</th><td>｜</td><td>{paymentInfo.serviceFee?.toLocaleString()} 원</td>
                      <th>배송비</th><td>｜</td><td>{paymentInfo.deliveryFee?.toLocaleString()} 원</td>
                      <th>총 결제 금액</th><td>｜</td>
                      <td style={{ color: "#FFA6C9", fontWeight: "bold" }}>
                        {paymentInfo.totalPrice?.toLocaleString()} 원
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="ticket-set-setting2">
            <div className="ticket-set-setting">
              <div className="read-set">
                <div className="ticket-img">
                  <img src={Ticket} alt="티켓_사진" className="ticket-base-img" />
                  <img src={TKNOW_w} alt="티켓_사진" className="ticket-logow-img" />
                  <div className="ticket-buy6-text1">{serialNumber}</div>
                  <div className="ticket-buy6-text2">{paymentInfo.ticketTitle}</div>

                  <table className="ticket-buy6-table">
                    <tr><th>예매번호</th><td>｜</td><td>{paymentInfo.orderId}</td></tr>
                    <tr><th>좌석위치</th><td>｜</td><td>{paymentInfo.seatInfo}</td></tr>
                    <tr><th>날짜</th><td>｜</td><td colSpan={3}>{paymentInfo?.ticketDate ? new Date(paymentInfo.ticketDate).toLocaleString("ko-KR") : ''}</td></tr>
                    <tr><th>장소</th><td>｜</td><td>{paymentInfo.ticketVenue}</td></tr>
                  </table>

                  <div className="ticket-qr-box">
                    <QRCodeCanvas
                      className="ticket-qr-img"
                      value={serialNumber}
                      size={150}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="Q"
                    />
                  </div>
                </div>
              </div>
            </div>

            <br />
            <div className="ticket-stage-button2">
              <Link to={`/Ticket/Buy5/${paymentInfo.ticketId}`} className="ticket-stage-back">
                이전 단계
              </Link>
              <button onClick={handleClose} className="ticket-stage-next3">
                나가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
