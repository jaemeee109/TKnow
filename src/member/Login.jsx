// src/member/Login.jsx
import React, { useState } from "react";
import "../css/member.css";
import "../css/style.css";
import { Link, useNavigate} from "react-router-dom";
import axios from "axios";
import api from "../api";

export default function Login() {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // 로그인 함수
    const handleLogin = async () => {

        // 빈값 체크
        if (!userId || !password) {
            alert("아이디와 패스워드를 모두 입력하세요.");
            return;
        }

        try {
            // 실제 로그인 요청
            const res = await api.post(
                "/auth/login",
                {
                    memberId: userId,   // 백엔드 DTO 기준
                    password: password  // 필드명 password 맞음
                },
                { withCredentials: true }
            );

            console.log("로그인 성공:", res.data);

            // 토큰 로컬스토리지 저장
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            localStorage.setItem("memberId", userId);

            // axios 기본 헤더에 토큰 세팅
            axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;

            // JWT 페이로드 추출
            const payload = JSON.parse(atob(res.data.accessToken.split(".")[1]));
            const role = payload.role;

            // 역할 저장
            localStorage.setItem("role", role);

            alert("로그인 성공!");

            // 역할에 따른 라우팅
            if (role === "ADMIN") {
				localStorage.setItem("adminId", userId);
                navigate("/admin/Admin");
            } else {
                 navigate("/");
            }

        } catch (err) {
            console.error("로그인 실패:", err);

            if (err.response?.status === 401) {
                alert("아이디 또는 비밀번호가 올바르지 않습니다.");
            } else if (err.response?.status === 403) {
                alert("탈퇴한 회원은 로그인할 수 없습니다.");
            } else if (err.response?.status === 500) {
                alert("서버 오류: 잠시 후 다시 시도해주세요.");
            } else {
                alert(`알 수 없는 오류 발생: ${err.response?.status}`);
            }
        }
    };

    return (
        <div className="member-login-page">
            <div className="member-login-box">
                <strong className="member-login-text">LOGIN</strong><br />

                <div className="member-login-inBox">
                    <table>
                        <tbody>
                            <tr>
                                <th>아이디</th>
                                <td>
                                    <input
                                        type="text"
                                        placeholder="아이디 입력"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>패스워드</th>
                                <td>
                                    <input
                                        type="password"
                                        placeholder="비밀번호 입력"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="member-btn">
                    <Link to="/member/Join" className="member-login-joinBtn">
                        회원가입
                    </Link>
                    <button
                        type="button"
                        className="member-login-logBtn"
                        onClick={handleLogin}
                    >
                        로그인
                    </button>
                </div>
            </div>
        </div>
    );
}
