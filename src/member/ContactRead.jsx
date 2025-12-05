// src/member/ContactRead.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/member.css";
import "../css/style.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import MemberSidebar from "./MemberSidebar";
export default function Contact() {

	//  api의 baseURL을 이용해서 이미지 URL 만드는 공통 함수
	const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

	const resolveImageUrl = (path) => {
		if (!path) return "";
		if (path.startsWith("http://") || path.startsWith("https://")) {
			return path;
		}

		return `${BASE_URL}${path}`;
	};

	const navigate = useNavigate();
	const { boardId } = useParams();

	const [memberEmail, setMemberEmail] = useState("");
	const [memberPhone, setMemberPhone] = useState("");
	const [title, setTitle] = useState("");
	const [categoryType, setCategoryType] = useState("SHOW_INFO");
	const [orderTicketId, setOrderTicketId] = useState("");
	const [content, setContent] = useState("");
	const [attachments, setAttachments] = useState([]);
	const [previewImages, setPreviewImages] = useState([]);
	const [replies, setReplies] = useState([]);
	const [boardList, setBoardList] = useState([]);

	const token = localStorage.getItem("accessToken");
	const memberId = localStorage.getItem("memberId");



	// 회원 정보 가져오기
	useEffect(() => {
		if (!token || !memberId) return;
		api.get(`/members/${memberId}`, { headers: { Authorization: `Bearer ${token}` } })
			.then(res => {
				setMemberEmail(res.data.memberEmail || "");
				setMemberPhone(res.data.memberPhone || "");
			})
			.catch(err => console.error(err));
	}, [token, memberId]);

	// 내 문의 목록 불러오기
	useEffect(() => {
		if (!token) return;
		api.get("/boards/my", { headers: { Authorization: `Bearer ${token}` } })
			.then(res => {
				// 서버가 객체를 내려도 배열로 변환
				const list = Array.isArray(res.data) ? res.data : res.data.items || [];
				setBoardList(list);
			})
			.catch(err => console.error(err));
	}, [token]);

	// ====== 내 문의 상세 조회 ======
	useEffect(() => {
		const token = localStorage.getItem("accessToken");
		const localMemberId = localStorage.getItem("memberId");

		if (!token || !localMemberId) {
			alert("로그인이 필요합니다.");
			navigate("/member/Login");
			return;
		}

		api
			.get(`/boards/my/${boardId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				const data = res.data || {};

				// 제목 / 내용
				setTitle(data.title || "");
				setContent(data.content || "");

				// 문의 본문 첨부 이미지: attachments(List<ImageDTO>) 사용
				const serverAttachments = Array.isArray(data.attachments)
					? data.attachments
					: [];

				setAttachments(serverAttachments);

				// 화면용 미리보기 URL 배열 (imageUrl 필드 사용)
				setPreviewImages(
					serverAttachments
						.map((img) => img.imageUrl)
						.filter((url) => typeof url === "string" && url.length > 0)
				);

				// 관리자 답변 목록: replies(List<ReplyItemDTO>)
				setReplies(Array.isArray(data.replies) ? data.replies : []);
			})
			.catch((err) => {
				console.error("문의 상세 조회 실패:", err);
				alert("문의 상세 조회에 실패했습니다.");
			});
	}, [boardId, navigate]);

	// 파일 선택 시 미리보기
	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		setAttachments(files);

		const previews = files.map(file => URL.createObjectURL(file));
		setPreviewImages(previews);
	};

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
		attachments.forEach(file => formData.append("attachments", file));

		try {
			await api.post("/boards/inquiry", formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
					"X-Request-Id": crypto.randomUUID(),
				},
			});
			alert("문의 등록 완료!");
			navigate("/member/MyContact");
		} catch (err) {
			console.error(err);
			alert("문의 등록 실패!");
		}
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
											<td>
												<input type="text" value={memberEmail} readOnly />
											</td>
										</tr>

										<tr>
											<th>휴대 전화 번호</th>
											<td>
												<input type="text" value={memberPhone} readOnly />
											</td>
										</tr>

										<tr>
											<th>문의 유형</th>
											<td>
												<select
													value={categoryType}
													onChange={(e) => setCategoryType(e.target.value)}
													className="Ad-conts-resNum"
												>
													<option value="SHOW_INFO">공연 정보</option>
													<option value="TICKET_BOOKING">예매</option>
													<option value="REFUND">환불</option>
													<option value="FREE">계정</option>
													<option value="ACCOUNT">시스템</option>
													<option value="TECHNICAL">기타</option>
												</select>
											</td>
										</tr>

										<tr>
											<th>예약번호</th>
											<td>
												<input
													type="number"
													className="conts-resNum"
													value={orderTicketId}
													onChange={(e) => setOrderTicketId(e.target.value)}
												/>
												&nbsp;&nbsp;&nbsp;
												<button type="button" className="conts-resNumBtn">
													예약번호 조회
												</button>
											</td>
										</tr>

										<tr>
											<th>문의 제목</th>
											<td>
												<input value={title} onChange={(e) => setTitle(e.target.value)} />
											</td>
										</tr>

										<tr>
											<th>문의내용</th>
											<td>
												<textarea
													rows="6"
													className="conts-area"
													value={content}
													readOnly
												/>
											</td>
										</tr>

										{/* 첨부 이미지 정보 */}
										<tr>
											<th>첨부파일</th>
											<td>
												<input
													type="text"
													className="member-myCont-tt4"
													value={
														previewImages && previewImages.length > 0
															? `${previewImages.length}개 첨부됨`
															: "첨부된 파일이 없습니다."
													}
													readOnly
												/>
											</td>
										</tr>

										{/* 첨부 이미지 미리보기 */}
										<tr>
											<td colSpan="2">
												<div className="preview-container">
													{previewImages && previewImages.length > 0 ? (
														previewImages.map((src, idx) => (
															<img
																key={idx}
																src={resolveImageUrl(src)}
																alt={`attachment-${idx + 1}`}
																className="preview-image"
															/>
														))
													) : (
														<p>첨부 이미지가 없습니다.</p>
													)}
												</div>
											</td>
										</tr>
										<tr>
											<td colSpan="2">
												<hr className="border-line-tool" />
											</td>
										</tr>

										{/* 관리자 답변 */}
										<tr>
											<th>답변</th>
											<td>
												{replies && replies.length > 0 ? (
  <div className="reply-list">
    {replies.map((reply) => {
      const createdAtText =
        Array.isArray(reply.createdAt) && reply.createdAt.length >= 5
          ? new Date(
              reply.createdAt[0] || 0,
              (reply.createdAt[1] || 1) - 1,
              reply.createdAt[2] || 1,
              reply.createdAt[3] || 0,
              reply.createdAt[4] || 0
            ).toLocaleString()
          : "";

      return (
        <div  className="reply-item">
          <div className="reply-content">{reply.content}</div>

 
          {createdAtText && (
            <div className="reply-date">{createdAtText}</div>
          )}

          {/* 관리자 첨부파일 미리보기 */}
          {reply.attachments && reply.attachments.length > 0 && (
            <div className="reply-images">
              {reply.attachments.map((img, idx) => (
                <img
                  key={idx}
                  src={resolveImageUrl(img.imageUrl)}
                  alt={`reply-img-${idx + 1}`}
                  className="reply-image"
                />
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>
) : (
  <span>등록된 답변이 없습니다.</span>
)}
											</td>
										</tr>

										{/* 목록 버튼 */}
										<tr>
											 <td colSpan="2" style={{ textAlign: "center" }}>
												<button
													type="button"
													className="conts-conts-btn"
													onClick={() => navigate("/member/MyContact")}
												>
													목록으로
												</button>
											</td>
										</tr>
									</tbody>


								</table>
							</div>

							{/* 내 문의 목록 + 이미지 */}
							<div className="member-tkRead-dayBox">
								{boardList.map(board => (
									<div
										key={board.boardId}
										style={{
											marginTop: "15px",
											borderTop: "1px solid #ddd",
											paddingTop: "10px",
										}}
									>
										<strong>{board.title}</strong>
										<p>{board.content}</p>

										{/* 이미지 박스 */}
										<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
											{board.attachments?.length > 0 ? (
												<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
													{board.attachments.map((img, idx) => {
														console.log("이미지 URL:", img.img_url); // 이제 찍힘
														return (
															<div
																key={idx}
																style={{
																	width: "120px",
																	height: "120px",
																	borderRadius: "6px",
																	overflow: "hidden",
																	border: "1px solid #ccc",
																}}
															>
																<img
																	src={img.img_url} // 서버에서 내려주는 URL 그대로
																	alt={img.origin_name || "img"}
																	style={{ width: "100%", height: "100%", objectFit: "cover" }}
																/>
															</div>
														);
													})}
												</div>
											) : (
												<p>등록된 이미지가 없습니다.</p>
											)}
										</div>
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
