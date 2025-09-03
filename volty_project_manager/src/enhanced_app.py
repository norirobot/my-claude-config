"""
Volty 프로젝트 관리 시스템 Enhanced v2.0
AI 기반 아이디어 검증과 3D 설계 통합 버전
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import sqlite3
import json
import os
from datetime import datetime
import webbrowser
from pathlib import Path
import threading
import requests

class VoltyEnhancedManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Volty 프로젝트 관리 시스템 Enhanced v2.0")
        self.root.geometry("1400x900")
        
        # 색상 테마
        self.colors = {
            'primary': '#2196F3',
            'success': '#4CAF50',
            'warning': '#FFC107',
            'danger': '#F44336',
            'dark': '#212121',
            'light': '#F5F5F5'
        }
        
        # 데이터 폴더 설정
        self.data_dir = Path("../data")
        self.data_dir.mkdir(exist_ok=True)
        
        # 데이터베이스 초기화
        self.init_database()
        
        # 현재 프로젝트 정보
        self.current_project = None
        self.current_idea = None
        
        # GUI 구성
        self.setup_gui()
        
    def init_database(self):
        """향상된 데이터베이스 스키마"""
        self.conn = sqlite3.connect(self.data_dir / "volty_enhanced.db")
        self.cursor = self.conn.cursor()
        
        # 아이디어 테이블 (새로 추가)
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS ideas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                problem_description TEXT,
                solution_type TEXT,
                difficulty_level INTEGER,
                estimated_cost INTEGER,
                estimated_time_hours INTEGER,
                materials_needed TEXT,
                tools_needed TEXT,
                ai_score INTEGER,
                created_date TEXT,
                status TEXT
            )
        ''')
        
        # 3D 모델 테이블 (새로 추가)
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS models_3d (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                model_name TEXT,
                model_type TEXT,
                dimensions TEXT,
                material TEXT,
                print_time_hours REAL,
                estimated_cost INTEGER,
                file_path TEXT,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        ''')
        
        # 비용 추적 테이블 (새로 추가)
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS cost_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                item_name TEXT,
                item_type TEXT,
                quantity INTEGER,
                unit_price INTEGER,
                total_price INTEGER,
                purchase_url TEXT,
                purchase_date TEXT,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        ''')
        
        self.conn.commit()
    
    def setup_gui(self):
        """향상된 GUI 구성"""
        # 스타일 설정
        style = ttk.Style()
        style.theme_use('clam')
        
        # 상단 툴바
        self.create_toolbar()
        
        # 메인 컨테이너
        main_container = ttk.Frame(self.root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # 좌측 사이드바
        self.create_sidebar(main_container)
        
        # 중앙 작업 영역
        self.create_workspace(main_container)
        
        # 하단 상태바
        self.create_statusbar()
    
    def create_toolbar(self):
        """상단 툴바"""
        toolbar = tk.Frame(self.root, bg=self.colors['primary'], height=50)
        toolbar.pack(fill=tk.X)
        
        # 로고/타이틀
        title_label = tk.Label(toolbar, text="🔧 Volty Project Manager", 
                               font=("Arial", 16, "bold"),
                               bg=self.colors['primary'], fg="white")
        title_label.pack(side=tk.LEFT, padx=20, pady=10)
        
        # 빠른 액션 버튼들
        actions_frame = tk.Frame(toolbar, bg=self.colors['primary'])
        actions_frame.pack(side=tk.RIGHT, padx=20)
        
        tk.Button(actions_frame, text="🚀 빠른 아이디어", 
                 command=self.quick_idea_check,
                 bg=self.colors['success'], fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Button(actions_frame, text="💰 비용 계산기", 
                 command=self.open_cost_calculator,
                 bg=self.colors['warning'], fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        tk.Button(actions_frame, text="📊 대시보드", 
                 command=self.open_dashboard,
                 bg=self.colors['dark'], fg="white",
                 font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
    
    def create_sidebar(self, parent):
        """좌측 사이드바"""
        sidebar = ttk.Frame(parent, width=250)
        sidebar.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        
        # 프로젝트 단계 네비게이션
        nav_label = ttk.Label(sidebar, text="프로젝트 단계", 
                             font=("Arial", 12, "bold"))
        nav_label.pack(pady=(10, 5))
        
        self.stage_buttons = []
        stages = [
            ("💡 아이디어 검증", self.show_idea_stage),
            ("🔍 문제 분석", self.show_problem_analysis),
            ("🛠️ 설계 & 3D", self.show_design_stage),
            ("💵 비용 계산", self.show_cost_stage),
            ("🎬 제작 & 촬영", self.show_production_stage),
            ("📝 대본 생성", self.show_script_stage),
            ("📊 평가 & 통계", self.show_evaluation_stage)
        ]
        
        for text, command in stages:
            btn = tk.Button(sidebar, text=text, command=command,
                          width=25, height=2,
                          font=("Arial", 10),
                          relief=tk.FLAT,
                          bg=self.colors['light'])
            btn.pack(pady=2)
            self.stage_buttons.append(btn)
        
        # 최근 프로젝트
        recent_label = ttk.Label(sidebar, text="최근 프로젝트", 
                                font=("Arial", 12, "bold"))
        recent_label.pack(pady=(20, 5))
        
        self.recent_listbox = tk.Listbox(sidebar, height=10)
        self.recent_listbox.pack(fill=tk.BOTH, expand=True, pady=5)
        self.load_recent_projects()
    
    def create_workspace(self, parent):
        """중앙 작업 영역"""
        self.workspace = ttk.Frame(parent)
        self.workspace.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # 초기 화면 - 아이디어 검증
        self.show_idea_stage()
    
    def create_statusbar(self):
        """하단 상태바"""
        statusbar = tk.Frame(self.root, bg=self.colors['dark'], height=30)
        statusbar.pack(fill=tk.X, side=tk.BOTTOM)
        
        self.status_text = tk.Label(statusbar, text="준비됨", 
                                   bg=self.colors['dark'], fg="white")
        self.status_text.pack(side=tk.LEFT, padx=10)
        
        # 진행 상황
        self.progress_label = tk.Label(statusbar, text="진행률: 0%", 
                                      bg=self.colors['dark'], fg="white")
        self.progress_label.pack(side=tk.RIGHT, padx=10)
    
    def show_idea_stage(self):
        """아이디어 검증 단계"""
        self.clear_workspace()
        self.highlight_button(0)
        
        # 메인 프레임
        main_frame = ttk.Frame(self.workspace)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # 제목
        title = ttk.Label(main_frame, text="💡 AI 기반 아이디어 검증 시스템",
                         font=("Arial", 16, "bold"))
        title.pack(pady=(0, 20))
        
        # 입력 영역
        input_frame = ttk.LabelFrame(main_frame, text="문제 설명", padding=15)
        input_frame.pack(fill=tk.X, pady=10)
        
        # 예시 버튼들
        examples_frame = ttk.Frame(input_frame)
        examples_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(examples_frame, text="예시:").pack(side=tk.LEFT, padx=(0, 10))
        
        examples = [
            ("스미스머신 벤치 정렬", self.load_example_1),
            ("스쿼트 발 위치 가이드", self.load_example_2),
            ("덤벨 거치대 각도 조절", self.load_example_3)
        ]
        
        for text, command in examples:
            ttk.Button(examples_frame, text=text, 
                      command=command).pack(side=tk.LEFT, padx=2)
        
        # 문제 입력
        self.problem_input = scrolledtext.ScrolledText(input_frame, 
                                                       width=80, height=6,
                                                       wrap=tk.WORD)
        self.problem_input.pack(fill=tk.BOTH, expand=True)
        
        # AI 분석 버튼
        analyze_btn = tk.Button(input_frame, text="🤖 AI 분석 시작",
                               command=self.analyze_idea,
                               bg=self.colors['primary'], fg="white",
                               font=("Arial", 12, "bold"),
                               height=2)
        analyze_btn.pack(pady=10)
        
        # 결과 영역
        results_frame = ttk.LabelFrame(main_frame, text="AI 분석 결과", padding=15)
        results_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # 탭으로 구성된 결과
        self.results_notebook = ttk.Notebook(results_frame)
        self.results_notebook.pack(fill=tk.BOTH, expand=True)
        
        # 솔루션 1 탭
        self.solution1_frame = ttk.Frame(self.results_notebook)
        self.results_notebook.add(self.solution1_frame, text="솔루션 1")
        
        # 솔루션 2 탭
        self.solution2_frame = ttk.Frame(self.results_notebook)
        self.results_notebook.add(self.solution2_frame, text="솔루션 2")
        
        # 솔루션 3 탭
        self.solution3_frame = ttk.Frame(self.results_notebook)
        self.results_notebook.add(self.solution3_frame, text="솔루션 3")
    
    def show_problem_analysis(self):
        """문제 분석 단계"""
        self.clear_workspace()
        self.highlight_button(1)
        
        main_frame = ttk.Frame(self.workspace)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        title = ttk.Label(main_frame, text="🔍 문제 상세 분석",
                         font=("Arial", 16, "bold"))
        title.pack(pady=(0, 20))
        
        # 분석 도구들
        tools_frame = ttk.Frame(main_frame)
        tools_frame.pack(fill=tk.BOTH, expand=True)
        
        # 문제 매트릭스
        matrix_frame = ttk.LabelFrame(tools_frame, text="문제 영향도 매트릭스", padding=15)
        matrix_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        # 매트릭스 항목들
        matrix_items = [
            "사용 빈도",
            "불편함 정도",
            "기존 해결책 유무",
            "제작 난이도",
            "예상 효과"
        ]
        
        self.matrix_scales = {}
        for i, item in enumerate(matrix_items):
            frame = ttk.Frame(matrix_frame)
            frame.pack(fill=tk.X, pady=5)
            
            ttk.Label(frame, text=f"{item}:", width=15).pack(side=tk.LEFT)
            scale = ttk.Scale(frame, from_=1, to=10, orient=tk.HORIZONTAL, length=200)
            scale.pack(side=tk.LEFT, padx=10)
            value_label = ttk.Label(frame, text="5")
            value_label.pack(side=tk.LEFT)
            
            scale.config(command=lambda v, l=value_label: l.config(text=f"{float(v):.0f}"))
            self.matrix_scales[item] = scale
        
        # 우선순위 점수
        score_frame = ttk.LabelFrame(tools_frame, text="우선순위 점수", padding=15)
        score_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        self.priority_score = tk.Label(score_frame, text="0", 
                                      font=("Arial", 48, "bold"),
                                      fg=self.colors['primary'])
        self.priority_score.pack(pady=20)
        
        ttk.Label(score_frame, text="점수 해석:", font=("Arial", 12, "bold")).pack()
        ttk.Label(score_frame, text="80+ : 즉시 시작 추천").pack()
        ttk.Label(score_frame, text="60-79 : 고려해볼 만함").pack()
        ttk.Label(score_frame, text="40-59 : 개선 필요").pack()
        ttk.Label(score_frame, text="40 미만 : 재검토 필요").pack()
        
        ttk.Button(score_frame, text="점수 계산", 
                  command=self.calculate_priority_score).pack(pady=20)
    
    def show_design_stage(self):
        """설계 & 3D 모델링 단계"""
        self.clear_workspace()
        self.highlight_button(2)
        
        main_frame = ttk.Frame(self.workspace)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        title = ttk.Label(main_frame, text="🛠️ 설계 & 3D 모델링",
                         font=("Arial", 16, "bold"))
        title.pack(pady=(0, 20))
        
        # 설계 옵션
        design_container = ttk.Frame(main_frame)
        design_container.pack(fill=tk.BOTH, expand=True)
        
        # 3D 프린팅 섹션
        printing_frame = ttk.LabelFrame(design_container, text="3D 프린팅 설계", padding=15)
        printing_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        # 모델 타입 선택
        ttk.Label(printing_frame, text="모델 타입:").pack(anchor=tk.W)
        model_types = ["브라켓/홀더", "가이드/정렬도구", "커스텀 부품", "케이스/인클로저"]
        self.model_type_combo = ttk.Combobox(printing_frame, values=model_types, width=30)
        self.model_type_combo.pack(fill=tk.X, pady=5)
        self.model_type_combo.set(model_types[0])
        
        # 치수 입력
        dims_frame = ttk.Frame(printing_frame)
        dims_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(dims_frame, text="크기 (mm):").grid(row=0, column=0, columnspan=3)
        ttk.Label(dims_frame, text="가로:").grid(row=1, column=0)
        self.width_entry = ttk.Entry(dims_frame, width=10)
        self.width_entry.grid(row=1, column=1, padx=5)
        
        ttk.Label(dims_frame, text="세로:").grid(row=2, column=0)
        self.height_entry = ttk.Entry(dims_frame, width=10)
        self.height_entry.grid(row=2, column=1, padx=5)
        
        ttk.Label(dims_frame, text="높이:").grid(row=3, column=0)
        self.depth_entry = ttk.Entry(dims_frame, width=10)
        self.depth_entry.grid(row=3, column=1, padx=5)
        
        # 재료 선택
        ttk.Label(printing_frame, text="재료:").pack(anchor=tk.W, pady=(10, 0))
        materials = ["PLA (일반)", "PETG (강도)", "TPU (유연)", "ABS (내열)"]
        self.material_combo = ttk.Combobox(printing_frame, values=materials, width=30)
        self.material_combo.pack(fill=tk.X, pady=5)
        self.material_combo.set(materials[0])
        
        # 예상 시간/비용
        estimate_frame = ttk.Frame(printing_frame)
        estimate_frame.pack(fill=tk.X, pady=10)
        
        self.print_time_label = ttk.Label(estimate_frame, text="예상 출력 시간: -")
        self.print_time_label.pack()
        
        self.print_cost_label = ttk.Label(estimate_frame, text="예상 비용: -")
        self.print_cost_label.pack()
        
        # 액션 버튼들
        buttons_frame = ttk.Frame(printing_frame)
        buttons_frame.pack(pady=20)
        
        ttk.Button(buttons_frame, text="📐 예상치 계산",
                  command=self.calculate_3d_estimate).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(buttons_frame, text="🔗 Tinkercad 열기",
                  command=self.open_tinkercad).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(buttons_frame, text="📥 STL 템플릿",
                  command=self.download_stl_template).pack(side=tk.LEFT, padx=5)
        
        # 아두이노/전자부품 섹션
        arduino_frame = ttk.LabelFrame(design_container, text="아두이노/전자부품", padding=15)
        arduino_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        # 부품 체크리스트
        ttk.Label(arduino_frame, text="필요 부품 체크리스트:").pack(anchor=tk.W)
        
        parts_list = [
            "Arduino Uno/Nano",
            "초음파 센서 (HC-SR04)",
            "서보 모터",
            "LED 스트립",
            "릴레이 모듈",
            "LCD 디스플레이",
            "버튼/스위치",
            "저항/커패시터"
        ]
        
        self.parts_vars = []
        for part in parts_list:
            var = tk.BooleanVar()
            self.parts_vars.append(var)
            ttk.Checkbutton(arduino_frame, text=part, variable=var).pack(anchor=tk.W)
        
        # 회로도 링크
        ttk.Button(arduino_frame, text="🔌 회로도 예제 보기",
                  command=self.show_circuit_examples).pack(pady=20)
    
    def show_cost_stage(self):
        """비용 계산 단계"""
        self.clear_workspace()
        self.highlight_button(3)
        
        main_frame = ttk.Frame(self.workspace)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        title = ttk.Label(main_frame, text="💵 스마트 비용 계산기",
                         font=("Arial", 16, "bold"))
        title.pack(pady=(0, 20))
        
        # 비용 입력 테이블
        cost_frame = ttk.Frame(main_frame)
        cost_frame.pack(fill=tk.BOTH, expand=True)
        
        # 테이블 헤더
        headers = ["품목", "수량", "단가", "총액", "구매처", ""]
        for i, header in enumerate(headers):
            ttk.Label(cost_frame, text=header, font=("Arial", 10, "bold")).grid(row=0, column=i, padx=5, pady=5)
        
        # 비용 항목 리스트
        self.cost_entries = []
        for row in range(1, 11):
            row_entries = {}
            
            # 품목
            item_entry = ttk.Entry(cost_frame, width=20)
            item_entry.grid(row=row, column=0, padx=5, pady=2)
            row_entries['item'] = item_entry
            
            # 수량
            qty_entry = ttk.Entry(cost_frame, width=10)
            qty_entry.grid(row=row, column=1, padx=5, pady=2)
            row_entries['qty'] = qty_entry
            
            # 단가
            price_entry = ttk.Entry(cost_frame, width=15)
            price_entry.grid(row=row, column=2, padx=5, pady=2)
            row_entries['price'] = price_entry
            
            # 총액 (자동 계산)
            total_label = ttk.Label(cost_frame, text="0원")
            total_label.grid(row=row, column=3, padx=5, pady=2)
            row_entries['total'] = total_label
            
            # 구매처
            shop_combo = ttk.Combobox(cost_frame, 
                                      values=["알리익스프레스", "쿠팡", "네이버", "오프라인"],
                                      width=15)
            shop_combo.grid(row=row, column=4, padx=5, pady=2)
            row_entries['shop'] = shop_combo
            
            # 가격 조회 버튼
            search_btn = ttk.Button(cost_frame, text="🔍",
                                   command=lambda r=row: self.search_price(r))
            search_btn.grid(row=row, column=5, padx=5, pady=2)
            
            self.cost_entries.append(row_entries)
        
        # 총계 표시
        total_frame = ttk.Frame(main_frame)
        total_frame.pack(fill=tk.X, pady=20)
        
        self.total_cost_label = tk.Label(total_frame, text="총 비용: 0원",
                                        font=("Arial", 20, "bold"),
                                        fg=self.colors['primary'])
        self.total_cost_label.pack(side=tk.LEFT, padx=20)
        
        # 예산 설정
        ttk.Label(total_frame, text="예산:").pack(side=tk.LEFT, padx=10)
        self.budget_entry = ttk.Entry(total_frame, width=15)
        self.budget_entry.pack(side=tk.LEFT)
        self.budget_entry.insert(0, "50000")
        
        ttk.Button(total_frame, text="계산", 
                  command=self.calculate_total_cost).pack(side=tk.LEFT, padx=10)
        
        # 예산 상태
        self.budget_status = ttk.Label(total_frame, text="")
        self.budget_status.pack(side=tk.LEFT, padx=20)
    
    def show_production_stage(self):
        """제작 & 촬영 단계 (기존 코드 활용)"""
        self.clear_workspace()
        self.highlight_button(4)
        
        # 기존 production_tab 내용 재사용
        main_frame = ttk.Frame(self.workspace)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        title = ttk.Label(main_frame, text="🎬 제작 & 촬영 체크리스트",
                         font=("Arial", 16, "bold"))
        title.pack(pady=(0, 20))
        
        # 스마트 촬영 가이드 추가
        guide_frame = ttk.LabelFrame(main_frame, text="📸 스마트 촬영 가이드", padding=15)
        guide_frame.pack(fill=tk.X, pady=10)
        
        guide_text = """1. 문제 상황: 스마트폰을 삼각대에 고정하고 실제 불편한 상황 연출
2. 제작 과정: 타임랩스 앱 사용 (2초 간격 촬영)
3. 핵심 장면: 클로즈업으로 중요 부분 강조
4. Before/After: 동일한 각도에서 비교 촬영"""
        
        ttk.Label(guide_frame, text=guide_text, justify=tk.LEFT).pack()
    
    def show_script_stage(self):
        """대본 생성 단계"""
        self.clear_workspace()
        self.highlight_button(5)
        
        main_frame = ttk.Frame(self.workspace)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        title = ttk.Label(main_frame, text="📝 AI 대본 생성",
                         font=("Arial", 16, "bold"))
        title.pack(pady=(0, 20))
        
        # 원클릭 대본 생성
        ttk.Label(main_frame, text="프로젝트 정보를 기반으로 자동 대본 생성",
                 font=("Arial", 12)).pack(pady=10)
        
        generate_btn = tk.Button(main_frame, text="🎬 15분 YouTube 대본 생성",
                                command=self.generate_full_script,
                                bg=self.colors['success'], fg="white",
                                font=("Arial", 14, "bold"),
                                height=3)
        generate_btn.pack(pady=20)
        
        # 생성된 대본 표시
        script_frame = ttk.LabelFrame(main_frame, text="생성된 대본", padding=15)
        script_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.script_output = scrolledtext.ScrolledText(script_frame, 
                                                       width=80, height=20,
                                                       wrap=tk.WORD)
        self.script_output.pack(fill=tk.BOTH, expand=True)
    
    def show_evaluation_stage(self):
        """평가 & 통계 단계"""
        self.clear_workspace()
        self.highlight_button(6)
        
        main_frame = ttk.Frame(self.workspace)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        title = ttk.Label(main_frame, text="📊 프로젝트 평가 & 분석",
                         font=("Arial", 16, "bold"))
        title.pack(pady=(0, 20))
        
        # 자동 분석 대시보드
        dashboard_text = """=== 프로젝트 성과 분석 ===
        
• 제작 효율성: 계획 대비 실제 시간
• 비용 효율성: 예산 대비 실제 비용
• 만족도: 6개월 사용 여부
• 영상 성과: 조회수, 댓글, 구독 전환
• ROI: 투자 대비 수익 (광고 수익 + 가치)

[자동 분석 시작] 버튼을 눌러 분석을 시작하세요."""
        
        dashboard_label = ttk.Label(main_frame, text=dashboard_text,
                                   font=("Arial", 11), justify=tk.LEFT)
        dashboard_label.pack(pady=20)
        
        ttk.Button(main_frame, text="📈 자동 분석 시작",
                  command=self.auto_analyze_project).pack()
    
    # 헬퍼 메서드들
    def clear_workspace(self):
        """작업 영역 초기화"""
        for widget in self.workspace.winfo_children():
            widget.destroy()
    
    def highlight_button(self, index):
        """선택된 단계 버튼 하이라이트"""
        for i, btn in enumerate(self.stage_buttons):
            if i == index:
                btn.config(bg=self.colors['primary'], fg="white")
            else:
                btn.config(bg=self.colors['light'], fg="black")
    
    def load_recent_projects(self):
        """최근 프로젝트 로드"""
        # 샘플 데이터
        projects = [
            "스미스머신 벤치 정렬기",
            "스쿼트 발위치 가이드",
            "덤벨랙 각도 조절기",
            "케이블 높이 표시기",
            "바벨 무게 계산기"
        ]
        for project in projects:
            self.recent_listbox.insert(tk.END, project)
    
    def quick_idea_check(self):
        """빠른 아이디어 체크"""
        dialog = tk.Toplevel(self.root)
        dialog.title("🚀 빠른 아이디어 체크")
        dialog.geometry("500x400")
        
        ttk.Label(dialog, text="30초 아이디어 검증",
                 font=("Arial", 14, "bold")).pack(pady=10)
        
        # 체크리스트
        checks = [
            "실제로 겪는 문제인가?",
            "기존 제품으로 해결 불가능한가?",
            "3일 안에 만들 수 있는가?",
            "5만원 이하로 가능한가?",
            "6개월 이상 쓸 것인가?"
        ]
        
        check_vars = []
        for check in checks:
            var = tk.BooleanVar()
            check_vars.append(var)
            ttk.Checkbutton(dialog, text=check, variable=var).pack(anchor=tk.W, padx=20, pady=5)
        
        def evaluate():
            score = sum(var.get() for var in check_vars)
            if score == 5:
                result = "✅ 완벽! 바로 시작하세요!"
                color = self.colors['success']
            elif score >= 3:
                result = "⚠️ 괜찮음. 조금 더 다듬어보세요."
                color = self.colors['warning']
            else:
                result = "❌ 재검토 필요. 다른 아이디어를 생각해보세요."
                color = self.colors['danger']
            
            result_label.config(text=result, fg=color)
        
        ttk.Button(dialog, text="평가하기", command=evaluate).pack(pady=20)
        
        result_label = tk.Label(dialog, text="", font=("Arial", 12, "bold"))
        result_label.pack(pady=10)
    
    def open_cost_calculator(self):
        """비용 계산기 열기"""
        self.show_cost_stage()
    
    def open_dashboard(self):
        """대시보드 열기"""
        self.show_evaluation_stage()
    
    def load_example_1(self):
        """예시 1: 스미스머신 벤치 정렬"""
        self.problem_input.delete(1.0, tk.END)
        self.problem_input.insert(1.0, """헬스장에서 스미스머신 안에 벤치를 놓을 때 정확히 가운데 맞추기가 어렵습니다.
매번 눈대중으로 맞추다보니 한쪽으로 치우쳐서 운동 시 불균형이 생깁니다.
레이저 포인터나 간단한 가이드로 정확한 중앙 정렬을 하고 싶습니다.""")
    
    def load_example_2(self):
        """예시 2: 스쿼트 발 위치 가이드"""
        self.problem_input.delete(1.0, tk.END)
        self.problem_input.insert(1.0, """스쿼트할 때 매번 같은 발 위치와 각도를 유지하기 어렵습니다.
특히 발뒤꿈치에 약간의 경사를 주고 싶은데 일정한 각도를 유지하기 힘듭니다.
3D 프린터로 개인 맞춤형 발 위치 가이드를 만들고 싶습니다.""")
    
    def load_example_3(self):
        """예시 3: 덤벨 거치대 각도 조절"""
        self.problem_input.delete(1.0, tk.END)
        self.problem_input.insert(1.0, """덤벨을 거치대에 놓을 때 손목 각도가 불편합니다.
기존 거치대는 수평으로만 되어있어 들고 놓을 때 손목에 무리가 갑니다.
15도 정도 기울어진 맞춤형 거치 어댑터를 만들고 싶습니다.""")
    
    def analyze_idea(self):
        """AI 아이디어 분석 (시뮬레이션)"""
        problem = self.problem_input.get(1.0, tk.END).strip()
        
        if not problem:
            messagebox.showwarning("입력 필요", "문제를 설명해주세요.")
            return
        
        self.status_text.config(text="AI 분석 중...")
        
        # 솔루션 1: 간단한 해결책
        solution1_text = """🔧 솔루션 1: 레이저 정렬 가이드

난이도: ⭐⭐ (쉬움)
예상 비용: 15,000원
제작 시간: 2시간

필요 재료:
• 레이저 모듈 (2개) - 5,000원
• Arduino Nano - 8,000원
• 배터리 홀더 - 2,000원

핵심 아이디어:
스미스머신 양쪽에 부착하는 레이저 포인터로
바닥에 정확한 중앙선을 표시

장점:
✅ 제작이 매우 간단
✅ 재사용 가능
✅ 정확도 높음

단점:
❌ 배터리 교체 필요
❌ 레이저 정렬 필요"""
        
        # 솔루션 1 표시
        for widget in self.solution1_frame.winfo_children():
            widget.destroy()
        
        text1 = scrolledtext.ScrolledText(self.solution1_frame, wrap=tk.WORD, height=20)
        text1.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        text1.insert(1.0, solution1_text)
        
        # 솔루션 2: 중급 해결책
        solution2_text = """🔧 솔루션 2: 초음파 거리 측정 시스템

난이도: ⭐⭐⭐ (보통)
예상 비용: 25,000원
제작 시간: 4시간

필요 재료:
• HC-SR04 초음파 센서 (2개) - 6,000원
• Arduino Uno - 15,000원
• LCD 디스플레이 - 4,000원

핵심 아이디어:
양쪽 거리를 실시간 측정하여 LCD에
중앙 정렬 상태를 표시

장점:
✅ 실시간 피드백
✅ 정확한 수치 표시
✅ 다용도 활용 가능

단점:
❌ 제작 복잡도 증가
❌ 프로그래밍 필요"""
        
        # 솔루션 2 표시
        for widget in self.solution2_frame.winfo_children():
            widget.destroy()
        
        text2 = scrolledtext.ScrolledText(self.solution2_frame, wrap=tk.WORD, height=20)
        text2.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        text2.insert(1.0, solution2_text)
        
        # 솔루션 3: 고급 해결책
        solution3_text = """🔧 솔루션 3: 3D 프린팅 물리적 가이드

난이도: ⭐ (매우 쉬움)
예상 비용: 10,000원
제작 시간: 1시간 (프린팅 제외)

필요 재료:
• PLA 필라멘트 - 10,000원
• 벨크로 테이프 - 포함

핵심 아이디어:
스미스머신 프레임에 맞는 맞춤형
센터링 가이드를 3D 프린팅

장점:
✅ 전원 불필요
✅ 영구적 사용
✅ 가장 간단한 솔루션
✅ 정확도 100%

단점:
❌ 3D 프린터 필요
❌ 스미스머신별 맞춤 제작"""
        
        # 솔루션 3 표시
        for widget in self.solution3_frame.winfo_children():
            widget.destroy()
        
        text3 = scrolledtext.ScrolledText(self.solution3_frame, wrap=tk.WORD, height=20)
        text3.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        text3.insert(1.0, solution3_text)
        
        self.status_text.config(text="AI 분석 완료")
        
        # 최적 솔루션 추천 팝업
        messagebox.showinfo("AI 추천", 
                          "💡 추천: 솔루션 3 (3D 프린팅 가이드)\n\n"
                          "이유: 가장 간단하고 영구적인 해결책이며,\n"
                          "전원이나 복잡한 설정 없이 바로 사용 가능합니다.")
    
    def calculate_priority_score(self):
        """우선순위 점수 계산"""
        total = 0
        weights = {
            "사용 빈도": 2.0,
            "불편함 정도": 2.5,
            "기존 해결책 유무": 1.5,
            "제작 난이도": -1.0,  # 역방향
            "예상 효과": 2.0
        }
        
        for item, scale in self.matrix_scales.items():
            value = scale.get()
            weight = weights.get(item, 1.0)
            
            if item == "제작 난이도":
                value = 11 - value  # 역변환
            
            total += value * abs(weight)
        
        # 정규화 (0-100)
        max_score = sum(10 * abs(w) for w in weights.values())
        normalized = int((total / max_score) * 100)
        
        self.priority_score.config(text=str(normalized))
        
        # 색상 변경
        if normalized >= 80:
            self.priority_score.config(fg=self.colors['success'])
        elif normalized >= 60:
            self.priority_score.config(fg=self.colors['warning'])
        else:
            self.priority_score.config(fg=self.colors['danger'])
    
    def calculate_3d_estimate(self):
        """3D 프린팅 예상치 계산"""
        try:
            width = float(self.width_entry.get() or 0)
            height = float(self.height_entry.get() or 0)
            depth = float(self.depth_entry.get() or 0)
            
            if width == 0 or height == 0 or depth == 0:
                messagebox.showwarning("입력 오류", "크기를 모두 입력해주세요.")
                return
            
            # 부피 계산 (cm³)
            volume = (width * height * depth) / 1000
            
            # 예상 시간 (매우 단순화된 계산)
            # 실제로는 레이어 높이, 인필 밀도 등 고려 필요
            print_time = volume * 0.1  # 10cm³당 1시간
            
            # 예상 비용 (PLA 기준)
            # PLA 1kg = 20,000원, 밀도 1.25g/cm³
            material_weight = volume * 1.25  # 그램
            material_cost = (material_weight / 1000) * 20000
            
            self.print_time_label.config(text=f"예상 출력 시간: {print_time:.1f}시간")
            self.print_cost_label.config(text=f"예상 비용: {material_cost:.0f}원")
            
        except ValueError:
            messagebox.showerror("입력 오류", "올바른 숫자를 입력해주세요.")
    
    def open_tinkercad(self):
        """Tinkercad 웹사이트 열기"""
        webbrowser.open("https://www.tinkercad.com/")
    
    def download_stl_template(self):
        """STL 템플릿 다운로드 (시뮬레이션)"""
        messagebox.showinfo("STL 템플릿", 
                          "기본 템플릿 종류:\n\n"
                          "1. 브라켓_템플릿.stl\n"
                          "2. 홀더_템플릿.stl\n"
                          "3. 가이드_템플릿.stl\n"
                          "4. 스페이서_템플릿.stl\n\n"
                          "Thingiverse에서 더 많은 템플릿을 찾을 수 있습니다.")
        webbrowser.open("https://www.thingiverse.com/")
    
    def show_circuit_examples(self):
        """회로도 예제 보기"""
        webbrowser.open("https://www.circuito.io/")
    
    def search_price(self, row):
        """가격 조회 (시뮬레이션)"""
        item = self.cost_entries[row-1]['item'].get()
        if item:
            # 실제로는 웹 크롤링이나 API 사용
            messagebox.showinfo("가격 조회", 
                              f"'{item}' 검색 결과:\n\n"
                              f"알리익스프레스: 5,000원\n"
                              f"쿠팡: 7,000원\n"
                              f"네이버: 6,500원")
    
    def calculate_total_cost(self):
        """총 비용 계산"""
        total = 0
        for row in self.cost_entries:
            try:
                qty = int(row['qty'].get() or 0)
                price = int(row['price'].get() or 0)
                subtotal = qty * price
                row['total'].config(text=f"{subtotal:,}원")
                total += subtotal
            except ValueError:
                continue
        
        self.total_cost_label.config(text=f"총 비용: {total:,}원")
        
        # 예산 체크
        try:
            budget = int(self.budget_entry.get())
            if total <= budget:
                self.budget_status.config(text=f"✅ 예산 내 ({budget-total:,}원 여유)",
                                        foreground=self.colors['success'])
            else:
                self.budget_status.config(text=f"⚠️ 예산 초과 ({total-budget:,}원)",
                                        foreground=self.colors['danger'])
        except ValueError:
            pass
    
    def generate_full_script(self):
        """완전한 대본 생성"""
        script = """🎬 YouTube 영상 대본 (15분)
================================

[0:00-0:30] 🎬 오프닝
-------------------
"안녕하세요, Volty입니다. 
오늘은 헬스장에서 매번 겪는 그 짜증나는 문제, 
스미스머신 벤치 정렬 문제를 완벽하게 해결했습니다."

[문제 상황 영상 - 벤치가 한쪽으로 치우친 모습]

[0:30-2:00] 🔍 문제 설명
------------------------
"여러분도 이런 경험 있으시죠?
스미스머신에서 벤치프레스할 때 벤치가 정중앙에 없어서
한쪽 가슴만 더 자극이 가는 느낌..."

[실제 불균형한 운동 시연]

"이 문제를 해결하기 위해 
레이저, 초음파, 3D 프린팅까지 다 고민해봤는데
결국 가장 간단한 방법을 찾았습니다."

[2:00-5:00] 🛠️ 제작 과정
-------------------------
"필요한 재료는 단 두 가지입니다."

[재료 클로즈업]
• PLA 필라멘트 100g - 2,000원
• 벨크로 테이프 - 1,000원

"먼저 스미스머신 프레임 너비를 정확히 측정합니다."
[측정 장면]

"Tinkercad에서 간단한 센터링 가이드를 설계합니다."
[설계 화면 녹화]

"3D 프린터로 4시간 출력합니다."
[타임랩스 - 3D 프린팅 과정]

[5:00-7:00] 😅 시행착오
-----------------------
"처음엔 이렇게 복잡하게 만들려고 했어요."
[실패작 보여주기]

"레이저까지 달아봤는데... 과잉이더라구요."
[과도한 버전 보여주기]

"결국 심플 이즈 베스트!"

[7:00-10:00] ✨ 완성 & 시연
---------------------------
"자, 이제 완성된 제품을 보시죠."
[완성품 360도 회전 영상]

"사용법은 정말 간단합니다."
1. 스미스머신 프레임에 가이드 부착
2. 벤치를 가이드에 맞춰 배치
3. 완벽한 중앙 정렬 완성!

[Before/After 비교 - 화면 분할]

"이제 양쪽 가슴에 균등한 자극이 갑니다!"
[균형잡힌 운동 시연]

[10:00-12:00] 📊 실사용 후기
-----------------------------
"일주일 사용해본 결과..."

✅ 셋업 시간 90% 단축
✅ 운동 효율 200% 상승  
✅ 더 이상 치우친 벤치 걱정 없음

"헬스장 사람들이 다 신기해하더라구요."
[다른 사람들 반응]

[12:00-14:00] 💡 응용 & 팁
---------------------------
"이 원리를 응용하면..."

• 덤벨 거치대 정렬
• 바벨 랙 위치 표시
• 케이블 머신 높이 마킹

"여러분도 쉽게 만들 수 있어요!"

[14:00-15:00] 🎬 마무리
-----------------------
"오늘 영상 어떠셨나요?
단돈 3천원으로 헬스장 생활이 완전히 바뀌었습니다.

STL 파일은 설명란에 무료로 공유할게요.
3D 프린터 없으신 분들은 댓글 남겨주시면
제작 대행도 고려해보겠습니다.

다음 영상은 '스쿼트 발 위치 가이드' 만들기입니다.
구독과 알림 설정 잊지 마세요!

운동도 공학이다, Volty였습니다!"

[END]

================================
편집 노트:
- BGM: 에너지틱한 운동 음악
- 자막: 핵심 포인트만 강조
- 썸네일: Before/After 대비
================================"""
        
        self.script_output.delete(1.0, tk.END)
        self.script_output.insert(1.0, script)
        
        self.status_text.config(text="대본 생성 완료!")
    
    def auto_analyze_project(self):
        """프로젝트 자동 분석"""
        analysis = """📊 프로젝트 자동 분석 결과
=====================================

프로젝트: 스미스머신 벤치 정렬 가이드
상태: 완료

⏱️ 시간 효율성
--------------
계획: 4시간
실제: 3시간
효율성: 125% ✅

💰 비용 효율성
--------------
예산: 50,000원
실제: 3,000원  
절감: 94% ✅

📈 성과 지표
-----------
• 사용 빈도: 매일
• 만족도: 10/10
• 6개월 사용: 예상됨
• 추천 의향: 100%

🎬 영상 성과 예측
----------------
• 예상 조회수: 5,000-10,000
• 예상 댓글: 50-100개
• "갖고싶다" 비율: 30%
• 구독 전환: 50-100명

💡 핵심 성공 요인
----------------
1. 실제 문제 해결 ✅
2. 간단한 제작 과정 ✅
3. 저렴한 비용 ✅
4. 즉각적인 효과 ✅
5. 재사용 가능 ✅

🎯 종합 평가
-----------
프로젝트 성공도: A+
추천 레벨: ⭐⭐⭐⭐⭐

다음 프로젝트 추천:
→ 스쿼트 발 위치 가이드
→ 덤벨 거치 각도 조절기
====================================="""
        
        messagebox.showinfo("분석 완료", analysis)
        self.status_text.config(text="프로젝트 분석 완료!")

def main():
    root = tk.Tk()
    app = VoltyEnhancedManager(root)
    root.mainloop()

if __name__ == "__main__":
    main()