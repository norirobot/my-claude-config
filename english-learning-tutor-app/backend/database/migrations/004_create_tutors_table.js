exports.up = function(knex) {
  return knex.schema.createTable('tutors', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('specialty', 100);
    table.text('bio');
    table.float('hourly_rate');
    table.json('available_times');
    table.json('languages_spoken');
    table.json('certifications');
    table.integer('years_experience');
    table.float('rating').defaultTo(0);
    table.integer('total_reviews').defaultTo(0);
    table.integer('total_sessions').defaultTo(0);
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_available').defaultTo(true);
    table.string('location_city', 100);
    table.string('location_region', 100);
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    
    // Indexes
    table.index('user_id');
    table.index('is_available');
    table.index('is_verified');
    table.index('rating');
    table.index('location_city');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tutors');
};