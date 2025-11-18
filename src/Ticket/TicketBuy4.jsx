import React, { useState } from "react";
import "../css/style.css";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Cons from "../images/cons.png";

export default function TicketBuy4() {
	const { id } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	
	// Buy3에서 넘어온 정보
	const {
		selectedSeat,
		normalCount = 1,
		discount1Count = 0,
		discount2Count = 0,
		discount3Count = 0,
		totalPrice = 163000
	} = location.state || {};
	
	// 배송 방식
	const [deliveryMethod, setDeliveryMethod] = useState("현장");
	
	// 예매자 정보
	const [name, setName] = useState("");
	const [birthdate, setBirthdate] = useState("");
	const [phone1, setPhone1] = useState("");
	const [phone2, setPhone2] = useState("");
	const [phone3, setPhone3] = useState("");
	const [email, setEmail] = useState("");
	
	const handleNext = () => {
		if (!birthdate || birthdate.length !== 6) {
			alert("생년월일을 정확히 입력해주세요 (6자리)");
			return;
		}
		if (!phone1 || !phone2 || !phone3) {
			alert("연락처를 입력해주세요");
			return;
		}
		if (!email) {
			alert("이메일을 입력해주세요");
			return;
		}
		
		// Buy5로 데이터 전달
		navigate(`/Ticket/Buy5/${id}`, {
			state: {
				selectedSeat,
				normalCount,
				discount1Count,
				discount2Count,
				discount3Count,
				totalPrice,
				deliveryMethod,
				name,
				birthdate,
				phone: `${phone1}-${phone2}-${phone3}`,
				email
			}
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

					<button className="ticket-buy-button1">04&nbsp;
						<span className="ticket-buy-button-text1">배송 선택</span></button>

					<button className="ticket-buy-button2">05&nbsp;
						<span className="ticket-buy-button-text1">결제하기</span></button>
				</div><br />


				<div className="ticket-buy-middle">

					<div className="ticket-buy-middle-box">
						<div className="ticket-buy-middle-box1">
							<div className="ticket-buy4-box2">
								<strong>티켓 수령 확인</strong><br /><br />
								<label className="custom-radio">
									<input 
										type="radio" 
										name="delivery" 
										value="현장" 
										checked={deliveryMethod === "현장"}
										onChange={(e) => setDeliveryMethod(e.target.value)}
									/>
									<span>현장 수령</span>
								</label><br /><br />

								<label className="custom-radio">
									<input 
										type="radio" 
										name="delivery" 
										value="모바일" 
										checked={deliveryMethod === "모바일"}
										onChange={(e) => setDeliveryMethod(e.target.value)}
									/>
									<span>모바일 티켓</span>
								</label><br /><br />
								<p style={{ fontSize:"16px", color:"#85292B" }}> 2025 년 10 월 20 일 일괄 배송되는 상품입니다.</p>
								<p style={{ fontSize:"15px", color:"#808080" }}>일괄 배송일: 10 월 20 일 (월) ~ 21 일 (화)
									＊ 티켓은 묶음 배송이 불가합니다.
									＊ 배송받으신 티켓 분실시 입장 불가합니다.</p>
							</div>

							<div className="ticket-buy4-box3">
								<strong>예매자 정보</strong><br /><br />
								<div className="ticket-buy4-box4">
								<strong>이름</strong>&nbsp;&nbsp;&nbsp;<span>{name}</span><br /><br />
								<strong>생년월일</strong>&nbsp;&nbsp;&nbsp;
								<input 
									className="ticket-buy4-box5" 
									type="text" 
									maxLength="6" 
									value={birthdate}
									onChange={(e) => setBirthdate(e.target.value.replace(/[^0-9]/g, ''))}
									placeholder="070919"
								/>
								<span>&nbsp;&nbsp;&nbsp;예) 070919 (YYMMDD)</span><br /><br />
								<p style={{ fontSize:"15px", color:"#808080" }}>생년월일을 정확하게 입력해 주세요.
									가입시 입력하신 정보와 다를 경우, 본인확인이 되지 않아 예매가 불가합니다.</p><br /><br />
								<strong>연락처</strong>&nbsp;&nbsp;&nbsp;
								<input 
									className="ticket-buy4-box6" 
									type="text" 
									maxLength="3" 
									value={phone1}
									onChange={(e) => setPhone1(e.target.value.replace(/[^0-9]/g, ''))}
								/><span> - </span>
								<input 
									className="ticket-buy4-box6" 
									type="text" 
									maxLength="4" 
									value={phone2}
									onChange={(e) => setPhone2(e.target.value.replace(/[^0-9]/g, ''))}
								/><span> - </span>
								<input 
									className="ticket-buy4-box6" 
									type="text" 
									maxLength="4" 
									value={phone3}
									onChange={(e) => setPhone3(e.target.value.replace(/[^0-9]/g, ''))}
								/>
								<br/><br/>
								<strong>이메일</strong>&nbsp;&nbsp;&nbsp;
								<input 
									className="ticket-buy4-box7" 
									type="text"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="example@email.com"
								/>
								<br/><p className="ticket-buy4-text1"> SMS 문자와 이메일로 예매 정보를 보내드립니다.</p>
							</div>
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
									<strong className="ticket-buy-my">My 예매 정보 </strong><br/>
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
							<br/>
						
						<div className="ticket-stage-button2">
							<Link to={`/Ticket/Buy3/${id}`} className="ticket-stage-back">
								이전 단계
							</Link>

							<button onClick={handleNext} className="ticket-stage-next3">
								다음 단계
							</button>
						</div>
					</div>

				</div>

			</div >
		</div >
	);
}