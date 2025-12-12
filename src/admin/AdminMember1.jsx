// src/admin/AdminMember1.jsx
import React, { useEffect, useState } from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Pro from "../images/propile.png";
import api from "../api";

// 이미지 절대 경로 처리 (회원 프로필 이미지용)
const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

const resolveImageUrl = (path) => {
  if (!path) return Pro;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${BASE_URL}${path}`;
  return `${BASE_URL}/${path}`;
};

// '년.월.일 시:분:초' 형식으로 표시
function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate() + 0).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}:${ss}`;
}

// '년.월.일' 형식 표시
function formatDateOnly(dateStr) {
  if (!dateStr) return "";

  const str = String(dateStr).trim();

  // 1) 문자열에서 숫자만 추출해서 yyyyMMdd 로 해석
  const digits = str.replace(/\D/g, ""); // 예: "2025.12.10.15.15.55" -> "20251210151555"
  if (digits.length >= 8) {
    const yyyy = digits.substring(0, 4);
    const yy = yyyy.substring(2); // 뒤 2자리
    const mm = digits.substring(4, 6);
    const dd = digits.substring(6, 8);
    return `${yy}년 ${mm}월 ${dd}일`;
  }

  // 2) 혹시 모를 다른 형식은 Date 로 한 번 더 처리
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;

  const yyyy = d.getFullYear();
  const yy = String(yyyy).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

function AdminMember1() {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [memberRole, setMemberRole] = useState("USER");

  // 관리자 페이지에서 권한 편집용 상태
  const [editingRole, setEditingRole] = useState(null);

  // 주문내역(회원별)
  const [orders, setOrders] = useState([]);

  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  // 환불 요약
  const [refundSummary, setRefundSummary] = useState(null);

  // 문의내역(회원별)
  const [inquiries, setInquiries] = useState([]);
  const [inqPage, setInqPage] = useState(1);
  const [inqTotalPages, setInqTotalPages] = useState(1);

  // 주문상태 셀렉트 값
  const [selectedStatus, setSelectedStatus] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ 공통 Authorization 헤더 생성 함수 (컴포넌트 상단에 위치해야 함)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("관리자 토큰이 없습니다. 다시 로그인해 주세요.");
      navigate("/");
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // 주문상태 옵션 (백엔드 OrdersStatus enum 과 동일)
  const ordersStatusOptions = [
    { value: "CREATED", label: "결제준비중" },
    { value: "PAID", label: "결제완료" },
    { value: "CANCELED", label: "주문취소" },
    { value: "REFUNDED", label: "환불완료" },
  ];

  // 회원 상세 + 회원별 주문내역(3개/페이지) + 환불 요약 + 회원별 문의내역(3개/페이지) 조회
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = getAuthHeaders();
        if (!headers) {
          setLoading(false);
          return;
        }

        // 1) 회원 상세
        const memberRes = await api.get(`/members/${memberId}`, {
          headers,
        });

        if (!memberRes.data) {
          throw new Error("회원 정보를 찾을 수 없습니다.");
        }

        setMember(memberRes.data);
        setMemberRole(memberRes.data.memberRole || "USER");

        // 권한 편집용 상태 초기화
        setEditingRole({
          memberId: memberRes.data.memberId,
          memberRole: memberRes.data.memberRole || "USER",
        });

        // 2) 회원별 주문내역 (page=ordersPage, size=3)
        const ordersRes = await api.get(`/orders/member/${memberId}`, {
          headers,
          params: {
            page: ordersPage,
            size: 3,
          },
        });

               const ordersData = ordersRes.data;
        const rawList = ordersData.list || [];

        // DB에서 'paid' / 'canceled' 처럼 소문자로 올 수 있으므로 대문자로 정규화
        const normalizedList = rawList.map((o) => ({
          ...o,
          ordersStatus: (o.ordersStatus || "").toUpperCase(), // CREATED / PAID / CANCELED / REFUNDED
        }));

        setOrders(normalizedList);
        setOrdersTotalPages(ordersData.totalPages || 1);


        // 3) 환불 요약
        try {
          const refundRes = await api.get(
            `/members/admin/${memberId}/tickets/refunds`,
            {
              headers,
            }
          );
          setRefundSummary(refundRes.data || null);
        } catch (refundErr) {
          console.error("환불 요약 조회 실패:", refundErr);
          setRefundSummary(null);
        }

        // 4) 회원별 문의내역 (page=inqPage, size=3)
        const inquiryRes = await api.get(`/admin/boards/member/${memberId}`, {
          headers,
          params: { page: inqPage, size: 3 },
        });

        const inqData = inquiryRes.data;
        setInquiries(inqData.list || []);
        setInqTotalPages(inqData.totalPages || 1);
      } catch (err) {
        console.error("AdminMember1 조회 중 오류:", err);
        setError("회원 상세 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [memberId, ordersPage, inqPage, navigate]);

  // 멤버 권한 변경
  const handleRoleSave = async () => {
    if (!editingRole) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const body = {
        memberRole: editingRole.memberRole, // USER / ADMIN / WITHDRAWN
      };

      // ✅ 백엔드 엔드포인트: /members/{memberId}
      await api.put(`/members/${editingRole.memberId}`, body, { headers });

      // 화면에도 즉시 반영
      setMember((prev) =>
        prev ? { ...prev, memberRole: editingRole.memberRole } : prev
      );

      alert("회원 권한이 변경되었습니다.");
      setEditingRole(null);
    } catch (error) {
      console.error("멤버 권한 변경 중 오류:", error);
      alert("회원 권한 변경 중 오류가 발생했습니다.");
    }
  };

  // 주문 상태 변경 select 수정
  const handleStatusChange = (ordersId, newStatus) => {
    setSelectedStatus((prev) => ({
      ...prev,
      [ordersId]: newStatus,
    }));
  };

  // 주문 상태 변경 버튼 클릭 시
  const handleStatusUpdate = async (ordersId) => {
    // 현재 선택된 상태 (없으면 서버에서 받은 상태 사용)
    const currentOrder = orders.find((o) => o.ordersId === ordersId);
    const newStatus =
      selectedStatus[ordersId] || currentOrder?.ordersStatus || "CREATED";

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      // ✅ 백엔드와 동일한 엔드포인트/메서드
      await api.patch(
        `/orders/admin/${ordersId}/status`,
        { ordersStatus: newStatus },
        { headers }
      );

      // 프론트 상태 업데이트
      setOrders((prev) =>
        prev.map((o) =>
          o.ordersId === ordersId ? { ...o, ordersStatus: newStatus } : o
        )
      );

      // 드롭다운 선택값 초기화
      setSelectedStatus((prev) => {
        const copy = { ...prev };
        delete copy[ordersId];
        return copy;
      });

      alert("주문 상태가 변경되었습니다.");
    } catch (error) {
      console.error("주문 상태 변경 중 오류:", error);
      alert("주문 상태 변경 중 오류가 발생했습니다.");
    }
  };

  // 환불 상태 토글
  const toggleRefundStatus = (statusKey) => {
    setRefundSummary((prev) => {
      if (!prev) return prev;
      const newStatus = { ...prev.status };
      newStatus[statusKey] = !newStatus[statusKey];
      return { ...prev, status: newStatus };
    });
  };

  // 회원 프로필 이미지 (없으면 기본 이미지)
  const profileSrc = member ? resolveImageUrl(member.profileImageUrl) : Pro;

  if (loading) {
    return (
      <div className="member-Member-page admin-member-detail-page">
        <AdminSidebar />
        <div className="member-right">
          <p>회원 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-Member-page admin-member-detail-page">
        <AdminSidebar />
        <div className="member-right">
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="member-Member-page admin-member-detail-page">
        <AdminSidebar />
        <div className="member-right">
          <p>회원 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-Member-page admin-member-detail-page">
      <AdminSidebar />
      <div className="member-right">
        {/* 1. 회원정보 카드 + 권한 지정 */}
        <div className="member-myTk-box2">
          <div className="admin-member-memBox admin-member-profile-card">
            {/* 제목 - 상단 왼쪽 정렬 */}
            <div className="admin-member-titleBox">
              <h2 className="admin-member-title">회원 정보 상세</h2>
            </div>

            {/* 프로필(왼쪽) + 정보(오른쪽) */}
            <div className="admin-member-profile-body">
              <div className="admin-member-profile-left">
                <img
                  src={profileSrc}
                  alt="회원 프로필"
                  className="admin-member-heart"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = Pro;
                  }}
                />
              </div>
              <div className="admin-member-profile-right">
                <table className="admin-member-memBox-table">
                  <tbody>
                    <tr>
                      <th>아이디</th>
                      <td>{member.memberId}</td>
                    </tr>
                    <tr>
                      <th>이름</th>
                      <td>{member.memberName}</td>
                    </tr>
                    <tr>
                      <th>이메일</th>
                      <td>{member.memberEmail}</td>
                    </tr>
                    <tr>
                      <th>연락처</th>
                      <td>{member.memberPhone}</td>
                    </tr>
                    <tr>
                      <th>가입일</th>
                      <td>{formatDateOnly(member.createdAt)}</td>
                    </tr>

                    {/* ✅ 멤버 권한 지정 옵션 */}
                    <tr>
                      <th>회원 권한</th>
                      <td>
                        <select
                          value={
                            editingRole
                              ? editingRole.memberRole
                              : member.memberRole || "USER"
                          }
                          onChange={(e) =>
                            setEditingRole((prev) =>
                              prev
                                ? { ...prev, memberRole: e.target.value }
                                : prev
                            )
                          }
                        >
                          <option value="USER">일반회원</option>
                          <option value="ADMIN">관리자</option>
                          <option value="WITHDRAWN">탈퇴계정</option>
                        </select>

                        <button
                          type="button"
                          className="admin-member-role-btn"
                          onClick={handleRoleSave}
                        >
                          권한 변경
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <br />

        {/* 2. 회원 티켓 주문내역 카드 (주문상태 변경 + 페이징 3개) */}
        <div className="member-myTk-box2">
          <div className="admin-member-memBox3">
            <div className="member-myTk-title2">
              <h2>회원 티켓 주문내역</h2>
            </div>

            {orders.length === 0 ? (
              <p className="admin-member-empty-text">주문내역이 없습니다.</p>
            ) : (
              <table className="admin-member-orders-table">
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>공연명</th>
                    <th>주문상태 변경</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.ordersId}>
                      <td>
                        <Link
                          to={`/admin/orders/${order.ordersId}`}
                          className="admin-orders-link"
                        >
                          {order.ordersId}
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/member/ticket/${order.ordersId}`}
                          className="admin-orders-link"
                        >
                          {order.ticketTitle}
                        </Link>
                      </td>
                      <td>
                        <select
                          className="admin-orders-status-select"
                          value={
                            selectedStatus[order.ordersId] ||
                            order.ordersStatus ||
                            ""
                          }
                          onChange={(e) =>
                            handleStatusChange(
                              order.ordersId,
                              e.target.value
                            )
                          }
                        >
                          {ordersStatusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="admin-orders-status-btn"
                          onClick={() =>
                            handleStatusUpdate(order.ordersId)
                          }
                        >
                          변경
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 주문내역 페이징: 3개/페이지 */}
            <div className="member-myTk-pagination">
              <button
                type="button"
                onClick={() =>
                  setOrdersPage((prev) => (prev > 1 ? prev - 1 : prev))
                }
                disabled={ordersPage <= 1}
              >
                이전
              </button>
              <span>
                {ordersPage} / {ordersTotalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setOrdersPage((prev) =>
                    prev < ordersTotalPages ? prev + 1 : prev
                  )
                }
                disabled={ordersPage >= ordersTotalPages}
              >
                다음
              </button>
            </div>
          </div>
        </div>

        <br />

        {/* 3. 회원 문의내역 카드 (제목에 [미답변]/[답변완료] 표시 + 페이징 3개) */}
        <div className="member-myTk-box2">
          <div className="admin-member-memBox4">
            <div className="member-myTk-title2">
              <h2>회원 문의내역</h2>
            </div>

            {inquiries.length === 0 ? (
              <p className="admin-member-empty-text">문의내역이 없습니다.</p>
            ) : (
              <table className="admin-member-inquiry-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>제목</th>
                    <th>작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => {
                    const answered = (inq.replyCount || 0) > 0;
                    const statusText = answered ? "답변완료" : "미답변";
                    return (
                      <tr key={inq.boardId}>
                        <td>{inq.boardId}</td>
                        <td className="admin-member-inquiry-title">
                          <Link to={`/admin/AdminContact/${inq.boardId}`}>
                            <span
                              className={
                                answered
                                  ? "admin-inquiry-status-done"
                                  : "admin-inquiry-status-wait"
                              }
                            >
                              [{statusText}]
                            </span>{" "}
                            {inq.title}
                          </Link>
                        </td>
                        <td>{formatDateOnly(inq.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* 문의내역 페이징: 3개/페이지 */}
            <div className="member-myTk-pagination">
              <button
                type="button"
                onClick={() =>
                  setInqPage((prev) => (prev > 1 ? prev - 1 : prev))
                }
                disabled={inqPage <= 1}
              >
                이전
              </button>
              <span>
                {inqPage} / {inqTotalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setInqPage((prev) =>
                    prev < inqTotalPages ? prev + 1 : prev
                  )
                }
                disabled={inqPage >= inqTotalPages}
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMember1;
