"""
퍼즈 트레이딩 봇 메인 실행 파일
"""
import sys
import time
import schedule
import logging
from datetime import datetime
import config
from puzz_trading_bot import PuzzleTradingBot
from exchange_upbit import UpbitTrader
from backtesting import PuzzleBacktester

# 로깅 설정
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(config.LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class TradingBotManager:
    """트레이딩 봇 관리자"""
    
    def __init__(self):
        self.mode = config.MODE
        self.bot = None
        self.trader = None
        
        logger.info(f"=== 퍼즈 트레이딩 봇 시작 ===")
        logger.info(f"실행 모드: {self.mode}")
        logger.info(f"초기 자본: {config.INITIAL_CAPITAL:,}원")
        
        self.initialize_bot()
    
    def initialize_bot(self):
        """봇 초기화"""
        if self.mode == 'PAPER':
            # 모의투자 모드
            self.bot = PuzzleTradingBot(
                initial_capital=config.PAPER_TRADING_CAPITAL,
                enable_paper_trading=True
            )
            logger.info("✅ 모의투자 모드로 실행")
            
        elif self.mode == 'REAL':
            # 실전 투자 모드
            if not config.UPBIT_ACCESS_KEY or not config.UPBIT_SECRET_KEY:
                logger.error("❌ 업비트 API 키가 설정되지 않았습니다!")
                logger.error("config.py 파일에 API 키를 입력해주세요.")
                sys.exit(1)
            
            self.trader = UpbitTrader(
                access_key=config.UPBIT_ACCESS_KEY,
                secret_key=config.UPBIT_SECRET_KEY
            )
            logger.info("✅ 실전 투자 모드로 실행 (주의!)")
            
        elif self.mode == 'BACKTEST':
            # 백테스트 모드
            self.run_backtest()
            sys.exit(0)
    
    def run_trading_cycle(self):
        """트레이딩 사이클 실행"""
        logger.info(f"\n{'='*50}")
        logger.info(f"트레이딩 사이클 시작: {datetime.now()}")
        
        try:
            if self.mode == 'PAPER':
                self.run_paper_trading()
            elif self.mode == 'REAL':
                self.run_real_trading()
                
        except Exception as e:
            logger.error(f"❌ 에러 발생: {e}")
    
    def run_paper_trading(self):
        """모의투자 실행"""
        # 더미 시장 데이터 (실제로는 API에서 가져옴)
        market_data = {
            'BTC': {'price': 95000000, 'market_cap': 1800000000000},
            'ETH': {'price': 3200000, 'market_cap': 380000000000},
            'SOL': {'price': 180000, 'market_cap': 80000000000},
            'XRP': {'price': 2500, 'market_cap': 140000000000},
        }
        
        # 시장 데이터 업데이트
        self.bot.update_market_data(market_data)
        
        # 전략 실행
        summary = self.bot.run_bot_cycle()
        
        # 결과 출력
        logger.info(f"\n📊 포트폴리오 현황")
        logger.info(f"총 자산: {summary['total_value']:,.0f}원")
        logger.info(f"수익률: {summary['profit_rate']:.2f}%")
        logger.info(f"거래 횟수: {summary['trade_count']}회")
    
    def run_real_trading(self):
        """실전 투자 실행"""
        # 시장 정보 업데이트
        self.trader.update_market_info()
        
        # 포트폴리오 현황
        portfolio = self.trader.get_portfolio_status()
        logger.info(f"\n📊 포트폴리오 현황")
        logger.info(f"총 자산: {portfolio['total_value_krw']:,.0f}원")
        
        # DCA 전략 실행
        if config.DCA_ENABLED:
            self.check_dca_schedule()
        
        # 각 코인별 신호 체크
        for market in ['KRW-BTC', 'KRW-ETH']:
            signal = self.trader.check_puzzle_signal(market)
            logger.info(f"{market}: {signal}")
            
            if signal == 'BUY' and config.MODE == 'REAL':
                # 실제 매수 주문
                # self.trader.execute_dca_strategy(market, config.DCA_AMOUNT)
                logger.warning("실전 매수는 주의가 필요합니다!")
    
    def check_dca_schedule(self):
        """DCA 스케줄 체크"""
        today = datetime.now()
        
        # 매주 일요일 체크
        if today.weekday() == 6 and config.DCA_INTERVAL_DAYS == 7:
            logger.info("📅 주간 DCA 실행일입니다")
            
            for coin in config.DCA_COINS:
                market = f'KRW-{coin}'
                logger.info(f"DCA 매수: {market} {config.DCA_AMOUNT:,}원")
                
                if config.MODE == 'REAL':
                    # 실제 매수
                    # self.trader.execute_dca_strategy(market, config.DCA_AMOUNT)
                    pass
    
    def run_backtest(self):
        """백테스트 실행"""
        logger.info("=== 백테스트 모드 ===")
        
        backtester = PuzzleBacktester(
            initial_capital=config.BACKTEST_INITIAL_CAPITAL
        )
        
        # 데이터 로드
        df = backtester.load_historical_data(
            'KRW-BTC',
            config.BACKTEST_START_DATE,
            config.BACKTEST_END_DATE
        )
        
        # 지표 계산
        df = backtester.calculate_indicators(df)
        
        # 전략 비교
        results = backtester.compare_strategies(df)
        
        print("\n📊 백테스트 결과")
        print(results.to_string(index=False))
        
        # 시각화
        backtester.backtest_dca_strategy(df)
        backtester.plot_results("DCA 전략 백테스트")
    
    def run_scheduler(self):
        """스케줄러 실행"""
        # 정기 실행 설정
        schedule.every(config.BOT_RUN_INTERVAL_MINUTES).minutes.do(self.run_trading_cycle)
        
        # 리밸런싱 설정
        if config.AUTO_REBALANCE:
            schedule.every().month.at("09:00").do(self.rebalance_portfolio)
        
        logger.info(f"⏰ 스케줄러 시작 - {config.BOT_RUN_INTERVAL_MINUTES}분마다 실행")
        
        # 첫 실행
        self.run_trading_cycle()
        
        # 스케줄러 루프
        while True:
            schedule.run_pending()
            time.sleep(60)  # 1분마다 체크
    
    def rebalance_portfolio(self):
        """포트폴리오 리밸런싱"""
        logger.info("🔄 포트폴리오 리밸런싱 시작")
        # TODO: 리밸런싱 로직 구현


def print_usage():
    """사용법 출력"""
    print("""
╔══════════════════════════════════════════════════════════╗
║          🚀 퍼즈 트레이딩 봇 사용 가이드 🚀              ║
╚══════════════════════════════════════════════════════════╝

1️⃣ 설치하기:
   pip install -r requirements.txt

2️⃣ 설정하기 (config.py 수정):
   - MODE = 'PAPER'  # 모의투자로 시작
   - DCA_AMOUNT = 300000  # 투자금액 설정
   
3️⃣ 실행하기:
   python main.py

4️⃣ 실행 모드:
   • PAPER: 모의투자 (안전)
   • REAL: 실전투자 (API 키 필요)
   • BACKTEST: 과거 데이터 검증

5️⃣ 주요 설정:
   • DCA 금액: {dca:,}원
   • 투자 주기: {interval}일
   • 포트폴리오: BTC {btc}% / ETH {eth}% / ALT {alt}%

⚠️  실전 투자 전 반드시 모의투자로 테스트하세요!
    """.format(
        dca=config.DCA_AMOUNT,
        interval=config.DCA_INTERVAL_DAYS,
        btc=int(config.PORTFOLIO_RATIO['BTC']*100),
        eth=int(config.PORTFOLIO_RATIO['ETH']*100),
        alt=int(config.PORTFOLIO_RATIO['ALT']*100)
    ))


def main():
    """메인 함수"""
    print_usage()
    
    # 사용자 확인
    if config.MODE == 'REAL':
        confirm = input("\n⚠️  실전 투자 모드입니다. 계속하시겠습니까? (yes/no): ")
        if confirm.lower() != 'yes':
            print("프로그램을 종료합니다.")
            return
    
    try:
        # 봇 관리자 시작
        manager = TradingBotManager()
        
        # 스케줄러 실행
        manager.run_scheduler()
        
    except KeyboardInterrupt:
        logger.info("\n프로그램이 종료되었습니다.")
    except Exception as e:
        logger.error(f"프로그램 오류: {e}")
        raise


if __name__ == "__main__":
    main()