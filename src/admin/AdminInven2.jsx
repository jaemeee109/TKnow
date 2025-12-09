// src/admin/AdminInven2.jsx
import React, { useState } from "react";
import "../css/admin.css";
import "../css/style.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import AdminSidebar from "./AdminSidebar";

export default function AdminInven2() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
  });
  const [endAt, setEndAt] = useState({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
  });
  const [venueName, setVenueName] = useState("");

  // === 회차(스케줄) 입력용 상태 ===
  const [schedules, setSchedules] = useState([
    { roundNo: 1, year: "", month: "", day: "", hour: "", minute: "" },
  ]);

  // 회차 한 줄 추가
  const addScheduleRow = () => {
    setSchedules((prev) => [
      ...prev,
      {
        roundNo: prev.length + 1,
        year: "",
        month: "",
        day: "",
        hour: "",
        minute: "",
      },
    ]);
  };

  // 회차 한 줄 삭제
  const removeScheduleRow = (index) => {
    setSchedules((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // 삭제 후 회차 번호 다시 1부터 재정렬
      return next.map((s, idx) => ({ ...s, roundNo: idx + 1 }));
    });
  };

  // 개별 회차 값 변경
  const handleScheduleChange = (index, field, value) => {
    setSchedules((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const [totalSeats, setTotalSeats] = useState("");
  const [price, setPrice] = useState("");
  const [ticketCost, setTicketCost] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketStock, setTicketStock] = useState("");
  const [ticketDetail, setTicketDetail] = useState("");
  const [ageLimit, setAgeLimit] = useState("");
  const [benefit, setBenefit] = useState("");
  const [promotion, setPromotion] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [detailImage, setDetailImage] = useState(null);
  const [category, setCategory] = useState("CONCERT");
  const [ticketStatus, setTicketStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ===== 기본 필수값 검증 =====
      if (!title.trim()) {
        setError("상품명을 입력해주세요.");
        setLoading(false);
        return;
      }

      if (!category) {
        setError("카테고리를 선택해주세요.");
        setLoading(false);
        return;
      }

      if (!venueName.trim()) {
        setError("공연장소를 입력해주세요.");
        setLoading(false);
        return;
      }

      // ===== 회차(스케줄) 유효성 검사 =====
      // 하나라도 값이 들어간 줄만 필터링
      const filledSchedules = schedules.filter(
        (s) => s.year || s.month || s.day || s.hour || s.minute
      );

      if (filledSchedules.length === 0) {
        setError("공연일시는 최소 1회차 이상 입력해야 합니다.");
        setLoading(false);
        return;
      }

      // 각 줄은 연/월/일/시/분이 모두 채워져 있어야 함
      for (const s of filledSchedules) {
        if (!s.year || !s.month || !s.day || !s.hour || !s.minute) {
          setError("모든 공연 회차의 연/월/일/시/분을 모두 입력해주세요.");
          setLoading(false);
          return;
        }
      }

      // 날짜 포맷 헬퍼 (YYYY-MM-DDTHH:mm)
      const buildLocalDateTimeString = (dateObj) => {
        const pad2 = (v) => String(v).padStart(2, "0");
        const { year, month, day, hour, minute } = dateObj;
        return `${year}-${pad2(month)}-${pad2(day)}T${pad2(
          hour
        )}:${pad2(minute)}`;
      };

      // showAt 문자열 생성 + 정렬용 배열
      const scheduleWithShowAt = filledSchedules.map((s) => {
        const showAt = buildLocalDateTimeString(s);
        return { ...s, showAt };
      });

      // showAt 기준으로 오름차순 정렬 (가장 이른 회차, 가장 늦은 회차 계산용)
      const sortedSchedules = [...scheduleWithShowAt].sort((a, b) =>
        a.showAt.localeCompare(b.showAt)
      );

      const first = sortedSchedules[0];
      const last = sortedSchedules[sortedSchedules.length - 1];

      // 공연 시작일시는 첫 회차 showAt
      const startDateTime = first.showAt;

      // 공연 종료일시는 마지막 회차 날짜의 23:59:59
      const pad2 = (v) => String(v).padStart(2, "0");
      const endDateTime = `${last.year}-${pad2(last.month)}-${pad2(
        last.day
      )}T23:59:59`;

      if (!startDateTime || !endDateTime) {
        setError("공연 시작/종료일 계산에 실패했습니다.");
        setLoading(false);
        return;
      }

      // ===== 숫자 필드 유효성 검사 =====
      const totalSeatsVal = parseInt(totalSeats, 10);
      if (Number.isNaN(totalSeatsVal) || totalSeatsVal <= 0) {
        setError("총 좌석 수는 1 이상의 숫자로 입력해주세요.");
        setLoading(false);
        return;
      }

      const priceVal = parseFloat(price);
      if (Number.isNaN(priceVal) || priceVal <= 0) {
        setError("기본 가격은 0보다 큰 값이어야 합니다.");
        setLoading(false);
        return;
      }

      if (!ticketDetail.trim()) {
        setError("상품 상세 설명을 입력해주세요.");
        setLoading(false);
        return;
      }

      // 이미지 최소 1장
      if (!mainImage && !detailImage) {
        setError("이미지는 최소 1장 이상 첨부해야 합니다.");
        setLoading(false);
        return;
      }

      // ===== formData 생성 =====
      const formData = new FormData();

      // --- DTO와 매핑되는 필드 ---
      formData.append("title", title);
      formData.append("category", category);
      formData.append("venueName", venueName);
      formData.append("totalSeats", String(totalSeatsVal));
      formData.append("price", String(priceVal));
      formData.append("ticketDetail", ticketDetail);

      // startAt / endAt 은 회차 기준으로 계산한 값 사용
      formData.append("startAt", startDateTime);
      formData.append("endAt", endDateTime);

      // --- 기존에 보내던 부가 필드들 (있으면 그대로 유지) ---
      if (ageLimit) formData.append("ageLimit", ageLimit);
      if (benefit) formData.append("benefit", benefit);
      if (promotion) formData.append("promotion", promotion);
      if (ticketStatus) formData.append("ticketStatus", ticketStatus);

      // ===== 회차 목록(schedules[*]) formData 에 추가 =====
      sortedSchedules.forEach((s, index) => {
        const roundNo =
          s.roundNo && s.roundNo > 0 ? s.roundNo : index + 1;

        formData.append(`schedules[${index}].roundNo`, String(roundNo));
        formData.append(`schedules[${index}].showAt`, s.showAt);
      });

      // 대표이미지 + 상품설명이미지
      if (mainImage) {
        formData.append("images", mainImage);
      }
      if (detailImage) {
        formData.append("images", detailImage);
      }

      console.log("전송 FormData (텍스트 필드):", {
        title,
        category,
        startAt: startDateTime,
        endAt: endDateTime,
        venueName,
        totalSeats: totalSeatsVal,
        price: priceVal,
        ticketDetail,
      });
      console.log("전송 이미지:", {
        mainImage: mainImage && mainImage.name,
        detailImage: detailImage && detailImage.name,
      });

      // ===== 서버로 POST 요청 (기존과 동일 방식) =====
      const res = await api.post("/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("상품 등록 결과:", res.data);
      alert("상품 등록이 완료되었습니다.");
      navigate("/admin/AdminInven");
    } catch (err) {
      console.error("상품 등록 중 오류:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "상품 등록 중 오류가 발생했습니다.";
      setError(msg);
      alert("상품 등록 실패: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="member-Member-page" onSubmit={handleSubmit}>
      <AdminSidebar />
      <div className="member-right">
        <div className="member-myTk-box2">
          <div className="costs-main-box">
            <br />
            <br />

            {error && (
              <div
                style={{
                  color: "red",
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid red",
                }}
              >
                {error}
              </div>
            )}

            <div className="member-conts-conBox">
              <div className="Admin-conts-list">
                <table className="AdConts-table">
                  <tbody>
                    <tr>
                      <th>
                        상품명 <span style={{ color: "red" }}>*</span>
                      </th>
                    </tr>
                    <tr>
                      <td>
                        <input
                          type="text"
                          className="Ad-conts-resNum"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>
                        판매 상태 <span style={{ color: "red" }}>*</span>
                      </th>
                    </tr>
                    <tr>
                      <td>
                        <select
                          value={ticketStatus}
                          className="Ad-conts-resNum"
                          onChange={(e) => setTicketStatus(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            선택하세요
                          </option>
                          <option value="ON_SALE">판매중</option>
                          <option value="SOLD_OUT">매진</option>
                          <option value="SCHEDULED">오픈 예정</option>
                          <option value="CLOSED">판매 종료</option>
                        </select>
                      </td>
                    </tr>

                    <tr>
                      <th>
                        카테고리 <span style={{ color: "red" }}>*</span>
                      </th>
                    </tr>
                    <tr>
                      <td>
                        <select
                          value={category}
                          className="Ad-conts-resNum"
                          onChange={(e) => setCategory(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            선택하세요
                          </option>
                          <option value="CONCERT">콘서트</option>
                          <option value="MUSICAL">뮤지컬</option>
                          <option value="SPORTS">스포츠</option>
                          <option value="EXHIBITION">전시회</option>
                        </select>
                      </td>
                    </tr>

                    {/* ================== 공연일시(여러 회차) ================== */}
                    <tr>
                      <th>
                        공연일시
                        <span style={{ color: "red" }}>*</span>
                      </th>
                    </tr>
                    <tr>
                      <td>
                        {schedules.map((s, index) => (
                          <div
                            key={index}
                            className="Ad-conts-resNum"
                            style={{ marginBottom: "8px" }}
                          >
                            {/* 날짜 */}
                            <input
                              type="text"
                              placeholder="YYYY"
                              className="admin-inven-phone1"
                              value={s.year}
                              maxLength={4}
                              onChange={(e) =>
                                handleScheduleChange(index, "year", e.target.value)
                              }
                            />
                            <span>년</span>
                            <input
                              type="text"
                              placeholder="MM"
                              className="admin-inven-phone1"
                              value={s.month}
                              maxLength={2}
                              onChange={(e) =>
                                handleScheduleChange(index, "month", e.target.value)
                              }
                            />
                            <span>월</span>
                            <input
                              type="text"
                              placeholder="DD"
                              className="admin-inven-phone1"
                              value={s.day}
                              maxLength={2}
                              onChange={(e) =>
                                handleScheduleChange(index, "day", e.target.value)
                              }
                            />
                            <span>일</span>

                            {/* 시간 */}
                            <input
                              type="text"
                              placeholder="HH"
                              className="admin-inven-phone1"
                              value={s.hour}
                              maxLength={2}
                              onChange={(e) =>
                                handleScheduleChange(index, "hour", e.target.value)
                              }
                            />
                            <span>시</span>
                            <input
                              type="text"
                              placeholder="mm"
                              className="admin-inven-phone1"
                              value={s.minute}
                              maxLength={2}
                              onChange={(e) =>
                                handleScheduleChange(index, "minute", e.target.value)
                              }
                            />
                            <span>분</span>

                            {/* 회차 표시 */}
                            <span className="reserveAng" style={{ marginLeft: "8px" }}>
                              {index + 1}회차
                            </span>

                            {/* 2회차 이상부터 삭제 버튼 노출 */}
                            {index > 0 && (
                              <button
                                type="button"
                                className="admin-con-btn1"
                                style={{ marginLeft: "8px" }}
                                onClick={() => removeScheduleRow(index)}
                              >
                                회차 삭제
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          className="admin-con-btn1"
                          style={{ marginTop: "8px" }}
                          onClick={addScheduleRow}
                        >
                          + 회차 추가
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <th>
                        공연 장소 <span style={{ color: "red" }}>*</span>
                      </th>
                    </tr>
                    <tr>
                      <td>
                        <input
                          type="text"
                          className="Ad-conts-resNum"
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          required
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>
                        총 좌석 수 <span style={{ color: "red" }}>*</span>
                      </th>
                    </tr>
                    <tr>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className="Ad-conts-resNum"
                          value={totalSeats}
                          onChange={(e) => setTotalSeats(e.target.value)}
                          required
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>
                        판매 가격 <span style={{ color: "red" }}>*</span>
                      </th>
                    </tr>
                    <tr>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="Ad-conts-resNum"
                          value={price}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPrice(val);
                            if (val)
                              setTicketCost((parseFloat(val) * 0.4).toFixed(0));
                            else setTicketCost("");
                          }}
                          required
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>상품 상세 설명</th>
                    </tr>
                    <tr>
                      <td>
                        <textarea
                          className="Ad-conts-resNum"
                          value={ticketDetail}
                          onChange={(e) => setTicketDetail(e.target.value)}
                          rows="4"
                          style={{ width: "100%" }}
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>대표 이미지</th>
                    </tr>
                    <tr>
                      <td>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setMainImage(e.target.files[0])}
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>상품 설명 이미지</th>
                    </tr>
                    <tr>
                      <td>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setDetailImage(e.target.files[0])}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <button
                          type="submit"
                          className="conts-conts-btn"
                          disabled={loading}
                        >
                          {loading ? "등록 중..." : "등록하기"}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
