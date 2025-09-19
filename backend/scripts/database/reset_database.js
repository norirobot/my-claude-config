const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🗑️  데이터베이스 초기화 시작...');

// 모든 데이터 삭제 (테이블 구조는 유지)
db.serialize(() => {
  // 학생 관련 데이터 삭제
  db.run('DELETE FROM problem_solutions', (err) => {
    if (err) console.error('problem_solutions 삭제 오류:', err);
    else console.log('✅ 학생 코드 데이터 삭제 완료');
  });

  db.run('DELETE FROM students', (err) => {
    if (err) console.error('students 삭제 오류:', err);
    else console.log('✅ 학생 데이터 삭제 완료');
  });

  // 문제 관련 데이터 삭제
  db.run('DELETE FROM problems', (err) => {
    if (err) console.error('problems 삭제 오류:', err);
    else console.log('✅ 문제 데이터 삭제 완료');
  });

  // 도움 요청 데이터 삭제
  db.run('DELETE FROM help_requests', (err) => {
    if (err) console.error('help_requests 삭제 오류:', err);
    else console.log('✅ 도움 요청 데이터 삭제 완료');
  });

  // 피드백 데이터 삭제
  db.run('DELETE FROM feedbacks', (err) => {
    if (err) console.error('feedbacks 삭제 오류:', err);
    else console.log('✅ 피드백 데이터 삭제 완료');
  });

  // 실시간 메시지 삭제
  db.run('DELETE FROM live_messages', (err) => {
    if (err) console.error('live_messages 삭제 오류:', err);
    else console.log('✅ 실시간 메시지 데이터 삭제 완료');
  });

  // AUTO_INCREMENT 카운터 초기화
  db.run('DELETE FROM sqlite_sequence', (err) => {
    if (err) console.error('sqlite_sequence 초기화 오류:', err);
    else console.log('✅ ID 카운터 초기화 완료');
  });

  console.log('\n🎉 데이터베이스 초기화 완료!');
  console.log('이제 깔끔한 상태에서 테스트를 시작할 수 있습니다.');

  db.close();
});
