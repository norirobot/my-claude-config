"""
퍼즈(Puzzle) 암호화폐 자동매매 프로그램
Based on Puzzle's YouTube Trading Strategies
"""

import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np
from dataclasses import dataclass
from enum import Enum
from notification_system import NotificationSystem, AlertType, AlertMessage, AlertPriority

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MarketPhase(Enum):
    """시장 단계 정의"""
    ACCUMULATION = "축적기"  # 바닥권
    UPTREND = "상승기"      # 불장 초반
    DISTRIBUTION = "분산기"  # 불장 후반
    DOWNTREND = "하락기"     # 베어마켓


class TradingStrategy(Enum):
    """트레이딩 전략 종류"""
    DCA = "정적립식"  # Dollar Cost Averaging
    DOMINANCE_ROTATION = "도미넌스_로테이션"
    RSI_DIVERGENCE = "RSI_다이버전스"
    BOLLINGER_BAND = "볼린저밴드"


@dataclass
class PortfolioConfig:
    """포트폴리오 설정"""
    btc_ratio: float = 0.6      # 비트코인 비중
    eth_ratio: float = 0.2      # 이더리움 비중
    alt_ratio: float = 0.15     # 알트코인 비중
    cash_ratio: float = 0.05    # 현금 비중
    
    def validate(self):
        """비율 검증"""
        total = self.btc_ratio + self.eth_ratio + self.alt_ratio + self.cash_ratio
        if abs(total - 1.0) > 0.001:
            raise ValueError(f"포트폴리오 비율 합계가 100%가 아닙니다: {total*100}%")


@dataclass
class TradingSignal:
    """매매 신호"""
    timestamp: datetime
    coin: str
    action: str  # BUY, SELL, HOLD
    strategy: TradingStrategy
    confidence: float  # 0.0 ~ 1.0
    reason: str


class PuzzleTradingBot:
    """퍼즈 트레이딩 전략 기반 자동매매 봇"""
    
    def __init__(self, 
                 initial_capital: float = 10000,
                 portfolio_config: Optional[PortfolioConfig] = None,
                 enable_paper_trading: bool = True):
        """
        Args:
            initial_capital: 초기 자본금 (USD)
            portfolio_config: 포트폴리오 설정
            enable_paper_trading: 모의투자 모드 활성화
        """
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.portfolio_config = portfolio_config or PortfolioConfig()
        self.portfolio_config.validate()
        
        # 알림 시스템 초기화
        self.notification_system = NotificationSystem()
        
        self.enable_paper_trading = enable_paper_trading
        self.positions = {}  # 현재 포지션
        self.trade_history = []  # 거래 내역
        self.market_data = {}  # 시장 데이터
        
        # DCA 설정
        self.dca_amount = initial_capital * 0.1  # 매회 투자금액 (자본의 10%)
        self.dca_interval_days = 7  # 투자 주기 (주 단위)
        self.last_dca_date = None
        
        logger.info(f"퍼즈 알림봇 초기화 완료 - 초기자본: ${initial_capital} (알림 전용)")
    
    def analyze_market_phase(self) -> MarketPhase:
        """
        현재 시장 단계 분석
        퍼즐의 시장 분석 방법론 적용
        """
        # TODO: 실제 시장 데이터 기반 분석
        # 여기서는 간단한 로직으로 구현
        
        btc_price = self.market_data.get('BTC', {}).get('price', 0)
        btc_sma200 = self.calculate_sma('BTC', 200)
        
        if btc_price == 0 or btc_sma200 == 0:
            return MarketPhase.ACCUMULATION
        
        price_to_sma = btc_price / btc_sma200
        
        if price_to_sma < 0.8:
            return MarketPhase.DOWNTREND
        elif price_to_sma < 1.0:
            return MarketPhase.ACCUMULATION
        elif price_to_sma < 1.5:
            return MarketPhase.UPTREND
        else:
            return MarketPhase.DISTRIBUTION
    
    def calculate_btc_dominance(self) -> float:
        """
        비트코인 도미넌스 계산
        퍼즐의 도미넌스 기반 전략
        """
        total_market_cap = sum(
            data.get('market_cap', 0) 
            for data in self.market_data.values()
        )
        
        if total_market_cap == 0:
            return 0
        
        btc_market_cap = self.market_data.get('BTC', {}).get('market_cap', 0)
        return (btc_market_cap / total_market_cap) * 100
    
    def check_dca_signal(self, coin: str = 'BTC') -> Optional[TradingSignal]:
        """
        정적립식 매수 신호 확인
        퍼즈의 핵심 전략: 시간 분산 투자
        """
        if self.last_dca_date is None:
            self.last_dca_date = datetime.now()
            return TradingSignal(
                timestamp=datetime.now(),
                coin=coin,
                action='BUY',
                strategy=TradingStrategy.DCA,
                confidence=0.9,
                reason="정적립식 첫 매수"
            )
        
        days_since_last = (datetime.now() - self.last_dca_date).days
        
        if days_since_last >= self.dca_interval_days:
            self.last_dca_date = datetime.now()
            return TradingSignal(
                timestamp=datetime.now(),
                coin=coin,
                action='BUY',
                strategy=TradingStrategy.DCA,
                confidence=0.9,
                reason=f"{self.dca_interval_days}일 주기 정적립식 매수"
            )
        
        return None
    
    def check_dominance_rotation(self) -> Optional[TradingSignal]:
        """
        도미넌스 기반 로테이션 전략
        - 도미넌스 58% 이상: 비트코인 비중 증가
        - 도미넌스 58% 이하: 알트코인 비중 증가
        """
        dominance = self.calculate_btc_dominance()
        
        if dominance == 0:
            return None
        
        current_btc_ratio = self.get_current_portfolio_ratio('BTC')
        
        # 도미넌스 높을 때 비트코인 비중 증가
        if dominance > 58 and current_btc_ratio < 0.7:
            return TradingSignal(
                timestamp=datetime.now(),
                coin='BTC',
                action='BUY',
                strategy=TradingStrategy.DOMINANCE_ROTATION,
                confidence=0.7,
                reason=f"도미넌스 {dominance:.1f}% - 비트코인 비중 증가"
            )
        
        # 도미넌스 낮을 때 알트코인 비중 증가
        elif dominance < 52 and current_btc_ratio > 0.5:
            return TradingSignal(
                timestamp=datetime.now(),
                coin='ALT',  # 알트코인 매수 신호
                action='BUY',
                strategy=TradingStrategy.DOMINANCE_ROTATION,
                confidence=0.7,
                reason=f"도미넌스 {dominance:.1f}% - 알트코인 비중 증가"
            )
        
        return None
    
    def calculate_rsi(self, coin: str, period: int = 14) -> float:
        """RSI 계산"""
        # TODO: 실제 가격 데이터로 RSI 계산
        # 여기서는 더미 값 반환
        return 50.0
    
    def calculate_sma(self, coin: str, period: int) -> float:
        """단순이동평균 계산"""
        # TODO: 실제 가격 데이터로 SMA 계산
        # 여기서는 더미 값 반환
        current_price = self.market_data.get(coin, {}).get('price', 0)
        return current_price * 0.95  # 임시로 현재가의 95%
    
    def check_rsi_divergence(self, coin: str) -> Optional[TradingSignal]:
        """
        RSI 다이버전스 체크
        퍼즐의 기술적 분석 방법
        """
        rsi = self.calculate_rsi(coin)
        price = self.market_data.get(coin, {}).get('price', 0)
        
        # RSI 과매도 구간
        if rsi < 30:
            return TradingSignal(
                timestamp=datetime.now(),
                coin=coin,
                action='BUY',
                strategy=TradingStrategy.RSI_DIVERGENCE,
                confidence=0.6,
                reason=f"RSI {rsi:.1f} - 과매도 구간 매수"
            )
        
        # RSI 과매수 구간
        elif rsi > 80:
            return TradingSignal(
                timestamp=datetime.now(),
                coin=coin,
                action='SELL',
                strategy=TradingStrategy.RSI_DIVERGENCE,
                confidence=0.6,
                reason=f"RSI {rsi:.1f} - 과매수 구간 매도"
            )
        
        return None
    
    def get_current_portfolio_ratio(self, coin: str) -> float:
        """현재 포트폴리오에서 특정 코인의 비중"""
        total_value = sum(
            pos.get('value', 0) 
            for pos in self.positions.values()
        )
        
        if total_value == 0:
            return 0
        
        coin_value = self.positions.get(coin, {}).get('value', 0)
        return coin_value / total_value
    
    def execute_signal(self, signal: TradingSignal) -> bool:
        """
        거래 신호 처리 - 알림만 보내고 실제 거래는 하지 않음
        """
        if signal.confidence < 0.5:
            logger.info(f"신호 신뢰도 낮음: {signal.confidence}")
            return False
        
        # 알림 발송 (가장 중요!)
        self.send_signal_notification(signal)
        
        # 종이거래는 계속 지원 (테스트용)
        if self.enable_paper_trading:
            return self.execute_paper_trade(signal)
        else:
            logger.info(f"알림만 발송 - 실제 거래는 수동으로 진행하세요: {signal.coin} {signal.action}")
            return True
    
    def execute_paper_trade(self, signal: TradingSignal) -> bool:
        """모의투자 실행"""
        logger.info(f"모의투자 실행: {signal}")
        
        if signal.action == 'BUY':
            # 매수 로직
            amount = self.dca_amount if signal.strategy == TradingStrategy.DCA else self.current_capital * 0.1
            
            if amount > self.current_capital:
                logger.warning(f"자본 부족: 필요 {amount}, 보유 {self.current_capital}")
                return False
            
            self.current_capital -= amount
            
            if signal.coin not in self.positions:
                self.positions[signal.coin] = {
                    'amount': 0,
                    'avg_price': 0,
                    'value': 0
                }
            
            # 포지션 업데이트
            current_price = self.market_data.get(signal.coin, {}).get('price', 100)
            quantity = amount / current_price
            
            pos = self.positions[signal.coin]
            total_amount = pos['amount'] + quantity
            pos['avg_price'] = (pos['avg_price'] * pos['amount'] + current_price * quantity) / total_amount
            pos['amount'] = total_amount
            pos['value'] = total_amount * current_price
            
            # 거래 기록
            self.trade_history.append({
                'timestamp': signal.timestamp,
                'coin': signal.coin,
                'action': 'BUY',
                'price': current_price,
                'quantity': quantity,
                'amount': amount,
                'strategy': signal.strategy.value,
                'reason': signal.reason
            })
            
            logger.info(f"매수 완료: {signal.coin} {quantity:.4f}개 @ ${current_price}")
            return True
        
        elif signal.action == 'SELL':
            # 매도 로직
            if signal.coin not in self.positions:
                logger.warning(f"보유하지 않은 코인: {signal.coin}")
                return False
            
            pos = self.positions[signal.coin]
            current_price = self.market_data.get(signal.coin, {}).get('price', 100)
            
            # 전량 매도
            sell_amount = pos['amount'] * current_price
            self.current_capital += sell_amount
            
            # 거래 기록
            self.trade_history.append({
                'timestamp': signal.timestamp,
                'coin': signal.coin,
                'action': 'SELL',
                'price': current_price,
                'quantity': pos['amount'],
                'amount': sell_amount,
                'strategy': signal.strategy.value,
                'reason': signal.reason,
                'profit': sell_amount - (pos['avg_price'] * pos['amount'])
            })
            
            logger.info(f"매도 완료: {signal.coin} {pos['amount']:.4f}개 @ ${current_price}")
            
            # 포지션 삭제
            del self.positions[signal.coin]
            return True
        
        return False
    
    def send_signal_notification(self, signal: TradingSignal):
        """거래 신호 알림 발송"""
        try:
            current_price = self.market_data.get(signal.coin, {}).get('price', 0)
            
            if signal.action == 'BUY':
                # 매수 알림
                message = AlertMessage(
                    type=AlertType.BUY_SIGNAL,
                    priority=AlertPriority.HIGH,
                    title=f"🟢 매수 신호: {signal.coin}",
                    message=f"전략: {signal.strategy.value}\n가격: {current_price:,}원\n이유: {signal.reason}\n신뢰도: {signal.confidence*100:.0f}%",
                    coin=signal.coin,
                    price=current_price
                )
                self.notification_system.send_buy_signal(message)
                
            elif signal.action == 'SELL':
                # 매도 알림
                message = AlertMessage(
                    type=AlertType.SELL_SIGNAL,
                    priority=AlertPriority.HIGH,
                    title=f"🔴 매도 신호: {signal.coin}",
                    message=f"전략: {signal.strategy.value}\n가격: {current_price:,}원\n이유: {signal.reason}\n신뢰도: {signal.confidence*100:.0f}%",
                    coin=signal.coin,
                    price=current_price
                )
                self.notification_system.send_sell_signal(message)
            
            elif signal.action == 'HOLD':
                # 홀드 알림 (중요한 시점에만)
                if signal.confidence > 0.8:
                    message = AlertMessage(
                        type=AlertType.INFO,
                        priority=AlertPriority.MEDIUM,
                        title=f"🟡 홀드 신호: {signal.coin}",
                        message=f"전략: {signal.strategy.value}\n가격: {current_price:,}원\n이유: {signal.reason}",
                        coin=signal.coin,
                        price=current_price
                    )
                    self.notification_system.send_info_alert(message)
                
            logger.info(f"알림 발송 완료: {signal.coin} {signal.action}")
            
        except Exception as e:
            logger.error(f"알림 발송 실패: {e}")
    
    def execute_real_trade(self, signal: TradingSignal) -> bool:
        """실제 거래는 비활성화 - 알림만 발송"""
        logger.info("실제 거래는 비활성화됨. 알림을 확인하고 수동으로 거래하세요.")
        return False
    
    def check_stop_loss_alerts(self):
        """
        손절 알림 체크 - 퍼즈 전략: -20% 손절
        """
        try:
            for coin, pos in self.positions.items():
                current_price = self.market_data.get(coin, {}).get('price', 0)
                if current_price == 0:
                    continue
                    
                # 손실률 계산
                loss_percent = (pos['avg_price'] - current_price) / pos['avg_price'] * 100
                
                # 15% 손실 시 경고, 20% 손실 시 손절 권고
                if loss_percent >= 20:
                    message = AlertMessage(
                        type=AlertType.STOP_LOSS,
                        priority=AlertPriority.CRITICAL,
                        title=f"🚨 손절 권고: {coin}",
                        message=f"현재 손실: -{loss_percent:.1f}%\n매수가: {pos['avg_price']:,}원\n현재가: {current_price:,}원\n퍼즈 전략에 따라 손절 고려하세요!",
                        coin=coin,
                        price=current_price
                    )
                    self.notification_system.send_stop_loss_alert(message)
                    
                elif loss_percent >= 15:
                    message = AlertMessage(
                        type=AlertType.WARNING,
                        priority=AlertPriority.HIGH,
                        title=f"⚠️ 손실 경고: {coin}",
                        message=f"현재 손실: -{loss_percent:.1f}%\n매수가: {pos['avg_price']:,}원\n현재가: {current_price:,}원\n주의깊게 모니터링하세요.",
                        coin=coin,
                        price=current_price
                    )
                    self.notification_system.send_warning_alert(message)
                    
        except Exception as e:
            logger.error(f"손절 알림 체크 실패: {e}")
    
    def check_profit_taking_alerts(self):
        """
        익절 알림 체크 - 퍼즈 전략: +50%, +100% 익절 구간
        """
        try:
            for coin, pos in self.positions.items():
                current_price = self.market_data.get(coin, {}).get('price', 0)
                if current_price == 0:
                    continue
                    
                # 수익률 계산
                profit_percent = (current_price - pos['avg_price']) / pos['avg_price'] * 100
                
                # 50% 이상 수익 시 부분 익절 권고
                if profit_percent >= 100:
                    message = AlertMessage(
                        type=AlertType.PROFIT_TARGET,
                        priority=AlertPriority.HIGH,
                        title=f"🎉 대박 수익: {coin} (+{profit_percent:.0f}%)",
                        message=f"현재 수익: +{profit_percent:.1f}%\n매수가: {pos['avg_price']:,}원\n현재가: {current_price:,}원\n퍼즈 전략: 50% 익절 고려!",
                        coin=coin,
                        price=current_price
                    )
                    self.notification_system.send_profit_alert(message)
                    
                elif profit_percent >= 50:
                    message = AlertMessage(
                        type=AlertType.PROFIT_TARGET,
                        priority=AlertPriority.HIGH,
                        title=f"💰 익절 구간: {coin} (+{profit_percent:.0f}%)",
                        message=f"현재 수익: +{profit_percent:.1f}%\n매수가: {pos['avg_price']:,}원\n현재가: {current_price:,}원\n퍼즈 전략: 부분 익절 고려!",
                        coin=coin,
                        price=current_price
                    )
                    self.notification_system.send_profit_alert(message)
                    
        except Exception as e:
            logger.error(f"익절 알림 체크 실패: {e}")
    
    def run_strategy_checks(self) -> List[TradingSignal]:
        """
        모든 전략 체크 실행 + 알림 체크
        """
        signals = []
        
        # 1. 정적립식 체크
        dca_signal = self.check_dca_signal()
        if dca_signal:
            signals.append(dca_signal)
        
        # 2. 도미넌스 로테이션 체크
        dominance_signal = self.check_dominance_rotation()
        if dominance_signal:
            signals.append(dominance_signal)
        
        # 3. RSI 다이버전스 체크 (주요 코인)
        for coin in ['BTC', 'ETH']:
            rsi_signal = self.check_rsi_divergence(coin)
            if rsi_signal:
                signals.append(rsi_signal)
        
        # 4. 손절/익절 알림 체크 (매우 중요!)
        self.check_stop_loss_alerts()
        self.check_profit_taking_alerts()
        
        return signals
    
    def update_market_data(self, market_data: Dict):
        """시장 데이터 업데이트"""
        self.market_data = market_data
        logger.info(f"시장 데이터 업데이트: {len(market_data)} 코인")
    
    def get_portfolio_summary(self) -> Dict:
        """포트폴리오 요약"""
        total_value = self.current_capital
        
        for coin, pos in self.positions.items():
            current_price = self.market_data.get(coin, {}).get('price', pos['avg_price'])
            pos['value'] = pos['amount'] * current_price
            total_value += pos['value']
        
        return {
            'total_value': total_value,
            'current_capital': self.current_capital,
            'positions': self.positions,
            'profit': total_value - self.initial_capital,
            'profit_rate': ((total_value - self.initial_capital) / self.initial_capital) * 100,
            'trade_count': len(self.trade_history)
        }
    
    def run_bot_cycle(self):
        """봇 실행 사이클"""
        logger.info("=== 봇 사이클 시작 ===")
        
        # 1. 시장 단계 분석
        market_phase = self.analyze_market_phase()
        logger.info(f"현재 시장 단계: {market_phase.value}")
        
        # 2. 전략 체크
        signals = self.run_strategy_checks()
        logger.info(f"생성된 신호: {len(signals)}개")
        
        # 3. 신호 실행
        for signal in signals:
            success = self.execute_signal(signal)
            if success:
                logger.info(f"신호 실행 성공: {signal.strategy.value}")
        
        # 4. 포트폴리오 요약
        summary = self.get_portfolio_summary()
        logger.info(f"포트폴리오 가치: ${summary['total_value']:.2f}")
        logger.info(f"수익률: {summary['profit_rate']:.2f}%")
        
        return summary


def main():
    """메인 실행 함수"""
    # 봇 초기화
    bot = PuzzleTradingBot(
        initial_capital=10000,
        enable_paper_trading=True
    )
    
    # 더미 시장 데이터 (실제로는 거래소 API에서 가져옴)
    dummy_market_data = {
        'BTC': {'price': 95000, 'market_cap': 1800000000000},
        'ETH': {'price': 3200, 'market_cap': 380000000000},
        'SOL': {'price': 180, 'market_cap': 80000000000},
        'XRP': {'price': 2.5, 'market_cap': 140000000000},
    }
    
    # 시장 데이터 업데이트
    bot.update_market_data(dummy_market_data)
    
    # 봇 실행
    try:
        while True:
            # 봇 사이클 실행
            summary = bot.run_bot_cycle()
            
            # 10분 대기 (실제로는 더 긴 주기 권장)
            time.sleep(600)
            
    except KeyboardInterrupt:
        logger.info("봇 종료")
        
        # 최종 결과 출력
        final_summary = bot.get_portfolio_summary()
        print("\n=== 최종 결과 ===")
        print(f"초기 자본: ${bot.initial_capital}")
        print(f"최종 가치: ${final_summary['total_value']:.2f}")
        print(f"수익률: {final_summary['profit_rate']:.2f}%")
        print(f"거래 횟수: {final_summary['trade_count']}")


if __name__ == "__main__":
    main()