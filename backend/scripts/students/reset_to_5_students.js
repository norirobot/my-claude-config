const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

console.log('🔄 학생 데이터 삭제 후 5명만 재생성...');

db.serialize(() => {
  // 모든 학생 데이터 삭제
  db.run('DELETE FROM users WHERE role = "student"', (err) => {
    if (err) console.log('학생 데이터 삭제:', err.message);
    else console.log('✅ 기존 학생 데이터 삭제 완료');
  });

  // 5명의 학생만 추가
  const students = [
    ['student1', '1234', '김학생'],
    ['student2', '1234', '이학생'],
    ['student3', '1234', '박학생'],
    ['student4', '1234', '서현준'],
    ['student5', '1234', '김철수']
  ];

  console.log('👥 5명의 학생 계정 생성 중...');
  students.forEach(([username, password, name], index) => {
    db.run('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username, password, name, 'student'],
      function(err) {
        if (err) {
          console.error(`${name} 계정 생성 실패:`, err.message);
        } else {
          console.log(`✅ ${name} (${username}) 계정 생성 완료`);
        }

        if (index === students.length - 1) {
          console.log('\n🎉 5명의 학생 계정 생성 완료!');
          console.log('📋 학생 계정 목록:');
          students.forEach(([username, password, name]) => {
            console.log(`${username} / ${password} (${name})`);
          });
          db.close();
        }
      });
  });
});
