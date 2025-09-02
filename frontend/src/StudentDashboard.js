import React, { useState, useEffect } from 'react';
import GameMap from './GameMap';
// import BlocklyEditor from './BlocklyEditor';
import AssessmentReport from './AssessmentReport';

const StudentDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('gameMap');
  const [progress, setProgress] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);

  useEffect(() => {
    fetchProgress();
    fetchAssessments();
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchProgress = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/student/progress', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('진도 조회 실패:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/student/assessments', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAssessments(data.assessments);
      }
    } catch (error) {
      console.error('평가 결과 조회 실패:', error);
    }
  };

  const saveProgress = async (levelId, chapterId, completed, stars, code, completionTime) => {
    try {
      const response = await fetch('http://localhost:3001/api/student/progress', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          levelId,
          chapterId,
          completed,
          stars,
          code,
          completionTime
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchProgress(); // 진도 새로고침
      }
    } catch (error) {
      console.error('진도 저장 실패:', error);
    }
  };

  const saveAssessmentResult = async (assessmentType, assessmentName, score, maxScore, details) => {
    try {
      const response = await fetch('http://localhost:3001/api/student/assessments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          assessmentType,
          assessmentName,
          score,
          maxScore,
          details
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchAssessments(); // 평가 결과 새로고침
      }
    } catch (error) {
      console.error('평가 결과 저장 실패:', error);
    }
  };

  const handleLevelComplete = (levelData, completed, stars, completionTime) => {
    saveProgress(
      levelData.id,
      levelData.chapterId,
      completed,
      stars,
      '', // 코드는 필요시 추가
      completionTime
    );
  };

  // handleAssessmentComplete 사용하지 않음

  const renderGameMap = () => (
    <GameMap
      progress={progress}
      onLevelComplete={handleLevelComplete}
      onLevelSelect={(level) => {
        setCurrentLevel(level);
        // 블록코딩 비활성화됨
      }}
    />
  );


  const renderAssessments = () => {
    const latestAssessment = assessments[0];
    
    return (
      <div style={{ padding: '20px' }}>
        <h3>평가 결과</h3>
        
        {latestAssessment ? (
          <AssessmentReport
            studentName={user.name}
            assessmentData={{
              name: latestAssessment.assessment_name,
              score: latestAssessment.score,
              maxScore: latestAssessment.max_score,
              details: latestAssessment.details,
              completedAt: latestAssessment.completed_at
            }}
          />
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px',
            color: '#666' 
          }}>
            <h4>아직 평가를 받지 않았습니다</h4>
            <p>게임 맵에서 레벨을 완성하고 평가를 받아보세요!</p>
            <button
              onClick={() => setActiveTab('gameMap')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              게임 맵으로 가기
            </button>
          </div>
        )}
        
        {/* 모든 평가 결과 리스트 */}
        {assessments.length > 1 && (
          <div style={{ marginTop: '30px' }}>
            <h4>이전 평가 결과</h4>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              {assessments.slice(1).map(assessment => (
                <div
                  key={assessment.id}
                  style={{
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{assessment.assessment_name}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {new Date(assessment.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {assessment.score}/{assessment.max_score}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {Math.round(assessment.score/assessment.max_score*100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProgress = () => (
    <div style={{ padding: '20px' }}>
      <h3>내 진도 현황</h3>
      
      {progress.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {progress.map(item => (
            <div
              key={`${item.chapter_id}-${item.level_id}`}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <h4>Chapter {item.chapter_id} - Level {item.level_id}</h4>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>상태:</span>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: item.completed ? '#4CAF50' : '#FF9800',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {item.completed ? '완료' : '진행중'}
                  </span>
                </div>
              </div>
              
              {item.stars > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <span>별점: </span>
                  {'⭐'.repeat(item.stars)}
                </div>
              )}
              
              <div style={{ color: '#666', fontSize: '14px' }}>
                시도 횟수: {item.attempts}회
              </div>
              
              {item.completed_at && (
                <div style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
                  완료일: {new Date(item.completed_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          color: '#666' 
        }}>
          <h4>아직 진도가 없습니다</h4>
          <p>게임 맵에서 레벨을 시작해보세요!</p>
          <button
            onClick={() => setActiveTab('gameMap')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            게임 맵으로 가기
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd'
      }}>
        <h1>코딩 멘토 - {user.name}님</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user.className && user.studentNumber && (
            <span style={{ color: '#666' }}>
              {user.className} {user.studentNumber}번
            </span>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{ borderBottom: '1px solid #ddd' }}>
        {[
          { key: 'gameMap', label: '게임 맵', icon: '🗺️' },
          { key: 'assessments', label: '평가 결과', icon: '📊' },
          { key: 'progress', label: '진도 현황', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '15px 25px',
              border: 'none',
              backgroundColor: activeTab === tab.key ? '#4CAF50' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#666',
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '3px solid #4CAF50' : 'none',
              fontSize: '16px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div>
        {activeTab === 'gameMap' && renderGameMap()}
        {activeTab === 'assessments' && renderAssessments()}
        {activeTab === 'progress' && renderProgress()}
      </div>
    </div>
  );
};

export default StudentDashboard;