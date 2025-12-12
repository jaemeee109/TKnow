// src/admin/AdminContact2.jsx
import React, { useEffect, useState } from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import api from "../api";

const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

export default function AdminAllInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [page, setPage] = useState(1); // 현재 페이지
  const [totalCount, setTotalCount] = useState(0); // 전체 문의 개수(서버 totalCount)
  const PAGE_SIZE = 10; // 한 페이지당 5개

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.warn("로그인이 필요합니다.");
      return;
    }

    //  서버가 기본 size=10으로 페이징하므로, 반드시 page/size를 전달해야 전체가 페이지로 조회됩니다.
    fetch(`${BASE_URL}/admin/boards?page=${page}&size=${PAGE_SIZE}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("전체 문의 내역:", data);
        setInquiries(data.list || []);
        setTotalCount(typeof data.totalCount === "number" ? data.totalCount : 0);
      })
      .catch((err) => console.error("문의 불러오기 실패:", err));
  }, [page]);

  // 전체 페이지 수 계산 (서버 totalCount 기준)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // 이전 페이지로 이동
  const handlePrevPage = () => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // 다음 페이지로 이동
  const handleNextPage = () => {
    setPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  return (
    // src/admin/AdminContact2.jsx
    <div className="member-Member-page">
      <AdminSidebar />
      <div className="member-right">
        <div className="member-myTk-box2">
          <div className="mytick-main-box admin-contact-main-box">
            <strong>회원 문의 내역</strong>
            <br />
            <br />

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
                        {inq.memberId}
                      </span>
                    </Link>

                    {(inq.replyCount || 0) > 0 ? (
  <p>
    <strong>[답변완료]</strong>
  </p>
) : (
  <p>
    <strong style={{ color: "#cacacaff" }}>[답변대기]</strong>
  </p>
)}

                  </div>
                </div>
              ))
            )}

            {/* 페이징 버튼 */}
            <div className="ticket-pagination">
              <button
                className="page-btn"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                ◀
              </button>
              <span className="page-info">
                {page}/{totalPages}
              </span>
              <button
                className="page-btn"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
