import React from "react";
import "../css/style.css"


export default function Header() {
  return (
	<footer className="footer">
	  <div className="footer-top">
	    <ul>
	      <li>회사소개</li><span>｜</span>
	      <li>이용약관</li><span>｜</span>
	      <li>개인정보처리방침</li><span>｜</span>
	      <li>위치기반서비스이용약관</li><span>｜</span>
	      <li>여행약관</li><span>｜</span>
	      <li>이용자보험가입내역</li><span>｜</span>
	      <li>티켓판매안내</li><span>｜</span>
	      <li>공지사항</li><span>｜</span>
	      <li>고객센터</li><span>｜</span>
	      <li>Language</li>
	    </ul>
	  </div>

	  <div className="footer-content">
	    <div className="footer-col">
	      <h4>(주) 티켓나우</h4>
	      <p style={{with: "500px"}}>
	        주소 경기도 수원시 팔달구 덕영대로 899 세진빌딩3층 <br />
	        사업자등록번호 123-45-67890 <br />
	        통신판매업신고 2025-경기수원-0123 <br />
	        호스팅서비스제공자 (주)티켓나우 | 대표이사 정상현
	      </p>
	    </div>

	    <div className="footer-col">
	      <h4>고객센터</h4>
	      <p style={{with: "500px"}}>
	        티켓 1544-1234 <br />
	        팩스 02-123-4567 <br />
	        이메일 nowhelp@now-ticket.com <br />
	        <a href="#" className="footer-link">티켓 1:1 문의</a>
	      </p>
	    </div>

	    <div className="footer-col">
	      <h4>전자금융거래 분쟁처리 담당정보</h4>
	      <p style={{with: "500px"}}>
	        투어 1588-1234 | 티켓 1544-1234 <br />
	        팩스 02-123-4567 <br />
	        이메일 nowhelp@now-ticket.com <br />
	        개인정보보호책임자 tkmow_m@now-ticket.com
	      </p>
	    </div>
	  </div>
	</footer>
  );
}