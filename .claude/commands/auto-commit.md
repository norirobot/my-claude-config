# 자동 커밋 시스템

**목적**: CLAUDE.md 파일 변경시 자동 git 커밋

## 자동 커밋 규칙

### 1. CLAUDE.md 변경시
```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md - [변경사항 설명]"
git push origin master
```

### 2. 프로젝트 파일 변경시
```bash
git add .
git status  # 변경사항 확인
git commit -m "Auto-commit: $(date)"
git push origin master
```

### 3. 커밋 메시지 규칙
- **Update CLAUDE.md** - Claude 설정 변경
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **docs**: 문서 변경

## 자동 실행 조건
- CLAUDE.md 파일 수정 후 자동 실행
- 사용자 권한 요청 없이 바로 커밋
- 실패시 에러 메시지 표시

## 실행 명령어
```bash
# 수동 실행
./auto-sync.bat

# 자동 체크
./check-updates.bat
```

**모든 CLAUDE.md 변경사항은 즉시 자동 커밋됨**