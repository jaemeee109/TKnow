import React, { useEffect, useState } from "react";
import "../css/style.css";
import { Link } from "react-router-dom";
import Nmx1 from "../images/nmx1.png";
import Nmx2 from "../images/nmx2.png";
import Nmx3 from "../images/nmx3.png";
import Nmx4 from "../images/nmx4.png";
import Nmx5 from "../images/nmx5.png";
import Nmx6 from "../images/nmx6.png";

const profileImages = [Nmx1, Nmx2, Nmx3, Nmx4, Nmx5, Nmx6];
const date = new Date();

export default function Member() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // JWT 토큰
    fetch("http://localhost:9090/ticketnow/members?page=1&size=6", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }) 
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
		
        console.log("멤버 데이터:", data);
		console.log(data.list[0]);
        setMembers(data.list || []);
      })
      .catch((err) => console.error("멤버 정보 로드 실패:", err));
  }, []);
  
 
  
  

  return (
    <div className="member-Member-page">
      <div className="member-left">
        <div className="admin-Member-box1">
          <strong>관리자</strong><span> 님 반갑습니다!</span><br /><br />
          <table>
            <tbody>
              <tr>
                <td>
                  <Link to="/admin/AdminMember" className="member-Member-click">
                    회원 관리
                  </Link>
                </td>
              </tr>
              <tr><td>보안 관리</td></tr>
              <tr>
                <td>공지사항 관리</td>
                <td className="admin-btn">공지 등록</td>
              </tr>
              <tr>
                <td>
                  <Link to="/admin/AdminContact" className="member-mytick">
                    1:1 문의사항 관리
                  </Link>
                </td>
              </tr>
              <tr>
                <td>
                  <Link to="/admin/AdminInven" className="member-mytick">
                    재고 관리
                  </Link>
                </td>
                <td>
                  <Link to="/admin/AdminInven2" className="admin-btn2">
                    상품 등록
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
          <hr className="member-box1-bottom" />
          <br /><br />
          <span className="member-box1-logout">로그아웃</span>
        </div>
      </div>

      <div className="member-right">
        <div className="member-Member-box2">
          {members.length === 0 && <p>회원 정보가 없습니다.</p>}

          {members
			.filter(member => member.memberRole !== "ADMIN") // ADMIN 제외
			.map((member, index) => (
			
            <Link
              key={member.member_id || index} //  key 반드시 필요
              to={`/admin/AdminMember1/${member.memberId}`}
              className={index === 0 ? "admin-Member-conBox" : "admin-Member-conBoxnoe"}
            >
              <img
                src={profileImages[index % profileImages.length]}
                alt="멤버_상세"
                className="admin-Member-memImg"
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
          ))}

          <div className="admin-member-plus">
            <strong> + </strong> <span> 회원 목록 더 보기 </span>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
}
