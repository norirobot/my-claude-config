"""
한국어 퍼즈 투자전략 시각적 차트 생성기
"""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'  # Windows 한글 폰트
plt.rcParams['axes.unicode_minus'] = False  # 마이너스 기호 깨짐 방지
plt.style.use('default')
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = 'white'

def create_dca_chart():
    """DCA 투자전략 시각화"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('퍼즈 DCA 투자전략', fontsize=16, fontweight='bold')
    
    # 1. DCA vs 일시투자 비교
    months = range(1, 13)
    btc_prices = [25000, 22000, 20000, 18000, 16000, 15000, 17000, 20000, 25000, 30000, 35000, 40000]
    
    # DCA 투자
    dca_investment = [i * 1000000 for i in months]
    dca_coins = []
    total_coins = 0
    for price in btc_prices:
        total_coins += 1000000 / price
        dca_coins.append(total_coins)
    dca_value = [coins * price for coins, price in zip(dca_coins, btc_prices)]
    
    # 일시투자
    lump_coins = 12000000 / btc_prices[0]
    lump_value = [lump_coins * price for price in btc_prices]
    
    ax1.plot(months, dca_value, 'b-', linewidth=3, label='DCA 투자', marker='o')
    ax1.plot(months, lump_value, 'r--', linewidth=3, label='일시투자', marker='s')
    ax1.plot(months, dca_investment, 'g:', linewidth=2, label='총 투자금', alpha=0.7)
    ax1.set_title('DCA vs 일시투자 성과비교')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.set_ylabel('포트폴리오 가치 (원)')
    
    # 2. 목표수익률 vs 매수기간 공식
    target_returns = [50, 100, 200, 300, 500, 600]
    buy_periods = [r/100 for r in target_returns]
    
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3']
    bars = ax2.bar(range(len(target_returns)), buy_periods, color=colors, alpha=0.8)
    ax2.set_title('DCA 공식: 목표수익률 → 매수기간')
    ax2.set_xlabel('목표수익률 (%)')
    ax2.set_ylabel('매수기간 (개월)')
    ax2.set_xticks(range(len(target_returns)))
    ax2.set_xticklabels([f'{r}%' for r in target_returns])
    
    for bar, period in zip(bars, buy_periods):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 0.05,
                f'{period:.1f}개월', ha='center', va='bottom', fontweight='bold')
    
    # 3. 평균단가 형성과정
    scenario_months = list(range(1, 7))
    prices = [30000, 25000, 20000, 15000, 18000, 25000]
    monthly_investment = 500000
    
    avg_prices = []
    total_coins = 0
    total_investment = 0
    
    for price in prices:
        coins_bought = monthly_investment / price
        total_coins += coins_bought
        total_investment += monthly_investment
        avg_price = total_investment / total_coins
        avg_prices.append(avg_price)
    
    ax3.plot(scenario_months, prices, 'r-', linewidth=3, marker='o', label='BTC 가격')
    ax3.plot(scenario_months, avg_prices, 'b-', linewidth=3, marker='s', label='평균단가')
    ax3.set_title('DCA 평균단가 형성과정')
    ax3.set_xlabel('개월')
    ax3.set_ylabel('가격 (원)')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # 4. 하락장에서 DCA 효과
    bear_scenarios = ['10% 하락', '20% 하락', '30% 하락', '40% 하락', '50% 하락']
    dca_advantages = [5, 12, 20, 30, 45]
    
    bars = ax4.barh(bear_scenarios, dca_advantages, 
                    color=['#2ECC71', '#3498DB', '#F39C12', '#E74C3C', '#8E44AD'])
    ax4.set_title('하락장에서 DCA 우위')
    ax4.set_xlabel('DCA 우위 (%)')
    
    for bar, value in zip(bars, dca_advantages):
        ax4.text(value + 0.5, bar.get_y() + bar.get_height()/2, 
                f'+{value}%', va='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/01_한국어_DCA_전략.png', 
                dpi=300, bbox_inches='tight')
    print("생성완료: 01_한국어_DCA_전략.png")

def create_technical_chart():
    """기술적 분석 차트"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('기술적 분석 매매신호', fontsize=16, fontweight='bold')
    
    # 1. RSI 매매신호
    days = list(range(1, 31))
    rsi_values = [45, 42, 38, 35, 28, 25, 30, 35, 40, 45, 50, 55, 60, 65, 72, 
                  75, 70, 68, 65, 60, 55, 50, 45, 40, 35, 32, 28, 35, 42, 48]
    
    ax1.plot(days, rsi_values, 'b-', linewidth=3, alpha=0.8)
    ax1.fill_between(days, rsi_values, 50, where=np.array(rsi_values) < 30, 
                     alpha=0.3, color='green', label='매수구간')
    ax1.fill_between(days, rsi_values, 50, where=np.array(rsi_values) > 70, 
                     alpha=0.3, color='red', label='매도구간')
    
    ax1.axhline(y=70, color='red', linestyle='--', linewidth=2, alpha=0.8, label='과매수선(70)')
    ax1.axhline(y=30, color='green', linestyle='--', linewidth=2, alpha=0.8, label='과매도선(30)')
    ax1.axhline(y=50, color='gray', linestyle='-', linewidth=1, alpha=0.5)
    
    # 매수/매도 포인트 표시
    buy_points = [(i+1, rsi) for i, rsi in enumerate(rsi_values) if rsi <= 30]
    sell_points = [(i+1, rsi) for i, rsi in enumerate(rsi_values) if rsi >= 70]
    
    if buy_points:
        buy_days, buy_rsi = zip(*buy_points)
        ax1.scatter(buy_days, buy_rsi, color='green', s=100, marker='^', zorder=5, label='매수신호')
    
    if sell_points:
        sell_days, sell_rsi = zip(*sell_points)
        ax1.scatter(sell_days, sell_rsi, color='red', s=100, marker='v', zorder=5, label='매도신호')
    
    ax1.set_title('RSI 매매신호')
    ax1.set_ylabel('RSI 값')
    ax1.set_xlabel('일수')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim(0, 100)
    
    # 2. 볼린저밴드
    price = np.array([45000, 44000, 43000, 41000, 39000, 37000, 38000, 40000, 
                     42000, 44000, 46000, 48000, 50000, 52000, 51000, 49000,
                     47000, 45000, 43000, 41000, 39000, 37000, 35000, 37000, 
                     39000, 41000, 43000, 45000, 47000, 49000])
    
    # 볼린저밴드 계산
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
    
    ax2.plot(days_bb, price_bb, 'k-', linewidth=3, label='BTC 가격', alpha=0.8)
    ax2.plot(days_bb, upper_bb, 'r--', linewidth=2, label='상단밴드', alpha=0.8)
    ax2.plot(days_bb, mean_bb, 'b-', linewidth=2, label='중간선(20MA)', alpha=0.8)
    ax2.plot(days_bb, lower_bb, 'g--', linewidth=2, label='하단밴드', alpha=0.8)
    
    ax2.fill_between(days_bb, upper_bb, lower_bb, alpha=0.1, color='gray')
    
    # 매수/매도 신호
    buy_signals = price_bb <= lower_bb
    sell_signals = price_bb >= upper_bb
    
    if np.any(buy_signals):
        ax2.scatter(days_bb[buy_signals], price_bb[buy_signals], 
                   color='green', s=150, marker='^', zorder=5)
    
    if np.any(sell_signals):
        ax2.scatter(days_bb[sell_signals], price_bb[sell_signals], 
                   color='red', s=150, marker='v', zorder=5)
    
    ax2.set_title('볼린저밴드 매매신호')
    ax2.set_ylabel('가격 (원)')
    ax2.set_xlabel('일수')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # 3. BTC 도미넌스 로테이션
    months_dom = list(range(1, 13))
    btc_dominance = [52, 54, 56, 58, 61, 59, 57, 55, 53, 51, 54, 56]
    
    ax3.plot(months_dom, btc_dominance, 'orange', linewidth=4, marker='o', markersize=8)
    ax3.axhline(y=58, color='red', linestyle='--', linewidth=3, alpha=0.8, label='임계선 (58%)')
    
    # 영역 채우기
    above_58 = [d if d > 58 else 58 for d in btc_dominance]
    below_58 = [d if d < 58 else 58 for d in btc_dominance]
    
    ax3.fill_between(months_dom, above_58, 58, alpha=0.3, color='gold', label='BTC 집중')
    ax3.fill_between(months_dom, below_58, 58, alpha=0.3, color='lightblue', label='알트 집중')
    
    ax3.set_title('BTC 도미넌스 로테이션 전략')
    ax3.set_ylabel('BTC 도미넌스 (%)')
    ax3.set_xlabel('개월')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    ax3.set_ylim(45, 65)
    
    # 4. 매매신호 스코어보드
    signals = ['RSI < 30', '볼밴 하단', '지지선', '도미 < 55%', '거래량↑']
    current_scores = [1, 1, 0, 1, 0]  # 1: True, 0: False
    
    colors = ['green' if score else 'lightgray' for score in current_scores]
    bars = ax4.barh(signals, [1]*5, color=colors, alpha=0.8)
    
    # 상태 표시
    for i, (signal, score) in enumerate(zip(signals, current_scores)):
        status = '켜짐' if score else '꺼짐'
        ax4.text(0.5, i, status, ha='center', va='center', fontsize=12, fontweight='bold')
    
    total_score = sum(current_scores)
    
    if total_score >= 4:
        action = "강매수"
    elif total_score >= 3:
        action = "매수"
    elif total_score >= 2:
        action = "보유"
    else:
        action = "관망"
    
    ax4.set_title(f'매매신호: {action}')
    ax4.set_xlabel('신호상태')
    ax4.set_xlim(0, 1)
    ax4.set_xticks([])
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/02_한국어_기술적분석.png', 
                dpi=300, bbox_inches='tight')
    print("생성완료: 02_한국어_기술적분석.png")

def create_portfolio_chart():
    """포트폴리오 관리 차트"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('포트폴리오 관리 전략', fontsize=16, fontweight='bold')
    
    # 1. 레벨별 포트폴리오 비율
    levels = ['초급자', '중급자', '고급자']
    btc_ratios = [70, 50, 40]
    eth_ratios = [30, 25, 20]
    alt_ratios = [0, 25, 35]
    cash_ratios = [0, 0, 5]
    
    x = np.arange(len(levels))
    width = 0.6
    
    p1 = ax1.bar(x, btc_ratios, width, label='BTC', color='#F7931A', alpha=0.9)
    p2 = ax1.bar(x, eth_ratios, width, bottom=btc_ratios, label='ETH', color='#627EEA', alpha=0.9)
    p3 = ax1.bar(x, alt_ratios, width, bottom=np.array(btc_ratios)+np.array(eth_ratios), 
                 label='알트코인', color='#00D4AA', alpha=0.9)
    p4 = ax1.bar(x, cash_ratios, width, 
                 bottom=np.array(btc_ratios)+np.array(eth_ratios)+np.array(alt_ratios), 
                 label='현금', color='#95A5A6', alpha=0.9)
    
    ax1.set_title('레벨별 포트폴리오 배분')
    ax1.set_ylabel('비중 (%)')
    ax1.set_xticks(x)
    ax1.set_xticklabels(levels)
    ax1.legend()
    ax1.set_ylim(0, 100)
    
    # 비율 라벨 추가
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
    
    # 2. 리밸런싱 효과
    months = list(range(1, 13))
    no_rebalancing = [100, 105, 98, 110, 120, 115, 130, 125, 140, 135, 150, 145]
    with_rebalancing = [100, 105, 102, 115, 125, 122, 138, 135, 148, 145, 160, 158]
    
    ax2.plot(months, no_rebalancing, 'r--', linewidth=3, marker='o', 
             label='리밸런싱 없음', alpha=0.8)
    ax2.plot(months, with_rebalancing, 'g-', linewidth=3, marker='s', 
             label='월 리밸런싱', alpha=0.8)
    
    ax2.fill_between(months, no_rebalancing, with_rebalancing, 
                     where=np.array(with_rebalancing) > np.array(no_rebalancing),
                     alpha=0.3, color='green')
    
    ax2.set_title('리밸런싱 효과 비교')
    ax2.set_ylabel('포트폴리오 가치 (기준=100)')
    ax2.set_xlabel('개월')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    final_diff = with_rebalancing[-1] - no_rebalancing[-1]
    ax2.text(6, 155, f'리밸런싱 효과: +{final_diff:.1f}%', 
             ha='center', fontsize=12, fontweight='bold',
             bbox=dict(boxstyle="round,pad=0.3", facecolor='lightgreen', alpha=0.8))
    
    # 3. 위험도 vs 수익률 분석
    risk_levels = [10, 20, 25, 30, 35]  # 위험도
    return_levels = [15, 35, 45, 60, 80]  # 예상수익률
    strategy_names = ['안전', 'DCA', '균형', '공격적', '고위험']
    
    colors_strat = ['green', 'blue', 'orange', 'red', 'purple']
    sizes = [r * 10 for r in return_levels]
    
    scatter = ax3.scatter(risk_levels, return_levels, s=sizes, c=colors_strat, 
                         alpha=0.7, edgecolors='black', linewidth=2)
    
    for i, name in enumerate(strategy_names):
        ax3.annotate(name, (risk_levels[i], return_levels[i]), 
                    xytext=(5, 5), textcoords='offset points', 
                    fontsize=10, fontweight='bold')
    
    ax3.set_xlabel('위험도 (%)')
    ax3.set_ylabel('예상수익률 (%)')
    ax3.set_title('위험도 vs 수익률 분석')
    ax3.grid(True, alpha=0.3)
    
    # 4. 전략별 성과 비교
    strategies = ['홀딩', 'DCA', 'RSI매매', 'MA교차', '혼합']
    annual_returns = [45, 65, 55, 40, 70]
    
    colors_perf = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
    bars = ax4.bar(strategies, annual_returns, color=colors_perf, alpha=0.8)
    
    ax4.set_title('전략별 성과 비교')
    ax4.set_ylabel('연간수익률 (%)')
    ax4.set_xlabel('전략')
    
    # 수익률 값 표시
    for bar, ret in zip(bars, annual_returns):
        height = bar.get_height()
        ax4.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{ret}%', ha='center', va='bottom', fontweight='bold')
    
    plt.setp(ax4.get_xticklabels(), rotation=45, ha='right')
    ax4.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/03_한국어_포트폴리오관리.png', 
                dpi=300, bbox_inches='tight')
    print("생성완료: 03_한국어_포트폴리오관리.png")

def create_quick_reference():
    """빠른 참조 인포그래픽"""
    fig, ((ax1, ax2, ax3), (ax4, ax5, ax6)) = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle('퍼즈 투자전략 빠른참조 가이드', fontsize=18, fontweight='bold')
    
    # 1. 매수신호 체크리스트
    signals = ['RSI < 30', '볼밴 하단', '지지선', '도미 < 55%']
    buy_status = [True, True, False, True]
    colors = ['green' if status else 'lightgray' for status in buy_status]
    
    y_pos = np.arange(len(signals))
    bars = ax1.barh(y_pos, [1]*len(signals), color=colors, alpha=0.8)
    
    for i, (signal, status) in enumerate(zip(signals, buy_status)):
        status_text = '켜짐' if status else '꺼짐'
        ax1.text(0.5, i, status_text, ha='center', va='center', 
                fontsize=12, fontweight='bold')
    
    ax1.set_yticks(y_pos)
    ax1.set_yticklabels(signals)
    ax1.set_xlim(0, 1)
    ax1.set_xticks([])
    ax1.set_title('매수신호 현황')
    
    score = sum(buy_status)
    result_text = f"점수: {score}/4"
    ax1.text(0.5, -0.5, result_text, ha='center', va='center', 
             fontsize=14, fontweight='bold')
    
    # 2. DCA 계산기
    target_returns = [100, 200, 300, 500]
    buy_periods = [1, 2, 3, 5]
    colors_dca = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FECA57']
    
    bars = ax2.bar(range(len(target_returns)), buy_periods, color=colors_dca, alpha=0.8)
    ax2.set_title('DCA 계산기')
    ax2.set_xlabel('목표수익률 (%)')
    ax2.set_ylabel('매수기간 (개월)')
    ax2.set_xticks(range(len(target_returns)))
    ax2.set_xticklabels([f'{r}%' for r in target_returns])
    
    for bar, period in zip(bars, buy_periods):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 0.05,
                f'{period}개월', ha='center', va='bottom', fontweight='bold')
    
    # 3. 포트폴리오 원형차트
    portfolio = {'BTC': 50, 'ETH': 25, '알트': 20, '현금': 5}
    colors_pie = ['#F7931A', '#627EEA', '#00D4AA', '#95A5A6']
    
    ax3.pie(portfolio.values(), labels=portfolio.keys(), autopct='%1.0f%%', 
            colors=colors_pie, startangle=90)
    ax3.set_title('중급자 포트폴리오')
    
    # 4. RSI 게이지
    current_rsi = 35
    
    # 게이지 형태 시각화
    theta = np.linspace(0, np.pi, 100)
    ax4.plot(np.cos(theta), np.sin(theta), 'lightgray', linewidth=10, alpha=0.3)
    
    # 과매도/과매수 구간
    oversold_theta = theta[theta <= np.pi * 0.3]
    overbought_theta = theta[theta >= np.pi * 0.7]
    
    ax4.plot(np.cos(oversold_theta), np.sin(oversold_theta), 'green', linewidth=10, label='과매도')
    ax4.plot(np.cos(overbought_theta), np.sin(overbought_theta), 'red', linewidth=10, label='과매수')
    
    # 현재 RSI 화살표
    rsi_theta = np.pi * (1 - current_rsi/100)
    ax4.arrow(0, 0, 0.8*np.cos(rsi_theta), 0.8*np.sin(rsi_theta), 
              head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=3)
    
    ax4.set_xlim(-1.2, 1.2)
    ax4.set_ylim(-0.2, 1.2)
    ax4.set_aspect('equal')
    ax4.axis('off')
    ax4.set_title(f'현재 RSI: {current_rsi}')
    
    zone = "매수구간" if current_rsi < 30 else "매도구간" if current_rsi > 70 else "중립"
    ax4.text(0, -0.3, zone, ha='center', fontsize=12, fontweight='bold')
    
    # 5. 월별 성과 히트맵
    months = ['1월', '2월', '3월', '4월', '5월', '6월', 
              '7월', '8월', '9월', '10월', '11월', '12월']
    strategies_heat = ['DCA', 'RSI', '도미넌스', '혼합']
    
    # 성과 데이터 (%)
    returns_data = np.array([
        [5, -3, 8, 12, -5, 10, 15, -8, 20, 18, 12, 25],   # DCA
        [3, -8, 15, 8, -12, 18, 10, -15, 25, 12, 8, 30],  # RSI
        [7, 2, 5, 10, -2, 8, 12, -5, 15, 20, 15, 20],     # 도미넌스
        [6, -1, 10, 11, -3, 12, 14, -6, 22, 17, 13, 28]   # 혼합
    ])
    
    im = ax5.imshow(returns_data, cmap='RdYlGn', aspect='auto', vmin=-15, vmax=30)
    
    ax5.set_xticks(np.arange(len(months)))
    ax5.set_yticks(np.arange(len(strategies_heat)))
    ax5.set_xticklabels(months)
    ax5.set_yticklabels(strategies_heat)
    ax5.set_title('월별 전략 수익률 (%)')
    
    # 텍스트 주석 추가
    for i in range(len(strategies_heat)):
        for j in range(len(months)):
            text = ax5.text(j, i, f'{returns_data[i, j]:.0f}',
                           ha="center", va="center", color="black", fontweight='bold')
    
    # 6. 매매 체크리스트
    checklist = ['차트 패턴', 'RSI 확인', '자금 준비', '손절 설정', '목표 설정']
    check_status = [True, True, False, True, False]
    
    y_positions = np.arange(len(checklist))
    
    for i, (item, checked) in enumerate(zip(checklist, check_status)):
        color = 'lightgreen' if checked else 'lightcoral'
        status_text = '완료' if checked else '미완'
        
        ax6.barh(i, 1, color=color, alpha=0.5)
        ax6.text(0.1, i, f'{status_text} - {item}', va='center', fontsize=10, fontweight='bold')
    
    ax6.set_yticks([])
    ax6.set_xlim(0, 1)
    ax6.set_xticks([])
    ax6.set_title('매매 체크리스트')
    
    completed = sum(check_status)
    ax6.text(0.5, -0.7, f'완료: {completed}/{len(checklist)}', 
             ha='center', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/04_한국어_빠른참조.png', 
                dpi=300, bbox_inches='tight')
    print("생성완료: 04_한국어_빠른참조.png")

def main():
    """메인 실행 함수"""
    print("퍼즈 투자전략 한국어 시각적 차트를 생성합니다...")
    
    try:
        print("1. DCA 전략 차트 생성 중...")
        create_dca_chart()
        
        print("2. 기술적 분석 차트 생성 중...")
        create_technical_chart()
        
        print("3. 포트폴리오 관리 차트 생성 중...")
        create_portfolio_chart()
        
        print("4. 빠른 참조 가이드 생성 중...")
        create_quick_reference()
        
        print("\n모든 한국어 시각적 차트가 성공적으로 생성되었습니다!")
        print("파일 저장 위치: C:/Users/sintt/puzzle_crypto_analysis/")
        print("- 01_한국어_DCA_전략.png")
        print("- 02_한국어_기술적분석.png") 
        print("- 03_한국어_포트폴리오관리.png")
        print("- 04_한국어_빠른참조.png")
        
    except Exception as e:
        print(f"오류가 발생했습니다: {e}")
        print("한글 폰트가 설치되어 있지 않을 수 있습니다.")
        print("Malgun Gothic 폰트를 확인해주세요.")

if __name__ == "__main__":
    main()