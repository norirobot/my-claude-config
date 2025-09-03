"""
업비트 거래소 API 연동 모듈
"""

import jwt
import uuid
import hashlib
import time
import requests
import logging
from urllib.parse import urlencode
from typing import Dict, List, Optional
from decimal import Decimal

logger = logging.getLogger(__name__)


class UpbitAPI:
    """업비트 거래소 API 클래스"""
    
    def __init__(self, access_key: str = None, secret_key: str = None):
        """
        Args:
            access_key: 업비트 API Access Key
            secret_key: 업비트 API Secret Key
        """
        self.access_key = access_key
        self.secret_key = secret_key
        self.base_url = "https://api.upbit.com/v1"
        
    def _get_auth_header(self, query: Dict = None):
        """인증 헤더 생성"""
        if not self.access_key or not self.secret_key:
            return {}
            
        payload = {
            'access_key': self.access_key,
            'nonce': str(uuid.uuid4()),
        }
        
        if query:
            query_string = urlencode(query).encode()
            m = hashlib.sha512()
            m.update(query_string)
            query_hash = m.hexdigest()
            payload['query_hash'] = query_hash
            payload['query_hash_alg'] = 'SHA512'
        
        jwt_token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        auth_header = {'Authorization': f'Bearer {jwt_token}'}
        return auth_header
    
    def get_markets(self) -> List[Dict]:
        """
        거래 가능한 마켓 목록 조회
        """
        url = f"{self.base_url}/market/all"
        params = {'isDetails': 'false'}
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            markets = response.json()
            
            # KRW 마켓만 필터링
            krw_markets = [m for m in markets if m['market'].startswith('KRW-')]
            return krw_markets
            
        except Exception as e:
            logger.error(f"마켓 목록 조회 실패: {e}")
            return []
    
    def get_ticker(self, markets: List[str]) -> List[Dict]:
        """
        현재가 정보 조회
        
        Args:
            markets: 마켓 코드 리스트 (예: ["KRW-BTC", "KRW-ETH"])
        """
        url = f"{self.base_url}/ticker"
        params = {'markets': ','.join(markets)}
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"현재가 조회 실패: {e}")
            return []
    
    def get_orderbook(self, markets: List[str]) -> List[Dict]:
        """
        호가 정보 조회
        """
        url = f"{self.base_url}/orderbook"
        params = {'markets': ','.join(markets)}
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"호가 조회 실패: {e}")
            return []
    
    def get_candles_minutes(self, market: str, unit: int = 60, count: int = 200) -> List[Dict]:
        """
        분봉 캔들 조회
        
        Args:
            market: 마켓 코드
            unit: 분 단위 (1, 3, 5, 15, 10, 30, 60, 240)
            count: 캔들 개수 (최대 200)
        """
        url = f"{self.base_url}/candles/minutes/{unit}"
        params = {
            'market': market,
            'count': count
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"분봉 조회 실패: {e}")
            return []
    
    def get_candles_days(self, market: str, count: int = 200) -> List[Dict]:
        """
        일봉 캔들 조회
        """
        url = f"{self.base_url}/candles/days"
        params = {
            'market': market,
            'count': count
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"일봉 조회 실패: {e}")
            return []
    
    def get_accounts(self) -> List[Dict]:
        """
        내 계좌 조회
        """
        if not self.access_key or not self.secret_key:
            logger.error("API 키가 설정되지 않았습니다")
            return []
            
        url = f"{self.base_url}/accounts"
        headers = self._get_auth_header()
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"계좌 조회 실패: {e}")
            return []
    
    def get_balance(self) -> Dict[str, float]:
        """
        잔고 조회 (간단한 형태로 반환)
        """
        accounts = self.get_accounts()
        balance = {}
        
        for account in accounts:
            currency = account['currency']
            available = float(account['balance'])
            locked = float(account['locked'])
            total = available + locked
            
            if total > 0:
                balance[currency] = {
                    'total': total,
                    'available': available,
                    'locked': locked,
                    'avg_buy_price': float(account.get('avg_buy_price', 0))
                }
        
        return balance
    
    def create_order(self, 
                    market: str,
                    side: str,
                    volume: float = None,
                    price: float = None,
                    ord_type: str = 'limit') -> Dict:
        """
        주문하기
        
        Args:
            market: 마켓 코드 (예: "KRW-BTC")
            side: 주문 종류 (bid: 매수, ask: 매도)
            volume: 주문량 (지정가, 매도 시)
            price: 주문 가격 (지정가, 매수 시)
            ord_type: 주문 타입 (limit: 지정가, market: 시장가)
        """
        if not self.access_key or not self.secret_key:
            logger.error("API 키가 설정되지 않았습니다")
            return {}
        
        url = f"{self.base_url}/orders"
        
        params = {
            'market': market,
            'side': side,
            'ord_type': ord_type
        }
        
        if ord_type == 'limit':
            if side == 'bid':
                # 매수시 가격 필요
                if price is None:
                    logger.error("지정가 매수시 가격이 필요합니다")
                    return {}
                params['price'] = str(price)
                
            elif side == 'ask':
                # 매도시 수량 필요
                if volume is None:
                    logger.error("지정가 매도시 수량이 필요합니다")
                    return {}
                params['volume'] = str(volume)
                
            if price is not None:
                params['price'] = str(price)
            if volume is not None:
                params['volume'] = str(volume)
                
        elif ord_type == 'market':
            if side == 'bid':
                # 시장가 매수시 총액 필요
                if price is None:
                    logger.error("시장가 매수시 총액이 필요합니다")
                    return {}
                params['price'] = str(price)
                
            elif side == 'ask':
                # 시장가 매도시 수량 필요
                if volume is None:
                    logger.error("시장가 매도시 수량이 필요합니다")
                    return {}
                params['volume'] = str(volume)
        
        headers = self._get_auth_header(params)
        
        try:
            response = requests.post(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"주문 실패: {e}")
            if hasattr(e, 'response'):
                logger.error(f"응답: {e.response.text}")
            return {}
    
    def get_order(self, uuid: str) -> Dict:
        """
        개별 주문 조회
        """
        if not self.access_key or not self.secret_key:
            logger.error("API 키가 설정되지 않았습니다")
            return {}
            
        url = f"{self.base_url}/order"
        params = {'uuid': uuid}
        headers = self._get_auth_header(params)
        
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"주문 조회 실패: {e}")
            return {}
    
    def cancel_order(self, uuid: str) -> Dict:
        """
        주문 취소
        """
        if not self.access_key or not self.secret_key:
            logger.error("API 키가 설정되지 않았습니다")
            return {}
            
        url = f"{self.base_url}/order"
        params = {'uuid': uuid}
        headers = self._get_auth_header(params)
        
        try:
            response = requests.delete(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"주문 취소 실패: {e}")
            return {}
    
    def get_orders(self, market: str = None, state: str = 'wait') -> List[Dict]:
        """
        주문 목록 조회
        
        Args:
            market: 마켓 코드
            state: 주문 상태 (wait: 체결 대기, done: 체결 완료, cancel: 취소)
        """
        if not self.access_key or not self.secret_key:
            logger.error("API 키가 설정되지 않았습니다")
            return []
            
        url = f"{self.base_url}/orders"
        params = {'state': state}
        
        if market:
            params['market'] = market
            
        headers = self._get_auth_header(params)
        
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"주문 목록 조회 실패: {e}")
            return []


class UpbitTrader:
    """업비트 자동매매 클래스 - 퍼즈 전략 적용"""
    
    def __init__(self, access_key: str = None, secret_key: str = None):
        self.api = UpbitAPI(access_key, secret_key)
        self.krw_markets = []
        self.current_prices = {}
        
    def update_market_info(self):
        """시장 정보 업데이트"""
        # 거래 가능 마켓 조회
        markets = self.api.get_markets()
        self.krw_markets = [m['market'] for m in markets]
        
        # 주요 코인만 필터링
        major_coins = ['KRW-BTC', 'KRW-ETH', 'KRW-SOL', 'KRW-XRP', 'KRW-ADA']
        self.krw_markets = [m for m in self.krw_markets if m in major_coins]
        
        # 현재가 업데이트
        if self.krw_markets:
            tickers = self.api.get_ticker(self.krw_markets)
            for ticker in tickers:
                self.current_prices[ticker['market']] = ticker['trade_price']
    
    def calculate_rsi(self, market: str, period: int = 14) -> float:
        """RSI 계산"""
        candles = self.api.get_candles_days(market, count=period+1)
        
        if len(candles) < period + 1:
            return 50.0
        
        gains = []
        losses = []
        
        for i in range(1, len(candles)):
            change = candles[i-1]['trade_price'] - candles[i]['trade_price']
            if change > 0:
                gains.append(change)
                losses.append(0)
            else:
                gains.append(0)
                losses.append(abs(change))
        
        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period
        
        if avg_loss == 0:
            return 100
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def calculate_moving_average(self, market: str, period: int = 20) -> float:
        """이동평균 계산"""
        candles = self.api.get_candles_days(market, count=period)
        
        if len(candles) < period:
            return 0
        
        prices = [candle['trade_price'] for candle in candles]
        return sum(prices) / len(prices)
    
    def execute_dca_strategy(self, market: str = 'KRW-BTC', amount_krw: float = 100000):
        """
        정적립식 매수 전략 실행
        
        Args:
            market: 매수할 마켓
            amount_krw: 매수 금액 (KRW)
        """
        logger.info(f"정적립식 매수 실행: {market} / {amount_krw:,}원")
        
        # 시장가 매수
        order = self.api.create_order(
            market=market,
            side='bid',
            price=amount_krw,
            ord_type='market'
        )
        
        if order:
            logger.info(f"매수 주문 성공: {order.get('uuid')}")
            return order
        else:
            logger.error("매수 주문 실패")
            return None
    
    def check_puzzle_signal(self, market: str) -> str:
        """
        퍼즈 전략 신호 체크
        
        Returns:
            'BUY', 'SELL', 'HOLD' 중 하나
        """
        # RSI 체크
        rsi = self.calculate_rsi(market)
        
        # 이동평균선 체크
        ma20 = self.calculate_moving_average(market, 20)
        ma60 = self.calculate_moving_average(market, 60)
        current_price = self.current_prices.get(market, 0)
        
        # 매수 조건: RSI 과매도 + 단기 이평선 상향 돌파
        if rsi < 30 and current_price > ma20:
            return 'BUY'
        
        # 매도 조건: RSI 과매수 + 단기 이평선 하향 돌파
        elif rsi > 70 and current_price < ma20:
            return 'SELL'
        
        return 'HOLD'
    
    def get_portfolio_status(self) -> Dict:
        """포트폴리오 현황 조회"""
        balance = self.api.get_balance()
        
        total_krw = balance.get('KRW', {}).get('total', 0)
        total_value_krw = total_krw
        
        portfolio = {
            'KRW': total_krw,
            'coins': {}
        }
        
        for currency, info in balance.items():
            if currency != 'KRW':
                market = f'KRW-{currency}'
                current_price = self.current_prices.get(market, info['avg_buy_price'])
                
                coin_value_krw = info['total'] * current_price
                total_value_krw += coin_value_krw
                
                portfolio['coins'][currency] = {
                    'amount': info['total'],
                    'avg_price': info['avg_buy_price'],
                    'current_price': current_price,
                    'value_krw': coin_value_krw,
                    'profit': (current_price - info['avg_buy_price']) / info['avg_buy_price'] * 100 if info['avg_buy_price'] > 0 else 0
                }
        
        portfolio['total_value_krw'] = total_value_krw
        
        return portfolio


def main_test():
    """테스트 함수"""
    # API 키 설정 (실제 사용시 환경변수나 설정 파일에서 읽기)
    # upbit = UpbitAPI(access_key="YOUR_ACCESS_KEY", secret_key="YOUR_SECRET_KEY")
    
    # 공개 API 테스트 (인증 불필요)
    upbit = UpbitAPI()
    
    # 마켓 조회
    markets = upbit.get_markets()
    print(f"거래 가능 마켓 수: {len(markets)}")
    
    # 비트코인 현재가 조회
    ticker = upbit.get_ticker(['KRW-BTC'])
    if ticker:
        btc_price = ticker[0]['trade_price']
        print(f"비트코인 현재가: {btc_price:,.0f}원")
    
    # RSI 계산 테스트
    trader = UpbitTrader()
    trader.update_market_info()
    
    for market in ['KRW-BTC', 'KRW-ETH']:
        rsi = trader.calculate_rsi(market)
        signal = trader.check_puzzle_signal(market)
        print(f"{market} - RSI: {rsi:.2f}, Signal: {signal}")


if __name__ == "__main__":
    main_test()