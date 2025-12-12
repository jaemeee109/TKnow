// src/admin/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import "./../css/admin.css";
import "./../css/style.css";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import api from "../api";

const ORDER_STATUS_OPTIONS = ["CREATED", "PAID", "CANCELED", "REFUNDED"];
const ORDER_STATUS_LABELS = {
  CREATED: "주문중",
  PAID: "결제완료",
  CANCELED: "주문취소",
  REFUNDED: "환불완료",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [size] = useState(20);

  const fetchOrders = async (pageParam = 1) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const res = await api.get("/orders/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: pageParam,
          size,
        },
      });

      const data = res.data || {};
      setOrders(data.list || []);
      setTotalCount(data.totalCount || 0);
      setPage(data.page || pageParam);
    } catch (err) {
      console.error(err);
      setError("주문 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusSelectChange = (ordersId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.ordersId === ordersId ? { ...o, ordersStatus: newStatus } : o
      )
    );
  };

  const handleStatusUpdate = async (ordersId, ordersStatus) => {
    if (!ordersStatus) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      await api.patch(
        `/orders/admin/${ordersId}/status`,
        { ordersStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("주문 상태가 변경되었습니다.");
      fetchOrders(page);
    } catch (err) {
      console.error(err);
      alert("주문 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / size));

  return (
    <div className="member-Member-page">
      <AdminSidebar />
      <div className="member-right">
        <div className="member-myTk-box2">
          {/* 안쪽 카드 박스 (AdminInven 과 동일 톤) */}
          <div className="inven-main-box2 admin-orders-box">
            <div className="admin-inven-tit">주문 내역 관리</div>

            {loading && <p>주문 목록을 불러오는 중입니다...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && orders.length === 0 && (
              <p>등록된 주문 내역이 없습니다.</p>
            )}

            {!loading && !error && orders.length > 0 && (
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th className="admin-orders-col-date">날짜</th>
                    <th className="admin-orders-col-title">공연명</th>
                    <th className="admin-orders-col-qty">티켓수</th>
                    <th className="admin-orders-col-amount">결제금액</th>

                    <th className="admin-orders-col-status">주문상태 변경</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.ordersId}>
                      <td>
                        <Link
                          to={`/admin/AdminOrders/${order.ordersId}`}
                          className="admin-orders-link"
                        >
                          {order.orderDate || "-"}
                        </Link>
                      </td>
                      <td className="admin-orders-title-cell">
                        <Link
                          to={`/admin/AdminOrders/${order.ordersId}`}
                          className="admin-orders-link"
                        >
                          {order.ticketTitle || "제목 없음"}
                        </Link>
                      </td>
                      <td>{order.ticketQuantity || 0}</td>
                      <td>
                        {order.totalAmount != null
                          ? order.totalAmount.toLocaleString() + "원"
                          : "-"}
                      </td>
                     
                      <td className="admin-orders-status-cell">
                        <div className="admin-orders-status-actions">
                          <select
                            className="admin-orders-status-select"
                            value={order.ordersStatus || ""}
                            onChange={(e) =>
                              handleStatusSelectChange(
                                order.ordersId,
                                e.target.value
                              )
                            }
                          >
                            <option value="">상태 선택</option>
                           {ORDER_STATUS_OPTIONS.map((st) => (
  <option key={st} value={st}>
    {ORDER_STATUS_LABELS[st] || st}
  </option>
))}

                          </select>
                          <button
                            type="button"
                            className="admin-con-btn admin-inven3-back-btn"
                            onClick={() =>
                              handleStatusUpdate(
                                order.ordersId,
                                order.ordersStatus
                              )
                            }
                          >
                            변경
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

           {!loading && !error && totalCount > 0 && (
  <div className="admin-orders-pagination">
    <button
      type="button"
      className="admin-con-btn admin-inven3-back-btn"
      disabled={page <= 1}
      onClick={() => fetchOrders(page - 1)}
    >
      이전
    </button>
    <span className="admin-orders-page-info">
      {page} / {totalPages}
    </span>
    <button
      type="button"
      className="admin-con-btn admin-inven3-back-btn"
      disabled={page >= totalPages}
      onClick={() => fetchOrders(page + 1)}
    >
      다음
    </button>
  </div>
)}

          </div>
        </div>
      </div>
    </div>
  );
}
