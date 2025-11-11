
*** schema.sql : 초기 DB 세팅 테이블 (수정금지)

*** changelog.md : DB테이블 변경 로그

<작성 예시>
## [2025-10-17] member 테이블에 phone_number 컬럼 추가
ALTER TABLE member ADD COLUMN phone_number VARCHAR(20);
## [2025-10-19] order 테이블의 total_price 컬럼 타입 변경
ALTER TABLE `order` MODIFY total_price DECIMAL(10,2);

Git 에서 pull 받을 때, db 변경 로그 반드시 확인할 것