-- docs/schema.sql
-- TicketNow schema (MyBatis / Document + Init)
-- MariaDB 10.5 / Timezone: +09:00
-- ENUM 컬럼은 사용하지 않고 VARCHAR로 저장 (애플리케이션에서 enum 문자열과 1:1 매핑)

SET NAMES utf8mb4;
SET time_zone = '+09:00';

-- 참고용 DB 생성문 (운영/공용 DB는 별도 관리)
CREATE DATABASE IF NOT EXISTS tknow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE tknow;

SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- 1) MEMBER
CREATE TABLE IF NOT EXISTS member (
  member_id       VARCHAR(50)  NOT NULL,
  member_pw       VARCHAR(255) NOT NULL,
  member_name     VARCHAR(100) NOT NULL,
  member_birth    DATE         NULL,
  member_phone    VARCHAR(30)  NULL,
  member_email    VARCHAR(200) NULL,
  member_zip      VARCHAR(20)  NULL,
  member_addr1    VARCHAR(255) NULL,
  member_addr2    VARCHAR(255) NULL,
  member_grade    VARCHAR(50)  NULL,
  member_role     VARCHAR(20)  NOT NULL DEFAULT 'USER',     -- ADMIN/USER/WITHDRAWN
  deleted_at      DATETIME     NULL,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) TICKET
CREATE TABLE IF NOT EXISTS ticket (
  ticket_id       BIGINT       NOT NULL AUTO_INCREMENT,
  ticket_title    VARCHAR(200) NOT NULL,
  ticket_date     DATETIME     NULL,
  ticket_price    INT          NOT NULL,
  ticket_stock    INT          NOT NULL DEFAULT 0,
  ticket_detail   TEXT         NULL,
  ticket_category VARCHAR(20)  NOT NULL,                    -- CONCERT/MUSICAL/SPORTS/EXHIBITION
  ticket_status   VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED',-- ON_SALE/SOLD_OUT/SCHEDULED/CLOSED
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) BOARD
CREATE TABLE IF NOT EXISTS board (
  board_id            BIGINT        NOT NULL AUTO_INCREMENT,
  member_id           VARCHAR(50)   NOT NULL,
  board_title         VARCHAR(200)  NOT NULL,
  board_content       TEXT          NOT NULL,               -- ← 소문자 스네이크로 통일
  board_reaction_type VARCHAR(50)   NULL,
  category_type       VARCHAR(30)   NOT NULL DEFAULT 'FREE',
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (board_id),
  CONSTRAINT fk_board_member FOREIGN KEY (member_id) REFERENCES member(member_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- 4) REPLY 
CREATE TABLE IF NOT EXISTS reply (
  reply_id       BIGINT       NOT NULL AUTO_INCREMENT,     -- ← 소문자 스네이크
  member_id      VARCHAR(50)  NOT NULL,
  board_id       BIGINT       NOT NULL,
  reply_content  TEXT         NOT NULL,                    -- ← 소문자 스네이크
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (reply_id),
  KEY idx_reply_board (board_id),
  KEY idx_reply_member (member_id),
  CONSTRAINT fk_reply_board FOREIGN KEY (board_id) REFERENCES board(board_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_reply_member FOREIGN KEY (member_id) REFERENCES member(member_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 5) SEAT
CREATE TABLE IF NOT EXISTS seat (
  seat_id          BIGINT      NOT NULL AUTO_INCREMENT,
  ticket_id        BIGINT      NOT NULL,
  seat_code        VARCHAR(50) NOT NULL,
  seat_status      VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE/HOLD/RESERVED/PAID/CANCELED
  seat_class       VARCHAR(50) NULL,
  hold_until       DATETIME    NULL,
  hold_seat_member VARCHAR(50) NULL,
  created_at       DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (seat_id),
  UNIQUE KEY uk_seat_ticket_code (ticket_id, seat_code),
  CONSTRAINT fk_seat_ticket FOREIGN KEY (ticket_id) REFERENCES ticket(ticket_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_seat_hold_member FOREIGN KEY (hold_seat_member) REFERENCES member(member_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) ORDERS
CREATE TABLE IF NOT EXISTS orders (
  orders_id              BIGINT      NOT NULL AUTO_INCREMENT,
  member_id              VARCHAR(50) NOT NULL,
  orders_total_amount    INT         NOT NULL,             -- ← 순수 스네이크
  orders_ticket_quantity INT         NOT NULL,             -- ← 순수 스네이크
  orders_status          VARCHAR(20) NOT NULL DEFAULT 'CREATED',
  created_at             DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (orders_id),
  CONSTRAINT fk_orders_member FOREIGN KEY (member_id) REFERENCES member(member_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 7) ORDER_TICKET
CREATE TABLE IF NOT EXISTS order_ticket (
  order_ticket_id BIGINT   NOT NULL AUTO_INCREMENT,
  orders_id       BIGINT   NOT NULL,
  seat_id         BIGINT   NOT NULL,
  order_price     INT      NOT NULL,
  order_quantity  INT      NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (order_ticket_id),
  UNIQUE KEY uk_order_ticket_seat (seat_id), -- 한 좌석은 한 주문에만 연결
  CONSTRAINT fk_ot_orders FOREIGN KEY (orders_id) REFERENCES orders(orders_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ot_seat FOREIGN KEY (seat_id) REFERENCES seat(seat_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8) PAY  
CREATE TABLE IF NOT EXISTS pay (
  pay_id          INT         NOT NULL AUTO_INCREMENT,
  member_id       VARCHAR(50) NOT NULL,
  orders_id       BIGINT      NOT NULL,
  pay_method      VARCHAR(50) NOT NULL,                      -- CARD/VBANK/...
  pay_amount      INT         NOT NULL,
  pay_status      VARCHAR(20) NOT NULL DEFAULT 'READY',      -- READY/APPROVED/CANCELED/PARTIAL_REFUND/FAILED
  pg_provider     VARCHAR(50)  NULL,
  pg_tid          VARCHAR(100) NULL,
  approval_no     VARCHAR(100) NULL,
  approved_at     DATETIME     NULL,
  canceled_at     DATETIME     NULL,
  refund_amount   INT          NULL,
  virtual_account VARCHAR(100) NULL,
  va_paid_at      DATETIME     NULL,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (pay_id),
  CONSTRAINT fk_pay_member FOREIGN KEY (member_id) REFERENCES member(member_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pay_orders FOREIGN KEY (orders_id) REFERENCES orders(orders_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9) IMG  (ImageVO/ENUM=ImageType에 맞춰 문자열 저장)
CREATE TABLE IF NOT EXISTS image (
  img_uuid    CHAR(36)     NOT NULL,
  img_ext     VARCHAR(20)  NOT NULL,
  orgin_name  VARCHAR(255) NOT NULL,                         -- (오탈자 유지) 엔티티/매퍼 매핑에 맞춤
  file_name   VARCHAR(255) NOT NULL,
  img_url     VARCHAR(500) NOT NULL,
  img_type    VARCHAR(20)  NOT NULL,                         -- MEMBER_PROFILE/BOARD_IMAGE/TICKET_IMAGE
  img_sort    INT          NULL,
  is_primary  TINYINT(1)   NOT NULL DEFAULT 0,
  board_id    BIGINT       NULL,
  member_id   VARCHAR(50)  NULL,
  ticket_id   BIGINT       NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (img_uuid),
  KEY idx_img_board (board_id),
  KEY idx_img_member (member_id),
  KEY idx_img_ticket (ticket_id),
  CONSTRAINT fk_img_board FOREIGN KEY (board_id) REFERENCES board(board_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_img_member FOREIGN KEY (member_id) REFERENCES member(member_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_img_ticket FOREIGN KEY (ticket_id) REFERENCES ticket(ticket_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10) TOKEN
CREATE TABLE IF NOT EXISTS token (
  token_no     BIGINT       NOT NULL AUTO_INCREMENT,
  member_id    VARCHAR(50)  NOT NULL,
  refreshToken VARCHAR(255) NOT NULL,
  expiresAt    DATETIME     NOT NULL,
  revokedAt    DATETIME     NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (token_no),
  CONSTRAINT fk_token_member FOREIGN KEY (member_id) REFERENCES member(member_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11) BLACKLIST_TOKEN
CREATE TABLE IF NOT EXISTS blacklist_token (
  black_no        BIGINT       NOT NULL AUTO_INCREMENT,
  accessTokenHash VARCHAR(255) NOT NULL,
  expiresAt       DATETIME     NOT NULL,
  PRIMARY KEY (black_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12) BANNER
CREATE TABLE IF NOT EXISTS banner (
  banner_id    BIGINT       NOT NULL AUTO_INCREMENT,
  image_url    VARCHAR(500) NOT NULL,
  link_url     VARCHAR(500) NULL,
  active       TINYINT(1)   NOT NULL DEFAULT 1,
  banner_sort  INT          NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  delete_at    DATETIME     NULL,
  PRIMARY KEY (banner_id),
  KEY idx_banner_active (active),
  KEY idx_banner_sort (banner_sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
