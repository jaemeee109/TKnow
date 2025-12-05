// src/main/Banner.jsx
import React from "react";
import "../css/style.css"
import { Link, useParams } from "react-router-dom";
import bannerImg from "../images/txt_banner.png"; 

export default function Banner() {
	
	const {ticketId} = useParams("");
	
  return (
	
	<div className="txt-banner">
	<Link to={`/Ticket/Read/${ticketId}`}>
	  <img src={bannerImg} alt="메인배너" />
	</Link>
      </div>
  );
}