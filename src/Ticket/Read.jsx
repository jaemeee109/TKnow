import React, { useState, useEffect } from "react";
import "../css/style.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Boy from "../images/boy.png"; 
import Girl from "../images/girl.png"; 

export default function Read() {
	const { id } = useParams();
	const [ticket, setTicket] = useState(null);
	const [selectedDate, setSelectedDate] = useState("");
	const [currentMonth, setCurrentMonth] = useState(new Date());

	// YYYY.MM.DD 포맷
	const formatDate = (dateArr, fallback = "") => {
	  if (!dateArr || !Array.isArray(dateArr)) return fallback;
	  const [year, month, day] = dateArr;
	  if (!year || !month || !day) return fallback;
	  const date = new Date(year, month - 1, day);
	  if (isNaN(date.getTime())) return fallback;
	  const mm = String(date.getMonth() + 1).padStart(2, "0");
	  const dd = String(date.getDate()).padStart(2, "0");
	  return `${date.getFullYear()}.${mm}.${dd}`;
	};

	// 날짜 클릭 핸들러
	const handleDateClick = (dateStr) => {
	  setSelectedDate(dateStr);
	};

	// 달 변경
	const changeMonth = (direction) => {
	  const newMonth = new Date(currentMonth);
	  newMonth.setMonth(currentMonth.getMonth() + direction);
	  setCurrentMonth(newMonth);
	};

	// 달력 생성
	const generateCalendar = () => {
	  const year = currentMonth.getFullYear();
	  const month = currentMonth.getMonth();
	  
	  const firstDay = new Date(year, month, 1);
	  const lastDay = new Date(year, month + 1, 0);
	  const startDate = new Date(firstDay);
	  startDate.setDate(startDate.getDate() - firstDay.getDay());
	  
	  const calendar = [];
	  const currentDate = new Date(startDate);
	  
	  for (let week = 0; week < 6; week++) {
	    const weekDays = [];
	    for (let day = 0; day < 7; day++) {
	      const dateStr = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${String(currentDate.getDate()).padStart(2, '0')}`;
	      const isCurrentMonth = currentDate.getMonth() === month;
	      const hasSchedule = ticket?.schedule?.some(s => formatDate(s.date) === dateStr);
	      const isSelected = selectedDate === dateStr;
	      
	      weekDays.push({
	        date: new Date(currentDate),
	        dateStr,
	        day: currentDate.getDate(),
	        isCurrentMonth,
	        hasSchedule,
	        isSelected
	      });
	      
	      currentDate.setDate(currentDate.getDate() + 1);
	    }
	    calendar.push(weekDays);
	  }
	  
	  return calendar;
	};

	useEffect(() => {
	  const token = localStorage.getItem("accessToken"); // 로그인 시 저장한 JWT

	  axios
	    .get(`http://localhost:9090/ticketnow/tickets/${id}`, {
	      headers: {
	        Authorization: `Bearer ${token}` // JWT 헤더 추가
	      }
	    })
	    .then((res) => {
	      console.log("ticket data:", res.data);

		  if (!res.data.schedule || res.data.schedule.length === 0) {
		    const start = new Date(res.data.startAt);
		    const end = new Date(res.data.endAt);

		    const generatedSchedule = [];
		    const currentDate = new Date(start);

		    while (currentDate <= end) {
		      generatedSchedule.push({
		        date: [
		          currentDate.getFullYear(),
		          currentDate.getMonth() + 1,
		          currentDate.getDate()
		        ],
		        weekday: ['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()],
		        time: "19:00",
		        round: "1회차"
		      });
		      currentDate.setDate(currentDate.getDate() + 1);
		    }

		    res.data.schedule = generatedSchedule;
		  }

	      setTicket(res.data);

	      if (res.data.schedule && res.data.schedule.length > 0) {
	        const firstDate = formatDate(res.data.schedule[0].date);
	        setSelectedDate(firstDate);
	        const [year, month] = res.data.schedule[0].date;
	        setCurrentMonth(new Date(year, month - 1, 1));
	      }
	    })
	    .catch((err) => console.error(err));
	}, [id]);
	
	if (!ticket) return <div>로딩 중...</div>;

	const hasSchedule = ticket.schedule && ticket.schedule.length > 0;
	const calendar = generateCalendar();
	const selectedSchedules = ticket.schedule?.filter(s => formatDate(s.date) === selectedDate) || [];
	
	
	
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
                  <img src={ticket.Boy || Boy}  alt={ticket.title} />
                </div>

                <div className="read-table">
                  <table>
                    <tbody>
                      <tr>
                        <th>장소</th>
                        <td>{ticket.venueName || "장소 미정"}</td>
                      </tr>
					  
                      <tr>
                        <th>날짜</th>
                        <td>
                          {formatDate(ticket.startAt)} ~ {formatDate(ticket.endAt, formatDate(ticket.startAt))}
                        </td>
                      </tr>
                      <tr>
                        <th>공연 시간</th>
                        <td>{ticket.duration || "정보 없음"}</td>
                      </tr>
                      <tr>
                        <th>관람 연령</th>
                        <td>{ticket.ageLimit || "미취학 아동 입장 불가"}</td>
                      </tr>
                      <tr>
                        <th>가격</th>
                        <td>{ticket.price ? `${ticket.price} 원` : "정보 없음"}</td>
                      </tr>
                      <tr>
                        <th>혜택</th>
                        <td>{ticket.benefit || "없음"}</td>
                      </tr>
                      <tr>
                        <th>프로모션</th>
                        <td>{ticket.promotion || "없음"}</td>
                      </tr>
                      <tr>
                        <th>배송</th>
                        <td>{ticket.delivery || "배송 정보 없음"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="read-particular">
                <div className="button-class">
                  <button className="read-button2">공연정보</button>
                  <button className="read-button1">판매정보</button>
                  <Link to="/Ticket/Review">
                    <button className="read-button1">공연후기</button>
                  </Link>
                  <button className="read-button1">기대평</button>
                  <button className="read-button1">QNA</button>
                </div>
              </div>

              <div className="concert-particular">
                <strong className="concert-particular-1">공연 시간 정보</strong>
                <br /><br />
                {hasSchedule ? (
                  ticket.schedule
                    .filter((item) => formatDate(item.date) === selectedDate)
                    .map((item, idx) => (
                      <p key={idx}>
                        {formatDate(item.date)} ({item.weekday}) {item.time}
                      </p>
                    ))
                ) : (
                  <p>공연 일정 정보가 없습니다.</p>
                )}

                <br /><br />

                <strong className="concert-particular-1">공연 상세 / 출연진 정보</strong>
                <br /><br />
                <img
                  src={ticket.Boy || Boy} 
                  className="Consread-img"
                  alt="콘서트_상세"
                />
              </div>

              <strong className="concert-particular-1">예매자 통계</strong>
              <br /><br />
              <div className="sex-ratio">
                <p className="ratio-text1">{ticket.femaleRatio || "0"} %</p>
                <img src={ticket.Girl || Girl} alt="여성_썸네일" />
                <p className="ratio-text2">{ticket.maleRatio || "0"} %</p>
                <img src={ticket.Boy || Boy} alt="남성_썸네일" />
              </div>
            </section>
          </div>

          <div className="reservation-setting">
            <div className="reservation">
              <div className="calendar-section">
                <h2>날짜 선택</h2>

				{hasSchedule ? (
				  <>
				    {/* 월 네비게이션 */}
				    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
				      <button onClick={() => changeMonth(-1)} style={{border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', padding: '5px'}}>
				        ◀
				      </button>
				      <span style={{fontSize: '14px', fontWeight: 'bold'}}>
				        {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
				      </span>
				      <button onClick={() => changeMonth(1)} style={{border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', padding: '5px'}}>
				        ▶
				      </button>
				    </div>

				    {/* 요일 */}
				    <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '5px', textAlign: 'center', fontSize: '11px'}}>
				      {['일', '월', '화', '수', '목', '금', '토'].map(day => (
				        <div key={day}>{day}</div>
				      ))}
				    </div>

				    {/* 달력 */}
				    <div className="calendar">
				      {calendar.map((week, weekIdx) => (
				        <React.Fragment key={weekIdx}>
				          {week.map((dayInfo, dayIdx) => (
				            <button
				              key={dayIdx}
				              onClick={() => handleDateClick(dayInfo.dateStr)}
				              disabled={!dayInfo.hasSchedule}
				              className={`calendar-day ${dayInfo.isSelected ? 'selected' : ''}`}
				              style={{
				                opacity: dayInfo.isCurrentMonth ? 1 : 0.3,
				                background: dayInfo.hasSchedule ? (dayInfo.isSelected ? undefined : '#fff') : '#fff',
				                cursor: dayInfo.hasSchedule ? 'pointer' : 'not-allowed'
				              }}
				            >
				              {dayInfo.day}
				            </button>
				          ))}
				        </React.Fragment>
				      ))}
				    </div>

				    <div className={`schedule ${selectedDate ? "show-note" : ""}`}>
				      {selectedSchedules.length > 0 ? (
				        <>
				          {selectedSchedules.map((item, idx) => (
				            <div key={idx} className="round">
				              <span className="round-num">{item.round}</span>&nbsp;
				              <span className="round-time">{item.time}</span>
				            </div>
				          ))}
				          <br />
				          <p className="note">잔여석 안내 서비스를 제공하지 않습니다.</p>
				        </>
				      ) : (
				        <p style={{color: '#e74c3c', textAlign: 'center', padding: '10px', fontSize: '13px'}}>
				          이 날짜에는 공연이 없습니다.
				        </p>
				      )}
				    </div>
				  </>
				) : (
				  <p>공연 날짜 정보가 없습니다.</p>
				)}
              </div>

			  <button
			    className="reserve-btn"
			    disabled={!selectedDate || !hasSchedule}
			    onClick={() => {
			      if (!selectedDate) return;
			      const ticketId = ticket.ticketId; // ticket 객체에서 가져오기
			      window.open(
			        `/Ticket/Buy2/${ticketId}`,
			        "TicketBuy",
			        "width=1450,height=1024,scrollbars=yes"
			      );
			    }}
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
  );
}
