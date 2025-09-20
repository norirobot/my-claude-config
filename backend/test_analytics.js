const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('🧪 테스트 데이터 생성 중...');

// 학생 18번의 학습 활동 데이터 생성
const testActivities = [
    { student_id: 18, activity_type: 'login', data: JSON.stringify({ip: '192.168.1.100'}) },
    { student_id: 18, activity_type: 'problem_view', problem_id: 1, data: JSON.stringify({problem_title: 'Hello World'}) },
    { student_id: 18, activity_type: 'code_write', problem_id: 1, duration: 120, data: JSON.stringify({lines_written: 5}) },
    { student_id: 18, activity_type: 'code_submit', problem_id: 1, data: JSON.stringify({success: true, score: 100}) },
    { student_id: 18, activity_type: 'problem_view', problem_id: 2, data: JSON.stringify({problem_title: '변수 출력하기'}) }
];

let completed = 0;
testActivities.forEach((activity, index) => {
    const query = `INSERT INTO learning_analytics (student_id, activity_type, problem_id, duration, data) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [activity.student_id, activity.activity_type, activity.problem_id || null, activity.duration || null, activity.data], function(err) {
        if (err) {
            console.error(`❌ 테스트 데이터 ${index + 1} 삽입 실패:`, err.message);
        } else {
            console.log(`✅ 테스트 활동 ${index + 1} 기록됨: ${activity.activity_type}`);
        }
        completed++;
        if (completed === testActivities.length) {
            // 데이터 확인
            db.all('SELECT * FROM learning_analytics WHERE student_id = 18 ORDER BY created_at DESC', (err, rows) => {
                if (err) {
                    console.error('조회 실패:', err.message);
                } else {
                    console.log('\n📊 학생 18번의 학습 활동 기록:');
                    rows.forEach((row, i) => {
                        console.log(`  ${i+1}. ${row.activity_type} (문제: ${row.problem_id || 'N/A'}, 시간: ${row.timestamp})`);
                    });
                }
                db.close();
            });
        }
    });
});