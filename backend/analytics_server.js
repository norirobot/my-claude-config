const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(cors());
app.use(express.json());

console.log('📊 학습 분석 테스트 서버 시작 중...');

// 학생별 학습 활동 분석 데이터 조회
app.get('/api/analytics/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  console.log(`📊 학생 ${studentId}의 학습 분석 데이터 요청`);

  // 학습 활동 데이터 조회
  const query = `SELECT
    activity_type,
    problem_id,
    duration,
    data,
    timestamp,
    created_at
  FROM learning_analytics
  WHERE student_id = ?
  ORDER BY created_at DESC
  LIMIT 50`;

  db.all(query, [studentId], (err, activities) => {
    if (err) {
      console.error('❌ 학습 분석 조회 실패:', err.message);
      return res.status(500).json({ error: '학습 분석 데이터 조회 실패' });
    }

    // 활동 타입별 통계 계산
    const stats = {
      total_activities: activities.length,
      login_count: activities.filter(a => a.activity_type === 'login').length,
      problems_viewed: activities.filter(a => a.activity_type === 'problem_view').length,
      code_submissions: activities.filter(a => a.activity_type === 'code_submit').length,
      total_coding_time: activities
        .filter(a => a.duration)
        .reduce((sum, a) => sum + (a.duration || 0), 0)
    };

    console.log(`✅ 학생 ${studentId} 분석 완료: ${stats.total_activities}개 활동`);

    res.json({
      success: true,
      student_id: studentId,
      statistics: stats,
      recent_activities: activities.slice(0, 10),
      all_activities: activities
    });
  });
});

// 활동 추적 기록 API
app.post('/api/analytics/track', (req, res) => {
  const { student_id, activity_type, problem_id, duration, data } = req.body;

  console.log(`📝 활동 추적: 학생 ${student_id} - ${activity_type}`);

  const query = `INSERT INTO learning_analytics (student_id, activity_type, problem_id, duration, data) VALUES (?, ?, ?, ?, ?)`;

  db.run(query, [student_id, activity_type, problem_id || null, duration || null, JSON.stringify(data) || null], function(err) {
    if (err) {
      console.error('❌ 활동 추적 기록 실패:', err.message);
      return res.status(500).json({ error: '활동 추적 실패' });
    }

    console.log(`✅ 활동 기록됨: ID ${this.lastID}`);
    res.json({
      success: true,
      activity_id: this.lastID,
      message: '활동이 기록되었습니다'
    });
  });
});

// 간단한 분석 대시보드 테스트 페이지
app.get('/dashboard/:studentId', (req, res) => {
  const { studentId } = req.params;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>📊 학습 분석 대시보드 - 학생 ${studentId}</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
            .header { text-align: center; margin-bottom: 30px; color: #333; }
            .stat-card { background: linear-gradient(45deg, #e3f2fd, #bbdefb); padding: 20px; margin: 10px 0; border-radius: 10px; border-left: 5px solid #2196f3; box-shadow: 0 2px 10px rgba(33,150,243,0.1); }
            .stat-number { font-size: 2em; font-weight: bold; color: #1976d2; }
            .activity-item { background: #f8f9fa; padding: 15px; margin: 8px 0; border-radius: 8px; border-left: 3px solid #4caf50; transition: all 0.3s ease; }
            .activity-item:hover { background: #e8f5e8; transform: translateX(5px); }
            button { background: linear-gradient(45deg, #2196f3, #21cbf3); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; margin: 8px; font-weight: bold; transition: all 0.3s ease; }
            button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(33,150,243,0.4); }
            .json-data { background: #f5f5f5; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; max-height: 300px; overflow-y: auto; border: 1px solid #ddd; }
            .loading { text-align: center; color: #666; font-style: italic; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 학습 분석 대시보드</h1>
                <h2 style="color: #2196f3;">🎓 학생 ID: ${studentId}</h2>
            </div>

            <div id="stats" class="grid"></div>

            <div style="margin: 30px 0;">
                <h3>🧪 실시간 테스트 기능</h3>
                <button onclick="loadAnalytics()">📊 분석 데이터 새로고침</button>
                <button onclick="trackActivity()">📝 랜덤 활동 기록</button>
                <button onclick="addSampleData()">🎲 샘플 데이터 추가</button>
                <button onclick="clearDisplay()">🗑️ 화면 초기화</button>
            </div>

            <div id="activities"></div>
            <div id="raw-data"></div>
        </div>

        <script>
            let isLoading = false;

            async function loadAnalytics() {
                if (isLoading) return;
                isLoading = true;

                try {
                    document.getElementById('stats').innerHTML = '<div class="loading">📊 데이터 로딩 중...</div>';

                    const response = await fetch('/api/analytics/student/${studentId}');
                    const data = await response.json();

                    document.getElementById('stats').innerHTML =
                        '<div class="stat-card"><div>📈 총 활동</div><div class="stat-number">' + data.statistics.total_activities + '</div><div>회</div></div>' +
                        '<div class="stat-card"><div>🔐 로그인</div><div class="stat-number">' + data.statistics.login_count + '</div><div>회</div></div>' +
                        '<div class="stat-card"><div>👀 문제 조회</div><div class="stat-number">' + data.statistics.problems_viewed + '</div><div>회</div></div>' +
                        '<div class="stat-card"><div>💻 코드 제출</div><div class="stat-number">' + data.statistics.code_submissions + '</div><div>회</div></div>' +
                        '<div class="stat-card"><div>⏱️ 총 코딩 시간</div><div class="stat-number">' + Math.floor(data.statistics.total_coding_time / 60) + '</div><div>분</div></div>';

                    document.getElementById('activities').innerHTML =
                        '<h3>🕒 최근 활동 기록</h3>' +
                        (data.recent_activities.length > 0 ?
                            data.recent_activities.map(activity =>
                                '<div class="activity-item">' +
                                '<strong>📋 ' + activity.activity_type + '</strong> ' +
                                (activity.problem_id ? '<span style="color: #666;">(문제 ' + activity.problem_id + ')</span>' : '') +
                                '<div style="font-size: 0.9em; color: #888; margin-top: 5px;">🕐 ' + new Date(activity.timestamp).toLocaleString() + '</div>' +
                                '</div>'
                            ).join('')
                            : '<div class="activity-item">아직 활동 기록이 없습니다.</div>'
                        );

                    document.getElementById('raw-data').innerHTML =
                        '<h3>🔍 상세 데이터 (JSON)</h3>' +
                        '<div class="json-data">' + JSON.stringify(data, null, 2) + '</div>';

                } catch (error) {
                    alert('❌ 데이터 로드 실패: ' + error.message);
                } finally {
                    isLoading = false;
                }
            }

            async function trackActivity() {
                try {
                    const activities = ['code_write', 'problem_view', 'test_run', 'help_request', 'page_visit'];
                    const randomActivity = activities[Math.floor(Math.random() * activities.length)];

                    const response = await fetch('/api/analytics/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            student_id: ${studentId},
                            activity_type: randomActivity,
                            problem_id: Math.floor(Math.random() * 10) + 1,
                            duration: Math.floor(Math.random() * 300) + 30,
                            data: {
                                test: true,
                                timestamp: new Date(),
                                browser: navigator.userAgent.split(' ')[0],
                                screen_size: window.innerWidth + 'x' + window.innerHeight
                            }
                        })
                    });

                    const result = await response.json();
                    alert('✅ 새 활동 기록됨: ' + randomActivity + ' (ID: ' + result.activity_id + ')');
                    loadAnalytics(); // 자동 새로고침
                } catch (error) {
                    alert('❌ 활동 기록 실패: ' + error.message);
                }
            }

            async function addSampleData() {
                const sampleActivities = [
                    { type: 'login', duration: null },
                    { type: 'problem_view', duration: 45 },
                    { type: 'code_write', duration: 180 },
                    { type: 'code_submit', duration: 10 },
                    { type: 'help_request', duration: 300 }
                ];

                for (let activity of sampleActivities) {
                    try {
                        await fetch('/api/analytics/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                student_id: ${studentId},
                                activity_type: activity.type,
                                problem_id: Math.floor(Math.random() * 5) + 1,
                                duration: activity.duration,
                                data: { sample: true, batch: 'sample_data_' + Date.now() }
                            })
                        });
                        await new Promise(resolve => setTimeout(resolve, 100)); // 0.1초 대기
                    } catch (error) {
                        console.error('샘플 데이터 추가 실패:', error);
                    }
                }

                alert('🎲 5개의 샘플 활동이 추가되었습니다!');
                setTimeout(loadAnalytics, 500);
            }

            function clearDisplay() {
                if (confirm('화면을 초기화하시겠습니까?')) {
                    document.getElementById('stats').innerHTML = '';
                    document.getElementById('activities').innerHTML = '';
                    document.getElementById('raw-data').innerHTML = '';
                }
            }

            // 페이지 로드 시 자동으로 데이터 로드
            window.onload = function() {
                setTimeout(loadAnalytics, 500);
            };

            // 5초마다 자동 새로고침 (옵션)
            // setInterval(loadAnalytics, 5000);
        </script>
    </body>
    </html>
  `);
});

// 루트 페이지
app.get('/', (req, res) => {
  res.send(`
    <h1>📊 학습 분석 테스트 서버</h1>
    <p>🎯 <a href="/dashboard/18">학생 18번 대시보드 보기</a></p>
    <p>📊 <a href="/api/analytics/student/18">학생 18번 JSON 데이터</a></p>
  `);
});

const PORT = 3009; // 다른 포트 사용
app.listen(PORT, () => {
  console.log(`🚀 학습 분석 테스트 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📊 대시보드: http://localhost:${PORT}/dashboard/18`);
  console.log(`📡 API 테스트: http://localhost:${PORT}/api/analytics/student/18`);
});