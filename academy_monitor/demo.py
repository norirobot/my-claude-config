"""
데모 실행 파일 - 실제 웹드라이버 없이 GUI 데모
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

import tkinter as tk
from tkinter import ttk, messagebox
from models import Student, StudentStatus
from alert_system import AlertSystem, TimerManager
import threading
import time
from datetime import datetime

class DemoApp:
    """데모 애플리케이션"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("학원 출결 모니터링 시스템 - 데모")
        self.root.geometry("800x600")
        
        # 데이터
        self.students = {}
        self.student_widgets = {}
        
        # 알림 시스템
        self.alert_system = AlertSystem(self.root)
        self.timer_manager = TimerManager(self.alert_system)
        
        # UI 구성
        self.setup_ui()
        
        # 데모 데이터 추가
        self.add_demo_data()
        
        # 타이머 및 알림 시작
        self.update_timer()
        self.start_alert_checker()
        
    def setup_ui(self):
        """UI 구성"""
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill='both', expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="🏫 학원 출결 모니터링 시스템", 
                               font=('Arial', 18, 'bold'))
        title_label.pack(pady=10)
        
        # 상태 표시
        self.status_label = ttk.Label(main_frame, text="상태: 데모 모드 실행중", 
                                     font=('Arial', 12), foreground='green')
        self.status_label.pack(pady=5)
        
        # 컨트롤 패널
        control_frame = ttk.LabelFrame(main_frame, text="시스템 제어", padding="10")
        control_frame.pack(fill='x', pady=10)
        
        btn_frame = ttk.Frame(control_frame)
        btn_frame.pack()
        
        ttk.Button(btn_frame, text="🚀 데모 학생 추가", 
                  command=self.add_demo_student, width=15).pack(side='left', padx=5)
        
        ttk.Button(btn_frame, text="🔔 알림 테스트", 
                  command=self.test_alert, width=15).pack(side='left', padx=5)
        
        ttk.Button(btn_frame, text="🔊 소리 테스트", 
                  command=self.test_sound, width=15).pack(side='left', padx=5)
        
        # 학생 목록 영역
        list_frame = ttk.LabelFrame(main_frame, text="👥 현재 수업중인 학생", padding="10")
        list_frame.pack(fill='both', expand=True, pady=10)
        
        # 헤더
        header_frame = ttk.Frame(list_frame)
        header_frame.pack(fill='x', pady=5)
        
        headers = ["학생 이름", "상태", "시작 시간", "남은 시간", "제어"]
        widths = [15, 10, 15, 15, 25]
        
        for i, (header, width) in enumerate(zip(headers, widths)):
            ttk.Label(header_frame, text=header, width=width, 
                     font=('Arial', 10, 'bold')).grid(row=0, column=i, padx=2)
        
        # 스크롤 가능한 학생 목록
        canvas_frame = ttk.Frame(list_frame)
        canvas_frame.pack(fill='both', expand=True)
        
        self.canvas = tk.Canvas(canvas_frame, bg='white', height=300)
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
        
    def add_demo_data(self):
        """데모용 학생 데이터 추가"""
        demo_students = [
            ("김철수", 50),  # 50분 남음
            ("이영희", 25),  # 25분 남음  
            ("박민수", 5),   # 5분 남음 (곧 종료)
        ]
        
        for name, remaining_minutes in demo_students:
            student = Student(name=name, student_id=f"demo_{len(self.students)}")
            student.start_class()
            
            # 남은 시간 조정
            from datetime import timedelta
            student.end_time = datetime.now() + timedelta(minutes=remaining_minutes)
            
            self.students[student.student_id] = student
            self.add_student_row(student)
            
    def add_student_row(self, student: Student):
        """학생 행 추가"""
        row_frame = ttk.Frame(self.scrollable_frame)
        row_frame.pack(fill='x', pady=2, padx=5)
        
        # 배경색 설정
        style = ttk.Style()
        if student.get_remaining_time():
            remaining_minutes = student.get_remaining_time().total_seconds() / 60
            if remaining_minutes <= 5:
                bg_color = '#ffe6e6'  # 빨간 배경
            elif remaining_minutes <= 10:
                bg_color = '#fff3e6'  # 주황 배경
            else:
                bg_color = '#e6ffe6'  # 초록 배경
        else:
            bg_color = '#f0f0f0'
        
        # 학생 정보 위젯들
        name_label = ttk.Label(row_frame, text=f"👤 {student.name}", width=15)
        name_label.grid(row=0, column=0, padx=2)
        
        status_label = ttk.Label(row_frame, text=f"📚 {student.status.value}", width=10)
        status_label.grid(row=0, column=1, padx=2)
        
        start_time = student.check_in_time.strftime("%H:%M") if student.check_in_time else "-"
        start_label = ttk.Label(row_frame, text=f"🕐 {start_time}", width=15)
        start_label.grid(row=0, column=2, padx=2)
        
        remaining_label = ttk.Label(row_frame, text="⏱️ -", width=15)
        remaining_label.grid(row=0, column=3, padx=2)
        
        # 제어 버튼들
        btn_frame = ttk.Frame(row_frame)
        btn_frame.grid(row=0, column=4, padx=2)
        
        ttk.Button(btn_frame, text="➕30분", width=8,
                  command=lambda: self.extend_time(student.student_id, 30)).pack(side='left', padx=1)
        ttk.Button(btn_frame, text="➖30분", width=8,
                  command=lambda: self.extend_time(student.student_id, -30)).pack(side='left', padx=1)
        ttk.Button(btn_frame, text="🏁종료", width=8,
                  command=lambda: self.end_class(student.student_id)).pack(side='left', padx=1)
        
        # 위젯 저장
        self.student_widgets[student.student_id] = {
            'frame': row_frame,
            'status': status_label,
            'remaining': remaining_label
        }
        
    def update_timer(self):
        """타이머 업데이트"""
        for student in self.students.values():
            if student.student_id in self.student_widgets:
                widgets = self.student_widgets[student.student_id]
                
                if student.status == StudentStatus.IN_CLASS:
                    remaining = student.get_remaining_time()
                    if remaining and remaining.total_seconds() > 0:
                        total_seconds = int(remaining.total_seconds())
                        hours = total_seconds // 3600
                        minutes = (total_seconds % 3600) // 60
                        seconds = total_seconds % 60
                        time_str = f"⏱️ {hours:02d}:{minutes:02d}:{seconds:02d}"
                        widgets['remaining'].config(text=time_str)
                        
                        # 색상 변경
                        if total_seconds < 300:  # 5분 이하
                            widgets['remaining'].config(foreground='red')
                        elif total_seconds < 600:  # 10분 이하
                            widgets['remaining'].config(foreground='orange')
                        else:
                            widgets['remaining'].config(foreground='green')
                    else:
                        widgets['remaining'].config(text="⏰ 종료!")
                        widgets['remaining'].config(foreground='red')
                else:
                    widgets['remaining'].config(text="✅ 완료")
                    widgets['remaining'].config(foreground='gray')
        
        # 1초 후 다시 실행
        self.root.after(1000, self.update_timer)
        
    def start_alert_checker(self):
        """알림 체크 시작"""
        def alert_checker():
            while True:
                try:
                    self.timer_manager.check_alerts(self.students)
                    time.sleep(1)  # 1초마다 체크
                except Exception as e:
                    print(f"알림 체크 오류: {e}")
                    time.sleep(1)
                    
        alert_thread = threading.Thread(target=alert_checker, daemon=True)
        alert_thread.start()
        
    def add_demo_student(self):
        """데모 학생 추가"""
        import random
        names = ["홍길동", "김학생", "이수업", "박출석", "최모범"]
        name = f"{random.choice(names)}{len(self.students)+1}"
        
        student = Student(name=name, student_id=f"demo_{len(self.students)}")
        student.start_class()
        
        # 랜덤 남은 시간 (10-90분)
        from datetime import timedelta
        remaining_minutes = random.randint(10, 90)
        student.end_time = datetime.now() + timedelta(minutes=remaining_minutes)
        
        self.students[student.student_id] = student
        self.add_student_row(student)
        
        self.status_label.config(text=f"상태: {name} 학생 추가됨 (남은시간: {remaining_minutes}분)")
        
    def extend_time(self, student_id: str, minutes: int):
        """시간 연장/단축"""
        if student_id in self.students:
            student = self.students[student_id]
            student.extend_time(minutes)
            action = "연장" if minutes > 0 else "단축"
            messagebox.showinfo("⏰ 시간 조정", 
                              f"✅ {student.name} 학생 시간이 {abs(minutes)}분 {action}되었습니다!")
            self.timer_manager.reset_alerts(student_id)  # 알림 리셋
            
    def end_class(self, student_id: str):
        """수업 종료"""
        if student_id in self.students:
            student = self.students[student_id]
            student.end_class()
            messagebox.showinfo("🏁 수업 종료", 
                              f"✅ {student.name} 학생의 수업이 종료되었습니다!")
            
    def test_alert(self):
        """알림 테스트"""
        self.alert_system.send_alert("테스트 학생", "종료")
        
    def test_sound(self):
        """소리 테스트"""
        self.alert_system.play_sound(duration=500)
        messagebox.showinfo("🔊 소리 테스트", "✅ 비프음이 재생되었습니다!")
        
    def run(self):
        """앱 실행"""
        print("=" * 50)
        print("🏫 학원 출결 모니터링 시스템 - 데모 모드")
        print("=" * 50)
        print("✅ GUI 정상 실행")
        print("✅ 알림 시스템 활성화") 
        print("✅ 타이머 시스템 작동")
        print("\n📋 데모 기능:")
        print("- 실시간 타이머 카운트다운")
        print("- 10분/5분/종료 알림")
        print("- 시간 연장/단축 기능")
        print("- 소리 및 팝업 알림")
        
        self.root.mainloop()

if __name__ == "__main__":
    app = DemoApp()
    app.run()