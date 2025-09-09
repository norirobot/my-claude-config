-- Additional schema for conversation practice functionality
-- This extends the existing database schema with conversation-specific tables

-- Practice sessions table (for conversation practice tracking)
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    situation_id VARCHAR(100) NOT NULL, -- Reference to situational data (can be external)
    
    -- Session timing
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    
    -- Session status and completion
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'completed', 'abandoned')),
    
    -- Performance scoring
    score INTEGER CHECK (score >= 0 AND score <= 100),
    message_count INTEGER DEFAULT 0,
    
    -- AI feedback and analysis
    feedback JSONB DEFAULT '{}',
    
    -- Session metadata
    session_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation messages table (for storing conversation history)
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
    
    -- Message details
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    audio_url VARCHAR(500), -- For voice messages
    
    -- Message analysis
    grammar_score INTEGER CHECK (grammar_score >= 0 AND grammar_score <= 100),
    pronunciation_score INTEGER CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
    appropriateness_score INTEGER CHECK (appropriateness_score >= 0 AND appropriateness_score <= 100),
    
    -- AI feedback for this message
    feedback JSONB DEFAULT '{}',
    corrections JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking per situation
CREATE TABLE IF NOT EXISTS user_situation_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    situation_id VARCHAR(100) NOT NULL,
    
    -- Progress metrics
    total_attempts INTEGER DEFAULT 0,
    completed_attempts INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    
    -- Learning progression
    current_level VARCHAR(20) DEFAULT 'beginner',
    mastery_percentage INTEGER DEFAULT 0 CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
    
    -- Timestamps
    first_attempt_at TIMESTAMP,
    last_attempt_at TIMESTAMP,
    mastered_at TIMESTAMP,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate entries
    UNIQUE(user_id, situation_id)
);

-- Conversation analytics summary
CREATE TABLE IF NOT EXISTS conversation_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Time period
    period_date DATE NOT NULL,
    period_type VARCHAR(20) DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    
    -- Volume metrics
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_practice_minutes INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_session_score DECIMAL(5,2) DEFAULT 0,
    average_grammar_score DECIMAL(5,2) DEFAULT 0,
    average_pronunciation_score DECIMAL(5,2) DEFAULT 0,
    average_appropriateness_score DECIMAL(5,2) DEFAULT 0,
    
    -- Progress indicators
    new_situations_tried INTEGER DEFAULT 0,
    situations_mastered INTEGER DEFAULT 0,
    improvement_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Engagement metrics
    streak_days INTEGER DEFAULT 0,
    favorite_situations JSONB DEFAULT '{}',
    difficulty_distribution JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for period tracking
    UNIQUE(user_id, period_date, period_type)
);

-- ============================================================================
-- INDEXES FOR CONVERSATION TABLES
-- ============================================================================

-- Practice sessions indexes
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_situation_id ON practice_sessions(situation_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_started ON practice_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_status ON practice_sessions(status, started_at);

-- Conversation messages indexes
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role ON conversation_messages(role, created_at);

-- User situation progress indexes
CREATE INDEX IF NOT EXISTS idx_user_situation_progress_user_id ON user_situation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_situation_progress_situation ON user_situation_progress(situation_id);
CREATE INDEX IF NOT EXISTS idx_user_situation_progress_mastery ON user_situation_progress(mastery_percentage DESC);

-- Conversation analytics indexes
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_user_period ON conversation_analytics(user_id, period_date);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_period_type ON conversation_analytics(period_type, period_date);

-- ============================================================================
-- TRIGGERS FOR CONVERSATION TABLES
-- ============================================================================

-- Update triggers for updated_at columns
CREATE TRIGGER update_practice_sessions_updated_at 
    BEFORE UPDATE ON practice_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_situation_progress_updated_at 
    BEFORE UPDATE ON user_situation_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_analytics_updated_at 
    BEFORE UPDATE ON conversation_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE CONVERSATION DATA
-- ============================================================================

-- This will be useful for testing the conversation functionality
COMMIT;

SELECT 'Conversation schema tables added successfully! 💬' as message;