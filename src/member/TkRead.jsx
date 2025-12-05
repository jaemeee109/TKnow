// src/member/TkRead.jsx
import React, { useState, useEffect } from "react";
import "../css/member.css";
import "../css/style.css";
import { Link, useParams } from "react-router-dom";
import Ticket from "../images/ticket.png";
import TKNOW_w from "../images/TKNOW_w.png";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api";
import MemberSidebar from "./MemberSidebar";
export default function TickRead() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    api
      .get(`/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data) {
          console.log("📦 받은 데이터:", res.data); // ✅ 디버깅용
          setData(res.data);
        } else {
          setError("데이터가 존재하지 않습니다.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("티켓 조회 실패:", err);
        setError(
          err.response?.data?.message || "티켓 정보를 불러올 수 없습니다."
        );
        setLoading(false);
      });
  }, [orderId]);

  // 🔹 로딩 화면
  if (loading) {
    return (
      <div className="member-Member-page">
        <div className="member-right">
          <div className="member-myTk-box2">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 에러 화면
  if (error) {
    return (
      <div className="member-Member-page">
        <div className="member-right">
          <div className="member-myTk-box2">
            <div style={{ color: "red" }}>❌ {error}</div>
          </div>
        </div>
      </div>
    );
  }

  //  데이터 없음
  if (!data) {
    return <div>데이터가 없습니다.</div>;
  }

  // 장소 처리 - ticketVenue 필드 사용
  const venueName = data.ticketVenue || "장소 정보 없음";
  
  // 연락처 처리
  const memberPhone = data.memberPhone || "연락처 정보 없음";
  
  // 디버깅: 장소가 null인지 확인
  if (!data.ticketVenue) {
    console.warn("⚠️ ticketVenue가 null입니다! 백엔드 쿼리를 확인하세요.");
  }

  // 이미지 안전하게 표시
  const ticketImg = data.ticketImage || Ticket;

  // 가격 계산
  const ticketPrice = data.ticketPrice || 0;
  const fee = data.serviceFee || Math.round(ticketPrice * 0.1); // 백엔드 값 우선
  const deliveryFee = 0;
  const totalAmount = ticketPrice + fee + deliveryFee;

  return (
    <div className="member-Member-page">
      <MemberSidebar active="myContact" />
      <div className="member-right">
        <div className="member-myTk-box2">
          <div className="mytick-main-box">
            <strong>예매 상세 확인 및 취소</strong>
            <br />
            <br />

            <div className="member-tkRead-conBox">
              <div className="tkRead-cons-list">
                <strong>{data.ticketTitle}</strong>
                <br />
                <br />
                <img
                  src={ticketImg}
                  alt="콘서트_썸네일"
                  className="member-tkRead-consImg"
                  onError={(e) => {
                    e.target.src = Ticket;
                  }}
                />
                <span>상세보기</span>
              </div>

              <div className="member-tkRead-dayBox">
                <div className="member-tkRead-my">
                  <table>
                    <tbody>
                      <tr>
                        <th>예매자</th>
                        <td>{data.memberName || "정보 없음"}</td>
                      </tr>
                      <tr>
                        <th>예매번호</th>
                        <td>{data.orderTicketId || "정보 없음"}</td>
                      </tr>
                      <tr>
                        <th>이용일</th>
                        <td>{data.ticketDate || "정보 없음"}</td>
                      </tr>
                      <tr>
                        <th>장소</th>
                        <td style={{ color: venueName === "장소 정보 없음" ? "red" : "inherit" }}>
                          {venueName}
                        </td>
                      </tr>
                      <tr>
                        <th>좌석</th>
                        <td>{data.seatCode || "정보 없음"}</td>
                      </tr>
                      <tr>
                        <th>티켓 수령 방법</th>
                        <td>모바일 티켓</td>
                      </tr>
                      <tr>
                        <th>받으시는 분</th>
                        <td>{data.memberName || "정보 없음"}</td>
                      </tr>
                      <tr>
                        <th>연락처</th>
                        <td style={{ color: memberPhone === "연락처 정보 없음" ? "red" : "inherit" }}>
                          {memberPhone}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <br />
            <strong>모바일 티켓 확인</strong>
            <div className="member-tkRead-conBox2">
              <div className="tkread-ticket-tkRead">
                <div className="ticket-img">
                  <img src={Ticket} alt="티켓_사진" className="ticket-base-img" />
                  <img src={TKNOW_w} alt="티켓_로고" className="ticket-logow-img" />
                  <div className="ticket-buy6-text1">{data.qr}</div>
                  <div className="ticket-buy6-text2">{data.ticketTitle}</div>
                  <div className="ticket-buy6-text1">{data.orderId}</div>
                  <div className="ticket-buy6-text2">{data.concertTitle}</div>

                  <table className="ticket-buy6-table">
                    <tbody>
                      <tr>
                        <th>예매 번호</th>
                        <td>｜</td>
                        <td>{data.orderTicketId}</td>
                      </tr>
                      <tr>
                        <th>좌석 번호</th>
                        <td>｜</td>
                        <td>{data.seatCode}</td>
                      </tr>
                      <tr>
                        <th>날짜</th>
                        <td>｜</td>
                        <td>{data.ticketDate}</td>
                      </tr>
                      <tr>
                        <th>장소</th>
                        <td>｜</td>
                        <td>{venueName}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="ticket-qr-box">
                    <QRCodeCanvas
                      className="ticket-qr-img"
                      value={data.qr || ""}
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
            <strong>예매 내역</strong>
            <div className="member-tkRead-conBox4">
              <table className="member-tkRead-text1">
                <tbody>
                  <tr>
                    <th>예매 번호</th>
                    <td>｜</td>
                    <td>{data.orderTicketId}</td>
                    <th>배송</th>
                    <td>｜</td>
                    <td>{data.deliveryType || "모바일 티켓"}</td>
                    <th>가격 등급</th>
                    <td>｜</td>
                    <td>일반</td>
                  </tr>
                  <tr>
                    <th>좌석번호</th>
                    <td>｜</td>
                    <td>{data.seatCode}</td>
                    <th>가격</th>
                    <td>｜</td>
                    <td>{ticketPrice.toLocaleString()} 원</td>
                    <th>취소 여부</th>
                    <td>｜</td>
                    <td>{data.cancelable ? "가능" : "불가"}</td>
                  </tr>
                  <tr>
                    <th>수수료</th>
                    <td>｜</td>
                    <td>{fee.toLocaleString()} 원</td>
                    <th>배송비</th>
                    <td>｜</td>
                    <td>{deliveryFee.toLocaleString()} 원</td>
                    <th>총 결제 금액</th>
                    <td>｜</td>
                    <td style={{ color: "#FFA6C9", fontWeight: "bold" }}>
                      {totalAmount.toLocaleString()} 원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}