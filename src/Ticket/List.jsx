// src/Ticket/List.jsx
import React, { useState, useEffect } from "react";
import "../css/ticket.css";
import "../css/style.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../api";

export default function List() {

  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);

  // URL에서 category 쿼리 파라미터 읽어서 대문자로 정규화
  const location = useLocation();
  const getCategoryFromSearch = (search) => {
    const params = new URLSearchParams(search);
    const value = params.get("category");
    return value && value.trim().length > 0 ? value.toUpperCase() : "ALL";
  };

  const [category, setCategory] = useState(getCategoryFromSearch(location.search));
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    api
      .get("/tickets")
      .then((res) => {
        const list = res.data.data || res.data.list || [];
        setTickets(list);
      })
      .catch((err) => {
        console.error("오류:", err);
        setTickets([]);
      });
  }, []);

  // URL의 category가 바뀔 때마다 상태 갱신 + 보이는 개수 초기화
  useEffect(() => {
    const nextCategory = getCategoryFromSearch(location.search);
    setCategory(nextCategory);
    setVisibleCount(16);
  }, [location.search]);

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

  // 프론트에서 카테고리 필터링
  const filteredTickets =
    category === "ALL"
      ? tickets
      : tickets.filter((t) => {
        const value = (t.ticketCategory || "").toUpperCase();
        return value === category;
      });


  return (
    <div className="toptk">
      <br /><br /><br /><br />

      <div className="tkList2">
        <Link to="/Ticket/List">
          <button className="tkLists">티켓 전체 보기</button>
        </Link>
        <Link to="/Ticket/List?category=CONCERT">
          <button className="tkLists">콘서트</button>
        </Link>
        <Link to="/Ticket/List?category=MUSICAL">
          <button className="tkLists">뮤지컬 / 연극</button>
        </Link>
        <Link to="/Ticket/List?category=SPORTS">
          <button className="tkLists">스포츠</button>
        </Link>
        <Link to="/Ticket/List?category=EXHIBITION">
          <button className="tkLists">전시 / 체험</button>
        </Link>
      </div>

      <br /><br />

      <div className="TopList">
        <div className="tickets-grid">
          {filteredTickets.slice(0, visibleCount).map((t) => (
            <div
              key={t.ticketId}
              className="ticket-card"
              onClick={() => navigate(`/ticket/${t.ticketId}`)}
            >
              <img
                src={t.mainImageUrl || "/default.jpg"}
                alt={t.title || "티켓 이미지"}
                className={
                  "ticket-img" +
                  (t.ticketStatus === "CLOSED" ? " ticket-img-closed" : "")
                }
              />
              <p />
              <strong>{t.title}</strong>

              <p />{t.venueName || "장소 미정"}
              <p /><span>{formatDate(t.ticketDate)}</span>
            </div>
          ))}
        </div>
      </div>

      <br /><br /><br />

      <div
        className="member-myCont-plus"
        onClick={() => setVisibleCount((prev) => prev + 16)}
      >
        <strong> + </strong> <span> 콘서트 목록 더 보기 </span>
      </div>

      <br /><br /><br /><br /><br />
    </div>
  );
}
