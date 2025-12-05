// src/admin/AdminContact.jsx
import React, { useEffect, useState } from "react";
import "../css/admin.css";
import "../css/style.css";
import { useParams } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import api from "../api";

// api baseURL 기준으로 이미지 URL 만들기
const BASE_URL = (api.defaults.baseURL || "").replace(/\/$/, "");

const resolveImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${BASE_URL}${path}`;
};

export default function AdminContactDetail() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  // 댓글 입력
  const [newReply, setNewReply] = useState("");
  const [replyFiles, setReplyFiles] = useState([]); // 댓글 첨부 파일
  const [replyError, setReplyError] = useState("");

  const fetchBoardDetail = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/admin/boards/${boardId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("게시글을 불러오지 못했습니다.");
      }

      const data = await res.json();
      console.log("문의 상세:", data);
      setBoard(data.data || data);

      // data.board 형태일 수도 있으니 방어적으로 처리
      const core = data.board || data;

      setBoard({
        // 기존 응답 전체를 먼저 펼쳐서 넣기
        ...core,

        // 이메일/연락처 (회원/관리자 공통 대응)
        email: core.email || core.memberEmail || "",
        phone: core.phone || core.memberPhone || "",

        // 혹시 JSX에서 memberEmail / memberPhone 을 참조하는 경우도 대비
        memberEmail: core.email || core.memberEmail || "",
        memberPhone: core.phone || core.memberPhone || "",

        // 문의 유형/주문 티켓
        categoryType: core.categoryType || core.category || "",
        orderTicketId:
          core.orderTicketId || core.orderId || core.ticketId || "",

        // 첨부파일/댓글
        attachments: data.attachments || core.attachments || [],
        replies: data.replies || core.replies || [],

        // 예전 구조(image 배열)이 있으면 같이 살려두기
        image: core.image || core.images || [],
      });

    } catch (err) {
      console.error("게시글 불러오기 실패:", err);
      setBoard(null);
    } finally {
      setLoading(false);
    }
  };


  // 최초 로딩
  useEffect(() => {
    fetchBoardDetail();
  }, [boardId]);

  // 댓글 달기 (텍스트 + 첨부파일 업로드)
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setReplyError("");

    if (!newReply.trim()) {
      setReplyError("댓글을 입력해 주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setReplyError("로그인이 필요합니다.");
        return;
      }

      // ReplyCURequestDTO(adminId, content, newAttachments, existingImages) 에 맞춰 전송
      const formData = new FormData();
      formData.append("adminId", "관리자"); // 필요시 실제 관리자 ID로 교체
      formData.append("content", newReply);

      // 새 첨부파일
      if (replyFiles && replyFiles.length > 0) {
        replyFiles.forEach((file) => {
          formData.append("newAttachments", file);
        });
      }

      const res = await fetch(
        `${BASE_URL}/admin/boards/${boardId}/replies`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            //  Content-Type 은 FormData 사용 시 자동 설정
          },
          body: formData,
        }
      );

      if (!res.ok) {
        let errMsg = "댓글 등록 실패";
        try {
          const errData = await res.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch (e) {
          // 무시
        }
        throw new Error(errMsg);
      }

      // 성공 후 최신 데이터 다시 불러오기
      await fetchBoardDetail();
      setNewReply("");
      setReplyFiles([]);
    } catch (err) {
      console.error(err);
      setReplyError(err.message);
    }
  };

  if (loading) return <p>로딩중...</p>;
  if (!board) return <p>게시글을 불러올 수 없습니다.</p>;

  const hasAttachments =
    (board.attachments && board.attachments.length > 0) ||
    (board.image && board.image.length > 0);

  return (
    // ✅ 기존 레이아웃 구조 그대로 복원
    <div className="member-Member-page">
      <AdminSidebar /> {/* 왼쪽 사이드바 */}

      <div className="member-right">
        <div className="member-myTk-box2">
          <div className="costs-main-box">
            <br />
            <br />
            <div className="member-conts-conBox">
              <div className="Admin-conts-list">
                <table className="AdConts-table">
                  <tbody>
                    <tr>
                      <th>이메일 주소</th>
                      <th>휴대전화번호</th>
                    </tr>
                    <tr>
                      <td>
                        <input
                          type="text"
                          className="admin-cont-phone1"
                          value={board.email || ""}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="admin-cont-phone2"
                          value={board.phone || ""}
                          readOnly
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>문의 유형</th>
                      <th>예약번호</th>
                    </tr>
                    <tr>
                      <td>
                        <input
                          type="text"
                          className="admin-cont-phone1"
                          value={board.categoryType || ""}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="admin-cont-phone2"
                          value={board.orderTicketId || ""}
                          readOnly
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>문의내용</th>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <textarea
                          rows="6"
                          className="conts-area"
                          value={board.content || ""}
                          readOnly
                        />
                      </td>
                    </tr>

                    {/* ===== 첨부파일 영역 (기존 디자인 유지 + 새 attachments 구조 지원) ===== */}
                    <tr>
                      <th>첨부파일</th>
                    </tr>
                    {hasAttachments ? (
                      <>
                        {/* 새 구조: attachments 배열 */}
                        {board.attachments &&
                          board.attachments.map((img, idx) => (
                            <tr key={`att-${img.imageId || idx}`}>
                              <td colSpan={2}>
                                <a
                                  href={resolveImageUrl(img.imageUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {img.originalName ||
                                    img.orginName ||
                                    `첨부파일 ${idx + 1}`}
                                </a>
                                <br />
                                <img
                                  src={resolveImageUrl(img.imageUrl)}
                                  alt={
                                    img.originalName ||
                                    img.orginName ||
                                    `첨부파일 ${idx + 1}`
                                  }
                                  style={{ maxWidth: "200px" }}
                                />
                              </td>
                            </tr>
                          ))}

                        {/* 옛날 구조: image 배열(imgUrl, orginName) */}
                        {(!board.attachments ||
                          board.attachments.length === 0) &&
                          board.image &&
                          board.image.map((file, idx) => (
                            <tr key={`legacy-${idx}`}>
                              <td colSpan={2}>
                                <a
                                  href={resolveImageUrl(file.imgUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {file.orginName || `첨부파일 ${idx + 1}`}
                                </a>
                                <br />
                                <img
                                  src={resolveImageUrl(file.imgUrl)}
                                  alt={file.orginName || `첨부파일 ${idx + 1}`}
                                  style={{ maxWidth: "200px" }}
                                />
                              </td>
                            </tr>
                          ))}
                      </>
                    ) : (
                      <tr>
                        <td colSpan={2}>첨부파일 정보 없음</td>
                      </tr>
                    )}

                    {/* ===== 댓글 목록 ===== */}
                    <tr>
                      <th>댓글</th>
                    </tr>
                    {board.replies && board.replies.length > 0 ? (
                      board.replies.map((reply, idx) => (
                        <React.Fragment key={reply.replyId || idx}>
                          {/* 댓글 내용 */}
                          <tr>
                            <td colSpan={2}>
                              {reply.replyContent || reply.content} (
                              {reply.adminId || reply.memberId || "관리자"})
                            </td>
                          </tr>

                          {/* 댓글별 첨부파일 미리보기 */}
                          {reply.attachments &&
                            reply.attachments.length > 0 && (
                              <tr>
                                <td colSpan={2}>
                                  {reply.attachments.map((img, imgIdx) => {
                                    const url = resolveImageUrl(
                                      img.imageUrl || img.imgUrl
                                    );
                                    const label =
                                      img.originalName ||
                                      img.orginName ||
                                      `댓글 첨부파일 ${imgIdx + 1}`;

                                    return (
                                      <div
                                        key={imgIdx}
                                        style={{ marginTop: "5px" }}
                                      >
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {label}
                                        </a>
                                        <br />
                                        <img
                                          src={url}
                                          alt={label}
                                          style={{ maxWidth: "200px" }}
                                        />
                                      </div>
                                    );
                                  })}
                                </td>
                              </tr>
                            )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2}>등록된 댓글이 없습니다.</td>
                      </tr>
                    )}


                    {/* ===== 댓글 작성 ===== */}
                    <tr>
                      <td colSpan={2}>
                        <textarea
                          className="Ad-conts-rep"
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder="댓글을 입력하세요"
                        />
                        <br />
                        <br />
                        <input
                          type="file"
                          multiple
                          onChange={(e) =>
                            setReplyFiles(Array.from(e.target.files || []))
                          }
                        />
                        <br />
                        <br />
                        {replyError && (
                          <p style={{ color: "red" }}>{replyError}</p>
                        )}
                        <button
                          className="conts-conts-btn2"
                          onClick={handleReplySubmit}
                        >
                          댓글 달기
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
    </div>
  );
}
