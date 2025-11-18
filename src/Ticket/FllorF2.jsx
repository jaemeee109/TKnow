import React, { useEffect, useState } from "react";
import "../css/style.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import F2 from "../images/f2.png";
import axios from "axios";

export default function TicketBuy2() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // 좌석 데이터 생성: 13행 × 12열
  const rows = 12;
  const cols = 13;
  const seatWidth = 37.2;
  const seatHeight = 34.1;
  const seatGap = 5.1;
  const startX = 160;
  const startY = 0;

  const seats = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      seats.push({
        id: `${r}-${c}`,
        grade: "R",
        row: r + 1,
        number: c + 1,
        x: startX + c * (seatWidth + seatGap),
        y: startY + r * (seatHeight + seatGap),
      });
    }
  }

  // DB에서 예약된 좌석 불러오기
  useEffect(() => {
    axios
      .get(`http://localhost:9090/ticketnow/tickets/${id}/reserved-seats`)
      .then((res) => {
        // DB에서 가져온 예약된 좌석 ID 배열
        setReservedSeats(res.data.reservedSeats || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("예약 좌석 조회 실패:", err);
        // 에러 발생 시 임시 데이터로 처리
        const randomReserved = [];
        const reservedCount = Math.floor(Math.random() * 50) + 23;
        for (let i = 0; i < reservedCount; i++) {
          const randomIndex = Math.floor(Math.random() * seats.length);
          if (!randomReserved.includes(seats[randomIndex].id)) {
            randomReserved.push(seats[randomIndex].id);
          }
        }
        setReservedSeats(randomReserved);
        setLoading(false);
      });
  }, [id]);

  const handleSelectSeat = (seat) => {
    if (reservedSeats.includes(seat.id)) {
      alert("이미 선택된 좌석입니다.");
      return;
    }
    setSelectedSeat(seat);
  };

  const handleSeatSubmit = () => {
    if (!selectedSeat) {
      alert("좌석을 선택하세요!");
      return;
    }
    
    // DB에 좌석 선택 저장 시도
    axios
      .post(`http://localhost:9090/ticketnow/tickets/${id}/select-seat`, {
        seatId: selectedSeat.id,
        grade: selectedSeat.grade,
        row: selectedSeat.row,
        number: selectedSeat.number,
      })
      .then((res) => {
        // 성공하면 다음 페이지로 이동
        navigate(`/Ticket/Buy3/${id}`, { 
          state: { 
            selectedSeat,
            seatCount: 1 
          } 
        });
      })
      .catch((err) => {
        console.error("좌석 저장 API 오류:", err);
        // API 없어도 일단 페이지 이동은 되게 (임시)
        console.log("API 없이 페이지 이동 진행");
        navigate(`/Ticket/Buy3/${id}`, { 
          state: { 
            selectedSeat,
            seatCount: 1 
          } 
        });
      });
  };

  return (
    <div className="ticket-stage-main">
      <div className="ticket-seage-page">
        <div className="ticket-buy-top">
          <button className="ticket-buy-button2">01&nbsp;<span className="ticket-buy-button-text1">날짜 선택</span></button>
          <button className="ticket-buy-button1">02&nbsp;<span className="ticket-buy-button-text1">좌석 선택</span></button>
          <button className="ticket-buy-button2">03&nbsp;<span className="ticket-buy-button-text1">가격 선택</span></button>
          <button className="ticket-buy-button2">04&nbsp;<span className="ticket-buy-button-text1">배송 선택</span></button>
          <button className="ticket-buy-button2">05&nbsp;<span className="ticket-buy-button-text1">결제하기</span></button>
        </div>
        <br />

        <div className="ticket-stage-middle">
          <p className="ticket-stage-box">
            원하시는 영역을 선택해 주세요. 공연장에서 위치를 클릭하거나, 오른쪽의 좌석을 선택해 주세요.
          </p>
          <br /><br />

          {loading ? (
            <p style={{ textAlign: "center" }}>좌석 정보를 불러오는 중입니다...</p>
          ) : (
            <div className="ticket-stage-map" style={{ position: "relative" }}>
              <img src={F2} className="ticket-f2-img" alt="좌석 배치도" />

              {seats.map((seat) => {
                const isReserved = reservedSeats.includes(seat.id);
                return (
                  <div
                    key={seat.id}
                    className={`seat ${selectedSeat?.id === seat.id ? "selected" : ""}`}
                    style={{
                      position: "absolute",
                      left: `${seat.x}px`,
                      top: `${seat.y}px`,
                      width: `${seatWidth}px`,
                      height: `${seatHeight}px`,
                      backgroundColor: isReserved
                        ? "#999"
                        : selectedSeat?.id === seat.id
                        ? "#FFA6C9"
                        : "#D9D9D9",
                      cursor: isReserved ? "not-allowed" : "pointer",
                    }}
                    onClick={() => handleSelectSeat(seat)}
                    title={`R석 ${seat.row}열 ${seat.number}`}
                  />
                );
              })}
            </div>
          )}

          <div className="ticket-f2-info">
            <div className="ticket-stage-selected">
              <h4>선택 좌석 / 예매 정보</h4><br />
              <table>
                <thead>
                  <tr>
                    <th>좌석 등급</th>
                    <th>좌석 번호</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selectedSeat ? selectedSeat.grade : "-"}</td>
                    <td>{selectedSeat ? `F2 구역 - ${selectedSeat.row}열 - ${selectedSeat.number}` : "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <br />

            <div className="ticket-stage-buttons">
              <button onClick={handleSeatSubmit} className="ticket-stage-next">
                좌석 선택 완료
              </button>
            </div>
            <br />

            <div className="ticket-stage-button2">
              <Link to={`/Ticket/Buy1/${id}`} className="ticket-stage-back">
                이전 단계
              </Link>
              <button
                className="ticket-stage-back"
                onClick={() => setSelectedSeat(null)}
              >
                좌석 다시 선택
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}