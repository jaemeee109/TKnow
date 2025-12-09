// src/Ticket/TicketBuy4.jsx
import React, { useState, useEffect } from "react";
import "../css/ticket.css";
import "../css/style.css";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Cons from "../images/cons.png";
import api from "../api";

// ===== 이미지 URL 처리용 공통 함수 =====
const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

const resolveImageUrl = (path) => {
  if (!path) return Cons;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${BASE_URL}${path}`;
  return `${BASE_URL}/${path}`;
};

export default function TicketBuy4() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // Buy3에서 넘어온 정보
  const {
    selectedSeat,
    normalCount,
    discount1Count,
    discount2Count,
    discount3Count,
    totalPrice, // 티켓금액 + 수수료
    ticketAmount, // 티켓 금액(좌석 합계)
    basePrice,
    serviceFee,
    deliveryFee,
    discountPrice,
    totalSeatCount,
    ticketDate, // 문자열 (예: "2025.11.11. 오전 11:00")
    ticketVenue,
    ticketTitle,
    ticketImage,
    cancelDate, // 문자열(YYYY.MM.DD)
    concertStartDate,
    concertEndDate,
    seatGrade,
  } = location.state || {};

  // 배송 방식
  const [deliveryMethod, setDeliveryMethod] = useState("현장");

  // 예매자 정보
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("❌ accessToken 없음");
      return;
    }

    const parts = token.split(".");
    if (parts.length < 2) {
      console.error("❌ JWT 구조 이상:", parts);
      return;
    }

    let payloadData;
    try {
      payloadData = JSON.parse(atob(parts[1]));
    } catch (e) {
      console.error("❌ JWT 파싱 실패:", e);
      return;
    }

    console.log("JWT payload:", payloadData);

    // ⭐ 백엔드 JWTTokenProvider의 setSubject(memberId)
    //    → payload.sub = memberId
    const memberId = payloadData.sub;

    api
      .get(`/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setUserData(data);

        // 자동입력 세팅
        setName(data.memberName);
        setEmail(data.memberEmail);

        const phoneParts = data.phone?.split("-") || [];
        setPhone1(phoneParts[0] || "");
        setPhone2(phoneParts[1] || "");
        setPhone3(phoneParts[2] || "");
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleNext = () => {
    if (!birthdate || birthdate.length !== 6) {
      alert("생년월일을 정확히 입력해주세요 (6자리)");
      return;
    }
    if (!phone1 || !phone2 || !phone3) {
      alert("연락처를 입력해주세요");
      return;
    }
    if (!email) {
      alert("이메일을 입력해주세요");
      return;
    }

    navigate(`/Ticket/Buy5/${id}`, {
      state: {
        // Buy3 → Buy4로 받은 모든 값들
        selectedSeat,
        normalCount,
        discount1Count,
        discount2Count,
        discount3Count,
        totalPrice,
        ticketAmount,
        basePrice,
        serviceFee,
        deliveryFee,
        discountPrice,
        totalSeatCount,
        ticketDate,
        ticketVenue,
        ticketTitle,
        ticketImage,
        cancelDate,
        concertStartDate,
        concertEndDate,
        seatGrade,

        // Buy4에서 새로 입력한 값들
        deliveryMethod,
        name,
        birthdate,
        phone: `${phone1}-${phone2}-${phone3}`,
        email,
      },
    });
  };

  return (
    <div className="ticket-buy-main">
      <div className="ticket-buy-page">
        <div className="ticket-buy-top">
          <button className="ticket-buy-button2">
            01&nbsp;
            <span className="ticket-buy-button-text1">날짜 선택</span>
          </button>

          <button className="ticket-buy-button2">
            02&nbsp;
            <span className="ticket-buy-button-text1">좌석 선택</span>
          </button>

          <button className="ticket-buy-button2">
            03&nbsp;
            <span className="ticket-buy-button-text1">가격 선택</span>
          </button>

          <button className="ticket-buy-button1">
            04&nbsp;
            <span className="ticket-buy-button-text1">배송 선택</span>
          </button>

          <button className="ticket-buy-button2">
            05&nbsp;
            <span className="ticket-buy-button-text1">결제하기</span>
          </button>
        </div>
        <br />

        <div className="ticket-buy-middle">
          <div className="ticket-buy-middle-box">
            <div className="ticket-buy-middle-box1">
              <div className="ticket-buy4-box2">
                <strong>티켓 수령 확인</strong>
                <br />
                <br />
                <label className="custom-radio">
                  <input
                    type="radio"
                    name="delivery"
                    value="현장"
                    checked={deliveryMethod === "현장"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  <span>현장 수령</span>
                </label>
                <br />
                <br />

                <label className="custom-radio">
                  <input
                    type="radio"
                    name="delivery"
                    value="모바일"
                    checked={deliveryMethod === "모바일"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  <span>모바일 티켓</span>
                </label>
                <br />
                <br />
                {/* 선택한 수령 방식에 따라 안내 문구 변경 */}
                <p style={{ fontSize: "16px", color: "#85292B" }}>
                  {deliveryMethod === "현장"
                    ? "현장 수령을 선택하셨습니다. 공연 당일 현장 매표소에서 본인 확인 후 티켓을 수령하실 수 있습니다."
                    : "모바일 티켓을 선택하셨습니다. 예매 완료 후 등록된 휴대전화 번호와 이메일로 모바일 티켓 정보가 전송됩니다."}
                </p>
                <p style={{ fontSize: "15px", color: "#808080" }}>
                  {deliveryMethod === "현장"
                    ? "신분증과 예매 내역을 반드시 지참해 주세요. 타인 양도 및 대리 수령은 제한될 수 있습니다."
                    : "공연장 입장 시 모바일 화면을 제시해 주세요. 스크린샷 캡처 화면은 사용이 제한될 수 있습니다."}
                </p>
              </div>

              <div className="ticket-buy4-box3">
                <strong>예매자 정보</strong>
                <br />
                <br />
                <div className="ticket-buy4-box4">
                  <strong>이름</strong>&nbsp;&nbsp;&nbsp;
                  <span>{name}</span>
                  <br />
                  <br />
                  <strong>생년월일</strong>&nbsp;&nbsp;&nbsp;
                  <input
                    className="ticket-buy4-box5"
                    type="text"
                    maxLength="6"
                    value={birthdate}
                    onChange={(e) =>
                      setBirthdate(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="070919"
                  />
                  <span>&nbsp;&nbsp;&nbsp;예) 070919 (YYMMDD)</span>
                  <br />
                  <br />
                  <p style={{ fontSize: "15px", color: "#808080" }}>
                    생년월일을 정확하게 입력해 주세요. 가입시 입력하신 정보와
                    다를 경우, 본인확인이 되지 않아 예매가 불가합니다.
                  </p>
                  <br />
                  <br />
                  <strong>연락처</strong>&nbsp;&nbsp;&nbsp;
                  <input
                    className="ticket-buy4-box6"
                    type="text"
                    maxLength="3"
                    value={phone1}
                    onChange={(e) =>
                      setPhone1(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  <span> - </span>
                  <input
                    className="ticket-buy4-box6"
                    type="text"
                    maxLength="4"
                    value={phone2}
                    onChange={(e) =>
                      setPhone2(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  <span> - </span>
                  <input
                    className="ticket-buy4-box6"
                    type="text"
                    maxLength="4"
                    value={phone3}
                    onChange={(e) =>
                      setPhone3(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  <br />
                  <br />
                  <strong>이메일</strong>&nbsp;&nbsp;&nbsp;
                  <input
                    className="ticket-buy4-box7"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                  />
                  <br />
                  <p className="ticket-buy4-text1">
                    SMS 문자와 이메일로 예매 정보를 보내드립니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="ticket-set-setting2">
            <div className="ticket-set-setting">
              <div className="read-set">
                <div className="cons-img">
                  <img
                    src={resolveImageUrl(ticketImage)}
                    alt={ticketTitle || "콘서트_썸네일"}
                  />
                </div>

                <div className="read-table">
                  <table>
                    <tbody>
                      <tr>
                        <th>공연명</th>
                        <td>{ticketTitle}</td>
                      </tr>
                      <tr>
                        <th>장소</th>
                        <td>{ticketVenue}</td>
                      </tr>
                      <tr>
                        <th>날짜</th>
                        <td>
                          {concertStartDate && concertEndDate
                            ? `${concertStartDate} ~ ${concertEndDate}`
                            : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <table className="ticket-buy-table2">
                <tbody>
                  <strong className="ticket-buy-my">My 예매 정보 </strong>
                  <tr>
                    <th>일시</th>
                    <td>{ticketDate || "-"}</td>
                  </tr>
                  <tr>
                    <th>선택 좌석</th>
                    <td>
                      {selectedSeat
                        ? `${seatGrade || ""}석 ${
                            selectedSeat.zoneName ||
                            selectedSeat.zone ||
                            "F2"
                          } 구역 - ${selectedSeat.row || "?"}열 - ${
                            selectedSeat.number || selectedSeat.no || "?"
                          }번`
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>티켓 금액</th>
                    <td>
                      {ticketAmount
                        ? ticketAmount.toLocaleString()
                        : "0"}{" "}
                      원
                    </td>
                  </tr>
                  <tr>
                    <th>수수료</th>
                    <td>
                      {serviceFee ? serviceFee.toLocaleString() : "0"} 원
                    </td>
                  </tr>
                  {/* 배송료 행 삭제 (요구사항) */}
                  <tr>
                    <th>할인</th>
                    <td>0 원</td>
                  </tr>
                  <tr>
                    <th>취소기한</th>
                    <td>{cancelDate ? `${cancelDate}까지` : "-"}</td>
                  </tr>
                  <tr>
                    <th>취소수수료</th>
                    <td>티켓 금액의 0 ~ 50 %</td>
                  </tr>
                </tbody>
              </table>

              <div className="ticket-buy-total">
                <span>총 결제 금액</span>
                <strong>
                  {totalPrice ? totalPrice.toLocaleString() : "0"}
                </strong>
                <p>원</p>
              </div>
            </div>


            <div className="ticket-stage-button2">
              <Link to={`/Ticket/Buy3/${id}`} className="ticket-stage-back">
                이전 단계
              </Link>
              <button onClick={handleNext} className="ticket-stage-next3">
                다음 단계
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
