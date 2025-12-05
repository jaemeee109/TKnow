// src/member/MemberSidebar.jsx

import React, { useState, useEffect } from "react";
import "../css/member.css";
import "../css/style.css";
import { Link, useLocation } from "react-router-dom";   // ✅ useLocation 추가
import api from "../api";

export default function MemberSidebar() {
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");

  const location = useLocation();
  const path = location.pathname || "";

  // ✅ URL 기준으로 자동 선택
  let autoActive = "";
  if (path.startsWith("/member/Member")) {
    autoActive = "member";
  } else if (path.startsWith("/member/MyTick")) {
    autoActive = "myTick";
  } else if (
    path.startsWith("/member/MyContact") ||
    path.startsWith("/member/Contact") ||
    path.startsWith("/member/ContactRead") ||
    path.startsWith("/member/OftenContact")
  ) {
    autoActive = "myContact";
  }

  // ✅ 이제는 URL 기준만 사용 (active prop 무시)
  const current = autoActive;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const localMemberId = localStorage.getItem("memberId");
    if (!token || !localMemberId) return;

    setMemberId(localMemberId);

    api
      .get(`members/${localMemberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMemberName(res.data.memberName || localMemberId);
      })
      .catch(() => {
        setMemberName(localMemberId);
      });
  }, []);

  return (
    <div className="member-left">
      <div className="member-Member-box1">
        <strong>{memberName || "회원"}</strong>
        <span>님 반갑습니다!</span>
        <br />
        <br />

        <table>
          <tbody>
            <tr>
              <td>
                <Link
                  to={memberId ? `/member/Member/${memberId}` : "/member/Member"}
                  className={
                    current === "member"
                      ? "member-Member-click"
                      : "member-Member"
                  }
                >
                  회원정보
                </Link>
              </td>
            </tr>
            <tr>
              <td>보안설정</td>
            </tr>
            <tr>
              <td>회원등급</td>
            </tr>
            <tr>
              <td>
                <Link
                  to="/member/MyTick"
                  className={
                    current === "myTick"
                      ? "member-Member-click"
                      : "member-Member"
                  }
                >
                  나의 티켓
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <Link
                  to="/member/MyContact"
                  className={
                    current === "myContact"
                      ? "member-Member-click"
                      : "member-Member"
                  }
                >
                  1:1 문의 내역
                </Link>
              </td>
            </tr>
            <tr>
              <td>고객센터</td>
            </tr>
            <tr>
              <td>공지사항</td>
            </tr>
          </tbody>
        </table>

        <hr className="member-box1-bottom" />

        <table>
          <tbody className="member-box1-bottom1">
            <tr>
              <td>내 아이돌 콘서트 앞 숙소 예약까지</td>
            </tr>
            <tr>
              <th>콘서트 준비는 티켓나우와 함께!</th>
            </tr>
          </tbody>
        </table>

        <br />
        <br />
        <span className="member-box1-logout">로그아웃</span>
      </div>
    </div>
  );
}