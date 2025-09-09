"""
GUI 출결 모니터링 시스템
- 실시간 출결 상태 표시
- 남은 시간 카운트다운
- 시간 완료시 소리 알림
"""
import tkinter as tk
from tkinter import ttk, font
import threading
import time
from datetime import datetime, timedelta
import winsound
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import json

class AttendanceMonitorGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("출결 모니터링 시스템")
        self.root.geometry("1200x800")
        self.root.configure(bg='#1e1e1e')
        
        # 학생 데이터
        self.students = {}
        self.driver = None
        self.monitoring = False
        
        # 수업 시간 설정 (분)
        self.class_duration = 120  # 기본 2시간
        
        # UI 구성
        self.setup_ui()
        
        # 윈도우 종료 이벤트
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def setup_ui(self):
        """UI 구성"""
        # 상단 제어 패널
        control_frame = tk.Frame(self.root, bg='#2d2d2d', height=80)
        control_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # 시작 버튼
        self.start_btn = tk.Button(
            control_frame,
            text="모니터링 시작",
            command=self.start_monitoring,
            bg='#4CAF50',
            fg='white',
            font=('Arial', 14, 'bold'),
            width=15,
            height=2
        )
        self.start_btn.pack(side=tk.LEFT, padx=20, pady=15)
        
        # 상태 표시
        self.status_label = tk.Label(
            control_frame,
            text="대기 중...",
            bg='#2d2d2d',
            fg='#ffffff',
            font=('Arial', 12)
        )
        self.status_label.pack(side=tk.LEFT, padx=20)
        
        # 총 인원 표시
        self.total_label = tk.Label(
            control_frame,
            text="출석: 0/0명",
            bg='#2d2d2d',
            fg='#00ff00',
            font=('Arial', 16, 'bold')
        )
        self.total_label.pack(side=tk.RIGHT, padx=20)
        
        # 메인 프레임 (스크롤 가능)
        main_frame = tk.Frame(self.root, bg='#1e1e1e')
        main_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 스크롤바 추가
        canvas = tk.Canvas(main_frame, bg='#1e1e1e', highlightthickness=0)
        scrollbar = ttk.Scrollbar(main_frame, orient="vertical", command=canvas.yview)
        self.scrollable_frame = tk.Frame(canvas, bg='#1e1e1e')
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        self.student_frames = {}
        
    def create_student_card(self, name, parent):
        """학생 카드 생성"""
        # 카드 프레임
        card = tk.Frame(
            parent,
            bg='#3d3d3d',
            relief=tk.RAISED,
            borderwidth=2
        )
        card.pack(fill=tk.X, padx=10, pady=5)
        
        # 왼쪽: 이름과 출석시간
        left_frame = tk.Frame(card, bg='#3d3d3d')
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 학생 이름
        name_label = tk.Label(
            left_frame,
            text=name,
            bg='#3d3d3d',
            fg='#ffffff',
            font=('Arial', 14, 'bold')
        )
        name_label.pack(anchor='w')
        
        # 출석 시간
        time_label = tk.Label(
            left_frame,
            text="미출석",
            bg='#3d3d3d',
            fg='#888888',
            font=('Arial', 10)
        )
        time_label.pack(anchor='w')
        
        # 오른쪽: 남은 시간
        right_frame = tk.Frame(card, bg='#3d3d3d')
        right_frame.pack(side=tk.RIGHT, padx=20, pady=10)
        
        # 남은 시간 (크게 표시)
        timer_label = tk.Label(
            right_frame,
            text="--:--",
            bg='#3d3d3d',
            fg='#ff9800',
            font=('Digital-7', 36, 'bold')  # 큰 폰트
        )
        timer_label.pack()
        
        # 상태 표시
        status_label = tk.Label(
            right_frame,
            text="대기",
            bg='#3d3d3d',
            fg='#666666',
            font=('Arial', 10)
        )
        status_label.pack()
        
        return {
            'card': card,
            'name': name_label,
            'time': time_label,
            'timer': timer_label,
            'status': status_label
        }
        
    def start_monitoring(self):
        """모니터링 시작"""
        self.start_btn.config(state='disabled', text='모니터링 중...')
        self.status_label.config(text="브라우저 시작 중...")
        
        # 브라우저 스레드 시작
        browser_thread = threading.Thread(target=self.setup_browser, daemon=True)
        browser_thread.start()
        
    def setup_browser(self):
        """브라우저 설정 및 로그인"""
        options = Options()
        options.add_argument('--start-maximized')
        self.driver = webdriver.Chrome(options=options)
        
        self.driver.get("https://attok.co.kr/")
        
        # 로그인 대기 (수동)
        self.status_label.config(text="로그인 대기 중... (로그인 후 아무 키나 누르세요)")
        input("로그인 완료 후 Enter: ")
        
        # 모니터링 시작
        self.monitoring = True
        self.status_label.config(text="모니터링 중...")
        
        # 모니터링 루프 시작
        monitor_thread = threading.Thread(target=self.monitor_loop, daemon=True)
        monitor_thread.start()
        
        # 타이머 업데이트 루프
        timer_thread = threading.Thread(target=self.update_timers, daemon=True)
        timer_thread.start()
        
    def extract_students(self):
        """학생 목록 추출 (ultimate_monitor.py 로직 사용)"""
        students_data = {}
        
        try:
            ul_elements = self.driver.find_elements(By.TAG_NAME, "ul")
            
            for ul in ul_elements:
                li_items = ul.find_elements(By.TAG_NAME, "li")
                
                if 70 <= len(li_items) <= 90:
                    for li in li_items:
                        # strong 태그 확인
                        strong_tags = li.find_elements(By.TAG_NAME, "strong")
                        
                        if not strong_tags or not any("배경" in s.text for s in strong_tags):
                            li_text = li.text.strip()
                            
                            if li_text:
                                lines = li_text.split('\n')
                                if lines:
                                    student_name = lines[0].strip()
                                    
                                    # 출결 정보
                                    attendance_info = ""
                                    checked_in = False
                                    
                                    for line in lines[1:]:
                                        if "등원" in line:
                                            attendance_info = line
                                            checked_in = "등원 -" not in line
                                            break
                                    
                                    students_data[student_name] = {
                                        'name': student_name,
                                        'checked_in': checked_in,
                                        'attendance_info': attendance_info,
                                        'check_in_time': datetime.now() if checked_in else None
                                    }
                    break
                    
        except Exception as e:
            print(f"추출 오류: {e}")
            
        return students_data
        
    def monitor_loop(self):
        """모니터링 루프"""
        while self.monitoring:
            try:
                # 학생 데이터 추출
                current_students = self.extract_students()
                
                # 첫 실행시 학생 카드 생성
                if not self.student_frames:
                    for name in current_students:
                        frame = self.create_student_card(name, self.scrollable_frame)
                        self.student_frames[name] = frame
                
                # 출석 상태 업데이트
                checked_count = 0
                for name, data in current_students.items():
                    if name in self.student_frames:
                        frame = self.student_frames[name]
                        
                        if data['checked_in']:
                            checked_count += 1
                            
                            # 새로 출석한 경우
                            if name not in self.students or not self.students.get(name, {}).get('checked_in'):
                                # 출석 시간 기록
                                check_time = datetime.now()
                                self.students[name] = {
                                    'checked_in': True,
                                    'check_in_time': check_time,
                                    'end_time': check_time + timedelta(minutes=self.class_duration)
                                }
                                
                                # UI 업데이트
                                frame['card'].config(bg='#2e7d32')  # 녹색
                                frame['time'].config(text=f"출석: {check_time.strftime('%H:%M')}", fg='#00ff00')
                                frame['status'].config(text="수업 중", fg='#00ff00')
                        else:
                            # 미출석
                            frame['card'].config(bg='#3d3d3d')  # 기본색
                            frame['time'].config(text="미출석", fg='#888888')
                            frame['timer'].config(text="--:--")
                            frame['status'].config(text="대기", fg='#666666')
                
                # 총 인원 업데이트
                total = len(current_students)
                self.total_label.config(text=f"출석: {checked_count}/{total}명")
                
                time.sleep(10)  # 10초마다 체크
                
            except Exception as e:
                print(f"모니터링 오류: {e}")
                time.sleep(10)
                
    def update_timers(self):
        """타이머 업데이트 (1초마다)"""
        while self.monitoring:
            try:
                current_time = datetime.now()
                
                for name, data in self.students.items():
                    if data.get('checked_in') and name in self.student_frames:
                        frame = self.student_frames[name]
                        end_time = data.get('end_time')
                        
                        if end_time:
                            remaining = end_time - current_time
                            
                            if remaining.total_seconds() > 0:
                                # 남은 시간 표시
                                hours = int(remaining.total_seconds() // 3600)
                                minutes = int((remaining.total_seconds() % 3600) // 60)
                                seconds = int(remaining.total_seconds() % 60)
                                
                                if hours > 0:
                                    time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
                                else:
                                    time_str = f"{minutes:02d}:{seconds:02d}"
                                
                                frame['timer'].config(text=time_str)
                                
                                # 시간별 색상
                                if remaining.total_seconds() < 300:  # 5분 미만
                                    frame['timer'].config(fg='#ff0000')  # 빨간색
                                elif remaining.total_seconds() < 600:  # 10분 미만
                                    frame['timer'].config(fg='#ff9800')  # 주황색
                                else:
                                    frame['timer'].config(fg='#4CAF50')  # 녹색
                            else:
                                # 시간 완료
                                frame['timer'].config(text="완료!", fg='#ff0000')
                                frame['status'].config(text="수업 종료", fg='#ff0000')
                                frame['card'].config(bg='#b71c1c')  # 진한 빨간색
                                
                                # 소리 알림 (한 번만)
                                if not data.get('alerted'):
                                    winsound.Beep(1000, 500)  # 1000Hz, 0.5초
                                    self.students[name]['alerted'] = True
                
                time.sleep(1)
                
            except Exception as e:
                print(f"타이머 오류: {e}")
                time.sleep(1)
                
    def on_closing(self):
        """프로그램 종료"""
        self.monitoring = False
        if self.driver:
            self.driver.quit()
        self.root.destroy()
        
    def run(self):
        """GUI 실행"""
        self.root.mainloop()


if __name__ == "__main__":
    app = AttendanceMonitorGUI()
    app.run()