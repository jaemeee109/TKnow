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

const API_BASE = (process.env.REACT_APP_API_BASE || api.defaults.baseURL || "").replace(
  /\/$/,
  ""
);

/** 대표 이미지 경로 처리 (상대경로 → 절대 URL) */
const resolveImageUrl = (path) => {
  if (!path) return Cons;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
};

/** '년.월.일. (오전/오후) 시:분' 형식으로, 초 제거해서 표시 */
const formatDateTimeWithoutSeconds = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const isPM = hours >= 12;
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${year}.${month}.${day}. ${isPM ? "오후" : "오전"} ${displayHour}:${minutes}`;
};

export default function TicketBuy6() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState(null);
  // ★ 추가: 티켓 상세 (대표이미지용)
  const [ticket, setTicket] = useState(null);

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

  // ★ 추가: paymentInfo 로부터 ticketId 받아서 티켓 상세(대표이미지 포함) 다시 조회
  useEffect(() => {
    if (!paymentInfo?.ticketId) return;

    api
      .get(`/tickets/${paymentInfo.ticketId}`)
      .then((res) => {
        console.log("TicketBuy6 티켓 상세 조회 성공:", res.data);
        setTicket(res.data);
      })
      .catch((err) => {
        console.error("TicketBuy6 티켓 상세 조회 실패:", err);
      });
  }, [paymentInfo]);

  const handleClose = async () => {
    if (!paymentInfo) {
      alert("결제 정보가 없습니다.");
      return;
    }

    const method = paymentInfo.paymentMethod;

    // 1) 신용카드 결제: 이미 TicketCardPg.jsx 에서
    //    - /orders (주문 + order_ticket 생성)
    //    - /pay/card/approve (결제 승인, orders_status/seat_status = PAID)
    //    까지 모두 완료된 상태이므로 여기서는 창만 닫기
    if (method === "신용카드") {
      alert("예매가 완료되었습니다.");
      // 새 창으로 열린 예매 창 닫기
      window.close();
      return;
    }

    // 2) 무통장입금 등 비카드 결제:
    //    여기서 한 번만 /orders 를 호출해서
    //    orders_status = CREATED 상태의 주문을 생성하고,
    //    order_ticket 에 seat_id 를 묶어 좌석을 잠급니다.

    if (!paymentInfo.seatIdList || paymentInfo.seatIdList.length === 0) {
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
      // [무통장입금 등] 주문 생성 (/orders)
      const orderResponse = await api.post("/orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const createdOrdersId = orderResponse.data;
      console.log(" 주문 생성 성공 ordersId =", createdOrdersId);

      // 이 시점에서 orders_status 는 기본값 CREATED,
      // order_ticket 에 seat_id 가 묶여 있기 때문에
      // 같은 좌석으로 다른 주문을 만들려고 하면
      // uk_order_ticket_seat 제약조건에 의해 자동으로 막힙니다.

      alert(
        "무통장 입금 주문이 생성되었습니다.\n해당 주문일의 마감 시간까지 입금이 완료되어야 예매가 확정됩니다."
      );

      // 무통장 입금 주문 생성 후에도 예매 창 닫기
      window.close();
    } catch (error) {
      console.error(" 주문 처리 중 오류:", error);
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

  // ====== 화면에 표시할 값들 정리 ======
  // (1)·(10) 예매번호: order_ticket_id 우선, 없으면 기존 orderId 사용
  const serialNumber = paymentInfo.orderTicketId || paymentInfo.orderId;

  // (3)·(12) 예매일시 / 공연일시 포맷
  const performanceDate = formatDateTimeWithoutSeconds(paymentInfo.ticketDate);
  const paymentDateFormatted = formatDateTimeWithoutSeconds(paymentInfo.paymentDate);

  // ★ 좌석등급: R / S
  // 1순위: Buy3~5에서 넘긴 paymentInfo.seatGrade
  // 2순위: paymentInfo.selectedSeat.grade
  // 3순위: seatInfo 문자열("R석 F3구역 ..." 형식)에서 첫 단어 파싱
  let seatGradeLabel = "";
  if (paymentInfo.seatGrade) {
    seatGradeLabel = paymentInfo.seatGrade;
  } else if (paymentInfo.selectedSeat) {
    const sel = paymentInfo.selectedSeat;
    if (typeof sel === "object" && sel.grade) {
      seatGradeLabel = sel.grade;
    } else if (typeof sel === "string") {
      const gradeText = sel.split(" ")[0] || ""; // "R석" / "S석"
      seatGradeLabel = gradeText.includes("S") ? "S" : "R";
    }
  } else if (typeof paymentInfo.seatInfo === "string" && paymentInfo.seatInfo.length > 0) {
    const gradeText = paymentInfo.seatInfo.split(" ")[0] || "";
    seatGradeLabel = gradeText.includes("S") ? "S" : "R";
  }

  // (5) 가격: 선택한 티켓의 가격 (단가)
  const unitPrice = paymentInfo.basePrice || 0;

  // (7) 수수료: 2,000원 고정
  const serviceFeeFixed = 2000;

  // (9) 총 결제 금액 = 티켓 가격 + 수수료
  const totalAmount = unitPrice + serviceFeeFixed;

  // (1) 대표 이미지 경로
  //   1순위: 방금 조회한 ticket.mainImageUrl
  //   2순위: Buy5 → 6 으로 넘어온 paymentInfo.ticketImage
  const thumbnailUrl = resolveImageUrl(
    (ticket && ticket.mainImageUrl) || paymentInfo.ticketImage || ""
  );

  return (
    <div className="ticket-buy-main">
      <div className="ticket-buy-page">
        <div className="ticket-buy-top">
          <button className="ticket-buy-button2">
            01&nbsp;
            <span className="ticket-buy-button-text1">날짜 선택</span>
          </button>
          <button className="ticket-buy-button2">
            02&nbsp;
            <span className="ticket-buy-button-text1">좌석 선택</span>
          </button>
          <button className="ticket-buy-button2">
            03&nbsp;
            <span className="ticket-buy-button-text1">가격 선택</span>
          </button>
          <button className="ticket-buy-button2">
            04&nbsp;
            <span className="ticket-buy-button-text1">배송 선택</span>
          </button>
          <button className="ticket-buy-button1">
            05&nbsp;
            <span className="ticket-buy-button-text1">결제하기</span>
          </button>
        </div>
        <br />

        <br />
        <div className="ticket-buy-middle">
          {/* ========== 왼쪽 카드 영역 ========== */}
          <div className="ticket-buy-middle-box">
            <div className="ticket-buy-middle-box1">
              <div className="ticket-buy6-box2">
                <div className="ticket-buy6-center1">
                  <div className="cons-img">
                    {/* (1) 대표이미지: 해당 공연 대표 이미지 */}
                    <img
                      src={thumbnailUrl}
                      alt={paymentInfo.ticketTitle || "콘서트 썸네일"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = Cons;
                      }}
                    />
                    <div className="ticket-buy6-table1">
                      <table>
                        <tbody>
                          <tr>{paymentInfo.ticketTitle}</tr>
                          <br />
                          <tr>{paymentInfo.ticketVenue}</tr>
                          <br />
                          <tr>
                            {/* (2) 공연시간: 회차 시간, 초 제거 */}
                            <td colSpan={3}>{performanceDate}</td>
                          </tr>
                          <br />
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <br />
                <strong>결제 내역</strong>
                {/* (3) 예매일시 / (4) 상태 / (5) 결제수단 */}
                <table className="ticket-buy6-center2">
                  <tbody>
                    <tr>
                      <th>예매일시</th>
                      <td>｜</td>
                      <td>{paymentDateFormatted}</td>
                      <th>상태</th>
                      <td>｜</td>
                      <td style={{ color: "#FFA6C9", fontWeight: "bold" }}>결제 완료</td>
                      <th>결제수단</th>
                      <td>｜</td>
                      <td>{paymentInfo.paymentMethod}</td>
                    </tr>
                  </tbody>
                </table>
                <br />

                <strong>예매 내역</strong>
                <br />
                <br />
                <table className="ticket-buy6-center2">
                  <tbody>
                    <tr>
                      {/* (1) 예매 번호: order_ticket_id */}
                      <th>예매 번호</th>
                      <td>｜</td>
                      <td>{serialNumber}</td>

                      {/* (2) 배송 → 수령 */}
                      <th>수령</th>
                      <td>｜</td>
                      <td>{paymentInfo.deliveryMethod || "현장"}</td>

                      {/* (3) 좌석 등급: R / S + 매수 */}
                      <th>좌석 등급</th>
                      <td>｜</td>
                      <td>
                        {seatGradeLabel
                          ? `${seatGradeLabel}석 ${normal}매`
                          : `일반 ${normal}매`}
                      </td>
                    </tr>
                    <tr>
                      {/* (4) 좌석번호 */}
                      <th>좌석번호</th>
                      <td>｜</td>
                      <td>{paymentInfo.seatInfo}</td>

                      {/* (5) 가격: 선택한 티켓 가격 */}
                      <th>가격</th>
                      <td>｜</td>
                      <td>{unitPrice.toLocaleString()} 원</td>

                      {/* (6) 취소 여부 */}
                      <th>취소 여부</th>
                      <td>｜</td>
                      <td>가능</td>
                    </tr>
                    <tr>
                      {/* (7) 수수료: 2,000원 고정 */}
                      <th>수수료</th>
                      <td>｜</td>
                      <td>{serviceFeeFixed.toLocaleString()} 원</td>

                      {/* (8) 배송비: 삭제 → (9) 총 결제 금액만 표시 */}
                      <th>총 결제 금액</th>
                      <td>｜</td>
                      <td colSpan={3} style={{ color: "#FFA6C9", fontWeight: "bold" }}>
                        {totalAmount.toLocaleString()} 원
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ========== 오른쪽 분홍 티켓 카드 ========== */}
          <div className="ticket-set-setting2">
            <div className="ticket-set-setting">
              <div className="read-set">
                <div className="ticket-img">
                  <img src={Ticket} alt="티켓_사진" className="ticket-base-img" />
                  <img src={TKNOW_w} alt="티켓_사진" className="ticket-logow-img" />

                  {/* 상단 예매번호/공연명 */}
                  <div className="ticket-buy6-text1">{serialNumber}</div>
                  <div className="ticket-buy6-text2">{paymentInfo.ticketTitle}</div>

                  {/* (10)~(13) 모바일 티켓 정보 */}
                  <table className="ticket-buy6-table">
                    <tbody>
                      {/* (10) 예매번호: order_ticket_id */}
                      <tr>
                        <th>예매번호</th>
                        <td>｜</td>
                        <td>{serialNumber}</td>
                      </tr>

                      {/* (11) 좌석위치: 등급 + 구역/행/열 */}
                      <tr>
                        <th>좌석위치</th>
                        <td>｜</td>
                        <td>
                          {seatGradeLabel
                            ? `${seatGradeLabel}석 ${paymentInfo.seatInfo}`
                            : paymentInfo.seatInfo}
                        </td>
                      </tr>

                      {/* (12) 날짜: 초 제거된 회차 시간 */}
                      <tr>
                        <th>날짜</th>
                        <td>｜</td>
                        <td colSpan={3}>{performanceDate}</td>
                      </tr>

                      {/* (13) 장소: venueName */}
                      <tr>
                        <th>장소</th>
                        <td>｜</td>
                        <td>{paymentInfo.ticketVenue}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* QR 코드 (예매번호 기준) */}
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
              <Link
                to={`/Ticket/Buy5/${paymentInfo.ticketId}`}
                className="ticket-stage-back"
                state={paymentInfo}
              >
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
