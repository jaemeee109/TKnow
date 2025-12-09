// src/Ticket/FloorF3.jsx
import React, { useEffect, useState } from "react";
import "../css/ticket.css";
import "../css/style.css";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api";

const SEATS_PER_ROW = 20;

export default function F3Floor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedDate, selectedRoundNo, ticket } = location.state || {};
  const [ticketInfo, setTicketInfo] = useState(ticket || null);

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const roundNo = selectedRoundNo || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!ticketInfo) {
          const ticketRes = await api.get(`/tickets/${id}`);
          setTicketInfo(ticketRes.data);
        }

        const seatRes = await api.get(`/tickets/${id}/seats`, {
          params: { roundNo: roundNo, zone: "F3" }
        });

        const list = Array.isArray(seatRes.data) ? seatRes.data : [];

        const mapped = list.map((s) => ({
          id: s.seatId,
          dbId: s.seatId,
          seatCode: s.seatCode,
          grade: s.seatClass,
          status: s.seatStatus,
        }));

        setSeats(mapped);
      } catch (err) {
        console.error("F3 좌석 정보 로드 실패:", err);
        setSeats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSeatClick = (seat, rowIndex, colIndex) => {
    const isReserved =
      seat.status === "RESERVED" ||
      seat.status === "PAID" ||
      seat.status === "HOLD";

    if (isReserved) {
      alert("이미 예약/결제된 좌석입니다.");
      return;
    }

    setSelectedSeat({
      ...seat,
      row: rowIndex + 1,
      number: colIndex + 1,
      zone: "F3",
    });
  };

  const handleNext = () => {
    if (!selectedSeat) {
      alert("좌석을 선택해 주세요.");
      return;
    }
    navigate(`/Ticket/Buy3/${id}`, {
      state: { selectedSeat, selectedDate, selectedRoundNo: roundNo },
    });
  };


  const seatRows = [];
  for (let i = 0; i < seats.length; i += SEATS_PER_ROW) {
    seatRows.push(seats.slice(i, i + SEATS_PER_ROW));
  }

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
          {loading ? (
            <p style={{ textAlign: "center" }}>
              좌석 정보를 불러오는 중입니다...
            </p>
          ) : (
            <div className="ticket-stage-map seat-grid-wrapper">
              {seatRows.map((rowSeats, rowIndex) => (
                <div key={rowIndex} className="seat-row">
                  <span className="seat-row-label">F3구역 입장 번호</span>
                  <div className="seat-row-seats">
                    {rowSeats.map((seat, colIndex) => {
                      const isReserved =
                        seat.status === "RESERVED" ||
                        seat.status === "PAID" ||
                        seat.status === "HOLD";
                      const isSelected =
                        selectedSeat && selectedSeat.dbId === seat.dbId;

                      let bgColor =
                        seat.grade === "S" ? "#ffe0ea" : "#d9d9d9";
                      if (isReserved) {
                        bgColor = "#999999";
                      } else if (isSelected) {
                        bgColor = "#FFA6C9";
                      }

                      return (
                        <div
                          key={seat.id}
                          className={
                            "seat-box" +
                            (isReserved ? " reserved" : "") +
                            (isSelected ? " selected" : "")
                          }
                          style={{ backgroundColor: bgColor }}
                          onClick={() =>
                            !isReserved &&
                            handleSeatClick(seat, rowIndex, colIndex)
                          }
                          title={`${seat.grade}석 F3구역 ${rowIndex + 1
                            }열 ${colIndex + 1}번 (${seat.seatCode})`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="ticket-f2-info">
            <div className="ticket-stage-selected">
              <h4>선택 좌석 / 예매 정보</h4>
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
                    <td>
                      {selectedSeat
                        ? `F3 구역 - ${selectedSeat.row}열 - ${selectedSeat.number}번`
                        : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <br />

            <div className="ticket-stage-buttons">
              <button className="ticket-stage-next" onClick={handleNext}>
                좌석 선택 완료
              </button>
            </div>
            <br />

            <div className="ticket-stage-button2">
              <Link
                to={`/Ticket/Buy2/${id}`}
                state={{ selectedDate, selectedRoundNo: roundNo, ticketInfo }}
                className="ticket-stage-back"
              >
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
