// src/member/MyTick.jsx
import React, { useEffect, useState } from "react";
import "../css/member.css";
import "../css/style.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import MemberSidebar from "./MemberSidebar";

const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

// 이미지 URL 해석 (썸네일용)
const resolveImageUrl = (thumbnail) => {
	if (!thumbnail) return "https://via.placeholder.com/200x150";
	const path = thumbnail.imageUrl || "";
	if (!path) return "https://via.placeholder.com/200x150";
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	return `${BASE_URL}${path}`;
};

export default function MyTick() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const PAGE_SIZE = 5;

	const navigate = useNavigate();

	useEffect(() => {
		const fetchMyOrders = async () => {
			try {
				const token = localStorage.getItem("accessToken");

				if (!token) {
					setError("로그인이 필요합니다.");
					setLoading(false);
					return;
				}

				// 내 주문 내역 (JWT에서 memberId 추출)
				const res = await api.get("/orders", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
					params: {
						page,
						size: PAGE_SIZE,
					},
				});

				console.log("내 주문 내역:", res.data);

				// PageResponseDTO 구조에 맞게 데이터 추출
				const orderList = res.data.list || res.data.data || [];
				setOrders(orderList);

				const totalCount = res.data.totalCount || 0;
				const size = res.data.size || PAGE_SIZE;
				const tp = Math.max(1, Math.ceil(totalCount / size));
				setTotalPages(tp);

				setLoading(false);
			} catch (err) {
				console.error("주문 조회 실패:", err);

				if (err.response?.status === 401) {
					setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
					localStorage.removeItem("accessToken");
					navigate("/login");
				} else {
					setError(
						err.response?.data?.message || "주문 내역을 불러올 수 없습니다."
					);
				}

				setLoading(false);
			}
		};

		fetchMyOrders();
	}, [page, navigate]);

	// "년.월.일" 형식으로 변환
	const formatDate = (date) => {
		if (!date) return "";
		// LocalDate 배열([year, month, day])인 경우
		if (Array.isArray(date)) {
			const [year, month, day] = date;
			return `${year}.${String(month).padStart(2, "0")}.${String(
				day
			).padStart(2, "0")}`;
		}
		// 문자열인 경우 ("YYYY-MM-DD" 또는 이미 "YYYY.MM.DD")
		if (typeof date === "string") {
			if (date.includes(".")) return date;
			const parts = date.split("-");
			if (parts.length === 3) {
				const [year, month, day] = parts;
				return `${year}.${String(month).padStart(2, "0")}.${String(
					day
				).padStart(2, "0")}`;
			}
			return date;
		}
		// 기타 타입은 문자열로
		return String(date);
	};
	// showStartTime을 어떤 형태로 받아도 "HH:mm"으로 정규화
	const formatHHmm = (value) => {
		if (value == null) return "";

		// 백엔드가 LocalTime을 배열([hour, minute, ...])로 주는 경우
		if (Array.isArray(value) && value.length >= 2) {
			const [h, m] = value;
			const hh = String(h ?? 0).padStart(2, "0");
			const mm = String(m ?? 0).padStart(2, "0");
			return `${hh}:${mm}`;
		}

		// 문자열/숫자 등 기타 타입 (예: "140", "14:00", 140 등)
		const digits = String(value).replace(/\D/g, "");
		if (!digits) return "";

		let hh = "00";
		let mm = "00";

		if (digits.length >= 4) {
			hh = digits.slice(0, 2);
			mm = digits.slice(2, 4);
		} else if (digits.length === 3) {
			hh = digits.slice(0, 2);
			mm = digits.slice(2).padStart(2, "0");
		} else if (digits.length === 2) {
			hh = digits;
			mm = "00";
		} else if (digits.length === 1) {
			hh = `0${digits}`;
			mm = "00";
		}

		return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
	};


	const handleLogout = () => {
		localStorage.removeItem("accessToken");
		navigate("/login");
	};

	const handlePrevPage = () => {
		setPage((prev) => (prev > 1 ? prev - 1 : prev));
	};

	const handleNextPage = () => {
		setPage((prev) => (prev < totalPages ? prev + 1 : prev));
	};

	return (
		<div className="member-Member-page">
			<MemberSidebar active="myContact" />
			<div className="member-right">
			
					<div className="mytick-main-box">
					

						{loading && <p>로딩 중...</p>}
						{error && <p style={{ color: "red" }}>{error}</p>}

						{!loading && !error && orders.length === 0 && (
							<p>주문 내역이 없습니다.</p>
						)}

						{!loading &&
							!error &&
							orders.map((order, idx) => (
								<Link
									key={order.ordersId || idx}
									to={`/member/ticket/${order.ordersId}`}
									className={`member-Member-conBox mytick-order-card ${idx === 0 ? "recent-order" : "older-order"
										}`}
								>
									<img
										src={resolveImageUrl(order.ticketThumbnail)}
										alt="공연 썸네일"
										className="member-Member-consImg-1"
									/>
									<div className="member-Member-dayBox">
									
										<div className="member-Member-dayBoxTb">
											<table>
												<tbody>
													{/* (2) 공연 제목 */}
													<tr>
														<th>{order.ticketTitle}</th>
													</tr>
												{/* (3) 공연 장소 (ticketVenue 우선, 없으면 venueName fallback) */}
<tr>
  <th>{order.ticketVenue || order.venueName || "장소 미정"}</th>
</tr>

{/* (4) "년.월.일 시:분" */}
<tr>
  <td>
    {formatDate(order.ticketDate)} {formatHHmm(order.showStartTime)}
  </td>
</tr>

												</tbody>
											</table>
										</div>
									</div>
								</Link>
							))}

						{/* (6) 페이징: 카드 하단에 이전 / 현재페이지 / 총페이지 / 다음 */}
						{!loading && !error && orders.length > 0 && (
    <div className="member-myTk-pagination">
        <button
            type="button"
            onClick={handlePrevPage}
            disabled={page === 1}
        >
            이전
        </button>
        <span>
            {" "}
            {page} / {totalPages}{" "}
        </span>
        <button
            type="button"
            onClick={handleNextPage}
            disabled={page === totalPages}
        >
            다음
        </button>
    </div>
)}


					</div>
					<br />
				
			</div>
		</div>
	);
}
