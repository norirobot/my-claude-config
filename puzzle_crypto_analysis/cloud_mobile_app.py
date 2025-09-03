"""
클라우드 배포용 모바일 앱
Streamlit Cloud에서 최적화된 버전
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import time
import json
import random
import cloud_config

# 페이지 설정 (모바일 최적화)
st.set_page_config(
    page_title="🚀 퍼즐 트레이딩 봇",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# PWA 지원을 위한 메타 태그
st.markdown("""
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#667eea">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="퍼즐봇">
</head>
""", unsafe_allow_html=True)

# 모바일 최적화 CSS
st.markdown("""
<style>
    /* 모바일 최적화 */
    .main .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
        max-width: 100%;
    }
    
    /* 클라우드 전용 스타일 */
    .cloud-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 15px;
        color: white;
        text-align: center;
        margin-bottom: 20px;
    }
    
    /* 카드 스타일 */
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 15px;
        color: white;
        margin: 10px 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .profit-card {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        padding: 20px;
        border-radius: 15px;
        color: white;
        margin: 10px 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .loss-card {
        background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
        padding: 20px;
        border-radius: 15px;
        color: white;
        margin: 10px 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    /* 클라우드 버튼 */
    .stButton > button {
        width: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px;
        border-radius: 10px;
        font-weight: bold;
    }
    
    /* 실시간 업데이트 표시 */
    .live-indicator {
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4CAF50;
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
        z-index: 1000;
    }
</style>
""", unsafe_allow_html=True)

# 세션 상태 초기화
def initialize_session_state():
    if 'portfolio_data' not in st.session_state:
        st.session_state.portfolio_data = generate_dummy_portfolio()
    
    if 'is_running' not in st.session_state:
        st.session_state.is_running = False
    
    if 'last_update' not in st.session_state:
        st.session_state.last_update = datetime.now()
    
    if 'trade_history' not in st.session_state:
        st.session_state.trade_history = generate_dummy_trades()

def generate_dummy_portfolio():
    """클라우드용 더미 포트폴리오 데이터"""
    base_value = cloud_config.INITIAL_CAPITAL
    profit_rate = random.uniform(-5, 15)  # -5% ~ +15%
    
    return {
        'total_value': base_value * (1 + profit_rate/100),
        'profit': base_value * profit_rate/100,
        'profit_rate': profit_rate,
        'positions': {
            'BTC': {
                'amount': 0.11, 
                'value': base_value * 0.6 * (1 + random.uniform(-0.1, 0.1)),
                'profit': random.uniform(-10, 20)
            },
            'ETH': {
                'amount': 0.65, 
                'value': base_value * 0.2 * (1 + random.uniform(-0.1, 0.1)),
                'profit': random.uniform(-10, 20)
            },
            'SOL': {
                'amount': 8.7, 
                'value': base_value * 0.15 * (1 + random.uniform(-0.1, 0.1)),
                'profit': random.uniform(-10, 20)
            }
        },
        'cash': base_value * 0.05
    }

def generate_dummy_trades():
    """더미 거래 내역"""
    trades = []
    coins = ['BTC', 'ETH', 'SOL', 'XRP']
    
    for i in range(20):
        date = datetime.now() - timedelta(days=i)
        coin = random.choice(coins)
        action = random.choice(['매수', '매도'])
        
        trades.append({
            'date': date.strftime('%m-%d'),
            'time': date.strftime('%H:%M'),
            'coin': coin,
            'action': action,
            'amount': f'{random.randint(50, 500):,}원',
            'strategy': random.choice(['DCA', 'RSI', 'MA'])
        })
    
    return trades

def create_metric_card(title, value, delta=None, card_type="default"):
    """메트릭 카드 생성"""
    if card_type == "profit":
        card_class = "profit-card"
    elif card_type == "loss":
        card_class = "loss-card"
    else:
        card_class = "metric-card"
    
    delta_html = ""
    if delta:
        color = "lightgreen" if "+" in str(delta) else "lightcoral"
        delta_html = f'<div style="font-size: 14px; color: {color}; margin-top: 5px;">{delta}</div>'
    
    st.markdown(f"""
    <div class="{card_class}">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">{title}</div>
        <div style="font-size: 24px; font-weight: bold;">{value}</div>
        {delta_html}
    </div>
    """, unsafe_allow_html=True)

def create_portfolio_chart(portfolio):
    """포트폴리오 파이 차트"""
    labels = []
    values = []
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    
    for coin, data in portfolio['positions'].items():
        labels.append(coin)
        values.append(data['value'])
    
    labels.append('현금')
    values.append(portfolio['cash'])
    
    fig = go.Figure(data=[go.Pie(
        labels=labels, 
        values=values,
        textinfo='label+percent',
        textfont=dict(size=12),
        marker=dict(colors=colors[:len(labels)]),
        hole=0.4
    )])
    
    fig.update_layout(
        showlegend=True,
        height=350,
        margin=dict(t=20, b=20, l=20, r=20),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.2,
            xanchor="center",
            x=0.5
        ),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)'
    )
    
    return fig

def create_profit_trend_chart():
    """수익률 트렌드 차트"""
    dates = pd.date_range(start=datetime.now() - timedelta(days=30), end=datetime.now(), freq='D')
    
    # 더미 수익률 데이터 (트렌드 시뮬레이션)
    profits = [0]
    for i in range(1, len(dates)):
        change = random.uniform(-2, 3)  # 일일 변동률
        new_profit = profits[-1] + change
        profits.append(max(-20, min(30, new_profit)))  # -20% ~ +30% 제한
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=dates,
        y=profits,
        mode='lines',
        fill='tozeroy',
        line=dict(color='#4ECDC4', width=2),
        fillcolor='rgba(78, 205, 196, 0.1)',
        name='수익률'
    ))
    
    fig.update_layout(
        title="최근 30일 수익률 추이",
        xaxis_title="날짜",
        yaxis_title="수익률 (%)",
        height=300,
        margin=dict(t=40, b=40, l=40, r=40),
        showlegend=False,
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)'
    )
    
    return fig

def main_dashboard():
    """메인 대시보드"""
    # 클라우드 헤더
    st.markdown("""
    <div class="cloud-header">
        <h1>🚀 퍼즐 트레이딩 봇</h1>
        <p>☁️ 클라우드에서 24시간 작동 중</p>
    </div>
    """, unsafe_allow_html=True)
    
    # 라이브 인디케이터
    st.markdown("""
    <div class="live-indicator">
        🟢 LIVE
    </div>
    """, unsafe_allow_html=True)
    
    portfolio = st.session_state.portfolio_data
    
    # 컨트롤 버튼
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("▶️ 시작" if not st.session_state.is_running else "⏹️ 정지"):
            st.session_state.is_running = not st.session_state.is_running
            if st.session_state.is_running:
                st.success("🟢 봇이 시작되었습니다!")
            else:
                st.warning("🔴 봇이 정지되었습니다!")
            time.sleep(1)
            st.rerun()
    
    with col2:
        if st.button("🔄 업데이트"):
            st.session_state.portfolio_data = generate_dummy_portfolio()
            st.session_state.last_update = datetime.now()
            st.success("데이터가 업데이트되었습니다!")
            time.sleep(1)
            st.rerun()
    
    with col3:
        status = "🟢 실행 중" if st.session_state.is_running else "🔴 정지"
        st.info(f"상태: {status}")
    
    # 메트릭 카드들
    col1, col2 = st.columns(2)
    
    with col1:
        create_metric_card(
            "총 자산", 
            f"₩{portfolio['total_value']:,.0f}",
            card_type="default"
        )
    
    with col2:
        card_type = "profit" if portfolio['profit'] > 0 else "loss"
        create_metric_card(
            "수익/손실", 
            f"₩{portfolio['profit']:+,.0f}",
            f"{portfolio['profit_rate']:+.1f}%",
            card_type=card_type
        )
    
    # 포트폴리오 차트
    st.subheader("📊 포트폴리오 구성")
    fig_pie = create_portfolio_chart(portfolio)
    st.plotly_chart(fig_pie, use_container_width=True)
    
    # 수익률 차트
    st.subheader("📈 수익률 추이")
    fig_trend = create_profit_trend_chart()
    st.plotly_chart(fig_trend, use_container_width=True)
    
    # 자동 새로고침
    if st.session_state.is_running:
        time.sleep(cloud_config.UPDATE_INTERVAL_SECONDS)
        st.rerun()

def trading_signals_page():
    """매매 신호 페이지"""
    st.subheader("🎯 실시간 매매 신호")
    
    # 더미 신호 데이터
    signals = [
        {"time": "14:30", "coin": "BTC", "signal": "매수", "strategy": "DCA", "confidence": 90, "reason": "주간 정적립식 매수일"},
        {"time": "13:15", "coin": "ETH", "signal": "관망", "strategy": "RSI", "confidence": 45, "reason": "RSI 50 - 중립구간"},
        {"time": "12:00", "coin": "SOL", "signal": "매도", "strategy": "MA", "confidence": 75, "reason": "20일선 하향돌파"},
        {"time": "11:30", "coin": "XRP", "signal": "매수", "strategy": "도미넌스", "confidence": 65, "reason": "도미넌스 하락 → 알트 강세"},
    ]
    
    for signal in signals:
        emoji = {"매수": "🟢", "매도": "🔴", "관망": "🟡"}[signal["신호"]]
        color = {"매수": "#4CAF50", "매도": "#F44336", "관망": "#FF9800"}[signal["신호"]]
        
        st.markdown(f"""
        <div style="background: white; padding: 15px; border-radius: 10px; 
                    margin: 10px 0; border-left: 5px solid {color}; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>{emoji} {signal['coin']} {signal['signal']}</strong><br>
                    <small style="color: #666;">{signal['strategy']} 전략 | 신뢰도: {signal['confidence']}%</small><br>
                    <small style="color: #999;">{signal['reason']}</small>
                </div>
                <div style="text-align: right; color: #888;">
                    <small>{signal['time']}</small>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    # 오늘의 시장 분석
    st.subheader("🔍 오늘의 시장 분석")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.info("📊 BTC 도미넌스: 55.2% (-2.1%)")
        st.success("📈 공포탐욕지수: 72 (탐욕)")
    
    with col2:
        st.warning("⚠️ 김치프리미엄: 3.2% (정상)")
        st.info("💰 전체 시총: $2.1T (+1.5%)")

def trade_history_page():
    """거래 내역 페이지"""
    st.subheader("📋 거래 내역")
    
    trades_df = pd.DataFrame(st.session_state.trade_history)
    
    # 필터
    col1, col2 = st.columns(2)
    with col1:
        selected_coin = st.selectbox("코인 필터", ["전체"] + list(set([t['coin'] for t in st.session_state.trade_history])))
    with col2:
        selected_action = st.selectbox("거래 유형", ["전체", "매수", "매도"])
    
    # 필터링
    filtered_trades = st.session_state.trade_history.copy()
    if selected_coin != "전체":
        filtered_trades = [t for t in filtered_trades if t['coin'] == selected_coin]
    if selected_action != "전체":
        filtered_trades = [t for t in filtered_trades if t['action'] == selected_action]
    
    # 거래 내역 표시
    for trade in filtered_trades[:10]:  # 최근 10개만
        action_color = "#4CAF50" if trade['action'] == "매수" else "#F44336"
        
        st.markdown(f"""
        <div style="background: white; padding: 10px; border-radius: 8px; 
                    margin: 5px 0; border-left: 4px solid {action_color};">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <strong>{trade['coin']} {trade['action']}</strong>
                    <span style="background: #E3F2FD; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 10px;">
                        {trade['strategy']}
                    </span>
                </div>
                <div style="text-align: right; font-size: 14px;">
                    <div>{trade['amount']}</div>
                    <small style="color: #666;">{trade['date']} {trade['time']}</small>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    # 거래 통계
    st.subheader("📊 거래 통계")
    col1, col2, col3, col4 = st.columns(4)
    
    buy_count = len([t for t in st.session_state.trade_history if t['action'] == '매수'])
    sell_count = len([t for t in st.session_state.trade_history if t['action'] == '매도'])
    
    with col1:
        st.metric("총 거래", len(st.session_state.trade_history))
    with col2:
        st.metric("매수", f"{buy_count}회")
    with col3:
        st.metric("매도", f"{sell_count}회")
    with col4:
        st.metric("승률", "68%")

def settings_page():
    """설정 페이지"""
    st.subheader("⚙️ 설정")
    
    st.info("☁️ 클라우드 모드에서는 안전을 위해 일부 설정이 제한됩니다.")
    
    # 투자 설정
    with st.expander("💰 투자 설정", expanded=True):
        dca_amount = st.slider("DCA 투자금액 (만원)", 10, 500, 30)
        dca_interval = st.selectbox("투자 주기", ["매주", "격주", "매월"])
        
        st.write(f"💡 설정: 매회 {dca_amount}만원씩 {dca_interval}로 투자")
    
    # 포트폴리오 설정
    with st.expander("📊 포트폴리오 설정"):
        btc_ratio = st.slider("비트코인 비율 (%)", 0, 100, 60)
        eth_ratio = st.slider("이더리움 비율 (%)", 0, 100, 20)
        alt_ratio = st.slider("알트코인 비율 (%)", 0, 100, 15)
        cash_ratio = 100 - btc_ratio - eth_ratio - alt_ratio
        
        st.write(f"현금 비율: {cash_ratio}%")
    
    # 알림 설정
    with st.expander("🔔 알림 설정"):
        profit_alert = st.checkbox("수익 알림", value=True)
        loss_alert = st.checkbox("손실 알림", value=True)
        signal_alert = st.checkbox("매매 신호 알림", value=True)
    
    # 클라우드 정보
    with st.expander("☁️ 클라우드 정보"):
        st.write("**배포 환경**: Streamlit Cloud")
        st.write("**마지막 업데이트**: " + st.session_state.last_update.strftime("%Y-%m-%d %H:%M:%S"))
        st.write("**데이터 모드**: 모의투자 (안전모드)")
        st.write("**업데이트 주기**: 1분")

def main():
    """메인 앱"""
    # 세션 상태 초기화
    initialize_session_state()
    
    # 탭 네비게이션
    tabs = st.tabs(["🏠 대시보드", "🎯 매매신호", "📋 거래내역", "⚙️ 설정"])
    
    with tabs[0]:
        main_dashboard()
    
    with tabs[1]:
        trading_signals_page()
    
    with tabs[2]:
        trade_history_page()
    
    with tabs[3]:
        settings_page()
    
    # 하단 정보
    st.markdown("---")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.caption("🚀 퍼즐 트레이딩 봇 v1.0")
    with col2:
        st.caption("☁️ Streamlit Cloud")
    with col3:
        st.caption("📱 모바일 최적화")

if __name__ == "__main__":
    main()