# 🗄️ 데이터베이스 스키마 문서

> **작성일**: 2025-09-19  
> **목적**: 현재 DB 구조 보존 및 안전한 개선을 위한 참조 문서

## 📊 테이블 개요

### 🔐 인증 관련
- **users**: 통합 로그인 계정 (학생 + 관리자)
- **students**: 학생 상세 정보 및 학습 상태
- **admins**: 관리자 전용 계정

### 📚 학습 관련  
- **problems**: 문제 데이터
- **lessons**: 차시별 수업 정보
- **problem_solutions**: 학생별 문제 풀이 현황

### 💬 소통 관련
- **feedbacks**: 관리자 피드백
- **help_requests**: 학생 도움 요청
- **live_messages**: 실시간 메시지

## 📋 상세 스키마

### 🔐 users (통합 계정)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,        -- 로그인 ID
    password TEXT NOT NULL,               -- 비밀번호
    name TEXT NOT NULL,                   -- 실명
    role TEXT DEFAULT 'student',          -- 'student' | 'teacher'
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```
**현재 데이터**: 6개 (admin + student1~5)

### 👥 students (학생 상세정보)
```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                   -- 학생 이름
    studentId TEXT UNIQUE NOT NULL,       -- 학번 (S001, ronco1 등)
    class TEXT DEFAULT '월요일반',         -- 수업 반
    progress INTEGER DEFAULT 0,           -- 진도율
    currentProblem TEXT DEFAULT '1번',     -- 현재 풀고 있는 문제
    status TEXT DEFAULT 'offline',        -- 접속 상태
    code TEXT DEFAULT '# 여기에 코드를 작성하세요', -- 현재 코드
    lastActive TEXT DEFAULT CURRENT_TIMESTAMP,  -- 마지막 접속
    needsHelp INTEGER DEFAULT 0,          -- 도움 요청 여부
    joinDate TEXT DEFAULT CURRENT_DATE    -- 가입일
);
```
**현재 데이터**: 5개 (김학생, 이학생, 박학생, 서현준, 안수아)

### 📚 problems (문제 데이터)
```sql
CREATE TABLE problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                  -- 문제 제목
    description TEXT NOT NULL,            -- 문제 설명
    lesson INTEGER,                       -- 차시 (1, 2, 3 등)
    expectedOutput TEXT,                  -- 예상 출력
    starterCode TEXT,                     -- 시작 코드
    language TEXT DEFAULT 'c',           -- 언어 (c)
    difficulty TEXT DEFAULT 'beginner',   -- 난이도
    category TEXT DEFAULT 'basic',        -- 카테고리
    isActive INTEGER DEFAULT 1,          -- 활성화 여부
    inputExample TEXT,                    -- 입력 예시
    outputExample TEXT,                   -- 출력 예시  
    hints TEXT,                          -- 힌트
    updatedAt TEXT,                      -- 수정일
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```
**현재 데이터**: 10개 문제

### ⭐ problem_solutions (풀이 현황)
```sql
CREATE TABLE problem_solutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER NOT NULL,           -- 학생 ID
    problemId INTEGER NOT NULL,           -- 문제 ID
    status TEXT DEFAULT 'solving',        -- 'solving' | 'solved'
    stars INTEGER DEFAULT 0,             -- 0: 해결중, 1-3: 별점
    code TEXT,                           -- 제출한 코드
    submittedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES students(id),
    FOREIGN KEY(problemId) REFERENCES problems(id),
    UNIQUE(studentId, problemId)
);
```

### 📝 lessons (차시 정보)
```sql
CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER UNIQUE NOT NULL,       -- 차시 번호
    name TEXT NOT NULL,                   -- 차시 이름
    description TEXT,                     -- 차시 설명
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 💬 feedbacks (피드백)
```sql
CREATE TABLE feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER NOT NULL,           -- 피드백 받을 학생
    problemId INTEGER,                    -- 관련 문제 (선택)
    adminId INTEGER NOT NULL,             -- 피드백 작성자
    message TEXT NOT NULL,                -- 피드백 내용
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students (id),
    FOREIGN KEY (problemId) REFERENCES problems (id),
    FOREIGN KEY (adminId) REFERENCES admins (id)
);
```

### 🆘 help_requests (도움 요청)
```sql
CREATE TABLE help_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,            -- 요청 학생
  studentName TEXT NOT NULL,             -- 학생 이름
  problemId INTEGER NOT NULL,            -- 관련 문제
  problemTitle TEXT NOT NULL,            -- 문제 제목
  message TEXT NOT NULL,                 -- 요청 메시지
  code TEXT,                            -- 현재 코드
  timestamp TEXT NOT NULL,              -- 요청 시간
  status TEXT DEFAULT 'pending',         -- 'pending' | 'resolved'
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 💭 live_messages (실시간 메시지)
```sql
CREATE TABLE live_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,            -- 메시지 대상 학생
  adminId INTEGER DEFAULT 1,             -- 메시지 보낸 관리자
  message TEXT NOT NULL,                 -- 메시지 내용
  timestamp TEXT NOT NULL,              -- 전송 시간
  isRead INTEGER DEFAULT 0,             -- 읽음 여부
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## ⚠️ 주의사항

### 🔴 중복 인증 시스템
- **users 테이블**: student1~5 (비밀번호: 1234)
- **students 테이블**: S001~S003, ronco1~2 (비밀번호: 1234)
- **현재 서버는 students 테이블을 우선 사용**

### 🟡 데이터 일관성
- students.studentId와 users.username이 다름
- 일부 외래키 제약조건이 누락될 수 있음

### 🟢 안전한 데이터
- **절대 삭제하면 안 되는 데이터**:
  - problems 테이블의 10개 문제
  - students 테이블의 5명 학생 정보
  - 기존 problem_solutions 데이터

## 📊 현재 데이터 현황

### 학생 계정 (students 테이블)
```
ID  이름    학번     반        진도   현재문제
3   박학생   S003    수요일반   20     2번
16  서현준   ronco1  월요일반   0      1번  
17  안수아   ronco2  월요일반   0      1번
18  김학생   S001    월요일반   15     1번
19  이학생   S002    화요일반   12     1번
```

### 문제 목록 (problems 테이블)
```
ID  차시  제목
7   null  줄바꿈 문자 사용하기
1   1     Hello World
2   1     변수 출력하기  
3   1     간단한 인사
10  1     Hello RONCO World! 출력하기
4   2     정수 변수 출력
5   2     Hello World 출력하기
6   2     실수 변수 출력
8   3     뺄셈 계산
9   3     곱셈 계산
```

## 🔧 향후 개선 계획
1. **인증 시스템 통합**: users와 students 테이블 일원화
2. **외래키 정리**: 참조 무결성 강화  
3. **인덱스 추가**: 성능 최적화
4. **데이터 정규화**: 중복 데이터 제거