# attok.co.kr 출결 모니터링 시스템

학원 출결 상태를 실시간으로 모니터링하는 Python 애플리케이션

## 주요 기능

- 수동 로그인 후 자동 모니터링
- 학생 출결 상태 실시간 감지 (박스 색상 변화)
- 출석/하원 시간 자동 기록
- 수업 시간 타이머 기능
- 터미널 컬러 출력

## 설치 방법

1. Chrome 브라우저 설치 필요
2. Python 패키지 설치:
```bash
pip install -r requirements.txt
```

## 사용 방법

### 1단계: 구조 테스트
```bash
python test_parser.py
```
- 수동 로그인 후 페이지 구조 분석
- 적절한 HTML 셀렉터 확인

### 2단계: 모니터링 실행
```bash
python monitor.py
```
- 브라우저가 열리면 수동으로 로그인
- Enter 키를 눌러 모니터링 시작
- Ctrl+C로 종료

## 파일 구조

- `monitor.py` - 메인 모니터링 스크립트
- `test_parser.py` - HTML 구조 분석 도구
- `config.json` - 설정 파일 (수업 시간, 알림 등)
- `requirements.txt` - Python 의존성

## 설정 파일 (config.json)

- `monitoring.check_interval`: 체크 주기 (초)
- `students.default_settings`: 기본 수업 시간 설정
- `students.custom_settings`: 학생별 개별 설정

## 개발 현황

### 완료된 기능
- [x] Chrome 브라우저 제어
- [x] 수동 로그인 지원
- [x] 학생 수 파싱
- [x] 학생 목록 파싱
- [x] 출결 상태 감지 로직
- [x] 실시간 모니터링 루프
- [x] 컬러 터미널 출력

### 예정된 기능
- [ ] 정확한 HTML 셀렉터 확정 (test_parser.py 결과 기반)
- [ ] 타이머 기능 완성
- [ ] 알림 시스템
- [ ] 로그 파일 저장
- [ ] GUI 버전

## 주의사항

- 첫 실행 시 test_parser.py로 HTML 구조 확인 필요
- 웹사이트 구조 변경 시 셀렉터 업데이트 필요
- Chrome 버전과 selenium 호환성 확인