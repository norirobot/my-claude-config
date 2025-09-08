exports.seed = async function(knex) {
  // 테스트용 예약 데이터 삽입 (기존 데이터와 충돌 방지)
  const existingBooking = await knex('bookings').where('id', 2).first();
  if (!existingBooking) {
    await knex('bookings').insert([
      {
        id: 2,
        student_id: 1,
        tutor_id: 1,
        scheduled_at: new Date('2025-09-08T14:00:00Z'),
        duration_minutes: 60,
        status: 'confirmed',
        session_price: 50000.00, // 50,000원
        is_paid: true
      }
    ]);
  }
  
  console.log('✅ Test booking for earnings created');
};