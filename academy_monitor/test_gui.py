"""
GUI 테스트 스크립트 - 웹드라이버 없이 GUI만 테스트
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

import tkinter as tk
from tkinter import ttk, messagebox
from models import Student, StudentStatus
from datetime import datetime

class TestGUI:
    """테스트용 GUI"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("학원 출결 모니터링 시스템 - 테스트")
        self.root.geometry("800x600")
        
        self.setup_ui()
        self.add_test_students()
        
    def setup_ui(self):
        """UI 구성"""
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 제목
        title_label = ttk.Label(main_frame, text="학원 출결 모니터링 - GUI 테스트", 
                               font=('Arial', 16, 'bold'))
        title_label.grid(row=0, column=0, columnspan=3, pady=10)
        
        # 상태 표시
        self.status_label = ttk.Label(main_frame, text="상태: 테스트 모드", 
                                     font=('Arial', 12))
        self.status_label.grid(row=1, column=0, columnspan=3, pady=5)
        
        # 테스트 버튼들
        control_frame = ttk.Frame(main_frame)
        control_frame.grid(row=2, column=0, columnspan=3, pady=10)
        
        ttk.Button(control_frame, text="테스트 학생 추가", 
                  command=self.add_test_student, width=15).grid(row=0, column=0, padx=5)
        
        ttk.Button(control_frame, text="알림 테스트", 
                  command=self.test_alert, width=15).grid(row=0, column=1, padx=5)
        
        ttk.Button(control_frame, text="소리 테스트", 
                  command=self.test_sound, width=15).grid(row=0, column=2, padx=5)
        
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
        
        # 학생 목록 영역
        self.students_frame = ttk.Frame(main_frame)
        self.students_frame.grid(row=5, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.students = {}
        self.student_widgets = {}
        
        # 그리드 가중치 설정
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(5, weight=1)
        
    def add_test_students(self):
        """테스트용 학생들 추가"""
        test_students = [
            ("김철수", "수업중"),
            ("이영희", "수업중"),
            ("박민수", "대기")
        ]
        
        for i, (name, status) in enumerate(test_students):
            student = Student(name=name, student_id=f"test_{i}")
            if status == "수업중":
                student.start_class()
            self.students[student.student_id] = student
            self.add_student_row(student)
            
        # 타이머 시작
        self.update_timer()
    
    def add_student_row(self, student: Student):
        """학생 행 추가"""
        row_frame = ttk.Frame(self.students_frame)
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
    
    def update_timer(self):
        """타이머 업데이트"""
        for student in self.students.values():
            self.update_student_display(student)
        
        # 1초 후 다시 실행
        self.root.after(1000, self.update_timer)
        
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
    
    def add_test_student(self):
        """테스트 학생 추가"""
        import random
        names = ["김테스트", "이테스트", "박테스트", "최테스트"]
        name = random.choice(names) + str(len(self.students))
        
        student = Student(name=name, student_id=f"test_{len(self.students)}")
        student.start_class()
        self.students[student.student_id] = student
        self.add_student_row(student)
        
        messagebox.showinfo("학생 추가", f"{name} 학생이 추가되었습니다!")
    
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
    
    def test_alert(self):
        """알림 테스트"""
        messagebox.showinfo("알림 테스트", "이것은 알림 테스트입니다!\n수업 종료 알림과 동일한 방식입니다.")
    
    def test_sound(self):
        """소리 테스트"""
        try:
            import winsound
            winsound.Beep(1000, 1000)
            messagebox.showinfo("소리 테스트", "비프음이 재생되었습니다!")
        except Exception as e:
            messagebox.showerror("소리 오류", f"소리 재생 실패: {e}")
    
    def run(self):
        """GUI 실행"""
        print("GUI 테스트 모드로 실행 중...")
        print("- 테스트 학생 추가 버튼: 새 학생 추가")
        print("- 알림 테스트 버튼: 팝업 알림 확인")
        print("- 소리 테스트 버튼: 비프음 재생")
        print("- +30분/-30분/종료 버튼: 시간 조정 테스트")
        
        self.root.mainloop()

if __name__ == "__main__":
    app = TestGUI()
    app.run()