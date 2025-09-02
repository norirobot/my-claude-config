import React, { useState, useEffect } from 'react';
import BlocklyEditor from './BlocklyEditor';

const CurriculumInterface = ({ user, userType }) => {
  const [units, setUnits] = useState([]);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [progress, setProgress] = useState({});
  const [lessons, setLessons] = useState([]);
  const [steps, setSteps] = useState([]);
  const [showAssessment, setShowAssessment] = useState(false);

  // 커리큘럼 데이터 로드
  useEffect(() => {
    loadUnits();
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadUnits = async () => {
    try {
      // API 호출로 단원 목록 가져오기
      const response = await fetch('/api/curriculum/units');
      const data = await response.json();
      setUnits(data);
      if (data.length > 0) {
        setCurrentUnit(data[0]);
        loadLessons(data[0].id);
      }
    } catch (error) {
      console.error('단원 로드 실패:', error);
    }
  };

  const loadLessons = async (unitId) => {
    try {
      const response = await fetch(`/api/curriculum/lessons/${unitId}`);
      const data = await response.json();
      setLessons(data);
      if (data.length > 0) {
        setCurrentLesson(data[0]);
        loadSteps(data[0].id);
      }
    } catch (error) {
      console.error('차시 로드 실패:', error);
    }
  };

  const loadSteps = async (lessonId) => {
    try {
      const response = await fetch(`/api/curriculum/steps/${lessonId}`);
      const data = await response.json();
      setSteps(data);
      if (data.length > 0) {
        setCurrentStep(data[0]);
      }
    } catch (error) {
      console.error('단계 로드 실패:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/curriculum/progress/${user.id}`);
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('진도 로드 실패:', error);
    }
  };

  const completeStep = async (stepId) => {
    try {
      await fetch('/api/curriculum/complete-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: user.id, 
          stepId: stepId,
          score: 100 
        })
      });
      
      setProgress(prev => ({
        ...prev,
        [stepId]: { completed: true, score: 100 }
      }));

      // 다음 단계로 이동
      const currentIndex = steps.findIndex(s => s.id === stepId);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      } else {
        // 차시 완료 - 평가 표시
        setShowAssessment(true);
      }
    } catch (error) {
      console.error('단계 완료 실패:', error);
    }
  };

  const getStepStatus = (stepId) => {
    if (!progress[stepId]) return 'locked';
    return progress[stepId].completed ? 'completed' : 'available';
  };

  const getProgressPercentage = (unitId) => {
    const unitLessons = lessons.filter(l => l.unit_id === unitId);
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => progress[s.id]?.completed).length;
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  if (showAssessment) {
    return <UnitAssessment 
      unit={currentUnit} 
      onComplete={() => setShowAssessment(false)}
      user={user}
    />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 사이드바 - 커리큘럼 네비게이션 */}
      <div style={{ 
        width: '300px', 
        backgroundColor: 'white', 
        borderRight: '1px solid #e2e8f0',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
          📚 코딩 커리큘럼
        </h2>

        {/* 단원 목록 */}
        {units.map(unit => (
          <div key={unit.id} style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => {
                setCurrentUnit(unit);
                loadLessons(unit.id);
              }}
              style={{
                padding: '12px',
                backgroundColor: currentUnit?.id === unit.id ? '#3b82f6' : '#f1f5f9',
                color: currentUnit?.id === unit.id ? 'white' : '#374151',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontWeight: '600' }}>{unit.title}</span>
              <span style={{ 
                fontSize: '12px',
                backgroundColor: currentUnit?.id === unit.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                padding: '2px 6px',
                borderRadius: '12px'
              }}>
                {getProgressPercentage(unit.id)}%
              </span>
            </div>

            {/* 현재 선택된 단원의 차시 목록 */}
            {currentUnit?.id === unit.id && lessons.map(lesson => (
              <div 
                key={lesson.id}
                onClick={() => {
                  setCurrentLesson(lesson);
                  loadSteps(lesson.id);
                }}
                style={{
                  padding: '8px 16px',
                  marginLeft: '12px',
                  backgroundColor: currentLesson?.id === lesson.id ? '#dbeafe' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '6px',
                  fontSize: '14px'
                }}
              >
                📖 {lesson.title}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 상단 헤더 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              {currentStep?.title || '단계를 선택하세요'}
            </h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
              {currentUnit?.title} > {currentLesson?.title}
            </p>
          </div>
          
          {currentStep && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* 단계 네비게이션 */}
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  onClick={() => setCurrentStep(step)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backgroundColor: 
                      getStepStatus(step.id) === 'completed' ? '#10b981' :
                      currentStep.id === step.id ? '#3b82f6' :
                      getStepStatus(step.id) === 'available' ? '#f59e0b' : '#d1d5db',
                    color: getStepStatus(step.id) === 'locked' ? '#6b7280' : 'white'
                  }}
                >
                  {getStepStatus(step.id) === 'completed' ? '✓' : index + 1}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 학습 콘텐츠 */}
        {currentStep ? (
          <div style={{ flex: 1, display: 'flex' }}>
            {/* 설명 패널 */}
            <div style={{
              width: '300px',
              backgroundColor: 'white',
              borderRight: '1px solid #e2e8f0',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                📋 설명
              </h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '20px' }}>
                {currentStep.description}
              </p>
              
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                🎯 목표
              </h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '20px' }}>
                {currentStep.instructions}
              </p>

              {currentStep.hint && (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                    💡 힌트
                  </h3>
                  <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#92400e'
                  }}>
                    {currentStep.hint}
                  </div>
                </>
              )}

              <button
                onClick={() => completeStep(currentStep.id)}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✅ 완료하기
              </button>
            </div>

            {/* 블록 코딩 에디터 */}
            <div style={{ flex: 1 }}>
              <BlocklyEditor 
                starterCode={currentStep.starter_code}
                onCodeChange={(code) => {
                  // 코드 변경 시 자동 저장
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}>
            <p>학습할 단계를 선택해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 단원 평가 컴포넌트
const UnitAssessment = ({ unit, onComplete, user }) => {
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadAssessment();
  }, [unit]);

  const loadAssessment = async () => {
    try {
      const response = await fetch(`/api/curriculum/assessment/${unit.id}`);
      const data = await response.json();
      setAssessment(data);
    } catch (error) {
      console.error('평가 로드 실패:', error);
    }
  };

  const submitAssessment = async () => {
    try {
      const response = await fetch('/api/curriculum/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          assessmentId: assessment.id,
          answers: answers
        })
      });
      
      const result = await response.json();
      setScore(result.score);
      setSubmitted(true);
    } catch (error) {
      console.error('평가 제출 실패:', error);
    }
  };

  if (!assessment) return <div>평가를 로드 중...</div>;

  const questions = JSON.parse(assessment.questions);

  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🏆 {assessment.title}
      </h1>

      {!submitted ? (
        <>
          {questions.map((q, index) => (
            <div key={index} style={{
              marginBottom: '30px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginBottom: '15px' }}>
                {index + 1}. {q.question}
              </h3>
              
              {q.type === 'multiple' && (
                <div>
                  {q.options.map((option, optIndex) => (
                    <label key={optIndex} style={{
                      display: 'block',
                      marginBottom: '10px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name={`question_${index}`}
                        value={optIndex}
                        onChange={(e) => setAnswers({
                          ...answers,
                          [index]: parseInt(e.target.value)
                        })}
                        style={{ marginRight: '8px' }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={submitAssessment}
              style={{
                padding: '15px 30px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📝 평가 제출
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: score >= assessment.passing_score ? '#10b981' : '#ef4444' }}>
            {score >= assessment.passing_score ? '🎉 합격!' : '😅 불합격'}
          </h2>
          <p style={{ fontSize: '18px', margin: '20px 0' }}>
            점수: {score}점 / 100점
          </p>
          <p style={{ marginBottom: '30px' }}>
            {score >= assessment.passing_score ? 
              '축하합니다! 다음 단원으로 진행할 수 있습니다.' :
              `합격 점수는 ${assessment.passing_score}점입니다. 다시 도전해보세요!`
            }
          </p>
          <button
            onClick={onComplete}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default CurriculumInterface;