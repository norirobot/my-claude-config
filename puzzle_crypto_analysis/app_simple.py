"""
간단한 퍼즈 트레이딩 봇 웹 인터페이스
"""
import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# 페이지 설정
st.set_page_config(
    page_title="퍼즈 트레이딩 봇",
    page_icon="🤖",
    layout="wide"
)

# 타이틀
st.title("🚀 퍼즈 트레이딩 봇 - 모의투자")
st.markdown("YouTube 크립토 전략 자동화 시스템")

# 탭 생성
tab1, tab2, tab3, tab4 = st.tabs(["📊 대시보드", "💰 포트폴리오", "📈 백테스트", "⚙️ 설정"])

with tab1:
    # 대시보드
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("총 자산", "₩10,500,000", "+5.0%")
    with col2:
        st.metric("수익률", "+5.0%", "+0.5%")
    with col3:
        st.metric("거래 횟수", "15회", "+2")
    with col4:
        st.metric("승률", "72%", "+3%")
    
    # 차트 생성
    st.subheader("📈 자산 변동 추이")
    
    # 더미 데이터 생성
    dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='D')
    prices = 10000000 + np.cumsum(np.random.randn(len(dates)) * 50000)
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=dates, y=prices, mode='lines', name='총 자산'))
    fig.update_layout(height=400, xaxis_title="날짜", yaxis_title="자산 (₩)")
    st.plotly_chart(fig, use_container_width=True)
    
    # 최근 거래 내역
    st.subheader("📝 최근 거래 내역")
    trades_data = {
        '시간': ['2024-01-15 09:00', '2024-01-15 10:30', '2024-01-15 14:00'],
        '코인': ['BTC', 'ETH', 'XRP'],
        '종류': ['매수', '매수', '매도'],
        '수량': ['0.0032', '0.15', '1000'],
        '가격': ['₩95,000,000', '₩3,200,000', '₩800'],
        '전략': ['DCA', 'RSI', '익절']
    }
    df_trades = pd.DataFrame(trades_data)
    st.dataframe(df_trades, use_container_width=True)

with tab2:
    # 포트폴리오
    st.subheader("💼 현재 포트폴리오")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        portfolio_data = {
            '코인': ['BTC', 'ETH', 'XRP', 'ADA', 'CASH'],
            '비중(%)': [60, 20, 8, 7, 5],
            '평가금액': ['₩6,300,000', '₩2,100,000', '₩840,000', '₩735,000', '₩525,000'],
            '수익률': ['+8.5%', '+3.2%', '-2.1%', '+15.3%', '0%']
        }
        df_portfolio = pd.DataFrame(portfolio_data)
        st.dataframe(df_portfolio, use_container_width=True)
    
    with col2:
        # 파이 차트
        fig = go.Figure(data=[go.Pie(labels=portfolio_data['코인'], values=portfolio_data['비중(%)'])])
        fig.update_layout(height=300)
        st.plotly_chart(fig, use_container_width=True)
    
    # DCA 현황
    st.subheader("📅 DCA (정적립식) 현황")
    st.info("✅ 다음 매수 예정: 2024-01-22 09:00 (7일 후)")
    st.write("- 매주 월요일 자동 매수")
    st.write("- 회당 투자금액: ₩300,000")
    st.write("- 누적 투자 횟수: 52회")

with tab3:
    # 백테스트
    st.subheader("📊 백테스트 결과")
    
    # 전략별 성과
    strategy_data = {
        '전략': ['DCA (정적립식)', 'RSI 전략', 'MA Cross', 'Buy & Hold'],
        '수익률': ['+324%', '+180%', '+150%', '+200%'],
        '최대낙폭': ['-15%', '-20%', '-25%', '-35%'],
        '승률': ['72%', '65%', '58%', 'N/A']
    }
    df_strategy = pd.DataFrame(strategy_data)
    st.dataframe(df_strategy, use_container_width=True)
    
    # 백테스트 차트
    st.subheader("📈 백테스트 수익률 비교")
    
    dates = pd.date_range(start='2022-01-01', end='2024-01-01', freq='D')
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=dates, y=np.cumprod(1 + np.random.randn(len(dates))*0.01)*100, 
                             mode='lines', name='DCA'))
    fig.add_trace(go.Scatter(x=dates, y=np.cumprod(1 + np.random.randn(len(dates))*0.008)*100, 
                             mode='lines', name='RSI'))
    fig.add_trace(go.Scatter(x=dates, y=np.cumprod(1 + np.random.randn(len(dates))*0.007)*100, 
                             mode='lines', name='MA Cross'))
    fig.update_layout(height=400, xaxis_title="날짜", yaxis_title="수익률 (%)")
    st.plotly_chart(fig, use_container_width=True)

with tab4:
    # 설정
    st.subheader("⚙️ 봇 설정")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("### 기본 설정")
        mode = st.selectbox("실행 모드", ["모의투자", "백테스트", "실전투자"])
        capital = st.number_input("초기 자본 (₩)", value=10000000, step=1000000)
        
        st.write("### DCA 설정")
        dca_enabled = st.checkbox("DCA 활성화", value=True)
        dca_amount = st.number_input("회당 투자금액 (₩)", value=300000, step=10000)
        dca_interval = st.slider("투자 주기 (일)", 1, 30, 7)
    
    with col2:
        st.write("### 포트폴리오 비중")
        btc_ratio = st.slider("BTC (%)", 0, 100, 60)
        eth_ratio = st.slider("ETH (%)", 0, 100-btc_ratio, 20)
        alt_ratio = st.slider("ALT (%)", 0, 100-btc_ratio-eth_ratio, 15)
        cash_ratio = 100 - btc_ratio - eth_ratio - alt_ratio
        st.write(f"CASH: {cash_ratio}%")
        
        st.write("### 리스크 관리")
        stop_loss = st.slider("손절선 (%)", 5, 50, 20)
        take_profit = st.slider("익절선 (%)", 10, 100, 50)
    
    if st.button("설정 저장", type="primary"):
        st.success("✅ 설정이 저장되었습니다!")

# 사이드바
with st.sidebar:
    st.header("🤖 봇 상태")
    
    # 실시간 상태
    status = st.empty()
    status.success("● 정상 작동 중")
    
    # 현재 시간
    st.write(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 주요 지표
    st.metric("BTC 도미넌스", "54.2%", "-0.3%")
    st.metric("Fear & Greed", "72 (Greed)", "+5")
    
    # 실행 버튼
    st.write("---")
    if st.button("▶️ 봇 시작", use_container_width=True):
        st.success("봇이 시작되었습니다!")
    if st.button("⏸️ 일시정지", use_container_width=True):
        st.warning("봇이 일시정지되었습니다.")
    if st.button("⏹️ 정지", use_container_width=True):
        st.error("봇이 정지되었습니다.")
    
    # 로그
    st.write("---")
    st.write("### 📜 실시간 로그")
    log_container = st.container()
    with log_container:
        st.text("[09:00] DCA 매수 실행 - BTC 0.0032")
        st.text("[10:30] RSI 신호 감지 - ETH 매수")
        st.text("[14:00] 익절 실행 - XRP +15%")
        st.text("[15:30] 포트폴리오 리밸런싱 완료")

# 자동 새로고침 (선택사항)
# while True:
#     time.sleep(5)
#     st.rerun()