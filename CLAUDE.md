# Claude Code Configuration

## 🚀 Session Startup Rules

**IMPORTANT**: Always display project status dashboard immediately when Claude Code session starts, without waiting for user request.

### Startup Display Rules
1. **Always show** Current Projects Status first thing in every new session
2. **Display** progress bars and completion status
3. **Include** next steps and awaiting tasks
4. **Format** with emojis and visual progress indicators
5. **No user prompt required** - show automatically

---

## 📋 Current Projects Status

### 1. 📊 크립토 정보 수집 프로젝트 (Crypto Information Collection Project)
**상태**: ✅ **완료 (100%)**
```
진행률: ████████████████████████████████████████ 100%
```
- **목표**: 암호화폐 거래 인사이트의 체계적 수집 및 분석
- **데이터 소스**: YouTube 채널 분석 (퍼즐 채널)  
- **결과**: 382개 영상 → 67개 고품질 인사이트 추출
- **카테고리**: 기술분석, 투자전략, 시장분석, 실전매매
- **위치**: `X:\ms\Logan\🔗 AI인사이트\📊 크립토 정보 수집 프로젝트\`
- **다음 단계**: 수집된 인사이트 기반 프로그램 개발

### 2. 🔧 YouTube 분석 자동화 시스템 (YouTube Analysis Automation System)  
**상태**: ✅ **완료 (100%)**
```
진행률: ████████████████████████████████████████ 100%
```
- **목표**: YouTube 채널 콘텐츠 대량 자동 분석
- **기능**: 스크립트 다운로드, 내용 필터링, 분류, 우선순위 설정
- **도구**: yt-dlp + Python 분석 파이프라인
- **성공률**: 382개 영상 처리, 50개 우선순위 인사이트 추출
- **통합**: 옵시디언 호환 마크다운 출력

### 3. 💻 프로그램 개발 파이프라인 (Program Development Pipeline)
**상태**: 🔄 **시작 준비 완료 (0%)**
```
진행률: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%
```
- **목표**: 수집된 인사이트를 활용한 암호화폐 거래 프로그램 구축
- **리소스**: 67개 분석된 거래 전략 및 시장 인사이트
- **단계**: 구현을 위한 사용자 지시 대기 중
- **잠재적 기능**: 거래 신호, 포트폴리오 관리, 리스크 분석

### 4. ⚙️ 자동 커밋 시스템 (Auto-Commit System)
**상태**: ✅ **완료 (100%)**  
```
진행률: ████████████████████████████████████████ 100%
```
- **목표**: CLAUDE.md 업데이트 시 자동 git 커밋
- **구현**: 원활한 업데이트를 위한 내장 워크플로우
- **상태**: 활성화 및 정상 작동

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
- **Extracts**: Trading insights, investment strategies, market analysis
- **Categorizes**: Technical analysis, investment strategy, market analysis, practical trading, coin analysis
- **Prioritizes**: Most important content based on trading value
- **Saves**: Top 50 most valuable insights as markdown files

### Usage Recommendations
When user mentions YouTube analysis or script download:
1. Automatically suggest bulk download method
2. Offer complete analysis pipeline
3. Provide categorized results in Obsidian-compatible format
4. Save results in: `X:\ms\Logan\🔗 AI인사이트\📊 크립토 정보 수집 프로젝트\`

### Success Metrics
- **382 videos processed** from Puzzle channel
- **67 high-quality insights** extracted (17 manual + 50 automated)
- **5 categories**: Coin analysis (64%), Market analysis (15%), Investment strategy (14%), Practical trading (4%), Technical analysis (3%)