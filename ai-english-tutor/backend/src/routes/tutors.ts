import express from 'express';
import { getDatabase } from '../database/init';
import { promisify } from 'util';
import { authenticateToken } from './auth';

const router = express.Router();

// 모든 튜터 목록 조회
router.get('/', async (req, res) => {
  try {
    const { specialty, minRating, maxRate } = req.query;
    
    const db = getDatabase();
    const all = promisify(db.all.bind(db));

    let query = 'SELECT * FROM tutors WHERE is_active = 1';
    const params: any[] = [];

    // 필터링 조건 추가
    if (specialty) {
      query += ' AND specialties LIKE ?';
      params.push(`%${specialty}%`);
    }

    if (minRating) {
      query += ' AND rating >= ?';
      params.push(parseFloat(minRating as string));
    }

    if (maxRate) {
      query += ' AND hourly_rate <= ?';
      params.push(parseFloat(maxRate as string));
    }

    query += ' ORDER BY rating DESC, hourly_rate ASC';

    const tutors = await all(query, params);

    // 각 튜터의 specialties를 배열로 변환
    const formattedTutors = tutors.map((tutor: any) => ({
      ...tutor,
      specialties: tutor.specialties.split(',').map((s: string) => s.trim()),
      languages: tutor.languages.split(',').map((l: string) => l.trim())
    }));

    res.json({
      tutors: formattedTutors,
      total: formattedTutors.length
    });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 특정 튜터 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = getDatabase();
    const get = promisify(db.get.bind(db));

    const tutor: any = await get('SELECT * FROM tutors WHERE id = ? AND is_active = 1', [id]);

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // specialties와 languages를 배열로 변환
    const formattedTutor = {
      ...tutor,
      specialties: tutor.specialties.split(',').map((s: string) => s.trim()),
      languages: tutor.languages.split(',').map((l: string) => l.trim())
    };

    res.json(formattedTutor);
  } catch (error) {
    console.error('Get tutor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 튜터 검색
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const db = getDatabase();
    const all = promisify(db.all.bind(db));

    const tutors = await all(`
      SELECT * FROM tutors 
      WHERE is_active = 1 
      AND (
        name LIKE ? OR 
        specialties LIKE ? OR 
        bio LIKE ?
      )
      ORDER BY rating DESC
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);

    const formattedTutors = tutors.map((tutor: any) => ({
      ...tutor,
      specialties: tutor.specialties.split(',').map((s: string) => s.trim()),
      languages: tutor.languages.split(',').map((l: string) => l.trim())
    }));

    res.json({
      tutors: formattedTutors,
      total: formattedTutors.length,
      query
    });
  } catch (error) {
    console.error('Search tutors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 튜터 매칭 알고리즘
router.post('/match', authenticateToken, async (req: any, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.userId;

    const db = getDatabase();
    const all = promisify(db.all.bind(db));
    const get = promisify(db.get.bind(db));

    // 사용자의 학습 진도 조회
    const userProgress: any = await get(
      'SELECT * FROM learning_progress WHERE user_id = ?',
      [userId]
    );

    // 모든 활성 튜터 조회
    let tutors = await all('SELECT * FROM tutors WHERE is_active = 1');

    // 매칭 스코어 계산
    tutors = tutors.map((tutor: any) => {
      let score = 0;

      // 평점 점수 (40%)
      score += (tutor.rating / 5) * 40;

      // 전문 분야 매칭 (30%)
      if (preferences?.specialties) {
        const tutorSpecialties = tutor.specialties.split(',').map((s: string) => s.trim());
        const matchingSpecialties = preferences.specialties.filter((pref: string) =>
          tutorSpecialties.some((spec: string) => 
            spec.toLowerCase().includes(pref.toLowerCase())
          )
        );
        score += (matchingSpecialties.length / preferences.specialties.length) * 30;
      }

      // 가격 선호도 (20%)
      if (preferences?.maxBudget) {
        if (tutor.hourly_rate <= preferences.maxBudget) {
          score += 20;
        } else {
          score += Math.max(0, 20 * (1 - (tutor.hourly_rate - preferences.maxBudget) / preferences.maxBudget));
        }
      }

      // 사용자 레벨에 따른 조정 (10%)
      if (userProgress) {
        if (userProgress.total_sessions < 5) {
          // 초보자 - 친화적인 튜터 선호
          if (tutor.specialties.includes('Conversation') || tutor.specialties.includes('Beginner')) {
            score += 10;
          }
        } else if (userProgress.avg_session_score > 85) {
          // 고급 학습자 - 전문 튜터 선호
          if (tutor.specialties.includes('Business') || tutor.specialties.includes('Academic')) {
            score += 10;
          }
        }
      }

      return {
        ...tutor,
        matchScore: Math.round(score),
        specialties: tutor.specialties.split(',').map((s: string) => s.trim()),
        languages: tutor.languages.split(',').map((l: string) => l.trim())
      };
    });

    // 매칭 스코어로 정렬
    tutors.sort((a: any, b: any) => b.matchScore - a.matchScore);

    res.json({
      matchedTutors: tutors.slice(0, 5), // 상위 5명만 반환
      preferences,
      userLevel: userProgress?.avg_session_score || 0
    });
  } catch (error) {
    console.error('Tutor matching error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as tutorRoutes };