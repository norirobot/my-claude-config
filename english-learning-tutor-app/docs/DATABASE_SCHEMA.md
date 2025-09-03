# 🗄️ Database Schema Design

## 📋 설계 원칙

### 🎯 Design Principles
- **Data Privacy**: 개인정보와 학습데이터 분리 설계
- **Scalability**: 대구 → 전국 → 글로벌 확장 고려
- **Performance**: 실시간 조회 최적화 (인덱싱 전략)
- **Flexibility**: 새로운 기능 추가시 스키마 변경 최소화
- **Audit Trail**: 모든 중요 데이터 변경 추적

---

## 🏗️ Database Architecture Overview

### 📊 Database Strategy
```
🗄️ Primary Database: PostgreSQL 15+
├── 🔐 User Management Schema
├── 📚 Learning Content Schema  
├── 🎭 Situation Engine Schema
├── 📞 Communication Schema
├── 🏆 Gamification Schema
├── 📊 Analytics Schema
└── 🌍 Location-specific Schema (Daegu Focus)

⚡ Cache Layer: Redis 7+
├── Session Management
├── Real-time Game State
├── Frequently Accessed User Data
└── API Response Caching

🔍 Search Engine: Elasticsearch (Phase 2+)
└── Learning Content Search & Recommendations
```

---

## 👥 User Management Schema

### 🔐 Core User Tables

#### **users** (기본 사용자 정보)
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    
    -- Profile Information
    display_name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(500),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    
    -- Location (Phase 1: Daegu focus)
    city VARCHAR(100) DEFAULT 'Daegu',
    district VARCHAR(100), -- 대구 구/군 (중구, 동구, 서구 등)
    coordinates POINT, -- 매칭 최적화용 위치 정보
    
    -- User Classification
    user_type ENUM('learner', 'native_tutor', 'admin') NOT NULL DEFAULT 'learner',
    account_status ENUM('active', 'inactive', 'suspended', 'deleted') DEFAULT 'active',
    
    -- Subscription & Preferences
    subscription_tier ENUM('free', 'premium', 'pro') DEFAULT 'free',
    language_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    preferred_learning_style JSONB, -- 학습 스타일 선호도
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_location ON users(city, district);
CREATE INDEX idx_users_type_status ON users(user_type, account_status);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_users_level ON users(language_level);
CREATE INDEX idx_users_coordinates ON users USING GIST(coordinates);
```

#### **user_profiles** (확장 프로필 정보)
```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Learning Goals & Motivation
    learning_goals TEXT[], -- ["business_english", "travel", "daily_conversation"]
    motivation_description TEXT,
    target_fluency_level ENUM('conversational', 'business', 'native_like'),
    
    -- Availability & Preferences  
    available_time_slots JSONB, -- 요일별 시간대 정보
    preferred_session_duration INTEGER DEFAULT 30, -- minutes
    preferred_tutor_gender ENUM('male', 'female', 'no_preference') DEFAULT 'no_preference',
    
    -- Native Tutor Specific (튜터인 경우)
    native_language VARCHAR(50),
    teaching_experience_years INTEGER,
    specializations TEXT[], -- ["business", "pronunciation", "grammar"]
    hourly_rate DECIMAL(10,2), -- Phase 2+ 유료화시 사용
    bio TEXT,
    certifications JSONB, -- 교육 자격증 정보
    
    -- Privacy & Communication
    privacy_settings JSONB, -- 프라이버시 설정
    notification_preferences JSONB, -- 알림 설정
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_availability ON user_profiles USING GIN(available_time_slots);
CREATE INDEX idx_profiles_specializations ON user_profiles USING GIN(specializations);
```

---

## 🎭 Situation Engine Schema

### 📝 Situation & Scenario Management

#### **situations** (상황 마스터 데이터)
```sql
CREATE TABLE situations (
    situation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    situation_name VARCHAR(100) NOT NULL, -- "street_greeting", "cafe_ordering"
    category VARCHAR(50) NOT NULL, -- "greetings", "ordering", "directions"
    
    -- Metadata
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    estimated_duration_seconds INTEGER DEFAULT 60,
    description TEXT,
    learning_objectives TEXT[], -- 학습 목표
    
    -- Location-specific (대구 특화)
    location_specific BOOLEAN DEFAULT false,
    target_location VARCHAR(100), -- "Daegu", "Korea", "Global"
    
    -- Content
    initial_prompt TEXT NOT NULL, -- AI가 제시할 초기 상황
    context_description TEXT, -- 상황 설명
    expected_response_patterns JSONB, -- 예상 응답 패턴들
    
    -- Status & Versioning
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_situations_category_level ON situations(category, difficulty_level);
CREATE INDEX idx_situations_location ON situations(target_location, is_active);
```

#### **situation_variations** (상황별 다양한 시나리오)
```sql
CREATE TABLE situation_variations (
    variation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    situation_id UUID REFERENCES situations(situation_id) ON DELETE CASCADE,
    
    -- Variation Details
    variation_name VARCHAR(100) NOT NULL,
    specific_context TEXT NOT NULL, -- 구체적인 상황 설명
    ai_character_role TEXT, -- AI가 연기할 역할 (점원, 길행인 등)
    
    -- Daegu-specific Elements
    local_context JSONB, -- 대구 특화 요소 (방언, 지역명소 등)
    cultural_notes TEXT, -- 문화적 맥락 설명
    
    -- Response Expectations
    ideal_responses JSONB, -- 이상적인 응답들
    acceptable_responses JSONB, -- 허용 가능한 응답들  
    common_mistakes JSONB, -- 자주 하는 실수들
    
    -- Hints & Support
    hint_levels JSONB, -- 단계별 힌트 시스템
    vocabulary_support JSONB, -- 필요한 어휘 목록
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variations_situation ON situation_variations(situation_id);
```

#### **user_situation_sessions** (사용자별 상황 학습 세션)
```sql
CREATE TABLE user_situation_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    situation_id UUID REFERENCES situations(situation_id),
    variation_id UUID REFERENCES situation_variations(variation_id),
    
    -- Session Data
    session_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end_time TIMESTAMP,
    total_duration_seconds INTEGER,
    
    -- User Performance  
    user_responses JSONB NOT NULL, -- 사용자의 모든 응답들
    ai_interactions JSONB NOT NULL, -- AI와의 상호작용 기록
    
    -- Scoring & Analysis
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    pronunciation_score INTEGER CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
    fluency_score INTEGER CHECK (fluency_score >= 0 AND fluency_score <= 100),
    appropriateness_score INTEGER CHECK (appropriateness_score >= 0 AND appropriateness_score <= 100),
    
    -- AI Feedback
    ai_feedback JSONB, -- AI 분석 결과
    improvement_suggestions JSONB, -- 개선 제안
    highlighted_mistakes JSONB, -- 지적된 실수들
    
    -- User Experience
    user_difficulty_rating INTEGER CHECK (user_difficulty_rating >= 1 AND user_difficulty_rating <= 5),
    user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating >= 1 AND user_satisfaction_rating <= 5),
    
    -- Status
    completion_status ENUM('completed', 'abandoned', 'paused') DEFAULT 'completed'
);

CREATE INDEX idx_sessions_user_time ON user_situation_sessions(user_id, session_start_time DESC);
CREATE INDEX idx_sessions_situation ON user_situation_sessions(situation_id, session_start_time);
CREATE INDEX idx_sessions_performance ON user_situation_sessions(user_id, overall_score DESC);
```

---

## 📞 Communication & Tutoring Schema

### 👥 Native Speaker Matching

#### **tutor_availability** (튜터 가용시간 관리)
```sql
CREATE TABLE tutor_availability (
    availability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Time Slots
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    
    -- Availability Status
    status ENUM('available', 'booked', 'blocked') DEFAULT 'available',
    max_concurrent_sessions INTEGER DEFAULT 1,
    
    -- Session Preferences
    preferred_session_types TEXT[] DEFAULT '{"voice", "video"}',
    notes TEXT, -- 튜터의 특이사항
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_availability_tutor_date ON tutor_availability(tutor_id, date, start_time);
CREATE INDEX idx_availability_status ON tutor_availability(status, date, start_time);
```

#### **tutor_sessions** (튜터-학습자 세션 관리)
```sql
CREATE TABLE tutor_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES users(user_id),
    tutor_id UUID REFERENCES users(user_id),
    
    -- Session Details
    session_type ENUM('voice', 'video', 'chat') NOT NULL DEFAULT 'voice',
    scheduled_start_time TIMESTAMP NOT NULL,
    scheduled_duration_minutes INTEGER DEFAULT 30,
    
    -- Actual Session Times
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    actual_duration_minutes INTEGER,
    
    -- Session Content & Focus
    focus_topics TEXT[], -- ["pronunciation", "conversation", "business_english"]
    preparation_materials JSONB, -- 사전 준비 자료
    session_agenda TEXT,
    
    -- Technology & Quality
    connection_quality ENUM('excellent', 'good', 'fair', 'poor'),
    technical_issues JSONB, -- 기술적 문제 로그
    
    -- Recording & Materials
    recording_url VARCHAR(500), -- 녹음 파일 (동의시)
    shared_materials JSONB, -- 세션 중 공유된 자료들
    
    -- Session Outcome
    session_status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    completion_notes TEXT, -- 세션 완료 후 노트
    
    -- Ratings & Feedback (양방향)
    learner_rating INTEGER CHECK (learner_rating >= 1 AND learner_rating <= 5),
    learner_feedback TEXT,
    tutor_rating INTEGER CHECK (tutor_rating >= 1 AND tutor_rating <= 5),
    tutor_feedback TEXT,
    
    -- Follow-up
    follow_up_tasks JSONB, -- 후속 과제
    next_session_recommendations TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tutor_sessions_learner ON tutor_sessions(learner_id, scheduled_start_time DESC);
CREATE INDEX idx_tutor_sessions_tutor ON tutor_sessions(tutor_id, scheduled_start_time DESC);
CREATE INDEX idx_tutor_sessions_status ON tutor_sessions(session_status, scheduled_start_time);
```

---

## 🏆 Gamification Schema

### 🎮 Points & Rewards System

#### **user_points** (사용자 포인트 관리)
```sql
CREATE TABLE user_points (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Current Points
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0, -- 사용 가능한 포인트
    used_points INTEGER DEFAULT 0,
    
    -- Lifetime Stats
    lifetime_earned_points INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    
    -- Level System
    current_level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id)
);
```

#### **point_transactions** (포인트 거래 내역)
```sql
CREATE TABLE point_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    
    -- Transaction Details
    transaction_type ENUM('earned', 'spent', 'bonus', 'penalty') NOT NULL,
    points_amount INTEGER NOT NULL, -- 양수: 획득, 음수: 사용
    
    -- Source & Reason
    source_type ENUM('daily_practice', 'perfect_score', 'streak_bonus', 'tutor_session', 
                    'challenge_complete', 'referral', 'premium_purchase', 'admin_adjustment') NOT NULL,
    source_reference_id UUID, -- 관련 세션/이벤트 ID
    description TEXT,
    
    -- Balance After Transaction
    balance_after INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_point_transactions_user_time ON point_transactions(user_id, created_at DESC);
CREATE INDEX idx_point_transactions_type ON point_transactions(transaction_type, source_type);
```

#### **achievements** (성취 시스템)
```sql
CREATE TABLE achievements (
    achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Achievement Details
    achievement_name VARCHAR(100) NOT NULL UNIQUE,
    achievement_category VARCHAR(50) NOT NULL, -- "learning", "social", "milestone"
    title VARCHAR(100) NOT NULL, -- 사용자에게 보여질 제목
    description TEXT NOT NULL,
    
    -- Requirements
    requirements JSONB NOT NULL, -- 달성 조건
    points_reward INTEGER DEFAULT 0,
    
    -- Visual & Metadata
    icon_url VARCHAR(500),
    badge_color VARCHAR(7), -- HEX color code
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **user_achievements** (사용자별 성취 기록)
```sql
CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(user_id),
    achievement_id UUID REFERENCES achievements(achievement_id),
    
    -- Achievement Progress
    progress JSONB, -- 진행 상황 상세 정보
    completed_at TIMESTAMP,
    points_earned INTEGER DEFAULT 0,
    
    -- Display Settings
    is_pinned BOOLEAN DEFAULT false, -- 프로필에 고정 표시
    is_public BOOLEAN DEFAULT true, -- 다른 사용자에게 공개
    
    PRIMARY KEY (user_id, achievement_id),
    INDEX idx_user_achievements_completed (user_id, completed_at DESC)
);
```

---

## 📊 Analytics & Performance Schema

### 📈 Learning Analytics

#### **user_learning_analytics** (학습 분석 데이터)
```sql
CREATE TABLE user_learning_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    
    -- Time Period
    period_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    
    -- Learning Volume
    total_session_count INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    unique_situations_practiced INTEGER DEFAULT 0,
    tutor_sessions_count INTEGER DEFAULT 0,
    
    -- Performance Metrics
    average_situation_score DECIMAL(5,2), -- 0-100
    average_pronunciation_score DECIMAL(5,2),
    average_fluency_score DECIMAL(5,2),
    improvement_rate DECIMAL(5,2), -- 개선율 %
    
    -- Engagement Metrics
    consecutive_days_active INTEGER DEFAULT 0,
    peak_activity_hour INTEGER, -- 0-23
    preferred_session_duration_minutes INTEGER,
    
    -- Weaknesses & Strengths
    weak_situation_categories JSONB, -- 취약한 상황 유형들
    strong_situation_categories JSONB, -- 강점 상황 유형들
    commonly_missed_patterns JSONB, -- 자주 놓치는 패턴들
    
    -- Predictions & Recommendations
    predicted_next_level_days INTEGER, -- 다음 레벨까지 예상 일수
    recommended_focus_areas JSONB, -- AI 추천 집중 영역
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_user_period ON user_learning_analytics(user_id, period_type, period_start_date);
```

---

## 🌍 Location-Specific Schema (Daegu Focus)

### 🏛️ Daegu-Specific Features

#### **daegu_locations** (대구 특화 장소 정보)
```sql
CREATE TABLE daegu_locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Location Details
    location_name VARCHAR(100) NOT NULL, -- "동성로", "김광석길", "대구역"
    location_type VARCHAR(50) NOT NULL, -- "shopping_area", "tourist_spot", "transportation"
    
    -- Geographic Information
    coordinates POINT NOT NULL,
    district VARCHAR(50) NOT NULL, -- "중구", "동구", etc.
    address TEXT,
    
    -- Language Learning Context
    common_situations JSONB, -- 이 장소에서 일어나는 일반적인 상황들
    useful_expressions JSONB, -- 이 장소에서 유용한 표현들
    cultural_notes TEXT, -- 문화적 맥락
    
    -- Media & Resources
    location_images JSONB, -- 장소 이미지 URLs
    audio_samples JSONB, -- 발음 샘플들 (대구 방언 포함)
    
    -- Usage & Popularity
    usage_frequency INTEGER DEFAULT 0, -- 학습에 사용된 횟수
    user_ratings DECIMAL(3,2), -- 평균 평점
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daegu_locations_district ON daegu_locations(district, location_type);
CREATE INDEX idx_daegu_locations_coordinates ON daegu_locations USING GIST(coordinates);
```

#### **daegu_cultural_contexts** (대구 문화적 맥락)
```sql
CREATE TABLE daegu_cultural_contexts (
    context_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Context Information
    context_name VARCHAR(100) NOT NULL,
    context_category VARCHAR(50) NOT NULL, -- "dialect", "custom", "food", "festival"
    
    -- Content
    description TEXT NOT NULL,
    english_explanation TEXT, -- 영어로 된 설명
    usage_examples JSONB, -- 사용 예시들
    
    -- Learning Integration
    related_situations JSONB, -- 관련 학습 상황들
    difficulty_level ENUM('beginner', 'intermediate', 'advanced'),
    
    -- Media Resources
    audio_examples JSONB, -- 발음 예시 (표준어 vs 사투리)
    image_references JSONB, -- 관련 이미지
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔍 Search & Recommendations Schema

### 🧠 Intelligent Recommendations

#### **user_learning_patterns** (학습 패턴 분석)
```sql
CREATE TABLE user_learning_patterns (
    user_id UUID REFERENCES users(user_id),
    
    -- Learning Behavior Patterns
    preferred_difficulty_progression VARCHAR(50), -- "gradual", "challenging", "mixed"
    optimal_session_length_minutes INTEGER,
    peak_performance_time_slots JSONB, -- 최고 성과 시간대
    learning_speed_category ENUM('slow', 'moderate', 'fast'),
    
    -- Content Preferences
    favorite_situation_categories JSONB,
    avoided_situation_types JSONB,
    preferred_interaction_style VARCHAR(50), -- "formal", "casual", "mixed"
    
    -- Social Learning Preferences
    prefers_group_learning BOOLEAN DEFAULT false,
    tutor_interaction_comfort_level INTEGER CHECK (tutor_interaction_comfort_level >= 1 AND tutor_interaction_comfort_level <= 5),
    
    -- AI Analysis Results
    learning_personality_type VARCHAR(50), -- AI가 분석한 학습 성격 유형
    predicted_success_factors JSONB, -- 성공 요인 예측
    risk_factors JSONB, -- 학습 중단 위험 요인
    
    -- Recommendations Cache
    cached_recommendations JSONB, -- 최근 추천 내용 캐싱
    last_recommendation_update TIMESTAMP,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);
```

---

## 🔐 Security & Audit Schema

### 📋 Audit Trail

#### **audit_logs** (감사 로그)
```sql
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event Details
    event_type VARCHAR(50) NOT NULL, -- "user_created", "session_completed", "points_earned"
    table_name VARCHAR(50) NOT NULL, -- 영향받은 테이블
    record_id UUID, -- 영향받은 레코드 ID
    
    -- User Context
    user_id UUID, -- 작업을 수행한 사용자
    ip_address INET,
    user_agent TEXT,
    
    -- Change Details
    old_values JSONB, -- 변경 전 값들
    new_values JSONB, -- 변경 후 값들
    change_description TEXT,
    
    -- Metadata
    session_id VARCHAR(255), -- 웹 세션 ID
    request_id VARCHAR(255), -- API 요청 ID
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_event_time ON audit_logs(event_type, created_at DESC);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, created_at DESC);
```

---

## 📊 Performance Optimization

### 🚀 Database Performance Strategies

#### **주요 성능 최적화 인덱스**
```sql
-- 실시간 조회 최적화
CREATE INDEX CONCURRENTLY idx_user_sessions_recent 
ON user_situation_sessions(user_id, session_start_time DESC) 
WHERE session_start_time > NOW() - INTERVAL '30 days';

-- 매칭 알고리즘 최적화
CREATE INDEX CONCURRENTLY idx_tutor_matching 
ON users(user_type, city, account_status) 
WHERE user_type = 'native_tutor' AND account_status = 'active';

-- 분석 쿼리 최적화
CREATE INDEX CONCURRENTLY idx_analytics_aggregation
ON user_situation_sessions(user_id, DATE(session_start_time), overall_score)
WHERE completion_status = 'completed';

-- 포인트 시스템 최적화
CREATE INDEX CONCURRENTLY idx_point_leaderboard
ON user_points(total_points DESC, current_level DESC)
WHERE total_points > 0;
```

#### **파티셔닝 전략 (Phase 2+)**
```sql
-- 시간 기반 파티셔닝 (대용량 로그 데이터)
CREATE TABLE user_situation_sessions_y2025m01 
PARTITION OF user_situation_sessions
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 지역 기반 파티셔닝 (글로벌 확장시)
CREATE TABLE users_korea 
PARTITION OF users
FOR VALUES IN ('Seoul', 'Busan', 'Daegu', 'Incheon');
```

---

## 📈 Monitoring & Maintenance

### 🔍 Database Health Monitoring
```sql
-- 성능 모니터링 뷰
CREATE VIEW db_performance_summary AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    seq_scan,
    idx_scan,
    ROUND(100 * idx_scan / (seq_scan + idx_scan), 1) AS index_usage_pct
FROM pg_stat_user_tables
ORDER BY seq_scan + idx_scan DESC;

-- 자주 사용되는 쿼리 모니터링
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100 -- 100ms 이상 쿼리
ORDER BY mean_time DESC;
```

---

**🎯 핵심 목표**: 확장 가능하고 성능 최적화된 데이터베이스로 대구에서 시작해 글로벌까지 지원하는 견고한 데이터 아키텍처 구축