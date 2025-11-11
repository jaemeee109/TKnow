# TKnow
티켓 예매 사이트 Team Project

# TKnow Git Flow Guide
프로젝트명: TKnow
구조: 단일 모듈(Spring Boot) + 도메인 단위 패키지 + Core 공용 모듈
목표: 도메인별 독립 개발 / Core 중심 단방향 구조 / 중앙 통합 관리

# 프로젝트 패키지 구조
com.tknow.ticketnow
├─ core/
│  ├─ config/                # Security, JWT, AOP, CORS, Converter 등
│  ├─ auth/                  # 인증·인가 (Token, BlacklistToken)
│  ├─ exception/             # 예외 처리 및 ErrorCode
│  └─ util/ (optional)       # 공용 유틸 (파일, 날짜, 문자열 등)
│
└─ modules/
   ├─ common/                # BaseEntity, ImageEntity, Paging 등 공용 클래스
   ├─ admin/                 # 관리자 기능 (배너, 통계, 인사, 매출)
   ├─ member/                # 회원 (로그인, 회원가입)
   ├─ ticket/                # 공연, 좌석
   ├─ order/                 # 주문, Order_Ticket
   ├─ pay/                   # 결제, 환불
   └─ board/                 # 게시판, 댓글

# 브랜치 구조
브랜치명	역할	주요 경로
core	공용 설정 및 인증 관리 (Security/JWT, Exception, DTO 등)	/core/*
feature/common	공용 엔티티 (BaseEntity, Image 등)	/modules/common/*
feature/admin	관리자 기능 (배너, 통계 등)	/modules/admin/*
feature/member	회원 관련	/modules/member/*
feature/ticket	공연·좌석 관리	/modules/ticket/*
feature/order	주문 관련	/modules/order/*
feature/pay	결제 및 환불	/modules/pay/*
feature/board	게시판 및 댓글	/modules/board/*
develop	모든 feature 브랜치 통합 테스트용	전체
main	배포용 안정 브랜치	전체

# 브랜치 흐름 (단방향)
feature/*  ───▶  develop  ───▶  main
     │
     └──▶  core (read-only)     
core : 공통 모듈 — 전역 정책 관리 (수정 시 PR + 리뷰 필수)
feature/* : 각 도메인 담당 개발
develop : 통합 테스트 / 병합 허브
main : 운영 배포 전용


# 브랜치 관리 규칙
구분 규칙
core 브랜치	직접 push 금지 / PR + 리뷰 2인 승인 필수
feature/	자유롭게 생성 및 push 가능
develop	CI 통과 후만 merge 가능
main	관리자 승인 전용
core 버전 태그	core-v1.0.0 형태로 버전 명시
커밋 메시지	[모듈명] 작업내용 (예: [member] 회원가입 API 추가)

# core 변경 시 주의사항
core는 모든 브랜치가 의존하는 공통 모듈이므로,
수정 시 반드시 아래 절차를 거칩니다.
변경 필요 이슈 등록
core 담당자 승인
core 브랜치에서 수정
버전 태그(core-v1.0.1) 발행
각 feature 브랜치에서 pull로 반영
