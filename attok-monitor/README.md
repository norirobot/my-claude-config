# attok.co.kr 출결 모니터링 시스템

## 🎯 최종 완성 버전

### 실행 방법 (이것만 사용하세요!)
```bash
cd attok-monitor
python ultimate_monitor.py
```

## ⚡ 핵심 정보 (3시간의 삽질 끝에 찾은 진실)

### 문제의 근본 원인
HTML에 숨어있던 `<strong>배경 :</strong>` 태그가 학생 리스트에 포함되어 "배경"이라는 가짜 학생이 계속 나타남

### 완벽한 해결책
```python
# strong 태그가 있는 li는 학생이 아님!
strong_tags = li.find_elements(By.TAG_NAME, "strong")
if not strong_tags or not any("배경" in s.text for s in strong_tags):
    # 이것만 진짜 학생
```

## 📋 중요 문서
- **`IMPORTANT_SOLUTION.md`** - ⭐ 반드시 읽어보세요! 핵심 해결법 정리

## ✅ 지원되는 모든 이름 형식
- 일반: 김현수, 박은우
- 숫자만: 231312423
- 1글자: 외
- 특수문자: 이게 된다고? 진
- 복잡한: 흠먄 읗머야-+
- 학교명 포함: 김도윤(성광)
- 공백 포함: 김동훈 동변초
- 직책 포함: 신명신원장님

## 🚀 주요 기능

- 정확히 85명 학생 추출 (하드코딩 없음)
- 실시간 출석 상태 모니터링 (10초 간격)
- 등원/하원 시간 표시
- 터미널 컬러 출력

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