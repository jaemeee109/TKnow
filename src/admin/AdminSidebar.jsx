// src/admin/AdminSidebar.jsx
import React from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link, useLocation } from "react-router-dom";
export default function AdminSidebar({ adminName }) {
  const location = useLocation();

  const isActive = (pathPrefix) => location.pathname.startsWith(pathPrefix);

  const memberClass = isActive("/admin/AdminMember")
    ? "member-Member-click"
    : "member-mytick";

  const contactClass = (isActive("/admin/AdminContact") || isActive("/admin/AdminContact2"))
    ? "member-Member-click"
    : "member-mytick";

  const invenClass = isActive("/admin/AdminInven")
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
            <tr>
              <td>
                <Link to="/admin/AdminMember" className={memberClass}>
                  회원 관리
                </Link>
              </td>
            </tr>
            <tr><td>보안 관리</td></tr>
            <tr>
              <td>공지사항 관리</td>
              <td className="admin-btn">공지 등록</td>
            </tr>
            <tr>
              <td>
                <Link to="/admin/AdminContact2" className={contactClass}>
                  1:1 문의사항 관리
                </Link>
              </td>
            </tr>
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
          </tbody>
        </table>
        <hr className="member-box1-bottom" />
        <br /><br />
        <span className="member-box1-logout">로그아웃</span>
      </div>
    </div>
  );
}
