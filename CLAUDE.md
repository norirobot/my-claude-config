# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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