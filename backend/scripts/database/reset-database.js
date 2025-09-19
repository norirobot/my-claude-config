const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 연결
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️ 데이터베이스 초기화를 시작합니다...');

db.serialize(() => {
  // 1. 학생 데이터 초기화 (관리자는 유지)
  db.run('DELETE FROM students', function(err) {
    if (err) {
      console.error('❌ 학생 데이터 삭제 오류:', err.message);
    } else {
      console.log(`✅ ${this.changes}명의 학생 데이터가 삭제되었습니다.`);
    }
  });

  // 2. 문제별 해결 상태 초기화
  db.run('DELETE FROM problem_solutions', function(err) {
    if (err) {
      console.error('❌ 문제 해결 상태 삭제 오류:', err.message);
    } else {
      console.log(`✅ ${this.changes}개의 문제 해결 기록이 삭제되었습니다.`);
    }
  });

  // 3. 문제 데이터 초기화 (기본 문제 제외하고 모든 문제 삭제)
  db.run('DELETE FROM problems', function(err) {
    if (err) {
      console.error('❌ 문제 데이터 삭제 오류:', err.message);
    } else {
      console.log(`✅ ${this.changes}개의 문제가 삭제되었습니다.`);
    }
  });

  // 4. 기존의 다른 테이블들도 확인하고 필요한 경우 초기화
  db.run('DELETE FROM student_problem_codes', function(err) {
    if (err && !err.message.includes('no such table')) {
      console.error('❌ 학생 코드 삭제 오류:', err.message);
    } else if (!err) {
      console.log(`✅ ${this.changes}개의 학생 코드가 삭제되었습니다.`);
    }
  });

  // 5. 도움 요청 기록 삭제 (있다면)
  db.run('DELETE FROM help_requests', function(err) {
    if (err && !err.message.includes('no such table')) {
      console.error('❌ 도움 요청 삭제 오류:', err.message);
    } else if (!err) {
      console.log(`✅ ${this.changes}개의 도움 요청이 삭제되었습니다.`);
    }
  });

  // 6. 실시간 메시지 기록 삭제 (있다면)
  db.run('DELETE FROM live_messages', function(err) {
    if (err && !err.message.includes('no such table')) {
      console.error('❌ 실시간 메시지 삭제 오류:', err.message);
    } else if (!err) {
      console.log(`✅ ${this.changes}개의 실시간 메시지가 삭제되었습니다.`);
    }
  });

  // AUTO_INCREMENT 재설정
  db.run('DELETE FROM sqlite_sequence WHERE name IN (\'students\', \'problems\', \'problem_solutions\')', function(err) {
    if (err) {
      console.error('❌ AUTO_INCREMENT 재설정 오류:', err.message);
    } else {
      console.log('✅ AUTO_INCREMENT가 재설정되었습니다.');
    }
  });

  console.log('\n🎉 데이터베이스 초기화가 완료되었습니다!');
  console.log('📊 현재 상태:');
  console.log('   - 모든 학생 데이터 삭제됨');
  console.log('   - 모든 문제 삭제됨');
  console.log('   - 모든 학습 기록 삭제됨');
  console.log('   - 관리자 계정은 유지됨 (admin/admin123)');
  console.log('\n다음 단계: 새로운 문제를 추가하세요!');
});

// 연결 종료
db.close((err) => {
  if (err) {
    console.error('데이터베이스 연결 종료 오류:', err.message);
  } else {
    console.log('데이터베이스 연결이 종료되었습니다.');
  }
});
