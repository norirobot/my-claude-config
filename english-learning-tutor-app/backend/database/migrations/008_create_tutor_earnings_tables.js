exports.up = function(knex) {
  return knex.schema
    // 튜터 수익 계정 테이블
    .createTable('tutor_earnings', function(table) {
      table.increments('id').primary();
      table.integer('tutor_id').unsigned().notNullable().unique();
      table.decimal('total_earned', 12, 2).defaultTo(0.00); // 총 수익
      table.decimal('available_balance', 12, 2).defaultTo(0.00); // 출금 가능 잔액
      table.decimal('pending_balance', 12, 2).defaultTo(0.00); // 대기중인 잔액
      table.decimal('withdrawn_total', 12, 2).defaultTo(0.00); // 총 출금액
      table.integer('total_sessions').defaultTo(0); // 총 세션 수
      table.decimal('average_rating', 3, 2).defaultTo(0.00); // 평균 평점
      table.timestamp('last_payout').nullable(); // 마지막 정산일
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('tutor_id').references('tutors.id').onDelete('CASCADE');
      
      // Indexes
      table.index('tutor_id');
      table.index('available_balance');
      table.index('total_earned');
    })
    
    // 세션별 수익 기록 테이블
    .createTable('session_earnings', function(table) {
      table.increments('id').primary();
      table.string('earnings_id', 100).unique().notNullable(); // 고유 수익 ID
      table.integer('booking_id').unsigned().notNullable();
      table.integer('tutor_id').unsigned().notNullable();
      table.integer('student_id').unsigned().notNullable();
      table.decimal('session_price', 10, 2).notNullable(); // 세션 총 금액
      table.decimal('platform_fee', 10, 2).notNullable(); // 플랫폼 수수료
      table.decimal('tutor_earning', 10, 2).notNullable(); // 튜터 수익
      table.decimal('platform_fee_rate', 5, 4).notNullable(); // 수수료율 (0.2000 = 20%)
      table.enum('status', [
        'pending',      // 대기중 (세션 완료 전)
        'completed',    // 완료 (세션 완료, 정산 대기)
        'paid_out',     // 정산 완료
        'disputed',     // 분쟁중
        'refunded'      // 환불됨
      ]).defaultTo('pending');
      table.datetime('session_date').notNullable(); // 세션 일시
      table.datetime('completed_at').nullable(); // 세션 완료 일시
      table.datetime('paid_out_at').nullable(); // 정산 완료 일시
      table.text('notes'); // 비고
      table.json('metadata'); // 추가 정보
      table.timestamps(true, true);
      
      // Foreign keys
      table.foreign('booking_id').references('bookings.id').onDelete('CASCADE');
      table.foreign('tutor_id').references('tutors.id').onDelete('CASCADE');
      table.foreign('student_id').references('users.id').onDelete('CASCADE');
      
      // Indexes
      table.index('earnings_id');
      table.index('booking_id');
      table.index('tutor_id');
      table.index('status');
      table.index('session_date');
      table.index(['tutor_id', 'status']);
      table.index(['tutor_id', 'session_date']);
    })
    
    // 출금 요청 테이블
    .createTable('payout_requests', function(table) {
      table.increments('id').primary();
      table.string('payout_id', 100).unique().notNullable(); // 고유 출금 ID
      table.integer('tutor_id').unsigned().notNullable();
      table.decimal('amount', 10, 2).notNullable(); // 출금 요청액
      table.enum('status', [
        'pending',      // 요청 대기중
        'approved',     // 승인됨
        'processing',   // 처리중
        'completed',    // 완료
        'rejected',     // 거절
        'cancelled'     // 취소
      ]).defaultTo('pending');
      table.string('bank_account', 100); // 계좌 정보 (암호화 필요)
      table.string('bank_name', 50);
      table.string('account_holder', 50);
      table.text('rejection_reason'); // 거절 사유
      table.datetime('requested_at').notNullable();
      table.datetime('processed_at').nullable();
      table.string('transaction_reference', 100); // 거래 참조번호
      table.json('processing_metadata'); // 처리 메타데이터
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('tutor_id').references('tutors.id').onDelete('CASCADE');
      
      // Indexes
      table.index('payout_id');
      table.index('tutor_id');
      table.index('status');
      table.index('requested_at');
      table.index(['tutor_id', 'status']);
    })
    
    // 플랫폼 수수료 설정 테이블
    .createTable('platform_fee_settings', function(table) {
      table.increments('id').primary();
      table.string('setting_name', 50).unique().notNullable();
      table.decimal('fee_rate', 5, 4).notNullable(); // 수수료율 (0.2000 = 20%)
      table.decimal('min_amount', 10, 2).defaultTo(0.00); // 최소 적용 금액
      table.decimal('max_amount', 10, 2).nullable(); // 최대 적용 금액
      table.text('description');
      table.boolean('is_active').defaultTo(true);
      table.datetime('effective_from').notNullable(); // 적용 시작일
      table.datetime('effective_until').nullable(); // 적용 종료일
      table.timestamps(true, true);
      
      // Indexes
      table.index('setting_name');
      table.index('is_active');
      table.index('effective_from');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('platform_fee_settings')
    .dropTableIfExists('payout_requests')
    .dropTableIfExists('session_earnings')
    .dropTableIfExists('tutor_earnings');
};