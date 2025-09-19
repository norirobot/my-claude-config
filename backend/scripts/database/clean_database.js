const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 데이터베이스 정리 시작');

// 1. 비활성화된 문제들 삭제
db.run('DELETE FROM problems WHERE isActive = 0', [], function(err) {
  if (err) {
    console.error('❌ 비활성 문제 삭제 실패:', err);
  } else {
    console.log(`✅ 비활성 문제 ${this.changes}개 삭제 완료`);
  }

  // 2. 모든 학생의 코드와 제출 기록 삭제 (깨끗한 시작)
  db.run('DELETE FROM student_codes', [], function(err) {
    if (err) {
      console.error('❌ 학생 코드 삭제 실패:', err);
    } else {
      console.log(`✅ 학생 코드 ${this.changes}개 삭제 완료`);
    }

    db.run('DELETE FROM problem_solutions WHERE studentId = 22', [], function(err) {
      if (err) {
        console.error('❌ 제출 기록 삭제 실패:', err);
      } else {
        console.log(`✅ 최문석 제출 기록 ${this.changes}개 삭제 완료`);
      }

      // 3. 현재 활성 문제 목록 확인
      db.all('SELECT id, title, lesson, expectedOutput FROM problems WHERE isActive = 1 ORDER BY lesson, id', [], (err, rows) => {
        if (err) {
          console.error('❌ 문제 조회 실패:', err);
        } else {
          console.log('\n📚 정리 후 문제 목록:');
          rows.forEach((row, index) => {
            console.log(`   ${index + 1}번째: ID ${row.id} - "${row.title}" (예상출력: "${row.expectedOutput}")`);
          });
        }

        db.close();
      });
    });
  });
});
