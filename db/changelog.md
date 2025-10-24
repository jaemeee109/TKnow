[2025.10.20] 
image 테이블에 reply_id 추가
ALTER TABLE image ADD COLUMN reply_id BIGINT NULL AFTER ticket_id;
CREATE INDEX idx_img_reply ON image(reply_id);
ALTER TABLE image
  ADD CONSTRAINT fk_img_reply FOREIGN KEY (reply_id) REFERENCES reply(reply_id)
  ON UPDATE CASCADE ON DELETE SET NULL;
  =============================================================