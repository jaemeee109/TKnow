// src/member/OftenContact.jsx
import React, { useState } from "react";
import "../css/member.css";
import "../css/style.css";
import { Link } from "react-router-dom";
import Seach from "../images/seach.png";
import Cont1 from "../images/cont1.png";
import Cont2 from "../images/cont2.png";
import Cont3 from "../images/cont3.png";
import MemberSidebar from "./MemberSidebar";

export default function OftenContact() {

	return (
		<div className="member-Member-page">
		<MemberSidebar active="myContact" />
			<div className="member-right">
				<div className="member-ofCont-main">
					<br /><br />

					<div className="member-seach-box">
						<input type="text" alt="문의_검색" />
					</div>
					<img src={Seach} alt="돋보기" className="seach-img" /><br /><br />



					<div className="member-right">
						<div className="member-myTk-box2">
							<div className="ofCosts-main-box">
								<strong>자주 묻는 질문</strong>
								<br /><br />

								<div className="member-ofConts-conBox">

									<div className="member-ofConts-btnBox">
										<button alt="탑질문" className="qna-btn">TOP Q&A</button>
										<button alt="탑질문" className="qna-btn">티켓</button>
										<button alt="탑질문" className="qna-btn">회원</button>
									</div><br />

									<table>
										<tbody>
											<tr><th>♥</th><td>모바일 티켓이나 현장 수령 말고 배송은 따로 안 되는 건가요?</td></tr>
											<tr><th>♥</th><td>티켓을 취소하고 싶은데, 수수료는 내기 싫어요</td></tr>
											<tr><th>♥</th><td>예매한 티켓은 언제 배부되는지 알고 싶어요</td></tr>
											<tr><th>♥</th><td>부정적인 예매로 아이디가 제한되엇습니다. 어떻게 해야 하나요?</td></tr>
											<tr><th>♥</th><td>사용 중인 계정이 여러 개인 경우 어떻게 전환할 수 있나요?</td></tr>
										</tbody>
									</table><br />

									<div className="member-ofCont-plus">
										<strong> + </strong> <span> 자주 묻는 질문 더 보기 </span>
									</div><br />

									<div className="member-ofConts-3Box">
										<img src={Cont1} alt="돋보기" className="cont1-img" />
										<table>
											<tbody>
												<tr><th>1:1 문의하기</th></tr>
												<tr><td>자세한 상담이 가능해요</td></tr>
											</tbody>
										</table>
									</div><br />


									<div className="member-ofConts-3Box">
										<img src={Cont2} alt="돋보기" className="cont1-img" />
										<table>
											<tbody>
												<tr><th>내 문의 내역 보기</th></tr>
												<tr><td>문의한 내용을 확인해 보세요</td></tr>
											</tbody>
										</table>
									</div><br />

									<div className="member-ofConts-3Box">
										<img src={Cont3} alt="돋보기" className="cont1-img" />
										<table>
											<tbody>
												<tr><th>문의 / 요청 서식 찾기</th></tr>
												<tr><td>양식을 통해 편리하게 문의하세요</td></tr>
											</tbody>
										</table>
									</div><br />



								</div>
							</div>
						</div>


					</div>
				</div>
			</div>
		</div>


	);
}