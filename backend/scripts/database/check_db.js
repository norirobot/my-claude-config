const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('=== 학생 데이터 확인 ===');
db.all('SELECT * FROM students', (err, rows) => {
  if (err) {
    console.error('학생 데이터 조회 오류:', err);
  } else {
    console.log('학생 수:', rows.length);
    rows.forEach(student => {
      console.log(`ID: ${student.id}, 이름: ${student.name}, 학번: ${student.studentId}, 반: ${student.class}`);
    });
  }

  console.log('\n=== 문제 해결 상태 확인 ===');
  db.all('SELECT * FROM problem_solutions LIMIT 10', (err, rows) => {
    if (err) {
      console.error('문제 해결 상태 조회 오류:', err);
    } else {
      console.log('저장된 코드 수:', rows.length);
      rows.forEach(solution => {
        console.log(`학생ID: ${solution.studentId}, 문제ID: ${solution.problemId}, 상태: ${solution.status}, 코드 길이: ${solution.code ? solution.code.length : 0}자`);
      });
    }

    console.log('\n=== 김학생(S001) 코드 확인 ===');
    db.all('SELECT ps.*, s.name FROM problem_solutions ps JOIN students s ON ps.studentId = s.id WHERE s.studentId = "S001"', (err, rows) => {
      if (err) {
        console.error('김학생 코드 조회 오류:', err);
      } else {
        console.log('김학생 코드 수:', rows.length);
        rows.forEach(solution => {
          console.log(`문제ID: ${solution.problemId}, 상태: ${solution.status}, 코드: ${solution.code ? solution.code.substring(0, 50) + '...' : '없음'}`);
        });
      }

      db.close();
    });
  });
});
