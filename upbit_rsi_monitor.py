"""
업비트 RSI 실시간 모니터링 시스템
신뢰성 있는 데이터 수집과 정확한 RSI 계산을 위한 메인 모듈
"""

import asyncio
import websockets
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import configparser
import time
from collections import deque, defaultdict
from typing import Dict, List, Optional
import requests
import telegram
from telegram import Bot

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('upbit_rsi_monitor.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RSICalculator:
    """정확한 RSI 계산을 위한 클래스"""
    
    def __init__(self, period: int = 14):
        self.period = period
        self.price_data = deque(maxlen=period + 50)  # 충분한 여유 데이터
        
    def add_price(self, price: float) -> Optional[float]:
        """새 가격 데이터 추가 및 RSI 계산"""
        self.price_data.append(price)
        
        if len(self.price_data) < self.period + 1:
            return None
            
        return self._calculate_rsi()
    
    def _calculate_rsi(self) -> float:
        """RSI 계산 (Wilder's Smoothing Method)"""
        prices = list(self.price_data)
        deltas = np.diff(prices)
        
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        if len(gains) < self.period:
            return 50.0
            
        # 초기 평균 계산
        avg_gain = np.mean(gains[:self.period])
        avg_loss = np.mean(losses[:self.period])
        
        # Wilder's Smoothing 적용
        for i in range(self.period, len(gains)):
            avg_gain = ((avg_gain * (self.period - 1)) + gains[i]) / self.period
            avg_loss = ((avg_loss * (self.period - 1)) + losses[i]) / self.period
        
        if avg_loss == 0:
            return 100.0
            
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return round(rsi, 2)

class CandleDataManager:
    """캔들 데이터 관리 클래스"""
    
    def __init__(self, interval: str = '1m'):
        self.interval = interval
        self.candles = defaultdict(list)  # {market: [candles]}
        self.current_candle = defaultdict(dict)  # {market: current_candle}
        self.rsi_calculators = defaultdict(lambda: RSICalculator())
        
    def get_interval_seconds(self) -> int:
        """봉 간격을 초 단위로 변환"""
        if self.interval.endswith('m'):
            return int(self.interval[:-1]) * 60
        elif self.interval.endswith('h'):
            return int(self.interval[:-1]) * 3600
        elif self.interval.endswith('d'):
            return int(self.interval[:-1]) * 86400
        return 60  # 기본값: 1분

    def update_ticker(self, market: str, price: float, timestamp: datetime):
        """실시간 티커 데이터로 캔들 업데이트"""
        interval_seconds = self.get_interval_seconds()
        candle_start = timestamp - timedelta(seconds=timestamp.second % interval_seconds,
                                           microseconds=timestamp.microsecond)
        
        if market not in self.current_candle or self.current_candle[market].get('timestamp') != candle_start:
            # 새로운 캔들 시작
            if market in self.current_candle and self.current_candle[market]:
                # 이전 캔들 완료 - RSI 계산
                completed_candle = self.current_candle[market]
                rsi = self.rsi_calculators[market].add_price(completed_candle['close'])
                completed_candle['rsi'] = rsi
                
                self.candles[market].append(completed_candle)
                if len(self.candles[market]) > 200:  # 메모리 관리
                    self.candles[market].pop(0)
            
            # 새 캔들 초기화
            self.current_candle[market] = {
                'timestamp': candle_start,
                'open': price,
                'high': price,
                'low': price,
                'close': price,
                'volume': 0
            }
        else:
            # 기존 캔들 업데이트
            candle = self.current_candle[market]
            candle['high'] = max(candle['high'], price)
            candle['low'] = min(candle['low'], price)
            candle['close'] = price

    def get_current_rsi(self, market: str) -> Optional[float]:
        """현재 RSI 값 반환"""
        if market not in self.current_candle:
            return None
            
        # 현재 진행 중인 캔들의 종가로 임시 RSI 계산
        current_price = self.current_candle[market]['close']
        temp_calculator = RSICalculator()
        
        # 과거 데이터로 계산기 초기화
        for candle in self.candles[market][-20:]:  # 최근 20개 캔들
            if 'close' in candle:
                temp_calculator.add_price(candle['close'])
        
        return temp_calculator.add_price(current_price)

class TelegramNotifier:
    """텔레그램 알림 클래스"""
    
    def __init__(self, token: str, chat_id: str):
        self.bot = Bot(token=token)
        self.chat_id = chat_id
        
    async def send_alert(self, market: str, rsi: float, price: float, condition: str):
        """RSI 조건 만족 시 알림 전송"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        message = f"""
🚨 <b>RSI 알림</b>
        
📊 <b>코인:</b> {market}
💰 <b>가격:</b> {price:,.0f}원
📈 <b>RSI:</b> {rsi}
⚠️ <b>조건:</b> {condition}
🕐 <b>시간:</b> {timestamp}
        """
        
        try:
            await self.bot.send_message(
                chat_id=self.chat_id,
                text=message,
                parse_mode='HTML'
            )
            logger.info(f"텔레그램 알림 전송 완료: {market} RSI={rsi}")
        except Exception as e:
            logger.error(f"텔레그램 알림 전송 실패: {e}")

class UpbitRSIMonitor:
    """메인 모니터링 클래스"""
    
    def __init__(self, config_file: str = 'config.ini'):
        self.config = configparser.ConfigParser()
        self.config.read(config_file, encoding='utf-8')
        
        # 설정 로드
        self.load_settings()
        
        # 모듈 초기화
        self.candle_manager = CandleDataManager(self.interval)
        self.notifier = TelegramNotifier(self.telegram_token, self.chat_id)
        
        # 알림 중복 방지
        self.last_alert_time = defaultdict(lambda: defaultdict(int))
        self.alert_cooldown = 300  # 5분 쿨다운
        
        # WebSocket 연결
        self.ws_url = "wss://api.upbit.com/websocket/v1"
        
    def load_settings(self):
        """설정 파일 로드"""
        try:
            # 모니터링 설정
            self.target_markets = self.config.get('monitoring', 'markets', fallback='ALL').split(',')
            self.rsi_low_threshold = self.config.getfloat('monitoring', 'rsi_low', fallback=30.0)
            self.rsi_high_threshold = self.config.getfloat('monitoring', 'rsi_high', fallback=70.0)
            self.interval = self.config.get('monitoring', 'interval', fallback='1m')
            
            # 텔레그램 설정
            self.telegram_token = self.config.get('telegram', 'token')
            self.chat_id = self.config.get('telegram', chat_id')
            
            logger.info(f"설정 로드 완료 - 임계값: {self.rsi_low_threshold}/{self.rsi_high_threshold}, 봉: {self.interval}")
            
        except Exception as e:
            logger.error(f"설정 파일 로드 실패: {e}")
            raise
    
    def get_market_list(self) -> List[str]:
        """모니터링할 마켓 리스트 반환"""
        if self.target_markets == ['ALL']:
            try:
                response = requests.get('https://api.upbit.com/v1/market/all')
                markets_data = response.json()
                return [market['market'] for market in markets_data if market['market'].startswith('KRW-')]
            except Exception as e:
                logger.error(f"마켓 리스트 조회 실패: {e}")
                return ['KRW-BTC', 'KRW-ETH']  # 기본값
        else:
            return [market.strip() for market in self.target_markets if market.strip()]
    
    def check_rsi_conditions(self, market: str, rsi: float, price: float):
        """RSI 조건 확인 및 알림"""
        current_time = int(time.time())
        
        # 과매수 조건
        if rsi >= self.rsi_high_threshold:
            if current_time - self.last_alert_time[market]['high'] > self.alert_cooldown:
                asyncio.create_task(self.notifier.send_alert(
                    market, rsi, price, f"과매수 (RSI ≥ {self.rsi_high_threshold})"
                ))
                self.last_alert_time[market]['high'] = current_time
        
        # 과매도 조건
        elif rsi <= self.rsi_low_threshold:
            if current_time - self.last_alert_time[market]['low'] > self.alert_cooldown:
                asyncio.create_task(self.notifier.send_alert(
                    market, rsi, price, f"과매도 (RSI ≤ {self.rsi_low_threshold})"
                ))
                self.last_alert_time[market]['low'] = current_time
    
    async def websocket_handler(self):
        """WebSocket 데이터 처리"""
        markets = self.get_market_list()
        logger.info(f"모니터링 시작: {len(markets)}개 마켓")
        
        # WebSocket 구독 메시지
        subscribe_msg = json.dumps([
            {"ticket": "rsi_monitor"},
            {"type": "ticker", "codes": markets}
        ])
        
        try:
            async with websockets.connect(self.ws_url) as websocket:
                await websocket.send(subscribe_msg)
                logger.info("WebSocket 연결 및 구독 완료")
                
                async for message in websocket:
                    try:
                        # 바이너리 데이터 파싱
                        data = json.loads(message.decode('utf-8'))
                        
                        market = data['code']
                        price = float(data['trade_price'])
                        timestamp = datetime.now()
                        
                        # 캔들 데이터 업데이트
                        self.candle_manager.update_ticker(market, price, timestamp)
                        
                        # RSI 계산 및 조건 확인
                        rsi = self.candle_manager.get_current_rsi(market)
                        if rsi is not None:
                            self.check_rsi_conditions(market, rsi, price)
                            
                            # 로그 출력 (선택된 코인만)
                            if market in ['KRW-BTC', 'KRW-ETH'] or len(markets) <= 10:
                                logger.info(f"{market}: 가격={price:,} RSI={rsi:.2f}")
                    
                    except Exception as e:
                        logger.error(f"데이터 처리 오류: {e}")
                        continue
                        
        except Exception as e:
            logger.error(f"WebSocket 연결 오류: {e}")
            await asyncio.sleep(5)  # 5초 대기 후 재연결
            await self.websocket_handler()
    
    async def start_monitoring(self):
        """모니터링 시작"""
        logger.info("업비트 RSI 실시간 모니터링 시작")
        await self.websocket_handler()

def create_default_config():
    """기본 설정 파일 생성"""
    config = configparser.ConfigParser()
    
    config['monitoring'] = {
        'markets': 'ALL',  # 또는 'KRW-BTC,KRW-ETH,KRW-ADA'
        'rsi_low': '30',
        'rsi_high': '70',
        'interval': '1m'  # 1m, 5m, 15m, 1h, 4h, 1d
    }
    
    config['telegram'] = {
        'token': 'YOUR_TELEGRAM_BOT_TOKEN',
        'chat_id': 'YOUR_CHAT_ID'
    }
    
    with open('config.ini', 'w', encoding='utf-8') as f:
        config.write(f)
    
    print("기본 설정 파일 'config.ini' 생성 완료")
    print("텔레그램 토큰과 채팅 ID를 설정하세요")

async def main():
    """메인 실행 함수"""
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--create-config':
        create_default_config()
        return
    
    try:
        monitor = UpbitRSIMonitor()
        await monitor.start_monitoring()
    except KeyboardInterrupt:
        logger.info("사용자에 의해 모니터링 중단")
    except Exception as e:
        logger.error(f"예상치 못한 오류: {e}")

if __name__ == "__main__":
    asyncio.run(main())