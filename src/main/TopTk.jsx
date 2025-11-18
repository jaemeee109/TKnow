import React, { useState, useEffect } from "react";
import "../css/style.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainEvent from "../images/event.png";


export default function TopTk() {

	const [tickets, setTickets] = useState([]);
	const navigate = useNavigate();
	const [ticket, setTicket] = useState(null);


	useEffect(() => {
	  axios
	    .get("http://localhost:9090/ticketnow/tickets")
	    .then((res) => {
	      const list = res.data.data || res.data.list || [];
	      setTickets(list);
	    })
	    .catch((err) => {
	      console.error("오류:", err);

	      // 백엔드가 401로 막을 경우 기본 더미 데이터라도 넣기
	      setTickets([]);
	    });
	}, []);
	
	
	const formatDate = (dateArr, fallback = "") => {
		if (!dateArr || !Array.isArray(dateArr)) return fallback;

		const [year, month, day] = dateArr;
		if (!year || !month || !day) return fallback;

		// JS Date에서 월은 0~11 이므로 month-1
		const date = new Date(year, month - 1, day);
		if (isNaN(date.getTime())) return fallback;

		const mm = String(date.getMonth() + 1).padStart(2, "0");
		const dd = String(date.getDate()).padStart(2, "0");

		return `${date.getFullYear()}.${mm}.${dd}`;
	};

	return (

		<div className="toptk">
			<div className="liveTopTk">실시간 인기 티켓</div><br /><br />
			<div className="TopList">
				{tickets.slice(0, 5).map((t, index) => (
					<div
						key={t.ticketId}
						className="top"
						onClick={() => navigate(`/ticket/${t.ticketId}`)}
					>
						<div className="rank">{index + 1}</div>
						<img
							src={t.mainImageUrl || "/default.jpg"}
							alt={t.title || "티켓 이미지"}
							className="ticket-img"
						/>
						<strong style={{ fontSize: "25px" }}>{t.title}</strong>
						<p style={{ fontSize: "20px", color: "#454545", fontWeight: "bold" }}>
							{t.venueName || "장소 미정"}
						</p>
						<span style={{ fontSize: "18px", color: "#808080" }}>
							{formatDate(t.startAt)} ~ {formatDate(t.endAt, formatDate(t.startAt))}
						</span>
					</div>
				))}
			</div>

			<br /><br /><br /><br /><br />

			<div className="main-event">
				<img src={MainEvent} alt="메인_이벤트" />
			</div>
		</div>
	);
}