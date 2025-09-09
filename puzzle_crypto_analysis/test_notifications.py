"""
퍼즈 봇 알림 시스템 테스트
"""

import time
from puzz_trading_bot import PuzzleTradingBot, TradingSignal, TradingStrategy
from notification_system import NotificationSystem, AlertMessage, AlertType

print("="*60)
print("🚨 퍼즈 봇 알림 시스템 테스트")
print("="*60)

def test_notification_system():
    """알림 시스템 단독 테스트"""
    print("\n1️⃣ 알림 시스템 단독 테스트")
    
    try:
        notifier = NotificationSystem()
        
        # 매수 신호 테스트
        buy_message = AlertMessage(
            title="🟢 매수 신호: BTC",
            message="전략: 정적립식\n가격: 95,000,000원\n이유: DCA 매수 시점 도달\n신뢰도: 85%",
            alert_type=AlertType.BUY_SIGNAL,
            coin="BTC",
            price=95000000,
            strategy="정적립식"
        )
        
        print("   - 매수 신호 알림 테스트...")
        notifier.send_buy_signal(buy_message)
        time.sleep(2)
        
        # 매도 신호 테스트
        sell_message = AlertMessage(
            title="🔴 매도 신호: ETH",
            message="전략: RSI_다이버전스\n가격: 3,200,000원\n이유: RSI 과매수 + 다이버전스\n신뢰도: 78%",
            alert_type=AlertType.SELL_SIGNAL,
            coin="ETH",
            price=3200000,
            strategy="RSI_다이버전스"
        )
        
        print("   - 매도 신호 알림 테스트...")
        notifier.send_sell_signal(sell_message)
        time.sleep(2)
        
        # 손절 경고 테스트
        stop_loss_message = AlertMessage(
            title="🚨 손절 권고: DOGE",
            message="현재 손실: -22%\n매수가: 900원\n현재가: 702원\n퍼즈 전략에 따라 손절 고려하세요!",
            alert_type=AlertType.STOP_LOSS,
            coin="DOGE",
            price=702
        )
        
        print("   - 손절 알림 테스트...")
        notifier.send_stop_loss_alert(stop_loss_message)
        time.sleep(2)
        
        # 익절 알림 테스트
        profit_message = AlertMessage(
            title="🎉 대박 수익: SOL (+120%)",
            message="현재 수익: +120%\n매수가: 50,000원\n현재가: 110,000원\n퍼즈 전략: 50% 익절 고려!",
            alert_type=AlertType.PROFIT_TARGET,
            coin="SOL",
            price=110000
        )
        
        print("   - 익절 알림 테스트...")
        notifier.send_profit_alert(profit_message)
        
        print("   ✅ 알림 시스템 단독 테스트 완료!")
        
    except Exception as e:
        print(f"   ❌ 알림 시스템 테스트 실패: {e}")

def test_integrated_bot():
    """통합 봇 테스트"""
    print("\n2️⃣ 퍼즈 봇 통합 알림 테스트")
    
    try:
        # 봇 초기화 (알림 전용 모드)
        bot = PuzzleTradingBot(initial_capital=1000000, enable_paper_trading=True)
        print("   ✅ 봇 초기화 완료 (알림 전용 모드)")
        
        # 더미 시장 데이터
        market_data = {
            'BTC': {'price': 95000000, 'market_cap': 1800000000000},
            'ETH': {'price': 3200000, 'market_cap': 380000000000},
            'SOL': {'price': 180000, 'market_cap': 80000000000},
        }
        bot.update_market_data(market_data)
        
        # 더미 포지션 추가 (손절/익절 테스트용)
        bot.positions['SOL'] = {'amount': 10, 'avg_price': 82000, 'value': 1800000}
        bot.positions['DOGE'] = {'amount': 1000, 'avg_price': 900, 'value': 702000}
        
        # 더미 시장 데이터 업데이트 (손실/수익 시나리오)
        market_data['DOGE'] = {'price': 702, 'market_cap': 10000000000}  # -22% 손실
        market_data['SOL'] = {'price': 180000, 'market_cap': 80000000000}  # +120% 수익
        bot.update_market_data(market_data)
        
        # 매수 신호 생성 및 테스트
        buy_signal = TradingSignal(
            timestamp=time.time(),
            coin='BTC',
            action='BUY',
            strategy=TradingStrategy.DCA,
            confidence=0.85,
            reason='주간 DCA 매수 시점'
        )
        
        print("   - 매수 신호 처리 테스트...")
        bot.execute_signal(buy_signal)
        time.sleep(2)
        
        # 매도 신호 생성 및 테스트
        sell_signal = TradingSignal(
            timestamp=time.time(),
            coin='ETH',
            action='SELL',
            strategy=TradingStrategy.RSI_DIVERGENCE,
            confidence=0.78,
            reason='RSI 과매수 + 베어리시 다이버전스'
        )
        
        print("   - 매도 신호 처리 테스트...")
        bot.execute_signal(sell_signal)
        time.sleep(2)
        
        # 전체 전략 체크 (손절/익절 알림 포함)
        print("   - 전체 전략 체크 및 알림 테스트...")
        signals = bot.run_strategy_checks()
        
        print(f"   ✅ 통합 봇 테스트 완료! 생성된 신호: {len(signals)}개")
        
        # 포트폴리오 요약
        summary = bot.get_portfolio_summary()
        print(f"   📊 포트폴리오 현황:")
        print(f"      - 총 자산: {summary['total_value']:,.0f}원")
        print(f"      - 현금: {summary['current_capital']:,.0f}원")
        print(f"      - 거래 횟수: {summary['trade_count']}회")
        
    except Exception as e:
        print(f"   ❌ 통합 봇 테스트 실패: {e}")

if __name__ == "__main__":
    print("🔔 알림 기능이 가장 중요합니다!")
    print("💡 매매는 알림을 보고 직접 하세요 - 더 안전합니다!")
    print()
    
    # 테스트 실행
    test_notification_system()
    
    print("\n" + "-"*60)
    
    test_integrated_bot()
    
    print("\n" + "="*60)
    print("🎯 테스트 완료!")
    print("📱 이제 실제 시장에서 알림을 받을 수 있습니다.")
    print("⚠️  실제 매매는 알림을 확인하고 신중하게 직접 하세요!")
    print("="*60)
    
    input("\n엔터 키를 눌러 종료...")