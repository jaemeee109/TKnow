[2025.10.20] 
image 테이블에 reply_id 추가
ALTER TABLE image ADD COLUMN reply_id BIGINT NULL AFTER ticket_id;
CREATE INDEX idx_img_reply ON image(reply_id);
ALTER TABLE image
  ADD CONSTRAINT fk_img_reply FOREIGN KEY (reply_id) REFERENCES reply(reply_id)
  ON UPDATE CASCADE ON DELETE SET NULL;
  =============================================================
  
  [2025.11.17]
  2025-11-17: ticket 테이블에 공연 종료일 컬럼 추가
ALTER TABLE ticket
  ADD COLUMN start_at DATETIME NOT NULL COMMENT '공연 시작일시' AFTER ticket_date,
  ADD COLUMN end_date DATETIME NULL COMMENT '공연 종료일시' AFTER start_at;
  =============================================================
   
  [2025.11.18]
  2025-11-18: ticket 테이블에 공연장 주소 및 공연장 이름 추가
ALTER TABLE ticket
  ADD COLUMN venueName VARCHAR(255) NOT NULL COMMENT '공연장 이름' AFTER end_date,
  ADD COLUMN venueAddress VARCHAR(255) NOT NULL COMMENT '공연장 주소' AFTER venueName;
  ============================================================= 
  