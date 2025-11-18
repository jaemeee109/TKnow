import React, { useState, useEffect } from "react";
import "../css/style.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Cons from "../images/cons.png";

export default function TicketBuy() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);

  // --------------------------
  // 티켓 데이터 불러오기
  // --------------------------
  useEffect(() => {
    axios.get(`http://localhost:9090/ticketnow/tickets/${id}`)
      .then(res => {
        const data = res.data;
        setTicket(data);

        // startAt 처리 (배열형 또는 문자열형)
        if (data?.startAt) {
          const startDate = Array.isArray(data.startAt)
            ? new Date(data.startAt[0], (data.startAt[1] || 1) - 1, data.startAt[2] || 1)
            : new Date(data.startAt);
          setSelectedDate(startDate);
        }

        // rounds 처리
        const rounds = normalizeRounds(data?.rounds);
        if (rounds.length > 0) setSelectedRound(rounds[0].display);
      })
      .catch(err => console.error("티켓 정보 로드 실패:", err));
  }, [id]);

  // --------------------------
  // DB에서 온 회차 데이터를 안전하게 표시용 문자열 배열로 변환
  // --------------------------
  const normalizeRounds = (rawRounds) => {
    if (!rawRounds || !Array.isArray(rawRounds)) return [];
    const out = rawRounds
      .map(r => {
        if (!r) return null;
        if (typeof r === "string") return { raw: r, display: r };
        if (typeof r === "object" && r.time) return { raw: r, display: String(r.time) };
        if (typeof r === "object" && r.startAt) {
          try {
            const d = new Date(r.startAt);
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            return { raw: r, display: `${hh}:${mm}` };
          } catch { return null; }
        }
        return null;
      })
      .filter(Boolean);

    // 중복 제거
    const unique = [];
    const seen = new Set();
    for (const item of out) {
      if (!seen.has(item.display)) {
        seen.add(item.display);
        unique.push(item);
      }
    }
    return unique;
  };

  // --------------------------
  // 날짜 클릭
  // --------------------------
  const handleDateClick = (day) => {
    const isAvailable = ticket?.availableDates ? ticket.availableDates.includes(day) : true;
    if (!isAvailable) return;
    const start = ticket?.startAt;
    if (!start) return;
    const newDate = Array.isArray(start)
      ? new Date(start[0], (start[1] || 1) - 1, day)
      : new Date(start);
    setSelectedDate(newDate);
  };

  // --------------------------
  // 회차 선택
  // --------------------------
  const handleRoundClick = (roundDisplay) => setSelectedRound(roundDisplay);

  // --------------------------
  // 총 결제금액 계산
  // --------------------------
  const totalPrice = (ticket?.basePrice || ticket?.seats?.[0]?.price || 0)
    + (ticket?.fee || 0)
    + (ticket?.deliveryFee || 0)
    - (ticket?.discount || 0);

  // --------------------------
  // 렌더링
  // --------------------------
  if (!ticket) return <div>로딩 중...</div>; // ticket이 없으면 안전하게 로딩 표시

  const roundsToShow = normalizeRounds(ticket?.rounds);

  return (
    <div className="ticket-buy-main">
      <div className="ticket-buy-page">
        {/* 단계 표시 */}
        <div className="ticket-buy-top">
          <button className="ticket-buy-button1">01&nbsp;<span className="ticket-buy-button-text1">날짜 선택</span></button>
          <button className="ticket-buy-button2">02&nbsp;<span className="ticket-buy-button-text1">좌석 선택</span></button>
          <button className="ticket-buy-button2">03&nbsp;<span className="ticket-buy-button-text1">가격 선택</span></button>
          <button className="ticket-buy-button2">04&nbsp;<span className="ticket-buy-button-text1">배송 선택</span></button>
          <button className="ticket-buy-button2">05&nbsp;<span className="ticket-buy-button-text1">결제하기</span></button>
        </div>
        <br />

        <div className="ticket-buy-middle">
          <div className="ticket-buy-middle-box">
            {/* 좌측: 날짜, 회차, 좌석 */}
            <div className="ticket-buy-middle-box1">
              {/* 날짜 선택 캘린더 */}
              <div className="ticket-buy-day1">
                <strong>관람일 선택</strong><br /><br />
                <div className="calendar1">
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const isAvailable = ticket?.availableDates?.includes(day);
                    const isSelected = selectedDate &&
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === ((ticket?.startAt?.[1] || 1) - 1) &&
                      selectedDate.getFullYear() === (ticket?.startAt?.[0] || 0);
                    return (
                      <button
                        key={day}
                        className={`calendar-day ${isSelected ? "selected" : ""}`}
                        style={{
                          color: isAvailable ? "#000" : "#aaa",
                          cursor: isAvailable ? "pointer" : "not-allowed"
                        }}
                        onClick={() => isAvailable && handleDateClick(day)}
                        disabled={!isAvailable}
                        title={isAvailable ? `예매 가능: ${day}일` : `예매 불가`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: "10px" }}>
                  선택 날짜: {selectedDate ? selectedDate.toLocaleDateString("ko-KR") : "-"}
                </div>
              </div>

              {/* 회차 선택 */}
              <div className="ticket-buy-day2">
                <strong>회차</strong>&nbsp;
                <span style={{ fontSize: "16px", color: "#ffbcd4" }}>(관람 시간)</span>
                <div className="ticket-buy-round">
                  {roundsToShow.length > 0 ? (
                    roundsToShow.map((r, idx) => (
                      <button
                        key={idx}
                        className={`round-btn ${selectedRound === r.display ? "selected" : ""}`}
                        onClick={() => handleRoundClick(r.display)}
                      >
                        {r.display}
                      </button>
                    ))
                  ) : (
                    <button className="round-btn selected">예정 없음</button>
                  )}
                </div>
              </div>

              {/* 좌석 등급 / 잔여석 */}
              <div className="ticket-buy-day3">
                <strong>좌석 등급 / 잔여석</strong>
                <div className="ticket-buy-seat">
                  {ticket?.seats?.map((s, idx) => (
                    <p key={idx}>{s.grade}석 {s.price?.toLocaleString() || "0"}원 / {s.remaining}석</p>
                  ))}
                </div>
              </div>
            </div>

            {/* 유의사항 */}
            <div className="ticket-buy-note">
              <strong>유의사항</strong>
              <div className="ticket-buy-note-text">
                <p>장애인, 국가유공자 할인 가격 예매 시 현장 수령만 가능하며, 현장에 증명서류 미지침시 할인 불가합니다.</p>
                <p>할인 쿠폰을 사용하여 예매한 티켓은 부분 취소가 불가합니다.</p>
                <p>당일 관리 상품 예매시는 취소 불가합니다.</p>
                <p>취소 수수료와 취소 가능일자는 상품별로 다르니, 오른쪽 하단 My 예매 정보에서 확인해 주세요.</p>
                <p>ATM 기기에서 가상 계좌 입금이 안 될 수 있으니 인터넷 / 폰 뱅킹이 어려우시면 무통장 입금 외 다른 결제 수단을 선택해 주세요.</p>
              </div>
            </div>
          </div>

          {/* 우측: My 예매 정보 */}
          <div className="ticket-set-setting2">
            <div className="ticket-set-setting">
              <div className="read-set">
                <div className="cons-img">
                  <img src={Cons} alt="콘서트_썸네일" />
                </div>
                <div className="read-table">
                  <table>
                    <tbody>
                      <tr><th>{ticket?.title || "제목 없음"}〉</th></tr>
                      <tr><th>{ticket?.startAt?.join(".")} ~ {ticket?.endAt?.join(".")}</th></tr>
                      <tr><th>{ticket?.venueName || "미정"}</th></tr>
                      <tr><th>{ticket?.ageLimit || "미정"}</th></tr>
                      <tr><th>관람 시간: {ticket?.duration || 0} 분</th></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <table className="ticket-buy-table2">
                <tbody>
                  <strong className="ticket-buy-my">My 예매 정보 </strong>
                  <br />
                  <tr><th>일시</th><td>{selectedDate ? selectedDate.toLocaleString("ko-KR") : "선택 전"}</td></tr>
                  <tr><th>선택 좌석</th><td>선택 전</td></tr>
                  <tr><th>티켓 금액</th><td>{ticket?.basePrice?.toLocaleString() || "0"} 원</td></tr>
                  <tr><th>수수료</th><td>{ticket?.fee?.toLocaleString() || "0"} 원</td></tr>
                  <tr><th>배송료</th><td>{ticket?.deliveryFee?.toLocaleString() || "0"} 원</td></tr>
                  <tr><th>할인</th><td>{ticket?.discount?.toLocaleString() || "0"} 원</td></tr>
                  <tr><th>취소기한</th><td>{ticket?.cancelDate || "-"}</td></tr>
                  <tr><th>취소수수료</th><td>{ticket?.cancelFee ?? "-"}</td></tr>
                </tbody>
              </table>

              <div className="ticket-buy-total">
                <span>총 결제 금액</span>
                <strong>{totalPrice.toLocaleString()}</strong>
                <p>원</p>
              </div>
            </div>
            <br />
            <Link to={`/Ticket/Buy2/${id}`} className="ticket-next-btn">다음 단계</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
