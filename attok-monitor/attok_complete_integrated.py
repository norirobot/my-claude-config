"""
🎯 ATTOK 완전 통합 시스템 v2.0 
- 자동 로그인 + 출결 모니터링 + 음성 알림 완전 통합
- 로그인 후 자동 모니터링 시작
- 실제 학생 데이터 추출 및 음성 알림 작동
"""
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from datetime import datetime, timedelta
import winsound
import pyttsx3
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, NoSuchWindowException, TimeoutException
from selenium.webdriver.chrome.options import Options
import hashlib
import os

# ===============================
# 로그인 시스템 클래스
# ===============================
class AttokAutoLogin:
    def __init__(self, headless=False):
        self.login_url = "https://attok.co.kr/center_login_lite_new.asp"
        self.driver = None
        self.headless = headless
        
    def setup_driver(self):
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
        try:
            user_id_field = self.driver.find_element(By.NAME, "user_id")
            user_id_field.clear()
            user_id_field.send_keys(username)
            
            password_field = self.driver.find_element(By.NAME, "user_pass")
            password_field.clear()
            password_field.send_keys(password)
            
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
            
            current_url = self.driver.current_url
            if "loginok.asp" in current_url or current_url != self.login_url:
                return True, "로그인 성공"
            else:
                return False, "로그인 실패 - 아이디나 비밀번호를 확인해주세요"
                
        except Exception as e:
            return False, f"로그인 수행 중 오류: {e}"

# ===============================
# 색상 유틸리티 함수들
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
    
    for i, (minutes, bg, fg, border) in enumerate(color_points):
        if total_minutes >= minutes:
            if i == 0:
                return bg, fg, border
            
            prev_minutes, prev_bg, prev_fg, prev_border = color_points[i-1]
            factor = (total_minutes - minutes) / (prev_minutes - minutes)
            
            return (
                interpolate_color(bg, prev_bg, factor),
                interpolate_color(fg, prev_fg, factor), 
                interpolate_color(border, prev_border, factor)
            )
    
    return color_points[-1][1], color_points[-1][2], color_points[-1][3]

# ===============================
# 완전 통합 시스템 메인 클래스
# ===============================
class AttokCompleteSystem:
    def __init__(self, root):
        self.root = root
        self.root.title("ATTOK 완전 통합 시스템 v2.0 (Auto + Complete)")
        self.root.geometry("1000x700")
        self.root.configure(bg='#1e1e1e')
        
        # 로그인 관련 변수
        self.auto_login = None
        self.login_completed = False
        
        # 모니터링 관련 변수
        self.driver = None
        self.monitoring = False
        self.browser_alive = False
        self.students = {}
        self.student_widgets = {}
        self.connection_errors = 0
        self.default_class_minutes = 90
        
        # 음성 알림 관련
        self.notified_departures = set()
        self.notified_arrivals = set()
        self.tts_engine = None
        self.initialize_tts()
        
        self.setup_ui()
    
    def initialize_tts(self):
        """TTS 엔진 초기화 (개선된 버전)"""
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
            print("[TTS] 초기화 완료")
        except Exception as e:
            print(f"[TTS 초기화 오류] {e}")
    
    def speak_notification(self, text):
        """음성 알림 (완전 개선된 버전)"""
        if not self.tts_engine:
            return
        
        def speak():
            try:
                print(f"[음성 알림] {text}")
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
            except Exception as e:
                print(f"[음성 알림 오류] {e}")
        
        threading.Thread(target=speak, daemon=True).start()
    
    def setup_ui(self):
        """UI 설정"""
        # 메인 제목
        title_label = tk.Label(self.root, text="ATTOK 완전 통합 시스템 v2.0", 
                              font=('맑은 고딕', 16, 'bold'), 
                              fg='#ffffff', bg='#1e1e1e')
        title_label.pack(pady=10)
        
        # 자동 로그인 섹션
        login_frame = tk.LabelFrame(self.root, text="자동 로그인", 
                                   font=('맑은 고딕', 12, 'bold'),
                                   fg='#ffffff', bg='#2d2d30', bd=2)
        login_frame.pack(fill='x', padx=20, pady=5)
        
        # 로그인 입력 필드들
        login_input_frame = tk.Frame(login_frame, bg='#2d2d30')
        login_input_frame.pack(pady=10)
        
        tk.Label(login_input_frame, text="사용자 ID:", fg='#ffffff', bg='#2d2d30').grid(row=0, column=0, padx=5, sticky='e')
        self.username_entry = tk.Entry(login_input_frame, width=15)
        self.username_entry.grid(row=0, column=1, padx=5)
        
        tk.Label(login_input_frame, text="비밀번호:", fg='#ffffff', bg='#2d2d30').grid(row=0, column=2, padx=5, sticky='e')
        self.password_entry = tk.Entry(login_input_frame, width=15, show='*')
        self.password_entry.grid(row=0, column=3, padx=5)
        
        # 로그인 버튼
        self.auto_login_btn = tk.Button(login_input_frame, text="자동 로그인 + 모니터링 시작", 
                                       command=self.start_complete_system,
                                       bg='#007acc', fg='white', font=('맑은 고딕', 10, 'bold'))
        self.auto_login_btn.grid(row=0, column=4, padx=10)
        
        # 상태 표시
        self.status_label = tk.Label(login_frame, text="ID/비밀번호 입력 후 버튼을 클릭하세요", 
                                   fg='#cccccc', bg='#2d2d30')
        self.status_label.pack(pady=5)
        
        # 모니터링 제어 버튼들
        control_frame = tk.Frame(self.root, bg='#1e1e1e')
        control_frame.pack(fill='x', padx=20, pady=5)
        
        self.restart_btn = tk.Button(control_frame, text="재시작", 
                                   command=self.restart_monitoring,
                                   bg='#ffc107', fg='black', font=('맑은 고딕', 10, 'bold'),
                                   state='disabled')
        self.restart_btn.pack(side='left', padx=5)
        
        self.stop_btn = tk.Button(control_frame, text="정지", 
                                command=self.stop_monitoring,
                                bg='#dc3545', fg='white', font=('맑은 고딕', 10, 'bold'),
                                state='disabled')
        self.stop_btn.pack(side='left', padx=5)
        
        # 학생 수 표시
        self.count_frame = tk.Frame(self.root, bg='#1e1e1e')
        self.count_frame.pack(pady=5)
        
        self.count_label = tk.Label(self.count_frame, text="수업중: 0명", 
                                  fg='#00d26a', bg='#1e1e1e', font=('맑은 고딕', 12, 'bold'))
        self.count_label.pack(side='left', padx=10)
        
        self.departed_label = tk.Label(self.count_frame, text="하원: 0명", 
                                     fg='#ff6b6b', bg='#1e1e1e', font=('맑은 고딕', 12, 'bold'))
        self.departed_label.pack(side='left', padx=10)
        
        # 학생 리스트 스크롤 영역
        self.canvas = tk.Canvas(self.root, bg='#1e1e1e', highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(self.root, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg='#1e1e1e')
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True, pady=10, padx=(20, 0))
        self.scrollbar.pack(side="right", fill="y", pady=10, padx=(0, 20))
    
    def start_complete_system(self):
        """완전 통합 시스템 시작 (로그인 + 모니터링)"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("입력 오류", "사용자 ID와 비밀번호를 모두 입력해주세요.")
            return
        
        self.auto_login_btn.config(state='disabled')
        self.status_label.config(text="자동 로그인 + 모니터링 시작 중...")
        
        # 별도 스레드에서 전체 프로세스 실행
        threading.Thread(target=self.complete_automation, args=(username, password), daemon=True).start()
    
    def complete_automation(self, username, password):
        """완전 자동화 프로세스"""
        try:
            # 1단계: 자동 로그인
            self.root.after(0, lambda: self.status_label.config(text="1단계: 브라우저 시작 중..."))
            
            self.auto_login = AttokAutoLogin(headless=False)
            
            if not self.auto_login.setup_driver():
                self.root.after(0, lambda: self.status_label.config(text="브라우저 시작 실패"))
                self.root.after(0, lambda: self.auto_login_btn.config(state='normal'))
                return
            
            self.root.after(0, lambda: self.status_label.config(text="2단계: 로그인 페이지 접속 중..."))
            
            if not self.auto_login.navigate_to_login():
                self.root.after(0, lambda: self.status_label.config(text="로그인 페이지 접속 실패"))
                self.root.after(0, lambda: self.auto_login_btn.config(state='normal'))
                return
            
            self.root.after(0, lambda: self.status_label.config(text="3단계: 로그인 수행 중..."))
            
            success, message = self.auto_login.perform_login(username, password)
            
            if not success:
                self.root.after(0, lambda: self.status_label.config(text=f"로그인 실패: {message}"))
                self.root.after(0, lambda: self.auto_login_btn.config(state='normal'))
                return
            
            # 2단계: 메인 페이지로 이동
            self.root.after(0, lambda: self.status_label.config(text="4단계: 메인 페이지로 이동 중..."))
            
            self.driver = self.auto_login.driver
            self.driver.get("https://attok.co.kr/")
            time.sleep(3)
            
            # 3단계: 모니터링 시작
            self.root.after(0, lambda: self.status_label.config(text="5단계: 출결 모니터링 시작 중..."))
            
            self.login_completed = True
            self.monitoring = True
            self.browser_alive = True
            
            # UI 업데이트
            def update_ui_complete():
                self.status_label.config(text="완전 자동화 완료! 출결 모니터링 실행 중...")
                self.restart_btn.config(state='normal')
                self.stop_btn.config(state='normal')
                self.auto_login_btn.config(text="시스템 실행 중", state='disabled')
            
            self.root.after(0, update_ui_complete)
            
            # 음성 알림
            self.speak_notification("로그인 성공 모니터링 시작")
            
            # 4단계: 모니터링 루프 시작
            self.monitoring_loop()
            
        except Exception as e:
            self.root.after(0, lambda: self.status_label.config(text=f"시스템 오류: {str(e)}"))
            self.root.after(0, lambda: self.auto_login_btn.config(state='normal'))
    
    def monitoring_loop(self):
        """모니터링 메인 루프"""
        print("[모니터링] 루프 시작")
        
        while self.monitoring and self.browser_alive:
            try:
                if not self.driver:
                    break
                
                # 세션 유지 활동
                try:
                    self.driver.execute_script("document.body.click();")
                except:
                    pass
                
                # 학생 데이터 추출 및 업데이트
                current_students = self.get_students()
                self.process_student_data(current_students)
                
                # 10초마다 갱신
                time.sleep(10)
                
            except Exception as e:
                print(f"[모니터링 오류] {e}")
                self.connection_errors += 1
                
                if self.connection_errors >= 3:
                    self.root.after(0, lambda: self.status_label.config(text="연결 오류 - 재시작이 필요합니다"))
                    break
                
                time.sleep(5)
    
    def get_students(self):
        """학생 정보 추출 (최신 버전)"""
        result = {}
        
        try:
            if not self.driver:
                return result
                
            self.driver.current_url  # 연결 상태 테스트
            
            ul_elements = self.driver.find_elements(By.TAG_NAME, "ul")
            
            for ul in ul_elements:
                li_items = ul.find_elements(By.TAG_NAME, "li")
                
                if 70 <= len(li_items) <= 90:
                    for li in li_items:
                        strong_tags = li.find_elements(By.TAG_NAME, "strong")
                        
                        if not strong_tags or not any("배경" in s.text for s in strong_tags):
                            text = li.text.strip()
                            if text:
                                lines = text.split('\\n')
                                name = lines[0].strip()
                                
                                checked_in = False
                                checked_out = False
                                check_in_time = ""
                                check_out_time = ""
                                
                                for line in lines[1:]:
                                    if "등원" in line:
                                        if "등원 -" not in line and "등원(" in line:
                                            checked_in = True
                                            if "(" in line and ")" in line:
                                                check_in_time = line[line.index("(")+1:line.index(")")]
                                    if "하원" in line:
                                        if "하원 -" not in line and "하원(" in line:
                                            checked_out = True
                                            if "(" in line and ")" in line:
                                                check_out_time = line[line.index("(")+1:line.index(")")]
                                
                                result[name] = {
                                    'checked_in': checked_in,
                                    'checked_out': checked_out,
                                    'check_in_time': check_in_time,
                                    'check_out_time': check_out_time
                                }
                    break
        except (WebDriverException, NoSuchWindowException) as e:
            print(f"브라우저 연결 오류: {e}")
            self.browser_alive = False
        except Exception as e:
            print(f"학생 정보 추출 오류: {e}")
            
        return result
    
    def process_student_data(self, current_students):
        """학생 데이터 처리 및 UI 업데이트"""
        try:
            current_time = datetime.now()
            current_count = 0
            departed_count = 0
            
            # 학생 데이터 처리
            for name, data in current_students.items():
                if data['checked_in'] and not data['checked_out']:
                    current_count += 1
                    
                    # 새로운 등원 확인
                    if name not in self.notified_arrivals:
                        self.speak_notification(f"{name} 등원")
                        self.notified_arrivals.add(name)
                        print(f"[알림] {name} 등원")
                    
                    # 학생 위젯 업데이트/생성
                    if name not in self.student_widgets:
                        self.create_student_widget(name)
                    
                    # 남은 시간 계산
                    check_in_time = self.parse_time(data['check_in_time'])
                    if check_in_time:
                        end_time = check_in_time + timedelta(minutes=self.default_class_minutes)
                        remaining = end_time - current_time
                        remaining_minutes = max(0, int(remaining.total_seconds() / 60))
                        
                        # 위젯 업데이트
                        self.update_student_widget(name, remaining_minutes)
                
                elif data['checked_out']:
                    departed_count += 1
                    
                    # 새로운 하원 확인
                    if name not in self.notified_departures:
                        self.speak_notification(f"{name} 하원")
                        self.notified_departures.add(name)
                        print(f"[알림] {name} 하원")
                    
                    # 위젯 제거
                    if name in self.student_widgets:
                        self.student_widgets[name]['shadow_frame'].destroy()
                        del self.student_widgets[name]
            
            # 카운트 업데이트
            self.root.after(0, lambda: self.count_label.config(text=f"수업중: {current_count}명"))
            self.root.after(0, lambda: self.departed_label.config(text=f"하원: {departed_count}명"))
            
            # 상태 업데이트
            current_time_str = current_time.strftime("%H:%M:%S")
            self.root.after(0, lambda: self.status_label.config(text=f"모니터링 중... (마지막 업데이트: {current_time_str})"))
            
        except Exception as e:
            print(f"[학생 데이터 처리 오류] {e}")
    
    def parse_time(self, time_str):
        """시간 문자열 파싱"""
        if not time_str:
            return None
        
        try:
            time_str = time_str.strip()
            is_pm = "오후" in time_str
            
            time_part = time_str.replace("오전", "").replace("오후", "").strip()
            if ":" in time_part:
                hour, minute = time_part.split(":")
                hour = int(hour)
                minute = int(minute)
                
                if is_pm and hour != 12:
                    hour += 12
                elif not is_pm and hour == 12:
                    hour = 0
                
                today = datetime.now().date()
                parsed_time = datetime.combine(today, datetime.min.time().replace(hour=hour, minute=minute))
                return parsed_time
        except:
            pass
        
        return None
    
    def create_student_widget(self, name):
        """학생 카드 위젯 생성"""
        # 그림자 효과 프레임
        shadow_frame = tk.Frame(
            self.scrollable_frame,
            bg='#0f0f0f',
            width=226,
            height=206
        )
        shadow_frame.pack_propagate(False)
        shadow_frame.pack(side='left', padx=5, pady=5)
        
        # 메인 카드 프레임
        card_frame = tk.Frame(
            shadow_frame,
            bg='#2d2d30',
            relief=tk.FLAT,
            borderwidth=1,
            width=220,
            height=200,
            highlightbackground='#40444b',
            highlightthickness=1
        )
        card_frame.pack_propagate(False)
        card_frame.place(x=3, y=3)
        
        # 학생 이름
        name_label = tk.Label(
            card_frame,
            text=name[:8],
            font=('맑은 고딕', 16, 'bold'),
            bg='#2d2d30',
            fg='#ffffff',
            anchor='center'
        )
        name_label.pack(pady=(15, 5), fill='x')
        
        # 남은 시간
        remain_label = tk.Label(
            card_frame,
            text="계산중...",
            font=('맑은 고딕', 18, 'bold'),
            bg='#2d2d30',
            fg='#00d26a',
            anchor='center'
        )
        remain_label.pack(pady=10, fill='x')
        
        # 등원 시간
        checkin_label = tk.Label(
            card_frame,
            text="등원 시간 확인 중",
            font=('맑은 고딕', 10),
            bg='#2d2d30',
            fg='#cccccc',
            anchor='center'
        )
        checkin_label.pack(pady=5, fill='x')
        
        # 위젯 정보 저장
        self.student_widgets[name] = {
            'shadow_frame': shadow_frame,
            'card_frame': card_frame,
            'name_label': name_label,
            'remain_label': remain_label,
            'checkin_label': checkin_label
        }
    
    def update_student_widget(self, name, remaining_minutes):
        """학생 위젯 업데이트"""
        if name not in self.student_widgets:
            return
        
        widget_info = self.student_widgets[name]
        
        # 색상 계산
        bg_color, fg_color, border_color = get_time_based_colors(remaining_minutes)
        
        # 남은 시간 텍스트
        if remaining_minutes > 0:
            hours = remaining_minutes // 60
            minutes = remaining_minutes % 60
            if hours > 0:
                time_text = f"{hours}시간 {minutes}분"
            else:
                time_text = f"{minutes}분"
        else:
            time_text = "수업 종료"
        
        # UI 업데이트
        try:
            widget_info['remain_label'].config(text=time_text, fg=fg_color)
            widget_info['card_frame'].config(highlightbackground=border_color)
        except:
            pass
    
    def restart_monitoring(self):
        """모니터링 재시작"""
        self.stop_monitoring()
        time.sleep(1)
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        if username and password:
            self.start_complete_system()
    
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
        self.restart_btn.config(state='disabled')
        self.stop_btn.config(state='disabled')
        self.auto_login_btn.config(text="자동 로그인 + 모니터링 시작", state='normal')
        
        self.status_label.config(text="시스템 정지됨")
        
        # 학생 위젯들 제거
        for widget_info in self.student_widgets.values():
            widget_info['shadow_frame'].destroy()
        self.student_widgets = {}
        self.students = {}
        
        self.count_label.config(text="수업중: 0명")
        self.departed_label.config(text="하원: 0명")
        
        # 알림 상태 초기화
        self.notified_departures.clear()
        self.notified_arrivals.clear()

def main():
    """메인 실행 함수"""
    root = tk.Tk()
    app = AttokCompleteSystem(root)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        print("프로그램 종료")
    finally:
        if hasattr(app, 'driver') and app.driver:
            try:
                app.driver.quit()
            except:
                pass

if __name__ == "__main__":
    print("ATTOK 완전 통합 시스템 v2.0 시작")
    print("=" * 50)
    main()