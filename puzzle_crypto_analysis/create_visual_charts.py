"""
퍼즈 투자 전략 시각화 차트 생성기
- DCA 전략 시각화
- RSI/볼린저밴드 매매 신호
- 포트폴리오 비율 차트
- 투자 성과 비교 그래프
"""

import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

def create_dca_strategy_chart():
    """DCA 전략 시각화"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('🎯 퍼즈 DCA 전략 시각화', fontsize=20, fontweight='bold', y=0.98)
    
    # 1. DCA vs 일시불 투자 비교
    dates = pd.date_range(start='2023-01-01', periods=12, freq='M')
    btc_prices = [25000, 22000, 20000, 18000, 16000, 15000, 17000, 20000, 25000, 30000, 35000, 40000]
    
    # DCA 투자 (매월 100만원)
    dca_investment = np.arange(1, 13) * 1000000
    dca_coins = np.cumsum([1000000 / price for price in btc_prices])
    dca_value = [coins * price for coins, price in zip(dca_coins, btc_prices)]
    
    # 일시불 투자 (1200만원 첫달에 투자)
    lump_coins = 12000000 / btc_prices[0]
    lump_value = [lump_coins * price for price in btc_prices]
    
    ax1.plot(dates, dca_value, 'b-', linewidth=3, label='DCA 투자', marker='o', markersize=8)
    ax1.plot(dates, lump_value, 'r--', linewidth=3, label='일시불 투자', marker='s', markersize=8)
    ax1.plot(dates, dca_investment, 'g:', linewidth=2, label='총 투자금', alpha=0.7)
    ax1.set_title('📊 DCA vs 일시불 투자 성과', fontsize=14, fontweight='bold')
    ax1.legend(fontsize=12)
    ax1.grid(True, alpha=0.3)
    ax1.set_ylabel('자산가치 (원)', fontsize=12)
    
    # 2. 목표수익률별 매수기간 공식
    target_returns = [50, 100, 200, 300, 500, 600, 900]
    buy_periods = [r/100 for r in target_returns]  # 개월
    
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF']
    bars = ax2.bar(range(len(target_returns)), buy_periods, color=colors, alpha=0.8)
    ax2.set_title('🎯 DCA 공식: 목표수익률 → 매수기간', fontsize=14, fontweight='bold')
    ax2.set_xlabel('목표 수익률 (%)', fontsize=12)
    ax2.set_ylabel('매수 기간 (개월)', fontsize=12)
    ax2.set_xticks(range(len(target_returns)))
    ax2.set_xticklabels([f'{r}%' for r in target_returns])
    
    # 각 막대 위에 값 표시
    for i, (bar, period) in enumerate(zip(bars, buy_periods)):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 0.05,
                f'{period:.1f}달', ha='center', va='bottom', fontweight='bold')
    
    ax2.grid(True, alpha=0.3, axis='y')
    
    # 3. 평단가 형성 과정
    months = list(range(1, 7))
    prices_scenario = [30000, 25000, 20000, 15000, 18000, 25000]  # 하락 후 반등
    monthly_investment = 500000
    
    cumulative_coins = []
    cumulative_investment = []
    average_price = []
    
    total_coins = 0
    total_investment = 0
    
    for i, price in enumerate(prices_scenario):
        coins_bought = monthly_investment / price
        total_coins += coins_bought
        total_investment += monthly_investment
        avg_price = total_investment / total_coins
        
        cumulative_coins.append(total_coins)
        cumulative_investment.append(total_investment)
        average_price.append(avg_price)
    
    ax3_twin = ax3.twinx()
    
    # 가격과 평단가
    line1 = ax3.plot(months, prices_scenario, 'r-', linewidth=3, marker='o', 
                     markersize=10, label='비트코인 가격', alpha=0.8)
    line2 = ax3.plot(months, average_price, 'b-', linewidth=3, marker='s', 
                     markersize=8, label='평단가', alpha=0.8)
    
    # 투자 금액 막대그래프
    bars = ax3_twin.bar(months, [m * monthly_investment for m in months], 
                       alpha=0.3, color='green', label='누적 투자금')
    
    ax3.set_title('💰 DCA 평단가 형성 과정', fontsize=14, fontweight='bold')
    ax3.set_xlabel('월차', fontsize=12)
    ax3.set_ylabel('가격 (원)', fontsize=12, color='black')
    ax3_twin.set_ylabel('누적 투자금 (원)', fontsize=12, color='green')
    
    # 범례 합치기
    lines1, labels1 = ax3.get_legend_handles_labels()
    lines2, labels2 = ax3_twin.get_legend_handles_labels()
    ax3.legend(lines1 + lines2, labels1 + labels2, loc='upper left')
    
    ax3.grid(True, alpha=0.3)
    
    # 4. 하락장에서의 DCA 효과
    scenarios = ['10% 하락', '20% 하락', '30% 하락', '40% 하락', '50% 하락']
    dca_advantage = [5, 12, 20, 30, 45]  # DCA가 일시불보다 유리한 정도(%)
    
    bars = ax4.barh(scenarios, dca_advantage, color=['#2ECC71', '#3498DB', '#F39C12', '#E74C3C', '#8E44AD'])
    ax4.set_title('📉 하락장에서 DCA의 우위성', fontsize=14, fontweight='bold')
    ax4.set_xlabel('DCA 우위 정도 (%)', fontsize=12)
    
    # 막대 끝에 값 표시
    for i, (bar, value) in enumerate(zip(bars, dca_advantage)):
        ax4.text(value + 0.5, bar.get_y() + bar.get_height()/2, 
                f'+{value}%', va='center', fontweight='bold')
    
    ax4.grid(True, alpha=0.3, axis='x')
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/01_DCA_전략_시각화.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.show()

def create_technical_analysis_chart():
    """기술적 분석 매매 신호 시각화"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('📊 퍼즈 기술적 분석 매매 신호', fontsize=20, fontweight='bold', y=0.98)
    
    # 1. RSI 매매 신호
    days = list(range(1, 31))
    rsi_values = [45, 42, 38, 35, 28, 25, 30, 35, 40, 45, 50, 55, 60, 65, 72, 
                  75, 70, 68, 65, 60, 55, 50, 45, 40, 35, 32, 28, 35, 42, 48]
    
    ax1.plot(days, rsi_values, 'b-', linewidth=3, alpha=0.8)
    ax1.fill_between(days, rsi_values, 50, where=np.array(rsi_values) < 30, 
                     alpha=0.3, color='green', label='매수구간')
    ax1.fill_between(days, rsi_values, 50, where=np.array(rsi_values) > 70, 
                     alpha=0.3, color='red', label='매도구간')
    
    ax1.axhline(y=70, color='red', linestyle='--', linewidth=2, alpha=0.8, label='매도신호 (70)')
    ax1.axhline(y=30, color='green', linestyle='--', linewidth=2, alpha=0.8, label='매수신호 (30)')
    ax1.axhline(y=50, color='gray', linestyle='-', linewidth=1, alpha=0.5, label='중간선')
    
    ax1.set_title('🎯 RSI 매매 신호', fontsize=14, fontweight='bold')
    ax1.set_ylabel('RSI 값', fontsize=12)
    ax1.set_xlabel('일자', fontsize=12)
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim(0, 100)
    
    # 매수/매도 포인트 표시
    buy_points = [(i+1, rsi) for i, rsi in enumerate(rsi_values) if rsi <= 30]
    sell_points = [(i+1, rsi) for i, rsi in enumerate(rsi_values) if rsi >= 70]
    
    if buy_points:
        buy_days, buy_rsi = zip(*buy_points)
        ax1.scatter(buy_days, buy_rsi, color='green', s=100, marker='^', 
                   zorder=5, label='매수 타이밍')
    
    if sell_points:
        sell_days, sell_rsi = zip(*sell_points)
        ax1.scatter(sell_days, sell_rsi, color='red', s=100, marker='v', 
                   zorder=5, label='매도 타이밍')
    
    # 2. 볼린저 밴드 매매 신호
    price = np.array([45000, 44000, 43000, 41000, 39000, 37000, 38000, 40000, 
                     42000, 44000, 46000, 48000, 50000, 52000, 51000, 49000,
                     47000, 45000, 43000, 41000, 39000, 37000, 35000, 37000, 
                     39000, 41000, 43000, 45000, 47000, 49000])
    
    # 볼린저 밴드 계산
    window = 10
    rolling_mean = pd.Series(price).rolling(window=window).mean()
    rolling_std = pd.Series(price).rolling(window=window).std()
    upper_band = rolling_mean + (rolling_std * 2)
    lower_band = rolling_mean - (rolling_std * 2)
    
    valid_idx = ~np.isnan(rolling_mean)
    days_bb = np.array(days)[valid_idx]
    price_bb = price[valid_idx]
    upper_bb = upper_band[valid_idx]
    lower_bb = lower_band[valid_idx]
    mean_bb = rolling_mean[valid_idx]
    
    ax2.plot(days_bb, price_bb, 'k-', linewidth=3, label='비트코인 가격', alpha=0.8)
    ax2.plot(days_bb, upper_bb, 'r--', linewidth=2, label='상단밴드', alpha=0.8)
    ax2.plot(days_bb, mean_bb, 'b-', linewidth=2, label='중간선(20MA)', alpha=0.8)
    ax2.plot(days_bb, lower_bb, 'g--', linewidth=2, label='하단밴드', alpha=0.8)
    
    ax2.fill_between(days_bb, upper_bb, lower_bb, alpha=0.1, color='gray')
    
    # 매수/매도 신호 포인트
    buy_signals = price_bb <= lower_bb
    sell_signals = price_bb >= upper_bb
    
    if np.any(buy_signals):
        ax2.scatter(days_bb[buy_signals], price_bb[buy_signals], 
                   color='green', s=150, marker='^', zorder=5, label='매수신호')
    
    if np.any(sell_signals):
        ax2.scatter(days_bb[sell_signals], price_bb[sell_signals], 
                   color='red', s=150, marker='v', zorder=5, label='매도신호')
    
    ax2.set_title('📊 볼린저밴드 매매 신호', fontsize=14, fontweight='bold')
    ax2.set_ylabel('가격 (원)', fontsize=12)
    ax2.set_xlabel('일자', fontsize=12)
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # 3. 도미넌스 로테이션 전략
    dates_dom = pd.date_range(start='2024-01-01', periods=12, freq='M')
    btc_dominance = [52, 54, 56, 58, 61, 59, 57, 55, 53, 51, 54, 56]
    
    ax3.plot(dates_dom, btc_dominance, 'orange', linewidth=4, marker='o', markersize=10, alpha=0.8)
    ax3.axhline(y=58, color='red', linestyle='--', linewidth=3, alpha=0.8, label='기준선 (58%)')
    
    # 58% 위아래 구간 색칠
    ax3.fill_between(dates_dom, btc_dominance, 58, 
                     where=np.array(btc_dominance) > 58, 
                     alpha=0.3, color='gold', label='비트코인 비중 ↑')
    ax3.fill_between(dates_dom, btc_dominance, 58, 
                     where=np.array(btc_dominance) < 58, 
                     alpha=0.3, color='lightblue', label='알트코인 비중 ↑')
    
    ax3.set_title('⚖️ BTC 도미넌스 로테이션 전략', fontsize=14, fontweight='bold')
    ax3.set_ylabel('BTC 도미넌스 (%)', fontsize=12)
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    ax3.set_ylim(45, 65)
    
    # 4. 매매 신호 종합 스코어보드
    signals = ['RSI < 30', '볼밴 하단', '지지선', '도미넌스 < 55%', '거래량 증가']
    current_scores = [1, 1, 0, 1, 0]  # 1: 조건 충족, 0: 조건 불충족
    
    colors = ['green' if score else 'lightgray' for score in current_scores]
    bars = ax4.barh(signals, [1]*5, color=colors, alpha=0.8)
    
    # 현재 신호 상태 텍스트
    for i, (signal, score) in enumerate(zip(signals, current_scores)):
        status = '✅' if score else '❌'
        ax4.text(0.5, i, status, ha='center', va='center', fontsize=20, fontweight='bold')
    
    ax4.set_title('🚦 실시간 매매 신호 스코어보드', fontsize=14, fontweight='bold')
    ax4.set_xlabel('신호 상태', fontsize=12)
    ax4.set_xlim(0, 1)
    ax4.set_xticks([])
    
    # 종합 점수
    total_score = sum(current_scores)
    if total_score >= 4:
        signal_text = "🟢 강력한 매수 신호!"
        signal_color = 'green'
    elif total_score >= 3:
        signal_text = "🟡 매수 고려"
        signal_color = 'orange'
    elif total_score >= 2:
        signal_text = "🤔 신중한 판단"
        signal_color = 'gray'
    else:
        signal_text = "🔴 매수 금지"
        signal_color = 'red'
    
    ax4.text(0.5, -0.7, signal_text, ha='center', va='center', 
             fontsize=16, fontweight='bold', color=signal_color,
             bbox=dict(boxstyle="round,pad=0.3", facecolor=signal_color, alpha=0.2))
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/02_기술적분석_매매신호.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.show()

def create_portfolio_charts():
    """포트폴리오 비율 및 성과 차트"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('💎 퍼즈 포트폴리오 관리 전략', fontsize=20, fontweight='bold', y=0.98)
    
    # 1. 레벨별 포트폴리오 비율
    levels = ['초보자\n(안전)', '중급자\n(균형)', '고급자\n(공격)']
    btc_ratios = [70, 50, 40]
    eth_ratios = [30, 25, 20]
    alt_ratios = [0, 25, 35]
    cash_ratios = [0, 0, 5]
    
    x = np.arange(len(levels))
    width = 0.6
    
    p1 = ax1.bar(x, btc_ratios, width, label='BTC', color='#F7931A', alpha=0.9)
    p2 = ax1.bar(x, eth_ratios, width, bottom=btc_ratios, label='ETH', color='#627EEA', alpha=0.9)
    p3 = ax1.bar(x, alt_ratios, width, bottom=np.array(btc_ratios)+np.array(eth_ratios), 
                 label='ALT', color='#00D4AA', alpha=0.9)
    p4 = ax1.bar(x, cash_ratios, width, 
                 bottom=np.array(btc_ratios)+np.array(eth_ratios)+np.array(alt_ratios), 
                 label='현금', color='#95A5A6', alpha=0.9)
    
    ax1.set_title('📊 레벨별 포트폴리오 구성', fontsize=14, fontweight='bold')
    ax1.set_ylabel('비율 (%)', fontsize=12)
    ax1.set_xticks(x)
    ax1.set_xticklabels(levels, fontsize=11)
    ax1.legend(loc='upper right')
    ax1.set_ylim(0, 100)
    
    # 각 섹션에 비율 표시
    for i in range(len(levels)):
        if btc_ratios[i] > 0:
            ax1.text(i, btc_ratios[i]/2, f'{btc_ratios[i]}%', 
                    ha='center', va='center', fontweight='bold', color='white')
        if eth_ratios[i] > 0:
            ax1.text(i, btc_ratios[i] + eth_ratios[i]/2, f'{eth_ratios[i]}%', 
                    ha='center', va='center', fontweight='bold', color='white')
        if alt_ratios[i] > 0:
            ax1.text(i, btc_ratios[i] + eth_ratios[i] + alt_ratios[i]/2, f'{alt_ratios[i]}%', 
                    ha='center', va='center', fontweight='bold', color='white')
    
    # 2. 리밸런싱 효과 시뮬레이션
    months = list(range(1, 13))
    no_rebalancing = [100, 105, 98, 110, 120, 115, 130, 125, 140, 135, 150, 145]
    with_rebalancing = [100, 105, 102, 115, 125, 122, 138, 135, 148, 145, 160, 158]
    
    ax2.plot(months, no_rebalancing, 'r--', linewidth=3, marker='o', 
             label='리밸런싱 없음', alpha=0.8)
    ax2.plot(months, with_rebalancing, 'g-', linewidth=3, marker='s', 
             label='월 1회 리밸런싱', alpha=0.8)
    
    ax2.fill_between(months, no_rebalancing, with_rebalancing, 
                     where=np.array(with_rebalancing) > np.array(no_rebalancing),
                     alpha=0.3, color='green', label='리밸런싱 효과')
    
    ax2.set_title('⚖️ 리밸런싱 효과 비교', fontsize=14, fontweight='bold')
    ax2.set_ylabel('포트폴리오 가치 (기준=100)', fontsize=12)
    ax2.set_xlabel('월차', fontsize=12)
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # 최종 수익률 차이 표시
    final_diff = with_rebalancing[-1] - no_rebalancing[-1]
    ax2.text(6, 155, f'리밸런싱 효과: +{final_diff:.1f}%', 
             ha='center', fontsize=12, fontweight='bold',
             bbox=dict(boxstyle="round,pad=0.3", facecolor='lightgreen', alpha=0.8))
    
    # 3. 손절/익절 시나리오
    scenarios = ['손절 -10%', '손절 -15%', '손절 -20%', '익절 +30%', '익절 +50%', '익절 +100%']
    probabilities = [15, 10, 5, 40, 25, 15]  # 확률
    returns = [-10, -15, -20, 30, 50, 100]  # 수익률
    
    colors = ['darkred' if r < 0 else 'darkgreen' for r in returns]
    bars = ax3.bar(scenarios, probabilities, color=colors, alpha=0.8)
    
    ax3.set_title('🎯 매매 시나리오별 확률 분포', fontsize=14, fontweight='bold')
    ax3.set_ylabel('발생 확률 (%)', fontsize=12)
    ax3.set_xlabel('시나리오', fontsize=12)
    plt.setp(ax3.get_xticklabels(), rotation=45, ha='right')
    
    # 막대 위에 확률 표시
    for bar, prob in zip(bars, probabilities):
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                f'{prob}%', ha='center', va='bottom', fontweight='bold')
    
    # 기댓값 계산
    expected_return = sum(r * p / 100 for r, p in zip(returns, probabilities))
    ax3.text(2.5, 35, f'기댓값: +{expected_return:.1f}%', 
             ha='center', fontsize=14, fontweight='bold',
             bbox=dict(boxstyle="round,pad=0.3", facecolor='lightblue', alpha=0.8))
    
    # 4. 투자 전략별 성과 비교 (백테스트)
    strategies = ['Buy&Hold', 'DCA', 'RSI매매', 'MA크로스', 'QuickSell', '혼합전략']
    returns_1y = [45, 65, 55, 40, 25, 70]
    volatility = [35, 25, 30, 28, 40, 20]
    
    # 버블차트 (수익률 vs 변동성)
    colors_strat = ['red', 'blue', 'green', 'orange', 'purple', 'brown']
    sizes = [r * 10 for r in returns_1y]  # 버블 크기는 수익률에 비례
    
    scatter = ax4.scatter(volatility, returns_1y, s=sizes, c=colors_strat, 
                         alpha=0.7, edgecolors='black', linewidth=2)
    
    # 전략 라벨 추가
    for i, (strategy, vol, ret) in enumerate(zip(strategies, volatility, returns_1y)):
        ax4.annotate(strategy, (vol, ret), xytext=(5, 5), 
                    textcoords='offset points', fontsize=10, fontweight='bold')
    
    ax4.set_title('📈 투자 전략 성과 비교 (수익률 vs 리스크)', fontsize=14, fontweight='bold')
    ax4.set_xlabel('변동성 (리스크) %', fontsize=12)
    ax4.set_ylabel('연간 수익률 %', fontsize=12)
    ax4.grid(True, alpha=0.3)
    
    # 효율적 프론티어 라인 (대략적)
    frontier_x = np.linspace(15, 45, 100)
    frontier_y = -0.02 * frontier_x**2 + 2.5 * frontier_x - 20
    ax4.plot(frontier_x, frontier_y, 'k--', alpha=0.5, linewidth=2, label='효율적 프론티어')
    ax4.legend()
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/03_포트폴리오_관리전략.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.show()

def create_quick_reference_chart():
    """빠른 참조용 인포그래픽"""
    fig = plt.figure(figsize=(16, 20))
    
    # 전체 제목
    fig.suptitle('🚀 퍼즈 투자전략 빠른 참조 차트', fontsize=24, fontweight='bold', y=0.98)
    
    # 그리드 설정 (5행 2열)
    gs = fig.add_gridspec(5, 2, height_ratios=[1, 1, 1, 1, 1], hspace=0.3, wspace=0.3)
    
    # 1. 3초 매매 신호 (좌상)
    ax1 = fig.add_subplot(gs[0, 0])
    
    signals = ['RSI < 30', '볼밴 하단', '지지선 터치']
    buy_status = [True, True, False]  # 현재 상태
    colors = ['green' if status else 'lightgray' for status in buy_status]
    
    y_pos = np.arange(len(signals))
    bars = ax1.barh(y_pos, [1]*len(signals), color=colors, alpha=0.8)
    
    for i, (signal, status) in enumerate(zip(signals, buy_status)):
        emoji = '✅' if status else '❌'
        ax1.text(0.5, i, emoji, ha='center', va='center', fontsize=20)
    
    ax1.set_yticks(y_pos)
    ax1.set_yticklabels(signals, fontsize=12)
    ax1.set_xlim(0, 1)
    ax1.set_xticks([])
    ax1.set_title('⚡ 3초 매수 신호', fontsize=16, fontweight='bold', color='green')
    
    # 결과 표시
    score = sum(buy_status)
    result_text = f"매수 신호: {score}/3"
    result_color = 'green' if score >= 2 else 'orange' if score == 1 else 'red'
    ax1.text(0.5, -0.5, result_text, ha='center', va='center', 
             fontsize=14, fontweight='bold', color=result_color)
    
    # 2. DCA 계산기 (우상)
    ax2 = fig.add_subplot(gs[0, 1])
    
    target_returns = [100, 200, 300, 500]
    buy_periods = [1, 2, 3, 5]
    colors_dca = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FECA57']
    
    bars = ax2.bar(range(len(target_returns)), buy_periods, color=colors_dca, alpha=0.8)
    ax2.set_title('🎯 DCA 계산기', fontsize=16, fontweight='bold', color='blue')
    ax2.set_xlabel('목표 수익률 (%)', fontsize=12)
    ax2.set_ylabel('매수 기간 (달)', fontsize=12)
    ax2.set_xticks(range(len(target_returns)))
    ax2.set_xticklabels([f'{r}%' for r in target_returns])
    
    for bar, period in zip(bars, buy_periods):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 0.05,
                f'{period}달', ha='center', va='bottom', fontweight='bold')
    
    # 3. 포트폴리오 파이차트 (좌중)
    ax3 = fig.add_subplot(gs[1, 0])
    
    portfolio = {'BTC': 50, 'ETH': 25, 'ALT': 20, '현금': 5}
    colors_pie = ['#F7931A', '#627EEA', '#00D4AA', '#95A5A6']
    
    wedges, texts, autotexts = ax3.pie(portfolio.values(), labels=portfolio.keys(), 
                                      autopct='%1.0f%%', colors=colors_pie, 
                                      startangle=90, textprops={'fontsize': 12, 'fontweight': 'bold'})
    
    ax3.set_title('💰 중급자 포트폴리오', fontsize=16, fontweight='bold', color='purple')
    
    # 4. RSI 게이지 (우중)
    ax4 = fig.add_subplot(gs[1, 1])
    
    # RSI 게이지 만들기
    current_rsi = 35  # 현재 RSI 값
    
    theta = np.linspace(0, np.pi, 100)
    rsi_normalized = current_rsi / 100
    
    # 배경 호 그리기
    ax4.plot(np.cos(theta), np.sin(theta), 'lightgray', linewidth=10, alpha=0.3)
    
    # 과매수/과매도 구간 표시
    oversold_theta = theta[theta <= np.pi * 0.3]  # 0-30
    overbought_theta = theta[theta >= np.pi * 0.7]  # 70-100
    
    ax4.plot(np.cos(oversold_theta), np.sin(oversold_theta), 'green', linewidth=10, alpha=0.8)
    ax4.plot(np.cos(overbought_theta), np.sin(overbought_theta), 'red', linewidth=10, alpha=0.8)
    
    # 현재 RSI 포인터
    rsi_theta = np.pi * (1 - rsi_normalized)
    ax4.arrow(0, 0, 0.8*np.cos(rsi_theta), 0.8*np.sin(rsi_theta), 
              head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=3)
    
    ax4.set_xlim(-1.2, 1.2)
    ax4.set_ylim(-0.2, 1.2)
    ax4.set_aspect('equal')
    ax4.axis('off')
    ax4.set_title(f'📊 현재 RSI: {current_rsi}', fontsize=16, fontweight='bold', color='orange')
    
    # RSI 값 텍스트
    ax4.text(0, -0.3, f'{"매수구간" if current_rsi < 30 else "매도구간" if current_rsi > 70 else "중립구간"}', 
             ha='center', fontsize=14, fontweight='bold',
             color='green' if current_rsi < 30 else 'red' if current_rsi > 70 else 'gray')
    
    # 5. 월별 수익률 히트맵 (상하 전체)
    ax5 = fig.add_subplot(gs[2, :])
    
    months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    strategies_heat = ['DCA', 'RSI매매', '도미넌스', '혼합전략']
    
    # 월별 전략별 수익률 데이터 (가상)
    returns_data = np.array([
        [5, -3, 8, 12, -5, 10, 15, -8, 20, 18, 12, 25],  # DCA
        [3, -8, 15, 8, -12, 18, 10, -15, 25, 12, 8, 30],  # RSI매매
        [7, 2, 5, 10, -2, 8, 12, -5, 15, 20, 15, 20],     # 도미넌스
        [6, -1, 10, 11, -3, 12, 14, -6, 22, 17, 13, 28]   # 혼합전략
    ])
    
    im = ax5.imshow(returns_data, cmap='RdYlGn', aspect='auto', vmin=-15, vmax=30)
    
    ax5.set_xticks(np.arange(len(months)))
    ax5.set_yticks(np.arange(len(strategies_heat)))
    ax5.set_xticklabels(months)
    ax5.set_yticklabels(strategies_heat)
    ax5.set_title('📅 월별 전략 수익률 히트맵 (%)', fontsize=16, fontweight='bold')
    
    # 값 표시
    for i in range(len(strategies_heat)):
        for j in range(len(months)):
            text = ax5.text(j, i, f'{returns_data[i, j]:.0f}%',
                           ha="center", va="center", color="black", fontweight='bold')
    
    # 컬러바
    cbar = plt.colorbar(im, ax=ax5, shrink=0.8)
    cbar.set_label('수익률 (%)', rotation=270, labelpad=15)
    
    # 6. 위험도 vs 수익률 산점도 (좌하)
    ax6 = fig.add_subplot(gs[3, 0])
    
    risk_levels = [10, 20, 25, 30, 35]  # 위험도
    return_levels = [15, 35, 45, 60, 80]  # 기대수익률
    strategy_names = ['안전형', 'DCA', '중급형', '적극형', '공격형']
    
    scatter = ax6.scatter(risk_levels, return_levels, s=300, 
                         c=['green', 'blue', 'orange', 'red', 'purple'], 
                         alpha=0.7, edgecolors='black', linewidth=2)
    
    for i, name in enumerate(strategy_names):
        ax6.annotate(name, (risk_levels[i], return_levels[i]), 
                    xytext=(5, 5), textcoords='offset points', 
                    fontsize=10, fontweight='bold')
    
    ax6.set_xlabel('위험도 (%)', fontsize=12)
    ax6.set_ylabel('기대수익률 (%)', fontsize=12)
    ax6.set_title('⚖️ 위험도 vs 수익률', fontsize=16, fontweight='bold')
    ax6.grid(True, alpha=0.3)
    
    # 7. 체크리스트 (우하)
    ax7 = fig.add_subplot(gs[3, 1])
    
    checklist = [
        '차트 패턴 확인',
        'RSI 확인',
        '매수 자금 확인', 
        '손절선 설정',
        '목표가 설정'
    ]
    
    check_status = [True, True, False, True, False]  # 체크 상태
    
    y_positions = np.arange(len(checklist))
    
    for i, (item, checked) in enumerate(zip(checklist, check_status)):
        color = 'lightgreen' if checked else 'lightcoral'
        emoji = '✅' if checked else '❌'
        
        ax7.barh(i, 1, color=color, alpha=0.5)
        ax7.text(0.1, i, f'{emoji} {item}', va='center', fontsize=11, fontweight='bold')
    
    ax7.set_yticks([])
    ax7.set_xlim(0, 1)
    ax7.set_xticks([])
    ax7.set_title('📋 매수 전 체크리스트', fontsize=16, fontweight='bold')
    
    completed = sum(check_status)
    ax7.text(0.5, -0.7, f'완료: {completed}/{len(checklist)}', 
             ha='center', fontsize=12, fontweight='bold',
             color='green' if completed >= 4 else 'orange' if completed >= 2 else 'red')
    
    # 8. 손익 시뮬레이션 (하단 전체)
    ax8 = fig.add_subplot(gs[4, :])
    
    scenarios = ['최악 시나리오', '나쁜 시나리오', '보통 시나리오', '좋은 시나리오', '최고 시나리오']
    probabilities = [5, 15, 60, 15, 5]
    returns_scenario = [-30, -10, 20, 50, 100]
    
    # 막대 그래프
    colors_scenario = ['darkred', 'red', 'gray', 'green', 'darkgreen']
    bars = ax8.bar(scenarios, probabilities, color=colors_scenario, alpha=0.8)
    
    ax8.set_title('🎲 투자 시나리오별 확률 분포', fontsize=16, fontweight='bold')
    ax8.set_ylabel('확률 (%)', fontsize=12)
    
    # 막대 위에 수익률 표시
    for bar, prob, ret in zip(bars, probabilities, returns_scenario):
        height = bar.get_height()
        ax8.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{prob}%\n({ret:+}%)', ha='center', va='bottom', 
                fontweight='bold', fontsize=10)
    
    # 기댓값 계산
    expected = sum(p * r / 100 for p, r in zip(probabilities, returns_scenario))
    ax8.text(2, 50, f'기댓값: {expected:+.1f}%', ha='center', fontsize=14, 
             fontweight='bold', bbox=dict(boxstyle="round,pad=0.3", facecolor='lightblue'))
    
    plt.setp(ax8.get_xticklabels(), rotation=45, ha='right')
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/04_빠른참조_인포그래픽.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.show()

def main():
    """메인 실행 함수"""
    print("🎨 퍼즈 투자 전략 시각화 차트 생성 중...")
    
    try:
        print("1️⃣ DCA 전략 시각화 생성 중...")
        create_dca_strategy_chart()
        
        print("2️⃣ 기술적 분석 매매 신호 차트 생성 중...")
        create_technical_analysis_chart()
        
        print("3️⃣ 포트폴리오 관리 차트 생성 중...")
        create_portfolio_charts()
        
        print("4️⃣ 빠른 참조 인포그래픽 생성 중...")
        create_quick_reference_chart()
        
        print("\n✅ 모든 시각화 차트가 성공적으로 생성되었습니다!")
        print("📁 저장 위치: C:/Users/sintt/puzzle_crypto_analysis/")
        print("📊 생성된 파일:")
        print("  - 01_DCA_전략_시각화.png")
        print("  - 02_기술적분석_매매신호.png") 
        print("  - 03_포트폴리오_관리전략.png")
        print("  - 04_빠른참조_인포그래픽.png")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        print("💡 matplotlib 설치가 필요할 수 있습니다: pip install matplotlib seaborn")

if __name__ == "__main__":
    main()