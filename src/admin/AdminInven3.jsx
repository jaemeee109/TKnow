import React, { useState } from "react";
import "../css/style.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminInven2() {
  const navigate = useNavigate();

  // 상태 관리 - DTO 필드에 맞춤
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState({ year: "", month: "", day: "", hour: "", minute: "" });
  const [endAt, setEndAt] = useState({ year: "", month: "", day: "", hour: "", minute: "" });
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 등록 버튼 클릭
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // FormData 생성
      const formData = new FormData();

      // 필수 필드
      formData.append("title", title);

      // 날짜/시간 형식: yyyy-MM-ddTHH:mm:ss
      const startDateTime = `${startAt.year}-${startAt.month.padStart(2, '0')}-${startAt.day.padStart(2, '0')}T${startAt.hour.padStart(2, '0')}:${startAt.minute.padStart(2, '0')}:00`;
      const endDateTime = `${endAt.year}-${endAt.month.padStart(2, '0')}-${endAt.day.padStart(2, '0')}T${endAt.hour.padStart(2, '0')}:${endAt.minute.padStart(2, '0')}:00`;

      formData.append("startAt", startDateTime);
      formData.append("endAt", endDateTime);
      formData.append("venueName", venueName);
      formData.append("venueAddress", venueAddress);
      formData.append("totalSeats", totalSeats);
      formData.append("price", price);

      // 선택 필드
      if (ticketCost) formData.append("ticketCost", ticketCost);
      if (ticketPrice) formData.append("ticketPrice", ticketPrice);
      if (ticketStock) formData.append("ticketStock", ticketStock);
      if (ticketDetail) formData.append("ticketDetail", ticketDetail);
      if (ageLimit) formData.append("ageLimit", ageLimit);
      if (benefit) formData.append("benefit", benefit);
      if (promotion) formData.append("promotion", promotion);

      // 이미지 파일
      if (mainImage) formData.append("mainImage", mainImage);
      if (detailImage) formData.append("detailImage", detailImage);

      // 토큰
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      console.log("📤 상품 등록 요청 시작...");
      
      // API 호출
      const response = await axios.post(
        "http://localhost:9090/ticketnow/admin/tickets",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("✅ 상품 등록 성공:", response.data);
      alert("상품이 성공적으로 등록되었습니다!");
      navigate("/admin/AdminInven");

    } catch (err) {
      console.error("❌ 상품 등록 실패:", err);
      console.error("❌ 응답:", err.response?.data);
      
      const errorMsg = err.response?.data?.message || err.message || "상품 등록에 실패했습니다.";
      setError(errorMsg);
      alert(`등록 실패: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="member-Member-page" onSubmit={handleSubmit}>
      <div className="member-left">
        <div className="admin-Member-box1">
          <strong>관리자</strong><span> 님 반갑습니다!</span><br /><br />
          <table>
            <tbody>
              <tr><td><Link to="/admin/AdminMember" className="member-mytick">회원 관리</Link></td></tr>
              <tr><td>보안 관리</td></tr>
              <tr><td>공지사항 관리</td><td className="admin-btn">공지 등록</td></tr>
              <tr><td><Link to="/admin/AdminContact" className="member-mytick">1:1 문의사항 관리</Link></td></tr>
              <tr><td><Link to="/admin/AdminInven" className="member-Member-click">재고 관리</Link></td>
                <td><Link to="/admin/AdminInven2" className="admin-btn2">상품 등록</Link></td></tr>
            </tbody>
          </table>
          <hr className="member-box1-bottom" /><br /><br />
          <span className="member-box1-logout">로그아웃</span>
        </div>
      </div>

      <div className="member-right">
        <div className="member-myTk-box2">
          <div className="costs-main-box">
            <br /><br />
            
            {error && (
              <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red' }}>
                ❌ {error}
              </div>
            )}

            <div className="member-conts-conBox">
              <div className="Admin-conts-list">
                <table className="AdConts-table">
                  <tbody>
                    {/* 제목 (필수) */}
                    <tr><th>상품명 <span style={{color: 'red'}}>*</span></th></tr>
                    <tr><td><input type="text" className="Ad-conts-resNum" value={title} onChange={e => setTitle(e.target.value)} required /></td></tr>

                    {/* 시작 날짜/시간 (필수) */}
                    <tr><th>공연 시작 일시 <span style={{color: 'red'}}>*</span></th></tr>
                    <tr>
                      <td>
                        <input type="text" placeholder="YYYY" className="admin-inven-phone1" value={startAt.year} onChange={e => setStartAt({...startAt, year: e.target.value})} required />
                        <input type="text" placeholder="MM" className="admin-inven-phone2" value={startAt.month} onChange={e => setStartAt({...startAt, month: e.target.value})} required />
                        <input type="text" placeholder="DD" className="admin-inven-phone3" value={startAt.day} onChange={e => setStartAt({...startAt, day: e.target.value})} required />
                        
                      </td>
                    </tr>

                    {/* 종료 날짜/시간 (필수) */}
                    <tr><th>공연 종료 일시 <span style={{color: 'red'}}>*</span></th></tr>
                    <tr>
                      <td>
                        <input type="text" placeholder="YYYY" className="admin-inven-phone1" value={endAt.year} onChange={e => setEndAt({...endAt, year: e.target.value})} required />
                        <input type="text" placeholder="MM" className="admin-inven-phone2" value={endAt.month} onChange={e => setEndAt({...endAt, month: e.target.value})} required />
                        <input type="text" placeholder="DD" className="admin-inven-phone3" value={endAt.day} onChange={e => setEndAt({...endAt, day: e.target.value})} required />
                        
                      </td>
                    </tr>

                    {/* 공연장명 (필수) */}
                    <tr><th>공연 장소 <span style={{color: 'red'}}>*</span></th></tr>
                    <tr><td><input type="text" className="Ad-conts-resNum" value={venueName} onChange={e => setVenueName(e.target.value)} required /></td></tr>

                    {/* 공연장 주소 */}
                    <tr><th>공연장 주소</th></tr>
                    <tr><td><input type="text" className="Ad-conts-resNum" value={venueAddress} onChange={e => setVenueAddress(e.target.value)} /></td></tr>

                    {/* 총 좌석 수 (필수) */}
                    <tr><th>총 좌석 수 <span style={{color: 'red'}}>*</span></th></tr>
                    <tr><td><input type="number" min="1" className="Ad-conts-resNum" value={totalSeats} onChange={e => setTotalSeats(e.target.value)} required /></td></tr>

                    {/* 가격 (필수) */}
                    <tr><th>기본 가격 <span style={{color: 'red'}}>*</span></th></tr>
                    <tr><td><input type="number" min="0.01" step="0.01" className="Ad-conts-resNum" value={price} onChange={e => setPrice(e.target.value)} required /></td></tr>

                    {/* 매입 원가 */}
                    <tr><th>매입 원가</th></tr>
                    <tr><td><input type="text" className="Ad-conts-resNum" value={ticketCost} onChange={e => setTicketCost(e.target.value)} /></td></tr>

                    {/* 판매 가격 */}
                    <tr><th>판매 가격</th></tr>
                    <tr><td><input type="text" className="Ad-conts-resNum" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} /></td></tr>

                    {/* 재고 수량 */}
                    <tr><th>재고 수량</th></tr>
                    <tr><td><input type="text" className="Ad-conts-resNum" value={ticketStock} onChange={e => setTicketStock(e.target.value)} /></td></tr>

                    {/* 상세 설명 */}
                    <tr><th>상품 상세 설명</th></tr>
                    <tr><td><textarea className="Ad-conts-resNum" value={ticketDetail} onChange={e => setTicketDetail(e.target.value)} rows="4" style={{width: '100%'}} /></td></tr>

                    {/* 관람 연령 */}
                    <tr><th>관람 연령</th></tr>
                    <tr><td><input type="text" className="Ad-conts-resNum" value={ageLimit} onChange={e => setAgeLimit(e.target.value)} placeholder="예: 전체관람가, 만 12세 이상" /></td></tr>

                    {/* 혜택 */}
                    <tr><th>혜택</th></tr>
                    <tr><td><input type="text" className="Ad-conts-resNum" value={benefit} onChange={e => setBenefit(e.target.value)} /></td></tr>

                    {/* 프로모션 */}
                    <tr><th>프로모션</th></tr>
                    <tr><td><input type="text" className="Ad-conts-resNum" value={promotion} onChange={e => setPromotion(e.target.value)} /></td></tr>

                    {/* 대표 이미지 */}
                    <tr><th>대표 이미지</th></tr>
                    <tr><td><input type="file" accept="image/*" onChange={e => setMainImage(e.target.files[0])} /></td></tr>

                    {/* 상세 이미지 */}
                    <tr><th>상품 설명 이미지</th></tr>
                    <tr><td><input type="file" accept="image/*" onChange={e => setDetailImage(e.target.files[0])} /></td></tr>

                    <tr>
                      <td>
                        <button type="submit" className="conts-conts-btn" disabled={loading}>
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