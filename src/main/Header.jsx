// src/main/Header.jsx
import React from "react";
import "../css/style.css";
import { Link, useNavigate, useParams } from "react-router-dom"; // ✅ navigate 추가
import LogoImg from "../images/TKNOW.png";

export default function Header() {
  const navigate = useNavigate();
  const memberId = useParams();

  // 로그인 상태 확인: 토큰이 있으면 true
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("memberId");
    localStorage.removeItem("role");

    alert("로그아웃 되었습니다");
    navigate("/"); // 메인으로
   window.location.replace("/");
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src={LogoImg} alt="티켓나우 로고" className="logo" />
        </Link>
      </div>

      <div className="ne-menu">

        {isLoggedIn ? (
          // 로그인 상태 UI
          <>
            <Link className="logoutBtn" onClick={handleLogout}>
              LOGOUT
            </Link>

			<Link 
			  className="myPage" 
			  to={role === "ADMIN" ? "/admin/Admin" : `/member/Member/${localStorage.getItem("memberId")}`}
			>
			  MY PAGE
			</Link>
          </>
        ) : (
          // 비로그인 UI
          <>
            <Link className="join" to="/member/Login">
              LOGIN
            </Link>

            <Link className="join" to="/member/Join">
              JOIN
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
