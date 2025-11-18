import React, { useState } from "react";
import "../css/style.css";
import { Link } from "react-router-dom";
import Kkw from "../images/kkw.png";
import ProMod from "../images/pro_mod.png";
import User from "../images/user.png";
import Inventory1 from "../images/inventory1.png";
import Inventory2 from "../images/inventory2.png";
import Inventory3 from "../images/inventory3.png";

export default function Member() {

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
						<tr><td><Link to="/admin/AdminContact" className="member-Member-click">1:1 문의사항 관리</Link></td></tr>
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
					<div className="costs-main-box">
						<br /><br />
						<div className="member-conts-conBox">
							<div className="Admin-conts-list">

								<table class="AdConts-table">
									<tbody>
										<tr>
											<th colspan="2">이메일 주소&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

												휴대전화번호</th>
										</tr>
										<input type="text" className="admin-cont-phone1" />
										<input type="text" className="admin-cont-phone2" /><br/>


										<tr>
											<th colspan="2">문의 유형&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

												예약번호</th>
										</tr>
										<input type="text" className="admin-cont-phone1" />
										<input type="text" className="admin-cont-phone2" />
										<tr>
											<th colspan="2">문의내용</th>
										</tr>


										<tr>
											<td colspan="2">
												<textarea type="text" rows="6" className="conts-area"></textarea>
											</td>
										</tr>
										<tr>
											<th>첨부파일</th>
										</tr>
										<tr>
											<td>
												<input type="text" alt="첨부파일" className="Ad-conts-resNum"></input>&nbsp;&nbsp;&nbsp;

											</td>
										</tr>
										<br />
										<button type="text" className="conts-conts-btn">댓글 달기</button><br /><br />
										<tr>
											<th>댓글</th>
										</tr>
										<tr>
											<td>
												<input type="text" alt="댓글" className="Ad-conts-rep"></input>&nbsp;&nbsp;&nbsp;

											</td>
										</tr><br />
	
									</tbody>
								</table>


							</div>

							<div className="member-tkRead-dayBox">
								<div className="member-tkRead-my">



								</div>
							</div>
						</div>
					</div></div>

			</div>
		</div>
	);
}