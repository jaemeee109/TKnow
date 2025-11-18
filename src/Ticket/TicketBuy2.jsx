import React, { useState, useEffect } from "react";
import "../css/style.css";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Stage from "../images/stage.png";
import axios from "axios";

export default function TicketBuy2() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedDate, selectedSeat } = location.state || {};
  const prevSelectedDate = location.state?.selectedDate;
  const [ticket, setTicket] = useState(null);

    const [selectedSeats, setSelectedSeats] = useState([]);

  const handleClick = (path) => {
    window.location.href = path;
  };
  
useEffect(() => {
    axios.get(`http://localhost:9090/ticketnow/tickets/${id}`)
      .then(res => setTicket(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleSelectSeat = (seat) => {
    if (!selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleNext = () => {
    navigate(`/Ticket/Buy3/${id}`, { state: { selectedDate: prevSelectedDate, selectedSeats } });
  };
  
  

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
            원하시는 영역을 선택해 주세요. 공연장에서 위치를 클릭하거나, 오른쪽의 좌석을 선택해 주세요.
          </p>
          <br /><br />

          <div className="ticket-stage-map" style={{ position: "relative", display: "inline-block" }}>
            <img src={Stage} className="ticket-stage-img" alt="좌석 배치도" />

            <div
              className="zone zone-f1"
              onClick={() => handleClick("")}
            ></div>

            <div
              className="zone zone-f2"
              onClick={() => handleClick(`/Fllor/F2`)}
            ></div>
          </div>

          <div className="ticket-stage-info">
            <div className="ticket-stage-header">
              <button className="ticket-stage-view">
                <span className="ticket-stage-pink">좌석도 전체보기</span><br />
                <span className="ticket-stage-pink2">원하는 좌석 위치를 선택하세요</span><br />
              </button>
              <br /><br />
            </div>

            <div className="ticket-stage-grade">
              <h4>좌석 등급 / 잔여석</h4><br />
              <div className="ticket-stage-box2">
                {ticket?.seats?.map((s, idx) => (
                  <div key={idx}>
                    <span className={`ticket-stage-color ${s.grade.toLowerCase()}`}></span>
                    {s.grade}석 ({s.type || "STANDING"}) <strong>{s.price?.toLocaleString() || "0"}원</strong>
                  </div>
                )) || (
                  <>
                    <div><span className="ticket-stage-color r"></span>R석 (STANDING) <strong>143,000원</strong></div>
                    <div><span className="ticket-stage-color s"></span>S석 (STANDING) <strong>132,000원</strong></div>
                  </>
                )}
              </div>
            </div>
            <br /><br />

            <div className="ticket-stage-selected">
              <h4>선택 좌석 / 예매 정보</h4><br />
			  {ticket?.seats?.map(seat => (
			           <button key={seat.id} onClick={() => handleSelectSeat(seat)}>
			             {seat.grade}석 {seat.number}
			           </button>
			         ))}
              <table>
                <thead>
                  <tr>
                    <th>좌석 등급</th>
                    <th>좌석 번호 / 예매일시</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selectedSeat?.split(" ")[0] || "선택 안됨"}</td>
                    <td>
                      {selectedSeat || "-"} <br />
                      {selectedDate ? selectedDate.toLocaleString("ko-KR") : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <br />

            <div className="ticket-stage-buttons">
              <Link 
                to={`/Ticket/Buy3/${id}`} 
                state={{ selectedDate, selectedSeat, ticket }}
                className="ticket-stage-next"
              >
                좌석 선택 완료
              </Link>
            </div>
            <br />

            <div className="ticket-stage-button2">
              <Link 
                to={`/Ticket/Buy/${id}`} 
                state={{ selectedDate, selectedSeat, ticket }}
                className="ticket-stage-back"
              >
                이전 단계
              </Link>
              <button className="ticket-stage-back">좌석 다시 선택</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
