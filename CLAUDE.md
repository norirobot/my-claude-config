# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Claude Code Configuration

## 🚀 Session Startup Rules

**IMPORTANT**: Claude Code startup behavior and interaction rules.

### General Behavior Rules
1. **Concise responses**: Keep answers brief and direct unless detail requested
2. **Proactive assistance**: Suggest helpful tools and methods automatically  
3. **Auto-commit**: Always commit CLAUDE.md changes immediately after editing
4. **Korean support**: Full Korean language support in all interactions
5. **Tool optimization**: Use multiple tools efficiently in single responses

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

#### 개발 서버 실행
```bash
cd english-learning-tutor-app
npm start                    # 프로덕션 서버 시작
npm run dev                  # 개발 서버 (nodemon 사용)
```

#### 테스트 및 빌드
```bash
npm test                     # Jest 테스트 실행
npm run build                # 클라이언트 + 서버 빌드
```

#### 웹 앱 접속
- **메인 서비스**: http://localhost:3000
- **웹 앱 버전**: http://localhost:3000/web-app/

### Python 스크립트 실행

#### YouTube 분석 도구
```bash
python simple_analysis.py          # YouTube 자막 자동 분석
```

#### 크립토 분석 도구들
```bash
python auto_crypto_analysis.py     # 자동 크립토 분석
python upbit_rsi_monitor.py        # Upbit RSI 모니터링
```

#### 출결 알림 시스템
```bash
cd attendance_notifier
python run.py                # 출결 알림 프로그램 실행
python test_app.py          # 테스트 모드 실행
```

---

## 🗂️ 주요 프로젝트 구조

### English Learning Tutor App
```
english-learning-tutor-app/
├── backend/          # Express.js 백엔드 서버
├── frontend/         # React Native 모바일 앱
├── web-app/          # 웹 버전 (HTML/CSS/JS)
├── ai-service/       # OpenAI API 연동 서비스
├── database/         # SQLite 데이터베이스 스키마
└── docs/             # 프로젝트 문서들
```

### 루트 디렉토리 주요 파일
```
C:\Users\sintt\
├── simple_analysis.py          # YouTube 분석 자동화
├── auto_crypto_analysis.py     # 크립토 분석 도구
├── upbit_rsi_monitor.py        # RSI 모니터링
├── attendance_notifier/        # 출결 알림 시스템
├── PROJECTS.md                 # 프로젝트 현황 관리
└── CLAUDE.md                   # Claude Code 설정
```

---

## 🔧 개발 워크플로우

### 새 프로젝트 시작시
1. **프로젝트 현황 확인**: "프로젝트 현황" 명령어로 현재 상태 파악
2. **기존 코드 패턴 분석**: 유사 프로젝트 3개 이상 Read 도구로 분석
3. **기술스택 확인**: package.json, requirements.txt 등 종속성 파악
4. **개발 환경 설정**: 필요한 도구 및 서버 실행

### 코드 작성 프로세스
1. **요구사항 명확화** → 한 줄로 정리
2. **기존 패턴 분석** → 네이밍, 구조, 스타일 학습  
3. **테스트 우선 작성** → TDD 방식 강제 적용
4. **최소 구현** → 테스트 통과하는 최소 코드
5. **검증 실행** → lint, test, build 모든 단계 통과
6. **리팩토링** → 코드 품질 개선

### 프로젝트 완료시
1. **PROJECTS.md 업데이트** → 진행률 및 완료 상태 반영
2. **문서 정리** → README.md, 가이드 문서 최신화
3. **Git 커밋** → 자동 커밋 시스템으로 변경사항 저장