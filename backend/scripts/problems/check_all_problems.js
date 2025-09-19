const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('📋 전체 문제 현황 확인');

db.all(`SELECT id, title, lesson, isActive, createdAt FROM problems ORDER BY lesson, id`, [], (err, rows) => {
  if (err) {
    console.error('❌ 문제 조회 실패:', err);
  } else {
    console.log('📚 데이터베이스의 모든 문제:');
    rows.forEach((row, index) => {
      console.log(`   ID ${row.id}: "${row.title}" (차시: ${row.lesson}, 활성: ${row.isActive ? '✅' : '❌'}, 생성일: ${row.createdAt})`);
    });
    
    console.log('\n🎯 활성화된 문제 순서:');
    const activeProblems = rows.filter(row => row.isActive);
    activeProblems.forEach((row, index) => {
      console.log(`   ${index + 1}번째: ID ${row.id} - "${row.title}"`);
    });
  }
  
  db.close();
});