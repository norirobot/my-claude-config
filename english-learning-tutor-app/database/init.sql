-- English Learning App Database Initialization
-- Created: 2025-08-28
-- Purpose: Initialize database schema for English Learning & Tutor Connection App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- USER MANAGEMENT SCHEMA
-- ============================================================================

-- Users table (core user information)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    
    -- Profile Information
    display_name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(500),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Location (Phase 1: Daegu focus)
    city VARCHAR(100) DEFAULT 'Daegu',
    district VARCHAR(100),
    coordinates POINT,
    
    -- User Classification
    user_type VARCHAR(20) NOT NULL DEFAULT 'learner' 
        CHECK (user_type IN ('learner', 'native_tutor', 'admin')),
    account_status VARCHAR(20) DEFAULT 'active' 
        CHECK (account_status IN ('active', 'inactive', 'suspended', 'deleted')),
    
    -- Subscription & Preferences
    subscription_tier VARCHAR(20) DEFAULT 'free' 
        CHECK (subscription_tier IN ('free', 'premium', 'pro')),
    language_level VARCHAR(20) DEFAULT 'beginner' 
        CHECK (language_level IN ('beginner', 'intermediate', 'advanced')),
    preferred_learning_style JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP
);

-- User profiles (extended profile information)
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Learning Goals & Motivation
    learning_goals TEXT[] DEFAULT '{}',
    motivation_description TEXT,
    target_fluency_level VARCHAR(20) DEFAULT 'conversational' 
        CHECK (target_fluency_level IN ('conversational', 'business', 'native_like')),
    
    -- Availability & Preferences
    available_time_slots JSONB DEFAULT '{}',
    preferred_session_duration INTEGER DEFAULT 30,
    preferred_tutor_gender VARCHAR(20) DEFAULT 'no_preference' 
        CHECK (preferred_tutor_gender IN ('male', 'female', 'no_preference')),
    
    -- Native Tutor Specific
    native_language VARCHAR(50),
    teaching_experience_years INTEGER,
    specializations TEXT[] DEFAULT '{}',
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    certifications JSONB DEFAULT '{}',
    
    -- Privacy & Communication
    privacy_settings JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SITUATION ENGINE SCHEMA
-- ============================================================================

-- Situations (master situation data)
CREATE TABLE situations (
    situation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    situation_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    
    -- Metadata
    difficulty_level VARCHAR(20) NOT NULL 
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_seconds INTEGER DEFAULT 60,
    description TEXT,
    learning_objectives TEXT[] DEFAULT '{}',
    
    -- Location-specific (Daegu focus)
    location_specific BOOLEAN DEFAULT false,
    target_location VARCHAR(100) DEFAULT 'Global',
    
    -- Content
    initial_prompt TEXT NOT NULL,
    context_description TEXT,
    expected_response_patterns JSONB DEFAULT '{}',
    
    -- Status & Versioning
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Situation variations (different scenarios for each situation)
CREATE TABLE situation_variations (
    variation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    situation_id UUID REFERENCES situations(situation_id) ON DELETE CASCADE,
    
    -- Variation Details
    variation_name VARCHAR(100) NOT NULL,
    specific_context TEXT NOT NULL,
    ai_character_role TEXT,
    
    -- Daegu-specific Elements
    local_context JSONB DEFAULT '{}',
    cultural_notes TEXT,
    
    -- Response Expectations
    ideal_responses JSONB DEFAULT '{}',
    acceptable_responses JSONB DEFAULT '{}',
    common_mistakes JSONB DEFAULT '{}',
    
    -- Hints & Support
    hint_levels JSONB DEFAULT '{}',
    vocabulary_support JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User situation sessions (learning session records)
CREATE TABLE user_situation_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    situation_id UUID REFERENCES situations(situation_id),
    variation_id UUID REFERENCES situation_variations(variation_id),
    
    -- Session Data
    session_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end_time TIMESTAMP,
    total_duration_seconds INTEGER,
    
    -- User Performance
    user_responses JSONB NOT NULL DEFAULT '{}',
    ai_interactions JSONB NOT NULL DEFAULT '{}',
    
    -- Scoring & Analysis
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    pronunciation_score INTEGER CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
    fluency_score INTEGER CHECK (fluency_score >= 0 AND fluency_score <= 100),
    appropriateness_score INTEGER CHECK (appropriateness_score >= 0 AND appropriateness_score <= 100),
    
    -- AI Feedback
    ai_feedback JSONB DEFAULT '{}',
    improvement_suggestions JSONB DEFAULT '{}',
    highlighted_mistakes JSONB DEFAULT '{}',
    
    -- User Experience
    user_difficulty_rating INTEGER CHECK (user_difficulty_rating >= 1 AND user_difficulty_rating <= 5),
    user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating >= 1 AND user_satisfaction_rating <= 5),
    
    -- Status
    completion_status VARCHAR(20) DEFAULT 'completed' 
        CHECK (completion_status IN ('completed', 'abandoned', 'paused'))
);

-- ============================================================================
-- TUTOR MATCHING SCHEMA
-- ============================================================================

-- Tutor availability
CREATE TABLE tutor_availability (
    availability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Time Slots
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    
    -- Availability Status
    status VARCHAR(20) DEFAULT 'available' 
        CHECK (status IN ('available', 'booked', 'blocked')),
    max_concurrent_sessions INTEGER DEFAULT 1,
    
    -- Session Preferences
    preferred_session_types TEXT[] DEFAULT '{"voice", "video"}',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutor sessions
CREATE TABLE tutor_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Session Details
    session_type VARCHAR(20) NOT NULL DEFAULT 'voice' 
        CHECK (session_type IN ('voice', 'video', 'chat')),
    scheduled_start_time TIMESTAMP NOT NULL,
    scheduled_duration_minutes INTEGER DEFAULT 30,
    
    -- Actual Session Times
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    actual_duration_minutes INTEGER,
    
    -- Session Content & Focus
    focus_topics TEXT[] DEFAULT '{}',
    preparation_materials JSONB DEFAULT '{}',
    session_agenda TEXT,
    
    -- Technology & Quality
    connection_quality VARCHAR(20) CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')),
    technical_issues JSONB DEFAULT '{}',
    
    -- Recording & Materials
    recording_url VARCHAR(500),
    shared_materials JSONB DEFAULT '{}',
    
    -- Session Outcome
    session_status VARCHAR(20) DEFAULT 'scheduled' 
        CHECK (session_status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    completion_notes TEXT,
    
    -- Ratings & Feedback
    learner_rating INTEGER CHECK (learner_rating >= 1 AND learner_rating <= 5),
    learner_feedback TEXT,
    tutor_rating INTEGER CHECK (tutor_rating >= 1 AND tutor_rating <= 5),
    tutor_feedback TEXT,
    
    -- Follow-up
    follow_up_tasks JSONB DEFAULT '{}',
    next_session_recommendations TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GAMIFICATION SCHEMA
-- ============================================================================

-- User points
CREATE TABLE user_points (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Current Points
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    used_points INTEGER DEFAULT 0,
    
    -- Lifetime Stats
    lifetime_earned_points INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    
    -- Level System
    current_level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Point transactions
CREATE TABLE point_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_type VARCHAR(20) NOT NULL 
        CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty')),
    points_amount INTEGER NOT NULL,
    
    -- Source & Reason
    source_type VARCHAR(30) NOT NULL 
        CHECK (source_type IN ('daily_practice', 'perfect_score', 'streak_bonus', 'tutor_session',
                               'challenge_complete', 'referral', 'premium_purchase', 'admin_adjustment')),
    source_reference_id UUID,
    description TEXT,
    
    -- Balance After Transaction
    balance_after INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements
CREATE TABLE achievements (
    achievement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Achievement Details
    achievement_name VARCHAR(100) NOT NULL UNIQUE,
    achievement_category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    
    -- Requirements
    requirements JSONB NOT NULL DEFAULT '{}',
    points_reward INTEGER DEFAULT 0,
    
    -- Visual & Metadata
    icon_url VARCHAR(500),
    badge_color VARCHAR(7),
    rarity VARCHAR(20) DEFAULT 'common' 
        CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    
    -- Achievement Progress
    progress JSONB DEFAULT '{}',
    completed_at TIMESTAMP,
    points_earned INTEGER DEFAULT 0,
    
    -- Display Settings
    is_pinned BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    
    PRIMARY KEY (user_id, achievement_id)
);

-- ============================================================================
-- DAEGU-SPECIFIC SCHEMA
-- ============================================================================

-- Daegu locations
CREATE TABLE daegu_locations (
    location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Location Details
    location_name VARCHAR(100) NOT NULL,
    location_type VARCHAR(50) NOT NULL,
    
    -- Geographic Information
    coordinates POINT NOT NULL,
    district VARCHAR(50) NOT NULL,
    address TEXT,
    
    -- Language Learning Context
    common_situations JSONB DEFAULT '{}',
    useful_expressions JSONB DEFAULT '{}',
    cultural_notes TEXT,
    
    -- Media & Resources
    location_images JSONB DEFAULT '{}',
    audio_samples JSONB DEFAULT '{}',
    
    -- Usage & Popularity
    usage_frequency INTEGER DEFAULT 0,
    user_ratings DECIMAL(3,2),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daegu cultural contexts
CREATE TABLE daegu_cultural_contexts (
    context_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Context Information
    context_name VARCHAR(100) NOT NULL,
    context_category VARCHAR(50) NOT NULL,
    
    -- Content
    description TEXT NOT NULL,
    english_explanation TEXT,
    usage_examples JSONB DEFAULT '{}',
    
    -- Learning Integration
    related_situations JSONB DEFAULT '{}',
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Media Resources
    audio_examples JSONB DEFAULT '{}',
    image_references JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ANALYTICS SCHEMA
-- ============================================================================

-- User learning analytics
CREATE TABLE user_learning_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Time Period
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    
    -- Learning Volume
    total_session_count INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    unique_situations_practiced INTEGER DEFAULT 0,
    tutor_sessions_count INTEGER DEFAULT 0,
    
    -- Performance Metrics
    average_situation_score DECIMAL(5,2),
    average_pronunciation_score DECIMAL(5,2),
    average_fluency_score DECIMAL(5,2),
    improvement_rate DECIMAL(5,2),
    
    -- Engagement Metrics
    consecutive_days_active INTEGER DEFAULT 0,
    peak_activity_hour INTEGER,
    preferred_session_duration_minutes INTEGER,
    
    -- Weaknesses & Strengths
    weak_situation_categories JSONB DEFAULT '{}',
    strong_situation_categories JSONB DEFAULT '{}',
    commonly_missed_patterns JSONB DEFAULT '{}',
    
    -- Predictions & Recommendations
    predicted_next_level_days INTEGER,
    recommended_focus_areas JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User learning patterns
CREATE TABLE user_learning_patterns (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Learning Behavior Patterns
    preferred_difficulty_progression VARCHAR(50),
    optimal_session_length_minutes INTEGER,
    peak_performance_time_slots JSONB DEFAULT '{}',
    learning_speed_category VARCHAR(20) CHECK (learning_speed_category IN ('slow', 'moderate', 'fast')),
    
    -- Content Preferences
    favorite_situation_categories JSONB DEFAULT '{}',
    avoided_situation_types JSONB DEFAULT '{}',
    preferred_interaction_style VARCHAR(50),
    
    -- Social Learning Preferences
    prefers_group_learning BOOLEAN DEFAULT false,
    tutor_interaction_comfort_level INTEGER CHECK (tutor_interaction_comfort_level >= 1 AND tutor_interaction_comfort_level <= 5),
    
    -- AI Analysis Results
    learning_personality_type VARCHAR(50),
    predicted_success_factors JSONB DEFAULT '{}',
    risk_factors JSONB DEFAULT '{}',
    
    -- Recommendations Cache
    cached_recommendations JSONB DEFAULT '{}',
    last_recommendation_update TIMESTAMP,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT SCHEMA
-- ============================================================================

-- Audit logs
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event Details
    event_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    
    -- User Context
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    -- Change Details
    old_values JSONB,
    new_values JSONB,
    change_description TEXT,
    
    -- Metadata
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_location ON users(city, district);
CREATE INDEX idx_users_type_status ON users(user_type, account_status);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_users_coordinates ON users USING GIST(coordinates);

-- User profiles indexes
CREATE INDEX idx_profiles_availability ON user_profiles USING GIN(available_time_slots);
CREATE INDEX idx_profiles_specializations ON user_profiles USING GIN(specializations);

-- Situations indexes
CREATE INDEX idx_situations_category_level ON situations(category, difficulty_level);
CREATE INDEX idx_situations_location ON situations(target_location, is_active);
CREATE INDEX idx_variations_situation ON situation_variations(situation_id);

-- Session indexes
CREATE INDEX idx_sessions_user_time ON user_situation_sessions(user_id, session_start_time DESC);
CREATE INDEX idx_sessions_situation ON user_situation_sessions(situation_id, session_start_time);
CREATE INDEX idx_sessions_performance ON user_situation_sessions(user_id, overall_score DESC);

-- Tutor indexes
CREATE INDEX idx_availability_tutor_date ON tutor_availability(tutor_id, date, start_time);
CREATE INDEX idx_availability_status ON tutor_availability(status, date, start_time);
CREATE INDEX idx_tutor_sessions_learner ON tutor_sessions(learner_id, scheduled_start_time DESC);
CREATE INDEX idx_tutor_sessions_tutor ON tutor_sessions(tutor_id, scheduled_start_time DESC);
CREATE INDEX idx_tutor_sessions_status ON tutor_sessions(session_status, scheduled_start_time);

-- Points and achievements indexes
CREATE INDEX idx_point_transactions_user_time ON point_transactions(user_id, created_at DESC);
CREATE INDEX idx_point_transactions_type ON point_transactions(transaction_type, source_type);
CREATE INDEX idx_user_achievements_completed ON user_achievements(user_id, completed_at DESC);

-- Analytics indexes
CREATE INDEX idx_analytics_user_period ON user_learning_analytics(user_id, period_type, period_start_date);

-- Audit indexes
CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_event_time ON audit_logs(event_type, created_at DESC);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, created_at DESC);

-- Daegu-specific indexes
CREATE INDEX idx_daegu_locations_district ON daegu_locations(district, location_type);
CREATE INDEX idx_daegu_locations_coordinates ON daegu_locations USING GIST(coordinates);

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert initial situations for Daegu
INSERT INTO situations (situation_name, category, difficulty_level, description, initial_prompt, context_description, location_specific, target_location) VALUES 
('daegu_subway_directions', 'directions', 'beginner', 'Asking for directions in Daegu subway', 'You are lost in Daegu subway station. Ask for help to get to your destination.', 'Common scenario for tourists and new residents in Daegu', true, 'Daegu'),
('daegu_cafe_ordering', 'ordering', 'beginner', 'Ordering coffee at a local Daegu cafe', 'You want to order your favorite drink at a cafe in Dongseongno area.', 'Typical cafe interaction in Daegu downtown', true, 'Daegu'),
('daegu_market_shopping', 'shopping', 'intermediate', 'Shopping at Seomun Market', 'You are at Seomun Market looking for local specialties and want to negotiate prices.', 'Traditional market experience unique to Daegu', true, 'Daegu');

-- Insert situation variations
INSERT INTO situation_variations (situation_id, variation_name, specific_context, ai_character_role, local_context) 
SELECT 
    s.situation_id,
    'Basic subway help',
    'Tourist asking subway staff for directions to popular destinations',
    'Friendly subway station staff',
    '{"locations": ["Dongdaegu Station", "Daegu Station", "Banwoldang", "Kyungpook National University"], "common_phrases": ["실례합니다", "어떻게 가면 되나요?"]}'
FROM situations s WHERE s.situation_name = 'daegu_subway_directions';

-- Insert basic achievements
INSERT INTO achievements (achievement_name, achievement_category, title, description, requirements, points_reward, rarity) VALUES 
('first_session', 'learning', 'First Steps', 'Complete your first learning session', '{"session_count": 1}', 50, 'common'),
('daegu_local', 'location', 'Daegu Local', 'Complete 10 Daegu-specific situation practices', '{"daegu_sessions": 10}', 200, 'rare'),
('pronunciation_master', 'skill', 'Pronunciation Pro', 'Achieve 95% pronunciation score 5 times', '{"pronunciation_95_count": 5}', 300, 'epic'),
('week_streak', 'engagement', 'Weekly Warrior', 'Practice for 7 consecutive days', '{"streak_days": 7}', 150, 'rare');

-- Insert Daegu locations
INSERT INTO daegu_locations (location_name, location_type, coordinates, district, address, common_situations, useful_expressions) VALUES 
('동성로', 'shopping_area', POINT(128.5966, 35.8703), '중구', '대구광역시 중구 동성로', '["shopping", "dining", "meeting_friends"]', '{"shopping": ["얼마예요?", "깎아 주세요"], "dining": ["뭐가 맛있어요?", "추천해 주세요"]}'),
('대구역', 'transportation', POINT(128.6185, 35.8786), '동구', '대구광역시 동구 신천동', '["directions", "transportation", "greeting"]', '{"directions": ["어떻게 가요?", "몇 번 출구로 나가면 되나요?"], "transportation": ["KTX", "무궁화호", "새마을호"]}'),
('서문시장', 'market', POINT(128.5834, 35.8712), '중구', '대구광역시 중구 큰장로26길', '["bargaining", "food_tasting", "cultural_experience"]', '{"bargaining": ["좀 깎아 주세요", "싸게 해 주세요"], "food": ["맛 좀 볼 수 있을까요?", "이거 어떻게 먹어요?"]}');

-- Update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_situations_updated_at BEFORE UPDATE ON situations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON user_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutor_availability_updated_at BEFORE UPDATE ON tutor_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutor_sessions_updated_at BEFORE UPDATE ON tutor_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_learning_patterns_updated_at BEFORE UPDATE ON user_learning_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- ============================================================================

-- This section will be populated with sample data for testing
-- (Only in development environment)

COMMIT;

-- Success message
SELECT 'English Learning App database initialized successfully! 🎓' as message;