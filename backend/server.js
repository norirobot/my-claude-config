require('dotenv').config(); // .env 파일 읽기
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { analyzeCodeQuality, analyzeComplexity } = require('./utils/codeAnalyzer');
const { generateTeacherGuide, generateCommentedCodeForTeacher } = require('./utils/teacherGuide');

// Rate limiting to prevent infinite API loops
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // 10 requests per second
const RATE_WINDOW = 1000; // 1 second window

function rateLimit(req, res, next) {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }

  const limit = rateLimitMap.get(key);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_WINDOW;
    return next();
  }

  if (limit.count >= RATE_LIMIT) {
    console.log(`🚫 Rate limit exceeded for ${key}`);
    return res.status(429).json({ error: 'Too many requests' });
  }

  limit.count++;
  next();
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      const localNetworkRegex = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
      if (localNetworkRegex.test(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// 미들웨어 설정 - 동적 CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost on any port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const localNetworkRegex = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
    if (localNetworkRegex.test(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting middleware
app.use(rateLimit);

// 루트 경로 핸들러 추가 (CORS 및 미들웨어 설정 후)
app.get('/', (req, res) => {
  res.json({
    message: '코딩 멘토 백엔드 서버가 정상 작동 중입니다.',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3001,
    ip: req.ip,
    host: req.get('host')
  });
});

// 인증 라우트 추가 (현재 미사용 - server.js에서 직접 구현됨)
// const { router: authRouter } = require('./routes/auth');
// const adminRouter = require('./routes/admin');
// const studentRouter = require('./routes/student');

// app.use('/api/auth', authRouter);
// app.use('/api/admin', adminRouter);
// app.use('/api/student', studentRouter);

// 모든 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (req.method === 'PUT' && req.path.includes('move')) {
    console.log('📨 요청 바디:', req.body);
  }
  next();
});

// 데이터베이스 설정
const db = new sqlite3.Database('./database.db');

// 테이블 생성
db.serialize(() => {
  // 학생 테이블 (class 컬럼 추가)
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    studentId TEXT UNIQUE NOT NULL,
    class TEXT DEFAULT '월요일반',
    progress INTEGER DEFAULT 0,
    currentProblem TEXT DEFAULT '1번',
    status TEXT DEFAULT 'offline',
    code TEXT DEFAULT '# 여기에 코드를 작성하세요',
    lastActive TEXT DEFAULT CURRENT_TIMESTAMP,
    needsHelp INTEGER DEFAULT 0,
    joinDate TEXT DEFAULT CURRENT_DATE
  )`);

  // 기존 테이블에 class 컬럼이 없다면 추가
  db.run('ALTER TABLE students ADD COLUMN class TEXT DEFAULT \'월요일반\'', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('컬럼 추가 오류:', err.message);
    }
  });

  // 관리자 테이블
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  // 문제 테이블
  db.run(`CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    language TEXT DEFAULT 'python',
    difficulty TEXT DEFAULT 'easy',
    category TEXT DEFAULT 'basic',
    lesson INTEGER DEFAULT 1,
    inputExample TEXT,
    outputExample TEXT,
    starterCode TEXT,
    solution TEXT,
    hints TEXT,
    isActive INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // 기존 문제 테이블에 isActive 컬럼 추가 (없다면)
  db.run('ALTER TABLE problems ADD COLUMN isActive INTEGER DEFAULT 0', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('문제 테이블 isActive 컬럼 추가 오류:', err.message);
    }
  });

  // 기존 문제 테이블에 inputExample 컬럼 추가 (없다면)
  db.run('ALTER TABLE problems ADD COLUMN inputExample TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('문제 테이블 inputExample 컬럼 추가 오류:', err.message);
    } else if (!err) {
      console.log('inputExample 컬럼이 성공적으로 추가되었습니다.');
    }
  });

  // 기존 문제 테이블에 outputExample 컬럼 추가 (없다면)
  db.run('ALTER TABLE problems ADD COLUMN outputExample TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('문제 테이블 outputExample 컬럼 추가 오류:', err.message);
    } else if (!err) {
      console.log('outputExample 컬럼이 성공적으로 추가되었습니다.');
    }
  });

  // 데이터베이스 스키마 확인
  db.all('PRAGMA table_info(problems)', (err, rows) => {
    if (err) {
      console.log('테이블 스키마 조회 오류:', err);
    } else {
      console.log('problems 테이블 스키마:');
      rows.forEach(row => {
        console.log(`- ${row.name}: ${row.type} (nullable: ${row.notnull === 0})`);
      });
    }
  });

  // 문제 해결 상태 테이블
  db.run(`CREATE TABLE IF NOT EXISTS problem_solutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER NOT NULL,
    problemId INTEGER NOT NULL,
    status TEXT DEFAULT 'solving', -- 'solving', 'solved'
    stars INTEGER DEFAULT 0, -- 0: 해결 중(달팽이), 1-3: 별점
    code TEXT,
    submittedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES students(id),
    FOREIGN KEY(problemId) REFERENCES problems(id),
    UNIQUE(studentId, problemId)
  )`);

  // 기본 관리자 계정 생성
  db.run('INSERT OR IGNORE INTO admins (username, password) VALUES (\'admin\', \'admin123\')');

  // 샘플 학생 데이터 생성 (반 정보 포함)
  db.run(`INSERT OR IGNORE INTO students (name, studentId, class, progress, currentProblem, status, code, needsHelp) 
          VALUES ('김학생', 'S001', '월요일반', 15, '1번', 'offline', 'print("Hello World")', 0)`);
  db.run(`INSERT OR IGNORE INTO students (name, studentId, class, progress, currentProblem, status, code, needsHelp) 
          VALUES ('이학생', 'S002', '화요일반', 12, '1번', 'offline', 'print("안녕하세요")', 1)`);
  db.run(`INSERT OR IGNORE INTO students (name, studentId, class, progress, currentProblem, status, code, needsHelp) 
          VALUES ('박학생', 'S003', '수요일반', 20, '2번', 'offline', 'print("Hello World")', 0)`);

  // 샘플 문제 데이터 생성
  db.run(`INSERT OR IGNORE INTO problems (id, title, description, language, difficulty, category, lesson, expectedOutput, starterCode, hints) 
          VALUES (1, 'Hello World 출력하기', 'Python의 print() 함수를 사용하여 "Hello World"를 출력하는 프로그램을 작성하세요.', 'python', 'easy', 'basic', 1, 'Hello World', '# Python 기초 1차시 - 문제 1\n# Hello World를 출력하세요\n\nprint("Hello World")', '1. print() 함수를 사용하세요\n2. 문자열은 따옴표로 감싸주세요')`);

  db.run(`INSERT OR IGNORE INTO problems (id, title, description, language, difficulty, category, lesson, expectedOutput, starterCode, hints) 
          VALUES (2, '변수와 출력', '이름을 저장하는 변수를 만들고 "안녕하세요, [이름]님!"을 출력하세요.', 'python', 'easy', 'basic', 1, '안녕하세요, 홍길동님!', '# Python 기초 1차시 - 문제 2\n# 변수를 사용해서 인사말을 출력하세요\n\nname = "홍길동"\n# 여기에 코드를 작성하세요', '1. name 변수를 사용하세요\n2. 문자열 연결을 해보세요')`);

  db.run(`INSERT OR IGNORE INTO problems (id, title, description, language, difficulty, category, lesson, expectedOutput, starterCode, hints) 
          VALUES (3, '간단한 계산', '두 숫자 10과 20을 더한 결과를 출력하세요.', 'python', 'easy', 'basic', 2, '30', '# Python 기초 2차시 - 문제 1\n# 두 숫자를 더해서 출력하세요\n\na = 10\nb = 20\n# 여기에 코드를 작성하세요', '1. + 연산자를 사용하세요\n2. print() 함수로 결과를 출력하세요')`);

  // 차시 관리 테이블 생성
  db.run(`CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.log('차시 테이블 생성 오류:', err.message);
    } else {
      console.log('차시 테이블이 생성되었습니다.');

      // 힌트 요청 테이블 생성
      db.run(`CREATE TABLE IF NOT EXISTS hint_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        student_name TEXT NOT NULL,
        problem_id INTEGER NOT NULL,
        problem_title TEXT NOT NULL,
        student_code TEXT NOT NULL,
        request_message TEXT,
        status TEXT DEFAULT 'pending',
        teacher_response TEXT,
        hint_level INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        responded_at TEXT,
        FOREIGN KEY (student_id) REFERENCES users(id)
      )`, (err) => {
        if (err) {
          console.log('힌트 요청 테이블 생성 오류:', err.message);
        } else {
          console.log('힌트 요청 테이블이 생성되었습니다.');
        }
      });

      // 문제 5번 인코딩 문제 수정
      db.run(`UPDATE problems SET 
              title = 'Hello World 출력하기',
              description = 'printf() 함수를 사용하여 Hello World!를 출력하는 프로그램을 작성하세요.',
              language = 'c',
              outputExample = 'Hello World!',
              starterCode = '#include <stdio.h>\n\nint main()\n{\n    // 여기에 코드를 작성하세요\n    return 0;\n}',
              hints = '1. printf() 함수를 사용하세요\n2. 문자열은 따옴표로 감싸주세요'
              WHERE id = 5`, (err) => {
        if (err) {
          console.log('문제 5번 수정 오류:', err.message);
        } else {
          console.log('문제 5번 인코딩 문제가 수정되었습니다.');
        }
      });

      // 문제 2번 인코딩 수정
      db.run(`UPDATE problems SET 
              title = '변수 출력하기',
              description = '정수형 변수 두 개를 선언하고 그 값을 출력하는 프로그램을 작성하세요.',
              language = 'c',
              outputExample = '10 20',
              starterCode = '#include <stdio.h>\n\nint main()\n{\n    // 여기에 코드를 작성하세요\n    return 0;\n}',
              hints = '1. int 키워드로 변수를 선언하세요\n2. printf()로 변수값을 출력하세요',
              isActive = 1
              WHERE id = 2`, (err) => {
        if (err) {
          console.log('문제 2번 수정 오류:', err.message);
        } else {
          console.log('문제 2번 인코딩 문제가 수정되었습니다.');
        }
      });

      // 문제 3번 expectedOutput과 outputExample 수정
      db.run('UPDATE problems SET expectedOutput = \'30\', outputExample = \'30\' WHERE id = 3', (updateErr) => {
        if (updateErr) {
          console.log('문제 3번 업데이트 오류:', updateErr.message);
        } else {
          console.log('문제 3번 expectedOutput과 outputExample이 수정되었습니다.');
        }
      });

      // 문제 7번 삭제 후 재생성
      db.run('DELETE FROM problems WHERE id = 7', (err) => {
        if (err) {
          console.log('문제 7번 삭제 오류:', err.message);
        } else {
          console.log('문제 7번이 삭제되었습니다.');
          // 새로 생성
          db.run(`INSERT INTO problems (id, title, description, language, outputExample, starterCode, hints, isActive, expectedOutput) VALUES (
            7, 
            '줄바꿈 문자 사용하기', 
            'printf() 함수와 줄바꿈 문자를 사용하여 두 줄로 출력하는 프로그램을 작성하세요.', 
            'c', 
            'Hello\nRONCO World!', 
            '#include <stdio.h>\n\nint main()\n{\n    // 여기에 코드를 작성하세요\n    return 0;\n}', 
            '1. \\n을 사용하여 줄바꿈하세요\n2. printf() 함수를 사용하세요', 
            1, 
            'Hello\nRONCO World!'
          )`, (insertErr) => {
            if (insertErr) {
              console.log('문제 7번 생성 오류:', insertErr.message);
            } else {
              console.log('문제 7번이 새로 생성되었습니다.');
            }
          });
        }
      });

      // 기본 차시 데이터 삽입
      const defaultLessons = [
        { number: 1, name: '기초', description: 'Python 기초 문법' },
        { number: 2, name: '변수와 연산', description: '변수 선언과 기본 연산' },
        { number: 3, name: '조건문', description: 'if, elif, else 문' },
        { number: 4, name: '반복문', description: 'for, while 문' },
        { number: 5, name: '함수', description: '함수 정의와 호출' }
      ];

      defaultLessons.forEach(lesson => {
        db.run('INSERT OR IGNORE INTO lessons (number, name, description) VALUES (?, ?, ?)',
          [lesson.number, lesson.name, lesson.description]);
      });
    }
  });

  // 피드백 테이블 생성
  db.run(`CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER NOT NULL,
    problemId INTEGER,
    adminId INTEGER NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students (id),
    FOREIGN KEY (problemId) REFERENCES problems (id),
    FOREIGN KEY (adminId) REFERENCES admins (id)
  )`, (err) => {
    if (err) {
      console.log('피드백 테이블 생성 오류:', err.message);
    } else {
      console.log('피드백 테이블이 생성되었습니다.');
    }
  });
});

// C 언어 코드 실행 함수
let currentVariables = {}; // 현재 실행중인 코드의 변수들

// C 언어 주석 제거 함수
function removeComments(code) {
  // 한 줄 주석 제거 (//)
  code = code.replace(/\/\/.*$/gm, '');

  // 여러 줄 주석 제거 (/* */)
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');

  return code;
}


// scanf 입력을 처리하기 위한 비동기 함수
async function executeCCodeWithInput(code, inputData = null) {
  console.log('C 코드 실행 시작 (입력 지원)');

  // 🔄 매번 실행할 때마다 변수 초기화 (circular reference 방지)
  currentVariables = {};

  // 한국 키보드 문자 변환 (전체 코드에 대해)
  code = code.replace(/₩/g, '\\');

  // 주석 제거
  code = removeComments(code);
  console.log('주석 제거된 코드:', code);

  // 변수 초기화
  currentVariables = {};

  let output = '';
  const needsInput = false;
  const inputPrompts = [];

  try {
    // 기본적인 문법 검사
    const syntaxErrors = checkCSyntax(code);
    if (syntaxErrors.length > 0) {
      return {
        success: false,
        output: `⚠️ 문법 오류:\n${syntaxErrors.map(error => `• ${error}`).join('\n')}\n\n코드를 확인하고 다시 실행해보세요! 💪`
      };
    }

    // 변수 선언 파싱
    parseVariableDeclarations(code);

    // printf와 scanf 문 찾기
    const printfStatements = extractPrintfStatements(code);
    const scanfStatements = extractScanfStatements(code);

    // scanf가 있는데 입력 데이터가 없으면 입력 요청
    if (scanfStatements.length > 0 && !inputData) {
      return {
        success: false,
        needsInput: true,
        inputPrompts: [''] // 빈 프롬프트 - 입력만 받기
      };
    }

    // C 코드를 순서대로 실행 (printf와 scanf를 코드 순서대로 처리)
    const allStatements = [];

    // printf문들과 위치 추가
    printfStatements.forEach(stmt => {
      const position = code.indexOf(stmt);
      allStatements.push({ type: 'printf', statement: stmt, position });
    });

    // scanf문들과 위치 추가
    scanfStatements.forEach(stmt => {
      const position = code.indexOf(stmt);
      allStatements.push({ type: 'scanf', statement: stmt, position });
    });

    // 위치 순서대로 정렬
    allStatements.sort((a, b) => a.position - b.position);

    console.log('📋 실행 순서:', allStatements.map(s => `${s.type}: ${s.statement}`));

    // 순서대로 실행
    let inputIndex = 0;
    for (const stmt of allStatements) {
      if (stmt.type === 'printf') {
        console.log(`🔍 printf 실행: "${stmt.statement}"`);
        const result = executePrintf(stmt.statement);
        if (result) {
          output += result;
        }
      } else if (stmt.type === 'scanf') {
        console.log(`📝 scanf 실행: "${stmt.statement}"`);
        if (inputData) {
          const result = executeScanf(stmt.statement, inputData, inputIndex);
          if (result.error) {
            return { success: false, output: result.error };
          }
          inputIndex = result.nextInputIndex;
        }
      }
    }

    if (printfStatements.length === 0 && scanfStatements.length === 0) {
      return { success: true, output: '🤔 코드가 실행되었지만 출력이 없습니다.\nprintf()를 사용해서 결과를 출력해보세요!' };
    }

    console.log('C 코드 실행 완료, 결과:', output);
    return { success: true, output: output || '실행 완료' };

  } catch (error) {
    console.error('C 코드 실행 오류:', error);
    return { success: false, output: `오류: ${error.message}` };
  }
}

// 실제 C 컴파일러 사용 (Judge0 API)
async function executeCCodeWithRealCompiler(code, inputData = null) {
  try {
    console.log('🔥 실제 C 컴파일러로 실행 시작:', {
      codeLength: code.length,
      hasInput: !!inputData
    });

    const axios = require('axios');

    // stdin 준비
    const stdin = inputData && inputData.length > 0 ? inputData.join('\n') : '';

    console.log('📤 Judge0에 전송:', { code: code.substring(0, 100) + '...', stdin });

    // 무료 Judge0 CE 서버 사용 (API 키 불필요)
    const submitResponse = await axios.post('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
      source_code: Buffer.from(code).toString('base64'),
      language_id: 50, // C (GCC 9.2.0)
      stdin: Buffer.from(stdin).toString('base64')
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Judge0 응답 받음:', submitResponse.data);

    const result = submitResponse.data;

    if (result.status && result.status.id === 3) { // Success
      let output = Buffer.from(result.stdout || '', 'base64').toString('utf8');
      console.log('🎉 실행 성공:', output);

      // printf 프롬프트 메시지 제거 (Dev-C++ 스타일)
      output = output.replace(/숫자를 입력하세요:/g, '');
      output = output.replace(/:/g, ''); // 남은 콜론들 제거
      output = output.trim();

      return { success: true, output: output };
    } else {
      // 컴파일 오류 또는 런타임 오류
      const error = Buffer.from(result.stderr || '', 'base64').toString('utf8') ||
                   Buffer.from(result.compile_output || '', 'base64').toString('utf8') ||
                   '실행 중 오류가 발생했습니다.';
      console.log('❌ 실행 실패:', error);
      return { success: false, output: `컴파일/실행 오류:\n${error}` };
    }

  } catch (error) {
    console.error('Judge0 API 오류:', error);
    return {
      success: false,
      output: `컴파일러 연결 오류: ${error.message}`
    };
  }
}

// 기존 함수는 호환성을 위해 유지 (실제 컴파일러로 교체)
async function executeCCode(code, inputData = null) {
  const result = await executeCCodeWithRealCompiler(code, inputData);
  if (result.success) {
    return result.output;
  } else {
    return result.output || '실행 오류';
  }
}

// 중복 함수 제거됨 - 실제 구현은 377번째 줄의 executeCCodeWithInput 함수 사용

// Python 코드 실행 함수
function executePythonCode(code) {
  console.log('Python 코드 실행 시작');

  let output = '';

  try {
    // Python 문법 오류 검사
    const syntaxErrors = [];

    // print 문법 검사
    const printMatches = code.match(/print\s*\([^)]*\)/g);
    if (printMatches) {
      for (const match of printMatches) {
        // print() 안에 내용이 있는지 확인
        if (match === 'print()') {
          continue; // 빈 print는 허용
        }
        // 따옴표 짝 맞추기
        const quoteCount = (match.match(/"/g) || []).length + (match.match(/'/g) || []).length;
        if (quoteCount > 0 && quoteCount % 2 !== 0) {
          syntaxErrors.push('print() 안의 따옴표가 짝이 맞지 않습니다.');
        }
      }
    }

    // 기본적인 괄호 짝 맞추기
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      syntaxErrors.push('소괄호 ()의 개수가 맞지 않습니다.');
    }

    // 문법 오류가 있으면 오류 메시지 반환
    if (syntaxErrors.length > 0) {
      return `⚠️ 문법 오류:\n${syntaxErrors.map(error => `• ${error}`).join('\n')}\n\n코드를 확인하고 다시 실행해보세요! 💪`;
    }

    const lines = code.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const trimmedLine = line.trim();

      // print() 함수 처리
      if (trimmedLine.includes('print(')) {
        // print("text") 또는 print('text') 형태
        const stringMatch = trimmedLine.match(/print\(["']([^"']*?)["']\)/);
        if (stringMatch) {
          let text = stringMatch[1];
          // 한국 키보드 원화(₩) 기호를 백슬래시(\)로 변환
          text = text.replace(/₩/g, '\\');
          // 이스케이프 시퀀스를 특수 마커로 변환 (일관성 유지)
          text = text.replace(/\\n/g, '###NEWLINE###');
          text = text.replace(/\\t/g, '###TAB###');
          text = text.replace(/\\r/g, '###CARRIAGE###');
          output += text + '###NEWLINE###';
          continue;
        }

        // print(숫자) 형태
        const numberMatch = trimmedLine.match(/print\((\d+(?:\.\d+)?)\)/);
        if (numberMatch) {
          output += numberMatch[1] + '###NEWLINE###';
          continue;
        }

        // print(계산식) 형태 - 간단한 사칙연산
        const calcMatch = trimmedLine.match(/print\((.+)\)/);
        if (calcMatch) {
          const expression = calcMatch[1].trim();
          try {
            // 안전한 계산식만 허용
            if (/^[\d\s+\-*/().]+$/.test(expression)) {
              const result = Function('"use strict"; return (' + expression + ')')();
              output += result + '###NEWLINE###';
            } else {
              output += expression + '###NEWLINE###';
            }
          } catch (e) {
            output += expression + '###NEWLINE###';
          }
          continue;
        }
      }

      // 변수 할당 처리 (간단한 경우만)
      if (trimmedLine.includes('=') && !trimmedLine.includes('==')) {
        // 나중에 확장 가능
        continue;
      }
    }

    // 마지막 newline 제거
    output = output.replace(/###NEWLINE###$/, '');

    if (!output.trim()) {
      output = '🤔 코드가 실행되었지만 출력이 없습니다.\nprint()를 사용해서 결과를 출력해보세요!';
    }

    console.log('Python 코드 실행 완료, 결과:', output);
    return output;

  } catch (error) {
    console.error('Python 코드 실행 오류:', error);
    return `오류: ${error.message}`;
  }
}

// C 언어 문법 검사
function checkCSyntax(code) {
  const errors = [];

  // #include <stdio.h> 검사
  if (code.includes('printf') && !code.includes('#include <stdio.h>')) {
    if (code.match(/#include\s*<stdioo?\.hh?>/)) {
      errors.push('<stdio.h> 철자를 확인해주세요.');
    } else if (code.match(/#includle|#includ\./)) {
      errors.push('#include 철자를 확인해주세요.');
    } else if (!code.includes('#include')) {
      errors.push('printf()를 사용하려면 #include <stdio.h>가 필요합니다.');
    }
  }

  // main 함수 검사
  if (!code.match(/int\s+main\s*\([^)]*\)/)) {
    if (code.match(/main\s*\(/)) {
      errors.push('main 함수 앞에 int를 붙여주세요: int main()');
    } else {
      errors.push('main() 함수가 필요합니다.');
    }
  }

  // return 문 검사
  if (code.includes('main') && !code.includes('return')) {
    errors.push('main() 함수에 return 0; 문이 필요합니다.');
  }

  // 괄호 짝 검사
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('중괄호 {}의 개수가 맞지 않습니다.');
  }

  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('소괄호 ()의 개수가 맞지 않습니다.');
  }

  // 세미콜론 검사
  const statements = code.match(/printf\s*\([^)]*\)/g);
  if (statements) {
    for (const stmt of statements) {
      const line = code.split('\n').find(l => l.includes(stmt));
      if (line && !line.trim().endsWith(';')) {
        errors.push('printf() 뒤에 세미콜론(;)이 필요합니다.');
        break;
      }
    }
  }

  return errors;
}

// printf 문 추출
function extractPrintfStatements(code) {
  const statements = [];

  console.log('printf 추출 시작, 코드:', code);

  // 코드에서 모든 printf 문 찾기 - 단순한 문자열 매칭으로 변경
  console.log('정규식 시도 전 코드 내용:', JSON.stringify(code));

  // 전체 코드에서 printf 찾기 - 완전 재작성
  let searchIndex = 0;
  while (true) {
    const printfIndex = code.indexOf('printf', searchIndex);
    if (printfIndex === -1) break;

    // printf 다음에 ( 가 있는지 확인
    let nextCharIndex = printfIndex + 6;
    while (nextCharIndex < code.length && /\s/.test(code[nextCharIndex])) {
      nextCharIndex++; // 공백 건너뛰기
    }

    if (nextCharIndex < code.length && code[nextCharIndex] === '(') {
      // printf( 부터 매칭되는 ) 까지 추출
      let parenCount = 1;
      let inString = false;
      let stringChar = '';
      let endIndex = nextCharIndex + 1;

      for (let i = nextCharIndex + 1; i < code.length; i++) {
        const char = code[i];
        const prevChar = i > 0 ? code[i-1] : '';

        if ((char === '"' || char === "'") && !inString && prevChar !== '\\') {
          inString = true;
          stringChar = char;
        } else if (char === stringChar && inString && prevChar !== '\\') {
          inString = false;
          stringChar = '';
        } else if (!inString) {
          if (char === '(') {
            parenCount++;
          } else if (char === ')') {
            parenCount--;
            if (parenCount === 0) {
              endIndex = i + 1;
              break;
            }
          }
        }
      }

      const statement = code.substring(printfIndex, endIndex);
      if (statement && !statements.includes(statement)) {
        console.log('전체 코드에서 추출된 printf 문:', statement);
        statements.push(statement);
      }
    }

    searchIndex = printfIndex + 1;
  }

  console.log('총 추출된 printf 문 개수:', statements.length, statements);
  return statements;
}

// scanf 문 추출
function extractScanfStatements(code) {
  const statements = [];
  const regex = /scanf\s*\([^)]+\)/g;
  let match;

  console.log('scanf 추출 시작, 코드:', code);

  while ((match = regex.exec(code)) !== null) {
    const statement = match[0];
    console.log('추출된 scanf 문:', statement);
    statements.push(statement);
  }

  console.log('총 추출된 scanf 문 개수:', statements.length, statements);
  return statements;
}

// scanf에서 형식 지정자 추출
function extractFormatSpecifiers(scanfStatement) {
  // Dev-C++처럼 프롬프트 없이 입력만 받기 위해 빈 배열 반환
  console.log('🎯 scanf 발견하지만 프롬프트 생성 안함 (Dev-C++ 스타일)');
  return [''];  // 빈 프롬프트 하나만 반환
}

// printf 문에서 텍스트 추출
function extractPrintfText(printfStatement) {
  try {
    // printf("텍스트") 형태에서 텍스트 부분만 추출
    const stringMatch = printfStatement.match(/printf\s*\(\s*["'](.*?)["']/s);
    if (stringMatch) {
      let text = stringMatch[1];
      // 이스케이프 시퀀스 처리
      text = text.replace(/\\n/g, '');
      text = text.replace(/\\t/g, '');
      text = text.replace(/\\"/g, '"');
      text = text.replace(/\\'/g, "'");
      text = text.replace(/\\\\/g, '\\');
      return text;
    }
    return '';
  } catch (error) {
    console.error('printf 텍스트 추출 오류:', error);
    return '';
  }
}

// scanf 실행
function executeScanf(statement, inputData, inputIndex) {
  try {
    console.log('🔍 scanf 실행:', { statement, inputData, inputIndex });

    // scanf 파싱: scanf("%d", &a)
    const match = statement.match(/scanf\s*\(\s*["'](.*?)["']\s*,\s*(.+)\)/);
    if (!match) {
      return { error: 'scanf 형식이 올바르지 않습니다.' };
    }

    const formatString = match[1];
    const variablesString = match[2];

    // 변수들 추출 (&a, &b -> [a, b])
    const variables = variablesString.split(',').map(v => v.trim().replace(/^&/, ''));

    // 형식 지정자 추출
    const specifiers = formatString.match(/%[dfsci]/g) || [];

    console.log('scanf 파싱 결과:', { formatString, variables, specifiers });

    if (specifiers.length !== variables.length) {
      return { error: '형식 지정자와 변수의 개수가 맞지 않습니다.' };
    }

    let currentInputIndex = inputIndex;

    // 각 변수에 입력값 할당
    for (let i = 0; i < specifiers.length; i++) {
      if (currentInputIndex >= inputData.length) {
        return { error: '입력 데이터가 부족합니다.' };
      }

      const specifier = specifiers[i];
      const variable = variables[i];
      const inputValue = inputData[currentInputIndex];

      let processedValue;

      // 형식에 따라 값 처리
      if (specifier === '%d') {
        processedValue = parseInt(inputValue);
        if (isNaN(processedValue)) {
          return { error: `정수가 아닌 값이 입력되었습니다: ${inputValue}` };
        }
      } else if (specifier === '%f') {
        processedValue = parseFloat(inputValue);
        if (isNaN(processedValue)) {
          return { error: `실수가 아닌 값이 입력되었습니다: ${inputValue}` };
        }
      } else if (specifier === '%c') {
        processedValue = inputValue.toString().charAt(0);
      } else if (specifier === '%s') {
        processedValue = inputValue.toString();
      } else {
        processedValue = inputValue;
      }

      // 변수에 값 저장
      currentVariables[variable] = processedValue;
      console.log(`📝 변수 저장: ${variable} = ${processedValue}`);

      currentInputIndex++;
    }

    console.log('scanf 실행 완료, 현재 변수 상태:', currentVariables);
    return { success: true, nextInputIndex: currentInputIndex };

  } catch (error) {
    console.error('scanf 실행 오류:', error);
    return { error: `scanf 실행 오류: ${error.message}` };
  }
}

// printf 실행
function executePrintf(statement) {
  try {
    // printf("문자열") 형태
    const stringMatch = statement.match(/printf\s*\(\s*["'](.*?)["']\s*\)/s);
    if (stringMatch) {
      let text = stringMatch[1];

      // 이스케이프 시퀀스를 특수 마커로 변환 (줄바꿈/탭 문제 해결)
      text = text.replace(/\\n/g, '###NEWLINE###');
      text = text.replace(/\\t/g, '###TAB###');
      text = text.replace(/\\r/g, '###CARRIAGE###');
      text = text.replace(/\\"/g, '"');
      text = text.replace(/\\'/g, "'");
      text = text.replace(/\\\\/g, '\\');

      return text;
    }

    // printf("%d", 값) 또는 printf("%d %d", a, b) 형태
    const formatMatch = statement.match(/printf\s*\(\s*["']([^"']*)["']\s*,\s*([^)]+)\)/);
    if (formatMatch) {
      const format = formatMatch[1];
      const valuesStr = formatMatch[2].trim();
      const values = valuesStr.split(',').map(v => v.trim());

      let result = format;
      let valueIndex = 0;

      // %d, %s, %f, %c 등을 순서대로 교체
      result = result.replace(/%d/g, () => {
        if (valueIndex < values.length) {
          const value = values[valueIndex++];
          // 수식 계산 시도
          const calculatedValue = evaluateExpression(value);
          if (calculatedValue !== null) {
            return calculatedValue;
          }
          // 변수 값을 찾아서 반환 (실제 변수값을 찾기 위해)
          return getVariableValue(value) || parseInt(value) || 0;
        }
        return 0;
      });

      result = result.replace(/%s/g, () => {
        if (valueIndex < values.length) {
          const value = values[valueIndex++];
          return getVariableValue(value) || value.replace(/["']/g, '');
        }
        return '';
      });

      result = result.replace(/%f/g, () => {
        if (valueIndex < values.length) {
          const value = values[valueIndex++];
          return getVariableValue(value) || parseFloat(value) || 0;
        }
        return 0;
      });

      result = result.replace(/%c/g, () => {
        if (valueIndex < values.length) {
          const value = values[valueIndex++];
          return getVariableValue(value) || value.replace(/["']/g, '');
        }
        return '';
      });

      // 이스케이프 시퀀스 처리 (변수 교체 후)
      result = result.replace(/\\n/g, '###NEWLINE###');
      result = result.replace(/\\t/g, '###TAB###');
      result = result.replace(/\\r/g, '###CARRIAGE###');
      result = result.replace(/\\"/g, '"');
      result = result.replace(/\\'/g, "'");
      result = result.replace(/\\\\/g, '\\');

      return result;
    }

    return '';
  } catch (error) {
    console.error('printf 실행 오류:', error);
    return `오류: ${error.message}`;
  }
}

// 변수 선언 파싱 함수
function parseVariableDeclarations(code) {
  try {
    console.log('🔍 변수 선언 파싱 시작, 코드:', code);

    // int a=10; 또는 int a=10, b=20; 형태의 변수 선언 찾기
    const intDeclarations = code.match(/int\s+[^;]+;/g);
    if (intDeclarations) {
      console.log('📊 int 선언 찾음:', intDeclarations);
      intDeclarations.forEach(declaration => {
        // int 키워드 제거 후 세미콜론 제거
        const varsString = declaration.replace(/int\s+/, '').replace(/;/, '');
        // 쉼표로 분리
        const vars = varsString.split(',');

        vars.forEach(varDecl => {
          const trimmed = varDecl.trim();
          // 변수명=값 형태 파싱
          const match = trimmed.match(/(\w+)\s*=\s*(\d+)/);
          if (match) {
            const [, varName, varValue] = match;
            currentVariables[varName] = parseInt(varValue);
            console.log(`✅ 변수 설정: ${varName} = ${varValue}`);
          } else {
            // 값이 없는 변수는 0으로 초기화
            const varMatch = trimmed.match(/(\w+)/);
            if (varMatch) {
              currentVariables[varMatch[1]] = 0;
              console.log(`✅ 변수 초기화: ${varMatch[1]} = 0`);
            }
          }
        });
      });
    }

    // int c=a+b; 형태의 변수 선언 찾기 (수식)
    const exprMatches = code.match(/int\s+(\w+)\s*=\s*([^;]+)/g);
    if (exprMatches) {
      console.log('📊 수식 변수 찾음:', exprMatches);
      exprMatches.forEach(match => {
        const [, varName, varExpr] = match.match(/int\s+(\w+)\s*=\s*([^;]+)/);
        if (!/^\d+$/.test(varExpr.trim())) { // 숫자가 아닌 경우 (수식인 경우)
          const calculatedValue = evaluateExpression(varExpr.trim());
          if (calculatedValue !== null) {
            currentVariables[varName] = calculatedValue;
            console.log(`✅ 수식 변수 설정: ${varName} = ${varExpr} = ${calculatedValue}`);
          }
        }
      });
    }

    console.log('📋 최종 변수 상태:', currentVariables);
  } catch (error) {
    console.error('변수 파싱 오류:', error);
  }
}

// 변수 값 가져오기 함수
function getVariableValue(varName) {
  console.log(`🔍 변수 값 조회: "${varName}"`);
  console.log('📊 현재 변수들:', currentVariables);
  const value = currentVariables[varName] || null;
  console.log(`📤 "${varName}" 값: ${value}`);
  return value;
}

// 수식 계산 함수
function evaluateExpression(expression) {
  try {
    // 변수명을 실제 값으로 치환
    let expr = expression;
    Object.keys(currentVariables).forEach(varName => {
      const regex = new RegExp('\\b' + varName + '\\b', 'g');
      expr = expr.replace(regex, currentVariables[varName]);
    });

    // 간단한 산술 연산 계산 (안전한 방식)
    // +, -, *, /, % 연산만 허용
    if (/^[\d\s+\-*/()%]+$/.test(expr)) {
      return eval(expr);
    }

    return null;
  } catch (error) {
    console.error('수식 계산 오류:', error);
    return null;
  }
}

// API 라우트

// 로그인 API
app.post('/api/login', (req, res) => {
  const { username, password, type } = req.body;

  if (type === 'admin') {
    db.get('SELECT * FROM admins WHERE username = ? AND password = ?',
      [username, password], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (row) {
          res.json({ success: true, type: 'admin', user: { username: row.username } });
        } else {
          res.json({ success: false, message: '잘못된 관리자 정보입니다.' });
        }
      });
  } else {
    console.log('🔑 학생 로그인 시도:', { username, password, type });

    // 먼저 모든 학생 정보 조회해서 디버깅
    db.all('SELECT * FROM students', [], (err, allStudents) => {
      if (!err) {
        console.log('📊 현재 등록된 모든 학생:', allStudents.map(s => ({
          id: s.id,
          name: `"${s.name}"`,
          studentId: `"${s.studentId}"`,
          nameLength: s.name.length,
          studentIdLength: s.studentId.length
        })));
      }
    });

    db.get('SELECT * FROM students WHERE TRIM(studentId) = TRIM(?)',
      [username], (err, row) => {
        console.log('🔍 로그인 쿼리 결과:', { err, row, searchParams: { username, password } });

        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (row) {
          console.log('✅ 학생 로그인 성공:', row);
          // 학생 상태를 온라인으로 변경
          db.run('UPDATE students SET status = ?, lastActive = CURRENT_TIMESTAMP WHERE id = ?',
            ['online', row.id], function(err) {
              if (err) {
                console.error('학생 온라인 상태 업데이트 실패:', err.message);
              } else {
                console.log(`✅ 학생 ${row.id} (${row.name}) 온라인 상태로 업데이트 완료`);

                // 🚀 [직접 연결 등록] 학생 로그인 시 연결된 학생 목록에 추가
                connectedStudents.add(row.id);
                console.log('🚀 [직접 연결 등록] 학생을 연결된 목록에 추가:', row.id);
                console.log('📊 [직접 연결 등록] 현재 연결된 학생 ID들:', Array.from(connectedStudents));

                // 모든 관리자에게 학생 온라인 상태 브로드캐스트
                io.emit('studentStatusUpdated', {
                  studentId: row.id,
                  status: 'online',
                  loginType: 'normal',
                  timestamp: new Date().toISOString()
                });
                console.log('📡 학생 온라인 상태 브로드캐스트 완료');
              }
            });
          res.json({ success: true, type: 'student', user: row });
        } else {
          res.json({ success: false, message: '잘못된 학번 또는 이름입니다.' });
        }
      });
  }
});

// 학생 목록 조회 (반별 필터링 및 정렬 포함)
app.get('/api/students', (req, res) => {
  const { class: className, sortBy } = req.query;

  let query = 'SELECT * FROM students';
  const params = [];

  if (className && className !== '전체') {
    query += ' WHERE class = ?';
    params.push(className);
  }

  // 정렬 방식 처리
  if (sortBy === 'name') {
    query += ' ORDER BY name';
  } else {
    query += ' ORDER BY studentId'; // 기본값은 학번순
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 학생 추가
app.post('/api/students', (req, res) => {
  const { name, studentId, class: className } = req.body;

  db.run('INSERT INTO students (name, studentId, class) VALUES (?, ?, ?)',
    [name, studentId, className || '월요일반'], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: '이미 존재하는 학번입니다.' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }

      // 새로 추가된 학생 정보 반환
      db.get('SELECT * FROM students WHERE id = ?', this.lastID, (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    });
});

// 학생 수정
app.put('/api/students/:id', (req, res) => {
  const { name, studentId, class: className } = req.body;

  console.log('학생 수정 요청:', { id: req.params.id, name, studentId, className }); // 디버그용

  db.run('UPDATE students SET name = ?, studentId = ?, class = ? WHERE id = ?',
    [name, studentId, className || '월요일반', req.params.id], function(err) {
      if (err) {
        console.error('학생 수정 에러:', err); // 디버그용
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: '이미 존재하는 학번입니다.' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }

      console.log('학생 수정 완료, 변경된 행 수:', this.changes); // 디버그용
      res.json({ success: true, changes: this.changes });
    });
});

// 학생 삭제
app.delete('/api/students/:id', (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', req.params.id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// 학생 진도 업데이트 (실행 버튼 누를 때마다 호출)
app.put('/api/students/:id/progress', (req, res) => {
  const { currentProblem, problemId, timestamp } = req.body;
  const studentId = req.params.id;

  console.log('📊 [진도 업데이트] 요청 받음:', {
    studentId,
    currentProblem,
    problemId,
    timestamp
  });

  // currentProblem을 업데이트하고, 필요하면 progress도 증가시킬 수 있음
  db.run('UPDATE students SET currentProblem = ?, lastActive = DATETIME("now") WHERE id = ?',
    [currentProblem, studentId], function(err) {
      if (err) {
        console.error('❌ [진도 업데이트] 데이터베이스 에러:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      console.log('✅ [진도 업데이트] 성공:', {
        studentId,
        currentProblem,
        changes: this.changes
      });

      res.json({
        success: true,
        changes: this.changes,
        currentProblem: currentProblem,
        updatedAt: timestamp
      });
    });
});

// 반별 통계 조회
app.get('/api/stats/classes', (req, res) => {
  db.all(`SELECT class, COUNT(*) as count 
          FROM students 
          WHERE class IS NOT NULL 
          GROUP BY class 
          ORDER BY class`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const stats = {};
    rows.forEach(row => {
      stats[row.class] = row.count;
    });

    res.json(stats);
  });
});

// 학생 반 이동
app.put('/api/students/:id/class', (req, res) => {
  const { class: newClass } = req.body;

  db.run('UPDATE students SET class = ? WHERE id = ?',
    [newClass, req.params.id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

// 관리자용 문제 목록 조회 (모든 문제)
app.get('/api/admin/problems', (req, res) => {
  const { lesson, language, difficulty } = req.query;

  let query = 'SELECT * FROM problems WHERE 1=1';
  const params = [];

  if (lesson) {
    query += ' AND lesson = ?';
    params.push(lesson);
  }

  if (language) {
    query += ' AND language = ?';
    params.push(language);
  }

  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }

  query += ' ORDER BY lesson, id';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 학생용 문제 목록 조회 (활성화된 문제만)
app.get('/api/problems', (req, res) => {
  const { lesson, language, difficulty } = req.query;

  let query = 'SELECT * FROM problems WHERE isActive = 1';
  const params = [];

  if (lesson) {
    query += ' AND lesson = ?';
    params.push(lesson);
  }

  if (language) {
    query += ' AND language = ?';
    params.push(language);
  }

  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }

  query += ' ORDER BY lesson, id';

  console.log('학생용 문제 조회 쿼리:', query, '파라미터:', params);

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    console.log('학생용 문제 조회 결과:', rows.map(row => ({
      id: row.id,
      title: row.title,
      inputExample: row.inputExample,
      outputExample: row.outputExample
    })));

    res.json(rows);
  });
});

// 특정 문제 조회
app.get('/api/problems/:id', (req, res) => {
  db.get('SELECT * FROM problems WHERE id = ?', req.params.id, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    }
  });
});

// 문제 추가
app.post('/api/problems', (req, res) => {
  const { title, description, language, difficulty, category, lesson, inputExample, outputExample, starterCode, hints } = req.body;

  console.log('문제 추가 요청 데이터:', {
    title,
    description,
    inputExample,
    outputExample,
    starterCode,
    hints,
    lesson
  });

  db.run(`INSERT INTO problems (title, description, language, difficulty, category, lesson, inputExample, outputExample, starterCode, hints) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [title, description, language || 'python', difficulty || 'easy', category || 'basic',
    lesson || 1, inputExample, outputExample, starterCode, hints], function(err) {
    if (err) {
      console.error('문제 추가 실패:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    console.log('문제 추가 완료, 새 문제 ID:', this.lastID);

    // 문제 추가 시 모든 클라이언트에게 알림
    io.emit('problemUpdated', { problemId: this.lastID });

    // 새로 추가된 문제 정보 반환
    db.get('SELECT * FROM problems WHERE id = ?', this.lastID, (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log('추가된 문제 정보:', {
        id: row.id,
        title: row.title,
        inputExample: row.inputExample,
        outputExample: row.outputExample
      });
      res.json(row);
    });
  });
});

// 문제 수정
app.put('/api/problems/:id', (req, res) => {
  const { title, description, language, difficulty, category, lesson, inputExample, outputExample, starterCode, hints } = req.body;

  console.log('문제 수정 요청 데이터:', {
    id: req.params.id,
    title,
    description,
    inputExample,
    outputExample,
    starterCode,
    hints
  });

  db.run(`UPDATE problems SET title = ?, description = ?, language = ?, difficulty = ?, 
          category = ?, lesson = ?, inputExample = ?, outputExample = ?, starterCode = ?, hints = ?, 
          updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
  [title, description, language, difficulty, category, lesson, inputExample, outputExample, starterCode, hints, req.params.id],
  function(err) {
    if (err) {
      console.error('문제 수정 실패:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    console.log('문제 수정 완료, 변경된 행 수:', this.changes);

    // 문제 수정 시 모든 클라이언트에게 알림
    io.emit('problemUpdated', { problemId: req.params.id });

    res.json({ success: true, changes: this.changes });
  });
});

// 문제 삭제
app.delete('/api/problems/:id', (req, res) => {
  db.run('DELETE FROM problems WHERE id = ?', req.params.id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // 문제 삭제 시 모든 클라이언트에게 알림
    io.emit('problemUpdated', { problemId: req.params.id });

    res.json({ success: true });
  });
});

// 문제 활성화/비활성화
app.put('/api/problems/:id/toggle', (req, res) => {
  const { isActive } = req.body;

  db.run('UPDATE problems SET isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [isActive ? 1 : 0, req.params.id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // 문제 활성화/비활성화 시 모든 클라이언트에게 알림
      io.emit('problemUpdated', { problemId: req.params.id });

      res.json({ success: true, changes: this.changes });
    });
});

// 차시별 문제 일괄 활성화/비활성화
app.put('/api/problems/lesson/:lesson/toggle', (req, res) => {
  const { isActive } = req.body;

  db.run('UPDATE problems SET isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE lesson = ?',
    [isActive ? 1 : 0, req.params.lesson], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // 차시별 문제 일괄 활성화/비활성화 시 모든 클라이언트에게 알림
      io.emit('problemUpdated', { lesson: req.params.lesson });

      res.json({ success: true, changes: this.changes });
    });
});

// 문제 순서 변경 API 테스트
app.get('/api/problems/move/test', (req, res) => {
  console.log('🧪 Move API 테스트 요청 받음');
  res.json({ message: 'Move API 테스트 성공!' });
});

// 문제 순서 변경 API
app.put('/api/problems/:id/move', (req, res) => {
  const problemId = parseInt(req.params.id);
  const { direction } = req.body; // 'up' 또는 'down'

  console.log('🔄 문제 순서 변경 요청:', problemId, direction);

  // 먼저 현재 문제의 정보를 가져오기
  db.get('SELECT * FROM problems WHERE id = ?', [problemId], (err, currentProblem) => {
    if (err) {
      console.error('❌ 문제 조회 오류:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    if (!currentProblem) {
      console.error('❌ 문제를 찾을 수 없음:', problemId);
      res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
      return;
    }

    console.log('📋 현재 문제:', currentProblem.title, 'lesson:', currentProblem.lesson);

    // 같은 차시의 모든 문제들을 ID 순서로 가져오기
    db.all('SELECT id, title FROM problems WHERE lesson = ? ORDER BY id', [currentProblem.lesson], (err, problemsInLesson) => {
      if (err) {
        console.error('❌ 차시별 문제 조회 오류:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      console.log('📚 같은 차시의 문제들:', problemsInLesson.map(p => `${p.id}:${p.title}`));

      const currentIndex = problemsInLesson.findIndex(p => p.id === problemId);

      if (currentIndex === -1) {
        console.error('❌ 문제를 목록에서 찾을 수 없음');
        res.status(404).json({ error: '문제를 목록에서 찾을 수 없습니다.' });
        return;
      }

      let targetIndex;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < problemsInLesson.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        console.log('⚠️ 순서 변경 불가:', direction, 'currentIndex:', currentIndex, 'total:', problemsInLesson.length);
        res.json({ success: false, message: '순서를 변경할 수 없습니다.' });
        return;
      }

      const currentId = problemsInLesson[currentIndex].id;
      const targetId = problemsInLesson[targetIndex].id;

      console.log('🔄 ID 교환:', currentId, '↔', targetId);

      // 간단한 방법: 두 문제의 모든 데이터를 교환 (ID 제외)
      db.get('SELECT * FROM problems WHERE id = ?', [targetId], (err, targetProblem) => {
        if (err) {
          console.error('❌ 대상 문제 조회 오류:', err);
          res.status(500).json({ error: err.message });
          return;
        }

        // 트랜잭션 시작
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          // currentProblem을 targetId로 업데이트 (ID는 유지)
          db.run(`UPDATE problems SET 
                    title = ?, description = ?, language = ?, outputExample = ?, 
                    starterCode = ?, hints = ?, isActive = ?, expectedOutput = ?, lesson = ?
                  WHERE id = ?`,
          [targetProblem.title, targetProblem.description, targetProblem.language,
            targetProblem.outputExample, targetProblem.starterCode, targetProblem.hints,
            targetProblem.isActive, targetProblem.expectedOutput, targetProblem.lesson, currentId], (err) => {
            if (err) {
              console.error('❌ 첫 번째 업데이트 오류:', err);
              db.run('ROLLBACK');
              res.status(500).json({ error: '첫 번째 업데이트 실패: ' + err.message });
              return;
            }

            // targetProblem을 currentId의 데이터로 업데이트 (ID는 유지)
            db.run(`UPDATE problems SET 
                      title = ?, description = ?, language = ?, outputExample = ?, 
                      starterCode = ?, hints = ?, isActive = ?, expectedOutput = ?, lesson = ?
                    WHERE id = ?`,
            [currentProblem.title, currentProblem.description, currentProblem.language,
              currentProblem.outputExample, currentProblem.starterCode, currentProblem.hints,
              currentProblem.isActive, currentProblem.expectedOutput, currentProblem.lesson, targetId], (err) => {
              if (err) {
                console.error('❌ 두 번째 업데이트 오류:', err);
                db.run('ROLLBACK');
                res.status(500).json({ error: '두 번째 업데이트 실패: ' + err.message });
                return;
              }

              // 커밋
              db.run('COMMIT', (err) => {
                if (err) {
                  console.error('❌ 커밋 오류:', err);
                  res.status(500).json({ error: '커밋 실패: ' + err.message });
                  return;
                }

                console.log('✅ 문제 순서 변경 완료:', currentProblem.title, '↔', targetProblem.title);
                res.json({ success: true, message: '순서가 성공적으로 변경되었습니다.' });
              });
            });
          });
        });
      });
    });
  });
});


// 문제 제출하기 (자동채점)
app.post('/api/problems/:problemId/submit', async (req, res) => {
  const { studentId, code } = req.body;
  const problemId = req.params.problemId;

  console.log('문제 제출 받음:', { problemId, studentId, codeLength: code?.length });

  // 1. 문제 정보 조회 (testCases 포함)
  db.get('SELECT * FROM problems WHERE id = ?', [problemId], async (err, problem) => {
    if (err || !problem) {
      console.error('문제 조회 실패:', err);
      return res.status(500).json({ error: '문제를 찾을 수 없습니다.' });
    }

    // 2. 테스트 케이스 파싱
    let testCases = [];
    try {
      if (problem.testCases) {
        const parsed = JSON.parse(problem.testCases);
        testCases = parsed.cases || [];
      }

      // 테스트 케이스가 없으면 기본 케이스 생성
      if (testCases.length === 0) {
        testCases = [{
          input: problem.inputExample,
          expected: problem.outputExample,
          description: '기본 테스트'
        }];
      }
    } catch (e) {
      console.error('테스트 케이스 파싱 오류:', e);
      testCases = [{
        input: problem.inputExample,
        expected: problem.outputExample,
        description: '기본 테스트'
      }];
    }

    console.log(`📋 ${testCases.length}개 테스트 케이스로 채점 시작`);

    // 3. 모든 테스트 케이스 실행
    let passedTests = 0;
    const totalTests = testCases.length;
    const results = [];

    try {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`🧪 테스트 ${i + 1}/${totalTests} 실행: ${testCase.description || '테스트 케이스'}`);

        let actualOutput = '';

        if (code.includes('#include') || code.match(/#includ|int main|printf\s*\(|return 0/)) {
          // C 언어 코드 실행
          const hasScanf = code.includes('scanf');
          const inputData = (hasScanf && testCase.input) ? [testCase.input] : null;

          if (hasScanf && !testCase.input) {
            actualOutput = '실행 오류: scanf가 있지만 입력 데이터가 없습니다';
          } else {
            const result = await executeCCodeWithInput(code, inputData);
            if (result.success) {
              actualOutput = result.output;
            } else {
              actualOutput = result.output || '실행 오류';
            }
          }
        } else {
          // Python 코드 실행
          actualOutput = executePythonCode(code);
        }

        // 출력 정규화
        const normalizedOutput = actualOutput
          .replace(/###NEWLINE###/g, '\n')
          .replace(/###TAB###/g, '\t')
          .replace(/###CARRIAGE###/g, '\r')
          .trim();

        const expectedOutput = (testCase.expected || '').trim();

        // 유연한 채점: 핵심 값이 포함되어 있는지 확인
        let isPassed = false;

        if (expectedOutput && normalizedOutput) {
          // 1. 정확히 일치하는 경우
          if (normalizedOutput === expectedOutput) {
            isPassed = true;
          }
          // 2. 핵심 값이 포함된 경우 (숫자나 핵심 문자열)
          else if (expectedOutput.match(/^\d+$/)) {
            // 예상 출력이 숫자인 경우 - 해당 숫자가 출력에 포함되어 있으면 정답
            isPassed = normalizedOutput.includes(expectedOutput);
          }
          // 3. 핵심 문자열이 포함된 경우
          else {
            // 예상 출력의 핵심 단어들이 모두 포함되어 있는지 확인
            const expectedWords = expectedOutput.split(/\s+/).filter(word => word.length > 0);
            isPassed = expectedWords.every(word => normalizedOutput.includes(word));
          }
        }

        console.log(`🔍 유연한 채점 - 예상: "${expectedOutput}", 실제: "${normalizedOutput}", 결과: ${isPassed ? 'PASS' : 'FAIL'}`);

        if (isPassed) {
          passedTests++;
        }

        results.push({
          testNumber: i + 1,
          description: testCase.description || `테스트 ${i + 1}`,
          input: testCase.input,
          expected: expectedOutput,
          actual: normalizedOutput,
          passed: isPassed
        });

        console.log(`${isPassed ? '✅' : '❌'} 테스트 ${i + 1}: ${isPassed ? 'PASS' : 'FAIL'}`);
        if (!isPassed) {
          console.log(`   예상: "${expectedOutput}"`);
          console.log(`   실제: "${normalizedOutput}"`);
        }
      }

      // 4. 점수 계산 (첫 번째 테스트만 채점에 사용, 나머지는 자습용)
      let stars = 0;
      if (results.length > 0 && results[0].passed) {
        stars = 1; // 첫 번째 테스트 통과하면 1점 (백준/코드업 스타일)
      } else {
        stars = 0; // 첫 번째 테스트 실패하면 0점
      }

      console.log(`📊 백준 스타일 채점: 첫 번째 테스트 ${results[0]?.passed ? 'PASS' : 'FAIL'} → ${stars}점`);
      console.log(`📚 추가 테스트들은 학생 자습용: ${passedTests}/${totalTests} 통과`);

      console.log('📊 다중 테스트 케이스 채점 결과:', {
        problemId,
        studentId,
        passedTests: `${passedTests}/${totalTests}`,
        stars,
        allPassed: passedTests === totalTests
      });

      // 4. 결과 저장
      db.run(`INSERT OR REPLACE INTO problem_solutions (studentId, problemId, status, stars, code, submittedAt) 
              VALUES (?, ?, 'solved', ?, ?, CURRENT_TIMESTAMP)`,
      [studentId, problemId, stars, code], function(err) {
        if (err) {
          console.error('문제 제출 DB 오류:', err);
          res.status(500).json({ error: err.message });
          return;
        }
        console.log('문제 제출 성공:', { problemId, studentId, stars });
        console.log('🔍 소켓 이벤트 전송 준비 중...');

        try {
          // 관리자에게 학생 코드 업데이트 알림
          const updateData = {
            studentId,
            problemId,
            code,
            stars,
            timestamp: new Date().toISOString()
          };
          console.log('📡 학생 코드 업데이트 소켓 이벤트 전송:', updateData);
          io.emit('studentCodeUpdate', updateData);
          console.log('✅ 소켓 이벤트 전송 완료');
        } catch (socketError) {
          console.error('🚨 소켓 이벤트 전송 실패:', socketError);
        }

        console.log('📤 HTTP 응답 전송 중...');
        res.json({
          success: true,
          stars,
          passedTests,
          totalTests,
          results,
          summary: `${passedTests}/${totalTests} 테스트 통과`
        });
        console.log('✅ HTTP 응답 전송 완료');
      });

    } catch (error) {
      console.error('자동채점 오류:', error);
      // 실행 오류시 0점 처리
      db.run(`INSERT OR REPLACE INTO problem_solutions (studentId, problemId, status, stars, code, submittedAt) 
              VALUES (?, ?, 'solved', 0, ?, CURRENT_TIMESTAMP)`,
      [studentId, problemId, code], function(err) {
        if (err) {
          console.error('문제 제출 DB 오류:', err);
          res.status(500).json({ error: err.message });
          return;
        }
        console.log('문제 제출 성공 (실행 오류):', { problemId, studentId, stars: 0 });

        // 관리자에게 학생 코드 업데이트 알림 (실행 오류)
        const updateData = {
          studentId,
          problemId,
          code,
          stars: 0,
          timestamp: new Date().toISOString()
        };
        console.log('📡 학생 코드 업데이트 소켓 이벤트 전송 (실행오류):', updateData);
        io.emit('studentCodeUpdate', updateData);

        res.json({ success: true, stars: 0, error: '코드 실행 중 오류가 발생했습니다.' });
      });
    }
  });
});

// 학생별 문제 상태 조회
app.get('/api/student/:studentId/problem-status', (req, res) => {
  const studentId = req.params.studentId;
  console.log('📋 학생 문제 상태 조회 요청:', { studentId });

  db.all('SELECT problemId, status, stars, code FROM problem_solutions WHERE studentId = ?',
    [studentId], (err, rows) => {
      if (err) {
        console.error('🚨 학생 문제 상태 조회 오류:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      console.log('📊 학생 문제 상태 조회 결과:', { studentId, rowCount: rows.length });

      const statusMap = {};
      rows.forEach(row => {
        statusMap[row.problemId] = {
          status: row.status,
          stars: row.stars,
          code: row.code
        };
        console.log(`   - 문제 ${row.problemId}: ${row.status}, ${row.stars}점, 코드 ${row.code ? row.code.length : 0}자`);
      });

      res.json(statusMap);
    });
});

// 학생의 현재 화면 상태 조회 API
app.get('/api/admin/student/:studentId/current-screen', (req, res) => {
  const studentId = req.params.studentId;
  console.log('📺 [API] 학생 현재 화면 상태 조회 요청:', studentId);
  console.log('📦 [API] 현재 studentScreens 전체 데이터:', Object.keys(studentScreens));

  // studentScreens에서 해당 학생의 최신 화면 상태 반환
  const screenData = studentScreens[studentId];

  if (screenData) {
    console.log('✅ [API] 학생 화면 상태 발견:', {
      studentId: screenData.studentId,
      studentName: screenData.studentName,
      selectedProblem: screenData.selectedProblem?.title || screenData.selectedProblem,
      timestamp: screenData.timestamp
    });
    res.json({
      success: true,
      screenData: screenData
    });
  } else {
    console.log('⚠️ [API] 학생 화면 상태 없음 - studentId:', studentId);
    res.json({
      success: false,
      message: '학생의 화면 상태를 찾을 수 없습니다.'
    });
  }
});

// 관리자용 모든 학생 코드 조회 API
app.get('/api/admin/students-code', (req, res) => {
  db.all(`
    SELECT 
      s.id as studentId, 
      s.name as studentName, 
      ps.problemId, 
      ps.code, 
      ps.status, 
      ps.stars,
      p.title as problemTitle
    FROM students s
    LEFT JOIN problem_solutions ps ON s.id = ps.studentId
    LEFT JOIN problems p ON ps.problemId = p.id
    ORDER BY s.id, ps.problemId
  `, (err, rows) => {
    if (err) {
      console.error('🚨 학생 코드 조회 오류:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    console.log('📊 학생 코드 조회 원본 데이터:', rows.length, '건');

    // 학생별로 데이터 그룹화
    const studentsData = {};
    rows.forEach(row => {
      if (!studentsData[row.studentId]) {
        studentsData[row.studentId] = {
          studentId: row.studentId,
          studentName: row.studentName,
          problems: {}
        };
      }

      if (row.problemId) {
        studentsData[row.studentId].problems[row.problemId] = {
          problemId: row.problemId,
          problemTitle: row.problemTitle,
          code: row.code || '',
          status: row.status,
          stars: row.stars
        };
      }
    });

    const result = Object.values(studentsData);
    console.log('📊 학생 코드 조회 결과:', result.length, '명의 학생');
    result.forEach(student => {
      console.log(`   - ${student.studentName} (ID: ${student.studentId}): ${Object.keys(student.problems).length}개 문제`);
    });

    res.json(result);
  });
});

// 피드백 API

// 피드백 전송 API
app.post('/api/feedback', (req, res) => {
  const { studentId, problemId, adminId, message } = req.body;

  db.run('INSERT INTO feedbacks (studentId, problemId, adminId, message) VALUES (?, ?, ?, ?)',
    [studentId, problemId, adminId, message], function(err) {
      if (err) {
        console.error('피드백 저장 실패:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }

      console.log('피드백 저장 완료, ID:', this.lastID);

      // 실시간으로 피드백 전송
      io.emit('feedbackReceived', {
        id: this.lastID,
        studentId,
        problemId,
        adminId,
        message,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, id: this.lastID });
    });
});

// 학생별 피드백 조회 API
app.get('/api/feedback/student/:studentId', (req, res) => {
  const { studentId } = req.params;

  db.all(`SELECT f.*, a.username as adminName, p.title as problemTitle 
          FROM feedbacks f 
          LEFT JOIN admins a ON f.adminId = a.id 
          LEFT JOIN problems p ON f.problemId = p.id 
          WHERE f.studentId = ? 
          ORDER BY f.timestamp DESC`,
  [studentId], (err, rows) => {
    if (err) {
      console.error('피드백 조회 실패:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 최신 피드백 조회 API (학생용 - 가장 최근 피드백)
app.get('/api/feedback/latest/:studentId', (req, res) => {
  const { studentId } = req.params;

  db.get(`SELECT f.*, a.username as adminName, p.title as problemTitle 
          FROM feedbacks f 
          LEFT JOIN admins a ON f.adminId = a.id 
          LEFT JOIN problems p ON f.problemId = p.id 
          WHERE f.studentId = ? 
          ORDER BY f.timestamp DESC 
          LIMIT 1`,
  [studentId], (err, row) => {
    if (err) {
      console.error('최신 피드백 조회 실패:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { message: '아직 피드백이 없습니다.' });
  });
});

// 도움 요청 테이블 생성
db.run(`CREATE TABLE IF NOT EXISTS help_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  studentName TEXT NOT NULL,
  problemId INTEGER NOT NULL,
  problemTitle TEXT NOT NULL,
  message TEXT NOT NULL,
  code TEXT,
  timestamp TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// 도움 요청 API
app.post('/api/help-request', (req, res) => {
  const { studentId, studentName, problemId, problemTitle, message, code, timestamp } = req.body;

  console.log('🚨🚨🚨 HTTP API로 도움 요청 받음:', req.body);

  // 데이터베이스에 저장
  const query = `INSERT INTO help_requests (studentId, studentName, problemId, problemTitle, message, code, timestamp, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`;

  db.run(query, [studentId, studentName, problemId, problemTitle, message, code, timestamp], function(err) {
    if (err) {
      console.error('도움 요청 저장 오류:', err);
      return res.status(500).json({ error: '도움 요청 저장에 실패했습니다.' });
    }

    const helpRequestData = {
      id: this.lastID,
      studentId,
      studentName,
      problemId,
      problemTitle,
      message,
      code,
      timestamp,
      status: 'pending'
    };

    // 모든 클라이언트에게 소켓으로 브로드캐스트
    io.emit('helpRequest', helpRequestData);
    console.log('📡 모든 클라이언트에게 도움 요청 브로드캐스트 완료');

    res.json({ success: true, message: '도움 요청이 전송되었습니다.', id: this.lastID });
  });
});

// 도움 요청 조회 API (pending과 resolved 모두)
app.get('/api/help-requests', (req, res) => {
  const query = `SELECT * FROM help_requests WHERE status IN ('pending', 'resolved') ORDER BY 
                 CASE WHEN status = 'pending' THEN 0 ELSE 1 END, timestamp DESC`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('도움 요청 조회 오류:', err);
      return res.status(500).json({ error: '도움 요청 조회에 실패했습니다.' });
    }

    console.log('📋 미해결 도움 요청 조회:', rows.length, '건');
    res.json(rows);
  });
});

// 도움 요청 해결 API
app.put('/api/help-requests/:id/resolve', (req, res) => {
  const requestId = req.params.id;

  db.run('UPDATE help_requests SET status = ? WHERE id = ?', ['resolved', requestId], function(err) {
    if (err) {
      console.error('도움 요청 해결 처리 오류:', err);
      return res.status(500).json({ error: '해결 처리에 실패했습니다.' });
    }

    console.log('✅ 도움 요청 해결 처리:', requestId);
    res.json({ success: true, message: '도움 요청이 해결 처리되었습니다.' });
  });
});

// 도움 요청 삭제 API
app.delete('/api/help-requests/:id', (req, res) => {
  const requestId = req.params.id;

  db.run('DELETE FROM help_requests WHERE id = ?', [requestId], function(err) {
    if (err) {
      console.error('도움 요청 삭제 오류:', err);
      return res.status(500).json({ error: '삭제에 실패했습니다.' });
    }

    console.log('🗑️ 도움 요청 삭제:', requestId);
    res.json({ success: true, message: '도움 요청이 삭제되었습니다.' });
  });
});

// 실시간 메시지 테이블 생성
db.run(`CREATE TABLE IF NOT EXISTS live_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  adminId INTEGER DEFAULT 1,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  isRead INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// 실시간 메시지 전송 API
app.post('/api/live-message', (req, res) => {
  const { studentId, adminId = 1, message, timestamp } = req.body;

  console.log('💬 실시간 메시지 전송:', req.body);
  console.log('💬 사용할 adminId:', adminId);

  // 데이터베이스에 저장
  const query = `INSERT INTO live_messages (studentId, adminId, message, timestamp, isRead) 
                 VALUES (?, ?, ?, ?, 0)`;

  db.run(query, [studentId, adminId, message, timestamp], function(err) {
    if (err) {
      console.error('실시간 메시지 저장 오류:', err);
      return res.status(500).json({ error: '메시지 저장에 실패했습니다.' });
    }

    const messageData = {
      id: this.lastID,
      studentId,
      adminId,
      message,
      timestamp,
      isRead: 0
    };

    // 모든 클라이언트에게 소켓으로 실시간 전송 (학생은 자신의 ID로 필터링)
    io.emit('liveMessage', messageData);
    console.log('📡 모든 클라이언트에게 실시간 메시지 브로드캐스트 완료:', messageData);

    res.json({ success: true, message: '실시간 메시지가 전송되었습니다.', id: this.lastID });
  });
});

// 학생의 실시간 메시지 조회 API
app.get('/api/live-messages/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const query = 'SELECT * FROM live_messages WHERE studentId = ? ORDER BY timestamp DESC LIMIT 10';

  db.all(query, [studentId], (err, rows) => {
    if (err) {
      console.error('실시간 메시지 조회 오류:', err);
      return res.status(500).json({ error: '메시지 조회에 실패했습니다.' });
    }

    console.log('📋 학생 실시간 메시지 조회:', studentId, '/', rows.length, '건');
    res.json(rows);
  });
});

// 실시간 메시지 삭제 API
app.delete('/api/live-messages/:messageId', (req, res) => {
  const messageId = req.params.messageId;

  console.log('🗑️ 실시간 메시지 삭제 요청:', messageId);

  const query = 'DELETE FROM live_messages WHERE id = ?';

  db.run(query, [messageId], function(err) {
    if (err) {
      console.error('실시간 메시지 삭제 오류:', err);
      return res.status(500).json({ error: '메시지 삭제에 실패했습니다.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: '삭제할 메시지를 찾을 수 없습니다.' });
    }

    console.log('✅ 실시간 메시지 삭제 완료:', messageId);
    res.json({ success: true, message: '메시지가 삭제되었습니다.' });
  });
});

// 코드 수정사항 전송 API
app.post('/api/code-modification', (req, res) => {
  const { studentId, adminId = 1, originalCode, modifiedCode, modifications, timestamp } = req.body;

  console.log('🔧 코드 수정사항 전송:', { studentId, modifications: modifications?.length });

  const codeModificationData = {
    studentId,
    adminId,
    originalCode,
    modifiedCode,
    modifications,
    timestamp
  };

  // 해당 학생에게 소켓으로 실시간 전송
  io.emit('codeModification', codeModificationData);
  console.log('📡 학생에게 코드 수정사항 전송 완료');

  res.json({ success: true, message: '코드 수정사항이 전송되었습니다.' });
});

// 외부 컴파일러 사용 옵션
const USE_EXTERNAL_COMPILER = process.env.USE_EXTERNAL_COMPILER === 'true';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || 'your-api-key';

// Judge0 API로 실제 C 컴파일러 사용
async function executeWithJudge0(code, input = '') {
  if (!USE_EXTERNAL_COMPILER) return null;

  try {
    const axios = require('axios');

    // C 언어 제출 (언어 ID: 50 = C (GCC 9.2.0))
    const submitResponse = await axios.post('https://ce.judge0.com/submissions', {
      source_code: Buffer.from(code).toString('base64'),
      language_id: 50, // C (GCC 9.2.0)
      stdin: Buffer.from(input || '').toString('base64')
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const token = submitResponse.data.token;

    // 결과 대기 (최대 10초)
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const resultResponse = await axios.get(`https://ce.judge0.com/submissions/${token}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = resultResponse.data;
      if (result.status.id >= 3) { // 완료됨
        return {
          success: result.status.id === 3, // 3 = Accepted
          output: result.stdout ? Buffer.from(result.stdout, 'base64').toString() :
            result.stderr ? Buffer.from(result.stderr, 'base64').toString() :
              '실행 완료',
          error: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null
        };
      }
    }

    return { success: false, output: '실행 시간 초과' };
  } catch (error) {
    console.error('Judge0 API 오류:', error);
    return null; // fallback to internal compiler
  }
}

// 코드 실행 API (scanf 입력 지원)
app.post('/api/execute', async (req, res) => {
  const { code, inputData } = req.body;

  if (!code) {
    return res.status(400).json({ error: '코드가 제공되지 않았습니다.' });
  }

  console.log('코드 실행 요청:', {
    codeLength: code.length,
    hasInput: !!inputData,
    inputData: inputData
  });

  try {
    let result = {};
    console.log('코드 실행 시작...');

    if (code.includes('#include') || code.match(/#includ|int main|printf\s*\(|return 0/)) {
      // C 언어 코드 처리 (scanf 입력 지원)
      console.log('C 언어 코드로 감지됨');

      // 1순위: 외부 컴파일러 사용 (설정된 경우)
      if (USE_EXTERNAL_COMPILER && inputData) {
        console.log('🔧 외부 Judge0 API 사용');
        const externalResult = await executeWithJudge0(code, inputData.join('\n'));
        if (externalResult) {
          result = externalResult;
        } else {
          console.log('⚠️ 외부 API 실패, 내부 컴파일러 사용');
          result = await executeCCodeWithInput(code, inputData);
        }
      }
      // 2순위: 대화형 scanf 처리 시스템
      else if (code.includes('scanf')) {
        console.log('📥 scanf 포함된 C 코드, 대화형 처리 시작');

        if (inputData && inputData.length > 0) {
          // 사용자가 입력값을 제공한 경우
          console.log('👤 사용자 입력값으로 실행:', inputData);
          result = await executeCCodeWithInput(code, inputData);
        } else {
          // 입력값이 없으면 대화형 모드로 전환
          console.log('🖥️ 대화형 입력 모드 활성화');

          // 코드에서 scanf 개수 계산
          const scanfCount = (code.match(/scanf\s*\(/g) || []).length;
          console.log(`📊 감지된 scanf 개수: ${scanfCount}`);

          // scanf 개수만큼 입력 프롬프트 생성
          const inputPrompts = [];
          for (let i = 0; i < scanfCount; i++) {
            inputPrompts.push('숫자를 입력하세요: ');
          }

          result = {
            success: false,
            needsInput: true,
            message: 'scanf 입력이 필요합니다',
            inputPrompts: inputPrompts
          };
        }
      } else {
        console.log('📝 일반 C 코드, 기존 함수 사용');
        const output = await executeCCode(code);
        result = { success: true, output: output };
      }

    } else {
      // Python 코드 처리 (기존 로직)

      // Python 문법 오류 검사
      const syntaxErrors = [];

      // print 문법 검사
      const printMatches = code.match(/print\s*\([^)]*\)/g);
      if (printMatches) {
        for (const match of printMatches) {
          // print() 안에 내용이 있는지 확인
          if (match === 'print()') {
            continue; // 빈 print는 허용
          }
          // 따옴표 짝 맞추기
          const quoteCount = (match.match(/"/g) || []).length + (match.match(/'/g) || []).length;
          if (quoteCount > 0 && quoteCount % 2 !== 0) {
            syntaxErrors.push('print() 안의 따옴표가 짝이 맞지 않습니다.');
          }
        }
      }

      // 기본적인 괄호 짝 맞추기
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        syntaxErrors.push('소괄호 ()의 개수가 맞지 않습니다.');
      }

      // 문법 오류가 있으면 오류 메시지 반환
      if (syntaxErrors.length > 0) {
        return res.json({
          success: true,
          output: `⚠️ 문법 오류:\n${syntaxErrors.map(error => `• ${error}`).join('\n')}\n\n코드를 확인하고 다시 실행해보세요! 💪`
        });
      }

      let output = '';
      const lines = code.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const trimmedLine = line.trim();

        // print() 함수 처리
        if (trimmedLine.includes('print(')) {
          // print("text") 또는 print('text') 형태
          const stringMatch = trimmedLine.match(/print\(["']([^"']*?)["']\)/);
          if (stringMatch) {
            let text = stringMatch[1];
            // 한국 키보드 원화(₩) 기호를 백슬래시(\)로 변환
            text = text.replace(/₩/g, '\\');
            // 이스케이프 시퀀스 처리
            text = text.replace(/\\n/g, '\n');
            text = text.replace(/\\t/g, '\t');
            output += text + '\n';
            continue;
          }

          // print(숫자) 형태
          const numberMatch = trimmedLine.match(/print\((\d+(?:\.\d+)?)\)/);
          if (numberMatch) {
            output += numberMatch[1] + '\n';
            continue;
          }

          // print(계산식) 형태 - 간단한 사칙연산
          const calcMatch = trimmedLine.match(/print\((.+)\)/);
          if (calcMatch) {
            const expression = calcMatch[1].trim();
            try {
              // 안전한 계산식만 허용
              if (/^[\d\s+\-*/().]+$/.test(expression)) {
                const result = Function('"use strict"; return (' + expression + ')')();
                output += result + '\n';
              } else {
                output += expression + '\n';
              }
            } catch (e) {
              output += expression + '\n';
            }
            continue;
          }
        }

        // 변수 할당 처리 (간단한 경우만)
        if (trimmedLine.includes('=') && !trimmedLine.includes('==')) {
          // 나중에 확장 가능
          continue;
        }
      }

      if (!output.trim()) {
        output = '🤔 코드가 실행되었지만 출력이 없습니다.\nprint()를 사용해서 결과를 출력해보세요!';
      }

      // Python 코드는 기존 방식으로 처리
      result = { success: true, output: output.trim() };
    }

    // C 언어 코드 결과 처리
    if (!result.success && result.needsInput) {
      // scanf 입력이 필요한 경우
      console.log('📥 입력 필요:', result.inputPrompts);
      return res.json({
        success: false,
        needsInput: true,
        inputPrompts: result.inputPrompts
      });
    }

    console.log('코드 실행 결과:', result.output);

    // 코드 품질 분석 추가
    let codeAnalysis = null;
    if (code && (code.includes('#include') || code.includes('int main'))) {
      try {
        codeAnalysis = {
          quality: analyzeCodeQuality(code),
          complexity: analyzeComplexity(code)
        };
        console.log('✨ 코드 분석 완료:', codeAnalysis.quality.score + '점');
      } catch (analyzeError) {
        console.error('코드 분석 오류:', analyzeError);
      }
    }

    res.json({
      success: true,
      output: result.output || '실행 완료',
      analysis: codeAnalysis
    });

  } catch (error) {
    console.error('코드 실행 오류:', error);
    res.status(500).json({ error: '코드 실행 중 오류가 발생했습니다.' });
  }
});

// 현재 연결된 학생들 추적
const connectedStudents = new Set();
const studentScreens = {}; // 학생 화면 상태 저장

// HTTP API를 통한 학생 식별 엔드포인트
app.post('/api/identify-student', (req, res) => {
  const { studentId, userType } = req.body;

  console.log('🌐 [HTTP API] 학생 식별 요청:', { studentId, userType });

  if (userType === 'student' && studentId) {
    connectedStudents.add(studentId);
    console.log('✅ [HTTP API] 학생 연결 상태 등록:', { studentId });
    console.log('📊 [HTTP API] 현재 연결된 학생 ID들:', Array.from(connectedStudents));

    res.json({
      success: true,
      message: `학생 ${studentId}이 연결 상태로 등록되었습니다.`,
      connectedCount: connectedStudents.size
    });
  } else {
    console.log('❌ [HTTP API] 잘못된 학생 식별 요청:', { studentId, userType });
    res.status(400).json({
      success: false,
      message: '잘못된 학생 식별 정보입니다.'
    });
  }
});

// 모든 학생 상태를 offline으로 리셋하는 API (개선된 버전)
app.post('/api/admin/reset-student-status', (req, res) => {
  console.log('🔄 스마트 학생 상태 리셋 시작');
  console.log('📊 현재 연결된 학생 ID들:', Array.from(connectedStudents));

  // 현재 연결된 학생들은 제외하고 나머지만 offline으로 설정
  const connectedList = Array.from(connectedStudents);
  let query, params;

  if (connectedList.length > 0) {
    const placeholders = connectedList.map(() => '?').join(',');
    query = `UPDATE students SET status = ?, lastActive = CURRENT_TIMESTAMP WHERE id NOT IN (${placeholders})`;
    params = ['offline', ...connectedList];
    console.log('🎯 연결된 학생들은 제외하고 나머지만 offline으로 처리');
  } else {
    query = 'UPDATE students SET status = ?, lastActive = CURRENT_TIMESTAMP WHERE 1=1';
    params = ['offline'];
    console.log('⚠️ 연결된 학생이 없으므로 모든 학생을 offline으로 처리');
  }

  db.run(query, params, function(err) {
    if (err) {
      console.error('학생 상태 리셋 실패:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }

    console.log(`✅ ${this.changes}명의 학생 상태를 offline으로 업데이트 완료`);
    console.log(`🟢 ${connectedList.length}명의 연결된 학생은 온라인 상태 유지`);

    // 모든 연결된 클라이언트에게 상태 변경 브로드캐스트
    io.emit('allStudentsStatusReset', {
      status: 'offline',
      timestamp: new Date().toISOString(),
      message: `${this.changes}명의 비연결 학생이 offline으로 변경되었습니다. (${connectedList.length}명은 온라인 유지)`,
      offlineCount: this.changes,
      onlineCount: connectedList.length,
      onlineStudentIds: connectedList // 온라인 유지된 학생 ID 목록 추가
    });

    res.json({
      success: true,
      message: `${this.changes}명의 비연결 학생을 offline으로 업데이트했습니다. (${connectedList.length}명은 온라인 유지)`,
      updatedCount: this.changes,
      onlineCount: connectedList.length
    });
  });
});

// 디버깅: 연결된 학생 상태 조회 및 강제 제거
app.post('/api/admin/debug-connected-students', (req, res) => {
  const { action, studentId } = req.body;

  if (action === 'list') {
    res.json({
      success: true,
      connectedStudents: Array.from(connectedStudents),
      count: connectedStudents.size
    });
  } else if (action === 'remove' && studentId) {
    const wasConnected = connectedStudents.has(studentId);
    connectedStudents.delete(studentId);

    console.log(`🔧 [디버그] 학생 ${studentId}을 연결 목록에서 강제 제거`);
    console.log('📊 [디버그] 현재 연결된 학생 ID들:', Array.from(connectedStudents));

    res.json({
      success: true,
      message: `학생 ${studentId}${wasConnected ? '이 제거되었습니다' : '는 이미 연결되지 않았습니다'}`,
      connectedStudents: Array.from(connectedStudents)
    });
  } else if (action === 'clear') {
    connectedStudents.clear();
    console.log('🔧 [디버그] 모든 연결된 학생 목록 초기화');

    res.json({
      success: true,
      message: '모든 연결된 학생 목록이 초기화되었습니다',
      connectedStudents: []
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid action. Use: list, remove, or clear'
    });
  }
});

// Socket.io 연결 처리
io.on('connection', (socket) => {
  console.log('사용자가 연결되었습니다:', socket.id);

  // 사용자 식별 정보 저장
  socket.on('identify', (data) => {
    socket.userType = data.userType;

    // 관리자 식별 처리
    if (data.userType === 'admin') {
      socket.adminId = data.adminId || 'admin';
      console.log('🔍 관리자 식별됨:', {
        adminId: socket.adminId,
        userType: socket.userType,
        socketId: socket.id
      });
    }
    // 학생 식별 처리
    else if (data.userType === 'student' && data.studentId) {
      socket.studentId = data.studentId;
      connectedStudents.add(data.studentId);
      console.log('✅ 연결된 학생 추가:', data.studentId);
      console.log('📊 현재 연결된 학생 수:', connectedStudents.size);
    }

    console.log('사용자 식별됨:', { studentId: data.studentId, userType: data.userType, socketId: socket.id });
  });

  // 학생 코드 업데이트
  socket.on('updateCode', (data) => {
    const { studentId, code, problemId } = data;
    console.log('코드 업데이트 받음:', {
      studentId,
      problemId: problemId || 'undefined',
      code: code?.substring(0, 50) + '...',
      fullData: data
    });

    // students 테이블 업데이트 (기존 호환성)
    db.run('UPDATE students SET code = ?, lastActive = CURRENT_TIMESTAMP WHERE id = ?',
      [code, studentId], (err) => {
        if (err) {
          console.error('students 테이블 업데이트 실패:', err);
        }
      });

    // problemId가 있으면 problem_solutions 테이블에 코드만 업데이트 (상태 변경하지 않음)
    if (problemId) {
      db.run(`UPDATE problem_solutions SET code = ?, submittedAt = CURRENT_TIMESTAMP 
              WHERE studentId = ? AND problemId = ?`,
      [code, studentId, problemId], (err) => {
        if (!err) {
          console.log('문제별 코드 저장 성공 (상태 유지)');
        } else {
          console.error('문제별 코드 저장 실패:', err);
        }
      });
    }

    console.log('코드 업데이트 DB 저장 성공, 브로드캐스트 전송');
    // 모든 클라이언트에게 코드 변경 알림
    socket.broadcast.emit('codeUpdated', { studentId, code, problemId });
  });

  // 구 도움 요청 (하위 호환성)
  socket.on('requestHelp', (studentId) => {
    db.run('UPDATE students SET needsHelp = 1 WHERE id = ?', studentId, (err) => {
      if (!err) {
        socket.broadcast.emit('helpRequested', studentId);
      }
    });
  });

  // 새로운 도움 요청 (메시징 시스템)
  socket.on('helpRequest', (helpRequestData) => {
    console.log('🚨🚨🚨 백엔드에서 도움 요청 받음:', helpRequestData);

    // 모든 사용자(관리자 포함)에게 실시간으로 도움 요청 전송
    io.emit('helpRequest', helpRequestData);

    console.log('📡 모든 클라이언트에게 도움 요청 브로드캐스트 완료');
  });

  // 도움 완료
  socket.on('helpCompleted', (studentId) => {
    db.run('UPDATE students SET needsHelp = 0 WHERE id = ?', studentId, (err) => {
      if (!err) {
        socket.broadcast.emit('helpCompleted', studentId);
      }
    });
  });

  // 학생 상태 업데이트
  socket.on('updateStudentStatus', (data) => {
    const { studentId, status } = data;
    db.run('UPDATE students SET status = ?, lastActive = CURRENT_TIMESTAMP WHERE id = ?',
      [status, studentId], (err) => {
        if (!err) {
          socket.broadcast.emit('studentStatusUpdated', { studentId, status });
        }
      });
  });

  // 연결 테스트
  socket.on('connectionTest', (data) => {
    console.log('🧪 연결 테스트 받음:', data);
    // 요청한 사용자에게 응답 전송
    socket.emit('connectionTestResponse', {
      ...data,
      serverTimestamp: new Date().toISOString(),
      message: '소켓 연결이 정상적으로 작동 중입니다'
    });
  });

  // 연결 해제
  // 학생 코드 변경 실시간 전송
  socket.on('studentCodeChange', (codeData) => {
    console.log('📡 학생 코드 변경 브로드캐스트:', {
      studentId: codeData.studentId,
      studentName: codeData.studentName,
      codeLength: codeData.code?.length
    });

    // 모든 연결된 클라이언트에게 브로드캐스트 (자신 제외)
    socket.broadcast.emit('studentCodeChange', codeData);
  });

  // 학생 수동 로그아웃 처리
  socket.on('studentLogout', (logoutData) => {
    console.log('🚪 학생 수동 로그아웃 처리:', logoutData);

    // 🚀 [로그아웃] connectedStudents Set에서 제거
    connectedStudents.delete(logoutData.studentId);
    console.log('🚪 [로그아웃] 학생을 연결된 목록에서 제거:', logoutData.studentId);
    console.log('📊 [로그아웃] 현재 연결된 학생 ID들:', Array.from(connectedStudents));

    // 데이터베이스에서 학생 상태를 offline으로 업데이트
    db.run('UPDATE students SET status = ?, lastActive = CURRENT_TIMESTAMP WHERE id = ?',
      ['offline', logoutData.studentId], (err) => {
        if (err) {
          console.error('학생 로그아웃 상태 업데이트 실패:', err.message);
        } else {
          console.log(`학생 ${logoutData.studentId} 수동 로그아웃 상태 업데이트 완료`);

          // 모든 연결된 클라이언트에게 상태 변경 브로드캐스트
          socket.broadcast.emit('studentStatusUpdated', {
            studentId: logoutData.studentId,
            status: 'offline',
            logoutType: 'manual'
          });

          console.log('✅ 학생 로그아웃 상태 브로드캐스트 완료');
        }
      });
  });

  // 학생 화면 상태 업데이트
  socket.on('studentScreenUpdate', (screenData) => {
    console.log('🔍 [DEBUG] studentScreenUpdate 이벤트 받음 - 상세 정보:');
    console.log('🔍 [DEBUG] Socket 정보:', {
      socketId: socket.id,
      remoteAddress: socket.request.connection?.remoteAddress,
      userAgent: socket.request.headers?.['user-agent']?.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });

    console.log('📺 학생 화면 상태 업데이트 받음:', {
      studentId: screenData.studentId,
      studentName: screenData.studentName,
      currentScreen: screenData.currentScreen,
      selectedProblem: screenData.selectedProblem?.title || screenData.selectedProblem,
      problemId: screenData.selectedProblem?.id || screenData.problemId,
      timestamp: screenData.timestamp,
      dataKeys: Object.keys(screenData || {}),
      dataSize: JSON.stringify(screenData).length
    });

    console.log('🔍 [DEBUG] 전체 screenData 내용:', screenData);

    // AdminPanel이 기대하는 형식으로 데이터를 정규화
    const normalizedScreenData = {
      ...screenData,
      // AdminPanel이 selectedProblem.id와 selectedProblem.title을 기대하므로
      // 필요시 정규화하여 전송
      selectedProblem: screenData.selectedProblem && typeof screenData.selectedProblem === 'object'
        ? screenData.selectedProblem
        : screenData.selectedProblem && screenData.problemId
          ? { id: screenData.problemId, title: screenData.selectedProblem }
          : screenData.selectedProblem
    };

    // 📦 [API용 저장] 학생 화면 상태를 저장 (API 조회용)
    studentScreens[screenData.studentId] = normalizedScreenData;
    console.log('📦 studentScreens에 저장됨:', screenData.studentId, '-> 현재 저장된 학생 수:', Object.keys(studentScreens).length);
    console.log('🔍 [DEBUG] 현재 studentScreens 키들:', Object.keys(studentScreens));

    try {
      // 모든 관리자에게 학생 화면 상태 브로드캐스트
      console.log('🔍 [DEBUG] broadcast.emit() 실행 시도 중...');
      socket.broadcast.emit('studentScreenUpdate', normalizedScreenData);
      console.log('✅ 관리자에게 화면 상태 브로드캐스트 완료');
      console.log('🔍 [DEBUG] 브로드캐스트된 데이터:', {
        studentId: normalizedScreenData.studentId,
        studentName: normalizedScreenData.studentName,
        problemTitle: normalizedScreenData.selectedProblem?.title
      });
    } catch (error) {
      console.error('❌ [DEBUG] 브로드캐스트 에러:', error);
    }
  });

  // 관리자가 특정 학생 화면 요청
  socket.on('requestStudentScreen', (requestData) => {
    console.log('👀 관리자가 학생 화면 요청:', requestData);

    try {
      const shareRequest = {
        studentId: requestData.studentId,
        adminId: requestData.adminId
      };

      // 모든 클라이언트에게 화면 공유 요청 전송 (관리자 제외)
      console.log('📤 shareScreenRequest 브로드캐스트 전송:', shareRequest);
      socket.broadcast.emit('shareScreenRequest', shareRequest);

      // 서버에 연결된 모든 소켓에도 직접 전송 (더 확실하게)
      io.emit('shareScreenRequest', shareRequest);
      console.log('✅ shareScreenRequest 전체 이벤트 전송 완료');
    } catch (error) {
      console.error('❌ requestStudentScreen 처리 중 오류:', error);
    }
  });

  // 실행 버튼 방식으로 학생 화면 상태 강제 저장 요청
  socket.on('forceStudentScreenSave', (data) => {
    console.log('💾 [실행 버튼 방식] 학생 화면 상태 강제 저장 요청:', data);

    try {
      const { studentId } = data;

      // 모든 클라이언트에게 브로드캐스트 (학생이 자신의 ID를 확인하여 응답)
      io.emit('requestCurrentScreenSave', { studentId });
      console.log('✅ [실행 버튼 방식] requestCurrentScreenSave 이벤트 브로드캐스트 완료:', studentId);

      // 추가 디버깅: 현재 연결된 소켓 수 확인
      console.log('🔗 현재 연결된 소켓 수:', io.engine.clientsCount);
      console.log('📡 브로드캐스트 대상 소켓들:', Array.from(io.sockets.sockets.keys()));
    } catch (error) {
      console.error('❌ forceStudentScreenSave 처리 중 오류:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('사용자가 연결을 해제했습니다:', socket.id);

    // 학생이 연결 해제 시 상태를 offline으로 업데이트
    if (socket.studentId && socket.userType === 'student') {
      // ⚠️ [수정됨] 소켓이 끊어져도 로그인된 학생은 연결된 상태로 유지
      // connectedStudents Set에서 제거하지 않음 (로그아웃할 때만 제거)
      console.log('🔌 소켓 연결 해제되었지만 학생은 로그인 상태 유지:', socket.studentId);
      console.log('📊 현재 연결된 학생 수 (변경 없음):', connectedStudents.size);

      db.run('UPDATE students SET status = ?, lastActive = CURRENT_TIMESTAMP WHERE id = ?',
        ['offline', socket.studentId], (err) => {
          if (err) {
            console.error('학생 상태 업데이트 실패:', err.message);
          } else {
            console.log(`학생 ${socket.studentId} 상태를 offline으로 업데이트`);
            // 모든 연결된 클라이언트에게 상태 변경 브로드캐스트
            socket.broadcast.emit('studentStatusUpdated', {
              studentId: socket.studentId,
              status: 'offline'
            });
          }
        });
    }
  });
});

// 차시 관리 API
// 모든 차시 조회
app.get('/api/lessons', (req, res) => {
  db.all('SELECT * FROM lessons ORDER BY number', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 차시 추가
app.post('/api/lessons', (req, res) => {
  const { number, name, description } = req.body;

  db.run('INSERT INTO lessons (number, name, description) VALUES (?, ?, ?)',
    [number, name, description], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: '이미 존재하는 차시 번호입니다.' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }

      // 추가된 차시 정보 반환
      db.get('SELECT * FROM lessons WHERE id = ?', this.lastID, (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // 차시 추가 시 모든 클라이언트에게 알림
        io.emit('lessonUpdated');

        res.json(row);
      });
    });
});

// 차시 수정
app.put('/api/lessons/:id', (req, res) => {
  const { number, name, description } = req.body;

  db.run('UPDATE lessons SET number = ?, name = ?, description = ? WHERE id = ?',
    [number, name, description, req.params.id], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: '이미 존재하는 차시 번호입니다.' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }

      // 차시 수정 시 모든 클라이언트에게 알림
      io.emit('lessonUpdated');

      res.json({ success: true, changes: this.changes });
    });
});

// 차시 삭제
app.delete('/api/lessons/:id', (req, res) => {
  // 먼저 해당 차시에 문제가 있는지 확인
  db.get('SELECT COUNT(*) as count FROM problems WHERE lesson = (SELECT number FROM lessons WHERE id = ?)',
    [req.params.id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row.count > 0) {
        res.status(400).json({ error: '해당 차시에 문제가 있어 삭제할 수 없습니다. 먼저 문제를 삭제하거나 다른 차시로 이동해주세요.' });
        return;
      }

      // 차시 삭제
      db.run('DELETE FROM lessons WHERE id = ?', req.params.id, function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // 차시 삭제 시 모든 클라이언트에게 알림
        io.emit('lessonUpdated');

        res.json({ success: true });
      });
    });
});

// 힌트 요청 API
app.post('/api/hint-request', (req, res) => {
  const { studentId, studentName, problemId, problemTitle, code, message } = req.body;

  console.log('📩 힌트 요청 받음:', { studentName, problemTitle, messageLength: message?.length });

  if (!studentId || !studentName || !problemId || !problemTitle || !code) {
    return res.status(400).json({
      success: false,
      error: '필수 정보가 누락되었습니다.'
    });
  }

  const sql = `INSERT INTO hint_requests
    (student_id, student_name, problem_id, problem_title, student_code, request_message)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [studentId, studentName, problemId, problemTitle, code, message || ''], function(err) {
    if (err) {
      console.error('힌트 요청 저장 오류:', err.message);
      return res.status(500).json({
        success: false,
        error: '힌트 요청 저장에 실패했습니다.'
      });
    }

    const requestId = this.lastID;
    console.log(`✅ 힌트 요청 저장됨 (ID: ${requestId})`);

    // 관리자에게 실시간 알림 전송
    io.emit('newHintRequest', {
      id: requestId,
      studentName,
      problemTitle,
      message: message || '힌트를 요청했습니다',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      requestId,
      message: '힌트 요청이 선생님께 전송되었습니다.'
    });
  });
});

// 힌트 요청 목록 조회 (관리자용)
app.get('/api/hint-requests', (req, res) => {
  const status = req.query.status || 'pending';

  const sql = `SELECT * FROM hint_requests
               WHERE status = ?
               ORDER BY created_at DESC`;

  db.all(sql, [status], (err, rows) => {
    if (err) {
      console.error('힌트 요청 조회 오류:', err.message);
      return res.status(500).json({
        success: false,
        error: '힌트 요청 조회에 실패했습니다.'
      });
    }

    console.log(`📋 힌트 요청 조회: ${rows.length}개 (상태: ${status})`);
    res.json({ success: true, requests: rows });
  });
});

// 관리자 힌트 응답 API
app.post('/api/hint-response', (req, res) => {
  const { requestId, response, hintLevel } = req.body;

  console.log('📨 관리자 힌트 응답:', { requestId, hintLevel, responseLength: response?.length });

  if (!requestId || !response) {
    return res.status(400).json({
      success: false,
      error: '요청 ID와 응답 내용이 필요합니다.'
    });
  }

  const sql = `UPDATE hint_requests
               SET teacher_response = ?, hint_level = ?, status = 'answered', responded_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [response, hintLevel || 1, requestId], function(err) {
    if (err) {
      console.error('힌트 응답 저장 오류:', err.message);
      return res.status(500).json({
        success: false,
        error: '힌트 응답 저장에 실패했습니다.'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        error: '해당 요청을 찾을 수 없습니다.'
      });
    }

    console.log(`✅ 힌트 응답 저장됨 (요청 ID: ${requestId}, 레벨: ${hintLevel})`);

    // 학생에게 실시간 힌트 전송
    db.get('SELECT student_id, student_name FROM hint_requests WHERE id = ?', [requestId], (err, row) => {
      if (!err && row) {
        io.emit('hintReceived', {
          studentId: row.student_id,
          studentName: row.student_name,
          hint: response,
          level: hintLevel || 1,
          timestamp: new Date().toISOString()
        });
        console.log(`📩 학생 ${row.student_name}에게 힌트 전송됨`);
      }
    });

    res.json({
      success: true,
      message: '힌트가 학생에게 전송되었습니다.'
    });
  });
});

// 단계별 미리 정의된 힌트 제공 API
app.post('/api/provide-hint', (req, res) => {
  const { requestId, hintType } = req.body;

  console.log('🎯 단계별 힌트 제공:', { requestId, hintType });

  if (!requestId || !hintType) {
    return res.status(400).json({
      success: false,
      error: '요청 ID와 힌트 타입이 필요합니다.'
    });
  }

  // 미리 정의된 힌트들
  const predefinedHints = {
    level1: '코드 구조를 다시 한번 살펴보세요. C 프로그램의 기본 형태를 생각해보세요.',
    level2: 'main 함수는 보통 어떤 값을 반환해야 할까요? C 언어 교재의 예시를 참고해보세요.',
    level3: "main 함수 끝에 'return 0;'을 추가해보세요. 이는 프로그램이 성공적으로 끝났다는 신호입니다.",
    direct: 'return 0;을 main 함수 마지막에 추가하세요.',
    structure: 'C 프로그램의 기본 구조: #include <stdio.h> → int main() { → 코드 → return 0; }',
    encourage: '거의 다 맞았어요! 작은 부분만 수정하면 완벽합니다.'
  };

  const hintText = predefinedHints[hintType];
  if (!hintText) {
    return res.status(400).json({
      success: false,
      error: '잘못된 힌트 타입입니다.'
    });
  }

  const hintLevel = hintType.includes('level') ? parseInt(hintType.replace('level', '')) :
    (hintType === 'direct' ? 4 : 1);

  const sql = `UPDATE hint_requests
               SET teacher_response = ?, hint_level = ?, status = 'answered', responded_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [hintText, hintLevel, requestId], function(err) {
    if (err) {
      console.error('미리 정의된 힌트 저장 오류:', err.message);
      return res.status(500).json({
        success: false,
        error: '힌트 저장에 실패했습니다.'
      });
    }

    console.log(`✅ ${hintType} 힌트 제공됨 (요청 ID: ${requestId})`);

    // 학생에게 실시간 힌트 전송
    db.get('SELECT student_id, student_name FROM hint_requests WHERE id = ?', [requestId], (err, row) => {
      if (!err && row) {
        io.emit('hintReceived', {
          studentId: row.student_id,
          studentName: row.student_name,
          hint: hintText,
          level: hintLevel,
          type: hintType,
          timestamp: new Date().toISOString()
        });
        console.log(`📩 ${hintType} 힌트가 ${row.student_name}에게 전송됨`);
      }
    });

    res.json({
      success: true,
      message: `${hintType} 힌트가 학생에게 전송되었습니다.`,
      hint: hintText
    });
  });
});

// ========================================
// 🤖 AI 교사 가이드 시스템 API
// ========================================

// 교사를 위한 학생 코드 AI 분석 API
app.post('/api/teacher-analyze', (req, res) => {
  const { code, studentName, problemId } = req.body;

  console.log('🎓 교사용 AI 분석 요청:', {
    studentName: studentName || 'Unknown',
    problemId: problemId || 'Unknown',
    codeLength: code ? code.length : 0
  });

  if (!code) {
    return res.status(400).json({
      success: false,
      error: '분석할 코드가 필요합니다.'
    });
  }

  try {
    // AI 교사 가이드 생성
    const teacherGuide = generateTeacherGuide(code);

    // 교사용 주석이 포함된 코드 생성
    const commentedCode = generateCommentedCodeForTeacher(code, teacherGuide.studentCodeAnalysis);

    console.log('✅ AI 분석 완료:', {
      score: teacherGuide.studentCodeAnalysis.quality.score,
      issuesCount: teacherGuide.studentCodeAnalysis.quality.issues.length,
      teachingStrategy: teacherGuide.teachingStrategy.split(':')[0]
    });

    res.json({
      success: true,
      studentInfo: {
        name: studentName || 'Unknown',
        problemId: problemId || 'Unknown'
      },
      analysis: teacherGuide,
      commentedCode: commentedCode,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI 분석 오류:', error.message);
    res.status(500).json({
      success: false,
      error: 'AI 분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 힌트 요청과 함께 AI 분석 제공하는 통합 API
app.post('/api/hint-request-with-analysis', (req, res) => {
  const { studentId, studentName, problemId, problemTitle, code, message } = req.body;

  console.log('💡 힌트 요청 + AI 분석:', {
    studentName,
    problemId,
    codeLength: code ? code.length : 0
  });

  if (!studentId || !studentName || !problemId || !code) {
    return res.status(400).json({
      success: false,
      error: '모든 필수 정보가 필요합니다. (studentId, studentName, problemId, code)'
    });
  }

  // 1. 기존 힌트 요청 저장
  const stmt = db.prepare(`
    INSERT INTO hint_requests
    (student_id, student_name, problem_id, problem_title, student_code, request_message, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `);

  stmt.run([studentId, studentName, problemId, problemTitle || `문제 ${problemId}`, code, message || '도움이 필요합니다'],
    function(err) {
      if (err) {
        console.error('❌ 힌트 요청 저장 실패:', err.message);
        return res.status(500).json({
          success: false,
          error: '힌트 요청 저장에 실패했습니다.',
          details: err.message
        });
      }

      const requestId = this.lastID;

      try {
      // 2. AI 교사 가이드 생성
        const teacherGuide = generateTeacherGuide(code);
        const commentedCode = generateCommentedCodeForTeacher(code, teacherGuide.studentCodeAnalysis);

        // 3. 실시간 알림 - 힌트 요청 + AI 분석 결과
        io.emit('newHintRequest', {
          id: requestId,
          studentId,
          studentName,
          problemId,
          problemTitle: problemTitle || `문제 ${problemId}`,
          code,
          message: message || '도움이 필요합니다',
          aiAnalysis: teacherGuide,
          commentedCode: commentedCode,
          timestamp: new Date().toISOString()
        });

        console.log(`📡 힌트 요청 + AI 분석 전송됨: ${studentName} (요청 ID: ${requestId})`);

        res.json({
          success: true,
          requestId: requestId,
          message: '힌트 요청이 AI 분석과 함께 선생님에게 전송되었습니다.',
          aiAnalysis: teacherGuide
        });

      } catch (analysisError) {
        console.error('❌ AI 분석 오류:', analysisError.message);

        // AI 분석 실패해도 기본 힌트 요청은 전송
        io.emit('newHintRequest', {
          id: requestId,
          studentId,
          studentName,
          problemId,
          problemTitle: problemTitle || `문제 ${problemId}`,
          code,
          message: message || '도움이 필요합니다',
          aiAnalysis: null,
          error: 'AI 분석 실패',
          timestamp: new Date().toISOString()
        });

        res.json({
          success: true,
          requestId: requestId,
          message: '힌트 요청이 전송되었습니다. (AI 분석은 실패했습니다)',
          aiAnalysisError: analysisError.message
        });
      }
    });

  stmt.finalize();
});

// ========================================
// 📊 학습 분석 API (Phase 1.1)
// ========================================

// 학생별 학습 활동 분석 데이터 조회
app.get('/api/analytics/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  console.log(`📊 학생 ${studentId}의 학습 분석 데이터 요청`);

  // 학습 활동 데이터 조회
  const query = `SELECT
    activity_type,
    problem_id,
    duration,
    data,
    timestamp,
    created_at
  FROM learning_analytics
  WHERE student_id = ?
  ORDER BY created_at DESC
  LIMIT 50`;

  db.all(query, [studentId], (err, activities) => {
    if (err) {
      console.error('❌ 학습 분석 조회 실패:', err.message);
      return res.status(500).json({ error: '학습 분석 데이터 조회 실패' });
    }

    // 활동 타입별 통계 계산
    const stats = {
      total_activities: activities.length,
      login_count: activities.filter(a => a.activity_type === 'login').length,
      problems_viewed: activities.filter(a => a.activity_type === 'problem_view').length,
      code_submissions: activities.filter(a => a.activity_type === 'code_submit').length,
      total_coding_time: activities
        .filter(a => a.duration)
        .reduce((sum, a) => sum + (a.duration || 0), 0)
    };

    console.log(`✅ 학생 ${studentId} 분석 완료: ${stats.total_activities}개 활동`);

    res.json({
      success: true,
      student_id: studentId,
      statistics: stats,
      recent_activities: activities.slice(0, 10),
      all_activities: activities
    });
  });
});

// 활동 추적 기록 API
app.post('/api/analytics/track', (req, res) => {
  const { student_id, activity_type, problem_id, duration, data } = req.body;

  console.log(`📝 활동 추적: 학생 ${student_id} - ${activity_type}`);

  const query = `INSERT INTO learning_analytics (student_id, activity_type, problem_id, duration, data) VALUES (?, ?, ?, ?, ?)`;

  db.run(query, [student_id, activity_type, problem_id || null, duration || null, JSON.stringify(data) || null], function(err) {
    if (err) {
      console.error('❌ 활동 추적 기록 실패:', err.message);
      return res.status(500).json({ error: '활동 추적 실패' });
    }

    console.log(`✅ 활동 기록됨: ID ${this.lastID}`);
    res.json({
      success: true,
      activity_id: this.lastID,
      message: '활동이 기록되었습니다'
    });
  });
});

// ========================================

const PORT = process.env.PORT || 3008;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`네트워크 접근이 가능합니다: http://192.168.68.59:${PORT}`);
  console.log('요일별 반 관리 기능이 활성화되었습니다.');
  console.log('📊 학습 분석 API가 활성화되었습니다.');
});
