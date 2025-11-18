import React, { useState } from "react";
import "../css/style.css";
import Cons from "../images/cons.png";
import ConsRead from "../images/Consread.png";
import Girl from "../images/girl.png";
import Boy from "../images/boy.png";

export default function Review() {
    const [selectedDate, setSelectedDate] = useState(null);

    const schedule = {
        "2025-12-05": [{ round: "1회", time: "14:00" }],
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className="read-top">
            <div className="read-page">
                
                <div className="read-content">
                    
                    <div className="read-main">
                        <section className="read-right">
                            <h2>2025 투모로우바이투게더 단독 콘서트〈#: 유화〉</h2>
                            <h3>콘서트 주간 1위</h3>

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
                                            <tr><th>가격</th><td>전체 가격 보기 ▶</td></tr>
                                            <tr><th></th><td>R 석 143,000 원</td></tr>
                                            <tr><th></th><td>S 석 132,000 원</td></tr>
                                            <tr><th>혜택</th><td>무이자할부 ▶</td></tr>
                                            <tr><th></th><td>위버스 멤버십 가입자 10 % 할인 받기</td></tr>
                                            <tr><th></th><td>웨이크원 멤버십 가입자 15 % 할인 받기</td></tr>
                                            <tr><th>프로모션</th><td>일 선착순 200 명 5만 원 결제시 5천 원 할인</td></tr>
                                            <tr><th></th><td>2026 년 01 월 15 일에 배송되는 상품입니다.</td></tr>
                                            <tr><th>배송</th><td>일괄배송일: 10 월 30 일 (목)~ 31 일 (금), 2 일간</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="read-particular">
                                <div className="button-class">
                                    <button className="read-button1" onClick={() => window.location.href = "../Ticket/Read"}>공연정보</button>
                                    <button className="read-button1">판매정보</button>
                                    <button className="read-button2" onClick={() => window.location.href = "/Ticket/Review"}>공연후기</button>
                                    <button className="read-button1">기대평</button>
                                    <button className="read-button1">QNA</button>
                                </div>
                            </div><br/><br/><br/>

				<div className="review-tol">
                           <div className="review-box">
						   <p className="review-box-text">게시판 운영 규정에 어긋난다고 판단되는 게시글은 사전 통보없이 블라인드 처리될 수 있습니다.
						   특히 티켓 매매 및 양도의 글은 발견 즉시 임의 삭제되며 전화번호, 
						   이메일 등의 개인정보는 악용될 우려가 있으므로 게시를 삼가 주시기 바랍니다.
						   사전 경고에도 불구하고 불량 게시물을 계속적으로 게재한 게시자의 경우 NOL 티켓 게시판 작성 권한이 제한됩니다.</p>
						   </div><br/>
						   
						   <div className="review-quantity">
						   <span className="review-quantity-txt1">총</span>
						   <span className="review-quantity-txt2"> 1,039 </span>
						   <span className="review-quantity-txt1"> 개의 리뷰가 작성되었습니다 </span>
						   </div><br/><br/><br/>
						   
						   <div className="review-list-box">
						   <p className="review-list-star">★★★★★</p>
						   <p className="review-list-title">투바투 안 보고 인생 어떻게 살아요</p>
						   <p className="review-list-detail">진심 비주얼에 죽고 무대에 죽고 나는 죽었슨</p>
						   </div><br/>
						   
						   <div className="review-list-box">
						   <p className="review-list-star">★★★★★</p>
						   <p className="review-list-title">투바투 비주얼 아자쓰!!</p>
						   <p className="review-list-detail">제가 지금까지 본 남자 중 제일 잘생김</p>
						   </div><br/>
						   
						   <div className="review-list-box">
						   <p className="review-list-star">★★★★★</p>
						   <p className="review-list-title">무대가 진짜 미쳤어요 ㄷㄷ</p>
						   <p className="review-list-detail">아아아아아악!!!!!!!!!!!!!!!!!!!!!!!!!! 투바투와 이제 한몸이 되었음 투바투를 까는 것은 나를 까는 것으로 간주한다</p>
						   </div><br/>
						   
						   <div className="review-list-box">
						   <p className="review-list-star">★★★★★</p>
						   <p className="review-list-title">투바투 사랑하고 투바투 정말 사랑하고</p>
						   <p className="review-list-detail">지금 기분으로는 골든벨 백만 원도 가능할 것 같아요</p>
						   </div><br/>
						   
						   <div className="review-list-box">
						   <p className="review-list-star">★★★★★</p>
						   <p className="review-list-title">연준아 사랑해!!!!!!!!!!!!!!!!</p>
						   <p className="review-list-detail">최연준 나랑 결혼해!!!!!!!!!</p>
						   </div><br/>
						   </div>
                        </section>
						
                    </div>

                    <div className="reservation-setting">
                        <div className="reservation">
                            <div className="calendar-section">
                                <h2>날짜 선택</h2>
                                <div className="calendar">
                                    {Array.from({ length: 31 }, (_, i) => {
                                        const day = i + 1;
                                        const dateStr = `2025-12-${day.toString().padStart(2, "0")}`;
                                        const isSelected = selectedDate === dateStr;
                                        return (
                                            <button
                                                key={day}
                                                className={`calendar-day ${isSelected ? "selected" : ""}`}
                                                onClick={() => handleDateClick(dateStr)}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className={`schedule ${selectedDate && schedule[selectedDate] ? "show-note" : ""}`}>
                                    {schedule[selectedDate]?.map((item, idx) => (
                                        <div key={idx} className="round">
                                            <span className="round-num">{item.round}</span>&nbsp;
                                            <span className="round-time">{item.time}</span>
                                        </div>
                                    ))}<br/>
                                    <p className="note">잔여석 안내 서비스를 제공하지 않습니다.</p>
                                </div>
                            </div>

							<button
							  className="reserve-btn"
							  onClick={() => window.open("/Ticket/Buy2", "TicketBuy2", "width=1460, height=1024, scrollbars=yes")}
							>예매하기</button>
                            <p className="bottom-note">
                                위버스 멤버십 가입자 10% 적립 &gt; <br />
                                <span>이 공연이 궁금하다면</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
