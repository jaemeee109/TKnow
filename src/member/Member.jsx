// src/member/member.jsx
import React, { useState, useEffect } from "react";
import "../css/member.css";
import "../css/style.css";
import { Link, useNavigate } from "react-router-dom";
import Pro from "../images/propile.png";
import ProMod from "../images/pro_mod.png";
import api from "../api";
import MemberSidebar from "./MemberSidebar";

const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

const resolveImageUrl = (path) => {
  // 1) 값이 없으면 기본 프로필
  if (!path) {
    return Pro;
  }

  // 2) 이미 절대 URL 이면 그대로 사용
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 3) /uploads, /static 같이 슬래시로 시작하는 경우 → baseURL 뒤에 그대로 붙이기
  if (path.startsWith("/")) {
    return `${BASE_URL}${path}`;
  }

  // 4) 그 외에는 / 하나 끼워서 붙이기
  return `${BASE_URL}/${path}`;
};


export default function Member() {
  const navigate = useNavigate();

  const [memberId, setMemberId] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [recentOrder, setRecentOrder] = useState(null);
  const [profileUrl, setProfileUrl] = useState(""); // 프로필 이미지 URL

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // 받은 토큰
    const localMemberId = localStorage.getItem("memberId"); // 로그인한 아이디

    // 토큰이나 아이디가 없으면 여기서 종료
    if (!localMemberId || !token) return;

    setMemberId(localMemberId);

    // 1) 회원 정보 가져오기 - 항상 서버 응답을 기준으로 사용
    api
      .get(`/members/${localMemberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMemberId(res.data.memberId || "");
        setMemberEmail(res.data.memberEmail || "");
        setMemberName(res.data.memberName || "");
        setMemberPhone(res.data.memberPhone || "");

        if (res.data.profileImageUrl) {
          const imageUrl = resolveImageUrl(res.data.profileImageUrl);
          setProfileUrl(imageUrl);          // ✅ 서버 값 그대로 사용
        } else {
          setProfileUrl("");                // ✅ 서버에 프로필이 없으면 기본 이미지 사용
        }
      })
      .catch((err) => {
        console.error("회원정보 조회 실패:", err);
        // 실패 시에는 기본이미지 사용
        setProfileUrl("");
      });

    // 2) 최근 주문 1건 조회 (기존 그대로)
    api
      .get("orders?page=1&size=1", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const raw = res.data.list?.[0];
        if (!raw) return;

        const recent = {
          thumbnail: raw.ticketThumbnail,
          concertName: raw.ticketTitle,
          venue: raw.ticketVenue,
          date: raw.ticketDate,
          daysAgo: raw.ddayText,
          ordersId: raw.ordersId,
        };

        console.log("매핑된 최근 주문:", recent);
        setRecentOrder(recent);
      })
      .catch((err) => console.error("최근 주문 조회 실패:", err));
  }, []);


  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("memberId");
    localStorage.removeItem("role");

    alert("로그아웃 되었습니다");
    navigate("/"); // 메인페이지로 이동
    window.location.replace("/");
  };
  // 프로필 변경 함수

  const handleChangeImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = localStorage.getItem("accessToken");
        const memberId = localStorage.getItem("memberId");

        // 1) 프로필 이미지 업로드
        await api.post(`members/${memberId}/profile-image`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        // 2) 업로드 직후, 항상 서버에서 최종 회원 정보를 다시 조회
        const memberRes = await api.get(`members/${memberId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (memberRes.data.profileImageUrl) {
          const imageUrl = resolveImageUrl(memberRes.data.profileImageUrl);
          setProfileUrl(imageUrl);         //  서버 최종 값으로 화면 갱신
        } else {
          setProfileUrl("");               //  서버에 값 없으면 기본 이미지
        }

        alert("프로필 이미지가 변경되었습니다.");
      } catch (err) {
        console.error("업로드 실패:", err);
        alert("이미지 업로드 실패");
      }
    };

    input.click();
  };

  // 회원정보(이메일, 휴대전화) 변경
  const handleUpdateMember = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!memberId) {
      alert("회원 정보를 불러오지 못했습니다.");
      return;
    }

    try {
      const res = await api.put(
        `/members/${memberId}`,
        {
          memberEmail,
          memberPhone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 혹시 서버에서 값 정제/변경하는 경우 대비해서 응답 값으로 다시 세팅
      if (res?.data) {
        setMemberEmail(res.data.memberEmail || "");
        setMemberPhone(res.data.memberPhone || "");
      }

      alert("회원 정보가 수정되었습니다.");
    } catch (err) {
      console.error("회원 정보 수정 실패:", err);
      const msg =
        err.response?.data?.message || "회원 정보 수정에 실패했습니다.";
      alert(msg);
    }
  };


  // 프로필 이미지 기본이미지로 되돌리기 (프론트 기준)
  const handleResetProfileImage = () => {
    // profileUrl 을 비워 두면 아래 resolveImageUrl 에서 기본이미지(Pro)를 사용하도록 처리되어 있습니다.
    setProfileUrl("");
  };

  // 회원 탈퇴 페이지로 이동
  const handleGoWithdraw = () => {
    navigate("/member/Withdraw");
  };



  return (
    <div className="member-Member-page">
      <MemberSidebar active="myContact" />
      <div className="member-right">
        <div className="member-Member-box2">
          <div className="member-pro-box">
            <div className="member-Member-propile-imgBox">

                           <img
                src={profileUrl ? profileUrl : Pro}
                alt="프로필_사진"
                className="member-Member-proImg"
                onError={(e) => {
                  // 무한 onError 루프 방지
                  e.target.onerror = null;
                  // 이미지 로딩 실패 시 기본 프로필로 교체
                  e.target.src = Pro;
                }}
              />
              {/* 프로필 이미지 변경 / 삭제 버튼 (같은 스타일, 나란히 배치) */}
              <button
                onClick={handleChangeImage}
                className="member-propile-change-btn"
              >
                변경
              </button>
              <button
                onClick={handleResetProfileImage}
                className="member-propile-change-btn"
              >
                삭제
              </button>
              <img
                src={ProMod}
                alt="프로필_사진"
                className="member-Member-prMod"
              />

                          <div className="member-propile-table">
                <table>
                  <tbody>
                    <tr>
                      <th>아이디</th>
                      <td>{memberId}</td>
                    </tr>
                    <tr>
                      <th>이메일</th>
                      <td>
                        <input
                          type="email"
                          className="member-Member-input"
                          value={memberEmail || ""}
                          onChange={(e) => setMemberEmail(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>이름</th>
                      <td>{memberName}</td>
                    </tr>
                    <tr>
                      <th>휴대 전화 번호</th>
                      <td>
                        <input
                          type="text"
                          className="member-Member-input"
                          value={memberPhone || ""}
                          onChange={(e) => setMemberPhone(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="member-Member-actions">
                <button
                  type="button"
                  className="member-Member-btn"
                  onClick={handleUpdateMember}
                >
                  회원정보 변경
                </button>
              </div>


            </div>
          </div>
  

                    <div className="member-Member-remove">
            <span onClick={handleLogout}>로그아웃</span>
            <span>&nbsp;｜&nbsp;</span>
            <span onClick={handleGoWithdraw}>회원탈퇴</span>
          </div>

        </div>
      </div>
    </div>
  );
}
