"""
GUI 메인 인터페이스 (Tkinter)
"""
import tkinter as tk
from tkinter import ttk, messagebox
import threading
from datetime import datetime, timedelta
from typing import Dict
from models import Student, StudentStatus
import config

class AcademyMonitorGUI:
    """학원 모니터링 GUI 메인 클래스"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("학원 출결 모니터링 시스템")
        self.root.geometry(f"{config.WINDOW_WIDTH}x{config.WINDOW_HEIGHT}")
        
        # 학생 관리
        self.students: Dict[str, Student] = {}
        self.student_widgets: Dict[str, Dict] = {}
        
        # 모니터 객체 (나중에 연결)
        self.monitor = None
        
        # UI 초기화
        self.setup_ui()
        
        # 타이머 업데이트 시작
        self.update_timer()
        
    def setup_ui(self):
        """UI 구성"""
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 제목
        title_label = ttk.Label(main_frame, text="학원 출결 모니터링", 
                               font=('Arial', 16, 'bold'))
        title_label.grid(row=0, column=0, columnspan=3, pady=10)
        
        # 상태 표시
        self.status_label = ttk.Label(main_frame, text="상태: 대기중", 
                                     font=('Arial', 12))
        self.status_label.grid(row=1, column=0, columnspan=3, pady=5)
        
        # 컨트롤 버튼들
        control_frame = ttk.Frame(main_frame)
        control_frame.grid(row=2, column=0, columnspan=3, pady=10)
        
        self.login_btn = ttk.Button(control_frame, text="Attok 로그인", 
                                   command=self.login_attok, width=15)
        self.login_btn.grid(row=0, column=0, padx=5)
        
        self.start_btn = ttk.Button(control_frame, text="모니터링 시작", 
                                   command=self.start_monitoring, 
                                   state=tk.DISABLED, width=15)
        self.start_btn.grid(row=0, column=1, padx=5)
        
        self.stop_btn = ttk.Button(control_frame, text="모니터링 중지", 
                                  command=self.stop_monitoring, 
                                  state=tk.DISABLED, width=15)
        self.stop_btn.grid(row=0, column=2, padx=5)
        
        # 구분선
        ttk.Separator(main_frame, orient='horizontal').grid(
            row=3, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=10)
        
        # 학생 목록 헤더
        header_frame = ttk.Frame(main_frame)
        header_frame.grid(row=4, column=0, columnspan=3, sticky=(tk.W, tk.E))
        
        ttk.Label(header_frame, text="학생 이름", width=15, font=('Arial', 11, 'bold')).grid(row=0, column=0)
        ttk.Label(header_frame, text="상태", width=10, font=('Arial', 11, 'bold')).grid(row=0, column=1)
        ttk.Label(header_frame, text="시작 시간", width=15, font=('Arial', 11, 'bold')).grid(row=0, column=2)
        ttk.Label(header_frame, text="남은 시간", width=15, font=('Arial', 11, 'bold')).grid(row=0, column=3)
        ttk.Label(header_frame, text="시간 조정", width=30, font=('Arial', 11, 'bold')).grid(row=0, column=4)
        
        # 학생 목록 스크롤 영역
        canvas_frame = ttk.Frame(main_frame)
        canvas_frame.grid(row=5, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 캔버스와 스크롤바
        self.canvas = tk.Canvas(canvas_frame, bg='white', height=350)
        scrollbar = ttk.Scrollbar(canvas_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = ttk.Frame(self.canvas)
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # 그리드 가중치 설정
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(5, weight=1)
        
    def add_student_row(self, student: Student):
        """학생 행 추가"""
        row_frame = ttk.Frame(self.scrollable_frame)
        row_frame.pack(fill='x', pady=2)
        
        # 학생 정보 위젯들
        name_label = ttk.Label(row_frame, text=student.name, width=15)
        name_label.grid(row=0, column=0)
        
        status_label = ttk.Label(row_frame, text=student.status.value, width=10)
        status_label.grid(row=0, column=1)
        
        start_time = student.check_in_time.strftime("%H:%M") if student.check_in_time else "-"
        start_label = ttk.Label(row_frame, text=start_time, width=15)
        start_label.grid(row=0, column=2)
        
        remaining_label = ttk.Label(row_frame, text="-", width=15)
        remaining_label.grid(row=0, column=3)
        
        # 시간 조정 버튼들
        btn_frame = ttk.Frame(row_frame)
        btn_frame.grid(row=0, column=4)
        
        ttk.Button(btn_frame, text="+30분", width=6,
                  command=lambda: self.extend_time(student.student_id, 30)).pack(side='left', padx=1)
        ttk.Button(btn_frame, text="-30분", width=6,
                  command=lambda: self.extend_time(student.student_id, -30)).pack(side='left', padx=1)
        ttk.Button(btn_frame, text="종료", width=6,
                  command=lambda: self.end_class(student.student_id)).pack(side='left', padx=1)
        
        # 위젯 저장
        self.student_widgets[student.student_id] = {
            'frame': row_frame,
            'status': status_label,
            'remaining': remaining_label
        }
        
    def update_student_display(self, student: Student):
        """학생 표시 업데이트"""
        if student.student_id in self.student_widgets:
            widgets = self.student_widgets[student.student_id]
            widgets['status'].config(text=student.status.value)
            
            if student.status == StudentStatus.IN_CLASS:
                remaining = student.get_remaining_time()
                if remaining:
                    total_seconds = int(remaining.total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    seconds = total_seconds % 60
                    time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
                    widgets['remaining'].config(text=time_str)
                    
                    # 시간별 색상 변경
                    if total_seconds < 300:  # 5분 이하
                        widgets['remaining'].config(foreground='red')
                    elif total_seconds < 600:  # 10분 이하
                        widgets['remaining'].config(foreground='orange')
                    else:
                        widgets['remaining'].config(foreground='green')
            else:
                widgets['remaining'].config(text="-")
                
    def update_timer(self):
        """타이머 업데이트 (1초마다)"""
        for student in self.students.values():
            self.update_student_display(student)
        
        # 1초 후 다시 실행
        self.root.after(1000, self.update_timer)
        
    def login_attok(self):
        """Attok 로그인"""
        if not self.monitor:
            from web_monitor import AttokMonitor
            self.monitor = AttokMonitor(headless=False)
            
        self.status_label.config(text="상태: 로그인 진행중...")
        
        # 별도 스레드에서 로그인 실행
        def login_thread():
            if self.monitor.login():
                self.root.after(0, self.on_login_success)
            else:
                self.root.after(0, self.on_login_failed)
                
        threading.Thread(target=login_thread, daemon=True).start()
        
    def on_login_success(self):
        """로그인 성공 처리"""
        self.status_label.config(text="상태: 로그인 완료")
        self.login_btn.config(state=tk.DISABLED)
        self.start_btn.config(state=tk.NORMAL)
        messagebox.showinfo("성공", "로그인이 완료되었습니다!")
        
    def on_login_failed(self):
        """로그인 실패 처리"""
        self.status_label.config(text="상태: 로그인 실패")
        messagebox.showerror("오류", "로그인에 실패했습니다.")
        
    def start_monitoring(self):
        """모니터링 시작"""
        if not self.monitor:
            return
            
        self.status_label.config(text="상태: 모니터링 중...")
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        
        # 헤드리스 모드로 전환
        self.monitor.switch_to_headless()
        
        # 모니터링 스레드 시작
        def monitor_thread():
            self.monitor.start_monitoring(callback=self.on_student_checkin)
            
        self.monitor_thread = threading.Thread(target=monitor_thread, daemon=True)
        self.monitor_thread.start()
        
    def stop_monitoring(self):
        """모니터링 중지"""
        self.status_label.config(text="상태: 중지됨")
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        
        if self.monitor:
            self.monitor.stop()
            
    def on_student_checkin(self, student: Student):
        """학생 체크인 콜백"""
        self.students[student.student_id] = student
        self.root.after(0, lambda: self.add_student_row(student))
        
    def extend_time(self, student_id: str, minutes: int):
        """시간 연장/단축"""
        if student_id in self.students:
            student = self.students[student_id]
            student.extend_time(minutes)
            action = "연장" if minutes > 0 else "단축"
            messagebox.showinfo("시간 조정", 
                              f"{student.name} 학생 시간이 {abs(minutes)}분 {action}되었습니다.")
            
    def end_class(self, student_id: str):
        """수업 종료"""
        if student_id in self.students:
            student = self.students[student_id]
            student.end_class()
            self.update_student_display(student)
            messagebox.showinfo("수업 종료", f"{student.name} 학생의 수업이 종료되었습니다.")
            
    def run(self):
        """GUI 실행"""
        self.root.mainloop()

if __name__ == "__main__":
    app = AcademyMonitorGUI()
    app.run()