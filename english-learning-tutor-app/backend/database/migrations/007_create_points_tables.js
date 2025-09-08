exports.up = function(knex) {
  return knex.schema
    // 사용자 지갑 테이블
    .createTable('user_wallets', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().unique();
      table.decimal('balance', 10, 2).defaultTo(0.00); // 포인트 잔액
      table.decimal('pending_balance', 10, 2).defaultTo(0.00); // 대기중인 포인트
      table.timestamp('last_updated').defaultTo(knex.fn.now());
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      
      // Indexes
      table.index('user_id');
      table.index('balance');
    })
    
    // 포인트 거래 내역 테이블
    .createTable('point_transactions', function(table) {
      table.increments('id').primary();
      table.string('transaction_id', 100).unique().notNullable(); // 고유 거래 ID
      table.integer('user_id').unsigned().notNullable();
      table.enum('type', [
        'charge',       // 포인트 충전
        'spend',        // 포인트 사용
        'refund',       // 환불
        'bonus',        // 보너스 지급
        'penalty'       // 페널티 차감
      ]).notNullable();
      table.decimal('amount', 10, 2).notNullable(); // 거래 금액 (양수/음수)
      table.decimal('balance_before', 10, 2).notNullable(); // 거래 전 잔액
      table.decimal('balance_after', 10, 2).notNullable(); // 거래 후 잔액
      table.string('description', 500); // 거래 설명
      table.string('reference_type', 50); // 연관 테이블 타입 (booking, session 등)
      table.integer('reference_id'); // 연관 테이블 ID
      table.enum('status', [
        'pending',      // 대기중
        'completed',    // 완료
        'failed',       // 실패
        'cancelled'     // 취소
      ]).defaultTo('pending');
      table.json('metadata'); // 추가 정보 (JSON)
      table.timestamps(true, true);
      
      // Foreign keys
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      
      // Indexes
      table.index('user_id');
      table.index('transaction_id');
      table.index('type');
      table.index('status');
      table.index(['user_id', 'type']);
      table.index(['reference_type', 'reference_id']);
      table.index('created_at');
    })
    
    // 포인트 충전 패키지 테이블
    .createTable('point_packages', function(table) {
      table.increments('id').primary();
      table.string('package_name', 100).notNullable(); // 패키지명
      table.integer('points').notNullable(); // 포인트 수량
      table.decimal('price', 10, 2).notNullable(); // 실제 가격 (원)
      table.integer('bonus_points').defaultTo(0); // 보너스 포인트
      table.text('description'); // 패키지 설명
      table.boolean('is_active').defaultTo(true); // 활성 상태
      table.integer('sort_order').defaultTo(0); // 정렬 순서
      table.json('benefits'); // 추가 혜택 (JSON)
      table.timestamps(true, true);
      
      // Indexes
      table.index('is_active');
      table.index('sort_order');
      table.index('price');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('point_packages')
    .dropTableIfExists('point_transactions')
    .dropTableIfExists('user_wallets');
};