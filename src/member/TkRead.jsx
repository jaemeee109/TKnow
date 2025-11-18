import React, { useState, useEffect } from "react";
import "../css/style.css";
import { Link, useParams } from "react-router-dom";
import Ticket from "../images/ticket.png";
import TKNOW_w from "../images/TKNOW_w.png";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

export default function TickRead() {
	const { orderId } = useParams();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// 마운트 시 API 호출 (토큰 포함)
	useEffect(() => {
		const token = localStorage.getItem("accessToken");

		if (!token) {
			setError("로그인이 필요합니다.");
			setLoading(false);
			return;
		}

		// ⭐ context path 포함 + 토큰 추가
		axios.get(`http://localhost:9090/ticketnow/orders/${orderId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json"
			}
		})
			.then(res => {
				console.log("티켓 데이터:", res.data);
				setData(res.data);
				setLoading(false);
				
			})
			.catch(err => {
				console.error("티켓 조회 실패:", err);
				setError(err.response?.data?.message || "티켓 정보를 불러올 수 없습니다.");
				setLoading(false);
			});
	}, [orderId]);

	// 로딩 중
	if (loading) {
		return (
			<div className="member-Member-page">
				<div className="member-right">
					<div className="member-myTk-box2">
						<div>Loading...</div>
					</div>
				</div>
			</div>
		);
	}

	// 에러 발생
	if (error) {
		return (
			<div className="member-Member-page">
				<div className="member-right">
					<div className="member-myTk-box2">
						<div style={{ color: 'red' }}>❌ {error}</div>
					</div>
				</div>
			</div>
		);
	}

	// 데이터 없음
	if (!data) {
		return <div>데이터가 없습니다.</div>;
	}

	return (
		<div className="member-Member-page">
			<div className="member-left">
				<div className="member-Member-box1">
					<strong>{data.memberName}</strong><span>님 반갑습니다!</span>
					<br /><br />
					<table>
						<tbody>
							<tr><td><Link to="/member/Member" className="member-Member">회원정보</Link></td></tr>
							<tr><td>보안설정</td></tr>
							<tr><td>회원등급</td></tr>
							<tr><td><Link to="/member/MyTick" className="member-Member-click">나의 티켓</Link></td></tr>
							<tr><td>나의 일정</td></tr>
							<tr><td><Link to="/member/Contact" className="member-mytick">1:1 문의 내역</Link></td></tr>
							<tr><td>고객센터</td></tr>
							<tr><td>공지사항</td></tr>
						</tbody>
					</table>
					<hr className="member-box1-bottom" />
				</div>
			</div>

			<div className="member-right">
				<div className="member-myTk-box2">
					<div className="mytick-main-box">
						<strong>예매 상세 확인 및 취소</strong>
						<br /><br />

				
						<div className="member-tkRead-conBox">
							<div className="tkRead-cons-list">
								<strong>{data.ticketTitle}</strong>
								<br /><br />
								<img src={data.ticketImage} alt="콘서트_썸네일" className="member-tkRead-consImg" />
								<span>상세보기</span>
							</div>

							<div className="member-tkRead-dayBox">
								<div className="member-tkRead-my">
								{data && (
									<table>
										<tbody>
											<tr><th>예매자</th><td>{data.memberName}</td></tr>
											<tr><th>예매번호</th><td>{data.orderTicketId}</td></tr>
											<tr><th>이용일</th><td>{data.ticketDate}</td></tr>
											<tr><th>장소</th><td>{data.venueName}</td></tr>
											<tr><th>좌석</th><td>{data.seatCode}</td></tr>
											<tr><th>티켓 수령 방법</th><td>모바일 티켓</td></tr>
											<tr><th>받으시는 분</th><td>{data.memberName}</td></tr>
											<tr><th>연락처</th><td>{data.memberPhone}</td></tr>
										</tbody>
									</table>
									)}
								</div>
							</div>
						</div>

						<br />
						<strong>모바일 티켓 확인</strong>
						<div className="member-tkRead-conBox2">
							<div className="tkread-ticket-tkRead">
								<div className="ticket-img">
									<img src={Ticket} alt="티켓_사진" className="ticket-base-img" />
									<img src={TKNOW_w} alt="티켓_로고" className="ticket-logow-img" />
									<div className="ticket-buy6-text1">{data.qr}</div>
									<div className="ticket-buy6-text2">{data.ticketTitle}</div>

									<div className="ticket-buy6-text1">{data.orderId}</div>

									<div className="ticket-buy6-text2">{data.concertTitle}</div>

									<table className="ticket-buy6-table">
										<tr><th>예매 번호</th><td>｜</td><td>{data.orderTicketId}</td></tr>
										<tr><th>좌석 번호</th><td>｜</td><td>{data.seatCode}</td></tr>
										<tr><th>날짜</th><td>｜</td><td>{data.ticketDate}</td></tr>
										<tr><th>장소</th><td>｜</td><td>{data.venueName}</td></tr>
									</table>
									<div className="ticket-qr-box">
										<QRCodeCanvas
											className="ticket-qr-img"
											value={data.qr}
											size={150}
											bgColor="#FFFFFF"
											fgColor="#000000"
											level="Q"
										/>

									</div>
								</div>
							</div>
						</div>

						<br />
						<strong>예매 내역</strong>
						<div className="member-tkRead-conBox4">
							<table className="member-tkRead-text1">
								<tbody>
									<tr>
										<th>예매 번호</th><td>｜</td><td>{data.orderTicketId}</td>
										<th>배송</th><td>｜</td><td>{data.deliveryType}</td>
										<th>가격 등급</th><td>｜</td><td>{data.priceLevel}</td>
									</tr>
									<tr>
										<th>좌석번호</th><td>｜</td><td>{data.seatCode}</td>
										<th>가격</th><td>｜</td><td>{data.ticketPrice?.toLocaleString()} 원</td>
										<th>취소 여부</th><td>｜</td><td>{data.cancelable ? "가능" : "불가"}</td>
									</tr>
									<tr>
										<th>수수료</th><td>｜</td><td>{data.fee?.toLocaleString()} 원</td>
										<th>배송비</th><td>｜</td><td>0 원</td>
										<th>총 결제 금액</th><td>｜</td>
										<td style={{ color: "#FFA6C9", fontWeight: "bold" }}>
											{((data.price || 0) + (data.delivery || 0) + (data.fee || 0)).toLocaleString()} 원
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}