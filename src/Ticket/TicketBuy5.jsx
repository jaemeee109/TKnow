import React, { useState, useEffect } from "react";
import "../css/style.css";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Cons from "../images/cons.png";
import Ad1 from "../images/ad1.png";
import axios from "axios";

export default function TicketBuy5() {
	const { id } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	
	// Buy4에서 넘어온 정보
	const {
		selectedSeat,
		normalCount = 1,
		discount1Count = 0,
		discount2Count = 0,
		discount3Count = 0,
		totalPrice = 163000,
		deliveryMethod,
		name,
		birthdate,
		phone,
		email
	} = location.state || {};
	
	// 결제 수단
	const [paymentMethod, setPaymentMethod] = useState("신용카드");
	const [cardType, setCardType] = useState("일반");
	
	// 가짜 결제 처리
	const handlePayment = async () => {
		if (!paymentMethod) {
			alert("결제 수단을 선택해주세요");
			return;
		}
		
		// 결제 정보 localStorage에 저장
		const paymentInfo = {
			orderId: `ORDER_${Date.now()}`,
			ticketId: id,
			selectedSeat: selectedSeat,
			seatInfo: selectedSeat ? `F2 구역 - ${selectedSeat.row}열 - ${selectedSeat.number}` : 'F2 구역',
			normalCount,
			discount1Count,
			discount2Count,
			discount3Count,
			totalPrice,
			deliveryMethod,
			name,
			birthdate,
			phone,
			email,
			paymentMethod,
			cardType: paymentMethod === "신용카드" ? cardType : null,
			paymentDate: new Date().toISOString(),
			status: "SUCCESS"
		};
		
		localStorage.setItem('lastPayment', JSON.stringify(paymentInfo));
		
		// 결제 수단에 따른 메시지
		let message = "";
		if (paymentMethod === "신용카드") {
			message = `${cardType} 카드로 ${totalPrice.toLocaleString()}원 결제가 완료되었습니다!`;
		} else if (paymentMethod === "무통장") {
			message = `가상계좌가 발급되었습니다.\n신한은행 110-123-456789\n입금자: ${name}\n금액: ${totalPrice.toLocaleString()}원`;
		} else {
			message = `${paymentMethod}로 ${totalPrice.toLocaleString()}원 결제가 완료되었습니다!`;
		}
		
		alert(message);
		
		// 결제 완료 페이지로 이동
		navigate('/Ticket/Buy6/${id}', { 
			state: paymentInfo 
		});
	};
	


	return (
		<div className="ticket-buy-main">
			<div className="ticket-buy-page">

				<div className="ticket-buy-top">
					<button className="ticket-buy-button2">01&nbsp;
						<span className="ticket-buy-button-text1">날짜 선택</span></button>

					<button className="ticket-buy-button2">02&nbsp;
						<span className="ticket-buy-button-text1">좌석 선택</span></button>

					<button className="ticket-buy-button2">03&nbsp;
						<span className="ticket-buy-button-text1">가격 선택</span></button>

					<button className="ticket-buy-button2">04&nbsp;
						<span className="ticket-buy-button-text1">배송 선택</span></button>

					<button className="ticket-buy-button1">05&nbsp;
						<span className="ticket-buy-button-text1">결제하기</span></button>
				</div><br />


				<div className="ticket-buy-middle">

					<div className="ticket-buy-middle-box">
						<div className="ticket-buy-middle-box1">
							<div className="ticket-buy4-box2">
								<strong>결제 수단 선택</strong><br /><br />

								<label className="custom-radio">
								  <input 
								  	type="radio" 
								  	name="payment" 
								  	value="신용카드"
								  	checked={paymentMethod === "신용카드"}
								  	onChange={(e) => setPaymentMethod(e.target.value)}
								  />
								  <span>신용카드</span>
								</label><br /><br />

								<label className="custom-radio">
								  <input 
								  	type="radio" 
								  	name="payment" 
								  	value="무통장"
								  	checked={paymentMethod === "무통장"}
								  	onChange={(e) => setPaymentMethod(e.target.value)}
								  />
								  <span>무통장 입금</span>
								</label><br /><br />

								<label className="custom-radio">
								  <input 
								  	type="radio" 
								  	name="payment" 
								  	value="카카오페이"
								  	checked={paymentMethod === "카카오페이"}
								  	onChange={(e) => setPaymentMethod(e.target.value)}
								  />
								  <span>카카오페이</span>
								</label><br /><br />

								<label className="custom-radio">
								  <input 
								  	type="radio" 
								  	name="payment" 
								  	value="토스페이"
								  	checked={paymentMethod === "토스페이"}
								  	onChange={(e) => setPaymentMethod(e.target.value)}
								  />
								  <span>토스페이</span>
								</label><br /><br />

								<label className="custom-radio">
								  <input 
								  	type="radio" 
								  	name="payment" 
								  	value="PAYCO"
								  	checked={paymentMethod === "PAYCO"}
								  	onChange={(e) => setPaymentMethod(e.target.value)}
								  />
								  <span>PAYCO</span>
								</label><br /><br />

								<label className="custom-radio">
								  <input 
								  	type="radio" 
								  	name="payment" 
								  	value="휴대폰"
								  	checked={paymentMethod === "휴대폰"}
								  	onChange={(e) => setPaymentMethod(e.target.value)}
								  />
								  <span>휴대 전화 결제</span>
								</label><br /><br />

								<label className="custom-radio">
								  <input 
								  	type="radio" 
								  	name="payment" 
								  	value="포인트"
								  	checked={paymentMethod === "포인트"}
								  	onChange={(e) => setPaymentMethod(e.target.value)}
								  />
								  <span>포인트 사용</span>
								</label><br /><br />
							</div>

							<div className="ticket-buy4-box3">
								{paymentMethod === "신용카드" ? (
									<>
										<strong>결제 수단 입력</strong><br /><br />
										
										<label className="custom-radio">
										  <input 
										  	type="radio" 
										  	name="cardType" 
										  	value="일반"
										  	checked={cardType === "일반"}
										  	onChange={(e) => setCardType(e.target.value)}
										  />
										  <span>일반 신용카드</span>
										</label><br /><br />

										<label className="custom-radio">
										  <input 
										  	type="radio" 
										  	name="cardType" 
										  	value="신한"
										  	checked={cardType === "신한"}
										  	onChange={(e) => setCardType(e.target.value)}
										  />
										  <span>신한 문화카드</span>
										</label><br /><br />

										<label className="custom-radio">
										  <input 
										  	type="radio" 
										  	name="cardType" 
										  	value="농협"
										  	checked={cardType === "농협"}
										  	onChange={(e) => setCardType(e.target.value)}
										  />
										  <span>농협 누리카드</span>
										</label><br /><br />

										<label className="custom-radio">
										  <input 
										  	type="radio" 
										  	name="cardType" 
										  	value="나우잇"
										  	checked={cardType === "나우잇"}
										  	onChange={(e) => setCardType(e.target.value)}
										  />
										  <span>나우잇! 카드</span>
										</label><br /><br />
										
										<br/>
										
										<div className="ad1-img">
											<img src={Ad1} alt="알디원_배너" />
										</div>
									</>
								) : (
									<div style={{ minHeight: "400px" }}>
										{/* 빈 공간 유지 - 화면 안 움직이게 */}
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="ticket-set-setting2">
						<div className="ticket-set-setting">
							<div className="read-set">
								<div className="cons-img">
									<img src={Cons} alt="콘서트_썸네일" />
								</div>

								<div className="read-table">
									<table>
										<tbody>
											<tr><th>장소</th><td>잠실 올림픽경기장</td></tr>
											<tr><th>날짜</th><td>2025. 12. 05 ~ 2025. 12. 07</td></tr>
											<tr><th>공연 시간</th><td>300 분</td></tr>
											<tr><th>관람 연령</th><td>미취학 아동 입장 불가</td></tr>
										</tbody>
									</table>
								</div>
							</div>

							<table className="ticket-buy-table2">
								<tbody>
									<strong className="ticket-buy-my">My 예매 정보 </strong><br />
									<tr><th>일시</th><td>2025 년 12 월 05 일  (금) 14:00</td></tr>
									<tr>
										<th>선택 좌석</th>
										<td>
											{selectedSeat 
												? `F2 구역 - ${selectedSeat.row}열 - ${selectedSeat.number}` 
												: 'F2 구역 - B 열 - 129'
											}
										</td>
									</tr>
									<tr><th>티켓 금액</th><td>{totalPrice?.toLocaleString()} 원</td></tr>
									<tr><th>수수료</th><td>14,300 원</td></tr>
									<tr><th>배송료</th><td>5,700 원</td></tr>
									<tr><th>할인</th><td>0 원</td></tr>
									<tr><th>취소기한</th><td>2025 년 12 월 10 일 (수) 14:00</td></tr>
									<tr><th>취소수수료</th><td>티켓 금액의 0 ~ 50 %</td></tr>
								</tbody>
							</table>

							<div className="ticket-buy-total">
								<span>총 결제 금액</span>
								<strong>{totalPrice?.toLocaleString()}</strong>
								<p>원</p>
							</div>
						</div>
						<br />

						<div className="ticket-stage-button2">
							<Link to={`/Ticket/Buy4/${id}`} className="ticket-stage-back">
								이전 단계
							</Link>

							<button onClick={handlePayment} className="ticket-stage-next3">
								결제하기
							</button>
						</div>
					</div>

				</div>
</div>
			
</div>
	);
}