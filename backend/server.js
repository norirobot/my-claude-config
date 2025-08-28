const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

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
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "http://192.168.68.55:3001", "http://192.168.68.55:3000", "http://192.168.68.55:8080"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// 미들웨어 설정
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "http://192.168.68.55:3001", "http://192.168.68.55:3000", "http://192.168.68.55:8080"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Rate limiting middleware
app.use(rateLimit);

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
  db.run(`ALTER TABLE students ADD COLUMN class TEXT DEFAULT '월요일반'`, (err) => {
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
  db.run(`ALTER TABLE problems ADD COLUMN isActive INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('문제 테이블 isActive 컬럼 추가 오류:', err.message);
    }
  });

  // 기존 문제 테이블에 inputExample 컬럼 추가 (없다면)
  db.run(`ALTER TABLE problems ADD COLUMN inputExample TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('문제 테이블 inputExample 컬럼 추가 오류:', err.message);
    } else if (!err) {
      console.log('inputExample 컬럼이 성공적으로 추가되었습니다.');
    }
  });

  // 기존 문제 테이블에 outputExample 컬럼 추가 (없다면)
  db.run(`ALTER TABLE problems ADD COLUMN outputExample TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('문제 테이블 outputExample 컬럼 추가 오류:', err.message);
    } else if (!err) {
      console.log('outputExample 컬럼이 성공적으로 추가되었습니다.');
    }
  });

  // 데이터베이스 스키마 확인
  db.all("PRAGMA table_info(problems)", (err, rows) => {
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
  db.run(`INSERT OR IGNORE INTO admins (username, password) VALUES ('admin', 'admin123')`);

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
      db.run(`UPDATE problems SET expectedOutput = '30', outputExample = '30' WHERE id = 3`, (updateErr) => {
        if (updateErr) {
          console.log('문제 3번 업데이트 오류:', updateErr.message);
        } else {
          console.log('문제 3번 expectedOutput과 outputExample이 수정되었습니다.');
        }
      });

      // 문제 7번 삭제 후 재생성
      db.run(`DELETE FROM problems WHERE id = 7`, (err) => {
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
        db.run(`INSERT OR IGNORE INTO lessons (number, name, description) VALUES (?, ?, ?)`,
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
  let needsInput = false;
  let inputPrompts = [];
  
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
    
    // scanf 문 찾기
    const scanfStatements = extractScanfStatements(code);
    
    // scanf가 있는데 입력 데이터가 없으면 입력 요청
    if (scanfStatements.length > 0 && !inputData) {
      console.log('📥 scanf 발견, 입력 필요:', scanfStatements);
      
      // scanf 이전의 printf 문에서 입력 프롬프트 추출
      const printfStatements = extractPrintfStatements(code);
      let printfIndex = 0;
      
      scanfStatements.forEach((stmt, index) => {
        const formatSpecifiers = extractFormatSpecifiers(stmt);
        formatSpecifiers.forEach(spec => {
          let prompt = '';
          
          // scanf 이전에 printf가 있으면 그것을 프롬프트로 사용
          if (printfIndex < printfStatements.length) {
            const printfStmt = printfStatements[printfIndex];
            const printfText = extractPrintfText(printfStmt);
            if (printfText && printfText.trim()) {
              prompt = printfText.trim();
              printfIndex++;
            }
          }
          
          // printf가 없거나 텍스트가 없으면 기본 프롬프트 사용
          if (!prompt) {
            if (spec === '%d') prompt = '정수를 입력하세요:';
            else if (spec === '%f') prompt = '실수를 입력하세요:';
            else if (spec === '%c') prompt = '문자를 입력하세요:';
            else if (spec === '%s') prompt = '문자열을 입력하세요:';
            else prompt = '값을 입력하세요:';
          }
          
          inputPrompts.push(prompt);
        });
      });
      
      return { 
        success: false, 
        needsInput: true, 
        inputPrompts: [...inputPrompts] // 배열 복사로 circular reference 방지
      };
    }
    
    // scanf 처리 (입력 데이터가 있는 경우)
    if (scanfStatements.length > 0 && inputData) {
      console.log('📝 scanf 실행 중:', { scanfStatements, inputData });
      let inputIndex = 0;
      
      for (const stmt of scanfStatements) {
        const result = executeScanf(stmt, inputData, inputIndex);
        if (result.error) {
          return { success: false, output: result.error };
        }
        inputIndex = result.nextInputIndex;
      }
    }
    
    // printf 문 찾기 및 실행 (scanf 프롬프트 제외)
    const printfStatements = extractPrintfStatements(code);
    
    for (const stmt of printfStatements) {
      console.log(`🔍 printf 문 실행 시작: "${stmt}"`);
      
      // scanf 프롬프트용 printf인지 확인 (scanf 바로 앞에 있는 printf는 제외)
      const codeLines = code.split('\n');
      const printfLineIndex = codeLines.findIndex(line => line.includes(stmt.replace(/printf\s*\(/, 'printf(')));
      const isScanfPrompt = scanfStatements.some(scanfStmt => {
        const scanfLineIndex = codeLines.findIndex(line => line.includes(scanfStmt.replace(/scanf\s*\(/, 'scanf(')));
        return printfLineIndex !== -1 && scanfLineIndex !== -1 && 
               scanfLineIndex - printfLineIndex >= 0 && scanfLineIndex - printfLineIndex <= 3;
      });
      
      if (!isScanfPrompt) {
        const result = executePrintf(stmt);
        console.log(`📤 printf 결과: "${result}"`);
        if (result) {
          output += result;
        }
      } else {
        console.log(`🚫 scanf 프롬프트 printf 제외: "${stmt}"`);
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

// 기존 함수는 호환성을 위해 유지 (비동기 처리 수정)
async function executeCCode(code) {
  const result = await executeCCodeWithInput(code);
  if (result.success) {
    return result.output;
  } else {
    return result.output || '실행 오류';
  }
}

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
            if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(expression)) {
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
  // 더 정확한 printf 매칭 (중첩된 괄호 포함)
  const regex = /printf\s*\([^;]*\)/g;
  let match;
  
  console.log('printf 추출 시작, 코드:', code);
  
  while ((match = regex.exec(code)) !== null) {
    const statement = match[0];
    console.log('추출된 printf 문:', statement);
    statements.push(statement);
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
  const formatMatch = scanfStatement.match(/scanf\s*\(\s*["'](.*?)["']/);
  if (!formatMatch) return [];
  
  const formatString = formatMatch[1];
  const specifiers = formatString.match(/%[dfsci]/g) || [];
  
  console.log('형식 지정자 추출:', { scanfStatement, formatString, specifiers });
  return specifiers;
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
  console.log(`📊 현재 변수들:`, currentVariables);
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
    
    db.get('SELECT * FROM students WHERE TRIM(studentId) = TRIM(?) AND TRIM(name) = TRIM(?)', 
           [username, password], (err, row) => {
      console.log('🔍 로그인 쿼리 결과:', { err, row, searchParams: { username, password } });
      
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (row) {
        console.log('✅ 학생 로그인 성공:', row);
        // 학생 상태를 온라인으로 변경
        db.run('UPDATE students SET status = ?, lastActive = CURRENT_TIMESTAMP WHERE id = ?', 
               ['online', row.id]);
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
  let params = [];
  
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
  let params = [];
  
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
  let params = [];
  
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

// 문제 시작하기 (달팽이 상태로 설정)
app.post('/api/problems/:problemId/start', (req, res) => {
  const { studentId } = req.body;
  
  db.run(`INSERT OR REPLACE INTO problem_solutions (studentId, problemId, status, stars) 
          VALUES (?, ?, 'solving', 0)`, 
         [studentId, req.params.problemId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// 문제 제출하기 (자동채점)
app.post('/api/problems/:problemId/submit', async (req, res) => {
  const { studentId, code } = req.body;
  const problemId = req.params.problemId;
  
  console.log('문제 제출 받음:', { problemId, studentId, codeLength: code?.length });
  
  // 1. 문제 정보 조회 (예상 출력)
  db.get('SELECT * FROM problems WHERE id = ?', [problemId], async (err, problem) => {
    if (err || !problem) {
      console.error('문제 조회 실패:', err);
      return res.status(500).json({ error: '문제를 찾을 수 없습니다.' });
    }
    
    // 2. 코드 실행하여 실제 출력 얻기
    let actualOutput = '';
    try {
      if (code.includes('#include') || code.match(/#includ|int main|printf\s*\(|return 0/)) {
        // C 언어 코드 실행
        actualOutput = await executeCCode(code);
      } else {
        // Python 코드 실행 (기존 로직 사용)
        actualOutput = executePythonCode(code);
      }
      
      // 특수 마커를 실제 문자로 변환하여 비교용으로 정규화
      let normalizedOutput = actualOutput
        .replace(/###NEWLINE###/g, '\n')
        .replace(/###TAB###/g, '\t')
        .replace(/###CARRIAGE###/g, '\r')
        .trim();
      
      // 3. 예상 출력과 비교하여 자동 채점 (단순 정답/오답)
      const expectedOutput = (problem.outputExample || '').trim();
      let stars = 0;
      
      if (normalizedOutput === expectedOutput) {
        stars = 1; // 정답: 1점 (별 1개)
      } else {
        stars = 0; // 오답 또는 실행 안됨: 0점
      }
      
      console.log('자동채점 결과:', { 
        problemId, 
        studentId, 
        expectedOutput: expectedOutput,
        actualOutput: normalizedOutput,
        stars 
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
        res.json({ success: true, stars, actualOutput, expectedOutput });
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
  
  db.all(`SELECT problemId, status, stars, code FROM problem_solutions WHERE studentId = ?`, 
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
  
  db.run(`INSERT INTO feedbacks (studentId, problemId, adminId, message) VALUES (?, ?, ?, ?)`,
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
  const query = `SELECT * FROM live_messages WHERE studentId = ? ORDER BY timestamp DESC LIMIT 10`;
  
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
  
  const query = `DELETE FROM live_messages WHERE id = ?`;
  
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
    const submitResponse = await axios.post('https://judge0-ce.p.rapidapi.com/submissions', {
      source_code: Buffer.from(code).toString('base64'),
      language_id: 50, // C (GCC 9.2.0)
      stdin: Buffer.from(input || '').toString('base64')
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });
    
    const token = submitResponse.data.token;
    
    // 결과 대기 (최대 10초)
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const resultResponse = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
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
      // 2순위: 내부 scanf 처리 시스템 사용  
      else if (code.includes('scanf')) {
        console.log('📥 scanf 포함된 C 코드, 내부 처리 시스템 사용');
        result = await executeCCodeWithInput(code, inputData);
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
              if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(expression)) {
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
    res.json({ success: true, output: result.output || '실행 완료' });
    
  } catch (error) {
    console.error('코드 실행 오류:', error);
    res.status(500).json({ error: '코드 실행 중 오류가 발생했습니다.' });
  }
});

// Socket.io 연결 처리
io.on('connection', (socket) => {
  console.log('사용자가 연결되었습니다:', socket.id);

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
    
    // problemId가 있으면 problem_solutions 테이블도 업데이트
    if (problemId) {
      db.run(`INSERT OR REPLACE INTO problem_solutions (studentId, problemId, status, stars, code, submittedAt) 
              VALUES (?, ?, 'solving', 0, ?, CURRENT_TIMESTAMP)`, 
             [studentId, problemId, code], (err) => {
        if (!err) {
          console.log('문제별 코드 저장 성공');
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

  socket.on('disconnect', () => {
    console.log('사용자가 연결을 해제했습니다:', socket.id);
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log('네트워크 접근이 가능합니다: http://192.168.68.55:${PORT}');
  console.log('요일별 반 관리 기능이 활성화되었습니다.');
});