"""
Puzzle Bot Notification System Test (English Version)
"""

import time
from puzz_trading_bot import PuzzleTradingBot, TradingSignal, TradingStrategy
from notification_system import NotificationSystem, AlertMessage, AlertType, AlertPriority

print("="*60)
print("PUZZLE BOT NOTIFICATION SYSTEM TEST")
print("="*60)

def test_notification_system():
    """Standalone notification system test"""
    print("\n1. Notification System Standalone Test")
    
    try:
        notifier = NotificationSystem()
        
        # Buy signal test
        buy_message = AlertMessage(
            type=AlertType.BUY_SIGNAL,
            priority=AlertPriority.HIGH,
            title="BUY SIGNAL: BTC",
            message="Strategy: DCA\nPrice: 95,000,000 KRW\nReason: DCA buy time reached\nConfidence: 85%",
            coin="BTC",
            price=95000000
        )
        
        print("   - Testing buy signal notification...")
        notifier.send_buy_signal(buy_message)
        time.sleep(2)
        
        # Sell signal test
        sell_message = AlertMessage(
            type=AlertType.SELL_SIGNAL,
            priority=AlertPriority.HIGH,
            title="SELL SIGNAL: ETH",
            message="Strategy: RSI Divergence\nPrice: 3,200,000 KRW\nReason: RSI overbought + divergence\nConfidence: 78%",
            coin="ETH",
            price=3200000
        )
        
        print("   - Testing sell signal notification...")
        notifier.send_sell_signal(sell_message)
        time.sleep(2)
        
        # Stop loss alert test
        stop_loss_message = AlertMessage(
            type=AlertType.STOP_LOSS,
            priority=AlertPriority.CRITICAL,
            title="STOP LOSS ALERT: DOGE",
            message="Current Loss: -22%\nBuy Price: 900 KRW\nCurrent Price: 702 KRW\nConsider stop loss per Puzzle strategy!",
            coin="DOGE",
            price=702
        )
        
        print("   - Testing stop loss notification...")
        notifier.send_stop_loss_alert(stop_loss_message)
        time.sleep(2)
        
        # Profit taking alert test
        profit_message = AlertMessage(
            type=AlertType.PROFIT_TARGET,
            priority=AlertPriority.HIGH,
            title="PROFIT ALERT: SOL (+120%)",
            message="Current Profit: +120%\nBuy Price: 50,000 KRW\nCurrent Price: 110,000 KRW\nConsider 50% profit taking!",
            coin="SOL",
            price=110000
        )
        
        print("   - Testing profit taking notification...")
        notifier.send_profit_alert(profit_message)
        
        print("   OK - Notification system standalone test completed!")
        
    except Exception as e:
        print(f"   ERROR - Notification system test failed: {e}")

def test_integrated_bot():
    """Integrated bot test"""
    print("\n2. Puzzle Bot Integrated Notification Test")
    
    try:
        # Initialize bot (notification-only mode)
        bot = PuzzleTradingBot(initial_capital=1000000, enable_paper_trading=True)
        print("   OK - Bot initialized (notification-only mode)")
        
        # Dummy market data
        market_data = {
            'BTC': {'price': 95000000, 'market_cap': 1800000000000},
            'ETH': {'price': 3200000, 'market_cap': 380000000000},
            'SOL': {'price': 180000, 'market_cap': 80000000000},
        }
        bot.update_market_data(market_data)
        
        # Add dummy positions (for stop loss/profit taking test)
        bot.positions['SOL'] = {'amount': 10, 'avg_price': 82000, 'value': 1800000}
        bot.positions['DOGE'] = {'amount': 1000, 'avg_price': 900, 'value': 702000}
        
        # Update market data (loss/profit scenarios)
        market_data['DOGE'] = {'price': 702, 'market_cap': 10000000000}  # -22% loss
        market_data['SOL'] = {'price': 180000, 'market_cap': 80000000000}  # +120% profit
        bot.update_market_data(market_data)
        
        # Generate and test buy signal
        buy_signal = TradingSignal(
            timestamp=time.time(),
            coin='BTC',
            action='BUY',
            strategy=TradingStrategy.DCA,
            confidence=0.85,
            reason='Weekly DCA buy time'
        )
        
        print("   - Testing buy signal processing...")
        bot.execute_signal(buy_signal)
        time.sleep(2)
        
        # Generate and test sell signal
        sell_signal = TradingSignal(
            timestamp=time.time(),
            coin='ETH',
            action='SELL',
            strategy=TradingStrategy.RSI_DIVERGENCE,
            confidence=0.78,
            reason='RSI overbought + bearish divergence'
        )
        
        print("   - Testing sell signal processing...")
        bot.execute_signal(sell_signal)
        time.sleep(2)
        
        # Full strategy check (including stop loss/profit taking alerts)
        print("   - Testing full strategy check with alerts...")
        signals = bot.run_strategy_checks()
        
        print(f"   OK - Integrated bot test completed! Generated signals: {len(signals)}")
        
        # Portfolio summary
        summary = bot.get_portfolio_summary()
        print(f"   Portfolio Status:")
        print(f"      - Total Value: {summary['total_value']:,.0f} KRW")
        print(f"      - Cash: {summary['current_capital']:,.0f} KRW")
        print(f"      - Trade Count: {summary['trade_count']}")
        
    except Exception as e:
        print(f"   ERROR - Integrated bot test failed: {e}")

if __name__ == "__main__":
    print("NOTIFICATION FUNCTION IS MOST IMPORTANT!")
    print("MANUAL TRADING IS SAFER - TRADE AFTER CHECKING ALERTS!")
    print()
    
    # Run tests
    test_notification_system()
    
    print("\n" + "-"*60)
    
    test_integrated_bot()
    
    print("\n" + "="*60)
    print("TEST COMPLETED!")
    print("Now you can receive alerts from real market!")
    print("WARNING: Trade manually after checking alerts carefully!")
    print("="*60)
    
    input("\nPress Enter to exit...")