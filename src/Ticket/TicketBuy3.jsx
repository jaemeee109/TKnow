// src/Ticket/TicketBuy3.jsx
import React, { useEffect, useState } from "react";
import "../css/ticket.css";
import "../css/style.css";
import api from "../api";
import { Link, useParams, useLocation } from "react-router-dom";
import Cons from "../images/cons.png";

// ===== 이미지 URL 처리용 공통 함수 =====
const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

const resolveImageUrl = (path) => {
  if (!path) return Cons;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${BASE_URL}${path}`;
  return `${BASE_URL}/${path}`;
};

// TicketBuy3.jsx 내에 있는 formatDateOnly 를 아래 코드로 전체 교체해 주세요.
const formatDateOnly = (value) => {
  if (!value) return "-";

  let dateObj;

  // 1) [YYYY, MM, DD, ...] 형태 (백엔드 LocalDate / LocalDateTime 배열)
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d] = value;
    if (!y || !m || !d) return "-";
    dateObj = new Date(y, m - 1, d);
  }
  // 2) 문자열 ("YYYY.MM.DD" / "YYYY-MM-DD")
  else if (typeof value === "string") {
    if (value.includes(".")) {
      // "YYYY.MM.DD" 형태
      const [y, m, d] = value.split(".").map((v) => parseInt(v, 10));
      dateObj = new Date(y, m - 1, d);
    } else if (value.includes("-")) {
      // "YYYY-MM-DD" 형태
      const [y, m, d] = value.split("-").map((v) => parseInt(v, 10));
      dateObj = new Date(y, m - 1, d);
    } else {
      // 지원하지 않는 문자열 형식은 그대로 사용
      return value;
    }
  }
  // 3) Date 객체
  else if (value instanceof Date) {
    dateObj = value;
  }
  // 그 외 타입은 사용하지 않음
  else {
    return "-";
  }

  if (isNaN(dateObj.getTime())) return "-";

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  // Read.jsx 의 formatDate 와 동일한 포맷: YYYY.MM.DD
  return `${year}.${month}.${day}`;
};

// "일시" 표시용 (문자열이면 그대로, Date면 YYYY.MM.DD. HH:MM)
const formatDateTimeText = (value) => {
  if (!value) return "-";

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    const hh = String(value.getHours()).padStart(2, "0");
    const mm = String(value.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${d}. ${hh}:${mm}`;
  }

  return String(value);
};

// "2025.11.11. 오전 11:00" 같은 문자열에서 날짜(년/월/일)만 뽑아서 Date로 변환
const parseYmdFromText = (text) => {
  if (!text) return null;

  // 이미 Date 객체인 경우 (Buy2에서 Date 그대로 넘긴 상황 대비)
  if (text instanceof Date) {
    return new Date(text.getFullYear(), text.getMonth(), text.getDate());
  }

  if (typeof text === "string") {
    const match = text.match(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/);
    if (!match) return null;
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);
    return new Date(y, m - 1, d);
  }

  return null;
};

export default function TicketBuy() {
  const { id } = useParams();
  const location = useLocation();
  const [ticketData, setTicketData] = useState(null);

  // Buy2에서 넘어온 정보
  const selectedSeat = location.state?.selectedSeat;
  const selectedDate = location.state?.selectedDate; // Date 또는 "2025.11.11. 오전 11:00"
  const selectedRoundNo = location.state?.selectedRoundNo;
  const ticketDate = location.state?.ticketDate; // ★ 1단계에서 만든 "YYYY년 MM월 DD일 HH:MM" 문자열

  // 선택한 티켓 수량
  const [normalCount, setNormalCount] = useState(0);
  const [discount1Count, setDiscount1Count] = useState(0);
  const [discount2Count, setDiscount2Count] = useState(0);
  const [discount3Count, setDiscount3Count] = useState(0);

  useEffect(() => {
    api
      .get(`/tickets/${id}`)
      .then((res) => {
        setTicketData(res.data);
        if (selectedSeat) setNormalCount(1); // 좌석 선택되어 있으면 기본 1매
      })
      .catch((err) => console.error(err));
  }, [id, selectedSeat]);

  // 총 선택 좌석 수
  const totalSeatCount =
    normalCount + discount1Count + discount2Count + discount3Count;

  // 공연 기간(1회차 시작일 ~ 마지막 회차 날짜)
  const concertStartDate = formatDateOnly(ticketData?.startAt);
  const concertEndDate = formatDateOnly(ticketData?.endAt);

  // ★ 선택 회차 일시 → 1단계에서 만들어둔 ticketDate 문자열을 우선 사용
  const selectedDateTimeText = ticketDate || formatDateTimeText(selectedDate);

  // ★ 취소기한: 선택한 날짜의 1일 전까지 (시간 표시 X)
  //    ticketDate(문자열)이 있으면 거기서 날짜를 파싱해서 사용
  let cancelDeadlineText = "-";
  const baseDate = parseYmdFromText(ticketDate || selectedDate);
  if (baseDate) {
    baseDate.setDate(baseDate.getDate() - 1);
    cancelDeadlineText = formatDateOnly(baseDate);
  }

  // ===== 좌석 등급/가격 계산 (S석 기준가 → R석 10% 할인) =====
  // AdminInven2 에서 입력한 ticketData?.price 를 S석 기준가로 사용
  const sPrice = ticketData?.price || 100_000; // S석 기준가
  const rPrice = Math.floor(sPrice * 0.9); // R석 = S석보다 10% 저렴

  // 선택된 좌석 등급 파싱 (문자열/객체 모두 대응)
  let seatGrade = "R";
  if (selectedSeat) {
    if (typeof selectedSeat === "string") {
      // 예: "R석 F2구역 B열 12번"
      const gradeText = selectedSeat.split(" ")[0] || ""; // "R석", "S석"
      seatGrade = gradeText.includes("S") ? "S" : "R";
    } else if (typeof selectedSeat === "object" && selectedSeat.grade) {
      // 객체에 grade 필드가 있는 경우
      seatGrade = selectedSeat.grade; // "S" 또는 "R"
    }
  }

  // 실제 적용할 기본 좌석 가격 (S 또는 R)
  const baseSeatPrice = seatGrade === "S" ? sPrice : rPrice;

  // 가격 계산
  const discountPrice = Math.floor(baseSeatPrice * 0.8); // 할인가는 기본가의 80%

  // 티켓 금액(좌석 금액 합)
  const ticketAmount =
    normalCount * baseSeatPrice +
    discount1Count * discountPrice +
    discount2Count * discountPrice +
    discount3Count * discountPrice;

  // 수수료: 2,000원 고정 (좌석을 하나 이상 선택했을 때만)
  const serviceFee = totalSeatCount > 0 ? 2000 : 0;

  // 배송료는 사용하지 않음(0 고정, 화면에서도 표시 X)
  const deliveryFee = 0;

  // 합계(총 결제 금액 = 티켓 금액 + 수수료)
  const totalPrice = ticketAmount + serviceFee;

  const isAnySelected = totalSeatCount > 0;

  const renderOptions = (max = 1) => {
    let options = [];
    for (let i = 0; i <= max; i++) {
      options.push(
        <option key={i} value={i}>
          {i} 매
        </option>
      );
    }
    return options;
  };

  return (
    <div className="ticket-buy-main">
      <div className="ticket-buy-page">
        {/* 상단 단계 버튼 */}
        <div className="ticket-buy-top">
          <button className="ticket-buy-button2">
            01&nbsp;<span className="ticket-buy-button-text1">날짜 선택</span>
          </button>
          <button className="ticket-buy-button2">
            02&nbsp;<span className="ticket-buy-button-text1">좌석 선택</span>
          </button>
          <button className="ticket-buy-button1">
            03&nbsp;<span className="ticket-buy-button-text1">가격 선택</span>
          </button>
          <button className="ticket-buy-button2">
            04&nbsp;<span className="ticket-buy-button-text1">배송 선택</span>
          </button>
          <button className="ticket-buy-button2">
            05&nbsp;<span className="ticket-buy-button-text1">결제하기</span>
          </button>
        </div>
        <br />

        <div className="ticket-buy-middle">
          <div className="ticket-buy-middle-box">
            <div className="ticket-buy3-middle-box1">
              <div className="ticket-buy3-box">
                <p className="ticket-buy3-box2">
                  <strong>{seatGrade} 석</strong> ｜{" "}
                  <strong style={{ color: "#85292B" }}>
                    좌석 {totalSeatCount} 매
                  </strong>{" "}
                  를 선택하였습니다.
                </p>
                <br />

                <table>
                  <thead>
                    <tr>
                      <th>기본가</th>
                      <td>일반</td>
                      <td>{baseSeatPrice.toLocaleString()} 원</td>
                      <td>
                        <select
                          value={normalCount}
                          onChange={(e) =>
                            setNormalCount(Number(e.target.value))
                          }
                          disabled={isAnySelected && normalCount === 0}
                        >
                          {renderOptions()}
                        </select>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>기본 할인</th>
                      <td>장애인 할인 (1~3급/동반1인) 20%</td>
                      <td>{discountPrice.toLocaleString()} 원</td>
                      <td>
                        <select
                          value={discount1Count}
                          onChange={(e) =>
                            setDiscount1Count(Number(e.target.value))
                          }
                          disabled={isAnySelected && discount1Count === 0}
                        >
                          {renderOptions()}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th>기본 할인</th>
                      <td>장애인 할인 (4~6급/본인만) 20%</td>
                      <td>{discountPrice.toLocaleString()} 원</td>
                      <td>
                        <select
                          value={discount2Count}
                          onChange={(e) =>
                            setDiscount2Count(Number(e.target.value))
                          }
                          disabled={isAnySelected && discount2Count === 0}
                        >
                          {renderOptions()}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th>기본 할인</th>
                      <td>국가유공자 (본인만) 20%</td>
                      <td>{discountPrice.toLocaleString()} 원</td>
                      <td>
                        <select
                          value={discount3Count}
                          onChange={(e) =>
                            setDiscount3Count(Number(e.target.value))
                          }
                          disabled={isAnySelected && discount3Count === 0}
                        >
                          {renderOptions()}
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <br />

              <button className="ticket-buy3-cupBtn">나의 쿠폰 모두 보기</button>

              <div className="ticket-buy3-note">
                <strong>쿠폰 </strong> <span> (중복 사용 불가)</span>
                <div className="ticket-buy3-note-text">
                  <br />
                  <p>
                    나우닛 가입시 중복 할인 쿠폰 제공 (단, 새싹 등급 제외)
                    &nbsp;&nbsp;&nbsp;
                    <button className="ticket-buy3-cupPluBtn">쿠폰 받기</button>
                  </p>
                  <br />
                  <p>가격 선택 후 사용 가능한 쿠폰을 조회합니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 공연 정보 */}
          <div className="ticket-set-setting2">
            <div className="ticket-set-setting-1">
              <div className="read-set">
                <div className="cons-img">
                  <img
                    src={resolveImageUrl(ticketData?.mainImageUrl)}
                    alt={ticketData?.title || "콘서트_썸네일"}
                  />
                </div>
                <div className="read-table">
                  <table>
                    <tbody>
                      <tr>
                        <th>공연명</th>
                        <td>{ticketData?.title}</td>
                      </tr>
                      <tr>
                        <th>장소</th>
                        <td>{ticketData?.venueName}</td>
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
                  <strong className="ticket-buy-my-2">My 예매 정보 </strong>

                  <tr>
                    <th>일시</th>
                    <td>{selectedDateTimeText}</td>
                  </tr>
                  <tr>
                    <th>선택 좌석</th>
                    <td>
                      {selectedSeat
                        ? `${seatGrade}석 ${
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
                    <td>{ticketAmount.toLocaleString()} 원</td>
                  </tr>
                  <tr>
                    <th>수수료</th>
                    <td>{serviceFee.toLocaleString()} 원</td>
                  </tr>
                  {/* 배송료 행 삭제 (요구사항) */}
                  <tr>
                    <th>할인</th>
                    <td>0 원</td>
                  </tr>
                  <tr>
                    <th>취소기한</th>
                    <td>
                      {cancelDeadlineText !== "-"
                        ? `${cancelDeadlineText}까지`
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>취소수수료</th>
                    <td>티켓 금액의 0~50%</td>
                  </tr>
                </tbody>
              </table>

              <div className="ticket-buy-total">
                <span>총 결제 금액</span>
                <strong>{totalPrice.toLocaleString()}</strong>
                <p>원</p>
              </div>
            </div>
            <br />

            <div className="ticket-stage-button2">
              <Link to={`/Ticket/Buy2/${id}`} className="ticket-stage-back">
                이전 단계
              </Link>

              <Link
                to={`/Ticket/Buy4/${id}`}
                state={{
                  seatId: selectedSeat?.dbId,
                  selectedSeat,
                  selectedDate,
                  selectedRoundNo,
                  normalCount,
                  discount1Count,
                  discount2Count,
                  discount3Count,
                  totalPrice,
                  ticketAmount,
                  basePrice: baseSeatPrice, // S/R 반영된 기본가
                  serviceFee,
                  deliveryFee,
                  discountPrice,
                  totalSeatCount,
                  // 공연/좌석 정보
                  ticketDate: selectedDateTimeText, // 문자열 형태 (시간까지 포함)
                  ticketVenue: ticketData?.venueName,
                  ticketTitle: ticketData?.title,
                  ticketImage: ticketData?.mainImageUrl || "/images/cons.png",
                  cancelDate: cancelDeadlineText, // 문자열(YYYY.MM.DD)
                  concertStartDate,
                  concertEndDate,
                  seatGrade,
                }}
                className="ticket-stage-next3"
              >
                다음 단계
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
