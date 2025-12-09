// src/admin/AdminInven3.jsx
import React, { useState, useEffect } from "react";
import "../css/admin.css";
import "../css/style.css";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import AdminSidebar from "./AdminSidebar";

const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

const statusLabel = {
  ON_SALE: "판매중",
  SOLD_OUT: "매진",
  SCHEDULED: "오픈 예정",
  CLOSED: "판매 종료",
};

// LocalDateTime 이 배열([yyyy,MM,dd,HH,mm,ss])로 오는 것을 문자열로 변환
const formatDateTimeArray = (arr) => {
  if (!Array.isArray(arr) || arr.length < 3) return "";
  const [year, month, day, hour = 0, minute = 0] = arr;
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mi = String(minute).padStart(2, "0");
  return `${year}-${mm}-${dd} ${hh}:${mi}`;
};

// TicketBuy3 과 동일한 규칙으로 S/R/평균 가격 계산
const calcPriceInfo = (basePrice) => {
  if (basePrice === null || basePrice === undefined) {
    return { sPrice: 0, rPrice: 0, avgPrice: 0 };
  }
  const sPrice = Number(basePrice);
  if (Number.isNaN(sPrice)) {
    return { sPrice: 0, rPrice: 0, avgPrice: 0 };
  }
  const rPrice = Math.floor(sPrice * 0.9);
  const avgPrice = Math.round((sPrice + rPrice) / 2);
  return { sPrice, rPrice, avgPrice };
};

export default function AdminInven3() {
  const navigate = useNavigate();
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [seatStats, setSeatStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 티켓 기본 정보 + 회차별 좌석 통계 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [ticketRes, seatRes] = await Promise.all([
          api.get(`/tickets/${ticketId}`, { headers }),
          api.get(`/tickets/${ticketId}/seats/stats`, { headers }),
        ]);

        setTicket(ticketRes.data);
        setSeatStats(Array.isArray(seatRes.data) ? seatRes.data : []);
        setError("");
      } catch (err) {
        console.error("재고 조회 데이터 불러오기 실패:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId]);

  const handleBack = () => {
    navigate("/admin/AdminInven");
  };

  if (loading) {
    return (
      <div className="member-Member-page">
        <AdminSidebar />
        <div className="member-right">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-Member-page">
        <AdminSidebar />
        <div className="member-right">
          <p style={{ color: "red" }}>{error}</p>
          <button
            type="button"
            className="admin-con-btn-4-1"
            onClick={handleBack}
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="member-Member-page">
        <AdminSidebar />
        <div className="member-right">
          <p>티켓 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const { sPrice, rPrice, avgPrice } = calcPriceInfo(ticket.price);
  const totalSeatsAll = seatStats.reduce(
    (sum, s) => sum + (s.totalSeats || 0),
    0
  );
  const remainingSeatsAll = seatStats.reduce(
    (sum, s) => sum + (s.remainingSeats || 0),
    0
  );

  return (
    <div className="member-Member-page">
      <AdminSidebar />

      <div className="member-right">
        <div className="member-myTk-box2">
          <div className="inven-main-box">
            <h2 style={{ marginBottom: "20px" }}>티켓 재고 조회</h2>

            {/* 기본 정보 영역 : AdminInven2 와 같은 구조로 표시 */}
            <table className="admin-member-text1">
              <tbody>
                <tr>
                  <th>상품명</th>
                  <td>{ticket.title}</td>
                </tr>
                <tr>
                  <th>판매 상태</th>
                  <td>
                    {statusLabel[ticket.ticketStatus] || ticket.ticketStatus}
                  </td>
                </tr>
                <tr>
                  <th>카테고리</th>
                  <td>{ticket.ticketCategory}</td>
                </tr>
                <tr>
                  <th>공연 시작 일시</th>
                  <td>{formatDateTimeArray(ticket.startAt)}</td>
                </tr>
                <tr>
                  <th>공연 종료 일시</th>
                  <td>{formatDateTimeArray(ticket.endAt)}</td>
                </tr>
                <tr>
                  <th>공연 장소</th>
                  <td>{ticket.venueName}</td>
                </tr>
                <tr>
                  <th>총 좌석 수 / 잔여 좌석 수</th>
                  <td>
                    {ticket.totalSeats}석 / {ticket.remainingSeats}석
                  </td>
                </tr>
                <tr>
                  <th>판매 가격</th>
                  <td>
                    평균가 {avgPrice.toLocaleString()}원{" "}
                    {`(S석: ${sPrice.toLocaleString()}원 / R석: ${rPrice.toLocaleString()}원)`}
                  </td>
                </tr>
                <tr>
                  <th>상품 상세설명</th>
                  <td style={{ whiteSpace: "pre-wrap" }}>
                    {ticket.ticketDetail || "상품 상세 설명이 없습니다."}
                  </td>
                </tr>
                <tr>
                  <th>대표 이미지</th>
                  <td>
                    {ticket.mainImageUrl ? (
                      <img
                        src={`${BASE_URL}${ticket.mainImageUrl}`}
                        alt="대표 이미지"
                        style={{ maxWidth: "200px" }}
                      />
                    ) : (
                      "등록된 대표 이미지가 없습니다."
                    )}
                  </td>
                </tr>
                <tr>
                  <th>상품설명 이미지</th>
                  <td>
                    {ticket.detailImageUrl ? (
                      <img
                        src={`${BASE_URL}${ticket.detailImageUrl}`}
                        alt="상품 설명 이미지"
                        style={{ maxWidth: "200px" }}
                      />
                    ) : (
                      "등록된 상품설명 이미지가 없습니다."
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <br />

            {/* 회차별 좌석 수 / 잔여 좌석 수 */}
            <h3 style={{ margin: "20px 0 10px" }}>회차별 좌석 현황</h3>
<div className="admin-seat-stats-box">
  <table className="admin-member-text1 admin-seat-stats-table">
    <thead>
      <tr>
        <th>회차</th>
        <th>총 좌석 수</th>
        <th>잔여 좌석 수</th>
      </tr>
    </thead>
    <tbody>
      {seatStats.length > 0 ? (
        <>
          {seatStats.map((s) => (
            <tr key={s.roundNo}>
              <td>{s.roundNo}</td>
              <td>{s.totalSeats}</td>
              <td>{s.remainingSeats}</td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>전체</strong>
            </td>
            <td>
              <strong>{totalSeatsAll}</strong>
            </td>
            <td>
              <strong>{remainingSeatsAll}</strong>
            </td>
          </tr>
        </>
      ) : (
        <tr>
          <td colSpan={3}>회차별 좌석 정보가 없습니다.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>
<div >
  <button
    type="button"
    className="admin-con-btn admin-inven3-back-btn"
    onClick={handleBack}
  >
    목록으로
  </button>
</div>

          </div>
        </div>
      </div>
    </div>
  );
}
