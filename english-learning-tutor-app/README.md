# 🎓 English Learning & Tutor Connection Hybrid App

> AI 기반 영어 학습과 실제 튜터 매칭을 결합한 하이브리드 언어 학습 플랫폼  
> **특징**: 상황별 실전 대화 중심, 대구 지역 특화 → 전국 → 글로벌 확장

## 🌟 핵심 차별화 기능

### 🎭 상황별 실전 대화 시스템
- **랜덤 상황 전환**: 인사 → 주문 → 길찾기 등 예측불가 상황 연습
- **즉석 응답 훈련**: 배운 표현을 바로 실전에서 활용
- **대구 특화 콘텐츠**: 지역 문화와 방언까지 고려한 학습
- **패턴 학습**: AI가 개인별 응답 패턴 분석 후 맞춤 추천

### 🤖 AI 발음 교정 (Logan's Technology)
- 실시간 발음 패턴 오류 검출
- 개인별 취약점 분석 및 피드백
- 반복 학습을 통한 자동화 습득

### 👥 네이티브 스피커 연결 (Jennifer's Vision)
- AI 학습 완료 후 실제 대화 연결
- 실시간 화상/음성 통화 시스템
- 학습 데이터 기반 레벨 매칭

### 🏆 게임화 시스템
- 포인트 경제와 성취 시스템
- 실시간 진도 가시화
- 건전한 경쟁과 동기부여

## 🎯 단계별 출시 전략

### Phase 1: 대구 지역 테스트 (100% 무료)
- 대구 거주자 대상 베타 테스트
- 모든 핵심 기능 무료 제공
- 사용자 만족도 및 학습 효과 검증

### Phase 2: 전국 확장 (Freemium 도입)
- 기본 기능 무료 + 프리미엄 기능 유료
- 네이티브 튜터 매칭 확대
- 고급 학습 분석 기능

### Phase 3: 글로벌 진출
- 다국가 서비스 확장
- B2B 기업 교육 솔루션
- 다언어 지원

## 🛠 기술 스택

- **Frontend**: React Native + Expo
- **Backend**: Node.js + Express + PostgreSQL + Redis
- **AI Service**: Python + FastAPI + OpenAI API
- **Real-time**: WebRTC + Socket.io
- **Infrastructure**: Docker + AWS
- **CI/CD**: GitHub Actions

## 📁 프로젝트 구조

```
english-learning-tutor-app/
├── frontend/                 # React Native 앱
├── backend/                  # Node.js API 서버
├── ai-service/              # Python AI 분석 서비스
├── database/                # PostgreSQL 스키마 & 초기 데이터
├── docs/                    # 설계 문서
├── docker-compose.dev.yml   # 개발 환경
└── .env.example            # 환경 변수 예시
```

## 🚀 개발 시작하기

### 1. 환경 설정
```bash
# 저장소 클론
git clone [repository-url]
cd english-learning-tutor-app

# 환경 변수 설정
cp .env.example .env
# .env 파일에 필요한 값들 입력 (OpenAI API Key 등)
```

### 2. Docker로 백엔드 실행
```bash
# 데이터베이스 및 API 서버 시작
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f
```

### 3. React Native 앱 실행
```bash
cd frontend
npm install
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android
```

### 4. API 엔드포인트 테스트
```bash
# 헬스체크
curl http://localhost:3000/health

# 회원가입 테스트
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","username":"testuser","displayName":"Test User"}'
```

## 📊 UI/UX 설계 철학

### 구글 홈페이지 스타일 단순함
- **화이트 스페이스 활용**: 깔끔하고 집중도 높은 레이아웃
- **원클릭 접근**: 핵심 기능까지 3초 내 접근 가능
- **직관적 인터페이스**: 복잡하지 않으면서 효과적인 구조

### 재미와 성장 가시화
- **실시간 진도바**: 일일 학습 목표와 달성도 표시
- **즉시 피드백**: 성취 순간의 축하 애니메이션
- **개인별 대시보드**: 발전 모습을 명확히 볼 수 있는 시각화

## 📋 주요 문서

- [📋 BUSINESS_REQUIREMENTS.md](docs/BUSINESS_REQUIREMENTS.md) - 비즈니스 요구사항
- [🛠️ FEATURE_SPECIFICATION.md](docs/FEATURE_SPECIFICATION.md) - 기능 상세 설계
- [🏗️ TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) - 기술 아키텍처
- [🗄️ DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) - 데이터베이스 설계
- [🎨 UIUX_DESIGN.md](docs/UIUX_DESIGN.md) - UI/UX 가이드라인
- [🚀 ROLLOUT_STRATEGY.md](docs/ROLLOUT_STRATEGY.md) - 출시 전략

## 🎯 성공 지표

### Phase 1 (대구 테스트)
- 앱스토어 평점: 4.8+ ⭐
- 일일 활성 사용자: 70%+ 리텐션
- 네이티브 매칭 성공률: 80%+

### Phase 2 (전국 확장)
- 월간 활성 사용자 증가율: 50%+
- 유료 전환율: 15%+
- 학습 완료율: 70%+

### Phase 3 (글로벌)
- 해외 사용자 비율: 30%+
- B2B 매출 비중: 40%+
- 브랜드 인지도: Top 5 영어 학습 앱

## 👥 팀 구성

- **Logan**: AI 발음 교정 기술 개발
- **Jennifer**: 네이티브 스피커 매칭 시스템
- **개발팀**: 풀스택 개발 및 인프라 구축

## 📞 연락처

- **이슈 및 버그 리포트**: GitHub Issues
- **기능 제안**: GitHub Discussions
- **문의**: [이메일 주소]

---

**🏁 개발 현황**: 설계 완료 (45%) → MVP 개발 진행 중  
**📅 개발 시작일**: 2025-08-28  
**🎯 예상 완료**: 2025-11-15  
**🌍 첫 출시 지역**: 대구광역시