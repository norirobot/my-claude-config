# 📱 텔레그램 봇 설정 가이드

## 1. 텔레그램 봇 생성

### 단계 1: BotFather와 대화
1. 텔레그램에서 `@BotFather` 검색하여 대화 시작
2. `/start` 명령어 입력
3. `/newbot` 명령어 입력
4. 봇 이름 입력 (예: "업비트 RSI 모니터")
5. 봇 유저네임 입력 (예: "upbit_rsi_monitor_bot")

### 단계 2: 토큰 저장
- BotFather가 제공하는 토큰을 안전한 곳에 저장
- 형태: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

## 2. Chat ID 확인

### 방법 1: 봇과 대화 후 확인
1. 생성한 봇과 대화 시작
2. 아무 메시지나 전송 (예: "안녕하세요")
3. 브라우저에서 다음 URL 접속:
   ```
   https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getUpdates
   ```
4. JSON 응답에서 `chat.id` 값을 찾아서 저장

### 방법 2: 자동 확인 스크립트 사용
```python
# chat_id_finder.py 실행하여 자동으로 찾기
python chat_id_finder.py YOUR_BOT_TOKEN
```

## 3. 설정 파일 작성

`config.ini` 파일을 다음과 같이 작성:

```ini
[monitoring]
# 모니터링할 코인 (ALL = 전체, 또는 쉼표로 구분)
markets = ALL
# markets = KRW-BTC,KRW-ETH,KRW-ADA

# RSI 임계값
rsi_low = 30
rsi_high = 70

# 캔들 간격 (1m, 5m, 15m, 30m, 1h, 4h, 1d)
interval = 1m

[telegram]
# BotFather에서 받은 토큰
token = 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
# 본인의 Chat ID
chat_id = 987654321
```

## 4. 실행 전 확인사항

### 필수 패키지 설치
```bash
pip install websockets pandas numpy python-telegram-bot requests configparser
```

### 봇 권한 설정
- 봇이 메시지를 보낼 수 있도록 먼저 대화를 시작해야 함
- 봇에게 `/start` 명령어 전송

## 5. 실행 방법

### 설정 파일 생성
```bash
python upbit_rsi_monitor.py --create-config
```

### 모니터링 시작
```bash
python upbit_rsi_monitor.py
```

## 6. 알림 형태 예시

```
🚨 RSI 알림

📊 코인: KRW-BTC
💰 가격: 52,500,000원
📈 RSI: 28.5
⚠️ 조건: 과매도 (RSI ≤ 30)
🕐 시간: 2024-01-15 14:30:25
```

## 7. 문제 해결

### 자주 발생하는 오류
1. **토큰 오류**: BotFather에서 받은 정확한 토큰 사용
2. **Chat ID 오류**: 봇과 먼저 대화 시작 후 Chat ID 확인
3. **권한 오류**: 봇이 메시지 전송 권한이 있는지 확인

### 로그 확인
- `upbit_rsi_monitor.log` 파일에서 상세 로그 확인
- 연결 상태, RSI 계산, 알림 전송 상태 모니터링 가능