import React, { useState } from "react";
import "../css/style.css";
import { Link } from "react-router-dom";
import Seach from "../images/seach.png";
import Cont1 from "../images/cont1.png";
import Cont2 from "../images/cont2.png";
import Cont3 from "../images/cont3.png";


export default function OftenContact() {

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