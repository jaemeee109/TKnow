import React from "react";
import "../css/style.css"
import Wish from "../images/wish.png";
import Bh from "../images/bh.png";
import Riize from "../images/riize.png";
import Txt from "../images/txt.png";
import RePropile from "../images/re_propile.png";



export default function BestReview() {
  return (
 <div className="best-re">
	<div className="best-review-text">베스트 관람 후기</div><br/><br/>
		<div className="best-review-setting">
			<div className="best-review-list">
			  <div className="best-review">
			    <div className="review-text">
			      <p className="review-title">위즈니와 함께 하는 ‘WISH U’</p>
			      <strong>이거를 안 본다? 사람이라면 봄</strong>
			      <p>
			        사람이라면 이 무대 봐야 합니다 감격에 눈물을 흘리고 개쩌는 우리 애들로 하루를 보낼 수 있습니다 (ㅜㅜ)
			        세상에서 제일 행복한 하루였습니다 생일? 그런 거 없어도 됩니다.
			        인생은 두 개로 나뉨;; 위시를 보기 전과 보기 후로 내 인생은 달라졌다.
			      </p>
			      <div className="review-profile">
			        <img src={RePropile} alt="프로필" />
			        <span>이상한ㅇㅅㅇ</span>
			        <span className="review-score">★★★★★</span>
					<span className="review-score-1">10.0</span>
			      </div>
			    </div>
			    <img src={Wish} className="review-img" alt="위시_리뷰" />
			  </div>
			</div>
			
			<div className="best-review-list">
			  <div className="best-review">
			    <div className="review-text">
			      <p className="review-title">위즈니와 함께 하는 ‘WISH U’</p>
			      <strong>이거를 안 본다? 사람이라면 봄</strong>
			      <p>
			        사람이라면 이 무대 봐야 합니다 감격에 눈물을 흘리고 개쩌는 우리 애들로 하루를 보낼 수 있습니다 (ㅜㅜ)
			        세상에서 제일 행복한 하루였습니다 생일? 그런 거 없어도 됩니다.
			        인생은 두 개로 나뉨;; 위시를 보기 전과 보기 후로 내 인생은 달라졌다.
			      </p>
			      <div className="review-profile">
			        <img src={RePropile} alt="프로필" />
			        <span>이상한ㅇㅅㅇ</span>
			        <span className="review-score">★★★★★</span>
					<span className="review-score-1">10.0</span>
			      </div>
			    </div>
			    <img src={Bh} className="review-img" alt="백현_리뷰" />
			  </div>
			</div>
			
			<div className="best-review-list">
			  <div className="best-review">
			    <div className="review-text">
			      <p className="review-title">위즈니와 함께 하는 ‘WISH U’</p>
			      <strong>이거를 안 본다? 사람이라면 봄</strong>
			      <p>
			        사람이라면 이 무대 봐야 합니다 감격에 눈물을 흘리고 개쩌는 우리 애들로 하루를 보낼 수 있습니다 (ㅜㅜ)
			        세상에서 제일 행복한 하루였습니다 생일? 그런 거 없어도 됩니다.
			        인생은 두 개로 나뉨;; 위시를 보기 전과 보기 후로 내 인생은 달라졌다.
			      </p>
			      <div className="review-profile">
			        <img src={RePropile} alt="프로필" />
			        <span>이상한ㅇㅅㅇ</span>
			        <span className="review-score">★★★★★</span>
					<span className="review-score-1">10.0</span>
			      </div>
			    </div>
			    <img src={Riize} className="review-img" alt="라이즈_리뷰" />
			  </div>
			</div>
			
			<div className="best-review-list">
			  <div className="best-review">
			    <div className="review-text">
			      <p className="review-title">위즈니와 함께 하는 ‘WISH U’</p>
			      <strong>이거를 안 본다? 사람이라면 봄</strong>
			      <p>
			        사람이라면 이 무대 봐야 합니다 감격에 눈물을 흘리고 개쩌는 우리 애들로 하루를 보낼 수 있습니다 (ㅜㅜ)
			        세상에서 제일 행복한 하루였습니다 생일? 그런 거 없어도 됩니다.
			        인생은 두 개로 나뉨;; 위시를 보기 전과 보기 후로 내 인생은 달라졌다.
			      </p>
			      <div className="review-profile">
			        <img src={RePropile} alt="프로필" />
			        <span>이상한ㅇㅅㅇ</span>
			        <span className="review-score">★★★★★</span>
					<span className="review-score-1">10.0</span>
			      </div>
			    </div>
		
			    <img src={Txt} className="review-img" alt="투바투_리뷰" />
			  </div>
			</div>
		</div>
 </div>
  );
}