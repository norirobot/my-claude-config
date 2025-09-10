"""
카드 스타일 출결 모니터링 시스템
정사각형 박스 그리드 레이아웃, 남은 시간별 색상 구분
"""
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from datetime import datetime, timedelta
import winsound
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, NoSuchWindowException, TimeoutException
import hashlib
import csv
import os
import math

class CardStyleAttendanceGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("출결 모니터링 시스템 (카드 스타일)")
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
        
        # 로그 및 통계
        self.session_start_time = None
        
        # 카드 스타일 설정
        self.card_width = 200
        self.card_height = 160
        self.cards_per_row = 6  # 한 줄에 6개씩
        
        self.setup_ui()
        
    def setup_ui(self):
        """UI 설정"""
        # 제목
        title = tk.Label(
            self.root,
            text="📚 출결 모니터링 시스템 (카드 스타일)",
            font=('맑은 고딕', 24, 'bold'),
            bg=self.bg_color,
            fg=self.fg_color
        )
        title.pack(pady=20)
        
        # 상태 표시 프레임
        status_main_frame = tk.Frame(self.root, bg=self.bg_color)
        status_main_frame.pack(pady=10, fill='x')
        
        # 연결 상태
        self.connection_label = tk.Label(
            status_main_frame,
            text="🔴 브라우저 연결 안됨",
            font=('맑은 고딕', 16, 'bold'),
            bg=self.bg_color,
            fg='#F44336'
        )
        self.connection_label.pack()
        
        
        # 버튼 프레임
        button_frame = tk.Frame(self.root, bg=self.bg_color)
        button_frame.pack(pady=15)
        
        # 첫 번째 줄 버튼들
        top_buttons = tk.Frame(button_frame, bg=self.bg_color)
        top_buttons.pack()
        
        # 시작 버튼
        self.start_btn = tk.Button(
            top_buttons,
            text="▶ 시작",
            font=('맑은 고딕', 14, 'bold'),
            bg='#4CAF50',
            fg='white',
            command=self.start_monitoring,
            width=12,
            height=2
        )
        self.start_btn.pack(side='left', padx=5)
        
        # 재시작 버튼
        self.restart_btn = tk.Button(
            top_buttons,
            text="🔄 재시작",
            font=('맑은 고딕', 14, 'bold'),
            bg='#FF9800',
            fg='white',
            command=self.restart_browser,
            width=12,
            height=2,
            state='disabled'
        )
        self.restart_btn.pack(side='left', padx=5)
        
        # 정지 버튼
        self.stop_btn = tk.Button(
            top_buttons,
            text="⏹ 정지",
            font=('맑은 고딕', 14, 'bold'),
            bg='#F44336',
            fg='white',
            command=self.stop_monitoring,
            width=12,
            height=2,
            state='disabled'
        )
        self.stop_btn.pack(side='left', padx=5)
        
        # 로그인 완료 버튼
        self.manual_login_btn = tk.Button(
            top_buttons,
            text="✓ 로그인 완료",
            font=('맑은 고딕', 14, 'bold'),
            bg='#2196F3',
            fg='white',
            command=self.confirm_manual_login,
            width=15,
            height=2,
            state='disabled'
        )
        self.manual_login_btn.pack(side='left', padx=5)
        
        # 두 번째 줄 버튼들
        bottom_buttons = tk.Frame(button_frame, bg=self.bg_color)
        bottom_buttons.pack(pady=(10, 0))
        
        # 내보내기 버튼
        self.export_btn = tk.Button(
            bottom_buttons,
            text="📄 CSV 내보내기",
            font=('맑은 고딕', 12),
            bg='#607D8B',
            fg='white',
            command=self.export_to_csv,
            width=15,
            height=1
        )
        self.export_btn.pack(padx=5)
        
        # 상태 표시
        self.status_label = tk.Label(
            self.root,
            text="대기 중... 시작 버튼을 눌러주세요",
            font=('맑은 고딕', 14),
            bg=self.bg_color,
            fg=self.fg_color
        )
        self.status_label.pack(pady=(0, 10))
        
        # 통계 프레임
        stats_frame = tk.Frame(self.root, bg=self.bg_color)
        stats_frame.pack(pady=10)
        
        self.count_label = tk.Label(
            stats_frame,
            text="👥 수업중: 0명",
            font=('맑은 고딕', 16, 'bold'),
            bg=self.bg_color,
            fg='#4CAF50'
        )
        self.count_label.pack(side='left', padx=20)
        
        self.departed_label = tk.Label(
            stats_frame,
            text="🚪 하원: 0명",
            font=('맑은 고딕', 16, 'bold'),
            bg=self.bg_color,
            fg='#9E9E9E'
        )
        self.departed_label.pack(side='left', padx=20)
        
        # 오류 카운터
        self.error_label = tk.Label(
            stats_frame,
            text="⚠️ 오류: 0/3",
            font=('맑은 고딕', 14),
            bg=self.bg_color,
            fg='#FFB74D'
        )
        self.error_label.pack(side='left', padx=20)
        
        # 메인 컨테이너 (스크롤 가능)
        main_container = tk.Frame(self.root, bg=self.bg_color)
        main_container.pack(fill='both', expand=True, padx=20, pady=10)
        
        # 캔버스와 스크롤바
        self.canvas = tk.Canvas(main_container, bg=self.bg_color, highlightthickness=0)
        scrollbar = ttk.Scrollbar(main_container, orient="vertical", command=self.canvas.yview)
        
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
        self.active_section.pack(fill='x', pady=(0, 20), padx=10)
        
        # 수업중 학생 그리드 프레임 (중앙 정렬)
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
        self.departed_section.pack(fill='x', pady=10, padx=10)
        
        # 하원 학생 그리드 프레임 (중앙 정렬)
        self.departed_grid_frame = tk.Frame(self.departed_section, bg=self.bg_color)
        self.departed_grid_frame.pack(expand=True, padx=15, pady=15)
        
        self.student_widgets = {}
        self.current_data = {}
        
        # 브라우저 상태 모니터링 시작
        self.check_browser_status()
        
    
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
        card_frame.pack_propagate(False)  # 고정 크기 유지
        
        # 학생 이름 (상단, 중간 사이즈)
        name_label = tk.Label(
            card_frame,
            text=name[:12],  # 이름 길이 제한
            font=('맑은 고딕', 14, 'bold'),
            fg='white',
            wraplength=180
        )
        name_label.pack(pady=(10, 5))
        
        # 남은 시간 (중간, 큰 사이즈)
        time_label = tk.Label(
            card_frame,
            text="",
            font=('맑은 고딕', 18, 'bold'),
            fg='yellow'
        )
        time_label.pack(pady=5)
        
        # 등원 시간 (중간 하단, 작은 사이즈)
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
        # 메인 카드 프레임 (하원용 - 조금 더 작게)
        card_frame = tk.Frame(
            parent_frame,
            width=180,
            height=120,
            bg='#424242',  # 회색 배경
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
    
    
    def adjust_all_students(self, minutes):
        """모든 학생 시간 일괄 조절"""
        if not self.students:
            messagebox.showinfo("알림", "현재 모니터링 중인 학생이 없습니다.")
            return
        
        count = 0
        for name in self.students:
            if not self.students[name].get('checked_out'):
                self.adjust_student_time(name, minutes)
                count += 1
        
        action = "연장" if minutes > 0 else "단축"
        messagebox.showinfo("완료", f"{count}명의 학생 수업시간을 {abs(minutes)}분 {action}했습니다.")
    
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
    
    def check_browser_status(self):
        """브라우저 상태 주기적 체크"""
        if self.driver:
            try:
                self.driver.current_url
                self.browser_alive = True
                self.connection_errors = 0
                self.connection_label.config(
                    text="🟢 브라우저 연결됨",
                    fg='#4CAF50'
                )
            except (WebDriverException, NoSuchWindowException):
                self.browser_alive = False
                self.connection_errors += 1
                self.connection_label.config(
                    text=f"🔴 브라우저 연결 끊김 (오류: {self.connection_errors})",
                    fg='#F44336'
                )
                
                if self.connection_errors >= self.max_errors and self.monitoring:
                    self.handle_browser_crash()
        else:
            self.browser_alive = False
            self.connection_label.config(
                text="🔴 브라우저 연결 안됨",
                fg='#F44336'
            )
        
        self.error_label.config(text=f"⚠️ 오류: {self.connection_errors}/{self.max_errors}")
        self.root.after(5000, self.check_browser_status)
    
    def handle_browser_crash(self):
        """브라우저 크래시 처리"""
        self.monitoring = False
        self.status_label.config(text="⚠️ 브라우저 연결이 끊어졌습니다. 재시작이 필요합니다.")
        
        self.start_btn.config(state='disabled')
        self.restart_btn.config(state='normal')
        self.stop_btn.config(state='disabled')
        self.manual_login_btn.config(state='disabled')
        
        winsound.Beep(800, 500)
        
        if messagebox.askyesno("브라우저 오류", "브라우저 연결이 끊어졌습니다.\n자동으로 재시작하시겠습니까?"):
            self.restart_browser()
    
    def start_monitoring(self):
        """모니터링 시작"""
        self.start_btn.config(state='disabled')
        self.restart_btn.config(state='disabled')
        self.stop_btn.config(state='normal')
        self.status_label.config(text="브라우저 시작 중...")
        self.connection_errors = 0
        self.session_start_time = datetime.now()
        
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
        self.session_start_time = None
        
        self.start_btn.config(state='normal')
        self.restart_btn.config(state='disabled')
        self.stop_btn.config(state='disabled')
        self.manual_login_btn.config(state='disabled')
        
        self.status_label.config(text="정지됨")
        
        # 학생 위젯들 제거
        for widget_info in self.student_widgets.values():
            widget_info['frame'].destroy()
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
                
        except Exception as e:
            self.root.after(0, lambda: self.status_label.config(text=f"❌ 브라우저 시작 실패: {str(e)}"))
            self.root.after(0, lambda: self.start_btn.config(state='normal'))
            self.root.after(0, lambda: self.stop_btn.config(state='disabled'))
    
    def confirm_manual_login(self):
        """수동 로그인 완료 확인"""
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
        self.root.after(0, lambda: self.status_label.config(text="✅ 모니터링 중..."))
        
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
                
            self.driver.current_url
            
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
            if 'duration' in widget:  # 하원 카드
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
            if 'time' in widget:  # 수업중 카드
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
        """UI 업데이트 - 카드 스타일 그리드 배치"""
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
            
            # 하원 정보 업데이트
            if data.get('checked_out') and not self.students[name].get('checked_out'):
                self.students[name]['checked_out'] = True
                self.students[name]['check_out_time'] = data.get('check_out_time', '')
                self.students[name]['actual_check_out_time'] = self.parse_time(data.get('check_out_time', ''))
        
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
        
        # 남은 시간 순으로 정렬 (적게 남은 순서)
        active_students.sort(key=lambda x: x[1])
        active_student_names = [name for name, _ in active_students]
        
        # 기존 위젯 제거
        for widget_info in self.student_widgets.values():
            widget_info['frame'].destroy()
        self.student_widgets = {}
        
        # 수업중인 학생 카드 배치 (그리드)
        for idx, name in enumerate(active_student_names):
            row = idx // self.cards_per_row
            col = idx % self.cards_per_row
            
            widget = self.create_active_student_card(name, self.active_grid_frame)
            widget['frame'].grid(row=row, column=col, padx=10, pady=10, sticky='nw')
            self.student_widgets[name] = widget
        
        # 하원한 학생 카드 배치 (그리드)
        for idx, name in enumerate(departed_students):
            row = idx // self.cards_per_row
            col = idx % self.cards_per_row
            
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
    app = CardStyleAttendanceGUI()
    app.run()