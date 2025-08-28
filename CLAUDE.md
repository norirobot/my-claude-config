# Claude Code Configuration

## 🚀 Session Startup Rules

**IMPORTANT**: Claude Code startup behavior and interaction rules.

### General Behavior Rules
1. **Concise responses**: Keep answers brief and direct unless detail requested
2. **Proactive assistance**: Suggest helpful tools and methods automatically  
3. **Auto-commit**: Always commit CLAUDE.md changes immediately after editing
4. **Korean support**: Full Korean language support in all interactions
5. **Tool optimization**: Use multiple tools efficiently in single responses

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