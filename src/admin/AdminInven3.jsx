// src/admin/AdminInven3.jsx
import React, { useState, useEffect } from "react";
import "../css/admin.css";
import "../css/style.css";
import { data, Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import AdminSidebar from "./AdminSidebar"
export default function AdminInven3() {
	const navigate = useNavigate();
	const { ticketId } = useParams();

	const [title, setTitle] = useState("");
	const [startAt, setStartAt] = useState({ year: "", month: "", day: "", hour: "", minute: "" });
	const [endAt, setEndAt] = useState({ year: "", month: "", day: "", hour: "", minute: "" });
	const [venueName, setVenueName] = useState("");
	const [venueAddress, setVenueAddress] = useState("");
	const [totalSeats, setTotalSeats] = useState("");
	const [price, setPrice] = useState("");
	const [ticketCost, setTicketCost] = useState("");
	const [ticketPrice, setTicketPrice] = useState("");
	const [ticketStock, setTicketStock] = useState("");
	const [ticketDetail, setTicketDetail] = useState("");
	const [ageLimit, setAgeLimit] = useState("");
	const [benefit, setBenefit] = useState("");
	const [promotion, setPromotion] = useState("");
	const [category, setCategory] = useState("");
	const [ticketStatus, setTicketStatus] = useState("");

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// 페이지 로드 시 기존 티켓 정보 불러오기
	useEffect(() => {
		const fetchTicketData = async () => {
			try {
				const token = localStorage.getItem("accessToken");
				const res = await api.get(`/tickets/${ticketId}`, {
					headers: { Authorization: `Bearer ${token}` }
				});

				const data = res.data;
				console.log("불러온 티켓 정보:", data);

				// 받아온 데이터로 폼 필드 채우기
				setTitle(data.title || "");
				setCategory(data.category || "CONCERT");
				setVenueName(data.venueName || "");
				setVenueAddress(data.venueAddress || "");
				setTotalSeats(data.totalSeats || "");
				setPrice(data.price || "");
				setTicketCost(data.ticketCost || "");
				setTicketPrice(data.ticketPrice || "");
				setTicketStock(data.remainingSeats || data.totalSeats || "");
				setTicketDetail(data.detail || "");
				setAgeLimit(data.ageLimit || "");
				setBenefit(data.benefit || "");
				setPromotion(data.promotion || "");
				setPromotion(data.ticketStatus || "");

				// 날짜 파싱
				if (data.startAt && Array.isArray(data.startAt)) {
					setStartAt({
						year: String(data.startAt[0] || ""),
						month: String(data.startAt[1] || "").padStart(2, "0"),
						day: String(data.startAt[2] || "").padStart(2, "0"),
						hour: String(data.startAt[3] || "00").padStart(2, "0"),
						minute: String(data.startAt[4] || "00").padStart(2, "0")
					});
				}

				if (data.endAt && Array.isArray(data.endAt)) {
					setEndAt({
						year: String(data.endAt[0] || ""),
						month: String(data.endAt[1] || "").padStart(2, "0"),
						day: String(data.endAt[2] || "").padStart(2, "0"),
						hour: String(data.endAt[3] || "00").padStart(2, "0"),
						minute: String(data.endAt[4] || "00").padStart(2, "0")
					});
				}

				setLoading(false);
			} catch (err) {
				console.error("티켓 정보 불러오기 실패:", err);
				setError("티켓 정보를 불러올 수 없습니다.");
				setLoading(false);
			}
		};

		fetchTicketData();
	}, [ticketId]);

	// 수정하기 버튼 클릭
	const handleUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const startDateTime = `${startAt.year}-${startAt.month.padStart(2, '0')}-${startAt.day.padStart(2, '0')}T${startAt.hour.padStart(2, '0')}:${startAt.minute.padStart(2, '0')}:00`;
			const endDateTime = `${endAt.year}-${endAt.month.padStart(2, '0')}-${endAt.day.padStart(2, '0')}T${endAt.hour.padStart(2, '0')}:${endAt.minute.padStart(2, '0')}:00`;

			const payload = {
			  title,
			   category: category || data.category, 
			  startAt: startDateTime,
			  endAt: endDateTime,
			  venueName,
			  venueAddress,
			  totalSeats: parseInt(totalSeats) || 0,
			  price: parseFloat(price) || 0,
			  ticketCost: ticketCost ? parseFloat(ticketCost) : null,
			  ticketPrice: ticketPrice ? parseFloat(ticketPrice) : null,
			  ticketStock: ticketStock ? parseInt(ticketStock) : null,
			  ticketDetail,
			  ageLimit,
			  benefit,
			  promotion,
			  ticketStatus
			};

			console.log("수정 요청 데이터:", payload);

			const token = localStorage.getItem("accessToken");

			// PUT 요청으로 수정
			await api.put(
				`/tickets/${ticketId}`,
				payload,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			alert("상품 수정 완료");
			navigate("/admin/AdminInven");

		} catch (err) {
			console.error("수정 실패:", err);
			setError(err.response?.data?.message || err.message);
		} finally {
			setLoading(false);
		}
	};

	// 삭제하기 버튼 클릭
	const handleDelete = async () => {
		if (!window.confirm("상품을 삭제하겠습니다")) {
			return;
		}

		try {
			setLoading(true);
			const token = localStorage.getItem("accessToken");

			// DELETE 요청
			await api.delete(
				`/tickets/${ticketId}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			alert("상품 삭제 완료");
			navigate("/admin/AdminInven");

		} catch (err) {
			console.error("삭제 실패:", err);
			alert("삭제 실패: " + (err.response?.data?.message || err.message));
		} finally {
			setLoading(false);
		}
	};

	// 로딩 중일 때
	if (loading) {
		return (
			<div className="member-Member-page">
				<div className="member-left">
					<div className="admin-Member-box1">
						<strong>관리자</strong><span> 님 반갑습니다!</span>
					</div>
				</div>
				<div className="member-right">
					<p>로딩 중...</p>
				</div>
			</div>
		);
	}

	return (
		<form className="member-Member-page" onSubmit={handleUpdate}>
			<AdminSidebar />{/* ← 공통 사이드바 호출 */}

			<div className="member-right">
				<div className="member-myTk-box2">
					<div className="costs-main-box">

						{error && (
							<div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red' }}>
								❌ {error}
							</div>
						)}

						<div className="member-conts-conBox">
							<div className="Admin-conts-list">
								<table className="AdConts-table">
									<tbody>
										<tr><th>상품명 <span style={{ color: 'red' }}>*</span></th></tr>
										<tr><td><input type="text" className="Ad-conts-resNum" value={title} onChange={e => setTitle(e.target.value)} required /></td></tr>

										<tr><th>판매 상태 <span style={{ color: 'red' }}>*</span></th></tr>
										<tr>
											<td>
												<select value={ticketStatus} className="Ad-conts-resNum" onChange={e => setTicketStatus(e.target.value)}  required>
												<option value="ON_SALE">판매중</option>
												    <option value="SOLD_OUT">매진</option>
												    <option value="SCHEDULED">오픈 예정</option>
												    <option value="CLOSED">판매 종료</option>
												</select>
											</td>
										</tr>
										
										
										<tr><th>카테고리 <span style={{ color: 'red' }}>*</span></th></tr>
										<tr>
											<td>
												<select value={category} className="Ad-conts-resNum" onChange={e => setCategory(e.target.value)} required>
													<option value="CONCERT">콘서트</option>
													<option value="MUSICAL">뮤지컬</option>
													<option value="SPORTS">스포츠</option>
													<option value="EXHIBITION">전시회</option>
												</select>
											</td>
										</tr>

										<tr><th>공연 시작 일시 <span style={{ color: 'red' }}>*</span></th></tr>
										<tr>
											<td>
												<input type="text" placeholder="YYYY" className="admin-inven-phone1" value={startAt.year} maxLength="4" onChange={e => setStartAt({ ...startAt, year: e.target.value })} required />
												<input type="text" placeholder="MM" className="admin-inven-phone1" value={startAt.month} maxLength="2" onChange={e => setStartAt({ ...startAt, month: e.target.value })} required />
												<input type="text" placeholder="DD" className="admin-inven-phone1" value={startAt.day} maxLength="2" onChange={e => setStartAt({ ...startAt, day: e.target.value })} required />
												<input type="text" placeholder="HH" className="admin-inven-phone1" value={startAt.hour} maxLength="2" onChange={e => setStartAt({ ...startAt, hour: e.target.value })} required />
												:
												<input type="text" placeholder="mm" className="admin-inven-phone1" value={startAt.minute} maxLength="2" onChange={e => setStartAt({ ...startAt, minute: e.target.value })} required />
											</td>
										</tr>

										<tr><th>공연 종료 일시 <span style={{ color: 'red' }}>*</span></th></tr>
										<tr>
											<td>
												<input type="text" placeholder="YYYY" className="admin-inven-phone1" value={endAt.year} maxLength="4" onChange={e => setEndAt({ ...endAt, year: e.target.value })} required />
												<input type="text" placeholder="MM" className="admin-inven-phone1" value={endAt.month} maxLength="2" onChange={e => setEndAt({ ...endAt, month: e.target.value })} required />
												<input type="text" placeholder="DD" className="admin-inven-phone1" value={endAt.day} maxLength="2" onChange={e => setEndAt({ ...endAt, day: e.target.value })} required />
												<input type="text" placeholder="HH" className="admin-inven-phone1" value={endAt.hour} maxLength="2" onChange={e => setEndAt({ ...endAt, hour: e.target.value })} required />
												:
												<input type="text" placeholder="mm" className="admin-inven-phone1" value={endAt.minute} maxLength="2" onChange={e => setEndAt({ ...endAt, minute: e.target.value })} required />
											</td>
										</tr>

										<tr><th>공연 장소 <span style={{ color: 'red' }}>*</span></th></tr>
										<tr><td><input type="text" className="Ad-conts-resNum" value={venueName} onChange={e => setVenueName(e.target.value)} required /></td></tr>

										<tr><th>공연장 주소</th></tr>
										<tr><td><input type="text" className="Ad-conts-resNum" value={venueAddress} onChange={e => setVenueAddress(e.target.value)} /></td></tr>

										<tr><th>총 좌석 수 <span style={{ color: 'red' }}>*</span></th></tr>
										<tr><td><input type="number" min="1" className="Ad-conts-resNum" value={totalSeats} onChange={e => setTotalSeats(e.target.value)} required /></td></tr>

										<tr><th>기본 가격 <span style={{ color: 'red' }}>*</span></th></tr>
										<tr><td><input type="number" min="0" className="Ad-conts-resNum" value={price} onChange={e => setPrice(e.target.value)} required /></td></tr>

										<tr><th>매입 원가</th></tr>
										<tr><td><input type="number" min="0" className="Ad-conts-resNum" value={ticketCost} onChange={e => setTicketCost(e.target.value)} /></td></tr>

										<tr><th>상품 상세 설명</th></tr>
										<tr><td><textarea className="Ad-conts-resNum" value={ticketDetail} onChange={e => setTicketDetail(e.target.value)} rows="4" style={{ width: '100%' }} /></td></tr>

							
										<tr>
											<td style={{ display: 'flex', gap: '10px' }}>
												<button 
													type="submit" 
													className="conts-conts-btn1" 
													disabled={loading}
												>
													{loading ? "처리 중" : "수정하기"}
												</button>
												<button 
													type="button" 
													onClick={handleDelete}
													className="conts-conts-btn1" 
													disabled={loading}
												>
													삭제하기
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}