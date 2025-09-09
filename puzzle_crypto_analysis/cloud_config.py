"""
클라우드 배포용 설정 파일
Streamlit Cloud에서 사용할 설정들
"""

import os

# ============= 클라우드 환경 설정 =============
# 클라우드에서는 실제 거래 비활성화 (안전을 위해)
CLOUD_MODE = True
PAPER_TRADING_ONLY = True

# ============= 기본 투자 설정 =============
INITIAL_CAPITAL = 10_000_000  # 1천만원 (모의투자)
DCA_AMOUNT = 300_000  # 30만원
DCA_INTERVAL_DAYS = 7  # 매주

# ============= 포트폴리오 설정 =============
PORTFOLIO_RATIO = {
    'BTC': 0.60,  # 비트코인 60%
    'ETH': 0.20,  # 이더리움 20%
    'ALT': 0.15,  # 알트코인 15%
    'CASH': 0.05  # 현금 5%
}

# ============= 매매 전략 설정 =============
RSI_BUY_SIGNAL = 30
RSI_SELL_SIGNAL = 70
DOMINANCE_HIGH = 58
DOMINANCE_LOW = 52

# ============= 클라우드 전용 설정 =============
# 업데이트 주기 (클라우드에서는 더 길게)
UPDATE_INTERVAL_SECONDS = 60  # 1분마다

# 더미 데이터 사용 (실제 API 호출 최소화)
USE_DUMMY_DATA = True

# 로깅 레벨
LOG_LEVEL = 'INFO'

# 클라우드 환경 감지
def is_cloud_environment():
    """클라우드 환경인지 확인"""
    return any([
        os.getenv('STREAMLIT_SHARING'),
        os.getenv('RAILWAY_PROJECT_ID'),
        os.getenv('RENDER'),
        'streamlit' in os.getcwd().lower(),
        'cloud' in os.getcwd().lower()
    ])

# 환경별 설정 자동 조정
if is_cloud_environment():
    USE_DUMMY_DATA = True
    PAPER_TRADING_ONLY = True
    print("☁️ 클라우드 환경 감지됨 - 안전 모드 활성화")

print(f"✅ 설정 로드 완료 - 클라우드 모드: {CLOUD_MODE}")