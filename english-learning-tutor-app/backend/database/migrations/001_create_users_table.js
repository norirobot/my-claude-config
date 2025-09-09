exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('name', 100).notNullable();
    table.string('phone', 20);
    table.enum('role', ['student', 'tutor', 'admin']).defaultTo('student');
    table.enum('level', ['beginner', 'intermediate', 'advanced']).defaultTo('beginner');
    table.integer('points').defaultTo(0);
    table.integer('streak_days').defaultTo(0);
    table.date('last_activity_date');
    table.json('preferences').defaultTo('{}');
    table.string('profile_image');
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.string('verification_token');
    table.string('reset_password_token');
    table.datetime('reset_password_expires');
    table.timestamps(true, true);
    
    // Indexes
    table.index('email');
    table.index('role');
    table.index('is_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};