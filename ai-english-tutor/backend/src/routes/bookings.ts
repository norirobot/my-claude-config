import express from 'express';
import { getDatabase } from '../database/init';
import { promisify } from 'util';
import { authenticateToken } from './auth';

const router = express.Router();

// 예약 생성
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { tutorId, scheduledAt, durationMinutes = 60, notes } = req.body;
    const userId = req.user.userId;

    if (!tutorId || !scheduledAt) {
      return res.status(400).json({ error: 'Tutor ID and scheduled time are required' });
    }

    const db = getDatabase();
    const get = promisify(db.get.bind(db));
    const run = promisify(db.run.bind(db));

    // 튜터 존재 확인
    const tutor = await get('SELECT id FROM tutors WHERE id = ? AND is_active = 1', [tutorId]);
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // 시간 중복 확인
    const existingBooking = await get(`
      SELECT id FROM bookings 
      WHERE tutor_id = ? 
      AND date(scheduled_at) = date(?) 
      AND time(scheduled_at) = time(?)
      AND status IN ('pending', 'confirmed')
    `, [tutorId, scheduledAt, scheduledAt]);

    if (existingBooking) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    // 예약 생성
    const result = await run(`
      INSERT INTO bookings (user_id, tutor_id, scheduled_at, duration_minutes, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, tutorId, scheduledAt, durationMinutes, notes]);

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.lastID,
      booking: {
        id: result.lastID,
        userId,
        tutorId,
        scheduledAt,
        durationMinutes,
        status: 'pending',
        notes
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 사용자의 예약 목록 조회
router.get('/my', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 10, offset = 0 } = req.query;

    const db = getDatabase();
    const all = promisify(db.all.bind(db));

    let query = `
      SELECT 
        b.*,
        t.name as tutor_name,
        t.avatar_url as tutor_avatar,
        t.rating as tutor_rating,
        t.hourly_rate
      FROM bookings b
      JOIN tutors t ON b.tutor_id = t.id
      WHERE b.user_id = ?
    `;
    const params: any[] = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.scheduled_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const bookings = await all(query, params);

    res.json({
      bookings,
      total: bookings.length
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 예약 상세 조회
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const db = getDatabase();
    const get = promisify(db.get.bind(db));

    const booking: any = await get(`
      SELECT 
        b.*,
        t.name as tutor_name,
        t.bio as tutor_bio,
        t.avatar_url as tutor_avatar,
        t.rating as tutor_rating,
        t.hourly_rate,
        t.specialties as tutor_specialties
      FROM bookings b
      JOIN tutors t ON b.tutor_id = t.id
      WHERE b.id = ? AND b.user_id = ?
    `, [id, userId]);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // 튜터 전문분야를 배열로 변환
    booking.tutor_specialties = booking.tutor_specialties.split(',').map((s: string) => s.trim());

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 예약 수정
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, notes } = req.body;
    const userId = req.user.userId;

    const db = getDatabase();
    const get = promisify(db.get.bind(db));
    const run = promisify(db.run.bind(db));

    // 예약 존재 확인
    const booking: any = await get('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, userId]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // 이미 시작되었거나 완료된 예약은 수정 불가
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot modify completed or cancelled bookings' });
    }

    // 시간이 변경되는 경우 중복 확인
    if (scheduledAt && scheduledAt !== booking.scheduled_at) {
      const conflictBooking = await get(`
        SELECT id FROM bookings 
        WHERE tutor_id = ? 
        AND date(scheduled_at) = date(?) 
        AND time(scheduled_at) = time(?)
        AND status IN ('pending', 'confirmed')
        AND id != ?
      `, [booking.tutor_id, scheduledAt, scheduledAt, id]);

      if (conflictBooking) {
        return res.status(409).json({ error: 'This time slot is already booked' });
      }
    }

    // 예약 수정
    const updateFields: string[] = [];
    const updateParams: any[] = [];

    if (scheduledAt) {
      updateFields.push('scheduled_at = ?');
      updateParams.push(scheduledAt);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateParams.push(notes);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateParams.push(id, userId);

    await run(
      `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateParams
    );

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 예약 취소
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const db = getDatabase();
    const get = promisify(db.get.bind(db));
    const run = promisify(db.run.bind(db));

    // 예약 존재 확인
    const booking: any = await get('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, userId]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // 이미 취소되었거나 완료된 예약은 취소 불가
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot cancel completed or already cancelled bookings' });
    }

    // 예약 시간 24시간 전에만 취소 가능
    const scheduledTime = new Date(booking.scheduled_at).getTime();
    const now = new Date().getTime();
    const hoursDiff = (scheduledTime - now) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({ error: 'Bookings can only be cancelled at least 24 hours in advance' });
    }

    // 예약 취소
    await run(
      'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelled', id]
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as bookingRoutes };