// src/Ticket/TicketBuy3.jsx
import React, { useEffect, useState } from "react";
import "../css/ticket.css";
import "../css/style.css";
import api from "../api";
import { Link, useParams, useLocation } from "react-router-dom";
import Cons from "../images/cons.png";

export default function TicketBuy() {
	const { id } = useParams();
	const location = useLocation();
	const [ticketData, setTicketData] = useState(null);

	// Buy2에서 넘어온 좌석 정보
	const selectedSeat = location.state?.selectedSeat;

	// 선택한 티켓 수량
	const [normalCount, setNormalCount] = useState(0);
	const [discount1Count, setDiscount1Count] = useState(0); 
	const [discount2Count, setDiscount2Count] = useState(0);
	const [discount3Count, setDiscount3Count] = useState(0);

	useEffect(() => {
		api
			.get(`/tickets/${id}`)
			.then((res) => {
				setTicketData(res.data);
				if (selectedSeat) setNormalCount(1);
			})
			.catch((err) => console.error(err));
	}, [id, selectedSeat]);

	// 총 선택 좌석 수
	const totalSeatCount =
		normalCount + discount1Count + discount2Count + discount3Count;

	// dummy 공연 정보
	const dummyInfo = {
		title: ticketData?.ticket_title,
		venue: ticketData?.venueName,
		date: new Date(2025, 10, 11, 11, 0), // 11월 = 10
		duration: ticketData?.duration, // 분
		ageLimit: ticketData?.ageLimit,
	};

	const cancelDate = new Date(dummyInfo.date.getTime() + 7 * 24 * 60 * 60 * 1000);

	// 가격 계산
	const basePrice = ticketData?.price || 100_000; // 기본가
	const discountPrice = Math.floor(basePrice * 0.8);
	const serviceFee = Math.floor(basePrice * 0.1) * totalSeatCount;
	const deliveryFee = ticketData?.deliveryFee || 0;
	console.log(ticketData);

	const ticketAmount = normalCount * basePrice +
	                     discount1Count * discountPrice +
	                     discount2Count * discountPrice +
	                     discount3Count * discountPrice;
	
	// 합계
	const totalPrice = ticketAmount + serviceFee + deliveryFee;

	const isAnySelected = totalSeatCount > 0;

	const renderOptions = (max = 1) => {
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
				{/* 상단 단계 버튼 */}
				<div className="ticket-buy-top">
					<button className="ticket-buy-button2">
						01&nbsp;<span className="ticket-buy-button-text1">날짜 선택</span>
					</button>
					<button className="ticket-buy-button2">
						02&nbsp;<span className="ticket-buy-button-text1">좌석 선택</span>
					</button>
					<button className="ticket-buy-button1">
						03&nbsp;<span className="ticket-buy-button-text1">가격 선택</span>
					</button>
					<button className="ticket-buy-button2">
						04&nbsp;<span className="ticket-buy-button-text1">배송 선택</span>
					</button>
					<button className="ticket-buy-button2">
						05&nbsp;<span className="ticket-buy-button-text1">결제하기</span>
					</button>
				</div>
				<br />

				<div className="ticket-buy-middle">
					<div className="ticket-buy-middle-box">
						<div className="ticket-buy3-middle-box1">
							<div className="ticket-buy3-box">
								<p className="ticket-buy3-box2">
									<strong>R 석</strong> ｜{" "}
									<strong style={{ color: "#85292B" }}>
										좌석 {totalSeatCount} 매
									</strong>{" "}
									를 선택하였습니다.
								</p>
								<br />

								<table>
									<thead>
										<tr>
											<th>기본가</th>
											<td>일반</td>
											<td>{basePrice.toLocaleString()} 원</td>
											<td>
												<select
													value={normalCount}
													onChange={(e) => setNormalCount(Number(e.target.value))}
													disabled={isAnySelected && normalCount === 0}
												>
													{renderOptions()}
												</select>
											</td>
										</tr>
									</thead>
									<tbody>
										<tr>
											<th>기본 할인</th>
											<td>장애인 할인 (1~3급/동반1인) 20%</td>
											<td>{discountPrice.toLocaleString()} 원</td>
											<td>
												<select
													value={discount1Count}
													onChange={(e) => setDiscount1Count(Number(e.target.value))}
													disabled={isAnySelected && discount1Count === 0}
												>
													{renderOptions()}
												</select>
											</td>
										</tr>
										<tr>
											<th>기본 할인</th>
											<td>장애인 할인 (4~6급/본인만) 20%</td>
											<td>{discountPrice.toLocaleString()} 원</td>
											<td>
												<select
													value={discount2Count}
													onChange={(e) => setDiscount2Count(Number(e.target.value))}
													disabled={isAnySelected && discount2Count === 0}
												>
													{renderOptions()}
												</select>
											</td>
										</tr>
										<tr>
											<th>기본 할인</th>
											<td>국가유공자 (본인만) 20%</td>
											<td>{discountPrice.toLocaleString()} 원</td>
											<td>
												<select
													value={discount3Count}
													onChange={(e) => setDiscount3Count(Number(e.target.value))}
													disabled={isAnySelected && discount3Count === 0}
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
								<div className="ticket-buy3-note-text">
									<br />
									<p>
										나우닛 가입시 중복 할인 쿠폰 제공 (단, 새싹 등급 제외)&nbsp;&nbsp;&nbsp;
										<button className="ticket-buy3-cupPluBtn">쿠폰 받기</button>
									</p>{" "}
									<br />
									<p>가격 선택 후 사용 가능한 쿠폰을 조회합니다.</p>
								</div>
							</div>
						</div>
					</div>

					{/* 오른쪽 공연 정보 */}
					<div className="ticket-set-setting2">
						<div className="ticket-set-setting">
							<div className="read-set">
								<div className="cons-img">
									<img src={ticketData?.image || Cons} alt="콘서트_썸네일" />
								</div>
								<div className="read-table">
									<table>
										<tbody>
											<tr>
												<th>공연명</th>
												<td>{ticketData?.title}</td>
											</tr>
											<tr>
												<th>장소</th>
												<td>{dummyInfo.venue}</td>
											</tr>
											<tr>
												<th>날짜</th>
												<td>{dummyInfo.date.toLocaleString("ko-KR")}</td>
											</tr>
											

										</tbody>
									</table>
								</div>
							</div>

							<table className="ticket-buy-table2">
								<tbody>
									<strong className="ticket-buy-my">My 예매 정보 </strong>
									<br />
									<tr>
										<th>일시</th>
										<td>{dummyInfo.date.toLocaleString("ko-KR")}</td>
									</tr>
									<tr>
										<th>선택 좌석</th>
										<td>
											{selectedSeat
												? `F2 구역 - ${selectedSeat.row}열 - ${selectedSeat.number}`
												: "F2 구역 - B 열 - 129"}
										</td>
									</tr>
									<tr>
										<th>티켓 금액</th>
										<td>{ticketAmount.toLocaleString()} 원</td>
									</tr>
									<tr>
										<th>수수료</th>
										<td>{serviceFee.toLocaleString()} 원</td>
									</tr>
									<tr>
										<th>배송료</th>
										<td>{deliveryFee.toLocaleString()} 원</td>
									</tr>
									<tr>
										<th>할인</th>
										<td>0 원</td>
									</tr>
									<tr>
										<th>취소기한</th>
										<td>{cancelDate.toLocaleString("ko-KR")}</td>
									</tr>
									<tr>
										<th>취소수수료</th>
										<td>티켓 금액의 0~50%</td>
									</tr>
								</tbody>
							</table>

							<div className="ticket-buy-total">
								<span>총 결제 금액</span>
								<strong>{totalPrice.toLocaleString()}</strong>
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
								seatId: selectedSeat?.dbId,
							    selectedSeat,
							    normalCount,
							    discount1Count,
							    discount2Count,
							    discount3Count,
							    totalPrice,
							    basePrice,
							    serviceFee: serviceFee,
							    deliveryFee: deliveryFee,
							    discountPrice,
							    totalSeatCount,
							    ticketDate: dummyInfo.date,
							    ticketVenue: dummyInfo.venue,
							    ticketTitle: ticketData?.title,
							    ticketImage: ticketData?.image || "/images/cons.png",
							    cancelDate: cancelDate
							  }}
								className="ticket-stage-next3"
							>
								다음 단계
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
