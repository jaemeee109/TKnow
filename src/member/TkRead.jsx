// src/member/TkRead.jsx
import React, { useEffect, useState, useMemo } from "react";
import "../css/member.css";
import "../css/style.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MemberSidebar from "./MemberSidebar";
import api from "../api";
import Cons from "../images/cons.png";

// 대표 이미지 경로 처리 (AdminOrdersDetail / TicketBuy6 와 동일 패턴)
const API_BASE = (api.defaults.baseURL || "").replace(/\/$/, "");
const resolveImageUrl = (path) => {
  if (!path) return Cons;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
};

// "년.월.일. 시:분" 형식 (AdminOrdersDetail 포맷과 동일)
const formatShowDateTime = (ticketDate, showStartTime) => {
  if (!ticketDate) return "-";
  // ticketDate가 배열(LocalDateTime 직렬화 결과 등)인 경우
  if (Array.isArray(ticketDate) && ticketDate.length >= 3) {
    const [year, month, day, hour = 0, minute = 0] = ticketDate;
    return `${year}. ${String(month).padStart(2, "0")}. ${String(day).padStart(
      2,
      "0"
    )}. ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  // 문자열인 경우 "yyyy-MM-dd" 또는 "yyyy.MM.dd" 등 처리
  let date = ticketDate;
  if (typeof date === "string") {
    date = date.replace(/[^\d]/g, "");
    if (date.length >= 8) {
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);

      // showStartTime 이 "HH:mm:ss" or "HH:mm" 인 경우
      let hour = "00";
      let minute = "00";

      if (showStartTime && typeof showStartTime === "string") {
        const timeOnly = showStartTime.split(" ")[0]; // 혹시 날짜+시간 같이 들어온 경우
        const parts = timeOnly.split(":");
        if (parts.length >= 2) {
          hour = parts[0].padStart(2, "0");
          minute = parts[1].padStart(2, "0");
        }
      }

      return `${year}. ${month}. ${day}. ${hour}:${minute}`;
    }
  }

  return "-";
};

// 좌석 정보 "등급 / 구역 - 열 - 번" 조합
const formatSeatInfo = (detail) => {
  if (!detail) return "-";

  const grade =
    detail.seatGradeName ||
    detail.seatGrade ||
    detail.ticketGrade ||
    detail.seatClass;

  const section =
    detail.sectionName ||
    detail.seatSection ||
    detail.seatCode;

  const row = detail.seatRow;
  const number = detail.seatNumber;

  const gradeText = grade ? grade : "";
  const sectionText = section ? `${section}` : "";
  const rowText = row ? `${row}열` : "";
  const numberText = number ? `${number}번` : "";

  const parts = [gradeText, sectionText, rowText, numberText].filter(Boolean);

  if (!parts.length) return "-";

  // "S등급 / F4구역 - 2열 - 1번" 형태에 가깝게
  if (gradeText && (sectionText || rowText || numberText)) {
    const gradePart = gradeText;
    const rest = [sectionText, rowText, numberText].filter(Boolean).join(" - ");
    return `${gradePart} / ${rest}`;
  }

  return parts.join(" / ");
};

// 주문상태 텍스트: 요구사항에 맞게 매핑
// CREATED:입금전, PAID:예매완료, CANCELED:예매취소, REFUNDED:환불완료
const formatOrderStatusForMember = (status) => {
  if (!status) return "-";
  switch (status) {
    case "CREATED":
      return "입금 전";
    case "PAID":
      return "예매 완료";
    case "CANCELED":
      return "예매 취소";
    case "REFUNDED":
      return "환불 완료";
    default:
      return status;
  }
};

// 취소 가능 기한: "년. 월. 일. 23:59 까지"
const formatCancelDeadline = (ticketDate, cancelDeadline) => {
  // 1순위: 공연일(ticketDate) 기준 1일 전 23:59
  if (ticketDate) {
    if (Array.isArray(ticketDate) && ticketDate.length >= 3) {
      const [year, month, day] = ticketDate;
      const d = new Date(year, month - 1, day);
      d.setDate(d.getDate() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}. ${m}. ${dd}. 23:59 까지`;
    }

    if (typeof ticketDate === "string") {
      const onlyDigits = ticketDate.replace(/[^\d]/g, "");
      if (onlyDigits.length >= 8) {
        const year = parseInt(onlyDigits.substring(0, 4), 10);
        const month = parseInt(onlyDigits.substring(4, 6), 10);
        const day = parseInt(onlyDigits.substring(6, 8), 10);

        const d = new Date(year, month - 1, day);
        d.setDate(d.getDate() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${y}. ${m}. ${dd}. 23:59 까지`;
      }
    }
  }

  // 2순위: 서버에서 계산해준 cancelDeadline (있다면)
  if (cancelDeadline) {
    if (Array.isArray(cancelDeadline) && cancelDeadline.length >= 3) {
      const [year, month, day, hour = 23, minute = 59] = cancelDeadline;
      return `${year}. ${String(month).padStart(2, "0")}. ${String(
        day
      ).padStart(2, "0")}. ${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")} 까지`;
    }
    if (typeof cancelDeadline === "string") {
      const onlyDigits = cancelDeadline.replace(/[^\d]/g, "");
      if (onlyDigits.length >= 8) {
        const year = onlyDigits.substring(0, 4);
        const month = onlyDigits.substring(4, 6);
        const day = onlyDigits.substring(6, 8);
        return `${year}. ${month}. ${day}. 23:59 까지`;
      }
    }
  }

  return "-";
};

// 공연 시간이 이미 지났는지 여부 계산용
const calcShowDateTime = (ticketDate, showStartTime) => {
  if (!ticketDate) return null;

  // 배열(LocalDateTime)
  if (Array.isArray(ticketDate) && ticketDate.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = ticketDate;
    return new Date(year, month - 1, day, hour, minute, second);
  }

  if (typeof ticketDate === "string") {
    const onlyDigits = ticketDate.replace(/[^\d]/g, "");
    if (onlyDigits.length >= 8) {
      const year = parseInt(onlyDigits.substring(0, 4), 10);
      const month = parseInt(onlyDigits.substring(4, 6), 10);
      const day = parseInt(onlyDigits.substring(6, 8), 10);

      let hour = 0;
      let minute = 0;
      let second = 0;

      if (showStartTime && typeof showStartTime === "string") {
        const timeOnly = showStartTime.split(" ")[0];
        const parts = timeOnly.split(":");
        if (parts.length >= 2) {
          hour = parseInt(parts[0], 10) || 0;
          minute = parseInt(parts[1], 10) || 0;
          if (parts.length >= 3) {
            second = parseInt(parts[2], 10) || 0;
          }
        }
      }

      return new Date(year, month - 1, day, hour, minute, second);
    }
  }

  return null;
};

export default function TkRead() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // location.state로부터 넘어온 detail이 있으면 우선 사용
  const [detail, setDetail] = useState(location.state?.detail || null);
  const [loading, setLoading] = useState(!location.state?.detail);
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // 체크박스 change 핸들러
  const handleCheckboxChange = (e) => {
    setAgree(e.target.checked);
  };

  // 예매 상세 조회
  useEffect(() => {
    if (detail) return; // 이미 state로 전달된 경우 추가 조회 생략

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await api.get(`/orders/${orderId}`, { headers });
        setDetail(response.data);
      } catch (err) {
        console.error("예매 상세 조회 중 오류:", err);
        setError("예매 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchDetail();
    } else {
      setLoading(false);
      setError("유효하지 않은 주문 번호입니다.");
    }
  }, [orderId, detail]);

  // 공연 시간이 지났는지 여부
  const isShowTimePassed = useMemo(() => {
    if (!detail) return false;
    const showDateTime = calcShowDateTime(
      detail.ticketDate,
      detail.showStartTime
    );
    if (!showDateTime) return false;
    const now = new Date();
    return now.getTime() > showDateTime.getTime();
  }, [detail]);

  // 상태/시간 기준으로 취소 가능 여부
  const isCancelableStatus =
    detail &&
    (detail.ordersStatus === "CREATED" || detail.ordersStatus === "PAID");

  const canCancel = !!(detail && isCancelableStatus && !isShowTimePassed);

  // 주문 취소 요청
  const handleCancelOrder = async () => {
    if (!detail || !canCancel || !agree || canceling) return;

    const confirmMsg = "해당 예매를 취소하시겠습니까?\n취소 후에는 되돌릴 수 없습니다.";
    if (!window.confirm(confirmMsg)) return;

    try {
      setCanceling(true);

      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // ★ 회원 취소 전용 API (백엔드에 아래 경로로 추가 필요: PATCH /orders/{ordersId}/cancel)
      await api.patch(`/orders/${detail.ordersId}/cancel`, null, { headers });

      alert("주문이 취소되었습니다.");
      // MyTick 목록 페이지로 이동
      navigate("/member/MyTick");
    } catch (err) {
      console.error("주문 취소 중 오류:", err);
      alert("주문 취소 중 오류가 발생했습니다.");
    } finally {
      setCanceling(false);
    }
  };

  const handleGoList = () => {
    navigate("/member/MyTick");
  };

  if (loading) {
    return (
      <div className="member-Member-page">
        <MemberSidebar />
        <div className="member-right">
          <div className="tkcancel-loading">예매 정보를 불러오는 중입니다...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-Member-page">
        <MemberSidebar />
        <div className="member-right">
          <div className="tkcancel-error">{error}</div>
          <div className="tkcancel-actions">
            <button className="member-Member-btn" onClick={handleGoList}>
              목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="member-Member-page">
        <MemberSidebar />
        <div className="member-right">
          <div className="tkcancel-error">예매 정보를 찾을 수 없습니다.</div>
          <div className="tkcancel-actions">
            <button className="member-Member-btn" onClick={handleGoList}>
              목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const thumbnailUrl = resolveImageUrl(detail.ticketThumbnail?.imageUrl);
  const showDateTimeText = formatShowDateTime(
    detail.ticketDate,
    detail.showStartTime
  );
  const seatInfoText = formatSeatInfo(detail);
  const totalAmount = detail.totalPayAmount;
  const orderStatusText = formatOrderStatusForMember(detail.ordersStatus);
  const cancelDeadlineText = formatCancelDeadline(
    detail.ticketDate,
    detail.cancelDeadline
  );

  return (
    <div className="member-Member-page tkcancel-page">
      <MemberSidebar />
      <div className="member-right">
        <div className="member-myTk-box2 tkcancel-main-box">
          {/* (1) 상단 MY 예매정보 카드 */}
          <div className="tkcancel-myinfo-card">
            <div className="tkcancel-myinfo-header">
              <span className="tkcancel-myinfo-title">MY 예매정보</span>
            </div>
            <div className="tkcancel-myinfo-body">
              <div className="tkcancel-myinfo-thumb">
                <img src={thumbnailUrl} alt="공연 썸네일" />
              </div>
              <div className="tkcancel-myinfo-table-wrap">
                <table className="tkcancel-myinfo-table">
                  <tbody>
                    <tr>
                      <th>공연명</th>
                      <td>{detail.ticketTitle || "-"}</td>
                    </tr>
                    <tr>
                      <th>공연일시</th>
                      <td>{showDateTimeText}</td>
                    </tr>
                    <tr>
                      <th>공연장소</th>
                      <td>{detail.ticketVenue || "장소 미정"}</td>
                    </tr>
                    <tr>
                      <th>좌석</th>
                      <td>{seatInfoText}</td>
                    </tr>
                    <tr>
                      <th>예매번호</th>
                      <td>{detail.ordersId}</td>
                    </tr>
                    <tr>
                      <th>예매자</th>
                      <td>{detail.buyerName || detail.memberName || "-"}</td>
                    </tr>
                    <tr>
                      <th>예매자 연락처</th>
                      <td>{detail.buyerPhone || detail.memberPhone || "-"}</td>
                    </tr>
                    <tr>
                      <th>결제금액</th>
                      <td>
                        {totalAmount != null
                          ? totalAmount.toLocaleString() + "원"
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <th>주문상태</th>
                      <td>{orderStatusText}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
<div class="my-divider"></div>
          {/* (2) 주문 취소 유의사항 안내 카드 */}
          <div className="tkcancel-notice-card">
            <h3 className="tkcancel-notice-title">※ 주문 취소 유의사항 ※</h3>
            <div className="tkcancel-notice-policy">
              <ul className="tkcancel-policy-list">
                <p>예매 당일&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;수수료 포함 전액 환불</p><br/>
                <p>예매 당일 이후에는 수수료 환불이 불가능합니다</p><br/>
                <p>예매 다음날 ~ 7일 경과 : 수수료 제외 30% 금액 차감 후 환불</p><br/>
                <p>관람 7일전까지 : 수수료 제외 50% 금액 차감 후 환불</p><br/>
                <p>관람 1일전까지 : 수수료 제외 70% 금액 차감 후 환불</p><br/>
                <p>관람 당일 : 수수료 제외 90% 금액 차감 후 환불</p><br/>
                <p>관람 당일 관람 시간 지난 후 : 환불 불가능</p><br/>
              </ul>
            </div>

            {/* 공연 시간이 지난 경우 안내 문구 */}
            {isShowTimePassed && (
              <div className="tkcancel-notice-warning">
                ※ 관람시간이 지난 공연은 주문 취소가 불가능합니다.
              </div>
            )}

            {/* 동의 체크 */}
            <div className="tkcancel-agree-row">
              <label className="tkcancel-agree-label">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={handleCheckboxChange}
                  disabled={!canCancel || canceling}
                />
                <span>
                  위 주문 취소 유의사항 및 수수료 정책을 모두 확인하였으며,
                  동의합니다.
                </span>
                
              </label>
                 {/* 주문 취소 버튼 */}
            <div className="tkcancel-button-row">
              <button
                className="tkcancel-cancel-btn"
                onClick={handleCancelOrder}
                disabled={!agree || canceling}
              >
                주문 취소
              </button>
  </div>
                <div className="tkcancel-notice-deadline">
              <span className="tkcancel-notice-label">취소 가능 기한</span>
              <span className="tkcancel-notice-deadline-text">
                {cancelDeadlineText}
              </span>
            </div>
            </div>

         
             {/* (3) 하단 목록으로 버튼 - 가운데 정렬 */}
        <div className="tkcancel-bottom-actions">
          <button
            type="button"
            className="member-Member-btn-outline"
            onClick={handleGoList}
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
