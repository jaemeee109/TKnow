import React, { useState } from "react";
import "../css/style.css";
import { Link } from "react-router-dom";
import Cons from "../images/cons.png";



export default function MyContact() {

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

					<div className="mytick-main-box">
						<strong>내 문의 내역</strong>
						<br /><br />
						<div className="member-mycont-Box">
							<div className="cont-cont-list">
								<strong>[문의]</strong><span> 실수로 큐알 코드를 지우게 되면 어떻게 하나요?</span><br />
								<p><strong>[답변]</strong><span> 회원정보 〉 나의 티켓 〉 해당하는 콘서트를 클릭하시면
									큐알 코드를 받으실 수 있습니다! </span></p>
							</div>
						</div><br />

						<div className="member-mycont-Box">
							<div className="cont-cont-list">
								<strong>[문의]</strong><span> 실수로 큐알 코드를 지우게 되면 어떻게 하나요?</span><br />
								<p><strong>[답변]</strong><span> 회원정보 〉 나의 티켓 〉 해당하는 콘서트를 클릭하시면
									큐알 코드를 받으실 수 있습니다! </span></p>
							</div>
						</div><br />

						<div className="member-mycont-Box">
							<div className="cont-cont-list">
								<strong>[문의]</strong><span> 실수로 큐알 코드를 지우게 되면 어떻게 하나요?</span><br />
								<p><strong>[답변]</strong><span> 회원정보 〉 나의 티켓 〉 해당하는 콘서트를 클릭하시면
									큐알 코드를 받으실 수 있습니다! </span></p>
							</div>
						</div><br />

						<div className="member-myCont-plus">
							<strong> + </strong> <span> 내 문의 목록 더 보기 </span>
						</div><br />
					</div>
				</div><br />

				<div className="member-myCont-box">
					<Link to="/member/Contact" className="member-myCont-but1" >1:1 문의하기</Link>
					<Link to="/member/OftenContact" alt="자주 묻는 질문" className="member-myCont-but2">자주 묻는 질문</Link>
				</div>

			</div>
		</div>


	);
}