// src/member/MyContact.jsx
import React, { useEffect, useState } from "react";
import "../css/member.css";
import "../css/style.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api";
import MemberSidebar from "./MemberSidebar";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function MyContact() {

  const [inquiries, setInquiries] = useState([]);
  const [page, setPage] = useState(1);      // 현재 페이지
  const PAGE_SIZE = 5;                      // 한 페이지당 5개

  const { boardId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`${API_BASE}/boards/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setInquiries(data.list || []))
      .catch((err) => console.error("문의 불러오기 실패:", err));
  }, []);

  // 전체 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(inquiries.length / PAGE_SIZE));

  // 현재 페이지에 표시할 문의 목록(5개)
  const startIndex = (page - 1) * PAGE_SIZE;
  const currentInquiries = inquiries.slice(startIndex, startIndex + PAGE_SIZE);

  // 이전 페이지로 이동
  const handlePrevPage = () => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // 다음 페이지로 이동
  const handleNextPage = () => {
    setPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  return (
    <div className="member-Member-page-1">

      <MemberSidebar active="myContact" />

      <div className="member-right">
        <div className="member-myTk-box2-1">
          <strong>&nbsp;&nbsp;내 문의 내역</strong>

          {currentInquiries.map((inq) => (
            <div
              key={inq.boardId}
              className="member-mycont-Box-1"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/member/ContactRead/${inq.boardId}`)} // 클릭 시 이동
            >
              <div className="cont-cont-list">
                <strong>[문의]</strong> <span>{inq.title}</span><br />
                {inq.replyCount > 0 ? (
                  <p><strong>[답변완료]</strong></p>
                ) : (
                  <p><strong>[답변대기]</strong></p>
                )}
              </div>

            </div>
          ))}

          {/* 페이징: 5개씩 표시, [이전] 현재페이지/총페이지 [다음] */}
          {inquiries.length > 0 && (
            <div className="member-myTk-pagination">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                이전
              </button>
              <span>
                {" "}
                {page} / {totalPages}{" "}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                다음
              </button>
            </div>
          )}

        </div>

        {/* 문의하기 버튼: Link → button 으로 변경, 가운데 정렬 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            className="member-myCont-but1-1"
            onClick={() => navigate("/member/Contact")}
          >
            문의하기
          </button>
        </div>

      </div>
    </div>
  );
}
