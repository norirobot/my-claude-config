const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔍 API 응답 테스트 중...\n');

// /api/problems 엔드포인트와 동일한 쿼리 실행
db.all('SELECT * FROM problems WHERE isActive = 1 ORDER BY lesson, id', (err, problems) => {
  if (err) {
    console.error('쿼리 오류:', err.message);
  } else {
    console.log('📋 API 응답 시뮬레이션 결과:');
    problems.forEach(problem => {
      console.log(`   문제 ${problem.id}: ${problem.title}`);
      console.log(`   입력예시: ${problem.inputExample || 'null'}`);
      console.log(`   출력예시: ${problem.outputExample || 'null'}`);
      console.log(`   힌트: ${problem.hints || 'null'}`);
      console.log('');
    });
    console.log(`✅ 총 ${problems.length}개 문제 조회됨`);
  }
  db.close();
});
