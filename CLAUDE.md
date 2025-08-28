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

### 1. 📊 Crypto Information Collection Project
**Status**: ✅ **COMPLETED (100%)**
```
Progress: ████████████████████████████████████████ 100%
```
- **Goal**: Systematic collection and analysis of cryptocurrency trading insights
- **Data Sources**: YouTube channel analysis (Puzzle channel)  
- **Results**: 382 videos → 67 high-quality insights extracted
- **Categories**: Technical analysis, investment strategy, market analysis, practical trading
- **Location**: `X:\ms\Logan\🔗 AI인사이트\📊 크립토 정보 수집 프로젝트\`
- **Next Phase**: Program development based on collected insights

### 2. 🔧 YouTube Analysis Automation System  
**Status**: ✅ **COMPLETED (100%)**
```
Progress: ████████████████████████████████████████ 100%
```
- **Goal**: Automated bulk analysis of YouTube channel content
- **Features**: Script download, content filtering, categorization, prioritization
- **Tools**: yt-dlp + Python analysis pipeline
- **Success Rate**: 382 videos processed, 50 priority insights extracted
- **Integration**: Obsidian-compatible markdown output

### 3. 💻 Program Development Pipeline
**Status**: 🔄 **READY TO START (0%)**
```
Progress: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%
```
- **Goal**: Build cryptocurrency trading program using collected insights
- **Resources**: 67 analyzed trading strategies and market insights
- **Phase**: Awaiting user direction for implementation
- **Potential Features**: Trading signals, portfolio management, risk analysis

### 4. ⚙️ Auto-Commit System
**Status**: ✅ **COMPLETED (100%)**  
```
Progress: ████████████████████████████████████████ 100%
```
- **Goal**: Automatic git commits for CLAUDE.md updates
- **Implementation**: Built-in workflow for seamless updates
- **Status**: Active and functional

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