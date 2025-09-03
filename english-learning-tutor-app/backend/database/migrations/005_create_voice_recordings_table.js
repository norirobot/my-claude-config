exports.up = function(knex) {
  return knex.schema.createTable('voice_recordings', function(table) {
    table.increments('id').primary();
    table.integer('session_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.string('file_path', 500);
    table.integer('duration_ms');
    table.text('transcription');
    table.float('pronunciation_score');
    table.json('phoneme_analysis');
    table.json('word_scores');
    table.string('language', 10).defaultTo('en');
    table.datetime('recorded_at').notNullable();
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('session_id').references('practice_sessions.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    
    // Indexes
    table.index('session_id');
    table.index('user_id');
    table.index('recorded_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('voice_recordings');
};