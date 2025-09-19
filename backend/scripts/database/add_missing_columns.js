const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔧 누락된 컬럼 추가 중...\n');

db.serialize(() => {
  // updatedAt 컬럼이 있는지 확인
  db.all('PRAGMA table_info(problems)', (err, columns) => {
    if (err) {
      console.error('테이블 정보 조회 실패:', err.message);
      return;
    }

    const hasUpdatedAt = columns.some(col => col.name === 'updatedAt');

    if (!hasUpdatedAt) {
      console.log('📋 updatedAt 컬럼 추가 중...');
      db.run('ALTER TABLE problems ADD COLUMN updatedAt TEXT DEFAULT CURRENT_TIMESTAMP', (err) => {
        if (err) {
          console.error('updatedAt 컬럼 추가 실패:', err.message);
        } else {
          console.log('✅ updatedAt 컬럼 추가 완료');
        }

        // 추가 완료 후 테이블 구조 확인
        console.log('\n📋 현재 problems 테이블 구조:');
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
    } else {
      console.log('✅ updatedAt 컬럼이 이미 존재합니다');
      db.close();
    }
  });
});
