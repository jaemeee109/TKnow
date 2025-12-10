// src/admin/AdminMember1.jsx
import React, { useEffect, useState } from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import HeartImg from "../images/heart.png";
import api from "../api";

// '년.월.일 시:분:초' 형식으로 표시
function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}:${ss}`;
}

function AdminMember1() {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [memberRole, setMemberRole] = useState("USER");

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

  // 주문상태 옵션 (AdminOrders.jsx와 동일)
  const ordersStatusOptions = [
    { value: "PAY_WAITING", label: "결제대기" },
    { value: "PAY_COMPLETED", label: "결제완료" },
    { value: "CANCEL_REQUEST", label: "취소요청" },
    { value: "CANCEL_COMPLETED", label: "취소완료" },
  ];

  // 회원 상세 + 회원별 주문내역(3개/페이지) + 환불 요약 + 회원별 문의내역(3개/페이지) 조회
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("관리자 권한이 필요합니다. (토큰 없음)");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [memberRes, ordersRes, refundRes, inquiryRes] = await Promise.all([
          api.get(`/members/${memberId}`, { headers }),
          api.get(`/orders/member/${memberId}?page=${ordersPage}&size=3`, { headers }),
          api.get(`/members/admin/${memberId}/tickets/refunds`, { headers }),
          api.get(`/admin/boards/member/${memberId}?page=${inqPage}&size=3`, { headers }),
        ]);

        const memberData = memberRes.data;
        setMember(memberData);
        setMemberRole(memberData.memberRole || "USER");

        // 주문내역
        const o = ordersRes.data || {};
        const oList = o.list || [];
        setOrders(oList);
        const oTotal = o.totalCount != null ? o.totalCount : oList.length;
        const oSize = o.size || 3;
        const oPages = Math.max(1, Math.ceil(oTotal / oSize));
        setOrdersTotalPages(oPages);

        // 환불 요약
        setRefundSummary(refundRes.data || null);

        // 문의내역
        const q = inquiryRes.data || {};
        const qList = q.list || [];
        setInquiries(qList);
        const qTotal = q.totalCount != null ? q.totalCount : qList.length;
        const qSize = q.size || 3;
        const qPages = Math.max(1, Math.ceil(qTotal / qSize));
        setInqTotalPages(qPages);
      } catch (err) {
        console.error(err);
        setError("회원 상세 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [memberId, ordersPage, inqPage]);

  // 멤버 권한 변경
    // 멤버 권한 변경
  const handleRoleSave = async () => {
    if (!member) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("관리자 토큰이 없습니다.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const body = {
        memberRole, // USER / ADMIN
      };

      const res = await api.put(`/members/${member.memberId}`, body, { headers });
      const updated = res.data;
      setMember(updated);
      setMemberRole(updated.memberRole || memberRole);
      alert("회원 권한이 변경되었습니다.");
    } catch (err) {
      console.error(err);
      alert("회원 권한 변경 중 오류가 발생했습니다.");
    }
  };


  // 주문상태 select 값 변경
  const handleStatusChange = (ordersId, value) => {
    setSelectedStatus((prev) => ({
      ...prev,
      [ordersId]: value,
    }));
  };

  // 주문상태 변경 요청
    // 주문상태 변경 요청
  const handleStatusUpdate = async (ordersId) => {
    const newStatus =
      selectedStatus[ordersId] ||
      (orders.find((o) => o.ordersId === ordersId)?.ordersStatus ?? null);

    if (!newStatus) {
      alert("변경할 주문 상태를 선택해주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("관리자 토큰이 없습니다.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await api.patch(
        `/orders/admin/${ordersId}/status`,
        { ordersStatus: newStatus },
        { headers }
      );

      // 화면상 목록 갱신
      setOrders((prev) =>
        prev.map((o) =>
          o.ordersId === ordersId ?
            { ...o, ordersStatus: newStatus } :
            o
        )
      );

      alert("주문 상태가 변경되었습니다.");
    } catch (err) {
      console.error(err);
      alert("주문 상태 변경 중 오류가 발생했습니다.");
    }
  };

  // 환불 요약 카드에서 상태 토글 (기존 로직 유지)
  const toggleRefundStatus = (statusKey) => {
    setRefundSummary((prev) => {
      if (!prev) return prev;
      const newStatus = { ...prev.status };
      newStatus[statusKey] = !newStatus[statusKey];
      return { ...prev, status: newStatus };
    });
  };

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
          <p>{error}</p>
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
          <div className="admin-member-memBox">
            <div className="admin-member-titleBox">
              <h2 className="admin-member-title">
                <img src={HeartImg} alt="heart" className="admin-member-heart" />
                회원 정보 상세
              </h2>
            </div>

            <table className="admin-member-memBox-table">
              <tbody>
                <tr>
                  <th>아이디</th>
                  <td>{member.memberId}</td>
                  <th>이름</th>
                  <td>{member.memberName}</td>
                </tr>
                <tr>
                  <th>이메일</th>
                  <td>{member.memberEmail}</td>
                  <th>연락처</th>
                  <td>{member.memberPhone}</td>
                </tr>
                <tr>
                  <th>가입일</th>
                  <td>{formatDateTime(member.createdAt)}</td>
                  <th>마지막 로그인</th>
                  <td>{member.lastLoginAt ? formatDateTime(member.lastLoginAt) : "-"}</td>
                </tr>
                <tr>
                  <th>주소</th>
                  <td colSpan="3">
                    {member.zipCode ? `[${member.zipCode}] ` : ""}
                    {member.address1} {member.address2}
                  </td>
                </tr>
                {/* ✅ 멤버 권한 지정 옵션 */}
                <tr>
                  <th>회원 권한</th>
                  <td colSpan="3">
                    <select
                      className="admin-member-role-select"
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                    >
                      <option value="USER">일반회원</option>
                      <option value="ADMIN">관리자</option>
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
                    <th>주문일시</th>
                    <th>결제상태</th>
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
                      <td>{order.ticketTitle}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>{order.payStatusName || order.payStatus}</td>
                      <td>
                        <select
                          className="admin-orders-status-select"
                          value={
                            selectedStatus[order.ordersId] ||
                            order.ordersStatus ||
                            ""
                          }
                          onChange={(e) =>
                            handleStatusChange(order.ordersId, e.target.value)
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
                          onClick={() => handleStatusUpdate(order.ordersId)}
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
                        <td>{formatDateTime(inq.createdAt)}</td>
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

        <br />
      </div>
    </div>
  );
}

export default AdminMember1;
