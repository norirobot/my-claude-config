exports.seed = async function(knex) {
  // 기존 데이터 삭제
  await knex('point_packages').del();
  
  // 포인트 패키지 시드 데이터
  await knex('point_packages').insert([
    {
      id: 1,
      package_name: '스타터 패키지',
      points: 1000,
      price: 10000.00, // 10,000원
      bonus_points: 100, // 10% 보너스
      description: '처음 시작하는 분들을 위한 기본 패키지',
      benefits: JSON.stringify(['첫 구매 10% 보너스', '30일 유효기간']),
      is_active: true,
      sort_order: 1
    },
    {
      id: 2,
      package_name: '베이직 패키지',
      points: 3000,
      price: 25000.00, // 25,000원
      bonus_points: 500, // 16.7% 보너스
      description: '가장 인기 있는 기본 패키지',
      benefits: JSON.stringify(['16% 보너스 포인트', '60일 유효기간', '특별 할인 쿠폰']),
      is_active: true,
      sort_order: 2
    },
    {
      id: 3,
      package_name: '프리미엄 패키지',
      points: 6000,
      price: 45000.00, // 45,000원
      bonus_points: 1500, // 25% 보너스
      description: '더 많은 학습을 위한 프리미엄 패키지',
      benefits: JSON.stringify(['25% 보너스 포인트', '90일 유효기간', '프리미엄 튜터 우선 예약', '무료 레벨 테스트']),
      is_active: true,
      sort_order: 3
    },
    {
      id: 4,
      package_name: 'VIP 패키지',
      points: 12000,
      price: 80000.00, // 80,000원
      bonus_points: 4000, // 33.3% 보너스
      description: '최고의 학습 경험을 위한 VIP 패키지',
      benefits: JSON.stringify(['33% 보너스 포인트', '180일 유효기간', 'VIP 튜터 전용 예약', '1:1 맞춤 학습 플랜', '월간 학습 리포트']),
      is_active: true,
      sort_order: 4
    },
    {
      id: 5,
      package_name: '체험 패키지',
      points: 500,
      price: 5000.00, // 5,000원
      bonus_points: 0,
      description: '처음 이용하시는 분들을 위한 체험 패키지',
      benefits: JSON.stringify(['신규 사용자 전용', '15일 유효기간', '환불 가능']),
      is_active: true,
      sort_order: 0
    }
  ]);
  
  console.log('✅ Point packages seeded successfully');
};