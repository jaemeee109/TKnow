import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/style.css";
import { Link } from "react-router-dom";



export default function Contact() {

	const [memberEmail, setMemberEmail] = useState("");
	const [memberPhone, setMemberPhone] = useState("");
	const [title, setTitle] = useState("");
	const [categoryType, setCategoryType] = useState("");
	const [orderTicketId, setOrderTicketId] = useState("");
	const [content, setContent] = useState("");
	const [attachments, setAttachments] = useState(null);


	useEffect(() => {
		const token = localStorage.getItem("accessToken");  // 로그인 토큰
		const storedMemberId = localStorage.getItem("memberId");  // 로그인한 회원 ID

		if (!token || !storedMemberId) {
			console.error("로그인 정보가 없습니다.");
			return;
		}

		axios.get(`http://localhost:9090/ticketnow/members/${storedMemberId}`, {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then(res => {
				setMemberEmail(res.data.memberEmail);
				setMemberPhone(res.data.memberPhone);
			})
			.catch(err => {
				console.error("회원 정보 가져오기 실패:", err.response?.data || err);
			});
	}, []);





	const handleSubmit = async () => {

		const token = localStorage.getItem("accessToken");
		const memberId = localStorage.getItem("memberId");

		const formData = new FormData();

		formData.append("memberEmail", memberEmail);
		formData.append("memberPhone", memberPhone);
		formData.append("title", title);
		formData.append("categoryType", categoryType);
		formData.append("orderTicketId", orderTicketId);
		formData.append("content", content);

		// 첨부파일 처리 (배열일 경우 반복 추가)
		if (attachments && attachments.length > 0) {
		  attachments.forEach(file => {
		    formData.append("attachments", file);
		  });
		}

		if (attachments) {
			formData.append("attachments", attachments); // 백엔드 DTO 필드명 맞춰야 함
		}

		try {
			const res = await axios.post("http://localhost:9090/ticketnow/boards/inquiry", formData, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
					"Content-Type": "multipart/form-data",
					"X-Request-Id": crypto.randomUUID() // 선택
				}
			});

			alert("문의 등록을 완료했습니다");
			console.log("boardId:", res.data);

		} catch (err) {
			console.error(err);
			alert("문의 등록을 실패했습니다");
		}
	};




	const [reservations, setReservations] = useState([]);

	useEffect(() => {
		const fetchReservations = async () => {
			try {
				const res = await axios.get("/orders/my", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("access")}`
					}
				});
				setReservations(res.data); // res.data: [{id:1, name:"콘서트A"}, ...]
			} catch (err) {
				console.error(err);
			}
		};
		fetchReservations();
	}, []);

	return (
		<div className="member-Member-page">


			<div className="member-left">
				<div className="member-Member-box1">
					<strong>힙합개냥이</strong><span>님 반갑습니다!</span><br /><br />
					<table>
						<tbody>
							<tr><td><Link to="/member/Member" className="member-Member">회원정보</Link></td></tr>
							<tr><td>보안설정</td></tr>
							<tr><td>회원등급</td></tr>
							<tr><td><Link to="/member/MyTick" className="member-Member">나의 티켓</Link></td></tr>
							<tr><td>나의 일정</td></tr>
							<tr><td><Link to="/member/MyContact" className="member-Member-click">1:1 문의 내역</Link></td></tr>
							<tr><td>고객센터</td></tr>
							<tr><td>공지사항</td></tr>
						</tbody>
					</table>
					<hr className="member-box1-bottom" />

					<table>
						<tbody className="member-box1-bottom1">
							<tr><td>내 아이돌 콘서트 앞 숙소 예약까지</td></tr>
							<tr><th>콘서트 준비는 티켓나우와 함께!</th></tr>
						</tbody>
					</table>
					<br /><br />

					<span className="member-box1-logout">로그아웃</span>
				</div>
			</div>


			<div className="member-right">
				<div className="member-myTk-box2">
					<div className="costs-main-box">
						<strong>1:1 문의하기</strong>
						<br /><br />
						<div className="member-conts-conBox">
							<div className="cont-conts-list">
								<table>
									<tbody>
										<tr><th>이메일 주소</th></tr>
										<tr><td><input type="text" value={memberEmail} readOnly /></td></tr>
										<tr><th>휴대 전화 번호</th></tr>
										<tr><td><input type="text" value={memberPhone} readOnly /></td></tr>
										<tr><th>문의 유형</th></tr>
										<tr><td>
											<select onChange={(e) => setCategoryType(e.target.value)} className="Ad-conts-resNum">
											<option value="RESERVATION">예약</option>
											  <option value="CANCEL">취소</option>
											  <option value="REFUND">환불</option>
											  <option value="ETC">기타</option>
											</select>
										</td></tr>

										<tr><th>예약번호</th></tr>
										<tr><td><input type="text" alt="예약번호" className="conts-resNum" onChange={(e) => setOrderTicketId(e.target.value)}>
										</input>&nbsp;&nbsp;&nbsp;
											<button type="text" className="conts-resNumBtn">예약번호 조회</button></td></tr>
										<tr><th>문의 제목</th></tr>
										<tr><td><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></td></tr>
										<tr><th>문의내용</th></tr>
										<tr><td><textarea type="text" rows="6" className="conts-area" onChange={(e) => setContent(e.target.value)}>
										</textarea></td></tr>
										<tr>
											<th>첨부파일</th>
										</tr>
										<tr>
											<td>

												<input
													type="text"
													alt="첨부파일"
													className="conts-resNum"
													value={attachments ? (Array.isArray(attachments) ? attachments.map(f => f.name).join(', ') : attachments.name) : ''}
													readOnly
												/>

												&nbsp;&nbsp;&nbsp;


												<label className="conts-resNumBtn">
													첨부파일
													<input
														type="file"
														style={{ display: "none" }}
														onChange={(e) => {
															if (e.target.files) setAttachments(Array.from(e.target.files))
														}}
													/>
												</label>
											</td>
										</tr>
										<br />



										<button type="text" className="conts-conts-btn" onClick={handleSubmit}>문의하기</button>
									</tbody>
								</table>
					

							</div>

							<div className="member-tkRead-dayBox">
								<div className="member-tkRead-my">



								</div>
							</div>
						</div>










					</div>
				</div>
			</div>
		</div>



	);
}