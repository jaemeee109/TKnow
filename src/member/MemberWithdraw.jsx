// src/member/MemberWithdraw.jsx
import React, { useState } from "react";
import "../css/member.css";
import "../css/style.css";
import { useNavigate } from "react-router-dom";
import api from "../api";
import MemberSidebar from "./MemberSidebar";

export default function MemberWithdraw() {
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  // JWT 에서 memberId 추출
  const parseJwt = (tokenValue) => {
    try {
      const base64Url = tokenValue.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT 파싱 실패:", e);
      return null;
    }
  };

  const handleWithdraw = async () => {
    if (!agree) {
      alert("안내 사항에 동의해 주세요.");
      return;
    }

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const payload = parseJwt(token);
    const memberId = payload?.memberId;

    if (!memberId) {
      alert("회원 정보를 찾을 수 없습니다.");
      return;
    }

    if (
      !window.confirm(
        "정말로 탈퇴하시겠습니까?\n탈퇴 후에는 계정을 복구할 수 없습니다."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/members/${memberId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 백엔드에서는 memberRole 을 WITHDRAWN 으로 설정하고
      // 토큰 블랙리스트 처리까지 이미 수행하고 있습니다.
      localStorage.removeItem("accessToken");
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
      const msg =
        err.response?.data?.message ||
        "회원 탈퇴 처리 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  const handleCancel = () => {
    navigate("/member/Member");
  };

  return (
    <div className="member-Member-page">
      <MemberSidebar active="member" />
      <div className="member-right">
        <div className="member-myTk-box2">
          <strong>&nbsp;&nbsp;회원 탈퇴</strong>

          <div className="member-withdraw-box">
            <p className="member-withdraw-text">
              회원 탈퇴 시 예매 내역 조회 및 각종 서비스 이용이 제한되며,
              <br />
              한 번 탈퇴한 계정은 복구가 불가능합니다.
            </p>
            <p className="member-withdraw-text">
              또한, 관련 법령에 따라 일정 기간 보관이 필요한 정보는
              <br />
              법정 보관 기간 동안 안전하게 분리 보관됩니다.
            </p>

            <label className="member-withdraw-agree">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>위 안내 사항을 모두 확인하였으며, 회원 탈퇴에 동의합니다.</span>
            </label>

            <div className="member-withdraw-actions">
              <button
                type="button"
                className="member-Member-btn"
                onClick={handleWithdraw}
              >
                탈퇴하기
              </button>
              <button
                type="button"
                className="member-Member-btn member-Member-btn-outline"
                onClick={handleCancel}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
