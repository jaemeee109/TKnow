// src/admin/AdminMember1.jsx
import React, { useEffect, useState } from "react";
import "../css/admin.css";
import "../css/style.css";
import { useParams, Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Pro from "../images/propile.png";
import Heart from "../images/heart.png";
import api from "../api";

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
			fetch(`${BASE_URL}/members/${memberId}`, {
				headers: { Authorization: `Bearer ${token}` },
			}).then(res => res.ok ? res.json() : null),

			// 주문 내역 (티켓)
			fetch(`${BASE_URL}/orders/member/${memberId}?page=1&size=100`, {
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

	const formattedDate = member?.createdAt ? member.createdAt.slice(0, 3).join(". ") : "정보 없음";

	return (
		<div className="member-Member-page">
			<AdminSidebar />{/* ← 공통 사이드바 호출 */}
			<div className="member-right">
				<div className="member-myTk-box2">
					<div className="mytick-main-box">
						<div className="admin-member-memBox">
							<div className="admin-member-memList">
								<img
									src={resolveImageUrl(member?.profileImageUrl)}
									alt="회원_프로필"
									className="member-tkRead-consImg"
									onError={(e) => {
										e.target.onerror = null;
										e.target.src = Pro; // 상세 화면에서도 기본 이미지로
									}}
								/>
							</div>
						</div>

						{/* 여기부터 className 변경 */}
						<div className="member-tkRead-dayBox admin-member-info-dayBox">
							<div className="member-tkRead-my admin-member-info-my">
								<table>
									<tbody>
										<tr><th>이름</th><td>{member?.memberName || "정보 없음"}</td></tr>
										<tr><th>아이디</th><td>{member?.memberId || "정보 없음"}</td></tr>
										<tr><th>이메일</th><td>{member?.memberEmail || "정보 없음"}</td></tr>
										<tr><th>연락처</th><td>{member?.memberPhone || "정보 없음"}</td></tr>
										<tr><th>가입일</th><td>{formattedDate}</td></tr>
										{/** 여기에 멤버권한을 지정할수있는 옵션 칸 생성 */}
									</tbody>
								</table>
							</div>
						</div>
					</div>


					<br />

					<div className="admin-member-memBox3">
						<table className="admin-member-text1">
							<tbody>
								<tr><th>2025 투모로우바이투게더 단독 콘서트〈# :  유화〉</th><td className="admin-con-btn1">배송 중</td></tr>
								<tr><th>2025 엔시티위시 단독 콘서트〈WISH’s〉</th><td className="admin-con-btn1">배송중</td></tr>
								<tr><th>2025 아일릿 팬미팅〈글릿즈럽〉</th><td className="admin-con-btn">배송 완료</td></tr>
								<tr><th>2025 백현 단독 콘서트〈럽백 is 백현〉</th><td className="admin-con-btn">배송 완료</td></tr>
								<tr><th>2025 알파드라이브 첫 팬미팅</th><td className="admin-con-btn">배송 완료</td></tr>
							</tbody>
						</table><br />
						<div className="member-ticket-plus">
							<strong> + </strong> <span> 티켓 목록 더 보기 </span>
						</div>
					</div>


				

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
				
				</div>
			</div>
		</div>
	);
}
