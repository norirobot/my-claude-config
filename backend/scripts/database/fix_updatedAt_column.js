const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 updatedAt 컬럼 문제 해결 중...\n');

db.serialize(() => {
  // 먼저 NULL 값으로 컬럼 추가
  console.log('📋 updatedAt 컬럼을 NULL 기본값으로 추가...');
  db.run('ALTER TABLE problems ADD COLUMN updatedAt TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('updatedAt 컬럼 추가 실패:', err.message);
    } else {
      console.log('✅ updatedAt 컬럼 추가 완료 (또는 이미 존재)');

      // 기존 레코드들에 현재 시간 설정
      console.log('📋 기존 레코드들에 updatedAt 값 설정...');
      db.run('UPDATE problems SET updatedAt = datetime(\'now\') WHERE updatedAt IS NULL', (err) => {
        if (err) {
          console.error('updatedAt 값 설정 실패:', err.message);
        } else {
          console.log('✅ 기존 레코드들의 updatedAt 값 설정 완료');
        }

        // 테이블 구조 확인
        console.log('\n📋 최종 problems 테이블 구조:');
        db.all('PRAGMA table_info(problems)', (err, columns) => {
          if (err) {
            console.error('테이블 정보 조회 실패:', err.message);
          } else {
            columns.forEach(col => {
              console.log(`   ${col.name}: ${col.type} (null: ${col.notnull === 0 ? 'YES' : 'NO'})`);
            });
          }
          db.close();
        });
      });
    }
  });
});
