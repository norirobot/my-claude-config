# 🏗️ Technical Architecture Design

## 🎯 설계 원칙

### 📐 Architecture Principles
- **Scalability First**: 대구 → 전국 → 글로벌 확장성 고려
- **Cost-Effective**: Phase 1 무료 서비스를 위한 비용 최적화
- **Modular Design**: 기능별 독립적 개발/배포 가능
- **Performance**: 실시간 음성/영상 통화 최적화
- **Security**: 개인정보 및 학습 데이터 보호

---

## 🏛️ System Architecture Overview

### 📱 Client Architecture (Multi-Platform)

#### **React Native** (선택 이유)
- **Cross-Platform**: iOS/Android 동시 개발
- **Cost-Effective**: 개발 리소스 최적화
- **Real-time**: WebRTC 지원으로 화상통화 구현
- **Community**: 풍부한 라이브러리 생태계

```
📱 Mobile App (React Native)
├── 🎤 Speech Recognition Module
├── 📞 WebRTC Communication
├── 🎯 Situation Engine UI
├── 📊 Analytics Tracking
├── 🏆 Gamification Interface
└── 👤 User Profile Management
```

### ⚙️ Backend Architecture (Microservices)

#### **Node.js + Express** (선택 이유)
- **JavaScript Ecosystem**: Frontend와 언어 통일
- **Real-time**: Socket.io로 실시간 통신 최적화
- **Scalability**: 마이크로서비스 아키텍처 적합
- **Cost**: 오픈소스로 라이선스 비용 절약

```
🖥️ Backend Services
├── 🔐 Auth Service (JWT + OAuth)
├── 👤 User Management Service
├── 🎭 Situation Engine Service
├── 🤖 AI Analysis Service (Python)
├── 📞 Communication Service (WebRTC)
├── 💎 Points & Gamification Service
├── 🔗 Matching Service (Native Speakers)
└── 📊 Analytics & Reporting Service
```

---

## 🛠️ Technology Stack Details

### 🖱️ Frontend Stack
```javascript
// Primary Framework
React Native 0.73+
├── Navigation: @react-navigation/native
├── State Management: Redux Toolkit + RTK Query
├── UI Components: NativeBase / Tamagui
├── Audio/Video: react-native-webrtc
├── Speech: @react-native-voice/voice
├── Maps: react-native-maps (for Daegu locations)
└── Analytics: react-native-analytics
```

### ⚡ Backend Stack
```javascript
// API Gateway & Services
Node.js 20+ LTS
├── Framework: Express.js + Helmet (security)
├── Real-time: Socket.io
├── Authentication: JWT + Passport.js
├── Validation: Joi + express-rate-limit
├── Documentation: Swagger/OpenAPI
├── Testing: Jest + Supertest
└── Monitoring: Winston + Morgan
```

### 🤖 AI & ML Stack
```python
# AI Services (Separate Python Service)
Python 3.11+
├── Speech Recognition: OpenAI Whisper / Google Speech-to-Text
├── Text Analysis: OpenAI GPT-4 API
├── Voice Synthesis: ElevenLabs / Google Text-to-Speech
├── ML Framework: TensorFlow / PyTorch
├── API Framework: FastAPI
└── Audio Processing: librosa + pydub
```

### 🗄️ Database Architecture
```sql
-- Primary Database: PostgreSQL 15+
├── User Data: 개인정보, 프로필, 설정
├── Learning Progress: 학습 기록, 점수, 분석
├── Situation Database: 상황별 시나리오, 응답 패턴
├── Matching Data: 튜터-학습자 매칭 기록
└── Analytics: 사용 통계, 성과 지표

-- Cache Layer: Redis 7+
├── Session Management
├── Real-time Data (채팅, 통화 상태)
├── Frequently Accessed Data
└── API Response Caching
```

---

## 🌐 Infrastructure & DevOps

### ☁️ Cloud Strategy (Phase별 접근)

#### **Phase 1: 대구 테스트** (Cost-Optimized)
```yaml
Platform: AWS Korea (ap-northeast-2)
Compute:
  - EC2 t3.medium (2-3 instances)
  - Application Load Balancer
  - Auto Scaling Group (min: 2, max: 5)
  
Database:
  - RDS PostgreSQL (db.t3.micro)
  - ElastiCache Redis (cache.t3.micro)
  
Storage:
  - S3 Standard (audio files, images)
  - CloudFront CDN (static assets)
  
Monitoring:
  - CloudWatch Basic
  - Simple notification system
  
Estimated Cost: ~$200-400/month
```

#### **Phase 2: 전국 확장** (Performance Focus)
```yaml
Platform: Multi-AZ deployment
Compute:
  - ECS Fargate (container orchestration)
  - API Gateway + Lambda (serverless functions)
  - Auto Scaling (min: 5, max: 20)
  
Database:
  - RDS PostgreSQL Multi-AZ (db.r6g.large)
  - ElastiCache Redis Cluster
  - Read Replicas for analytics
  
Additional Services:
  - SQS for async processing
  - SNS for notifications
  - Elasticsearch for search
  
Estimated Cost: ~$1,500-3,000/month
```

#### **Phase 3: 글로벌** (Global Scale)
```yaml
Platform: Multi-region deployment
Architecture:
  - Kubernetes (EKS) multi-region
  - Global Load Balancer
  - CDN with global edge locations
  
Database:
  - Aurora Global Database
  - DynamoDB for real-time data
  - Data warehousing with Redshift
  
Advanced Services:
  - Machine Learning Pipeline (SageMaker)
  - Advanced Analytics (QuickSight)
  - Global monitoring (Datadog/New Relic)
```

---

## 🔧 Service Architecture Breakdown

### 🎭 Situation Engine Service
```javascript
// 핵심 상황별 대화 시스템
class SituationEngine {
  // 랜덤 상황 생성
  generateRandomSituation(userLevel, preferences) {
    // 사용자 레벨과 선호도 기반 상황 선택
    // 대구 지역 특화 상황 포함 (대구 방언, 지역 명소 등)
  }
  
  // 응답 분석 및 피드백
  analyzeUserResponse(situation, userResponse) {
    // AI 분석 서비스 호출
    // 실시간 점수 및 개선점 제공
  }
  
  // 개인화 추천
  getPersonalizedRecommendations(userId) {
    // 사용자별 약점 분석
    // 맞춤형 상황 추천
  }
}
```

### 🤖 AI Analysis Service (Python/FastAPI)
```python
# AI 분석 전용 서비스
from fastapi import FastAPI
from transformers import pipeline

class AIAnalysisService:
    def __init__(self):
        self.speech_recognizer = WhisperASR()
        self.text_analyzer = GPTAnalyzer()
        self.pronunciation_scorer = PronunciationAnalyzer()
    
    async def analyze_speech(self, audio_data):
        """음성 데이터 종합 분석"""
        # 1. Speech to Text
        transcript = await self.speech_recognizer.transcribe(audio_data)
        
        # 2. Pronunciation Analysis  
        pronunciation_score = self.pronunciation_scorer.score(audio_data, transcript)
        
        # 3. Content Analysis
        content_feedback = await self.text_analyzer.analyze(transcript)
        
        return {
            "transcript": transcript,
            "pronunciation_score": pronunciation_score,
            "content_feedback": content_feedback,
            "improvement_suggestions": self.generate_suggestions(...)
        }
```

### 📞 Real-time Communication Service
```javascript
// WebRTC 기반 실시간 통신
const WebRTCService = {
  // 네이티브 스피커와 학습자 연결
  async initiateCall(learnerId, tutorId) {
    // 1. 매칭 확인 및 권한 검증
    // 2. WebRTC 연결 설정
    // 3. 통화 품질 모니터링
    // 4. 자동 녹음 (동의시)
  },
  
  // 통화 품질 최적화
  optimizeConnection(connectionStats) {
    // 네트워크 상태 기반 품질 조정
    // 대구 지역 네트워크 특성 고려
  }
}
```

---

## 📊 Data Architecture & Analytics

### 🗃️ Database Schema Design

#### **Users Table** (Core User Data)
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile JSONB NOT NULL, -- 유연한 프로필 정보
    location VARCHAR(100) DEFAULT 'Daegu', -- Phase 1: 대구 기본값
    user_type ENUM('learner', 'tutor', 'admin') NOT NULL,
    subscription_tier ENUM('free', 'premium', 'pro') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_type ON users(user_type);
```

#### **Learning Sessions** (학습 기록)
```sql  
CREATE TABLE learning_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    situation_type VARCHAR(50) NOT NULL, -- 'greeting', 'ordering', etc.
    session_data JSONB NOT NULL, -- 상황별 상세 데이터
    performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
    ai_feedback JSONB, -- AI 분석 결과
    duration_seconds INTEGER,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_date ON learning_sessions(user_id, completed_at);
CREATE INDEX idx_sessions_situation ON learning_sessions(situation_type);
```

#### **Native Speaker Matching** (튜터 매칭)
```sql
CREATE TABLE tutor_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES users(user_id),
    tutor_id UUID REFERENCES users(user_id),
    session_type ENUM('voice', 'video') NOT NULL,
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
    feedback JSONB,
    recording_url VARCHAR(500), -- 녹음 파일 (동의시)
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled'
);
```

### 📈 Analytics & Monitoring

#### **Real-time Metrics Dashboard**
```javascript
// 실시간 모니터링 지표
const MetricsCollector = {
  // 사용자 활동 추적
  trackUserActivity: (userId, action, metadata) => {
    // Redis로 실시간 집계
    // 일별/주별/월별 통계 생성
  },
  
  // 앱 성능 모니터링  
  trackPerformance: (endpoint, responseTime, errorRate) => {
    // API 응답시간 추적
    // 오류율 모니터링
    // 알림 시스템 연동
  },
  
  // 학습 효과 측정
  trackLearningProgress: (userId, sessionData) => {
    // 개인별 학습 곡선 생성
    // 전체 사용자 평균과 비교
    // 개선 영역 식별
  }
}
```

---

## 🔐 Security & Privacy

### 🛡️ Security Measures
```javascript
// 보안 계층별 구현
const SecurityLayers = {
  // API 보안
  apiSecurity: {
    rateLimiting: "express-rate-limit", // API 호출 제한
    authentication: "JWT + Refresh Token", // 인증
    authorization: "RBAC (Role-Based Access)", // 권한 관리
    inputValidation: "Joi + sanitization", // 입력 검증
    encryption: "AES-256 for sensitive data" // 암호화
  },
  
  // 데이터 보안
  dataSecurity: {
    encryption: "PostgreSQL TDE", // 저장 데이터 암호화
    backup: "Encrypted automated backups", // 백업 암호화
    access: "IAM roles + MFA", // 접근 제어
    audit: "CloudTrail + custom logging" // 감사 로그
  },
  
  // 통신 보안
  networkSecurity: {
    https: "TLS 1.3 everywhere", // HTTPS 강제
    webrtc: "DTLS for voice/video", // WebRTC 암호화
    api: "API Gateway with WAF", // 웹 방화벽
    ddos: "CloudFlare DDoS protection" // DDoS 보호
  }
}
```

### 🔒 Privacy Compliance
- **GDPR 준수**: EU 사용자 데이터 보호 (Phase 3 글로벌 진출시)
- **개인정보보호법**: 국내 개인정보 처리 규정 준수
- **음성 데이터 보호**: 녹음 데이터 암호화 및 제한적 보관
- **데이터 최소화**: 필요한 최소한의 데이터만 수집

---

## 🚀 Development & Deployment Strategy

### 🔄 CI/CD Pipeline
```yaml
# GitHub Actions 기반 CI/CD
name: Deploy English Learning App

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Tests
        run: |
          npm test
          python -m pytest tests/
          
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Build React Native
        run: |
          npx react-native bundle
          
      - name: Build Docker Images
        run: |
          docker build -t english-app-api .
          
  deploy:
    runs-on: ubuntu-latest
    needs: [test, build]
    steps:
      - name: Deploy to AWS
        run: |
          # Phase 1: Simple EC2 deployment
          # Phase 2+: ECS/Kubernetes deployment
```

### 📦 Development Environment
```dockerfile
# Development Docker Compose
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: english_app
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

---

## 📊 Performance & Scalability

### ⚡ Performance Targets
- **API Response Time**: < 200ms (90th percentile)
- **Voice Call Setup**: < 3 seconds
- **App Launch Time**: < 2 seconds
- **Speech Recognition**: < 1 second processing
- **Concurrent Users**: 1,000+ (Phase 1), 10,000+ (Phase 2)

### 🔧 Optimization Strategies
- **Database**: Query optimization, indexing, connection pooling
- **Caching**: Redis for frequently accessed data
- **CDN**: Static assets delivery optimization  
- **Code Splitting**: React Native bundle optimization
- **Image Optimization**: WebP format, lazy loading
- **Audio Compression**: Optimal codec selection for voice data

---

**🎯 핵심 목표**: 확장 가능하고 비용 효율적인 아키텍처로 대구에서 시작해 글로벌까지 성장 가능한 시스템 구축