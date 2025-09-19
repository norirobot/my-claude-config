# 🛠️ 개발 가이드

코딩 멘토링 플랫폼 개발을 위한 워크플로우 및 모범 사례

## 📋 개발 환경 설정

### 🔧 필수 도구
- **Node.js**: v14 이상
- **npm**: Node Package Manager
- **Git**: 버전 관리
- **VS Code**: 권장 에디터
- **GCC**: C 코드 컴파일용

### 🎯 권장 VS Code 확장
```json
{
  "recommendations": [
    "ms-vscode.vscode-node-debug2",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 🏗️ 프로젝트 초기 설정
```bash
# 1. 저장소 클론
git clone <repository-url>
cd coding_mento

# 2. 백엔드 설정
cd backend
npm install
cp .env.example .env  # 환경 변수 설정

# 3. 프론트엔드 설정
cd ../frontend
npm install

# 4. 개발 서버 실행 테스트
npm test  # 모든 테스트 실행
```

## 🔄 개발 워크플로우

### 🚀 일일 개발 시작
```bash
# 1. 최신 코드 가져오기
git pull origin master

# 2. 의존성 업데이트 확인
npm install  # backend, frontend 각각

# 3. 개발 서버 시작
# 옵션 A: 자동 시작
./start-server-auto.bat

# 옵션 B: 수동 시작
cd backend && npm run dev &
cd frontend && npm run serve &
```

### 📝 기능 개발 프로세스

#### 1단계: 기능 계획
```markdown
## 새 기능 체크리스트
- [ ] 요구사항 명확화
- [ ] 기존 코드 패턴 분석
- [ ] API 설계 (필요시)
- [ ] 데이터베이스 스키마 검토
- [ ] 테스트 시나리오 작성
```

#### 2단계: 브랜치 생성
```bash
# 기능별 브랜치 생성
git checkout -b feature/새기능명
git checkout -b bugfix/버그수정명
git checkout -b refactor/리팩토링내용
```

#### 3단계: 코드 작성
```bash
# TDD 방식 권장
1. 테스트 작성 (실패하는 테스트)
2. 최소 구현 (테스트 통과)
3. 리팩토링 (코드 개선)
4. 반복
```

#### 4단계: 코드 검증
```bash
# 백엔드 검증
cd backend
npm test              # 유닛 테스트
npm run lint          # 코드 스타일 검사
npm run security      # 보안 검사

# 프론트엔드 검증
cd frontend
npm test              # React 테스트
npm run lint          # ESLint 검사
npm run build         # 빌드 테스트
```

#### 5단계: 커밋 및 푸시
```bash
# 의미있는 커밋 메시지
git add .
git commit -m "feat: 새로운 실시간 채팅 기능 추가

- Socket.io 기반 실시간 메시징 구현
- 관리자-학생 간 1:1 채팅 지원
- 메시지 저장 및 히스토리 기능
- 읽음 상태 표시 기능

Closes #123"

git push origin feature/새기능명
```

## 📏 코딩 스타일 가이드

### 🎨 코드 포맷팅

#### JavaScript (Backend)
```javascript
// 함수 명명: camelCase
function getUserData(userId) {
  // 상수: UPPER_SNAKE_CASE
  const MAX_RETRY_COUNT = 3;

  // 변수: camelCase
  const userData = {};

  // 2스페이스 들여쓰기
  if (userId) {
    return userData;
  }

  return null;
}

// 화살표 함수 사용 권장
const processData = (data) => {
  return data.map(item => item.value);
};
```

#### React (Frontend)
```jsx
// 컴포넌트: PascalCase
const StudentDashboard = () => {
  // Hook 사용
  const [students, setStudents] = useState([]);

  // 이벤트 핸들러: handle prefix
  const handleStudentClick = (studentId) => {
    console.log(`Student ${studentId} clicked`);
  };

  // JSX 정리
  return (
    <div className="dashboard">
      {students.map(student => (
        <StudentCard
          key={student.id}
          student={student}
          onClick={handleStudentClick}
        />
      ))}
    </div>
  );
};
```

### 📁 파일 구조 규칙

#### 백엔드 구조
```
backend/
├── src/
│   ├── controllers/    # 컨트롤러 (API 엔드포인트)
│   ├── services/       # 비즈니스 로직
│   ├── models/         # 데이터 모델
│   ├── middleware/     # 미들웨어
│   ├── utils/          # 유틸리티 함수
│   └── config/         # 설정 파일
├── tests/              # 테스트 파일
└── docs/               # API 문서
```

#### 프론트엔드 구조
```
frontend/src/
├── components/         # 재사용 가능한 컴포넌트
│   ├── common/        # 공통 컴포넌트
│   ├── forms/         # 폼 컴포넌트
│   └── ui/            # UI 컴포넌트
├── pages/             # 페이지 컴포넌트
├── hooks/             # 커스텀 Hook
├── services/          # API 서비스
├── utils/             # 유틸리티 함수
└── styles/            # 스타일 파일
```

## 🧪 테스트 전략

### 🎯 테스트 피라미드

#### 단위 테스트 (70%)
```javascript
// backend/tests/unit/userService.test.js
const userService = require('../../src/services/userService');

describe('UserService', () => {
  test('should return user data for valid ID', async () => {
    const userId = 1;
    const result = await userService.getUserById(userId);

    expect(result).toBeDefined();
    expect(result.id).toBe(userId);
  });
});
```

#### 통합 테스트 (20%)
```javascript
// backend/tests/integration/api.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/login', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'S001',
        password: '1234',
        type: 'student'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

#### E2E 테스트 (10%)
```javascript
// frontend/cypress/integration/student-flow.spec.js
describe('Student Flow', () => {
  it('should complete problem solving flow', () => {
    cy.visit('/');
    cy.get('[data-testid=student-login]').click();
    cy.get('[data-testid=username]').type('S001');
    cy.get('[data-testid=password]').type('1234');
    cy.get('[data-testid=login-btn]').click();

    cy.get('[data-testid=problem-list]').should('be.visible');
  });
});
```

### 🔄 테스트 실행
```bash
# 전체 테스트 실행
npm test

# 특정 테스트 파일
npm test -- userService.test.js

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

## 🔒 보안 가이드라인

### 🛡️ 일반 보안 원칙

#### 입력 검증
```javascript
// 나쁜 예
app.post('/api/user', (req, res) => {
  const { name, email } = req.body;
  // 직접 데이터베이스에 삽입 - 위험!
});

// 좋은 예
const joi = require('joi');

const userSchema = joi.object({
  name: joi.string().min(2).max(50).required(),
  email: joi.string().email().required()
});

app.post('/api/user', (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  // 검증된 데이터 사용
});
```

#### SQL 인젝션 방지
```javascript
// 나쁜 예
const query = `SELECT * FROM students WHERE id = ${studentId}`;

// 좋은 예
const query = 'SELECT * FROM students WHERE id = ?';
db.get(query, [studentId], callback);
```

#### 코드 실행 보안
```javascript
// C 코드 컴파일 시 보안 검사
const secureCompile = (code) => {
  // 위험한 함수 호출 차단
  const dangerousPatterns = [
    /system\s*\(/,
    /exec\s*\(/,
    /#include\s*<stdlib\.h>/,
    /fork\s*\(/
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      throw new Error('보안상 위험한 코드가 감지되었습니다.');
    }
  }

  return compileCode(code);
};
```

### 🔑 환경 변수 관리
```bash
# .env 파일 (절대 커밋하지 말 것!)
NODE_ENV=development
PORT=3001
DB_PATH=./database.db
SESSION_SECRET=your-secret-key-here
COMPILE_TIMEOUT=5000
MAX_MEMORY_USAGE=64M
```

## 🚀 배포 가이드

### 🏗️ 빌드 프로세스

#### 프로덕션 빌드
```bash
# 1. 프론트엔드 빌드
cd frontend
npm run build

# 2. 빌드 파일을 백엔드로 이동
cp -r build/* ../backend/public/

# 3. 백엔드 의존성 최적화
cd ../backend
npm ci --only=production

# 4. 프로덕션 서버 시작
NODE_ENV=production npm start
```

#### Docker 배포 (옵션)
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

# 백엔드 설정
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# 프론트엔드 빌드
COPY frontend/ ./frontend/
RUN cd frontend && npm ci && npm run build

# 빌드 파일 복사
RUN cp -r frontend/build/* backend/public/

WORKDIR /app/backend

EXPOSE 3001
CMD ["npm", "start"]
```

### 🔄 CI/CD 파이프라인
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

      - name: Build
        run: |
          cd frontend && npm run build
```

## 🐛 디버깅 가이드

### 🔍 일반적인 문제들

#### 서버 시작 오류
```bash
# 포트 충돌 확인
netstat -ano | findstr :3001
# 또는 macOS/Linux
lsof -i :3001

# 해결: 프로세스 종료
kill -9 <PID>
```

#### 데이터베이스 연결 오류
```javascript
// 연결 상태 확인
const db = require('./database');
db.serialize(() => {
  db.run('SELECT 1', (err) => {
    if (err) {
      console.error('Database connection failed:', err);
    } else {
      console.log('Database connected successfully');
    }
  });
});
```

#### 프론트엔드 빌드 오류
```bash
# 캐시 클리어
rm -rf node_modules package-lock.json
npm install

# 의존성 충돌 해결
npm audit fix
```

### 📊 로깅 및 모니터링

#### 백엔드 로깅
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 사용 예
logger.info('User logged in', { userId: 123 });
logger.error('Database error', { error: err.message });
```

#### 프론트엔드 에러 추적
```javascript
// Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 에러 리포팅 서비스로 전송
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## 📚 추가 리소스

### 📖 참고 문서
- [Node.js 공식 문서](https://nodejs.org/docs/)
- [React 공식 문서](https://reactjs.org/docs/)
- [Socket.io 가이드](https://socket.io/docs/)
- [SQLite 문서](https://sqlite.org/docs.html)

### 🛠️ 유용한 도구
- **Postman**: API 테스트
- **SQLite Browser**: 데이터베이스 관리
- **Chrome DevTools**: 프론트엔드 디버깅
- **Nodemon**: 자동 서버 재시작

### 📱 커뮤니티
- [Stack Overflow](https://stackoverflow.com/questions/tagged/node.js+react)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord 서버](https://discord.gg/your-server)

---

**마지막 업데이트**: 2025-09-19
**가이드 버전**: v1.0.0

이 가이드는 프로젝트 발전에 따라 지속적으로 업데이트됩니다.