// src/admin/AdminSidebar.jsx
import React from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar({ adminName }) {
  const location = useLocation();

  const isActive = (pathPrefix) => location.pathname.startsWith(pathPrefix);

  // 메인화면 active
  const homeClass = isActive("/admin/Admin")
    ? "member-Member-click"
    : "member-mytick";

  // 회원 관리
  const memberClass = isActive("/admin/AdminMember")
    ? "member-Member-click"
    : "member-mytick";

  // 문의 관리
  const contactClass =
    isActive("/admin/AdminContact") || isActive("/admin/AdminContact2")
      ? "member-Member-click"
      : "member-mytick";

  // 재고(예매) 관리
  const invenClass = isActive("/admin/AdminInven")
    ? "member-Member-click"
    : "member-mytick";

  // 주문 내역
  const ordersClass = isActive("/admin/AdminOrders")
    ? "member-Member-click"
    : "member-mytick";

  return (
    <div className="member-left">
      <div className="admin-Member-box1">
        <strong>{adminName || "관리자"}</strong>
        <span> 님 반갑습니다!</span>
        <br /><br />
        <table>
          <tbody>
            {/* 메인화면 - 인사말 바로 밑 */}
            <tr>
              <td>
                <Link to="/admin/Admin" className={homeClass}>
                  메인화면
                </Link>
              </td>
            </tr>

            {/* 회원 관리 */}
            <tr>
              <td>
                <Link to="/admin/AdminMember" className={memberClass}>
                  회원 관리
                </Link>
              </td>
            </tr>

   
            {/* 1:1 문의 관리 */}
            <tr>
              <td>
                <Link to="/admin/AdminContact2" className={contactClass}>
                  1:1 문의사항 관리
                </Link>
              </td>
            </tr>

            {/* 재고(예매) 관리 + 상품 등록 */}
            <tr>
              <td>
                <Link to="/admin/AdminInven" className={invenClass}>
                  재고 관리
                </Link>
              </td>
              <td>
                <Link to="/admin/AdminInven2" className="admin-btn2">
                  상품 등록
                </Link>
              </td>
            </tr>

            {/* 주문 내역 메뉴 */}
            <tr>
              <td>
                <Link to="/admin/AdminOrders" className={ordersClass}>
                  주문 내역
                </Link>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
