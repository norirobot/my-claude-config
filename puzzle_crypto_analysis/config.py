"""
설정 파일 - 사용자 설정값
"""
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# ============= 거래소 API 설정 =============
# 업비트 API 키 (https://upbit.com/mypage/open_api_management 에서 발급)
UPBIT_ACCESS_KEY = os.getenv('UPBIT_ACCESS_KEY', '')  # Access Key 입력
UPBIT_SECRET_KEY = os.getenv('UPBIT_SECRET_KEY', '')  # Secret Key 입력

# ============= 투자 설정 =============
# 초기 투자금 (원)
INITIAL_CAPITAL = 10_000_000  # 1천만원

# DCA(정적립식) 설정
DCA_ENABLED = True  # DCA 활성화 여부
DCA_AMOUNT = 300_000  # 회당 투자 금액 (30만원)
DCA_INTERVAL_DAYS = 7  # 투자 주기 (7일 = 주간)
DCA_COINS = ['BTC', 'ETH']  # DCA 적용 코인

# ============= 포트폴리오 설정 =============
# 포트폴리오 비중 (합계 100%)
PORTFOLIO_RATIO = {
    'BTC': 0.60,  # 비트코인 60%
    'ETH': 0.20,  # 이더리움 20%
    'ALT': 0.15,  # 알트코인 15%
    'CASH': 0.05  # 현금 5%
}

# 알트코인 리스트
ALT_COINS = ['SOL', 'XRP', 'ADA']  # 투자할 알트코인

# ============= 매매 전략 설정 =============
# RSI 설정
RSI_PERIOD = 14  # RSI 기간
RSI_BUY_SIGNAL = 30  # RSI 매수 신호 (30 이하)
RSI_SELL_SIGNAL = 70  # RSI 매도 신호 (70 이상)

# 도미넌스 설정
DOMINANCE_HIGH = 58  # 도미넌스 높음 (비트코인 비중 증가)
DOMINANCE_LOW = 52  # 도미넌스 낮음 (알트코인 비중 증가)

# 이동평균선 설정
MA_SHORT = 20  # 단기 이평선
MA_LONG = 60  # 장기 이평선

# ============= 리스크 관리 =============
# 손절 설정
STOP_LOSS_PERCENT = 20  # 개별 종목 손절선 (-20%)
PORTFOLIO_STOP_LOSS = 15  # 전체 포트폴리오 손절선 (-15%)

# 익절 설정
TAKE_PROFIT_PERCENT = 50  # 개별 종목 익절선 (+50%)

# 김치프리미엄 경고
KIMCHI_PREMIUM_ALERT = 5  # 김프 5% 이상시 경고

# ============= 실행 모드 =============
# 실행 모드 선택
MODE = 'PAPER'  # 'PAPER': 모의투자, 'REAL': 실전투자, 'BACKTEST': 백테스트

# 모의투자 설정
PAPER_TRADING_CAPITAL = 10_000_000  # 모의투자 자본금

# ============= 알림 설정 =============
# 텔레그램 알림 (선택사항)
TELEGRAM_ENABLED = False
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '')

# ============= 로깅 설정 =============
LOG_LEVEL = 'INFO'  # DEBUG, INFO, WARNING, ERROR
LOG_FILE = 'trading_bot.log'

# ============= 자동 실행 설정 =============
# 봇 실행 주기 (분)
BOT_RUN_INTERVAL_MINUTES = 60  # 60분마다 실행

# 자동 리밸런싱
AUTO_REBALANCE = True  # 자동 리밸런싱 활성화
REBALANCE_DAY = 1  # 매월 1일 리밸런싱

# ============= 백테스트 설정 =============
BACKTEST_START_DATE = '2022-01-01'
BACKTEST_END_DATE = '2024-01-01'
BACKTEST_INITIAL_CAPITAL = 10_000_000

# ============= 거래 제한 설정 =============
# 최소 거래 금액 (업비트 기준)
MIN_ORDER_AMOUNT = 5_000  # 5천원

# 최대 거래 금액 (안전장치)
MAX_ORDER_AMOUNT = 10_000_000  # 1천만원

# 일일 최대 거래 횟수
MAX_DAILY_TRADES = 10

# print("✅ 설정 파일 로드 완료")