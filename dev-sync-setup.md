# 개발 환경 동기화 설정 가이드

## 1. Git 설정
Git 기본 설정을 완료했습니다. 실제 사용할 정보로 수정해주세요:
```bash
git config --global user.name "실제이름"
git config --global user.email "실제이메일@example.com"
```

## 2. 필수 개발 도구 설치 목록
아래 도구들을 집과 회사 모두에 설치하세요:

### 기본 개발 도구
- [ ] Git for Windows
- [ ] Node.js (LTS 버전)
- [ ] Python (3.11 이상)
- [ ] Visual Studio Code
- [ ] Windows Terminal

### VS Code 확장 프로그램
- [ ] GitLens
- [ ] Prettier
- [ ] ESLint
- [ ] Python
- [ ] Live Server
- [ ] Auto Rename Tag
- [ ] Bracket Pair Colorizer
- [ ] Path Intellisense

## 3. VS Code 설정 동기화
VS Code에서 Settings Sync 기능을 사용하여 동기화:
1. VS Code 열기
2. 좌측 하단 계정 아이콘 클릭
3. "Turn on Settings Sync" 선택
4. Microsoft 또는 GitHub 계정으로 로그인
5. 동기화할 항목 선택 (설정, 확장, 키바인딩 등)

## 4. dotfiles 저장소 활용
GitHub에 개인 dotfiles 저장소를 만들어 설정 파일 관리:

### 저장소 생성
1. GitHub에 `dotfiles` 저장소 생성
2. 로컬에 클론: `git clone https://github.com/yourusername/dotfiles.git`

### 관리할 설정 파일들
- `.gitconfig` - Git 설정
- `.npmrc` - npm 설정
- `settings.json` - VS Code 설정
- `.bashrc` 또는 PowerShell 프로필

## 5. 프로젝트 동기화
GitHub 또는 다른 Git 호스팅 서비스 사용:
```bash
# 회사에서 작업 후
git add .
git commit -m "작업 내용"
git push origin main

# 집에서
git pull origin main
```

## 6. 클라우드 스토리지 활용
- OneDrive, Google Drive, Dropbox 등으로 설정 파일 백업
- 프로젝트 템플릿 저장

## 7. 패키지 관리
### package.json (Node.js 프로젝트)
```bash
npm install  # 의존성 설치
```

### requirements.txt (Python 프로젝트)
```bash
pip install -r requirements.txt
```

## 8. 환경 변수 관리
`.env.example` 파일로 환경 변수 템플릿 관리:
```
DATABASE_URL=
API_KEY=
SECRET_KEY=
```

실제 `.env` 파일은 `.gitignore`에 추가하여 제외

## 추가 팁
- 같은 버전의 도구 사용 (Node.js, Python 등)
- 정기적으로 설정 백업
- 팀 프로젝트는 Docker 활용 고려