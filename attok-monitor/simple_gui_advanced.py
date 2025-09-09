"""
고급 GUI 출결 모니터링
개별 시간 조절, 정렬, 하원 표시
"""
import tkinter as tk
from tkinter import ttk
import threading
import time
from datetime import datetime, timedelta
import winsound
from selenium import webdriver
from selenium.webdriver.common.by import By

class AdvancedAttendanceGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("출결 모니터링 시스템")
        self.root.geometry("1000x700")
        
        # 다크 테마
        self.bg_color = '#2b2b2b'
        self.fg_color = '#ffffff'
        self.card_color = '#3c3c3c'
        
        self.root.configure(bg=self.bg_color)
        
        self.students = {}
        self.driver = None
        self.monitoring = False
        self.logged_in = False
        self.default_class_minutes = 90  # 기본 1시간 30분
        
        self.setup_ui()
        
    def setup_ui(self):
        """UI 설정"""
        # 제목
        title = tk.Label(
            self.root,
            text="출결 모니터링 시스템",
            font=('맑은 고딕', 20, 'bold'),
            bg=self.bg_color,
            fg=self.fg_color
        )
        title.pack(pady=10)
        
        # 버튼 프레임
        button_frame = tk.Frame(self.root, bg=self.bg_color)
        button_frame.pack(pady=10)
        
        # 시작 버튼
        self.start_btn = tk.Button(
            button_frame,
            text="▶ 시작",
            font=('맑은 고딕', 14),
            bg='#4CAF50',
            fg='white',
            command=self.start_monitoring,
            width=15,
            height=2
        )
        self.start_btn.pack(side='left', padx=5)
        
        # 로그인 완료 버튼
        self.login_btn = tk.Button(
            button_frame,
            text="✓ 로그인 완료",
            font=('맑은 고딕', 14),
            bg='#2196F3',
            fg='white',
            command=self.confirm_login,
            width=15,
            height=2,
            state='disabled'
        )
        self.login_btn.pack(side='left', padx=5)
        
        # 상태 표시
        self.status_label = tk.Label(
            self.root,
            text="대기 중...",
            font=('맑은 고딕', 12),
            bg=self.bg_color,
            fg=self.fg_color
        )
        self.status_label.pack()
        
        # 통계 프레임
        stats_frame = tk.Frame(self.root, bg=self.bg_color)
        stats_frame.pack(pady=5)
        
        self.count_label = tk.Label(
            stats_frame,
            text="출석: 0명",
            font=('맑은 고딕', 12, 'bold'),
            bg=self.bg_color,
            fg='#4CAF50'
        )
        self.count_label.pack(side='left', padx=10)
        
        self.departed_label = tk.Label(
            stats_frame,
            text="하원: 0명",
            font=('맑은 고딕', 12, 'bold'),
            bg=self.bg_color,
            fg='#9E9E9E'
        )
        self.departed_label.pack(side='left', padx=10)
        
        # 스크롤 가능한 프레임
        container = tk.Frame(self.root, bg=self.bg_color)
        container.pack(fill='both', expand=True, padx=20, pady=10)
        
        canvas = tk.Canvas(container, bg=self.bg_color, highlightthickness=0)
        scrollbar = ttk.Scrollbar(container, orient="vertical", command=canvas.yview)
        
        self.student_frame = tk.Frame(canvas, bg=self.bg_color)
        
        canvas.create_window((0, 0), window=self.student_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        self.student_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        self.student_widgets = {}
        self.current_data = {}
    
    def parse_time(self, time_str):
        """시간 문자열 파싱 (오전/오후 포함)"""
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
            
            # 제한 설정
            if new_minutes < 30:
                new_minutes = 30
            elif new_minutes > 240:
                new_minutes = 240
            
            student['class_minutes'] = new_minutes
            student['end_time'] = student['actual_check_in_time'] + timedelta(minutes=new_minutes)
            
            # 즉시 UI 업데이트
            self.update_ui(self.current_data)
        
    def start_monitoring(self):
        """모니터링 시작"""
        self.start_btn.config(state='disabled')
        self.status_label.config(text="브라우저 시작 중...")
        
        thread = threading.Thread(target=self.run_browser, daemon=True)
        thread.start()
        
    def run_browser(self):
        """브라우저 실행"""
        self.driver = webdriver.Chrome()
        self.driver.get("https://attok.co.kr/")
        
        self.root.after(0, lambda: self.status_label.config(text="브라우저에서 로그인 후 '로그인 완료' 버튼을 눌러주세요"))
        self.root.after(0, lambda: self.login_btn.config(state='normal'))
    
    def confirm_login(self):
        """로그인 완료 확인"""
        self.login_btn.config(state='disabled')
        self.status_label.config(text="모니터링 시작 중...")
        
        thread = threading.Thread(target=self.start_monitoring_loop, daemon=True)
        thread.start()
    
    def start_monitoring_loop(self):
        """모니터링 루프 시작"""
        self.monitoring = True
        self.root.after(0, lambda: self.status_label.config(text="모니터링 중..."))
        
        self.monitor_thread()
        
    def monitor_thread(self):
        """모니터링 스레드"""
        while self.monitoring:
            students = self.get_students()
            self.current_data = students
            
            # UI 업데이트는 메인 스레드에서
            self.root.after(0, self.update_ui, students)
            
            time.sleep(10)
            
    def get_students(self):
        """학생 정보 추출"""
        result = {}
        
        try:
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
        except:
            pass
            
        return result
        
    def create_student_widget(self, name, data):
        """학생 위젯 생성"""
        frame = tk.Frame(
            self.student_frame,
            bg='#1b5e20',
            relief=tk.RAISED,
            borderwidth=1,
            height=60
        )
        
        # 이름
        name_label = tk.Label(
            frame,
            text=name[:15],
            font=('맑은 고딕', 11, 'bold'),
            bg='#1b5e20',
            fg=self.fg_color,
            width=15
        )
        name_label.pack(side='left', padx=5, pady=5)
        
        # 출석 시간
        time_label = tk.Label(
            frame,
            text="",
            font=('맑은 고딕', 10),
            bg='#1b5e20',
            fg='lightgreen',
            width=12
        )
        time_label.pack(side='left', padx=5)
        
        # 남은 시간
        remain_label = tk.Label(
            frame,
            text="",
            font=('맑은 고딕', 14, 'bold'),
            bg='#1b5e20',
            fg='lightgreen',
            width=15
        )
        remain_label.pack(side='left', padx=5)
        
        # 개별 시간 조절 버튼
        btn_frame = tk.Frame(frame, bg='#1b5e20')
        btn_frame.pack(side='left', padx=5)
        
        tk.Button(
            btn_frame,
            text="-10",
            font=('맑은 고딕', 8),
            bg='#F44336',
            fg='white',
            command=lambda n=name: self.adjust_student_time(n, -10),
            width=4,
            height=1
        ).pack(side='left', padx=1)
        
        tk.Button(
            btn_frame,
            text="+10",
            font=('맑은 고딕', 8),
            bg='#2196F3',
            fg='white',
            command=lambda n=name: self.adjust_student_time(n, 10),
            width=4,
            height=1
        ).pack(side='left', padx=1)
        
        return {
            'frame': frame,
            'name': name_label,
            'time': time_label,
            'remain': remain_label,
            'buttons': btn_frame
        }
        
    def update_ui(self, current_data):
        """UI 업데이트"""
        # 출석한 학생만 필터링
        checked_in_students = {name: data for name, data in current_data.items() 
                              if data.get('checked_in', False)}
        
        # 새로 출석한 학생 처리
        for name in checked_in_students:
            data = checked_in_students[name]
            
            # 처음 보는 학생이면 정보 저장
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
        
        # 정렬: 남은 시간이 적은 순 (하원한 학생은 뒤로)
        sorted_students = []
        departed_students = []
        
        for name in checked_in_students:
            student_info = self.students.get(name, {})
            if student_info.get('checked_out'):
                departed_students.append(name)
            else:
                # 남은 시간 계산
                end = student_info.get('end_time', datetime.now())
                remain = (end - datetime.now()).total_seconds()
                sorted_students.append((name, remain))
        
        # 남은 시간 순으로 정렬
        sorted_students.sort(key=lambda x: x[1])
        
        # 기존 위젯 제거
        for widget_info in self.student_widgets.values():
            widget_info['frame'].destroy()
        self.student_widgets = {}
        
        # 위젯 재생성 (정렬된 순서로)
        row = 0
        
        # 수업 중인 학생들
        for name, _ in sorted_students:
            if name not in self.student_widgets:
                widget = self.create_student_widget(name, checked_in_students[name])
                widget['frame'].grid(row=row, column=0, padx=5, pady=3, sticky='ew')
                self.student_widgets[name] = widget
                row += 1
        
        # 하원한 학생들
        for name in departed_students:
            if name not in self.student_widgets:
                widget = self.create_student_widget(name, checked_in_students[name])
                widget['frame'].grid(row=row, column=0, padx=5, pady=3, sticky='ew')
                self.student_widgets[name] = widget
                row += 1
        
        # 각 학생 상태 업데이트
        for name in self.student_widgets:
            widget = self.student_widgets[name]
            student_info = self.students[name]
            
            # 출석 시간 표시
            check_in_time = student_info['actual_check_in_time']
            widget['time'].config(text=f"등원: {check_in_time.strftime('%H:%M')}")
            
            # 하원한 경우
            if student_info.get('checked_out'):
                widget['frame'].config(bg='#616161')  # 진한 회색
                widget['name'].config(bg='#616161')
                widget['time'].config(bg='#616161', fg='#BDBDBD')
                widget['remain'].config(bg='#616161')
                widget['buttons'].config(bg='#616161')
                
                # 하원 시간 표시
                if student_info.get('actual_check_out_time'):
                    check_out = student_info['actual_check_out_time']
                    duration = check_out - check_in_time
                    total_mins = int(duration.total_seconds() // 60)
                    hours = total_mins // 60
                    mins = total_mins % 60
                    
                    out_time = check_out.strftime('%H:%M')
                    if hours > 0:
                        duration_text = f"하원 {out_time} ({hours}시간 {mins}분)"
                    else:
                        duration_text = f"하원 {out_time} ({mins}분)"
                else:
                    duration_text = "하원"
                
                widget['remain'].config(text=duration_text, fg='#BDBDBD')
                
                # 하원한 학생은 버튼 숨기기
                for child in widget['buttons'].winfo_children():
                    child.config(state='disabled')
            else:
                # 수업 중인 경우
                end = student_info['end_time']
                remain = end - datetime.now()
                
                if remain.total_seconds() > 0:
                    total_minutes = int(remain.total_seconds() // 60)
                    
                    # 시간 텍스트
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
                    if total_minutes > 30:
                        bg_color = '#1b5e20'  # 진한 녹색
                        fg_color = 'lightgreen'
                    elif total_minutes > 10:
                        bg_color = '#F57C00'  # 주황색
                        fg_color = 'white'
                    else:
                        bg_color = '#E65100'  # 진한 주황색
                        fg_color = 'yellow'
                    
                    widget['frame'].config(bg=bg_color)
                    widget['name'].config(bg=bg_color)
                    widget['time'].config(bg=bg_color)
                    widget['remain'].config(bg=bg_color, text=time_text, fg=fg_color)
                    widget['buttons'].config(bg=bg_color)
                else:
                    # 시간 초과 (이미 하원했어야 함)
                    over_minutes = int((-remain.total_seconds()) // 60)
                    
                    widget['frame'].config(bg='#b71c1c')  # 빨간색
                    widget['name'].config(bg='#b71c1c')
                    widget['time'].config(bg='#b71c1c')
                    widget['remain'].config(
                        bg='#b71c1c',
                        text=f"하원 ({over_minutes}분 초과)",
                        fg='white'
                    )
                    widget['buttons'].config(bg='#b71c1c')
                    
                    # 알림음
                    if not student_info.get('alerted'):
                        winsound.Beep(1000, 300)
                        self.students[name]['alerted'] = True
        
        # 통계 업데이트
        active_count = len(sorted_students)
        departed_count = len(departed_students)
        self.count_label.config(text=f"수업중: {active_count}명")
        self.departed_label.config(text=f"하원: {departed_count}명")
        
        # 1초 후 다시 업데이트
        if self.monitoring:
            self.root.after(1000, lambda: self.update_ui(current_data))
            
    def run(self):
        """실행"""
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        self.root.mainloop()
        
    def on_close(self):
        """종료"""
        self.monitoring = False
        if self.driver:
            self.driver.quit()
        self.root.destroy()


if __name__ == "__main__":
    app = AdvancedAttendanceGUI()
    app.run()