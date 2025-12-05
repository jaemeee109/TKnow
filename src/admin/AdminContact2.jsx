// src/admin/AdminContact2.jsx
import React, { useEffect, useState } from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar"
import api from "../api";

const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

export default function AdminAllInquiries() {

  const [inquiries, setInquiries] = useState([]);

 useEffect(() => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.warn("로그인이 필요합니다.");
    return;
  }

  // 여기 URL만 관리자를 위한 전체 목록으로 변경
  fetch(`${BASE_URL}/admin/boards`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("전체 문의 내역:", data);
      setInquiries(data.list || []);
    })
    .catch((err) => console.error("문의 불러오기 실패:", err));
}, []);


  return (
    // src/admin/AdminContact2.jsx

<div className="member-Member-page">
  <AdminSidebar />
  <div className="member-right">
    <div className="member-myTk-box2">
      {/* ⬇ 여기만 수정 */}
      <div className="mytick-main-box admin-contact-main-box">
        <strong>회원 문의 내역</strong>
        <br /><br />

        {inquiries.length === 0 ? (
          <p>문의 내역이 없습니다.</p>
        ) : (
          inquiries.map((inq, idx) => (
            <div className="member-mycont-Box" key={idx}>
              <div className="cont-cont-list">
                <Link
                  to={`/admin/AdminContact/${inq.boardId}`}
                  className="cont-link"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <strong>[문의]</strong>
                  <span> {inq.title}</span>
                  <span style={{ marginLeft: "10px", color: "#555" }}>
                    ({inq.memberId})
                  </span>
                </Link>

                {inq.reply ? (
                  <p>
                    <strong>[답변]</strong>
                    <span> {inq.reply} </span>
                  </p>
                ) : (
                  <p>
                    <strong>[답변대기]</strong>
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        <br />
        <div className="member-myCont-plus">
          <strong> + </strong> <span> 문의 목록 더 보기 </span>
        </div>
        <br />
      </div>
    </div>
  </div>
</div>

  );
}
