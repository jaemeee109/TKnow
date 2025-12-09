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
  
  [2025.12.06]
  2025.12.06 ticket 테이블에 공연장 주소 삭제
  ALTER TABLE ticket
  DROP COLUMN venueAddress;

  ============================================================= 
  
  [2025.12.06]
  2025.12.06 ticket_schedule 테이블 추가 (공연 회차)
CREATE TABLE ticket_schedule (
  schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id   BIGINT       NOT NULL,
  round_no    INT          NOT NULL,
  show_at     DATETIME     NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT NOW(),
  updated_at  DATETIME     NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_ticket_schedule_ticket
    FOREIGN KEY (ticket_id)
    REFERENCES ticket(ticket_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_ticket_schedule_ticket
  ON ticket_schedule(ticket_id);

CREATE INDEX idx_ticket_schedule_ticket_date
  ON ticket_schedule(ticket_id, show_at);


  ============================================================= 	
    [2025.12.06]
  2025.12.06 seat 테이블에 round_no(회차) 추가 (공연 회차)
  유니크 제약조건 삭제 및 새로 생성
  
ALTER TABLE `seat`
  ADD COLUMN `round_no` INT(11) NOT NULL DEFAULT 1 COMMENT '회차 번호' AFTER `ticket_id`,
  ADD KEY `idx_seat_ticket_round` (`ticket_id`, `round_no`);

ALTER TABLE `seat`
  DROP INDEX `uk_seat_ticket_code`,
  ADD UNIQUE KEY `uk_seat_ticket_code` (
    `ticket_id`,
    `round_no`,
    `seat_code`
  );


   
    ============================================================= 