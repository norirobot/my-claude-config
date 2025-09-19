const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 현재 문제 순서 확인');

// 학생용 문제 조회 (실제 API와 동일한 쿼리)
db.all('SELECT * FROM problems WHERE isActive = 1 ORDER BY lesson, id', [], (err, rows) => {
  if (err) {
    console.error('❌ 문제 조회 실패:', err);
  } else {
    console.log('📋 학생이 보는 문제 순서:');
    rows.forEach((row, index) => {
      console.log(`   ${index + 1}번째: ID ${row.id} - "${row.title}" (차시: ${row.lesson})`);
      console.log(`            시작코드: ${row.starterCode ? '✅ 있음' : '❌ 없음'}`);
      if (index === 0) {
        console.log('            ⭐ 이것이 학생이 처음 보는 "1번 문제"입니다');
        console.log(`            시작코드 내용: "${row.starterCode ? row.starterCode.substring(0, 50) + '...' : 'null'}"`);
      }
      console.log('');
    });
  }

  db.close();
});
