const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// 문제 추가 함수
function addProblem(problemData) {
  return new Promise((resolve, reject) => {
    const {
      title,
      description,
      lesson = 1,
      language = 'c',
      difficulty = 'easy',
      category = 'basic',
      inputExample = '',
      outputExample = '',
      starterCode = '',
      hints = '',
      expectedOutput = '',
      solution = '',
      isActive = 1
    } = problemData;

    db.run(`
      INSERT INTO problems (
        title, description, language, difficulty, category, lesson,
        expectedOutput, starterCode, solution, hints, createdAt, updatedAt,
        isActive, inputExample, outputExample
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?)
    `, [
      title, description, language, difficulty, category, lesson,
      expectedOutput, starterCode, solution, hints, isActive, inputExample, outputExample
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        console.log(`✅ 문제 추가 완료: "${title}" (ID: ${this.lastID})`);
        resolve(this.lastID);
      }
    });
  });
}

// 사용 예시 (주석 처리)
/*
addProblem({
  title: "Hello World 출력하기",
  description: "C언어의 printf 함수를 사용하여 'Hello World'를 출력하는 프로그램을 작성하세요.",
  lesson: 1,
  inputExample: "-",
  outputExample: "Hello World",
  starterCode: "#include <stdio.h>\n\nint main()\n{\n    \n    return 0;\n}",
  hints: "1. #include <stdio.h> 를 사용하세요\n2. printf 함수를 사용하세요\n3. 문자열은 따옴표로 감싸주세요",
  expectedOutput: "Hello World"
}).then(() => {
  db.close();
});
*/

module.exports = { addProblem };

console.log('📝 문제 추가 도구가 준비되었습니다.');
console.log('사용법: node add_problem.js 실행 후 문제 정보를 알려주세요.');
