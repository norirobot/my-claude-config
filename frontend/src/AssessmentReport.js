import React, { useState } from 'react';

const AssessmentReport = ({ 
  assessmentData, 
  studentInfo, 
  onClose, 
  onPrint 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getGradeColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getGradeLetter = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getPerformanceMessage = (score, category) => {
    const messages = {
      순차: {
        excellent: "순차 구조를 완벽하게 이해하고 있습니다! 명령어들이 순서대로 실행되는 원리를 잘 알고 있어요.",
        good: "순차 구조를 잘 이해하고 있습니다. 조금 더 연습하면 완벽해질 거예요!",
        average: "순차 구조의 기본은 알고 있지만, 좀 더 연습이 필요해요.",
        poor: "순차 구조에 대한 이해가 부족합니다. 기본부터 다시 연습해보세요."
      },
      반복: {
        excellent: "반복문을 완벽하게 활용할 수 있습니다! for문과 while문의 차이도 잘 알고 있어요.",
        good: "반복문을 잘 사용할 수 있습니다. 복잡한 반복 구조도 도전해보세요!",
        average: "기본적인 반복문은 사용할 수 있지만, 좀 더 다양한 상황에서 연습해보세요.",
        poor: "반복문에 대한 이해가 부족합니다. 기본 개념부터 차근차근 학습하세요."
      },
      선택: {
        excellent: "조건문을 완벽하게 사용할 수 있습니다! 복잡한 조건도 잘 처리해요.",
        good: "조건문을 잘 이해하고 있습니다. 중첩된 조건문도 시도해보세요!",
        average: "기본적인 if-else는 사용할 수 있지만, 복잡한 조건문은 더 연습이 필요해요.",
        poor: "조건문에 대한 이해가 부족합니다. 참/거짓 판단 연습부터 시작하세요."
      },
      변수: {
        excellent: "변수를 완벽하게 활용할 수 있습니다! 변수의 개념과 사용법을 잘 알고 있어요.",
        good: "변수 사용을 잘하고 있습니다. 다양한 데이터 타입도 연습해보세요!",
        average: "기본적인 변수 사용은 할 수 있지만, 좀 더 다양한 상황에서 활용해보세요.",
        poor: "변수에 대한 이해가 부족합니다. 변수의 기본 개념부터 학습하세요."
      },
      입출력: {
        excellent: "입출력을 완벽하게 처리할 수 있습니다! scanf와 printf를 자유자재로 사용해요.",
        good: "입출력 처리를 잘하고 있습니다. 다양한 데이터 형식도 도전해보세요!",
        average: "기본적인 입출력은 할 수 있지만, 형식 지정자 사용을 더 연습해보세요.",
        poor: "입출력에 대한 이해가 부족합니다. 기본 입출력 방법부터 연습하세요."
      },
      리스트: {
        excellent: "배열을 완벽하게 활용할 수 있습니다! 다차원 배열도 도전해볼 수 있어요.",
        good: "배열 사용을 잘하고 있습니다. 배열을 활용한 알고리즘도 시도해보세요!",
        average: "기본적인 배열은 사용할 수 있지만, 배열 순회나 검색을 더 연습해보세요.",
        poor: "배열에 대한 이해가 부족합니다. 배열의 기본 개념부터 학습하세요."
      },
      함수: {
        excellent: "함수를 완벽하게 만들고 사용할 수 있습니다! 모듈화 프로그래밍의 달인이에요.",
        good: "함수 사용을 잘하고 있습니다. 재귀함수도 도전해보세요!",
        average: "기본적인 함수는 만들 수 있지만, 매개변수와 반환값 활용을 더 연습해보세요.",
        poor: "함수에 대한 이해가 부족합니다. 함수의 기본 개념부터 학습하세요."
      }
    };

    const categoryMessages = messages[category] || messages['순차'];
    
    if (score >= 90) return categoryMessages.excellent;
    if (score >= 80) return categoryMessages.good;
    if (score >= 60) return categoryMessages.average;
    return categoryMessages.poor;
  };

  const getRecommendations = (scores) => {
    const weakAreas = Object.entries(scores)
      .filter(([_, score]) => score < 70)
      .map(([category, _]) => category);
    
    const strongAreas = Object.entries(scores)
      .filter(([_, score]) => score >= 90)
      .map(([category, _]) => category);

    const recommendations = [];
    
    if (weakAreas.length > 0) {
      recommendations.push(`💡 추가 연습이 필요한 영역: ${weakAreas.join(', ')}`);
      recommendations.push(`📚 해당 영역의 기본 문제부터 다시 풀어보세요.`);
    }
    
    if (strongAreas.length > 0) {
      recommendations.push(`🌟 뛰어난 영역: ${strongAreas.join(', ')}`);
      recommendations.push(`🚀 이 영역의 고급 문제에도 도전해보세요!`);
    }
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    
    if (totalScore >= 85) {
      recommendations.push(`🎉 전체적으로 매우 우수한 성과입니다! C언어로 넘어갈 준비가 되었어요.`);
    } else if (totalScore >= 70) {
      recommendations.push(`👍 전반적으로 좋은 성과입니다! 조금만 더 연습하면 완벽해질 거예요.`);
    } else {
      recommendations.push(`💪 기초를 더 탄탄히 하고 천천히 발전해나가세요!`);
    }
    
    return recommendations;
  };

  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalScore = Object.values(assessmentData.scores).reduce((sum, score) => sum + score, 0) / Object.keys(assessmentData.scores).length;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90%',
        borderRadius: '12px',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
          
          <h1 style={{ margin: 0, fontSize: '32px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            📋 프로그래밍 평가 결과서
          </h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '18px', opacity: 0.9 }}>
            {assessmentData.title}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
            평가일: {currentDate}
          </p>
        </div>

        <div style={{ padding: '30px' }}>
          {/* 학생 정보 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #e9ecef'
          }}>
            <div>
              <h3 style={{ margin: 0, color: '#495057' }}>👤 학생 정보</h3>
              <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                {studentInfo.name} ({studentInfo.class || '일반반'})
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: getGradeColor(totalScore),
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}>
                {Math.round(totalScore)}점
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: getGradeColor(totalScore),
                marginTop: '5px'
              }}>
                {getGradeLetter(totalScore)} 등급
              </div>
            </div>
          </div>

          {/* 영역별 점수 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#495057', borderBottom: '2px solid #dee2e6', paddingBottom: '10px' }}>
              📊 영역별 성과
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '15px',
              marginTop: '20px'
            }}>
              {Object.entries(assessmentData.scores).map(([category, score]) => (
                <div key={category} style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  border: `3px solid ${getGradeColor(score)}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ margin: 0, color: '#495057' }}>{category}</h4>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: getGradeColor(score)
                    }}>
                      {score}점
                    </span>
                  </div>
                  
                  {/* 진행바 */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${score}%`,
                      height: '100%',
                      backgroundColor: getGradeColor(score),
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#6c757d',
                    lineHeight: '1.4'
                  }}>
                    {getPerformanceMessage(score, category)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 상세 피드백 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#495057', borderBottom: '2px solid #dee2e6', paddingBottom: '10px' }}>
              💬 맞춤 피드백
            </h3>
            <div style={{
              marginTop: '20px',
              padding: '25px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            }}>
              {getRecommendations(assessmentData.scores).map((recommendation, index) => (
                <p key={index} style={{
                  margin: '10px 0',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#495057'
                }}>
                  {recommendation}
                </p>
              ))}
            </div>
          </div>

          {/* 상세 정보 토글 */}
          <div style={{ marginBottom: '30px' }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              {showDetails ? '📈 상세 정보 숨기기' : '📈 상세 정보 보기'}
            </button>

            {showDetails && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <h4>📚 학습 이력</h4>
                <ul style={{ paddingLeft: '20px', color: '#495057' }}>
                  <li>총 학습 시간: {assessmentData.studyTime || '데이터 없음'}</li>
                  <li>완료한 레벨: {assessmentData.completedLevels || 0}개</li>
                  <li>평가 시도 횟수: {assessmentData.attempts || 1}번</li>
                  <li>이전 최고 점수: {assessmentData.previousBest || '첫 시도'}점</li>
                </ul>

                <h4>🎯 다음 목표</h4>
                <ul style={{ paddingLeft: '20px', color: '#495057' }}>
                  {totalScore >= 85 ? (
                    <>
                      <li>🎉 축하합니다! C언어 텍스트 코딩에 도전해보세요</li>
                      <li>고급 알고리즘 문제에 도전해보세요</li>
                    </>
                  ) : (
                    <>
                      <li>평균 85점 이상을 목표로 연습하세요</li>
                      <li>약한 영역의 기본 문제를 더 풀어보세요</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            borderTop: '2px solid #dee2e6',
            paddingTop: '25px'
          }}>
            <button
              onClick={onPrint}
              style={{
                padding: '15px 30px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🖨️ 인쇄하기
            </button>
            <button
              onClick={() => {
                // PDF 다운로드 기능
                window.print();
              }}
              style={{
                padding: '15px 30px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📄 PDF 저장
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '15px 30px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReport;