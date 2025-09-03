"""
퍼즈 전략 백테스팅 모듈
과거 데이터를 활용한 전략 검증
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import json
import logging
from dataclasses import dataclass, asdict
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

logger = logging.getLogger(__name__)


@dataclass
class BacktestResult:
    """백테스트 결과"""
    initial_capital: float
    final_capital: float
    total_return: float
    annual_return: float
    max_drawdown: float
    sharpe_ratio: float
    win_rate: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    best_trade: Dict
    worst_trade: Dict
    strategy: str
    period: str


class PuzzleBacktester:
    """퍼즈 전략 백테스터"""
    
    def __init__(self, initial_capital: float = 10000000):
        """
        Args:
            initial_capital: 초기 자본금 (KRW)
        """
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.positions = {}  # 현재 포지션
        self.trades = []     # 거래 기록
        self.portfolio_values = []  # 포트폴리오 가치 추이
        self.dates = []
        
    def load_historical_data(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        """
        과거 데이터 로드 (실제로는 거래소 API나 CSV 파일에서 로드)
        여기서는 더미 데이터 생성
        """
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # 더미 가격 데이터 생성 (랜덤워크)
        np.random.seed(42)
        prices = [100000000]  # 1억원 시작 (비트코인 기준)
        
        for _ in range(len(date_range) - 1):
            change = np.random.normal(0.002, 0.03)  # 일일 수익률
            new_price = prices[-1] * (1 + change)
            prices.append(new_price)
        
        df = pd.DataFrame({
            'date': date_range,
            'open': prices,
            'high': [p * 1.02 for p in prices],
            'low': [p * 0.98 for p in prices],
            'close': prices,
            'volume': np.random.uniform(1000, 10000, len(date_range))
        })
        
        df.set_index('date', inplace=True)
        return df
    
    def calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """기술적 지표 계산"""
        # RSI 계산
        df['rsi'] = self.calculate_rsi(df['close'])
        
        # 이동평균선
        df['ma20'] = df['close'].rolling(window=20).mean()
        df['ma60'] = df['close'].rolling(window=60).mean()
        df['ma200'] = df['close'].rolling(window=200).mean()
        
        # 볼린저밴드
        df['bb_middle'] = df['ma20']
        std = df['close'].rolling(window=20).std()
        df['bb_upper'] = df['bb_middle'] + (std * 2)
        df['bb_lower'] = df['bb_middle'] - (std * 2)
        
        # MACD
        exp1 = df['close'].ewm(span=12, adjust=False).mean()
        exp2 = df['close'].ewm(span=26, adjust=False).mean()
        df['macd'] = exp1 - exp2
        df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
        
        return df
    
    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """RSI 계산"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def backtest_dca_strategy(self, df: pd.DataFrame, investment_amount: float = 300000, interval_days: int = 7):
        """
        정적립식 (DCA) 전략 백테스트
        퍼즈의 핵심 전략
        
        Args:
            df: 가격 데이터
            investment_amount: 매회 투자 금액
            interval_days: 투자 주기 (일)
        """
        self.reset()
        last_buy_date = None
        total_coins = 0
        total_invested = 0
        
        for date, row in df.iterrows():
            # 포트폴리오 가치 기록
            portfolio_value = self.capital + (total_coins * row['close'])
            self.portfolio_values.append(portfolio_value)
            self.dates.append(date)
            
            # DCA 매수 체크
            if last_buy_date is None or (date - last_buy_date).days >= interval_days:
                if self.capital >= investment_amount:
                    # 매수 실행
                    coins_bought = investment_amount / row['close']
                    total_coins += coins_bought
                    total_invested += investment_amount
                    self.capital -= investment_amount
                    last_buy_date = date
                    
                    self.trades.append({
                        'date': date,
                        'type': 'BUY',
                        'price': row['close'],
                        'amount': coins_bought,
                        'value': investment_amount,
                        'strategy': 'DCA'
                    })
                    
                    logger.debug(f"{date}: DCA 매수 - {coins_bought:.8f}개 @ {row['close']:,.0f}원")
        
        # 최종 청산
        if total_coins > 0:
            final_value = total_coins * df.iloc[-1]['close']
            self.capital += final_value
            
            self.trades.append({
                'date': df.index[-1],
                'type': 'SELL',
                'price': df.iloc[-1]['close'],
                'amount': total_coins,
                'value': final_value,
                'strategy': 'DCA'
            })
        
        return self.calculate_results('DCA', str(df.index[0]), str(df.index[-1]))
    
    def backtest_rsi_strategy(self, df: pd.DataFrame, rsi_buy: float = 30, rsi_sell: float = 70):
        """
        RSI 기반 전략 백테스트
        
        Args:
            df: 가격 데이터
            rsi_buy: 매수 RSI 기준
            rsi_sell: 매도 RSI 기준
        """
        self.reset()
        position_size = 0
        entry_price = 0
        
        for date, row in df.iterrows():
            # 포트폴리오 가치 기록
            portfolio_value = self.capital + (position_size * row['close'])
            self.portfolio_values.append(portfolio_value)
            self.dates.append(date)
            
            if pd.isna(row['rsi']):
                continue
            
            # 매수 신호
            if row['rsi'] < rsi_buy and position_size == 0:
                # 자본의 50% 투자
                investment = self.capital * 0.5
                position_size = investment / row['close']
                self.capital -= investment
                entry_price = row['close']
                
                self.trades.append({
                    'date': date,
                    'type': 'BUY',
                    'price': row['close'],
                    'amount': position_size,
                    'value': investment,
                    'strategy': 'RSI',
                    'rsi': row['rsi']
                })
                
                logger.debug(f"{date}: RSI 매수 - RSI={row['rsi']:.1f}")
            
            # 매도 신호
            elif row['rsi'] > rsi_sell and position_size > 0:
                sell_value = position_size * row['close']
                self.capital += sell_value
                profit = (row['close'] - entry_price) / entry_price * 100
                
                self.trades.append({
                    'date': date,
                    'type': 'SELL',
                    'price': row['close'],
                    'amount': position_size,
                    'value': sell_value,
                    'profit': profit,
                    'strategy': 'RSI',
                    'rsi': row['rsi']
                })
                
                logger.debug(f"{date}: RSI 매도 - RSI={row['rsi']:.1f}, 수익률={profit:.2f}%")
                position_size = 0
                entry_price = 0
        
        # 미청산 포지션 처리
        if position_size > 0:
            final_value = position_size * df.iloc[-1]['close']
            self.capital += final_value
        
        return self.calculate_results('RSI', str(df.index[0]), str(df.index[-1]))
    
    def backtest_ma_cross_strategy(self, df: pd.DataFrame):
        """
        이동평균선 교차 전략 백테스트
        """
        self.reset()
        position_size = 0
        entry_price = 0
        
        for date, row in df.iterrows():
            # 포트폴리오 가치 기록
            portfolio_value = self.capital + (position_size * row['close'])
            self.portfolio_values.append(portfolio_value)
            self.dates.append(date)
            
            if pd.isna(row['ma20']) or pd.isna(row['ma60']):
                continue
            
            # 골든크로스 - 매수
            if row['ma20'] > row['ma60'] and position_size == 0:
                investment = self.capital * 0.5
                position_size = investment / row['close']
                self.capital -= investment
                entry_price = row['close']
                
                self.trades.append({
                    'date': date,
                    'type': 'BUY',
                    'price': row['close'],
                    'amount': position_size,
                    'value': investment,
                    'strategy': 'MA_CROSS'
                })
            
            # 데드크로스 - 매도
            elif row['ma20'] < row['ma60'] and position_size > 0:
                sell_value = position_size * row['close']
                self.capital += sell_value
                profit = (row['close'] - entry_price) / entry_price * 100
                
                self.trades.append({
                    'date': date,
                    'type': 'SELL',
                    'price': row['close'],
                    'amount': position_size,
                    'value': sell_value,
                    'profit': profit,
                    'strategy': 'MA_CROSS'
                })
                
                position_size = 0
                entry_price = 0
        
        # 미청산 포지션 처리
        if position_size > 0:
            final_value = position_size * df.iloc[-1]['close']
            self.capital += final_value
        
        return self.calculate_results('MA_CROSS', str(df.index[0]), str(df.index[-1]))
    
    def calculate_results(self, strategy: str, start_date: str, end_date: str) -> BacktestResult:
        """백테스트 결과 계산"""
        final_value = self.portfolio_values[-1] if self.portfolio_values else self.capital
        
        # 수익률 계산
        total_return = (final_value - self.initial_capital) / self.initial_capital * 100
        
        # 연환산 수익률
        days = (pd.to_datetime(end_date) - pd.to_datetime(start_date)).days
        years = days / 365
        annual_return = ((final_value / self.initial_capital) ** (1/years) - 1) * 100 if years > 0 else 0
        
        # 최대 낙폭
        peak = np.maximum.accumulate(self.portfolio_values)
        drawdown = (self.portfolio_values - peak) / peak * 100
        max_drawdown = np.min(drawdown) if len(drawdown) > 0 else 0
        
        # 샤프 비율 (간단한 계산)
        if len(self.portfolio_values) > 1:
            returns = np.diff(self.portfolio_values) / self.portfolio_values[:-1]
            sharpe_ratio = np.mean(returns) / np.std(returns) * np.sqrt(252) if np.std(returns) > 0 else 0
        else:
            sharpe_ratio = 0
        
        # 승률 계산
        winning_trades = [t for t in self.trades if t.get('type') == 'SELL' and t.get('profit', 0) > 0]
        losing_trades = [t for t in self.trades if t.get('type') == 'SELL' and t.get('profit', 0) <= 0]
        total_sell_trades = len(winning_trades) + len(losing_trades)
        win_rate = len(winning_trades) / total_sell_trades * 100 if total_sell_trades > 0 else 0
        
        # 최고/최악 거래
        sell_trades = [t for t in self.trades if t.get('type') == 'SELL']
        best_trade = max(sell_trades, key=lambda x: x.get('profit', 0)) if sell_trades else {}
        worst_trade = min(sell_trades, key=lambda x: x.get('profit', 0)) if sell_trades else {}
        
        return BacktestResult(
            initial_capital=self.initial_capital,
            final_capital=final_value,
            total_return=total_return,
            annual_return=annual_return,
            max_drawdown=max_drawdown,
            sharpe_ratio=sharpe_ratio,
            win_rate=win_rate,
            total_trades=len(self.trades),
            winning_trades=len(winning_trades),
            losing_trades=len(losing_trades),
            best_trade=best_trade,
            worst_trade=worst_trade,
            strategy=strategy,
            period=f"{start_date} ~ {end_date}"
        )
    
    def reset(self):
        """백테스터 초기화"""
        self.capital = self.initial_capital
        self.positions = {}
        self.trades = []
        self.portfolio_values = []
        self.dates = []
    
    def plot_results(self, title: str = "백테스트 결과"):
        """결과 시각화"""
        if not self.portfolio_values:
            logger.warning("시각화할 데이터가 없습니다")
            return
        
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))
        
        # 포트폴리오 가치 추이
        ax1.plot(self.dates, self.portfolio_values, label='포트폴리오 가치', linewidth=2)
        ax1.axhline(y=self.initial_capital, color='r', linestyle='--', label='초기 자본')
        ax1.set_title(title)
        ax1.set_xlabel('날짜')
        ax1.set_ylabel('포트폴리오 가치 (원)')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # 수익률 추이
        returns = [(v - self.initial_capital) / self.initial_capital * 100 
                  for v in self.portfolio_values]
        ax2.plot(self.dates, returns, label='수익률', linewidth=2, color='green')
        ax2.axhline(y=0, color='r', linestyle='--')
        ax2.fill_between(self.dates, returns, 0, 
                         where=[r >= 0 for r in returns], 
                         color='green', alpha=0.3)
        ax2.fill_between(self.dates, returns, 0, 
                         where=[r < 0 for r in returns], 
                         color='red', alpha=0.3)
        ax2.set_xlabel('날짜')
        ax2.set_ylabel('수익률 (%)')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.show()
    
    def compare_strategies(self, df: pd.DataFrame) -> pd.DataFrame:
        """여러 전략 비교"""
        results = []
        
        # DCA 전략
        dca_result = self.backtest_dca_strategy(df.copy())
        results.append({
            '전략': 'DCA (정적립식)',
            '총 수익률': f"{dca_result.total_return:.2f}%",
            '연환산 수익률': f"{dca_result.annual_return:.2f}%",
            '최대 낙폭': f"{dca_result.max_drawdown:.2f}%",
            '샤프 비율': f"{dca_result.sharpe_ratio:.2f}",
            '승률': f"{dca_result.win_rate:.1f}%",
            '거래 횟수': dca_result.total_trades
        })
        
        # RSI 전략
        rsi_result = self.backtest_rsi_strategy(df.copy())
        results.append({
            '전략': 'RSI',
            '총 수익률': f"{rsi_result.total_return:.2f}%",
            '연환산 수익률': f"{rsi_result.annual_return:.2f}%",
            '최대 낙폭': f"{rsi_result.max_drawdown:.2f}%",
            '샤프 비율': f"{rsi_result.sharpe_ratio:.2f}",
            '승률': f"{rsi_result.win_rate:.1f}%",
            '거래 횟수': rsi_result.total_trades
        })
        
        # MA Cross 전략
        ma_result = self.backtest_ma_cross_strategy(df.copy())
        results.append({
            '전략': 'MA Cross',
            '총 수익률': f"{ma_result.total_return:.2f}%",
            '연환산 수익률': f"{ma_result.annual_return:.2f}%",
            '최대 낙폭': f"{ma_result.max_drawdown:.2f}%",
            '샤프 비율': f"{ma_result.sharpe_ratio:.2f}",
            '승률': f"{ma_result.win_rate:.1f}%",
            '거래 횟수': ma_result.total_trades
        })
        
        # Buy & Hold 전략
        self.reset()
        initial_coins = self.initial_capital / df.iloc[0]['close']
        final_value = initial_coins * df.iloc[-1]['close']
        bh_return = (final_value - self.initial_capital) / self.initial_capital * 100
        
        results.append({
            '전략': 'Buy & Hold',
            '총 수익률': f"{bh_return:.2f}%",
            '연환산 수익률': '-',
            '최대 낙폭': '-',
            '샤프 비율': '-',
            '승률': '-',
            '거래 횟수': 2
        })
        
        return pd.DataFrame(results)


def main():
    """백테스팅 실행"""
    # 백테스터 초기화
    backtester = PuzzleBacktester(initial_capital=10000000)  # 1천만원
    
    # 과거 데이터 로드 (2년치)
    start_date = '2022-01-01'
    end_date = '2023-12-31'
    df = backtester.load_historical_data('KRW-BTC', start_date, end_date)
    
    # 기술적 지표 계산
    df = backtester.calculate_indicators(df)
    
    print("=== 퍼즈 전략 백테스팅 ===\n")
    
    # 전략별 백테스트
    print("1. DCA (정적립식) 전략")
    dca_result = backtester.backtest_dca_strategy(df, investment_amount=300000, interval_days=7)
    print(f"   총 수익률: {dca_result.total_return:.2f}%")
    print(f"   연환산 수익률: {dca_result.annual_return:.2f}%")
    print(f"   최대 낙폭: {dca_result.max_drawdown:.2f}%\n")
    
    # 결과 시각화
    backtester.plot_results("DCA 전략 백테스트 결과")
    
    # 전략 비교
    print("\n=== 전략별 성과 비교 ===")
    comparison_df = backtester.compare_strategies(df)
    print(comparison_df.to_string(index=False))
    
    # 결과 저장
    with open('backtest_results.json', 'w', encoding='utf-8') as f:
        json.dump(asdict(dca_result), f, ensure_ascii=False, indent=2, default=str)
    
    print("\n백테스트 완료! 결과가 backtest_results.json에 저장되었습니다.")


if __name__ == "__main__":
    main()