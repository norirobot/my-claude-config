const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('7번 문제 상세 정보 확인 중...\n');

db.get("SELECT * FROM problems WHERE id = 7", (err, row) => {
  if (err) {
    console.error('오류:', err);
  } else if (row) {
    console.log('=== 7번 문제 상세 정보 ===');
    console.log('ID:', row.id);
    console.log('제목:', row.title);
    console.log('설명:', row.description);
    console.log('예상 출력:', row.outputExample);
    console.log('스타터 코드:');
    console.log(row.starterCode);
    console.log('\n솔루션 코드:');
    console.log(row.solution);
    console.log('\n힌트:', row.hints);
    console.log('언어:', row.language);
    console.log('난이도:', row.difficulty);
    console.log('카테고리:', row.category);
    console.log('차시:', row.lesson);
  } else {
    console.log('7번 문제를 찾을 수 없습니다.');
  }
  
  db.close();
});