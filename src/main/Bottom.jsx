// src/main/Bottom.jsx
import React from "react";
import "../css/style.css"
import Bottom1 from "../images/bottom1.png";
import Bottom2 from "../images/bottom2.png";
import Bottom3 from "../images/bottom3.png";
import Bottom4 from "../images/bottom4.png";

export default function Bottom() {
  return (
	<div className="bootom">
	<div className="bottom-banner">
      <img src={Bottom1} alt="하단배너1" />
	  <img src={Bottom2} alt="하단배너2" />
	  <img src={Bottom3} alt="하단배너3" />
	  <img src={Bottom4} alt="하단배너4" />
      </div>
	  <br/><br/><br/><br/>
	  </div>
  );
}