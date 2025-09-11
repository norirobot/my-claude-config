"""
ATTOK 통합 시스템 v1.0
- 출결 모니터링 시스템 + 암호화된 로그인 시스템 통합
- 기존 출결 기능 100% 유지
- 로그인 정보 암호화 저장/자동 로그인 추가
"""
import tkinter as tk
from tkinter import messagebox, ttk
import threading
import time
import os
import base64
import json
from cryptography.fernet import Fernet
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pyttsx3
from datetime import datetime, timedelta
import re
import csv
from collections import defaultdict

class IntegratedAttokSystem:
    def __init__(self, root):
        self.root = root
        self.root.title("ATTOK 통합 시스템 v1.0 - 출결모니터링 + 자동로그인")
        self.root.geometry("800x600")
        self.root.configure(bg='#1e1e1e')
        
        # 드라이버 및 URL 설정
        self.driver = None
        self.login_url = "https://attok.co.kr/center_login_lite_new.asp"
        self.main_url = "https://attok.co.kr/"  # ATTOK 메인 페이지
        
        # 암호화 관련 설정
        self.key_file = "login.key"
        self.config_file = "login_config.dat"
        self.load_or_create_key()
        
        # 출결 모니터링 관련 설정
        self.students = {}
        self.monitoring = False
        self.keep_session_active = False
        self.session_thread = None
        self.voice_engine = None
        self.init_voice_engine()
        
        # 상태 관리
        self.login_completed = False
        
        self.setup_ui()
        self.load_saved_credentials()
    
    def load_or_create_key(self):
        """암호화 키 생성/로드"""
        try:
            if os.path.exists(self.key_file):
                with open(self.key_file, 'rb') as f:
                    self.key = f.read()
            else:
                self.key = Fernet.generate_key()
                with open(self.key_file, 'wb') as f:
                    f.write(self.key)
            self.cipher = Fernet(self.key)
        except Exception as e:
            print(f"암호화 키 오류: {e}")
            # 기본 키 사용
            self.key = base64.urlsafe_b64encode(b"attok_login_key_2025".ljust(32, b'\0')[:32])
            self.cipher = Fernet(self.key)
    
    def save_credentials(self, username, password):
        """아이디/비밀번호 암호화해서 저장"""
        try:
            data = {
                "username": username,
                "password": password
            }
            
            json_str = json.dumps(data)
            encrypted_data = self.cipher.encrypt(json_str.encode())
            
            with open(self.config_file, 'wb') as f:
                f.write(encrypted_data)
            
            print("로그인 정보 저장 완료")
        except Exception as e:
            print(f"저장 오류: {e}")
    
    def load_saved_credentials(self):
        """저장된 아이디/비밀번호 로드"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'rb') as f:
                    encrypted_data = f.read()
                
                decrypted_data = self.cipher.decrypt(encrypted_data)
                data = json.loads(decrypted_data.decode())
                
                # UI에 자동 입력
                if hasattr(self, 'username_entry'):
                    self.username_entry.delete(0, tk.END)
                    self.username_entry.insert(0, data.get("username", ""))
                    
                    self.password_entry.delete(0, tk.END)
                    self.password_entry.insert(0, data.get("password", ""))
                
                print("저장된 로그인 정보 로드 완료")
                return True
        except Exception as e:
            print(f"로드 오류: {e}")
        return False
    
    def init_voice_engine(self):
        """음성 엔진 초기화"""
        try:
            self.voice_engine = pyttsx3.init()
            voices = self.voice_engine.getProperty('voices')
            
            # Microsoft Heami 음성 찾기 (한국어)
            for voice in voices:
                if 'Heami' in voice.name or 'Korean' in voice.name:
                    self.voice_engine.setProperty('voice', voice.id)
                    break
            
            # 음성 설정 최적화
            self.voice_engine.setProperty('rate', 100)  # 속도
            self.voice_engine.setProperty('volume', 1.0)  # 음량 최대
            
        except Exception as e:
            print(f"음성 엔진 초기화 오류: {e}")
            self.voice_engine = None
    
    def play_notification_sound(self, notification_type, student_name=None):
        """음성 알림 재생"""
        if not self.voice_engine or not student_name:
            return
            
        try:
            if notification_type == "등원":
                message = f"{student_name} 등원"
            elif notification_type == "하원":
                message = f"{student_name} 하원"
            else:
                return
            
            # 음성 재생
            self.voice_engine.say(message)
            self.voice_engine.runAndWait()
            
        except Exception as e:
            print(f"음성 알림 오류: {e}")
    
    def setup_ui(self):
        """UI 설정"""
        # 메인 컨테이너
        main_container = tk.Frame(self.root, bg='#1e1e1e')
        main_container.pack(fill='both', expand=True, padx=20, pady=20)
        
        # 제목
        title_label = tk.Label(main_container, 
                              text="🏫 ATTOK 통합 시스템 v1.0", 
                              font=('맑은 고딕', 20, 'bold'), 
                              fg='#ffffff', bg='#1e1e1e')
        title_label.pack(pady=(0, 20))
        
        # 로그인 섹션
        self.setup_login_section(main_container)
        
        # 구분선
        separator = tk.Frame(main_container, height=2, bg='#404040')
        separator.pack(fill='x', pady=20)
        
        # 출결 모니터링 섹션
        self.setup_monitoring_section(main_container)
    
    def setup_login_section(self, parent):
        """로그인 섹션 UI"""
        login_frame = tk.LabelFrame(parent, text="🔐 자동 로그인", 
                                   font=('맑은 고딕', 14, 'bold'),
                                   fg='#ffffff', bg='#2d2d30', 
                                   bd=2, relief='groove')
        login_frame.pack(fill='x', pady=(0, 10))
        
        # 로그인 입력 프레임
        input_frame = tk.Frame(login_frame, bg='#2d2d30')
        input_frame.pack(padx=20, pady=15)
        
        # ID 입력
        tk.Label(input_frame, text="사용자 ID:", fg='#ffffff', bg='#2d2d30', 
                font=('맑은 고딕', 11)).grid(row=0, column=0, padx=(0, 10), pady=8, sticky='e')
        
        self.username_entry = tk.Entry(input_frame, width=20, font=('맑은 고딕', 10))
        self.username_entry.grid(row=0, column=1, padx=5, pady=8)
        
        # 비밀번호 입력
        tk.Label(input_frame, text="비밀번호:", fg='#ffffff', bg='#2d2d30',
                font=('맑은 고딕', 11)).grid(row=1, column=0, padx=(0, 10), pady=8, sticky='e')
        
        self.password_entry = tk.Entry(input_frame, width=20, show='*', font=('맑은 고딕', 10))
        self.password_entry.grid(row=1, column=1, padx=5, pady=8)
        
        # 저장 체크박스
        self.save_var = tk.BooleanVar(value=True)
        save_check = tk.Checkbutton(input_frame, text="로그인 정보 저장", 
                                   variable=self.save_var,
                                   fg='#ffffff', bg='#2d2d30',
                                   selectcolor='#2d2d30',
                                   font=('맑은 고딕', 9))
        save_check.grid(row=2, column=1, pady=5, sticky='w')
        
        # 버튼 프레임
        button_frame = tk.Frame(input_frame, bg='#2d2d30')
        button_frame.grid(row=3, column=0, columnspan=3, pady=15)
        
        # 로그인 버튼
        self.login_btn = tk.Button(button_frame, text="🔑 자동 로그인 시작", 
                                  command=self.start_auto_login,
                                  bg='#007acc', fg='white', 
                                  font=('맑은 고딕', 12, 'bold'),
                                  width=18, height=2)
        self.login_btn.pack(side='left', padx=5)
        
        # 설정 삭제 버튼
        clear_btn = tk.Button(button_frame, text="저장정보 삭제", 
                             command=self.clear_saved_data,
                             bg='#dc3545', fg='white', 
                             font=('맑은 고딕', 10),
                             width=12, height=2)
        clear_btn.pack(side='left', padx=5)
        
        # 로그인 상태 표시
        self.login_status_label = tk.Label(login_frame, 
                                          text="💡 저장된 로그인 정보가 있으면 자동으로 입력됩니다", 
                                          fg='#cccccc', bg='#2d2d30',
                                          font=('맑은 고딕', 9))
        self.login_status_label.pack(pady=(0, 15))
        
        # Enter 키 바인딩
        self.username_entry.bind('<Return>', lambda e: self.password_entry.focus())
        self.password_entry.bind('<Return>', lambda e: self.start_auto_login())
    
    def setup_monitoring_section(self, parent):
        """출결 모니터링 섹션 UI"""
        monitoring_frame = tk.LabelFrame(parent, text="📊 출결 모니터링", 
                                        font=('맑은 고딕', 14, 'bold'),
                                        fg='#ffffff', bg='#2d2d30', 
                                        bd=2, relief='groove')
        monitoring_frame.pack(fill='both', expand=True)
        
        # 제어 버튼 프레임
        control_frame = tk.Frame(monitoring_frame, bg='#2d2d30')
        control_frame.pack(fill='x', padx=20, pady=15)
        
        # 모니터링 시작 버튼
        self.start_monitoring_btn = tk.Button(control_frame, text="📈 출결 모니터링 시작", 
                                             command=self.start_monitoring,
                                             bg='#28a745', fg='white', 
                                             font=('맑은 고딕', 12, 'bold'),
                                             width=18, height=2,
                                             state='disabled')  # 로그인 후 활성화
        self.start_monitoring_btn.pack(side='left', padx=5)
        
        # 모니터링 중지 버튼
        self.stop_monitoring_btn = tk.Button(control_frame, text="⏹️ 모니터링 중지", 
                                            command=self.stop_monitoring,
                                            bg='#dc3545', fg='white', 
                                            font=('맑은 고딕', 12, 'bold'),
                                            width=15, height=2,
                                            state='disabled')
        self.stop_monitoring_btn.pack(side='left', padx=5)
        
        # CSV 내보내기 버튼
        self.export_btn = tk.Button(control_frame, text="📁 CSV 내보내기", 
                                   command=self.export_to_csv,
                                   bg='#17a2b8', fg='white', 
                                   font=('맑은 고딕', 11),
                                   width=12, height=2)
        self.export_btn.pack(side='left', padx=5)
        
        # 상태 표시
        self.monitoring_status_label = tk.Label(monitoring_frame, 
                                               text="🔒 먼저 로그인을 완료해주세요", 
                                               fg='#ffc107', bg='#2d2d30',
                                               font=('맑은 고딕', 11, 'bold'))
        self.monitoring_status_label.pack(pady=10)
        
        # 학생 목록 프레임
        list_frame = tk.Frame(monitoring_frame, bg='#2d2d30')
        list_frame.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        
        # 스크롤바가 있는 학생 목록
        canvas = tk.Canvas(list_frame, bg='#1e1e1e', highlightthickness=0)
        scrollbar = ttk.Scrollbar(list_frame, orient="vertical", command=canvas.yview)
        self.student_list_frame = tk.Frame(canvas, bg='#1e1e1e')
        
        self.student_list_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=self.student_list_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        self.canvas = canvas
    
    def start_auto_login(self):
        """자동 로그인 시작"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            self.login_status_label.config(text="❌ 사용자 ID와 비밀번호를 모두 입력해주세요", fg='#dc3545')
            return
        
        # 로그인 정보 저장 (체크박스 선택시)
        if self.save_var.get():
            self.save_credentials(username, password)
        
        self.login_btn.config(state='disabled')
        self.login_status_label.config(text="🔄 로그인 중...", fg='#ffc107')
        
        # 별도 스레드에서 로그인 실행
        threading.Thread(target=self.perform_login, args=(username, password), daemon=True).start()
    
    def perform_login(self, username, password):
        """로그인 수행"""
        try:
            # 1. 브라우저 시작
            self.root.after(0, lambda: self.login_status_label.config(text="🌐 브라우저 시작 중...", fg='#17a2b8'))
            
            options = Options()
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1280,720')
            
            self.driver = webdriver.Chrome(options=options)
            self.driver.implicitly_wait(3)
            
            # 2. 로그인 페이지 접속
            self.root.after(0, lambda: self.login_status_label.config(text="📄 로그인 페이지 접속 중...", fg='#17a2b8'))
            
            self.driver.get(self.login_url)
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.NAME, "user_id"))
            )
            
            # 3. 로그인 정보 입력
            self.root.after(0, lambda: self.login_status_label.config(text="✏️ 로그인 정보 입력 중...", fg='#17a2b8'))
            
            user_id_field = self.driver.find_element(By.NAME, "user_id")
            user_id_field.clear()
            user_id_field.send_keys(username)
            
            password_field = self.driver.find_element(By.NAME, "user_pass")
            password_field.clear()
            password_field.send_keys(password)
            
            # 4. 로그인 버튼 클릭
            self.root.after(0, lambda: self.login_status_label.config(text="🔘 로그인 버튼 클릭 중...", fg='#17a2b8'))
            
            button_selectors = [
                "//input[@type='button' and @value='로그인']",
                "//button[text()='로그인']",
                "//input[@value='로그인']",
                "//button[contains(text(), '로그인')]"
            ]
            
            login_button = None
            for selector in button_selectors:
                try:
                    login_button = self.driver.find_element(By.XPATH, selector)
                    break
                except:
                    continue
            
            if not login_button:
                self.root.after(0, lambda: self.login_status_label.config(text="❌ 로그인 버튼을 찾을 수 없습니다", fg='#dc3545'))
                self.root.after(0, lambda: self.login_btn.config(state='normal'))
                return
            
            # JavaScript로 빠른 클릭
            self.driver.execute_script("arguments[0].click();", login_button)
            time.sleep(2)
            
            # 5. 로그인 결과 확인
            current_url = self.driver.current_url
            
            if "loginok.asp" in current_url or current_url != self.login_url:
                # 로그인 성공
                self.root.after(0, lambda: self.login_status_label.config(text="✅ 로그인 성공! ATTOK 메인 페이지로 이동 중...", fg='#28a745'))
                
                # ATTOK 메인 페이지로 이동
                self.driver.get(self.main_url)
                time.sleep(3)  # 페이지 로딩 대기
                
                self.root.after(0, lambda: self.login_status_label.config(text="✅ ATTOK 시스템 준비 완료! 자동으로 모니터링을 시작합니다", fg='#28a745'))
                self.root.after(0, lambda: self.login_btn.config(text="✅ 로그인 완료", state='disabled'))
                
                # 로그인 완료 상태 설정
                self.login_completed = True
                
                # 출결 모니터링 버튼 활성화
                self.root.after(0, lambda: self.start_monitoring_btn.config(state='normal'))
                
                # 브라우저 최소화
                self.driver.minimize_window()
                
                # 2초 후 자동으로 모니터링 시작
                self.root.after(2000, self.auto_start_monitoring)
                
            else:
                # 로그인 실패
                self.root.after(0, lambda: self.login_status_label.config(text="❌ 로그인 실패 - 아이디나 비밀번호를 확인해주세요", fg='#dc3545'))
                self.root.after(0, lambda: self.login_btn.config(state='normal'))
                
        except Exception as e:
            error_msg = f"❌ 오류 발생: {str(e)}"
            self.root.after(0, lambda: self.login_status_label.config(text=error_msg, fg='#dc3545'))
            self.root.after(0, lambda: self.login_btn.config(state='normal'))
    
    def auto_start_monitoring(self):
        """로그인 후 자동으로 모니터링 시작"""
        try:
            if self.login_completed and not self.monitoring:
                print("자동 모니터링 시작...")
                self.start_monitoring()
        except Exception as e:
            print(f"자동 모니터링 시작 오류: {e}")
    
    def start_monitoring(self):
        """출결 모니터링 시작"""
        if not self.login_completed or not self.driver:
            messagebox.showerror("오류", "먼저 로그인을 완료해주세요")
            return
        
        self.monitoring = True
        self.keep_session_active = True
        
        # UI 업데이트
        self.start_monitoring_btn.config(state='disabled')
        self.stop_monitoring_btn.config(state='normal')
        self.monitoring_status_label.config(text="🔄 출결 모니터링 실행 중...", fg='#17a2b8')
        
        # 모니터링 스레드 시작
        threading.Thread(target=self.monitor_attendance, daemon=True).start()
        
        # 세션 유지 스레드 시작
        if not self.session_thread or not self.session_thread.is_alive():
            self.session_thread = threading.Thread(target=self.keep_session_alive, daemon=True)
            self.session_thread.start()
    
    def stop_monitoring(self):
        """출결 모니터링 중지"""
        self.monitoring = False
        self.keep_session_active = False
        
        # UI 업데이트
        self.start_monitoring_btn.config(state='normal')
        self.stop_monitoring_btn.config(state='disabled')
        self.monitoring_status_label.config(text="⏹️ 모니터링이 중지되었습니다", fg='#ffc107')
    
    def monitor_attendance(self):
        """출결 모니터링 메인 루프"""
        try:
            while self.monitoring:
                # 학생 출결 정보 수집
                self.collect_student_data()
                
                # 2초 대기
                time.sleep(2)
                
        except Exception as e:
            print(f"모니터링 오류: {e}")
            self.root.after(0, lambda: self.monitoring_status_label.config(text=f"❌ 모니터링 오류: {str(e)}", fg='#dc3545'))
    
    def collect_student_data(self):
        """학생 출결 데이터 수집"""
        try:
            if not self.driver:
                return
            
            # ATTOK 메인 페이지로 이동 (필요시)
            current_url = self.driver.current_url
            if "attok.co.kr" not in current_url or "default.asp" in current_url:
                self.driver.get(self.main_url)
                time.sleep(2)
            
            # 페이지 새로고침
            self.driver.refresh()
            time.sleep(2)
            
            # ATTOK 사이트의 실제 학생 목록 테이블 찾기
            try:
                # 학생 출결 테이블의 행들 찾기
                student_rows = self.driver.find_elements(By.XPATH, "//table//tr[td]")  # 테이블의 데이터 행들
                print(f"찾은 학생 행 수: {len(student_rows)}")
            except:
                # 대안적인 선택자들 시도
                student_elements = self.driver.find_elements(By.CLASS_NAME, "student-row")
                if not student_elements:
                    student_elements = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'student')]")
                student_rows = student_elements
            
            current_time = datetime.now()
            
            for row in student_rows:
                try:
                    # 테이블 셀들에서 학생 정보 추출
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) < 3:  # 최소 3개 열 필요 (이름, 상태 등)
                        continue
                    
                    # 첫 번째 열에서 학생 이름 추출 (일반적인 패턴)
                    name = cells[0].text.strip() if cells[0].text else cells[1].text.strip()
                    
                    # 출결 상태 추출 (여러 열 중 상태 정보가 있는 열 찾기)
                    status = "미확인"
                    for cell in cells[1:]:
                        cell_text = cell.text.strip().lower()
                        if any(keyword in cell_text for keyword in ['출석', '등원', '재원', 'present']):
                            status = "출석"
                            break
                        elif any(keyword in cell_text for keyword in ['하원', '퇴원', '하교', 'leave', 'exit']):
                            status = "하원"
                            break
                        elif any(keyword in cell_text for keyword in ['결석', 'absent']):
                            status = "결석"
                            break
                    
                    # 이름이 비어있거나 의미없는 텍스트면 스킵
                    if not name or len(name) < 2 or name in ['No.', '번호', '순서', '구분']:
                        continue
                    
                    print(f"학생 발견: {name} - 상태: {status}")
                    
                    # 기존 학생 정보와 비교
                    if name not in self.students:
                        self.students[name] = {
                            'status': status,
                            'last_update': current_time,
                            'arrival_time': None,
                            'departure_time': None
                        }
                        
                        # 새 학생 등원 알림
                        if status == "출석":
                            self.students[name]['arrival_time'] = current_time
                            print(f"새 학생 등원: {name}")
                            threading.Thread(target=self.play_notification_sound, args=("등원", name), daemon=True).start()
                            
                    else:
                        # 상태 변화 확인
                        old_status = self.students[name]['status']
                        if old_status != status:
                            self.students[name]['status'] = status
                            self.students[name]['last_update'] = current_time
                            
                            print(f"상태 변화: {name} {old_status} → {status}")
                            
                            # 상태 변화에 따른 알림
                            if status == "출석" and old_status != "출석":
                                self.students[name]['arrival_time'] = current_time
                                threading.Thread(target=self.play_notification_sound, args=("등원", name), daemon=True).start()
                            elif status == "하원" and old_status == "출석":
                                self.students[name]['departure_time'] = current_time
                                threading.Thread(target=self.play_notification_sound, args=("하원", name), daemon=True).start()
                
                except Exception as e:
                    print(f"학생 정보 처리 오류: {e}")
                    continue
            
            # UI 업데이트
            self.root.after(0, self.update_student_display)
            
        except Exception as e:
            print(f"데이터 수집 오류: {e}")
    
    def update_student_display(self):
        """학생 목록 UI 업데이트"""
        try:
            # 기존 위젯 제거
            for widget in self.student_list_frame.winfo_children():
                widget.destroy()
            
            if not self.students:
                no_data_label = tk.Label(self.student_list_frame, 
                                        text="📋 출결 데이터가 없습니다", 
                                        fg='#cccccc', bg='#1e1e1e',
                                        font=('맑은 고딕', 12))
                no_data_label.pack(pady=20)
                return
            
            # 학생별 카드 생성
            for i, (name, info) in enumerate(self.students.items()):
                self.create_student_card(self.student_list_frame, name, info, i)
            
            # 스크롤 영역 업데이트
            self.student_list_frame.update_idletasks()
            self.canvas.configure(scrollregion=self.canvas.bbox("all"))
            
        except Exception as e:
            print(f"디스플레이 업데이트 오류: {e}")
    
    def create_student_card(self, parent, name, info, index):
        """개별 학생 카드 생성"""
        # 카드 프레임
        card_frame = tk.Frame(parent, bg='#2d2d30', relief='raised', bd=1)
        card_frame.pack(fill='x', padx=10, pady=5)
        
        # 학생 이름
        name_label = tk.Label(card_frame, text=f"👤 {name}", 
                             fg='#ffffff', bg='#2d2d30',
                             font=('맑은 고딕', 12, 'bold'))
        name_label.pack(anchor='w', padx=15, pady=(10, 5))
        
        # 상태 정보
        status_color = '#28a745' if info['status'] == '출석' else '#dc3545' if info['status'] == '하원' else '#ffc107'
        status_label = tk.Label(card_frame, text=f"📊 상태: {info['status']}", 
                               fg=status_color, bg='#2d2d30',
                               font=('맑은 고딕', 10))
        status_label.pack(anchor='w', padx=15, pady=2)
        
        # 시간 정보
        if info['arrival_time']:
            arrival_text = info['arrival_time'].strftime("%H:%M:%S")
            arrival_label = tk.Label(card_frame, text=f"🕐 등원: {arrival_text}", 
                                   fg='#17a2b8', bg='#2d2d30',
                                   font=('맑은 고딕', 9))
            arrival_label.pack(anchor='w', padx=15, pady=1)
        
        if info['departure_time']:
            departure_text = info['departure_time'].strftime("%H:%M:%S")
            departure_label = tk.Label(card_frame, text=f"🚪 하원: {departure_text}", 
                                     fg='#fd7e14', bg='#2d2d30',
                                     font=('맑은 고딕', 9))
            departure_label.pack(anchor='w', padx=15, pady=1)
        
        # 마지막 업데이트 시간
        last_update = info['last_update'].strftime("%H:%M:%S")
        update_label = tk.Label(card_frame, text=f"🔄 업데이트: {last_update}", 
                               fg='#6c757d', bg='#2d2d30',
                               font=('맑은 고딕', 8))
        update_label.pack(anchor='w', padx=15, pady=(1, 10))
    
    def keep_session_alive(self):
        """세션 유지"""
        while self.keep_session_active:
            try:
                if self.driver:
                    # 간단한 JavaScript 실행으로 활동 유지
                    self.driver.execute_script("console.log('세션 유지');")
                
                # 10초 대기
                time.sleep(10)
                
            except Exception as e:
                print(f"세션 유지 오류: {e}")
                break
    
    def export_to_csv(self):
        """CSV 파일로 내보내기"""
        try:
            if not self.students:
                messagebox.showwarning("경고", "내보낼 데이터가 없습니다")
                return
            
            # 파일명 생성
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"attok_attendance_{timestamp}.csv"
            
            # CSV 파일 작성
            with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
                fieldnames = ['이름', '상태', '등원시간', '하원시간', '최종업데이트']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for name, info in self.students.items():
                    writer.writerow({
                        '이름': name,
                        '상태': info['status'],
                        '등원시간': info['arrival_time'].strftime("%Y-%m-%d %H:%M:%S") if info['arrival_time'] else '',
                        '하원시간': info['departure_time'].strftime("%Y-%m-%d %H:%M:%S") if info['departure_time'] else '',
                        '최종업데이트': info['last_update'].strftime("%Y-%m-%d %H:%M:%S")
                    })
            
            messagebox.showinfo("완료", f"CSV 파일이 저장되었습니다: {filename}")
            
        except Exception as e:
            messagebox.showerror("오류", f"CSV 내보내기 실패: {str(e)}")
    
    def clear_saved_data(self):
        """저장된 로그인 정보 삭제"""
        try:
            if os.path.exists(self.config_file):
                os.remove(self.config_file)
            if os.path.exists(self.key_file):
                os.remove(self.key_file)
            
            self.username_entry.delete(0, tk.END)
            self.password_entry.delete(0, tk.END)
            
            self.login_status_label.config(text="🗑️ 저장된 로그인 정보가 삭제되었습니다", fg='#ffc107')
        except Exception as e:
            self.login_status_label.config(text=f"❌ 삭제 오류: {str(e)}", fg='#dc3545')
    
    def close_browser(self):
        """브라우저 종료"""
        self.monitoring = False
        self.keep_session_active = False
        
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
            self.driver = None

def main():
    """메인 실행 함수"""
    root = tk.Tk()
    app = IntegratedAttokSystem(root)
    
    # 창 닫기 이벤트 처리
    def on_closing():
        app.close_browser()
        root.destroy()
    
    root.protocol("WM_DELETE_WINDOW", on_closing)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        print("프로그램 종료")
    finally:
        app.close_browser()

if __name__ == "__main__":
    print("ATTOK 통합 시스템 v1.0 시작")
    print("=" * 50)
    print("기능: 자동 로그인 + 출결 모니터링 + 음성 알림")
    print("=" * 50)
    main()