import React from "react";
import "../css/style.css"
import bannerImg1 from "../images/banner1.png"; 
import bannerImg2 from "../images/banner2.png"; 
import bannerImg3 from "../images/banner3.png"; 
import bannerImg4 from "../images/banner4.png"; 


export default function Banner2 () {
  return (
	<div className="banner">
      <img src={bannerImg1} alt="홍보배너1" />
	  <img src={bannerImg2} alt="홍보배너2" />
	  <img src={bannerImg3} alt="홍보배너3" />
	  <img src={bannerImg4} alt="홍보배너4" />
      </div>
  );
}