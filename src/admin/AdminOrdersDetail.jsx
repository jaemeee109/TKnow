// src/admin/AdminOrdersDetail.jsx
import React, { useEffect, useState } from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import api from "../api";
import Cons from "../images/cons.png";

const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

// 대표 이미지 URL 처리
const resolveImageUrl = (path) => {
  if (!path) return Cons;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${BASE_URL}${path}`;
  return `${BASE_URL}/${path}`;
};


const formatDateTime = (value) => {
  if (!value) return "-";

  // 1) LocalDateTime 배열로 오는 경우: [yyyy, MM, dd, HH, mm, ss, ...]
  if (Array.isArray(value)) {
    const [year, month, day, hour, minute, second] = value;

    const yyyy = String(year || "");
    const mm = String(month || "").padStart(2, "0");
    const dd = String(day || "").padStart(2, "0");
    const hh = String(hour ?? 0).padStart(2, "0");
    const mi = String(minute ?? 0).padStart(2, "0");
    const ss = String(second ?? 0).padStart(2, "0");

    if (!yyyy || !mm || !dd) return "-";
    return `${yyyy}.${mm}.${dd} ${hh}:${mi}:${ss}`;
  }

  // 2) 문자열("2025-12-09T10:05:40" 또는 "2025-12-09 10:05:40")인 경우도 지원
  const str = String(value);

  // 공백 또는 'T' 기준으로 날짜/시간 분리
  let datePartRaw = "";
  let timePartRaw = "";

  if (str.includes("T")) {
    [datePartRaw, timePartRaw] = str.split("T");
  } else if (str.includes(" ")) {
    [datePartRaw, timePartRaw] = str.split(" ");
  } else {
    // 분리 못하면 그대로 리턴 (디버그용)
    return str;
  }

  const [year, month, day] = (datePartRaw || "").split("-");
  const [hour, minute, second] = (timePartRaw || "").split(":");

  const yyyy = year || "";
  const mm = (month || "").padStart(2, "0");
  const dd = (day || "").padStart(2, "0");
  const hh = (hour || "00").padStart(2, "0");
  const mi = (minute || "00").padStart(2, "0");
  const ss = (second || "00").substring(0, 2).padStart(2, "0");

  if (!yyyy || !mm || !dd) return "-";
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}:${ss}`;
};


// 공연일시 포맷: "년.월.일.시:분"
const formatShowDateTime = (dateStr, timeStr) => {
  if (!dateStr && !timeStr) return "-";

  let formattedDate = "";
  if (dateStr) {
    const text = String(dateStr);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      const [y, m, d] = text.split("-");
      formattedDate = `${y}.${m}.${d}.`;
    } else {
      // 이미 "2025.12.25." 같은 형식이면 그대로 사용
      formattedDate = text;
    }
  }

  const time = timeStr ? String(timeStr).substring(0, 5) : "";
  if (!formattedDate && !time) return "-";

  return `${formattedDate}${formattedDate && time ? " " : ""}${time}`;
};

// 위쪽 util 함수 부분에 있는 formatSeatText 전체를 이걸로 교체
const formatSeatText = (seatClass, seatCode, seatNumber) => {
  // 아무 정보도 없으면 대시만 표시
  if (!seatClass && !seatCode && !seatNumber) return "-";

  // 나중에 seatNumber(예: "F4 구역 - 2열 - 1번")를
  // 주문 생성 시점에 DB에 저장하게 되면, 그 값을 그대로 우선 사용
  if (seatNumber) {
    return `${seatClass ? seatClass + "등급 " : ""}${seatNumber}`;
  }

  // 현재 구조: seatClass + seatCode만 넘어옴 (예: "S", "F4-001")
  if (seatClass && seatCode) {
    const [zone] = seatCode.split("-");
    return `${seatClass} - ${seatCode}`;
  }

  if (seatClass) return `${seatClass}등급`;
  if (seatCode) return seatCode;

  return "-";
};

// 주문 상태 한글 변환
const formatOrderStatus = (code) => {
  switch (code) {
    case "CREATED":
      return "주문생성";
    case "PAID":
      return "결제완료";
    case "CANCELED":
      return "주문취소";
    case "REFUNDED":
      return "환불완료";
    default:
      return code || "-";
  }
};

// 취소 마감 안내: 공연일 기준 1일 전 23:59까지
const formatCancelDeadline = (ticketDateStr, cancelDeadlineVal) => {
  if (ticketDateStr) {
    const text = String(ticketDateStr);
    let y, m, d;

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      [y, m, d] = text.split("-");
    } else if (/^\d{4}\.\d{2}\.\d{2}/.test(text)) {
      const parts = text.split(".");
      y = parts[0];
      m = parts[1];
      d = parts[2];
    }

    if (y && m && d) {
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      if (!Number.isNaN(dateObj.getTime())) {
        dateObj.setDate(dateObj.getDate() - 1);
        const yy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        return `${yy} 년 ${mm} 월 ${dd} 일 23:59 까지`;
      }
    }
  }

  // ticketDate가 없고 cancelDeadline(LocalDateTime)이 넘어온 경우 백엔드 값 사용
  if (cancelDeadlineVal) {
    return `${formatDateTime(cancelDeadlineVal)}까지`;
  }

  return "-";
};

export default function AdminOrdersDetail() {
  const { ordersId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/orders/${ordersId}`);
        setDetail(res.data);
      } catch (err) {
        console.error("주문 상세 조회 실패", err);
        setError("주문 상세 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [ordersId]);

  // ─────────────────────────────────────────
  // 로딩 / 에러 / 데이터 없음 처리 (사이드바 포함)
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="member-Member-page admin-orders-detail-page">
        <AdminSidebar />
        <div className="member-right">
          <p>주문 상세 정보를 불러오는 중입니다.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-Member-page admin-orders-detail-page">
        <AdminSidebar />
        <div className="member-right">
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="member-Member-page admin-orders-detail-page">
        <AdminSidebar />
        <div className="member-right">
          <p>주문 상세 정보가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // 상세 데이터 구조 분해
  // ─────────────────────────────────────────
  const {
    ticketThumbnail,
    ticketTitle,
    ticketPeriod,
    ticketVenue,
    audienceGrade,
    ticketDate,
    showStartTime,
    runningTime,
    seatClass,
    seatCode,
    seatNumber,
    ticketPrice,
    serviceFee,
    quantity: purchaseQty,
    totalPayAmount,
    cancelDeadline,
    cancelFeePeriodText,
    ordersId: ordersIdValue,
    createdAt,
    memberId,
    memberName,
    memberPhone,
    memberEmail,
    deliveryMethod,
    deliveryStatus,
    ordersStatus,
    payMethod,
    payStatus,
  } = detail || {};

  const thumbnailUrl = resolveImageUrl(ticketThumbnail?.imageUrl);

  // 취소 수수료 정책
const cancelPolicyDescription = (
    <div className="admin-order-cancel-body">
      <p>예매 당일 : 수수료 포함 전액 환불</p>
      <p>* 예매 당일 이후에는 수수료 환불이 불가능합니다</p>
      <p>예매 다음날 ~ 7일 경과 : 수수료 제외 30% 금액 차감 후 환불 </p>
      <p>관람 7일전까지 : 수수료 제외 50% 금액 차감 후 환불 </p>
      <p>관람 1일전까지 : 수수료 제외 70% 금액 차감 후 환불 </p>
      <p>관람 당일 : 수수료 제외 90% 금액 차감 후 환불 </p>
      <p>관람 당일 관람 시간 지난 후 : 환불 불가능</p>
    </div>
  );

  // ─────────────────────────────────────────
  // 실제 화면 렌더링
  // ─────────────────────────────────────────
  return (
    <div className="member-Member-page">
      {/* 좌측: 관리자 사이드바 */}
      <AdminSidebar />

      {/* 우측: 주문 상세 본문 */}
      <div className="member-right admin-orders-detail-page">
   
          <div className="member-tkRead-main">


            <div className="member-tkRead-conBox2">
              <div className="member-tkRead-dayBox1">
                <img
                  src={thumbnailUrl}
                  alt={ticketTitle || "공연 이미지"}
                  style={{ width: "200px", height: "auto", borderRadius: "8px" }}
                />
              </div>
              <div className="member-tkRead-dayBox2">
                <strong>{ticketTitle}</strong>
                <p>
                  관람일 : {formatShowDateTime(ticketDate, showStartTime)} 
                  <p/> 장소 : {ticketVenue}
                </p>
                <p> 좌석 : {formatSeatText(seatClass, seatCode, seatNumber)}</p>
                <div className="border-line"></div>
                  <tr>
                    <th>예매번호</th>
                    <td>｜</td>
                    <td>{ordersIdValue}</td>
                       </tr>
                       
                  <tr>
                    <th>예매일시</th>
                    <td>｜</td>
                    <td>{formatDateTime(createdAt)}</td>
                   </tr>
                  
                  <tr>
                    <th>티켓 수량</th>
                    <td>｜</td>
                    <td>{purchaseQty} 매</td>
                    </tr>
 
                    <tr>
                    <th>회원 이름</th>
                    <td>｜</td>
                    <td>{memberName || "-"}</td>
                         </tr>
                         <tr>
                    <th>연락처</th>
                    <td>｜</td>
                    <td>{memberPhone || "-"}</td>
                  </tr>
                  <tr>
                    <th>이메일</th>
                    <td>｜</td>
                    <td>{memberEmail || "-"}</td>
                   
                  </tr>
                  <tr>
                    <th>총 결제 금액</th>
                    <td>｜</td>
                    <td>{(totalPayAmount || 0).toLocaleString()} 원</td>
                  </tr>
                   <tr> <th>주문 상태</th>
                    <td>｜</td>
                    <td>{formatOrderStatus(ordersStatus)}</td>
                  </tr>
              </div>
            </div>


                       {/* ───────── 취소 기한 / 정책 (필요 시) ───────── */}
            <div className="member-tkRead-conBox3">
              <table className="member-tkRead-text1-1">
                <tbody>
                  <tr>
                    <th className="admin-order-cancel-deadline">
                      취소 가능 기한&nbsp;&nbsp;:&nbsp;&nbsp;{formatCancelDeadline(ticketDate, cancelDeadline)}
                    </th>
                  </tr>
                  <tr>
                    <th className="admin-order-cancel-title">
                      ※&nbsp;&nbsp;&nbsp;취소 수수료 정책&nbsp;&nbsp;&nbsp;※
                    </th>
                  </tr>
                  <tr>
                    <td className="admin-order-cancel-td">
                      {cancelPolicyDescription}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <br />

            {/* ───────── 뒤로가기 버튼 ───────── */}
            <div className="admin-orders-detail-back">
              <button
                className="admin-con-btn admin-orders-back-btn"
                onClick={() => navigate("/admin/AdminOrders")}
              >
                목록으로
              </button>
            </div>

          </div>
        
      </div>
    </div>
  );
}
