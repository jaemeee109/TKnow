import React, { useState, useEffect } from "react";
import "../css/style.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cons from "../images/cons.png";
import Ticket from "../images/ticket.png";
import TKNOW_w from "../images/TKNOW_w.png";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

export default function TicketBuy6() {
  const location = useLocation();
  const navigate = useNavigate();

  const [paymentInfo, setPaymentInfo] = useState(null);

  // 결제 정보 불러오기
  useEffect(() => {
    const info = location.state || JSON.parse(localStorage.getItem("lastPayment") || "{}");
    setPaymentInfo(info);
  }, [location]);

  // DB에 결제 정보 저장
  useEffect(() => {
    if (!paymentInfo || !paymentInfo.orderId) return;

    const token = localStorage.getItem("accessToken");

    // 결제 정보 저장
    const payData = {
      ordersId: paymentInfo.orderId,
      payMethod: paymentInfo.paymentMethod || "카카오페이",
      payInstrument: paymentInfo.paymentInstrument || paymentInfo.paymentMethod,
      agreeTerms: true,
    };

    axios
      .post("http://localhost:9090/ticketnow/pay/ready", payData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(res => console.log("✅ 결제 정보 DB 저장 완료:", res.data))
      .catch(err => console.error("❌ 결제 저장 실패:", err));
  }, [paymentInfo]);

  // 주문 정보 저장 후 나가기
  const handleClose = async () => {
    if (!paymentInfo) return;

    const token = localStorage.getItem("accessToken");

    try {
      await axios.post(
        "http://localhost:9090/ticketnow/orders",
        {
          ticketId: paymentInfo.ticketId,
          seatInfo: paymentInfo.seatInfo,
          totalPrice: paymentInfo.totalPrice,
          paymentMethod: paymentInfo.paymentMethod,
          orderNumber: paymentInfo.orderId,
          deliveryMethod: paymentInfo.deliveryMethod || "현장수령",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ 주문 데이터 DB 저장 완료!");
    } catch (err) {
      console.error("❌ 주문 저장 실패:", err);
    }

    // 창 닫기 혹은 홈으로 이동
    if (window.opener) {
      window.close();
    } else {
      navigate("/");
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

  // ✅ serialNumber 선언
  const serialNumber = paymentInfo.orderId;

  return (
    <div className="ticket-buy-main">
      <div className="ticket-buy-page">
        {/* 상단 단계 표시 */}
        <div className="ticket-buy-top">
          <button className="ticket-buy-button2">01 날짜 선택</button>
          <button className="ticket-buy-button2">02 좌석 선택</button>
          <button className="ticket-buy-button2">03 가격 선택</button>
          <button className="ticket-buy-button2">04 배송 선택</button>
          <button className="ticket-buy-button1">05 결제 완료</button>
        </div>

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
                          <tr>2025 투모로우바이투게더 단독 콘서트 &lt;#: 유화&gt;</tr><br />
                          <tr>잠실 올림픽경기장</tr><br />
                          <tr>2025. 12. 05 (금) 14:00 </tr><br />
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
                      <td>{new Date(paymentInfo.paymentDate).toLocaleDateString("ko-KR")}</td>
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
                      <th>가격 등급</th><td>｜</td><td>일반 {paymentInfo.normalCount}매</td>
                    </tr>
                    <tr>
                      <th>좌석번호</th><td>｜</td><td>{paymentInfo.seatInfo}</td>
                      <th>가격</th><td>｜</td><td>{paymentInfo.totalPrice?.toLocaleString()} 원</td>
                      <th>취소 여부</th><td>｜</td><td>가능</td>
                    </tr>
                    <tr>
                      <th>수수료</th><td>｜</td><td>14,300 원</td>
                      <th>배송비</th><td>｜</td><td>5,700 원</td>
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

          {/* 티켓 */}
          <div className="ticket-set-setting2">
            <div className="ticket-set-setting">
              <div className="read-set">
                <div className="ticket-img">
                  <img src={Ticket} alt="티켓_사진" className="ticket-base-img" />
                  <img src={TKNOW_w} alt="티켓_사진" className="ticket-logow-img" />
                  <div className="ticket-buy6-text1">{serialNumber}</div>
                  <div className="ticket-buy6-text2">
                    2025 투모로우바이투게더 단독 콘서트 &lt; #: 유화 &gt;
                  </div>

                  <table className="ticket-buy6-table">
                    <tr><th>예매번호</th><td>｜</td><td>{paymentInfo.orderId}</td></tr>
                    <tr><th>좌석위치</th><td>｜</td><td>{paymentInfo.seatInfo}</td></tr>
                    <tr><th>날짜</th><td>｜</td><td>2025. 12. 05 (금) 14:00 </td></tr>
                    <tr><th>장소</th><td>｜</td><td>잠실 올림픽경기장</td></tr>
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
