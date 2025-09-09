"""
카드형 레이아웃 데모 - 그리드 배치
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
from datetime import datetime, timedelta
import random

class CardLayoutApp:
    """카드형 레이아웃 애플리케이션"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🏫 학원 출결 모니터링 - 카드뷰")
        self.root.geometry("1200x800")
        self.root.configure(bg='#f0f0f0')
        
        # 데이터
        self.students = {}
        self.student_cards = {}
        self.cards_per_row = 4  # 한 줄에 4개 카드
        
        # 알림 시스템
        self.alert_system = AlertSystem(self.root)
        self.timer_manager = TimerManager(self.alert_system)
        
        # UI 구성
        self.setup_ui()
        
        # 데모 데이터
        self.add_demo_students()
        
        # 타이머 시작
        self.update_timer()
        self.start_alert_checker()
        
    def setup_ui(self):
        """UI 구성"""
        # 상단 컨트롤 패널
        header_frame = tk.Frame(self.root, bg='#2c3e50', height=80)
        header_frame.pack(fill='x')
        header_frame.pack_propagate(False)
        
        # 제목
        title_label = tk.Label(header_frame, text="🏫 학원 출결 모니터링 시스템", 
                              font=('맑은 고딕', 20, 'bold'), fg='white', bg='#2c3e50')
        title_label.pack(pady=15)
        
        # 버튼 패널
        btn_frame = tk.Frame(self.root, bg='#ecf0f1', height=60)
        btn_frame.pack(fill='x')
        btn_frame.pack_propagate(False)
        
        # 버튼들을 중앙 배치
        btn_container = tk.Frame(btn_frame, bg='#ecf0f1')
        btn_container.pack(expand=True)
        
        self.create_button(btn_container, "➕ 학생 추가", self.add_demo_student, '#27ae60')
        self.create_button(btn_container, "🔔 알림 테스트", self.test_alert, '#3498db')
        self.create_button(btn_container, "🔊 소리 테스트", self.test_sound, '#e74c3c')
        self.create_button(btn_container, "🔄 새로고침", self.refresh_layout, '#f39c12')
        
        # 메인 스크롤 영역
        self.create_scroll_area()
        
    def create_button(self, parent, text, command, color):
        """스타일링된 버튼 생성"""
        btn = tk.Button(parent, text=text, command=command, 
                       bg=color, fg='white', font=('맑은 고딕', 10, 'bold'),
                       relief='flat', padx=20, pady=8, cursor='hand2')
        btn.pack(side='left', padx=10, pady=10)
        
        # 호버 효과
        def on_enter(e):
            btn.configure(bg=self.darken_color(color))
        def on_leave(e):
            btn.configure(bg=color)
        
        btn.bind("<Enter>", on_enter)
        btn.bind("<Leave>", on_leave)
        
    def darken_color(self, color):
        """색상 어둡게 만들기"""
        color_map = {
            '#27ae60': '#229954',
            '#3498db': '#2980b9', 
            '#e74c3c': '#c0392b',
            '#f39c12': '#d68910'
        }
        return color_map.get(color, color)
        
    def create_scroll_area(self):
        """스크롤 가능한 카드 영역 생성"""
        # 스크롤 프레임
        scroll_frame = tk.Frame(self.root, bg='#ecf0f1')
        scroll_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        # 캔버스와 스크롤바
        self.canvas = tk.Canvas(scroll_frame, bg='#ecf0f1', highlightthickness=0)
        v_scrollbar = ttk.Scrollbar(scroll_frame, orient='vertical', command=self.canvas.yview)
        h_scrollbar = ttk.Scrollbar(scroll_frame, orient='horizontal', command=self.canvas.xview)
        
        self.scrollable_frame = tk.Frame(self.canvas, bg='#ecf0f1')
        
        # 스크롤바 연결
        self.scrollable_frame.bind(
            '<Configure>',
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox('all'))
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor='nw')
        self.canvas.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        # 패킹
        self.canvas.pack(side='left', fill='both', expand=True)
        v_scrollbar.pack(side='right', fill='y')
        h_scrollbar.pack(side='bottom', fill='x')
        
        # 마우스 휠 스크롤
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
        
    def _on_mousewheel(self, event):
        """마우스 휠 스크롤"""
        self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
    def add_demo_students(self):
        """데모 학생들 추가"""
        demo_data = [
            ("김철수", 45, "08:30"),
            ("이영희", 25, "09:00"), 
            ("박민수", 5, "09:15"),
            ("정수진", 75, "08:00"),
            ("한지민", 15, "09:30"),
            ("오성훈", 60, "08:45"),
            ("최유리", 35, "09:10"),
            ("장민호", 8, "09:20"),
            ("김나영", 90, "07:45"),
            ("이재현", 20, "09:05"),
        ]
        
        for name, remaining_min, start_time in demo_data:
            student = Student(name=name, student_id=f"demo_{len(self.students)}")
            
            # 시작 시간 설정 (오늘 날짜 + 지정 시간)
            today = datetime.now().date()
            start_hour, start_min = map(int, start_time.split(':'))
            student.check_in_time = datetime.combine(today, datetime.min.time().replace(hour=start_hour, minute=start_min))
            
            # 상태 설정
            student.status = StudentStatus.IN_CLASS
            student.end_time = datetime.now() + timedelta(minutes=remaining_min)
            
            self.students[student.student_id] = student
            
        self.refresh_layout()
        
    def refresh_layout(self):
        """레이아웃 새로고침"""
        # 기존 카드들 삭제
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        self.student_cards.clear()
        
        # 학생들을 남은 시간 순으로 정렬 (짧은 시간부터)
        sorted_students = sorted(
            self.students.values(),
            key=lambda s: s.get_remaining_time().total_seconds() if s.get_remaining_time() else 0
        )
        
        # 카드들을 그리드로 배치
        row = 0
        col = 0
        
        for student in sorted_students:
            self.create_student_card(student, row, col)
            
            col += 1
            if col >= self.cards_per_row:
                col = 0
                row += 1
                
    def create_student_card(self, student: Student, row: int, col: int):
        """학생 카드 생성"""
        # 남은 시간에 따른 색상 결정
        remaining = student.get_remaining_time()
        if remaining:
            remaining_minutes = remaining.total_seconds() / 60
            if remaining_minutes <= 5:
                bg_color = '#ffebee'  # 연한 빨강
                border_color = '#f44336'
                time_color = '#d32f2f'
            elif remaining_minutes <= 10:
                bg_color = '#fff3e0'  # 연한 주황
                border_color = '#ff9800'
                time_color = '#f57c00'
            elif remaining_minutes <= 30:
                bg_color = '#fff8e1'  # 연한 노랑
                border_color = '#ffc107'
                time_color = '#f9a825'
            else:
                bg_color = '#e8f5e8'  # 연한 초록
                border_color = '#4caf50'
                time_color = '#388e3c'
        else:
            bg_color = '#fafafa'
            border_color = '#9e9e9e'
            time_color = '#757575'
        
        # 카드 프레임
        card = tk.Frame(self.scrollable_frame, bg=bg_color, relief='solid', bd=2,
                       highlightbackground=border_color, highlightcolor=border_color, highlightthickness=2)
        card.grid(row=row, column=col, padx=15, pady=15, sticky='nsew')
        
        # 카드 크기 고정
        card.configure(width=250, height=180)
        card.grid_propagate(False)
        
        # 학생 이름 (상단)
        name_label = tk.Label(card, text=f"👤 {student.name}", 
                             font=('맑은 고딕', 14, 'bold'), 
                             bg=bg_color, fg='#2c3e50')
        name_label.pack(pady=(15, 5))
        
        # 남은 시간 (중앙, 큰 글씨) - "50분" 형태로 표시
        time_label = tk.Label(card, text="0분", 
                             font=('맑은 고딕', 28, 'bold'), 
                             bg=bg_color, fg=time_color)
        time_label.pack(pady=10)
        
        # 등원 시간 (하단, 작은 글씨)
        start_time = student.check_in_time.strftime("%H:%M") if student.check_in_time else "-"
        start_label = tk.Label(card, text=f"🕐 등원: {start_time}", 
                              font=('맑은 고딕', 9), 
                              bg=bg_color, fg='#7f8c8d')
        start_label.pack(pady=(5, 10))
        
        # 제어 버튼들 (하단)
        btn_frame = tk.Frame(card, bg=bg_color)
        btn_frame.pack(pady=(0, 10))
        
        # 작은 버튼들
        self.create_small_button(btn_frame, "➕", lambda s=student.student_id: self.extend_time(s, 30), '#27ae60')
        self.create_small_button(btn_frame, "➖", lambda s=student.student_id: self.extend_time(s, -30), '#e74c3c')
        self.create_small_button(btn_frame, "🏁", lambda s=student.student_id: self.end_class(s), '#34495e')
        
        # 카드 저장
        self.student_cards[student.student_id] = {
            'card': card,
            'time_label': time_label,
            'bg_color': bg_color,
            'border_color': border_color,
            'time_color': time_color
        }
        
    def create_small_button(self, parent, text, command, color):
        """작은 제어 버튼 생성"""
        btn = tk.Button(parent, text=text, command=command,
                       bg=color, fg='white', font=('맑은 고딕', 8, 'bold'),
                       relief='flat', width=3, height=1, cursor='hand2')
        btn.pack(side='left', padx=2)
        
    def update_timer(self):
        """타이머 업데이트"""
        for student_id, student in self.students.items():
            if student_id in self.student_cards:
                card_data = self.student_cards[student_id]
                
                if student.status == StudentStatus.IN_CLASS:
                    remaining = student.get_remaining_time()
                    if remaining and remaining.total_seconds() > 0:
                        total_minutes = int(remaining.total_seconds() / 60)
                        if total_minutes > 0:
                            time_str = f"{total_minutes}분"
                        else:
                            time_str = "1분미만"
                        card_data['time_label'].config(text=time_str)
                    else:
                        card_data['time_label'].config(text="종료!", fg='red')
                elif student.status == StudentStatus.FINISHED:
                    card_data['time_label'].config(text="완료", fg='gray')
        
        # 1초 후 다시 실행
        self.root.after(1000, self.update_timer)
        
    def start_alert_checker(self):
        """알림 체크 시작"""
        def alert_checker():
            while True:
                try:
                    self.timer_manager.check_alerts(self.students)
                    time.sleep(1)
                except Exception as e:
                    print(f"알림 체크 오류: {e}")
                    time.sleep(1)
                    
        alert_thread = threading.Thread(target=alert_checker, daemon=True)
        alert_thread.start()
        
    def add_demo_student(self):
        """새 학생 추가"""
        names = ["김새로", "이추가", "박학생", "최신규", "정등원", "한출석", "장수업"]
        name = f"{random.choice(names)}{len(self.students)+1}"
        
        student = Student(name=name, student_id=f"new_{len(self.students)}")
        student.start_class()
        
        # 랜덤 남은 시간 (5-120분)
        remaining_minutes = random.randint(5, 120)
        student.end_time = datetime.now() + timedelta(minutes=remaining_minutes)
        
        self.students[student.student_id] = student
        self.refresh_layout()
        
        messagebox.showinfo("학생 추가", f"✅ {name} 학생이 추가되었습니다!")
        
    def extend_time(self, student_id: str, minutes: int):
        """시간 연장/단축"""
        if student_id in self.students:
            student = self.students[student_id]
            student.extend_time(minutes)
            action = "연장" if minutes > 0 else "단축"
            messagebox.showinfo("시간 조정", 
                              f"✅ {student.name} 학생 시간이 {abs(minutes)}분 {action}되었습니다!")
            self.timer_manager.reset_alerts(student_id)
            
    def end_class(self, student_id: str):
        """수업 종료"""
        if student_id in self.students:
            student = self.students[student_id]
            student.end_class()
            messagebox.showinfo("수업 종료", f"✅ {student.name} 학생의 수업이 종료되었습니다!")
            
    def test_alert(self):
        """알림 테스트"""
        self.alert_system.send_alert("테스트 학생", "종료")
        
    def test_sound(self):
        """소리 테스트"""
        self.alert_system.play_sound(duration=500)
        messagebox.showinfo("소리 테스트", "✅ 비프음이 재생되었습니다!")
        
    def run(self):
        """앱 실행"""
        print("=" * 60)
        print("🏫 학원 출결 모니터링 시스템 - 카드뷰 레이아웃")
        print("=" * 60)
        print("✅ 그리드 카드 레이아웃 적용")
        print("✅ 한 줄에 4개 카드 배치")
        print("✅ 카드별 정보: 이름(상단) + 큰숫자 시간(중앙) + 등원시간(하단)")
        print("✅ 남은 시간별 색상 구분")
        print("✅ 실시간 알림 시스템")
        
        self.root.mainloop()

if __name__ == "__main__":
    app = CardLayoutApp()
    app.run()