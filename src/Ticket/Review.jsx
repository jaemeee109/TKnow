// src/Ticket/Review.jsx
import React, { useState, useEffect } from "react";
import "../css/ticket.css";
import "../css/style.css";
import { useParams, Link } from "react-router-dom";
import Boy from "../images/boy.png";
import Girl from "../images/girl.png";

export default function Review() {
  const { id } = useParams(); // URL에서 티켓 ID
  const [ticket, setTicket] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  // 날짜 클릭
  const handleDateClick = (dateStr) => setSelectedDate(dateStr);

  // YYYY.MM.DD 포맷
  const formatDate = (dateArr) => {
    if (!dateArr || !Array.isArray(dateArr)) return "-";
    const [year, month, day] = dateArr;
    if (!year || !month || !day) return "-";
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}.${mm}.${dd}`;
  };

  useEffect(() => {
    // 티켓 데이터 하드코딩 예시
    const t = {
      ticketId: id,
      title: "2025 투모로우바이투게더 단독 콘서트〈#: 유화〉",
      rank: "콘서트 주간 1위",
      startAt: [2025, 12, 5, 14, 0],
      endAt: [2025, 12, 7],
      duration: "300분",
      price: 143000,
      venueName: "잠실 올림픽경기장",
      delivery: "일괄배송",
      Boy: Boy,
      Girl: Girl,
      schedule: [
        {
          date: [2025, 12, 5],
          weekday: "금",
          round: "1회",
          time: "14:00",
        },
      ],
    };
    setTicket(t);
    setSelectedDate(formatDate(t.schedule[0].date));
  }, [id]);

  if (!ticket) return <div>로딩 중...</div>;

  const scheduleForSelectedDate =
    ticket.schedule?.filter((s) => formatDate(s.date) === selectedDate) || [];

  return (
    <div className="read-top">
      <div className="read-page">
        <div className="read-content">
          <div className="read-main">
            <section className="read-right">
              <h2>{ticket.title}</h2>
              <h3>{ticket.rank || "콘서트 주간 순위 없음"}</h3>

              <div className="read-set">
                <div className="cons-img">
                  <img src={ticket.Boy} alt={ticket.title} />
                </div>

                <div className="read-table">
                  <table>
                    <tbody>
                      <tr>
                        <th>장소</th>
                        <td>{ticket.venueName}</td>
                      </tr>
                      <tr>
                        <th>날짜</th>
                        <td>
                          {formatDate(ticket.startAt)} ~{" "}
                          {formatDate(ticket.endAt, formatDate(ticket.startAt))}
                        </td>
                      </tr>
                      <tr>
                        <th>공연 시간</th>
                        <td>{ticket.duration}</td>
                      </tr>
                      <tr>
                        <th>가격</th>
                        <td>{ticket.price} 원</td>
                      </tr>
                      <tr>
                        <th>배송</th>
                        <td>{ticket.delivery}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 버튼 영역 */}
              <div className="read-particular">
                <div className="button-class">
				<Link to={`/Ticket/${ticket.ticketId}`}>
								  <button className="read-button1">공연정보</button>
								</Link>
				                  <button className="read-button1">판매정보</button>
								  <Link to={`/Ticket/Review/${ticket.ticketId}`}>
								    <button className="read-button2">공연후기</button>
								  </Link>
				                  <button className="read-button1">기대평</button>
				                  <button className="read-button1">QNA</button>
                </div>
              </div><br/><br/>

              {/* 리뷰 목록 */}
              <div className="review-tol">
                <div className="review-box">
                  <p className="review-box-text">
                    게시판 운영 규정에 어긋난다고 판단되는 게시글은 사전 통보없이
                    블라인드 처리될 수 있습니다. 티켓 매매 및 양도의 글은 발견 즉시
                    삭제됩니다.
                  </p>
                </div>
                <br />

                <div className="review-quantity">
                  <span className="review-quantity-txt1">총</span>
                  <span className="review-quantity-txt2">1,039</span>
                  <span className="review-quantity-txt1">
                    개의 리뷰가 작성되었습니다
                  </span>
                </div>
                <br /><br />

                {/* 예시 리뷰 */}
                {[
                  {
                    star: "★★★★★",
                    title: "투바투 안 보고 인생 어떻게 살아요",
                    detail: "진심 비주얼에 죽고 무대에 죽고 나는 죽었슨",
                  }, 
                  {
                    star: "★★★★★",
                    title: "투바투 비주얼 아자쓰!!",
                    detail: "제가 지금까지 본 남자 중 제일 잘생김",
                  },
                  {
                    star: "★★★★★",
                    title: "무대가 진짜 미쳤어요 ㄷㄷ",
                    detail:
                      "아아아아아악!!!!!!!!!!!!!!!!!!!!!!!!!! 투바투와 이제 한몸이 되었음",
                  },
                  {
                    star: "★★★★★",
                    title: "투바투 사랑하고 투바투 정말 사랑하고",
                    detail: "지금 기분으로는 골든벨 백만 원도 가능할 것 같아요",
                  },
                  {
                    star: "★★★★★",
                    title: "연준아 사랑해!!!!!!!!!!!!!!!!",
                    detail: "최연준 나랑 결혼해!!!!!!!!!",
                  },
                ].map((r, idx) => (
                  <div key={idx} className="review-list-box">
                    <p className="review-list-star">{r.star}</p>
                    <p className="review-list-title">{r.title}</p>
                    <p className="review-list-detail">{r.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 예약 영역 */}
          <div className="reservation-setting">
            <div className="reservation">
              <div className="calendar-section">
                <h2>날짜 선택</h2>
                {ticket.schedule?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      margin: "5px 0",
                      cursor: "pointer",
                      fontWeight:
                        formatDate(item.date) === selectedDate ? "bold" : "normal",
                    }}
                    onClick={() => handleDateClick(formatDate(item.date))}
                  >
                    {formatDate(item.date)} ({item.weekday}) {item.time}
                  </div>
                ))}

                <button
                  className="reserve-btn"
                  disabled={!selectedDate}
                  onClick={() =>
                    window.open(
                      `/Ticket/Buy2/${id}`,
                      "TicketBuy2",
                      "width=1460,height=1024,scrollbars=yes"
                    )
                  }
                >
                  예매하기
                </button>
                <p className="bottom-note">
                  위버스 멤버십 가입자 10% 적립 &gt; <br />
                  <span>이 공연이 궁금하다면</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
