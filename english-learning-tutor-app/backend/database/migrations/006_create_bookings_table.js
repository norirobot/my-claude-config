exports.up = function(knex) {
  return knex.schema.createTable('bookings', function(table) {
    table.increments('id').primary();
    table.integer('student_id').unsigned().notNullable();
    table.integer('tutor_id').unsigned().notNullable();
    table.datetime('scheduled_at').notNullable();
    table.integer('duration_minutes').defaultTo(60);
    table.enum('status', [
      'pending',      // 예약 대기 중
      'confirmed',    // 튜터가 확인함
      'in_progress',  // 수업 진행 중
      'completed',    // 수업 완료
      'cancelled',    // 취소됨
      'no_show'       // 노쇼
    ]).defaultTo('pending');
    table.string('meeting_link', 500);
    table.text('student_notes');
    table.text('tutor_notes');
    table.float('session_price');
    table.boolean('is_paid').defaultTo(false);
    table.datetime('cancelled_at');
    table.string('cancel_reason', 500);
    table.integer('student_rating');
    table.text('student_review');
    table.integer('tutor_rating');
    table.text('tutor_review');
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('student_id').references('users.id').onDelete('CASCADE');
    table.foreign('tutor_id').references('tutors.id').onDelete('CASCADE');
    
    // Indexes
    table.index('student_id');
    table.index('tutor_id');
    table.index('scheduled_at');
    table.index('status');
    table.index(['tutor_id', 'scheduled_at']);
    table.index(['student_id', 'status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('bookings');
};