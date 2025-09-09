# 🚀 Claude Code 완전 설정 가이드

> **목적**: 새로운 컴퓨터나 재설치시 Claude Code 완전 설정  
> **중요도**: ⭐⭐⭐⭐⭐ (필수)  
> **소요시간**: 10-15분

---

## 📋 설정 전 체크리스트

### ✅ **필수 준비물**
- [ ] 인터넷 연결
- [ ] Git 설치 (`git --version`으로 확인)
- [ ] 터미널/CMD 접근 권한

---

## 🔧 1단계: Claude Code 설치

### **설치 확인**
```bash
claude --version
```

### **미설치시 설치**
```bash
# npm으로 설치
npm install -g @anthropic-ai/claude-cli

# 또는 공식 설치 방법 사용
```

### **설치 완료 확인**
```bash
claude
```
→ Claude Code 터미널 진입되면 성공 ✅

---

## ⚙️ 2단계: 설정 파일 다운로드 및 적용

### **다운로드** 
1. **GitHub 접속**: https://github.com/norirobot/my-claude-config
2. **Code** → **Download ZIP**
3. **압축 해제**: my-claude-config 폴더 확인

### **파일 복사 (중요!)**
```bash
# 1. CLAUDE.md 파일 복사 (홈 디렉토리로)
cp my-claude-config/.claude.md ~/

# 2. commands 폴더 복사 (Claude 설정 디렉토리로)  
cp -r my-claude-config/commands ~/.claude/commands/
```

### **Windows 환경에서**
```cmd
# CLAUDE.md를 사용자 홈으로 복사
copy my-claude-config\.claude.md %USERPROFILE%\

# commands 폴더 복사
xcopy my-claude-config\commands %USERPROFILE%\.claude\commands\ /E /I
```

---

## 📁 3단계: 옵시디언 연결 설정

### **현재 설정된 경로**
- **옵시디언 볼트**: `X:\ms\Logan`
- **연결 방식**: 직접 파일시스템 접근
- **설정 파일**: `CLAUDE.md`에 저장됨

### **다른 컴퓨터에서 설정시**
1. **옵시디언 볼트 경로 확인**
2. **CLAUDE.md 수정**:
```markdown
### Vault Information
- **Vault Path**: [새로운 경로]
- **Vault Name**: Logan's Knowledge Base
```

---

## 🎯 4단계: 프로젝트별 필수 설정

### **새 프로젝트 시작시 항상 실행**
```bash
claude init
```
→ 프로젝트용 .claude.md 파일 자동 생성  
→ AI가 해당 프로젝트 컨텍스트 이해 가능

### **주요 Commands 사용법**

#### **🧹 코드 정리** (매일 사용)
```bash
/cleanup.md
```

#### **🔍 코드 리뷰** (기능 완성마다)
```bash
/review.md  
```

#### **📝 할 일 목록** (헷갈릴 때)
```bash
/todo.md
```

#### **🚑 빠른 수정** (에러 날 때)
```bash
/fix.md
```

---

## 🔧 5단계: MCP(Multi-Computer Protocol) 기능

### **1. Filesystem** (파일 관리)
- **역할**: 컴퓨터 파일/폴더 직접 제어
- **사용법**: "프로젝트 폴더 정리해줘", "모든 .py 파일 분석해줘"

### **2. SQLite** (데이터베이스)
- **역할**: 데이터 저장/관리 (학생, 부품, 성적 등)
- **사용법**: "학생 정보 DB에 저장해줘", "이번 달 데이터 분석해줘"

### **3. GitHub** (코드 관리)
- **역할**: GitHub 저장소 읽기/쓰기
- **사용법**: "코드 GitHub에서 가져와줘", "변경사항 커밋해줘"

### **4. Google Drive** (구글 문서)
- **역할**: 구글 드라이브/시트/독스 제어
- **사용법**: "데이터 구글 시트 업데이트해줘", "문서 생성해줘"

### **5. Playwright** (웹 자동화)
- **역할**: 웹사이트 접속/정보 수집/스크린샷
- **사용법**: "웹사이트 정보 수집해줘", "스크린샷 찍어줘"

### **6. Memory** (작업 기억)
- **역할**: 이전 작업 내용 기억/연속성
- **사용법**: "어제 작업 이어서 해줘", "이 설정 기억해둬"

### **7. Sequential Thinking** (복잡한 계산)
- **역할**: 단계적 사고/복잡한 문제 해결
- **사용법**: "복잡한 알고리즘 계산해줘", "최적화 분석해줘"

---

## 💡 통합 사용 예시

### **업무 자동화**
```
"GitHub에서 코드 가져와서(GitHub)
코드 검사하고(Filesystem)  
결과 DB에 저장하고(SQLite)
구글 시트에 기록해줘(Google Drive)"
```

### **콘텐츠 제작**
```
"트렌드 검색해서(Playwright)
관련 파일 찾고(Filesystem)
아이디어 기억해둬(Memory)"
```

### **복잡한 프로젝트**
```
"알고리즘 계산하고(Sequential Thinking)
코드 생성해서(Filesystem)
GitHub에 올려줘(GitHub)"
```

---

## ⚠️ 주의사항

### **필수 체크 포인트**
- [ ] `claude init` 새 프로젝트마다 실행
- [ ] 옵시디언 경로 변경시 CLAUDE.md 수정
- [ ] MCP 기능들은 "~해줘" 자연어로 사용
- [ ] 정기적으로 `/cleanup.md`, `/review.md` 실행

### **문제 해결**
- **Claude 진입 안됨**: 설치 확인 또는 재설치
- **Commands 작동 안됨**: ~/.claude/commands/ 폴더 위치 확인
- **옵시디언 접근 안됨**: CLAUDE.md의 Vault Path 확인

---

## 🎉 설정 완료 확인

### **최종 테스트**
1. **터미널에서** `claude` 입력 → 정상 진입
2. **새 프로젝트에서** `claude init` → .claude.md 생성 확인
3. **Commands 테스트** `/todo.md` → 정상 작동 확인
4. **옵시디언 연결** "옵시디언에서 파일 읽어줘" → 정상 접근 확인

### **완료시 상태**
✅ Claude Code 완전 설치 완료  
✅ 모든 설정 파일 적용 완료  
✅ 옵시디언 연결 완료  
✅ MCP 기능들 사용 가능  
✅ 프로젝트별 Commands 사용 가능

---

**🚀 이제 Claude Code로 모든 개발 작업을 자동화할 수 있습니다!**