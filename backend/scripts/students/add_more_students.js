const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

// 추가 학생 계정 3명
const additionalStudents = [
  ['student7', '1234', '김민준'],
  ['student8', '1234', '이서연'],
  ['student9', '1234', '박도현']
];

console.log('👥 추가 학생 계정 3명 생성 중...');

db.serialize(() => {
  additionalStudents.forEach(([username, password, name], index) => {
    db.run('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username, password, name, 'student'],
      function(err) {
        if (err) {
          console.error(`${name} 계정 생성 실패:`, err.message);
        } else {
          console.log(`✅ ${name} (${username}) 계정 생성 완료`);
        }

        if (index === additionalStudents.length - 1) {
          console.log('\n🎉 총 9명의 학생 계정 생성 완료!');
          console.log('📋 전체 학생 계정:');
          console.log('student1 / 1234 (김철수)');
          console.log('student2 / 1234 (이영희)');
          console.log('student3 / 1234 (박민수)');
          console.log('student4 / 1234 (최지혜)');
          console.log('student5 / 1234 (정우진)');
          console.log('student6 / 1234 (서현준)');
          console.log('student7 / 1234 (김민준)');
          console.log('student8 / 1234 (이서연)');
          console.log('student9 / 1234 (박도현)');
          db.close();
        }
      });
  });
});
