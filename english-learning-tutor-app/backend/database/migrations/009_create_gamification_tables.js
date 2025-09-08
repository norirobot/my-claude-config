exports.up = function(knex) {
  return knex.schema
    .createTable('user_levels', function(table) {
      table.increments('id').primary();
      table.string('level_name').notNullable().unique(); // beginner, intermediate, advanced, expert
      table.integer('required_xp').notNullable(); // XP needed to reach this level
      table.integer('points_multiplier').defaultTo(1); // Points multiplier for this level
      table.json('benefits'); // JSON of benefits (badges, features, etc.)
      table.string('level_color', 7).defaultTo('#3498db'); // Color for UI
      table.string('level_icon').defaultTo('⭐'); // Emoji or icon
      table.integer('level_order').notNullable(); // 1, 2, 3, 4...
      table.timestamps(true, true);
    })
    
    .createTable('achievements', function(table) {
      table.increments('id').primary();
      table.string('achievement_key').notNullable().unique(); // first_session, week_streak, etc.
      table.string('title').notNullable(); // "First Steps"
      table.text('description').notNullable(); // "Complete your first English session"
      table.string('category').notNullable(); // learning, social, streak, milestone
      table.integer('xp_reward').defaultTo(0); // XP points awarded
      table.integer('point_reward').defaultTo(0); // Bonus points awarded
      table.string('badge_icon').defaultTo('🏆'); // Badge emoji/icon
      table.string('badge_color', 7).defaultTo('#f39c12'); // Badge color
      table.json('requirements'); // JSON of requirements to unlock
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    
    .createTable('user_achievements', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('achievement_id').unsigned().notNullable();
      table.timestamp('unlocked_at').defaultTo(knex.fn.now());
      table.json('progress_data'); // JSON of progress tracking
      table.boolean('is_notified').defaultTo(false); // Has user been notified?
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('achievement_id').references('id').inTable('achievements').onDelete('CASCADE');
      table.unique(['user_id', 'achievement_id']);
      table.timestamps(true, true);
    })
    
    .createTable('daily_challenges', function(table) {
      table.increments('id').primary();
      table.date('challenge_date').notNullable().unique(); // 2025-09-08
      table.string('challenge_type').notNullable(); // session_count, streak_maintain, vocabulary_learn
      table.string('title').notNullable(); // "Complete 3 sessions today"
      table.text('description').notNullable();
      table.json('requirements'); // {session_count: 3, min_duration: 600}
      table.integer('xp_reward').defaultTo(50);
      table.integer('point_reward').defaultTo(100);
      table.string('difficulty').defaultTo('normal'); // easy, normal, hard
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    
    .createTable('user_daily_challenges', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('challenge_id').unsigned().notNullable();
      table.json('progress_data'); // Current progress tracking
      table.boolean('is_completed').defaultTo(false);
      table.timestamp('completed_at').nullable();
      table.boolean('reward_claimed').defaultTo(false);
      table.timestamp('reward_claimed_at').nullable();
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('challenge_id').references('id').inTable('daily_challenges').onDelete('CASCADE');
      table.unique(['user_id', 'challenge_id']);
      table.timestamps(true, true);
    })
    
    .createTable('leaderboards', function(table) {
      table.increments('id').primary();
      table.string('leaderboard_type').notNullable(); // weekly_xp, monthly_sessions, all_time_streak
      table.string('title').notNullable(); // "Weekly XP Champions"
      table.text('description');
      table.date('period_start'); // For periodic leaderboards
      table.date('period_end'); // For periodic leaderboards
      table.json('rewards'); // JSON of rank-based rewards
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    
    .createTable('user_stats', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().unique();
      
      // Experience & Level
      table.integer('total_xp').defaultTo(0);
      table.integer('current_level_id').unsigned().nullable();
      table.integer('level_progress_xp').defaultTo(0); // XP progress in current level
      
      // Learning Stats
      table.integer('total_sessions').defaultTo(0);
      table.integer('total_practice_minutes').defaultTo(0);
      table.integer('current_streak').defaultTo(0);
      table.integer('longest_streak').defaultTo(0);
      table.date('last_activity_date').nullable();
      
      // Achievement Stats
      table.integer('total_achievements').defaultTo(0);
      table.integer('total_badges').defaultTo(0);
      
      // Social Stats
      table.integer('tutor_sessions').defaultTo(0);
      table.integer('total_points_earned').defaultTo(0);
      table.integer('total_points_spent').defaultTo(0);
      
      // Performance Stats
      table.decimal('avg_pronunciation_score', 5, 2).defaultTo(0);
      table.decimal('avg_grammar_score', 5, 2).defaultTo(0);
      table.decimal('avg_fluency_score', 5, 2).defaultTo(0);
      table.decimal('avg_vocabulary_score', 5, 2).defaultTo(0);
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('current_level_id').references('id').inTable('user_levels').onDelete('SET NULL');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_stats')
    .dropTableIfExists('user_daily_challenges')
    .dropTableIfExists('daily_challenges')
    .dropTableIfExists('user_achievements')
    .dropTableIfExists('achievements')
    .dropTableIfExists('leaderboards')
    .dropTableIfExists('user_levels');
};