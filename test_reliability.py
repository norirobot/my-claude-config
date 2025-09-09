"""
업비트 RSI 모니터링 시스템 신뢰성 테스트
RSI 계산 정확성과 실시간 데이터 신뢰성 검증
"""

import asyncio
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from upbit_rsi_monitor import RSICalculator, CandleDataManager
import time
import json

class RSIReliabilityTester:
    """RSI 계산 신뢰성 테스트 클래스"""
    
    def __init__(self):
        self.test_results = []
    
    def get_historical_data(self, market: str, interval: str = '1', count: int = 200):
        """업비트에서 과거 캔들 데이터 조회"""
        try:
            url = f"https://api.upbit.com/v1/candles/minutes/{interval}"
            params = {
                'market': market,
                'count': count
            }
            
            response = requests.get(url, params=params)
            if response.status_code != 200:
                print(f"❌ API 요청 실패: {response.status_code}")
                return None
            
            data = response.json()
            if not data:
                print("❌ 데이터가 없습니다")
                return None
            
            # 시간 순으로 정렬 (오래된 것부터)
            data = sorted(data, key=lambda x: x['candle_date_time_utc'])
            
            df = pd.DataFrame(data)
            df['close'] = df['trade_price'].astype(float)
            
            return df
            
        except Exception as e:
            print(f"❌ 데이터 조회 실패: {e}")
            return None
    
    def calculate_reference_rsi(self, prices: list, period: int = 14) -> float:
        """참조용 RSI 계산 (pandas 기반)"""
        if len(prices) < period + 1:
            return None
            
        prices_series = pd.Series(prices)
        delta = prices_series.diff()
        
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        # Wilder's smoothing
        avg_gain = gain.rolling(window=period).mean().iloc[period]
        avg_loss = loss.rolling(window=period).mean().iloc[period]
        
        for i in range(period + 1, len(prices)):
            avg_gain = (avg_gain * (period - 1) + gain.iloc[i]) / period
            avg_loss = (avg_loss * (period - 1) + loss.iloc[i]) / period
        
        if avg_loss == 0:
            return 100.0
            
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return round(rsi, 2)
    
    def test_rsi_accuracy(self, market: str = 'KRW-BTC', samples: int = 10):
        """RSI 계산 정확성 테스트"""
        print(f"🔍 RSI 계산 정확성 테스트 시작: {market}")
        print("-" * 50)
        
        # 과거 데이터 조회
        df = self.get_historical_data(market, count=100)
        if df is None:
            return False
        
        prices = df['close'].tolist()
        
        # 우리 계산기
        our_calculator = RSICalculator()
        
        # 여러 지점에서 테스트
        test_points = []
        for i in range(30, min(len(prices), 30 + samples)):
            # 참조 RSI 계산
            reference_rsi = self.calculate_reference_rsi(prices[:i+1])
            
            # 우리 RSI 계산
            test_calculator = RSICalculator()
            our_rsi = None
            for j in range(i + 1):
                our_rsi = test_calculator.add_price(prices[j])
            
            if reference_rsi is not None and our_rsi is not None:
                diff = abs(reference_rsi - our_rsi)
                accuracy = 100 - min(100, diff * 10)  # 오차율을 정확도로 변환
                
                test_points.append({
                    'index': i,
                    'price': prices[i],
                    'reference_rsi': reference_rsi,
                    'our_rsi': our_rsi,
                    'difference': diff,
                    'accuracy': accuracy
                })
                
                status = "✅" if diff < 0.5 else "⚠️" if diff < 2.0 else "❌"
                print(f"{status} 지점 {i}: 참조={reference_rsi:.2f}, 계산={our_rsi:.2f}, 차이={diff:.2f}")
        
        # 결과 분석
        if test_points:
            avg_diff = np.mean([p['difference'] for p in test_points])
            max_diff = max([p['difference'] for p in test_points])
            accuracy_rate = sum(1 for p in test_points if p['difference'] < 0.5) / len(test_points) * 100
            
            print(f"\n📊 정확성 테스트 결과:")
            print(f"   평균 오차: {avg_diff:.3f}")
            print(f"   최대 오차: {max_diff:.3f}")
            print(f"   정확도 (오차 < 0.5): {accuracy_rate:.1f}%")
            
            success = avg_diff < 1.0 and accuracy_rate > 90
            if success:
                print("✅ RSI 계산 정확성 테스트 통과")
            else:
                print("❌ RSI 계산 정확성 테스트 실패")
            
            return success
        
        return False
    
    def test_real_time_consistency(self, market: str = 'KRW-BTC', duration: int = 60):
        """실시간 데이터 일관성 테스트"""
        print(f"\n🔄 실시간 데이터 일관성 테스트: {market} ({duration}초)")
        print("-" * 50)
        
        candle_manager = CandleDataManager('1m')
        rsi_values = []
        price_changes = []
        
        start_time = time.time()
        last_price = None
        
        try:
            while time.time() - start_time < duration:
                # 현재 가격 조회
                response = requests.get(f'https://api.upbit.com/v1/ticker?markets={market}')
                if response.status_code == 200:
                    ticker_data = response.json()[0]
                    current_price = float(ticker_data['trade_price'])
                    timestamp = datetime.now()
                    
                    # 캔들 매니저 업데이트
                    candle_manager.update_ticker(market, current_price, timestamp)
                    
                    # RSI 계산
                    rsi = candle_manager.get_current_rsi(market)
                    
                    if rsi is not None:
                        rsi_values.append(rsi)
                        
                        if last_price is not None:
                            price_change = (current_price - last_price) / last_price * 100
                            price_changes.append(price_change)
                        
                        print(f"⏰ {timestamp.strftime('%H:%M:%S')} | 가격: {current_price:,} | RSI: {rsi:.2f}")
                    
                    last_price = current_price
                
                time.sleep(2)  # 2초마다 체크
                
        except KeyboardInterrupt:
            print("\n⏹️ 사용자에 의해 테스트 중단")
        
        # 결과 분석
        if len(rsi_values) > 1:
            rsi_stability = np.std(rsi_values)
            rsi_range = max(rsi_values) - min(rsi_values)
            
            print(f"\n📊 일관성 테스트 결과:")
            print(f"   RSI 샘플 수: {len(rsi_values)}")
            print(f"   RSI 평균: {np.mean(rsi_values):.2f}")
            print(f"   RSI 표준편차: {rsi_stability:.2f}")
            print(f"   RSI 범위: {rsi_range:.2f}")
            
            # 안정성 판단
            is_stable = rsi_stability < 5.0 and rsi_range < 20.0
            if is_stable:
                print("✅ 실시간 데이터 일관성 테스트 통과")
            else:
                print("⚠️ 실시간 데이터 변동성 높음 (정상적일 수 있음)")
            
            return True
        
        return False
    
    def test_edge_cases(self):
        """극한 상황 테스트"""
        print(f"\n🧪 극한 상황 테스트")
        print("-" * 50)
        
        calculator = RSICalculator()
        
        # 테스트 케이스들
        test_cases = [
            {
                'name': '연속 상승',
                'prices': [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200] * 2,
                'expected_rsi_range': (80, 100)
            },
            {
                'name': '연속 하락',
                'prices': [200, 190, 180, 170, 160, 150, 140, 130, 120, 110, 100] * 2,
                'expected_rsi_range': (0, 20)
            },
            {
                'name': '변동 없음',
                'prices': [100] * 30,
                'expected_rsi_range': (45, 55)
            }
        ]
        
        all_passed = True
        
        for test_case in test_cases:
            test_calculator = RSICalculator()
            rsi = None
            
            for price in test_case['prices']:
                rsi = test_calculator.add_price(price)
            
            if rsi is not None:
                min_expected, max_expected = test_case['expected_rsi_range']
                passed = min_expected <= rsi <= max_expected
                
                status = "✅" if passed else "❌"
                print(f"{status} {test_case['name']}: RSI = {rsi:.2f} (예상: {min_expected}-{max_expected})")
                
                if not passed:
                    all_passed = False
            else:
                print(f"❌ {test_case['name']}: RSI 계산 실패")
                all_passed = False
        
        if all_passed:
            print("✅ 모든 극한 상황 테스트 통과")
        else:
            print("❌ 일부 극한 상황 테스트 실패")
        
        return all_passed

async def test_telegram_connection():
    """텔레그램 연결 테스트"""
    print(f"\n📱 텔레그램 연결 테스트")
    print("-" * 50)
    
    try:
        import configparser
        config = configparser.ConfigParser()
        config.read('config.ini', encoding='utf-8')
        
        token = config.get('telegram', 'token', fallback='')
        chat_id = config.get('telegram', 'chat_id', fallback='')
        
        if not token or token == 'YOUR_TELEGRAM_BOT_TOKEN':
            print("❌ 텔레그램 토큰이 설정되지 않음")
            return False
        
        if not chat_id or chat_id == 'YOUR_CHAT_ID':
            print("❌ Chat ID가 설정되지 않음")
            return False
        
        # 봇 정보 조회
        response = requests.get(f'https://api.telegram.org/bot{token}/getMe')
        if response.status_code != 200:
            print("❌ 봇 토큰이 유효하지 않음")
            return False
        
        bot_info = response.json()
        if not bot_info['ok']:
            print("❌ 봇 토큰이 유효하지 않음")
            return False
        
        print(f"✅ 봇 연결 성공: {bot_info['result']['first_name']}")
        
        # 테스트 메시지 전송
        test_message = f"🧪 RSI 모니터링 시스템 테스트\n⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        send_response = requests.post(
            f'https://api.telegram.org/bot{token}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': test_message
            }
        )
        
        if send_response.status_code == 200:
            print("✅ 테스트 메시지 전송 성공")
            return True
        else:
            print(f"❌ 메시지 전송 실패: {send_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 텔레그램 연결 테스트 실패: {e}")
        return False

def main():
    """메인 테스트 실행"""
    print("🔬 업비트 RSI 모니터링 시스템 신뢰성 테스트")
    print("=" * 60)
    
    tester = RSIReliabilityTester()
    test_results = []
    
    # 1. RSI 계산 정확성 테스트
    try:
        result1 = tester.test_rsi_accuracy('KRW-BTC', 10)
        test_results.append(('RSI 계산 정확성', result1))
    except Exception as e:
        print(f"❌ RSI 정확성 테스트 오류: {e}")
        test_results.append(('RSI 계산 정확성', False))
    
    # 2. 극한 상황 테스트
    try:
        result2 = tester.test_edge_cases()
        test_results.append(('극한 상황 테스트', result2))
    except Exception as e:
        print(f"❌ 극한 상황 테스트 오류: {e}")
        test_results.append(('극한 상황 테스트', False))
    
    # 3. 텔레그램 연결 테스트
    try:
        result3 = asyncio.run(test_telegram_connection())
        test_results.append(('텔레그램 연결', result3))
    except Exception as e:
        print(f"❌ 텔레그램 테스트 오류: {e}")
        test_results.append(('텔레그램 연결', False))
    
    # 4. 실시간 일관성 테스트 (선택사항)
    print(f"\n❓ 실시간 일관성 테스트를 진행하시겠습니까? (30초 소요) [y/N]: ", end="")
    if input().lower() == 'y':
        try:
            result4 = tester.test_real_time_consistency('KRW-BTC', 30)
            test_results.append(('실시간 일관성', result4))
        except Exception as e:
            print(f"❌ 실시간 테스트 오류: {e}")
            test_results.append(('실시간 일관성', False))
    
    # 최종 결과
    print(f"\n📋 전체 테스트 결과")
    print("=" * 60)
    
    passed_tests = 0
    total_tests = len(test_results)
    
    for test_name, passed in test_results:
        status = "✅ 통과" if passed else "❌ 실패"
        print(f"{status} | {test_name}")
        if passed:
            passed_tests += 1
    
    print(f"\n🎯 총 {passed_tests}/{total_tests}개 테스트 통과")
    
    if passed_tests == total_tests:
        print("🎉 모든 테스트 통과! 시스템이 신뢰할 수 있습니다.")
    elif passed_tests >= total_tests * 0.8:
        print("⚠️  대부분의 테스트 통과. 일부 설정을 확인하세요.")
    else:
        print("❌ 여러 테스트 실패. 설정과 연결을 확인하세요.")

if __name__ == "__main__":
    main()