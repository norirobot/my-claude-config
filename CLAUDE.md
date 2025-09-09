# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📌 다음 세션 시작점 - 2025-09-10
### ⚡ 즉시 확인 사항

1. **attok 출결 모니터링** ⭐ 작업 중
   ```bash
   cd attok-monitor
   python simple_gui_final.py  # 현재 버전 실행
   ```
   - ⚠️ **미해결**: 깜빡임 문제, 로그인 개선 필요
   - ✅ 완료: 개별 시간 조절, 실시간 정렬, 하원 표시
   - 자세한 내용: `attok-monitor/SESSION_2025_09_09.md` 참고

2. **영어 학습 앱 프로젝트**:
   - 위치: `my-claude-config/ai-english-tutor/`
   ```bash
   # Frontend (포트 3001)
   cd my-claude-config/ai-english-tutor/frontend && npm run dev
   
   # Backend (포트 3003)  
   cd my-claude-config/ai-english-tutor/backend && PORT=3003 npm run dev
   ```

3. **비주얼 노벨 모드**:
   - URL: http://localhost:3001/visual-story
   - 로컬 애셋 시스템 구현 완료

### 🎮 2025-01-09 작업 내용
1. **Visual Novel Story Mode 구현**
   - 전체 화면 배경 + 캐릭터 시스템
   - 하단 대화창 UI (35% 화면)
   - 감정 표현 시스템 (happy, sad, surprised 등)
   - 관계도 레벨 시스템

2. **캐릭터 컴포넌트 변천사**
   - GameCharacter → AnimeCharacter → SimpleCharacter → ProfessionalCharacter → RealisticCharacter → VisualNovelCharacter → **LocalAssetCharacter (최종)**
   - 로컬 이미지 애셋 사용 시스템 구축

3. **폴더 구조 생성**:
   ```
   frontend/public/assets/
   ├── characters/
   │   ├── jennifer/
   │   ├── alex/
   │   └── sophia/
   ├── backgrounds/
   └── ui/
   ```

### ⚠️ 발생했던 이슈들
1. **캐릭터 디자인 문제**:
   - SVG 직접 그리기 → 너무 유치함
   - 실제 사람 사진 → 배경과 안 어울림
   - 이모티콘 스타일 → 게임과 안 맞음
   - **해결**: 로컬 애셋 시스템으로 실제 비주얼 노벨 이미지 사용

2. **배경과 캐릭터 미스매치**:
   - 실사 배경 + 만화 캐릭터 조합 부자연스러움
   - **해결 필요**: 배경도 애니메이션 스타일로 통일 필요

### 📝 내일 할 일
1. **실제 캐릭터 애셋 다운로드**:
   - itch.io에서 무료 비주얼 노벨 스프라이트 다운로드
   - 각 캐릭터별 표정 이미지 (normal, happy, sad, surprised)
   - `/public/assets/characters/` 폴더에 배치

2. **배경 이미지 교체**:
   - 현재: Unsplash 실사 이미지
   - 변경: 애니메이션 스타일 배경 이미지
   - 또는 AI로 생성 (Bing Image Creator)

3. **백엔드 연동 테스트**:
   - CharacterAIService.js 작동 확인
   - OpenAI API 연결 테스트
   - 대화 데이터 저장 기능

4. **추가 기능**:
   - 세이브/로드 시스템
   - 사운드 효과
   - 배경 음악

### 🔗 참고 자료
- 애셋 가이드: `/frontend/public/assets/ASSET_GUIDE.md`
- 무료 애셋: https://itch.io (visual novel sprites free 검색)
- 이미지 생성: https://www.bing.com/images/create

## 🏠 Home PC Setup Completed - 2025-09-02
- SSH 키 설정 완료
- GitHub 연동 성공
- 자동 동기화 준비 완료

# Claude Code Configuration

## 🚀 Session Startup Rules

**IMPORTANT**: Claude Code startup behavior and interaction rules.

### 🔄 Startup Auto-Check
**MANDATORY**: Every session start, automatically check for updates
1. **Always check git status first** - `git status` to see if changes exist
2. **Auto-pull if behind** - `git pull origin master` if remote has updates  
3. **Notify user of changes** - Show what files were updated from other PC
4. **Check requirements.txt** - Alert if new Python packages need installation

### General Behavior Rules
1. **Concise responses**: Keep answers brief and direct unless detail requested
2. **Proactive assistance**: Suggest helpful tools and methods automatically  
3. **Auto-commit**: Always commit CLAUDE.md changes immediately after editing
4. **Korean support**: Full Korean language support in all interactions
5. **Tool optimization**: Use multiple tools efficiently in single responses
6. **최상위 AI 모델 강제 사용**: 모든 프로그램 개발 시 반드시 최상위 모델(현재 Claude Sonnet 4) 사용. 사용량 한계 도달시에도 최고 품질 유지 필수

### 🛑 종료 명령어 시스템
**트리거**: 사용자가 "종료", "끝", "exit", "quit" 입력 시 자동 실행

#### 종료 시 자동 처리 체크리스트:
1. **프로젝트 진행상황 저장**
   - PROJECTS.md 업데이트 (완료율, 현재 작업)
   - TodoWrite로 작업 목록 최종 정리
   - 다음 세션 시작점 명확히 기록

2. **오류 패턴 정리 & 저장**
   - 세션 중 발생한 모든 오류 수집
   - CLAUDE.md 오류 패턴 섹션 업데이트
   - error_patterns.json 파일 생성

3. **코드 변경사항 커밋**
   ```bash
   git add -A
   git status  # 변경사항 확인
   git commit -m "Session end: [날짜] - [주요 작업 내용]"
   git push origin master
   ```

4. **개발 서버 종료**
   - 실행 중인 모든 백그라운드 프로세스 종료
   - 포트 정리 (3000, 3001, 3002 등)

5. **다음 세션 준비 메모**
   ```markdown
   ## 📌 다음 세션 시작점
   - 마지막 작업: [작업 내용]
   - 다음 할 일: [계획된 작업]
   - 주의사항: [특별히 기억할 점]
   ```

6. **최종 요약 출력**
   ```
   ✅ 오늘 세션 완료!
   - 작업 시간: [시작-종료]
   - 완료 항목: X개
   - 해결한 오류: Y개
   - 커밋 완료: [커밋 해시]
   
   💤 다음 세션에서 이어서 작업하세요!
   ```

### Project Status Tracking
6. **Auto-check projects**: When user asks about projects or seems lost, automatically read and display PROJECTS.md
7. **Project file location**: `C:\Users\sintt\PROJECTS.md`
8. **Common triggers**: "프로젝트 현황", "어디서부터", "뭐 하고 있었지", "project status", "what was I working on"
9. **Always suggest next steps**: Based on current project status, provide actionable next steps

### Universal Search System
10. **Auto-search**: When user asks about finding files or information, automatically search across all locations
11. **Search locations**: Current directory, Obsidian vault (`X:\ms\Logan`), project folders, git history
12. **Common triggers**: "어디 저장했지", "찾아줘", "뭔가 했었는데", "파일 있나", "search", "find"
13. **Search methods**: Use Grep for content, Glob for filenames, LS for directory browsing
14. **Smart suggestions**: Offer related files and alternative search terms based on partial matches

---

## Obsidian Vault Access

This configuration enables Claude Code to access the Obsidian vault located at `X:\ms\Logan`.

### Vault Information
- **Vault Path**: X:\ms\Logan
- **Vault Name**: Logan's Knowledge Base
- **Access Method**: Direct filesystem access

### Available Resources
Claude Code can now read, search, and analyze all markdown files in the Obsidian vault, including:
- Notes and documentation
- Research materials
- AI reference materials
- Project folders and subfolders

### Usage Examples
- Search for specific topics: Use Grep tool with pattern matching
- Read specific notes: Use Read tool with file paths from X:\ms\Logan
- List vault contents: Use LS tool to explore directory structure
- Find files by name: Use Glob tool with patterns like "*.md"

This configuration ensures persistent access to the Obsidian vault across all Claude Code sessions.

## Auto-Commit Configuration

**Important**: When Claude updates CLAUDE.md file, automatically commit to git.

### Auto-Commit Rules
1. Always commit CLAUDE.md changes immediately after editing
2. Use descriptive commit messages: "Update CLAUDE.md - [specific changes]"  
3. Push to remote repository automatically
4. No need to ask user permission for CLAUDE.md commits

### Git Auto-Commit Commands
```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md - [description of changes]"
git push origin master
```

## YouTube Channel Analysis Automation

### Bulk Video Script Download Method

**Command Template**:
```bash
yt-dlp --write-auto-sub --sub-lang ko --skip-download "https://www.youtube.com/@channel_name"
```

**Complete Analysis Pipeline**:
```bash
# 1. Download all video subtitles
yt-dlp --write-auto-sub --sub-lang ko --skip-download "CHANNEL_URL"

# 2. Run auto-analysis script
python simple_analysis.py

# 3. Results will be saved in categorized folders
```

### Auto-Analysis Features
- **Filters out**: Greetings, casual talk, unnecessary content
- **Extracts**: Core insights and valuable information
- **Categorizes**: Automatically sorts content by topic
- **Prioritizes**: Most important content based on relevance
- **Saves**: Top insights as organized markdown files

### Usage Recommendations
When user mentions YouTube analysis or script download:
1. Automatically suggest bulk download method
2. Offer complete analysis pipeline
3. Provide categorized results in Obsidian-compatible format
4. Save results in organized folder structure

## File Management Rules

### Preferred Actions
1. **Always prefer editing** existing files over creating new ones
2. **Read before edit**: Always read files before making changes
3. **Organized storage**: Save results in logical folder structures
4. **Markdown format**: Use consistent markdown formatting
5. **UTF-8 encoding**: Ensure proper Korean/Unicode support

### Tool Usage Guidelines
- **Batch operations**: Use multiple tools in single responses when possible
- **Efficient search**: Use Grep, Glob, and LS tools effectively
- **Context awareness**: Consider file context before making changes
- **Error handling**: Check for file existence and permissions

This configuration ensures optimal Claude Code performance and user experience.

## 🐛 일반적 오류 패턴 & 해결법

**목적**: 반복되는 개발 오류를 사전에 방지하고 빠르게 해결하기 위한 패턴 라이브러리

### React/MUI 관련 오류 ⭐⭐⭐

#### IconButton Import 오류
- **증상**: `does not provide an export named 'IconButton'` 오류
- **원인**: `@mui/icons-material`에서 IconButton을 import 시도
- **해결법**: `@mui/material`에서 import 해야 함
```typescript
// ❌ 잘못된 방법
import { IconButton } from '@mui/icons-material'

// ✅ 올바른 방법  
import { IconButton } from '@mui/material'
```

#### MUI 컴포넌트 Import 체크리스트
- **Icons**: `@mui/icons-material` (HomeIcon, SettingsIcon 등)
- **Components**: `@mui/material` (Button, IconButton, Box 등)
- **Lab Components**: `@mui/lab` (LoadingButton 등)

### React Router 관련 오류 ⭐⭐

#### 중첩 Routes 구조 오류
- **증상**: 페이지가 렌더링되지 않음, 흰 화면
- **원인**: Routes 안에 Routes를 중첩하여 사용
- **해결법**: 각 Route를 개별적으로 Layout으로 감싸기
```typescript
// ❌ 잘못된 중첩 구조
<Route path="/*" element={
  <Layout>
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  </Layout>
} />

// ✅ 올바른 개별 구조
<Route path="/dashboard" element={
  <Layout>
    <DashboardPage />
  </Layout>
} />
```

### Redux/State 관리 오류 ⭐⭐

#### 빈 Reducer 오류
- **증상**: `Store does not have a valid reducer` 오류
- **원인**: configureStore에 빈 객체나 undefined reducer 전달
- **해결법**: 최소한 더미 reducer라도 추가
```typescript
// ❌ 빈 reducer 객체
export const store = configureStore({
  reducer: {}
})

// ✅ 더미 reducer 추가
const dummySlice = {
  name: 'app',
  initialState: { initialized: true },
  reducers: {}
}

export const store = configureStore({
  reducer: {
    app: (state = dummySlice.initialState) => state
  }
})
```

### 디버깅 체크리스트

#### 흰 화면 문제 해결 순서
1. **브라우저 콘솔 확인** - F12 → Console 탭
2. **Import/Export 오류 확인** - 가장 흔한 원인
3. **라우팅 구조 점검** - 중첩 Routes 문제
4. **Redux Store 상태 확인** - 빈 reducer 문제
5. **컴포넌트별 단계적 테스트** - 임시 컴포넌트로 isolate

### 예방 체크리스트

#### 프로젝트 시작 시 필수 점검
- [ ] package.json dependencies 확인
- [ ] MUI import 경로 재확인 (@mui/material vs @mui/icons-material)  
- [ ] 라우팅 구조 단순하게 설계
- [ ] Redux store에 최소 1개 reducer 설정
- [ ] ESLint/TypeScript 설정으로 사전 오류 방지

---

## 🚫 할루시네이션 방지 필수 체크리스트

**CRITICAL**: 모든 코드 작성 시 반드시 따라야 하는 검증 절차

### 코드 작성 전 MUST-DO
1. **기존 파일 반드시 읽기** - @filename으로 패턴/스타일 학습
2. **package.json 확인** - 사용 가능한 라이브러리 확인  
3. **기존 유사 코드 검색** - Grep으로 중복 방지, 패턴 일관성 확인
4. **타입 정의 확인** - TypeScript 사용시 기존 타입 먼저 확인

### 코드 작성 중 실시간 검증
- 변수명 기존 패턴과 일치 확인 (camelCase vs snake_case 등)
- 함수명 네이밍 컨벤션 준수
- import 경로 정확성 검증 (상대경로 vs 절대경로)
- 에러 핸들링 방식 기존 코드와 일관성 유지

### 코드 완성 후 품질 검증
- **테스트 실행 및 통과 확인** - 새로운 코드가 기존 테스트 깨뜨리지 않는지
- **린트 검사 통과** - npm run lint 또는 해당 프로젝트 린트 명령어
- **타입 검사 통과** - TypeScript 사용시 type-check 명령어
- **빌드 성공 확인** - npm run build 또는 해당 빌드 명령어

### 절대 가정하지 말 것
- ❌ "아마 이 라이브러리가 있을 것이다"
- ❌ "보통 이렇게 한다"  
- ❌ "이 방법이 더 좋다"
- ✅ **반드시 기존 코드에서 확인 후 적용**

## 🧪 개인용 TDD 강제 워크플로우

**MANDATORY**: 모든 기능 개발 시 절대 변경 불가한 순서

### 필수 순서 (위반 시 즉시 중단)
1. **요구사항 명확화** - 정확히 무엇을 만들지 한 줄로 정리
2. **실패하는 테스트 작성** - 원하는 동작을 테스트로 표현
3. **테스트 실행 → 실패 확인** - Red: 실패해야 정상
4. **최소한의 코드 작성** - 테스트만 통과하도록 구현
5. **테스트 실행 → 성공 확인** - Green: 이제 성공해야 함
6. **리팩토링** - 코드 정리 (테스트는 계속 성공 유지)
7. **최종 검증** - 모든 기존 테스트도 여전히 성공하는지 확인

### 예외 없는 규칙들
- **테스트 없는 코드 작성 절대 금지** - "테스트부터 작성해주세요" 자동 알림
- **기존 코드 수정 시에도 테스트 우선** - 기존 테스트 실행 후 수정
- **테스트가 성공하면 바로 다음 기능으로** - 과도한 구현 방지
- **모든 테스트 항상 실행** - 새 기능이 기존 기능 깨뜨리지 않는지 확인

### TDD 사이클 체크포인트
```bash
# 각 단계마다 실행할 명령어
npm test                    # 테스트 실행
npm run lint               # 코드 품질 검사  
npm run type-check         # 타입 검증 (TypeScript)
git add . && git status    # 변경사항 확인
```

## 🧠 컨텍스트 보존 필수 규칙

**ESSENTIAL**: AI 할루시네이션 방지를 위한 컨텍스트 유지 시스템

### 새 기능 개발시 강제 절차
1. **기존 코드 패턴 분석** - 최소 3개 유사 파일 Read로 읽기
2. **코딩 스타일 추출** - 들여쓰기, 따옴표, 네이밍 컨벤션 파악
3. **사용 중인 라이브러리 확인** - package.json과 import문 분석
4. **에러 처리 패턴 학습** - try-catch, Promise, async/await 사용 방식
5. **폴더 구조 이해** - 파일 위치와 모듈 구조 파악

### 패턴 일관성 체크리스트
- **네이밍 컨벤션**: 변수명, 함수명, 클래스명 기존 방식과 동일
- **파일 구조**: 같은 타입 파일들과 동일한 구조 유지
- **Import 스타일**: 상대경로 vs 절대경로, named vs default import
- **에러 핸들링**: 기존 코드와 동일한 에러 처리 방식
- **주석 스타일**: JSDoc, 일반 주석 등 기존 방식 준수

### 라이브러리/프레임워크 사용 규칙
- **새 라이브러리 추가 전**: 기존 라이브러리로 해결 가능한지 확인
- **버전 호환성**: 기존 dependencies와 충돌 없는지 검증
- **사용법 확인**: 기존 코드에서 같은 라이브러리 사용 예시 찾기
- **대안 검토**: 프로젝트에 이미 있는 유사 기능 라이브러리 우선 활용

### 금지사항 (즉시 중단)
- ❌ 기존 파일 읽지 않고 코드 작성
- ❌ 새 라이브러리 무단 추가
- ❌ 기존 패턴 무시하고 "더 좋은" 방법 적용
- ❌ 폴더 구조 임의 변경
- ❌ 네이밍 컨벤션 무시

## ⚡ 실시간 검증 시스템

**AUTO-VERIFY**: 코드 작성과 동시에 자동 검증하는 시스템

### 코드 작성 즉시 실행 명령어
```bash
# 기본 검증 세트 (모든 코드 변경 후 실행)
npm run lint              # 코딩 스타일 및 문법 검사
npm test                  # 관련 테스트 실행
npm run type-check        # TypeScript 타입 검증
npm run build             # 빌드 가능 여부 확인

# 프로젝트별 맞춤 명령어 (package.json에서 확인)
npm run format            # 코드 포맷팅
npm run audit             # 보안 취약점 검사
npm run coverage          # 테스트 커버리지 확인
```

### 검증 실패시 대응 절차
1. **즉시 중단** - 다음 코드 작성하지 말고 문제 해결 우선
2. **원인 분석** - 에러 메시지 정확히 읽고 근본 원인 파악  
3. **수정 적용** - 최소한의 변경으로 문제 해결
4. **재검증** - 같은 명령어 다시 실행하여 통과 확인
5. **학습 기록** - 같은 실수 반복 방지를 위한 메모

### 자동화된 품질 게이트
- **린트 에러 0개** - 경고 포함 모든 lint 이슈 해결
- **테스트 성공률 100%** - 실패하는 테스트 절대 방치 금지
- **타입 에러 0개** - TypeScript 엄격 모드 준수
- **빌드 성공** - production 빌드까지 성공해야 완료
- **커버리지 유지** - 새 코드로 인한 커버리지 하락 방지

### 프로젝트 맞춤 설정 확인법
```bash
# package.json에서 사용 가능한 스크립트 확인
cat package.json | grep -A 10 "scripts"

# 또는 npm run (사용 가능한 명령어 목록 출력)
npm run
```

### 성능 최적화 체크포인트
- **빌드 시간**: 이전 대비 현저한 증가 없는지 확인
- **번들 크기**: 불필요한 dependency 추가로 인한 크기 증가 방지  
- **메모리 사용량**: 메모리 누수 가능성 있는 코드 패턴 제거
- **실행 속도**: 성능 저하 없는지 간단한 벤치마크 확인

---

## 💻 프로젝트별 개발 명령어

### English Learning Tutor App
**위치**: `C:\Users\sintt\english-learning-tutor-app\`

#### 아키텍처 개요
```
english-learning-tutor-app/
├── backend/              # Express.js API 서버 (Port 3000)
│   ├── src/
│   │   ├── server.js    # 메인 서버 엔트리포인트
│   │   ├── routes/      # API 라우트 (auth, tutors, sessions 등)
│   │   ├── services/    # 비즈니스 로직 (OpenAI, Socket.io)
│   │   └── models/      # 데이터베이스 모델
│   └── package.json     # 백엔드 의존성 및 스크립트
├── frontend/            # React Native 모바일 앱
│   └── src/screens/     # 화면별 컴포넌트
├── web-app/            # 웹 버전 (개발/테스트용)
│   ├── index.html      # 메인 웹 인터페이스
│   ├── app.js          # Socket.io 클라이언트 로직
│   └── styles.css      # 웹 앱 스타일링
└── docs/               # 기술 문서
```

#### 백엔드 개발 명령어 (핵심)
```bash
cd english-learning-tutor-app/backend

# 개발 서버
npm run dev                  # 개발 서버 (nodemon, 자동 재시작)
npm start                    # 프로덕션 서버

# 데이터베이스 (Knex.js)
npm run db:migrate:latest    # 마이그레이션 실행
npm run db:seed             # 초기 데이터 삽입
npm run db:reset            # DB 초기화 + 시드

# 테스트 및 품질 검사
npm test                    # Jest 테스트 전체 실행
npm run test:watch         # 테스트 watch 모드
npm run test:coverage      # 커버리지 리포트 생성
npm run lint               # ESLint 검사
npm run lint:fix           # ESLint 자동 수정
```

#### 웹 앱 접속 URL
- **백엔드 API**: http://localhost:3000/api
- **웹 앱**: http://localhost:3000/web-app/
- **테스트 페이지**: http://localhost:3000/web-app/test.html

#### 핵심 기술 스택
- **백엔드**: Node.js + Express + SQLite(개발) + PostgreSQL(운영)
- **실시간 통신**: Socket.io (AI 대화, 튜터 매칭)
- **AI 연동**: OpenAI API (발음 교정, 대화 연습)
- **인증**: JWT + bcryptjs
- **데이터베이스 ORM**: Knex.js

### Python 프로젝트들

#### 메인 스크립트들 (루트 디렉토리)
```bash
# YouTube 분석 자동화
python simple_analysis.py          # 자막 다운로드 → 분석 → 정리

# 암호화폐 분석 도구들
python auto_crypto_analysis.py     # 자동 크립토 분석 대시보드
python upbit_rsi_monitor.py        # Upbit RSI 모니터링 + 알림
python run_monitor.py              # 통합 모니터링 시스템

# 유틸리티
python chat_id_finder.py           # 텔레그램 채팅 ID 확인
python naver_screenshot.py         # 네이버 페이지 스크린샷
```

#### 출결 알림 시스템
**위치**: `C:\Users\sintt\attendance_notifier\`
```bash
cd attendance_notifier

# 메인 실행
python run.py                      # 실제 알림 시스템 실행
python test_app.py                # 테스트 모드 (DB 연결 확인)

# 의존성: Streamlit + SQLite + 텔레그램 봇
```

#### 시험 문제 생성기
**위치**: `C:\Users\sintt\exam_generator\`
```bash
cd exam_generator

# Streamlit 웹 앱 실행
streamlit run app_simple.py       # 간단 버전 (권장)
streamlit run app.py              # 전체 기능 버전
python test_generator.py          # CLI 테스트

# 접속 URL: http://localhost:8501
```

#### 퍼즈 암호화폐 분석 도구
**위치**: `C:\Users\sintt\puzzle_crypto_analysis\`
```bash
cd puzzle_crypto_analysis

# Streamlit 대시보드
streamlit run app_simple.py       # 메인 분석 도구
python main.py                    # CLI 분석
python test_basic.py              # 기본 기능 테스트

# 배치 실행 (Windows)
run_web.bat                       # 웹 앱 시작
run_monitor.bat                   # 모니터링 시작
```

---

## 🗂️ 코드베이스 아키텍처 개요

### 프로젝트 분류 및 구조

#### 🎓 메인 애플리케이션: English Learning Tutor App
**목적**: AI 기반 영어 학습 + 실제 튜터 매칭 플랫폼
```
english-learning-tutor-app/
├── backend/src/
│   ├── server.js              # Express 서버 + Socket.io
│   ├── routes/                # REST API (인증, 세션, 튜터매칭)
│   ├── services/
│   │   ├── openaiService.js   # AI 대화/발음 교정
│   │   └── socketService.js   # 실시간 통신 관리
│   └── database/migrations/   # Knex.js DB 스키마
├── web-app/                   # 개발/테스트용 웹 클라이언트
└── frontend/                  # React Native (미완성)
```

#### 📊 Python 분석 도구들
**공통 특징**: Streamlit 기반 웹 대시보드 + CLI 스크립트
```
├── puzzle_crypto_analysis/    # 암호화폐 기술분석 (퍼즈 전략)
├── exam_generator/           # AI 기반 시험문제 생성기  
├── attendance_notifier/      # 출결 관리 + 텔레그램 알림
└── autobot/                 # 암호화폐 자동매매 봇 (다수 거래소)
```

#### 🔧 유틸리티 스크립트들 (루트)
```
├── simple_analysis.py        # YouTube 자막 분석 자동화
├── auto_crypto_analysis.py   # 통합 크립토 분석
├── upbit_rsi_monitor.py     # RSI 지표 모니터링
├── run_monitor.py           # 전체 모니터링 오케스트레이터
└── chat_id_finder.py        # 텔레그램 봇 설정 도구
```

### 기술 스택 매트릭스
| 프로젝트 | 언어 | 프레임워크 | 데이터베이스 | 특징 |
|---------|------|------------|-------------|------|
| English App | Node.js | Express + Socket.io | SQLite/PostgreSQL | 실시간 AI 대화 |
| 크립토 분석 | Python | Streamlit | 없음/CSV | 대시보드 + 알림 |
| 시험 생성기 | Python | Streamlit | JSON | OpenAI API 연동 |
| 출결 시스템 | Python | Streamlit | SQLite | 텔레그램 봇 |
| 자동매매 | Python | 없음 | 로그파일 | 거래소 API |

### 공통 의존성 및 설정
- **Python**: requirements.txt (173개 패키지) - AI, 데이터분석, 웹앱 포함
- **Node.js**: 각 프로젝트별 package.json
- **API Keys**: 대부분 .env 파일로 관리 (OpenAI, 거래소, 텔레그램)
- **배포**: 주로 로컬 실행, Streamlit Cloud 일부 지원

---

## 🎯 TDD 강제 자동화 시스템

**REVOLUTIONARY**: 오류 90% 감소를 위한 완전 자동화 TDD 워크플로우

### 🚫 강제 TDD 출력 스타일
**모든 코드 작성 시 자동 적용되는 출력 형태:**

```
🔴 RED 단계: 실패하는 테스트 작성
   ├── 요구사항: [한 줄 명세]
   ├── 테스트 코드: [실패 테스트 작성]
   └── 실행 결과: ❌ FAIL (예상된 실패)

🟢 GREEN 단계: 최소 구현으로 테스트 통과
   ├── 구현 코드: [최소한의 코드만]
   ├── 테스트 실행: [모든 테스트 통과 확인]
   └── 실행 결과: ✅ PASS

🔄 REFACTOR 단계: 코드 품질 개선
   ├── 리팩토링: [코드 정리 및 최적화]
   ├── 재검증: [테스트 여전히 통과 확인]
   └── 다음 기능으로: [사용자 확인 후 진행]
```

### 🤖 전문 서브에이전트 시스템

**자동 에이전트 전환으로 전문성 극대화:**

#### 1. TypeScript 전문가 에이전트
- **역할**: 타입 안전성과 코드 구현 담당
- **전문 영역**: 인터페이스 설계, 타입 정의, 컴포넌트 구현
- **자동 활성화**: 코드 작성 단계에서 자동 전환
- **검증 항목**: 타입 에러 0개, ESLint 통과, 빌드 성공

#### 2. 테스트 전문가 에이전트
- **역할**: Playwright/Jest 테스트 작성 및 검증
- **전문 영역**: 단위 테스트, 통합 테스트, E2E 테스트
- **자동 활성화**: RED 단계에서 자동 전환
- **검증 항목**: 테스트 커버리지 100%, 모든 테스트 통과

#### 3. UI/UX 전문가 에이전트
- **역할**: 인터페이스 설계 및 사용성 최적화
- **전문 영역**: 컴포넌트 디자인, 접근성, 반응형 레이아웃
- **자동 활성화**: 프론트엔드 작업 시 자동 전환
- **검증 항목**: 디자인 일관성, 접근성 준수, 성능 최적화

#### 4. 오케스트레이터 에이전트
- **역할**: 전체 워크플로우 조정 및 품질 관리
- **전문 영역**: 에이전트 간 협업, 최종 품질 검증, 프로젝트 관리
- **항상 활성화**: 모든 단계에서 총괄 관리
- **검증 항목**: 전체 시스템 일관성, 요구사항 완전 충족

### ⚡ 자동 워크플로우 명령어

#### `/design-app` - 설계 자동화 매크로
```bash
# 사용법: /design-app [PRD_파일_경로]
# 자동 실행 순서:
1. PRD 분석 및 요구사항 추출
2. 멀티 에이전트 설계 워크플로우 실행
3. 와이어프레임 및 컴포넌트 아키텍처 설계
4. 테스트 계획 수립 (단위/통합/E2E)
5. 구현 매니페스트 파일 자동 생성
6. 기술스택 및 의존성 분석
```

#### `/implement-mvp` - 구현 자동화 매크로
```bash
# 사용법: /implement-mvp [설계폴더] [프로젝트폴더]
# 자동 실행 순서:
1. 설계 매니페스트 읽기 및 분석
2. 각 기능별 TDD 사이클 자동 실행
3. 서브에이전트 자동 전환 시스템 활성화
4. RED→GREEN→REFACTOR 강제 반복
5. 실시간 품질 검증 (lint/test/build)
6. 진행률 추적 및 자동 문서화
```

### 🔒 오류 제로 강제 프로토콜

**절대 위반 불가능한 자동 차단 시스템:**

#### Phase 1: 설계 단계
```
✅ MUST-DO 체크리스트:
├── 요구사항 한 줄 명세 완료
├── 기존 코드 패턴 3개 이상 분석
├── 아키텍처 설계 및 컴포넌트 분해
├── 테스트 시나리오 작성 완료
└── 매니페스트 파일 생성 완료

❌ 자동 차단 조건:
├── 요구사항 불명확 시 → 구현 진행 차단
├── 기존 패턴 미분석 시 → 코드 작성 차단
├── 테스트 계획 없을 시 → 개발 진행 차단
```

#### Phase 2: 구현 단계
```
🔴 RED (테스트 우선):
├── 실패하는 테스트 작성 강제
├── 테스트 실행 후 FAIL 확인 필수
├── 실패 없으면 → 다음 단계 진행 차단

🟢 GREEN (최소 구현):
├── 테스트 통과하는 최소 코드만 작성
├── 과도한 구현 시도 → 자동 경고 및 차단
├── 모든 테스트 통과 확인 후에만 다음 단계

🔄 REFACTOR (품질 개선):
├── 코드 품질 개선 및 최적화
├── 테스트 여전히 통과하는지 확인
├── 품질 기준 미달 시 → 완료 차단
```

#### Phase 3: 검증 단계
```
⚡ 자동 품질 게이트:
├── Lint 에러 0개 (경고 포함)
├── 테스트 성공률 100%
├── 타입 에러 0개
├── 빌드 성공 확인
├── 성능 기준 충족
└── 모든 조건 미충족 시 → 완료 차단
```

### 🎮 사용자 인터페이스

**간단한 명령어로 전체 워크플로우 실행:**

#### 기본 사용 패턴:
```bash
사용자: "새로운 사용자 인증 시스템 만들어줘"

Claude: 
🎯 TDD 자동화 모드 활성화
📋 설계 단계 시작...

[TypeScript 전문가 에이전트 활성화]
📝 요구사항 분석: 사용자 로그인/회원가입 시스템
🏗️ 아키텍처 설계: JWT 기반 인증, 비밀번호 암호화

[테스트 전문가 에이전트 활성화]  
🔴 RED: 로그인 실패 테스트 작성
   ├── 잘못된 이메일 테스트 ❌ FAIL
   ├── 잘못된 비밀번호 테스트 ❌ FAIL  
   └── 빈 필드 테스트 ❌ FAIL

[TypeScript 전문가 에이전트 재활성화]
🟢 GREEN: 최소 구현으로 테스트 통과
   ├── 로그인 함수 기본 구현 ✅ 
   ├── 에러 핸들링 추가 ✅
   └── 모든 테스트 통과 확인 ✅

🔄 REFACTOR: 코드 품질 개선
   ├── 타입 안전성 강화 ✅
   ├── 에러 메시지 개선 ✅  
   └── 성능 최적화 ✅

✅ 1단계 완료. 다음 기능 진행할까요?
```

### 📊 오류 감소 달성 메트릭

**자동 측정 및 리포팅:**

- **코딩 에러**: 90% 감소 (타입 에러, 문법 에러)
- **논리 에러**: 85% 감소 (TDD로 사전 방지)  
- **통합 에러**: 95% 감소 (자동 테스트 커버리지)
- **배포 에러**: 99% 감소 (자동 빌드 검증)
- **개발 속도**: 50% 향상 (자동화 효과)

---

## 🔧 개발 워크플로우

### 새 프로젝트 시작시
1. **`/design-app docs/requirements.md`** - 자동 설계 실행
2. **기존 코드 패턴 분석** - 서브에이전트가 자동 분석
3. **기술스택 확인** - package.json, requirements.txt 등 종속성 파악
4. **개발 환경 설정** - 필요한 도구 및 서버 실행

### 코드 작성 프로세스
1. **`/implement-mvp design/ project/`** - 자동 TDD 사이클 실행
2. **서브에이전트 자동 전환** - 전문 영역별 최적화된 작업
3. **강제 검증 단계** - 품질 기준 미달 시 자동 차단
4. **실시간 피드백** - 각 단계별 성공/실패 즉시 알림

### 프로젝트 완료시
1. **PROJECTS.md 자동 업데이트** - 진행률 및 완료 상태 자동 반영
2. **문서 자동 생성** - README.md, API 문서 자동 생성
3. **Git 자동 커밋** - 단계별 자동 커밋으로 변경사항 추적