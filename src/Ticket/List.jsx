// src/Ticket/List.jsx
import React, { useState, useEffect } from "react";
import "../css/ticket.css";
import "../css/style.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../api";

const PAGE_SIZE = 20; // 한 페이지당 상품 20개

export default function List() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null); // 기존 코드 유지

  // URL에서 category 쿼리 파라미터 읽어서 대문자로 정규화
  const location = useLocation();
  const getCategoryFromSearch = (search) => {
    const params = new URLSearchParams(search);
    const value = params.get("category");
    return value && value.trim().length > 0 ? value.toUpperCase() : "ALL";
  };

  const [category, setCategory] = useState(
    getCategoryFromSearch(location.search)
  );
  const [visibleCount, setVisibleCount] = useState(16);

  // 정렬 옵션 상태 (최신순, 인기순, 오래된순, 판매중, 오픈예정, 판매종료)
  const [sortOption, setSortOption] = useState("LATEST");

  // 페이징용 현재 페이지
  const [currentPage, setCurrentPage] = useState(1);

useEffect(() => {
  api
    .get("/tickets", { params: { page: 1, size: 100 } })
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

  // 정렬옵션 또는 카테고리가 바뀔 때는 1페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption, category]);

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

  // LocalDateTime 배열([년,월,일,시,분,초]) → JS Date 변환
  const toDateTime = (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length < 3) return null;
    const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
    if (!year || !month || !day) return null;

    const d = new Date(year, month - 1, day, hour, minute, second);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  // ticketStatus 문자열 대문자 정규화
  const normalizeStatus = (status) =>
    status ? String(status).toUpperCase() : "";

  // (1) 오픈예정(SCHEDULED) 상품 최신등록순 Top 5
  const upcomingTickets = (() => {
    const base = tickets.filter(
      (t) => normalizeStatus(t.ticketStatus) === "SCHEDULED"
    );

    base.sort((a, b) => {
      const aTime = toDateTime(a.createdAt)?.getTime() || 0;
      const bTime = toDateTime(b.createdAt)?.getTime() || 0;
      // 최신 등록순 (createdAt 내림차순)
      return bTime - aTime;
    });

    return base.slice(0, 5);
  })();

  // (2) 정렬 옵션 + 판매상태 필터 + CLOSED 맨 뒤로 보내기
  const sortedTickets = React.useMemo(() => {
    // 원본 배열 훼손 방지용 복사본
    const base = [...tickets];

    // 2-1. 판매 상태 필터 (판매중 / 오픈예정 / 판매종료)
    let filtered = base;
    if (sortOption === "ON_SALE") {
      // 판매중만
      filtered = base.filter(
        (t) => normalizeStatus(t.ticketStatus) === "ON_SALE"
      );
    } else if (sortOption === "SCHEDULED") {
      // 오픈예정만
      filtered = base.filter(
        (t) => normalizeStatus(t.ticketStatus) === "SCHEDULED"
      );
    } else if (sortOption === "CLOSED") {
      // 판매종료만
      filtered = base.filter(
        (t) => normalizeStatus(t.ticketStatus) === "CLOSED"
      );
    }

    // 2-2. 정렬 + CLOSED 맨 뒤
    filtered.sort((a, b) => {
      const statusA = normalizeStatus(a.ticketStatus);
      const statusB = normalizeStatus(b.ticketStatus);

      const aTime = toDateTime(a.createdAt)?.getTime() || 0;
      const bTime = toDateTime(b.createdAt)?.getTime() || 0;

      // 최신순 / 인기순 / 오래된순일 때는 CLOSED 티켓을 항상 맨 뒤로
      if (
        sortOption === "LATEST" ||
        sortOption === "POPULAR" ||
        sortOption === "OLDEST" ||
        !sortOption // 혹시 기본값 보호
      ) {
        const isClosedA = statusA === "CLOSED";
        const isClosedB = statusB === "CLOSED";
        if (isClosedA !== isClosedB) {
          // A가 CLOSED면 뒤로, B가 CLOSED면 B를 뒤로
          return isClosedA ? 1 : -1;
        }
      }

      // 정렬 기준
      switch (sortOption) {
        case "OLDEST":
          // 오래된순: createdAt 오름차순
          return aTime - bTime;

        case "POPULAR": {
          // 인기순: 결제완료(PAID) 기준 매출(totalPaidAmount) 높은 순
          const paidA =
            typeof a.totalPaidAmount === "number"
              ? a.totalPaidAmount
              : a.totalPaidAmount
              ? Number(a.totalPaidAmount)
              : 0;

          const paidB =
            typeof b.totalPaidAmount === "number"
              ? b.totalPaidAmount
              : b.totalPaidAmount
              ? Number(b.totalPaidAmount)
              : 0;

          // 1순위: 매출 높은 순
          if (paidB !== paidA) {
            return paidB - paidA;
          }
          // 2순위: 매출이 같으면 최신순
          return bTime - aTime;
        }

        case "ON_SALE":
        case "SCHEDULED":
        case "CLOSED":
        case "LATEST":
        default:
          // 기본: 최신순 (createdAt 내림차순)
          return bTime - aTime;
      }
    });

    return filtered;
  }, [tickets, sortOption]);

  // (3) 카테고리 필터 적용 (전체/콘서트/뮤지컬/스포츠/전시)
  const filteredTickets =
    category === "ALL"
      ? sortedTickets
      : sortedTickets.filter((t) => {
          const cat = t.ticketCategory
            ? String(t.ticketCategory).toUpperCase()
            : "";
          return cat === category;
        });

  // ===== 페이징용 계산 =====
  const totalPages =
    filteredTickets.length === 0
      ? 1
      : Math.ceil(filteredTickets.length / PAGE_SIZE);

  const currentPageSafe =
    currentPage > totalPages ? totalPages : currentPage;

  const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const pagedTickets = filteredTickets.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) =>
      prev < totalPages ? prev + 1 : prev
    );
  };

  return (
    <div className="toptk">
      {/* (1) 오픈예정인 상품 최신등록순 5개 (고정 영역) */}
      {/* 여기에 오픈예정인 상품 최신등록순으로 5개 나오게하기 (고정) */}
      <div className="upcoming-title-box">
        <span className="upcoming-title-text">OPEN ★ Coming Soon !</span>
      </div>
      <div className="TopList">
        <div className="tickets-grid">
          {upcomingTickets.length === 0 ? (
            <p>오픈 예정인 상품이 없습니다.</p>
          ) : (
            upcomingTickets.map((t) => (
              <div
                key={`upcoming-${t.ticketId}`}
                className="ticket-card"
                onClick={() => {
                  // 오픈예정(SCHEDULED)은 예매 시작 전이지만 상세는 볼 수 있다고 가정
                  navigate(`/ticket/${t.ticketId}`);
                }}
              >
                <img
                  src={t.mainImageUrl || "/default.jpg"}
                  alt={t.title || "티켓 이미지"}
                  className={
                    "ticket-img" +
                    (normalizeStatus(t.ticketStatus) === "CLOSED"
                      ? " ticket-img-closed"
                      : "")
                  }
                />
                <p />
                <strong>{t.title}</strong>
                <p />
                {t.venueName || "장소 미정"}
                <p />
                <span>{formatDate(t.ticketDate)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 구분선 */}
      <div className="my-divider-1" />

      {/* 상단 카테고리 버튼 영역 */}
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

      {/* (2) 오른쪽 정렬 옵션 영역 */}
      <div className="ticket-sort">
        <select
          className="ticket-sort-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="LATEST">최신순</option>
          <option value="POPULAR">인기순</option>
          <option value="OLDEST">오래된순</option>
          <option value="ON_SALE">판매중</option>
          <option value="SCHEDULED">오픈예정</option>
          <option value="CLOSED">판매종료</option>
        </select>
      </div>

      {/* (2)+(3) 정렬/필터 적용된 전체 리스트 */}
      <div className="TopList">
        <div className="tickets-grid">
          {pagedTickets.map((t) => (
            <div
              key={t.ticketId}
              className="ticket-card"
              onClick={() => {
                // (3) 판매종료된 상품은 상세 진입 막고 alert 표시
                if (normalizeStatus(t.ticketStatus) === "CLOSED") {
                  alert("이미 판매가 종료된 상품입니다.");
                  return;
                }

                navigate(`/ticket/${t.ticketId}`);
              }}
            >
              <img
                src={t.mainImageUrl || "/default.jpg"}
                alt={t.title || "티켓 이미지"}
                className={
                  "ticket-img" +
                  (normalizeStatus(t.ticketStatus) === "CLOSED"
                    ? " ticket-img-closed"
                    : "")
                }
              />
              <p />
              <strong>{t.title}</strong>
              <p />
              {t.venueName || "장소 미정"}
              <p />
              <span>{formatDate(t.ticketDate)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 페이징 버튼 영역 */}
      <div className="ticket-pagination">
        <button
          className="ticket-page-button"
          onClick={handlePrevPage}
          disabled={currentPageSafe === 1}
        >
          이전
        </button>
        <span className="ticket-page-info">
          {currentPageSafe} / {totalPages}
        </span>
        <button
          className="ticket-page-button"
          onClick={handleNextPage}
          disabled={currentPageSafe === totalPages}
        >
          다음
        </button>
      </div>

      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  );
}
