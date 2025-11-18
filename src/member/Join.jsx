import React, { useState } from "react";
import "../css/style.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Join() {
	// 스키마에서 데이터 불러오기 (디비랑 이름 매칭 맞아야 함)
	const [memberName, setMemberName] = useState("");
	const [memberId, setMemberId] = useState("");
	const [memberPw, setMemberPw] = useState("");
	const [memberPwCk, setMemberPwCk] = useState("");
	const [memberPhone1, setMemberPhone1] = useState("");
	const [memberPhone2, setMemberPhone2] = useState("");
	const [memberPhone3, setMemberPhone3] = useState("");
	const [memberEmail1, setMemberEmail1] = useState("");
	const [memberEmail2, setMemberEmail2] = useState("");
	const [memberAddress1, setMemberAddress1] = useState("");
	const [memberSex, setMemberSex] = useState("");

	const navigate = useNavigate();

	const memberPhone = `${memberPhone1}-${memberPhone2}-${memberPhone3}`;
	const memberEmail = `${memberEmail1}@${memberEmail2}`;

	// 회원가입 처리
	const handleJoin = async () => {
		// 유효성 검사
		if (!memberName || !memberId || !memberPw) {
			alert("이름, 아이디, 비밀번호를 모두 입력하세요.");
			return;
		}

		if (memberPwCk !== memberPw) {
			alert("비밀번호가 일치하지 않습니다.");
			return;
		}

		// 요청 바디 구성 (백엔드 DTO 맞춤)
		const requestBody = {
			   memberId,
			   memberPw, // 백엔드에서 {noop} 처리 또는 평문 저장
			   memberName,
			   memberPhone,
			   memberEmail,
			   memberAddress1,
			   memberZip: "00000",
			   memberBirth: null,
			   memberGrade: "GENERAL",
			   memberSex,
			   memberRole: "USER"
		};

		try {
			// 회원가입 API 호출
			const response = await axios.post("/members", requestBody, {
				headers: {
					"X-Request-Id": `JOIN-${Date.now()}` // 추적용 ID
				}
			});

			console.log("회원가입 성공:", response.data);
			alert("회원가입이 완료되었습니다!");
			navigate("/member/Login"); // 로그인 페이지로 이동

		} catch (error) {
			console.error("회원가입 실패:", error);

			if (error.response) {
				// 백엔드 에러 응답
				const errorData = error.response.data;
				alert(`회원가입 실패: ${errorData.message || "서버 오류"}`);

				// 유효성 검사 에러 상세 출력 (있으면)
				if (errorData.detail) {
					console.error("검증 실패:", errorData.detail);
				}
			} else {
				alert("서버 연결 실패. 네트워크를 확인하세요.");
			}
		}
	};
	
	// 성별 선택 이벤트
	const handleSexClick = (sex) => {
	  setMemberSex(sex);
	};

	return (
		<div className="member-join-page">
			<div className="member-join-box">
				<strong className="member-join-text">JOIN</strong><br />

				<div className="member-join-inBox">
					<table>
						<tbody>
							<tr>
								<th>이름</th>
								<td>
									<input
										type="text"
										value={memberName}
										onChange={(e) => setMemberName(e.target.value)}
									/>
								</td>
							</tr>
							<tr>
								<th>아이디</th>
								<td>
									<input
										type="text"
										value={memberId}
										onChange={(e) => setMemberId(e.target.value)}
									/>
								</td>
							</tr>
							<tr>
								<th>패스워드</th>
								<td>
									<input
										type="password"
										value={memberPw}
										onChange={(e) => setMemberPw(e.target.value)}
									/>
								</td>
							</tr>
							<tr>
								<th>패스워드 체크</th>
								<td>
									<input
										type="password"
										value={memberPwCk}
										onChange={(e) => setMemberPwCk(e.target.value)}
									/>
								</td>
							</tr>
							<tr>
								<th>이메일</th>
								<td>
									<input
										className="join-email"
										type="text"
										value={memberEmail1}
										onChange={(e) => setMemberEmail1(e.target.value)}
									/>
									&nbsp;&nbsp;@&nbsp;&nbsp;
									<input
										type="text"
										className="join-email"
										value={memberEmail2}
										onChange={(e) => setMemberEmail2(e.target.value)}
									/>
								</td>
							</tr>
							<tr>
								<th>휴대 전화 번호</th>
								<td>
									<input
										type="text"
										className="join-phone"
										value={memberPhone1}
										onChange={(e) => setMemberPhone1(e.target.value)}
										placeholder="010"
									/>
									&nbsp;&nbsp;-&nbsp;&nbsp;
									<input
										type="text"
										className="join-phone"
										value={memberPhone2}
										onChange={(e) => setMemberPhone2(e.target.value)}
										placeholder="1234"
									/>
									&nbsp;&nbsp;-&nbsp;&nbsp;
									<input
										type="text"
										className="join-phone"
										value={memberPhone3}
										onChange={(e) => setMemberPhone3(e.target.value)}
										placeholder="5678"
									/>
								</td>
							</tr>
							<tr>
								<th>인증 번호</th>
								<td>
									<input
										type="text" maxLength="4"
									/>
								</td>
							</tr>
							<tr>
								<th>성별</th>
								<td>
								  <button
								    className={`join-sexBtn1 ${memberSex === "female" ? "active" : ""}`}
								    onClick={() => handleSexClick("female")}
								  >
								    여성
								  </button>
								  <button
								    className={`join-sexBtn2 ${memberSex === "male" ? "active" : ""}`}
								    onClick={() => handleSexClick("male")}
								  >
								    남성
								  </button>
								  <button
								    className={`join-sexBtn3 ${memberSex === "none" ? "active" : ""}`}
								    onClick={() => handleSexClick("none")}
								  >
								    선택 안 함
								  </button>
								</td>
							</tr>
							<tr>
								<th>주소</th>
								<td>
									<input
										type="text"
										value={memberAddress1}
										onChange={(e) => setMemberAddress1(e.target.value)}
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</div><br />

				<div className="member-btn">
					<button
						className="member-join-comBtn"
						type="button"
						onClick={handleJoin}
					>
						회원가입
					</button>
				</div>
			</div>
		</div>
	);
}