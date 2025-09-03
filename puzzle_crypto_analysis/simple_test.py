"""
Simple Test Program for Puzzle Trading Bot
"""

print("="*50)
print("Puzzle Trading Bot - PC Test")
print("="*50)

# 1. Basic imports test
print("\n1. Testing basic imports...")
try:
    import pandas as pd
    print("OK - pandas:", pd.__version__)
    
    import numpy as np
    print("OK - numpy:", np.__version__)
    
    import requests
    print("OK - requests:", requests.__version__)
    
    print("OK - All basic modules loaded successfully!")
    
except Exception as e:
    print("ERROR - Module loading failed:", e)

# 2. Puzzle bot module test
print("\n2. Testing Puzzle Bot module...")
try:
    from puzz_trading_bot import PuzzleTradingBot, PortfolioConfig
    print("OK - Puzzle trading bot module loaded")
    
    # Initialize bot
    bot = PuzzleTradingBot(initial_capital=1000000, enable_paper_trading=True)
    print("OK - Bot initialized with 1,000,000 KRW")
    
except Exception as e:
    print("ERROR - Puzzle bot failed:", e)

# 3. Upbit module test
print("\n3. Testing Upbit module...")
try:
    from exchange_upbit import UpbitAPI
    print("OK - Upbit module loaded")
    
    # Test public API
    upbit = UpbitAPI()
    markets = upbit.get_markets()
    print(f"OK - Upbit markets found: {len(markets)} markets")
    
    # Test BTC price
    ticker = upbit.get_ticker(['KRW-BTC'])
    if ticker:
        btc_price = ticker[0]['trade_price']
        print(f"OK - BTC price: {btc_price:,} KRW")
    
except Exception as e:
    print("ERROR - Upbit module failed:", e)

# 4. Simple DCA simulation
print("\n4. Testing DCA simulation...")
try:
    bot = PuzzleTradingBot(initial_capital=1000000, enable_paper_trading=True)
    
    # Dummy market data
    dummy_data = {
        'BTC': {'price': 95000000, 'market_cap': 1800000000000},
        'ETH': {'price': 3200000, 'market_cap': 380000000000}
    }
    
    bot.update_market_data(dummy_data)
    
    # Test DCA signal
    dca_signal = bot.check_dca_signal()
    if dca_signal:
        print(f"OK - DCA signal generated: {dca_signal.reason}")
        
        # Execute signal
        success = bot.execute_signal(dca_signal)
        if success:
            print("OK - Mock DCA buy executed successfully")
    
    # Portfolio summary
    summary = bot.get_portfolio_summary()
    print(f"OK - Portfolio status:")
    print(f"   Total value: {summary['total_value']:,.0f} KRW")
    print(f"   Cash: {summary['current_capital']:,.0f} KRW")
    print(f"   Trades: {summary['trade_count']}")
    
except Exception as e:
    print("ERROR - DCA simulation failed:", e)

print("\n" + "="*50)
print("TEST COMPLETED!")
print("="*50)

print("""
Next Steps:

1. Run main bot:
   python main.py

2. Run mobile app:
   streamlit run mobile_app.py --server.port 8501

3. Run backtesting:
   python backtesting.py

All systems are ready to go!
""")

input("\nPress Enter to exit...")