"""
심플한 GUI 출결 모니터링
핵심 기능만 구현
"""
import tkinter as tk
from tkinter import ttk
import threading
import time
from datetime import datetime, timedelta
import winsound
from selenium import webdriver
from selenium.webdriver.common.by import By

class SimpleAttendanceGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("출결 모니터링")
        self.root.geometry("800x600")
        
        # 다크 테마
        self.bg_color = '#2b2b2b'
        self.fg_color = '#ffffff'
        self.card_color = '#3c3c3c'
        
        self.root.configure(bg=self.bg_color)
        
        self.students = {}
        self.driver = None
        self.monitoring = False
        self.logged_in = False
        self.class_minutes = 90  # 기본 1시간 30분
        self.default_class_minutes = 90  # 기본값 저장
        
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
        
        # 로그인 완료 버튼 (초기에는 숨김)
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
        
        # 출석 인원 표시
        self.count_label = tk.Label(
            self.root,
            text="출석: 0명",
            font=('맑은 고딕', 14, 'bold'),
            bg=self.bg_color,
            fg='#4CAF50'
        )
        self.count_label.pack()
        
        # 수업 시간 조절 프레임
        time_adjust_frame = tk.Frame(self.root, bg=self.bg_color)
        time_adjust_frame.pack(pady=5)
        
        tk.Button(
            time_adjust_frame,
            text="-10분",
            font=('맑은 고딕', 10),
            bg='#FF5722',
            fg='white',
            command=lambda: self.adjust_class_time(-10),
            width=8
        ).pack(side='left', padx=2)
        
        self.time_label = tk.Label(
            time_adjust_frame,
            text="수업시간: 1시간 30분",
            font=('맑은 고딕', 11),
            bg=self.bg_color,
            fg=self.fg_color
        )
        self.time_label.pack(side='left', padx=10)
        
        tk.Button(
            time_adjust_frame,
            text="+10분",
            font=('맑은 고딕', 10),
            bg='#2196F3',
            fg='white',
            command=lambda: self.adjust_class_time(10),
            width=8
        ).pack(side='left', padx=2)
        
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
        
        # 로그인 대기 - GUI 버튼으로 처리
        self.root.after(0, lambda: self.status_label.config(text="브라우저에서 로그인 후 '로그인 완료' 버튼을 눌러주세요"))
        self.root.after(0, lambda: self.login_btn.config(state='normal'))
    
    def confirm_login(self):
        """로그인 완료 확인"""
        self.login_btn.config(state='disabled')
        self.status_label.config(text="모니터링 시작 중...")
        
        # 모니터링 시작을 별도 스레드에서
        thread = threading.Thread(target=self.start_monitoring_loop, daemon=True)
        thread.start()
    
    def start_monitoring_loop(self):
        """모니터링 루프 시작"""
        self.monitoring = True
        self.root.after(0, lambda: self.status_label.config(text="모니터링 중..."))
        
        # 모니터링 시작
        self.monitor_thread()
        
    def monitor_thread(self):
        """모니터링 스레드"""
        while self.monitoring:
            students = self.get_students()
            
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
                                
                                # 출석/하원 확인
                                checked_in = False
                                checked_out = False
                                check_in_time = ""
                                check_out_time = ""
                                
                                for line in lines[1:]:
                                    if "등원" in line:
                                        if "등원 -" not in line:
                                            checked_in = True
                                            # 시간 추출 (오전/오후 포함)
                                            if "(" in line and ")" in line:
                                                check_in_time = line[line.index("(")+1:line.index(")")]
                                    if "하원" in line:
                                        if "하원 -" not in line:
                                            checked_out = True
                                            # 하원 시간 추출
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
        
    def update_ui(self, current_data):
        """UI 업데이트"""
        # 출석한 학생만 필터링
        checked_in_students = {name: data for name, data in current_data.items() 
                              if data.get('checked_in', False)}
        
        # 출석 인원 수 업데이트
        self.count_label.config(text=f"출석: {len(checked_in_students)}명")
        
        # 새로 출석한 학생 위젯 생성
        for name in checked_in_students:
            if name not in self.student_widgets:
                # 현재 그리드 위치 계산
                row = len(self.student_widgets) // 2
                col = len(self.student_widgets) % 2
                
                frame = tk.Frame(
                    self.student_frame,
                    bg='#1b5e20',  # 출석한 학생은 녹색 배경
                    relief=tk.RAISED,
                    borderwidth=1
                )
                frame.grid(row=row, column=col, padx=5, pady=5, sticky='ew')
                
                # 이름
                name_label = tk.Label(
                    frame,
                    text=name[:15],  # 이름 길이 조금 늘림
                    font=('맑은 고딕', 11, 'bold'),
                    bg='#1b5e20',
                    fg=self.fg_color,
                    width=15
                )
                name_label.pack(side='left', padx=5)
                
                # 출석 시간
                time_label = tk.Label(
                    frame,
                    text="",
                    font=('맑은 고딕', 10),
                    bg='#1b5e20',
                    fg='lightgreen',
                    width=10
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
                
                self.student_widgets[name] = {
                    'frame': frame,
                    'time': time_label,
                    'remain': remain_label
                }
        
        # 상태 업데이트 - 출석한 학생만
        for name in checked_in_students:
            if name in self.student_widgets:
                widget = self.student_widgets[name]
                data = checked_in_students[name]
                
                # 처음 출석하는 경우 시간 기록
                if name not in self.students or not self.students[name].get('checked_in'):
                    now = datetime.now()
                    self.students[name] = {
                        'checked_in': True,
                        'start_time': now,
                        'end_time': now + timedelta(minutes=self.class_minutes)
                    }
                    
                    # 출석 시간 표시
                    if data.get('check_time'):
                        widget['time'].config(text=f"출석: {data['check_time']}")
                    else:
                        widget['time'].config(text=f"출석: {now.strftime('%H:%M')}")
                
                # 남은 시간 계산 및 자연어 표시
                if name in self.students:
                    end = self.students[name]['end_time']
                    remain = end - datetime.now()
                    
                    if remain.total_seconds() > 0:
                        total_minutes = int(remain.total_seconds() // 60)
                        
                        # 자연어 형식으로 변환
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
                            color = 'lightgreen'
                        elif total_minutes > 10:
                            color = 'yellow'
                        else:
                            color = 'orange'
                        
                        widget['remain'].config(text=time_text, fg=color)
                    else:
                        # 시간 종료
                        widget['remain'].config(text="수업 완료!", fg='red')
                        widget['frame'].config(bg='#b71c1c')  # 빨간색
                        
                        # 알림음
                        if not self.students[name].get('alerted'):
                            winsound.Beep(1000, 300)
                            self.students[name]['alerted'] = True
        
        # 1초 후 다시 업데이트 (타이머용)
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
    app = SimpleAttendanceGUI()
    app.run()