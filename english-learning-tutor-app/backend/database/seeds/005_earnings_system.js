exports.seed = async function(knex) {
  // 플랫폼 수수료 설정
  await knex('platform_fee_settings').del();
  await knex('platform_fee_settings').insert([
    {
      id: 1,
      setting_name: 'standard_fee',
      fee_rate: 0.20, // 20%
      min_amount: 0.00,
      max_amount: null,
      description: '기본 플랫폼 수수료 20%',
      is_active: true,
      effective_from: new Date('2025-01-01'),
      effective_until: null
    },
    {
      id: 2,
      setting_name: 'premium_tutor_fee',
      fee_rate: 0.15, // 15% (향후 VIP 튜터용)
      min_amount: 50.00,
      max_amount: null,
      description: '프리미엄 튜터 할인 수수료 15%',
      is_active: false, // 현재는 비활성화
      effective_from: new Date('2025-06-01'),
      effective_until: null
    }
  ]);
  
  // 기존 튜터들의 수익 계정 생성
  await knex('tutor_earnings').del();
  
  // 튜터 ID 조회
  const tutors = await knex('tutors').select('id');
  
  if (tutors.length > 0) {
    const earningsAccounts = tutors.map(tutor => ({
      tutor_id: tutor.id,
      total_earned: 0.00,
      available_balance: 0.00,
      pending_balance: 0.00,
      withdrawn_total: 0.00,
      total_sessions: 0,
      average_rating: 0.00,
      last_payout: null
    }));
    
    await knex('tutor_earnings').insert(earningsAccounts);
  }
  
  // 샘플 세션 수익 데이터 (데모용)
  await knex('session_earnings').del();
  
  // 샘플 예약이 있다면 세션 수익 생성
  const bookings = await knex('bookings').select('*').limit(1);
  if (bookings.length > 0) {
    const booking = bookings[0];
    const sessionPrice = booking.session_price || 50000; // 기본 50,000원
    const platformFeeRate = 0.20;
    const platformFee = sessionPrice * platformFeeRate;
    const tutorEarning = sessionPrice - platformFee;
    
    await knex('session_earnings').insert({
      earnings_id: `EARN_${Date.now()}_${booking.tutor_id}`,
      booking_id: booking.id,
      tutor_id: booking.tutor_id,
      student_id: booking.student_id,
      session_price: sessionPrice,
      platform_fee: platformFee,
      tutor_earning: tutorEarning,
      platform_fee_rate: platformFeeRate,
      status: 'completed',
      session_date: booking.scheduled_at,
      completed_at: new Date(),
      paid_out_at: null
    });
    
    // 튜터 수익 계정 업데이트
    await knex('tutor_earnings')
      .where('tutor_id', booking.tutor_id)
      .update({
        total_earned: tutorEarning,
        available_balance: tutorEarning,
        total_sessions: 1,
        average_rating: 4.5
      });
  }
  
  console.log('✅ Earnings system seeded successfully');
};