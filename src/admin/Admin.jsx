// src/admin/Admin.jsx
import React, { useState, useEffect } from "react";
import "../css/admin.css";
import "../css/style.css";
import Propile from "../images/propile.png";
import User from "../images/user.png";
import Inventory1 from "../images/inventory1.png";
import Inventory2 from "../images/inventory2.png";
import Inventory3 from "../images/inventory3.png";
import api from "../api";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboard() {
  // (1) 관리자 기본 정보
  const [adminInfo, setAdminInfo] = useState(null);

  // (2) 최근 1달 회원 통계
  const [memberStats, setMemberStats] = useState({
    newMembers: 0,
    withdrawnMembers: 0,
  });

  // (3) 매출 통계 (총매출 / 총원가 / 총 순이익)
  const [revenue, setRevenue] = useState({
    totalRevenue1: 0, // 총매출
    totalRevenue2: 0, // 총원가
    totalRevenue3: 0, // 총 순이익
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // JWT
    const adminId = localStorage.getItem("adminId");   // 관리자 ID

    if (!token || !adminId) {
      setError("관리자 로그인이 필요합니다.");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const [memberRes, statsRes, summaryRes] = await Promise.all([
          api.get(`/members/${adminId}`, { headers }),
          api.get("/members/admin/dashboard-stats", { headers }),
          api.get("/orders/admin/summary", { headers }),
        ]);

        // --- 관리자 기본 정보 ---
        setAdminInfo(memberRes.data);

        // --- 최근 한 달 회원 통계 ---
        const statsData = (statsRes && statsRes.data) || {};
        setMemberStats({
          newMembers: statsData.newMembers ?? 0,
          withdrawnMembers: statsData.withdrawnMembers ?? 0,
        });

        // --- 매출 통계 (총매출/총원가/총 순이익) ---
        const summaryData = (summaryRes && summaryRes.data) || {};
        setRevenue({
          totalRevenue1: summaryData.totalSalesAmount ?? 0,
          totalRevenue2: summaryData.totalCostAmount ?? 0,
          totalRevenue3: summaryData.totalProfitAmount ?? 0,
        });
      } catch (err) {
        console.error("관리자 정보/통계 조회 실패:", err);
        setError("관리자 정보를 가져오는 데 실패했습니다.");
      }
    };

    fetchAll();
  }, []);

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!adminInfo) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="member-Member-page admin-Admin-page">
      <AdminSidebar />

      <div className="member-right">
        {/* 상단 인사 영역 */}
        <div className="admin-top-box">
          <h2>{adminInfo.memberName} 관리자님, 환영합니다.</h2>
        </div>

        {/* 1. 관리자 기본 정보 카드 */}
        <div className="member-myTk-box2">
          <div className="admin-member-profile-card">
            {/* 카드 제목 */}
            <div className="admin-member-titleBox">
            </div>

            {/* 프로필(왼쪽) + 정보(오른쪽) 가로 배치 */}
            <div className="admin-member-profile-body">
              {/* 왼쪽: 프로필 이미지 */}
              <div className="admin-member-profile-left">
                <img
                  src={Propile}
                  alt="관리자 프로필"
                  className="admin-member-heart"
                />
              </div>

              {/* 오른쪽: 관리자 정보 테이블 */}
              <div className="admin-member-profile-right">
                <table className="admin-member-memBox-table">
                  <tbody>
                    <tr>
                      <th>아이디</th>
                      <td>{adminInfo.memberId}</td>
                    </tr>
                    <tr>
                      <th>이름</th>
                      <td>{adminInfo.memberName}</td>
                    </tr>
                    <tr>
                      <th>이메일</th>
                      <td>{adminInfo.memberEmail}</td>
                    </tr>
                    <tr>
                      <th>전화번호</th>
                      <td>{adminInfo.memberPhone}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 2-1. 최근 1달 회원 현황 카드 (가입/탈퇴) */}
        <div className="member-myTk-box2">
          <div className="admin-member-stats-card">
            <div className="admin-member-stats-left">
              <img src={User} alt="회원 아이콘" />
            </div>
            <div className="admin-member-stats-right">
              <p>
                최근 한달 새로운 회원이&nbsp;{" "}
                <strong>{memberStats.newMembers} 명</strong> 가입했습니다.
              </p>
              <p>
                탈퇴한 회원은{" "}
                <strong>{memberStats.withdrawnMembers} 명</strong> 입니다.
              </p>
            </div>
          </div>
        </div>

        {/* 2-2. 매출 현황 카드 (총매출 / 총원가 / 총 순이익) */}
        <div className="member-myTk-box2">
          <div className="admin-admin-pickBox">
            <div className="admin-botom-picture">
              <span>총 매출</span>
              <img
                src={Inventory1}
                alt="총 매출"
                className="admin-botom-img"
              />
              <p>{Number(revenue.totalRevenue1 || 0).toLocaleString()} 원</p>
            </div>
            <div className="admin-botom-picture">
              <span>총 원가</span>
              <img
                src={Inventory2}
                alt="총 원가"
                className="admin-botom-img"
              />
              <p>{Number(revenue.totalRevenue2 || 0).toLocaleString()} 원</p>
            </div>
            <div className="admin-botom-picture">
              <span>총 순이익</span>
              <img
                src={Inventory3}
                alt="총 순이익"
                className="admin-botom-img1"
              />
              <p>{Number(revenue.totalRevenue3 || 0).toLocaleString()} 원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
