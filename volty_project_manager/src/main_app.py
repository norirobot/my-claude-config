"""
Volty 채널 프로젝트 관리 시스템
영상 제작의 전 과정을 관리하는 통합 GUI 애플리케이션
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import sqlite3
import json
import os
from datetime import datetime, timedelta
import webbrowser
from pathlib import Path

class VoltyProjectManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Volty 프로젝트 관리 시스템 v1.0")
        self.root.geometry("1200x800")
        
        # 데이터 폴더 설정
        self.data_dir = Path("../data")
        self.data_dir.mkdir(exist_ok=True)
        
        # 데이터베이스 초기화
        self.init_database()
        
        # 현재 프로젝트 정보
        self.current_project = None
        
        # GUI 구성
        self.setup_gui()
        
        # 프로젝트 목록 로드
        self.load_projects()
        
    def init_database(self):
        """데이터베이스 초기화"""
        self.conn = sqlite3.connect(self.data_dir / "volty_projects.db")
        self.cursor = self.conn.cursor()
        
        # 프로젝트 테이블
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_date TEXT,
                status TEXT,
                idea_validation TEXT,
                problem_to_solve TEXT,
                key_improvement TEXT,
                total_cost INTEGER,
                satisfaction INTEGER,
                views INTEGER,
                want_comments INTEGER,
                subscribers INTEGER,
                notes TEXT
            )
        ''')
        
        # 일일 메모 테이블
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_memos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                date TEXT,
                work_done TEXT,
                key_scenes TEXT,
                tomorrow_todo TEXT,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        ''')
        
        # 촬영 체크리스트 테이블
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS shooting_checklist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                problem_situation BOOLEAN DEFAULT 0,
                idea_sketch BOOLEAN DEFAULT 0,
                making_process BOOLEAN DEFAULT 0,
                failure_scene BOOLEAN DEFAULT 0,
                problem_solving BOOLEAN DEFAULT 0,
                complete_product BOOLEAN DEFAULT 0,
                demonstration BOOLEAN DEFAULT 0,
                before_after BOOLEAN DEFAULT 0,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        ''')
        
        self.conn.commit()
    
    def setup_gui(self):
        """메인 GUI 구성"""
        # 스타일 설정
        style = ttk.Style()
        style.theme_use('clam')
        
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 탭 위젯
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 각 탭 생성
        self.create_home_tab()
        self.create_idea_tab()
        self.create_production_tab()
        self.create_script_tab()
        self.create_evaluation_tab()
        
        # 가중치 설정
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(0, weight=1)
    
    def create_home_tab(self):
        """홈 탭 생성"""
        home_frame = ttk.Frame(self.notebook)
        self.notebook.add(home_frame, text="🏠 홈")
        
        # 프로젝트 리스트 섹션
        list_frame = ttk.LabelFrame(home_frame, text="프로젝트 목록", padding="10")
        list_frame.grid(row=0, column=0, padx=5, pady=5, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 프로젝트 리스트박스
        self.project_listbox = tk.Listbox(list_frame, height=10, width=40)
        self.project_listbox.grid(row=0, column=0, padx=5, pady=5)
        self.project_listbox.bind('<<ListboxSelect>>', self.on_project_select)
        
        # 버튼 프레임
        btn_frame = ttk.Frame(list_frame)
        btn_frame.grid(row=1, column=0, pady=5)
        
        ttk.Button(btn_frame, text="새 프로젝트", command=self.new_project).grid(row=0, column=0, padx=2)
        ttk.Button(btn_frame, text="프로젝트 열기", command=self.open_project).grid(row=0, column=1, padx=2)
        ttk.Button(btn_frame, text="삭제", command=self.delete_project).grid(row=0, column=2, padx=2)
        
        # 프로젝트 정보 섹션
        info_frame = ttk.LabelFrame(home_frame, text="프로젝트 정보", padding="10")
        info_frame.grid(row=0, column=1, padx=5, pady=5, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.project_info_text = scrolledtext.ScrolledText(info_frame, width=50, height=15, wrap=tk.WORD)
        self.project_info_text.grid(row=0, column=0, padx=5, pady=5)
        
        # 빠른 실행 체크리스트
        checklist_frame = ttk.LabelFrame(home_frame, text="⚡ 빠른 실행 체크리스트", padding="10")
        checklist_frame.grid(row=1, column=0, columnspan=2, padx=5, pady=5, sticky=(tk.W, tk.E))
        
        self.checklist_text = tk.Text(checklist_frame, height=8, width=80, wrap=tk.WORD)
        self.checklist_text.grid(row=0, column=0, padx=5, pady=5)
        self.checklist_text.insert("1.0", """Day 1: 시작
□ 아이디어 2가지 검증 (10분)
□ 필요 부품 리스트업
□ 부품 주문/구매

Day 2-4: 제작
□ 문제 상황 촬영
□ 제작 과정 촬영
□ 매일 1분 메모

Day 5: 완성
□ 완성품 시연 촬영
□ Before/After 촬영
□ 종합 메모 작성

Day 6: 편집
□ Claude 대본 요청
□ 대본 받고 편집 시작
□ 썸네일 제작
□ 업로드""")
        self.checklist_text.config(state=tk.DISABLED)
        
        home_frame.columnconfigure(0, weight=1)
        home_frame.columnconfigure(1, weight=1)
        home_frame.rowconfigure(0, weight=1)
    
    def create_idea_tab(self):
        """아이디어 검증 탭"""
        idea_frame = ttk.Frame(self.notebook)
        self.notebook.add(idea_frame, text="💡 아이디어 검증")
        
        # 아이디어 입력
        input_frame = ttk.LabelFrame(idea_frame, text="아이디어 입력", padding="10")
        input_frame.grid(row=0, column=0, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        ttk.Label(input_frame, text="아이디어 이름:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.idea_name_entry = ttk.Entry(input_frame, width=50)
        self.idea_name_entry.grid(row=0, column=1, pady=2, padx=5)
        
        ttk.Label(input_frame, text="해결할 문제:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.problem_text = tk.Text(input_frame, width=50, height=3)
        self.problem_text.grid(row=1, column=1, pady=2, padx=5)
        
        ttk.Label(input_frame, text="핵심 개선점:").grid(row=2, column=0, sticky=tk.W, pady=2)
        self.improvement_text = tk.Text(input_frame, width=50, height=3)
        self.improvement_text.grid(row=2, column=1, pady=2, padx=5)
        
        # 필수 검증 체크리스트
        validation_frame = ttk.LabelFrame(idea_frame, text="✅ 필수 검증 (2가지 모두 YES여야 시작)", padding="10")
        validation_frame.grid(row=1, column=0, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        self.validation_vars = []
        questions = [
            "내가 만든 후 6개월 이상 쓸 것인가?",
            "기존 방식보다 확실히 나은가?"
        ]
        
        for i, question in enumerate(questions):
            var = tk.BooleanVar()
            self.validation_vars.append(var)
            ttk.Checkbutton(validation_frame, text=question, variable=var, 
                          command=self.check_validation).grid(row=i, column=0, sticky=tk.W, pady=5)
        
        # 검증 결과
        self.validation_result = ttk.Label(validation_frame, text="⚠️ 두 항목 모두 체크해야 프로젝트를 시작할 수 있습니다", 
                                          foreground="orange")
        self.validation_result.grid(row=2, column=0, pady=10)
        
        # Claude 브레인스토밍 섹션
        claude_frame = ttk.LabelFrame(idea_frame, text="🤖 Claude 브레인스토밍 도우미", padding="10")
        claude_frame.grid(row=2, column=0, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        self.claude_prompt_text = tk.Text(claude_frame, width=60, height=5)
        self.claude_prompt_text.grid(row=0, column=0, pady=5)
        self.claude_prompt_text.insert("1.0", """홈짐에서 [구체적 운동] 할 때 [구체적 불편함] 있어.
조건: 제작 3일 이내, 아두이노 활용, 5만원 이하
→ 단순하지만 효과적인 아이디어 3개 추천""")
        
        ttk.Button(claude_frame, text="Claude에게 물어보기", 
                  command=self.ask_claude_idea).grid(row=1, column=0, pady=5)
        
        # 프로젝트 생성 버튼
        self.create_project_btn = ttk.Button(idea_frame, text="✨ 프로젝트 생성", 
                                            command=self.create_project, state=tk.DISABLED)
        self.create_project_btn.grid(row=3, column=0, pady=20)
    
    def create_production_tab(self):
        """제작 & 촬영 탭"""
        prod_frame = ttk.Frame(self.notebook)
        self.notebook.add(prod_frame, text="🎬 제작 & 촬영")
        
        # 촬영 체크리스트
        checklist_frame = ttk.LabelFrame(prod_frame, text="📷 촬영 필수 장면 (8가지)", padding="10")
        checklist_frame.grid(row=0, column=0, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        self.shooting_vars = []
        shooting_items = [
            ("현재 문제 상황", "공감대 형성"),
            ("아이디어 스케치/설명", "기대감 조성"),
            ("핵심 제작 3-4장면", "전문성 어필"),
            ("실패 장면 (있다면)", "진정성"),
            ("문제 해결 순간", "드라마"),
            ("완성품 전체 모습", "결과물"),
            ("실제 사용 시연", "효과 증명"),
            ("Before/After 비교", "명확한 개선")
        ]
        
        for i, (item, reason) in enumerate(shooting_items):
            var = tk.BooleanVar()
            self.shooting_vars.append(var)
            frame = ttk.Frame(checklist_frame)
            frame.grid(row=i, column=0, sticky=tk.W, pady=2)
            ttk.Checkbutton(frame, text=f"{i+1}. {item}", variable=var, 
                          command=self.update_shooting_progress).pack(side=tk.LEFT)
            ttk.Label(frame, text=f" - {reason}", foreground="gray").pack(side=tk.LEFT)
        
        # 진행률 표시
        self.shooting_progress = ttk.Progressbar(checklist_frame, length=400, mode='determinate')
        self.shooting_progress.grid(row=8, column=0, pady=10)
        self.shooting_progress_label = ttk.Label(checklist_frame, text="촬영 진행률: 0%")
        self.shooting_progress_label.grid(row=9, column=0)
        
        # 일일 메모
        memo_frame = ttk.LabelFrame(prod_frame, text="📝 일일 메모", padding="10")
        memo_frame.grid(row=0, column=1, padx=10, pady=10, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        ttk.Label(memo_frame, text="오늘 한 일:").grid(row=0, column=0, sticky=tk.W)
        self.today_work = tk.Text(memo_frame, width=40, height=4)
        self.today_work.grid(row=1, column=0, pady=5)
        
        ttk.Label(memo_frame, text="핵심 장면:").grid(row=2, column=0, sticky=tk.W)
        self.key_scenes = tk.Text(memo_frame, width=40, height=4)
        self.key_scenes.grid(row=3, column=0, pady=5)
        
        ttk.Label(memo_frame, text="내일 할 일:").grid(row=4, column=0, sticky=tk.W)
        self.tomorrow_todo = tk.Text(memo_frame, width=40, height=4)
        self.tomorrow_todo.grid(row=5, column=0, pady=5)
        
        ttk.Button(memo_frame, text="💾 메모 저장", command=self.save_daily_memo).grid(row=6, column=0, pady=10)
        
        # 파일 관리
        file_frame = ttk.LabelFrame(prod_frame, text="📁 파일 관리", padding="10")
        file_frame.grid(row=1, column=0, columnspan=2, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        ttk.Label(file_frame, text="프로젝트 폴더:").grid(row=0, column=0, sticky=tk.W)
        self.project_folder_label = ttk.Label(file_frame, text="프로젝트를 선택하세요")
        self.project_folder_label.grid(row=0, column=1, padx=10)
        ttk.Button(file_frame, text="폴더 열기", command=self.open_project_folder).grid(row=0, column=2)
        
        prod_frame.columnconfigure(0, weight=1)
        prod_frame.columnconfigure(1, weight=1)
        prod_frame.rowconfigure(0, weight=1)
    
    def create_script_tab(self):
        """대본 생성 탭"""
        script_frame = ttk.Frame(self.notebook)
        self.notebook.add(script_frame, text="📝 대본 생성")
        
        # 프로젝트 정보 요약
        summary_frame = ttk.LabelFrame(script_frame, text="프로젝트 요약", padding="10")
        summary_frame.grid(row=0, column=0, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        self.project_summary = tk.Text(summary_frame, width=70, height=8, wrap=tk.WORD)
        self.project_summary.grid(row=0, column=0, pady=5)
        
        # Claude 대본 요청
        request_frame = ttk.LabelFrame(script_frame, text="🤖 Claude 대본 요청", padding="10")
        request_frame.grid(row=1, column=0, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        self.script_request = tk.Text(request_frame, width=70, height=6)
        self.script_request.grid(row=0, column=0, pady=5)
        
        ttk.Button(request_frame, text="대본 생성 요청", 
                  command=self.generate_script).grid(row=1, column=0, pady=5)
        
        # 생성된 대본
        script_output_frame = ttk.LabelFrame(script_frame, text="생성된 대본", padding="10")
        script_output_frame.grid(row=2, column=0, padx=10, pady=10, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.generated_script = scrolledtext.ScrolledText(script_output_frame, width=70, height=15, wrap=tk.WORD)
        self.generated_script.grid(row=0, column=0, pady=5)
        
        # 대본 저장 버튼
        ttk.Button(script_output_frame, text="💾 대본 저장", 
                  command=self.save_script).grid(row=1, column=0, pady=5)
        
        script_frame.columnconfigure(0, weight=1)
        script_frame.rowconfigure(2, weight=1)
    
    def create_evaluation_tab(self):
        """평가 & 통계 탭"""
        eval_frame = ttk.Frame(self.notebook)
        self.notebook.add(eval_frame, text="📊 평가 & 통계")
        
        # 프로젝트 평가
        eval_input_frame = ttk.LabelFrame(eval_frame, text="프로젝트 평가", padding="10")
        eval_input_frame.grid(row=0, column=0, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        # 평가 항목들
        eval_items = [
            ("제작 시간 (시간):", "production_time"),
            ("총 비용 (원):", "total_cost"),
            ("만족도 (1-10):", "satisfaction"),
            ("조회수 (1주 후):", "views"),
            ('"갖고싶다" 댓글 수:', "want_comments"),
            ("구독 전환 수:", "subscribers")
        ]
        
        self.eval_entries = {}
        for i, (label, key) in enumerate(eval_items):
            ttk.Label(eval_input_frame, text=label).grid(row=i, column=0, sticky=tk.W, pady=2)
            entry = ttk.Entry(eval_input_frame, width=20)
            entry.grid(row=i, column=1, pady=2)
            self.eval_entries[key] = entry
        
        # 개선점 기록
        improvement_frame = ttk.LabelFrame(eval_frame, text="개선점 기록", padding="10")
        improvement_frame.grid(row=0, column=1, padx=10, pady=10, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        ttk.Label(improvement_frame, text="잘된 점:").grid(row=0, column=0, sticky=tk.W)
        self.good_points = tk.Text(improvement_frame, width=40, height=4)
        self.good_points.grid(row=1, column=0, pady=5)
        
        ttk.Label(improvement_frame, text="아쉬운 점:").grid(row=2, column=0, sticky=tk.W)
        self.bad_points = tk.Text(improvement_frame, width=40, height=4)
        self.bad_points.grid(row=3, column=0, pady=5)
        
        ttk.Label(improvement_frame, text="다음에 바꿀 점:").grid(row=4, column=0, sticky=tk.W)
        self.next_improvements = tk.Text(improvement_frame, width=40, height=4)
        self.next_improvements.grid(row=5, column=0, pady=5)
        
        ttk.Button(improvement_frame, text="💾 평가 저장", command=self.save_evaluation).grid(row=6, column=0, pady=10)
        
        # 통계 대시보드
        stats_frame = ttk.LabelFrame(eval_frame, text="📈 전체 프로젝트 통계", padding="10")
        stats_frame.grid(row=1, column=0, columnspan=2, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        self.stats_text = scrolledtext.ScrolledText(stats_frame, width=80, height=10, wrap=tk.WORD)
        self.stats_text.grid(row=0, column=0, pady=5)
        
        ttk.Button(stats_frame, text="📊 통계 업데이트", command=self.update_statistics).grid(row=1, column=0, pady=5)
        
        eval_frame.columnconfigure(0, weight=1)
        eval_frame.columnconfigure(1, weight=1)
        eval_frame.rowconfigure(0, weight=1)
    
    # 기능 메서드들
    def load_projects(self):
        """프로젝트 목록 로드"""
        self.project_listbox.delete(0, tk.END)
        self.cursor.execute("SELECT id, name, status FROM projects ORDER BY created_date DESC")
        projects = self.cursor.fetchall()
        for project in projects:
            status_icon = "✅" if project[2] == "완료" else "🔄"
            self.project_listbox.insert(tk.END, f"{status_icon} {project[1]} (ID: {project[0]})")
    
    def on_project_select(self, event):
        """프로젝트 선택 이벤트"""
        selection = self.project_listbox.curselection()
        if selection:
            index = selection[0]
            project_text = self.project_listbox.get(index)
            project_id = int(project_text.split("ID: ")[1].split(")")[0])
            self.load_project_info(project_id)
    
    def load_project_info(self, project_id):
        """프로젝트 정보 로드"""
        self.cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        project = self.cursor.fetchone()
        if project:
            self.current_project = project_id
            info_text = f"""프로젝트 ID: {project[0]}
이름: {project[1]}
생성일: {project[2]}
상태: {project[3]}

해결할 문제: {project[5]}
핵심 개선점: {project[6]}

총 비용: {project[7]}원
만족도: {project[8]}/10
조회수: {project[9]}
"갖고싶다" 댓글: {project[10]}개
구독 전환: {project[11]}명

메모:
{project[12] if project[12] else '없음'}"""
            
            self.project_info_text.delete(1.0, tk.END)
            self.project_info_text.insert(1.0, info_text)
            
            # 프로젝트 요약 업데이트 (대본 탭)
            self.update_project_summary()
    
    def new_project(self):
        """새 프로젝트 시작"""
        self.notebook.select(1)  # 아이디어 탭으로 이동
        # 입력 필드 초기화
        self.idea_name_entry.delete(0, tk.END)
        self.problem_text.delete(1.0, tk.END)
        self.improvement_text.delete(1.0, tk.END)
        for var in self.validation_vars:
            var.set(False)
        self.check_validation()
    
    def open_project(self):
        """선택한 프로젝트 열기"""
        if self.current_project:
            messagebox.showinfo("프로젝트 열기", f"프로젝트 ID {self.current_project}를 열었습니다.")
            self.load_shooting_checklist()
    
    def delete_project(self):
        """프로젝트 삭제"""
        if self.current_project:
            if messagebox.askyesno("삭제 확인", "정말로 이 프로젝트를 삭제하시겠습니까?"):
                self.cursor.execute("DELETE FROM projects WHERE id = ?", (self.current_project,))
                self.cursor.execute("DELETE FROM daily_memos WHERE project_id = ?", (self.current_project,))
                self.cursor.execute("DELETE FROM shooting_checklist WHERE project_id = ?", (self.current_project,))
                self.conn.commit()
                self.load_projects()
                self.project_info_text.delete(1.0, tk.END)
                self.current_project = None
                messagebox.showinfo("삭제 완료", "프로젝트가 삭제되었습니다.")
    
    def check_validation(self):
        """아이디어 검증 체크"""
        if all(var.get() for var in self.validation_vars):
            self.validation_result.config(text="✅ 모든 검증 통과! 프로젝트를 시작할 수 있습니다.", 
                                        foreground="green")
            self.create_project_btn.config(state=tk.NORMAL)
        else:
            self.validation_result.config(text="⚠️ 두 항목 모두 체크해야 프로젝트를 시작할 수 있습니다", 
                                        foreground="orange")
            self.create_project_btn.config(state=tk.DISABLED)
    
    def create_project(self):
        """프로젝트 생성"""
        name = self.idea_name_entry.get()
        problem = self.problem_text.get(1.0, tk.END).strip()
        improvement = self.improvement_text.get(1.0, tk.END).strip()
        
        if not name:
            messagebox.showwarning("입력 오류", "프로젝트 이름을 입력하세요.")
            return
        
        # 데이터베이스에 저장
        created_date = datetime.now().strftime("%Y-%m-%d %H:%M")
        validation = json.dumps([var.get() for var in self.validation_vars])
        
        self.cursor.execute('''
            INSERT INTO projects (name, created_date, status, idea_validation, 
                                problem_to_solve, key_improvement)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, created_date, "진행중", validation, problem, improvement))
        
        project_id = self.cursor.lastrowid
        
        # 촬영 체크리스트 초기화
        self.cursor.execute('''
            INSERT INTO shooting_checklist (project_id)
            VALUES (?)
        ''', (project_id,))
        
        self.conn.commit()
        
        # 프로젝트 폴더 생성
        project_folder = self.data_dir / f"project_{project_id}_{name.replace(' ', '_')}"
        project_folder.mkdir(exist_ok=True)
        
        messagebox.showinfo("성공", f"프로젝트 '{name}'가 생성되었습니다!")
        self.load_projects()
        self.notebook.select(0)  # 홈 탭으로 이동
    
    def update_shooting_progress(self):
        """촬영 진행률 업데이트"""
        checked = sum(var.get() for var in self.shooting_vars)
        total = len(self.shooting_vars)
        progress = (checked / total) * 100
        
        self.shooting_progress['value'] = progress
        self.shooting_progress_label.config(text=f"촬영 진행률: {progress:.0f}%")
        
        # 데이터베이스 업데이트
        if self.current_project:
            values = [var.get() for var in self.shooting_vars]
            self.cursor.execute('''
                UPDATE shooting_checklist 
                SET problem_situation=?, idea_sketch=?, making_process=?, 
                    failure_scene=?, problem_solving=?, complete_product=?, 
                    demonstration=?, before_after=?
                WHERE project_id=?
            ''', (*values, self.current_project))
            self.conn.commit()
    
    def load_shooting_checklist(self):
        """촬영 체크리스트 로드"""
        if self.current_project:
            self.cursor.execute("SELECT * FROM shooting_checklist WHERE project_id = ?", 
                               (self.current_project,))
            checklist = self.cursor.fetchone()
            if checklist:
                for i, var in enumerate(self.shooting_vars):
                    var.set(bool(checklist[i+2]))  # id, project_id 제외하고 시작
                self.update_shooting_progress()
    
    def save_daily_memo(self):
        """일일 메모 저장"""
        if not self.current_project:
            messagebox.showwarning("경고", "먼저 프로젝트를 선택하세요.")
            return
        
        date = datetime.now().strftime("%Y-%m-%d")
        work = self.today_work.get(1.0, tk.END).strip()
        scenes = self.key_scenes.get(1.0, tk.END).strip()
        tomorrow = self.tomorrow_todo.get(1.0, tk.END).strip()
        
        self.cursor.execute('''
            INSERT INTO daily_memos (project_id, date, work_done, key_scenes, tomorrow_todo)
            VALUES (?, ?, ?, ?, ?)
        ''', (self.current_project, date, work, scenes, tomorrow))
        self.conn.commit()
        
        messagebox.showinfo("저장 완료", "일일 메모가 저장되었습니다.")
        
        # 텍스트 필드 초기화
        self.today_work.delete(1.0, tk.END)
        self.key_scenes.delete(1.0, tk.END)
        self.tomorrow_todo.delete(1.0, tk.END)
    
    def open_project_folder(self):
        """프로젝트 폴더 열기"""
        if self.current_project:
            self.cursor.execute("SELECT name FROM projects WHERE id = ?", (self.current_project,))
            project = self.cursor.fetchone()
            if project:
                folder_name = f"project_{self.current_project}_{project[0].replace(' ', '_')}"
                folder_path = self.data_dir / folder_name
                folder_path.mkdir(exist_ok=True)
                os.startfile(folder_path)
    
    def update_project_summary(self):
        """프로젝트 요약 업데이트"""
        if self.current_project:
            self.cursor.execute("SELECT * FROM projects WHERE id = ?", (self.current_project,))
            project = self.cursor.fetchone()
            if project:
                summary = f"""프로젝트: {project[1]}
제작 기간: {project[2]} ~ 현재
핵심 개선: {project[6]}

해결한 문제: {project[5]}

주요 장면:
1. 문제 상황 - 촬영 예정
2. 제작 과정 - 촬영 예정
3. 실패 장면 - 촬영 예정
4. 완성 시연 - 촬영 예정
5. Before/After - 촬영 예정"""
                
                self.project_summary.delete(1.0, tk.END)
                self.project_summary.insert(1.0, summary)
                
                # 대본 요청 템플릿 자동 생성
                request_template = f"""프로젝트: {project[1]} 완성
해결한 문제: {project[5]}
핵심 장점: {project[6]}
주요 촬영: 문제상황, 제작과정, 실패, 완성시연, 비교
→ 15분 YouTube 대본 작성"""
                
                self.script_request.delete(1.0, tk.END)
                self.script_request.insert(1.0, request_template)
    
    def generate_script(self):
        """대본 생성 (Claude API 연동 시뮬레이션)"""
        request = self.script_request.get(1.0, tk.END).strip()
        
        # 실제로는 Claude API를 호출하겠지만, 현재는 템플릿 제공
        script_template = """[생성된 대본]

## 도입부 (0:00-2:00)
"안녕하세요, Volty입니다. 오늘은 [문제]를 해결하는 기구를 만들었습니다."

[문제 상황 영상 삽입]
많은 분들이 운동하실 때 이런 불편함을 겪으셨을 겁니다...

## 제작 과정 (2:00-5:00)
"그럼 어떻게 만들었는지 보시겠습니다."

[타임랩스 영상]
1. 먼저 필요한 부품들을 준비했습니다
2. 아두이노를 활용해 기본 구조를 만들고
3. 이 부분이 핵심입니다 - [핵심 기능 설명]

## 시행착오 (5:00-8:00)
"처음엔 이렇게 했는데 실패했습니다"
[실패 장면]

"하지만 이렇게 수정하니 해결되었습니다"
[해결 과정]

## 시연 (8:00-12:00)
"실제로 써보니 확실히 달라졌습니다"
[Before/After 비교 영상]

## 마무리 (12:00-15:00)
"만들어서 잘했다고 생각합니다. 실제로 6개월 이상 사용할 예정입니다."
"오늘 영상 도움이 되셨다면 구독과 좋아요 부탁드립니다."

---
[편집 노트]
- 타임랩스: 2-3배속
- BGM: 감정선 따라 3곡
- 자막: 핵심 내용만
"""
        
        self.generated_script.delete(1.0, tk.END)
        self.generated_script.insert(1.0, script_template)
        messagebox.showinfo("대본 생성", "대본이 생성되었습니다. (템플릿)")
    
    def save_script(self):
        """대본 저장"""
        if not self.current_project:
            messagebox.showwarning("경고", "먼저 프로젝트를 선택하세요.")
            return
        
        script = self.generated_script.get(1.0, tk.END).strip()
        
        # 파일로 저장
        self.cursor.execute("SELECT name FROM projects WHERE id = ?", (self.current_project,))
        project = self.cursor.fetchone()
        if project:
            folder_name = f"project_{self.current_project}_{project[0].replace(' ', '_')}"
            folder_path = self.data_dir / folder_name
            folder_path.mkdir(exist_ok=True)
            
            script_file = folder_path / f"script_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            with open(script_file, 'w', encoding='utf-8') as f:
                f.write(script)
            
            messagebox.showinfo("저장 완료", f"대본이 저장되었습니다.\n{script_file}")
    
    def save_evaluation(self):
        """프로젝트 평가 저장"""
        if not self.current_project:
            messagebox.showwarning("경고", "먼저 프로젝트를 선택하세요.")
            return
        
        try:
            # 평가 데이터 수집
            total_cost = int(self.eval_entries['total_cost'].get() or 0)
            satisfaction = int(self.eval_entries['satisfaction'].get() or 0)
            views = int(self.eval_entries['views'].get() or 0)
            want_comments = int(self.eval_entries['want_comments'].get() or 0)
            subscribers = int(self.eval_entries['subscribers'].get() or 0)
            
            # 개선점 텍스트
            good = self.good_points.get(1.0, tk.END).strip()
            bad = self.bad_points.get(1.0, tk.END).strip()
            next_improve = self.next_improvements.get(1.0, tk.END).strip()
            
            notes = f"잘된 점: {good}\n아쉬운 점: {bad}\n다음에 바꿀 점: {next_improve}"
            
            # 데이터베이스 업데이트
            self.cursor.execute('''
                UPDATE projects 
                SET total_cost=?, satisfaction=?, views=?, want_comments=?, 
                    subscribers=?, notes=?, status=?
                WHERE id=?
            ''', (total_cost, satisfaction, views, want_comments, subscribers, 
                 notes, "완료", self.current_project))
            self.conn.commit()
            
            messagebox.showinfo("저장 완료", "평가가 저장되었습니다.")
            self.load_projects()
            
        except ValueError as e:
            messagebox.showerror("입력 오류", "숫자를 올바르게 입력해주세요.")
    
    def update_statistics(self):
        """전체 프로젝트 통계 업데이트"""
        self.cursor.execute('''
            SELECT COUNT(*), AVG(satisfaction), AVG(views), 
                   SUM(want_comments), SUM(subscribers), AVG(total_cost)
            FROM projects WHERE status = '완료'
        ''')
        stats = self.cursor.fetchone()
        
        if stats[0] > 0:
            stats_text = f"""=== 전체 프로젝트 통계 ===

완료된 프로젝트: {stats[0]}개
평균 만족도: {stats[1]:.1f}/10
평균 조회수: {stats[2]:.0f}회
총 "갖고싶다" 댓글: {stats[3]}개
총 구독 전환: {stats[4]}명
평균 제작 비용: {stats[5]:.0f}원

성공 지표:
✅ 6개월 이상 사용 중인 프로젝트 체크 필요
✅ "갖고싶다" 댓글 비율: {stats[3]/max(stats[0], 1):.1f}개/프로젝트
✅ 구독 전환율: {stats[4]/max(stats[0], 1):.1f}명/프로젝트
"""
        else:
            stats_text = "아직 완료된 프로젝트가 없습니다."
        
        self.stats_text.delete(1.0, tk.END)
        self.stats_text.insert(1.0, stats_text)
    
    def ask_claude_idea(self):
        """Claude에게 아이디어 물어보기 (시뮬레이션)"""
        prompt = self.claude_prompt_text.get(1.0, tk.END).strip()
        
        # 실제로는 Claude API 호출
        messagebox.showinfo("Claude 브레인스토밍", 
                          "Claude API 연동이 필요합니다.\n\n현재는 시뮬레이션 모드입니다.")
    
    def __del__(self):
        """소멸자 - 데이터베이스 연결 종료"""
        if hasattr(self, 'conn'):
            self.conn.close()

def main():
    root = tk.Tk()
    app = VoltyProjectManager(root)
    root.mainloop()

if __name__ == "__main__":
    main()