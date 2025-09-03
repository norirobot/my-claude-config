// Mock database for testing (remove when database is configured)
const mockDB = {
  query: async (sql, params) => {
    console.log('Mock DB Query:', sql.substring(0, 50) + '...');
    return { rows: [] };
  }
};
const pool = mockDB;
const openaiService = require('../services/openaiService');
const speechAnalysisService = require('../services/speechAnalysisService');
const { fileUtils } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');

// 대구 지역 특화 상황 데이터
const situationsData = {
  daegu_local: [
    {
      id: 'daegu_taxi',
      category: 'transportation',
      title: '동대구역에서 택시 타기',
      difficulty: 'beginner',
      description: '동대구역에서 수성못까지 택시를 타는 상황',
      keyPhrases: ['Could you take me to', 'How much will it cost', 'Do you know Suseong Lake'],
      estimatedTime: 10
    },
    {
      id: 'daegu_food',
      category: 'restaurant',
      title: '동인동 찜갈비 주문하기',
      difficulty: 'intermediate',
      description: '유명한 동인동 찜갈비 골목에서 음식 주문하기',
      keyPhrases: ['table for', 'What do you recommend', 'Is it spicy', 'Check please'],
      estimatedTime: 15
    },
    {
      id: 'daegu_shopping',
      category: 'shopping',
      title: '서문시장에서 쇼핑하기',
      difficulty: 'intermediate',
      description: '서문시장에서 물건 구매하고 흥정하기',
      keyPhrases: ['How much is this', 'Can you give me a discount', 'Do you have other colors'],
      estimatedTime: 15
    }
  ],
  daily_life: [
    {
      id: 'coffee_order',
      category: 'cafe',
      title: '카페에서 커피 주문하기',
      difficulty: 'beginner',
      description: '스타벅스나 카페에서 음료 주문하기',
      keyPhrases: ['I would like', 'Size options', 'To go or for here'],
      estimatedTime: 10
    },
    {
      id: 'hospital_visit',
      category: 'health',
      title: '병원 방문하기',
      difficulty: 'advanced',
      description: '증상 설명하고 진료 받기',
      keyPhrases: ['I have a', 'It hurts when', 'How often should I take'],
      estimatedTime: 20
    }
  ],
  business: [
    {
      id: 'meeting_intro',
      category: 'business',
      title: '비즈니스 미팅 자기소개',
      difficulty: 'intermediate',
      description: '첫 비즈니스 미팅에서 자기소개하기',
      keyPhrases: ['Nice to meet you', 'I work for', 'responsible for'],
      estimatedTime: 15
    }
  ]
};

// 활성 세션 저장 (실제로는 Redis 사용 권장)
const activeSessions = new Map();

// 상황에 따른 기대 텍스트 반환 헬퍼 함수
const getExpectedTextForSituation = (situation) => {
  const expectedTexts = {
    'daegu_taxi': 'Could you take me to Suseong Lake please?',
    'daegu_food': 'I would like to order jjimgalbi for two people please',
    'daegu_shopping': 'How much is this? Can you give me a discount?',
    'coffee_order': 'I would like a large americano to go please',
    'hospital_visit': 'I have a headache and feel dizzy',
    'meeting_intro': 'Nice to meet you. I work for Samsung Electronics'
  };

  return expectedTexts[situation.id] || 'Please speak clearly in English';
};

const conversationController = {
  // 상황별 연습 목록 조회
  async getSituations(req, res) {
    try {
      const { category, difficulty } = req.query;
      let situations = [];
      
      // 모든 카테고리 결합
      Object.values(situationsData).forEach(categoryData => {
        situations = situations.concat(categoryData);
      });
      
      // 필터링
      if (category) {
        situations = situations.filter(s => s.category === category);
      }
      if (difficulty) {
        situations = situations.filter(s => s.difficulty === difficulty);
      }
      
      res.json({
        success: true,
        data: situations,
        total: situations.length
      });
    } catch (error) {
      console.error('Error getting situations:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 특정 상황 상세 정보 조회
  async getSituationDetail(req, res) {
    try {
      const { id } = req.params;
      let situation = null;
      
      // 모든 카테고리에서 검색
      for (const categoryData of Object.values(situationsData)) {
        situation = categoryData.find(s => s.id === id);
        if (situation) break;
      }
      
      if (!situation) {
        return res.status(404).json({ 
          success: false, 
          error: 'Situation not found' 
        });
      }
      
      // 사용자의 이전 연습 기록 조회
      const historyQuery = `
        SELECT COUNT(*) as practice_count, 
               AVG(score) as avg_score
        FROM practice_sessions
        WHERE user_id = $1 AND situation_id = $2
      `;
      
      const historyResult = await pool.query(historyQuery, [req.user.id, id]);
      
      res.json({
        success: true,
        data: {
          ...situation,
          userHistory: historyResult.rows[0]
        }
      });
    } catch (error) {
      console.error('Error getting situation detail:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 대화 세션 시작
  async startSession(req, res) {
    try {
      const { situationId } = req.body;
      const userId = req.user.id;
      
      // 상황 데이터 찾기
      let situation = null;
      for (const categoryData of Object.values(situationsData)) {
        situation = categoryData.find(s => s.id === situationId);
        if (situation) break;
      }
      
      if (!situation) {
        return res.status(404).json({ 
          success: false, 
          error: 'Situation not found' 
        });
      }
      
      // 세션 ID 생성
      const sessionId = uuidv4();
      
      // 세션 데이터 생성
      const sessionData = {
        sessionId,
        userId,
        situationId,
        situation,
        messages: [],
        startTime: new Date(),
        score: 0,
        feedback: []
      };
      
      // 첫 AI 메시지 생성
      const firstMessage = await openaiService.generateFirstMessage(situation);
      sessionData.messages.push({
        role: 'assistant',
        content: firstMessage,
        timestamp: new Date()
      });
      
      // 세션 저장
      activeSessions.set(sessionId, sessionData);
      
      // DB에 세션 시작 기록
      const insertQuery = `
        INSERT INTO practice_sessions 
        (id, user_id, situation_id, started_at, status)
        VALUES ($1, $2, $3, $4, 'active')
      `;
      
      await pool.query(insertQuery, [
        sessionId,
        userId,
        situationId,
        new Date()
      ]);
      
      res.json({
        success: true,
        data: {
          sessionId,
          situation,
          firstMessage,
          startTime: sessionData.startTime
        }
      });
    } catch (error) {
      console.error('Error starting session:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 대화 메시지 전송
  async sendMessage(req, res) {
    try {
      const { sessionId } = req.params;
      const { message, audioUrl } = req.body;
      const userId = req.user.id;
      
      // 세션 확인
      const session = activeSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ 
          success: false, 
          error: 'Session not found or unauthorized' 
        });
      }
      
      // 사용자 메시지 추가
      session.messages.push({
        role: 'user',
        content: message,
        audioUrl,
        timestamp: new Date()
      });
      
      // AI 응답 생성
      const aiResponse = await openaiService.generateResponse(
        session.situation,
        session.messages
      );
      
      // 문법 및 발음 피드백 생성
      const feedback = await openaiService.analyzeFeedback(
        message,
        session.situation
      );
      
      // AI 응답 추가
      session.messages.push({
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date()
      });
      
      // 피드백 저장
      if (feedback.corrections.length > 0) {
        session.feedback.push(feedback);
      }
      
      // 세션 업데이트
      activeSessions.set(sessionId, session);
      
      res.json({
        success: true,
        data: {
          aiResponse: aiResponse.content,
          feedback,
          messageCount: session.messages.length
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 대화 세션 종료 및 평가
  async endSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      
      // 세션 확인
      const session = activeSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ 
          success: false, 
          error: 'Session not found or unauthorized' 
        });
      }
      
      // 최종 평가 생성
      const evaluation = await openaiService.evaluateSession(
        session.messages,
        session.situation,
        session.feedback
      );
      
      // DB에 결과 저장
      const updateQuery = `
        UPDATE practice_sessions 
        SET ended_at = $1, 
            status = 'completed',
            score = $2,
            feedback = $3,
            message_count = $4
        WHERE id = $5
      `;
      
      await pool.query(updateQuery, [
        new Date(),
        evaluation.score,
        JSON.stringify(evaluation),
        session.messages.length,
        sessionId
      ]);
      
      // 세션 삭제
      activeSessions.delete(sessionId);
      
      res.json({
        success: true,
        data: {
          evaluation,
          duration: new Date() - session.startTime,
          messageCount: session.messages.length
        }
      });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 연습 기록 조회
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0 } = req.query;
      
      const query = `
        SELECT 
          ps.*,
          u.name as user_name
        FROM practice_sessions ps
        JOIN users u ON ps.user_id = u.id
        WHERE ps.user_id = $1 
          AND ps.status = 'completed'
        ORDER BY ps.ended_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      
      res.json({
        success: true,
        data: result.rows,
        total: result.rowCount
      });
    } catch (error) {
      console.error('Error getting history:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 음성 메시지 전송 처리
  async sendVoiceMessage(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      // 업로드된 파일 확인
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file uploaded'
        });
      }

      // 세션 확인
      const session = activeSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        // 업로드된 파일 정리
        fileUtils.deleteFile(req.file.path);
        return res.status(404).json({
          success: false,
          error: 'Session not found or unauthorized'
        });
      }

      const audioPath = req.file.path;
      const fileInfo = fileUtils.getFileInfo(audioPath);

      try {
        // 음성을 텍스트로 변환
        const transcription = await speechAnalysisService.transcribeAudio(audioPath);
        
        // 발음 분석 (상황에 맞는 기대 텍스트 사용)  
        const expectedText = getExpectedTextForSituation(session.situation);
        const pronunciationAnalysis = await speechAnalysisService.analyzePronunciation(
          expectedText,
          transcription.text,
          audioPath
        );

        // 음성 메시지 추가
        const voiceMessage = {
          role: 'user',
          content: transcription.text,
          audioPath: audioPath,
          audioInfo: fileInfo,
          timestamp: new Date(),
          analysis: pronunciationAnalysis
        };

        session.messages.push(voiceMessage);

        // AI 응답 생성
        const aiResponse = await openaiService.generateResponse(
          session.situation,
          session.messages
        );

        // 추가 피드백 생성
        const feedback = await openaiService.analyzeFeedback(
          transcription.text,
          session.situation
        );

        // AI 응답 추가
        session.messages.push({
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date()
        });

        // 세션 업데이트
        activeSessions.set(sessionId, session);

        res.json({
          success: true,
          data: {
            transcription: transcription.text,
            pronunciationScore: pronunciationAnalysis.pronunciationScore,
            pronunciationFeedback: pronunciationAnalysis.feedback,
            aiResponse: aiResponse.content,
            generalFeedback: feedback,
            audioAnalysis: pronunciationAnalysis.audioQuality,
            messageCount: session.messages.length
          }
        });

      } catch (analysisError) {
        // 분석 실패 시에도 파일 정리
        fileUtils.deleteFile(audioPath);
        throw analysisError;
      }

    } catch (error) {
      console.error('Voice message error:', error);
      
      // 에러 시 업로드된 파일 정리
      if (req.file?.path) {
        fileUtils.deleteFile(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Voice message processing failed'
      });
    }
  },

  // 상황에 따른 기대 텍스트 반환 (헬퍼 함수 래핑)
  getExpectedTextForSituation(situation) {
    return getExpectedTextForSituation(situation);
  },

  // 상황별 진행률 조회
  async getProgress(req, res) {
    try {
      const userId = req.user.id;
      
      const query = `
        SELECT 
          situation_id,
          COUNT(*) as practice_count,
          AVG(score) as avg_score,
          MAX(score) as best_score,
          MAX(ended_at) as last_practice
        FROM practice_sessions
        WHERE user_id = $1 
          AND status = 'completed'
        GROUP BY situation_id
      `;
      
      const result = await pool.query(query, [userId]);
      
      // 전체 상황 목록과 진행률 매칭
      const progressMap = {};
      result.rows.forEach(row => {
        progressMap[row.situation_id] = row;
      });
      
      // 모든 상황에 대한 진행률 정보 생성
      const allProgress = [];
      Object.values(situationsData).forEach(categoryData => {
        categoryData.forEach(situation => {
          allProgress.push({
            ...situation,
            progress: progressMap[situation.id] || {
              practice_count: 0,
              avg_score: 0,
              best_score: 0,
              last_practice: null
            }
          });
        });
      });
      
      res.json({
        success: true,
        data: allProgress,
        summary: {
          totalSituations: allProgress.length,
          practicedSituations: result.rows.length,
          totalPractices: result.rows.reduce((sum, row) => 
            sum + parseInt(row.practice_count), 0
          )
        }
      });
    } catch (error) {
      console.error('Error getting progress:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = conversationController;