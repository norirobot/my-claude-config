"""
설정 파일 - 학원 출결 모니터링 시스템
"""
import os
from datetime import timedelta

# 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
SOUNDS_DIR = os.path.join(BASE_DIR, 'sounds')

# 디렉토리 생성
for dir_path in [DATA_DIR, LOGS_DIR, SOUNDS_DIR]:
    os.makedirs(dir_path, exist_ok=True)

# 웹사이트 설정
ATTOK_URL = "https://attok.co.kr"
CHECK_INTERVAL = 10  # 초 단위 체크 간격

# 수업 시간 설정
DEFAULT_CLASS_DURATION = timedelta(hours=1, minutes=30)
CLASS_DURATIONS = {
    '1시간': timedelta(hours=1),
    '1시간 30분': timedelta(hours=1, minutes=30),
    '2시간': timedelta(hours=2),
    '2시간 30분': timedelta(hours=2, minutes=30),
    '3시간': timedelta(hours=3),
}

# GUI 설정
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
REFRESH_RATE = 1000  # 밀리초 단위

# 알림 설정
ALERT_SOUND_FILE = os.path.join(SOUNDS_DIR, 'alert.wav')
ALERT_BEFORE_MINUTES = [10, 5, 1]  # 종료 전 알림 시간

# 크롬 드라이버 설정
CHROME_OPTIONS = [
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
]

HEADLESS_OPTIONS = CHROME_OPTIONS + ['--headless=new']