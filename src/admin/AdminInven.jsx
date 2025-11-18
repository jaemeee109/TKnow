import React, { useState, useEffect } from "react";
import "../css/style.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";




export default function AdminInven() {

	const [tickets, setTickets] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState({});
	const navigate = useNavigate();


	// 서버에서 티켓 목록 불러오기
	useEffect(() => {
		fetch("http://localhost:9090/ticketnow/admin/tickets", {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((data) => {
				console.log("서버 티켓 목록:", data);
				if (Array.isArray(data)) setTickets(data);
				else if (Array.isArray(data.data)) setTickets(data.data);
				else setTickets([]);
			})
			.catch((err) => console.error("티켓 불러오기 실패:", err));
	}, []);

	// 수정 모드 전환
	const handleEdit = (ticket) => {
		setEditingId(ticket.id);
		setFormData({ ...ticket });
	};

	// 입력 변경 핸들러
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	// 수정 저장
	const handleSave = (id) => {
		fetch(`http://localhost:9090/ticketnow/admin/tickets/${id}`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		})
			.then((res) => {
				if (!res.ok) throw new Error("수정 실패");
				return res.json();
			})
			.then(() => {
				alert("수정 완료!");
				setEditingId(null);
				// 목록 새로고침
				return fetch("http://localhost:9090/ticketnow/admin/tickets", {
					headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
				});
			})
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data)) setTickets(data);
				else if (Array.isArray(data.data)) setTickets(data.data);
			})
			.catch((err) => alert("수정 실패: " + err.message));
	};

	// 삭제
	const handleDelete = (id) => {
		if (!window.confirm("정말 삭제하시겠습니까?")) return;
		fetch(`http://localhost:9090/ticketnow/admin/tickets/${id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		})
			.then((res) => {
				if (!res.ok) throw new Error("삭제 실패");
				alert("삭제 완료!");
				setTickets((prev) => prev.filter((t) => t.id !== id));
			})
			.catch((err) => alert("삭제 실패: " + err.message));
	};

	const handleClick = (id) => {
		navigate(`/admin/AdminInven3/${id}`); // 상세 페이지로 이동
	};

	return (
		<div className="member-Member-page">
			<div className="member-left">
				<div className="admin-Member-box1">
					<strong>관리자</strong><span> 님 반갑습니다!</span><br /><br />
					<table>
						<tbody>
							<tr><td><Link to="/admin/AdminMember" className="member-mytick">회원 관리</Link></td></tr>
							<tr><td>보안 관리</td></tr>
							<tr><td>공지사항 관리</td><td className="admin-btn">공지 등록</td></tr>
							<tr><td><Link to="/admin/AdminContact" className="member-mytick">1:1 문의사항 관리</Link></td></tr>
							<tr><td><Link to="/admin/AdminInven" className="member-Member-click">재고 관리</Link></td>
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
					<div className="inven-main-box">
						<table className="admin-member-text1">
							<thead>
								<tr>
									<th>상품명</th>
									<th>콘서트명</th>
									<th>가격(원)</th>
									<th>잔여석(개)</th>
									<th>상태</th>
								</tr>
							</thead>

							<tbody>
								{tickets.length > 0 ? (
									tickets.map((t) => (
										<tr
											key={t.id}
											onClick={() => handleClick(t.ticketId)}
											style={{ cursor: "pointer" }}
										>
											<td>{t.ticketId}</td>
											<td>{t.title}</td>
											<td>{t.price?.toLocaleString()}</td>
											<td>{t.remainingSeats}</td>
											<td className={t.remainingSeats > 0 ? "admin-con-btn" : "admin-con-btn1"}>
												{t.remainingSeats > 0 ? "판매 중" : "판매 종료"}
											</td>
										</tr>
									))
								) : (
									<tr><td colSpan="5">불러올 티켓이 없습니다</td></tr>
								)}
							</tbody>

						</table><br /><br />
						<div className="member-ticket-plus">
							<strong> + </strong> <span> 티켓 목록 더 보기 </span>
						</div>

					</div>
				</div><br />






				<div className="inven-main-box">
					<table className="admin-member-text1">
						<tbody>
							<tr><th>상품명</th><th>콘서트명</th><th>가격(원)</th><th>잔여석(개)</th></tr>
							<tr><td>TK35539</td><td>2025 AD1 단독 콘서트 〈플래닛으로</td><td>150,000</td><td>150</td>
								<td className="admin-con-btn">정산 대기</td></tr>

							<tr><td>TK35538</td><td>2025 아일릿 단독 콘서트 〈글릿과〉</td><td>150,000</td><td>120</td>
								<td className="admin-con-btn">정산 대기</td></tr>

							<tr><td>TK35537</td><td>2025 보넥도 단독 콘서트 #쁘넥도</td><td>150,000</td><td>130</td>
								<td className="admin-con-btn">정산 중</td></tr>

							<tr><td>TK35536</td><td>2025 라이즈 단독 콘서트 〈랒랒〉</td><td>150,000</td><td>0</td>
								<td className="admin-con-btn1">정산 완료</td></tr>

							<tr><td>TK35535</td><td>2025 ZB1 단독 콘서트 〈제로즈와 함께〉</td><td>150,000</td><td>0</td>
								<td className="admin-con-btn1">정산 완료</td></tr>

							<tr><td>TK35534</td><td>2025 보이즈플래닛 단독 콘서트 〈플래닛으로 1〉</td><td>150,000</td><td>0</td>
								<td className="admin-con-btn1">정산 완료</td></tr>

							<tr><td>TK35533</td><td>2025 키키 단독 콘서트 〈ㅋㅋ〉</td><td>150,000</td><td>0</td>
								<td className="admin-con-btn1">정산 완료</td></tr>
						</tbody>
					</table><br /><br />
				</div><br />


				<div className="inven-main-box2">

					<div className="admin-inven-row">
						<span>판매 티켓 수량</span>
						<span className="admin-inven-3">150,000 장</span>
					</div>
					<div className="admin-inven-row">
						<span>판매액</span>
						<span className="admin-inven-3">413,320,000 원</span>
					</div>
					<div className="admin-inven-row">
						<span>매출 원가</span>
						<span className="admin-inven-3">54,545,000 원</span>
					</div>
					<div className="admin-inven-row">
						<span>매출 이익</span>
						<span className="admin-inven-3">358,775,000 원</span>
					</div>
					<div className="admin-inven-row">
						<span>환불 금액</span>
						<span className="admin-inven-3">455,452 원</span>
					</div>
					<div className="admin-inven-row">
						<span>쿠폰 이용 금액</span>
						<span className="admin-inven-3">415,050 원</span>
					</div>
					<div className="admin-inven-row">
						<span>당기순이익</span>
						<span className="admin-inven-3">328,775,000 원</span>
					</div>

				</div>
				<br />

				<div className="inven-main-box">
					<table className="admin-member-text1">
						<tbody>
							<tr><th>거래처코드</th><th>거래처명</th><th>대표자명</th><th>사업자등록번호</th></tr>
							<tr><td>TG56162</td><td>(주)웨이크원</td><td>강우진</td><td>111-22-33333</td>
								<td className="admin-con-btn">거래 중</td></tr>

							<tr><td>TG561623</td><td>(주)에스엠엔터테인먼트</td><td>변백현</td><td>123-22-3683</td>
								<td className="admin-con-btn">거래 중</td></tr>

							<tr><td>TG56164</td><td>(주)제이와이피</td><td>오해원</td><td>111-00-33728</td>
								<td className="admin-con-btn">거래 중</td></tr>

							<tr><td>TG56165</td><td>(주)하이브엔터테인먼트</td><td>최연준</td><td>115-14-16543</td>
								<td className="admin-con-btn1">거래 중단</td></tr>

							<tr><td>TG56166</td><td>(주)어도어</td><td>강해린</td><td>153-46-32352</td>
								<td className="admin-con-btn1">거래 중단</td></tr>

							<tr><td>TG56167</td><td>(주)플레디스</td><td>신정환</td><td>235-14-16423</td>
								<td className="admin-con-btn1">잠정 중단</td></tr>

							<tr><td>TG56168</td><td>(주)쏘스뮤직</td><td>김채원</td><td>624-25-32524</td>
								<td className="admin-con-btn">거래 중</td></tr>

							<tr><td>TG56169</td><td>(주)빌리프랩</td><td>이원희</td><td>254-63-15466</td>
								<td className="admin-con-btn">거래 중</td></tr>

							<tr><td>TG56170</td><td>(주)위엔터테인먼트</td><td>김요한</td><td>252-62-32421</td>
								<td className="admin-con-btn1">잠정 중단</td></tr>

							<tr><td>TG56171</td><td>(주)스타쉽엔터테인먼트</td><td>장원영</td><td>241-25-63735</td>
								<td className="admin-con-btn">거래 중</td></tr>

							<tr><td>TG56172</td><td>(주)큐브엔터테인먼트</td><td>전소연</td><td>145-63-73633</td>
								<td className="admin-con-btn">거래 중</td></tr>
						</tbody>
					</table><br /><br />
					<div className="member-ticket-plus">
						<strong> + </strong> <span> 회원 티켓 목록 더 보기 </span>
					</div>
				</div>



			</div >





		</div >
	);
}