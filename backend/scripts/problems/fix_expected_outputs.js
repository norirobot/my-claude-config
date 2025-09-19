const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 문제 출력 예시 수정');

// 문제별 올바른 출력 예시 수정
const fixes = [
  { id: 2, expectedOutput: '10 20', title: '변수 출력하기' },
  { id: 3, expectedOutput: '30', title: '줄바꿈 문자 사용하기' },
  { id: 7, expectedOutput: 'Hello\nRONCO World!', title: '줄바꿈 문자 사용하기' },
  { id: 8, expectedOutput: '30', title: '문자열 출력하기1' },
  { id: 9, expectedOutput: '10 20', title: '변수 출력하기' }
];

let completed = 0;
fixes.forEach(fix => {
  db.run(`UPDATE problems SET expectedOutput = ? WHERE id = ?`, [fix.expectedOutput, fix.id], function(err) {
    if (err) {
      console.error(`❌ ID ${fix.id} 수정 실패:`, err);
    } else {
      console.log(`✅ ID ${fix.id} "${fix.title}" 출력 예시 수정: "${fix.expectedOutput}"`);
    }
    
    completed++;
    if (completed === fixes.length) {
      // 수정 완료 후 확인
      db.all(`SELECT id, title, expectedOutput FROM problems WHERE isActive = 1 ORDER BY lesson, id`, [], (err, rows) => {
        if (err) {
          console.error('❌ 확인 실패:', err);
        } else {
          console.log('\n📚 수정 완료된 문제 목록:');
          rows.forEach((row, index) => {
            console.log(`   ${index + 1}번째: ID ${row.id} - "${row.title}" → "${row.expectedOutput}"`);
          });
        }
        db.close();
      });
    }
  });
});