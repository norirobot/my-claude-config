import React, { useState, useEffect } from 'react';

// 자동 네트워크 감지 시스템 (App.js에서 가져옴)
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  console.log('🌐 현재 접속 호스트명:', hostname);

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  } else {
    // IP 주소로 접속한 경우, 같은 IP의 3001 포트 사용
    return `http://${hostname}:3001/api`;
  }
};

const API_BASE_URL = getApiBaseUrl();

const AnalyticsPanel = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 학생 목록 가져오기
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setStudents(data);
        console.log('📚 학생 목록 로드됨:', data.length + '명');
      }
    } catch (error) {
      console.error('❌ 학생 목록 로드 실패:', error);
    }
  };

  // 특정 학생의 분석 데이터 가져오기
  const fetchAnalyticsData = async (studentId) => {
    if (!studentId) return;

    setLoading(true);
    try {
      console.log(`📊 학생 ${studentId}의 분석 데이터 요청 중...`);
      const response = await fetch(`${API_BASE_URL}/analytics/student/${studentId}`);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data);
        console.log('✅ 분석 데이터 로드 성공:', data.statistics);
      } else {
        console.error('❌ 분석 데이터 로드 실패:', data.error);
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('❌ 분석 API 호출 실패:', error);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  // 학생 선택 처리
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchAnalyticsData(student.id);
  };

  // 통계 카드 컴포넌트
  const StatCard = ({ title, value, unit, icon, color = '#4CAF50' }) => (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderLeft: `5px solid ${color}`,
      minWidth: '200px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color, marginBottom: '5px' }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>{title}</div>
      {unit && <div style={{ fontSize: '12px', color: '#999' }}>{unit}</div>}
    </div>
  );

  // 활동 목록 컴포넌트
  const ActivityList = ({ activities }) => (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ color: '#333', marginBottom: '15px' }}>🕒 최근 활동 기록</h3>
      {activities && activities.length > 0 ? (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {activities.map((activity, index) => (
            <div key={index} style={{
              background: '#f8f9fa',
              padding: '15px',
              margin: '8px 0',
              borderRadius: '8px',
              borderLeft: '3px solid #4CAF50',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#333' }}>
                    {activity.activity_type === 'login' ? '🔐 로그인' :
                     activity.activity_type === 'problem_view' ? '👀 문제 조회' :
                     activity.activity_type === 'code_write' ? '💻 코드 작성' :
                     activity.activity_type === 'code_submit' ? '📤 코드 제출' :
                     activity.activity_type === 'help_request' ? '🆘 도움 요청' :
                     `📋 ${activity.activity_type}`}
                  </strong>
                  {activity.problem_id && (
                    <span style={{ color: '#666', marginLeft: '10px' }}>
                      (문제 {activity.problem_id})
                    </span>
                  )}
                  {activity.duration && (
                    <span style={{ color: '#4CAF50', marginLeft: '10px' }}>
                      ⏱️ {Math.floor(activity.duration / 60)}분 {activity.duration % 60}초
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          아직 활동 기록이 없습니다.
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        📊 학습 분석 대시보드
      </h2>

      {/* 학생 선택 드롭다운 */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
          🎓 학생 선택:
        </label>
        <select
          value={selectedStudent?.id || ''}
          onChange={(e) => {
            const student = students.find(s => s.id === parseInt(e.target.value));
            handleStudentSelect(student);
          }}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px',
            minWidth: '200px',
            backgroundColor: 'white'
          }}
        >
          <option value="">학생을 선택하세요</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.name} (ID: {student.id})
            </option>
          ))}
        </select>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>📊 분석 데이터 로딩 중...</div>
        </div>
      )}

      {/* 분석 결과 표시 */}
      {selectedStudent && analyticsData && !loading && (
        <div>
          {/* 학생 정보 */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>
              🎓 {selectedStudent.name} 님의 학습 분석
            </h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              학생 ID: {selectedStudent.id} | 총 활동: {analyticsData.statistics.total_activities}개
            </p>
          </div>

          {/* 통계 카드들 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <StatCard
              title="총 활동 수"
              value={analyticsData.statistics.total_activities}
              unit="회"
              icon="📈"
              color="#2196F3"
            />
            <StatCard
              title="로그인 횟수"
              value={analyticsData.statistics.login_count}
              unit="회"
              icon="🔐"
              color="#4CAF50"
            />
            <StatCard
              title="문제 조회"
              value={analyticsData.statistics.problems_viewed}
              unit="회"
              icon="👀"
              color="#FF9800"
            />
            <StatCard
              title="코드 제출"
              value={analyticsData.statistics.code_submissions}
              unit="회"
              icon="💻"
              color="#9C27B0"
            />
            <StatCard
              title="총 코딩 시간"
              value={Math.floor(analyticsData.statistics.total_coding_time / 60)}
              unit="분"
              icon="⏱️"
              color="#F44336"
            />
          </div>

          {/* 최근 활동 목록 */}
          <ActivityList activities={analyticsData.recent_activities} />

          {/* 새로고침 버튼 */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={() => fetchAnalyticsData(selectedStudent.id)}
              style={{
                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 5px 15px rgba(33,150,243,0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🔄 데이터 새로고침
            </button>
          </div>
        </div>
      )}

      {/* 학생 미선택 상태 */}
      {!selectedStudent && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f8f9fa',
          borderRadius: '10px',
          border: '2px dashed #ddd'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>학습 분석을 시작하세요</h3>
          <p style={{ color: '#999' }}>위에서 학생을 선택하면 상세한 학습 분석 결과를 확인할 수 있습니다.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;