import express from 'express';
import { getDatabase } from '../database/init';
import { promisify } from 'util';
import { authenticateToken } from './auth';

const router = express.Router();

// AI 채팅 세션 시작
router.post('/sessions', authenticateToken, async (req: any, res) => {
  try {
    const { aiTutor = 'Jennifer', topic } = req.body;
    const userId = req.user.userId;

    const db = getDatabase();
    const run = promisify(db.run.bind(db));

    const result = await run(`
      INSERT INTO chat_sessions (user_id, ai_tutor, topic)
      VALUES (?, ?, ?)
    `, [userId, aiTutor, topic]);

    res.status(201).json({
      message: 'Chat session started',
      sessionId: result.lastID,
      session: {
        id: result.lastID,
        userId,
        aiTutor,
        topic,
        messageCount: 0,
        sessionScore: 0,
        startedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Start chat session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI 채팅 메시지 전송
router.post('/sessions/:sessionId/messages', authenticateToken, async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const db = getDatabase();
    const get = promisify(db.get.bind(db));
    const run = promisify(db.run.bind(db));

    // 세션 존재 확인
    const session: any = await get(
      'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // 사용자 메시지 저장
    await run(`
      INSERT INTO chat_messages (session_id, sender, message)
      VALUES (?, ?, ?)
    `, [sessionId, 'user', message.trim()]);

    // AI 응답 생성 (실제 구현에서는 OpenAI API 호출)
    const aiResponse = await generateAIResponse(message, session.ai_tutor, session.topic);
    
    // AI 응답 저장
    const evaluationScore = Math.floor(Math.random() * 21) + 80; // 80-100 점수
    await run(`
      INSERT INTO chat_messages (session_id, sender, message, evaluation_score, feedback)
      VALUES (?, ?, ?, ?, ?)
    `, [sessionId, 'ai', aiResponse.message, evaluationScore, aiResponse.feedback]);

    // 세션 정보 업데이트
    await run(`
      UPDATE chat_sessions 
      SET message_count = message_count + 2,
          session_score = (
            SELECT AVG(evaluation_score) 
            FROM chat_messages 
            WHERE session_id = ? AND evaluation_score IS NOT NULL
          )
      WHERE id = ?
    `, [sessionId, sessionId]);

    res.json({
      userMessage: {
        sender: 'user',
        message: message.trim(),
        timestamp: new Date().toISOString()
      },
      aiResponse: {
        sender: 'ai',
        message: aiResponse.message,
        evaluationScore,
        feedback: aiResponse.feedback,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 채팅 세션 히스토리 조회
router.get('/sessions/:sessionId/messages', authenticateToken, async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const db = getDatabase();
    const get = promisify(db.get.bind(db));
    const all = promisify(db.all.bind(db));

    // 세션 권한 확인
    const session = await get(
      'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // 메시지 조회
    const messages = await all(`
      SELECT * FROM chat_messages 
      WHERE session_id = ? 
      ORDER BY timestamp ASC
    `, [sessionId]);

    res.json({
      session,
      messages,
      total: messages.length
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 사용자의 모든 채팅 세션 조회
router.get('/sessions', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const db = getDatabase();
    const all = promisify(db.all.bind(db));

    const sessions = await all(`
      SELECT 
        id,
        ai_tutor,
        topic,
        message_count,
        session_score,
        session_duration,
        created_at,
        ended_at
      FROM chat_sessions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit as string), parseInt(offset as string)]);

    res.json({
      sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 채팅 세션 종료
router.post('/sessions/:sessionId/end', authenticateToken, async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const db = getDatabase();
    const get = promisify(db.get.bind(db));
    const run = promisify(db.run.bind(db));

    // 세션 존재 확인
    const session: any = await get(
      'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    if (session.ended_at) {
      return res.status(400).json({ error: 'Session already ended' });
    }

    // 세션 종료 시간 계산
    const startTime = new Date(session.created_at).getTime();
    const endTime = new Date().getTime();
    const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));

    // 세션 종료
    await run(`
      UPDATE chat_sessions 
      SET ended_at = CURRENT_TIMESTAMP, session_duration = ?
      WHERE id = ?
    `, [durationMinutes, sessionId]);

    // 사용자 학습 진도 업데이트
    await updateLearningProgress(userId, session.session_score, durationMinutes);

    res.json({
      message: 'Chat session ended successfully',
      sessionSummary: {
        sessionId,
        messageCount: session.message_count,
        sessionScore: session.session_score,
        durationMinutes
      }
    });
  } catch (error) {
    console.error('End chat session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI 응답 생성 함수 (실제로는 OpenAI API 호출)
async function generateAIResponse(userMessage: string, aiTutor: string, topic?: string): Promise<{message: string, feedback: string}> {
  // 간단한 응답 생성 로직 (실제로는 OpenAI API 사용)
  const responses = [
    {
      message: "That's a great point! Can you tell me more about your thoughts on this topic?",
      feedback: "Great job expressing your opinion! Try to use more descriptive adjectives next time."
    },
    {
      message: "I understand what you're saying. How would you handle this situation in your daily life?",
      feedback: "Good vocabulary usage! Consider varying your sentence structure for better flow."
    },
    {
      message: "That's interesting! What made you think about it that way?",
      feedback: "Excellent use of present tense! Keep practicing complex sentence structures."
    }
  ];

  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// 학습 진도 업데이트 함수
async function updateLearningProgress(userId: number, sessionScore: number, durationMinutes: number): Promise<void> {
  const db = getDatabase();
  const get = promisify(db.get.bind(db));
  const run = promisify(db.run.bind(db));

  const progress: any = await get('SELECT * FROM learning_progress WHERE user_id = ?', [userId]);

  if (progress) {
    const newTotalSessions = progress.total_sessions + 1;
    const newTotalHours = progress.total_study_hours + (durationMinutes / 60);
    const newAvgScore = ((progress.avg_session_score * progress.total_sessions) + sessionScore) / newTotalSessions;

    // 연속 학습일 계산
    const today = new Date().toISOString().split('T')[0];
    const lastStudyDate = progress.last_study_date;
    let newStreak = progress.current_streak;

    if (lastStudyDate !== today) {
      const lastDate = new Date(lastStudyDate || 0);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(progress.longest_streak, newStreak);

    await run(`
      UPDATE learning_progress 
      SET 
        total_sessions = ?,
        total_study_hours = ?,
        avg_session_score = ?,
        current_streak = ?,
        longest_streak = ?,
        last_study_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [newTotalSessions, newTotalHours, newAvgScore, newStreak, longestStreak, today, userId]);
  }
}

export { router as chatRoutes };