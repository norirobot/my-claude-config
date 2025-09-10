"""
RO&CO EDU-OK Monitor
깔끔한 UI, 로그인 후 버튼 최소화, 메인 공간은 학생 정보에 집중
"""
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from datetime import datetime, timedelta
import winsound
try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False
    print("pyttsx3가 설치되지 않았습니다. 음성 기능이 비활성화됩니다.")

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, NoSuchWindowException, TimeoutException
import hashlib
import csv
import os
import math

class CleanAttendanceGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("RO&CO EDU-OK Monitor")
        self.root.geometry("1400x900")
        
        # 다크 테마
        self.bg_color = '#2b2b2b'
        self.fg_color = '#ffffff'
        self.card_color = '#3c3c3c'
        
        self.root.configure(bg=self.bg_color)
        
        self.students = {}
        self.driver = None
        self.monitoring = False
        self.logged_in = False
        self.default_class_minutes = 90
        
        # 브라우저 상태 관리
        self.browser_alive = False
        self.connection_errors = 0
        self.max_errors = 3
        
        # 깜빡임 방지용 변수들
        self.last_data_hash = ""
        self.last_widget_update = {}
        
        # 카드 스타일 설정 (동적 조정)
        self.card_width = 200
        self.card_height = 160
        self.min_cards_per_row = 3  # 최소 카드 수
        self.max_cards_per_row = 8  # 최대 카드 수
        self.cards_per_row = 6  # 기본값
        
        # 음성 알림 설정
        self.voice_enabled = True
        self.tts_engine = None
        self.init_tts()
        
        # 음성 알림 상태 추적 (한 번만 알림)
        self.voice_announced = {}  # {student_name: {'checkin': bool, 'departure': bool}}
        
        self.setup_ui()
        
        # 창 크기 변경 이벤트 바인딩
        self.root.bind('<Configure>', self.on_window_resize)
    
    def calculate_cards_per_row(self):
        """화면 크기에 따라 카드 수 동적 계산"""
        try:
            window_width = self.root.winfo_width()
            if window_width < 200:  # 창이 너무 작으면 기본값 사용
                return self.cards_per_row
            
            # 여백을 고려한 사용 가능한 너비 (좌우 여백 40px, 카드 간 간격 10px)
            available_width = window_width - 80  
            
            # 카드 하나당 필요한 너비 (카드 너비 + 간격)
            card_space = self.card_width + 10
            
            # 계산된 카드 수
            calculated_cards = max(1, available_width // card_space)
            
            # 최소/최대 범위 내로 제한
            cards_per_row = max(self.min_cards_per_row, 
                               min(self.max_cards_per_row, calculated_cards))
            
            print(f"창 너비: {window_width}px → 카드/행: {cards_per_row}개")
            return cards_per_row
            
        except:
            return self.cards_per_row
    
    def on_window_resize(self, event):
        """창 크기 변경 시 레이아웃 재조정"""
        if event.widget == self.root and hasattr(self, 'student_widgets'):
            new_cards_per_row = self.calculate_cards_per_row()
            
            if new_cards_per_row != self.cards_per_row:
                self.cards_per_row = new_cards_per_row
                print(f"레이아웃 재조정: {self.cards_per_row}개/행")
                
                # 기존 학생 카드들 재배치
                self.rearrange_student_cards()
    
    def rearrange_student_cards(self):
        """학생 카드들을 새로운 레이아웃으로 재배치"""
        if not hasattr(self, 'student_widgets') or not self.student_widgets:
            return
            
        try:
            # 모든 카드 일시적으로 숨기기
            for name, widget in self.student_widgets.items():
                widget['frame'].grid_forget()
            
            # 새로운 레이아웃으로 재배치
            for i, (name, widget) in enumerate(self.student_widgets.items()):
                row = i // self.cards_per_row
                col = i % self.cards_per_row
                widget['frame'].grid(row=row, column=col, padx=5, pady=5)
                
        except Exception as e:
            print(f"카드 재배치 오류: {e}")
    
    def init_tts(self):
        """TTS 엔진 초기화"""
        if not PYTTSX3_AVAILABLE:
            print("TTS 엔진 사용 불가 - pyttsx3 미설치")
            self.tts_engine = None
            self.voice_enabled = False
            return
            
        try:
            print("TTS 엔진 초기화 시도 중...")
            self.tts_engine = pyttsx3.init()
            
            # 음성 속도 조절 (기본값보다 약간 빠르게)
            self.tts_engine.setProperty('rate', 200)
            # 음량 설정
            self.tts_engine.setProperty('volume', 0.8)
            
            print("TTS 엔진 초기화 완료")
            
            # 초기화 테스트
            self.tts_engine.say("음성 시스템 준비 완료")
            self.tts_engine.runAndWait()
            
        except Exception as e:
            print(f"TTS 엔진 초기화 실패: {e}")
            self.tts_engine = None
            self.voice_enabled = False
    
    def speak(self, text):
        """음성 안내 (백그라운드 실행)"""
        if not self.voice_enabled:
            print(f"🔇 음성 비활성화됨: {text}")
            return
            
        if not self.tts_engine:
            print(f"❌ TTS 엔진 없음: {text}")
            return
        
        print(f"🔊 음성 출력: {text}")
        
        def speak_thread():
            try:
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
                print(f"✅ 음성 완료: {text}")
            except Exception as e:
                print(f"❌ 음성 오류: {e}")
        
        thread = threading.Thread(target=speak_thread, daemon=True)
        thread.start()
        
    def setup_ui(self):
        """UI 설정"""
        # 상단 프레임 (제목 + 초기 버튼들)
        self.top_frame = tk.Frame(self.root, bg=self.bg_color)
        self.top_frame.pack(fill='x', pady=20)
        
        # 제목
        self.title_label = tk.Label(
            self.top_frame,
            text="RO&CO EDU-OK Monitor",
            font=('맑은 고딕', 28, 'bold'),
            bg=self.bg_color,
            fg='#4CAF50'
        )
        self.title_label.pack()
        
        # 초기 버튼 프레임 (로그인 전)
        self.initial_button_frame = tk.Frame(self.top_frame, bg=self.bg_color)
        self.initial_button_frame.pack(pady=20)
        
        # 시작 버튼
        self.start_btn = tk.Button(
            self.initial_button_frame,
            text="▶ 시작",
            font=('맑은 고딕', 16, 'bold'),
            bg='#4CAF50',
            fg='white',
            command=self.start_monitoring,
            width=15,
            height=2
        )
        self.start_btn.pack(side='left', padx=10)
        
        # 로그인 완료 버튼
        self.manual_login_btn = tk.Button(
            self.initial_button_frame,
            text="✓ 로그인 완료",
            font=('맑은 고딕', 16, 'bold'),
            bg='#2196F3',
            fg='white',
            command=self.confirm_manual_login,
            width=15,
            height=2,
            state='disabled'
        )
        self.manual_login_btn.pack(side='left', padx=10)
        
        # 상태 표시 (초기)
        self.initial_status_label = tk.Label(
            self.top_frame,
            text="시작 버튼을 눌러주세요",
            font=('맑은 고딕', 14),
            bg=self.bg_color,
            fg=self.fg_color
        )
        self.initial_status_label.pack(pady=10)
        
        # 우상단 컨트롤 패널 (로그인 후 표시)
        self.control_panel = tk.Frame(self.root, bg=self.bg_color)
        self.control_panel.place(x=1200, y=10)  # 우상단 고정
        
        # 컨트롤 패널 버튼들
        control_buttons = [
            ("🔄", self.restart_browser, "#FF9800", "재시작"),
            ("⏹", self.stop_monitoring, "#F44336", "정지"),
            ("📄", self.export_to_csv, "#607D8B", "CSV"),
            ("🔊" if self.voice_enabled else "🔇", self.toggle_voice, '#607D8B', "음성 알림")
        ]
        
        for i, (text, command, color, tooltip) in enumerate(control_buttons):
            btn = tk.Button(
                self.control_panel,
                text=text,
                font=('맑은 고딕', 10),
                bg=color,
                fg='white',
                command=command,
                width=4,
                height=1
            )
            btn.grid(row=0, column=i, padx=2)
        
        # 우하단 상태 패널
        self.status_panel = tk.Frame(self.root, bg=self.bg_color)
        self.status_panel.place(x=1200, y=850)  # 우하단 고정
        
        # 상태 정보들 (작은 크기)
        self.connection_label = tk.Label(
            self.status_panel,
            text="🔴 연결 안됨",
            font=('맑은 고딕', 8),
            bg=self.bg_color,
            fg='#F44336'
        )
        self.connection_label.pack(anchor='e')
        
        self.monitoring_label = tk.Label(
            self.status_panel,
            text="",
            font=('맑은 고딕', 8),
            bg=self.bg_color,
            fg='#FFB74D'
        )
        self.monitoring_label.pack(anchor='e')
        
        self.error_label = tk.Label(
            self.status_panel,
            text="",
            font=('맑은 고딕', 8),
            bg=self.bg_color,
            fg='#FFB74D'
        )
        self.error_label.pack(anchor='e')
        
        # 메인 컨테이너 (스크롤 가능)
        self.main_container = tk.Frame(self.root, bg=self.bg_color)
        self.main_container.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        
        # 캔버스와 스크롤바
        self.canvas = tk.Canvas(self.main_container, bg=self.bg_color, highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.main_container, orient="vertical", command=self.canvas.yview)
        
        # 스크롤 가능한 프레임
        self.scrollable_frame = tk.Frame(self.canvas, bg=self.bg_color)
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # 통계 프레임 (로그인 후 표시)
        self.stats_frame = tk.Frame(self.scrollable_frame, bg=self.bg_color)
        
        self.count_label = tk.Label(
            self.stats_frame,
            text="👥 수업중: 0명",
            font=('맑은 고딕', 20, 'bold'),
            bg=self.bg_color,
            fg='#4CAF50'
        )
        self.count_label.pack(side='left', padx=30)
        
        self.departed_label = tk.Label(
            self.stats_frame,
            text="🚪 하원: 0명",
            font=('맑은 고딕', 20, 'bold'),
            bg=self.bg_color,
            fg='#9E9E9E'
        )
        self.departed_label.pack(side='left', padx=30)
        
        # 수업중 학생 섹션
        self.active_section = tk.LabelFrame(
            self.scrollable_frame,
            text="📚 수업중인 학생들",
            font=('맑은 고딕', 18, 'bold'),
            bg=self.bg_color,
            fg='#4CAF50',
            bd=3,
            relief='raised'
        )
        
        # 수업중 학생 그리드 프레임
        self.active_grid_frame = tk.Frame(self.active_section, bg=self.bg_color)
        self.active_grid_frame.pack(expand=True, padx=15, pady=15)
        
        # 하원 학생 섹션
        self.departed_section = tk.LabelFrame(
            self.scrollable_frame,
            text="🚪 하원한 학생들",
            font=('맑은 고딕', 18, 'bold'),
            bg=self.bg_color,
            fg='#9E9E9E',
            bd=3,
            relief='raised'
        )
        
        # 하원 학생 그리드 프레임
        self.departed_grid_frame = tk.Frame(self.departed_section, bg=self.bg_color)
        self.departed_grid_frame.pack(expand=True, padx=15, pady=15)
        
        self.student_widgets = {}
        self.current_data = {}
        
        # 초기에는 학생 섹션들 숨김
        self.hide_student_sections()
        
        # 브라우저 상태 모니터링 시작
        self.check_browser_status()
        
    def hide_student_sections(self):
        """학생 섹션들 숨기기"""
        self.stats_frame.pack_forget()
        self.active_section.pack_forget()
        self.departed_section.pack_forget()
        
    def show_student_sections(self):
        """학생 섹션들 표시"""
        self.stats_frame.pack(pady=20)
        self.active_section.pack(fill='x', pady=(20, 10), padx=10)
        self.departed_section.pack(fill='x', pady=10, padx=10)
        
    def switch_to_monitoring_ui(self):
        """모니터링 UI로 전환"""
        # 초기 버튼들과 상태 숨기기
        self.initial_button_frame.pack_forget()
        self.initial_status_label.pack_forget()
        
        # 제목 크기 줄이기
        self.title_label.config(font=('맑은 고딕', 20, 'bold'))
        
        # 학생 섹션들 표시
        self.show_student_sections()
        
        # 모니터링 상태 표시
        self.monitoring_label.config(text="⚡ 모니터링 중")
        
    def get_time_color(self, minutes_left):
        """남은 시간에 따른 색상 반환"""
        if minutes_left > 60:
            return '#1b5e20'  # 진한 녹색 (1시간 이상)
        elif minutes_left > 30:
            return '#388E3C'  # 녹색 (30분~1시간)
        elif minutes_left > 15:
            return '#FFA000'  # 주황색 (15~30분)
        elif minutes_left > 5:
            return '#F57C00'  # 진한 주황 (5~15분)
        else:
            return '#D32F2F'  # 빨간색 (5분 미만)
    
    def create_active_student_card(self, name, parent_frame):
        """수업중인 학생 카드 생성"""
        # 메인 카드 프레임
        card_frame = tk.Frame(
            parent_frame,
            width=self.card_width,
            height=self.card_height,
            relief='raised',
            bd=3
        )
        card_frame.pack_propagate(False)
        
        # 학생 이름
        name_label = tk.Label(
            card_frame,
            text=name[:12],
            font=('맑은 고딕', 14, 'bold'),
            fg='white',
            wraplength=180
        )
        name_label.pack(pady=(10, 5))
        
        # 남은 시간
        time_label = tk.Label(
            card_frame,
            text="",
            font=('맑은 고딕', 18, 'bold'),
            fg='yellow'
        )
        time_label.pack(pady=5)
        
        # 등원 시간
        checkin_label = tk.Label(
            card_frame,
            text="",
            font=('맑은 고딕', 10),
            fg='lightblue'
        )
        checkin_label.pack(pady=(5, 8))
        
        # 시간 조절 버튼 프레임
        button_frame = tk.Frame(card_frame)
        button_frame.pack(pady=(0, 10))
        
        # 감소 버튼
        minus_btn = tk.Button(
            button_frame,
            text="-10",
            font=('맑은 고딕', 9, 'bold'),
            bg='#F44336',
            fg='white',
            command=lambda: self.adjust_student_time(name, -10),
            width=4,
            height=1
        )
        minus_btn.pack(side='left', padx=2)
        
        # 증가 버튼
        plus_btn = tk.Button(
            button_frame,
            text="+10",
            font=('맑은 고딕', 9, 'bold'),
            bg='#2196F3',
            fg='white',
            command=lambda: self.adjust_student_time(name, 10),
            width=4,
            height=1
        )
        plus_btn.pack(side='left', padx=2)
        
        return {
            'frame': card_frame,
            'name': name_label,
            'time': time_label,
            'checkin': checkin_label,
            'button_frame': button_frame,
            'minus_btn': minus_btn,
            'plus_btn': plus_btn
        }
    
    def create_departed_student_card(self, name, parent_frame):
        """하원한 학생 카드 생성"""
        # 메인 카드 프레임
        card_frame = tk.Frame(
            parent_frame,
            width=180,
            height=120,
            bg='#424242',
            relief='raised',
            bd=2
        )
        card_frame.pack_propagate(False)
        
        # 학생 이름
        name_label = tk.Label(
            card_frame,
            text=name[:12],
            font=('맑은 고딕', 12, 'bold'),
            bg='#424242',
            fg='white'
        )
        name_label.pack(pady=(10, 5))
        
        # 수업한 시간
        duration_label = tk.Label(
            card_frame,
            text="",
            font=('맑은 고딕', 11),
            bg='#424242',
            fg='lightgray'
        )
        duration_label.pack(pady=2)
        
        # 하원 시간
        checkout_label = tk.Label(
            card_frame,
            text="",
            font=('맑은 고딕', 10),
            bg='#424242',
            fg='lightgray'
        )
        checkout_label.pack(pady=2)
        
        return {
            'frame': card_frame,
            'name': name_label,
            'duration': duration_label,
            'checkout': checkout_label
        }
    
    def export_to_csv(self):
        """CSV 파일로 출결 데이터 내보내기"""
        if not self.students:
            messagebox.showinfo("알림", "내보낼 데이터가 없습니다.")
            return
        
        today = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"출결기록_{today}.csv"
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(['이름', '등원시간', '하원시간', '수업시간(분)', '상태'])
                
                for name, data in self.students.items():
                    check_in = data['actual_check_in_time'].strftime('%H:%M')
                    check_out = ""
                    if data.get('actual_check_out_time'):
                        check_out = data['actual_check_out_time'].strftime('%H:%M')
                    
                    class_minutes = data.get('class_minutes', 90)
                    status = "하원" if data.get('checked_out') else "수업중"
                    
                    writer.writerow([name, check_in, check_out, class_minutes, status])
            
            messagebox.showinfo("완료", f"CSV 파일이 저장되었습니다.\n파일명: {filename}")
            
        except Exception as e:
            messagebox.showerror("오류", f"CSV 파일 저장 실패:\n{str(e)}")
    
    def toggle_voice(self):
        """음성 알림 토글"""
        self.voice_enabled = not self.voice_enabled
        
        # 버튼 텍스트 업데이트
        if hasattr(self, 'control_panel'):
            for widget in self.control_panel.winfo_children():
                if isinstance(widget, tk.Button) and widget.cget('text') in ['🔊', '🔇']:
                    widget.config(text='🔊' if self.voice_enabled else '🔇')
                    break
        
        status = "켜짐" if self.voice_enabled else "꺼짐"
        print(f"음성 알림: {status}")
        
        if self.voice_enabled:
            self.speak("음성 알림이 켜졌습니다")
    
    def check_browser_status(self):
        """브라우저 상태 주기적 체크"""
        if self.driver:
            try:
                self.driver.current_url
                self.browser_alive = True
                self.connection_errors = 0
                self.connection_label.config(
                    text="🟢 연결됨",
                    fg='#4CAF50'
                )
            except (WebDriverException, NoSuchWindowException):
                self.browser_alive = False
                self.connection_errors += 1
                self.connection_label.config(
                    text=f"🔴 연결 끊김",
                    fg='#F44336'
                )
                
                if self.connection_errors >= self.max_errors and self.monitoring:
                    self.handle_browser_crash()
        else:
            self.browser_alive = False
            self.connection_label.config(
                text="🔴 연결 안됨",
                fg='#F44336'
            )
        
        # 오류 표시
        if self.connection_errors > 0:
            self.error_label.config(text=f"⚠️ 오류: {self.connection_errors}/{self.max_errors}")
        else:
            self.error_label.config(text="")
        
        self.root.after(5000, self.check_browser_status)
    
    def handle_browser_crash(self):
        """브라우저 크래시 처리"""
        self.monitoring = False
        
        winsound.Beep(800, 500)
        
        if messagebox.askyesno("브라우저 오류", "브라우저 연결이 끊어졌습니다.\n자동으로 재시작하시겠습니까?"):
            self.restart_browser()
    
    def start_monitoring(self):
        """모니터링 시작"""
        self.start_btn.config(state='disabled')
        self.initial_status_label.config(text="브라우저 시작 중...")
        self.connection_errors = 0
        
        thread = threading.Thread(target=self.run_browser, daemon=True)
        thread.start()
    
    def restart_browser(self):
        """브라우저 재시작"""
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
            self.driver = None
        
        self.monitoring = False
        self.browser_alive = False
        self.connection_errors = 0
        
        thread = threading.Thread(target=self.run_browser, daemon=True)
        thread.start()
    
    def stop_monitoring(self):
        """모니터링 정지"""
        self.monitoring = False
        
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
            self.driver = None
        
        self.browser_alive = False
        self.connection_errors = 0
        
        # UI 초기 상태로 복원
        self.hide_student_sections()
        self.title_label.config(font=('맑은 고딕', 28, 'bold'))
        self.initial_button_frame.pack(pady=20)
        self.initial_status_label.pack(pady=10)
        self.initial_status_label.config(text="시작 버튼을 눌러주세요")
        self.start_btn.config(state='normal')
        self.manual_login_btn.config(state='disabled')
        
        # 상태 초기화
        self.monitoring_label.config(text="")
        
        # 학생 위젯들 제거
        for widget_info in self.student_widgets.values():
            widget_info['frame'].destroy()
        self.student_widgets = {}
        self.students = {}
    
    def run_browser(self):
        """브라우저 실행"""
        try:
            self.driver = webdriver.Chrome()
            self.driver.get("https://attok.co.kr/")
            self.browser_alive = True
            
            self.root.after(0, lambda: self.initial_status_label.config(text="브라우저에서 로그인 후 '로그인 완료' 버튼을 눌러주세요"))
            self.root.after(0, lambda: self.manual_login_btn.config(state='normal'))
                
        except Exception as e:
            self.root.after(0, lambda: self.initial_status_label.config(text=f"브라우저 시작 실패: {str(e)}"))
            self.root.after(0, lambda: self.start_btn.config(state='normal'))
    
    def confirm_manual_login(self):
        """수동 로그인 완료 확인"""
        self.manual_login_btn.config(state='disabled')
        
        # 브라우저 창 최소화 (백그라운드로)
        try:
            self.driver.minimize_window()
            print("브라우저 창이 최소화되었습니다.")
        except Exception as e:
            print(f"창 최소화 실패: {e}")
        
        self.switch_to_monitoring_ui()
        self.start_monitoring_after_login()
    
    def start_monitoring_after_login(self):
        """로그인 후 모니터링 시작"""
        thread = threading.Thread(target=self.start_monitoring_loop, daemon=True)
        thread.start()
    
    def start_monitoring_loop(self):
        """모니터링 루프 시작"""
        self.monitoring = True
        self.logged_in = True
        
        self.monitor_thread()
    
    def monitor_thread(self):
        """모니터링 스레드"""
        while self.monitoring:
            try:
                if not self.browser_alive:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 브라우저 연결 끊김 감지")
                    break
                
                students = self.get_students()
                self.current_data = students
                
                new_hash = self.calculate_data_hash(students)
                if new_hash != self.last_data_hash:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 데이터 변경 감지 - UI 업데이트")
                    self.last_data_hash = new_hash
                    self.root.after(0, self.update_ui, students)
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 데이터 변경 없음 - 시간만 업데이트")
                    self.root.after(0, self.update_time_only)
                
                time.sleep(10)
                
            except Exception as e:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] 모니터링 오류: {e}")
                self.connection_errors += 1
                
                if self.connection_errors >= self.max_errors:
                    break
                
                time.sleep(5)
    
    def calculate_data_hash(self, data):
        """데이터 해시 계산"""
        relevant_data = {}
        for name, info in data.items():
            if info.get('checked_in'):
                relevant_data[name] = {
                    'checked_out': info.get('checked_out', False),
                    'check_in_time': info.get('check_in_time', ''),
                    'check_out_time': info.get('check_out_time', '')
                }
        
        data_str = str(sorted(relevant_data.items()))
        return hashlib.md5(data_str.encode()).hexdigest()
    
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
                return datetime.combine(today, datetime.min.time().replace(hour=hour, minute=minute))
        except:
            pass
        
        return None
    
    def adjust_student_time(self, name, minutes):
        """개별 학생 수업 시간 조절"""
        if name in self.students:
            student = self.students[name]
            current_minutes = student.get('class_minutes', self.default_class_minutes)
            new_minutes = current_minutes + minutes
            
            if new_minutes < 30:
                new_minutes = 30
            elif new_minutes > 240:
                new_minutes = 240
            
            student['class_minutes'] = new_minutes
            student['end_time'] = student['actual_check_in_time'] + timedelta(minutes=new_minutes)
            
            self.update_single_student(name)
    
    def get_students(self):
        """학생 정보 추출"""
        result = {}
        
        try:
            if not self.driver:
                return result
                
            # 연결 상태 테스트 + 세션 유지 효과
            current_url = self.driver.current_url
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 세션 유지: {current_url}")
            
            # 추가 세션 유지 액션 (페이지 활동 시뮬레이션)
            try:
                # 페이지 제목 확인 (가벼운 DOM 접근)
                title = self.driver.title
                # body 요소 확인 (사이트에 살아있음을 알림)
                self.driver.find_element(By.TAG_NAME, "body")
            except:
                pass
            
            ul_elements = self.driver.find_elements(By.TAG_NAME, "ul")
            
            for ul in ul_elements:
                li_items = ul.find_elements(By.TAG_NAME, "li")
                
                if 70 <= len(li_items) <= 90:
                    for li in li_items:
                        strong_tags = li.find_elements(By.TAG_NAME, "strong")
                        
                        if not strong_tags or not any("배경" in s.text for s in strong_tags):
                            text = li.text.strip()
                            if text:
                                lines = text.split('\n')
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
    
    def update_single_student(self, name):
        """개별 학생 위젯 업데이트"""
        if name not in self.student_widgets or name not in self.students:
            return
            
        widget = self.student_widgets[name]
        student_info = self.students[name]
        
        if student_info.get('checked_out'):
            # 하원한 학생 업데이트
            if 'duration' in widget:
                # 수업한 시간 계산
                check_in = student_info['actual_check_in_time']
                check_out = student_info.get('actual_check_out_time', datetime.now())
                duration = check_out - check_in
                duration_minutes = int(duration.total_seconds() // 60)
                
                hours = duration_minutes // 60
                minutes = duration_minutes % 60
                
                if hours > 0:
                    duration_text = f"📚 {hours}시간 {minutes}분"
                else:
                    duration_text = f"📚 {minutes}분"
                
                widget['duration'].config(text=duration_text)
                
                if student_info.get('actual_check_out_time'):
                    checkout_text = f"🚪 {student_info['actual_check_out_time'].strftime('%H:%M')} 하원"
                else:
                    checkout_text = "🚪 하원 완료"
                
                widget['checkout'].config(text=checkout_text)
        else:
            # 수업중인 학생 업데이트
            if 'time' in widget:
                check_in_time = student_info['actual_check_in_time']
                widget['checkin'].config(text=f"📅 {check_in_time.strftime('%H:%M')} 등원")
                
                end = student_info['end_time']
                remain = end - datetime.now()
                
                if remain.total_seconds() > 0:
                    total_minutes = int(remain.total_seconds() // 60)
                    
                    if total_minutes >= 60:
                        hours = total_minutes // 60
                        minutes = total_minutes % 60
                        if minutes > 0:
                            time_text = f"{hours}시간 {minutes}분"
                        else:
                            time_text = f"{hours}시간"
                    else:
                        time_text = f"{total_minutes}분"
                    
                    # 색상 결정
                    color = self.get_time_color(total_minutes)
                    
                    widget['frame'].config(bg=color)
                    widget['name'].config(bg=color)
                    widget['time'].config(bg=color, text=time_text)
                    widget['checkin'].config(bg=color)
                    widget['button_frame'].config(bg=color)
                else:
                    # 시간 초과
                    expected_time = end.strftime('%H:%M')
                    
                    widget['frame'].config(bg='#b71c1c')
                    widget['name'].config(bg='#b71c1c')
                    widget['time'].config(bg='#b71c1c', text="시간초과")
                    widget['checkin'].config(bg='#b71c1c', text=f"🚨 {expected_time} 예정")
                    widget['button_frame'].config(bg='#b71c1c')
                    
                    if not student_info.get('alerted'):
                        winsound.Beep(1000, 300)
                        self.students[name]['alerted'] = True
    
    def update_time_only(self):
        """시간 표시만 업데이트"""
        for name in self.student_widgets:
            if name in self.students:
                self.update_single_student(name)
    
    def update_ui(self, current_data):
        """UI 업데이트"""
        checked_in_students = {name: data for name, data in current_data.items() 
                              if data.get('checked_in', False)}
        
        # 새로 출석한 학생 처리
        for name in checked_in_students:
            data = checked_in_students[name]
            
            if name not in self.students:
                actual_check_in = self.parse_time(data.get('check_in_time', ''))
                if actual_check_in is None:
                    actual_check_in = datetime.now()
                
                self.students[name] = {
                    'checked_in': True,
                    'actual_check_in_time': actual_check_in,
                    'class_minutes': self.default_class_minutes,
                    'end_time': actual_check_in + timedelta(minutes=self.default_class_minutes),
                    'checked_out': data.get('checked_out', False),
                    'check_out_time': data.get('check_out_time', ''),
                    'actual_check_out_time': None
                }
                
                # 음성 알림 상태 초기화
                if name not in self.voice_announced:
                    self.voice_announced[name] = {'checkin': False, 'departure': False}
                
                # 등원 음성 알림 (한 번만)
                if not self.voice_announced[name]['checkin']:
                    self.speak(f"{name} 등원")
                    self.voice_announced[name]['checkin'] = True
                    print(f"[음성] {name} 등원 알림")
            
            # 하원 정보 업데이트
            if data.get('checked_out') and not self.students[name].get('checked_out'):
                self.students[name]['checked_out'] = True
                self.students[name]['check_out_time'] = data.get('check_out_time', '')
                self.students[name]['actual_check_out_time'] = self.parse_time(data.get('check_out_time', ''))
                
                # 하원 음성 알림 (한 번만)
                if name in self.voice_announced and not self.voice_announced[name]['departure']:
                    self.speak(f"{name} 하원")
                    self.voice_announced[name]['departure'] = True
                    print(f"[음성] {name} 하원 알림")
        
        # 수업중/하원 학생 분리
        active_students = []
        departed_students = []
        
        for name in checked_in_students:
            student_info = self.students.get(name, {})
            if student_info.get('checked_out'):
                departed_students.append(name)
            else:
                end = student_info.get('end_time', datetime.now())
                remain = (end - datetime.now()).total_seconds()
                active_students.append((name, remain))
        
        # 남은 시간 순으로 정렬
        active_students.sort(key=lambda x: x[1])
        active_student_names = [name for name, _ in active_students]
        
        # 기존 위젯 제거
        for widget_info in self.student_widgets.values():
            widget_info['frame'].destroy()
        self.student_widgets = {}
        
        # 동적 카드 수 계산
        current_cards_per_row = self.calculate_cards_per_row()
        
        # 수업중인 학생 카드 배치
        for idx, name in enumerate(active_student_names):
            row = idx // current_cards_per_row
            col = idx % current_cards_per_row
            
            widget = self.create_active_student_card(name, self.active_grid_frame)
            widget['frame'].grid(row=row, column=col, padx=10, pady=10, sticky='nw')
            self.student_widgets[name] = widget
        
        # 하원한 학생 카드 배치
        for idx, name in enumerate(departed_students):
            row = idx // current_cards_per_row
            col = idx % current_cards_per_row
            
            widget = self.create_departed_student_card(name, self.departed_grid_frame)
            widget['frame'].grid(row=row, column=col, padx=8, pady=8, sticky='nw')
            self.student_widgets[name] = widget
        
        # 각 학생 위젯 업데이트
        for name in self.student_widgets:
            self.update_single_student(name)
        
        # 통계 업데이트
        active_count = len(active_students)
        departed_count = len(departed_students)
        self.count_label.config(text=f"👥 수업중: {active_count}명")
        self.departed_label.config(text=f"🚪 하원: {departed_count}명")
        
    def run(self):
        """실행"""
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        self.root.mainloop()
        
    def on_close(self):
        """종료"""
        self.monitoring = False
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
        self.root.destroy()


if __name__ == "__main__":
    app = CleanAttendanceGUI()
    app.run()