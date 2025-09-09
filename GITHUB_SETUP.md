# 🔧 GitHub 저장소 설정 가이드

## 📌 현재 문제
- 로컬에는 커밋이 있지만 GitHub 저장소가 없어서 push 실패
- 학원 컴퓨터에서 작업한 내용을 집에서 볼 수 없음

## ✅ 해결 방법

### 1단계: GitHub 저장소 생성
1. https://github.com 로그인
2. 우측 상단 **+** 버튼 → **New repository** 클릭
3. 설정:
   - Repository name: `my-projects`
   - Description: "개인 프로젝트 모음 (AI 영어 앱, Volty Studio 등)"
   - **Private** 선택 (중요!)
   - **DO NOT** initialize with README (이미 로컬에 있음)
4. **Create repository** 클릭

### 2단계: 로컬 저장소 연결
```bash
# 원격 저장소 URL 설정
git remote set-url origin https://github.com/sinttogi/my-projects.git

# 첫 푸시 (main 브랜치)
git push -u origin main
```

### 3단계: 학원 컴퓨터에서 받기
```bash
# 학원 컴퓨터에서
cd C:\Users\sintt
git pull origin main
```

## 🔄 자동 동기화 사용법

### 집에서 작업 후:
```bash
sync-all-projects.bat
```

### 학원에서 작업 시작 전:
```bash
git pull origin main
```

### 학원에서 작업 후:
```bash
sync-all-projects.bat
```

## 📝 주의사항
- GitHub 저장소는 **Private**로 설정 (코드 보안)
- 매일 작업 끝나고 sync 실행
- 충돌 발생시 수동 해결 필요

## 🚀 현재 포함된 프로젝트
- `my-claude-config/ai-english-tutor/` - AI 영어 학습 앱 (98%)
- `volty-creator-studio/` - YouTube 제작 도구 (45%)
- `attok-monitor/` - 출결 모니터링 (25%)
- `academy_monitor/` - 학원 모니터링 시스템
- 각종 Python 자동화 스크립트

## 💡 Tip
- `sync-all-projects.bat` 실행하면 자동으로 모든 과정 처리
- 문제 발생시 이 문서 참고