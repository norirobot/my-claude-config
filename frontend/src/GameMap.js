import React, { useState, useEffect } from 'react';
// import BlocklyEditor from './BlocklyEditor';
import AssessmentReport from './AssessmentReport';

const GameMap = ({ user, userType }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);

  // 게임 맵 데이터 구조
  const gameChapters = [
    {
      id: 1,
      title: "프로그래밍 기초 여행",
      description: "순차, 반복, 선택의 기본을 배워보세요",
      color: "#4CAF50",
      levels: [
        { 
          id: 1, 
          title: "첫 만남", 
          description: "Hello World 출력하기",
          category: "순차",
          difficulty: "⭐",
          blocks: ["c_printf", "text"],
          targetCode: 'printf("Hello World\\n");'
        },
        { 
          id: 2, 
          title: "인사하기", 
          description: "이름을 포함한 인사말 만들기",
          category: "순차", 
          difficulty: "⭐",
          blocks: ["c_printf", "text"],
          targetCode: 'printf("안녕하세요, 홍길동입니다.\\n");'
        },
        { 
          id: 3, 
          title: "반복의 힘", 
          description: "같은 말을 3번 반복하기",
          category: "반복",
          difficulty: "⭐⭐",
          blocks: ["c_for", "c_printf", "text", "math_number"],
          targetCode: 'for(int i=0; i<3; i++) { printf("안녕!\\n"); }'
        },
        { 
          id: 4, 
          title: "선택의 순간", 
          description: "나이에 따라 다른 인사말",
          category: "선택",
          difficulty: "⭐⭐",
          blocks: ["c_if", "c_printf", "text", "math_number", "logic_compare"],
          targetCode: 'if(age >= 18) { printf("성인입니다"); } else { printf("미성년입니다"); }'
        },
        { 
          id: 5, 
          title: "별의 여왕", 
          description: "별 삼각형 그리기",
          category: "반복",
          difficulty: "⭐⭐⭐",
          blocks: ["c_for", "c_printf", "text", "math_number", "c_if"],
          boss: true
        }
      ]
    },
    {
      id: 2,
      title: "변수와 데이터의 세계",
      description: "변수를 활용한 계산과 입출력을 배워보세요",
      color: "#2196F3",
      levels: [
        { 
          id: 6, 
          title: "변수의 탄생", 
          description: "첫 번째 변수 만들기",
          category: "변수",
          difficulty: "⭐",
          blocks: ["c_variable_declare", "math_number"]
        },
        { 
          id: 7, 
          title: "계산기", 
          description: "두 수를 더하는 프로그램",
          category: "변수",
          difficulty: "⭐⭐",
          blocks: ["c_variable_declare", "math_arithmetic", "c_printf", "math_number"]
        },
        { 
          id: 8, 
          title: "사용자와의 대화", 
          description: "입력받고 출력하기",
          category: "입출력",
          difficulty: "⭐⭐",
          blocks: ["c_scanf", "c_printf", "c_variable_declare"]
        },
        { 
          id: 9, 
          title: "성적 판별기", 
          description: "점수에 따른 등급 출력",
          category: "선택",
          difficulty: "⭐⭐⭐",
          blocks: ["c_scanf", "c_if_else", "c_printf", "c_variable_declare", "logic_compare"]
        },
        { 
          id: 10, 
          title: "계산의 달인", 
          description: "복잡한 수식 계산하기",
          category: "변수",
          difficulty: "⭐⭐⭐",
          boss: true
        }
      ]
    },
    {
      id: 3,
      title: "고급 프로그래밍 모험",
      description: "배열과 함수로 복잡한 문제를 해결해보세요",
      color: "#FF5722",
      levels: [
        { 
          id: 11, 
          title: "배열의 시작", 
          description: "첫 번째 배열 만들기",
          category: "리스트",
          difficulty: "⭐⭐",
          blocks: ["c_array_declare", "c_array_set", "math_number"]
        },
        { 
          id: 12, 
          title: "숫자들의 합", 
          description: "배열 원소들의 총합 구하기",
          category: "리스트",
          difficulty: "⭐⭐⭐",
          blocks: ["c_array_declare", "c_array_get", "c_for", "math_arithmetic"]
        },
        { 
          id: 13, 
          title: "함수의 마법", 
          description: "첫 번째 함수 만들기",
          category: "함수",
          difficulty: "⭐⭐",
          blocks: ["c_function", "c_function_call", "c_printf"]
        },
        { 
          id: 14, 
          title: "최종 보스", 
          description: "모든 지식을 종합한 프로그램",
          category: "종합",
          difficulty: "⭐⭐⭐⭐",
          boss: true,
          finalBoss: true
        }
      ]
    }
  ];

  useEffect(() => {
    loadUserProgress();
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;
    
    // API 호출하여 사용자 진도 로드
    try {
      const response = await fetch(`/api/game/progress/${user.id}`);
      const progress = await response.json();
      setUserProgress(progress);
    } catch (error) {
      console.error('진도 로드 실패:', error);
    }
  };

  const isLevelUnlocked = (level, chapterIndex, levelIndex) => {
    // 첫 번째 레벨은 항상 열려있음
    if (chapterIndex === 0 && levelIndex === 0) return true;
    
    // 이전 레벨이 완료되었는지 확인
    const prevChapter = chapterIndex;
    const prevLevel = levelIndex - 1;
    
    if (prevLevel < 0) {
      // 이전 챕터의 마지막 레벨 확인
      if (chapterIndex === 0) return false;
      const lastLevelOfPrevChapter = gameChapters[chapterIndex - 1].levels.length - 1;
      return userProgress[`${chapterIndex - 1}_${lastLevelOfPrevChapter}`]?.completed;
    }
    
    return userProgress[`${prevChapter}_${prevLevel}`]?.completed;
  };

  const getLevelStatus = (level, chapterIndex, levelIndex) => {
    const progressKey = `${chapterIndex}_${levelIndex}`;
    const progress = userProgress[progressKey];
    
    if (!isLevelUnlocked(level, chapterIndex, levelIndex)) {
      return 'locked';
    }
    
    if (progress?.completed) {
      return 'completed';
    }
    
    if (progress?.attempts > 0) {
      return 'attempted';
    }
    
    return 'available';
  };

  const getStarCount = (level, chapterIndex, levelIndex) => {
    const progressKey = `${chapterIndex}_${levelIndex}`;
    return userProgress[progressKey]?.stars || 0;
  };

  const completeLevel = async (level, chapterIndex, levelIndex, stars = 3) => {
    const progressKey = `${chapterIndex}_${levelIndex}`;
    
    try {
      await fetch('/api/game/complete-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          levelId: level.id,
          chapterIndex,
          levelIndex,
          stars
        })
      });
      
      setUserProgress(prev => ({
        ...prev,
        [progressKey]: {
          completed: true,
          stars: Math.max(prev[progressKey]?.stars || 0, stars),
          attempts: (prev[progressKey]?.attempts || 0) + 1
        }
      }));

      // 보스 레벨이나 평가 레벨 완료 시 성적표 표시
      if (level.boss || level.assessment) {
        showAssessmentReport(level, chapterIndex, stars);
      }
    } catch (error) {
      console.error('레벨 완료 실패:', error);
    }
  };

  const showAssessmentReport = (level, chapterIndex, stars) => {
    // 현재 챕터까지의 모든 성과를 계산
    const chapterProgress = calculateChapterProgress(chapterIndex);
    
    const assessmentData = {
      title: `${gameChapters[chapterIndex].title} 완료`,
      scores: chapterProgress.scores,
      studyTime: chapterProgress.studyTime,
      completedLevels: chapterProgress.completedLevels,
      attempts: level.attempts || 1,
      previousBest: chapterProgress.previousBest
    };

    setReportData(assessmentData);
    setShowReport(true);
  };

  const calculateChapterProgress = (chapterIndex) => {
    const chapter = gameChapters[chapterIndex];
    const scores = {};
    let totalLevels = 0;
    let completedLevels = 0;
    
    // 각 카테고리별 점수 계산
    const categoryScores = {};
    const categoryCounts = {};
    
    chapter.levels.forEach((level, levelIndex) => {
      const progressKey = `${chapterIndex}_${levelIndex}`;
      const progress = userProgress[progressKey];
      
      totalLevels++;
      if (progress?.completed) {
        completedLevels++;
        const score = (progress.stars / 3) * 100; // 별점을 100점 만점으로 변환
        
        if (!categoryScores[level.category]) {
          categoryScores[level.category] = 0;
          categoryCounts[level.category] = 0;
        }
        
        categoryScores[level.category] += score;
        categoryCounts[level.category]++;
      }
    });
    
    // 카테고리별 평균 점수 계산
    Object.keys(categoryScores).forEach(category => {
      scores[category] = Math.round(categoryScores[category] / categoryCounts[category]);
    });
    
    return {
      scores,
      studyTime: `${Math.round(completedLevels * 15)}분`, // 레벨당 평균 15분 추정
      completedLevels,
      previousBest: localStorage.getItem(`chapter_${chapterIndex}_best`) || 0
    };
  };

  const openLevel = (level, chapterIndex, levelIndex) => {
    if (!isLevelUnlocked(level, chapterIndex, levelIndex)) {
      alert('이전 레벨을 먼저 완료해주세요!');
      return;
    }
    
    setSelectedLevel({ ...level, chapterIndex, levelIndex });
    setShowEditor(true);
  };

  if (showReport && reportData) {
    return (
      <AssessmentReport
        assessmentData={reportData}
        studentInfo={{
          name: user?.name || '학생',
          class: user?.class || '일반반'
        }}
        onClose={() => {
          setShowReport(false);
          setReportData(null);
          setShowEditor(false);
        }}
        onPrint={() => {
          window.print();
        }}
      />
    );
  }

  if (showEditor && selectedLevel) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* 레벨 헤더 */}
        <div style={{ 
          padding: '16px', 
          backgroundColor: gameChapters[selectedLevel.chapterIndex].color,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0 }}>
              {selectedLevel.difficulty} {selectedLevel.title}
            </h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
              {selectedLevel.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => completeLevel(selectedLevel, selectedLevel.chapterIndex, selectedLevel.levelIndex, 3)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✅ 완료
            </button>
            <button
              onClick={() => setShowEditor(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🏠 맵으로
            </button>
          </div>
        </div>

        {/* 블록 에디터 */}
        <div style={{ flex: 1 }}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>블록 에디터가 비활성화되었습니다</h3>
            <p>게임맵 기능을 사용하려면 블록 에디터가 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* 게임 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
        <h1 style={{ fontSize: '48px', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          🚀 코딩 모험의 세계
        </h1>
        <p style={{ fontSize: '18px', margin: '8px 0', opacity: 0.9 }}>
          블록으로 프로그래밍을 배우며 모험을 떠나보세요!
        </p>
      </div>

      {/* 챕터 선택 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '40px',
        flexWrap: 'wrap'
      }}>
        {gameChapters.map((chapter, index) => (
          <button
            key={chapter.id}
            onClick={() => setCurrentChapter(chapter.id)}
            style={{
              padding: '12px 24px',
              backgroundColor: currentChapter === chapter.id ? chapter.color : 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              transform: currentChapter === chapter.id ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            Chapter {chapter.id}: {chapter.title}
          </button>
        ))}
      </div>

      {/* 레벨 맵 */}
      {gameChapters.map(chapter => {
        if (chapter.id !== currentChapter) return null;
        
        return (
          <div key={chapter.id} style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ 
              textAlign: 'center', 
              color: 'white', 
              marginBottom: '30px',
              fontSize: '32px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              {chapter.title}
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px' 
            }}>
              {chapter.levels.map((level, levelIndex) => {
                const status = getLevelStatus(level, chapter.id - 1, levelIndex);
                const stars = getStarCount(level, chapter.id - 1, levelIndex);
                const unlocked = isLevelUnlocked(level, chapter.id - 1, levelIndex);
                
                return (
                  <div
                    key={level.id}
                    onClick={() => openLevel(level, chapter.id - 1, levelIndex)}
                    style={{
                      padding: '20px',
                      borderRadius: '15px',
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      transform: 'scale(1)',
                      backgroundColor: 
                        status === 'completed' ? 'rgba(76, 175, 80, 0.8)' :
                        status === 'attempted' ? 'rgba(255, 152, 0, 0.8)' :
                        status === 'available' ? 'rgba(33, 150, 243, 0.8)' :
                        'rgba(158, 158, 158, 0.5)',
                      border: level.boss ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.3)',
                      boxShadow: level.boss ? '0 0 20px rgba(255, 215, 0, 0.5)' : '0 4px 15px rgba(0,0,0,0.2)',
                      filter: unlocked ? 'none' : 'grayscale(70%)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (unlocked) e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {/* 보스 배지 */}
                    {level.boss && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        backgroundColor: '#FFD700',
                        color: '#000',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {level.finalBoss ? '👑 FINAL' : '💀 BOSS'}
                      </div>
                    )}
                    
                    {/* 잠금 아이콘 */}
                    {!unlocked && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        fontSize: '24px'
                      }}>
                        🔒
                      </div>
                    )}
                    
                    <div style={{ color: 'white' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '20px' }}>
                            {level.difficulty} {level.title}
                          </h3>
                          <p style={{ margin: '4px 0', opacity: 0.9, fontSize: '14px' }}>
                            [{level.category}]
                          </p>
                        </div>
                        
                        {/* 별점 */}
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3].map(star => (
                            <span 
                              key={star}
                              style={{ 
                                fontSize: '20px',
                                color: star <= stars ? '#FFD700' : 'rgba(255,255,255,0.3)'
                              }}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <p style={{ 
                        margin: 0, 
                        fontSize: '14px', 
                        lineHeight: '1.4',
                        opacity: 0.95
                      }}>
                        {level.description}
                      </p>
                      
                      {/* 상태 표시 */}
                      <div style={{ 
                        marginTop: '12px', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '12px', 
                          padding: '2px 8px', 
                          backgroundColor: 'rgba(255,255,255,0.2)', 
                          borderRadius: '10px' 
                        }}>
                          {status === 'completed' ? '✅ 완료' :
                           status === 'attempted' ? '⏳ 시도중' :
                           status === 'available' ? '🎯 도전' : '🔒 잠김'}
                        </span>
                        
                        {unlocked && (
                          <span style={{ fontSize: '18px' }}>
                            ➡️
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameMap;