// src/Ticket/Read.jsx
import React, { useEffect, useState } from "react";
import "../css/style.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaRegCommentDots } from "react-icons/fa";
import Boy from "../images/boy.png";
import Girl from "../images/girl.png";
import api from "../api";

//  이미지 URL 처리용 공통 함수
const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

const resolveImageUrl = (path) => {
	if (!path) {
		return "";
	}
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	if (path.startsWith("/")) {
		return `${BASE_URL}${path}`;
	}
	return `${BASE_URL}/${path}`;
};


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
		const fetchTicket = async () => {
			const token = localStorage.getItem("accessToken");
			const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

			try {
				const res = await api.get(`/tickets/${id}`, config);
				console.log("ticket data:", res.data);

				// 1) 백엔드 schedule(roundNo, showAt) -> 화면용 구조로 변환
				const schedulesFromServer = Array.isArray(res.data.schedule)
					? res.data.schedule
					: [];

				const convertedFromServer = schedulesFromServer
					.map((s, index) => {
						let year, month, day, hour, minute;

						// (1) showAt 이 [yyyy, MM, dd, HH, mm, ss] 배열인 경우
						if (Array.isArray(s.showAt) && s.showAt.length >= 5) {
							[year, month, day, hour, minute] = s.showAt;
						}
						// (2) showAt 이 "yyyy-MM-ddTHH:mm:ss" 문자열인 경우
						else if (typeof s.showAt === "string" && s.showAt.length > 0) {
							const [datePart, timePart = "00:00"] = s.showAt.split("T");
							const [y, m, d] = datePart.split("-").map((v) => parseInt(v, 10));
							const [h = "0", mi = "0"] = timePart.split(":");

							year = y;
							month = m;
							day = d;
							hour = parseInt(h, 10);
							minute = parseInt(mi, 10);
						} else {
							// 인식 불가능한 데이터는 스킵
							return null;
						}

						if (!year || !month || !day) return null;

						const dateArr = [year, month, day];
						const dateObj = new Date(year, month - 1, day);
						const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
						const weekday = weekdays[dateObj.getDay()];

						const pad2 = (v) => String(v).padStart(2, "0");
						const time = `${pad2(hour ?? 0)}:${pad2(minute ?? 0)}`;

						return {
							date: dateArr,                       // [년, 월, 일]
							weekday,                             // 요일 (일~토)
							time,                                // "HH:mm"
							round: `${s.roundNo ?? index + 1}회차`, // "1회차" 형식
						};
					})
					.filter(Boolean);

				let finalSchedule = convertedFromServer;

				// 2) 회차 정보가 전혀 없으면 startAt ~ endAt 기준으로 1일 1회차 생성 (기존 fallback 유지)
				if (!finalSchedule.length) {
					const start = res.data.startAt;
					const end = res.data.endAt;

					if (
						Array.isArray(start) &&
						start.length >= 5 &&
						Array.isArray(end) &&
						end.length >= 3
					) {
						const [startYear, startMonth, startDay, startHour, startMinute] =
							start;
						const [endYear, endMonth, endDay] = end;

						const startDateObj = new Date(startYear, startMonth - 1, startDay);
						const endDateObj = new Date(endYear, endMonth - 1, endDay);
						const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

						const pad2 = (v) => String(v).padStart(2, "0");

						const generated = [];
						let roundNo = 1;

						for (
							let d = new Date(startDateObj);
							d <= endDateObj;
							d.setDate(d.getDate() + 1)
						) {
							const y = d.getFullYear();
							const m = d.getMonth() + 1;
							const day = d.getDate();
							const weekday = weekdays[d.getDay()];

							const time = `${pad2(startHour || 0)}:${pad2(startMinute || 0)}`;

							generated.push({
								date: [y, m, day],
								weekday,
								time,
								round: `${roundNo}회차`,
							});

							roundNo++;
						}

						finalSchedule = generated;
					}
				}

				const nextTicket = {
					...res.data,
					schedule: finalSchedule,
				};

				setTicket(nextTicket);

				// 3) 기본 선택 날짜/달력 설정
				if (finalSchedule.length > 0) {
					const firstDateArr = finalSchedule[0].date;
					const firstDateStr = formatDate(firstDateArr);

					setSelectedDate(firstDateStr);

					const [year, month] = firstDateArr;
					setCurrentMonth(new Date(year, month - 1, 1));
				}
			} catch (err) {
				console.error(err);
			}
		};

		fetchTicket();
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

							<div className="read-set">
								<div className="cons-img">
									{/*  대표이미지(mainImageUrl) 사용, 없으면 Boy.png */}
									<img
										src={resolveImageUrl(ticket.mainImageUrl) || Boy}
										alt={ticket.title}
										className={
											ticket.ticketStatus === "CLOSED"
												? "ticket-img-closed"
												: undefined
										}
									/>
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
												<th>가격</th>
												<td>{ticket.price ? `${ticket.price} 원` : "정보 없음"}</td>
											</tr>

											<tr>
												<th>배송</th>
												<td>{ticket.delivery || "모바일 티켓 및 현장 수령"}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>

							<div className="read-particular">
								<div className="button-class">
									<Link to={`/Ticket/${ticket.ticketId}`}>
										<button className="read-button2">공연정보</button>
									</Link>
									<button className="read-button1">판매정보</button>
									<Link to={`/Ticket/Review/${ticket.ticketId}`}>
										<button className="read-button1">공연후기</button>
									</Link>
									<button className="read-button1">기대평</button>
									<button className="read-button1">QNA</button>
								</div>
							</div>
							<div className="concert-particular">
								<br />
								<strong className="concert-particular-1">공연 시간 정보</strong>
								{hasSchedule ? (
									ticket.schedule.map((item, idx) => (
										<p key={idx}>
											{item.round} : {formatDate(item.date)} ({item.weekday}) {item.time}
										</p>
									))
								) : (
									<p>공연 일정 정보가 없습니다.</p>
								)}


								<br />
								<strong className="concert-particular-1">공연 상세</strong>
								<br />

								{/* 상품 설명 이미지 + 상세 설명 */}
								<div className="concert-detail-box">
									<div className="concert-detail-img-box">
										<img
											src={resolveImageUrl(ticket.detailImageUrl) || Boy}
											alt="공연 상세 이미지"
											className="concert-detail-img"
										/>
									</div>
									<br />
									<p className="concert-detail-text">
										{ticket.ticketDetail || "상품 상세 설명이 준비 중입니다."}
									</p>
									<br />
								</div>


								<strong className="concert-particular-1">예매자 통계</strong>
								<br />
								<div className="sex-ratio">
									<p className="ratio-text1">{ticket.femaleRatio || "55"} %</p>
									<img src={ticket.Girl || Girl} alt="여성_썸네일" />
									<p className="ratio-text2">{ticket.maleRatio || "45"} %</p>
									<img src={ticket.Boy || Boy} alt="남성_썸네일" />
								</div>
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
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
											<button onClick={() => changeMonth(-1)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', padding: '5px' }}>
												◀
											</button>
											<span style={{ fontSize: '14px', fontWeight: 'bold' }}>
												{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
											</span>
											<button onClick={() => changeMonth(1)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', padding: '5px' }}>
												▶
											</button>
										</div>

										{/* 요일 */}
										<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '5px', textAlign: 'center', fontSize: '11px' }}>
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
																background: dayInfo.hasSchedule
																	? (dayInfo.isSelected ? undefined : '#fff')
																	: '#fff',
																// 공연 있는 날짜만 손가락 커서, 없는 날짜는 기본 화살표
																cursor: dayInfo.hasSchedule ? 'pointer' : 'default',
																// 공연 없는 날짜는 숫자를 더 연한 회색으로 표시
																color: dayInfo.hasSchedule ? '#000000ff' : '#cecbcbff'
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
												<p style={{ color: '#e74c3c', textAlign: 'center', padding: '10px', fontSize: '13px' }}>
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
										`/Ticket/Buy/${ticket.ticketId}`,
										"_blank",
										"width=1080,height=800,noopener,noreferrer"
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