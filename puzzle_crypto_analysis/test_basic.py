"""
기본 테스트 프로그램
PC에서 간단히 테스트해보기
"""

import sys
import pandas as pd
import numpy as np
from datetime import datetime
import logging

print("=" * 50)
print("🚀 퍼즐 트레이딩 봇 PC 테스트")
print("=" * 50)

# 1. 기본 모듈 테스트
print("\n1️⃣ 기본 모듈 테스트:")
try:
    import pandas as pd
    print("✅ pandas:", pd.__version__)
    
    import numpy as np
    print("✅ numpy:", np.__version__)
    
    import requests
    print("✅ requests:", requests.__version__)
    
    import matplotlib
    print("✅ matplotlib:", matplotlib.__version__)
    
    print("✅ 모든 기본 모듈 정상!")
    
except Exception as e:
    print("❌ 모듈 로드 실패:", e)

# 2. 퍼즐 봇 모듈 테스트
print("\n2️⃣ 퍼즈 봇 모듈 테스트:")
try:
    from puzz_trading_bot import PuzzleTradingBot, PortfolioConfig
    print("✅ 퍼즐 트레이딩 봇 모듈 로드 성공")
    
    # 봇 초기화
    bot = PuzzleTradingBot(initial_capital=1000000, enable_paper_trading=True)
    print("✅ 봇 초기화 성공 - 초기자본: 1,000,000원")
    
except Exception as e:
    print("❌ 퍼즐 봇 로드 실패:", e)

# 3. 업비트 모듈 테스트
print("\n3️⃣ 업비트 모듈 테스트:")
try:
    from exchange_upbit import UpbitAPI, UpbitTrader
    print("✅ 업비트 모듈 로드 성공")
    
    # API 테스트 (공개 API)
    upbit = UpbitAPI()
    markets = upbit.get_markets()
    print(f"✅ 업비트 마켓 조회 성공: {len(markets)}개 마켓")
    
    # 비트코인 현재가 조회
    ticker = upbit.get_ticker(['KRW-BTC'])
    if ticker:
        btc_price = ticker[0]['trade_price']
        print(f"✅ BTC 현재가: {btc_price:,}원")
    
except Exception as e:
    print("❌ 업비트 모듈 실패:", e)

# 4. 백테스팅 모듈 테스트
print("\n4️⃣ 백테스팅 모듈 테스트:")
try:
    from backtesting import PuzzleBacktester
    print("✅ 백테스팅 모듈 로드 성공")
    
    backtester = PuzzleBacktester(initial_capital=1000000)
    print("✅ 백테스터 초기화 성공")
    
except Exception as e:
    print("❌ 백테스팅 모듈 실패:", e)

# 5. 설정 모듈 테스트
print("\n5️⃣ 설정 모듈 테스트:")
try:
    import config
    print(f"✅ 설정 로드 성공")
    print(f"   - 초기자본: {config.INITIAL_CAPITAL:,}원")
    print(f"   - DCA 금액: {config.DCA_AMOUNT:,}원")
    print(f"   - 실행 모드: {config.MODE}")
    
except Exception as e:
    print("❌ 설정 모듈 실패:", e)

# 6. 간단한 DCA 시뮬레이션
print("\n6️⃣ DCA 시뮬레이션 테스트:")
try:
    from puzz_trading_bot import PuzzleTradingBot
    
    bot = PuzzleTradingBot(initial_capital=1000000, enable_paper_trading=True)
    
    # 더미 시장 데이터
    dummy_data = {
        'BTC': {'price': 95000000, 'market_cap': 1800000000000},
        'ETH': {'price': 3200000, 'market_cap': 380000000000}
    }
    
    bot.update_market_data(dummy_data)
    
    # DCA 신호 테스트
    dca_signal = bot.check_dca_signal()
    if dca_signal:
        print(f"✅ DCA 신호 생성: {dca_signal.reason}")
        
        # 신호 실행 테스트
        success = bot.execute_signal(dca_signal)
        if success:
            print("✅ 모의 DCA 매수 실행 성공")
    
    # 포트폴리오 요약
    summary = bot.get_portfolio_summary()
    print(f"✅ 포트폴리오 현황:")
    print(f"   - 총 자산: {summary['total_value']:,.0f}원")
    print(f"   - 현금: {summary['current_capital']:,.0f}원")
    print(f"   - 거래 횟수: {summary['trade_count']}회")
    
except Exception as e:
    print("❌ DCA 시뮬레이션 실패:", e)

print("\n" + "=" * 50)
print("🎉 테스트 완료!")
print("=" * 50)

print("""
📝 다음 단계:

1. 메인 봇 실행:
   python main.py

2. 모바일 앱 실행:
   streamlit run mobile_app.py

3. 백테스팅 실행:
   python backtesting.py

4. 실전 투자 (주의!):
   config.py에서 MODE = 'REAL' 설정 후
   업비트 API 키 입력
""")

input("\n엔터 키를 눌러 종료...")