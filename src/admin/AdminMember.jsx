// src/admin/AdminMember.jsx
import React, { useEffect, useState } from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import api from "../api";
import Pro from "../images/propile.png"; // 기본 프로필 이미지

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


const date = new Date();

export default function Member() {
  const [members, setMembers] = useState([]);
 const [loading, setLoading] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    api
      .get("members?page=1&size=6", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const list = Array.isArray(res.data.list) ? res.data.list : [];
        setMembers(list);
      })
      .catch((error) => {
        console.error("회원 목록 조회 실패:", error.response?.data || error);
      });
  }, []);





  return (
    <div className="member-Member-page">
      <AdminSidebar />{/* ← 공통 사이드바 호출 */}

      <div className="member-right">
        <div className="member-Member-box2">
          {members.length === 0 && <p>회원 정보가 없습니다.</p>}

          {members
            .filter((member) => member.memberRole !== "ADMIN") // ADMIN 제외
            .map((member, index) => {
              
              const profileSrc = resolveImageUrl(member.profileImageUrl);

              return (
                <Link
                  key={member.member_id || index} //  key 반드시 필요 
                  to={`/admin/AdminMember1/${member.memberId}`}
                  className={
                    index === 0 ? "admin-Member-conBox" : "admin-Member-conBoxnoe"
                  }
                >
                  <img
                      src={profileSrc}
                      alt="멤버_상세"
                      className="admin-Member-memImg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = Pro; // 관리자 목록에서도 기본 프로필로 대체
                      }}
                    />
                  <div className="admin-Member-Box1">
                    <span>신규</span>
                    <div className="admin-Member-BoxTb">
                      <table>
                        <tbody>
                          <tr>
                            <td>{member.memberName}</td>
                            <td>｜</td>
                            <td>{member.memberId}</td>
                          </tr>
                          <tr>
                            <td>{member.memberEmail}</td>
                            <td>｜</td>
                            <td>{member.memberPhone}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Link>
              );
            })}


          <div className="admin-member-plus">
            <strong> + </strong> <span> 회원 목록 더 보기 </span>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
}
