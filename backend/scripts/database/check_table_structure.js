const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔍 problems 테이블 구조 확인 중...\n');

db.all("PRAGMA table_info(problems)", (err, columns) => {
  if (err) {
    console.error('오류:', err.message);
  } else {
    console.log('📋 problems 테이블 구조:');
    columns.forEach(col => {
      console.log(`   ${col.name}: ${col.type} (null: ${col.notnull === 0 ? 'YES' : 'NO'})`);
    });
    
    console.log('\n🔍 실제 데이터에서 hints 컬럼 확인...');
    
    db.all("SELECT id, title, hints FROM problems LIMIT 3", (err, problems) => {
      if (err) {
        console.error('hints 컬럼 조회 오류:', err.message);
        console.log('\n❌ hints 컬럼이 존재하지 않습니다!');
      } else {
        console.log('\n✅ hints 컬럼 데이터:');
        problems.forEach(problem => {
          console.log(`   문제 ${problem.id}: ${problem.title} - hints: ${problem.hints || '없음'}`);
        });
      }
      db.close();
    });
  }
});