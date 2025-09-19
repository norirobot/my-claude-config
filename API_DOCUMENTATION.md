# 🔌 API 문서

코딩 멘토링 플랫폼의 REST API 및 Socket.io 이벤트 문서

## 📋 개요

- **Base URL**: `http://localhost:3001`
- **API Prefix**: `/api`
- **Content-Type**: `application/json`
- **실시간 통신**: Socket.io (포트 3001)

## 🔐 인증 API

### POST /api/login
사용자(학생/관리자) 로그인

**Request Body:**
```json
{
  "username": "S001",
  "password": "1234",
  "type": "student"  // "student" | "admin"
}
```

**Response (성공):**
```json
{
  "success": true,
  "user": {
    "id": 18,
    "name": "김학생",
    "studentId": "S001",
    "class": "월요일반",
    "progress": 15,
    "currentProblem": "1번",
    "userType": "student"
  }
}
```

**Response (실패):**
```json
{
  "success": false,
  "message": "잘못된 학번 또는 비밀번호입니다."
}
```

### POST /api/logout
사용자 로그아웃

**Response:**
```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

## 👥 학생 관리 API

### GET /api/students
모든 학생 목록 조회

**Response:**
```json
[
  {
    "id": 18,
    "name": "김학생",
    "studentId": "S001",
    "class": "월요일반",
    "progress": 15,
    "currentProblem": "1번",
    "status": "online",
    "lastActive": "2025-09-19 08:09:29",
    "needsHelp": 0
  }
]
```

### POST /api/identify-student
학생 연결 상태 등록 (Socket.io 연결 시 사용)

**Request Body:**
```json
{
  "studentId": 18,
  "userType": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "학생 연결 상태가 등록되었습니다."
}
```

## 📚 문제 관리 API

### GET /api/problems
활성화된 문제 목록 조회 (학생용)

**Query Parameters:**
- `lesson` (optional): 특정 차시 문제만 조회

**Response:**
```json
[
  {
    "id": 1,
    "title": "Hello World",
    "description": "\"Hello World\"를 출력하는 프로그램을 작성하세요.",
    "lesson": 1,
    "expectedOutput": "Hello World",
    "starterCode": "#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 입력하세요\n    return 0;\n}",
    "language": "c",
    "difficulty": "beginner",
    "category": "basic",
    "inputExample": "-",
    "outputExample": "Hello World",
    "hints": "printf(\"내용\"); 형태로 작성하세요."
  }
]
```

### GET /api/admin/problems
모든 문제 목록 조회 (관리자용)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Hello World",
    "description": "문제 설명",
    "lesson": 1,
    "expectedOutput": "Hello World",
    "starterCode": "기본 코드",
    "language": "c",
    "difficulty": "beginner",
    "category": "basic",
    "isActive": 1,
    "createdAt": "2025-09-03 06:47:58",
    "updatedAt": "2025-09-03 07:45:17"
  }
]
```

### POST /api/admin/problems
새 문제 생성 또는 기존 문제 수정

**Request Body:**
```json
{
  "title": "새로운 문제",
  "description": "문제 설명",
  "lesson": 1,
  "expectedOutput": "예상 출력",
  "starterCode": "기본 코드",
  "language": "c",
  "difficulty": "beginner",
  "category": "basic",
  "hints": "힌트 내용"
}
```

**Response:**
```json
{
  "success": true,
  "problemId": 11,
  "message": "문제가 성공적으로 생성되었습니다."
}
```

## 💻 코드 관리 API

### GET /api/admin/students-code
모든 학생의 코드 현황 조회 (관리자용)

**Response:**
```json
[
  {
    "studentId": 18,
    "studentName": "김학생",
    "problemCount": 2,
    "problems": [
      {
        "problemId": 1,
        "problemTitle": "Hello World",
        "code": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello World\");\n    return 0;\n}",
        "lastModified": "2025-09-19 08:10:15"
      }
    ]
  }
]
```

### POST /api/student-code
학생 코드 저장

**Request Body:**
```json
{
  "studentId": 18,
  "problemId": 1,
  "code": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello World\");\n    return 0;\n}"
}
```

**Response:**
```json
{
  "success": true,
  "message": "코드가 저장되었습니다."
}
```

### POST /api/compile
C 코드 컴파일 및 실행

**Request Body:**
```json
{
  "code": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello World\");\n    return 0;\n}",
  "problemId": 1,
  "studentId": 18
}
```

**Response (성공):**
```json
{
  "success": true,
  "output": "Hello World",
  "executionTime": "0.002s",
  "memoryUsage": "1.2MB"
}
```

**Response (컴파일 오류):**
```json
{
  "success": false,
  "error": "컴파일 오류",
  "details": "main.c:4:5: error: expected ';' before 'return'"
}
```

## 📊 학습 현황 API

### GET /api/lessons
차시 목록 조회

**Response:**
```json
[
  {
    "id": 1,
    "title": "기초 문법",
    "description": "C언어 기초 문법 학습",
    "problemCount": 4,
    "isActive": 1
  }
]
```

### GET /api/student/:studentId/problem-status
학생의 문제 해결 상태 조회

**Response:**
```json
[
  {
    "problemId": 1,
    "problemTitle": "Hello World",
    "status": "completed",  // "not_started" | "in_progress" | "completed"
    "score": 100,
    "attempts": 3,
    "lastSubmitted": "2025-09-19 08:15:30"
  }
]
```

## 💬 피드백 및 메시징 API

### GET /api/feedback/latest/:studentId
학생의 최신 피드백 조회

**Response:**
```json
{
  "id": 1,
  "studentId": 18,
  "problemId": 1,
  "feedback": "잘했습니다! 다음 문제로 넘어가세요.",
  "score": 100,
  "createdAt": "2025-09-19 08:20:15"
}
```

### POST /api/feedback
피드백 저장 (관리자용)

**Request Body:**
```json
{
  "studentId": 18,
  "problemId": 1,
  "feedback": "코드가 정확합니다. 다음 문제에 도전해보세요!",
  "score": 95
}
```

### GET /api/live-messages/:studentId
학생의 실시간 메시지 조회

**Response:**
```json
[
  {
    "id": 1,
    "studentId": 18,
    "message": "질문이 있습니다.",
    "type": "student",  // "student" | "admin"
    "timestamp": "2025-09-19 08:25:10",
    "isRead": 0
  }
]
```

### POST /api/live-messages
실시간 메시지 전송

**Request Body:**
```json
{
  "studentId": 18,
  "message": "도움이 필요합니다.",
  "type": "student"
}
```

## 🆘 도움 요청 API

### GET /api/help-requests
모든 도움 요청 조회 (관리자용)

**Response:**
```json
[
  {
    "id": 1,
    "studentId": 18,
    "studentName": "김학생",
    "problemId": 1,
    "problemTitle": "Hello World",
    "message": "컴파일 오류가 발생합니다.",
    "status": "pending",  // "pending" | "resolved"
    "createdAt": "2025-09-19 08:30:00",
    "resolvedAt": null
  }
]
```

### POST /api/help-requests
도움 요청 생성 (학생용)

**Request Body:**
```json
{
  "studentId": 18,
  "problemId": 1,
  "message": "이 문제를 어떻게 해결해야 할지 모르겠습니다."
}
```

### PUT /api/help-requests/:id
도움 요청 상태 변경 (관리자용)

**Request Body:**
```json
{
  "status": "resolved",
  "response": "printf 함수를 사용해서 문자열을 출력하세요."
}
```

## 🔄 Socket.io 이벤트

### 클라이언트 → 서버

#### studentUpdate
학생 상태 업데이트
```javascript
socket.emit('studentUpdate', {
  studentId: 18,
  status: 'online',
  currentProblem: 1,
  activity: 'coding'
});
```

#### codeUpdate
코드 변경 알림
```javascript
socket.emit('codeUpdate', {
  studentId: 18,
  problemId: 1,
  code: '#include <stdio.h>...',
  timestamp: '2025-09-19T08:35:00.000Z'
});
```

#### studentScreenUpdate
학생 화면 상태 업데이트
```javascript
socket.emit('studentScreenUpdate', {
  studentId: 18,
  studentName: '김학생',
  currentScreen: 'problem',
  selectedProblem: {
    id: 1,
    title: 'Hello World'
  },
  code: 'current code...',
  currentLesson: 1,
  timestamp: '2025-09-19T08:35:00.000Z'
});
```

#### helpRequest
도움 요청
```javascript
socket.emit('helpRequest', {
  studentId: 18,
  problemId: 1,
  message: '도움이 필요합니다.'
});
```

### 서버 → 클라이언트

#### studentStatusUpdate
학생 상태 변경 브로드캐스트
```javascript
// 관리자에게 전송
socket.broadcast.emit('studentStatusUpdate', {
  studentId: 18,
  studentName: '김학생',
  status: 'online',
  currentProblem: 1
});
```

#### codeChange
코드 변경 브로드캐스트
```javascript
// 관리자에게 전송
socket.broadcast.emit('codeChange', {
  studentId: 18,
  studentName: '김학생',
  codeLength: 156,
  timestamp: '2025-09-19T08:35:00.000Z'
});
```

#### adminMessage
관리자 메시지
```javascript
// 특정 학생에게 전송
socket.to(studentSocketId).emit('adminMessage', {
  message: '코드가 잘 작성되고 있습니다!',
  type: 'feedback',
  timestamp: '2025-09-19T08:35:00.000Z'
});
```

#### newHelpRequest
새로운 도움 요청
```javascript
// 관리자에게 전송
socket.broadcast.emit('newHelpRequest', {
  studentId: 18,
  studentName: '김학생',
  problemId: 1,
  message: '도움이 필요합니다.',
  timestamp: '2025-09-19T08:35:00.000Z'
});
```

## 🚫 오류 코드

### HTTP 상태 코드
- `200`: 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류

### 커스텀 오류 메시지
```json
{
  "success": false,
  "error": "COMPILATION_ERROR",
  "message": "컴파일 오류가 발생했습니다.",
  "details": "구체적인 오류 내용"
}
```

### 일반적인 오류 타입
- `INVALID_CREDENTIALS`: 잘못된 로그인 정보
- `COMPILATION_ERROR`: C 코드 컴파일 오류
- `RUNTIME_ERROR`: 코드 실행 오류
- `DATABASE_ERROR`: 데이터베이스 연결/쿼리 오류
- `PERMISSION_DENIED`: 권한 부족
- `RESOURCE_NOT_FOUND`: 요청한 리소스 없음

## 🔧 개발자 노트

### Rate Limiting
- 컴파일 API: 학생당 분당 10회 제한
- 로그인 API: IP당 분당 5회 제한

### CORS 설정
```javascript
// 허용된 도메인
const allowedOrigins = [
  'http://localhost:3008',
  'http://localhost:3000',
  'http://127.0.0.1:3008'
];
```

### Socket.io 네임스페이스
- `/`: 기본 네임스페이스 (모든 통신)
- 향후 확장 시 `/admin`, `/student` 네임스페이스 분리 고려

### 데이터베이스 연결
- SQLite 파일: `backend/database.db`
- 연결 풀링: 자동 관리
- 트랜잭션: 중요한 업데이트 시 사용

---

**마지막 업데이트**: 2025-09-19
**API 버전**: v1.0.0