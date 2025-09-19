const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔍 문제 세부 정보 확인 중...\n');

db.all('SELECT * FROM problems ORDER BY lesson, id', (err, problems) => {
  if (err) {
    console.error('오류:', err.message);
  } else {
    problems.forEach((problem, index) => {
      console.log(`📋 문제 ${problem.id}: ${problem.title}`);
      console.log(`   차시: ${problem.lesson || '설정 안됨'}`);
      console.log(`   입력예시: ${problem.inputExample || '❌ 없음'}`);
      console.log(`   출력예시: ${problem.outputExample || '❌ 없음'}`);
      console.log(`   기대출력: ${problem.expectedOutput || '❌ 없음'}`);
      console.log(`   시작코드 포함: ${problem.starterCode ? '✅' : '❌'}`);
      if (problem.starterCode) {
        const hasPlaceholder = problem.starterCode.includes('// 여기에 코드를 입력하세요') ||
                              problem.starterCode.includes('// 여기에 코드를 작성하세요');
        console.log(`   플레이스홀더: ${hasPlaceholder ? '✅' : '❌'}`);
      }
      console.log('');
    });
    console.log(`\n✅ 총 ${problems.length}개의 문제 확인 완료`);
  }
  db.close();
});
