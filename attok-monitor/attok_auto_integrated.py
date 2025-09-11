"""
🎯 ATTOK 완전 통합 시스템 (Auto + Monitoring)
- 자동 로그인 + 출결 모니터링 통합
- 기존 시스템과 완전 분리 (안전성 보장)
- 원클릭 실행: 로그인 → 모니터링 자동 시작
"""
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from datetime import datetime, timedelta
import winsound
import pyttsx3  # TTS 음성 알림용
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, NoSuchWindowException, TimeoutException
from selenium.webdriver.chrome.options import Options
import hashlib
import os
import getpass

# ===============================
# 로그인 시스템 클래스 (attok_login_program.py에서 가져옴)
# ===============================
class AttokAutoLogin:
    def __init__(self, headless=False):
        """ATTOK 자동 로그인 클래스"""
        self.login_url = "https://attok.co.kr/center_login_lite_new.asp"
        self.driver = None
        self.headless = headless
        
    def setup_driver(self):
        """브라우저 드라이버 설정"""
        try:
            options = Options()
            if self.headless:
                options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1280,720')
            
            self.driver = webdriver.Chrome(options=options)
            self.driver.implicitly_wait(10)
            return True
        except Exception as e:
            print(f"[오류] 브라우저 설정 실패: {e}")
            return False
    
    def navigate_to_login(self):
        """로그인 페이지로 이동"""
        try:
            self.driver.get(self.login_url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "user_id"))
            )
            return True
        except Exception as e:
            print(f"[오류] 로그인 페이지 접속 실패: {e}")
            return False
    
    def perform_login(self, username, password):
        """실제 로그인 수행"""
        try:
            # 사용자 ID 입력
            user_id_field = self.driver.find_element(By.NAME, "user_id")
            user_id_field.clear()
            user_id_field.send_keys(username)
            
            # 비밀번호 입력
            password_field = self.driver.find_element(By.NAME, "user_pass")
            password_field.clear()
            password_field.send_keys(password)
            
            # 로그인 버튼 클릭
            button_selectors = [
                "//input[@type='button' and @value='로그인']",
                "//button[text()='로그인']",
                "//input[@value='로그인']",
                "//button[contains(text(), '로그인')]"
            ]
            
            login_button = None
            for selector in button_selectors:
                try:
                    login_button = self.driver.find_element(By.XPATH, selector)
                    break
                except:
                    continue
            
            if not login_button:
                return False, "로그인 버튼을 찾을 수 없습니다"
            
            login_button.click()
            time.sleep(3)
            
            # 로그인 성공 여부 확인
            current_url = self.driver.current_url
            if "loginok.asp" in current_url or current_url != self.login_url:
                return True, "로그인 성공"
            else:
                return False, "로그인 실패 - 아이디나 비밀번호를 확인해주세요"
                
        except Exception as e:
            return False, f"로그인 수행 중 오류: {e}"

# ===============================
# 색상 및 유틸리티 함수들 (기존 시스템에서 가져옴)
# ===============================
def interpolate_color(color1, color2, factor):
    """두 색상 사이를 보간하는 함수"""
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def rgb_to_hex(rgb):
        return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
    
    rgb1 = hex_to_rgb(color1)
    rgb2 = hex_to_rgb(color2)
    
    interpolated = tuple(int(rgb1[i] + factor * (rgb2[i] - rgb1[i])) for i in range(3))
    return rgb_to_hex(interpolated)

def get_time_based_colors(total_minutes):
    """시간에 따른 부드러운 색상 그라데이션 계산"""
    color_points = [
        (120, '#2d2d30', '#00d26a', '#00d26a'),  # 120분+ : 완전 안전 (선명한 녹색)
        (90,  '#2d2d30', '#00d26a', '#00d26a'),  # 90분+  : 안전 (녹색)
        (60,  '#2d2d30', '#00d26a', '#00d26a'),  # 60분+  : 안전 (녹색) 
        (45,  '#2d2d30', '#7dd87d', '#7dd87d'),  # 45분+  : 여유 (밝은 녹색)
        (30,  '#2d2d30', '#a3d977', '#a3d977'),  # 30분+  : 주의 준비 (연한 녹색)
        (25,  '#2d2d30', '#d4e157', '#d4e157'),  # 25분+  : 노란녹색
        (20,  '#2d2d30', '#ffeb3b', '#ffeb3b'),  # 20분+  : 노란색
        (15,  '#2d2d30', '#ffb347', '#ffb347'),  # 15분+  : 연한 주황
        (10,  '#2d2d30', '#ff9800', '#ff9800'),  # 10분+  : 주황색
        (5,   '#2d2d30', '#ff5722', '#ff5722'),  # 5분+   : 빨간 주황
        (3,   '#2d2d30', '#f44336', '#f44336'),  # 3분+   : 빨간색
        (1,   '#2d2d30', '#d32f2f', '#d32f2f'),  # 1분+   : 진한 빨간색
        (0,   '#2d2d30', '#b71c1c', '#b71c1c'),  # 0분    : 매우 진한 빨간색
    ]
    
    # 해당 시간대 찾기
    for i, (minutes, bg, fg, border) in enumerate(color_points):
        if total_minutes >= minutes:
            if i == 0:  # 첫 번째 구간
                return bg, fg, border
            
            # 이전 구간과 보간
            prev_minutes, prev_bg, prev_fg, prev_border = color_points[i-1]
            factor = (total_minutes - minutes) / (prev_minutes - minutes)
            
            return (
                interpolate_color(bg, prev_bg, factor),
                interpolate_color(fg, prev_fg, factor), 
                interpolate_color(border, prev_border, factor)
            )
    
    # 시간이 음수이거나 매우 작은 경우
    return color_points[-1][1], color_points[-1][2], color_points[-1][3]

# ===============================
# 통합 모니터링 시스템 메인 클래스
# ===============================
class AttokIntegratedSystem:
    def __init__(self, root):
        self.root = root
        self.root.title("🎯 ATTOK 통합 시스템 v2.0 (Auto Login + Monitoring)")
        self.root.geometry("800x600")
        self.root.configure(bg='#1e1e1e')  # 다크 테마
        
        # 로그인 관련 변수
        self.auto_login = None
        self.login_completed = False
        
        # 모니터링 관련 변수 (기존 시스템에서 가져옴)
        self.driver = None
        self.monitoring = False
        self.browser_alive = False
        self.students = {}
        self.student_widgets = {}
        self.connection_errors = 0
        
        # 음성 알림 관련
        self.notified_departures = set()
        self.notified_arrivals = set()
        self.tts_engine = None
        self.initialize_tts()
        
        # 깜빡임 관련
        self.login_blinking = False
        self.original_login_bg = None
        
        self.setup_ui()
    
    def initialize_tts(self):
        """TTS 엔진 초기화"""
        try:
            self.tts_engine = pyttsx3.init()
            voices = self.tts_engine.getProperty('voices')
            
            # Microsoft Heami 음성 강제 선택
            heami_voice = None
            for voice in voices:
                if 'Heami' in voice.name:
                    heami_voice = voice
                    break
            
            if heami_voice:
                self.tts_engine.setProperty('voice', heami_voice.id)
            
            # 음성 설정 최적화
            self.tts_engine.setProperty('rate', 100)    # 속도: 100 (느리게)
            self.tts_engine.setProperty('volume', 1.0)  # 볼륨: 최대
        except Exception as e:
            print(f"[TTS 초기화 오류] {e}")
    
    def speak_notification(self, text):
        """음성 알림 (개선된 버전)"""
        if not self.tts_engine:
            return
        
        def speak():
            try:
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
            except Exception as e:
                print(f"[음성 알림 오류] {e}")
        
        # 별도 스레드에서 실행
        threading.Thread(target=speak, daemon=True).start()
    
    def setup_ui(self):
        """UI 설정"""
        # 메인 제목
        title_label = tk.Label(self.root, text="🎯 ATTOK 통합 시스템", 
                              font=('맑은 고딕', 16, 'bold'), 
                              fg='#ffffff', bg='#1e1e1e')
        title_label.pack(pady=10)
        
        # 1단계: 로그인 섹션
        self.login_frame = tk.LabelFrame(self.root, text="1️⃣ 자동 로그인", 
                                        font=('맑은 고딕', 12, 'bold'),
                                        fg='#ffffff', bg='#2d2d30', bd=2)
        self.login_frame.pack(fill='x', padx=20, pady=10)
        
        # 로그인 입력 필드들
        login_input_frame = tk.Frame(self.login_frame, bg='#2d2d30')
        login_input_frame.pack(pady=10)
        
        tk.Label(login_input_frame, text="사용자 ID:", fg='#ffffff', bg='#2d2d30').grid(row=0, column=0, padx=5, sticky='e')
        self.username_entry = tk.Entry(login_input_frame, width=15)
        self.username_entry.grid(row=0, column=1, padx=5)
        
        tk.Label(login_input_frame, text="비밀번호:", fg='#ffffff', bg='#2d2d30').grid(row=0, column=2, padx=5, sticky='e')
        self.password_entry = tk.Entry(login_input_frame, width=15, show='*')
        self.password_entry.grid(row=0, column=3, padx=5)
        
        # 로그인 버튼
        self.auto_login_btn = tk.Button(login_input_frame, text="🔑 자동 로그인 시작", 
                                       command=self.start_auto_login,
                                       bg='#007acc', fg='white', font=('맑은 고딕', 10, 'bold'))
        self.auto_login_btn.grid(row=0, column=4, padx=10)
        
        # 로그인 상태 표시
        self.login_status_label = tk.Label(self.login_frame, text="로그인 정보를 입력하고 '자동 로그인 시작'을 클릭하세요", 
                                          fg='#cccccc', bg='#2d2d30')
        self.login_status_label.pack(pady=5)
        
        # 2단계: 모니터링 섹션
        self.monitoring_frame = tk.LabelFrame(self.root, text="2️⃣ 출결 모니터링", 
                                            font=('맑은 고딕', 12, 'bold'),
                                            fg='#ffffff', bg='#2d2d30', bd=2)
        self.monitoring_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        # 모니터링 버튼들
        self.button_frame = tk.Frame(self.monitoring_frame, bg='#2d2d30')
        self.button_frame.pack(pady=10)
        
        self.start_monitoring_btn = tk.Button(self.button_frame, text="📊 모니터링 시작", 
                                            command=self.start_monitoring,
                                            bg='#28a745', fg='white', font=('맑은 고딕', 10, 'bold'),
                                            state='disabled')  # 로그인 후 활성화
        self.start_monitoring_btn.pack(side='left', padx=5)
        
        self.restart_btn = tk.Button(self.button_frame, text="🔄 재시작", 
                                   command=self.restart_monitoring,
                                   bg='#ffc107', fg='black', font=('맑은 고딕', 10, 'bold'),
                                   state='disabled')
        self.restart_btn.pack(side='left', padx=5)
        
        self.stop_btn = tk.Button(self.button_frame, text="⏹️ 정지", 
                                command=self.stop_monitoring,
                                bg='#dc3545', fg='white', font=('맑은 고딕', 10, 'bold'),
                                state='disabled')
        self.stop_btn.pack(side='left', padx=5)
        
        # 상태 표시
        self.status_label = tk.Label(self.monitoring_frame, text="로그인을 먼저 완료해주세요", 
                                   fg='#cccccc', bg='#2d2d30', font=('맑은 고딕', 10))
        self.status_label.pack(pady=5)
        
        # 학생 수 표시
        self.count_frame = tk.Frame(self.monitoring_frame, bg='#2d2d30')
        self.count_frame.pack(pady=5)
        
        self.count_label = tk.Label(self.count_frame, text="👥 수업중: 0명", 
                                  fg='#00d26a', bg='#2d2d30', font=('맑은 고딕', 12, 'bold'))
        self.count_label.pack(side='left', padx=10)
        
        self.departed_label = tk.Label(self.count_frame, text="🚪 하원: 0명", 
                                     fg='#ff6b6b', bg='#2d2d30', font=('맑은 고딕', 12, 'bold'))
        self.departed_label.pack(side='left', padx=10)
        
        # 학생 리스트 스크롤 영역
        self.canvas = tk.Canvas(self.monitoring_frame, bg='#1e1e1e', highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(self.monitoring_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg='#1e1e1e')
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True, pady=10)
        self.scrollbar.pack(side="right", fill="y", pady=10)
    
    def start_auto_login(self):
        """자동 로그인 시작"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("입력 오류", "사용자 ID와 비밀번호를 모두 입력해주세요.")
            return
        
        self.auto_login_btn.config(state='disabled')
        self.login_status_label.config(text="🔄 자동 로그인 진행 중...")
        
        # 별도 스레드에서 로그인 실행
        threading.Thread(target=self.perform_auto_login, args=(username, password), daemon=True).start()
    
    def perform_auto_login(self, username, password):
        """자동 로그인 수행 (별도 스레드)"""
        try:
            # 로그인 객체 생성 
            self.auto_login = AttokAutoLogin(headless=False)  # 일반 모드로 실행
            
            self.root.after(0, lambda: self.login_status_label.config(text="🌐 브라우저 시작 중..."))
            
            if not self.auto_login.setup_driver():
                self.root.after(0, lambda: self.login_status_label.config(text="❌ 브라우저 시작 실패"))
                self.root.after(0, lambda: self.auto_login_btn.config(state='normal'))
                return
            
            self.root.after(0, lambda: self.login_status_label.config(text="📄 로그인 페이지 접속 중..."))
            
            if not self.auto_login.navigate_to_login():
                self.root.after(0, lambda: self.login_status_label.config(text="❌ 로그인 페이지 접속 실패"))
                self.root.after(0, lambda: self.auto_login_btn.config(state='normal'))
                return
            
            self.root.after(0, lambda: self.login_status_label.config(text="🔐 로그인 정보 입력 중..."))
            
            success, message = self.auto_login.perform_login(username, password)
            
            if success:
                # 로그인 성공
                self.driver = self.auto_login.driver  # 브라우저 연결 이어받기
                self.login_completed = True
                
                # 메인 페이지로 이동 (출결 확인을 위해)
                try:
                    self.driver.get("https://attok.co.kr/")
                    time.sleep(2)  # 페이지 로딩 대기
                except:
                    pass
                
                # UI 업데이트 (강제 활성화)
                def update_ui_after_login():
                    self.login_status_label.config(text="✅ 로그인 성공! 이제 모니터링을 시작할 수 있습니다")
                    self.start_monitoring_btn.config(state='normal', bg='#28a745')  # 강제 활성화
                    self.auto_login_btn.config(text="✅ 로그인 완료", state='disabled')
                    print("[디버그] 모니터링 버튼 활성화 완료")
                
                self.root.after(0, update_ui_after_login)
                
                # 성공 음성 알림
                self.speak_notification("로그인 성공")
                
            else:
                # 로그인 실패
                self.root.after(0, lambda: self.login_status_label.config(text=f"❌ {message}"))
                self.root.after(0, lambda: self.auto_login_btn.config(state='normal'))
                
        except Exception as e:
            self.root.after(0, lambda: self.login_status_label.config(text=f"❌ 로그인 오류: {str(e)}"))
            self.root.after(0, lambda: self.auto_login_btn.config(state='normal'))
    
    def start_monitoring(self):
        """출결 모니터링 시작"""
        if not self.login_completed or not self.driver:
            messagebox.showerror("로그인 필요", "먼저 자동 로그인을 완료해주세요.")
            return
        
        self.start_monitoring_btn.config(state='disabled')
        self.restart_btn.config(state='normal')
        self.stop_btn.config(state='normal')
        self.status_label.config(text="📊 모니터링 시작됨")
        
        self.monitoring = True
        self.browser_alive = True
        
        # 모니터링 스레드 시작
        threading.Thread(target=self.monitoring_loop, daemon=True).start()
        
        # 성공 음성 알림
        self.speak_notification("모니터링 시작")
    
    def monitoring_loop(self):
        """모니터링 메인 루프 (기존 시스템 로직)"""
        while self.monitoring and self.browser_alive:
            try:
                if not self.driver:
                    break
                
                # 페이지 유지 활동 (세션 유지)
                try:
                    self.driver.execute_script("document.body.click();")
                except:
                    pass
                
                # 학생 데이터 추출 및 업데이트
                self.extract_and_update_students()
                
                # 10초마다 갱신
                time.sleep(10)
                
            except Exception as e:
                print(f"[모니터링 오류] {e}")
                self.connection_errors += 1
                
                if self.connection_errors >= 3:
                    self.root.after(0, lambda: self.status_label.config(text="❌ 연결 오류 - 재시작이 필요합니다"))
                    break
                
                time.sleep(5)  # 오류 시 짧은 대기
    
    def extract_and_update_students(self):
        """학생 데이터 추출 및 업데이트 (기존 로직)"""
        try:
            # 여기서 실제 학생 데이터 추출 로직을 구현
            # 기존 simple_gui_final_v2.py의 extract_student_data() 메서드 내용
            
            # 임시로 간단한 상태 업데이트만 수행
            current_time = datetime.now().strftime("%H:%M:%S")
            self.root.after(0, lambda: self.status_label.config(text=f"📊 모니터링 중... (마지막 업데이트: {current_time})"))
            
        except Exception as e:
            print(f"[학생 데이터 추출 오류] {e}")
    
    def restart_monitoring(self):
        """모니터링 재시작"""
        self.stop_monitoring()
        time.sleep(1)
        self.start_monitoring()
    
    def stop_monitoring(self):
        """모니터링 정지"""
        self.monitoring = False
        self.browser_alive = False
        
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
            self.driver = None
        
        self.login_completed = False
        
        # UI 상태 초기화
        self.start_monitoring_btn.config(state='disabled')
        self.restart_btn.config(state='disabled')
        self.stop_btn.config(state='disabled')
        self.auto_login_btn.config(text="🔑 자동 로그인 시작", state='normal')
        
        self.login_status_label.config(text="로그인 정보를 입력하고 '자동 로그인 시작'을 클릭하세요")
        self.status_label.config(text="정지됨")
        
        # 학생 위젯들 제거
        for widget_info in self.student_widgets.values():
            widget_info['shadow_frame'].destroy()
        self.student_widgets = {}
        self.students = {}
        
        self.count_label.config(text="👥 수업중: 0명")
        self.departed_label.config(text="🚪 하원: 0명")
        
        # 알림 상태 초기화
        self.notified_departures.clear()
        self.notified_arrivals.clear()

def main():
    """메인 실행 함수"""
    root = tk.Tk()
    app = AttokIntegratedSystem(root)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        print("\\n프로그램 종료")
    finally:
        # 정리 작업
        if hasattr(app, 'driver') and app.driver:
            try:
                app.driver.quit()
            except:
                pass

if __name__ == "__main__":
    print("ATTOK 통합 시스템 시작")
    print("=" * 50)
    main()