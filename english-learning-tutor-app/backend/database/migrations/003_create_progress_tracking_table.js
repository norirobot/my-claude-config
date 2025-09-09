exports.up = function(knex) {
  return knex.schema.createTable('user_progress', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.date('date').notNullable();
    table.integer('practice_minutes').defaultTo(0);
    table.integer('sessions_completed').defaultTo(0);
    table.integer('words_learned').defaultTo(0);
    table.integer('points_earned').defaultTo(0);
    table.float('average_pronunciation_score');
    table.float('average_grammar_score');
    table.float('average_fluency_score');
    table.json('situations_practiced');
    table.json('weak_areas');
    table.json('achievements_unlocked');
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    
    // Unique constraint - one record per user per day
    table.unique(['user_id', 'date']);
    
    // Indexes
    table.index('user_id');
    table.index('date');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_progress');
};