"""
실시간 출결 모니터링 (수동 로그인 후 사용)
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time
import json
from datetime import datetime
import threading
import tkinter as tk
from tkinter import ttk, messagebox

class LiveAttendanceMonitor:
    """실시간 출결 모니터링"""
    
    def __init__(self):
        self.driver = None
        self.is_monitoring = False
        self.student_data = {}
        self.previous_data = {}
        self.changes_log = []
        
        # GUI 설정
        self.setup_gui()
        
    def setup_gui(self):
        """GUI 설정"""
        self.root = tk.Tk()
        self.root.title("Attok 실시간 출결 모니터링")
        self.root.geometry("900x700")
        
        # 상단 컨트롤 패널
        control_frame = ttk.Frame(self.root, padding="10")
        control_frame.pack(fill='x')
        
        ttk.Label(control_frame, text="Attok 실시간 출결 모니터링", 
                 font=('맑은 고딕', 16, 'bold')).pack(pady=5)
        
        # 버튼들
        btn_frame = ttk.Frame(control_frame)
        btn_frame.pack(pady=10)
        
        self.connect_btn = ttk.Button(btn_frame, text="브라우저 연결", 
                                    command=self.connect_browser, width=15)
        self.connect_btn.pack(side='left', padx=5)
        
        self.start_btn = ttk.Button(btn_frame, text="모니터링 시작", 
                                   command=self.start_monitoring, 
                                   state=tk.DISABLED, width=15)
        self.start_btn.pack(side='left', padx=5)
        
        self.stop_btn = ttk.Button(btn_frame, text="모니터링 중지", 
                                  command=self.stop_monitoring, 
                                  state=tk.DISABLED, width=15)
        self.stop_btn.pack(side='left', padx=5)
        
        # 상태 표시
        self.status_label = ttk.Label(control_frame, text="상태: 대기중", 
                                     font=('맑은 고딕', 12))
        self.status_label.pack(pady=5)
        
        # 학생 목록 영역
        list_frame = ttk.LabelFrame(self.root, text="현재 학생 목록", padding="10")
        list_frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        # 테이블 설정
        columns = ('이름', '상태색상', '마지막확인', '변화')
        self.tree = ttk.Treeview(list_frame, columns=columns, show='tree headings', height=15)
        
        # 컬럼 설정
        self.tree.heading('#0', text='번호')
        self.tree.column('#0', width=50)
        
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=150)
        
        # 스크롤바
        scrollbar = ttk.Scrollbar(list_frame, orient='vertical', command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        # 변화 로그 영역
        log_frame = ttk.LabelFrame(self.root, text="변화 로그", padding="10")
        log_frame.pack(fill='x', padx=10, pady=5)
        
        self.log_text = tk.Text(log_frame, height=8, font=('맑은 고딕', 9))
        log_scrollbar = ttk.Scrollbar(log_frame, orient='vertical', command=self.log_text.yview)
        self.log_text.configure(yscrollcommand=log_scrollbar.set)
        
        self.log_text.pack(side='left', fill='both', expand=True)
        log_scrollbar.pack(side='right', fill='y')
        
    def connect_browser(self):
        """브라우저 연결"""
        try:
            options = webdriver.ChromeOptions()
            options.add_argument('--disable-gpu')
            options.add_argument('--no-sandbox')
            
            # 새 브라우저 창 생성
            try:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=options)
            except:
                self.driver = webdriver.Chrome(options=options)
            
            self.status_label.config(text="상태: 브라우저 연결됨")
            
            # 출결 페이지로 이동
            attendance_url = "https://attok.co.kr/content/attendance/attendance.asp"
            self.driver.get(attendance_url)
            
            messagebox.showinfo("안내", 
                "브라우저가 열렸습니다.\n\n" + 
                "1. attok.co.kr에 로그인하세요\n" +
                "2. 출결 관리 페이지로 이동하세요\n" +
                "3. 로그인 완료 후 '모니터링 시작' 버튼을 누르세요\n\n" +
                "계정정보:\n" +
                "ID: roncorobot\n" +
                "PW: Ronco6374!")
            
            self.connect_btn.config(state=tk.DISABLED)
            self.start_btn.config(state=tk.NORMAL)
            
        except Exception as e:
            messagebox.showerror("오류", f"브라우저 연결 실패: {e}")
    
    def extract_students(self):
        """학생 데이터 추출"""
        try:
            # 현재 URL 확인
            current_url = self.driver.current_url
            if "attendance" not in current_url:
                self.log_message("경고: 출결 페이지가 아닙니다")
                return {}
            
            # 모든 텍스트 요소 검색
            text_elements = self.driver.find_elements(By.XPATH, "//*[text()]")
            students = {}
            
            for elem in text_elements:
                try:
                    text = elem.text.strip()
                    
                    # 한글 이름 패턴 확인 (2-4자)
                    if text and 2 <= len(text) <= 4:
                        if any('\uac00' <= char <= '\ud7a3' for char in text):
                            # 제외할 단어들
                            exclude = ['출석', '결석', '지각', '조퇴', '관리', '학원', '등록', '수정', '삭제', '검색', '시간', '날짜']
                            if not any(word in text for word in exclude):
                                
                                # 부모 요소의 배경색 확인
                                try:
                                    parent = elem.find_element(By.XPATH, "..")
                                    bg_color = parent.value_of_css_property("background-color")
                                    
                                    students[text] = {
                                        'name': text,
                                        'bg_color': bg_color,
                                        'element_class': elem.get_attribute('class') or '',
                                        'parent_class': parent.get_attribute('class') or '',
                                        'last_seen': datetime.now().strftime('%H:%M:%S')
                                    }
                                except:
                                    students[text] = {
                                        'name': text,
                                        'bg_color': 'unknown',
                                        'element_class': elem.get_attribute('class') or '',
                                        'last_seen': datetime.now().strftime('%H:%M:%S')
                                    }
                except:
                    continue
            
            return students
            
        except Exception as e:
            self.log_message(f"데이터 추출 오류: {e}")
            return {}
    
    def detect_changes(self, new_data):
        """변화 감지"""
        changes = []
        current_time = datetime.now().strftime('%H:%M:%S')
        
        # 새로운 학생 또는 상태 변화
        for name, new_info in new_data.items():
            if name in self.previous_data:
                old_info = self.previous_data[name]
                if old_info['bg_color'] != new_info['bg_color']:
                    change = f"[{current_time}] {name}: {old_info['bg_color']} → {new_info['bg_color']}"
                    changes.append(change)
                    self.log_message(f"출석 변화: {change}")
            else:
                change = f"[{current_time}] 새 학생: {name} ({new_info['bg_color']})"
                changes.append(change)
                self.log_message(f"새 학생 발견: {change}")
        
        # 사라진 학생
        for name in self.previous_data:
            if name not in new_data:
                change = f"[{current_time}] 학생 사라짐: {name}"
                changes.append(change)
                self.log_message(f"학생 제거: {change}")
        
        return changes
    
    def update_display(self):
        """화면 업데이트"""
        # 기존 데이터 클리어
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # 새 데이터 추가
        for i, (name, info) in enumerate(self.student_data.items(), 1):
            # 변화 여부 확인
            change_status = ""
            if name in self.previous_data:
                if self.previous_data[name]['bg_color'] != info['bg_color']:
                    change_status = "변화됨"
            else:
                change_status = "신규"
            
            self.tree.insert('', 'end', text=str(i), values=(
                name,
                info['bg_color'],
                info['last_seen'],
                change_status
            ))
    
    def log_message(self, message):
        """로그 메시지 추가"""
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        
        # 로그가 너무 길어지면 앞부분 삭제
        lines = self.log_text.get("1.0", tk.END).split('\n')
        if len(lines) > 100:
            self.log_text.delete("1.0", "20.0")
    
    def monitoring_thread(self):
        """모니터링 스레드"""
        while self.is_monitoring:
            try:
                # 학생 데이터 추출
                new_data = self.extract_students()
                
                if new_data:
                    # 변화 감지
                    changes = self.detect_changes(new_data)
                    
                    # 데이터 업데이트
                    self.previous_data = self.student_data.copy()
                    self.student_data = new_data
                    
                    # 화면 업데이트 (메인 스레드에서)
                    self.root.after(0, self.update_display)
                    
                    # 상태 업데이트
                    status_msg = f"상태: 모니터링 중 - 학생 {len(new_data)}명"
                    self.root.after(0, lambda: self.status_label.config(text=status_msg))
                    
                    # 데이터 저장
                    if changes:
                        self.save_data()
                else:
                    self.root.after(0, lambda: self.log_message("학생 데이터 없음 - 페이지 확인 필요"))
                
                time.sleep(10)  # 10초 간격
                
            except Exception as e:
                error_msg = f"모니터링 오류: {e}"
                self.root.after(0, lambda: self.log_message(error_msg))
                time.sleep(10)
    
    def start_monitoring(self):
        """모니터링 시작"""
        if not self.driver:
            messagebox.showerror("오류", "먼저 브라우저를 연결하세요")
            return
        
        # 초기 데이터 추출
        self.student_data = self.extract_students()
        
        if not self.student_data:
            result = messagebox.askyesno("확인", 
                "학생 데이터를 찾을 수 없습니다.\n" +
                "출결 페이지에 로그인되어 있나요?\n" +
                "그래도 모니터링을 시작하시겠습니까?")
            if not result:
                return
        
        self.log_message(f"모니터링 시작 - 초기 학생 {len(self.student_data)}명 감지")
        
        # 초기 화면 업데이트
        self.update_display()
        
        # 모니터링 시작
        self.is_monitoring = True
        self.monitor_thread = threading.Thread(target=self.monitoring_thread, daemon=True)
        self.monitor_thread.start()
        
        # 버튼 상태 변경
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        
        self.status_label.config(text="상태: 모니터링 시작됨")
    
    def stop_monitoring(self):
        """모니터링 중지"""
        self.is_monitoring = False
        
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        
        self.status_label.config(text="상태: 모니터링 중지됨")
        self.log_message("모니터링 중지")
        
        self.save_data()
    
    def save_data(self):
        """데이터 저장"""
        try:
            data = {
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'students': self.student_data,
                'total_students': len(self.student_data)
            }
            
            with open('live_monitoring_data.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            self.log_message(f"데이터 저장 오류: {e}")
    
    def run(self):
        """GUI 실행"""
        def on_closing():
            if self.is_monitoring:
                self.stop_monitoring()
            if self.driver:
                self.driver.quit()
            self.root.destroy()
        
        self.root.protocol("WM_DELETE_WINDOW", on_closing)
        self.root.mainloop()

if __name__ == "__main__":
    app = LiveAttendanceMonitor()
    app.run()