// src/admin/AdminInven3.jsx
import React, { useState, useEffect } from "react";
import "../css/admin.css";
import "../css/style.css";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import AdminSidebar from "./AdminSidebar";

const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

// 티켓 판매 상태 라벨
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

  // 🔹 판매 상태(=ticketStatus) 수정용 상태 (반드시 컴포넌트 안에서 선언해야 함)
  const [editStatus, setEditStatus] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  // 티켓 기본 정보 + 회차별 좌석 통계 불러오기
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        // 티켓 상세
        const ticketRes = await api.get(`/tickets/${ticketId}`);
        setTicket(ticketRes.data);

        // 현재 판매 상태를 select 초기값으로 세팅
        if (ticketRes.data && ticketRes.data.ticketStatus) {
          setEditStatus(ticketRes.data.ticketStatus);
        }

        // 회차별 좌석 현황
        const seatStatsRes = await api.get(`/tickets/${ticketId}/seats/stats`);
        setSeatStats(seatStatsRes.data || []);
      } catch (err) {
        console.error("재고 조회 데이터 불러오기 실패:", err);
        setError("재고 조회 데이터 불러오기 실패");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [ticketId]);

  // 판매 상태 변경 처리 (관리자용)
  const handleChangeTicketStatus = async () => {
    if (!ticket || !ticket.ticketId) {
      alert("티켓 정보가 없습니다.");
      return;
    }

    if (!editStatus) {
      alert("변경할 판매 상태를 선택해 주세요.");
      return;
    }

    const confirmMsg = `판매 상태를 "${statusLabel[editStatus] || editStatus}"(으)로 변경하시겠습니까?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setStatusUpdating(true);
      setStatusError("");

      // /tickets/admin/{ticketId}/status 로 PATCH
      const res = await api.patch(`/tickets/admin/${ticket.ticketId}/status`, {
        ticketStatus: editStatus,
      });

      // 응답으로 변경된 티켓 정보를 다시 세팅
      if (res && res.data) {
        setTicket(res.data);
      }

      alert("판매 상태가 변경되었습니다.");
    } catch (err) {
      console.error("판매 상태 변경 실패:", err);
      setStatusError("판매 상태 변경 중 오류가 발생했습니다.");
      alert("판매 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setStatusUpdating(false);
    }
  };

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
                    <select
                      className="admin-inven3-status-select"
                      value={editStatus || ""}
                      onChange={(e) => setEditStatus(e.target.value)}
                      disabled={statusUpdating}
                    >
                      <option value="">상태 선택</option>
                      <option value="SCHEDULED">
                        {statusLabel.SCHEDULED}
                      </option>
                      <option value="ON_SALE">
                        {statusLabel.ON_SALE}
                      </option>
                      <option value="SOLD_OUT">
                        {statusLabel.SOLD_OUT}
                      </option>
                      <option value="CLOSED">
                        {statusLabel.CLOSED}
                      </option>
                    </select>
                    <button
                      type="button"
                      className="admin-inven3-status-btn"
                      onClick={handleChangeTicketStatus}
                      disabled={statusUpdating}
                    >
                      {statusUpdating ? "변경 중..." : "변경"}
                    </button>
                  
                    {statusError && (
                      <div className="admin-inven3-status-error">
                        {statusError}
                      </div>
                    )}
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

            <div>
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
