"""
수동 로그인 전용 출결 모니터링 시스템
자동 로그인 제거, 팝업 자동 처리 기능 추가
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
from selenium.common.exceptions import WebDriverException, NoSuchWindowException, TimeoutException, UnexpectedAlertPresentException
import hashlib

class ManualOnlyAttendanceGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("출결 모니터링 시스템 (수동 로그인)")
        self.root.geometry("1000x750")
        
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
        self.last_check_time = None
        self.connection_errors = 0
        self.max_errors = 3
        
        # 깜빡임 방지용 변수들
        self.last_data_hash = ""
        self.last_widget_update = {}
        
        # 팝업 처리 관련
        self.popup_check_enabled = True
        self.popup_closed_count = 0
        
        self.setup_ui()
        
    def setup_ui(self):
        """UI 설정"""
        # 제목
        title = tk.Label(
            self.root,
            text="출결 모니터링 시스템 (수동 로그인)",
            font=('맑은 고딕', 20, 'bold'),
            bg=self.bg_color,
            fg=self.fg_color
        )
        title.pack(pady=10)
        
        # 연결 상태 프레임
        status_frame = tk.Frame(self.root, bg=self.bg_color)
        status_frame.pack(pady=5, fill='x')
        
        self.connection_label = tk.Label(
            status_frame,
            text="🔴 브라우저 연결 안됨",
            font=('맑은 고딕', 12, 'bold'),
            bg=self.bg_color,
            fg='#F44336'
        )
        self.connection_label.pack()
        
        # 팝업 처리 설정 프레임
        popup_frame = tk.LabelFrame(
            self.root,
            text="팝업 처리 설정",
            font=('맑은 고딕', 12, 'bold'),
            bg=self.bg_color,
            fg=self.fg_color,
            bd=2,
            relief='raised'
        )
        popup_frame.pack(pady=10, padx=20, fill='x')
        
        # 팝업 자동 처리 체크박스
        self.popup_var = tk.BooleanVar(value=True)
        popup_check = tk.Checkbutton(
            popup_frame,
            text="팝업 자동 처리 (공지사항, 알림창 등)",
            variable=self.popup_var,
            font=('맑은 고딕', 11),
            bg=self.bg_color,
            fg=self.fg_color,
            selectcolor=self.card_color,
            command=self.toggle_popup_handling
        )
        popup_check.pack(anchor='w', padx=10, pady=5)
        
        # 팝업 처리 상태
        self.popup_status_label = tk.Label(
            popup_frame,
            text="팝업 처리: 0개",
            font=('맑은 고딕', 10),
            bg=self.bg_color,
            fg='#4CAF50'
        )
        self.popup_status_label.pack(anchor='w', padx=10, pady=2)
        
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
            width=12,
            height=2
        )
        self.start_btn.pack(side='left', padx=5)
        
        # 재시작 버튼
        self.restart_btn = tk.Button(
            button_frame,
            text="🔄 재시작",
            font=('맑은 고딕', 14),
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
            button_frame,
            text="⏹ 정지",
            font=('맑은 고딕', 14),
            bg='#F44336',
            fg='white',
            command=self.stop_monitoring,
            width=12,
            height=2,
            state='disabled'
        )
        self.stop_btn.pack(side='left', padx=5)
        
        # 수동 로그인 완료 버튼
        self.manual_login_btn = tk.Button(
            button_frame,
            text="✓ 로그인 완료",
            font=('맑은 고딕', 14),
            bg='#2196F3',
            fg='white',
            command=self.confirm_manual_login,
            width=15,
            height=2,
            state='disabled'
        )
        self.manual_login_btn.pack(side='left', padx=5)
        
        # 팝업 닫기 버튼
        self.close_popup_btn = tk.Button(
            button_frame,
            text="🗙 팝업 닫기",
            font=('맑은 고딕', 14),
            bg='#9C27B0',
            fg='white',
            command=self.manual_close_popups,
            width=12,
            height=2,
            state='disabled'
        )
        self.close_popup_btn.pack(side='left', padx=5)
        
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
            text="수업중: 0명",
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
        
        # 오류 카운터
        self.error_label = tk.Label(
            stats_frame,
            text="오류: 0/3",
            font=('맑은 고딕', 10),
            bg=self.bg_color,
            fg='#FFB74D'
        )
        self.error_label.pack(side='left', padx=10)
        
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
        
        # 브라우저 상태 모니터링 시작
        self.check_browser_status()
    
    def toggle_popup_handling(self):
        """팝업 처리 토글"""
        self.popup_check_enabled = self.popup_var.get()
        status = "활성화" if self.popup_check_enabled else "비활성화"
        print(f"팝업 자동 처리: {status}")
    
    def check_browser_status(self):
        """브라우저 상태 주기적 체크"""
        if self.driver:
            try:
                # 브라우저가 살아있는지 확인
                self.driver.current_url
                self.browser_alive = True
                self.connection_errors = 0
                self.connection_label.config(
                    text="🟢 브라우저 연결됨",
                    fg='#4CAF50'
                )
                
                # 팝업 자동 처리
                if self.popup_check_enabled:
                    self.auto_close_popups()
                    
            except (WebDriverException, NoSuchWindowException):
                self.browser_alive = False
                self.connection_errors += 1
                self.connection_label.config(
                    text=f"🔴 브라우저 연결 끊김 (오류: {self.connection_errors})",
                    fg='#F44336'
                )
                
                # 최대 오류 횟수 초과시 모니터링 중지
                if self.connection_errors >= self.max_errors and self.monitoring:
                    self.handle_browser_crash()
        else:
            self.browser_alive = False
            self.connection_label.config(
                text="🔴 브라우저 연결 안됨",
                fg='#F44336'
            )
        
        # 오류 카운터 업데이트
        self.error_label.config(text=f"오류: {self.connection_errors}/{self.max_errors}")
        
        # 5초마다 체크
        self.root.after(5000, self.check_browser_status)
    
    def auto_close_popups(self):
        """팝업 자동 처리"""
        if not self.driver or not self.popup_check_enabled:
            return
            
        try:
            # 1. Alert 처리
            try:
                alert = self.driver.switch_to.alert
                alert_text = alert.text
                print(f"Alert 감지: {alert_text}")
                alert.accept()  # 확인 버튼 클릭
                self.popup_closed_count += 1
                self.popup_status_label.config(text=f"팝업 처리: {self.popup_closed_count}개")
                return
            except:
                pass
            
            # 2. 일반적인 팝업/모달 선택자들
            popup_selectors = [
                # 일반적인 팝업 닫기 버튼
                "button[onclick*='close']",
                "button.close",
                "button.btn-close", 
                ".popup-close",
                ".modal-close",
                ".close-btn",
                
                # X 버튼들
                "button:contains('×')",
                "span:contains('×')",
                "a:contains('×')",
                
                # 확인/닫기 텍스트
                "button:contains('확인')",
                "button:contains('닫기')",
                "button:contains('Close')",
                "button:contains('OK')",
                
                # 특정 ID/Class
                "#popup_close",
                "#modal_close", 
                ".popup_close",
                ".modal_close"
            ]
            
            for selector in popup_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        if element.is_displayed() and element.is_enabled():
                            element.click()
                            self.popup_closed_count += 1
                            self.popup_status_label.config(text=f"팝업 처리: {self.popup_closed_count}개")
                            print(f"팝업 닫음: {selector}")
                            time.sleep(0.5)  # 팝업 닫힘 대기
                            return
                except:
                    continue
            
            # 3. 오버레이 클릭으로 닫기
            try:
                overlays = self.driver.find_elements(By.CSS_SELECTOR, ".overlay, .modal-backdrop, .popup-overlay")
                for overlay in overlays:
                    if overlay.is_displayed():
                        overlay.click()
                        self.popup_closed_count += 1
                        self.popup_status_label.config(text=f"팝업 처리: {self.popup_closed_count}개")
                        print("오버레이 클릭으로 팝업 닫음")
                        return
            except:
                pass
                
        except Exception as e:
            print(f"팝업 처리 오류: {e}")
    
    def manual_close_popups(self):
        """수동 팝업 닫기"""
        if not self.driver:
            messagebox.showwarning("경고", "브라우저가 연결되지 않았습니다.")
            return
            
        self.auto_close_popups()
        messagebox.showinfo("완료", f"팝업 처리 완료\n총 {self.popup_closed_count}개 처리됨")
    
    def handle_browser_crash(self):
        """브라우저 크래시 처리"""
        self.monitoring = False
        self.status_label.config(text="⚠️ 브라우저 연결이 끊어졌습니다. 재시작이 필요합니다.")
        
        # 버튼 상태 변경
        self.start_btn.config(state='disabled')
        self.restart_btn.config(state='normal')
        self.stop_btn.config(state='disabled')
        self.manual_login_btn.config(state='disabled')
        self.close_popup_btn.config(state='disabled')
        
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
        
        self.start_btn.config(state='normal')
        self.restart_btn.config(state='disabled')
        self.stop_btn.config(state='disabled')
        self.manual_login_btn.config(state='disabled')
        self.close_popup_btn.config(state='disabled')
        
        self.status_label.config(text="정지됨")
        
        # 학생 위젯들 제거
        for widget_info in self.student_widgets.values():
            widget_info['frame'].destroy()
        self.student_widgets = {}
        self.students = {}
        
        self.count_label.config(text="수업중: 0명")
        self.departed_label.config(text="하원: 0명")
        self.popup_closed_count = 0
        self.popup_status_label.config(text="팝업 처리: 0개")
    
    def run_browser(self):
        """브라우저 실행"""
        try:
            self.driver = webdriver.Chrome()
            self.driver.get("https://attok.co.kr/")
            self.browser_alive = True
            
            self.root.after(0, lambda: self.status_label.config(text="브라우저에서 로그인 후 '로그인 완료' 버튼을 눌러주세요"))
            self.root.after(0, lambda: self.manual_login_btn.config(state='normal'))
            self.root.after(0, lambda: self.close_popup_btn.config(state='normal'))
                
        except Exception as e:
            self.root.after(0, lambda: self.status_label.config(text=f"브라우저 시작 실패: {str(e)}"))
            self.root.after(0, lambda: self.start_btn.config(state='normal'))
            self.root.after(0, lambda: self.stop_btn.config(state='disabled'))
    
    def confirm_manual_login(self):
        """수동 로그인 완료 확인"""
        self.manual_login_btn.config(state='disabled')
        self.start_monitoring_after_login()
    
    def start_monitoring_after_login(self):
        """로그인 후 모니터링 시작"""
        self.status_label.config(text="모니터링 시작 중...")
        thread = threading.Thread(target=self.start_monitoring_loop, daemon=True)
        thread.start()
    
    def start_monitoring_loop(self):
        """모니터링 루프 시작"""
        self.monitoring = True
        self.logged_in = True
        self.root.after(0, lambda: self.status_label.config(text="모니터링 중... (10초 간격)"))
        
        self.monitor_thread()
    
    def monitor_thread(self):
        """모니터링 스레드 - 오류 처리 강화"""
        while self.monitoring:
            try:
                # 브라우저 상태 확인
                if not self.browser_alive:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 브라우저 연결 끊김 감지")
                    break
                
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
            width=20
        )
        remain_label.pack(side='left', padx=5)
        
        # 시간 조절 버튼
        btn_frame = tk.Frame(frame, bg='#1b5e20')
        btn_frame.pack(side='left', padx=5)
        
        minus_btn = tk.Button(
            btn_frame,
            text="-10",
            font=('맑은 고딕', 8),
            bg='#F44336',
            fg='white',
            command=lambda: self.adjust_student_time(name, -10),
            width=4,
            height=1
        )
        minus_btn.pack(side='left', padx=1)
        
        plus_btn = tk.Button(
            btn_frame,
            text="+10",
            font=('맑은 고딕', 8),
            bg='#2196F3',
            fg='white',
            command=lambda: self.adjust_student_time(name, 10),
            width=4,
            height=1
        )
        plus_btn.pack(side='left', padx=1)
        
        return {
            'frame': frame,
            'name': name_label,
            'time': time_label,
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
        
        # 하원한 경우
        if student_info.get('checked_out'):
            widget['frame'].config(bg='#616161')
            widget['name'].config(bg='#616161')
            widget['time'].config(bg='#616161', fg='#BDBDBD')
            widget['remain'].config(bg='#616161')
            widget['buttons'].config(bg='#616161')
            
            if student_info.get('actual_check_out_time'):
                check_out = student_info['actual_check_out_time']
                widget['remain'].config(
                    text=f"하원 {check_out.strftime('%H:%M')}",
                    fg='#BDBDBD'
                )
            else:
                widget['remain'].config(text="하원", fg='#BDBDBD')
            
            widget['minus_btn'].config(state='disabled')
            widget['plus_btn'].config(state='disabled')
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
                    if minutes > 0:
                        time_text = f"{hours}시간 {minutes}분"
                    else:
                        time_text = f"{hours}시간"
                else:
                    time_text = f"{total_minutes}분"
                
                if total_minutes > 30:
                    bg_color = '#1b5e20'
                    fg_color = 'lightgreen'
                elif total_minutes > 10:
                    bg_color = '#F57C00'
                    fg_color = 'white'
                else:
                    bg_color = '#E65100'
                    fg_color = 'yellow'
                
                widget['frame'].config(bg=bg_color)
                widget['name'].config(bg=bg_color)
                widget['time'].config(bg=bg_color)
                widget['remain'].config(bg=bg_color, text=time_text, fg=fg_color)
                widget['buttons'].config(bg=bg_color)
            else:
                # 시간 초과
                expected_time = end.strftime('%H:%M')
                
                widget['frame'].config(bg='#b71c1c')
                widget['name'].config(bg='#b71c1c')
                widget['time'].config(bg='#b71c1c')
                widget['remain'].config(
                    bg='#b71c1c',
                    text=f"하원예정 {expected_time}",
                    fg='white'
                )
                widget['buttons'].config(bg='#b71c1c')
                
                if not student_info.get('alerted'):
                    winsound.Beep(1000, 300)
                    self.students[name]['alerted'] = True
    
    def update_time_only(self):
        """시간 표시만 업데이트"""
        for name in self.student_widgets:
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
                            if minutes > 0:
                                time_text = f"{hours}시간 {minutes}분"
                            else:
                                time_text = f"{hours}시간"
                        else:
                            time_text = f"{total_minutes}분"
                        
                        current_text = widget['remain'].cget('text')
                        if current_text != time_text and "하원" not in current_text:
                            widget['remain'].config(text=time_text)
    
    def update_ui(self, current_data):
        """UI 업데이트"""
        checked_in_students = {name: data for name, data in current_data.items() 
                              if data.get('checked_in', False)}
        
        # 새로 출석한 학생 처리
        new_students = False
        for name in checked_in_students:
            data = checked_in_students[name]
            
            if name not in self.students:
                new_students = True
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
        
        # 위젯 순서 결정
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
        
        active_students.sort(key=lambda x: x[1])
        ordered_names = [name for name, _ in active_students] + departed_students
        
        # 위젯 재배치가 필요한 경우
        current_order = list(self.student_widgets.keys())
        if new_students or ordered_names != current_order:
            # 기존 위젯 제거
            for widget_info in self.student_widgets.values():
                widget_info['frame'].destroy()
            self.student_widgets = {}
            self.last_widget_update = {}
            
            # 위젯 재생성
            row = 0
            separator_row = len(active_students)
            
            for name in ordered_names:
                widget = self.create_student_widget(name)
                
                if row == separator_row and departed_students:
                    separator = tk.Frame(self.student_frame, bg='#555555', height=2)
                    separator.grid(row=row, column=0, sticky='ew', pady=5)
                    row += 1
                
                widget['frame'].grid(row=row, column=0, padx=5, pady=3, sticky='ew')
                self.student_widgets[name] = widget
                row += 1
        
        # 각 학생 위젯 업데이트
        for name in self.student_widgets:
            self.update_single_student(name)
        
        # 통계 업데이트
        active_count = len(active_students)
        departed_count = len(departed_students)
        self.count_label.config(text=f"수업중: {active_count}명")
        self.departed_label.config(text=f"하원: {departed_count}명")
        
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
    app = ManualOnlyAttendanceGUI()
    app.run()