import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { SpeechRecognitionService } from '../services/speechRecognitionService';
import { db } from '../database/init-situations';

const router = Router();

// 음성 파일 업로드 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 오디오 파일만 허용
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// 음성 분석 API
router.post('/analyze', authenticateToken, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const { situationId, dialogueId, expectedText } = req.body;
    const userId = (req as any).userId;
    
    if (!req.file || !expectedText) {
      return res.status(400).json({
        success: false,
        message: 'Audio file and expected text are required'
      });
    }

    // 사용자 레벨 조회 (진도 데이터에서)
    const userProgress = db.prepare(`
      SELECT AVG(mastery_level) as avg_mastery
      FROM user_situation_progress 
      WHERE user_id = ?
    `).get(userId) as any;
    
    const userLevel = userProgress?.avg_mastery 
      ? Math.ceil(userProgress.avg_mastery / 20) // 0-100을 1-5로 변환
      : 3; // 기본 레벨

    // 음성 분석 수행
    const analysisResult = await SpeechRecognitionService.analyzeVoice(
      req.file.buffer,
      expectedText,
      userLevel
    );

    // 분석 결과를 데이터베이스에 저장
    const voiceSessionId = await this.saveVoiceSession(
      userId,
      situationId,
      dialogueId,
      expectedText,
      analysisResult
    );

    res.json({
      success: true,
      session_id: voiceSessionId,
      analysis: analysisResult,
      user_level: userLevel
    });

  } catch (error) {
    console.error('Voice analysis error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to analyze voice'
    });
  }
});

// 음성 분석 히스토리 조회
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { situationId, limit = 20 } = req.query;
    
    let query = `
      SELECT 
        vs.*,
        s.name as situation_name,
        s.name_ko as situation_name_ko
      FROM voice_sessions vs
      LEFT JOIN situations s ON s.id = vs.situation_id
      WHERE vs.user_id = ?
    `;
    
    const params: any[] = [userId];
    
    if (situationId) {
      query += ' AND vs.situation_id = ?';
      params.push(situationId);
    }
    
    query += ' ORDER BY vs.created_at DESC LIMIT ?';
    params.push(Number(limit));
    
    const sessions = db.prepare(query).all(...params);

    res.json({
      success: true,
      sessions: sessions.map(session => ({
        ...session,
        analysis_result: JSON.parse(session.analysis_result)
      }))
    });

  } catch (error) {
    console.error('Error fetching voice history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voice history'
    });
  }
});

// 발음 진도 통계 조회
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { days = 30 } = req.query;
    
    // 최근 N일 간의 발음 통계
    const stats = db.prepare(`
      SELECT 
        DATE(created_at) as practice_date,
        COUNT(*) as practice_count,
        AVG(pronunciation_score) as avg_pronunciation,
        AVG(accuracy_score) as avg_accuracy,
        AVG(fluency_score) as avg_fluency,
        AVG(completeness_score) as avg_completeness
      FROM voice_sessions 
      WHERE user_id = ? 
        AND created_at >= date('now', '-' || ? || ' days')
      GROUP BY DATE(created_at)
      ORDER BY practice_date DESC
    `).all(userId, days);
    
    // 전체 통계
    const overallStats = db.prepare(`
      SELECT 
        COUNT(*) as total_practices,
        AVG(pronunciation_score) as overall_pronunciation,
        AVG(accuracy_score) as overall_accuracy,
        AVG(fluency_score) as overall_fluency,
        AVG(completeness_score) as overall_completeness,
        MAX(pronunciation_score) as best_pronunciation,
        MIN(pronunciation_score) as worst_pronunciation
      FROM voice_sessions 
      WHERE user_id = ?
    `).get(userId) as any;
    
    // 가장 어려운 단어들
    const difficultWords = db.prepare(`
      SELECT 
        json_extract(word_scores_json, '$[*].word') as words,
        AVG(json_extract(word_scores_json, '$[*].score')) as avg_score
      FROM voice_sessions 
      WHERE user_id = ?
        AND created_at >= date('now', '-' || ? || ' days')
      GROUP BY json_extract(word_scores_json, '$[*].word')
      HAVING avg_score < 80
      ORDER BY avg_score ASC
      LIMIT 10
    `).all(userId, days);

    res.json({
      success: true,
      daily_stats: stats,
      overall: overallStats,
      difficult_words: difficultWords,
      period_days: days
    });

  } catch (error) {
    console.error('Error fetching voice stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voice statistics'
    });
  }
});

// 발음 도전 과제 추천
router.get('/challenges', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // 사용자의 약점 분석
    const weakAreas = db.prepare(`
      SELECT 
        situation_id,
        AVG(pronunciation_score) as avg_score,
        COUNT(*) as practice_count
      FROM voice_sessions 
      WHERE user_id = ? 
        AND created_at >= date('now', '-14 days')
      GROUP BY situation_id
      HAVING avg_score < 80 OR practice_count < 3
      ORDER BY avg_score ASC
      LIMIT 5
    `).all(userId);
    
    // 상황별 정보 조회
    const challenges = [];
    for (const area of weakAreas) {
      const situation = db.prepare(`
        SELECT * FROM situations WHERE id = ?
      `).get(area.situation_id);
      
      if (situation) {
        challenges.push({
          ...situation,
          current_score: Math.round(area.avg_score || 0),
          practice_count: area.practice_count,
          difficulty_reason: area.avg_score < 70 
            ? 'pronunciation_accuracy' 
            : 'needs_more_practice',
          recommended_sessions: area.practice_count < 3 ? 3 - area.practice_count : 2
        });
      }
    }
    
    res.json({
      success: true,
      challenges,
      message: challenges.length > 0 
        ? '발음 향상을 위한 맞춤 도전 과제입니다!' 
        : '현재 모든 상황에서 잘 하고 있어요! 🎉'
    });

  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pronunciation challenges'
    });
  }
});

// 음성 세션 저장 함수
async function saveVoiceSession(
  userId: string, 
  situationId: string, 
  dialogueId: string, 
  expectedText: string, 
  analysisResult: any
): Promise<number> {
  
  const insertSession = db.prepare(`
    INSERT INTO voice_sessions (
      user_id, situation_id, dialogue_id, expected_text,
      transcription, pronunciation_score, accuracy_score, 
      fluency_score, completeness_score, analysis_result,
      word_scores_json, phoneme_errors_json, timing_analysis_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertSession.run(
    userId,
    situationId || null,
    dialogueId || null,
    expectedText,
    analysisResult.transcription,
    analysisResult.pronunciation_score,
    analysisResult.accuracy_score,
    analysisResult.fluency_score,
    analysisResult.completeness_score,
    JSON.stringify(analysisResult),
    JSON.stringify(analysisResult.word_scores),
    JSON.stringify(analysisResult.phoneme_errors),
    JSON.stringify(analysisResult.timing_analysis)
  );

  return result.lastInsertRowid as number;
}

export default router;