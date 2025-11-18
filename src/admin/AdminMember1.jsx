import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../css/style.css";
import Nmx7 from "../images/nmx7.png";
import Heart from "../images/heart.png";

// 티켓 상태 버튼 색상
const ticketStatusClass = status => status === "배송 중" ? "admin-con-btn" : "admin-con-btn1";
const refundStatusClass = status => status === "미환불" ? "admin-member-refund" : "admin-member-refund-complete";

export default function MemberDetail() {
  const { memberId } = useParams();
  const token = localStorage.getItem("accessToken");
  const [member, setMember] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState([
    { id: 1, name: "2025 알디원 첫 콘서트", status: "미환불" },
    { id: 2, name: "2025 알디원 첫 콘서트", status: "미환불" },
    { id: 3, name: "2025 알디원 첫 콘서트", status: "미환불" },
  ]);

  // 회원 정보, 티켓 정보 가져오기
  useEffect(() => {
    if (!token) return;
    setLoading(true);

    // 회원 기본 정보와 주문 내역 동시에 가져오기
    Promise.all([
      // 회원 기본 정보
      fetch(`http://localhost:9090/ticketnow/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.ok ? res.json() : null),
      
      // 주문 내역 (티켓)
      fetch(`http://localhost:9090/ticketnow/orders/member/${memberId}?page=1&size=100`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.ok ? res.json() : null)
    ])
      .then(([memberData, ordersData]) => {
        console.log("회원 데이터:", memberData);
        console.log("주문 데이터:", ordersData);
        
        if (memberData) setMember(memberData);
        if (ordersData?.list) setTickets(ordersData.list);
      })
      .catch(err => {
        console.error("데이터 fetch 오류:", err);
      })
      .finally(() => setLoading(false));
  }, [memberId, token]);

  // 환불 상태 토글
  const toggleRefundStatus = (index) => {
    setRefunds(prev => {
      const newRefunds = [...prev];
      newRefunds[index].status = newRefunds[index].status === "미환불" ? "환불 완료" : "미환불";
      return newRefunds;
    });
  };

  // 티켓 배송 상태 토글
  const toggleTicketStatus = (index) => {
    setTickets(prev => {
      const newTickets = [...prev];
      newTickets[index].status = newTickets[index].status === "배송 중" ? "배송 완료" : "배송 중";
      return newTickets;
    });
  };

  // 쿠폰 전송
  const sendCoupon = () => {
    alert(`🎉 ${member?.memberName || "회원"}님에게 쿠폰을 전송했습니다!`);
  };

  if (loading) return <p>회원 정보를 불러오는 중...</p>;
  if (!member && tickets.length === 0) return <p>회원 정보를 찾을 수 없습니다.</p>;

  const formattedDate = member?.createdAt ? member.createdAt.slice(0,3).join(". ") : "정보 없음";

  return (
    <div className="member-Member-page">
      <div className="member-left">
        <div className="admin-Member-box1">
          <strong>관리자</strong><span> 님 반갑습니다!</span><br /><br />
          <table>
            <tbody>
              <tr><td><Link to="/admin/AdminMember" className="member-Member-click">회원 관리</Link></td></tr>
              <tr><td>보안 관리</td></tr>
              <tr><td>공지사항 관리</td><td className="admin-btn">공지 등록</td></tr>
              <tr><td><Link to="/admin/AdminContact" className="member-mytick">1:1 문의사항 관리</Link></td></tr>
              <tr><td><Link to="/admin/AdminInven" className="member-mytick">재고 관리</Link></td>
              <td><Link to="/admin/AdminInven2" className="admin-btn2">상품 등록</Link></td></tr>
            </tbody>
          </table>
          <hr className="member-box1-bottom" />
          <br /><br />
          <span className="member-box1-logout">로그아웃</span>
        </div>
      </div>

      <div className="member-right">
        <div className="member-myTk-box2">
          <div className="mytick-main-box">
            <br /><br />
            <div className="admin-member-memBox">
              <div className="admin-member-memList">
                <br /><br />
                <img src={Nmx7} alt="콘서트_썸네일" className="member-tkRead-consImg" />
                <span>{member?.memberName || "회원"}</span>
              </div>

              <div className="member-tkRead-dayBox">
                <div className="member-tkRead-my">
                  <table>
                    <tbody>
                      <tr><th>아이디</th><td>{member?.memberId || "정보 없음"}</td></tr>
                      <tr><th>이메일</th><td>{member?.memberEmail || "정보 없음"}</td></tr>
                      <tr><th>이름</th><td>{member?.memberName || "정보 없음"}</td></tr>
                      <tr><th>휴대 전화 번호</th><td>{member?.memberPhone || "정보 없음"}</td></tr>
                      <tr><th>가입일</th><td>{formattedDate}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <br />

            <div className="admin-member-memBox3">
              <h3>회원 티켓 목록</h3>
              <table className="admin-member-text1">
                <tbody>
                  {tickets.map((ticket, index) => (
                    <tr key={ticket.id || index}>
                      <th>{ticket.name || "티켓 정보 없음"}</th>
                      <td>
                        <button
                          className={ticketStatusClass(ticket.status)}
                          onClick={() => toggleTicketStatus(index)}
                        >
                          {ticket.status || "상태 없음"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr><td colSpan="2">티켓 내역이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <br />

            <div className="admin-member-memBox4">
              <div className="admin-member-top">
                <img src={Heart} alt="등급_사진" className="admin-Member-heartImg" />

                <div className="admin-levelBox1-text">
                  <span>{member?.memberName || "회원"}</span><span>&nbsp;님의 등급은</span>
                  <strong>Silver</strong><span>&nbsp;입니다</span>

                  <table>
                    <tbody>
                      <tr><th>주문 건</th><td>｜</td><td>100 건</td>
                        <th>주문 금액</th><td>｜</td><td>425,414,441 원</td></tr>
                    </tbody>
                  </table>

                  <div style={{ marginTop: "20px" }}>
                    <button onClick={sendCoupon} className="admin-Member-purPer">쿠폰 전송</button>
                  </div>
                </div>
              </div>

              <table className="admin-cons-list">
                <tbody>
                  <tr><th colSpan="9">2025 알디원 첫 콘서트 〈알디원플래닛〉</th> <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                    <th className="admin-member-refund">미환불</th></tr>
                  
                    <tr>
                    <td>2025. 10. 15 결제 완료</td><td>｜</td>
                    <td>230,000 원</td><td>｜</td>
                    <td>신용카드</td><td>｜</td>
                    <td>2025. 10. 20 환불</td><td>｜</td>
                    <td>단순변심</td>
                  </tr>
                </tbody>
              </table>

              <table className="admin-cons-list">
                <tbody>
                  <tr><th colSpan="9">2025 알디원 첫 콘서트 〈알디원플래닛〉</th> <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                    <th className="admin-member-refund">미환불</th></tr>
                  <tr>
                    <td>2025. 10. 15 결제 완료</td><td>｜</td>
                    <td>230,000 원</td><td>｜</td>
                    <td>신용카드</td><td>｜</td>
                    <td>2025. 10. 20 환불</td><td>｜</td>
                    <td>단순변심</td>
                  </tr>
                </tbody>
              </table>

              <table className="admin-cons-list">
                <tbody>
                  <tr><th colSpan="9">2025 알디원 첫 콘서트 〈알디원플래닛〉</th> <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                    <th className="admin-member-refund">미환불</th></tr>
                  <tr>
                    <td>2025. 10. 15 결제 완료</td><td>｜</td>
                    <td>230,000 원</td><td>｜</td>
                    <td>신용카드</td><td>｜</td>
                    <td>2025. 10. 20 환불</td><td>｜</td>
                    <td>단순변심</td>
                  </tr>
                </tbody>
              </table>
              <br/>
              <div className="member-ticket-plus">
                <strong> + </strong> <span> 환불 목록 더 보기 </span>
              </div>
            </div>
            <br/>
            
            <div className="admin-Member-pointBox">
              <span>보유 포인트</span>&nbsp;&nbsp;<strong className="member-poins-live">100,392,102 P</strong><br />
              <span>소멸 예정 포인트 (30 일 이내)</span>&nbsp;&nbsp;<strong>12</strong><strong>P</strong><br />
              <span>포인트 프로모션 등록&nbsp;&nbsp;&nbsp;&gt;</span>
            </div>
            <br />
            
            <Link to="/admin/AdminContact/" className="admin-member-memBox4">
              <table className="admin-member-text1">
                <tbody>
                  <tr><th>[티켓] 티켓을 언제쯤 주나요 ㅡ ㅡ 기다리기 힘드네요 </th><td className="admin-con-btn1">미답변</td></tr>
                  <tr><th>[회원] 회원 탈퇴는 어떻게 하죠</th><td className="admin-con-btn1">미답변</td></tr>
                  <tr><th>[회원] 회원가입을 하려고 하는데 연동 가능한가요?</th><td className="admin-con-btn1">미답변</td></tr>
                  <tr><th>[티켓] 티켓 배송으로 받고 싶어요 ㅜㅜ</th><td className="admin-con-btn">답변 완료</td></tr>
                  <tr><th>[티켓] 위시 콘서트 현장 수령으로 바꾸고 싶어여</th><td className="admin-con-btn">답변 완료</td></tr>
                </tbody>
              </table>
              <br /><br />
              <div className="member-ticket-plus">
                <strong> + </strong> <span> 회원 문의 목록 더 보기 </span>
              </div>
            </Link>
            <br />

            <div className="admin-member-memBox5">
              <table className="admin-member-text1">
                <tbody>
                  <tr><th>[위시] 진심 이 콘서트 안 간다? 후회할 것 같습니다 제</th><td className="admin-con-btn1">미답변</td></tr>
                  <tr><th>[라이즈] 제 인생은 이 콘 보기 전과 후로 나뉨 ㅜㅜ</th><td className="admin-con-btn1">미답변</td></tr>
                  <tr><th>[아일릿] 아일릿 나의 사랑 나의 여신 나의 사랑</th><td className="admin-con-btn1">미답변</td></tr>
                  <tr><th>[투어스] 42 멤버십 결제했어요 저는 오늘부터 사이입니다</th><td className="admin-con-btn">답변 완료</td></tr>
                  <tr><th>[기타] 왜 알디원 잘생긴 거 말 안 했음? 인생 손해 봤다</th><td className="admin-con-btn">답변 완료</td></tr>
                </tbody>
              </table>
              <br /><br />
              <div className="member-ticket-plus">
                <strong> + </strong> <span> 리뷰 목록 더 보기 </span>
              </div>
            </div>

            <br />
          </div>
        </div>
      </div>
    </div>
  );
}