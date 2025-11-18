import React, { useEffect, useState } from "react";
import "../css/style.css";
import axios from "axios";
import { Link, useParams, useLocation } from "react-router-dom";
import Cons from "../images/cons.png";

export default function TicketBuy() {
	const { id } = useParams();
	const location = useLocation();
	
	// Buy2에서 넘어온 좌석 정보
	const selectedSeat = location.state?.selectedSeat;
	
	// 가격 정보
	const basePrice = 163000;
	const serviceFee = 14300;
	const deliveryFee = 5700;
	
	// 선택한 티켓 수량
	const [normalCount, setNormalCount] = useState(1);
	const [discount1Count, setDiscount1Count] = useState(0);
	const [discount2Count, setDiscount2Count] = useState(0);
	const [discount3Count, setDiscount3Count] = useState(0);
	
	// 총 선택 좌석 수
	const totalSeatCount = normalCount + discount1Count + discount2Count + discount3Count;
	
	// 할인가 계산
	const discountPrice = Math.floor(basePrice * 0.8); // 20% 할인
	
	// 총 금액 계산
	const calculateTotal = () => {
		const ticketTotal = (normalCount * basePrice) + 
		                    (discount1Count * discountPrice) + 
		                    (discount2Count * discountPrice) + 
		                    (discount3Count * discountPrice);
		return ticketTotal + serviceFee + deliveryFee;
	};
	
	const renderOptions = (max = 10) => {
		let options = [];
		for (let i = 0; i <= max; i++) {
			options.push(
				<option key={i} value={i}>
					{i} 매
				</option>
			);
		}
		return options;
	};

	return (
		<div className="ticket-buy-main">
			<div className="ticket-buy-page">

				<div className="ticket-buy-top">
					<button className="ticket-buy-button2">01&nbsp;
						<span className="ticket-buy-button-text1">날짜 선택</span></button>

					<button className="ticket-buy-button2">02&nbsp;
						<span className="ticket-buy-button-text1">좌석 선택</span></button>

					<button className="ticket-buy-button1">03&nbsp;
						<span className="ticket-buy-button-text1">가격 선택</span></button>

					<button className="ticket-buy-button2">04&nbsp;
						<span className="ticket-buy-button-text1">배송 선택</span></button>

					<button className="ticket-buy-button2">05&nbsp;
						<span className="ticket-buy-button-text1">결제하기</span></button>
				</div><br />


				<div className="ticket-buy-middle">

					<div className="ticket-buy-middle-box">
						<div className="ticket-buy3-middle-box1">
							<div className="ticket-buy3-box">
								<p className="ticket-buy3-box2">
									<strong>R 석</strong> ｜ 
									<strong style={{ color: "#85292B" }}>
										좌석 {totalSeatCount} 매
									</strong> 를 선택하였습니다.
								</p>
								<br />

								<table>
									<thead>
										<tr>
											<th>기본가</th><td>일반</td><td>{basePrice.toLocaleString()} 원</td>
											<td>
												<select 
													value={normalCount} 
													onChange={(e) => setNormalCount(Number(e.target.value))}
												>
													{renderOptions()}
												</select>
											</td>
										</tr>
									</thead>
									
									<tbody>
										<tr>
											<th>기본 할인</th>
											<td>장애인 할인 ( 1 ~ 3 급 (중증)/ 동반 1 인) 20 %</td>
											<td>{discountPrice.toLocaleString()} 원</td>
											<td>
												<select 
													value={discount1Count} 
													onChange={(e) => setDiscount1Count(Number(e.target.value))}
												>
													{renderOptions()}
												</select>
											</td>
										</tr>

										<tr>
											<th>기본 할인</th>
											<td>장애인 할인 ( 4~ 6 급 (경증)/ 본인만) 20 %</td>
											<td>{discountPrice.toLocaleString()} 원</td>
											<td>
												<select 
													value={discount2Count} 
													onChange={(e) => setDiscount2Count(Number(e.target.value))}
												>
													{renderOptions()}
												</select>
											</td>
										</tr>

										<tr>
											<th>기본 할인</th>
											<td>국가유공자 (본인만) 20 %</td>
											<td>{discountPrice.toLocaleString()} 원</td>
											<td>
												<select 
													value={discount3Count} 
													onChange={(e) => setDiscount3Count(Number(e.target.value))}
												>
													{renderOptions()}
												</select>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<br />

							<button className="ticket-buy3-cupBtn">나의 쿠폰 모두 보기</button>
				
							<div className="ticket-buy3-note">
								<strong>쿠폰 </strong> <span> (중복 사용 불가)</span>
								<div className="ticket-buy3-note-text"><br />
									<p>나우닛 가입시 중복 할인 쿠폰 제공 (단, 새싹 등급 제외)&nbsp;&nbsp;&nbsp;
									<button className="ticket-buy3-cupPluBtn">쿠폰 받기</button></p> <br/>
									
									<p>가격 선택 후 사용 가능한 쿠폰을 조회합니다.</p>
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
									<tr>
										<th>티켓 금액</th>
										<td>
											{((normalCount * basePrice) + 
											  (discount1Count * discountPrice) + 
											  (discount2Count * discountPrice) + 
											  (discount3Count * discountPrice)).toLocaleString()} 원
										</td>
									</tr>
									<tr><th>수수료</th><td>{serviceFee.toLocaleString()} 원</td></tr>
									<tr><th>배송료</th><td>{deliveryFee.toLocaleString()} 원</td></tr>
									<tr><th>할인</th><td>0 원</td></tr>
									<tr><th>취소기한</th><td>2025 년 12 월 10 일 (수) 14:00</td></tr>
									<tr><th>취소수수료</th><td>티켓 금액의 0 ~ 50 %</td></tr>
								</tbody>
							</table>

							<div className="ticket-buy-total">
								<span>총 결제 금액</span>
								<strong>{calculateTotal().toLocaleString()}</strong>
								<p>원</p>
							</div>
						</div>
						<br />

						<div className="ticket-stage-button2">
							<Link to={`/Ticket/Buy2/${id}`} className="ticket-stage-back">
								이전 단계
							</Link>

							<Link 
								to={`/Ticket/Buy4/${id}`} 
								state={{
									selectedSeat,
									normalCount,
									discount1Count,
									discount2Count,
									discount3Count,
									totalPrice: calculateTotal()
								}}
								className="ticket-stage-next3"
							>
								다음 단계
							</Link>
						</div>
					</div>
				</div>
			</div >
		</div >
	);
}