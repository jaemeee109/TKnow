// src/Ticket/TicketBuy.jsx
import React, { useState, useEffect } from "react";
import "../css/style.css";
import "../css/ticket.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Cons from "../images/cons.png";
import api from "../api";

// 이미지 URL 처리용 (AdminInven2에서 등록한 대표이미지 사용)
const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

const resolveImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${BASE_URL}${path}`;
  return `${BASE_URL}/${path}`;
};

// YYYY.MM.DD 포맷 (LocalDateTime 배열 [년,월,일,시,분,...] 기준)
const formatYmd = (arr) => {
  if (!arr || !Array.isArray(arr) || arr.length < 3) return "";
  const [year, month, day] = arr;
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}.${mm}.${dd}`;
};

export default function TicketBuy() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [seatSummaryList, setSeatSummaryList] = useState([]);

  // ─────────────────────────────────────────────
  // 티켓 상세 + 회차(schedule) + 좌석 요약 로딩
  // ─────────────────────────────────────────────
  useEffect(() => {
    // 1) 티켓 상세 + 회차 정보
    api
      .get(`/tickets/${id}`)
      .then((res) => {
        const data = res.data;

        // 1) 백엔드 schedule → 프론트에서 쓰기 편한 구조로 변환
        let convertedSchedule = [];

        if (
          data.schedule &&
          Array.isArray(data.schedule) &&
          data.schedule.length > 0
        ) {
          convertedSchedule = data.schedule.map((s) => {
            let raw = s.showAt;
            let dt;

            if (Array.isArray(raw) && raw.length >= 3) {
              // [year, month, day, hour, minute, ...] 형태
              dt = new Date(
                raw[0],
                (raw[1] || 1) - 1,
                raw[2] || 1,
                raw[3] || 0,
                raw[4] || 0,
                raw[5] || 0
              );
            } else {
              // ISO 문자열 등
              dt = new Date(raw);
            }

            const year = dt.getFullYear();
            const month = dt.getMonth() + 1;
            const day = dt.getDate();
            const weekdayIndex = dt.getDay();
            const weekdayKor = ["일", "월", "화", "수", "목", "금", "토"][
              weekdayIndex
            ];

            const hour = String(dt.getHours()).padStart(2, "0");
            const minute = String(dt.getMinutes()).padStart(2, "0");
            const time = `${hour}:${minute}`;

            return {
              date: [year, month, day],
              weekday: weekdayKor,
              time,
              status: "예매가능",
              round: `${s.roundNo}회차`,
            };
          });
        }

        // 2) 달력에서 사용할 "예매 가능 날짜(day)" 목록 생성
        let availableDates = [];
        if (convertedSchedule.length > 0) {
          const daySet = new Set();
          convertedSchedule.forEach((s) => {
            const day = s.date[2];
            daySet.add(day);
          });
          availableDates = Array.from(daySet);
        }

        // 3) ticket 상태 세팅 (schedule, availableDates 포함)
        const nextTicket = {
          ...data,
          schedule: convertedSchedule,
          availableDates,
        };
        setTicket(nextTicket);

        // 4) 기본 선택 날짜 (선택 회차 시간까지 포함)
        if (convertedSchedule.length > 0) {
          const first = convertedSchedule[0];

          // first.time 예: "19:00"
          let hour = 0;
          let minute = 0;
          if (first.time) {
            const timeParts = first.time.split(":");
            if (timeParts.length >= 2) {
              const h = parseInt(timeParts[0], 10);
              const m = parseInt(timeParts[1], 10);
              hour = Number.isNaN(h) ? 0 : h;
              minute = Number.isNaN(m) ? 0 : m;
            }
          }

          const firstDate = new Date(
            first.date[0],
            first.date[1] - 1,
            first.date[2],
            hour,
            minute,
            0
          );
          setSelectedDate(firstDate);
        } else if (data?.startAt) {
          // 스케줄이 없으면 기존 startAt 기반으로만 설정
          let startDate;
          if (Array.isArray(data.startAt)) {
            startDate = new Date(
              data.startAt[0],
              (data.startAt[1] || 1) - 1,
              data.startAt[2] || 1,
              data.startAt[3] || 0,
              data.startAt[4] || 0
            );
          } else {
            startDate = new Date(data.startAt);
          }
          setSelectedDate(startDate);
        }

        // 5) 기본 선택 회차 (있다면 첫 회차)
        if (convertedSchedule.length > 0) {
          const first = convertedSchedule[0];
          setSelectedRound(`${first.round} ${first.time}`); // 예: "1회차 19:00"
        }
      })
      .catch((err) => console.error("티켓 정보 로드 실패:", err));

    // 2) 좌석 등급/회차별 잔여석 요약 정보
    api
      .get(`/tickets/${id}/seats/summary`)
      .then((res) => {
        setSeatSummaryList(res.data || []);
      })
      .catch((err) => {
        console.error("좌석 요약 정보 로드 실패:", err);
        setSeatSummaryList([]);
      });
  }, [id]);

  // ─────────────────────────────────────────────
  // 날짜 클릭
  // ─────────────────────────────────────────────
  const handleDateClick = (day) => {
    const isAvailable = ticket?.availableDates
      ? ticket.availableDates.includes(day)
      : true;
    if (!isAvailable) return;

    // 현재 선택된 날짜가 없으면 오늘 기준으로 생성
    if (!selectedDate) {
      const base = new Date();
      const newDate = new Date(base.getFullYear(), base.getMonth(), day);
      setSelectedDate(newDate);
      return;
    }

    // 연/월은 그대로 두고 '일'만 변경, 시간은 유지
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day,
      selectedDate.getHours(),
      selectedDate.getMinutes()
    );
    setSelectedDate(newDate);
  };

  // ─────────────────────────────────────────────
  // 회차 클릭
  // ─────────────────────────────────────────────
  const handleRoundClick = (roundDisplay) => {
    setSelectedRound(roundDisplay);

    if (!ticket || !ticket.schedule || !selectedDate) return;

    // 예: "1회차 19:00" 에서 회차 번호만 추출
    const roundNo = parseInt(roundDisplay, 10);
    if (Number.isNaN(roundNo)) return;

    // 현재 선택된 날짜 + 회차가 같은 스케줄 찾기
    const matched = ticket.schedule.find((s) => {
      const [year, month, day] = s.date;
      const sameDate =
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() + 1 === month &&
        selectedDate.getDate() === day;
      const sRoundNo = parseInt(s.round, 10);
      return sameDate && sRoundNo === roundNo;
    });

    if (!matched || !matched.time) return;

    const timeParts = matched.time.split(":");
    if (timeParts.length < 2) return;

    const h = parseInt(timeParts[0], 10);
    const m = parseInt(timeParts[1], 10);
    const hour = Number.isNaN(h) ? 0 : h;
    const minute = Number.isNaN(m) ? 0 : m;

    // 선택된 날짜 객체에 시간까지 반영
    setSelectedDate((prev) => {
      const base = prev || selectedDate;
      return new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        hour,
        minute,
        0
      );
    });
  };

  if (!ticket) return <div>로딩 중...</div>;

  // ─────────────────────────────────────────────
  // 선택된 날짜에 해당하는 회차 목록 생성
  // ─────────────────────────────────────────────
  const roundsToShow =
    ticket.schedule && selectedDate
      ? ticket.schedule
          .filter((s) => {
            const [year, month, day] = s.date;
            return (
              selectedDate.getFullYear() === year &&
              selectedDate.getMonth() + 1 === month &&
              selectedDate.getDate() === day
            );
          })
          .map((s) => ({
            display: `${s.round} ${s.time}`, // 예: "1회차 19:00"
          }))
      : [];

  // ─────────────────────────────────────────────
  // 선택된 회차/날짜 기반 파생 정보
  // ─────────────────────────────────────────────
  const selectedRoundNo = (() => {
    if (!selectedRound) return null;
    const n = parseInt(selectedRound, 10);
    return Number.isNaN(n) ? null : n;
  })();

  // 선택된 날짜 + 회차에 해당하는 스케줄 찾기
  const selectedSchedule = (() => {
    if (!ticket.schedule || !selectedDate || selectedRoundNo == null) return null;
    return ticket.schedule.find((s) => {
      const [year, month, day] = s.date;
      const sameDate =
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() + 1 === month &&
        selectedDate.getDate() === day;
      const roundNum = parseInt(s.round, 10);
      return sameDate && roundNum === selectedRoundNo;
    });
  })();

  // My 예매 정보 > 일시
  const selectedDateTimeText = (() => {
    if (!selectedSchedule) return "선택 전";
    const [year, month, day] = selectedSchedule.date;
    return `${year}년 ${month}월 ${day}일 ${selectedSchedule.time}`;
  })();

  // 취소 기한: 선택 회차 공연일 기준 1일 전까지
  const cancelDeadlineText = (() => {
    if (!selectedSchedule) return "-";
    const [year, month, day] = selectedSchedule.date;
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${dd}까지`;
  })();

  // 공연 기간(시작일, 종료일)을 "YYYY.MM.DD" 형식으로 만드는 함수
  const formatConcertDate = (dateArr) => {
    if (!dateArr || dateArr.length < 3) return "-";
    const [year, month, day] = dateArr;
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}.${mm}.${dd}`;
  };

  // 좌석별 금액 요약 (S석 / R석)
  const seatPriceSummary = (() => {
    if (!ticket.seats || ticket.seats.length === 0) {
      const base = ticket.basePrice || 0;
      return `${base.toLocaleString()} 원`;
    }
    const parts = ticket.seats.map((s) => {
      const grade = s.grade || s.seatClass || "";
      const price = s.price || 0;
      return `${grade}석 ${price.toLocaleString()} 원`;
    });
    return parts.join(" / ");
  })();

  // 선택된 회차에 대한 좌석 등급 / 잔여석 요약
  const seatSummaryForSelectedRound = (() => {
    if (!ticket || !selectedRoundNo) return [];
    if (!seatSummaryList || seatSummaryList.length === 0) return [];

    // 1) 선택된 회차 데이터만 필터링
    const currentRoundList = seatSummaryList.filter(
      (item) => item.roundNo === selectedRoundNo
    );

    if (currentRoundList.length === 0) return [];

    // 2) 기본 가격 기준으로 R/S 가격 계산
    //    - 기존 코드에 basePrice를 쓰고 있으므로 우선 사용
    //    - 없으면 ticket.price 로 보조
    const basePrice = ticket.basePrice || ticket.price || 0;
    let rPrice = 0;
    let sPrice = 0;

    if (basePrice > 0) {
      rPrice = basePrice; // R석 = 기본가
      sPrice = Math.floor(basePrice * 0.92); // S석 = 약 8% 할인 (기존 비율과 맞춰 사용)
    }

    // 3) API에서 내려온 seatClass / remainingSeats 를 화면용 구조로 변환
    return currentRoundList
      .map((item) => {
        const grade = item.seatClass === "S" ? "S" : "R";
        const price = grade === "S" ? sPrice : rPrice;

        return {
          grade,
          price,
          remaining: item.remainingSeats ?? 0,
        };
      })
      // S석, R석 순서 정렬
      .sort((a, b) => a.grade.localeCompare(b.grade));
  })();

  // 수수료 / 할인
  const serviceFee = 2000;
  const discount = ticket.discount || 0;

  return (
    <div className="ticket-buy-main">
      <div className="ticket-buy-page">
        {/* 단계 표시 */}
        <div className="ticket-buy-top">
          <button className="ticket-buy-button1">
            01&nbsp;<span className="ticket-buy-button-text1">날짜 선택</span>
          </button>
          <button className="ticket-buy-button2">
            02&nbsp;<span className="ticket-buy-button-text1">좌석 선택</span>
          </button>
          <button className="ticket-buy-button2">
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
            {/* 좌측: 날짜, 회차, 좌석 */}
            <div className="ticket-buy-middle-box1">
              {/* 날짜 선택 캘린더 */}
              <div className="ticket-buy-day1">
                <strong>관람일 선택</strong>
                <br />
                <br />
                <div className="calendar1">
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const isAvailable =
                      ticket?.availableDates?.includes(day);
                    const isSelected =
                      selectedDate && selectedDate.getDate() === day;

                    return (
                      <button
                        key={day}
                        className={`calendar-day ${
                          isSelected ? "selected" : ""
                        }`}
                        style={{
                          color: isAvailable ? "#000" : "#aaa",
                          cursor: isAvailable ? "pointer" : "not-allowed",
                        }}
                        onClick={() => isAvailable && handleDateClick(day)}
                        disabled={!isAvailable}
                        title={
                          isAvailable ? `예매 가능: ${day}일` : `예매 불가`
                        }
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 회차 선택 */}
              <div className="ticket-buy-day2">
                <strong>회차</strong>&nbsp;
                <span
                  style={{ fontSize: "16px", color: "#ffbcd4" }}
                >
                  (관람 시간)
                </span>
                <div className="ticket-buy-round">
                  {roundsToShow.length > 0 ? (
                    roundsToShow.map((r, idx) => (
                      <button
                        key={idx}
                        className={`round-btn ${
                          selectedRound === r.display ? "selected" : ""
                        }`}
                        onClick={() => handleRoundClick(r.display)}
                      >
                        {r.display}
                      </button>
                    ))
                  ) : (
                    <button className="round-btn selected">1 회차</button>
                  )}
                </div>
              </div>

              {/* 좌석 등급 / 잔여석 */}
              <div className="ticket-buy-day3">
                <strong>좌석 등급 / 잔여석</strong>
                <div className="ticket-buy-seat">
                  {seatSummaryForSelectedRound &&
                  seatSummaryForSelectedRound.length > 0 ? (
                    seatSummaryForSelectedRound.map((item, idx) => (
                      <p key={idx}>
                        {item.grade}석 {item.price.toLocaleString()}원 (잔여석{" "}
                        {item.remaining}석)
                      </p>
                    ))
                  ) : (
                    <p>좌석 정보가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 유의사항 */}
            <div className="ticket-buy-note">
              <strong>유의사항</strong>
              <div className="ticket-buy-note-text">
                <p>
                  장애인, 국가유공자 할인 가격 예매 시 현장 수령만 가능하며, 현장에
                  증명서류 미지침시 할인 불가합니다.
                </p>
                <p>할인 쿠폰을 사용하여 예매한 티켓은 부분 취소가 불가합니다.</p>
                <p>당일 관리 상품 예매시는 취소 불가합니다.</p>
                <p>
                  취소 수수료와 취소 가능일자는 상품별로 다르니, 오른쪽 하단 My 예매
                  정보에서 확인해 주세요.
                </p>
                <p>
                  ATM 기기에서 가상 계좌 입금이 안 될 수 있으니 인터넷 / 폰 뱅킹이
                  어려우시면 무통장 입금 외 다른 결제 수단을 선택해 주세요.
                </p>
              </div>
            </div>
          </div>

          {/* 우측: My 예매 정보 */}
          <div className="ticket-set-setting2">
            <div className="ticket-set-setting">
              <div className="read-set">
                <div className="cons-img">
                  <img
                    src={resolveImageUrl(ticket?.mainImageUrl) || Cons}
                    alt={ticket?.title || "콘서트_썸네일"}
                  />
                </div>
                <div className="read-table">
                  <table>
                    <tbody>
                      <tr>
                        <th>{ticket?.title || "제목 없음"}</th>
                      </tr>
                      <tr>
                        <th>
                          {formatYmd(ticket?.startAt)} ~{" "}
                          {formatYmd(ticket?.endAt)}
                        </th>
                      </tr>
                      <tr>
                        <th>{ticket?.venueName || "미정"}</th>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <table className="ticket-buy-table2">
                <tbody>
                  <strong className="ticket-buy-my">예매 정보 </strong>
                  <tr>
                    <th>일시</th>
                    <td>{selectedDateTimeText}</td>
                  </tr>
                  <tr>
                    <th>수수료</th>
                    <td>{serviceFee.toLocaleString()} 원</td>
                  </tr>
                  <tr>
                    <th>할인</th>
                    <td>{discount.toLocaleString()} 원</td>
                  </tr>
                  <tr>
                    <th>취소기한</th>
                    <td>{cancelDeadlineText}</td>
                  </tr>
                  <tr>
                    <th>취소수수료</th>
                    <td>기간별로 상이</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <br />
            <Link
              to={`/Ticket/Buy2/${id}`}
              state={{ selectedDate, selectedRoundNo }}
              className="ticket-next-btn"
            >
              다음 단계
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
