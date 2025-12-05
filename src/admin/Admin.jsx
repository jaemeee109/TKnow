// src/admin/Admin.jsx
import React, { useState, useEffect } from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link } from "react-router-dom";
import Propile from "../images/propile.png";
import ProMod from "../images/pro_mod.png";
import User from "../images/user.png";
import Inventory1 from "../images/inventory1.png";
import Inventory2 from "../images/inventory2.png";
import Inventory3 from "../images/inventory3.png";
import api from "../api";
import AdminSidebar from "./AdminSidebar"
export default function AdminDashboard() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // JWT
    const adminId = localStorage.getItem("adminId");    // 관리자 ID

    if (!token || !adminId) {
      setError("관리자 로그인이 필요합니다.");
      return;
    }

    api
      .get(`members/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // API 구조에 맞춰서 set
        setAdminInfo(res.data); // res.data가 MemberResponseDTO라고 가정
      })
      .catch((err) => {
        console.error("관리자 정보 조회 실패:", err);
        setError("관리자 정보를 가져오는 데 실패했습니다.");
      });
  }, []);

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!adminInfo) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="member-Member-page">
      {/* 왼쪽 메뉴 */}
     <AdminSidebar />{/* ← 공통 사이드바 호출 */}

      {/* 오른쪽 정보 */}
      <div className="member-right">
        <div className="member-Member-box2">
          <div className="member-pro-box">
            <div className="member-Member-propile-imgBox">
              <img src={Propile} alt="프로필 사진" className="member-Member-proImg" />
              <img src={ProMod} alt="프로필 편집" className="member-Member-prMod" />

              <div className="member-propile-table">
                <table>
                  <tbody>
                    <tr><th>아이디</th><td>{adminInfo.memberId}</td></tr>
                    <tr><th>이메일</th><td>{adminInfo.memberEmail}</td></tr>
                    <tr><th>이름</th><td>{adminInfo.memberName}</td></tr>
                    <tr><th>휴대전화</th><td>{adminInfo.memberPhone}</td></tr>
                    <tr><th>관리자인증</th><td><span className="member-member-VerCom">완료</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <br />

          <div className="member-Member-levelBox">
            <img src={User} alt="등급 아이콘" className="member-Member-heartImg" />
            <div className="admin-levelBox-text">
              <span>새로운 회원이</span>
              <strong>&nbsp;{adminInfo.newMembers || 0} 명 </strong>
              <span>가입했습니다</span>
              <br />
              <span>기존 회원이</span>
              <strong>&nbsp;{adminInfo.withdrawnMembers || 0} 명 </strong>
              <span>탈퇴하였습니다</span>
            </div>
          </div>
          <br />

          <div className="admin-admin-pickBox">
            <div className="admin-botom-picture">
              <span>총 판매 수익</span>
              <img src={Inventory1} alt="픽 1" className="admin-botom-img" />
              <p>{adminInfo.totalRevenue1 || "0"} 원</p>
            </div>
            <div className="admin-botom-picture">
              <span>총 판매 수익</span>
              <img src={Inventory2} alt="픽 2" className="admin-botom-img" />
              <p>{adminInfo.totalRevenue2 || "0"} 원</p>
            </div>
            <div className="admin-botom-picture">
              <span>총 판매 수익</span>
              <img src={Inventory3} alt="픽 3" className="admin-botom-img1" />
              <p>{adminInfo.totalRevenue3 || "0"} 원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
