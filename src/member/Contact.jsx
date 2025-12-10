// src/member/contact.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/member.css";
import "../css/style.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import MemberSidebar from "./MemberSidebar";
export default function Contact() {
	const navigate = useNavigate();
	const { boardId } = useParams();

	const [memberEmail, setMemberEmail] = useState("");
	const [memberPhone, setMemberPhone] = useState("");
	const [title, setTitle] = useState("");
	const [categoryType, setCategoryType] = useState("SHOW_INFO");
	const [orderTicketId, setOrderTicketId] = useState("");
	const [content, setContent] = useState("");
	const [attachments, setAttachments] = useState([]);
	const [boardList, setBoardList] = useState([]); // 문의 목록
	const [board, setBoard] = useState(null);
	const [previewImages, setPreviewImages] = useState([]);

	const token = localStorage.getItem("accessToken");
	const memberId = localStorage.getItem("memberId");

	// 회원 정보 불러오기
	useEffect(() => {
		if (!token || !memberId) return;
		api
			.get(`/members/${memberId}`, { headers: { Authorization: `Bearer ${token}` } })
			.then((res) => {
				setMemberEmail(res.data.memberEmail || "");
				setMemberPhone(res.data.memberPhone || "");
			})
			.catch((err) => console.error("회원 정보 가져오기 실패:", err.response?.data || err));
	}, [token, memberId]);

	// 내 문의 목록 불러오기
	useEffect(() => {
		if (!token || !memberId) return;

		api
			.get(`/boards/my`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {			const list = Array.isArray(res.data) ? res.data : res.data.items || [];
			     setBoardList(list);
			   })
			.catch((err) =>
				console.error("내 문의 목록 불러오기 실패:", err.response?.data || err)
			);
	}, [token, memberId]);

	// 문의 등록
	const handleSubmit = async () => {
		if (!token || !memberId) return;

		const formData = new FormData();
		formData.append("memberEmail", memberEmail);
		formData.append("memberPhone", memberPhone);
		formData.append("title", title);
		formData.append("categoryType", categoryType);
		formData.append("orderTicketId", orderTicketId);
		formData.append("content", content);

		attachments.forEach((file) => formData.append("attachments", file));

		try {
			const res = await api.post("/boards/inquiry", formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
					"X-Request-Id": crypto.randomUUID(),
				},
			});
			alert("문의 등록을 완료했습니다");
			console.log("boardId:", res.data);

			// 등록 완료 후 MyContact 페이지로 이동
			navigate("/member/MyContact");
		} catch (err) {
			console.error(err);
			alert("문의 등록을 실패했습니다");
		}
	};

	const handleFileChange = async (e) => {
		const files = Array.from(e.target.files);

		setAttachments(files);

		const readFiles = files.map((file) => {
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result);
				reader.readAsDataURL(file);
			});
		});

		const previews = await Promise.all(readFiles);
		setPreviewImages(previews);
	};

	return (
		<div className="member-Member-page">
			<MemberSidebar active="myContact" />
			<div className="member-right">
				<div className="member-myTk-box2">
					<div className="costs-main-box">
						<strong>1:1 문의하기</strong>
						<br />
						<br />
						<div className="member-conts-conBox">
							<div className="cont-conts-list">
								<table>
									<tbody>
										<tr>
											<th>이메일 주소</th>
										</tr>
										<tr>
											<td>
												<input type="text" value={memberEmail} readOnly />
											</td>
										</tr>

										<tr>
											<th>휴대 전화 번호</th>
										</tr>
										<tr>
											<td>
												<input type="text" value={memberPhone} readOnly />
											</td>
										</tr>

										<tr>
											<th>문의 유형</th>
										</tr>
										<tr>
											<td>
												<select
													value={categoryType}
													onChange={(e) => setCategoryType(e.target.value)}
													className="Ad-conts-resNum"
												>
													<option value="SHOW_INFO">공연 정보</option>
													<option value="TICKET_BOOKING">예메</option>
													<option value="REFUND">환불</option>
													<option value="FREE">계정</option>
													<option value="ACCOUNT">시스템</option>
													<option value="TECHNICAL">기타</option>
												</select>
											</td>
										</tr>

								

										<tr>
											<th>문의 제목</th>
										</tr>
										<tr>
											<td>
												<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
											</td>
										</tr>

										<tr>
											<th>문의내용</th>
										</tr>
										<tr>
											<td>
												<textarea
													rows="6"
													className="conts-area"
													value={content}
													onChange={(e) => setContent(e.target.value)}
												/>
											</td>
										</tr>

										<tr>
											<th>첨부파일</th>
										</tr>
										<tr>
											<td>
												<input
													type="text"
													className="conts-resNum"
													value={attachments.map(f => f.name || f.origin_name).join(", ")} readOnly />

												&nbsp;&nbsp;&nbsp;
												<label>
													첨부파일
													<input type="file" style={{ display: "none" }} multiple onChange={handleFileChange} />
												</label>
												<div className="preview-container" style={{ marginTop: "10px" }}>
													{previewImages.map((src, idx) => (
														<img key={idx} src={src} alt="preview" style={{ width: "120px", marginRight: "10px", borderRadius: "6px" }} />
													))}
												</div>
											</td>
										</tr><br />
										<tr>
											<td>
												<button className="conts-conts-btn" onClick={handleSubmit}>
													문의하기
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							{/* 내 문의 목록 */}
							<div className="member-tkRead-dayBox">
								{boardList.map(board => (
									<div key={board.boardId} style={{ marginTop: "15px", borderTop: "1px solid #ddd", paddingTop: "10px" }}>
										<strong>{board.title}</strong>
										<p>{board.content}</p>
										{(board.images || []).map((img, idx) => (
											<img key={idx} src={img.img_url} alt={img.origin_name} style={{ width: "120px", marginRight: "10px", borderRadius: "6px" }} />
										))}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
