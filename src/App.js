// src/App.js
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import "./css/style.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./main/Header";
import Banner from "./main/Banner";
import Banner2 from "./main/Banner2";
import TopTk from "./main/TopTk";
import BestReview from "./main/BestReview";
import Bottom from "./main/Bottom";
import Footer from "./main/Footer";
import TicketRead from "./Ticket/Read";
import Review from "./Ticket/Review";
import TicketBuy from "./Ticket/TicketBuy";
import TicketBuy2 from "./Ticket/TicketBuy2";
import TicketBuy3 from "./Ticket/TicketBuy3";
import TicketBuy4 from "./Ticket/TicketBuy4";
import TicketBuy5 from "./Ticket/TicketBuy5";
import TicketBuy6 from "./Ticket/TicketBuy6";
import F1 from "./Ticket/FloorF1";
import F2 from "./Ticket/FloorF2";
import F3 from "./Ticket/FloorF3";
import F4 from "./Ticket/FloorF4";
import Login from "./member/Login";
import Join from "./member/Join";
import List from "./Ticket/List";
import Member from "./member/Member";
import MyTick from "./member/MyTick";
import TkRead from "./member/TkRead";
import Contact from "./member/Contact";
import ContactRead from "./member/ContactRead";
import MyContact from "./member/MyContact";
import OftenContact from "./member/OftenContact";
import Admin from "./admin/Admin";
import AdminMember from "./admin/AdminMember";
import AdminMember1 from "./admin/AdminMember1";
import AdminContact from "./admin/AdminContact";
import AdminContact2 from "./admin/AdminContact2";
import AdminInven from "./admin/AdminInven";
import AdminInven2 from "./admin/AdminInven2";
import AdminInven3 from "./admin/AdminInven3";
import TicketCardPg from "./Ticket/TicketCardPg";
import MemberWithdraw from "./member/MemberWithdraw";
import AdminOrders from "./admin/AdminOrders";
import AdminOrdersDetail from "./admin/AdminOrdersDetail";

// accessToken이 없으면 alert을 띄우고 메인으로 강제 이동
// 비회원이 직링 이용시 마이페이지에 접속 가능한 문제 해결
function RequireAuth({ children }) {
	const token = localStorage.getItem("accessToken");

	if (!token) {
		alert("로그인이 필요한 서비스입니다.");
		return <Navigate to="/" replace />;
	}

	return children;
}

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>

					<Route
						path="/"
						element={  // 메인 화면 구현
							<>
								<Header />
								<section className="txt-banner">
									<Banner />
								</section>
								<section className="banner-section">
									<Banner2 />
								</section>

								<TopTk />



								<section className="banner-section">
									<BestReview />
								</section>
								<Bottom />
								<Footer />
							</>
						}
					/>



					<Route
						path="/Ticket/:id"
						element={
							<>
								<Header />
								<TicketRead />
								<Footer />
							</>
						}
					/>

					<Route
						path="/Ticket/Review/:id"
						element={
							<>
								<Header />
								<Review />
								<Footer />
							</>
						}
					/>

					<Route
						path="/member/Login"
						element={
							<>
								<Header />
								<Login />
								<Footer />
							</>
						}
					/>

					<Route
						path="/member/Join"
						element={
							<>
								<Header />
								<Join />
								<Footer />
							</>
						}
					/>



					<Route
						path="/member/Member/:id"
						element={
							<RequireAuth>
								<>
									<Header />
									<Member />
									<Footer />
								</>
							</RequireAuth>
						}
					/>


					<Route
						path="/member/MyTick"
						element={
							<RequireAuth>
								<>
									<Header />
									<MyTick />
									<Footer />
								</>
							</RequireAuth>
						}
					/>

					<Route
						path="/Ticket/List"
						element={
							<>
								<Header />
								<List />
								<Footer />
							</>
						}
					/>
					<Route
						path="/member/ticket/:orderId"
						element={
							<>
								<Header />
								<TkRead />
								<Footer />
							</>
						}
					/>

					<Route
						path="/member/Contact"
						element={
							<>
								<Header />
								<Contact />
								<Footer />
							</>
						}
					/>

					<Route
						path="/member/ContactRead/:boardId"
						element={
							<>
								<Header />
								<ContactRead />
								<Footer />
							</>
						}
					/>

					<Route
						path="/member/MyContact"
						element={
							<RequireAuth>
								<>
									<Header />
									<MyContact />
									<Footer />
								</>
							</RequireAuth>
						}
					/>


					<Route
						path="/member/OftenContact"
						element={
							<RequireAuth>
								<>
									<Header />
									<OftenContact />
									<Footer />
								</>
							</RequireAuth>
						}
					/>


					<Route
						path="/admin/Admin"
						element={
							<>
								<Header />
								<Admin />
								<Footer />
							</>
						}
					/>

					<Route
						path="/admin/AdminMember"
						element={
							<>
								<Header />
								<AdminMember />
								<Footer />
							</>
						}
					/>

					<Route
						path="/admin/AdminMember1/:memberId"
						element={
							<>
								<Header />
								<AdminMember1 />
								<Footer />
							</>
						}
					/>

					<Route
						path="/admin/AdminContact/:boardId"
						element={
							<>
								<Header />
								<AdminContact />
								<Footer />
							</>
						}
					/>

					<Route
						path="/admin/AdminContact2"
						element={
							<>
								<Header />
								<AdminContact2 />
								<Footer />
							</>
						}
					/>

					<Route
						path="/admin/AdminInven"
						element={
							<>
								<Header />
								<AdminInven />
								<Footer />
							</>
						}
					/>

					<Route
						path="/admin/AdminInven2"
						element={
							<>
								<Header />
								<AdminInven2 />
								<Footer />
							</>
						}
					/>

					<Route
						path="/admin/AdminInven3/:ticketId"
						element={
							<>
								<Header />
								<AdminInven3 />
								<Footer />
							</>
						}
					/>

					<Route path="/member/Withdraw" element={<MemberWithdraw />} />

					{/* 관리자: 주문 목록 */}
					<Route
						path="/admin/AdminOrders"
						element={
							<>
								<Header />
								<AdminOrders />
								<Footer />
							</>
						}
					/>

					{/* 관리자: 주문 상세 */}
					<Route
						path="/admin/AdminOrders/:ordersId"
						element={
							<>
								<Header />
								<AdminOrdersDetail />
								<Footer />
							</>
						}
					/>

					          // 티켓 페이지 (헤더랑 푸터 없는 화면)
					<Route path="/Ticket/Buy/:id" element={<TicketBuy />} />
					<Route path="/Ticket/Buy2/:id" element={<TicketBuy2 />} />
					<Route path="/Ticket/Buy3/:id" element={<TicketBuy3 />} />
					<Route path="/Ticket/Buy4/:id" element={<TicketBuy4 />} />
					<Route path="/Ticket/Buy5/:id" element={<TicketBuy5 />} />
					<Route path="/Ticket/Buy6/:id" element={<TicketBuy6 />} />

					{/* 좌석 구역별 페이지 */}
					<Route path="/Floor/F1/:id" element={<F1 />} />
					<Route path="/Floor/F2/:id" element={<F2 />} />
					<Route path="/Floor/F3/:id" element={<F3 />} />
					<Route path="/Floor/F4/:id" element={<F4 />} />

					{/* 가상 카드 PG 풀스크린 페이지 */}
					<Route path="/Ticket/CardPG/:id" element={<TicketCardPg />} />


				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;