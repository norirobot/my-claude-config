# 🎓 코딩 멘토링 플랫폼

실시간 C 프로그래밍 학습 및 멘토링을 위한 웹 기반 교육 플랫폼

## 📋 프로젝트 개요

### 🎯 주요 기능
- **실시간 코딩 환경**: Monaco Editor 기반 C 코드 편집기
- **자동 컴파일 및 실행**: 서버에서 C 코드 컴파일 및 결과 반환
- **실시간 모니터링**: 학생 활동 실시간 추적 (Socket.io)
- **문제 관리 시스템**: 차시별 프로그래밍 문제 제공
- **피드백 시스템**: 선생님-학생 간 실시간 피드백
- **진도 관리**: 학생별 학습 진도 추적

### 🏗️ 시스템 아키텍처
```
┌─────────────────┐    HTTP/Socket.io    ┌──────────────────┐
│   Frontend      │◄──────────────────►│     Backend      │
│   (React)       │                     │   (Node.js)      │
│   Port: 3008    │                     │   Port: 3001     │
└─────────────────┘                     └──────────────────┘
                                                  │
                                                  ▼
                                        ┌──────────────────┐
                                        │    SQLite DB     │
                                        │   (database.db)  │
                                        └──────────────────┘
```

## 🚀 빠른 시작

### 📋 사전 요구사항
- Node.js (v14 이상)
- npm (Node Package Manager)
- GCC 컴파일러 (C 코드 컴파일용)

### 💿 설치 및 실행

#### 1️⃣ 프로젝트 클론
```bash
git clone <repository-url>
cd coding_mento
```

#### 2️⃣ 의존성 설치
```bash
# 백엔드 의존성 설치
cd backend
npm install

# 프론트엔드 의존성 설치
cd ../frontend
npm install
```

#### 3️⃣ 서버 실행

**옵션 A: 자동 시작 (권장)**
```bash
# 루트 디렉토리에서
start-server-auto.bat
```

**옵션 B: 수동 시작**
```bash
# 터미널 1 - 백엔드 서버
cd backend
npm start

# 터미널 2 - 프론트엔드 서버
cd frontend
npm run serve
```

#### 4️⃣ 웹 앱 접속
- **학생/관리자 페이지**: http://localhost:3008
- **백엔드 API**: http://localhost:3001

## 👥 사용자 계정

### 🎓 학생 계정
| 학생 ID | 비밀번호 | 이름 | 반 |
|---------|----------|------|-----|
| S001 | 1234 | 김학생 | 월요일반 |
| S002 | 1234 | 이학생 | 월요일반 |
| S003 | 1234 | 박학생 | 화요일반 |
| ronco1 | 1234 | 서현준 | 수요일반 |
| ronco2 | 1234 | 안수아 | 수요일반 |

### 👨‍🏫 관리자 계정
| 사용자명 | 비밀번호 | 권한 |
|----------|----------|------|
| admin | admin123 | 전체 관리 |

## 📚 주요 기능 가이드

### 🧑‍💻 학생 기능

#### 로그인 및 문제 선택
1. 학생 ID와 비밀번호로 로그인
2. 차시별 문제 목록에서 원하는 문제 선택
3. Monaco Editor에서 C 코드 작성

#### 코드 편집 및 실행
- **자동 저장**: 코드 변경 시 자동으로 저장됨
- **컴파일 실행**: `실행` 버튼으로 코드 컴파일 및 실행
- **결과 확인**: 컴파일 결과와 실행 결과를 실시간으로 확인

#### 도움 요청
- **도움 요청**: 막힐 때 선생님에게 도움 요청 가능
- **실시간 피드백**: 선생님으로부터 실시간 피드백 수신

### 👨‍🏫 관리자 기능

#### 학생 모니터링
- **실시간 현황**: 모든 학생의 현재 활동 상태 확인
- **코드 확인**: 학생이 작성 중인 코드 실시간 조회
- **진도 추적**: 학생별 문제 해결 진도 확인

#### 문제 관리
- **문제 추가/수정**: 새로운 프로그래밍 문제 생성 및 편집
- **차시 관리**: 레슨별 문제 분류 및 관리
- **채점 기준**: 예상 출력값 설정 및 채점 기준 관리

#### 피드백 시스템
- **실시간 메시지**: 학생에게 실시간 메시지 전송
- **도움 요청 관리**: 학생의 도움 요청에 대한 응답

## 🛠️ 개발자 가이드

### 📁 프로젝트 구조
```
coding_mento/
├── backend/                     # Node.js 백엔드
│   ├── src/
│   │   ├── server.js           # 메인 서버 파일
│   │   ├── database.db         # SQLite 데이터베이스
│   │   └── temp/               # 임시 컴파일 파일
│   └── package.json
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── App.js              # 메인 React 컴포넌트
│   │   ├── AdminPanel.js       # 관리자 패널
│   │   ├── StudentDashboard.js # 학생 대시보드
│   │   └── GameMap.js          # 게임 맵 컴포넌트
│   └── package.json
├── temp_files/                  # 테스트/디버그 파일들
├── CURRENT_FEATURES.md          # 현재 기능 문서
├── DATABASE_SCHEMA.md           # 데이터베이스 스키마
└── start-server-auto.bat       # 자동 시작 스크립트
```

### 🔧 개발 환경 설정

#### 백엔드 개발
```bash
cd backend
npm run dev    # nodemon으로 개발 서버 실행 (자동 재시작)
```

#### 프론트엔드 개발
```bash
cd frontend
npm run serve  # React 개발 서버 실행 (Hot Reload)
```

### 🧪 테스트
```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd frontend
npm test
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- **students**: 학생 정보 및 로그인 데이터
- **problems**: 프로그래밍 문제 데이터
- **student_code**: 학생이 작성한 코드 저장
- **feedback**: 선생님 피드백 데이터
- **help_requests**: 학생 도움 요청 데이터
- **lessons**: 차시 정보
- **live_messages**: 실시간 메시지 데이터
- **problem_status**: 학생별 문제 해결 상태
- **users**: 관리자 계정 정보

상세한 스키마 정보는 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) 참조

## 🔌 API 엔드포인트

### 인증 API
- `POST /api/login` - 학생/관리자 로그인
- `POST /api/logout` - 로그아웃

### 학생 API
- `GET /api/students` - 학생 목록 조회
- `GET /api/problems` - 문제 목록 조회
- `POST /api/student-code` - 학생 코드 저장
- `POST /api/compile` - 코드 컴파일 및 실행

### 관리자 API
- `GET /api/admin/students-code` - 모든 학생 코드 조회
- `POST /api/admin/send-message` - 학생에게 메시지 전송
- `POST /api/admin/problems` - 문제 생성/수정

### 실시간 통신 (Socket.io)
- `studentUpdate` - 학생 상태 업데이트
- `codeUpdate` - 코드 변경 알림
- `helpRequest` - 도움 요청
- `adminMessage` - 관리자 메시지

## 🔒 보안 고려사항

### 인증 및 권한
- 학생/관리자 계정 분리
- 세션 기반 인증
- CORS 설정으로 도메인 제한

### 코드 실행 보안
- 임시 디렉토리에서 컴파일 실행
- 실행 시간 제한 (5초)
- 메모리 사용량 제한

## 🚀 배포 가이드

### 프로덕션 빌드
```bash
# 프론트엔드 빌드
cd frontend
npm run build

# 빌드 결과물을 백엔드에 복사
cp -r build/* ../backend/public/
```

### 환경 변수 설정
```bash
# backend/.env
NODE_ENV=production
PORT=3001
DB_PATH=./database.db
```

## 🛠️ 문제 해결

### 일반적인 문제들

#### 서버 시작 오류
```bash
# 포트 충돌 확인
netstat -ano | findstr :3001
netstat -ano | findstr :3008

# 프로세스 종료
taskkill /PID <PID> /F
```

#### 컴파일 오류
- GCC 컴파일러 설치 확인
- 임시 디렉토리 권한 확인
- Windows Defender 방화벽 예외 설정

#### 데이터베이스 오류
```bash
# 데이터베이스 백업
cp backend/database.db backend/database.db.backup

# 권한 확인
chmod 666 backend/database.db
```

## 📝 변경 이력

### v1.0.0 (2025-09-19)
- ✅ 초기 프로젝트 설정 완료
- ✅ Step 1: 완전한 기능 문서화 완료
- ✅ Step 2: 안전한 파일 정리 완료
- 🔄 Step 3: 핵심 문서화 진행 중

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면:
- 이슈 트래커를 사용해 주세요
- 이메일: [개발자 이메일]
- 문서: 프로젝트 내 마크다운 파일들을 참조하세요

---

**마지막 업데이트**: 2025-09-19
**프로젝트 상태**: 안정적인 개발 환경 구축 완료