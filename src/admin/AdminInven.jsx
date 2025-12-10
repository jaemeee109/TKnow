// src/admin/AdminInven.jsx
import React, { useState, useEffect } from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import api from "../api";

const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

// 한 페이지당 표시할 티켓 개수
const PAGE_SIZE = 10;

export default function AdminInven() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 하단 통계용 상태
  const [summary, setSummary] = useState({
    totalTicketQuantity: 0,
    totalSalesAmount: 0,
    totalCostAmount: 0,
    totalProfitAmount: 0,
    totalRefundAmount: 0,
  });

  // 목록 페이징용 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 전체 페이지 수 및 현재 페이지에 표시할 데이터 계산
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages) || 1;
  const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
  const pagedTickets = tickets.slice(startIndex, startIndex + PAGE_SIZE);

  // 이전/다음 페이지 이동
  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => {
      const maxPage = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
      return prev < maxPage ? prev + 1 : maxPage;
    });
  };

  // 숫자 3자리 콤마
  const formatNumber = (value) => {
    if (value === null || value === undefined) return "0";
    return value.toLocaleString();
  };

  // 서버에서 티켓 목록 불러오기 + 통계 불러오기
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // 티켓 리스트
        const res = await fetch(`${BASE_URL}/tickets?page=1&size=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("티켓 목록을 불러오지 못했습니다.");
        }

        const data = await res.json();
        setTickets(data.list || []);

        // ===== 관리자 요약 통계 =====
        const summaryRes = await fetch(`${BASE_URL}/orders/admin/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (summaryRes.ok) {
          const summaryJson = await summaryRes.json();
          const body = summaryJson.data || summaryJson;

          setSummary({
            totalTicketQuantity: body.totalTicketQuantity || 0,
            totalSalesAmount: body.totalSalesAmount || 0,
            totalCostAmount: body.totalCostAmount || 0,
            totalProfitAmount: body.totalProfitAmount || 0,
            totalRefundAmount: body.totalRefundAmount || 0,
          });
        } else {
          console.error(
            "관리자 요약 통계를 불러오지 못했습니다.",
            summaryRes.status
          );
        }
      } catch (err) {
        console.error(err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // 삭제
  const handleDelete = async (ticketId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("삭제 실패");

      alert("삭제 완료");
      setTickets((prev) => prev.filter((t) => t.ticketId !== ticketId));
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  const handleClick = (ticketId) => {
    navigate(`/admin/AdminInven3/${ticketId}`);
  };

  const statusLabel = {
    ON_SALE: "판매중",
    SOLD_OUT: "매진",
    SCHEDULED: "오픈 예정",
    CLOSED: "판매 종료",
  };

  // (현재 미사용) 필요 시 S/R 평균가 계산
  const calcAveragePrice = (basePrice) => {
    if (basePrice === null || basePrice === undefined) {
      return 0;
    }
    const sPrice = Number(basePrice);
    if (Number.isNaN(sPrice)) {
      return 0;
    }
    const rPrice = Math.floor(sPrice * 0.9);
    return Math.round((sPrice + rPrice) / 2);
  };

  // (현재 미사용) 잔여석 0이면 SOLD_OUT 처리
  const getEffectiveStatus = (ticket) => {
    if (ticket && ticket.remainingSeats === 0) {
      return "SOLD_OUT";
    }
    return ticket.ticketStatus;
  };

  return (
    <div className="member-Member-page">
      <AdminSidebar />

      <div className="member-right">
        {/* 상단: 티켓 목록 카드 */}
        <div className="member-myTk-box2">
          <div
            className="inven-main-box"
            style={{
              border: "none",
              boxShadow: "none",
              background: "transparent",
              padding: 0,
            }}
          >
            {error && (
              <div
                style={{
                  color: "red",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                {error}
              </div>
            )}

            {loading ? (
              <p>로딩 중</p>
            ) : (
              <>
                <table className="admin-member-text1">
                  <thead>
                    <tr>
                      <th>상품번호</th>
                      <th>콘서트명</th>
                      <th>가격(원)</th>
                      <th>잔여석(개)</th>
                      <th>상태</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tickets.length > 0 ? (
                      pagedTickets.map((t) => (
                        <tr
                          key={t.ticketId}
                          onClick={() => handleClick(t.ticketId)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{t.ticketId}</td>
                          <td>{t.title}</td>
                          <td>{t.price?.toLocaleString()}</td>
                          <td>{t.remainingSeats || t.totalSeats}</td>

                          {/* 상태 표시 부분 */}
                          <td
                            className={
                              t.ticketStatus === "ON_SALE"
                                ? "admin-con-btn"
                                : "admin-con-btn1"
                            }
                          >
                            {statusLabel[t.ticketStatus] || "알수없음"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">불러올 티켓이 없습니다</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* 목록 페이징 영역 */}
                <div className="member-ticket-plus">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPageSafe === 1}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: currentPageSafe === 1 ? "default" : "pointer",
                      fontSize: "20px",
                      marginRight: "20px",
                      color: currentPageSafe === 1 ? "#D9D9D9" : "#FFA6C9",
                    }}
                  >
                    ◀
                  </button>

                  <span>
                    {currentPageSafe} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={
                      tickets.length === 0 || currentPageSafe === totalPages
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor:
                        tickets.length === 0 ||
                        currentPageSafe === totalPages
                          ? "default"
                          : "pointer",
                      fontSize: "20px",
                      marginLeft: "20px",
                      color:
                        tickets.length === 0 ||
                        currentPageSafe === totalPages
                          ? "#D9D9D9"
                          : "#FFA6C9",
                    }}
                  >
                    ▶
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 하단: 판매 통계 카드 */}
        <div className="inven-main-box2">
          <div className="admin-inven-tit">
            <h3>종합 판매 통계</h3>
          </div>

          <div className="admin-inven-row">
            <span>판매 티켓</span>
            <span className="admin-inven-3">
              {formatNumber(summary.totalTicketQuantity)} 장
            </span>
          </div>

          <div className="admin-inven-row">
            <span>매출액</span>
            <span className="admin-inven-3">
              {formatNumber(summary.totalSalesAmount)} 원
            </span>
          </div>

          <div className="admin-inven-row">
            <span>원가비용</span>
            <span className="admin-inven-3">
              {formatNumber(summary.totalCostAmount)} 원
            </span>
          </div>
    
          <div className="admin-inven-row">
            <span>영업 이익</span>
            <span className="admin-inven-3">
              {formatNumber(summary.totalProfitAmount)} 원
            </span>
          </div>

          <div className="admin-inven-row">
            <span>환불 금액</span>
            <span className="admin-inven-3">
              {formatNumber(summary.totalRefundAmount)} 원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
