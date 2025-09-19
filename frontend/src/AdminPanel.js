import React, { useState, useEffect } from 'react';

const AdminPanel = ({ user, studentScreens = {}, onRequestStudentScreen }) => {
  // 🐛 DEBUG: studentScreens prop 변경 감지
  console.log('🔍 [AdminPanel] studentScreens prop 업데이트:', studentScreens);
  console.log('🔍 [AdminPanel] studentScreens 키들:', Object.keys(studentScreens));
  
  const [students, setStudents] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 🐛 DEBUG: studentScreens 변경 감지 useEffect
  useEffect(() => {
    console.log('🔄 [AdminPanel] useEffect - studentScreens 변경됨:', studentScreens);
    console.log('🔄 [AdminPanel] useEffect - 키 개수:', Object.keys(studentScreens).length);
    // 강제 리렌더링 트리거
    setForceUpdate(prev => prev + 1);
  }, [studentScreens]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [studentAssessments, setStudentAssessments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('students');

  // 새 학생 추가 폼
  const [newStudent, setNewStudent] = useState({
    username: '',
    password: '',
    name: '',
    className: '',
    studentNumber: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchStatistics();
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/students', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('학생 목록 조회 실패:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/statistics', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('통계 조회 실패:', error);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    setLoading(true);
    try {
      const [progressResponse, assessmentsResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/admin/students/${studentId}/progress`, {
          headers: getAuthHeaders()
        }),
        fetch(`http://localhost:3001/api/admin/students/${studentId}/assessments`, {
          headers: getAuthHeaders()
        })
      ]);

      const progressData = await progressResponse.json();
      const assessmentsData = await assessmentsResponse.json();

      if (progressData.success) setStudentProgress(progressData.progress);
      if (assessmentsData.success) setStudentAssessments(assessmentsData.assessments);
    } catch (error) {
      console.error('학생 상세 정보 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    fetchStudentDetails(student.id);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newStudent)
      });

      const data = await response.json();
      if (data.success) {
        alert('학생이 추가되었습니다.');
        setNewStudent({
          username: '',
          password: '',
          name: '',
          className: '',
          studentNumber: ''
        });
        fetchStudents();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('학생 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('정말로 이 학생을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        alert('학생이 삭제되었습니다.');
        fetchStudents();
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent(null);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('학생 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleResetAllStudentStatus = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('모든 학생의 상태를 오프라인으로 초기화하시겠습니까?')) return;

    try {
      const response = await fetch('http://localhost:3001/api/admin/reset-student-status', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || '모든 학생 상태가 초기화되었습니다.');
        fetchStudents();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('학생 상태 초기화 중 오류가 발생했습니다.');
    }
  };

  const renderStudentsTab = () => (
    <div>
      <h3>학생 관리</h3>
      
      {/* 새 학생 추가 폼 */}
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4>새 학생 추가</h4>
        <form onSubmit={handleAddStudent} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input
            type="text"
            placeholder="사용자명"
            value={newStudent.username}
            onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
            style={{ flex: '1', minWidth: '150px', padding: '8px', border: '1px solid #ddd' }}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={newStudent.password}
            onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
            style={{ flex: '1', minWidth: '150px', padding: '8px', border: '1px solid #ddd' }}
            required
          />
          <input
            type="text"
            placeholder="이름"
            value={newStudent.name}
            onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
            style={{ flex: '1', minWidth: '150px', padding: '8px', border: '1px solid #ddd' }}
            required
          />
          <input
            type="text"
            placeholder="반"
            value={newStudent.className}
            onChange={(e) => setNewStudent({...newStudent, className: e.target.value})}
            style={{ flex: '1', minWidth: '100px', padding: '8px', border: '1px solid #ddd' }}
          />
          <input
            type="text"
            placeholder="번호"
            value={newStudent.studentNumber}
            onChange={(e) => setNewStudent({...newStudent, studentNumber: e.target.value})}
            style={{ flex: '1', minWidth: '100px', padding: '8px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            추가
          </button>
        </form>
      </div>

      {/* 학생 상태 관리 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleResetAllStudentStatus}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 모든 학생 상태 초기화
        </button>
      </div>

      {/* 학생 목록 */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: '1' }}>
          <h4>학생 목록</h4>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto', 
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            {students.map(student => (
              <div
                key={student.id}
                onClick={() => handleStudentClick(student)}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: selectedStudent?.id === student.id ? '#e3f2fd' : 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontWeight: 'bold' }}>{student.name}</div>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: student.status === 'online' ? '#10b981' : 
                                     student.status === 'stuck' ? '#ef4444' : '#6b7280'
                    }} />
                    {student.status === 'online' && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>🟢 온라인</span>}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {student.class_name && student.student_number ? 
                      `${student.class_name}반 ${student.student_number}번` : 
                      student.username
                    }
                  </div>
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    가입: {new Date(student.created_at).toLocaleDateString()}
                  </div>
                  {studentScreens && studentScreens[student.id] && (
                    <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>
                      📺 {(() => {
                        const screenData = studentScreens[student.id];
                        const problem = screenData.selectedProblem;
                        
                        // 🐛 DEBUG: 화면 표시 디버깅
                        console.log(`🖥️ [AdminPanel] 학생 ${student.id} 화면 표시:`, {
                          screenData,
                          problem,
                          problemType: typeof problem,
                          timestamp: screenData.timestamp
                        });
                        
                        // 다양한 형식의 selectedProblem 데이터 처리
                        if (problem) {
                          if (typeof problem === 'object' && problem.id && problem.title) {
                            // 정상적인 객체 형식
                            console.log(`🖥️ [AdminPanel] 학생 ${student.id} -> 객체 형식: ${problem.id}: ${problem.title}`);
                            return `문제 ${problem.id}: ${problem.title}`;
                          } else if (typeof problem === 'string') {
                            // 문자열 형식 (제목만)
                            console.log(`🖥️ [AdminPanel] 학생 ${student.id} -> 문자열 형식: ${problem}`);
                            return `문제: ${problem}`;
                          } else if (typeof problem === 'object' && problem.title) {
                            // 제목만 있는 객체
                            console.log(`🖥️ [AdminPanel] 학생 ${student.id} -> title만 객체: ${problem.title}`);
                            return `문제: ${problem.title}`;
                          } else {
                            // 기타 형식
                            console.log(`🖥️ [AdminPanel] 학생 ${student.id} -> 기타 형식:`, problem);
                            return `문제: ${problem}`;
                          }
                        } else {
                          console.log(`🖥️ [AdminPanel] 학생 ${student.id} -> 대시보드`);
                          return '대시보드';
                        }
                      })()}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRequestStudentScreen) {
                        onRequestStudentScreen(student.id);
                      } else {
                        alert('화면 보기 기능을 사용할 수 없습니다.');
                      }
                    }}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📺 학생화면 보기
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStudent(student.id);
                    }}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 선택된 학생 상세 정보 */}
        {selectedStudent && (
          <div style={{ flex: '1' }}>
            <h4>{selectedStudent.name} 상세 정보</h4>
            {loading ? (
              <div>로딩 중...</div>
            ) : (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h5>진도 현황</h5>
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '10px'
                  }}>
                    {studentProgress.length > 0 ? (
                      studentProgress.map(progress => (
                        <div key={`${progress.chapter_id}-${progress.level_id}`} style={{
                          padding: '8px',
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>Chapter {progress.chapter_id} - Level {progress.level_id}</span>
                          <span>
                            {progress.completed ? '✅' : '⏳'} 
                            {progress.stars > 0 && ` ⭐ ${progress.stars}`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div>진도 기록이 없습니다.</div>
                    )}
                  </div>
                </div>

                <div>
                  <h5>평가 결과</h5>
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '10px'
                  }}>
                    {studentAssessments.length > 0 ? (
                      studentAssessments.map(assessment => (
                        <div key={assessment.id} style={{
                          padding: '8px',
                          borderBottom: '1px solid #eee'
                        }}>
                          <div style={{ fontWeight: 'bold' }}>{assessment.assessment_name}</div>
                          <div>{assessment.score}/{assessment.max_score}점 
                            ({Math.round(assessment.score/assessment.max_score*100)}%)</div>
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            {new Date(assessment.completed_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>평가 기록이 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStatisticsTab = () => (
    <div>
      <h3>전체 통계</h3>
      {statistics && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <h2>{statistics.activeStudents}</h2>
            <div>활성 학생</div>
          </div>
          <div style={{
            backgroundColor: '#FF9800',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <h2>{statistics.totalStudents}</h2>
            <div>전체 학생</div>
          </div>
          <div style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <h2>{statistics.inactiveStudents}</h2>
            <div>비활성 학생</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>관리자 패널</h2>
        <div>환영합니다, {user.name}님!</div>
      </div>

      <div style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'students' ? '#4CAF50' : 'transparent',
            color: activeTab === 'students' ? 'white' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === 'students' ? '2px solid #4CAF50' : 'none'
          }}
        >
          학생 관리
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'statistics' ? '#4CAF50' : 'transparent',
            color: activeTab === 'statistics' ? 'white' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === 'statistics' ? '2px solid #4CAF50' : 'none'
          }}
        >
          통계
        </button>
      </div>

      {activeTab === 'students' && renderStudentsTab()}
      {activeTab === 'statistics' && renderStatisticsTab()}
    </div>
  );
};

export default AdminPanel;