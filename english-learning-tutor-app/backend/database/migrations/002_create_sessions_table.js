exports.up = function(knex) {
  return knex.schema.createTable('practice_sessions', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('session_id', 100).unique().notNullable();
    table.string('situation_type', 50).notNullable();
    table.string('situation_title', 200);
    table.enum('difficulty', ['easy', 'medium', 'hard']).defaultTo('medium');
    table.datetime('started_at').notNullable();
    table.datetime('ended_at');
    table.integer('duration_seconds');
    table.json('conversation_history');
    table.float('overall_score');
    table.float('pronunciation_score');
    table.float('grammar_score');
    table.float('fluency_score');
    table.float('vocabulary_score');
    table.json('ai_feedback');
    table.integer('points_earned').defaultTo(0);
    table.enum('status', ['active', 'completed', 'abandoned']).defaultTo('active');
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    
    // Indexes
    table.index('user_id');
    table.index('session_id');
    table.index('status');
    table.index('started_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('practice_sessions');
};