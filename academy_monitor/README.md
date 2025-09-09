# 학원 출결 자동 모니터링 시스템

Windows 환경에서 실행되는 Python 기반 학원 출결 자동 모니터링 및 알림 시스템입니다.

## 주요 기능

### 🔍 웹사이트 모니터링
- https://attok.co.kr 사이트 실시간 모니터링
- Selenium 헤드리스 브라우저로 백그라운드 감시
- 학생 출결 상태 변화 자동 감지 (박스 색상 변화 감지)

### ⏰ 자동 타이머 관리
- 출석 감지 시 자동 타이머 시작
- 기본 수업 시간: 1시간 30분
- 학생별 개별 수업 시간 설정 가능

### 🖥️ GUI 대시보드
- 현재 수업 중인 학생 목록 실시간 표시
- 각 학생별 남은 시간 실시간 카운트다운
- 수동 시간 조정 버튼 (+30분, -30분, 종료)
- 직관적이고 사용하기 쉬운 인터페이스

### 🔔 알림 시스템
- 수업 종료 10분 전, 5분 전 사전 알림
- 수업 종료 시 소리 알림 + 팝업 메시지
- Windows 표준 비프음 또는 사용자 정의 사운드 파일

## 설치 방법

### 1. 필수 요구사항
- Python 3.8 이상
- Windows 10/11
- Chrome 브라우저 설치

### 2. 패키지 설치
```bash
cd academy_monitor
pip install -r requirements.txt
```

### 3. 실행
```bash
python main.py
```

## 사용 방법

### 1. 프로그램 시작
- `main.py` 실행
- GUI 창이 열리면 "Attok 로그인" 버튼 클릭

### 2. 로그인 과정
- Chrome 브라우저가 자동으로 열림
- https://attok.co.kr에서 수동으로 로그인
- 로그인 완료 후 자동으로 감지됨

### 3. 모니터링 시작
- "모니터링 시작" 버튼 클릭
- 브라우저가 헤드리스 모드로 전환
- 백그라운드에서 자동 모니터링 시작

### 4. 학생 관리
- 학생 출석 시 자동으로 목록에 추가
- 실시간 남은 시간 표시
- 필요시 수동으로 시간 연장/단축 가능

## 파일 구조

```
academy_monitor/
├── main.py              # 메인 실행 파일
├── gui.py              # GUI 인터페이스
├── web_monitor.py      # 웹사이트 모니터링
├── alert_system.py     # 알림 시스템
├── models.py           # 데이터 모델
├── config.py           # 설정 파일
├── requirements.txt    # 의존성 패키지
├── data/              # 데이터 저장 폴더
├── logs/              # 로그 파일 폴더
└── sounds/            # 알림 사운드 파일
```

## 설정 변경

`config.py` 파일에서 다음 설정들을 변경할 수 있습니다:

- `DEFAULT_CLASS_DURATION`: 기본 수업 시간
- `CHECK_INTERVAL`: 모니터링 주기 (초)
- `ALERT_BEFORE_MINUTES`: 사전 알림 시간
- `WINDOW_WIDTH`, `WINDOW_HEIGHT`: 창 크기

## 알림 설정

### 사운드 파일 설정
`sounds/` 폴더에 `alert.wav` 파일을 넣으면 사용자 정의 알림음 사용 가능

### 알림 시간 변경
`config.py`에서 `ALERT_BEFORE_MINUTES` 수정

## 문제 해결

### Chrome 드라이버 문제
- `webdriver_manager`가 자동으로 Chrome 드라이버 관리
- Chrome 브라우저 최신 버전 유지 권장

### 메모리 사용량 최적화
- 헤드리스 모드에서 최소한의 리소스 사용
- 모니터링 주기를 늘려 CPU 사용량 조절 가능

### 로그인 문제
- attok.co.kr 사이트 구조 변경 시 `web_monitor.py` 수정 필요
- 로그인 후 나타나는 요소의 클래스명 확인 필요

## 개발자 정보

개발 언어: Python 3.8+
주요 라이브러리: Tkinter, Selenium, webdriver-manager
개발 환경: Windows 10/11

## 라이선스

이 프로젝트는 교육 목적으로 개발되었습니다.