import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Editor from '@monaco-editor/react';
// import BlocklyEditor from './BlocklyEditor';
import GameMap from './GameMap';
import Login from './Login';
import AdminPanel from './AdminPanel';
import StudentDashboard from './StudentDashboard';

// 자동 네트워크 감지 시스템
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
console.log('🔗 API 서버 주소:', API_BASE_URL);
let socket = null;

// 소켓 초기화 함수
const initializeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  try {
    const socketUrl = API_BASE_URL.replace('/api', '');
    console.log('🔌 소켓 연결 주소:', socketUrl);
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    console.log('🔌 소켓 새로 초기화됨');
    return socket;
  } catch (error) {
    console.error('🚨 소켓 초기화 실패:', error);
    return null;
  }
};

// 문제 추가/수정 모달 컴포넌트
const ProblemModal = ({ title, problem = null, onSubmit, onClose, currentLesson, lessons = [] }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const submitData = {
      title: formData.get('title'),
      description: formData.get('description'),
      language: 'multiple', // 다중 언어 지원
      difficulty: 'medium', // 기본 난이도
      category: 'basic', // 기본 카테고리
      lesson: parseInt(formData.get('lesson')),
      inputExample: formData.get('inputExample'),
      outputExample: formData.get('outputExample'),
      starterCode: formData.get('starterCode'),
      hints: formData.get('hints')
    };
    
    console.log('ProblemModal에서 생성한 submitData:', submitData);
    
    onSubmit(submitData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '100%',
        maxWidth: '600px',
        margin: '16px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              문제 제목
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={problem?.title || ''}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none'
              }}
              placeholder="예: Hello World 출력하기"
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              문제 설명
            </label>
            <textarea
              name="description"
              required
              defaultValue={problem?.description || ''}
              style={{
                width: '100%',
                height: '80px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder="문제에 대한 자세한 설명을 입력하세요"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              차시
            </label>
            <select
              name="lesson"
              defaultValue={problem?.lesson || currentLesson}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              {lessons && lessons.length > 0 ? lessons.map(lesson => (
                <option key={lesson.id} value={lesson.number}>
                  {lesson.number}차시 - {lesson.name}
                </option>
              )) : (
                <>
                  <option value={1}>1차시 - 기초</option>
                  <option value={2}>2차시 - 변수와 연산</option>
                  <option value={3}>3차시 - 조건문</option>
                </>
              )}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              입력 예시
            </label>
            <textarea
              name="inputExample"
              defaultValue={problem?.inputExample || ''}
              style={{
                width: '100%',
                height: '60px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
              placeholder="예:&#10;-&#10;(또는 입력이 없는 경우 '-')"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              출력 예시
            </label>
            <textarea
              name="outputExample"
              defaultValue={problem?.outputExample || ''}
              style={{
                width: '100%',
                height: '60px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
              placeholder="예:&#10;Hello World!"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              시작 코드
            </label>
            <textarea
              name="starterCode"
              defaultValue={problem?.starterCode || ''}
              style={{
                width: '100%',
                height: '100px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
              placeholder="# 학생들에게 제공할 기본 코드&#10;print('Hello World')"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              힌트 (줄바꿈으로 구분)
            </label>
            <textarea
              name="hints"
              defaultValue={problem?.hints || ''}
              style={{
                width: '100%',
                height: '80px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder="1. print() 함수를 사용하세요&#10;2. 문자열은 따옴표로 감싸주세요"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {problem ? '수정' : '추가'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 도움 요청 모달 컴포넌트
const HelpRequestModal = ({ onSubmit, onClose, problemTitle }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '100%',
        maxWidth: '500px',
        margin: '16px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#dc2626'
        }}>
          🚨 도움 요청
        </h3>
        
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <p style={{ fontSize: '14px', color: '#92400e' }}>
            문제: <strong>{problemTitle}</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#92400e', marginTop: '4px' }}>
            선생님에게 도움을 요청합니다. 어려운 점을 구체적으로 설명해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              어려운 점을 설명해주세요
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                resize: 'vertical',
                fontSize: '14px'
              }}
              placeholder="예: 문법 오류가 계속 나요. 어디가 틀린지 모르겠어요."
            />
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🚨 도움 요청
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 차시 관리 모달 컴포넌트
const LessonModal = ({ title, lesson = null, onSubmit, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const submitData = {
      number: parseInt(formData.get('number')),
      name: formData.get('name'),
      description: formData.get('description')
    };
    
    onSubmit(submitData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        margin: '16px'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              차시 번호
            </label>
            <input
              name="number"
              type="number"
              required
              min="1"
              defaultValue={lesson?.number || ''}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none'
              }}
              placeholder="예: 6"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              차시 이름
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={lesson?.name || ''}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none'
              }}
              placeholder="예: 리스트와 딕셔너리"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              차시 설명
            </label>
            <textarea
              name="description"
              defaultValue={lesson?.description || ''}
              style={{
                width: '100%',
                height: '80px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder="차시 내용에 대한 설명을 입력하세요"
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {lesson ? '수정' : '추가'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 문제 관리 컴포넌트
const ProblemManagement = ({ 
  problems, currentLesson, onLessonChange, onToggleProblem, onToggleLessonProblems, onLoadProblems,
  onAddProblem, onEditProblem, onDeleteProblem, onMoveProblem, lessons, onLoadLessons, onAddLesson, onEditLesson, onDeleteLesson 
}) => {
  const [selectedLesson, setSelectedLesson] = useState(currentLesson);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  useEffect(() => {
    onLoadProblems(selectedLesson);
  }, [selectedLesson, onLoadProblems]);

  const lessonProblems = problems.filter(p => p.lesson === selectedLesson);
  const activeCount = lessonProblems.filter(p => p.isActive === 1).length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
      {/* 차시 선택 및 제어 */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>차시 관리</h2>
        
        {/* 차시 선택 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '16px', fontWeight: '500' }}>
              차시 선택:
            </label>
            <button
              onClick={() => setShowLessonModal(true)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#059669',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ➕ 차시 추가
            </button>
          </div>
          <select 
            value={selectedLesson}
            onChange={(e) => {
              const lesson = parseInt(e.target.value);
              setSelectedLesson(lesson);
              onLessonChange(lesson);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              fontSize: '16px'
            }}
          >
            {lessons && lessons.length > 0 ? lessons.map(lesson => (
              <option key={lesson.id} value={lesson.number}>
                {lesson.number}차시 - {lesson.name}
              </option>
            )) : (
              <>
                <option value={1}>1차시 - 기초</option>
                <option value={2}>2차시 - 변수와 연산</option>
                <option value={3}>3차시 - 조건문</option>
              </>
            )}
          </select>
        </div>

        {/* 차시 관리 버튼들 */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              const currentLessonData = lessons.find(l => l.number === selectedLesson);
              if (currentLessonData) {
                setEditingLesson(currentLessonData);
                setShowEditLessonModal(true);
              }
            }}
            style={{
              flex: 1,
              padding: '6px 12px',
              backgroundColor: '#f59e0b',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            차시 수정
          </button>
          <button
            onClick={() => {
              const currentLessonData = lessons.find(l => l.number === selectedLesson);
              if (currentLessonData && window.confirm(`정말로 ${currentLessonData.number}차시 - ${currentLessonData.name}를 삭제하시겠습니까?`)) {
                onDeleteLesson(currentLessonData.id);
              }
            }}
            style={{
              flex: 1,
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            차시 삭제
          </button>
        </div>

        {/* 차시 통계 */}
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ fontSize: '16px', color: '#374151' }}>
            <div>총 문제: {lessonProblems.length}개</div>
            <div>활성화된 문제: {activeCount}개</div>
            <div>비활성화된 문제: {lessonProblems.length - activeCount}개</div>
          </div>
        </div>

        {/* 차시별 일괄 제어 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => onToggleLessonProblems(selectedLesson, true)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✅ {selectedLesson}차시 전체 활성화
          </button>
          <button
            onClick={() => onToggleLessonProblems(selectedLesson, false)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ❌ {selectedLesson}차시 전체 비활성화
          </button>
        </div>
      </div>

      {/* 문제 목록 */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
          {selectedLesson}차시 문제 목록
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {lessonProblems.map((problem, index) => (
            <div 
              key={problem.id}
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: problem.isActive ? '2px solid #059669' : '1px solid #e5e7eb',
                backgroundColor: problem.isActive ? '#f0fdf4' : '#f9fafb'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: '600' }}>{problem.title}</span>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 6px',
                      backgroundColor: problem.isActive ? '#059669' : '#6b7280',
                      color: 'white',
                      borderRadius: '10px'
                    }}>
                      {problem.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
                    {problem.description}
                  </div>
                  
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* 순서 변경 버튼 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      onClick={() => onMoveProblem(problem.id, 'up')}
                      disabled={index === 0}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: index === 0 ? '#d1d5db' : '#6366f1',
                        color: 'white',
                        borderRadius: '3px',
                        border: 'none',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        lineHeight: '1'
                      }}
                      title="위로 이동"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => onMoveProblem(problem.id, 'down')}
                      disabled={index === lessonProblems.length - 1}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: index === lessonProblems.length - 1 ? '#d1d5db' : '#6366f1',
                        color: 'white',
                        borderRadius: '3px',
                        border: 'none',
                        cursor: index === lessonProblems.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        lineHeight: '1'
                      }}
                      title="아래로 이동"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    onClick={() => onToggleProblem(problem.id, !problem.isActive)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: problem.isActive ? '#dc2626' : '#059669',
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {problem.isActive ? '비활성화' : '활성화'}
                  </button>
                  <button
                    onClick={() => {
                      console.log('수정 버튼 클릭됨. 문제 데이터:', problem);
                      setEditingProblem(problem);
                      setShowEditModal(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('정말로 이 문제를 삭제하시겠습니까?')) {
                        onDeleteProblem(problem.id);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {lessonProblems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              {selectedLesson}차시에 등록된 문제가 없습니다.
            </div>
          )}
        </div>

        {/* 문제 추가 버튼 */}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ➕ 새 문제 추가
          </button>
        </div>
      </div>
      
      {/* 문제 추가 모달 */}
      {showAddModal && (
        <ProblemModal
          title="새 문제 추가"
          onSubmit={(data) => {
            onAddProblem(data);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
          currentLesson={selectedLesson}
        />
      )}
      
      {/* 문제 수정 모달 */}
      {showEditModal && editingProblem && (
        <ProblemModal
          title="문제 수정"
          problem={editingProblem}
          onSubmit={(data) => {
            console.log('문제 수정 모달에서 제출됨. 문제 ID:', editingProblem.id, '데이터:', data);
            onEditProblem(editingProblem.id, data);
            setShowEditModal(false);
            setEditingProblem(null);
          }}
          onClose={() => {
            setShowEditModal(false);
            setEditingProblem(null);
          }}
          currentLesson={selectedLesson}
        />
      )}

      {/* 차시 추가 모달 */}
      {showLessonModal && (
        <LessonModal
          title="새 차시 추가"
          onSubmit={(data) => {
            onAddLesson(data);
            setShowLessonModal(false);
          }}
          onClose={() => setShowLessonModal(false)}
        />
      )}

      {/* 차시 수정 모달 */}
      {showEditLessonModal && editingLesson && (
        <LessonModal
          title="차시 수정"
          lesson={editingLesson}
          onSubmit={(data) => {
            onEditLesson(editingLesson.id, data);
            setShowEditLessonModal(false);
            setEditingLesson(null);
          }}
          onClose={() => {
            setShowEditLessonModal(false);
            setEditingLesson(null);
          }}
        />
      )}
    </div>
  );
};

const CodingMentoringPlatform = () => {
  console.log('🚀 CodingMentoringPlatform 컴포넌트 시작됨');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [currentTab, setCurrentTab] = useState('mentor');
  const [selectedClass, setSelectedClass] = useState('전체');
  const [sortBy, setSortBy] = useState('studentId');
  const [code, setCode] = useState('');
  const [isRestoringState, setIsRestoringState] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [problemCodes, setProblemCodes] = useState({});
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [studentScreens, setStudentScreens] = useState({});
  const [showScreenShare, setShowScreenShare] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(1);
  const [problemStatus, setProblemStatus] = useState({});
  const [lessons, setLessons] = useState([]);
  const [latestFeedback, setLatestFeedback] = useState({});
  const [fontSize, setFontSize] = useState(14);
  const [submittingProblems, setSubmittingProblems] = useState(new Set());
  const [lastUpdateTime, setLastUpdateTime] = useState({});
  const [screenTransmissionCounter, setScreenTransmissionCounter] = useState(0);
  const [lastUpdateContent, setLastUpdateContent] = useState({});
  const [helpRequests, setHelpRequests] = useState([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [liveMessages, setLiveMessages] = useState([]);
  const [liveMessageInput, setLiveMessageInput] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  const [originalCode, setOriginalCode] = useState('');
  const [codeModifications, setCodeModifications] = useState([]);
  const [hasModifications, setHasModifications] = useState(false);
  const [socket, setSocket] = useState(null);

  const classOptions = ['전체', '월요일반', '화요일반', '수요일반', '목요일반', '금요일반', '토요일반'];

  // 로그인 체크
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // 소켓 초기화
  useEffect(() => {
    console.log('⚡ 소켓 초기화 useEffect 실행됨');
    const newSocket = initializeSocket();
    console.log('🔌 소켓 초기화 완료:', newSocket ? '성공' : '실패');
    setSocket(newSocket);
  }, []);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (userType === 'admin' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('알림 권한이 허용되었습니다.');
        }
      });
    }
  }, [userType]);

  // 로그인 체크 (무한 루프 방지 - 의존성 배열 제거)
  useEffect(() => {
    // 🧹 코드 격리 문제 해결을 위한 임시 세션 초기화
    const shouldResetSession = localStorage.getItem('needsSessionReset');
    if (shouldResetSession) {
      console.log('🔄 세션 리셋 실행 중...');
      localStorage.clear();
      window.location.reload();
      return;
    }
    
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedUser && savedUserType) {
      const parsedUser = JSON.parse(savedUser);
      console.log('저장된 사용자 정보 복원:', { user: parsedUser, type: savedUserType });
      setUser(parsedUser);
      setUserType(savedUserType);
      setIsLoggedIn(true);
      
      if (savedUserType === 'admin') {
        loadStudents();
        loadAllStudentsCodes(); // 모든 학생 코드 미리 로드
        loadProblems();
        loadLessons();
        loadHelpRequests(); // 미해결 도움 요청 로드
      } else {
        loadProblems();
        loadProblemStatus();
        loadLessons();
        loadLatestFeedback();
        loadLiveMessages(parsedUser.id); // 실시간 메시지 로드
      }
    }
  }, [user?.id, userType]); // user.id와 userType 변경시에만 실행

  // 첫 번째 문제 자동 선택 및 저장된 코드 불러오기 (무한 루프 방지)
  useEffect(() => {
    if (userType === 'student' && problems.length > 0 && user?.id && !selectedProblem) {
      // ⚠️ localStorage에 저장된 문제가 있으면 자동 선택하지 않고 복원을 기다림
      const savedProblem = localStorage.getItem(`student_${user.id}_selectedProblem`);
      if (savedProblem) {
        console.log('💾 저장된 문제가 있어서 첫 번째 문제 자동 선택 건너뜀');
        return;
      }
      const firstProblem = problems[0];
      setSelectedProblem(firstProblem);
      
      // 1. 로컬스토리지에서 먼저 확인
      const storageKey = `student_${user.id}_problem_${firstProblem.id}_code`;
      const localCode = localStorage.getItem(storageKey);
      
      // 2. 서버에서 저장된 코드 확인  
      const savedCode = problemStatus[firstProblem.id]?.code;
      
      // ⭐ 제출한 적이 없는 문제만 스타터 코드 표시, 제출한 적이 있으면 점수 상관없이 제출 코드 표시
      const problemStars = problemStatus[firstProblem.id]?.stars || 0;
      const hasSubmitted = !!savedCode || !!localCode || !!problemStatus[firstProblem.id]?.lastSubmittedAt;
      
      let newCode;
      if (!hasSubmitted) {
        console.log('📝 한 번도 제출하지 않은 첫 번째 문제 - 스타터 코드 표시:', { 
          problemId: firstProblem.id, 
          problemTitle: firstProblem.title,
          stars: problemStars,
          hasLocalCode: !!localCode,
          hasSavedCode: !!savedCode,
          hasSubmissionRecord: !!problemStatus[firstProblem.id]?.lastSubmittedAt
        });
        newCode = firstProblem.starterCode || '';
      } else {
        console.log('🔄 제출한 적이 있는 첫 번째 문제 - 제출 코드 복원:', { 
          problemId: firstProblem.id, 
          problemTitle: firstProblem.title,
          stars: problemStars,
          hasLocalCode: !!localCode,
          hasSavedCode: !!savedCode,
          hasSubmissionRecord: !!problemStatus[firstProblem.id]?.lastSubmittedAt
        });
        // 제출한 적이 있으면 로컬 코드 우선, 없으면 서버 코드, 없으면 스타터 코드
        const hasValidLocalCode = localCode && localCode.trim() !== '' && localCode.trim().length > 10;
        const hasValidSavedCode = savedCode && savedCode.trim() !== '' && savedCode.trim().length > 10;  
        newCode = (hasValidLocalCode ? localCode : (hasValidSavedCode ? savedCode : firstProblem.starterCode)) || '';
      }
      
      console.log('🔄 첫 번째 문제 자동 선택 및 저장된 코드 로드:', { 
        problemId: firstProblem.id,
        problemTitle: firstProblem.title,
        별점수: problemStars,
        제출여부: hasSubmitted,
        hasLocalCode: !!localCode,
        localCode: localCode?.substring(0, 50) + '...',
        hasSavedCode: !!savedCode,
        savedCode: savedCode?.substring(0, 50) + '...',
        hasStarterCode: !!firstProblem.starterCode,
        starterCode: firstProblem.starterCode?.substring(0, 50) + '...',
        newCode: newCode?.substring(0, 50) + '...'
      });
      // localStorage 복원 중이면 실행하지 않음
      if (isRestoringState) {
        console.log('⏸️ 상태 복원 중이므로 자동 선택 건너뜀');
        return;
      }
      
      setCode(newCode);
    }
  }, [problems, userType, selectedProblem, isRestoringState]);

  // 페이지 떠나기 전 코드 저장 및 로그아웃 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 페이지 종료 전 자동 저장
      if (selectedProblem && code && userType === 'student' && user?.id) {
        console.log('💾 페이지 종료 전 코드 저장:', { problemId: selectedProblem.id });
        // 로컬스토리지에도 백업 저장
        const storageKey = `student_${user.id}_problem_${selectedProblem.id}_code`;
        localStorage.setItem(storageKey, code);
        updateCode(code, false); // 서버에도 저장
      }
      
      // 학생이 페이지를 떠날 때 로그아웃 처리
      if (userType === 'student' && user && socket && socket.connected) {
        console.log('🚪 페이지 종료 전 로그아웃 처리:', user.id);
        socket.emit('studentLogout', { 
          studentId: user.id,
          studentName: user.name,
          reason: 'pageUnload'
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedProblem, code, userType, user]);

  // 코드 변경 시 실시간 로컬스토리지 백업
  useEffect(() => {
    if (selectedProblem && code && userType === 'student' && user?.id) {
      const storageKey = `student_${user.id}_problem_${selectedProblem.id}_code`;
      localStorage.setItem(storageKey, code);
    }
  }, [selectedProblem, code, userType, user]);

  // 반별 필터링
  useEffect(() => {
    if (selectedClass === '전체') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(student => student.class === selectedClass));
    }
  }, [students, selectedClass]);

  // 정렬 및 반 선택 변경 시 학생 목록 다시 로드
  useEffect(() => {
    if (userType === 'admin') {
      loadStudents();
    }
  }, [selectedClass, sortBy, userType]);

  // 선택된 학생 업데이트 (필터링된 목록에서)
  useEffect(() => {
    if (filteredStudents.length > 0 && (!selectedStudent || !filteredStudents.find(s => s.id === selectedStudent.id))) {
      setSelectedStudent(filteredStudents[0]);
    } else if (filteredStudents.length === 0) {
      setSelectedStudent(null);
    }
  }, [filteredStudents]);

  // 학생 목록 로드
  const loadStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClass !== '전체') {
        params.append('class', selectedClass);
      }
      params.append('sortBy', sortBy);
      
      const queryParam = params.toString() ? `?${params.toString()}` : '';
      const response = await axios.get(`${API_BASE_URL}/students${queryParam}`);
      setStudents(response.data);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
    }
  };

  // 관리자용 모든 학생 코드 로드
  const loadAllStudentsCodes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/students-code`);
      console.log('🔄 모든 학생 코드 로드:', response.data);
      
      // 학생별 코드 데이터를 state에 저장
      const codesMap = {};
      response.data.forEach(student => {
        codesMap[student.studentId] = student.problems;
      });
      
      // 기존 학생 코드 상태 업데이트
      setStudents(prevStudents => 
        prevStudents.map(student => ({
          ...student,
          currentCode: codesMap[student.id] || {},
          lastActivity: new Date().toISOString()
        }))
      );
      
    } catch (error) {
      console.error('학생 코드 로드 실패:', error);
    }
  };

  // 특정 학생의 현재 코드 로드 (관리자용)
  const loadStudentCurrentCode = async (studentId, currentProblemId = 1) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/students-code`);
      console.log('🔄 학생 코드 로드:', { studentId, allData: response.data });
      
      // 해당 학생의 데이터만 찾기
      const studentData = response.data.find(student => student.studentId === studentId);
      
      if (studentData) {
        // 선택된 학생의 코드 업데이트
        setSelectedStudent(prev => ({
          ...prev,
          currentProblems: studentData.problems,
          currentCode: studentData.problems
        }));
        
        // 현재 문제의 코드로 업데이트
        if (studentData.problems[currentProblemId]) {
          const currentCode = studentData.problems[currentProblemId].code || '';
          setSelectedStudent(prev => ({
            ...prev,
            code: currentCode
          }));
          setOriginalCode(currentCode);
          console.log('🔄 현재 문제 코드 업데이트:', { problemId: currentProblemId, codeLength: currentCode.length });
        } else {
          // 문제가 없다면 빈 코드로 설정
          setSelectedStudent(prev => ({
            ...prev,
            code: ''
          }));
          setOriginalCode('');
          console.log('🔄 현재 문제 코드가 없음, 빈 코드로 설정');
        }
      } else {
        console.log('🔄 해당 학생의 데이터를 찾을 수 없음:', studentId);
      }
      
    } catch (error) {
      console.error('학생 코드 로드 실패:', error);
    }
  };

  // 미해결 도움 요청 로드
  const loadHelpRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/help-requests`);
      console.log('📋 미해결 도움 요청 로드:', response.data);
      setHelpRequests(response.data);
    } catch (error) {
      console.error('도움 요청 로드 실패:', error);
    }
  };

  // 차시 목록 로드
  const loadLessons = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lessons`);
      setLessons(response.data);
    } catch (error) {
      console.error('차시 목록 로드 실패:', error);
    }
  }, []);

  // 문제 목록 로드 (학생용 - 활성화된 문제만) - 무한 루프 방지
  const loadProblems = useCallback(async (lesson = null) => {
    try {
      const url = lesson ? `${API_BASE_URL}/problems?lesson=${lesson}` : `${API_BASE_URL}/problems`;
      const response = await axios.get(url);
      console.log('문제 목록 로드됨:', response.data);
      setProblems(response.data);
      // useEffect에서 처리하도록 위임 (중복 제거)
    } catch (error) {
      console.error('문제 목록 로드 실패:', error);
    }
  }, []);

  // 관리자용 문제 목록 로드 (모든 문제)
  const loadAdminProblems = useCallback(async (lesson = null) => {
    try {
      const url = lesson ? `${API_BASE_URL}/admin/problems?lesson=${lesson}` : `${API_BASE_URL}/admin/problems`;
      const response = await axios.get(url);
      setProblems(response.data);
    } catch (error) {
      console.error('관리자 문제 목록 로드 실패:', error);
    }
  }, []);

  // 문제 활성화/비활성화
  const toggleProblem = async (problemId, isActive) => {
    try {
      await axios.put(`${API_BASE_URL}/problems/${problemId}/toggle`, { isActive });
      loadAdminProblems(currentLesson); // 새로고침
    } catch (error) {
      console.error('문제 상태 변경 실패:', error);
      alert('문제 상태 변경에 실패했습니다.');
    }
  };

  // 차시별 문제 일괄 활성화/비활성화
  const toggleLessonProblems = async (lesson, isActive) => {
    try {
      await axios.put(`${API_BASE_URL}/problems/lesson/${lesson}/toggle`, { isActive });
      loadAdminProblems(lesson); // 새로고침
    } catch (error) {
      console.error('차시별 문제 상태 변경 실패:', error);
      alert('차시별 문제 상태 변경에 실패했습니다.');
    }
  };

  // 문제 추가
  const addProblem = async (problemData) => {
    try {
      await axios.post(`${API_BASE_URL}/problems`, problemData);
      loadAdminProblems(currentLesson); // 새로고침
      alert('문제가 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('문제 추가 실패:', error);
      alert('문제 추가에 실패했습니다.');
    }
  };

  // 문제 수정
  const editProblem = async (problemId, problemData) => {
    try {
      console.log('프론트엔드에서 전송하는 문제 수정 데이터:', problemData);
      await axios.put(`${API_BASE_URL}/problems/${problemId}`, problemData);
      loadAdminProblems(currentLesson); // 새로고침
      
      // 수정된 문제 정보 표시 
      const problemNumber = problemData.number || problemId;
      const problemTitle = problemData.title || `문제 ${problemNumber}`;
      alert(`문제 수정이 완료되었습니다! ✅\n\n📝 수정된 문제: ${problemNumber}번 - ${problemTitle}`);
    } catch (error) {
      console.error('문제 수정 실패:', error);
      alert('문제 수정에 실패했습니다.');
    }
  };

  // 문제 삭제
  const deleteProblem = async (problemId) => {
    try {
      await axios.delete(`${API_BASE_URL}/problems/${problemId}`);
      loadAdminProblems(currentLesson); // 새로고침
      alert('문제가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('문제 삭제 실패:', error);
      alert('문제 삭제에 실패했습니다.');
    }
  };

  // 문제 순서 변경
  const moveProblem = async (problemId, direction) => {
    const requestUrl = `${API_BASE_URL}/problems/${problemId}/move`;
    console.log('🔄 프론트엔드: 문제 순서 변경 시작', problemId, direction);
    try {
      const response = await axios.put(requestUrl, { direction });
      console.log('✅ 서버 응답:', response.data);
      
      if (response.data.success) {
        // 성공시에만 새로고침
        await loadAdminProblems(currentLesson);
        alert('문제 순서가 성공적으로 변경되었습니다.');
      } else {
        alert(response.data.message || '순서 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 문제 순서 변경 실패:', error);
      alert(`문제 순서 변경에 실패했습니다: ${error.response?.data?.error || error.message}`);
    }
  };

  // 차시 추가
  const addLesson = async (lessonData) => {
    try {
      await axios.post(`${API_BASE_URL}/lessons`, lessonData);
      loadLessons(); // 새로고침
      alert('차시가 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('차시 추가 실패:', error);
      alert(error.response?.data?.error || '차시 추가에 실패했습니다.');
    }
  };

  // 차시 수정
  const editLesson = async (lessonId, lessonData) => {
    try {
      await axios.put(`${API_BASE_URL}/lessons/${lessonId}`, lessonData);
      loadLessons(); // 새로고침
      alert('차시가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('차시 수정 실패:', error);
      alert(error.response?.data?.error || '차시 수정에 실패했습니다.');
    }
  };

  // 차시 삭제
  const deleteLesson = async (lessonId) => {
    try {
      await axios.delete(`${API_BASE_URL}/lessons/${lessonId}`);
      loadLessons(); // 새로고침
      // 삭제된 차시가 현재 선택된 차시라면 첫 번째 차시로 변경
      const remainingLessons = lessons.filter(l => l.id !== lessonId);
      if (remainingLessons.length > 0) {
        const firstLesson = remainingLessons.sort((a, b) => a.number - b.number)[0];
        setCurrentLesson(firstLesson.number);
      }
      alert('차시가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('차시 삭제 실패:', error);
      alert(error.response?.data?.error || '차시 삭제에 실패했습니다.');
    }
  };

  // 문제 상태 로드 (학생용) - 로컬 제출 상태 보존 (무한 루프 방지)
  const loadProblemStatus = useCallback(async () => {
    if (userType === 'student' && user?.id) {
      try {
        console.log('loadProblemStatus 호출됨 - localStorage 백업 복원 모드');
        const response = await axios.get(`${API_BASE_URL}/student/${user.id}/problem-status`);
        console.log('서버에서 받은 문제 상태:', response.data);
        
        // localStorage에서 백업된 제출 상태 복원
        const backupKey = `student_${user.id}_problem_status`;
        const backupStatus = localStorage.getItem(backupKey);
        const localBackup = backupStatus ? JSON.parse(backupStatus) : {};
        console.log('localStorage에서 복원된 제출 상태:', localBackup);
        
        // 서버 데이터를 우선시 (컴퓨터간 일관성 보장)
        console.log('🌐 서버 데이터를 우선 적용 (컴퓨터간 동기화)');
        const serverData = { ...response.data };
        
        // 서버 데이터가 없는 경우에만 localStorage 백업 사용
        Object.keys(localBackup).forEach(problemId => {
          const backupProblem = localBackup[problemId];
          // 서버에 데이터가 없고, 백업에 제출 완료 상태가 있을 때만 복원
          if (!serverData[problemId] && backupProblem && backupProblem.status === 'solved' && backupProblem.lastSubmittedAt) {
            console.log('🛡️ 서버에 없는 데이터만 localStorage에서 복원:', { problemId, stars: backupProblem.stars });
            serverData[problemId] = backupProblem;
          }
        });
        
        console.log('🔄 최종 problemStatus (서버 우선):', serverData);
        setProblemStatus(serverData);
      } catch (error) {
        console.error('문제 상태 로드 실패:', error);
      }
    }
  }, [userType, user]);


  // 문제 제출하기 (백엔드 자동채점)
  const submitProblem = async (problemId, stars) => {
    console.log('submitProblem 호출됨:', { problemId, userType, userId: user?.id });
    
    // 이미 제출 중인 문제인지 확인
    if (submittingProblems.has(problemId)) {
      console.log('⚠️ 이미 제출 중인 문제:', problemId);
      return;
    }
    
    if (userType === 'student' && user?.id) {
      try {
        // 제출 시작 표시
        setSubmittingProblems(prev => new Set([...prev, problemId]));
        
        // 현재 선택된 문제의 코드를 사용 (로컬 상태 우선)
        const submissionCode = problemCodes[problemId] || problemStatus[problemId]?.code || code;
        console.log('제출 데이터:', { studentId: user.id, problemId, submissionCode, codeLength: submissionCode?.length });
        const response = await axios.post(`${API_BASE_URL}/problems/${problemId}/submit`, { 
          studentId: user.id, 
          code: submissionCode
        });
        console.log('백엔드 자동채점 결과:', response.data);
        console.log('response.data.stars:', response.data.stars);
        console.log('response.data.stars 타입:', typeof response.data.stars);
        
        // 백엔드에서 받은 별점 사용
        const backendStars = response.data.stars || 0;
        const { passedTests = 0, totalTests = 1, results = [], summary = '' } = response.data;
        
        console.log('최종 별점:', backendStars);
        console.log(`테스트 결과: ${passedTests}/${totalTests} 통과`);
        
        // 백준/코드업 스타일 결과 표시
        let message = '';
        if (backendStars === 1) {
          message = '🎉 정답! 1점 획득!';
          if (totalTests > 1) {
            message += `\\n📚 추가 자습 테스트: ${passedTests}/${totalTests} 통과`;
          }
        } else {
          message = '❌ 오답... 0점';
          if (results.length > 0 && !results[0].passed) {
            message += `\\n기본 테스트 실패: 예상 "${results[0].expected}", 실제 "${results[0].actual}"`;
          }
        }
        
        console.log(message);
        
        // 백준 스타일: 간단한 결과 표시
        if (totalTests > 1 && backendStars === 1) {
          console.log(`📚 자습용 추가 테스트 결과: ${passedTests}/${totalTests} 통과`);
        }
        
        // 즉시 로컬 상태 업데이트 (백엔드 결과 사용)
        setProblemStatus(prev => {
          const newStatus = {
            ...prev,
            [problemId]: {
              ...prev[problemId],
              status: 'solved',
              stars: backendStars,
              code: submissionCode, // 제출된 코드도 저장
              lastSubmittedAt: new Date().toISOString()
            }
          };
          console.log('⭐ 로컬 상태 즉시 업데이트:', { 
            problemId, 
            backendStars, 
            이전상태: prev[problemId],
            새상태: newStatus[problemId] 
          });
          
          // localStorage에 제출 상태 백업 저장 (F5 새로고침 대비)
          const backupKey = `student_${user.id}_problem_status`;
          const currentBackup = localStorage.getItem(backupKey);
          const backupData = currentBackup ? JSON.parse(currentBackup) : {};
          backupData[problemId] = newStatus[problemId];
          localStorage.setItem(backupKey, JSON.stringify(backupData));
          console.log('💾 localStorage에 제출 상태 백업 저장:', { problemId, stars: backendStars });
          
          return newStatus;
        });
        
        // problemCodes에도 저장 (로컬 코드 상태 동기화)
        setProblemCodes(prev => ({ ...prev, [problemId]: submissionCode }));
        
        // 상태 확인 로그
        setTimeout(() => {
          console.log('🔍 제출 후 상태 확인:', {
            문제ID: problemId,
            현재problemStatus: problemStatus[problemId],
            현재problemCodes: problemCodes[problemId]?.substring(0, 30)
          });
        }, 1000);
        alert(`문제를 ${backendStars}점으로 제출했습니다!`);
      } catch (error) {
        console.error('문제 제출 실패:', error);
        alert('문제 제출에 실패했습니다.');
      } finally {
        // 제출 완료 후 상태 정리
        setSubmittingProblems(prev => {
          const newSet = new Set(prev);
          newSet.delete(problemId);
          return newSet;
        });
      }
    } else {
      console.log('submitProblem 조건 불만족:', { userType, hasUser: !!user });
    }
  };

  // 피드백 전송
  const sendFeedback = async (studentId, problemId, adminId, message) => {
    console.log('피드백 전송 시도:', { studentId, problemId, adminId, message });
    try {
      const response = await axios.post(`${API_BASE_URL}/feedback`, {
        studentId,
        problemId,
        adminId,
        message
      });
      console.log('피드백 전송 성공:', response.data);
      alert('피드백이 전송되었습니다.');
    } catch (error) {
      console.error('피드백 전송 실패:', error);
      console.error('에러 응답:', error.response?.data);
      alert(`피드백 전송에 실패했습니다: ${error.response?.data?.error || error.message}`);
    }
  };

  // 최신 피드백 로드 (학생용) - 무한 루프 방지
  const loadLatestFeedback = useCallback(async () => {
    if (userType === 'student' && user?.id) {
      try {
        const response = await axios.get(`${API_BASE_URL}/feedback/latest/${user.id}`);
        setLatestFeedback(response.data);
      } catch (error) {
        console.error('피드백 로드 실패:', error);
      }
    }
  }, [userType, user]);

  // 폰트 크기 조절
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24)); // 최대 24px
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 10)); // 최소 10px
  };

  // Socket.io 이벤트 리스너
  useEffect(() => {
    if (!socket) return;
    
    socket.on('codeUpdated', (data) => {
      console.log('🔔 코드 업데이트 이벤트 수신:', data);
      
      // 🚨 자기 자신의 업데이트는 무시 (관리자가 아닐 때)
      if (userType === 'student' && user?.id === data.studentId) {
        console.log('🛑 자기 자신의 코드 업데이트 무시:', { studentId: data.studentId, problemId: data.problemId });
        return;
      }
      
      // 관리자 화면에서만 학생 코드 업데이트
      if (userType === 'admin') {
        setStudents(prev => prev.map(s => 
          s.id === data.studentId ? { ...s, code: data.code } : s
        ));
      }
      
      if (selectedStudent && selectedStudent.id === data.studentId) {
        console.log('선택된 학생의 코드 업데이트:', data.code);
        setSelectedStudent(prev => ({ ...prev, code: data.code }));
      }
    });

    // 도움 요청 수신 (관리자용)
    socket.on('helpRequest', (helpRequestData) => {
      console.log('🚨🚨🚨 도움 요청 수신:', helpRequestData);
      console.log('🚨 현재 userType:', userType);
      console.log('🚨 현재 user:', user);
      console.log('🚨 현재 helpRequests 길이:', helpRequests.length);
      
      if (userType === 'admin') {
        console.log('✅ 관리자 확인됨! helpRequests에 추가 중...');
        
        // 도움 요청 목록 즉시 새로고침
        loadHelpRequests();
        
        setHelpRequests(prev => {
          const newRequests = [...prev, {
            ...helpRequestData,
            id: Date.now(), // 고유 ID
            status: 'pending' // pending, resolved
          }];
          console.log('✅ 새로운 helpRequests:', newRequests);
          return newRequests;
        });
        
        // 사용자에게 알림
        alert(`🚨 ${helpRequestData.studentName}님이 도움을 요청했습니다!\n문제: ${helpRequestData.problemTitle}\n메시지: ${helpRequestData.message}`);
        
        // 브라우저 알림
        if (Notification.permission === 'granted') {
          new Notification(`🚨 ${helpRequestData.studentName}님이 도움을 요청했습니다!`, {
            body: `문제: ${helpRequestData.problemTitle}\n메시지: ${helpRequestData.message}`,
            icon: '/favicon.ico'
          });
        }
      }
    });

    socket.on('helpCompleted', (studentId) => {
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, needsHelp: 0 } : s
      ));
    });

    // 문제 업데이트 이벤트 리스너
    socket.on('problemUpdated', () => {
      if (userType === 'admin') {
        loadAdminProblems(currentLesson);
      } else {
        loadProblems(currentLesson);
        loadProblemStatus(); // 문제 상태도 새로고침
      }
    });

    // 차시 업데이트 이벤트 리스너
    socket.on('lessonUpdated', () => {
      loadLessons();
    });

    // 피드백 수신 이벤트 리스너
    socket.on('feedbackReceived', (feedbackData) => {
      if (userType === 'student' && user?.id === feedbackData.studentId) {
        loadLatestFeedback(); // 최신 피드백 다시 로드
      }
    });

    // 소켓 연결 시 학생 실시간 메시지 다시 로드
    socket.on('connect', () => {
      console.log('🔗 소켓 연결됨, 소켓 ID:', socket.id);
      console.log('🔍 소켓 연결 상태:', {
        connected: socket.connected,
        userType,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      
      // 사용자 식별 정보를 서버에 전송
      if (user?.id && userType) {
        console.log('🔍 서버에 사용자 식별 정보 전송:', {
          studentId: user.id,
          userType: userType
        });
        socket.emit('identify', {
          studentId: user.id,
          userType: userType
        });
      }
      
      if (userType === 'student' && user?.id) {
        console.log('📋 소켓 연결 시 실시간 메시지 다시 로드');
        loadLiveMessages(user.id);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🚫 소켓 연결 끊어짐:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🚨 소켓 연결 오류:', error);
    });

    // 주기적으로 소켓 연결 상태 체크 및 테스트
    const connectionCheckInterval = setInterval(() => {
      console.log('🔍 소켓 상태 체크:', {
        connected: socket.connected,
        timestamp: new Date().toISOString(),
        userType,
        userId: user?.id
      });
      
      // 소켓이 연결되어 있으면 테스트 이벤트 전송
      if (socket.connected && user?.id) {
        console.log('🧪 소켓 연결 테스트 메시지 전송');
        socket.emit('connectionTest', { 
          userId: user.id, 
          userType, 
          timestamp: new Date().toISOString() 
        });
      }
    }, 30000); // 30초마다 체크

    // 소켓 연결 테스트 응답 수신
    socket.on('connectionTestResponse', (data) => {
      console.log('✅ 소켓 연결 테스트 응답 수신:', data);
    });

    // 실시간 메시지 수신 이벤트 리스너 (학생용)
    socket.on('liveMessage', (messageData) => {
      console.log('🚨🚨🚨 실시간 메시지 수신 이벤트 발생!', messageData);
      console.log('🔍 현재 사용자 정보:', { userType, userId: user?.id, targetId: messageData.studentId });
      console.log('🔍 조건 확인:', {
        isStudent: userType === 'student',
        userIdMatch: user?.id === messageData.studentId,
        userId: user?.id,
        targetId: messageData.studentId,
        messageData: messageData
      });
      
      if (userType === 'student' && user?.id === messageData.studentId) {
        console.log('✅✅✅ 내게 온 실시간 메시지 처리 시작:', messageData.message);
        setLiveMessages(prev => {
          console.log('📝 이전 메시지 목록:', prev);
          const newMessages = [messageData, ...prev];
          console.log('📝 새로운 메시지 목록:', newMessages);
          return newMessages;
        });
        
        // 팝업 알림 테스트
        console.log('🔔 팝업 알림 시도...');
        alert(`선생님 메시지: ${messageData.message}`);
        
        // 브라우저 알림
        if (Notification.permission === 'granted') {
          console.log('🔔 브라우저 알림 생성 시도...');
          new Notification('선생님 메시지', {
            body: messageData.message,
            icon: '/favicon.ico'
          });
        }
      } else {
        console.log('❌ 내게 온 메시지가 아님:', { 
          isStudent: userType === 'student',
          idMatch: user?.id === messageData.studentId,
          myId: user?.id,
          targetId: messageData.studentId
        });
      }
    });

    // 코드 수정사항 수신 이벤트 리스너 (학생용)
    socket.on('codeModification', (modificationData) => {
      console.log('🔧 코드 수정사항 수신:', modificationData);
      console.log('🔍 수정사항 대상 확인:', { userType, userId: user?.id, targetId: modificationData.studentId });
      
      if (userType === 'student' && user?.id === modificationData.studentId) {
        console.log('✅ 내게 온 코드 수정사항:', modificationData.modifications);
        
        // 코드 수정사항 적용
        setCode(modificationData.modifiedCode);
        setCodeModifications(prev => [modificationData, ...prev]);
        setHasModifications(true);
        
        const hasChanges = modificationData.modifications.length > 0;
        
        if (hasChanges) {
          // 브라우저 알림
          if (Notification.permission === 'granted') {
            new Notification('선생님 코드 수정', {
              body: `1개 라인이 수정되었습니다.`,
              icon: '/favicon.ico'
            });
          }
          
          alert(`선생님이 코드를 수정했습니다! (1개 라인 수정)`);
          
          // 5초 후 하이라이트 자동 제거
          setTimeout(() => {
            console.log('⏰ 5초 후 하이라이트 자동 제거');
            setCodeModifications([]);
            setHasModifications(false);
          }, 5000);
        }
      }
    });

    // 학생 코드 업데이트 수신 이벤트 리스너 (관리자용)
    socket.on('studentCodeUpdate', (updateData) => {
      console.log('📝 학생 코드 업데이트 수신:', updateData);
      
      if (userType === 'admin') {
        // 관리자 화면에서 학생 목록 다시 로드
        loadAllStudentsCodes();
        
        // 브라우저 알림
        if (Notification.permission === 'granted') {
          new Notification('학생 코드 업데이트', {
            body: `학생이 문제 ${updateData.problemId}번을 제출했습니다. (${updateData.stars}점)`,
            icon: '/favicon.ico'
          });
        }
      }
    });

    // 학생 코드 변경 수신 이벤트 리스너 (멘토용)
    socket.on('studentCodeChange', (codeData) => {
      console.log('📡 학생 코드 변경 수신:', {
        studentId: codeData.studentId,
        codeLength: codeData.code?.length,
        timestamp: codeData.timestamp
      });
      
      if (userType === 'admin') {
        console.log('🔍 관리자 모드에서 학생 코드 변경 처리 중...');
        console.log('📋 현재 선택된 학생:', selectedStudent?.id, selectedStudent?.name);
        console.log('📋 코드 변경 대상 학생:', codeData.studentId);
        
        // 현재 선택된 학생의 코드가 변경된 경우
        if (selectedStudent && selectedStudent.id === codeData.studentId) {
          console.log('✅ 현재 선택된 학생의 코드 실시간 업데이트!');
          console.log('📝 이전 코드 길이:', selectedStudent.code?.length || 0);
          console.log('📝 새 코드 길이:', codeData.code?.length || 0);
          
          // selectedStudent의 코드 업데이트
          setSelectedStudent(prev => ({ 
            ...prev, 
            code: codeData.code,
            lastUpdated: new Date().toISOString()
          }));
          
          // students 배열에서도 업데이트
          setStudents(prevStudents => 
            prevStudents.map(student => 
              student.id === codeData.studentId 
                ? { ...student, code: codeData.code, lastUpdated: new Date().toISOString() }
                : student
            )
          );
          
          console.log('🎯 학생 코드 상태 업데이트 완료!');
        } else {
          console.log('ℹ️ 다른 학생의 코드 변경이므로 무시됨');
        }
      }
    });

    // 학생 상태 업데이트 수신 (관리자용)
    socket.on('studentStatusUpdated', (statusData) => {
      console.log('📡 학생 상태 업데이트 수신:', statusData);
      
      if (userType === 'admin') {
        console.log('🔄 관리자 화면에서 학생 상태 업데이트 처리');
        
        // students 배열에서 해당 학생 상태 업데이트
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.id === statusData.studentId 
              ? { ...student, status: statusData.status, lastActive: new Date().toISOString() }
              : student
          )
        );
        
        console.log(`✅ 학생 ${statusData.studentId} 상태를 ${statusData.status}로 업데이트 완료`);
      }
    });

    // 모든 학생 상태 리셋 이벤트 처리 (관리자용)
    socket.on('allStudentsStatusReset', (resetData) => {
      console.log('🔄 모든 학생 상태 리셋 수신:', resetData);
      
      if (userType === 'admin') {
        console.log('🔄 관리자 화면에서 학생 상태를 스마트 업데이트');
        console.log('🟢 온라인 유지할 학생 ID들:', resetData.onlineStudentIds);
        
        // 스마트 학생 상태 업데이트: 온라인 유지 목록에 없는 학생만 offline으로
        setStudents(prevStudents => 
          prevStudents.map(student => {
            const shouldStayOnline = resetData.onlineStudentIds?.includes(student.id);
            return {
              ...student, 
              status: shouldStayOnline ? 'online' : 'offline', 
              lastActive: resetData.timestamp 
            };
          })
        );
        
        // studentScreens도 스마트 업데이트: 온라인 유지 학생들은 그대로 두기
        setStudentScreens(prevScreens => {
          const newScreens = { ...prevScreens };
          
          // 오프라인된 학생들의 화면 정보만 제거
          Object.keys(newScreens).forEach(studentId => {
            const id = parseInt(studentId);
            if (!resetData.onlineStudentIds?.includes(id)) {
              delete newScreens[studentId];
            }
          });
          
          console.log('📱 화면 공유 상태 업데이트 완료:', Object.keys(newScreens));
          return newScreens;
        });
        
        console.log('✅ 스마트 학생 상태 업데이트 완료');
        console.log('📢 상태 업데이트 결과:', resetData.message || '학생 상태가 업데이트되었습니다.');
      }
    });

    // 학생 화면 상태 업데이트 수신 (관리자용)
    socket.on('studentScreenUpdate', (screenData) => {
      console.log('📺 [실시간] 학생 화면 상태 업데이트 수신:', screenData);
      console.log('📺 selectedProblem 타입:', typeof screenData.selectedProblem);
      console.log('📺 selectedProblem 내용:', screenData.selectedProblem);
      console.log('📺 현재 userType:', userType);
      console.log('📺 userType === admin 체크:', userType === 'admin');
      
      if (userType === 'admin') {
        console.log('📺 [실시간] 관리자 조건 통과, setStudentScreens 호출');
        // 전송 순서 번호 증가
        setScreenTransmissionCounter(prevCounter => {
          const newCounter = prevCounter + 1;
          // 서버와 동일한 구조로 데이터 저장 (API와 일치) + 순서 번호 추가
          setStudentScreens(prev => {
            console.log('📺 [실시간] 이전 studentScreens:', prev);
            console.log('📺 [실시간] 이전과 현재 데이터 비교:', {
              이전타임스탬프: prev[screenData.studentId]?.timestamp,
              현재타임스탬프: screenData.timestamp,
              같음: prev[screenData.studentId]?.timestamp === screenData.timestamp
            });
            
            const newScreens = {
              ...prev,
              [screenData.studentId]: {
                ...screenData, // 서버에서 정규화된 전체 데이터 저장
                transmissionOrder: newCounter // 전송 순서 번호 추가
              }
            };
            console.log('📺 [실시간] 업데이트된 studentScreens:', newScreens);
            console.log('📺 [실시간] 학생', screenData.studentId, '화면:', screenData.selectedProblem?.title || screenData.selectedProblem);
            console.log('📺 [실시간] 전송 순서:', newCounter);
            console.log('📺 [실시간] 참조 비교:', prev === newScreens, '내용 비교:', JSON.stringify(prev) === JSON.stringify(newScreens));
            return newScreens;
          });
          return newCounter;
        });
      } else {
        console.log('📺 [실시간] 관리자가 아니므로 화면 상태 업데이트 건너뜀');
      }
    });

    // 화면 공유 요청 수신 (학생용)
    socket.on('shareScreenRequest', (requestData) => {
      console.log('📨 shareScreenRequest 수신:', requestData);
      console.log('🔍 현재 사용자 정보:', { userType, userId: user?.id, userName: user?.name });
      console.log('🎯 요청 대상 학생 ID:', requestData.studentId);
      console.log('💡 조건 확인:', { 
        isStudent: userType === 'student',
        userExists: !!user?.id,
        isTargetStudent: user?.id === requestData.studentId 
      });
      
      if (userType === 'student' && user?.id === requestData.studentId) {
        console.log('✅ 조건 일치! 화면 공유 처리 시작');
        // 더 정확한 현재 상태 감지
        const currentProblemElement = document.querySelector('.problem-title, [data-problem-id]');
        const isProblemView = currentProblemElement || selectedProblem;
        const currentScreen = isProblemView ? 'problem' : 'dashboard';
        
        // DOM에서 문제 정보 추출 시도
        let detectedProblem = selectedProblem;
        if (!detectedProblem && currentProblemElement) {
          const problemIdElement = document.querySelector('[data-problem-id]');
          if (problemIdElement) {
            const problemId = problemIdElement.getAttribute('data-problem-id');
            const problemTitle = currentProblemElement.textContent;
            detectedProblem = {
              id: parseInt(problemId),
              title: problemTitle
            };
          }
        }
        
        // 현재 화면 상태를 관리자에게 전송
        const currentScreenData = {
          studentId: user.id,
          studentName: user.name,
          currentScreen: currentScreen,
          selectedProblem: detectedProblem,
          currentLesson: currentLesson,
          timestamp: new Date().toISOString()
        };
        
        console.log('📺 [요청시] 개선된 화면 공유 응답:', {
          ...currentScreenData,
          detectionMethod: detectedProblem === selectedProblem ? 'state' : 'dom',
          domFound: !!currentProblemElement
        });
        socket.emit('studentScreenUpdate', currentScreenData);
      }
    });

    // 실행 버튼 방식: 관리자가 현재 화면 상태 저장 요청
    socket.on('requestCurrentScreenSave', (data) => {
      console.log('💾 [실행 버튼 방식] 현재 화면 상태 저장 요청 수신:', data);
      
      if (userType === 'student' && user?.id === data.studentId) {
        console.log('✅ [실행 버튼 방식] 조건 일치! 현재 화면 상태를 서버에 저장');
        
        // 현재 화면 상태 데이터
        const currentScreenData = {
          studentId: user.id,
          studentName: user.name,
          currentScreen: selectedProblem ? 'problem' : 'dashboard',
          selectedProblem: selectedProblem,
          code: code,
          currentLesson: currentLesson,
          timestamp: new Date().toISOString()
        };
        
        // 🔄 [수정됨] updateCode 대신 studentScreenUpdate 이벤트로 화면 상태 저장
        console.log('📺 [실행 버튼 방식] studentScreenUpdate 이벤트로 현재 상태 전송');
        socket.emit('studentScreenUpdate', currentScreenData);
        
        // 추가로 코드도 저장 (기존 실행 버튼 호환성)
        if (selectedProblem) {
          console.log('💾 [추가] updateCode로 코드만 별도 저장');
          socket.emit('updateCode', {
            studentId: user.id,
            code: code,
            problemId: selectedProblem.id
          });
        }
        
        console.log('✅ [실행 버튼 방식] 현재 화면 상태 저장 완료:', currentScreenData);
      }
    });

    // 학생 소켓 연결 시 초기 화면 상태 전송
    if (userType === 'student' && user && selectedProblem) {
      setTimeout(() => {
        const initialScreenData = {
          studentId: user.id,
          studentName: user.name,
          currentScreen: selectedProblem ? 'problem' : 'dashboard',
          selectedProblem: selectedProblem,
          currentLesson: currentLesson,
          timestamp: new Date().toISOString()
        };
        
        console.log('📺 [초기] 소켓 연결시 화면 상태 전송:', initialScreenData);
        socket.emit('studentScreenUpdate', initialScreenData);
      }, 1000);
    }

    return () => {
      socket.off('connect');
      socket.off('codeUpdated');
      socket.off('helpRequest');
      socket.off('helpCompleted');
      socket.off('problemUpdated');
      socket.off('studentCodeUpdate');
      socket.off('studentCodeChange');
      socket.off('studentStatusUpdated');
      socket.off('lessonUpdated');
      socket.off('feedbackReceived');
      socket.off('liveMessage');
      socket.off('codeModification');
      socket.off('connectionTestResponse');
      socket.off('studentScreenUpdate');
      socket.off('shareScreenRequest');
      socket.off('allStudentsStatusReset');
      clearInterval(connectionCheckInterval);
    };
  }, [selectedStudent, userType, currentLesson]);

  // 로그인 후 localStorage에서 상태 복원
  React.useEffect(() => {
    if (userType === 'student' && user?.id) {
      console.log('📂 localStorage에서 학생 상태 복원 중...');
      // setIsRestoringState(true); // 복원 시작 - 임시 비활성화
      
      // 현재 차시 복원
      const savedLesson = localStorage.getItem(`student_${user.id}_currentLesson`);
      if (savedLesson) {
        const lessonNum = parseInt(savedLesson);
        console.log('🔄 저장된 차시 복원:', lessonNum);
        setCurrentLesson(lessonNum);
        
        // 차시 복원 후 해당 차시의 문제들 로드
        setTimeout(() => {
          console.log('📚 복원된 차시의 문제들 로드:', lessonNum);
          loadProblems(lessonNum);
          loadProblemStatus();
        }, 100);
      } else {
        // 저장된 차시가 없으면 기본 1차시 로드
        loadProblems(1);
        loadProblemStatus();
        // 저장된 차시가 없어도 복원 상태 해제
        setTimeout(() => {
          setIsRestoringState(false);
        }, 500);
      }
      
      // 선택된 문제 복원 (문제 로드 후) - 즉시 실행
      const savedProblem = localStorage.getItem(`student_${user.id}_selectedProblem`);
        if (savedProblem) {
          try {
            const problemData = JSON.parse(savedProblem);
            console.log('🔄 저장된 문제 복원:', problemData.title);
            setSelectedProblem(problemData);
            
            // 문제 복원 후 해당 문제의 코드도 로드
            console.log('📝 복원된 문제의 코드 로드 시도');
            const storageKey = `student_${user.id}_problem_${problemData.id}_code`;
            const localStorageCode = localStorage.getItem(storageKey);
              
            // problemStatus에서 서버 데이터 확인
            const serverCode = problemStatus[problemData.id]?.code;
            
            // ⭐ 제출한 적이 없는 문제만 스타터 코드 표시, 제출한 적이 있으면 점수 상관없이 제출 코드 표시
            const problemStars = problemStatus[problemData.id]?.stars || 0;
            const hasSubmitted = !!serverCode || !!localStorageCode || !!problemStatus[problemData.id]?.lastSubmittedAt;
            
            let codeToLoad;
            if (!hasSubmitted) {
              console.log('📝 한 번도 제출하지 않은 문제 - 스타터 코드 표시:', { 
                problemId: problemData.id, 
                problemTitle: problemData.title,
                stars: problemStars,
                hasServerCode: !!serverCode,
                hasLocalCode: !!localStorageCode,
                hasSubmissionRecord: !!problemStatus[problemData.id]?.lastSubmittedAt
              });
              codeToLoad = problemData.starterCode || '';
            } else {
              console.log('🔄 제출한 적이 있는 문제 - 제출 코드 복원:', { 
                problemId: problemData.id, 
                problemTitle: problemData.title,
                stars: problemStars,
                hasServerCode: !!serverCode,
                hasLocalCode: !!localStorageCode,
                hasSubmissionRecord: !!problemStatus[problemData.id]?.lastSubmittedAt
              });
              // 제출한 적이 있으면 서버 코드 우선, 없으면 localStorage, 없으면 스타터 코드
              codeToLoad = serverCode || localStorageCode || problemData.starterCode || '';
            }
            
            console.log('📝 로드할 코드:', { 
              서버코드: !!serverCode, 
              로컬코드: !!localStorageCode, 
              스타터코드: !!problemData.starterCode,
              별점수: problemStars,
              제출여부: hasSubmitted,
              최종코드길이: codeToLoad.length 
            });
            
            if (codeToLoad) {
              setCode(codeToLoad);
            }
            setIsRestoringState(false); // 항상 복원 완료 처리
          } catch (e) {
            console.warn('❌ 저장된 문제 데이터 파싱 실패:', e);
            setIsRestoringState(false); // 파싱 실패 시에도 상태 해제
          }
        } else {
          // 저장된 문제가 없는 경우에도 복원 상태 해제
          console.log('📝 저장된 문제 없음, 복원 상태 해제');
          setTimeout(() => {
            setIsRestoringState(false);
          }, 400);
        }
    } // localStorage 복원 로직 종료 
  }, [user?.id, userType]);

  // problemStatus가 로드된 후 선택된 문제의 코드 복원
  React.useEffect(() => {
    if (userType === 'student' && user?.id && selectedProblem && Object.keys(problemStatus).length > 0) {
      console.log('📝 problemStatus 로드 후 코드 복원 시도');
      
      const storageKey = `student_${user.id}_problem_${selectedProblem.id}_code`;
      const localStorageCode = localStorage.getItem(storageKey);
      const serverCode = problemStatus[selectedProblem.id]?.code;
      
      // ⭐ 제출한 적이 없는 문제만 스타터 코드 표시, 제출한 적이 있으면 점수 상관없이 제출 코드 표시
      const problemStars = problemStatus[selectedProblem.id]?.stars || 0;
      const hasSubmitted = !!serverCode || !!localStorageCode || !!problemStatus[selectedProblem.id]?.lastSubmittedAt;
      
      let codeToLoad;
      if (!hasSubmitted) {
        console.log('📝 한 번도 제출하지 않은 문제 - 스타터 코드 표시:', { 
          problemId: selectedProblem.id, 
          problemTitle: selectedProblem.title,
          stars: problemStars,
          hasServerCode: !!serverCode,
          hasLocalCode: !!localStorageCode,
          hasSubmissionRecord: !!problemStatus[selectedProblem.id]?.lastSubmittedAt
        });
        codeToLoad = selectedProblem.starterCode || '';
      } else {
        console.log('🔄 제출한 적이 있는 문제 - 제출 코드 복원:', { 
          problemId: selectedProblem.id, 
          problemTitle: selectedProblem.title,
          stars: problemStars,
          hasServerCode: !!serverCode,
          hasLocalCode: !!localStorageCode,
          hasSubmissionRecord: !!problemStatus[selectedProblem.id]?.lastSubmittedAt
        });
        // 제출한 적이 있으면 서버 코드 우선, 없으면 localStorage, 없으면 스타터 코드
        codeToLoad = serverCode || localStorageCode || selectedProblem.starterCode || '';
      }
      
      console.log('📝 최종 코드 로드:', { 
        문제ID: selectedProblem.id,
        문제제목: selectedProblem.title,
        별점수: problemStars,
        제출여부: hasSubmitted,
        서버코드존재: !!serverCode, 
        서버코드내용: serverCode ? serverCode.substring(0, 50) + '...' : 'null',
        로컬코드존재: !!localStorageCode, 
        로컬코드내용: localStorageCode ? localStorageCode.substring(0, 50) + '...' : 'null',
        스타터코드존재: !!selectedProblem.starterCode,
        스타터코드내용: selectedProblem.starterCode ? selectedProblem.starterCode.substring(0, 50) + '...' : 'null',
        최종코드길이: codeToLoad.length,
        최종코드: codeToLoad.substring(0, 100) + '...',
        현재code상태: code ? code.substring(0, 50) + '...' : 'null'
      });
      
      if (codeToLoad) {
        console.log('🔄 setCode 호출:', codeToLoad.substring(0, 100) + '...');
        setCode(codeToLoad);
        
        // setCode 후 상태 확인
        setTimeout(() => {
          console.log('✅ setCode 완료 후 확인 - 현재 code 상태:', code ? code.substring(0, 100) + '...' : 'null');
        }, 100);
      } else {
        console.log('❌ 로드할 코드가 없음');
      }
    }
  }, [problemStatus, selectedProblem, user?.id, userType]);

  // scanf 입력 처리 후 실행 계속하는 함수
  const continueScanfExecution = async (codeToRun, detectedLanguage, inputs, originalResponse) => {
    try {
      console.log('👤 사용자 입력:', inputs);
      
      const secondResponse = await axios.post(`${API_BASE_URL}/execute`, {
        code: codeToRun,
        language: detectedLanguage,
        inputData: inputs
      });
      
      console.log('입력 포함 실행 응답:', secondResponse.data);
      let output = secondResponse.data.output || '실행 완료';
      
      // 입력값도 출력에 표시
      const inputDisplay = inputs.map((input, index) => 
        `${originalResponse.inputPrompts[index]} ${input}`
      ).join('\n');
      
      // 🖥️ 터미널 스타일 결과 출력 (scanf 프롬프트 제거)
      let cleanOutput = output;
      
      // scanf 프롬프트 텍스트 제거
      originalResponse.inputPrompts.forEach(prompt => {
        cleanOutput = cleanOutput.replace(new RegExp(prompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
      });
      
      // 연속된 콜론 제거
      cleanOutput = cleanOutput.replace(/:{2,}/g, '');
      cleanOutput = cleanOutput.trim();
      
      // Dev-C++ 터미널 완전 재현 - 입력과 출력 모두 표시
      // 각 입력은 새 줄에, 최종 결과도 새 줄에
      const inputLines = inputs.map((input, index) => originalResponse.inputPrompts[index] + input);
      
      const allLines = [
        ...inputLines, // 입력 과정 표시
        cleanOutput    // 최종 printf 결과
      ];

      const terminalOutput = `
        <div style="background: #1e1e1e; color: #d4d4d4; padding: 20px; border: 2px solid #333; border-radius: 8px; font-family: 'Courier New', 'SF Mono', Monaco, monospace; font-size: 14px; min-height: 350px;">
          <div style="color: #888; font-size: 12px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #333;">
            🖥️ Dev-C++ 터미널 - 프로그램 실행 완료
          </div>
          <pre style="margin: 0; padding: 0; font-family: inherit; font-size: inherit; color: inherit; white-space: pre; line-height: 1.6;">${allLines.join('\n')}</pre>
          <div style="color: #666; font-size: 11px; margin-top: 20px; border-top: 1px solid #333; padding-top: 12px;">
            ✅ Process returned 0 (0x0) execution time: ${Math.random() * 0.5 + 0.1}s<br>
            Press any key to continue...
          </div>
        </div>
      `;
      
      setOutput(terminalOutput);
    } catch (error) {
      console.error('입력 처리 후 실행 실패:', error);
      setOutput(`실행 오류: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 로그인 처리
  const handleLogin = async (formData) => {
    try {
      console.log('🔑 로그인 시도:', { formData, apiUrl: `${API_BASE_URL}/login` });
      
      // 네트워크 연결 테스트 먼저 실행
      try {
        await axios.get(`${API_BASE_URL.replace('/api', '')}/`, { timeout: 5000 });
        console.log('✅ 백엔드 서버 연결 확인됨');
      } catch (connectError) {
        console.error('❌ 백엔드 서버 연결 실패:', connectError.message);
        alert('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        return { success: false, message: '서버에 연결할 수 없습니다.' };
      }
      
      const response = await axios.post(`${API_BASE_URL}/login`, formData, {
        timeout: 10000, // 10초 타임아웃
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      console.log('🔑 로그인 응답:', response);
      
      if (response.data.success) {
        console.log('✅ 로그인 성공:', response.data);
        console.log('🔧 [DEBUG] 로그인 후 소켓 상태:', { socket: !!socket, connected: socket?.connected });
        setUser(response.data.user);
        setUserType(response.data.type);
        setIsLoggedIn(true);
        
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', response.data.type);
        
        console.log('설정된 사용자 정보:', { user: response.data.user, type: response.data.type });
        console.log('🚨 [CRITICAL TEST] HTTP API 방식 학생 식별 시스템 활성화!');
        
        // 로그인 후 소켓 식별 정보 전송 (연결이 확실해질 때까지 재시도)
        const sendIdentifyWithRetry = (userData, userTypeData, attempt = 1) => {
          console.log(`🔄 [로그인 후] identify 전송 시도 ${attempt}번째:`, {
            socketExists: !!socket,
            socketConnected: socket?.connected,
            userId: userData?.id,
            userType: userTypeData,
            isAdmin: userTypeData === 'admin'
          });
          
          // 소켓이 없거나 연결되지 않은 경우 재연결 시도
          if (!socket || !socket.connected) {
            console.log('🔌 [로그인 후] 소켓이 연결되지 않음, 재연결 시도 중...');
            // 소켓 강제 재초기화
            socket = initializeSocket();
            
            // 새 소켓 연결 대기
            if (socket) {
              socket.on('connect', () => {
                console.log('🎉 [로그인 후] 소켓 연결 성공, identify 전송!');
                // 관리자는 adminId 사용, 학생은 studentId 사용
                if (userTypeData === 'admin') {
                  console.log('🔍 [관리자 로그인] 서버에 관리자 식별 정보 전송:', {
                    adminId: userData?.username || userData?.id || 'admin',
                    userType: userTypeData
                  });
                  socket.emit('identify', {
                    adminId: userData?.username || userData?.id || 'admin',
                    userType: userTypeData
                  });
                  console.log('✅ [관리자 로그인] identify 이벤트 전송 완료');
                } else if (userData?.id && userTypeData) {
                  console.log('🔍 [학생 로그인] 서버에 학생 식별 정보 전송:', {
                    studentId: userData.id,
                    userType: userTypeData
                  });
                  socket.emit('identify', {
                    studentId: userData.id,
                    userType: userTypeData
                  });
                  console.log('✅ [학생 로그인] identify 이벤트 전송 완료');
                }
              });
            }
            
            if (attempt < 20) { // 재연결을 위해 시도 횟수를 증가
              setTimeout(() => sendIdentifyWithRetry(userData, userTypeData, attempt + 1), 1000);
              return;
            }
          }
          
          // 관리자 식별 처리
          if (socket?.connected && userTypeData === 'admin') {
            console.log('🔍 [관리자 로그인] 서버에 관리자 식별 정보 전송:', {
              adminId: userData?.username || userData?.id || 'admin',
              userType: userTypeData
            });
            socket.emit('identify', {
              adminId: userData?.username || userData?.id || 'admin',
              userType: userTypeData
            });
            console.log('✅ [관리자 로그인] identify 이벤트 전송 완료');
          } 
          // 학생 식별 처리  
          else if (socket?.connected && userData?.id && userTypeData) {
            console.log('🔍 [학생 로그인] 서버에 학생 식별 정보 전송:', {
              studentId: userData.id,
              userType: userTypeData
            });
            socket.emit('identify', {
              studentId: userData.id,
              userType: userTypeData
            });
            console.log('✅ [학생 로그인] identify 이벤트 전송 완료');
          } 
          // 재시도 로직
          else if (attempt < 20) {
            // 최대 20번까지 재시도 (총 10초간)
            setTimeout(() => sendIdentifyWithRetry(userData, userTypeData, attempt + 1), 500);
          } else {
            console.error('❌ [로그인 후] identify 전송 실패 - 최대 재시도 횟수 초과');
          }
        };
        
        // 로그인 후 HTTP API를 통한 학생 식별 (더 확실한 방법)
        const sendIdentifyViaAPI = async (userData, userTypeData) => {
          try {
            console.log('🔍 [HTTP API] 서버에 학생 식별 정보 전송:', {
              studentId: userData.id,
              userType: userTypeData
            });
            
            const identifyResponse = await fetch(`${API_BASE_URL}/identify-student`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                studentId: userData.id,
                userType: userTypeData
              })
            });
            
            const identifyData = await identifyResponse.json();
            if (identifyData.success) {
              console.log('✅ [HTTP API] 학생 식별 성공:', identifyData.message);
            } else {
              console.error('❌ [HTTP API] 학생 식별 실패:', identifyData.message);
            }
          } catch (error) {
            console.error('❌ [HTTP API] 학생 식별 API 호출 실패:', error);
          }
        };
        
        // 로그인 성공 직후 HTTP API를 통한 학생 식별
        if (response.data.type === 'student') {
          sendIdentifyViaAPI(response.data.user, response.data.type);
        }
        
        // 기존 소켓 방식도 병행 (백업용)
        sendIdentifyWithRetry(response.data.user, response.data.type);
        
        if (response.data.type === 'admin') {
          loadStudents();
          loadAllStudentsCodes(); // 모든 학생 코드 미리 로드
          loadProblems();
          loadLessons();
          loadHelpRequests(); // 미해결 도움 요청 로드
        } else {
          setCurrentTab('student');
          loadProblems();
          loadProblemStatus();
          loadLessons();
          loadLatestFeedback();
          loadLiveMessages(response.data.user.id); // 실시간 메시지 로드
        }
        
        return { success: true };
      } else {
        console.log('❌ 로그인 실패:', response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('🚨 로그인 중 오류 발생:', error);
      console.error('🚨 오류 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      return { success: false, message: `로그인 중 오류가 발생했습니다: ${error.message}` };
    }
  };

  // 로그아웃
  const handleLogout = () => {
    console.log('🚪 로그아웃 시작:', { userId: user?.id, userType });
    
    // 학생이 로그아웃할 때 서버에 상태 업데이트 요청
    if (userType === 'student' && user && socket && socket.connected) {
      console.log('📤 학생 로그아웃 상태를 서버에 전송');
      socket.emit('studentLogout', { 
        studentId: user.id,
        studentName: user.name 
      });
      
      // 소켓 연결 해제
      socket.disconnect();
      console.log('🔌 소켓 연결 해제됨');
    }
    
    setIsLoggedIn(false);
    setUser(null);
    setUserType(null);
    setStudents([]);
    setSelectedStudent(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    
    console.log('✅ 로그아웃 완료');
  };

  // 모든 학생 상태를 offline으로 초기화
  const resetAllStudentStatus = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('모든 학생의 상태를 offline으로 변경하시겠습니까?')) {
      return;
    }
    
    try {
      console.log('🔄 모든 학생 상태 초기화 요청 전송');
      const response = await fetch(`${API_BASE_URL}/admin/reset-student-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('✅ 학생 상태 초기화 성공:', result.message);
        alert(result.message);
      } else {
        console.error('❌ 학생 상태 초기화 실패:', result.error);
        alert('상태 초기화에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('❌ 학생 상태 초기화 오류:', error);
      alert('상태 초기화 중 오류가 발생했습니다.');
    }
  };

  // 학생 화면 상태 업데이트 전송 (개선된 버전)
  const sendStudentScreenUpdate = useCallback((screenType, extraData = {}) => {
    if (userType === 'student' && user && socket?.connected) {
      const screenData = {
        studentId: user.id,
        studentName: user.name,
        currentScreen: screenType,
        selectedProblem: selectedProblem || extraData.selectedProblem,
        currentLesson: currentLesson,
        timestamp: new Date().toISOString(),
        ...extraData
      };
      
      console.log('📺 [자동] 학생 화면 상태 전송:', screenData);
      socket.emit('studentScreenUpdate', screenData);
    }
  }, [userType, user, socket, selectedProblem, currentLesson]);

  // 학생 상태 자동 전송 (문제 변경 시)
  useEffect(() => {
    if (userType === 'student' && user && socket?.connected && selectedProblem) {
      const screenData = {
        studentId: user.id,
        studentName: user.name,
        currentScreen: 'problem',
        selectedProblem: selectedProblem,
        code: code, // 🔄 [수정됨] 현재 코드도 포함
        currentLesson: currentLesson,
        timestamp: new Date().toISOString()
      };
      
      console.log('📺 [자동] 문제 변경시 화면 상태 전송 (코드 포함):', screenData);
      socket.emit('studentScreenUpdate', screenData);
    }
  }, [selectedProblem, userType, user, socket, currentLesson, code]);

  // 관리자가 학생 화면 보기 요청 (직접 API 방식)
  const requestStudentScreen = async (studentId) => {
    if (userType === 'admin' && user) {
      console.log('👀 [실행 버튼 방식] 학생 화면 보기 요청:', studentId);
      
      try {
        // 1단계: 학생에게 현재 화면 상태를 서버에 저장하도록 요청
        console.log('📡 학생에게 현재 화면 상태 저장 요청:', studentId);
        if (socket && socket.connected) {
          socket.emit('forceStudentScreenSave', { studentId });
        }
        
        // 2단계: 여러 번 시도하여 최신 데이터 가져오기
        let attempts = 0;
        const maxAttempts = 3;
        const attemptDelay = 300; // 0.3초
        
        const fetchLatestScreen = async () => {
          attempts++;
          console.log(`🔄 [실행 버튼 방식] API 호출 시도 ${attempts}/${maxAttempts}`);
          
          try {
            const response = await fetch(`${API_BASE_URL}/admin/student/${studentId}/current-screen`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            const data = await response.json();
            
            if (data.success && data.screenData) {
              console.log('✅ [실행 버튼 방식] 학생 화면 상태 수신:', data.screenData);
              
              // 받은 화면 상태를 studentScreens에 즉시 적용
              setStudentScreens(prev => ({
                ...prev,
                [studentId]: data.screenData
              }));
              
              // selectedProblem이 객체인 경우 title 추출
              const problemTitle = data.screenData.selectedProblem?.title || 
                                  data.screenData.selectedProblem || 
                                  '대시보드';
              
              alert(`📺 ${data.screenData.studentName || '학생'}의 화면 상태를 확인했습니다!\n현재 화면: ${problemTitle}`);
              return; // 성공하면 종료
            } 
          } catch (error) {
            console.error(`❌ [실행 버튼 방식] API 호출 ${attempts} 실패:`, error);
          }
          
          // 실패했고 재시도 가능한 경우
          if (attempts < maxAttempts) {
            console.log(`⏳ ${attemptDelay}ms 후 재시도...`);
            setTimeout(fetchLatestScreen, attemptDelay);
          } else {
            console.log('⚠️ [실행 버튼 방식] 모든 시도 실패');
            alert('해당 학생이 현재 온라인이 아니거나 문제를 선택하지 않았습니다.');
          }
        };
        
        // 첫 시도는 즉시 실행
        setTimeout(fetchLatestScreen, 200);
        
      } catch (error) {
        console.error('❌ [실행 버튼 방식] 학생 화면 상태 조회 실패:', error);
        alert('학생 화면 상태를 가져오는 중 오류가 발생했습니다.');
      }
    }
  };

  // 코드 초기화 (스타터 코드로 복원)
  const resetCode = () => {
    if (selectedProblem && selectedProblem.starterCode) {
      console.log('🔄 코드 초기화 실행:', { 
        problemId: selectedProblem.id, 
        problemTitle: selectedProblem.title,
        starterCode: selectedProblem.starterCode?.substring(0, 50) + '...'
      });
      setCode(selectedProblem.starterCode);
      
      // localStorage에서도 초기화된 코드 저장
      if (user?.id) {
        const storageKey = `student_${user.id}_problem_${selectedProblem.id}_code`;
        localStorage.setItem(storageKey, selectedProblem.starterCode);
      }
    } else {
      console.log('⚠️ 초기화 실패: 선택된 문제나 스타터 코드가 없음');
      alert('초기화할 스타터 코드가 없습니다.');
    }
  };

  // 코드 실행 (scanf 입력 지원)
  const runCode = async (inputData = null) => {
    setIsRunning(true);
    const codeToRun = userType === 'student' ? code : (selectedStudent?.code || '');
    
    // 🔄 실행 시에만 서버에 코드 저장 (실시간 자동저장 대신)
    if (userType === 'student' && selectedProblem && code && code.trim()) {
      console.log('💾 실행 시 서버에 코드 저장:', { problemId: selectedProblem.id, codeLength: code.length });
      updateCode(code, false); // 서버 저장
    }
    
    console.log('코드 실행 시도:', { codeLength: codeToRun.length, hasInput: !!inputData });
    
    if (!codeToRun.trim()) {
      setOutput('실행할 코드가 없습니다.');
      setIsRunning(false);
      return;
    }
    
    try {
      // 언어 자동 감지
      let detectedLanguage = 'python';
      if (codeToRun.includes('#include') || codeToRun.includes('printf') || codeToRun.includes('int main')) {
        detectedLanguage = 'c';
      }
      
      const response = await axios.post(`${API_BASE_URL}/execute`, {
        code: codeToRun,
        language: detectedLanguage,
        inputData: inputData
      });
      
      console.log('코드 실행 응답:', response.data);
      
      // scanf 입력이 필요한 경우
      if (!response.data.success && response.data.needsInput) {
        console.log('📥 scanf 입력 필요:', response.data.inputPrompts);
        
        // 🖥️ Dev-C++ 터미널 완전 재현
        let currentInputIndex = 0;
        const inputs = [];
        let terminalDisplay = [];

        const showRealTerminal = () => {
          // 터미널 표시 - scanf는 Enter로 줄바꿈, printf는 \n 없으면 연결
          const currentPrompt = response.data.inputPrompts[currentInputIndex];

          setOutput(`
            <div style="background: #1e1e1e; color: #d4d4d4; padding: 20px; border: 2px solid #333; border-radius: 8px; font-family: 'Courier New', 'SF Mono', Monaco, monospace; font-size: 14px; min-height: 350px; position: relative;">
              <div style="color: #888; font-size: 12px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #333;">
                🖥️ Dev-C++ 터미널 - 프로그램 실행 중...
              </div>
              <pre style="margin: 0; padding: 0; font-family: inherit; font-size: inherit; color: inherit; white-space: pre; line-height: 1.6;">${terminalDisplay.join('\n')}
<span style="color: #d4d4d4;">${currentPrompt}</span><input 
                  type="text" 
                  id="terminal-input" 
                  style="
                    background: transparent; 
                    border: none; 
                    outline: none; 
                    color: #00ff41; 
                    font-family: inherit; 
                    font-size: inherit; 
                    margin: 0;
                    padding: 0;
                    width: 150px;
                    height: 18px;
                    vertical-align: baseline;
                  " 
                  autocomplete="off"
                /><span style="color: #00ff41; animation: blink 1s infinite;">_</span></pre>
              <div style="color: #666; font-size: 11px; position: absolute; bottom: 12px; right: 20px;">
                Enter: 입력 완료 | Esc: 프로그램 종료
              </div>
              <style>
                @keyframes blink {
                  0%, 50% { opacity: 1; }
                  51%, 100% { opacity: 0; }
                }
              </style>
            </div>
          `);

          // 입력 포커스 및 이벤트 처리
          setTimeout(() => {
            const input = document.getElementById('terminal-input');
            if (input) {
              input.focus();
              input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                  const value = input.value || '';
                  inputs.push(String(value));
                  
                  // Dev-C++처럼: scanf는 Enter로 줄바꿈 (현재 줄에 입력값 표시 후 새 줄로 이동)
                  terminalDisplay.push(response.data.inputPrompts[currentInputIndex] + value);
                  
                  currentInputIndex++;
                  
                  if (currentInputIndex < response.data.inputPrompts.length) {
                    // 다음 입력으로 이동
                    showRealTerminal();
                  } else {
                    // 모든 입력 완료 - 결과 처리
                    setOutput(`
                      <div style="background: #000000; color: #ffffff; padding: 16px; border-radius: 8px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace; font-size: 14px; min-height: 200px;">
                        ${terminalDisplay.map(line => `<div style="margin: 0; padding: 0; line-height: 1.4; white-space: nowrap;">${line}</div>`).join('')}
                        <div style="color: #888; margin-top: 8px;">처리 중...</div>
                      </div>
                    `);
                    continueScanfExecution(codeToRun, detectedLanguage, inputs, response.data);
                  }
                } else if (e.key === 'Escape') {
                  setOutput('코드 실행이 취소되었습니다.');
                  setIsRunning(false);
                }
              };
            }
          }, 100);
        };

        // 터미널 시작
        showRealTerminal();
        
        return; // 여기서 중단하고 사용자 입력 대기
        const secondResponse = await axios.post(`${API_BASE_URL}/execute`, {
          code: codeToRun,
          language: detectedLanguage,
          inputData: inputs
        });
        
        console.log('입력 포함 실행 응답:', secondResponse.data);
        let output = secondResponse.data.output || '실행 완료';
        
        // 입력값도 출력에 표시
        const inputDisplay = inputs.map((input, index) => 
          `${response.data.inputPrompts[index]} ${input}`
        ).join('\n');
        
        output = `입력:\n${inputDisplay}\n\n출력:\n${output}`;
        
        // 백엔드에서 온 특수 마커를 HTML로 변환
        output = output.replace(/###NEWLINE###/g, '<br>');
        output = output.replace(/###TAB###/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        output = output.replace(/###CARRIAGE###/g, '');
        output = output.replace(/\n/g, '<br>');
        
        setOutput(output);
      } else {
        // 일반 실행 (입력이 필요 없거나 이미 있는 경우)
        let output = response.data.output || '실행 완료';
        
        // 백엔드에서 온 특수 마커를 HTML로 변환
        output = output.replace(/###NEWLINE###/g, '<br>');
        output = output.replace(/###TAB###/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        output = output.replace(/###CARRIAGE###/g, '');
        
        setOutput(output);
      }
    } catch (error) {
      console.error('코드 실행 실패:', error);
      setOutput(`실행 오류: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsRunning(false);
      
      // 🔄 학생이 실행 버튼을 눌렀을 때 자동으로 화면 상태 전송 (기존 기능 복구)
      if (userType === 'student' && user && selectedProblem) {
        const currentScreenData = {
          studentId: user.id,
          studentName: user.name,
          selectedProblem: selectedProblem,
          code: code,
          currentLesson: currentLesson,
          timestamp: new Date().toISOString()
        };
        
        console.log('🔍 [DEBUG] runCode finally block - 화면 상태 전송 시도');
        console.log('🔍 [DEBUG] Socket 상태 체크:', {
          hasSocket: !!socket,
          isConnected: socket?.connected,
          socketId: socket?.id,
          userType: userType,
          userId: user?.id,
          userName: user?.name,
          problemId: selectedProblem?.id,
          problemTitle: selectedProblem?.title,
          codeLength: code?.length
        });
        
        if (socket && socket.connected) {
          console.log('📺 [실행 버튼] 자동으로 화면 상태 전송:', currentScreenData);
          console.log('🚀 [DEBUG] studentScreenUpdate 이벤트 전송 중...');
          
          // 이벤트 전송 성공/실패 추적을 위한 추가 로깅
          socket.emit('studentScreenUpdate', currentScreenData);
          console.log('✅ [DEBUG] socket.emit() 호출 완료');
          
          // 📊 진도 업데이트: 학생이 실행 버튼을 누를 때마다 현재 문제를 진도에 반영
          try {
            console.log('📊 [진도 업데이트] 현재 문제를 진도에 반영 시도:', selectedProblem.title);
            const progressResponse = await axios.put(`${API_BASE_URL}/students/${user.id}/progress`, {
              currentProblem: selectedProblem.title,
              problemId: selectedProblem.id,
              timestamp: new Date().toISOString()
            });
            console.log('✅ [진도 업데이트] 성공:', progressResponse.data);
          } catch (progressError) {
            console.error('❌ [진도 업데이트] 실패:', progressError);
          }
          
          // 소켓 에러 발생 시 로깅
          socket.on('error', (error) => {
            console.error('❌ [DEBUG] Socket 에러 발생:', error);
          });
          
          // 연결 해제 시 로깅
          socket.on('disconnect', (reason) => {
            console.warn('🔌 [DEBUG] Socket 연결 해제:', reason);
          });
          
        } else {
          console.error('❌ [DEBUG] Socket이 연결되지 않음:', {
            hasSocket: !!socket,
            isConnected: socket?.connected,
            socketId: socket?.id
          });
        }
      } else {
        console.log('🔍 [DEBUG] 화면 상태 전송 조건 미충족:', {
          userType: userType,
          hasUser: !!user,
          hasSelectedProblem: !!selectedProblem
        });
      }
    }
  };

  // 학생 추가
  const addStudent = async (studentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/students`, studentData);
      setStudents(prev => [...prev, response.data]);
      setShowAddStudent(false);
      loadStudents(); // 새로고침
    } catch (error) {
      alert('학생 추가에 실패했습니다.');
    }
  };

  // 학생 수정
  const editStudent = async (studentData) => {
    try {
      await axios.put(`${API_BASE_URL}/students/${editingStudent.id}`, studentData);
      setShowEditStudent(false);
      setEditingStudent(null);
      loadStudents(); // 새로고침
    } catch (error) {
      alert('학생 수정에 실패했습니다.');
    }
  };

  // 학생 삭제
  const deleteStudent = async (studentId) => {
    if (window.confirm('정말로 이 학생을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`${API_BASE_URL}/students/${studentId}`);
        setStudents(prev => prev.filter(s => s.id !== studentId));
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent(null);
        }
      } catch (error) {
        alert('학생 삭제에 실패했습니다.');
      }
    }
  };

  // 도움 요청
  const requestHelp = () => {
    console.log('🔥 requestHelp 호출됨:', { 
      user: user?.name, 
      userType, 
      selectedProblem: selectedProblem?.title,
      hasSocket: !!socket
    });
    
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (userType !== 'student') {
      alert('학생만 도움을 요청할 수 있습니다.');
      return;
    }
    
    if (!selectedProblem) {
      alert('문제를 먼저 선택해주세요.');
      return;
    }
    
    const message = prompt('어려운 점을 설명해주세요:');
    if (message && message.trim()) {
      sendHelpRequest(message.trim());
    }
  };

  // 도움 요청 메시지 전송 (HTTP API 방식)
  const sendHelpRequest = async (message) => {
    console.log('🚨 sendHelpRequest 호출됨:', { message, user: user?.name, selectedProblem: selectedProblem?.title });
    
    if (!user || !selectedProblem) {
      console.error('❌ 도움 요청 전송 실패: user 또는 selectedProblem이 없음');
      alert('로그인 정보나 문제 선택이 필요합니다.');
      return;
    }
    
    const helpRequest = {
      studentId: user.id,
      studentName: user.name || user.username,
      problemId: selectedProblem.id,
      problemTitle: selectedProblem.title,
      message: message,
      code: code,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔥 HTTP API로 도움 요청 전송:', helpRequest);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/help-request`, helpRequest);
      console.log('✅ 도움 요청 전송 성공:', response.data);
      alert('도움 요청이 선생님에게 전송되었습니다! 🚨');
    } catch (error) {
      console.error('❌ 도움 요청 전송 에러:', error);
      alert('도움 요청 전송 중 오류가 발생했습니다.');
    }
  };

  // 도움 완료
  const handleHelp = (studentId) => {
    socket.emit('helpCompleted', studentId);
  };

  // 도움 요청 해결
  const resolveHelpRequest = async (requestId) => {
    try {
      await axios.put(`${API_BASE_URL}/help-requests/${requestId}/resolve`);
      console.log('✅ 도움 요청 해결 처리 완료:', requestId);
      
      // UI에서 상태만 업데이트 (제거하지 않음)
      setHelpRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'resolved' } : req
      ));
    } catch (error) {
      console.error('도움 요청 해결 처리 실패:', error);
      alert('해결 처리 중 오류가 발생했습니다.');
    }
  };

  // 도움 요청 삭제
  const deleteHelpRequest = async (requestId) => {
    try {
      await axios.delete(`${API_BASE_URL}/help-requests/${requestId}`);
      console.log('🗑️ 도움 요청 삭제 완료:', requestId);
      
      // UI에서 제거
      setHelpRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('도움 요청 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };


  // 학생 실시간 메시지 로드 (무한 루프 방지)
  const loadLiveMessages = useCallback(async (studentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/live-messages/${studentId}`);
      console.log('📋 학생 실시간 메시지 로드:', response.data);
      setLiveMessages(response.data);
    } catch (error) {
      console.error('실시간 메시지 로드 실패:', error);
    }
  }, []);

  // 실시간 메시지 전송 (관리자 → 학생)
  const sendLiveMessage = async () => {
    console.log('🔥 sendLiveMessage 호출됨:', { 
      selectedStudent: selectedStudent?.id, 
      user: user, 
      userId: user?.id,
      userType,
      message: liveMessageInput.trim() 
    });

    if (!selectedStudent || !liveMessageInput.trim() || !user) {
      alert('학생을 선택하고 메시지를 입력해주세요.');
      return;
    }

    const messageData = {
      studentId: selectedStudent.id,
      adminId: user.id,
      message: liveMessageInput.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/live-message`, messageData);
      console.log('✅ 실시간 메시지 전송 성공:', response.data);
      
      // 관리자가 보낸 메시지 목록에 추가
      const sentMessage = {
        ...messageData,
        id: response.data.id,
        studentName: selectedStudent.name
      };
      setSentMessages(prev => [sentMessage, ...prev]);
      
      setLiveMessageInput(''); // 입력창 비우기
      alert('학생에게 실시간 메시지가 전송되었습니다! 💬');
    } catch (error) {
      console.error('❌ 실시간 메시지 전송 실패:', error);
      alert('메시지 전송 중 오류가 발생했습니다.');
    }
  };

  // 실시간 메시지 삭제 함수
  const deleteLiveMessage = async (messageId) => {
    if (!window.confirm('이 메시지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/live-messages/${messageId}`);
      console.log('✅ 실시간 메시지 삭제 성공:', response.data);
      
      // 메시지 목록에서 제거
      setSentMessages(prev => prev.filter(msg => msg.id !== messageId));
      alert('메시지가 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 실시간 메시지 삭제 실패:', error);
      alert('메시지 삭제 중 오류가 발생했습니다.');
    }
  };

  // 관리자용 학생 코드 업데이트 함수
  const updateStudentCode = (newCode) => {
    if (!selectedStudent) return;
    
    console.log('🔧 관리자가 학생 코드 수정:', { studentId: selectedStudent.id, codeLength: newCode.length });
    
    // 선택된 학생의 코드 업데이트
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === selectedStudent.id 
          ? { ...student, code: newCode }
          : student
      )
    );
    
    // selectedStudent 상태도 업데이트
    setSelectedStudent(prev => ({ ...prev, code: newCode }));
  };

  // 코드 수정사항 전송 (관리자 → 학생)
  const sendCodeModification = async () => {
    if (!selectedStudent || !user) {
      alert('학생을 선택해주세요.');
      return;
    }

    // 원본 코드와 현재 코드 비교하여 수정사항 찾기
    const currentCode = selectedStudent.code || '';
    console.log('🚨 sendCodeModification 호출:', {
      hasOriginalCode: !!originalCode,
      originalCodeLength: originalCode?.length || 0,
      originalCodePreview: originalCode?.substring(0, 50) || 'EMPTY',
      currentCodeLength: currentCode.length,
      currentCodePreview: currentCode.substring(0, 50)
    });
    
    const modifications = findCodeDifferences(originalCode, currentCode);
    
    if (modifications.length === 0) {
      alert('수정사항이 없습니다.');
      return;
    }

    const modificationData = {
      studentId: selectedStudent.id,
      adminId: user.id,
      originalCode: originalCode,
      modifiedCode: currentCode,
      modifications: modifications,
      timestamp: new Date().toISOString()
    };

    console.log('🔧 코드 수정사항 전송:', modificationData);

    try {
      const response = await axios.post(`${API_BASE_URL}/code-modification`, modificationData);
      console.log('✅ 코드 수정사항 전송 성공:', response.data);
      
      setOriginalCode(currentCode); // 새로운 원본 코드로 업데이트
      setHasModifications(false); // 수정사항 플래그 리셋
      
      // 실제 변경사항이 있으면 항상 "1줄 수정"으로 표시 (간단명료)
      const hasChanges = modifications.length > 0;
      
      if (hasChanges) {
        alert(`선생님이 코드를 수정했습니다! 🔧 (1줄 수정)`);
      }
    } catch (error) {
      console.error('❌ 코드 수정사항 전송 실패:', error);
      alert('코드 수정사항 전송 중 오류가 발생했습니다.');
    }
  };

  // 코드 차이점 찾기 함수 (스마트 diff 버전)
  const findCodeDifferences = (original, modified) => {
    // Windows 줄바꿈 문자 정규화
    const normalizeCode = (code) => code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    const originalLines = normalizeCode(original || '').split('\n');
    const modifiedLines = normalizeCode(modified || '').split('\n');
    
    console.log('🔍 Diff 분석:', {
      originalLength: originalLines.length,
      modifiedLength: modifiedLines.length,
      originalPreview: originalLines.slice(0, 3).map(l => `"${l}"`),
      modifiedPreview: modifiedLines.slice(0, 3).map(l => `"${l}"`)
    });
    
    // LCS를 사용한 스마트 diff
    const changes = getSmartDiff(originalLines, modifiedLines);
    
    console.log('🎯 최종 수정사항:', changes);
    
    return changes;
  };

  // 정확한 라인별 diff 계산 - 실제 수정된 줄만 정확히 찾기
  const getSmartDiff = (originalLines, modifiedLines) => {
    const actualChanges = [];
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    console.log('🔍 라인별 Diff 비교 시작:', {
      originalLines: originalLines.length,
      modifiedLines: modifiedLines.length
    });
    
    // 라인별로 정확히 비교
    for (let i = 0; i < maxLines; i++) {
      const originalLine = (originalLines[i] || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const modifiedLine = (modifiedLines[i] || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      // 실제 내용이 다른지 확인 (공백 제거하고 비교)
      const originalTrimmed = originalLine.trim();
      const modifiedTrimmed = modifiedLine.trim();
      
      if (originalTrimmed !== modifiedTrimmed) {
        console.log(`📝 라인 ${i + 1} 변경 감지:`, {
          original: `"${originalTrimmed}"`,
          modified: `"${modifiedTrimmed}"`
        });
        
        if (originalTrimmed && modifiedTrimmed) {
          // 수정된 줄
          actualChanges.push({
            type: 'modified',
            lineNumber: i + 1,
            original: originalLine,
            modified: modifiedLine
          });
        } else if (modifiedTrimmed && !originalTrimmed) {
          // 추가된 줄
          actualChanges.push({
            type: 'added',
            lineNumber: i + 1,
            original: '',
            modified: modifiedLine
          });
        } else if (originalTrimmed && !modifiedTrimmed) {
          // 삭제된 줄
          actualChanges.push({
            type: 'deleted',
            lineNumber: i + 1,
            original: originalLine,
            modified: ''
          });
        }
      }
    }
    
    console.log('🎯 최종 변경사항:', actualChanges.map(c => `라인 ${c.lineNumber}: ${c.type}`));
    return actualChanges;
  };

  // LCS (Longest Common Subsequence) 계산
  const getLCS = (arr1, arr2) => {
    const m = arr1.length;
    const n = arr2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i-1].trim() === arr2[j-1].trim()) {
          dp[i][j] = dp[i-1][j-1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
      }
    }
    
    return dp;
  };

  // LCS 결과로부터 실제 diff 생성
  const getDiffFromLCS = (original, modified, lcs) => {
    const result = [];
    let i = original.length;
    let j = modified.length;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && original[i-1].trim() === modified[j-1].trim()) {
        // 동일한 줄
        i--;
        j--;
      } else if (i > 0 && (j === 0 || lcs[i-1][j] >= lcs[i][j-1])) {
        // 삭제된 줄
        if (original[i-1].trim() !== '') {
          result.unshift({
            lineNumber: i,
            content: original[i-1],
            type: 'deleted'
          });
        }
        i--;
      } else {
        // 추가된 줄
        if (modified[j-1].trim() !== '') {
          result.unshift({
            lineNumber: j,
            content: modified[j-1],
            type: 'added'
          });
        }
        j--;
      }
    }
    
    return result;
  };

  // 코드 업데이트 (실시간 자동저장 비활성화)
  const updateCode = (newCode, isUserInput = false, targetProblemId = null) => {
    // 로컬 상태 업데이트
    setCode(newCode);
    
    if (isUserInput) {
      console.log('📝 학생 코드 변경, 서버에 저장 및 실시간 전송');
      
      // 🔥 학생이 코드를 입력할 때 멘토에게 실시간 전송
      if (userType === 'student' && user && selectedProblem && socket && socket.connected) {
        console.log('📡 학생 코드 변경을 멘토에게 실시간 전송');
        console.log('📋 전송 데이터:', {
          studentId: user.id,
          studentName: user.name,
          problemId: selectedProblem.id,
          codeLength: newCode.length,
          socketConnected: socket.connected
        });
        
        socket.emit('studentCodeChange', {
          studentId: user.id,
          studentName: user.name,
          problemId: selectedProblem.id,
          code: newCode,
          timestamp: new Date().toISOString()
        });
        
        console.log('✅ 실시간 코드 변경 신호 전송 완료');
      } else {
        console.log('⚠️ 실시간 코드 전송 조건 불만족:', {
          userType,
          hasUser: !!user,
          hasSelectedProblem: !!selectedProblem,
          hasSocket: !!socket,
          socketConnected: socket?.connected
        });
      }
      
      // 로컬 상태 업데이트
      if (selectedProblem?.id) {
        setProblemCodes(prev => ({ ...prev, [selectedProblem.id]: newCode }));
      }
      
      // 서버에도 저장 (디바운스 적용)
      if (userType === 'student' && user && selectedProblem && socket && socket.connected) {
        console.log('💾 서버에 코드 저장:', { problemId: selectedProblem.id, codeLength: newCode.length });
        socket.emit('updateCode', {
          studentId: user.id,
          code: newCode,
          problemId: selectedProblem.id
        });
      } else if (userType === 'student') {
        console.log('⚠️ 소켓 연결 안됨:', { hasUser: !!user, hasSelectedProblem: !!selectedProblem, hasSocket: !!socket, socketConnected: socket?.connected });
      }
      return;
    }
    
    // 🚨 중요: 현재 시점의 selectedProblem을 즉시 캡처 (상태 경합 방지)
    const currentSelectedProblem = selectedProblem;
    const problemId = targetProblemId || currentSelectedProblem?.id;
    console.log('🔥🔥🔥 updateCode 호출됨:', { 
      newCode: newCode?.substring(0, 30) + '...', 
      userType, 
      userId: user?.id, 
      selectedStudent: selectedStudent?.id, 
      selectedProblemTitle: selectedProblem?.title,
      selectedProblemId: selectedProblem?.id, 
      targetProblemId, 
      finalProblemId: problemId, 
      isUserInput,
      stackTrace: new Error().stack.split('\n').slice(1, 3).join(' | ')
    });
    if (userType === 'student' && user && problemId) {
      // 🚨 중요: 유효한 문제 ID인지 확인
      const validProblem = problems.find(p => p.id === problemId);
      if (!validProblem) {
        console.error('❌ 유효하지 않은 problemId:', problemId, '유효한 문제들:', problems.map(p => p.id));
        return;
      }
      
      // 🚨 비정상적인 내용 차단 (URL이나 이상한 문자열)
      if (isUserInput && newCode && (
        newCode.includes('http://') || 
        newCode.includes('https://') || 
        newCode.includes('localhost') ||
        newCode.length > 5000 // 너무 긴 코드
      )) {
        console.error('🚫 비정상적인 코드 입력 차단:', { problemId, code: newCode.substring(0, 100) });
        return;
      }
      
      // 🚨 내용 중복 검사: 같은 내용을 같은 문제에 중복 저장 방지
      const lastContent = lastUpdateContent[problemId];
      if (isUserInput && lastContent === newCode) {
        console.log('🔄 동일한 내용 중복 저장 방지:', { problemId, contentLength: newCode?.length });
        return;
      }
      
      // 🚨 디바운싱: 너무 빠른 연속 호출 방지 (같은 문제에 대해서만)
      const now = Date.now();
      const lastTime = lastUpdateTime[problemId] || 0;
      if (isUserInput && now - lastTime < 500) { // 500ms 이내 중복 호출 방지 (매우 엄격하게)
        console.log('⏱️ 너무 빠른 연속 호출 무시:', { problemId, timeDiff: now - lastTime });
        return;
      }
      
      // 상태 업데이트
      setLastUpdateTime(prev => ({ ...prev, [problemId]: now }));
      setLastUpdateContent(prev => ({ ...prev, [problemId]: newCode }));
      
      // 현재 문제의 코드만 업데이트
      if (!targetProblemId) {
        setCode(newCode);  // 현재 선택된 문제일 때만 UI 업데이트
      }
      setProblemCodes(prev => ({ ...prev, [problemId]: newCode }));
      
      
      // 🔒 최종 검증: 현재 선택된 문제와 일치하는지 확인
      if (!targetProblemId && currentSelectedProblem?.id !== problemId) {
        console.error('🚫 상태 불일치 감지! 저장 중단:', { 
          현재선택된문제: currentSelectedProblem?.id, 
          저장하려는문제: problemId,
          targetProblemId 
        });
        return;
      }
      
      const payload = { studentId: user.id, code: newCode, problemId: problemId };
      console.log('🔄 [학생] socket.emit updateCode:', { 
        studentId: payload.studentId, 
        problemId: payload.problemId, 
        problemTitle: validProblem.title, 
        hasCode: !!payload.code, 
        isUserInput, 
        targetProblemId,
        현재선택된문제: currentSelectedProblem?.id
      });
      if (socket && socket.connected) {
        socket.emit('updateCode', payload);
      } else {
        console.log('⚠️ 소켓이 연결되지 않아 updateCode 전송 실패');
      }
    } else if (userType === 'admin' && selectedStudent) {
      // 관리자가 타이핑할 때는 로컬 상태만 업데이트 (실시간 전송 안 함)
      setSelectedStudent(prev => ({ ...prev, code: newCode }));
      console.log('🔧 [관리자] 로컬 코드 업데이트만 수행 (실시간 전송 안 함):', { studentId: selectedStudent.id, codeLength: newCode.length });
    } else {
      console.log('updateCode 조건 불만족:', { userType, hasUser: !!user, hasSelectedStudent: !!selectedStudent, hasSelectedProblem: !!selectedProblem });
    }
  };

  // 반별 통계 계산
  const getClassStats = () => {
    const stats = {};
    classOptions.slice(1).forEach(className => {
      stats[className] = students.filter(s => s.class === className).length;
    });
    return stats;
  };

  // 로그인 체크 (render에서 처리)

  const classStats = userType === 'admin' && currentTab === 'mentor' ? getClassStats() : {};

  // 누적 점수 계산 함수 (전체)
  const getCumulativeScore = () => {
    if (userType !== 'student' || !problemStatus) return 0;
    let totalScore = 0;
    Object.entries(problemStatus).forEach(([problemId, status]) => {
      // stars 필드에서 점수를 가져옴 (score 대신 stars 사용)
      if (status && typeof status.stars === 'number') {
        totalScore += status.stars;
      }
    });
    return totalScore;
  };

  // 특정 차시 점수 계산 함수
  const getLessonScore = (lessonNumber) => {
    if (userType !== 'student' || !problemStatus || !problems) return 0;
    let lessonScore = 0;
    problems.forEach(problem => {
      if (problem.lesson === lessonNumber && problemStatus[problem.id]) {
        const status = problemStatus[problem.id];
        if (status && typeof status.stars === 'number') {
          lessonScore += status.stars;
        }
      }
    });
    return lessonScore;
  };

  // 로그인 체크
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* 헤더 */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                로앤코로봇코딩 멘토링 플랫폼
              </h1>
              <span style={{ fontSize: '16px', color: '#6b7280' }}>
                {userType === 'admin' ? `관리자: ${user?.username}` : `학생: ${user?.name} (${user?.studentId})`}
              </span>
              
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {userType === 'admin' && (
                <>
                  <button
                    onClick={() => setCurrentTab('mentor')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: currentTab === 'mentor' ? '#2563eb' : '#f3f4f6',
                      color: currentTab === 'mentor' ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    👥 멘토 뷰
                  </button>
                  <button
                    onClick={() => setCurrentTab('problems')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: currentTab === 'problems' ? '#2563eb' : '#f3f4f6',
                      color: currentTab === 'problems' ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    📝 문제 관리
                  </button>
                  <button
                    onClick={() => setCurrentTab('student')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: currentTab === 'student' ? '#2563eb' : '#f3f4f6',
                      color: currentTab === 'student' ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    👁️ 학생 뷰
                  </button>
                  <button
                    onClick={() => setCurrentTab('game')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: currentTab === 'game' ? '#2563eb' : '#f3f4f6',
                      color: currentTab === 'game' ? 'white' : '#374151',
                      cursor: 'pointer'
                    }}
                  >
                    🎮 게임맵
                  </button>
                </>
              )}
              {userType === 'student' && (
                <span style={{ 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  누적점수: {getCumulativeScore()}점
                </span>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                로그아웃
              </button>
            </div>
          </div>
          
          {/* 반별 통계 (멘토뷰에서만) - 클릭 가능한 버튼 */}
          {userType === 'admin' && currentTab === 'mentor' && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {Object.entries(classStats).map(([className, count]) => (
                <button 
                  key={className} 
                  onClick={() => setSelectedClass(className)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedClass === className ? getClassColor(className) : '#f3f4f6',
                    borderRadius: '20px',
                    fontSize: '16px',
                    color: selectedClass === className ? 'white' : '#374151',
                    fontWeight: selectedClass === className ? '600' : '500',
                    border: selectedClass === className ? `2px solid ${getClassColor(className)}` : '2px solid #d1d5db',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseOver={(e) => {
                    if (selectedClass !== className) {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedClass !== className) {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                >
                  {className}: {count}명
                </button>
              ))}
              <button 
                onClick={() => setSelectedClass('전체')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedClass === '전체' ? '#374151' : '#f3f4f6',
                  borderRadius: '20px',
                  fontSize: '16px',
                  color: selectedClass === '전체' ? 'white' : '#374151',
                  fontWeight: selectedClass === '전체' ? '600' : '500',
                  border: selectedClass === '전체' ? '2px solid #374151' : '2px solid #d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  if (selectedClass !== '전체') {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedClass !== '전체') {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                전체: {students.length}명
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {userType === 'admin' && currentTab === 'mentor' ? (
          /* 멘토 대시보드 */
          <AdminDashboard 
            students={filteredStudents}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            onAddStudent={() => setShowAddStudent(true)}
            onEditStudent={(student) => {
              setEditingStudent(student);
              setShowEditStudent(true);
            }}
            onDeleteStudent={deleteStudent}
            onHelp={handleHelp}
            onUpdateCode={updateStudentCode}
            onRunCode={runCode}
            output={output}
            isRunning={isRunning}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            classOptions={classOptions}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onSendFeedback={sendFeedback}
            user={user}
            fontSize={fontSize}
            onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 2, 24))}
            onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 2, 10))}
            helpRequests={helpRequests}
            onResolveHelp={resolveHelpRequest}
            onDeleteHelp={deleteHelpRequest}
            liveMessageInput={liveMessageInput}
            setLiveMessageInput={setLiveMessageInput}
            onSendLiveMessage={sendLiveMessage}
            sentMessages={sentMessages}
            onDeleteLiveMessage={deleteLiveMessage}
            onSendCodeModification={sendCodeModification}
            originalCode={originalCode}
            setOriginalCode={setOriginalCode}
            hasModifications={hasModifications}
            codeModifications={codeModifications}
            setHasModifications={setHasModifications}
            findCodeDifferences={findCodeDifferences}
            loadStudentCurrentCode={loadStudentCurrentCode}
            studentScreens={studentScreens}
            onRequestStudentScreen={requestStudentScreen}
            showScreenShare={showScreenShare}
            setShowScreenShare={setShowScreenShare}
            resetAllStudentStatus={resetAllStudentStatus}
          />
        ) : userType === 'admin' && currentTab === 'problems' ? (
          /* 문제 관리 */
          <ProblemManagement 
            problems={problems}
            currentLesson={currentLesson}
            onLessonChange={(lesson) => {
              setCurrentLesson(lesson);
              loadAdminProblems(lesson);
            }}
            onToggleProblem={toggleProblem}
            onToggleLessonProblems={toggleLessonProblems}
            onLoadProblems={loadAdminProblems}
            onAddProblem={addProblem}
            onEditProblem={editProblem}
            onDeleteProblem={deleteProblem}
            onMoveProblem={moveProblem}
            lessons={lessons}
            onLoadLessons={loadLessons}
            onAddLesson={addLesson}
            onEditLesson={editLesson}
            onDeleteLesson={deleteLesson}
          />
        ) : userType === 'admin' && currentTab === 'game' ? (
          /* 게임맵 인터페이스 */
          <GameMap user={user} userType={userType} />
        ) : (
          /* 학생 뷰 */
          <StudentView 
            user={user}
            code={code}
            onUpdateCode={(newCode) => updateCode(newCode, true)}
            onRunCode={runCode}
            onResetCode={resetCode}
            onRequestHelp={requestHelp}
            output={output}
            isRunning={isRunning}
            problems={problems}
            selectedProblem={selectedProblem}
            problemStatus={problemStatus}
            getLessonScore={getLessonScore}
            onSelectProblem={(problem) => {
              console.log('🚨🚨🚨 문제 선택됨:', { 
                새문제: { id: problem.id, title: problem.title },
                현재문제: { id: selectedProblem?.id, title: selectedProblem?.title },
                현재코드길이: code?.length,
                상태복원중: isRestoringState
              });
              console.log('🗂️ 현재 problemStatus:', problemStatus);
              console.log('💾 이 문제의 저장된 상태:', problemStatus[problem.id]);
              
              // 상태 복원 중이면 실행하지 않음
              if (isRestoringState) {
                console.log('⏸️ 상태 복원 중이므로 문제 선택 핸들러 건너뜀');
                return;
              }
              
              // 현재 선택된 문제와 같은 경우 코드를 바꾸지 않음
              if (selectedProblem?.id === problem.id) {
                console.log('✅ 같은 문제 선택, 코드 유지');
                return;
              }
              
              // ⭐ 문제 전환 시 자동 저장 완전 비활성화 - 오직 로컬 상태만 저장
              if (selectedProblem && code && code.trim() !== '' && 
                  !code.includes('여기에 코드를 작성하세요') && 
                  !code.includes('// 여기에 코드를 작성하세요')) {
                console.log('💾 로컬에만 이전 문제 코드 저장:', { prevProblemId: selectedProblem.id, codeLength: code.length });
                setProblemCodes(prev => ({ ...prev, [selectedProblem.id]: code }));
                // updateCode(code, false, selectedProblem.id); // 서버 저장 비활성화
              }
              
              console.log('🎯 setSelectedProblem 호출:', { 
                이전: { id: selectedProblem?.id, title: selectedProblem?.title },
                새로운: { id: problem.id, title: problem.title }
              });
              setSelectedProblem(problem);
              // localStorage에 선택된 문제 저장 (학생의 경우)
              if (userType === 'student' && user?.id) {
                localStorage.setItem(`student_${user.id}_selectedProblem`, JSON.stringify(problem));
                // 학생 화면 상태 업데이트 전송
                setTimeout(() => {
                  if (socket && socket.connected) {
                    const screenData = {
                      studentId: user.id,
                      studentName: user.name,
                      currentScreen: 'problem',
                      selectedProblem: problem,
                      currentLesson: currentLesson,
                      timestamp: new Date().toISOString()
                    };
                    console.log('📺 학생 화면 상태 전송 (문제 선택):', screenData);
                    socket.emit('studentScreenUpdate', screenData);
                  }
                }, 100);
              }
              setOutput(''); // 문제 변경 시 실행창 초기화
              
              // 새 문제의 저장된 코드 불러오기 (서버 우선 - 컴퓨터간 일관성 보장)
              const storageKey = `student_${user?.id}_problem_${problem.id}_code`;
              const localStorageCode = userType === 'student' && user?.id ? localStorage.getItem(storageKey) : null;
              const localCode = problemCodes[problem.id];
              const savedCode = problemStatus[problem.id]?.code;
              
              // ⭐ 제출한 적이 없는 문제만 스타터 코드 표시, 제출한 적이 있으면 점수 상관없이 제출 코드 표시
              const problemStars = problemStatus[problem.id]?.stars || 0;
              const hasSubmitted = !!savedCode || !!localStorageCode || !!localCode || !!problemStatus[problem.id]?.lastSubmittedAt;
              
              if (!hasSubmitted) {
                console.log('📝 한 번도 제출하지 않은 문제 - 스타터 코드 표시:', { 
                  problemId: problem.id, 
                  problemTitle: problem.title,
                  stars: problemStars,
                  hasServerCode: !!savedCode,
                  hasLocalStorageCode: !!localStorageCode,
                  hasLocalCode: !!localCode,
                  hasSubmissionRecord: !!problemStatus[problem.id]?.lastSubmittedAt
                });
                const newCode = problem.starterCode || '';
                console.log('🔄 새 코드 설정:', { 
                  problemId: problem.id, 
                  problemTitle: problem.title,
                  codeSource: 'STARTER',
                  finalCode: newCode ? newCode.substring(0, 30) + '...' : '없음'
                });
                setCode(newCode);
                console.log('✅ 문제 전환 완료:', { 새선택문제: problem.title, 새코드길이: newCode?.length });
                return; // 여기서 종료
              }
              
              console.log('🔄 제출한 적이 있는 문제 - 제출 코드 복원:', { 
                problemId: problem.id, 
                problemTitle: problem.title,
                stars: problemStars,
                hasServerCode: !!savedCode,
                hasLocalStorageCode: !!localStorageCode,
                hasLocalCode: !!localCode,
                hasSubmissionRecord: !!problemStatus[problem.id]?.lastSubmittedAt
              });
              
              // 이미 풀어본 문제는 기존 로직대로 진행
              // 서버 데이터가 의미있는 내용인지 확인 (공백만 있거나 빈 문자열이면 무시)
              const hasValidSavedCode = savedCode && savedCode.trim() !== '' && savedCode.trim().length > 10 && !savedCode.includes('여기에 코드를 작성하세요'); // 최소 10자 이상, 템플릿 아님
              const hasValidLocalStorageCode = localStorageCode && localStorageCode.trim() !== '' && localStorageCode.trim().length > 10; // 최소 10자 이상
              const hasValidLocalCode = localCode && localCode.trim() !== '' && localCode.trim().length > 10; // 최소 10자 이상
              const newCode = (hasValidSavedCode ? savedCode : (hasValidLocalStorageCode ? localStorageCode : (hasValidLocalCode ? localCode : problem.starterCode))) || ''; // 서버 > localStorage > 로컬 > 스타터코드
              
              console.log('🔍 문제 전환 시 코드 로드 (서버 우선):', { 
                problemId: problem.id,
                hasSavedCode: !!savedCode,
                hasValidSavedCode: hasValidSavedCode,
                hasLocalStorageCode: !!localStorageCode,
                hasValidLocalStorageCode: hasValidLocalStorageCode,
                hasLocalCode: !!localCode,
                hasValidLocalCode: hasValidLocalCode,
                hasStarterCode: !!problem.starterCode,
                selectedSource: hasValidSavedCode ? 'SERVER' : hasValidLocalStorageCode ? 'LOCALSTORAGE' : hasValidLocalCode ? 'LOCAL' : 'STARTER',
                finalCode: newCode?.substring(0, 50) + '...'
              });
              
              // 💫 제출 상태도 로컬 우선으로 확인
              const currentStatus = problemStatus[problem.id];
              if (currentStatus && currentStatus.status === 'solved') {
                console.log('⭐ 이미 제출 완료된 문제:', { 
                  problemId: problem.id, 
                  stars: currentStatus.stars,
                  lastSubmitted: currentStatus.lastSubmittedAt 
                });
              }
              console.log('🔄 새 코드 설정:', { 
                problemId: problem.id, 
                problemTitle: problem.title,
                localCode: localCode ? localCode.substring(0, 30) + '...' : '없음', 
                savedCode: savedCode ? savedCode.substring(0, 30) + '...' : '없음', 
                finalCode: newCode ? newCode.substring(0, 30) + '...' : '없음'
              });
              setCode(newCode);
              console.log('✅ 문제 전환 완료:', { 새선택문제: problem.title, 새코드길이: newCode?.length });
              // 문제 선택 시 코드 로드
            }}
            currentLesson={currentLesson}
            onLessonChange={(lesson) => {
              console.log('📚 차시 변경됨:', { 새차시: lesson, 상태복원중: isRestoringState });
              
              // 상태 복원 중이면 실행하지 않음
              if (isRestoringState) {
                console.log('⏸️ 상태 복원 중이므로 차시 변경 핸들러 건너뜀');
                return;
              }
              
              setCurrentLesson(lesson);
              // localStorage에 현재 차시 저장 (학생의 경우)
              if (userType === 'student' && user?.id) {
                localStorage.setItem(`student_${user.id}_currentLesson`, lesson.toString());
              }
              loadProblems(lesson);
            }}
            onSubmitProblem={submitProblem}
            lessons={lessons}
            latestFeedback={latestFeedback}
            fontSize={fontSize}
            onIncreaseFontSize={increaseFontSize}
            onDecreaseFontSize={decreaseFontSize}
            submittingProblems={submittingProblems}
            liveMessages={liveMessages}
            codeModifications={codeModifications}
            userType={userType}
            socket={socket}
          />
        )}
      </div>

      {/* 학생 추가 모달 */}
      {showAddStudent && (
        <StudentModal
          title="새 학생 등록"
          onSubmit={addStudent}
          onClose={() => setShowAddStudent(false)}
          showClassSelect={true}
        />
      )}

      {/* 학생 수정 모달 */}
      {showEditStudent && editingStudent && (
        <StudentModal
          title="학생 정보 수정"
          student={editingStudent}
          onSubmit={editStudent}
          onClose={() => {
            setShowEditStudent(false);
            setEditingStudent(null);
          }}
          showClassSelect={true}
        />
      )}
    </div>
  );
};

// 로그인 화면 컴포넌트
const LoginScreen = ({ onLogin }) => {
  const [loginType, setLoginType] = useState('student');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await onLogin({
      ...formData,
      type: loginType
    });

    if (!result || !result.success) {
      setError(result?.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    }
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
          로앤코로봇코딩 멘토링 플랫폼 로그인
        </h2>

        <div style={{ display: 'flex', marginBottom: '24px', borderRadius: '8px', backgroundColor: '#f3f4f6', padding: '4px' }}>
          <button
            onClick={() => setLoginType('student')}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: loginType === 'student' ? '#2563eb' : 'transparent',
              color: loginType === 'student' ? 'white' : '#374151',
              cursor: 'pointer'
            }}
          >
            학생 로그인
          </button>
          <button
            onClick={() => setLoginType('admin')}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: loginType === 'admin' ? '#2563eb' : 'transparent',
              color: loginType === 'admin' ? 'white' : '#374151',
              cursor: 'pointer'
            }}
          >
            관리자 로그인
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              {loginType === 'admin' ? '관리자 ID' : '학번'}
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                fontSize: '18px'
              }}
              placeholder={loginType === 'admin' ? 'admin' : 'S001'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              {loginType === 'admin' ? '비밀번호' : '이름'}
            </label>
            <input
              type={loginType === 'admin' ? 'password' : 'text'}
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                fontSize: '18px'
              }}
              placeholder={loginType === 'admin' ? '비밀번호' : '이름'}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '16px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '18px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

      </div>
    </div>
  );
};

// 관리자 대시보드 컴포넌트
const AdminDashboard = ({ 
  students, selectedStudent, setSelectedStudent, onAddStudent, onEditStudent, 
  onDeleteStudent, onHelp, onUpdateCode, onRunCode, output, isRunning, selectedClass, 
  setSelectedClass, classOptions, sortBy, setSortBy,
  onSendFeedback, user, fontSize, onIncreaseFontSize, onDecreaseFontSize, helpRequests = [], onResolveHelp, onDeleteHelp,
  liveMessageInput, setLiveMessageInput, onSendLiveMessage, sentMessages = [], onDeleteLiveMessage,
  onSendCodeModification, originalCode, setOriginalCode, hasModifications, codeModifications = [],
  findCodeDifferences, loadStudentCurrentCode, studentScreens = {}, onRequestStudentScreen,
  showScreenShare, setShowScreenShare, resetAllStudentStatus
}) => {

  return (
  <div>
    {/* 실시간 도움 요청 표시 영역 */}
    {helpRequests && helpRequests.length > 0 && (
      <div style={{ 
        backgroundColor: '#fee2e2', 
        border: '2px solid #dc2626',
        borderRadius: '8px', 
        padding: '16px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#dc2626',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🚨 도움 요청 ({helpRequests.filter(req => req.status === 'pending').length}건 대기 / {helpRequests.filter(req => req.status === 'resolved').length}건 해결됨)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          {helpRequests.map((request) => (
            <div key={request.id} style={{
              backgroundColor: request.status === 'resolved' ? '#f9fafb' : 'white',
              borderRadius: '6px',
              padding: '16px',
              border: request.status === 'resolved' ? '1px solid #d1d5db' : '1px solid #fca5a5',
              position: 'relative',
              opacity: request.status === 'resolved' ? 0.7 : 1
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: request.status === 'resolved' ? '#6b7280' : '#dc2626',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>
                  {request.studentName}
                  {request.status === 'resolved' && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '12px', 
                      color: '#059669', 
                      fontWeight: 'normal' 
                    }}>
                      ✅ 해결됨
                    </span>
                  )}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {new Date(request.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#7c2d12',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                문제: {request.problemTitle}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#374151',
                marginBottom: '12px',
                lineHeight: '1.4',
                padding: '8px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                fontStyle: 'italic'
              }}>
                "{request.message}"
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => request.status !== 'resolved' && onResolveHelp(request.id)}
                  disabled={request.status === 'resolved'}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    backgroundColor: request.status === 'resolved' ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: request.status === 'resolved' ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: request.status === 'resolved' ? 0.6 : 1
                  }}
                >
                  {request.status === 'resolved' ? '✅ 완료' : '✅ 해결됨'}
                </button>
                <button
                  onClick={() => onDeleteHelp(request.id)}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr', gap: '24px' }}>
    {/* 학생 목록 */}
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
      
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 12px 0' }}>
          📊 전체학생현황 ({students.length}명)
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSortBy('name')}
            style={{
              padding: '8px 16px',
              backgroundColor: sortBy === 'name' ? '#8b5cf6' : '#f3f4f6',
              color: sortBy === 'name' ? 'white' : '#374151',
              border: sortBy === 'name' ? '2px solid #7c3aed' : '2px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: sortBy === 'name' ? '600' : '500',
              minWidth: '100px',
              textAlign: 'center'
            }}
          >
            📝 가나다순
          </button>
          <button
            onClick={() => setSortBy('studentId')}
            style={{
              padding: '8px 16px',
              backgroundColor: sortBy === 'studentId' ? '#8b5cf6' : '#f3f4f6',
              color: sortBy === 'studentId' ? 'white' : '#374151',
              border: sortBy === 'studentId' ? '2px solid #7c3aed' : '2px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: sortBy === 'studentId' ? '600' : '500',
              minWidth: '100px',
              textAlign: 'center'
            }}
          >
            🔢 학번순
          </button>
          <button
            onClick={onAddStudent}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              minWidth: '100px',
              textAlign: 'center'
            }}
          >
            ➕ 학생<br/>추가
          </button>
          {resetAllStudentStatus && (
            <button
              onClick={resetAllStudentStatus}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff9800',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                minWidth: '100px',
                textAlign: 'center'
              }}
            >
              🔄 상태<br/>초기화
            </button>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {students.map((student, index) => (
          <div 
            key={student.id}
            onClick={() => {
              // 이전 선택된 학생과 다른 학생을 선택했을 때만 원본 코드 설정
              if (selectedStudent?.id !== student.id) {
                setSelectedStudent(student);
                // 학생의 현재 코드를 서버에서 실시간으로 로드
                loadStudentCurrentCode(student.id, student.currentProblemId || 1);
              }
            }}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: selectedStudent?.id === student.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              backgroundColor: selectedStudent?.id === student.id ? '#eff6ff' : 'white',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: '500', fontSize: '16px' }}>{student.name}</span>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: student.status === 'online' ? '#10b981' : 
                                   student.status === 'stuck' ? '#ef4444' : '#6b7280'
                  }} />
                  {student.needsHelp === 1 && <span style={{ color: '#ef4444' }}>🚨</span>}
                  {student.status === 'completed' && <span style={{ color: '#10b981' }}>✅</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    style={{
                      padding: '4px 12px',
                      backgroundColor: getClassColor(student.class),
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'default',
                      fontSize: '12px',
                      minWidth: '60px',
                      textAlign: 'center'
                    }}
                  >
                    {student.class ? student.class.replace('반', '') : '미배정'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStudent(student);
                    }}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      minWidth: '60px',
                      textAlign: 'center'
                    }}
                  >
                    수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteStudent(student.id);
                    }}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      minWidth: '60px',
                      textAlign: 'center'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div style={{ paddingLeft: '32px' }}>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>학번: {student.studentId}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  진도: {student.progress}/100 | {student.currentProblem}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{student.lastActive}</div>
              </div>
            </div>
            {student.needsHelp === 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHelp(student.id);
                }}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                도움 주기
              </button>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* 실시간 코드 뷰어 */}
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600' }}>
          {selectedStudent ? `${selectedStudent.name}의 코드` : '학생을 선택하세요'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 폰트 크기 조절 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>폰트 크기:</span>
            <button
              onClick={onDecreaseFontSize}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#374151'
              }}
            >
              -
            </button>
            <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '35px', textAlign: 'center', color: '#374151' }}>
              {fontSize}px
            </span>
            <button
              onClick={onIncreaseFontSize}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#374151'
              }}
            >
              +
            </button>
          </div>
          <span style={{ fontSize: '16px', color: '#6b7280' }}>📡 실시간 관찰</span>
        </div>
      </div>
      
      {selectedStudent ? (
        <>
          <CodeEditor 
            code={selectedStudent.code || ''}
            onChange={onUpdateCode}
            readOnly={false}
            fontSize={fontSize}
            originalCode={originalCode}
            modifications={[]} // 관리자 화면에서는 항상 빈 배열
            enableSyntaxCheck={true}
            userType="admin"
          />
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onRunCode()}
              disabled={isRunning}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                backgroundColor: '#059669',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning ? 0.5 : 1
              }}
            >
              ▶️ {isRunning ? '실행중...' : '코드 실행'}
            </button>
            <button 
              onClick={() => {
                if (selectedStudent && onSendCodeModification) {
                  // 원본 코드 설정 (수정사항이 있을 때만)
                  if (!originalCode && selectedStudent.code) {
                    console.log('📝 원본 코드 설정:', selectedStudent.code);
                    setOriginalCode(selectedStudent.code);
                    
                    // 잠시 후 수정사항 전송 (원본 코드 설정 후)
                    setTimeout(() => {
                      onSendCodeModification();
                    }, 100);
                  } else {
                    onSendCodeModification();
                  }
                } else {
                  alert('학생을 먼저 선택해주세요.');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                backgroundColor: selectedStudent && onSendCodeModification ? '#2563eb' : '#9ca3af',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: selectedStudent && onSendCodeModification ? 'pointer' : 'not-allowed'
              }}>
              💾 수정사항 전송
            </button>
          </div>
          {output && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>💻 실행 결과:</div>
              <div style={{ 
                backgroundColor: '#1a1a1a', 
                color: '#ffffff', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #333',
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                overflow: 'auto'
              }}>
                <div dangerouslySetInnerHTML={{ __html: output }} />
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          학생을 선택하면 코드를 볼 수 있습니다
        </div>
      )}
    </div>

    {/* 메시지 */}
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
      
      {/* 관리자가 보낸 메시지 목록 */}
      {sentMessages && sentMessages.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#f59e0b', 
            marginBottom: '12px' 
          }}>
            📡 내가 보낸 실시간 메시지 ({sentMessages.length}건)
          </h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sentMessages.slice(0, 10).map((message, index) => (
              <div key={message.id || index} style={{
                padding: '12px',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                    → {message.studentName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                    <button
                      onClick={() => onDeleteLiveMessage(message.id)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#78350f' }}>
                  💬 {message.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 실시간 메시지 입력창 */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '8px' 
        }}>
          📡 실시간 메시지 (선택된 학생에게 바로 전송)
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={liveMessageInput}
            onChange={(e) => setLiveMessageInput(e.target.value)}
            placeholder="실시간 메시지를 입력하세요..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '2px solid #f59e0b',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: '#fef3c7'
            }}
            onKeyPress={(e) => e.key === 'Enter' && onSendLiveMessage()}
          />
          <button 
            onClick={onSendLiveMessage}
            disabled={!selectedStudent || !liveMessageInput.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedStudent && liveMessageInput.trim() ? '#f59e0b' : '#9ca3af',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: selectedStudent && liveMessageInput.trim() ? 'pointer' : 'not-allowed',
              fontWeight: '600'
            }}
          >
            📡 전송
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>
  );
};

// 학생 뷰 컴포넌트
const StudentView = ({ 
  user, code, onUpdateCode, onRunCode, onResetCode, onRequestHelp, output, isRunning,
  problems, selectedProblem, onSelectProblem, currentLesson, onLessonChange,
  problemStatus, onSubmitProblem, lessons, latestFeedback,
  fontSize, onIncreaseFontSize, onDecreaseFontSize, submittingProblems, liveMessages = [],
  codeModifications = [], userType, socket, getLessonScore
}) => {
  return (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px' }}>
    {/* 문제 목록 및 선택 */}
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>문제 선택</h2>
        {user?.class && (
          <span style={{
            fontSize: '14px',
            padding: '4px 8px',
            backgroundColor: getClassColor(user.class),
            color: 'white',
            borderRadius: '12px'
          }}>
            {user.class}
          </span>
        )}
      </div>

      {/* 차시 선택 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '16px', fontWeight: '500' }}>
            차시 선택:
          </label>
          {getLessonScore && (
            <span style={{
              fontSize: '14px',
              padding: '4px 8px',
              backgroundColor: '#06b6d4',
              color: 'white',
              borderRadius: '12px',
              fontWeight: '500'
            }}>
              {currentLesson}차시: {getLessonScore(currentLesson)}점
            </span>
          )}
        </div>
        <select 
          value={currentLesson}
          onChange={(e) => onLessonChange(parseInt(e.target.value))}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white',
            fontSize: '16px'
          }}
        >
          {lessons && lessons.length > 0 ? lessons.map(lesson => (
            <option key={lesson.id} value={lesson.number}>
              {lesson.number}차시 - {lesson.name}
            </option>
          )) : (
            <>
              <option value={1}>1차시 - 기초</option>
              <option value={2}>2차시 - 변수와 연산</option>
              <option value={3}>3차시 - 조건문</option>
            </>
          )}
        </select>
      </div>


      {/* 문제 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {problems.map((problem, index) => {
          const status = problemStatus[problem.id];
          const isCompleted = status?.status === 'solved';
          const stars = status?.stars || 0;
          
          return (
            <div 
              key={problem.id}
              onClick={() => onSelectProblem(problem)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: selectedProblem?.id === problem.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                backgroundColor: selectedProblem?.id === problem.id ? '#eff6ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {index + 1}
                </span>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>{problem.title}</span>
                
                {/* 상태 표시 */}
                {isCompleted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {stars === 0 ? (
                      <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>❌ 0점</span>
                    ) : (
                      [...Array(stars)].map((_, i) => (
                        <span key={i} style={{ color: '#fbbf24' }}>⭐</span>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 액션 버튼들 */}
      <div style={{ marginTop: '24px' }}>
        <button 
          onClick={() => {
            console.log('🔥🔥🔥 도움 요청 버튼 클릭됨!');
            onRequestHelp();
          }}
          style={{
            width: '100%',
            padding: '8px 16px',
            backgroundColor: '#f59e0b',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          🚨 도움 요청
        </button>
      </div>
    </div>

    {/* 문제 상세 및 코드 에디터 */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 문제 상세 */}
      {selectedProblem && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }} data-problem-id={selectedProblem.id}>
          <h2 className="problem-title" style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
            {selectedProblem.title}
          </h2>
          
          <div style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '16px' }}>
            {selectedProblem.description}
          </div>
          
          {/* 디버그: 문제 데이터 확인 */}
          {console.log('선택된 문제 데이터:', selectedProblem)}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
              <strong>입력 예시:</strong>
              <pre style={{ marginTop: '4px', fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                {selectedProblem.inputExample || '입력 예시가 없습니다.'}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>
              <strong>출력 예시:</strong>
              <pre style={{ marginTop: '4px', fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                {selectedProblem.outputExample || '출력 예시가 없습니다.'}
              </pre>
            </div>
          </div>

          {selectedProblem.hints && (
            <div style={{ marginBottom: '16px' }}>
              <strong>힌트:</strong>
              <div style={{ marginTop: '8px' }}>
                {(() => {
                  try {
                    const hints = typeof selectedProblem.hints === 'string' 
                      ? JSON.parse(selectedProblem.hints) 
                      : selectedProblem.hints;
                    return Array.isArray(hints) ? hints : selectedProblem.hints.split('\n');
                  } catch (e) {
                    return selectedProblem.hints.split('\n');
                  }
                })().map((hint, index) => (
                  <div key={index} style={{ 
                    marginBottom: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    borderLeft: '3px solid #4CAF50',
                    borderRadius: '4px',
                    fontSize: '15px',
                    color: '#374151',
                    whiteSpace: 'pre-line'
                  }}>
                    💡 {hint}
                  </div>
                ))}
              </div>
            </div>
          )}

          
          {/* 실시간 메시지 섹션 */}
          {(() => {
            console.log('🖼️ 실시간 메시지 UI 렌더링 체크:', { liveMessages, length: liveMessages?.length });
            return liveMessages && liveMessages.length > 0;
          })() && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#f59e0b', 
                marginBottom: '8px' 
              }}>
                📡 선생님 실시간 메시지 ({liveMessages.length}건)
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', space: '8px' }}>
                {liveMessages.slice(0, 5).map((message, index) => (
                  <div key={message.id || index} style={{
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '16px', color: '#92400e', fontWeight: '600' }}>
                      📡 {message.message}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 코드 에디터 */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>코드 작성</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', color: '#6b7280' }}>폰트 크기:</span>
            <button
              onClick={onDecreaseFontSize}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              -
            </button>
            <span style={{ fontSize: '16px', fontWeight: '500', minWidth: '30px', textAlign: 'center' }}>
              {fontSize}px
            </span>
            <button
              onClick={onIncreaseFontSize}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              +
            </button>
          </div>
        </div>
        
        <CodeEditor 
          code={code}
          onChange={onUpdateCode}
          readOnly={false}
          fontSize={fontSize}
          originalCode={''}
          modifications={codeModifications?.[0]?.modifications || []}
          enableSyntaxCheck={true}
          userType="student"
        />

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onRunCode()}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.5 : 1
            }}
          >
            ▶️ {isRunning ? '실행중...' : '실행'}
          </button>
          <button
            onClick={() => {
              console.log('제출 버튼 클릭됨! (백엔드 자동채점 사용)');
              
              if (selectedProblem) {
                console.log('백엔드에서 자동채점 실행');
                // 백엔드에서 자동채점하므로 별점은 0으로 보내고 백엔드 결과를 받음
                onSubmitProblem(selectedProblem.id, 0);
              } else {
                console.log('제출 조건 불만족 - 문제 선택 안됨');
              }
            }}
            disabled={!selectedProblem || !output || isRunning || submittingProblems.has(selectedProblem?.id)}
            onMouseEnter={() => {
              console.log('제출 버튼 상태 확인:', { 
                selectedProblem: !!selectedProblem, 
                selectedProblemId: selectedProblem?.id,
                output: !!output, 
                outputValue: output,
                isRunning: isRunning,
                disabled: !selectedProblem || !output || isRunning
              });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: (!selectedProblem || !output || submittingProblems.has(selectedProblem?.id)) ? '#9ca3af' : '#2563eb',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: (!selectedProblem || !output || isRunning || submittingProblems.has(selectedProblem?.id)) ? 'not-allowed' : 'pointer',
              opacity: (!selectedProblem || !output || isRunning || submittingProblems.has(selectedProblem?.id)) ? 0.5 : 1
            }}
          >
            {submittingProblems.has(selectedProblem?.id) ? '제출중...' : '⭐ 제출 (자동채점)'}
          </button>
          <button
            onClick={() => {
              console.log('코드 초기화 버튼 클릭됨!');
              if (window.confirm('코드를 초기 상태로 되돌리시겠습니까?\n현재 작성한 코드는 모두 사라집니다.')) {
                onResetCode();
              }
            }}
            disabled={!selectedProblem || !selectedProblem.starterCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: (!selectedProblem || !selectedProblem.starterCode) ? '#9ca3af' : '#dc2626',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: (!selectedProblem || !selectedProblem.starterCode) ? 'not-allowed' : 'pointer',
              opacity: (!selectedProblem || !selectedProblem.starterCode) ? 0.5 : 1
            }}
          >
            🔄 코드 초기화
          </button>
        </div>

        {output && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <strong>실행 결과:</strong>
            <pre style={{ marginTop: '4px', fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: output }} />
          </div>
        )}
      </div>
    </div>
  </div>
  );
};



// 코드 에디터 컴포넌트 (Monaco Editor 사용)
const CodeEditor = ({ code, onChange, readOnly = false, fontSize = 14, modifications = [], originalCode = '', enableSyntaxCheck = true, userType = 'student' }) => {
  const editorRef = React.useRef(null);
  const decorationsRef = React.useRef([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const lastCursorPositionRef = React.useRef(null);
  const previousCodeRef = React.useRef(code);
  const isTypingRef = React.useRef(false);
  const lastChangeTimeRef = React.useRef(0);

  // 외부에서 code prop이 변경될 때 에디터 값 업데이트
  React.useEffect(() => {
    if (editorRef.current && code !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== code && !isTypingRef.current) {
        console.log('🔄 외부 code prop 변경 감지, 에디터 업데이트:', { 
          currentValue: currentValue.substring(0, 50) + '...', 
          newCode: code.substring(0, 50) + '...',
          readOnly,
          userType
        });
        editorRef.current.setValue(code);
      }
    }
  }, [code, readOnly, userType]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // 네트워크 환경에서도 확실하게 C언어 지원 보장
    console.log('🎨 Monaco Editor 초기화 중...');
    console.log('📝 에디터 읽기 전용 상태:', readOnly);
    console.log('📝 에디터 옵션 확인:', editor.getRawOptions());
    setIsLoading(false); // 로딩 완료
    
    // C언어 언어 정의 강화 (네트워크 환경 대응)
    try {
      // 기존 C언어 설정이 없으면 추가 정의
      const cLanguage = monaco.languages.getLanguages().find(lang => lang.id === 'c');
      if (!cLanguage) {
        console.log('⚠️ C언어 정의가 없음 - 수동 정의');
        monaco.languages.register({ id: 'c' });
        monaco.languages.setLanguageConfiguration('c', {
          brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
          ],
          autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ],
          surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ]
        });
        
        // C언어 토크나이저 수동 정의
        monaco.languages.setMonarchTokensProvider('c', {
          keywords: [
            'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
            'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
            'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
            'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while',
            'include', 'define', 'pragma', 'ifndef', 'ifdef', 'endif', 'else', 'elif'
          ],
          typeKeywords: ['int', 'float', 'double', 'char', 'void', 'long', 'short'],
          operators: [
            '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
            '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
            '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
            '%=', '<<=', '>>=', '>>>='
          ],
          symbols: /[=><!~?:&|+\-*\/\^%]+/,
          tokenizer: {
            root: [
              [/[a-zA-Z_$][\w$]*/, {
                cases: {
                  '@typeKeywords': 'keyword',
                  '@keywords': 'keyword',
                  '@default': 'identifier'
                }
              }],
              [/\/\*/, 'comment', '@comment'],
              [/\/\/.*$/, 'comment'],
              [/"/, 'string', '@string_double'],
              [/'/, 'string', '@string_single'],
              [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
              [/0[xX][0-9a-fA-F]+/, 'number.hex'],
              [/\d+/, 'number'],
              [/[{}()\[\]]/, '@brackets'],
              [/@symbols/, {
                cases: {
                  '@operators': 'operator',
                  '@default': ''
                }
              }]
            ],
            comment: [
              [/[^\/*]+/, 'comment'],
              [/\*\//, 'comment', '@pop'],
              [/[\/*]/, 'comment']
            ],
            string_double: [
              [/[^\\"]+/, 'string'],
              [/"/, 'string', '@pop']
            ],
            string_single: [
              [/[^\\']+/, 'string'],
              [/'/, 'string', '@pop']
            ]
          }
        });
      }
    } catch (e) {
      console.warn('C언어 정의 설정 오류:', e);
    }
    
    // C언어 테마 설정 (네트워크 환경에서도 확실하게)
    monaco.editor.defineTheme('custom-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' }, // 주석 연두색
        { token: 'string', foreground: 'CE9178' }, // 문자열 주황색  
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' }, // 키워드 파란색
        { token: 'number', foreground: 'B5CEA8' }, // 숫자 연두색
        { token: 'number.hex', foreground: 'B5CEA8' }, // 16진수
        { token: 'number.float', foreground: 'B5CEA8' }, // 실수
        { token: 'identifier', foreground: '9CDCFE' }, // 식별자 하늘색
        { token: 'operator', foreground: 'D4D4D4' }, // 연산자 회색
        { token: 'type', foreground: '4EC9B0' }, // 타입 청록색
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#ffffff',
        'editor.lineHighlightBackground': '#2d2d30',
        'editor.selectionBackground': '#264f78'
      }
    });

    monaco.editor.setTheme('custom-theme');
    
    // C언어 문법 하이라이팅 강제 설정 (네트워크 환경에서도 확실하게)
    const model = editor.getModel();
    if (model) {
      console.log('📝 C언어 모드 설정 중...');
      monaco.editor.setModelLanguage(model, 'c');
      
      // 설정 확인 및 재시도 (네트워크 환경에서 더 강력하게)
      const checkAndRetryLanguage = (retryCount = 0) => {
        setTimeout(() => {
          const currentLanguage = model.getLanguageId();
          console.log(`✅ 언어 설정 확인 (시도 ${retryCount + 1}):`, currentLanguage);
          
          if (currentLanguage !== 'c' && retryCount < 5) {
            console.warn(`⚠️ C언어 설정 재시도 (${retryCount + 1}/5)`);
            monaco.editor.setModelLanguage(model, 'c');
            monaco.editor.setTheme('custom-theme');
            checkAndRetryLanguage(retryCount + 1);
          } else if (currentLanguage === 'c') {
            console.log('🎉 C언어 설정 완료!');
            // 강제로 테마 재적용
            monaco.editor.setTheme('custom-theme');
          } else {
            console.error('❌ C언어 설정 실패, 최대 재시도 횟수 초과');
          }
        }, 200 * (retryCount + 1)); // 점진적으로 지연 시간 증가
      };
      
      checkAndRetryLanguage();
      
      // 모델 언어가 변경될 때마다 C언어로 강제 설정
      model.onDidChangeLanguage(() => {
        try {
          console.log('🔄 언어 변경 감지, C언어로 재설정');
          monaco.editor.setModelLanguage(model, 'c');
          monaco.editor.setTheme('custom-theme');
        } catch (error) {
          console.warn('🔄 언어 변경 이벤트 에러:', error);
        }
      });
    }
    
    // 에디터 텍스트가 변경될 때마다 테마 재적용 (네트워크 환경 대응)
    editor.onDidChangeModelContent(() => {
      try {
        const currentModel = editor.getModel();
        if (currentModel && currentModel.getLanguageId() !== 'c') {
          console.log('📝 모델 내용 변경 시 언어 재설정');
          monaco.editor.setModelLanguage(currentModel, 'c');
          monaco.editor.setTheme('custom-theme');
        }
      } catch (error) {
        console.warn('📝 모델 내용 변경 이벤트 에러:', error);
      }
    });
    
    // 에디터 포커스/클릭 시에도 C언어 설정 유지 (네트워크 환경 대응)
    editor.onDidFocusEditorText(() => {
      console.log('🎯 에디터 포커스 - C언어 설정 유지');
      const currentModel = editor.getModel();
      if (currentModel) {
        if (currentModel.getLanguageId() !== 'c') {
          console.log('🔄 포커스 시 C언어 모드 복구');
          monaco.editor.setModelLanguage(currentModel, 'c');
        }
        monaco.editor.setTheme('custom-theme');
      }
      
      // 플레이스홀더 자동 삭제 비활성화 - 커서 위치 문제 해결
      console.log('🚫 포커스 시 플레이스홀더 자동 삭제 비활성화');
    });
    
    // 키보드와 마우스 이벤트 구분을 위한 이벤트 리스너 추가
    editor.onKeyDown((e) => {
      isTypingRef.current = true;
      lastChangeTimeRef.current = Date.now();
      console.log('⌨️ 키보드 입력 감지:', e.code);
      
      // 실제 문자 입력 키인지 확인 (화살표, 수정자 키 제외)
      const isCharacterKey = e.code && 
        !e.code.startsWith('Arrow') && 
        !e.code.startsWith('Control') && 
        !e.code.startsWith('Meta') &&
        e.code !== 'Shift' && 
        e.code !== 'Alt' && 
        e.code !== 'Tab' &&
        e.code !== 'CapsLock' &&
        e.code !== 'Escape' &&
        e.code !== 'Home' &&
        e.code !== 'End' &&
        e.code !== 'PageUp' &&
        e.code !== 'PageDown' &&
        e.code !== 'F1' && !e.code.startsWith('F');
      
      if (isCharacterKey) {
        console.log('🔤 문자 입력 키 감지:', e.code);
        
        // 즉시 플레이스홀더 확인 및 삭제 (setTimeout 제거)
        const model = editor.getModel();
        if (model) {
          const currentValue = model.getValue();
          const standardPlaceholder = '// 여기에 코드를 입력하세요';
          
          if (currentValue.includes(standardPlaceholder)) {
            console.log('🎯 타이핑 전 플레이스홀더 즉시 삭제');
            
            // 현재 커서 위치 저장
            const currentPosition = editor.getPosition();
            console.log('📍 현재 커서 위치:', currentPosition);
            
            // 플레이스홀더 위치 찾기
            const lines = currentValue.split('\n');
            let placeholderLine = -1;
            let placeholderColumn = 0;
            
            for (let i = 0; i < lines.length; i++) {
              const placeholderIndex = lines[i].indexOf(standardPlaceholder);
              if (placeholderIndex !== -1) {
                placeholderLine = i + 1;
                placeholderColumn = placeholderIndex + 1;
                break;
              }
            }
            
            // 플레이스홀더 삭제
            const newValue = currentValue.replace(standardPlaceholder, '');
            model.setValue(newValue);
            
            // 커서 위치 복구 - 플레이스홀더가 있던 위치 또는 원래 위치
            let targetPosition = currentPosition;
            if (placeholderLine !== -1 && currentPosition && 
                currentPosition.lineNumber === placeholderLine &&
                currentPosition.column >= placeholderColumn &&
                currentPosition.column <= placeholderColumn + standardPlaceholder.length) {
              // 플레이스홀더 내부에 커서가 있었다면 플레이스홀더 시작점으로
              targetPosition = { lineNumber: placeholderLine, column: placeholderColumn };
            }
            
            if (targetPosition) {
              editor.setPosition(targetPosition);
              console.log('🎯 커서 위치 복구:', targetPosition);
            }
            
            console.log('✨ 플레이스홀더 즉시 삭제 완료');
          }
        }
      }
    });
    
    editor.onMouseDown((e) => {
      isTypingRef.current = false;
      console.log('🖱️ 마우스 클릭 감지');
      
      const model = editor.getModel();
      if (model) {
        const currentValue = model.getValue();
        const standardPlaceholder = '// 여기에 코드를 입력하세요';
        
        if (currentValue.includes(standardPlaceholder)) {
          console.log('🎯 플레이스홀더 감지됨, 클릭 위치 확인');
          
          // 클릭 위치 가져오기 (이벤트에서 직접)
          const clickPosition = e.target.position;
          console.log('📍 클릭 위치:', clickPosition);
          
          // 플레이스홀더가 있는 줄과 위치 찾기
          const lines = currentValue.split('\n');
          let placeholderLine = -1;
          let placeholderColumn = 1;
          
          for (let i = 0; i < lines.length; i++) {
            const placeholderIndex = lines[i].indexOf(standardPlaceholder);
            if (placeholderIndex !== -1) {
              placeholderLine = i + 1; // Monaco는 1-based
              placeholderColumn = placeholderIndex + 1; // Monaco는 1-based
              break;
            }
          }
          
          if (placeholderLine !== -1) {
            // 클릭이 플레이스홀더 영역에서 발생했는지 확인
            const isClickOnPlaceholderLine = clickPosition && clickPosition.lineNumber === placeholderLine;
            const isClickOnPlaceholder = isClickOnPlaceholderLine && 
              clickPosition.column >= placeholderColumn && 
              clickPosition.column <= placeholderColumn + standardPlaceholder.length - 1;
            
            console.log('📋 플레이스홀더 정보:', {
              line: placeholderLine,
              column: placeholderColumn,
              isClickOnLine: isClickOnPlaceholderLine,
              isClickOnPlaceholder: isClickOnPlaceholder,
              clickPos: clickPosition
            });
            
            if (isClickOnPlaceholder) {
              // 플레이스홀더를 직접 클릭했을 때만 삭제
              console.log('🎯 플레이스홀더 클릭 감지 - 삭제 시작');
              
              // 플레이스홀더 삭제
              const newValue = currentValue.replace(standardPlaceholder, '');
              model.setValue(newValue);
              
              // 플레이스홀더가 있던 위치로 커서 이동
              const targetPosition = { lineNumber: placeholderLine, column: placeholderColumn };
              console.log('🎯 커서를 플레이스홀더 위치로 이동:', targetPosition);
              
              // 약간의 지연 후 커서 위치 설정 (DOM 업데이트 대기)
              setTimeout(() => {
                editor.setPosition(targetPosition);
                editor.focus();
                console.log('✅ 플레이스홀더 삭제 및 커서 위치 설정 완료');
              }, 10);
            }
          }
        }
      }
    });
    
    // 추가 이벤트들에서도 C언어 설정 유지
    editor.onDidBlurEditorText(() => {
      try {
        console.log('🌫️ 에디터 블러 - C언어 설정 유지');
        const currentModel = editor.getModel();
        if (currentModel && currentModel.getLanguageId() !== 'c') {
          monaco.editor.setModelLanguage(currentModel, 'c');
          monaco.editor.setTheme('custom-theme');
        }
      } catch (error) {
        console.warn('🌫️ 블러 이벤트 에러:', error);
      }
    });
    
    editor.onDidChangeCursorPosition(() => {
      try {
        const currentModel = editor.getModel();
        if (currentModel && currentModel.getLanguageId() !== 'c') {
          console.log('📍 커서 이동 시 C언어 모드 복구');
          monaco.editor.setModelLanguage(currentModel, 'c');
          monaco.editor.setTheme('custom-theme');
        }
      } catch (error) {
        console.warn('📍 커서 이벤트 에러:', error);
      }
    });
    
    // 주기적으로 설정 확인 및 복구 (네트워크 환경 대응)
    const intervalId = setInterval(() => {
      try {
        if (editor && editor.getModel && editor.getModel()) {
          const currentModel = editor.getModel();
          if (currentModel && currentModel.getLanguageId() !== 'c') {
            console.log('⏰ 주기적 검사 - C언어 모드 복구');
            monaco.editor.setModelLanguage(currentModel, 'c');
            monaco.editor.setTheme('custom-theme');
          }
        } else {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.warn('⏰ 주기적 검사 에러:', error);
        clearInterval(intervalId);
      }
    }, 2000); // 2초마다 검사
    
    // Dev-C++ 수준의 완전한 C언어 문법 검사
    const validateCode = () => {
      console.log('🔍 Dev-C++ 수준 완전 문법 검사 실행:', { enableSyntaxCheck });
      if (!enableSyntaxCheck) {
        console.log('❌ 문법 검사 비활성화됨');
        return;
      }
      
      const model = editor.getModel();
      if (!model) {
        console.log('❌ 모델을 찾을 수 없음');
        return;
      }
      
      const codeValue = model.getValue();
      console.log('📝 검사할 코드:', codeValue);
      const markers = [];
      
      // 코드가 비어있으면 검사하지 않음
      if (!codeValue.trim()) {
        monaco.editor.setModelMarkers(model, 'c-language-checker', []);
        return;
      }
      
      const lines = codeValue.split('\n');
      const declaredVariables = new Set(); // 선언된 변수 추적
      
      lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const trimmedLine = line.trim();
        
        // 1. 데이터 타입 오타 검사
        const typeVariants = {
          'itn': 'int', 'tin': 'int', 'nit': 'int', 'itnt': 'int',
          'cahr': 'char', 'cahrs': 'chars', 'chr': 'char',
          'flot': 'float', 'folat': 'float', 'flaot': 'float',
          'dobule': 'double', 'doubl': 'double', 'doulbe': 'double',
          'viod': 'void', 'vodi': 'void', 'voyd': 'void'
        };
        
        Object.entries(typeVariants).forEach(([typo, correct]) => {
          if (line.includes(typo)) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineNumber,
              startColumn: line.indexOf(typo) + 1,
              endLineNumber: lineNumber,
              endColumn: line.indexOf(typo) + typo.length + 1,
              message: `"${typo}"는 올바르지 않습니다. "${correct}"를 사용하세요.`,
              source: 'C Language Checker'
            });
          }
        });
        
        // 2. 헤더 파일 완전 검사
        if (line.includes('#include')) {
          const headerVariants = {
            'stido': 'stdio', 'stdoi': 'stdio', 'sitio': 'stdio',
            'sitdio': 'stdio', 'stdio': 'stdio'
          };
          
          Object.entries(headerVariants).forEach(([typo, correct]) => {
            if (line.includes(typo) && typo !== correct) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: lineNumber,
                startColumn: line.indexOf(typo) + 1,
                endLineNumber: lineNumber,
                endColumn: line.indexOf(typo) + typo.length + 1,
                message: `"${typo}.h"는 올바르지 않습니다. "${correct}.h"를 사용하세요.`,
                source: 'C Language Checker'
              });
            }
          });
          
          // C++ 헤더 검사
          if (line.includes('<string>') && !line.includes('string.h')) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineNumber,
              startColumn: line.indexOf('<string>') + 1,
              endLineNumber: lineNumber,
              endColumn: line.indexOf('<string>') + 9,
              message: 'C언어에서는 "<string.h>"를 사용하세요.',
              source: 'C Language Checker'
            });
          }
        }
        
        // 3. printf 함수 완전 검사
        const printfVariants = [
          'pritnf', 'printff', 'prif', 'prnitf', 'pritf', 'pintf', 
          'prinft', 'printg', 'prinff', 'pirntf', 'priintf'
        ];
        printfVariants.forEach(variant => {
          if (line.includes(variant)) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineNumber,
              startColumn: line.indexOf(variant) + 1,
              endLineNumber: lineNumber,
              endColumn: line.indexOf(variant) + variant.length + 1,
              message: `"${variant}"는 올바르지 않습니다. "printf"를 사용하세요.`,
              source: 'C Language Checker'
            });
          }
        });
        
        // 4. scanf 함수 완전 검사
        const scanfVariants = [
          'sacnf', 'scnaf', 'sanf', 'scaf', 'scanff', 'scnaf', 
          'sacanf', 'sancf', 'scnaff', 'scafn'
        ];
        scanfVariants.forEach(variant => {
          if (line.includes(variant)) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineNumber,
              startColumn: line.indexOf(variant) + 1,
              endLineNumber: lineNumber,
              endColumn: line.indexOf(variant) + variant.length + 1,
              message: `"${variant}"는 올바르지 않습니다. "scanf"를 사용하세요.`,
              source: 'C Language Checker'
            });
          }
        });
        
        // 5. scanf에서 & 연산자 누락 검사
        const scanfMatch = line.match(/scanf\s*\(\s*"[^"]*"\s*,\s*([^)]+)\)/);
        if (scanfMatch) {
          const args = scanfMatch[1].split(',');
          args.forEach(arg => {
            const cleanArg = arg.trim();
            // 변수명인데 &가 없는 경우 (배열이나 문자열이 아닌 경우)
            if (cleanArg && !cleanArg.startsWith('&') && 
                !cleanArg.includes('[') && !cleanArg.includes('*') &&
                !cleanArg.includes('"')) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: lineNumber,
                startColumn: line.indexOf(cleanArg) + 1,
                endLineNumber: lineNumber,
                endColumn: line.indexOf(cleanArg) + cleanArg.length + 1,
                message: `scanf에서 변수 앞에 &를 붙여야 합니다: &${cleanArg}`,
                source: 'C Language Checker'
              });
            }
          });
        }
        
        // 6. 변수 선언 추적
        const varDeclaration = line.match(/\b(int|char|float|double)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
        if (varDeclaration) {
          varDeclaration.forEach(decl => {
            const varName = decl.split(/\s+/)[1];
            if (varName) {
              declaredVariables.add(varName);
            }
          });
        }
        
        // 7. main 함수 오타 완전 검사
        const mainVariants = ['mian', 'mnaim', 'main', 'mina', 'amni', 'mainn'];
        mainVariants.forEach(variant => {
          if (line.includes(variant) && variant !== 'main') {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineNumber,
              startColumn: line.indexOf(variant) + 1,
              endLineNumber: lineNumber,
              endColumn: line.indexOf(variant) + variant.length + 1,
              message: `"${variant}"는 올바르지 않습니다. "main"를 사용하세요.`,
              source: 'C Language Checker'
            });
          }
        });
        
        // 8. return 문 완전 검사
        const returnVariants = [
          'returno', 'retunr', 'retrn', 'retrun', 'reutrn', 'reurn',
          'retirn', 'retorn', 'retun', 'retutn'
        ];
        returnVariants.forEach(variant => {
          if (line.includes(variant)) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineNumber,
              startColumn: line.indexOf(variant) + 1,
              endLineNumber: lineNumber,
              endColumn: line.indexOf(variant) + variant.length + 1,
              message: `"${variant}"는 올바르지 않습니다. "return"를 사용하세요.`,
              source: 'C Language Checker'
            });
          }
        });
        
        // 9. 키워드 오타 검사
        const keywordVariants = {
          'fi': 'if', 'iff': 'if', 'iif': 'if',
          'esle': 'else', 'els': 'else', 'elese': 'else',
          'fro': 'for', 'ofr': 'for', 'fr': 'for',
          'whiel': 'while', 'wihle': 'while', 'whle': 'while',
          'od': 'do', 'doo': 'do',
          'swithc': 'switch', 'swtich': 'switch', 'switc': 'switch',
          'caes': 'case', 'cas': 'case', 'csae': 'case',
          'braek': 'break', 'breka': 'break', 'brak': 'break'
        };
        
        Object.entries(keywordVariants).forEach(([typo, correct]) => {
          const regex = new RegExp(`\\b${typo}\\b`, 'g');
          let match;
          while ((match = regex.exec(line)) !== null) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineNumber,
              startColumn: match.index + 1,
              endLineNumber: lineNumber,
              endColumn: match.index + typo.length + 1,
              message: `"${typo}"는 올바르지 않습니다. "${correct}"를 사용하세요.`,
              source: 'C Language Checker'
            });
          }
        });
        
        // 10. 함수 사용 시 헤더 확인
        if ((line.includes('printf') || line.includes('scanf')) && 
            !codeValue.includes('#include <stdio.h>')) {
          const funcName = line.includes('printf') ? 'printf' : 'scanf';
          const funcIndex = line.indexOf(funcName);
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: funcIndex + 1,
            endLineNumber: lineNumber,
            endColumn: funcIndex + funcName.length + 1,
            message: `${funcName}를 사용하려면 "#include <stdio.h>"를 추가해야 합니다.`,
            source: 'C Language Checker'
          });
        }
        
        // 11. 세미콜론 누락 완전 검사
        if (trimmedLine && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('/*') &&
            !trimmedLine.startsWith('#') && !trimmedLine.endsWith('{') && 
            !trimmedLine.endsWith('}') && !trimmedLine.endsWith(';') &&
            (line.includes('printf') || line.includes('scanf') || 
             line.includes('int ') || line.includes('char ') || line.includes('float ') ||
             line.includes('return') || line.includes('=')) &&
            !line.includes('if') && !line.includes('for') && !line.includes('while')) {
          markers.push({
            severity: monaco.MarkerSeverity.Warning,
            startLineNumber: lineNumber,
            startColumn: line.length,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: '문장 뒤에 세미콜론(;)이 필요합니다.',
            source: 'C Language Checker'
          });
        }
        
        // 12. 괄호 불일치 완전 검사
        const openParens = (line.match(/\(/g) || []).length;
        const closeParens = (line.match(/\)/g) || []).length;
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        
        if (openParens !== closeParens && trimmedLine !== '') {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: '소괄호 ()가 맞지 않습니다.',
            source: 'C Language Checker'
          });
        }
        
        if (openBraces !== closeBraces && (openBraces > 0 || closeBraces > 0)) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: '중괄호 {}가 맞지 않습니다.',
            source: 'C Language Checker'
          });
        }
        
        // 13. 할당 연산자 오류 (= vs ==)
        if (line.includes('if') && line.includes('=') && !line.includes('==') && !line.includes('!=')) {
          const eqIndex = line.indexOf('=');
          markers.push({
            severity: monaco.MarkerSeverity.Warning,
            startLineNumber: lineNumber,
            startColumn: eqIndex + 1,
            endLineNumber: lineNumber,
            endColumn: eqIndex + 2,
            message: 'if문에서는 비교연산자 "=="를 사용해야 합니다.',
            source: 'C Language Checker'
          });
        }
      });
      
      console.log('📊 발견된 마커들:', markers);
      monaco.editor.setModelMarkers(model, 'c-language-checker', markers);
    };
    
    // 코드 변경시마다 검사
    console.log('📋 이벤트 리스너 등록:', { enableSyntaxCheck });
    editor.onDidChangeModelContent(() => {
      console.log('📝 코드 변경 감지, 문법 검사 실행');
      validateCode();
    });
    
    // 초기 검사
    console.log('🔍 초기 문법 검사 실행');
    validateCode();
    
    // 수정사항 하이라이팅 적용
    applyModificationHighlights(editor, monaco);
    
    // 커서 위치 추적 (클릭 시 위치 저장)
    editor.onDidChangeCursorPosition((e) => {
      lastCursorPositionRef.current = e.position;
    });
  };

  // 선생님 수정사항 하이라이팅 함수
  const applyModificationHighlights = (editor, monaco) => {
    // 하이라이트 기능 완전 비활성화 - 메시지만 표시
    console.log('⚪ 하이라이트 기능 비활성화됨');
    
    // 기존 decoration이 있다면 모두 제거
    if (decorationsRef.current && decorationsRef.current.length > 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
    return;
  };

  // modifications가 변경될 때마다 하이라이팅 업데이트
  React.useEffect(() => {
    if (editorRef.current && window.monaco) {
      applyModificationHighlights(editorRef.current, window.monaco);
    }
  }, [modifications]);

  // code prop 변경 시 커서 위치 복원
  React.useEffect(() => {
    // 커서 위치 자동 복원 비활성화 - 클릭 시 커서가 임의로 이동하는 문제 해결
    console.log('🚫 커서 자동 복원 비활성화 (클릭 위치 유지를 위해)');
    
    // 이전 코드 저장
    previousCodeRef.current = code;
  }, [code]);

  const handleEditorChange = (value) => {
    const currentTime = Date.now();
    const isRecentKeyInput = isTypingRef.current && (currentTime - lastChangeTimeRef.current < 100);
    
    console.log('📝 에디터 변경 감지:', { 
      타이핑: isTypingRef.current, 
      최근키입력: isRecentKeyInput,
      시간차이: currentTime - lastChangeTimeRef.current 
    });
    
    let newValue = value || '';
    let placeholderRemoved = false;
    const savedCursorPosition = lastCursorPositionRef.current;
    
    // 표준 플레이스홀더 삭제 (백업)
    const standardPlaceholder = '// 여기에 코드를 입력하세요';
    if (newValue.includes(standardPlaceholder)) {
      console.log('🎯 handleEditorChange에서 표준 플레이스홀더 발견');
      newValue = newValue.replace(standardPlaceholder, '');
      placeholderRemoved = true;
      console.log('✨ 표준 플레이스홀더 삭제 완료');
    }
    
    console.log('📤 최종 출력:', newValue);
    onChange(newValue);
    
    // 이전 코드 참조 업데이트
    previousCodeRef.current = newValue;
    
    // 네트워크 환경에서 타이핑할 때마다 C언어 설정 유지
    if (editorRef.current) {
      const monaco = window.monaco;
      const model = editorRef.current.getModel();
      if (monaco && model) {
        // 언어가 C가 아니면 강제 설정
        if (model.getLanguageId() !== 'c') {
          console.log('🔄 타이핑 중 C언어 모드 복구');
          monaco.editor.setModelLanguage(model, 'c');
        }
        // 테마도 재적용
        monaco.editor.setTheme('custom-theme');
      }
    }
    
    // 학생이 코드를 수정하면 관리자 수정사항 하이라이트 즉시 제거
    if (userType === 'student' && editorRef.current) {
      console.log('👨‍🎓 학생이 코드 수정, 관리자 수정사항 하이라이트 제거');
      // 강제로 모든 decoration 제거
      if (decorationsRef.current && decorationsRef.current.length > 0) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
      // modifications prop도 강제로 비우기 (부모 컴포넌트에서 관리되므로 여기서는 로컬에서만)
      const emptyModifications = [];
      if (modifications && modifications.length > 0) {
        console.log('🧹 관리자 수정사항 강제 초기화');
      }
    }
  };

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      {/* CSS 스타일 주입 */}
      <style>{`
        .mentor-modification-line {
          background-color: rgba(239, 68, 68, 0.1) !important;
          border-left: 3px solid #ef4444 !important;
        }
        .mentor-modification-glyph {
          background-color: #ef4444 !important;
          width: 3px !important;
        }
        .mentor-modification-inline {
          background-color: rgba(239, 68, 68, 0.2) !important;
          border: 1px solid #ef4444 !important;
          border-radius: 3px !important;
        }
      `}</style>
      
      <div style={{ backgroundColor: '#1f2937', color: 'white', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
          <span style={{ marginLeft: '16px', fontSize: '16px' }}>code.c</span>
        </div>
      </div>
      
      <Editor
        height="400px"
        language="c"
        value={code}
        onChange={(value) => {
          console.log('🎹 Monaco Editor onChange 직접 호출됨! 값:', value);
          console.log('🔍 읽기 전용 모드:', readOnly);
          handleEditorChange(value);
        }}
        onMount={handleEditorDidMount}
        options={{
          readOnly: readOnly,
          fontSize: fontSize,
          fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: false,
          wordWrap: 'on',
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: true,
          acceptSuggestionOnEnter: 'on',
          bracketPairColorization: { enabled: true },
          matchBrackets: 'always',
          folding: true,
          foldingStrategy: 'auto',
          showFoldingControls: 'always',
          glyphMargin: true, // 왼쪽 여백에 표시를 위해 활성화
        }}
      />
    </div>
  );
};

// 학생 추가/수정 모달 컴포넌트
// 학생 추가/수정 모달 컴포넌트
const StudentModal = ({ title, student = null, onSubmit, onClose, showClassSelect = false }) => {
  const classOptions = ['월요일반', '화요일반', '수요일반', '목요일반', '금요일반', '토요일반'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const submitData = {
      name: formData.get('name'),
      studentId: formData.get('studentId'),
      class: formData.get('class') || student?.class || '월요일반'
    };
    
    console.log('폼 제출 데이터:', submitData); // 디버그용
    onSubmit(submitData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        margin: '16px'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              학생 이름
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={student?.name || ''}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none'
              }}
              placeholder="예: 홍길동"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              학번
            </label>
            <input
              name="studentId"
              type="text"
              required
              defaultValue={student?.studentId || ''}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none'
              }}
              placeholder="예: S004"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              수업 반
            </label>
            <select
              name="class"
              required
              defaultValue={student?.class || '월요일반'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              {classOptions.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {student ? '수정' : '등록'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// 반별 색상 지정 함수
const getClassColor = (className) => {
  const colors = {
    '월요일반': '#ef4444',    // 빨간색
    '화요일반': '#f59e0b',    // 주황색
    '수요일반': '#10b981',    // 초록색
    '목요일반': '#3b82f6',    // 파란색
    '금요일반': '#8b5cf6',    // 보라색
    '토요일반': '#ec4899'     // 핑크색
  };
  return colors[className] || '#6b7280';
};

// 메인 컴포넌트에 도움 요청 모달 추가
const CodingMentoringPlatformWithHelp = () => {
  const mainApp = CodingMentoringPlatform();
  
  return (
    <>
      {mainApp}
      {/* 도움 요청 모달 렌더링 */}
      {/* showHelpModal && (
        <HelpRequestModal
          onSubmit={sendHelpRequest}
          onClose={() => setShowHelpModal(false)}
          problemTitle={selectedProblem?.title || '문제'}
        />
      ) */}
    </>
  );
};

export default CodingMentoringPlatform;