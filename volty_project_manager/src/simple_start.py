"""
Volty 프로젝트 관리 시스템 - 단계적 시작
1단계: 기본 GUI 프레임워크만 구현
"""

import os
import sys
# 한국어 인코딩 설정
if sys.platform == "win32":
    import locale
    locale.setlocale(locale.LC_ALL, 'Korean_Korea.949')

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import sqlite3
from pathlib import Path
from datetime import datetime

class VoltySimpleStart:
    def __init__(self, root):
        self.root = root
        self.root.title("Volty Project Manager - 1단계 (기본 GUI)")
        self.root.geometry("1200x800")
        
        # 데이터 폴더 설정
        self.data_dir = Path("../data")
        self.data_dir.mkdir(exist_ok=True)
        
        # 기본 데이터베이스 연결
        self.init_database()
        
        # GUI 구성
        self.setup_gui()
        
        # GUI 설정 완료 후 프로젝트 로드 및 상태 메시지
        self.load_projects()
        self.add_log("Volty 프로젝트 관리 시스템 1단계 시작")
    
    def init_database(self):
        """간단한 데이터베이스 초기화"""
        try:
            self.conn = sqlite3.connect(self.data_dir / 'volty_simple.db')
            self.cursor = self.conn.cursor()
            
            # 기본 프로젝트 테이블만
            self.cursor.execute('''
                CREATE TABLE IF NOT EXISTS projects (
                    id INTEGER PRIMARY KEY,
                    name TEXT UNIQUE,
                    description TEXT,
                    status TEXT DEFAULT 'planning',
                    created_date TEXT
                )
            ''')
            
            self.conn.commit()
            self.add_log("데이터베이스 초기화 완료")
            
        except Exception as e:
            messagebox.showerror("데이터베이스 오류", f"데이터베이스 초기화 실패: {str(e)}")
    
    def setup_gui(self):
        """기본 GUI 설정 - 3개 패널"""
        # 메인 프레임
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 왼쪽: 프로젝트 관리
        left_frame = ttk.LabelFrame(main_frame, text="📋 프로젝트 관리", padding=10)
        left_frame.grid(row=0, column=0, sticky='nsew', padx=(0, 5))
        
        # 가운데: 작업 영역 (나중에 장비 제어 등)
        center_frame = ttk.LabelFrame(main_frame, text="🔧 작업 영역", padding=10)
        center_frame.grid(row=0, column=1, sticky='nsew', padx=5)
        
        # 오른쪽: 로그 & 상태
        right_frame = ttk.LabelFrame(main_frame, text="📊 시스템 로그", padding=10)
        right_frame.grid(row=0, column=2, sticky='nsew', padx=(5, 0))
        
        # 그리드 가중치
        main_frame.grid_columnconfigure((0, 1, 2), weight=1)
        main_frame.grid_rowconfigure(0, weight=1)
        
        # 각 패널 설정
        self.setup_project_panel(left_frame)
        self.setup_work_panel(center_frame)
        self.setup_log_panel(right_frame)
        
        # 하단 상태바
        self.status_bar = ttk.Label(self.root, text="시스템 준비 완료", relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def setup_project_panel(self, parent):
        """프로젝트 관리 패널"""
        # 새 프로젝트 버튼
        ttk.Button(parent, text="➕ 새 프로젝트", 
                  command=self.create_new_project, 
                  style='Accent.TButton').pack(fill=tk.X, pady=(0, 10))
        
        # 프로젝트 목록
        ttk.Label(parent, text="프로젝트 목록:", font=('', 10, 'bold')).pack(anchor=tk.W)
        
        # 리스트박스로 간단히 시작
        self.project_listbox = tk.Listbox(parent, height=15)
        self.project_listbox.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # 프로젝트 액션 버튼
        btn_frame = ttk.Frame(parent)
        btn_frame.pack(fill=tk.X, pady=5)
        
        ttk.Button(btn_frame, text="열기", 
                  command=self.open_project).grid(row=0, column=0, padx=(0, 5), sticky='ew')
        ttk.Button(btn_frame, text="삭제", 
                  command=self.delete_project).grid(row=0, column=1, padx=5, sticky='ew')
        
        btn_frame.grid_columnconfigure((0, 1), weight=1)
    
    def setup_work_panel(self, parent):
        """작업 영역 패널 (현재는 플레이스홀더)"""
        # 현재 프로젝트 정보
        self.current_project_var = tk.StringVar(value="프로젝트를 선택하세요")
        ttk.Label(parent, textvariable=self.current_project_var, 
                 font=('', 12, 'bold')).pack(anchor=tk.W, pady=(0, 10))
        
        # 작업 탭 (나중에 확장)
        work_notebook = ttk.Notebook(parent)
        work_notebook.pack(fill=tk.BOTH, expand=True)
        
        # 기본 정보 탭
        info_frame = ttk.Frame(work_notebook)
        work_notebook.add(info_frame, text="📝 기본 정보")
        
        ttk.Label(info_frame, text="프로젝트 설명:").pack(anchor=tk.W, pady=5)
        self.project_desc = tk.Text(info_frame, height=8, wrap=tk.WORD)
        self.project_desc.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        ttk.Button(info_frame, text="💾 설명 저장", 
                  command=self.save_project_info).pack(anchor=tk.E)
        
        # 향후 확장 탭들 (플레이스홀더)
        design_frame = ttk.Frame(work_notebook)
        work_notebook.add(design_frame, text="🎨 설계 (준비중)")
        
        ttk.Label(design_frame, text="3D 모델링 및 설계 기능", 
                 font=('', 14)).pack(expand=True)
        ttk.Label(design_frame, text="Fusion 360 연동 예정", 
                 foreground='gray').pack()
        
        hardware_frame = ttk.Frame(work_notebook)
        work_notebook.add(hardware_frame, text="🔌 하드웨어 (준비중)")
        
        ttk.Label(hardware_frame, text="Arduino 코드 생성 및 업로드", 
                 font=('', 14)).pack(expand=True)
        ttk.Label(hardware_frame, text="단계별로 구현 예정", 
                 foreground='gray').pack()
    
    def setup_log_panel(self, parent):
        """로그 패널"""
        ttk.Label(parent, text="시스템 활동:", font=('', 10, 'bold')).pack(anchor=tk.W)
        
        # 로그 텍스트 영역
        self.log_text = tk.Text(parent, height=25, wrap=tk.WORD, state=tk.DISABLED)
        
        # 스크롤바 추가
        scrollbar = ttk.Scrollbar(parent, orient=tk.VERTICAL, command=self.log_text.yview)
        self.log_text.configure(yscrollcommand=scrollbar.set)
        
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 로그 클리어 버튼
        ttk.Button(parent, text="🗑️ 로그 지우기", 
                  command=self.clear_log).pack(fill=tk.X, pady=(10, 0))
    
    def create_new_project(self):
        """새 프로젝트 생성 - 간단한 대화상자"""
        # 간단한 입력 대화상자
        name = tk.simpledialog.askstring("새 프로젝트", "프로젝트 이름을 입력하세요:")
        
        if not name:
            return
            
        if not name.strip():
            messagebox.showwarning("경고", "프로젝트 이름을 입력해주세요.")
            return
        
        try:
            # 데이터베이스에 추가
            self.cursor.execute('''
                INSERT INTO projects (name, description, status, created_date)
                VALUES (?, ?, ?, ?)
            ''', (name.strip(), "", "planning", datetime.now().isoformat()))
            
            self.conn.commit()
            
            # 프로젝트 폴더 생성
            project_dir = self.data_dir / 'projects' / name.strip()
            project_dir.mkdir(parents=True, exist_ok=True)
            
            # 목록 새로고침
            self.load_projects()
            
            self.add_log(f"새 프로젝트 생성: {name}")
            self.status_bar.config(text=f"프로젝트 '{name}' 생성 완료")
            
        except sqlite3.IntegrityError:
            messagebox.showerror("오류", "같은 이름의 프로젝트가 이미 존재합니다.")
        except Exception as e:
            messagebox.showerror("오류", f"프로젝트 생성 실패: {str(e)}")
            self.add_log(f"프로젝트 생성 오류: {str(e)}")
    
    def load_projects(self):
        """프로젝트 목록 로드"""
        try:
            self.project_listbox.delete(0, tk.END)
            
            self.cursor.execute('''
                SELECT name, status, created_date FROM projects 
                ORDER BY created_date DESC
            ''')
            
            projects = self.cursor.fetchall()
            
            for name, status, created_date in projects:
                # 상태 아이콘 추가
                status_icon = {"planning": "📋", "active": "⚡", "completed": "✅"}.get(status, "❓")
                display_text = f"{status_icon} {name} ({status})"
                self.project_listbox.insert(tk.END, display_text)
                
            self.add_log(f"{len(projects)}개 프로젝트 로드 완료")
            
        except Exception as e:
            self.add_log(f"프로젝트 로드 오류: {str(e)}")
    
    def open_project(self):
        """프로젝트 열기"""
        selection = self.project_listbox.curselection()
        if not selection:
            messagebox.showinfo("알림", "프로젝트를 선택해주세요.")
            return
        
        # 선택된 프로젝트 이름 파싱
        selected_text = self.project_listbox.get(selection[0])
        # "📋 프로젝트명 (status)" 형태에서 프로젝트명 추출
        project_name = selected_text.split(' ', 1)[1].split(' (')[0]
        
        try:
            # 데이터베이스에서 프로젝트 정보 가져오기
            self.cursor.execute('SELECT name, description, status FROM projects WHERE name = ?', 
                              (project_name,))
            project = self.cursor.fetchone()
            
            if project:
                name, description, status = project
                self.current_project_var.set(f"현재 프로젝트: {name}")
                self.project_desc.delete(1.0, tk.END)
                if description:
                    self.project_desc.insert(1.0, description)
                
                self.add_log(f"프로젝트 열림: {name}")
                self.status_bar.config(text=f"작업 중: {name}")
            
        except Exception as e:
            messagebox.showerror("오류", f"프로젝트 열기 실패: {str(e)}")
            self.add_log(f"프로젝트 열기 오류: {str(e)}")
    
    def delete_project(self):
        """프로젝트 삭제"""
        selection = self.project_listbox.curselection()
        if not selection:
            messagebox.showinfo("알림", "삭제할 프로젝트를 선택해주세요.")
            return
        
        selected_text = self.project_listbox.get(selection[0])
        project_name = selected_text.split(' ', 1)[1].split(' (')[0]
        
        # 확인 대화상자
        if not messagebox.askyesno("확인", f"프로젝트 '{project_name}'을(를) 삭제하시겠습니까?"):
            return
        
        try:
            self.cursor.execute('DELETE FROM projects WHERE name = ?', (project_name,))
            self.conn.commit()
            
            # 프로젝트 폴더 삭제는 보류 (안전을 위해)
            
            self.load_projects()
            self.add_log(f"프로젝트 삭제됨: {project_name}")
            self.status_bar.config(text=f"프로젝트 '{project_name}' 삭제 완료")
            
        except Exception as e:
            messagebox.showerror("오류", f"프로젝트 삭제 실패: {str(e)}")
            self.add_log(f"프로젝트 삭제 오류: {str(e)}")
    
    def save_project_info(self):
        """프로젝트 정보 저장"""
        current_text = self.current_project_var.get()
        if "현재 프로젝트:" not in current_text:
            messagebox.showinfo("알림", "먼저 프로젝트를 열어주세요.")
            return
        
        project_name = current_text.replace("현재 프로젝트: ", "")
        description = self.project_desc.get(1.0, tk.END).strip()
        
        try:
            self.cursor.execute('UPDATE projects SET description = ? WHERE name = ?', 
                              (description, project_name))
            self.conn.commit()
            
            self.add_log(f"프로젝트 정보 저장됨: {project_name}")
            self.status_bar.config(text="프로젝트 정보 저장 완료")
            
        except Exception as e:
            messagebox.showerror("오류", f"정보 저장 실패: {str(e)}")
            self.add_log(f"정보 저장 오류: {str(e)}")
    
    def add_log(self, message):
        """로그 추가"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_message = f"[{timestamp}] {message}\n"
        
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, log_message)
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
    
    def clear_log(self):
        """로그 지우기"""
        self.log_text.config(state=tk.NORMAL)
        self.log_text.delete(1.0, tk.END)
        self.log_text.config(state=tk.DISABLED)
        self.add_log("로그가 지워졌습니다")

if __name__ == "__main__":
    # GUI 테스트
    root = tk.Tk()
    
    # 기본 스타일 설정
    style = ttk.Style()
    style.theme_use('clam')  # 모던한 테마
    
    app = VoltySimpleStart(root)
    
    print("Volty 프로젝트 관리 시스템 1단계 시작")
    print("기본 GUI 테스트 중...")
    
    root.mainloop()