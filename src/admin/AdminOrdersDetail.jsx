// src/admin/AdminOrdersDetail.jsx
import React, { useEffect, useState } from "react";
import "./../css/style.css";
import "./../css/ticket.css";
import "./../css/admin.css";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Cons from "../images/cons.png";
import api from "../api";

const API_BASE = (api.defaults.baseURL || "").replace(/\/$/, "");

const resolveImageUrl = (path) => {
  if (!path) return Cons;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
};

/** LocalDateTime 문자열(또는 null) → "YYYY-MM-DD HH:mm" */
const formatDateTime = (text) => {
  if (!text) return "-";
  // "2025-12-01T15:30:00" 형태를 기준으로 잘라줌
  const t = String(text);
  const [datePart, timePart] = t.split("T");
  if (!timePart) return datePart;
  return `${datePart} ${timePart.slice(0, 5)}`;
};

export default function AdminOrdersDetail() {
  const { ordersId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        const res = await api.get(`/orders/${ordersId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(res.data || null);
      } catch (err) {
        console.error(err);
        setError("주문 상세 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [ordersId]);

  if (loading) {
    return <p>주문 상세 정보를 불러오는 중입니다...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!data) {
    return <p>주문 정보를 찾을 수 없습니다.</p>;
  }

  const {
    ticketTitle,
    ticketDateText,
    showStartTimeText,
    ticketVenue,
    seatClass,
    seatCode,
    ticketPrice,
    purchaseQty,
    totalPayAmount,
    ordersStatus,
    payMethodText,
    payStatusText,
    memberName,
    memberPhone,
    memberEmail,
    createdAt,
    cancelDeadlineText,
    cancelFeePolicy,
  } = data;

  return (
    <div className="member-Member-page">
      <AdminSidebar />
      <div className="member-right">
        <div className="member-myTk-box2">
          <div className="mytick-main-box">
            <div className="member-tkRead">
              {/* 좌측: 공연 썸네일 + 정보 */}
              <div className="member-tkRead-con1">
                <div className="member-tkRead-consImgBox">
                  <img
                    src={resolveImageUrl(data.ticketThumbnail?.imageUrl)}
                    alt="공연 썸네일"
                    className="member-tkRead-consImg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = Cons;
                    }}
                  />
                </div>

                <div className="member-tkRead-dayBox">
                  <div className="member-tkRead-my">
                    <table>
                      <tbody>
                        <tr>
                          <th>공연명</th>
                          <td>{ticketTitle || "제목 없음"}</td>
                        </tr>
                        <tr>
                          <th>공연일시</th>
                          <td>
                            {ticketDateText || "-"} {showStartTimeText || ""}
                          </td>
                        </tr>
                        <tr>
                          <th>공연장소</th>
                          <td>{ticketVenue || "-"}</td>
                        </tr>
                        <tr>
                          <th>좌석</th>
                          <td>
                            {[seatClass, seatCode].filter(Boolean).join(" / ") ||
                              "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 우측: 주문/결제 정보 */}
              <div className="member-tkRead-con2">
                <div className="member-tkRead-conBox4">
                  <table>
                    <tbody>
                      <tr>
                        <th>주문번호</th>
                        <td>{ordersId}</td>
                      </tr>
                      <tr>
                        <th>주문일시</th>
                        <td>{formatDateTime(createdAt)}</td>
                      </tr>
                      <tr>
                        <th>티켓수량</th>
                        <td>{purchaseQty || 0} 매</td>
                      </tr>
                      <tr>
                        <th>티켓금액</th>
                        <td>
                          {ticketPrice != null
                            ? ticketPrice.toLocaleString() + "원"
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <th>총 결제금액</th>
                        <td>
                          {totalPayAmount != null
                            ? totalPayAmount.toLocaleString() + "원"
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <th>결제방법</th>
                        <td>{payMethodText || "-"}</td>
                      </tr>
                      <tr>
                        <th>결제상태</th>
                        <td>{payStatusText || "-"}</td>
                      </tr>
                      <tr>
                        <th>주문상태</th>
                        <td>{ordersStatus || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="member-tkRead-conBox4" style={{ marginTop: "20px" }}>
                  <table>
                    <tbody>
                      <tr>
                        <th>회원명</th>
                        <td>{memberName || "-"}</td>
                      </tr>
                      <tr>
                        <th>연락처</th>
                        <td>{memberPhone || "-"}</td>
                      </tr>
                      <tr>
                        <th>이메일</th>
                        <td>{memberEmail || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="member-tkRead-conBox4" style={{ marginTop: "20px" }}>
                  <table>
                    <tbody>
                      <tr>
                        <th>취소 마감 안내</th>
                        <td>{cancelDeadlineText || "-"}</td>
                      </tr>
                      <tr>
                        <th>취소 수수료 정책</th>
                        <td>{cancelFeePolicy || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: "20px", textAlign: "right" }}>
                  <button
                    type="button"
                    className="admin-con-btn admin-inven3-back-btn"
                    onClick={() => navigate("/admin/AdminOrders")}
                  >
                    목록으로 돌아가기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
}
