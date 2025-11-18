import React from "react";
import { AuthProvider } from "./context/AuthContext";
import "./css/style.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import F2 from "./Ticket/FllorF2";
import Login from "./member/Login";
import Join from "./member/Join";
import Member from "./member/Member";
import MyTick from "./member/MyTick";
import TkRead from "./member/TkRead";
import Contact from "./member/Contact";
import MyContact from "./member/MyContact";
import OftenContact from "./member/OftenContact";
import Admin from "./admin/Admin";
import AdminMember from "./admin/AdminMember";
import AdminMember1 from "./admin/AdminMember1";
import AdminContact from "./admin/AdminContact";
import AdminInven from "./admin/AdminInven";
import AdminInven2 from "./admin/AdminInven2";
import AdminInven3 from "./admin/AdminInven3";



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
						path="/Ticket/Review"
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
							<>
								<Header />
								<Member />
								<Footer />
							</>
						}
					/>

					<Route
						path="/member/MyTick"
						element={
							<>

								<Header />
								<MyTick />
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
						path="/member/MyContact"
						element={
							<>
								<Header />
								<MyContact />
								<Footer />
							</>
						}
					/>

					<Route
						path="/member/OftenContact"
						element={
							<>
								<Header />
								<OftenContact />
								<Footer />
							</>
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
						path="/admin/AdminContact"
						element={
							<>
								<Header />
								<AdminContact />
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
						path="/admin/AdminInven3/:id"
						element={
							<>
								<Header />
								<AdminInven3 />
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
					<Route path="/Fllor/F2" element={<F2 />} />


				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;