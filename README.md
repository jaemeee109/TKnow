# TKnow
티켓 예매 사이트  Team Project
<p/>2025.10.17~ing

# TKnow Git Flow Guide
<p/>프로젝트명: <TicketNow>
<p/>구조: 단일 모듈(Spring Legacy) + 도메인 단위 패키지 + Core 공용 모듈
<p/>목표: 도메인별 독립 개발 / Core 중심 단방향 구조 / 중앙 통합 관리


# 역할 분담
<p/> <b>이재은</b>
<p/> - 백엔드 : Database·VO 설계, 공통(Image,Paging), Auth(JWT), Board , Order,Pay 모듈
<p/> - 프론트엔드 : React
<p/> - 배포 : AWS EC2
<p/> <b>전혜진</b>
<p/> - 웹디자인 Figma
<p/> <b>박희진</b>
<p/> - 백엔드 : Member· Ticket 모듈
<p/> -   GitHub (충돌 병합 및 버전관리)

  
# 프로젝트 패키지 구조
<p/>com.tknow.ticketnow
<p/>├─ core/
<p/>│  ├─ config/                # Security, JWT, AOP, CORS, Converter 등
<p/>│  ├─ auth/                  # 인증·인가 (Token, BlacklistToken)
<p/>│  ├─ exception/             # 예외 처리 및 ErrorCode
<p/>│  └─ util/ (optional)       # 공용 유틸 (파일, 날짜, 문자열 등)
<p/>│
<p/>└─ modules/
<p/>   ├─ common/                # BaseEntity, ImageEntity, Paging 등 공용 클래스
<p/>   ├─ admin/                 # 관리자 기능 (배너, 통계, 인사, 매출)
<p/>   ├─ member/                # 회원 (로그인, 회원가입)
<p/>   ├─ ticket/                # 공연, 좌석
<p/>  ├─ order/                 # 주문, Order_Ticket
<p/>   ├─ pay/                   # 결제, 환불
<p/>   └─ board/                 # 게시판, 댓글

# 브랜치 구조 
https://github.com/gomong0304/TKnow
<p/>브랜치명	역할	주요 경로
<p/>core	공용 설정 및 인증 관리 (Security/JWT, Exception, DTO 등)	/core/*
<p/>feature/common	공용 엔티티 (BaseEntity, Image 등)	/modules/common/*
<p/>feature/admin	관리자 기능 (배너, 통계 등)	/modules/admin/*
<p/>feature/member	회원 관련	/modules/member/*
<p/>feature/ticket	공연·좌석 관리	/modules/ticket/*
<p/>feature/order	주문 관련	/modules/order/*
<p/>feature/pay	결제 및 환불	/modules/pay/*
<p/>feature/board	게시판 및 댓글	/modules/board/*
<p/>develop	모든 feature 브랜치 통합 테스트용	전체
<p/>main	배포용 안정 브랜치	전체
<p/>front 프론트엔드 코드 전체

# 브랜치 흐름 (단방향)
<p/>front
<p/>feature/*  ───▶  develop  ───▶  main
<p/>     │
<p/>     └──▶  core (read-only)     
<p/>core : 공통 모듈 — 전역 정책 관리 (수정 시 PR + 리뷰 필수)
<p/>feature/* : 각 도메인 담당 개발
<p/>develop : 통합 테스트 / 병합 허브
<p/>main : 운영 배포 전용


# 브랜치 관리 규칙
<p/>구분 규칙
<p/>front 프론트엔드 전용
<p/>core 브랜치	직접 push 금지 / PR + 리뷰 2인 승인 필수
<p/>feature/	자유롭게 생성 및 push 가능
<p/>develop	CI 통과 후만 merge 가능
<p/>main	관리자 승인 전용
<p/>core 버전 태그	core-v1.0.0 형태로 버전 명시
<p/>커밋 메시지	[모듈명] 작업내용 (예: [member] 회원가입 API 추가)

# core 변경 시 주의사항
<p/>core는 모든 브랜치가 의존하는 공통 모듈이므로,
<p/>수정 시 반드시 아래 절차를 거칩니다.
<p/>변경 필요 이슈 등록
<p/>core 담당자 승인
<p/>core 브랜치에서 수정
<p/>버전 태그(core-v1.0.1) 발행
<p/>각 feature 브랜치에서 pull로 반영
