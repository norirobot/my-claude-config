"""
실시간 암호화폐 시장 모니터링 & 알림 시스템
- 업비트 실시간 WebSocket 연동
- 사용자 설정 기반 알림
- 텔레그램/이메일/윈도우 알림 지원
"""

import asyncio
import websockets
import json
import time
from datetime import datetime, timedelta
import threading
import tkinter as tk
from tkinter import ttk, messagebox
import requests
import winsound
# import smtplib
# from email.mime.text import MimeText
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RealTimeMonitor:
    def __init__(self):
        self.ws = None
        self.is_running = False
        self.price_data = {}
        self.alerts = []
        self.last_prices = {}
        
        # 알림 설정
        self.notification_settings = {
            'sound': True,
            'popup': True,
            'telegram': False,
            'email': False,
            'telegram_bot_token': '',
            'telegram_chat_id': '',
            'email_smtp': 'smtp.gmail.com',
            'email_port': 587,
            'email_user': '',
            'email_pass': '',
            'email_to': ''
        }
        
    async def connect_websocket(self):
        """업비트 WebSocket 연결"""
        uri = "wss://api.upbit.com/websocket/v1"
        
        # 구독할 코인 목록
        subscribe_data = [
            {"ticket": "test"},
            {
                "type": "ticker",
                "codes": [
                    "KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-ADA", "KRW-DOT",
                    "KRW-LINK", "KRW-LTC", "KRW-BCH", "KRW-SOL", "KRW-AVAX",
                    "KRW-MATIC", "KRW-ATOM", "KRW-NEAR", "KRW-ALGO", "KRW-VET",
                    "KRW-FLOW", "KRW-SAND", "KRW-MANA", "KRW-CRO", "KRW-SHIB"
                ],
                "isOnlySnapshot": False,
                "isOnlyRealtime": True
            },
            {"format": "SIMPLE"}
        ]
        
        try:
            async with websockets.connect(uri) as websocket:
                self.ws = websocket
                await websocket.send(json.dumps(subscribe_data))
                logger.info("✅ 업비트 WebSocket 연결 성공")
                
                async for message in websocket:
                    if not self.is_running:
                        break
                        
                    try:
                        # 바이너리 데이터를 JSON으로 변환
                        data = json.loads(message.decode('utf-8'))
                        await self.process_ticker_data(data)
                    except Exception as e:
                        logger.error(f"데이터 처리 오류: {e}")
                        
        except Exception as e:
            logger.error(f"WebSocket 연결 오류: {e}")
            
    async def process_ticker_data(self, data):
        """티커 데이터 처리 및 알림 체크"""
        if data.get('type') != 'ticker':
            return
            
        code = data.get('code', '')
        current_price = data.get('trade_price', 0)
        prev_closing_price = data.get('prev_closing_price', 0)
        change_rate = data.get('signed_change_rate', 0) * 100
        
        # 가격 정보 저장
        self.price_data[code] = {
            'price': current_price,
            'prev_price': prev_closing_price,
            'change_rate': change_rate,
            'timestamp': datetime.now(),
            'volume': data.get('acc_trade_volume_24h', 0),
            'high': data.get('high_price', 0),
            'low': data.get('low_price', 0)
        }
        
        # 알림 체크
        await self.check_alerts(code, current_price, change_rate)
        
    async def check_alerts(self, code, price, change_rate):
        """알림 조건 체크"""
        for alert in self.alerts:
            if not alert['enabled']:
                continue
                
            coin = alert['coin']
            if coin != 'ALL' and coin != code:
                continue
                
            condition_met = False
            message = ""
            
            # 가격 기반 알림
            if alert['type'] == 'price_above' and price >= alert['value']:
                condition_met = True
                message = f"🚀 {code} 가격이 {alert['value']:,}원을 돌파했습니다! 현재: {price:,}원"
                
            elif alert['type'] == 'price_below' and price <= alert['value']:
                condition_met = True
                message = f"⚠️ {code} 가격이 {alert['value']:,}원 아래로 떨어졌습니다! 현재: {price:,}원"
                
            # 변동률 기반 알림
            elif alert['type'] == 'change_above' and change_rate >= alert['value']:
                condition_met = True
                message = f"📈 {code} 변동률이 +{alert['value']:.1f}%를 돌파했습니다! 현재: {change_rate:+.2f}%"
                
            elif alert['type'] == 'change_below' and change_rate <= alert['value']:
                condition_met = True
                message = f"📉 {code} 변동률이 {alert['value']:.1f}% 아래로 떨어졌습니다! 현재: {change_rate:+.2f}%"
                
            # 급등/급락 감지
            elif alert['type'] == 'spike' and abs(change_rate) >= alert['value']:
                direction = "급등" if change_rate > 0 else "급락"
                condition_met = True
                message = f"⚡ {code} {direction} 감지! 변동률: {change_rate:+.2f}%"
                
            if condition_met:
                # 중복 알림 방지 (5분 쿨타임)
                now = datetime.now()
                last_alert = alert.get('last_triggered', datetime.min)
                if (now - last_alert).total_seconds() < 300:  # 5분
                    continue
                    
                alert['last_triggered'] = now
                await self.send_notification(message)
                logger.info(f"🔔 알림 발송: {message}")
                
    async def send_notification(self, message):
        """알림 발송"""
        # 윈도우 팝업
        if self.notification_settings['popup']:
            threading.Thread(target=lambda: messagebox.showinfo("코인 알림", message), daemon=True).start()
            
        # 사운드 알림
        if self.notification_settings['sound']:
            threading.Thread(target=lambda: winsound.Beep(1000, 500), daemon=True).start()
            
        # 텔레그램 알림
        if self.notification_settings['telegram'] and self.notification_settings['telegram_bot_token']:
            threading.Thread(target=self.send_telegram, args=(message,), daemon=True).start()
            
        # 이메일 알림
        if self.notification_settings['email'] and self.notification_settings['email_user']:
            threading.Thread(target=self.send_email, args=(message,), daemon=True).start()
            
    def send_telegram(self, message):
        """텔레그램 메시지 전송"""
        try:
            url = f"https://api.telegram.org/bot{self.notification_settings['telegram_bot_token']}/sendMessage"
            data = {
                'chat_id': self.notification_settings['telegram_chat_id'],
                'text': message
            }
            requests.post(url, data=data, timeout=5)
        except Exception as e:
            logger.error(f"텔레그램 전송 실패: {e}")
            
    def send_email(self, message):
        """이메일 전송"""
        logger.info("이메일 기능은 현재 비활성화되어 있습니다.")
            
    def add_alert(self, alert_config):
        """알림 조건 추가"""
        alert_config['id'] = len(self.alerts)
        alert_config['enabled'] = True
        alert_config['created'] = datetime.now()
        self.alerts.append(alert_config)
        logger.info(f"알림 추가: {alert_config}")
        
    def start_monitoring(self):
        """모니터링 시작"""
        self.is_running = True
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.connect_websocket())
        
    def stop_monitoring(self):
        """모니터링 중지"""
        self.is_running = False
        logger.info("모니터링 중지 요청")
        
        # WebSocket 연결 강제 종료
        if self.ws:
            try:
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(self.ws.close())
                loop.close()
            except:
                pass

class MonitorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🚀 실시간 암호화폐 모니터 & 알림")
        self.root.geometry("1400x800")
        
        self.monitor = RealTimeMonitor()
        self.monitor_thread = None
        
        self.create_widgets()
        self.update_display()
        
    def create_widgets(self):
        # 메인 프레임
        main_frame = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 왼쪽: 실시간 가격 표시
        left_frame = ttk.Frame(main_frame)
        main_frame.add(left_frame, weight=2)
        
        # 실시간 가격 테이블
        price_frame = ttk.LabelFrame(left_frame, text="📊 실시간 가격", padding="10")
        price_frame.pack(fill=tk.BOTH, expand=True)
        
        columns = ('코인', '현재가', '변동률', '24h최고', '24h최저', '거래량')
        self.price_tree = ttk.Treeview(price_frame, columns=columns, show='headings', height=20)
        
        for col in columns:
            self.price_tree.heading(col, text=col)
            self.price_tree.column(col, width=100)
            
        scrollbar_price = ttk.Scrollbar(price_frame, orient="vertical", command=self.price_tree.yview)
        scrollbar_price.pack(side=tk.RIGHT, fill=tk.Y)
        self.price_tree.configure(yscrollcommand=scrollbar_price.set)
        self.price_tree.pack(fill=tk.BOTH, expand=True)
        
        # 오른쪽: 알림 설정
        right_frame = ttk.Frame(main_frame)
        main_frame.add(right_frame, weight=1)
        
        # 컨트롤 패널
        control_frame = ttk.LabelFrame(right_frame, text="⚙️ 제어판", padding="10")
        control_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.start_btn = ttk.Button(control_frame, text="📡 모니터링 시작", command=self.start_monitoring, width=20)
        self.start_btn.pack(pady=5)
        
        self.stop_btn = ttk.Button(control_frame, text="⏹️ 모니터링 중지", command=self.stop_monitoring, width=20, state="disabled")
        self.stop_btn.pack(pady=5)
        
        # 알림 추가 패널
        alert_frame = ttk.LabelFrame(right_frame, text="🔔 알림 설정", padding="10")
        alert_frame.pack(fill=tk.BOTH, expand=True)
        
        # 코인 선택
        ttk.Label(alert_frame, text="코인:").grid(row=0, column=0, sticky="w", pady=2)
        self.coin_combo = ttk.Combobox(alert_frame, values=["KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-ADA", "ALL"], width=15)
        self.coin_combo.set("KRW-BTC")
        self.coin_combo.grid(row=0, column=1, pady=2, padx=5)
        
        # 알림 유형
        ttk.Label(alert_frame, text="조건:").grid(row=1, column=0, sticky="w", pady=2)
        self.alert_type_combo = ttk.Combobox(alert_frame, values=[
            "가격이 오를 때", "가격이 내릴 때", "상승률 %이상", "하락률 %이하", "급등급락 감지"
        ], width=15)
        self.alert_type_combo.set("가격이 오를 때")
        self.alert_type_combo.grid(row=1, column=1, pady=2, padx=5)
        
        # 값 입력
        ttk.Label(alert_frame, text="값:").grid(row=2, column=0, sticky="w", pady=2)
        self.value_entry = ttk.Entry(alert_frame, width=18)
        self.value_entry.grid(row=2, column=1, pady=2, padx=5)
        
        # 도움말 라벨
        help_text = tk.StringVar(value="예: BTC 150000000 (1억5천만원)")
        self.help_label = ttk.Label(alert_frame, textvariable=help_text, font=("Arial", 8), foreground="gray")
        self.help_label.grid(row=2, column=2, sticky="w", padx=5)
        
        # 콤보박스 변경시 도움말 업데이트
        def update_help(*args):
            selected = self.alert_type_combo.get()
            if "가격" in selected:
                help_text.set("예: 150000000 (1억5천만원)")
            elif "%" in selected:
                help_text.set("예: 5 (5%)")
            elif "급등급락" in selected:
                help_text.set("예: 10 (10% 변동시)")
                
        self.alert_type_combo.bind('<<ComboboxSelected>>', update_help)
        
        # 알림 추가 버튼
        ttk.Button(alert_frame, text="➕ 알림 추가", command=self.add_alert).grid(row=3, column=0, columnspan=2, pady=10)
        
        # 현재 알림 목록
        ttk.Label(alert_frame, text="현재 알림:").grid(row=4, column=0, columnspan=2, sticky="w", pady=(10, 5))
        
        self.alert_listbox = tk.Listbox(alert_frame, height=8)
        self.alert_listbox.grid(row=5, column=0, columnspan=2, pady=5, sticky="ew")
        
        # 알림 삭제 버튼
        ttk.Button(alert_frame, text="🗑️ 선택 삭제", command=self.delete_alert).grid(row=6, column=0, columnspan=2, pady=5)
        
        # 알림 설정
        settings_frame = ttk.LabelFrame(right_frame, text="📢 알림 방법", padding="10")
        settings_frame.pack(fill=tk.X, pady=(10, 0))
        
        self.sound_var = tk.BooleanVar(value=True)
        self.popup_var = tk.BooleanVar(value=True)
        
        ttk.Checkbutton(settings_frame, text="사운드 알림", variable=self.sound_var).pack(anchor="w")
        ttk.Checkbutton(settings_frame, text="팝업 알림", variable=self.popup_var).pack(anchor="w")
        
        ttk.Button(settings_frame, text="고급 설정", command=self.open_advanced_settings).pack(pady=5)
        
    def start_monitoring(self):
        """모니터링 시작"""
        if not self.monitor_thread or not self.monitor_thread.is_alive():
            self.monitor_thread = threading.Thread(target=self.monitor.start_monitoring, daemon=True)
            self.monitor_thread.start()
            
            self.start_btn.config(state="disabled")
            self.stop_btn.config(state="normal")
            
            messagebox.showinfo("시작", "실시간 모니터링을 시작합니다!")
            
    def stop_monitoring(self):
        """모니터링 중지"""
        self.monitor.stop_monitoring()
        self.start_btn.config(state="normal")
        self.stop_btn.config(state="disabled")
        messagebox.showinfo("중지", "모니터링을 중지했습니다.")
        
    def add_alert(self):
        """알림 추가"""
        try:
            coin = self.coin_combo.get()
            alert_type_korean = self.alert_type_combo.get()
            value = float(self.value_entry.get())
            
            # 한글을 영어로 변환
            type_mapping = {
                "가격이 오를 때": "price_above",
                "가격이 내릴 때": "price_below", 
                "상승률 %이상": "change_above",
                "하락률 %이하": "change_below",
                "급등급락 감지": "spike"
            }
            
            alert_type = type_mapping.get(alert_type_korean, "price_above")
            
            alert_config = {
                'coin': coin,
                'type': alert_type,
                'value': value
            }
            
            self.monitor.add_alert(alert_config)
            
            # 리스트박스에 한글로 추가
            coin_name = coin.replace('KRW-', '') if coin != 'ALL' else '모든코인'
            if alert_type == "price_above":
                alert_text = f"{coin_name} - {value:,.0f}원 이상일 때"
            elif alert_type == "price_below":
                alert_text = f"{coin_name} - {value:,.0f}원 이하일 때"
            elif alert_type == "change_above":
                alert_text = f"{coin_name} - +{value:.1f}% 이상 상승시"
            elif alert_type == "change_below":
                alert_text = f"{coin_name} - {value:.1f}% 이상 하락시"
            elif alert_type == "spike":
                alert_text = f"{coin_name} - {value:.1f}% 급등급락시"
                
            self.alert_listbox.insert(tk.END, alert_text)
            
            # 입력 필드 초기화
            self.value_entry.delete(0, tk.END)
            
            messagebox.showinfo("성공", "알림이 추가되었습니다!")
            
        except ValueError:
            messagebox.showerror("오류", "올바른 숫자를 입력해주세요.")
            
    def delete_alert(self):
        """선택된 알림 삭제"""
        selection = self.alert_listbox.curselection()
        if selection:
            index = selection[0]
            self.alert_listbox.delete(index)
            if index < len(self.monitor.alerts):
                self.monitor.alerts[index]['enabled'] = False
            messagebox.showinfo("삭제", "알림이 삭제되었습니다.")
        else:
            messagebox.showwarning("선택", "삭제할 알림을 선택해주세요.")
            
    def open_advanced_settings(self):
        """고급 설정 창 열기"""
        settings_window = tk.Toplevel(self.root)
        settings_window.title("고급 알림 설정")
        settings_window.geometry("600x500")
        
        # 설명 프레임
        explanation_frame = ttk.LabelFrame(settings_window, text="📱 텔레그램 알림이란?", padding="10")
        explanation_frame.pack(fill=tk.X, padx=10, pady=10)
        
        explanation_text = """
🤖 텔레그램 알림: 스마트폰 텔레그램 앱으로 실시간 코인 알림을 받는 기능
📲 어디에 있든 즉시 알림을 받을 수 있어 매우 유용합니다!

⚙️ 설정 방법:
1️⃣ 텔레그램에서 @BotFather 검색
2️⃣ /newbot 명령어로 봇 생성
3️⃣ 봇 토큰 복사 (예: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)
4️⃣ @userinfobot에게 /start 보내서 Chat ID 확인
5️⃣ 아래에 입력 후 저장

✅ 설정 완료 후 코인 알림이 텔레그램으로 전송됩니다!
        """
        
        ttk.Label(explanation_frame, text=explanation_text, wraplength=550, justify=tk.LEFT).pack()
        
        # 텔레그램 설정
        telegram_frame = ttk.LabelFrame(settings_window, text="🔧 텔레그램 설정", padding="10")
        telegram_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(telegram_frame, text="봇 토큰 (Bot Token):").pack(anchor="w", pady=2)
        telegram_token_entry = ttk.Entry(telegram_frame, width=70)
        telegram_token_entry.pack(padx=5, pady=5)
        telegram_token_entry.insert(0, self.monitor.notification_settings.get('telegram_bot_token', ''))
        
        ttk.Label(telegram_frame, text="채팅 ID (Chat ID):").pack(anchor="w", pady=2)
        telegram_chat_entry = ttk.Entry(telegram_frame, width=70)
        telegram_chat_entry.pack(padx=5, pady=5)
        telegram_chat_entry.insert(0, self.monitor.notification_settings.get('telegram_chat_id', ''))
        
        # 텔레그램 활성화 체크박스
        telegram_enabled_var = tk.BooleanVar(value=self.monitor.notification_settings.get('telegram', False))
        ttk.Checkbutton(telegram_frame, text="✅ 텔레그램 알림 활성화", variable=telegram_enabled_var).pack(pady=10)
        
        # 테스트 버튼
        def test_telegram():
            token = telegram_token_entry.get()
            chat_id = telegram_chat_entry.get()
            if token and chat_id:
                try:
                    import requests
                    url = f"https://api.telegram.org/bot{token}/sendMessage"
                    data = {'chat_id': chat_id, 'text': '🤖 테스트: 텔레그램 연결 성공!'}
                    response = requests.post(url, data=data, timeout=5)
                    if response.status_code == 200:
                        messagebox.showinfo("성공", "✅ 텔레그램 연결 성공!\n테스트 메시지를 확인해보세요.")
                    else:
                        messagebox.showerror("실패", "❌ 연결 실패\n토큰이나 채팅 ID를 확인해주세요.")
                except Exception as e:
                    messagebox.showerror("오류", f"연결 테스트 실패: {e}")
            else:
                messagebox.showwarning("입력", "봇 토큰과 채팅 ID를 모두 입력해주세요.")
        
        ttk.Button(telegram_frame, text="📤 연결 테스트", command=test_telegram).pack(pady=5)
        
        # 저장 버튼
        def save_settings():
            self.monitor.notification_settings['telegram_bot_token'] = telegram_token_entry.get()
            self.monitor.notification_settings['telegram_chat_id'] = telegram_chat_entry.get()
            self.monitor.notification_settings['telegram'] = telegram_enabled_var.get()
            messagebox.showinfo("저장", "✅ 설정이 저장되었습니다!")
            settings_window.destroy()
            
        ttk.Button(settings_window, text="💾 설정 저장", command=save_settings).pack(pady=20)
        
    def update_display(self):
        """화면 업데이트"""
        # 가격 데이터 업데이트
        for item in self.price_tree.get_children():
            self.price_tree.delete(item)
            
        for code, data in self.monitor.price_data.items():
            price = data['price']
            change_rate = data['change_rate']
            high = data['high']
            low = data['low']
            volume = data['volume']
            
            # 색상 설정 (상승: 빨강, 하락: 파랑)
            tag = 'up' if change_rate > 0 else 'down' if change_rate < 0 else 'same'
            
            self.price_tree.insert('', 'end', values=(
                code.replace('KRW-', ''),
                f"₩{price:,.0f}",
                f"{change_rate:+.2f}%",
                f"₩{high:,.0f}",
                f"₩{low:,.0f}",
                f"{volume:,.0f}"
            ), tags=(tag,))
            
        # 색상 태그 설정
        self.price_tree.tag_configure('up', foreground='red')
        self.price_tree.tag_configure('down', foreground='blue')
        self.price_tree.tag_configure('same', foreground='black')
        
        # 알림 설정 업데이트
        self.monitor.notification_settings['sound'] = self.sound_var.get()
        self.monitor.notification_settings['popup'] = self.popup_var.get()
        
        # 1초 후 다시 업데이트
        self.root.after(1000, self.update_display)

def main():
    root = tk.Tk()
    app = MonitorGUI(root)
    
    def on_closing():
        """창 닫기 이벤트 처리"""
        try:
            app.monitor.stop_monitoring()
            # 모든 백그라운드 스레드 강제 종료
            import threading
            for thread in threading.enumerate():
                if thread.name != 'MainThread' and thread.is_alive():
                    thread._stop()
        except:
            pass
        finally:
            root.quit()  # mainloop 종료
            root.destroy()  # 창 파괴
            import os
            os._exit(0)  # 프로세스 강제 종료
        
    root.protocol("WM_DELETE_WINDOW", on_closing)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        on_closing()

if __name__ == "__main__":
    main()