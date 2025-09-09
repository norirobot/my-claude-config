"""
퍼즈 트레이딩 봇 - 데스크톱 GUI
"""
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import threading
import time
from datetime import datetime
import json
import pandas as pd
import numpy as np

# Import bot modules
try:
    from puzz_trading_bot import PuzzleTradingBot
    from exchange_upbit import UpbitAPI
    import config
except ImportError as e:
    print(f"Module import error: {e}")

class TradingBotGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🚀 퍼즈 트레이딩 봇 v1.0")
        self.root.geometry("1200x700")
        
        # 봇 인스턴스
        self.bot = None
        self.upbit = UpbitAPI()
        self.is_running = False
        
        # 스타일 설정
        style = ttk.Style()
        style.theme_use('clam')
        
        # 메인 프레임
        self.create_widgets()
        
        # 자동 업데이트 시작
        self.update_display()
        
    def create_widgets(self):
        # 상단 정보 패널
        top_frame = ttk.Frame(self.root, padding="10")
        top_frame.grid(row=0, column=0, columnspan=3, sticky="ew")
        
        # 상태 표시
        self.status_label = ttk.Label(top_frame, text="⚫ 대기 중", font=("Arial", 12, "bold"))
        self.status_label.pack(side=tk.LEFT, padx=10)
        
        # 시간 표시
        self.time_label = ttk.Label(top_frame, text="", font=("Arial", 10))
        self.time_label.pack(side=tk.RIGHT, padx=10)
        
        # 탭 위젯
        notebook = ttk.Notebook(self.root)
        notebook.grid(row=1, column=0, columnspan=3, sticky="nsew", padx=10, pady=5)
        
        # 대시보드 탭
        self.dashboard_tab = ttk.Frame(notebook)
        notebook.add(self.dashboard_tab, text="📊 대시보드")
        self.create_dashboard_tab()
        
        # 포트폴리오 탭
        self.portfolio_tab = ttk.Frame(notebook)
        notebook.add(self.portfolio_tab, text="💰 포트폴리오")
        self.create_portfolio_tab()
        
        # 설정 탭
        self.settings_tab = ttk.Frame(notebook)
        notebook.add(self.settings_tab, text="⚙️ 설정")
        self.create_settings_tab()
        
        # 로그 탭
        self.log_tab = ttk.Frame(notebook)
        notebook.add(self.log_tab, text="📜 로그")
        self.create_log_tab()
        
        # 하단 컨트롤 패널
        control_frame = ttk.Frame(self.root, padding="10")
        control_frame.grid(row=2, column=0, columnspan=3, sticky="ew")
        
        self.start_btn = ttk.Button(control_frame, text="▶️ 시작", command=self.start_bot, width=15)
        self.start_btn.pack(side=tk.LEFT, padx=5)
        
        self.stop_btn = ttk.Button(control_frame, text="⏹️ 정지", command=self.stop_bot, width=15, state="disabled")
        self.stop_btn.pack(side=tk.LEFT, padx=5)
        
        self.test_btn = ttk.Button(control_frame, text="🧪 테스트", command=self.test_connection, width=15)
        self.test_btn.pack(side=tk.LEFT, padx=5)
        
        # Grid 설정
        self.root.grid_rowconfigure(1, weight=1)
        self.root.grid_columnconfigure(0, weight=1)
        
    def create_dashboard_tab(self):
        # 메트릭 프레임
        metrics_frame = ttk.LabelFrame(self.dashboard_tab, text="주요 지표", padding="10")
        metrics_frame.grid(row=0, column=0, columnspan=4, sticky="ew", padx=10, pady=5)
        
        # 메트릭 라벨들
        self.metrics = {
            'total_asset': tk.StringVar(value="₩10,000,000"),
            'profit_rate': tk.StringVar(value="0.00%"),
            'trade_count': tk.StringVar(value="0"),
            'win_rate': tk.StringVar(value="0.00%")
        }
        
        ttk.Label(metrics_frame, text="총 자산:").grid(row=0, column=0, sticky="w", padx=5)
        ttk.Label(metrics_frame, textvariable=self.metrics['total_asset'], font=("Arial", 14, "bold")).grid(row=0, column=1, padx=5)
        
        ttk.Label(metrics_frame, text="수익률:").grid(row=0, column=2, sticky="w", padx=5)
        ttk.Label(metrics_frame, textvariable=self.metrics['profit_rate'], font=("Arial", 14, "bold")).grid(row=0, column=3, padx=5)
        
        ttk.Label(metrics_frame, text="거래 횟수:").grid(row=1, column=0, sticky="w", padx=5)
        ttk.Label(metrics_frame, textvariable=self.metrics['trade_count'], font=("Arial", 14, "bold")).grid(row=1, column=1, padx=5)
        
        ttk.Label(metrics_frame, text="승률:").grid(row=1, column=2, sticky="w", padx=5)
        ttk.Label(metrics_frame, textvariable=self.metrics['win_rate'], font=("Arial", 14, "bold")).grid(row=1, column=3, padx=5)
        
        # 시장 정보 프레임
        market_frame = ttk.LabelFrame(self.dashboard_tab, text="시장 정보", padding="10")
        market_frame.grid(row=1, column=0, columnspan=4, sticky="ew", padx=10, pady=5)
        
        self.market_info = {
            'btc_price': tk.StringVar(value="₩0"),
            'eth_price': tk.StringVar(value="₩0"),
            'dominance': tk.StringVar(value="0%"),
            'fear_greed': tk.StringVar(value="50")
        }
        
        ttk.Label(market_frame, text="BTC:").grid(row=0, column=0, sticky="w", padx=5)
        ttk.Label(market_frame, textvariable=self.market_info['btc_price']).grid(row=0, column=1, padx=5)
        
        ttk.Label(market_frame, text="ETH:").grid(row=0, column=2, sticky="w", padx=5)
        ttk.Label(market_frame, textvariable=self.market_info['eth_price']).grid(row=0, column=3, padx=5)
        
        ttk.Label(market_frame, text="BTC 도미넌스:").grid(row=1, column=0, sticky="w", padx=5)
        ttk.Label(market_frame, textvariable=self.market_info['dominance']).grid(row=1, column=1, padx=5)
        
        ttk.Label(market_frame, text="Fear & Greed:").grid(row=1, column=2, sticky="w", padx=5)
        ttk.Label(market_frame, textvariable=self.market_info['fear_greed']).grid(row=1, column=3, padx=5)
        
        # 최근 거래 프레임
        trade_frame = ttk.LabelFrame(self.dashboard_tab, text="최근 거래", padding="10")
        trade_frame.grid(row=2, column=0, columnspan=4, sticky="nsew", padx=10, pady=5)
        
        # 트리뷰 (테이블)
        columns = ('시간', '코인', '종류', '수량', '가격', '전략')
        self.trade_tree = ttk.Treeview(trade_frame, columns=columns, show='headings', height=8)
        
        for col in columns:
            self.trade_tree.heading(col, text=col)
            self.trade_tree.column(col, width=100)
            
        self.trade_tree.pack(fill=tk.BOTH, expand=True)
        
        # 스크롤바
        scrollbar = ttk.Scrollbar(trade_frame, orient="vertical", command=self.trade_tree.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.trade_tree.configure(yscrollcommand=scrollbar.set)
        
    def create_portfolio_tab(self):
        # 포트폴리오 구성
        portfolio_frame = ttk.LabelFrame(self.portfolio_tab, text="포트폴리오 구성", padding="10")
        portfolio_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        columns = ('코인', '수량', '평가금액', '비중(%)', '수익률')
        self.portfolio_tree = ttk.Treeview(portfolio_frame, columns=columns, show='headings', height=10)
        
        for col in columns:
            self.portfolio_tree.heading(col, text=col)
            self.portfolio_tree.column(col, width=120)
            
        self.portfolio_tree.pack(fill=tk.BOTH, expand=True)
        
        # DCA 정보
        dca_frame = ttk.LabelFrame(self.portfolio_tab, text="DCA 설정", padding="10")
        dca_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.dca_info = tk.StringVar(value="DCA 상태: 활성화\n투자 주기: 7일\n회당 금액: ₩300,000")
        ttk.Label(dca_frame, textvariable=self.dca_info).pack(anchor=tk.W)
        
    def create_settings_tab(self):
        # 모드 설정
        mode_frame = ttk.LabelFrame(self.settings_tab, text="실행 모드", padding="10")
        mode_frame.grid(row=0, column=0, sticky="ew", padx=10, pady=5)
        
        self.mode_var = tk.StringVar(value="PAPER")
        ttk.Radiobutton(mode_frame, text="모의투자", variable=self.mode_var, value="PAPER").pack(anchor=tk.W)
        ttk.Radiobutton(mode_frame, text="백테스트", variable=self.mode_var, value="BACKTEST").pack(anchor=tk.W)
        ttk.Radiobutton(mode_frame, text="실전투자", variable=self.mode_var, value="REAL").pack(anchor=tk.W)
        
        # 자본금 설정
        capital_frame = ttk.LabelFrame(self.settings_tab, text="자본금 설정", padding="10")
        capital_frame.grid(row=1, column=0, sticky="ew", padx=10, pady=5)
        
        ttk.Label(capital_frame, text="초기 자본금:").pack(anchor=tk.W)
        self.capital_entry = ttk.Entry(capital_frame, width=20)
        self.capital_entry.insert(0, "10000000")
        self.capital_entry.pack(anchor=tk.W, pady=5)
        
        # DCA 설정
        dca_frame = ttk.LabelFrame(self.settings_tab, text="DCA 설정", padding="10")
        dca_frame.grid(row=2, column=0, sticky="ew", padx=10, pady=5)
        
        self.dca_enabled = tk.BooleanVar(value=True)
        ttk.Checkbutton(dca_frame, text="DCA 활성화", variable=self.dca_enabled).pack(anchor=tk.W)
        
        ttk.Label(dca_frame, text="투자 금액:").pack(anchor=tk.W)
        self.dca_amount_entry = ttk.Entry(dca_frame, width=20)
        self.dca_amount_entry.insert(0, "300000")
        self.dca_amount_entry.pack(anchor=tk.W, pady=5)
        
        # 저장 버튼
        ttk.Button(self.settings_tab, text="설정 저장", command=self.save_settings).grid(row=3, column=0, pady=20)
        
    def create_log_tab(self):
        # 로그 텍스트 위젯
        self.log_text = scrolledtext.ScrolledText(self.log_tab, wrap=tk.WORD, height=20)
        self.log_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # 로그 컨트롤
        log_control_frame = ttk.Frame(self.log_tab)
        log_control_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Button(log_control_frame, text="로그 지우기", command=self.clear_log).pack(side=tk.LEFT, padx=5)
        ttk.Button(log_control_frame, text="로그 저장", command=self.save_log).pack(side=tk.LEFT, padx=5)
        
    def start_bot(self):
        """봇 시작"""
        try:
            self.is_running = True
            self.status_label.config(text="🟢 실행 중", foreground="green")
            self.start_btn.config(state="disabled")
            self.stop_btn.config(state="normal")
            
            # 봇 초기화
            mode = self.mode_var.get()
            capital = int(self.capital_entry.get())
            
            if mode == "PAPER":
                self.bot = PuzzleTradingBot(initial_capital=capital, enable_paper_trading=True)
                self.add_log("✅ 모의투자 모드로 봇 시작")
            else:
                self.add_log("⚠️ 현재 모의투자 모드만 지원됩니다")
                
            # 백그라운드 스레드에서 봇 실행
            self.bot_thread = threading.Thread(target=self.run_bot_loop, daemon=True)
            self.bot_thread.start()
            
        except Exception as e:
            messagebox.showerror("오류", f"봇 시작 실패: {e}")
            self.add_log(f"❌ 오류: {e}")
            
    def stop_bot(self):
        """봇 정지"""
        self.is_running = False
        self.status_label.config(text="🔴 정지", foreground="red")
        self.start_btn.config(state="normal")
        self.stop_btn.config(state="disabled")
        self.add_log("⏹️ 봇 정지")
        
    def test_connection(self):
        """연결 테스트"""
        try:
            # 업비트 API 테스트
            ticker = self.upbit.get_ticker(['KRW-BTC'])
            if ticker:
                btc_price = ticker[0]['trade_price']
                self.add_log(f"✅ 업비트 연결 성공 - BTC: ₩{btc_price:,.0f}")
                messagebox.showinfo("성공", f"연결 테스트 성공!\nBTC 가격: ₩{btc_price:,.0f}")
            else:
                self.add_log("❌ 업비트 연결 실패")
                messagebox.showerror("실패", "업비트 연결 실패")
        except Exception as e:
            self.add_log(f"❌ 테스트 실패: {e}")
            messagebox.showerror("오류", f"테스트 실패: {e}")
            
    def run_bot_loop(self):
        """봇 실행 루프"""
        while self.is_running:
            try:
                # 시장 데이터 업데이트
                self.update_market_data()
                
                # 신호 체크
                if self.bot:
                    signal = self.bot.check_dca_signal()
                    if signal:
                        self.add_log(f"📊 신호 감지: {signal.coin} {signal.action}")
                        success = self.bot.execute_signal(signal)
                        if success:
                            self.add_log(f"✅ 거래 실행: {signal.coin}")
                            self.update_trades()
                            
                time.sleep(60)  # 1분마다 체크
                
            except Exception as e:
                self.add_log(f"❌ 봇 루프 오류: {e}")
                time.sleep(10)
                
    def update_market_data(self):
        """시장 데이터 업데이트"""
        try:
            # BTC, ETH 가격 업데이트
            tickers = self.upbit.get_ticker(['KRW-BTC', 'KRW-ETH'])
            if tickers:
                btc_price = tickers[0]['trade_price']
                self.market_info['btc_price'].set(f"₩{btc_price:,.0f}")
                
                if len(tickers) > 1:
                    eth_price = tickers[1]['trade_price']
                    self.market_info['eth_price'].set(f"₩{eth_price:,.0f}")
                    
        except Exception as e:
            print(f"Market data update error: {e}")
            
    def update_trades(self):
        """거래 내역 업데이트"""
        if self.bot:
            # 더미 데이터 추가 (실제로는 봇에서 가져옴)
            trade_time = datetime.now().strftime("%H:%M:%S")
            self.trade_tree.insert('', 0, values=(
                trade_time, "BTC", "매수", "0.001", "₩95,000,000", "DCA"
            ))
            
    def update_display(self):
        """디스플레이 업데이트"""
        # 시간 업데이트
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.time_label.config(text=current_time)
        
        # 포트폴리오 업데이트
        if self.bot:
            try:
                summary = self.bot.get_portfolio_summary()
                self.metrics['total_asset'].set(f"₩{summary['total_value']:,.0f}")
                self.metrics['profit_rate'].set(f"{summary['profit_rate']:.2f}%")
                self.metrics['trade_count'].set(str(summary['trade_count']))
            except:
                pass
                
        # 1초 후 다시 실행
        self.root.after(1000, self.update_display)
        
    def add_log(self, message):
        """로그 추가"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}\n"
        self.log_text.insert(tk.END, log_message)
        self.log_text.see(tk.END)
        
    def clear_log(self):
        """로그 지우기"""
        self.log_text.delete(1.0, tk.END)
        
    def save_log(self):
        """로그 저장"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"bot_log_{timestamp}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(self.log_text.get(1.0, tk.END))
            messagebox.showinfo("성공", f"로그가 {filename}에 저장되었습니다")
        except Exception as e:
            messagebox.showerror("오류", f"로그 저장 실패: {e}")
            
    def save_settings(self):
        """설정 저장"""
        try:
            settings = {
                'mode': self.mode_var.get(),
                'capital': self.capital_entry.get(),
                'dca_enabled': self.dca_enabled.get(),
                'dca_amount': self.dca_amount_entry.get()
            }
            with open('bot_settings.json', 'w') as f:
                json.dump(settings, f, indent=2)
            messagebox.showinfo("성공", "설정이 저장되었습니다")
            self.add_log("✅ 설정 저장 완료")
        except Exception as e:
            messagebox.showerror("오류", f"설정 저장 실패: {e}")

def main():
    root = tk.Tk()
    app = TradingBotGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()