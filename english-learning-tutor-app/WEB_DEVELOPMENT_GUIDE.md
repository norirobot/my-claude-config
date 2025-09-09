# 🌐 English Learning App - Web Development Guide

## 프로젝트 개요
React Native 앱을 웹 버전으로 확장하여 테스트 및 개발 효율성을 향상시키기 위한 웹 애플리케이션입니다.

## 📁 프로젝트 구조
```
english-learning-tutor-app/
├── backend/                 # 백엔드 서버 (기존)
│   ├── src/
│   ├── package.json
│   └── ...
├── web-app/                 # 새로 추가된 웹 앱
│   ├── index.html          # 메인 웹 애플리케이션
│   ├── styles.css          # 스타일시트
│   ├── app.js              # JavaScript 애플리케이션 로직
│   └── test.html           # 테스트 페이지
└── frontend/               # React Native 앱 (기존)
```

## 🚀 실행 방법

### 1. 백엔드 서버 시작
```bash
cd english-learning-tutor-app/backend
npm install
npm start
```

### 2. 웹 앱 접속
- 메인 앱: http://localhost:3000
- 테스트 페이지: http://localhost:3000/test.html

## ✨ 웹 앱 주요 기능

### 홈 페이지
- 앱 소개 및 주요 기능 안내
- 통계 정보 표시
- CTA 버튼으로 주요 기능 바로가기

### AI 대화 연습 페이지
- 상황별 대화 연습 (카페, 택시, 레스토랑 등)
- 실시간 Socket.io 채팅
- 음성 입력/텍스트 입력 지원
- AI 피드백 시스템

### 튜터 매칭 페이지
- 튜터 검색 및 필터링
- 튜터 프로필 표시
- 예약 시스템 (UI만 구현)

### 학습 진도 페이지
- 학습 통계 및 진도 표시
- 최근 세션 기록
- 진도 시각화

### 프로필 페이지
- 사용자 정보 관리
- 학습 목표 설정
- 앱 설정

## 🔧 기술 스택

### Frontend (Web App)
- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox/Grid 레이아웃, CSS Variables
- **Vanilla JavaScript**: ES6+, Socket.io 클라이언트
- **Socket.io Client**: 실시간 통신

### Backend (기존 유지)
- **Node.js + Express**: 서버
- **Socket.io**: 실시간 통신
- **SQLite**: 개발용 데이터베이스
- **OpenAI API**: AI 대화 기능

## 📱 반응형 디자인
- 모바일 우선 설계 (Mobile-First)
- 태블릿/데스크톱 대응
- 터치 인터페이스 최적화

## 🧪 테스트 기능

### test.html 페이지
1. **연결 테스트**: 서버 상태 확인
2. **API 테스트**: REST API 엔드포인트 테스트
3. **Socket.io 테스트**: 실시간 통신 테스트
4. **채팅 테스트**: 실제 AI 대화 테스트

### 테스트 실행 방법
```bash
# 서버 실행 후
open http://localhost:3000/test.html
```

## 🔄 개발 워크플로우

### 1. 웹에서 기능 개발 및 테스트
- 빠른 프로토타이핑
- 실시간 디버깅
- UI/UX 검증

### 2. React Native로 포팅
- 검증된 로직을 모바일 앱에 적용
- 네이티브 기능 추가
- 성능 최적화

## 🎨 디자인 시스템

### 색상 팔레트
```css
:root {
    --primary-color: #4CAF50;    /* 주 색상 */
    --secondary-color: #2196F3;  /* 보조 색상 */
    --danger-color: #f44336;     /* 위험/오류 */
    --warning-color: #ff9800;    /* 경고 */
    --success-color: #8BC34A;    /* 성공 */
    --dark-color: #333;          /* 어두운 텍스트 */
    --light-color: #f5f5f5;      /* 밝은 배경 */
}
```

### 컴포넌트
- **Cards**: 그림자와 호버 효과
- **Buttons**: 통일된 스타일과 상호작용
- **Forms**: 접근성을 고려한 입력 필드
- **Modals**: 중앙 정렬 팝업

## 🔌 Socket.io 통신

### 이벤트 목록
- `authenticate`: 사용자 인증
- `join_session`: 세션 참여
- `send_message`: 메시지 전송
- `send_voice`: 음성 데이터 전송
- `ai_response`: AI 응답 수신
- `pronunciation_feedback`: 발음 피드백

### 사용 예시
```javascript
// 인증
socket.emit('authenticate', { userId: 'user123' });

// 세션 참여
socket.emit('join_session', {
    sessionId: 'session123',
    userId: 'user123',
    situationId: 'cafe'
});

// 메시지 전송
socket.emit('send_message', {
    sessionId: 'session123',
    message: 'Hello!',
    timestamp: new Date().toISOString()
});
```

## 🔊 음성 기능

### Web Audio API 활용
- **음성 녹음**: MediaRecorder API
- **실시간 처리**: Base64 인코딩
- **권한 요청**: 마이크 접근 권한

### 구현 방법
```javascript
async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    // ... 녹음 처리
}
```

## 🚀 배포 준비

### 프로덕션 설정
1. **환경 변수**: API 키, 서버 URL 설정
2. **코드 압축**: CSS/JS 최적화
3. **CDN 설정**: 정적 파일 캐싱
4. **SSL 인증서**: HTTPS 설정

### 성능 최적화
- **이미지 최적화**: WebP 형식 사용
- **코드 분할**: 동적 임포트
- **캐싱**: Service Worker 적용
- **압축**: Gzip/Brotli 압축

## 🐛 디버깅 가이드

### 개발자 도구 활용
1. **Console**: 로그 메시지 확인
2. **Network**: API 호출 모니터링
3. **Application**: LocalStorage 확인
4. **Sources**: 브레이크포인트 설정

### 일반적인 문제들
- **CORS 오류**: 서버 설정 확인
- **Socket.io 연결 실패**: 방화벽/포트 확인
- **음성 권한 오류**: HTTPS 환경 필요
- **모바일 호환성**: 터치 이벤트 처리

## 📈 향후 계획

### Phase 1: 웹 앱 완성도 향상
- [ ] 오프라인 지원 (Service Worker)
- [ ] PWA 기능 추가
- [ ] 접근성 개선 (a11y)

### Phase 2: React Native 포팅
- [ ] React Native 앱 업데이트
- [ ] 네이티브 기능 통합
- [ ] 앱 스토어 배포

### Phase 3: 확장 기능
- [ ] 실시간 화상 통화
- [ ] 멀티 플레이어 모드
- [ ] 게임화 요소 추가

## 💡 개발 팁

### 코드 품질
- ESLint/Prettier 설정 추천
- 주석과 문서화 습관
- 컴포넌트 재사용성 고려

### 성능
- DOM 조작 최소화
- 이벤트 리스너 정리
- 메모리 누수 방지

### 사용자 경험
- 로딩 상태 표시
- 오류 처리 및 피드백
- 직관적인 내비게이션

---

**개발자**: sintt  
**최종 업데이트**: 2025-09-02  
**버전**: 1.0.0