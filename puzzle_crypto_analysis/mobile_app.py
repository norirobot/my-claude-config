"""
퍼즐 트레이딩 봇 모바일 앱
Streamlit 기반 웹앱 (모바일 최적화)
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import time
import json
from puzz_trading_bot import PuzzleTradingBot
from exchange_upbit import UpbitTrader
import config

# 페이지 설정 (모바일 최적화)
st.set_page_config(
    page_title="퍼즐 트레이딩 봇",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 모바일 최적화 CSS
st.markdown("""
<style>
    /* 모바일 최적화 */
    .main .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
        max-width: 100%;
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
    
    /* 버튼 스타일 */
    .stButton > button {
        width: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px;
        border-radius: 10px;
        font-weight: bold;
    }
    
    /* 헤더 스타일 */
    .main-header {
        text-align: center;
        color: #2c3e50;
        padding: 20px 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    /* 모바일 반응형 */
    @media (max-width: 768px) {
        .main .block-container {
            padding-left: 1rem;
            padding-right: 1rem;
        }
    }
</style>
""", unsafe_allow_html=True)

# 세션 상태 초기화
if 'bot' not in st.session_state:
    st.session_state.bot = PuzzleTradingBot(
        initial_capital=config.INITIAL_CAPITAL,
        enable_paper_trading=True
    )

if 'trader' not in st.session_state:
    st.session_state.trader = UpbitTrader()

if 'is_running' not in st.session_state:
    st.session_state.is_running = False

def get_dummy_portfolio():
    """더미 포트폴리오 데이터"""
    return {
        'total_value': 10_500_000,
        'profit': 500_000,
        'profit_rate': 5.0,
        'positions': {
            'BTC': {'amount': 0.11, 'value': 6_300_000, 'profit': 8.5},
            'ETH': {'amount': 0.65, 'value': 2_100_000, 'profit': 3.2},
            'SOL': {'amount': 8.7, 'value': 1_575_000, 'profit': -2.1}
        },
        'cash': 525_000
    }

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
        color = "green" if "+" in str(delta) else "red"
        delta_html = f'<div style="font-size: 14px; color: {color};">{delta}</div>'
    
    st.markdown(f"""
    <div class="{card_class}">
        <div style="font-size: 16px; opacity: 0.8;">{title}</div>
        <div style="font-size: 28px; font-weight: bold; margin: 5px 0;">{value}</div>
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
        textfont=dict(size=14),
        marker=dict(colors=colors[:len(labels)]),
        hole=0.4
    )])
    
    fig.update_layout(
        showlegend=True,
        height=400,
        margin=dict(t=0, b=0, l=0, r=0),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.2,
            xanchor="center",
            x=0.5
        )
    )
    
    return fig

def create_profit_chart():
    """수익률 차트"""
    dates = pd.date_range(start='2024-01-01', end='2024-01-30', freq='D')
    profits = [0]
    
    for i in range(1, len(dates)):
        change = profits[-1] + (i * 0.2 + (i % 3 - 1) * 0.5)
        profits.append(change)
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=dates,
        y=profits,
        mode='lines',
        fill='tozeroy',
        line=dict(color='#4ECDC4', width=3),
        fillcolor='rgba(78, 205, 196, 0.1)'
    ))
    
    fig.update_layout(
        title="수익률 추이 (%)",
        xaxis_title="날짜",
        yaxis_title="수익률 (%)",
        height=300,
        margin=dict(t=40, b=40, l=40, r=40),
        showlegend=False
    )
    
    return fig

def main_dashboard():
    """메인 대시보드"""
    st.markdown('<h1 class="main-header">🚀 퍼즐 트레이딩 봇</h1>', unsafe_allow_html=True)
    
    # 상태 표시
    status_col1, status_col2 = st.columns(2)
    
    with status_col1:
        if st.session_state.is_running:
            st.success("🟢 봇 실행 중")
        else:
            st.error("🔴 봇 정지")
    
    with status_col2:
        mode = config.MODE
        mode_text = {"PAPER": "모의투자", "REAL": "실전투자", "BACKTEST": "백테스트"}
        st.info(f"📊 {mode_text.get(mode, mode)} 모드")
    
    # 컨트롤 버튼
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("▶️ 시작", key="start_btn"):
            st.session_state.is_running = True
            st.success("봇이 시작되었습니다!")
            time.sleep(1)
            st.rerun()
    
    with col2:
        if st.button("⏹️ 정지", key="stop_btn"):
            st.session_state.is_running = False
            st.warning("봇이 정지되었습니다!")
            time.sleep(1)
            st.rerun()
    
    with col3:
        if st.button("🔄 새로고침", key="refresh_btn"):
            st.rerun()
    
    st.divider()
    
    # 포트폴리오 요약
    portfolio = get_dummy_portfolio()
    
    # 메트릭 카드들
    col1, col2 = st.columns(2)
    
    with col1:
        create_metric_card(
            "총 자산", 
            f"{portfolio['total_value']:,}원",
            card_type="default"
        )
    
    with col2:
        card_type = "profit" if portfolio['profit'] > 0 else "loss"
        create_metric_card(
            "수익/손실", 
            f"{portfolio['profit']:+,}원",
            f"{portfolio['profit_rate']:+.1f}%",
            card_type=card_type
        )
    
    # 포트폴리오 차트
    st.subheader("📊 포트폴리오 구성")
    fig_pie = create_portfolio_chart(portfolio)
    st.plotly_chart(fig_pie, use_container_width=True)
    
    # 수익률 차트
    st.subheader("📈 수익률 추이")
    fig_profit = create_profit_chart()
    st.plotly_chart(fig_profit, use_container_width=True)

def trading_signals():
    """매매 신호 페이지"""
    st.markdown('<h2 class="main-header">🎯 매매 신호</h2>', unsafe_allow_html=True)
    
    # 실시간 신호
    signals = [
        {"시간": "14:30", "코인": "BTC", "신호": "매수", "전략": "DCA", "신뢰도": 90},
        {"시간": "13:15", "코인": "ETH", "신호": "관망", "전략": "RSI", "신뢰도": 45},
        {"시간": "12:00", "코인": "SOL", "신호": "매도", "전략": "MA", "신뢰도": 75},
    ]
    
    for signal in signals:
        color = {"매수": "🟢", "매도": "🔴", "관망": "🟡"}[signal["신호"]]
        
        with st.container():
            st.markdown(f"""
            <div style="background: white; padding: 15px; border-radius: 10px; 
                        margin: 10px 0; border-left: 5px solid {'green' if signal['신호']=='매수' else 'red' if signal['신호']=='매도' else 'orange'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>{color} {signal['코인']} {signal['신호']}</strong><br>
                        <small>{signal['전략']} 전략 | 신뢰도: {signal['신뢰도']}%</small>
                    </div>
                    <div style="text-align: right;">
                        <small>{signal['시간']}</small>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
    
    st.divider()
    
    # 오늘의 추천
    st.subheader("💡 오늘의 투자 추천")
    st.info("📌 도미넌스가 55%로 하락 중입니다. 알트코인 비중을 늘려보세요!")
    st.warning("⚠️ 김치프리미엄이 3.2%입니다. 아직 정상 범위입니다.")

def settings_page():
    """설정 페이지"""
    st.markdown('<h2 class="main-header">⚙️ 설정</h2>', unsafe_allow_html=True)
    
    # 투자 설정
    st.subheader("💰 투자 설정")
    
    with st.form("investment_settings"):
        dca_amount = st.number_input(
            "DCA 매회 투자금액 (원)", 
            min_value=10000, 
            max_value=10000000,
            value=config.DCA_AMOUNT,
            step=10000
        )
        
        dca_interval = st.selectbox(
            "DCA 투자 주기",
            options=[7, 14, 30],
            format_func=lambda x: f"{x}일 ({'매주' if x==7 else '격주' if x==14 else '매월'})",
            index=0 if config.DCA_INTERVAL_DAYS == 7 else 1 if config.DCA_INTERVAL_DAYS == 14 else 2
        )
        
        st.subheader("📊 포트폴리오 비율")
        btc_ratio = st.slider("비트코인 비율 (%)", 0, 100, int(config.PORTFOLIO_RATIO['BTC']*100))
        eth_ratio = st.slider("이더리움 비율 (%)", 0, 100, int(config.PORTFOLIO_RATIO['ETH']*100))
        alt_ratio = st.slider("알트코인 비율 (%)", 0, 100, int(config.PORTFOLIO_RATIO['ALT']*100))
        cash_ratio = 100 - btc_ratio - eth_ratio - alt_ratio
        
        st.write(f"현금 비율: {cash_ratio}%")
        
        if st.form_submit_button("💾 설정 저장"):
            # 설정 저장 로직
            st.success("설정이 저장되었습니다!")
    
    st.divider()
    
    # 알림 설정
    st.subheader("🔔 알림 설정")
    
    profit_alert = st.checkbox("수익 알림", value=True)
    loss_alert = st.checkbox("손실 알림", value=True)
    signal_alert = st.checkbox("매매 신호 알림", value=True)
    
    st.divider()
    
    # 위험 관리
    st.subheader("⚠️ 위험 관리")
    
    stop_loss = st.slider("손절선 (%)", -50, 0, -config.STOP_LOSS_PERCENT)
    take_profit = st.slider("익절선 (%)", 0, 200, config.TAKE_PROFIT_PERCENT)
    
    if st.button("🚨 긴급 매도 (전체)"):
        if st.confirmation_dialog("정말로 모든 포지션을 매도하시겠습니까?"):
            st.error("긴급 매도가 실행되었습니다!")

def trade_history():
    """거래 내역 페이지"""
    st.markdown('<h2 class="main-header">📋 거래 내역</h2>', unsafe_allow_html=True)
    
    # 더미 거래 내역
    trades = pd.DataFrame([
        {"날짜": "2024-01-15", "코인": "BTC", "타입": "매수", "수량": 0.003, "가격": "95,000,000", "수수료": "1,425"},
        {"날짜": "2024-01-14", "코인": "ETH", "타입": "매수", "수량": 0.094, "가격": "3,200,000", "수수료": "960"},
        {"날짜": "2024-01-13", "코인": "SOL", "타입": "매도", "수량": 1.5, "가격": "180,000", "수수료": "405"},
        {"날짜": "2024-01-12", "코인": "BTC", "타입": "매수", "수량": 0.0032, "가격": "93,500,000", "수수료": "1,498"},
    ])
    
    # 필터
    col1, col2 = st.columns(2)
    with col1:
        date_filter = st.date_input("날짜 필터", value=datetime.now().date() - timedelta(days=7))
    with col2:
        coin_filter = st.selectbox("코인 필터", options=["전체", "BTC", "ETH", "SOL", "XRP"])
    
    # 거래 내역 테이블
    st.dataframe(
        trades,
        use_container_width=True,
        hide_index=True
    )
    
    # 거래 통계
    st.subheader("📊 거래 통계")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("총 거래", "156회")
    with col2:
        st.metric("매수", "98회")
    with col3:
        st.metric("매도", "58회")
    with col4:
        st.metric("수수료", "₩45,230")

def main():
    """메인 앱"""
    # 사이드바 네비게이션 (모바일에서는 숨김)
    with st.sidebar:
        st.title("🚀 퍼즐봇")
        page = st.radio(
            "페이지 선택",
            ["대시보드", "매매신호", "거래내역", "설정"],
            index=0
        )
    
    # 모바일 네비게이션 (상단 탭)
    tabs = st.tabs(["🏠 대시보드", "🎯 매매신호", "📋 거래내역", "⚙️ 설정"])
    
    with tabs[0]:
        main_dashboard()
    
    with tabs[1]:
        trading_signals()
    
    with tabs[2]:
        trade_history()
    
    with tabs[3]:
        settings_page()
    
    # 하단 고정 정보
    st.markdown("---")
    st.markdown(
        "<div style='text-align: center; color: gray; font-size: 12px;'>"
        "🚀 퍼즐 트레이딩 봇 v1.0 | 마지막 업데이트: " + 
        datetime.now().strftime("%Y-%m-%d %H:%M") +
        "</div>", 
        unsafe_allow_html=True
    )

if __name__ == "__main__":
    main()