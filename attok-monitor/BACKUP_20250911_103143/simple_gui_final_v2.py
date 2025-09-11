"""
최종 완성 출결 모니터링 시스템
- 수동 로그인 전용 (안정성 확보)
- 팝업 무시 (출결 인식에 문제없음)
- 브라우저 오류 처리 완벽
- 깜빡임 완전 해결
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
import hashlib
# import csv  # CSV 기능 제거
import os

def interpolate_color(color1, color2, factor):
    """두 색상 사이를 보간하는 함수 (factor: 0.0~1.0)"""
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
    # 색상 기준점들 (분, 배경색, 글씨색, 테두리색) - 더 세밀한 그라데이션
    color_points = [
        (120, '#2d2d30', '#00d26a', '#00d26a'),  # 120분+ : 완전 안전 (선명한 녹색)
        (90,  '#2d2d30', '#00d26a', '#00d26a'),  # 90분+  : 안전 (녹색)
        (60,  '#2d2d30', '#00d26a', '#00d26a'),  # 60분+  : 안전 (녹색) 
        (45,  '#2d2d30', '#7dd87d', '#7dd87d'),  # 45분+  : 여유 (밝은 녹색)
        (30,  '#2d2d30', '#a3d977', '#a3d977'),  # 30분+  : 주의 준비 (연한 녹색)
        (25,  '#2d2d30', '#d4e157', '#d4e157'),  # 25분+  : 노란녹색
        (20,  '#2d2d30', '#ffeb3b', '#ffeb3b'),  # 20분+  : 노란색
        (15,  '#2d2d30', '#ffb347', '#ffb347'),  # 15분+  : 연한 주황
        (10,  '#2d2d30', '#ff9500', '#ff9500'),  # 10분+  : 진한 주황
        (7,   '#2d2d30', '#ff8a50', '#ff8a50'),  # 7분+   : 주황-빨강 중간
        (5,   '#2d2d30', '#ff7b7b', '#ff7b7b'),  # 5분+   : 연한 빨강
        (3,   '#2d2d30', '#ff6b6b', '#ff6b6b'),  # 3분+   : 중간 빨강
        (0,   '#2d2d30', '#ff5f57', '#ff5f57')   # 0분    : 진한 빨강
    ]
    
    # 현재 시간이 어느 구간에 속하는지 찾기
    for i in range(len(color_points) - 1):
        upper_time, upper_bg, upper_fg, upper_border = color_points[i]
        lower_time, lower_bg, lower_fg, lower_border = color_points[i + 1]
        
        if total_minutes >= lower_time:
            if total_minutes >= upper_time:
                # 상한값 이상이면 상한값 색상 사용
                return upper_bg, upper_fg, upper_border
            else:
                # 두 지점 사이의 보간
                factor = (total_minutes - lower_time) / (upper_time - lower_time)
                bg_color = interpolate_color(lower_bg, upper_bg, factor)
                fg_color = interpolate_color(lower_fg, upper_fg, factor)
                border_color = interpolate_color(lower_border, upper_border, factor)
                return bg_color, fg_color, border_color
    
    # 최소값 미만이면 최소값 색상 사용
    return color_points[-1][1], color_points[-1][2], color_points[-1][3]

def play_notification_sound(notification_type, student_name=None):
    """최종 완성된 음성 알림 (큰 음량 + 간단명확)"""
    try:
        if notification_type == "arrival":
            # 등원 알림음
            winsound.Beep(800, 200)
            time.sleep(0.1)
            winsound.Beep(1000, 200)
            
            if student_name:
                engine = pyttsx3.init()
                engine.setProperty('rate', 100)  # 적당한 속도
                engine.setProperty('volume', 1.0)  # 볼륨 최대
                
                # 한국어 음성 선택
                voices = engine.getProperty('voices')
                if voices:
                    korean_voice = None
                    for voice in voices:
                        if 'KO-KR' in voice.id or 'HEAMI' in voice.id:
                            korean_voice = voice
                            break
                    
                    if korean_voice:
                        engine.setProperty('voice', korean_voice.id)
                    else:
                        engine.setProperty('voice', voices[0].id)
                
                full_message = f"{student_name} 등원"
                print(f"[최종] 큰 음량 음성: '{full_message}'")
                engine.say(full_message)
                engine.runAndWait()
                
                try:
                    engine.stop()
                except:
                    pass
                
        elif notification_type == "departure":
            # 하원 알림음
            winsound.Beep(600, 400)
            
            if student_name:
                engine = pyttsx3.init()
                engine.setProperty('rate', 100)  # 적당한 속도
                engine.setProperty('volume', 1.0)  # 볼륨 최대
                
                # 한국어 음성 선택
                voices = engine.getProperty('voices')
                if voices:
                    korean_voice = None
                    for voice in voices:
                        if 'KO-KR' in voice.id or 'HEAMI' in voice.id:
                            korean_voice = voice
                            break
                    
                    if korean_voice:
                        engine.setProperty('voice', korean_voice.id)
                    else:
                        engine.setProperty('voice', voices[0].id)
                
                full_message = f"{student_name} 하원"
                print(f"[최종] 큰 음량 음성: '{full_message}'")
                engine.say(full_message)
                engine.runAndWait()
                
                try:
                    engine.stop()
                except:
                    pass
                    
    except Exception as e:
        print(f"[오류] 음성 알림 실패: {e}")

class FinalAttendanceGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("RO&CO EDU-OK SYSTEM")
        self.root.geometry("1100x800")
        
        # 모던 Discord/Notion 스타일 테마
        self.bg_color = '#1a1a1a'  # Rich Black
        self.fg_color = '#ffffff'
        self.card_color = '#2d2d30'  # Discord Card
        
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
        
        # 등원/하원 알림 관리
        self.notified_arrivals = set()      # 등원 알림을 이미 한 학생들
        self.notified_departures = set()    # 하원 알림을 이미 한 학생들
        self.already_departed = set()       # 이미 하원한 학생들 (중복 알림 방지)
        self.initial_loading = True         # 초기 로딩 중인지 확인 (첫 로그인시 알림 방지)
        
        # 로그인 완료 버튼 깜빡임 제어
        self.login_blinking = False
        self.login_blink_state = True
        self.original_login_bg = '#5865f2'  # Discord Blurple
        
        # 로그 및 통계 (세션 시간 기능 제거됨)
        
        self.setup_ui()
        
    def setup_ui(self):
        """UI 설정"""
        # 상단 상태 바 (작고 모서리에 배치)
        top_frame = tk.Frame(self.root, bg=self.bg_color, height=30)
        top_frame.pack(fill='x', pady=(5, 0))
        top_frame.pack_propagate(False)
        
        # 좌측: 브라우저 연결 상태 (작게)
        self.connection_label = tk.Label(
            top_frame,
            text="🔴 연결안됨",
            font=('맑은 고딕', 9),
            bg=self.bg_color,
            fg='#F44336'
        )
        self.connection_label.pack(side='left', padx=5)
        
        # 우측: 재시작/정지 버튼 (작게)
        control_frame = tk.Frame(top_frame, bg=self.bg_color)
        control_frame.pack(side='right', padx=5)
        
        self.restart_btn = tk.Button(
            control_frame,
            text="🔄",
            font=('맑은 고딕', 10),
            bg='#ff9500',  # Discord Amber
            fg='white',
            command=self.restart_browser,
            width=3,
            height=1,
            state='disabled',
            relief=tk.FLAT,
            borderwidth=0,
            disabledforeground='#72767d',  # 비활성화 시 글씨색
            activebackground='#e6850e'     # 활성화 시 hover 색상
        )
        self.restart_btn.pack(side='left', padx=2)
        
        self.stop_btn = tk.Button(
            control_frame,
            text="⏹",
            font=('맑은 고딕', 10),
            bg='#ff5f57',  # Discord Red
            fg='white',
            command=self.stop_monitoring,
            width=3,
            height=1,
            state='disabled',
            relief=tk.FLAT,
            borderwidth=0,
            disabledforeground='#72767d',  # 비활성화 시 글씨색
            activebackground='#e5514b'     # 활성화 시 hover 색상
        )
        self.stop_btn.pack(side='left', padx=2)
        
        # 제목
        self.title_label = tk.Label(
            self.root,
            text="RO&CO EDU-OK SYSTEM",
            font=('맑은 고딕', 16, 'bold'),
            bg=self.bg_color,
            fg=self.fg_color
        )
        self.title_label.pack(pady=(10, 10))
        
        # 버튼 프레임 (로그인 완료 후 숨김 처리용)
        self.button_frame = tk.Frame(self.root, bg=self.bg_color)
        self.button_frame.pack(pady=15)
        
        # 첫 번째 줄 버튼들
        top_buttons = tk.Frame(self.button_frame, bg=self.bg_color)
        top_buttons.pack()
        
        # 시작 버튼
        self.start_btn = tk.Button(
            top_buttons,
            text="▶ 시작",
            font=('맑은 고딕', 14, 'bold'),
            bg='#00d26a',  # Discord Green
            fg='white',
            command=self.start_monitoring,
            width=12,
            height=2,
            relief=tk.FLAT,
            borderwidth=0,
            disabledforeground='#72767d',  # 비활성화 시 글씨색
            activebackground='#00b359'     # 활성화 시 hover 색상
        )
        self.start_btn.pack(side='left', padx=5)
        
        # 재시작/정지 버튼 상단으로 이동됨
        
        # 로그인 완료 버튼
        self.manual_login_btn = tk.Button(
            top_buttons,
            text="✓ 로그인 완료",
            font=('맑은 고딕', 14, 'bold'),
            bg='#5865f2',  # Discord Blurple
            fg='white',
            command=self.confirm_manual_login,
            width=15,
            height=2,
            state='disabled',
            relief=tk.FLAT,
            borderwidth=0,
            disabledforeground='#b9bbbe',  # 비활성화 시 글씨색
            activebackground='#4752c4'     # 활성화 시 hover 색상
        )
        self.manual_login_btn.pack(side='left', padx=5)
        
        # 두 번째 줄 버튼들
        bottom_buttons = tk.Frame(self.button_frame, bg=self.bg_color)
        bottom_buttons.pack(pady=(10, 0))
        
        # 전체 시간 조절 버튼 제거됨
        
        # CSV 내보내기 버튼 제거됨
        
        # 상태 표시
        self.status_label = tk.Label(
            self.root,
            text="대기 중... 시작 버튼을 눌러주세요",
            font=('맑은 고딕', 12),
            bg=self.bg_color,
            fg=self.fg_color
        )
        self.status_label.pack(pady=(0, 10))
        
        # 통계 프레임
        stats_frame = tk.Frame(self.root, bg=self.bg_color)
        stats_frame.pack(pady=5)
        
        self.count_label = tk.Label(
            stats_frame,
            text="👥 수업중: 0명",
            font=('맑은 고딕', 14, 'bold'),
            bg=self.bg_color,
            fg='#4CAF50'
        )
        self.count_label.pack(side='left', padx=15)
        
        self.departed_label = tk.Label(
            stats_frame,
            text="🚪 하원: 0명",
            font=('맑은 고딕', 14, 'bold'),
            bg=self.bg_color,
            fg='#9E9E9E'
        )
        self.departed_label.pack(side='left', padx=15)
        
        # 오류 카운터
        self.error_label = tk.Label(
            stats_frame,
            text="⚠️ 오류: 0/3",
            font=('맑은 고딕', 12),
            bg=self.bg_color,
            fg='#FFB74D'
        )
        self.error_label.pack(side='left', padx=15)
        
        # 스크롤 가능한 프레임
        container = tk.Frame(self.root, bg=self.bg_color)
        container.pack(fill='both', expand=True, padx=20, pady=10)
        
        canvas = tk.Canvas(container, bg=self.bg_color, highlightthickness=0)
        
        # 모던 Discord 스타일 스크롤바
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("Vertical.TScrollbar",
                       background='#2d2d30',         # Discord 카드색
                       troughcolor='#1a1a1a',        # 배경과 일치
                       bordercolor='#40444b',        # 부드러운 테두리
                       arrowcolor='#ffffff',         # 화살표 색상
                       darkcolor='#2d2d30',          # 더 어두운 부분
                       lightcolor='#40444b')         # 밝은 부분
        
        scrollbar = ttk.Scrollbar(container, orient="vertical", command=canvas.yview, style="Vertical.TScrollbar")
        
        self.student_frame = tk.Frame(canvas, bg=self.bg_color)
        
        # Grid 컬럼 크기 균등 설정 (반응형으로 동적 조절)
        self.current_columns = 4  # 기본 4컬럼
        self.configure_grid_columns()
        
        # 창 크기 변경 감지
        self.root.bind('<Configure>', self.on_window_resize)
        
        canvas.create_window((0, 0), window=self.student_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        self.student_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # 마우스 휠 스크롤 기능 추가 (캔버스에만 바인딩)
        def on_mousewheel(event):
            # 스크롤 가능한 내용이 있는지 확인
            if canvas.bbox("all") is None:
                return
            canvas_height = canvas.winfo_height()
            content_height = canvas.bbox("all")[3]
            
            # 실제 스크롤이 필요한 경우에만 스크롤
            if content_height > canvas_height:
                canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
        # 캔버스와 student_frame에만 마우스 휠 바인딩 (root는 제외)
        canvas.bind("<MouseWheel>", on_mousewheel)
        self.student_frame.bind("<MouseWheel>", on_mousewheel)
        
        # 캔버스 레퍼런스 저장 (반응형 레이아웃용)
        self.canvas = canvas
        
        self.student_widgets = {}
        self.current_data = {}
        
        # 브라우저 상태 모니터링 시작
        self.check_browser_status()
        
        # 세션 시간 업데이트 기능 제거됨
    
    def configure_grid_columns(self):
        """현재 컬럼 수에 따라 그리드 설정"""
        # 기존 컬럼 설정 초기화 (최대 10컬럼까지 지원)
        for i in range(10):
            self.student_frame.grid_columnconfigure(i, weight=0)
        
        # 현재 컬럼 수만큼 균등 설정
        for i in range(self.current_columns):
            self.student_frame.grid_columnconfigure(i, weight=1, uniform="col")
    
    def calculate_optimal_columns(self, width):
        """창 너비에 따른 최적 컬럼 수 계산 (화면 공간 최대 활용)"""
        card_width = 240  # 카드 + 여백 포함 예상 너비
        usable_width = width - 80   # 스크롤바, 패딩 제외 (여백 축소)
        
        # 화면 너비에 따라 동적으로 컬럼 수 계산
        max_possible_columns = max(1, usable_width // card_width)
        
        # 최대 8컬럼까지 지원 (너무 많으면 가독성 저하)
        return min(max_possible_columns, 8)
    
    def on_window_resize(self, event):
        """창 크기 변경 시 처리"""
        # root 창의 크기 변경만 처리 (다른 위젯 이벤트 무시)
        if event.widget != self.root:
            return
            
        # 새로운 최적 컬럼 수 계산
        new_columns = self.calculate_optimal_columns(event.width)
        
        # 컬럼 수가 변경된 경우에만 재배치
        if new_columns != self.current_columns:
            self.current_columns = new_columns
            self.configure_grid_columns()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 창 크기 변경: {event.width}px → {new_columns}컬럼 (최대 활용)")
            
            # 컬럼 수 변경 알림 (사용자 피드백)
            if hasattr(self, 'status_label') and new_columns > 5:
                self.root.after(2000, lambda: self.status_label.config(text=""))  # 2초 후 삭제
            
            # 학생 위젯이 있으면 재배치
            if self.student_widgets and self.monitoring:
                self.root.after(100, self.reposition_widgets)  # 약간의 지연 후 재배치
    
    def reposition_widgets(self):
        """현재 위젯들을 새로운 컬럼 수에 맞춰 재배치"""
        if not self.student_widgets:
            return
            
        # 현재 학생들을 active/departed로 분류
        active_students = []
        departed_students = []
        
        for name in self.student_widgets:
            student_info = self.students.get(name, {})
            if student_info.get('checked_out') or student_info.get('auto_checked_out'):
                departed_students.append(name)
            else:
                end = student_info.get('end_time', datetime.now())
                remain = (end - datetime.now()).total_seconds()
                active_students.append((name, remain))
        
        active_students.sort(key=lambda x: x[1])  # 시간 순 정렬
        
        # 기존 위젯들의 grid 위치만 재설정 (위젯 자체는 유지)
        self.reposition_existing_widgets([name for name, _ in active_students], departed_students)
    
    def reposition_existing_widgets(self, active_names, departed_names):
        """기존 위젯들의 위치만 재조정 (성능 최적화)"""
        row = 0
        col = 0
        max_cols = self.current_columns
        
        # 모든 위젯을 일시적으로 grid에서 제거
        for child in self.student_frame.winfo_children():
            child.grid_forget()
        
        # 1단계: 수업중인 학생들 재배치
        for name in active_names:
            if name in self.student_widgets:
                widget = self.student_widgets[name]['shadow_frame']
                widget.grid(row=row, column=col, padx=10, pady=8, sticky='nsew')
                
                col += 1
                if col >= max_cols:
                    col = 0
                    row += 1
        
        # 2단계: 구분선 (하원한 학생이 있을 경우)
        if departed_names:
            if col != 0:  # 현재 줄이 완성되지 않았으면 다음 줄로
                row += 1
                col = 0
            
            # 구분선 새로 생성
            separator = tk.Label(
                self.student_frame,
                text="━━━━━━━━━━ 🚪 하원한 학생들 ━━━━━━━━━━",
                bg=self.bg_color,
                fg='#9E9E9E',
                font=('맑은 고딕', 12, 'bold')
            )
            separator.grid(row=row, column=0, columnspan=max_cols, sticky='ew', pady=15)
            row += 1
            col = 0
        
        # 3단계: 하원한 학생들 재배치
        for name in departed_names:
            if name in self.student_widgets:
                widget = self.student_widgets[name]['shadow_frame']
                widget.grid(row=row, column=col, padx=10, pady=8, sticky='nsew')
                
                col += 1
                if col >= max_cols:
                    col = 0
                    row += 1
        
        # 캔버스 스크롤 영역 업데이트
        self.student_frame.update_idletasks()
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
    
    # 전체 학생 시간 조절 기능 제거됨
    
    # CSV 내보내기 기능 제거됨
    
    def check_browser_status(self):
        """브라우저 상태 주기적 체크"""
        if self.driver:
            try:
                # 브라우저가 살아있는지 확인
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
                    text=f"🔴 연결끊김({self.connection_errors})",
                    fg='#F44336'
                )
                
                # 최대 오류 횟수 초과시 모니터링 중지
                if self.connection_errors >= self.max_errors and self.monitoring:
                    self.handle_browser_crash()
        else:
            self.browser_alive = False
            self.connection_label.config(
                text="🔴 연결끊김",
                fg='#F44336'
            )
        
        # 오류 카운터 업데이트
        self.error_label.config(text=f"⚠️ 오류: {self.connection_errors}/{self.max_errors}")
        
        # 5초마다 체크
        self.root.after(5000, self.check_browser_status)
    
    def handle_browser_crash(self):
        """브라우저 크래시 처리"""
        self.monitoring = False
        self.status_label.config(text="⚠️ 연결끊김. 재시작 필요")
        
        # 버튼 상태 변경
        self.start_btn.config(state='disabled')
        self.restart_btn.config(state='normal')
        self.stop_btn.config(state='disabled')
        self.manual_login_btn.config(state='disabled')
        
        # 알림음
        winsound.Beep(800, 500)
        
        # 자동 재시작 옵션 제공
        if messagebox.askyesno("브라우저 오류", "브라우저 연결이 끊어졌습니다.\n자동으로 재시작하시겠습니까?"):
            self.restart_browser()
    
    def start_monitoring(self):
        """모니터링 시작"""
        self.start_btn.config(state='disabled')
        self.restart_btn.config(state='disabled')
        self.stop_btn.config(state='normal')
        self.status_label.config(text="브라우저 시작 중...")
        self.connection_errors = 0
        # 세션 시간 기록 제거됨
        
        thread = threading.Thread(target=self.run_browser, daemon=True)
        thread.start()
    
    def restart_browser(self):
        """브라우저 재시작"""
        # 기존 브라우저 종료
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
            self.driver = None
        
        self.monitoring = False
        self.browser_alive = False
        self.connection_errors = 0
        
        # 학생 데이터 초기화하지 않음 (이어서 모니터링)
        self.status_label.config(text="브라우저 재시작 중...")
        
        self.start_btn.config(state='disabled')
        self.restart_btn.config(state='disabled')
        self.stop_btn.config(state='normal')
        
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
        # 세션 시간 초기화 제거됨
        
        # 버튼 프레임 다시 보이기
        self.button_frame.pack(pady=15)
        
        self.start_btn.config(state='normal')
        self.restart_btn.config(state='disabled')
        self.stop_btn.config(state='disabled')
        self.manual_login_btn.config(state='disabled')
        
        self.status_label.config(text="정지됨")
        
        # 학생 위젯들 제거
        for widget_info in self.student_widgets.values():
            widget_info['shadow_frame'].destroy()
        self.student_widgets = {}
        self.students = {}
        
        self.count_label.config(text="👥 수업중: 0명")
        self.departed_label.config(text="🚪 하원: 0명")
    
    def run_browser(self):
        """브라우저 실행"""
        try:
            self.driver = webdriver.Chrome()
            self.driver.get("https://attok.co.kr/")
            self.browser_alive = True
            
            self.root.after(0, lambda: self.status_label.config(text="🌐 브라우저에서 로그인 후 '로그인 완료' 버튼을 눌러주세요"))
            self.root.after(0, lambda: self.manual_login_btn.config(state='normal'))
            self.root.after(0, self.start_login_button_blink)  # 깜빡임 시작
                
        except Exception as e:
            self.root.after(0, lambda: self.status_label.config(text=f"❌ 브라우저 시작 실패: {str(e)}"))
            self.root.after(0, lambda: self.start_btn.config(state='normal'))
            self.root.after(0, lambda: self.stop_btn.config(state='disabled'))
    
    def start_login_button_blink(self):
        """로그인 완료 버튼 깜빡임 시작"""
        self.login_blinking = True
        self.blink_login_button()
    
    def stop_login_button_blink(self):
        """로그인 완료 버튼 깜빡임 중지"""
        self.login_blinking = False
        self.manual_login_btn.config(bg=self.original_login_bg)
    
    def blink_login_button(self):
        """로그인 완료 버튼 깜빡임 효과"""
        if not self.login_blinking:
            return
            
        if self.login_blink_state:
            # 밝은 색으로 변경 (강조)
            self.manual_login_btn.config(bg='#00d26a')  # Discord Green
        else:
            # 원래 색으로 변경
            self.manual_login_btn.config(bg=self.original_login_bg)
        
        self.login_blink_state = not self.login_blink_state
        
        # 500ms마다 깜빡임 반복
        if self.login_blinking:
            self.root.after(500, self.blink_login_button)
    
    def confirm_manual_login(self):
        """수동 로그인 완료 확인"""
        self.stop_login_button_blink()  # 깜빡임 중지
        self.manual_login_btn.config(state='disabled')
        self.start_monitoring_after_login()
    
    def start_monitoring_after_login(self):
        """로그인 후 모니터링 시작"""
        self.status_label.config(text="🚀 모니터링 시작 중...")
        thread = threading.Thread(target=self.start_monitoring_loop, daemon=True)
        thread.start()
    
    def start_monitoring_loop(self):
        """모니터링 루프 시작"""
        self.monitoring = True
        self.logged_in = True
        
        # 브라우저 창 최소화
        try:
            self.driver.minimize_window()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 브라우저 창 최소화 완료")
        except Exception as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 브라우저 창 최소화 실패: {e}")
        
        # 버튼 프레임 숨기기 (공간 확보)
        self.root.after(0, lambda: self.button_frame.pack_forget())
        
        self.root.after(0, lambda: self.status_label.config(text=""))
        
        self.monitor_thread()
    
    def monitor_thread(self):
        """모니터링 스레드 - 10초마다 새로고침 + 데이터 확인"""
        while self.monitoring:
            try:
                # 브라우저 상태 확인
                if not self.browser_alive:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 브라우저 연결 끊김 감지")
                    break
                
                # 매번 데이터 확인 전에 새로고침 (키오스크 출결 반영 보장)
                try:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 페이지 새로고침 (키오스크 출결 감지용)")
                    self.driver.refresh()
                    time.sleep(1.5)  # 새로고침 후 로딩 대기 (단축)
                except Exception as e:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 새로고침 실패: {e}")
                
                # 새로고침 직후 최신 데이터 확인
                students = self.get_students()
                self.current_data = students
                
                # 데이터 변경 확인
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
                
                time.sleep(5)  # 오류 발생시 짧은 대기
    
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
                parsed_time = datetime.combine(today, datetime.min.time().replace(hour=hour, minute=minute))
                return parsed_time
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
        """학생 정보 추출 - 오류 처리 강화"""
        result = {}
        
        try:
            # 브라우저 상태 재확인
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
    
    def create_student_widget(self, name):
        """학생 카드 위젯 생성 - 정사각형 카드 스타일"""
        # 모던 그림자 효과를 위한 외부 프레임
        shadow_frame = tk.Frame(
            self.student_frame,
            bg='#0f0f0f',  # 진한 그레이 그림자
            width=226,
            height=206
        )
        shadow_frame.pack_propagate(False)
        
        # 카드 메인 프레임 (모던 Discord 스타일)
        card_frame = tk.Frame(
            shadow_frame,
            bg='#2d2d30',  # Discord 카드 색상
            relief=tk.FLAT,  # 평면으로 변경
            borderwidth=1,
            width=220,
            height=200,
            highlightbackground='#40444b',  # 부드러운 테두리
            highlightthickness=1
        )
        card_frame.pack_propagate(False)  # 크기 고정
        card_frame.place(x=3, y=3)  # 그림자 효과 위치
        
        # 학생 이름 (상단 중앙)
        name_label = tk.Label(
            card_frame,
            text=name[:8],  # 이름 길이 제한
            font=('맑은 고딕', 16, 'bold'),
            bg='#2d2d30',
            fg='#ffffff',  # 순백색으로 더 선명하게
            anchor='center'
        )
        name_label.pack(pady=(15, 5), fill='x')
        
        # 남은 시간 (중간, 크게 표시)
        remain_label = tk.Label(
            card_frame,
            text="로딩중...",
            font=('맑은 고딕', 18, 'bold'),
            bg='#2d2d30',
            fg='#00d26a',  # 기본값으로 Fresh Green
            anchor='center',
            wraplength=200,
            justify='center'
        )
        remain_label.pack(pady=(0, 5), fill='x')
        
        # 등원시간
        time_label = tk.Label(
            card_frame,
            text="등원시간",
            font=('맑은 고딕', 11),
            bg='#2d2d30',
            fg='#72767d',  # Discord 부제목 색상
            anchor='center'
        )
        time_label.pack(pady=(0, 2), fill='x')
        
        # 하원 예정 시간
        checkout_label = tk.Label(
            card_frame,
            text="하원예정",
            font=('맑은 고딕', 11),
            bg='#2d2d30',
            fg='#72767d',  # Discord 부제목 색상
            anchor='center'
        )
        checkout_label.pack(pady=(0, 8), fill='x')
        
        # 시간 조절 버튼 (최하단)
        btn_frame = tk.Frame(card_frame, bg='#2d2d30')
        btn_frame.pack(side='bottom', pady=(0, 10))
        
        minus_btn = tk.Button(
            btn_frame,
            text="- 10분",
            font=('맑은 고딕', 10, 'bold'),
            bg='#F44336',
            fg='white',
            command=lambda: self.adjust_student_time(name, -10),
            width=6,
            height=1,
            relief=tk.RAISED,
            borderwidth=2
        )
        minus_btn.pack(side='left', padx=6)
        
        plus_btn = tk.Button(
            btn_frame,
            text="+ 10분",
            font=('맑은 고딕', 10, 'bold'),
            bg='#2196F3',
            fg='white',
            command=lambda: self.adjust_student_time(name, 10),
            width=6,
            height=1,
            relief=tk.RAISED,
            borderwidth=2
        )
        plus_btn.pack(side='left', padx=6)
        
        return {
            'shadow_frame': shadow_frame,
            'frame': card_frame,
            'name': name_label,
            'time': time_label,
            'checkout_time': checkout_label,
            'remain': remain_label,
            'buttons': btn_frame,
            'minus_btn': minus_btn,
            'plus_btn': plus_btn
        }
    
    def update_single_student(self, name):
        """개별 학생 위젯 업데이트"""
        if name not in self.student_widgets or name not in self.students:
            return
            
        widget = self.student_widgets[name]
        student_info = self.students[name]
        
        # 출석 시간 표시
        check_in_time = student_info['actual_check_in_time']
        widget['time'].config(text=f"등원: {check_in_time.strftime('%H:%M')}")
        
        # 하원 예정 시간 표시 (하원하지 않은 경우)
        if not student_info.get('checked_out'):
            end_time = student_info['end_time']
            widget['checkout_time'].config(text=f"하원예정: {end_time.strftime('%H:%M')}")
        
        # 하원한 경우 (최우선 처리)
        if student_info.get('checked_out'):
            widget['frame'].config(bg='#1e1e1e', highlightbackground='#2d2d30')
            widget['name'].config(bg='#1e1e1e')
            widget['time'].config(bg='#1e1e1e', fg='#72767d')
            widget['checkout_time'].config(bg='#1e1e1e', fg='#72767d')
            widget['remain'].config(bg='#1e1e1e')
            widget['buttons'].config(bg='#1e1e1e')
            
            if student_info.get('actual_check_out_time'):
                check_out = student_info['actual_check_out_time']
                widget['remain'].config(
                    text=f"하원 완료\n{check_out.strftime('%H:%M')}",
                    fg='#72767d'
                )
                widget['checkout_time'].config(text=f"실제하원: {check_out.strftime('%H:%M')}")
            else:
                widget['remain'].config(text="하원 완료", fg='#BDBDBD')
                widget['checkout_time'].config(text="하원 완료")
            
            widget['minus_btn'].config(state='disabled')
            widget['plus_btn'].config(state='disabled')
            return  # 하원한 경우 여기서 종료 (더 이상 처리하지 않음)
        else:
            # 수업 중인 경우
            end = student_info['end_time']
            remain = end - datetime.now()
            
            widget['minus_btn'].config(state='normal')
            widget['plus_btn'].config(state='normal')
            
            if remain.total_seconds() > 0:
                total_minutes = int(remain.total_seconds() // 60)
                
                if total_minutes >= 60:
                    hours = total_minutes // 60
                    minutes = total_minutes % 60
                    time_text = f"{hours}시간 {minutes}분"
                else:
                    time_text = f"{total_minutes}분"
                
                # 시간 기반 부드러운 색상 그라데이션 계산
                bg_color, fg_color, border_color = get_time_based_colors(total_minutes)
                checkout_fg = '#b9bbbe'  # 하원예정 시간 색상은 일관되게 유지
                
                widget['frame'].config(bg=bg_color, highlightbackground=border_color)
                widget['name'].config(bg=bg_color, fg='white')
                widget['time'].config(bg=bg_color, fg='lightgreen')
                widget['checkout_time'].config(bg=bg_color, fg=checkout_fg)
                widget['remain'].config(bg=bg_color, text=time_text, fg=fg_color)
                widget['buttons'].config(bg=bg_color)
            else:
                # 수업시간 종료 - 자동 하원 처리
                if not student_info.get('auto_checked_out'):
                    # 자동 하원으로 상태 변경
                    self.students[name]['checked_out'] = True
                    self.students[name]['auto_checked_out'] = True  # 자동 하원 표시
                    self.students[name]['actual_check_out_time'] = end  # 예상 하원 시간으로 설정
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] {name} 자동 하원 처리됨")
                    # 자동 하원 후 위젯 재정렬 필요 플래그 설정
                    if not hasattr(self, 'need_reorder'):
                        self.need_reorder = True
                
                # 하원 상태로 표시 (자동 하원)
                widget['frame'].config(bg='#1e1e1e', highlightbackground='#2d2d30')
                widget['name'].config(bg='#1e1e1e')
                widget['time'].config(bg='#1e1e1e', fg='#72767d')
                widget['checkout_time'].config(bg='#1e1e1e', fg='#72767d')
                widget['remain'].config(bg='#1e1e1e')
                widget['buttons'].config(bg='#1e1e1e')
                
                expected_time = end.strftime('%H:%M')
                widget['remain'].config(
                    text=f"하원 완료\n{expected_time}",
                    fg='#72767d'
                )
                widget['checkout_time'].config(text=f"예정하원: {expected_time}")
                
                widget['minus_btn'].config(state='disabled')
                widget['plus_btn'].config(state='disabled')
                
                # 알림음은 한 번만 (실제 시간 초과 시점에)
                if not student_info.get('alerted'):
                    winsound.Beep(1000, 300)
                    self.students[name]['alerted'] = True
    
    def update_time_only(self):
        """시간 표시만 업데이트 - 자동 하원도 처리"""
        auto_checkout_happened = False
        
        for name in list(self.student_widgets.keys()):  # list()로 복사본 생성
            if name in self.students:
                student_info = self.students[name]
                widget = self.student_widgets[name]
                
                if not student_info.get('checked_out'):
                    end = student_info['end_time']
                    remain = end - datetime.now()
                    
                    if remain.total_seconds() > 0:
                        total_minutes = int(remain.total_seconds() // 60)
                        
                        if total_minutes >= 60:
                            hours = total_minutes // 60
                            minutes = total_minutes % 60
                            time_text = f"{hours}시간 {minutes}분"
                        else:
                            time_text = f"{total_minutes}분"
                        
                        # 시간 변화에 따른 부드러운 색상 업데이트
                        bg_color, fg_color, border_color = get_time_based_colors(total_minutes)
                        
                        # 색상 실시간 업데이트 (부드러운 그라데이션)
                        widget['frame'].config(bg=bg_color, highlightbackground=border_color)
                        widget['name'].config(bg=bg_color)
                        widget['time'].config(bg=bg_color)
                        widget['checkout_time'].config(bg=bg_color)
                        widget['remain'].config(bg=bg_color, text=time_text, fg=fg_color)
                        widget['buttons'].config(bg=bg_color)
                        
                        current_text = widget['remain'].cget('text')
                        if current_text != time_text and "하원" not in current_text:
                            widget['remain'].config(text=time_text, fg=fg_color)
                    else:
                        # 시간이 지났으면 즉시 자동 하원 처리
                        if not student_info.get('auto_checked_out'):
                            self.students[name]['checked_out'] = True
                            self.students[name]['auto_checked_out'] = True
                            self.students[name]['actual_check_out_time'] = end
                            auto_checkout_happened = True
                            print(f"[{datetime.now().strftime('%H:%M:%S')}] {name} 시간 업데이트 중 자동 하원 처리")
        
        # 자동 하원이 발생했으면 전체 UI 재정렬
        if auto_checkout_happened:
            self.root.after(100, self.trigger_full_update)
    
    def update_ui(self, current_data):
        """UI 업데이트"""
        checked_in_students = {name: data for name, data in current_data.items() 
                              if data.get('checked_in', False)}
        
        # 새로 출석한 학생 처리
        new_students = False
        for name in checked_in_students:
            data = checked_in_students[name]
            
            # 등원 알림 처리 (새로 등원한 학생, 초기 로딩 중 제외)
            print(f"[DEBUG] {name}: in_students={name not in self.students}, not_notified={name not in self.notified_arrivals}, not_loading={not self.initial_loading}")
            if name not in self.students and name not in self.notified_arrivals and not self.initial_loading:
                self.notified_arrivals.add(name)
                print(f"[알림] {name} 등원")
                # 별도 스레드에서 알림음 재생 (기존 기능 차단 방지)
                threading.Thread(target=play_notification_sound, args=("arrival", name), daemon=True).start()
            
            if name not in self.students:
                new_students = True
                actual_check_in = self.parse_time(data.get('check_in_time', ''))
                if actual_check_in is None:
                    actual_check_in = datetime.now()
                
                end_time = actual_check_in + timedelta(minutes=self.default_class_minutes)
                
                # 로그인 시점에 이미 수업시간이 지났으면 alerted를 True로 설정 (알림음 방지)
                already_ended = end_time < datetime.now()
                
                self.students[name] = {
                    'checked_in': True,
                    'actual_check_in_time': actual_check_in,
                    'class_minutes': self.default_class_minutes,
                    'end_time': end_time,
                    'checked_out': data.get('checked_out', False),
                    'check_out_time': data.get('check_out_time', ''),
                    'actual_check_out_time': None,
                    'alerted': already_ended  # 이미 끝났으면 알림 안함
                }
            
            # 하원 정보 업데이트
            if data.get('checked_out') and not self.students[name].get('checked_out'):
                print(f"[DEBUG] {name} 하원 감지됨! 알림 조건 확인 중...")
                self.students[name]['checked_out'] = True
                self.students[name]['check_out_time'] = data.get('check_out_time', '')
                self.students[name]['actual_check_out_time'] = self.parse_time(data.get('check_out_time', ''))
                
                # 하원 알림 처리 (실제 하원한 학생, 중복 방지)
                is_not_notified = name not in self.notified_departures
                print(f"[DEBUG] {name} 하원 알림 조건: is_not_notified={is_not_notified}")
                
                if is_not_notified:
                    self.notified_departures.add(name)
                    print(f"[알림] {name} 하원 - 음성 알림 시작!")
                    # 별도 스레드에서 알림음 재생
                    threading.Thread(target=play_notification_sound, args=("departure", name), daemon=True).start()
                else:
                    print(f"[DEBUG] {name} 하원 알림 중복 - 이미 알림 완료된 학생")
        
        # 위젯 순서 결정
        active_students = []
        departed_students = []
        
        for name in checked_in_students:
            student_info = self.students.get(name, {})
            # 실제 하원 또는 자동 하원 처리된 학생들
            if student_info.get('checked_out') or student_info.get('auto_checked_out'):
                departed_students.append(name)
            else:
                end = student_info.get('end_time', datetime.now())
                remain = (end - datetime.now()).total_seconds()
                active_students.append((name, remain))
        
        active_students.sort(key=lambda x: x[1])
        ordered_names = [name for name, _ in active_students] + departed_students
        
        # 위젯 재배치가 필요한 경우
        current_order = list(self.student_widgets.keys())
        if new_students or ordered_names != current_order:
            # 기존 위젯과 구분선 모두 제거
            for child in self.student_frame.winfo_children():
                child.destroy()
            self.student_widgets = {}
            self.last_widget_update = {}
            
            # 위젯 재생성 - 반응형 카드 격자 형태로 배치
            row = 0
            col = 0
            max_cols = self.current_columns  # 현재 설정된 컬럼 수 사용
            
            # 1단계: 수업중인 학생들을 남은 시간 적은 순으로 좌→우 배치
            active_names = [name for name, _ in active_students]  # 이미 시간순 정렬됨
            for name in active_names:
                widget = self.create_student_widget(name)
                widget['shadow_frame'].grid(row=row, column=col, padx=10, pady=8, sticky='nsew')
                self.student_widgets[name] = widget
                
                col += 1
                if col >= max_cols:
                    col = 0
                    row += 1
            
            # 2단계: 구분선 (하원한 학생이 있을 경우만)
            if departed_students:
                if col != 0:  # 현재 줄이 완성되지 않았으면 다음 줄로
                    row += 1
                    col = 0
                    
                separator = tk.Label(
                    self.student_frame, 
                    text="━━━━━━━━━━ 🚪 하원한 학생들 ━━━━━━━━━━", 
                    bg=self.bg_color, 
                    fg='#72767d',  # Discord 부제목 색상
                    font=('맑은 고딕', 12, 'bold')
                )
                separator.grid(row=row, column=0, columnspan=max_cols, sticky='ew', pady=15)
                row += 1
                col = 0
            
            # 3단계: 하원한 학생들 배치
            for name in departed_students:
                widget = self.create_student_widget(name)
                widget['shadow_frame'].grid(row=row, column=col, padx=10, pady=8, sticky='nsew')
                self.student_widgets[name] = widget
                
                col += 1
                if col >= max_cols:
                    col = 0
                    row += 1
        
        # 각 학생 위젯 업데이트 (자동 하원 처리 포함)
        for name in self.student_widgets:
            self.update_single_student(name)
        
        # 자동 하원 처리 후 순서가 바뀌었을 수 있으므로 다시 체크
        self.root.after(100, self.reorder_if_needed)
        
        # 실제 상태 기준으로 통계 재계산
        self.update_statistics()
        
        # 초기 로딩 완료 (첫 번째 UI 업데이트 후)
        if self.initial_loading:
            # 초기 로딩 시 이미 존재하는 모든 학생을 알림 제외 목록에 추가
            for name in checked_in_students:
                self.notified_arrivals.add(name)  # 등원 알림 제외
                data = checked_in_students[name]
                if data.get('checked_out', False):
                    self.notified_departures.add(name)  # 하원 알림 제외 (이미 하원한 경우)
                    # already_departed는 초기 로딩시에는 추가하지 않음 (실시간 하원 감지를 위해)
            
            self.initial_loading = False
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 초기 로딩 완료 - 기존 학생 {len(checked_in_students)}명 알림 제외, 이후부터 실시간 알림 활성화")
    
    def update_statistics(self):
        """실제 학생 상태를 기반으로 통계 업데이트"""
        active_count = 0
        departed_count = 0
        
        for name, student_info in self.students.items():
            # 실제 하원 또는 자동 하원 처리된 학생들
            if student_info.get('checked_out') or student_info.get('auto_checked_out'):
                departed_count += 1
            else:
                active_count += 1
        
        self.count_label.config(text=f"👥 수업중: {active_count}명")
        self.departed_label.config(text=f"🚪 하원: {departed_count}명")
    
    def reorder_if_needed(self):
        """자동 하원 처리 후 순서 재정렬이 필요한지 확인"""
        current_active = []
        current_departed = []
        
        for name in self.student_widgets:
            student_info = self.students.get(name, {})
            if student_info.get('checked_out') or student_info.get('auto_checked_out'):
                current_departed.append(name)
            else:
                end = student_info.get('end_time', datetime.now())
                remain = (end - datetime.now()).total_seconds()
                current_active.append((name, remain))
        
        current_active.sort(key=lambda x: x[1])
        expected_order = [name for name, _ in current_active] + current_departed
        actual_order = list(self.student_widgets.keys())
        
        # 순서가 다르면 위젯 재배치
        if expected_order != actual_order:
            self.rebuild_widgets(current_active, current_departed)
    
    def rebuild_widgets(self, active_students, departed_students):
        """위젯 순서 재구축 - 반응형 카드 격자 형태"""
        # 기존 위젯과 구분선 모두 제거
        for child in self.student_frame.winfo_children():
            child.destroy()
        self.student_widgets = {}
        
        row = 0
        col = 0
        max_cols = self.current_columns  # 현재 설정된 컬럼 수 사용
        
        # 수업중인 학생들을 시간순으로 배치
        for name, _ in active_students:
            widget = self.create_student_widget(name)
            widget['shadow_frame'].grid(row=row, column=col, padx=10, pady=8, sticky='nsew')
            self.student_widgets[name] = widget
            self.update_single_student(name)  # 즉시 상태 적용
            
            col += 1
            if col >= max_cols:
                col = 0
                row += 1
        
        # 구분선
        if departed_students:
            if col != 0:  # 현재 줄이 완성되지 않았으면 다음 줄로
                row += 1
                col = 0
                
            separator = tk.Label(
                self.student_frame, 
                text="━━━━━━━━━━ 🚪 하원한 학생들 ━━━━━━━━━━", 
                bg=self.bg_color, 
                fg='#9E9E9E',
                font=('맑은 고딕', 12, 'bold')
            )
            separator.grid(row=row, column=0, columnspan=max_cols, sticky='ew', pady=15)
            row += 1
            col = 0
        
        # 하원한 학생들 배치
        for name in departed_students:
            widget = self.create_student_widget(name)
            widget['shadow_frame'].grid(row=row, column=col, padx=10, pady=8, sticky='nsew')
            self.student_widgets[name] = widget
            self.update_single_student(name)  # 즉시 상태 적용
            
            col += 1
            if col >= max_cols:
                col = 0
                row += 1
        
    def trigger_full_update(self):
        """전체 UI 업데이트 트리거 (자동 하원 후 재정렬용)"""
        if self.monitoring:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 자동 하원으로 인한 전체 UI 재구성")
            self.update_ui(self.current_data)
    
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
    app = FinalAttendanceGUI()
    app.run()