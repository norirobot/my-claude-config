"""
Volty UI Improved - 사용자 친화적인 개선된 인터페이스
- 시각적 개선
- 결과 초기화 기능
- 프로젝트 미리보기
- 단계별 진행 표시
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import requests
import json
import threading
from datetime import datetime
import os

class VoltyImprovedUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🚀 Volty AI Video Planner - Smart & Visual")
        self.root.geometry("1600x1000")
        self.root.configure(bg='#f0f0f0')
        
        # API 설정
        self.api_key = None
        self.api_base_url = "https://api.anthropic.com/v1/messages"
        
        # 현재 프로젝트 상태
        self.current_project = None
        self.analysis_step = 0
        
        # GUI 설정
        self.setup_styles()
        self.setup_gui()
        
        # 환영 메시지
        self.show_welcome_message()
    
    def setup_styles(self):
        """현대적인 스타일 설정"""
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # 색상 팔레트
        self.colors = {
            'primary': '#2563eb',
            'success': '#059669', 
            'warning': '#d97706',
            'danger': '#dc2626',
            'dark': '#374151',
            'light': '#f9fafb',
            'accent': '#8b5cf6'
        }
        
        # 커스텀 스타일들
        self.style.configure('Title.TLabel', 
                           font=('Segoe UI', 18, 'bold'),
                           background='#f0f0f0')
        
        self.style.configure('Subtitle.TLabel',
                           font=('Segoe UI', 12),
                           background='#f0f0f0',
                           foreground='#6b7280')
        
        self.style.configure('Primary.TButton',
                           font=('Segoe UI', 11, 'bold'))
        
        self.style.configure('Success.TButton',
                           background='#059669',
                           font=('Segoe UI', 10, 'bold'))
        
        self.style.configure('Warning.TButton',
                           background='#d97706',
                           font=('Segoe UI', 10, 'bold'))
    
    def setup_gui(self):
        """개선된 GUI 설정"""
        
        # 메인 컨테이너
        main_container = ttk.Frame(self.root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # 헤더
        self.setup_header(main_container)
        
        # 메인 컨텐츠
        content_frame = ttk.Frame(main_container)
        content_frame.pack(fill=tk.BOTH, expand=True, pady=(20, 0))
        
        # 3단 레이아웃: 입력 | 진행상황 | 결과
        self.setup_three_panel_layout(content_frame)
    
    def setup_header(self, parent):
        """헤더 설정"""
        header_frame = ttk.Frame(parent)
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        # 타이틀
        title_frame = ttk.Frame(header_frame)
        title_frame.pack(fill=tk.X)
        
        ttk.Label(title_frame, text="🚀 Volty AI Video Planner", 
                 style='Title.TLabel').pack(side=tk.LEFT)
        
        # API 상태
        self.api_status_frame = ttk.Frame(title_frame)
        self.api_status_frame.pack(side=tk.RIGHT)
        
        self.api_status_label = ttk.Label(self.api_status_frame, 
                                         text="🔴 API 연결 필요", 
                                         foreground='red',
                                         font=('Segoe UI', 10, 'bold'))
        self.api_status_label.pack(side=tk.RIGHT)
        
        # 설명
        ttk.Label(title_frame, 
                 text="아이디어를 입력하면 완전한 YouTube 영상 제작 가이드를 AI가 생성합니다",
                 style='Subtitle.TLabel').pack(side=tk.LEFT, padx=(20, 0))
        
        # API 설정
        self.setup_api_section(header_frame)
    
    def setup_api_section(self, parent):
        """API 설정 섹션"""
        api_frame = ttk.LabelFrame(parent, text="🔑 Claude API 설정", padding=15)
        api_frame.pack(fill=tk.X, pady=(10, 0))
        
        api_row = ttk.Frame(api_frame)
        api_row.pack(fill=tk.X)
        
        ttk.Label(api_row, text="API Key:").pack(side=tk.LEFT)
        
        self.api_key_var = tk.StringVar()
        self.api_entry = ttk.Entry(api_row, textvariable=self.api_key_var, 
                                  show="*", width=60, font=('Consolas', 10))
        self.api_entry.pack(side=tk.LEFT, padx=(10, 0), fill=tk.X, expand=True)
        
        ttk.Button(api_row, text="연결 테스트", 
                  command=self.test_api_connection,
                  style='Primary.TButton').pack(side=tk.LEFT, padx=(10, 0))
    
    def setup_three_panel_layout(self, parent):
        """3단 패널 레이아웃"""
        
        # 메인 패널드 윈도우
        main_paned = ttk.PanedWindow(parent, orient=tk.HORIZONTAL)
        main_paned.pack(fill=tk.BOTH, expand=True)
        
        # 왼쪽: 아이디어 입력 및 설정
        left_panel = ttk.Frame(main_paned)
        main_paned.add(left_panel, weight=1)
        
        # 가운데: 진행 상황 및 미리보기
        middle_panel = ttk.Frame(main_paned) 
        main_paned.add(middle_panel, weight=1)
        
        # 오른쪽: 상세 결과
        right_panel = ttk.Frame(main_paned)
        main_paned.add(right_panel, weight=2)
        
        self.setup_input_panel(left_panel)
        self.setup_progress_panel(middle_panel)
        self.setup_results_panel(right_panel)
    
    def setup_input_panel(self, parent):
        """입력 패널 설정"""
        
        # 아이디어 입력
        idea_frame = ttk.LabelFrame(parent, text="💡 프로젝트 아이디어", padding=15)
        idea_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(idea_frame, 
                 text="어떤 문제를 해결하고 싶으신가요?",
                 font=('Segoe UI', 11, 'bold')).pack(anchor=tk.W, pady=(0, 5))
        
        ttk.Label(idea_frame,
                 text="구체적이고 실용적인 문제일수록 더 좋은 결과를 얻을 수 있습니다.",
                 foreground='#6b7280').pack(anchor=tk.W, pady=(0, 10))
        
        self.idea_text = scrolledtext.ScrolledText(idea_frame, height=4, wrap=tk.WORD,
                                                  font=('Segoe UI', 11))
        self.idea_text.pack(fill=tk.X, pady=5)
        self.idea_text.insert(1.0, "예: 헬스장에서 물병이 자꾸 굴러다녀서 운동에 방해가 돼요")
        
        # 프로젝트 설정
        settings_frame = ttk.LabelFrame(parent, text="⚙️ 분석 설정", padding=15)
        settings_frame.pack(fill=tk.X, pady=10)
        
        # 분석 깊이
        depth_row = ttk.Frame(settings_frame)
        depth_row.pack(fill=tk.X, pady=5)
        
        ttk.Label(depth_row, text="분석 수준:").pack(side=tk.LEFT)
        self.analysis_depth = ttk.Combobox(depth_row, 
                                          values=["빠른 분석 (30초)", "표준 분석 (1분)", "심층 분석 (2분)"],
                                          state='readonly', width=20)
        self.analysis_depth.pack(side=tk.LEFT, padx=(10, 0))
        self.analysis_depth.set("표준 분석 (1분)")
        
        # 타겟 시청자
        audience_row = ttk.Frame(settings_frame)
        audience_row.pack(fill=tk.X, pady=5)
        
        ttk.Label(audience_row, text="타겟 시청자:").pack(side=tk.LEFT)
        self.target_audience = ttk.Combobox(audience_row,
                                           values=["Arduino 초보자", "DIY 애호가", "헬스장 이용자", "일반인"],
                                           state='readonly', width=20)
        self.target_audience.pack(side=tk.LEFT, padx=(10, 0))
        self.target_audience.set("Arduino 초보자")
        
        # 액션 버튼들
        action_frame = ttk.Frame(parent)
        action_frame.pack(fill=tk.X, pady=20)
        
        # 메인 분석 버튼
        self.analyze_btn = ttk.Button(action_frame, 
                                     text="🧠 AI 분석 시작",
                                     command=self.start_analysis,
                                     style='Primary.TButton')
        self.analyze_btn.pack(fill=tk.X, pady=5)
        
        # 초기화 버튼
        self.clear_btn = ttk.Button(action_frame,
                                   text="🗑️ 결과 초기화",
                                   command=self.clear_results,
                                   style='Warning.TButton')
        self.clear_btn.pack(fill=tk.X, pady=5)
        
        # 새 프로젝트 버튼
        self.new_project_btn = ttk.Button(action_frame,
                                         text="✨ 새 프로젝트",
                                         command=self.new_project,
                                         style='Success.TButton')
        self.new_project_btn.pack(fill=tk.X, pady=5)
    
    def setup_progress_panel(self, parent):
        """진행 상황 패널"""
        
        # 현재 프로젝트 미리보기
        preview_frame = ttk.LabelFrame(parent, text="📋 프로젝트 미리보기", padding=15)
        preview_frame.pack(fill=tk.X, pady=5)
        
        self.project_preview = scrolledtext.ScrolledText(preview_frame, height=8, wrap=tk.WORD,
                                                        font=('Segoe UI', 10),
                                                        state='disabled')
        self.project_preview.pack(fill=tk.X)
        
        # 진행 상황
        progress_frame = ttk.LabelFrame(parent, text="🔄 분석 진행 상황", padding=15)
        progress_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # 단계별 진행 표시
        self.setup_progress_steps(progress_frame)
        
        # 로그
        self.progress_log = scrolledtext.ScrolledText(progress_frame, height=12, wrap=tk.WORD,
                                                     font=('Consolas', 9))
        self.progress_log.pack(fill=tk.BOTH, expand=True, pady=(10, 0))
    
    def setup_progress_steps(self, parent):
        """단계별 진행 표시"""
        steps_frame = ttk.Frame(parent)
        steps_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.steps = [
            {"name": "문제 분석", "icon": "🔍", "status": "pending"},
            {"name": "솔루션 생성", "icon": "💡", "status": "pending"},
            {"name": "기술구현", "icon": "🔧", "status": "pending"},
            {"name": "영상기획", "icon": "🎬", "status": "pending"},
            {"name": "부품&코드", "icon": "📦", "status": "pending"}
        ]
        
        self.step_labels = []
        for i, step in enumerate(self.steps):
            step_frame = ttk.Frame(steps_frame)
            step_frame.pack(fill=tk.X, pady=2)
            
            # 상태 표시
            status_text = "⏳" if step["status"] == "pending" else \
                         "🟡" if step["status"] == "running" else "✅"
            
            label = ttk.Label(step_frame, 
                             text=f"{status_text} {step['icon']} {step['name']}",
                             font=('Segoe UI', 10))
            label.pack(side=tk.LEFT)
            
            self.step_labels.append(label)
    
    def setup_results_panel(self, parent):
        """결과 패널"""
        
        # 탭 노트북
        self.result_notebook = ttk.Notebook(parent)
        self.result_notebook.pack(fill=tk.BOTH, expand=True)
        
        # 탭들 생성
        self.create_result_tabs()
    
    def create_result_tabs(self):
        """결과 탭들 생성"""
        
        # 탭 정보
        tabs_info = [
            {"name": "🎯 프로젝트 개요", "key": "overview"},
            {"name": "🔍 문제 분석", "key": "analysis"},
            {"name": "💡 솔루션", "key": "solution"},
            {"name": "🔧 기술구현", "key": "technical"},
            {"name": "🎬 영상기획", "key": "video"},
            {"name": "🛒 부품목록", "key": "parts"},
            {"name": "💻 Arduino 코드", "key": "code"}
        ]
        
        self.tabs = {}
        
        for tab_info in tabs_info:
            frame = ttk.Frame(self.result_notebook)
            self.result_notebook.add(frame, text=tab_info["name"])
            
            # 스크롤 텍스트 위젯
            if tab_info["key"] == "code":
                text_widget = scrolledtext.ScrolledText(frame, wrap=tk.WORD,
                                                       font=('Consolas', 10))
            else:
                text_widget = scrolledtext.ScrolledText(frame, wrap=tk.WORD,
                                                       font=('Segoe UI', 11))
            
            text_widget.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            # 코드 탭에는 저장 버튼 추가
            if tab_info["key"] == "code":
                btn_frame = ttk.Frame(frame)
                btn_frame.pack(fill=tk.X, padx=10, pady=5)
                
                ttk.Button(btn_frame, text="💾 .ino 파일로 저장",
                          command=self.save_code).pack(side=tk.LEFT)
                ttk.Button(btn_frame, text="📋 클립보드로 복사",
                          command=self.copy_code).pack(side=tk.LEFT, padx=(10, 0))
            
            self.tabs[tab_info["key"]] = text_widget
    
    def show_welcome_message(self):
        """환영 메시지 표시"""
        welcome_text = """
🚀 Volty AI Video Planner에 오신 것을 환영합니다!

이 시스템은 당신의 아이디어를 완전한 YouTube 영상 제작 가이드로 변환합니다.

📝 사용 방법:
1. 상단에서 Claude API 키를 설정하고 연결 테스트
2. 왼쪽에 해결하고 싶은 실제 문제를 입력
3. 'AI 분석 시작' 버튼 클릭
4. 5단계 분석 과정을 실시간으로 관찰
5. 완성된 솔루션을 각 탭에서 확인

💡 예시 아이디어:
• 헬스장에서 물병이 자꾸 굴러다녀서 운동에 방해가 돼요
• 스쿼트할 때 발 위치가 계속 달라져서 폼이 일정하지 않아요
• 스미스머신 벤치가 정확히 중앙에 있는지 모르겠어요

🎯 결과물:
• 완전한 문제 해결 방안
• 실제 구현 가능한 Arduino 시스템
• 작동하는 코드와 부품 리스트
• YouTube 영상 제작 시나리오
• 촬영 및 편집 가이드

지금 시작해보세요! 🚀
        """
        
        self.tabs["overview"].insert(1.0, welcome_text)
        self.tabs["overview"].config(state='disabled')
    
    def test_api_connection(self):
        """API 연결 테스트"""
        api_key = self.api_key_var.get().strip()
        if not api_key:
            messagebox.showwarning("경고", "API 키를 입력해주세요.")
            return
        
        self.api_key = api_key
        self.log_message("🧪 Claude API 연결 테스트 중...")
        
        def test():
            try:
                headers = {
                    'x-api-key': self.api_key,
                    'content-type': 'application/json',
                    'anthropic-version': '2023-06-01'
                }
                
                data = {
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 50,
                    "messages": [
                        {"role": "user", "content": "Test connection"}
                    ]
                }
                
                # JSON 직렬화 시 ensure_ascii=False 사용
                json_data = json.dumps(data, ensure_ascii=False).encode('utf-8')
                headers['content-length'] = str(len(json_data))
                
                response = requests.post(self.api_base_url, 
                                       headers=headers,
                                       data=json_data,
                                       timeout=10)
                
                if response.status_code == 200:
                    self.api_status_label.config(text="🟢 API 연결 성공", foreground='green')
                    self.analyze_btn.config(state='normal')
                    self.log_message("✅ Claude API 연결 성공!")
                    messagebox.showinfo("성공", "Claude API 연결이 성공했습니다!")
                else:
                    error_msg = f"연결 실패 (코드: {response.status_code})"
                    self.api_status_label.config(text="🔴 " + error_msg, foreground='red')
                    self.log_message("❌ " + error_msg)
                    
            except Exception as e:
                error_msg = f"연결 오류: {str(e)}"
                self.api_status_label.config(text="🔴 " + error_msg, foreground='red')
                self.log_message("❌ " + error_msg)
        
        threading.Thread(target=test, daemon=True).start()
    
    def start_analysis(self):
        """AI 분석 시작"""
        if not self.api_key:
            messagebox.showwarning("경고", "먼저 API 키를 설정하고 연결 테스트를 해주세요.")
            return
        
        user_idea = self.idea_text.get(1.0, tk.END).strip()
        if not user_idea or "예:" in user_idea:
            messagebox.showwarning("경고", "실제 아이디어를 입력해주세요.")
            return
        
        # UI 상태 변경
        self.analyze_btn.config(state='disabled', text='🧠 AI 분석 중...')
        self.clear_results_content()
        
        # 프로젝트 미리보기 업데이트
        self.update_project_preview(user_idea)
        
        # 분석 시작
        self.log_message("🤖 Claude AI 분석을 시작합니다...")
        threading.Thread(target=self.run_analysis, args=(user_idea,), daemon=True).start()
    
    def run_analysis(self, user_idea):
        """실제 AI 분석 실행"""
        try:
            # 5단계 분석
            stages = [
                {"key": "analysis", "name": "문제 분석", "icon": "🔍"},
                {"key": "solution", "name": "솔루션 생성", "icon": "💡"},
                {"key": "technical", "name": "기술구현", "icon": "🔧"}, 
                {"key": "video", "name": "영상기획", "icon": "🎬"},
                {"key": "parts_code", "name": "부품&코드", "icon": "📦"}
            ]
            
            for i, stage in enumerate(stages):
                self.update_step_status(i, "running")
                self.log_message(f"{stage['icon']} {i+1}단계: {stage['name']} 중...")
                
                # API 호출
                result = self.call_claude_api(self.create_prompt(stage["key"], user_idea))
                
                if result:
                    if stage["key"] == "parts_code":
                        self.process_parts_and_code(result)
                    else:
                        self.update_tab_content(stage["key"], result)
                    
                    self.update_step_status(i, "completed")
                    self.log_message(f"✅ {stage['name']} 완료")
                else:
                    self.update_step_status(i, "error")
                    self.log_message(f"❌ {stage['name']} 실패")
            
            self.log_message("🎉 모든 분석이 완료되었습니다! 각 탭에서 결과를 확인하세요.")
            
        except Exception as e:
            self.log_message(f"❌ 분석 중 오류: {str(e)}")
        
        finally:
            self.analyze_btn.config(state='normal', text='🧠 AI 분석 시작')
    
    def update_step_status(self, step_index, status):
        """단계 상태 업데이트"""
        if step_index < len(self.step_labels):
            step = self.steps[step_index]
            step["status"] = status
            
            status_icon = "🟡" if status == "running" else \
                         "✅" if status == "completed" else \
                         "❌" if status == "error" else "⏳"
            
            self.step_labels[step_index].config(
                text=f"{status_icon} {step['icon']} {step['name']}"
            )
    
    def update_project_preview(self, idea):
        """프로젝트 미리보기 업데이트"""
        preview_text = f"""
📝 현재 분석 중인 프로젝트:

💡 아이디어:
{idea}

⚙️ 설정:
• 분석 수준: {self.analysis_depth.get()}
• 타겟 시청자: {self.target_audience.get()}
• 시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

🎯 예상 결과물:
• 맞춤형 Arduino 솔루션
• 완전한 부품 목록 및 가격
• 실제 작동하는 코드
• YouTube 영상 제작 가이드
• 촬영 및 편집 시나리오

🔄 진행 상황을 실시간으로 확인하세요!
        """
        
        self.project_preview.config(state='normal')
        self.project_preview.delete(1.0, tk.END)
        self.project_preview.insert(1.0, preview_text)
        self.project_preview.config(state='disabled')
    
    def call_claude_api(self, prompt):
        """Claude API 호출"""
        try:
            headers = {
                'x-api-key': self.api_key,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 2000,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
            
            # JSON 직렬화 시 한글 지원
            json_data = json.dumps(data, ensure_ascii=False).encode('utf-8')
            headers['content-length'] = str(len(json_data))
            
            response = requests.post(self.api_base_url, 
                                   headers=headers,
                                   data=json_data,
                                   timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return result['content'][0]['text']
            else:
                self.log_message(f"❌ API 호출 실패: {response.status_code}")
                return None
                
        except Exception as e:
            self.log_message(f"❌ API 호출 오류: {str(e)}")
            return None
    
    def create_prompt(self, stage_key, user_idea):
        """단계별 프롬프트 생성"""
        prompts = {
            "analysis": f"""
사용자 아이디어: "{user_idea}"

이 문제를 체계적으로 분석해주세요:

1. 핵심 문제점 파악
2. 발생 상황과 맥락
3. 현재 해결 방법의 한계
4. 해결시 얻을 수 있는 이점
5. 관련된 추가 불편함들

실용적이고 YouTube 컨텐츠로 가치있는 관점에서 분석해주세요.
            """,
            
            "solution": f"""
문제: "{user_idea}"

Arduino 기반의 창의적이고 실용적인 해결방안을 제시해주세요:

1. 메인 솔루션 개념
2. 핵심 동작 방식  
3. 사용자 경험 시나리오
4. 기존 방법 대비 장점
5. 추가 가능한 기능들
6. 실제 활용도 평가

헬스장/운동 환경이면 그에 특화된 솔루션을 제안해주세요.
            """,
            
            "technical": f"""
아이디어: "{user_idea}"

실제 Arduino 구현을 위한 상세 기술 방안:

1. 필요한 센서 종류와 선택 이유
2. 출력 장치 (LED, 부저, 디스플레이 등)
3. 적합한 Arduino 보드
4. 핵심 알고리즘 로직
5. 데이터 처리 방법
6. 사용자 인터페이스
7. 전원 공급 방안
8. 케이스/마운팅 방법
9. 초보자 구현 가능성
10. 예상 기술적 문제점

실제 제작 가능한 현실적 방안을 제시해주세요.
            """,
            
            "video": f"""
프로젝트: "{user_idea}" 해결 시스템

YouTube 영상 제작을 위한 상세 기획안:

1. 영상 길이 및 타겟
2. 첫 30초 후킹 전략
3. 시간대별 상세 시나리오:
   - 0:00-0:30: 문제 제기
   - 0:30-1:00: 솔루션 소개
   - 1:00-2:30: 부품 및 제작
   - 2:30-4:00: 코딩 과정
   - 4:00-5:00: 테스트 결과
   - 5:00-5:30: 마무리

4. 촬영 팁 (각도, 연출, 강조점)
5. 편집 가이드 (BGM, 자막, 효과음)
6. 썸네일 아이디어
7. 제목 후보 3개

조회수 10만+ 달성 가능한 수준으로 기획해주세요.
            """,
            
            "parts_code": f"""
프로젝트: "{user_idea}"

다음을 생성해주세요:

=== 부품 목록 ===
1. 메인보드: (정확한 모델명)
2. 센서류: (구체적 부품명과 용도)
3. 출력장치: (LED, 부저, 디스플레이 등)
4. 기타: (저항, 케이블, 브레드보드 등)
5. 총 예상비용: (한국 기준)
6. 구매처 추천: (국내/해외)

=== Arduino 코드 ===
실제 업로드 가능한 완전한 .ino 코드:

```cpp
/*
 * 프로젝트: [제목]
 * 설명: [간단한 설명]
 * 
 * 필요 라이브러리:
 * - [라이브러리 목록]
 * 
 * 하드웨어 연결:
 * - [핀 연결 정보]
 */

// 완전한 동작 코드 작성
// 상세한 주석 포함
// 에러 처리 포함
// 시리얼 출력 포함
```

실제 컴파일되고 동작하는 수준으로 작성해주세요.
            """
        }
        
        return prompts.get(stage_key, "")
    
    def process_parts_and_code(self, result):
        """부품 목록과 코드 분리 처리"""
        if "=== Arduino 코드 ===" in result:
            parts_section = result.split("=== Arduino 코드 ===")[0]
            code_section = result.split("=== Arduino 코드 ===")[1]
            
            self.update_tab_content("parts", parts_section)
            
            if "```cpp" in code_section:
                code_start = code_section.find("```cpp") + 6
                code_end = code_section.find("```", code_start)
                if code_end > code_start:
                    actual_code = code_section[code_start:code_end].strip()
                    self.update_tab_content("code", actual_code)
                    self.generated_code = actual_code
        else:
            self.update_tab_content("parts", result)
    
    def update_tab_content(self, tab_key, content):
        """탭 내용 업데이트"""
        if tab_key in self.tabs:
            text_widget = self.tabs[tab_key]
            text_widget.delete(1.0, tk.END)
            text_widget.insert(1.0, content)
    
    def clear_results(self):
        """결과 초기화"""
        if messagebox.askyesno("확인", "모든 분석 결과를 초기화하시겠습니까?"):
            self.clear_results_content()
            self.log_message("🗑️ 모든 결과가 초기화되었습니다.")
    
    def clear_results_content(self):
        """결과 내용만 초기화"""
        for key, tab in self.tabs.items():
            if key != "overview":  # 개요 탭은 유지
                tab.delete(1.0, tk.END)
        
        # 단계 상태 초기화
        for i, step in enumerate(self.steps):
            step["status"] = "pending"
            if i < len(self.step_labels):
                self.step_labels[i].config(
                    text=f"⏳ {step['icon']} {step['name']}"
                )
    
    def new_project(self):
        """새 프로젝트 시작"""
        if messagebox.askyesno("새 프로젝트", "새 프로젝트를 시작하시겠습니까?\n현재 내용이 모두 초기화됩니다."):
            self.idea_text.delete(1.0, tk.END)
            self.idea_text.insert(1.0, "예: 헬스장에서 물병이 자꾸 굴러다녀서 운동에 방해가 돼요")
            self.clear_results_content()
            self.progress_log.delete(1.0, tk.END)
            
            # 미리보기 초기화
            self.project_preview.config(state='normal')
            self.project_preview.delete(1.0, tk.END)
            self.project_preview.config(state='disabled')
            
            self.log_message("✨ 새 프로젝트를 시작합니다!")
    
    def save_code(self):
        """코드 저장"""
        if hasattr(self, 'generated_code'):
            from tkinter import filedialog
            filename = filedialog.asksaveasfilename(
                defaultextension=".ino",
                filetypes=[("Arduino files", "*.ino"), ("All files", "*.*")]
            )
            if filename:
                try:
                    with open(filename, 'w', encoding='utf-8') as f:
                        f.write(self.generated_code)
                    messagebox.showinfo("성공", f"코드가 저장되었습니다!\n{filename}")
                except Exception as e:
                    messagebox.showerror("오류", f"저장 실패: {str(e)}")
    
    def copy_code(self):
        """코드 클립보드 복사"""
        if hasattr(self, 'generated_code'):
            self.root.clipboard_clear()
            self.root.clipboard_append(self.generated_code)
            messagebox.showinfo("성공", "코드가 클립보드에 복사되었습니다!")
    
    def log_message(self, message):
        """로그 메시지 추가"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        
        self.progress_log.insert(tk.END, log_entry)
        self.progress_log.see(tk.END)
        self.root.update()

def main():
    """메인 실행"""
    print("=== Volty Improved UI ===")
    print("사용자 친화적 개선 버전")
    
    root = tk.Tk()
    app = VoltyImprovedUI(root)
    
    print("실행 완료! 개선된 UI를 확인해보세요.")
    root.mainloop()

if __name__ == "__main__":
    main()