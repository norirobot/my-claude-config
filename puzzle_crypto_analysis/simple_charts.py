"""
Simple Visual Charts for Puzzle Investment Strategy
"""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

# Set font and style
plt.style.use('default')
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = 'white'

def create_dca_chart():
    """Create DCA Strategy Visualization"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Puzzle DCA Investment Strategy', fontsize=16, fontweight='bold')
    
    # 1. DCA vs Lump Sum
    months = range(1, 13)
    btc_prices = [25000, 22000, 20000, 18000, 16000, 15000, 17000, 20000, 25000, 30000, 35000, 40000]
    
    # DCA Investment
    dca_investment = [i * 1000000 for i in months]
    dca_coins = []
    total_coins = 0
    for price in btc_prices:
        total_coins += 1000000 / price
        dca_coins.append(total_coins)
    dca_value = [coins * price for coins, price in zip(dca_coins, btc_prices)]
    
    # Lump Sum
    lump_coins = 12000000 / btc_prices[0]
    lump_value = [lump_coins * price for price in btc_prices]
    
    ax1.plot(months, dca_value, 'b-', linewidth=3, label='DCA Investment', marker='o')
    ax1.plot(months, lump_value, 'r--', linewidth=3, label='Lump Sum', marker='s')
    ax1.plot(months, dca_investment, 'g:', linewidth=2, label='Total Investment', alpha=0.7)
    ax1.set_title('DCA vs Lump Sum Performance')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.set_ylabel('Portfolio Value (KRW)')
    
    # 2. Target Return vs Buy Period Formula
    target_returns = [50, 100, 200, 300, 500, 600]
    buy_periods = [r/100 for r in target_returns]
    
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3']
    bars = ax2.bar(range(len(target_returns)), buy_periods, color=colors, alpha=0.8)
    ax2.set_title('DCA Formula: Target Return -> Buy Period')
    ax2.set_xlabel('Target Return (%)')
    ax2.set_ylabel('Buy Period (Months)')
    ax2.set_xticks(range(len(target_returns)))
    ax2.set_xticklabels([f'{r}%' for r in target_returns])
    
    for bar, period in zip(bars, buy_periods):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 0.05,
                f'{period:.1f}M', ha='center', va='bottom', fontweight='bold')
    
    # 3. Average Price Formation
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
    
    ax3.plot(scenario_months, prices, 'r-', linewidth=3, marker='o', label='BTC Price')
    ax3.plot(scenario_months, avg_prices, 'b-', linewidth=3, marker='s', label='Average Price')
    ax3.set_title('DCA Average Price Formation')
    ax3.set_xlabel('Month')
    ax3.set_ylabel('Price (KRW)')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # 4. DCA Advantage in Bear Market
    bear_scenarios = ['10% Drop', '20% Drop', '30% Drop', '40% Drop', '50% Drop']
    dca_advantages = [5, 12, 20, 30, 45]
    
    bars = ax4.barh(bear_scenarios, dca_advantages, 
                    color=['#2ECC71', '#3498DB', '#F39C12', '#E74C3C', '#8E44AD'])
    ax4.set_title('DCA Advantage in Bear Market')
    ax4.set_xlabel('DCA Advantage (%)')
    
    for bar, value in zip(bars, dca_advantages):
        ax4.text(value + 0.5, bar.get_y() + bar.get_height()/2, 
                f'+{value}%', va='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/01_DCA_Strategy.png', 
                dpi=300, bbox_inches='tight')
    print("Created: 01_DCA_Strategy.png")

def create_technical_chart():
    """Create Technical Analysis Chart"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Technical Analysis Trading Signals', fontsize=16, fontweight='bold')
    
    # 1. RSI Trading Signals
    days = list(range(1, 31))
    rsi_values = [45, 42, 38, 35, 28, 25, 30, 35, 40, 45, 50, 55, 60, 65, 72, 
                  75, 70, 68, 65, 60, 55, 50, 45, 40, 35, 32, 28, 35, 42, 48]
    
    ax1.plot(days, rsi_values, 'b-', linewidth=3, alpha=0.8)
    ax1.fill_between(days, rsi_values, 50, where=np.array(rsi_values) < 30, 
                     alpha=0.3, color='green', label='Buy Zone')
    ax1.fill_between(days, rsi_values, 50, where=np.array(rsi_values) > 70, 
                     alpha=0.3, color='red', label='Sell Zone')
    
    ax1.axhline(y=70, color='red', linestyle='--', linewidth=2, alpha=0.8)
    ax1.axhline(y=30, color='green', linestyle='--', linewidth=2, alpha=0.8)
    ax1.axhline(y=50, color='gray', linestyle='-', linewidth=1, alpha=0.5)
    
    # Mark buy/sell points
    buy_points = [(i+1, rsi) for i, rsi in enumerate(rsi_values) if rsi <= 30]
    sell_points = [(i+1, rsi) for i, rsi in enumerate(rsi_values) if rsi >= 70]
    
    if buy_points:
        buy_days, buy_rsi = zip(*buy_points)
        ax1.scatter(buy_days, buy_rsi, color='green', s=100, marker='^', zorder=5)
    
    if sell_points:
        sell_days, sell_rsi = zip(*sell_points)
        ax1.scatter(sell_days, sell_rsi, color='red', s=100, marker='v', zorder=5)
    
    ax1.set_title('RSI Trading Signals')
    ax1.set_ylabel('RSI Value')
    ax1.set_xlabel('Days')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim(0, 100)
    
    # 2. Bollinger Bands
    price = np.array([45000, 44000, 43000, 41000, 39000, 37000, 38000, 40000, 
                     42000, 44000, 46000, 48000, 50000, 52000, 51000, 49000,
                     47000, 45000, 43000, 41000, 39000, 37000, 35000, 37000, 
                     39000, 41000, 43000, 45000, 47000, 49000])
    
    # Calculate Bollinger Bands
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
    
    ax2.plot(days_bb, price_bb, 'k-', linewidth=3, label='BTC Price', alpha=0.8)
    ax2.plot(days_bb, upper_bb, 'r--', linewidth=2, label='Upper Band', alpha=0.8)
    ax2.plot(days_bb, mean_bb, 'b-', linewidth=2, label='Middle (20MA)', alpha=0.8)
    ax2.plot(days_bb, lower_bb, 'g--', linewidth=2, label='Lower Band', alpha=0.8)
    
    ax2.fill_between(days_bb, upper_bb, lower_bb, alpha=0.1, color='gray')
    
    # Buy/Sell signals
    buy_signals = price_bb <= lower_bb
    sell_signals = price_bb >= upper_bb
    
    if np.any(buy_signals):
        ax2.scatter(days_bb[buy_signals], price_bb[buy_signals], 
                   color='green', s=150, marker='^', zorder=5)
    
    if np.any(sell_signals):
        ax2.scatter(days_bb[sell_signals], price_bb[sell_signals], 
                   color='red', s=150, marker='v', zorder=5)
    
    ax2.set_title('Bollinger Bands Trading Signals')
    ax2.set_ylabel('Price (KRW)')
    ax2.set_xlabel('Days')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # 3. BTC Dominance Rotation
    months_dom = list(range(1, 13))
    btc_dominance = [52, 54, 56, 58, 61, 59, 57, 55, 53, 51, 54, 56]
    
    ax3.plot(months_dom, btc_dominance, 'orange', linewidth=4, marker='o', markersize=8)
    ax3.axhline(y=58, color='red', linestyle='--', linewidth=3, alpha=0.8, label='Threshold (58%)')
    
    # Fill areas
    above_58 = [d if d > 58 else 58 for d in btc_dominance]
    below_58 = [d if d < 58 else 58 for d in btc_dominance]
    
    ax3.fill_between(months_dom, above_58, 58, alpha=0.3, color='gold', label='BTC Focus')
    ax3.fill_between(months_dom, below_58, 58, alpha=0.3, color='lightblue', label='ALT Focus')
    
    ax3.set_title('BTC Dominance Rotation Strategy')
    ax3.set_ylabel('BTC Dominance (%)')
    ax3.set_xlabel('Month')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    ax3.set_ylim(45, 65)
    
    # 4. Trading Signal Scoreboard
    signals = ['RSI < 30', 'BB Lower', 'Support', 'Dom < 55%', 'Volume Up']
    current_scores = [1, 1, 0, 1, 0]  # 1: True, 0: False
    
    colors = ['green' if score else 'lightgray' for score in current_scores]
    bars = ax4.barh(signals, [1]*5, color=colors, alpha=0.8)
    
    # Add status indicators
    for i, (signal, score) in enumerate(zip(signals, current_scores)):
        status = 'ON' if score else 'OFF'
        ax4.text(0.5, i, status, ha='center', va='center', fontsize=12, fontweight='bold')
    
    total_score = sum(current_scores)
    signal_text = f"Buy Signal: {total_score}/5"
    
    if total_score >= 4:
        signal_color = 'green'
        action = "STRONG BUY"
    elif total_score >= 3:
        signal_color = 'orange' 
        action = "BUY"
    elif total_score >= 2:
        signal_color = 'gray'
        action = "HOLD"
    else:
        signal_color = 'red'
        action = "AVOID"
    
    ax4.set_title(f'Trading Signal: {action}')
    ax4.set_xlabel('Signal Status')
    ax4.set_xlim(0, 1)
    ax4.set_xticks([])
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/02_Technical_Analysis.png', 
                dpi=300, bbox_inches='tight')
    print("Created: 02_Technical_Analysis.png")

def create_portfolio_chart():
    """Create Portfolio Management Chart"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Portfolio Management Strategy', fontsize=16, fontweight='bold')
    
    # 1. Portfolio Allocation by Level
    levels = ['Beginner', 'Intermediate', 'Advanced']
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
                 label='Cash', color='#95A5A6', alpha=0.9)
    
    ax1.set_title('Portfolio Allocation by Level')
    ax1.set_ylabel('Allocation (%)')
    ax1.set_xticks(x)
    ax1.set_xticklabels(levels)
    ax1.legend()
    ax1.set_ylim(0, 100)
    
    # Add percentage labels
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
    
    # 2. Rebalancing Effect
    months = list(range(1, 13))
    no_rebalancing = [100, 105, 98, 110, 120, 115, 130, 125, 140, 135, 150, 145]
    with_rebalancing = [100, 105, 102, 115, 125, 122, 138, 135, 148, 145, 160, 158]
    
    ax2.plot(months, no_rebalancing, 'r--', linewidth=3, marker='o', 
             label='No Rebalancing', alpha=0.8)
    ax2.plot(months, with_rebalancing, 'g-', linewidth=3, marker='s', 
             label='Monthly Rebalancing', alpha=0.8)
    
    ax2.fill_between(months, no_rebalancing, with_rebalancing, 
                     where=np.array(with_rebalancing) > np.array(no_rebalancing),
                     alpha=0.3, color='green')
    
    ax2.set_title('Rebalancing Effect Comparison')
    ax2.set_ylabel('Portfolio Value (Base=100)')
    ax2.set_xlabel('Month')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    final_diff = with_rebalancing[-1] - no_rebalancing[-1]
    ax2.text(6, 155, f'Rebalancing Effect: +{final_diff:.1f}%', 
             ha='center', fontsize=12, fontweight='bold',
             bbox=dict(boxstyle="round,pad=0.3", facecolor='lightgreen', alpha=0.8))
    
    # 3. Risk vs Return Analysis
    risk_levels = [10, 20, 25, 30, 35]  # Risk
    return_levels = [15, 35, 45, 60, 80]  # Expected Return
    strategy_names = ['Safe', 'DCA', 'Balanced', 'Aggressive', 'High-Risk']
    
    colors_strat = ['green', 'blue', 'orange', 'red', 'purple']
    sizes = [r * 10 for r in return_levels]
    
    scatter = ax3.scatter(risk_levels, return_levels, s=sizes, c=colors_strat, 
                         alpha=0.7, edgecolors='black', linewidth=2)
    
    for i, name in enumerate(strategy_names):
        ax3.annotate(name, (risk_levels[i], return_levels[i]), 
                    xytext=(5, 5), textcoords='offset points', 
                    fontsize=10, fontweight='bold')
    
    ax3.set_xlabel('Risk Level (%)')
    ax3.set_ylabel('Expected Return (%)')
    ax3.set_title('Risk vs Return Analysis')
    ax3.grid(True, alpha=0.3)
    
    # 4. Performance Comparison
    strategies = ['Buy&Hold', 'DCA', 'RSI Trading', 'MA Cross', 'Mixed']
    annual_returns = [45, 65, 55, 40, 70]
    
    colors_perf = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
    bars = ax4.bar(strategies, annual_returns, color=colors_perf, alpha=0.8)
    
    ax4.set_title('Strategy Performance Comparison')
    ax4.set_ylabel('Annual Return (%)')
    ax4.set_xlabel('Strategy')
    
    # Add return values on bars
    for bar, ret in zip(bars, annual_returns):
        height = bar.get_height()
        ax4.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{ret}%', ha='center', va='bottom', fontweight='bold')
    
    plt.setp(ax4.get_xticklabels(), rotation=45, ha='right')
    ax4.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/03_Portfolio_Management.png', 
                dpi=300, bbox_inches='tight')
    print("Created: 03_Portfolio_Management.png")

def create_quick_reference():
    """Create Quick Reference Infographic"""
    fig, ((ax1, ax2, ax3), (ax4, ax5, ax6)) = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle('Puzzle Investment Quick Reference Guide', fontsize=18, fontweight='bold')
    
    # 1. Buy Signal Checklist
    signals = ['RSI < 30', 'BB Lower', 'Support', 'Dom < 55%']
    buy_status = [True, True, False, True]
    colors = ['green' if status else 'lightgray' for status in buy_status]
    
    y_pos = np.arange(len(signals))
    bars = ax1.barh(y_pos, [1]*len(signals), color=colors, alpha=0.8)
    
    for i, (signal, status) in enumerate(zip(signals, buy_status)):
        status_text = 'ON' if status else 'OFF'
        ax1.text(0.5, i, status_text, ha='center', va='center', 
                fontsize=12, fontweight='bold')
    
    ax1.set_yticks(y_pos)
    ax1.set_yticklabels(signals)
    ax1.set_xlim(0, 1)
    ax1.set_xticks([])
    ax1.set_title('Buy Signal Status')
    
    score = sum(buy_status)
    result_text = f"Score: {score}/4"
    ax1.text(0.5, -0.5, result_text, ha='center', va='center', 
             fontsize=14, fontweight='bold')
    
    # 2. DCA Calculator
    target_returns = [100, 200, 300, 500]
    buy_periods = [1, 2, 3, 5]
    colors_dca = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FECA57']
    
    bars = ax2.bar(range(len(target_returns)), buy_periods, color=colors_dca, alpha=0.8)
    ax2.set_title('DCA Calculator')
    ax2.set_xlabel('Target Return (%)')
    ax2.set_ylabel('Buy Period (Months)')
    ax2.set_xticks(range(len(target_returns)))
    ax2.set_xticklabels([f'{r}%' for r in target_returns])
    
    for bar, period in zip(bars, buy_periods):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 0.05,
                f'{period}M', ha='center', va='bottom', fontweight='bold')
    
    # 3. Portfolio Pie Chart
    portfolio = {'BTC': 50, 'ETH': 25, 'ALT': 20, 'Cash': 5}
    colors_pie = ['#F7931A', '#627EEA', '#00D4AA', '#95A5A6']
    
    ax3.pie(portfolio.values(), labels=portfolio.keys(), autopct='%1.0f%%', 
            colors=colors_pie, startangle=90)
    ax3.set_title('Intermediate Portfolio')
    
    # 4. RSI Gauge
    current_rsi = 35
    
    # Create gauge-like visualization
    theta = np.linspace(0, np.pi, 100)
    ax4.plot(np.cos(theta), np.sin(theta), 'lightgray', linewidth=10, alpha=0.3)
    
    # Oversold/Overbought zones
    oversold_theta = theta[theta <= np.pi * 0.3]
    overbought_theta = theta[theta >= np.pi * 0.7]
    
    ax4.plot(np.cos(oversold_theta), np.sin(oversold_theta), 'green', linewidth=10)
    ax4.plot(np.cos(overbought_theta), np.sin(overbought_theta), 'red', linewidth=10)
    
    # Current RSI pointer
    rsi_theta = np.pi * (1 - current_rsi/100)
    ax4.arrow(0, 0, 0.8*np.cos(rsi_theta), 0.8*np.sin(rsi_theta), 
              head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=3)
    
    ax4.set_xlim(-1.2, 1.2)
    ax4.set_ylim(-0.2, 1.2)
    ax4.set_aspect('equal')
    ax4.axis('off')
    ax4.set_title(f'Current RSI: {current_rsi}')
    
    zone = "Buy Zone" if current_rsi < 30 else "Sell Zone" if current_rsi > 70 else "Neutral"
    ax4.text(0, -0.3, zone, ha='center', fontsize=12, fontweight='bold')
    
    # 5. Monthly Performance Heatmap
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    strategies_heat = ['DCA', 'RSI', 'Dominance', 'Mixed']
    
    # Performance data (%)
    returns_data = np.array([
        [5, -3, 8, 12, -5, 10, 15, -8, 20, 18, 12, 25],   # DCA
        [3, -8, 15, 8, -12, 18, 10, -15, 25, 12, 8, 30],  # RSI
        [7, 2, 5, 10, -2, 8, 12, -5, 15, 20, 15, 20],     # Dominance
        [6, -1, 10, 11, -3, 12, 14, -6, 22, 17, 13, 28]   # Mixed
    ])
    
    im = ax5.imshow(returns_data, cmap='RdYlGn', aspect='auto', vmin=-15, vmax=30)
    
    ax5.set_xticks(np.arange(len(months)))
    ax5.set_yticks(np.arange(len(strategies_heat)))
    ax5.set_xticklabels(months)
    ax5.set_yticklabels(strategies_heat)
    ax5.set_title('Monthly Strategy Returns (%)')
    
    # Add text annotations
    for i in range(len(strategies_heat)):
        for j in range(len(months)):
            text = ax5.text(j, i, f'{returns_data[i, j]:.0f}',
                           ha="center", va="center", color="black", fontweight='bold')
    
    # 6. Trading Checklist
    checklist = ['Chart Pattern', 'RSI Check', 'Funds Ready', 'Stop Loss Set', 'Target Set']
    check_status = [True, True, False, True, False]
    
    y_positions = np.arange(len(checklist))
    
    for i, (item, checked) in enumerate(zip(checklist, check_status)):
        color = 'lightgreen' if checked else 'lightcoral'
        status_text = 'OK' if checked else 'NO'
        
        ax6.barh(i, 1, color=color, alpha=0.5)
        ax6.text(0.1, i, f'{status_text} - {item}', va='center', fontsize=10, fontweight='bold')
    
    ax6.set_yticks([])
    ax6.set_xlim(0, 1)
    ax6.set_xticks([])
    ax6.set_title('Trading Checklist')
    
    completed = sum(check_status)
    ax6.text(0.5, -0.7, f'Completed: {completed}/{len(checklist)}', 
             ha='center', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('C:/Users/sintt/puzzle_crypto_analysis/04_Quick_Reference.png', 
                dpi=300, bbox_inches='tight')
    print("Created: 04_Quick_Reference.png")

def main():
    """Main execution function"""
    print("Creating Puzzle Investment Strategy Visual Charts...")
    
    try:
        print("1. Creating DCA Strategy Chart...")
        create_dca_chart()
        
        print("2. Creating Technical Analysis Chart...")
        create_technical_chart()
        
        print("3. Creating Portfolio Management Chart...")
        create_portfolio_chart()
        
        print("4. Creating Quick Reference Guide...")
        create_quick_reference()
        
        print("\nAll visual charts created successfully!")
        print("Files saved in: C:/Users/sintt/puzzle_crypto_analysis/")
        print("- 01_DCA_Strategy.png")
        print("- 02_Technical_Analysis.png") 
        print("- 03_Portfolio_Management.png")
        print("- 04_Quick_Reference.png")
        
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    main()