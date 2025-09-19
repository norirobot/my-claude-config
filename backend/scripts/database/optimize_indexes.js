const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 최적화 스크립트
console.log('🚀 데이터베이스 인덱스 최적화 시작...');

const db = new sqlite3.Database(path.join(__dirname, '../../database.db'));

const optimizationQueries = [
  // 학생 관련 최적화
  'CREATE INDEX IF NOT EXISTS idx_students_studentId ON students(studentId);',
  'CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);',
  'CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);',

  // 문제 관련 최적화
  'CREATE INDEX IF NOT EXISTS idx_problems_lesson ON problems(lesson);',
  'CREATE INDEX IF NOT EXISTS idx_problems_isActive ON problems(isActive);',
  'CREATE INDEX IF NOT EXISTS idx_problems_lesson_active ON problems(lesson, isActive);',
  'CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);',

  // 피드백 관련 최적화
  'CREATE INDEX IF NOT EXISTS idx_feedbacks_studentId ON feedbacks(studentId);',
  'CREATE INDEX IF NOT EXISTS idx_feedbacks_problemId ON feedbacks(problemId);',
  'CREATE INDEX IF NOT EXISTS idx_feedbacks_createdAt ON feedbacks(createdAt);',

  // 도움 요청 관련 최적화
  'CREATE INDEX IF NOT EXISTS idx_help_requests_studentId ON help_requests(studentId);',
  'CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests(status);',
  'CREATE INDEX IF NOT EXISTS idx_help_requests_createdAt ON help_requests(createdAt);',

  // 실시간 메시지 관련 최적화
  'CREATE INDEX IF NOT EXISTS idx_live_messages_studentId ON live_messages(studentId);',
  'CREATE INDEX IF NOT EXISTS idx_live_messages_timestamp ON live_messages(timestamp);',
  'CREATE INDEX IF NOT EXISTS idx_live_messages_isRead ON live_messages(isRead);',

  // 문제 솔루션 관련 최적화
  'CREATE INDEX IF NOT EXISTS idx_problem_solutions_studentId ON problem_solutions(studentId);',
  'CREATE INDEX IF NOT EXISTS idx_problem_solutions_problemId ON problem_solutions(problemId);',
  'CREATE INDEX IF NOT EXISTS idx_problem_solutions_student_problem ON problem_solutions(studentId, problemId);',
  'CREATE INDEX IF NOT EXISTS idx_problem_solutions_submittedAt ON problem_solutions(submittedAt);',

  // 사용자 관련 최적화 (혹시 사용될 경우를 대비)
  'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
  'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);'
];

let completedQueries = 0;
const totalQueries = optimizationQueries.length;

db.serialize(() => {
  console.log(`📊 총 ${totalQueries}개의 인덱스 생성 중...`);

  optimizationQueries.forEach((query, index) => {
    db.run(query, (err) => {
      if (err) {
        console.error(`❌ 인덱스 ${index + 1} 생성 실패:`, err.message);
      } else {
        completedQueries++;
        const indexName = query.match(/idx_\w+/)?.[0] || '알 수 없음';
        console.log(`✅ ${completedQueries}/${totalQueries}: ${indexName} 생성 완료`);
      }

      if (completedQueries === totalQueries) {
        console.log('\n🔧 데이터베이스 분석 실행 중...');

        // ANALYZE 명령으로 통계 정보 업데이트
        db.run('ANALYZE;', (err) => {
          if (err) {
            console.error('❌ ANALYZE 실행 실패:', err.message);
          } else {
            console.log('✅ 데이터베이스 통계 정보 업데이트 완료');
          }

          // VACUUM으로 데이터베이스 최적화
          console.log('🗜️  데이터베이스 압축 중...');
          db.run('VACUUM;', (err) => {
            if (err) {
              console.error('❌ VACUUM 실행 실패:', err.message);
            } else {
              console.log('✅ 데이터베이스 압축 완료');
            }

            // 최종 인덱스 목록 확인
            db.all("SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%' ORDER BY name;", (err, rows) => {
              if (err) {
                console.error('❌ 인덱스 목록 조회 실패:', err.message);
              } else {
                console.log('\n📋 생성된 최적화 인덱스 목록:');
                rows.forEach((row, index) => {
                  console.log(`   ${index + 1}. ${row.name}`);
                });
                console.log(`\n🎉 데이터베이스 최적화 완료! 총 ${rows.length}개의 인덱스가 생성되었습니다.`);
              }

              db.close();
            });
          });
        });
      }
    });
  });
});

// 에러 핸들링
db.on('error', (err) => {
  console.error('💥 데이터베이스 연결 오류:', err.message);
  process.exit(1);
});

console.log('⏱️  최적화 진행 중... 완료까지 잠시 기다려주세요.');
