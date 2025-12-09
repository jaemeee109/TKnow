// src/Ticket/TicketBuy2.jsx
import React, { useState, useEffect } from "react";
import "../css/ticket.css";
import "../css/style.css";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Stage from "../images/stage.png";
import api from "../api";

export default function TicketBuy2() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedDate, selectedSeat, selectedRoundNo, ticketDate, ticket } =
    location.state || {};
  const prevSelectedDate = location.state?.selectedDate;
  const [ticketState, setTicketState] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // F1 ~ F4 구역별 이동 함수
  const handleGoF1 = () => {
    navigate(`/Floor/F1/${id}`, {
      state: { selectedSeat, selectedDate, selectedRoundNo, ticket: ticketState },
    });
  };

  const handleGoF2 = () => {
    navigate(`/Floor/F2/${id}`, {
      state: { selectedSeat, selectedDate, selectedRoundNo, ticket: ticketState },
    });
  };

  const handleGoF3 = () => {
    navigate(`/Floor/F3/${id}`, {
      state: { selectedSeat, selectedDate, selectedRoundNo, ticket: ticketState },
    });
  };

  const handleGoF4 = () => {
    navigate(`/Floor/F4/${id}`, {
      state: { selectedSeat, selectedDate, selectedRoundNo, ticket: ticketState },
    });
  };

  useEffect(() => {
    api
      .get(`/tickets/${id}`)
      .then((res) => {
        console.log(res.data); // <-- 여기서 확인
        setTicketState(res.data);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleSelectSeat = (seat) => {
    if (!selectedSeats.find((s) => s.id === seat.id)) {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const basePrice = ticketState?.price || 0; // R석
  const sPrice = ticketState ? Math.floor(ticketState.price * 0.92) : 0; // s석

  return (
    <div className="ticket-stage-main">
      <div className="ticket-seage-page">
        <div className="ticket-buy-top">
          <button className="ticket-buy-button2">
            01&nbsp;<span className="ticket-buy-button-text1">날짜 선택</span>
          </button>
          <button className="ticket-buy-button1">
            02&nbsp;<span className="ticket-buy-button-text1">좌석 선택</span>
          </button>
          <button className="ticket-buy-button2">
            03&nbsp;<span className="ticket-buy-button-text1">가격 선택</span>
          </button>
          <button className="ticket-buy-button2">
            04&nbsp;<span className="ticket-buy-button-text1">배송 선택</span>
          </button>
          <button className="ticket-buy-button2">
            05&nbsp;<span className="ticket-buy-button-text1">결제하기</span>
          </button>
        </div>
        <br />

        <div className="ticket-stage-middle">
          <p className="ticket-stage-box">
            원하시는 영역을 선택해 주세요. 공연장에서 위치를 클릭하거나, 오른쪽의 좌석을
            선택해 주세요.
          </p>
          <br />
          <br />

          <div
            className="ticket-stage-map"
            style={{ position: "relative", display: "inline-block" }}
          >
            <img src={Stage} className="ticket-stage-img" alt="좌석 배치도" />

            {/* F1 ~ F4 구역 클릭 시 각 구역 전용 페이지로 이동 */}
            <div className="zone zone-f1" onClick={handleGoF1}></div>
            <div className="zone zone-f2" onClick={handleGoF2}></div>
            <div className="zone zone-f3" onClick={handleGoF3}></div>
            <div className="zone zone-f4" onClick={handleGoF4}></div>
          </div>

          <div className="ticket-stage-info">
            <div className="ticket-stage-header">
              <button className="ticket-stage-view">
                <span className="ticket-stage-pink">좌석 선택</span>
                <p />
                <span className="ticket-stage-pink2">
                  원하는 좌석 위치를 선택하세요
                </span>
              </button>
              <br />
              <br />
            </div>

            <div className="ticket-stage-grade">
              <h4>좌석 등급 / 잔여석</h4>
              <br />
              <div className="ticket-stage-box2">
                {ticketState?.seats?.map((s, idx) => (
                  <div key={idx}>
                    <span
                      className={`ticket-stage-color ${s.grade.toLowerCase()}`}
                    ></span>
                    {s.grade}석 ({s.type || "STANDING"}){" "}
                    <strong>{s.price?.toLocaleString() || "0"}원</strong>
                  </div>
                )) || (
                  <>
                    <div>
                      <span className="ticket-stage-color r"></span>
                      R석 (STANDING){" "}
                      <strong>{basePrice.toLocaleString()}원</strong>
                    </div>
                    <div>
                      <span className="ticket-stage-color s"></span>
                      S석 (STANDING) <strong>{sPrice.toLocaleString()}원</strong>
                    </div>
                  </>
                )}
              </div>
            </div>
            <br />
            <br />

            <div className="ticket-stage-buttons">
              <Link
                to={`/Ticket/Buy3/${id}`}
                state={{
                  selectedDate,
                  selectedSeat,
                  selectedRoundNo,
                  ticketDate,
                  ticket: ticketState,
                }}
                className="ticket-stage-next"
              >
                다음 단계
              </Link>
            </div>
            <br />

            <div className="ticket-stage-button2 ticket-stage-button-single">
              <Link
                to={`/Ticket/Buy/${id}`}
                state={{ selectedDate, selectedSeat, ticket: ticketState }}
                className="ticket-stage-back"
              >
                이전 단계
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
