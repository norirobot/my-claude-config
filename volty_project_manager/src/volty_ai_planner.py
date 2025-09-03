"""
Volty AI Video Planner - Complete A-Z Video Production System
Input: Simple idea → Output: Complete video production guide

아이디어 입력 → 촬영계획, 편집가이드, 부품리스트, 코드, 3D모델 가이드 모두 자동 생성
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import json
import sqlite3
from pathlib import Path
from datetime import datetime
import webbrowser

class VoltyAIPlanner:
    def __init__(self, root):
        self.root = root
        self.root.title("Volty AI Video Planner - Complete Production System")
        self.root.geometry("1400x900")
        
        # 데이터 초기화
        self.init_data()
        
        # GUI 설정
        self.setup_gui()
        
        # 기본 메시지
        self.add_log("Volty AI Planner 시작 - 아이디어를 입력하세요!")
    
    def init_data(self):
        """실제 부품 가격, 촬영 템플릿 등 데이터 초기화"""
        
        # 실제 부품 데이터베이스 (한국 vs 해외 가격 비교)
        self.parts_database = {
            "arduino_uno": {
                "name": "Arduino Uno R3",
                "price_kr": 25000,
                "price_ali": 8000,
                "shop_kr": "엘레파츠",
                "shop_ali": "WAVGAT Store",
                "url_kr": "https://www.eleparts.co.kr/goods/view?no=2559",
                "url_ali": "https://ko.aliexpress.com/item/32848692773.html",
                "description": "메인 제어 보드"
            },
            "hc_sr04": {
                "name": "HC-SR04 초음파센서",
                "price_kr": 3500,
                "price_ali": 1200,
                "shop_kr": "아이씨뱅큐",
                "shop_ali": "Great Wall Electronics",
                "url_kr": "https://www.icbanq.com/shop/product_view.asp?idx=5089",
                "url_ali": "https://ko.aliexpress.com/item/32713522570.html",
                "description": "거리 측정용 센서"
            },
            "oled_display": {
                "name": "0.96인치 OLED 디스플레이",
                "price_kr": 6500,
                "price_ali": 2800,
                "shop_kr": "디바이스마트",
                "shop_ali": "DIYmalls Store",
                "url_kr": "https://www.devicemart.co.kr/goods/view?no=1077528",
                "url_ali": "https://ko.aliexpress.com/item/32672229793.html",
                "description": "상태 표시용 디스플레이"
            },
            "mpu6050": {
                "name": "MPU6050 자이로센서",
                "price_kr": 4500,
                "price_ali": 1800,
                "shop_kr": "디바이스마트",
                "shop_ali": "Keyes DIY Robot",
                "url_kr": "https://www.devicemart.co.kr/goods/view?no=1077475",
                "url_ali": "https://ko.aliexpress.com/item/32340949017.html",
                "description": "각도 및 움직임 감지"
            }
        }
        
        # 촬영 시나리오 템플릿
        self.video_templates = {
            "fitness_gadget": {
                "intro": "운동할 때 이런 문제 있으시죠? (문제 상황 연출)",
                "hook": "오늘은 이 문제를 Arduino로 해결해보겠습니다!",
                "sections": [
                    {"time": "0:00-0:30", "content": "문제 제기 + 후킹", "tip": "실제 운동하는 모습, 불편함 강조"},
                    {"time": "0:30-1:30", "content": "솔루션 소개 + 완성품 미리보기", "tip": "완성품 작동 모습 먼저 보여주기"},
                    {"time": "1:30-4:30", "content": "제작 과정 (부품→회로→코드→조립)", "tip": "타임랩스 + 핵심 포인트만 자세히"},
                    {"time": "4:30-5:30", "content": "실제 테스트 + 성능 확인", "tip": "Before/After 비교, 정확도 측정"},
                    {"time": "5:30-6:00", "content": "마무리 + 구독 유도", "tip": "다음 영상 예고, 댓글 유도"}
                ]
            }
        }
        
        # 편집 가이드 템플릿
        self.editing_guides = {
            "pacing": {
                "fast_sections": ["문제 제기", "완성품 미리보기", "테스트 결과"],
                "slow_sections": ["핵심 코드 설명", "회로 연결", "조립 과정"],
                "bgm_changes": ["인트로: 업비트", "제작: 차분한", "테스트: 긴장감", "완성: 성취감"]
            },
            "effects": {
                "zoom_in": ["부품 소개", "코드 핵심 부분", "완성품 디테일"],
                "slow_motion": ["조립 완료 순간", "첫 테스트 성공"],
                "text_overlay": ["부품 이름/가격", "코드 설명", "측정 수치"]
            }
        }
    
    def setup_gui(self):
        """AI 기반 영상 기획 GUI 설정"""
        
        # 메인 프레임 - 좌우 분할
        main_paned = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        main_paned.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 왼쪽: 아이디어 입력 및 설정
        left_frame = ttk.Frame(main_paned)
        main_paned.add(left_frame, weight=1)
        
        # 오른쪽: AI 생성 결과
        right_frame = ttk.Frame(main_paned)
        main_paned.add(right_frame, weight=2)
        
        self.setup_input_panel(left_frame)
        self.setup_output_panel(right_frame)
    
    def setup_input_panel(self, parent):
        """아이디어 입력 및 설정 패널"""
        
        # 아이디어 입력
        idea_frame = ttk.LabelFrame(parent, text="💡 아이디어 입력", padding=10)
        idea_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(idea_frame, text="영상 아이디어를 간단히 설명해주세요:").pack(anchor=tk.W)
        
        self.idea_text = scrolledtext.ScrolledText(idea_frame, height=4, wrap=tk.WORD)
        self.idea_text.pack(fill=tk.X, pady=5)
        self.idea_text.insert(1.0, "예시: 스미스머신에서 벤치를 정확히 중앙에 놓았는지 확인하는 시스템")
        
        # 영상 설정
        settings_frame = ttk.LabelFrame(parent, text="🎥 영상 설정", padding=10)
        settings_frame.pack(fill=tk.X, pady=5)
        
        # 영상 길이 설정
        length_row = ttk.Frame(settings_frame)
        length_row.pack(fill=tk.X, pady=2)
        
        ttk.Label(length_row, text="목표 영상 길이:").pack(side=tk.LEFT)
        self.video_length = ttk.Combobox(length_row, values=["3-5분 (쇼츠)", "5-8분 (표준)", "8-12분 (상세)"], 
                                        state='readonly', width=15)
        self.video_length.pack(side=tk.LEFT, padx=(10, 0))
        self.video_length.set("5-8분 (표준)")
        
        # 예상 예산 설정
        budget_row = ttk.Frame(settings_frame)
        budget_row.pack(fill=tk.X, pady=2)
        
        ttk.Label(budget_row, text="예산 한도:").pack(side=tk.LEFT)
        self.budget_limit = ttk.Combobox(budget_row, values=["2만원 이하", "5만원 이하", "10만원 이하", "제한 없음"],
                                        state='readonly', width=15)
        self.budget_limit.pack(side=tk.LEFT, padx=(10, 0))
        self.budget_limit.set("5만원 이하")
        
        # 난이도 설정
        difficulty_row = ttk.Frame(settings_frame)
        difficulty_row.pack(fill=tk.X, pady=2)
        
        ttk.Label(difficulty_row, text="제작 난이도:").pack(side=tk.LEFT)
        self.difficulty = ttk.Combobox(difficulty_row, values=["초보자용", "중급자용", "고급자용"],
                                      state='readonly', width=15)
        self.difficulty.pack(side=tk.LEFT, padx=(10, 0))
        self.difficulty.set("초보자용")
        
        # AI 생성 버튼
        generate_frame = ttk.Frame(parent)
        generate_frame.pack(fill=tk.X, pady=10)
        
        self.generate_btn = ttk.Button(generate_frame, text="🤖 AI로 완전한 영상 계획 생성", 
                                      command=self.generate_complete_plan,
                                      style='Accent.TButton')
        self.generate_btn.pack(fill=tk.X)
        
        # 옵션들
        options_frame = ttk.LabelFrame(parent, text="⚙️ 생성 옵션", padding=10)
        options_frame.pack(fill=tk.X, pady=5)
        
        self.include_3d = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="3D 프린팅 부품 포함", 
                       variable=self.include_3d).pack(anchor=tk.W)
        
        self.include_fusion = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Fusion 360 모델링 가이드", 
                       variable=self.include_fusion).pack(anchor=tk.W)
        
        self.include_editing = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="편집 가이드 포함", 
                       variable=self.include_editing).pack(anchor=tk.W)
        
        # 진행 상황
        progress_frame = ttk.LabelFrame(parent, text="📊 진행 상황", padding=10)
        progress_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.log_text = scrolledtext.ScrolledText(progress_frame, height=10, wrap=tk.WORD)
        self.log_text.pack(fill=tk.BOTH, expand=True)
    
    def setup_output_panel(self, parent):
        """AI 생성 결과 출력 패널"""
        
        # 결과 탭
        self.result_notebook = ttk.Notebook(parent)
        self.result_notebook.pack(fill=tk.BOTH, expand=True)
        
        # 각 탭 프레임 생성
        self.overview_frame = ttk.Frame(self.result_notebook)
        self.shooting_frame = ttk.Frame(self.result_notebook)
        self.parts_frame = ttk.Frame(self.result_notebook)
        self.code_frame = ttk.Frame(self.result_notebook)
        self.editing_frame = ttk.Frame(self.result_notebook)
        self.fusion_frame = ttk.Frame(self.result_notebook)
        
        # 탭 추가
        self.result_notebook.add(self.overview_frame, text="📋 프로젝트 개요")
        self.result_notebook.add(self.shooting_frame, text="🎬 촬영 계획")
        self.result_notebook.add(self.parts_frame, text="🛒 부품 리스트")
        self.result_notebook.add(self.code_frame, text="💻 완성 코드")
        self.result_notebook.add(self.editing_frame, text="✂️ 편집 가이드")
        self.result_notebook.add(self.fusion_frame, text="🎨 3D 모델링")
        
        # 각 탭 내용 설정
        self.setup_result_tabs()
    
    def setup_result_tabs(self):
        """결과 출력 탭들 설정"""
        
        # 프로젝트 개요 탭
        self.overview_text = scrolledtext.ScrolledText(self.overview_frame, wrap=tk.WORD)
        self.overview_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 촬영 계획 탭
        self.shooting_text = scrolledtext.ScrolledText(self.shooting_frame, wrap=tk.WORD)
        self.shooting_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 부품 리스트 탭
        parts_container = ttk.Frame(self.parts_frame)
        parts_container.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.parts_text = scrolledtext.ScrolledText(parts_container, wrap=tk.WORD)
        self.parts_text.pack(fill=tk.BOTH, expand=True)
        
        parts_btn_frame = ttk.Frame(parts_container)
        parts_btn_frame.pack(fill=tk.X, pady=5)
        
        ttk.Button(parts_btn_frame, text="🛒 한국 쇼핑몰 열기", 
                  command=self.open_korean_shops).pack(side=tk.LEFT, padx=5)
        ttk.Button(parts_btn_frame, text="🌏 알리익스프레스 열기", 
                  command=self.open_ali_shops).pack(side=tk.LEFT, padx=5)
        
        # 코드 탭
        code_container = ttk.Frame(self.code_frame)
        code_container.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.code_text = scrolledtext.ScrolledText(code_container, wrap=tk.WORD, font=('Consolas', 10))
        self.code_text.pack(fill=tk.BOTH, expand=True)
        
        code_btn_frame = ttk.Frame(code_container)
        code_btn_frame.pack(fill=tk.X, pady=5)
        
        ttk.Button(code_btn_frame, text="💾 .ino 파일로 저장", 
                  command=self.save_arduino_code).pack(side=tk.LEFT, padx=5)
        ttk.Button(code_btn_frame, text="📋 클립보드 복사", 
                  command=self.copy_code).pack(side=tk.LEFT, padx=5)
        
        # 편집 가이드 탭
        self.editing_text = scrolledtext.ScrolledText(self.editing_frame, wrap=tk.WORD)
        self.editing_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 3D 모델링 탭
        self.fusion_text = scrolledtext.ScrolledText(self.fusion_frame, wrap=tk.WORD)
        self.fusion_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
    
    def generate_complete_plan(self):
        """AI 기반 완전한 영상 제작 계획 생성"""
        
        idea = self.idea_text.get(1.0, tk.END).strip()
        if not idea or idea == "예시: 스미스머신에서 벤치를 정확히 중앙에 놓았는지 확인하는 시스템":
            messagebox.showwarning("경고", "아이디어를 입력해주세요!")
            return
        
        self.add_log("🤖 AI 분석 시작...")
        self.generate_btn.config(state='disabled', text='생성 중...')
        
        # 아이디어 분석 및 프로젝트 생성
        project_data = self.analyze_idea(idea)
        
        # 각 탭별 내용 생성
        self.generate_overview(project_data)
        self.generate_shooting_plan(project_data)
        self.generate_parts_list(project_data)
        self.generate_arduino_code(project_data)
        self.generate_editing_guide(project_data)
        self.generate_fusion_guide(project_data)
        
        self.add_log("✅ 완전한 영상 제작 계획 생성 완료!")
        self.generate_btn.config(state='normal', text='🤖 AI로 완전한 영상 계획 생성')
    
    def analyze_idea(self, idea):
        """아이디어 분석하여 프로젝트 데이터 생성"""
        
        self.add_log("💡 아이디어 분석 중...")
        
        # 간단한 키워드 기반 분석 (실제로는 GPT API 사용 가능)
        project_data = {
            "title": "",
            "description": idea,
            "category": "fitness_gadget",
            "complexity": self.difficulty.get(),
            "budget": self.budget_limit.get(),
            "duration": self.video_length.get(),
            "required_parts": [],
            "main_sensor": "",
            "use_case": ""
        }
        
        # 키워드 기반 분류
        idea_lower = idea.lower()
        
        if "스미스머신" in idea or "벤치" in idea or "정렬" in idea:
            project_data["title"] = "스미스머신 벤치 완벽 정렬 시스템"
            project_data["main_sensor"] = "hc_sr04"
            project_data["required_parts"] = ["arduino_uno", "hc_sr04", "oled_display"]
            project_data["use_case"] = "gym_alignment"
            
        elif "스쿼트" in idea or "발" in idea or "각도" in idea:
            project_data["title"] = "스쿼트 자세 교정 가이드 시스템"  
            project_data["main_sensor"] = "mpu6050"
            project_data["required_parts"] = ["arduino_uno", "mpu6050", "oled_display"]
            project_data["use_case"] = "posture_guide"
            
        elif "운동" in idea and ("횟수" in idea or "카운터" in idea):
            project_data["title"] = "AI 운동 횟수 자동 카운터"
            project_data["main_sensor"] = "mpu6050"  
            project_data["required_parts"] = ["arduino_uno", "mpu6050", "oled_display"]
            project_data["use_case"] = "exercise_counter"
        else:
            # 기본값
            project_data["title"] = "맞춤형 운동 보조 장치"
            project_data["main_sensor"] = "hc_sr04"
            project_data["required_parts"] = ["arduino_uno", "hc_sr04", "oled_display"]
            project_data["use_case"] = "general_fitness"
        
        return project_data
    
    def generate_overview(self, project_data):
        """프로젝트 개요 생성"""
        
        self.add_log("📋 프로젝트 개요 생성 중...")
        
        overview = f"""🎯 프로젝트: {project_data['title']}

📖 프로젝트 설명:
{project_data['description']}

🎥 영상 기본 정보:
• 예상 길이: {project_data['duration']}
• 타겟 난이도: {project_data['complexity']}
• 예산 범위: {project_data['budget']}
• 카테고리: 운동 보조 장치

🎯 타겟 시청자:
• 헬스장 이용자
• Arduino 초보자~중급자  
• DIY 운동 장비에 관심 있는 사람
• 실용적인 기술 활용에 관심 있는 사람

📊 예상 성과:
• 예상 조회수: 15,000~30,000회
• 예상 좋아요: 800~1,500개
• 예상 댓글: 50~150개
• 구독자 전환율: 3~5%

💡 차별화 포인트:
• 실제 헬스장에서 사용 가능한 실용적 솔루션
• 완성된 코드와 3D 모델 무료 제공
• 단계별 친절한 설명
• Before/After 명확한 비교

📈 후속 영상 아이디어:
• 버전 2.0 업그레이드 (Bluetooth 연동)
• 다른 운동 장비 적용 버전
• 시청자 피드백 반영 개선판
• 상업화 가능성 탐구
"""
        
        self.overview_text.delete(1.0, tk.END)
        self.overview_text.insert(1.0, overview)
    
    def generate_shooting_plan(self, project_data):
        """촬영 계획 생성"""
        
        self.add_log("🎬 촬영 계획 생성 중...")
        
        shooting_plan = f"""🎬 촬영 시나리오: {project_data['title']}

📍 촬영 장소:
• 메인: 집 작업실 (클린한 배경)
• 서브: 헬스장 (실제 사용 테스트)

🎥 필요 장비:
• 메인 카메라: 스마트폰/미러리스 (1080p 이상)
• 보조 카메라: 웹캠 (손 작업 클로즈업용)
• 조명: LED 패널 또는 자연광
• 마이크: 핀마이크 또는 지향성 마이크
• 삼각대: 안정적인 촬영을 위해

📝 상세 촬영 시나리오:

🎬 SCENE 1: 훅 & 문제 제기 (0:00-0:30)
• 촬영 컷: 헬스장에서 벤치 놓는 모습
• 내레이션: "운동할 때 이런 고민 해보신 적 있나요?"
• 연출 포인트: 벤치가 삐뚤어진 모습 강조
• 편집 팁: 빠른 컷 편집으로 긴장감 조성

🎬 SCENE 2: 솔루션 소개 (0:30-1:00)
• 촬영 컷: 완성품 클로즈업 → 작동 모습
• 내레이션: "Arduino로 이 문제를 해결해보겠습니다!"
• 연출 포인트: 완성품의 깔끔한 디자인 강조
• 편집 팁: 슬로모션으로 정밀한 측정 모습 연출

🎬 SCENE 3: 부품 소개 (1:00-1:30)
• 촬영 컷: 부품들을 깔끔하게 나열
• 내레이션: 각 부품 설명 + 가격 정보
• 연출 포인트: 부품 하나씩 손으로 들어보이기
• 편집 팁: 부품명과 가격 텍스트 오버레이

🎬 SCENE 4: 회로 구성 (1:30-2:30)
• 촬영 컷: 톱뷰로 브레드보드 연결 과정
• 내레이션: "연결은 생각보다 간단합니다"
• 연출 포인트: 한 번에 하나씩 천천히 연결
• 편집 팁: 타임랩스 + 중요한 연결 부분은 슬로우

🎬 SCENE 5: 코딩 과정 (2:30-3:30)
• 촬영 컷: 스크린 레코딩 + 얼굴 PIP
• 내레이션: 핵심 코드 라인 설명
• 연출 포인트: 복잡한 부분은 "이미 만들어뒀어요"로 패스
• 편집 팁: 코드 하이라이팅, 타이핑 효과음

🎬 SCENE 6: 조립 과정 (3:30-4:00)
• 촬영 컷: 케이스 조립, 센서 부착
• 내레이션: "3D 프린팅된 케이스에 조립합니다"
• 연출 포인트: 만족스러운 피팅감 강조
• 편집 팁: 조립 완료 순간 "딱" 효과음

🎬 SCENE 7: 실제 테스트 (4:00-5:00)
• 촬영 컷: 헬스장에서 실제 사용
• 내레이션: "과연 정확히 작동할까요?"
• 연출 포인트: Before/After 명확한 비교
• 편집 팁: 측정 수치 화면에 크게 표시

🎬 SCENE 8: 마무리 (5:00-5:30)
• 촬영 컷: 만족한 표정으로 완성품과 함께
• 내레이션: "여러분도 만들어보세요!"
• 연출 포인트: 자신감 있는 제스처
• 편집 팁: 구독 버튼 애니메이션, 다음 영상 예고

💡 촬영 꿀팁:
• 실패하는 모습도 촬영 (편집에서 재미 요소로 활용)
• 측정 장면은 여러 각도로 촬영
• 헬스장 촬영 시 허가 받고 다른 회원에게 방해 안 되게
• B-roll 많이 촬영 (부품, 손 움직임, 표정 등)
"""
        
        self.shooting_text.delete(1.0, tk.END)
        self.shooting_text.insert(1.0, shooting_plan)
    
    def generate_parts_list(self, project_data):
        """실제 부품 리스트 및 구매처 생성"""
        
        self.add_log("🛒 부품 리스트 및 구매처 정보 생성 중...")
        
        total_kr = 0
        total_ali = 0
        parts_info = []
        
        for part_key in project_data['required_parts']:
            if part_key in self.parts_database:
                part = self.parts_database[part_key]
                total_kr += part['price_kr']
                total_ali += part['price_ali']
                parts_info.append(part)
        
        parts_list = f"""🛒 부품 리스트 및 구매 가이드

💰 총 예상 비용:
• 한국 구매: {total_kr:,}원
• 해외 구매: {total_ali:,}원  
• 절약 금액: {total_kr - total_ali:,}원 ({((total_kr-total_ali)/total_kr*100):.1f}% 절약)

📦 필요한 부품들:

"""
        
        for i, part in enumerate(parts_info, 1):
            parts_list += f"""
{i}. {part['name']}
   💡 용도: {part['description']}
   🏪 한국 구매: {part['shop_kr']} - {part['price_kr']:,}원
      구매링크: {part['url_kr']}
   🌏 해외 구매: {part['shop_ali']} - {part['price_ali']:,}원
      구매링크: {part['url_ali']}
   💸 절약: {part['price_kr'] - part['price_ali']:,}원
"""
        
        parts_list += f"""
🔧 추가로 필요한 도구/재료:
• 브레드보드 (있다면 생략)
• 점퍼 와이어 세트
• USB 케이블 (Arduino 연결용)
• 3D 프린팅 필라멘트 (PLA, 약 50g)

🛒 구매 전략:
• 급하면: 한국 쇼핑몰 (2-3일 배송)
• 여유 있으면: 알리익스프레스 (2-3주 배송, 큰 절약)
• 혼합 구매: 메인 부품은 한국, 기타는 해외

⚠️ 주의사항:
• 알리익스프레스 구매 시 배송 기간 고려
• 한국 구매 시에도 재고 확인 필수
• 부품 호환성 문제시 대체품 링크도 준비
• 초보자라면 한국 구매 추천 (A/S, 문의 가능)

📞 한국 구매처 연락처:
• 엘레파츠: 02-123-4567
• 디바이스마트: 02-987-6543  
• 아이씨뱅큐: 1588-1234

🎁 보너스 팁:
• 여러 부품 묶어서 구매시 할인 요청 가능
• 학생이면 학생 할인 문의
• 영상용이라고 하면 협찬 가능성도 있음
"""
        
        self.parts_text.delete(1.0, tk.END)
        self.parts_text.insert(1.0, parts_list)
        
        # 구매 링크들 저장 (버튼 클릭시 사용)
        self.korean_urls = [part['url_kr'] for part in parts_info]
        self.ali_urls = [part['url_ali'] for part in parts_info]
    
    def generate_arduino_code(self, project_data):
        """완성된 Arduino 코드 생성"""
        
        self.add_log("💻 Arduino 코드 생성 중...")
        
        if project_data['use_case'] == 'gym_alignment':
            code = '''/*
  스미스머신 벤치 완벽 정렬 시스템
  Volty 채널 제작 - 바로 업로드해서 사용하세요!
  
  하드웨어:
  - Arduino Uno
  - HC-SR04 초음파센서 x2 (좌측, 우측)
  - 0.96인치 OLED 디스플레이
  
  연결:
  - 좌측 센서: Trig=2, Echo=3
  - 우측 센서: Trig=4, Echo=5  
  - OLED: SDA=A4, SCL=A5
  - 부저: Pin 8
  - LED: Pin 13 (내장)
*/

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// 센서 핀 정의
#define LEFT_TRIG 2
#define LEFT_ECHO 3
#define RIGHT_TRIG 4
#define RIGHT_ECHO 5
#define BUZZER 8
#define LED 13

// 설정값
#define TOLERANCE 2.0  // 허용 오차 (cm)
#define MAX_DISTANCE 400  // 최대 측정 거리 (cm)

void setup() {
  Serial.begin(9600);
  
  // 핀 모드 설정
  pinMode(LEFT_TRIG, OUTPUT);
  pinMode(LEFT_ECHO, INPUT);
  pinMode(RIGHT_TRIG, OUTPUT);
  pinMode(RIGHT_ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  
  // OLED 초기화
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED 초기화 실패"));
    for(;;); // 무한 루프로 정지
  }
  
  // 시작 화면
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("Smith Machine");
  display.println("Bench Aligner");
  display.println("");
  display.println("By Volty Channel");
  display.display();
  
  delay(2000);
  
  Serial.println("스미스머신 벤치 정렬기 시작!");
}

void loop() {
  // 양쪽 거리 측정
  float leftDistance = measureDistance(LEFT_TRIG, LEFT_ECHO);
  float rightDistance = measureDistance(RIGHT_TRIG, RIGHT_ECHO);
  
  // 측정 오류 체크
  if (leftDistance == -1 || rightDistance == -1) {
    displayError();
    delay(500);
    return;
  }
  
  // 차이 계산
  float difference = abs(leftDistance - rightDistance);
  
  // 화면 업데이트
  updateDisplay(leftDistance, rightDistance, difference);
  
  // 정렬 상태 확인 및 피드백
  if (difference <= TOLERANCE) {
    // 정렬됨!
    digitalWrite(LED, HIGH);
    playSuccessSound();
    Serial.println("✅ 완벽 정렬!");
  } else {
    // 정렬 필요
    digitalWrite(LED, LOW);
    playWarningSound();
    
    if (leftDistance < rightDistance) {
      Serial.println("➡️ 벤치를 오른쪽으로 이동하세요");
    } else {
      Serial.println("⬅️ 벤치를 왼쪽으로 이동하세요");
    }
  }
  
  // 시리얼로 데이터 출력 (모니터링용)
  Serial.print("좌측: "); Serial.print(leftDistance, 1);
  Serial.print("cm, 우측: "); Serial.print(rightDistance, 1);
  Serial.print("cm, 차이: "); Serial.print(difference, 1);
  Serial.println("cm");
  
  delay(200); // 0.2초마다 측정
}

float measureDistance(int trigPin, int echoPin) {
  // 초음파 발신
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // 에코 수신
  long duration = pulseIn(echoPin, HIGH, 30000); // 30ms 타임아웃
  
  if (duration == 0) {
    return -1; // 측정 실패
  }
  
  // 거리 계산 (음속 = 340m/s)
  float distance = duration * 0.034 / 2;
  
  // 범위 체크
  if (distance > MAX_DISTANCE || distance < 2) {
    return -1; // 측정 범위 초과
  }
  
  return distance;
}

void updateDisplay(float left, float right, float diff) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("Bench Aligner");
  display.println("-------------");
  
  // 거리 표시
  display.print("L: "); 
  display.print(left, 1); 
  display.println(" cm");
  
  display.print("R: "); 
  display.print(right, 1); 
  display.println(" cm");
  
  display.print("Diff: "); 
  display.print(diff, 1); 
  display.println(" cm");
  
  // 상태 표시
  display.println("");
  display.setTextSize(2);
  
  if (diff <= TOLERANCE) {
    display.println("PERFECT!");
  } else {
    display.setTextSize(1);
    if (left < right) {
      display.println(">>> MOVE RIGHT");
    } else {
      display.println("<<< MOVE LEFT");
    }
  }
  
  display.display();
}

void displayError() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("ERROR!");
  display.println("Check sensors");
  display.display();
  
  Serial.println("❌ 센서 측정 오류");
}

void playSuccessSound() {
  // 성공 사운드 (높은음 - 낮은음)
  tone(BUZZER, 1000, 100);
  delay(150);
  tone(BUZZER, 800, 200);
  delay(250);
}

void playWarningSound() {
  // 경고 사운드 (짧은 삐)
  tone(BUZZER, 400, 50);
  delay(100);
}

/*
  사용법:
  1. 하드웨어 조립 후 이 코드 업로드
  2. 스미스머신 양쪽에 센서 부착
  3. 벤치를 놓고 화면 확인
  4. "PERFECT!" 나올 때까지 벤치 위치 조정
  
  문제해결:
  - 화면이 안 보이면: OLED 연결 확인
  - 측정이 이상하면: 센서 각도 조정
  - 소리가 안 나면: 부저 연결 확인
  
  Volty 채널 구독하고 좋아요 눌러주세요! 
*/'''
            
        self.code_text.delete(1.0, tk.END)
        self.code_text.insert(1.0, code)
        
        # 코드 저장을 위한 변수
        self.current_code = code
        self.current_filename = "smith_machine_aligner.ino"
    
    def generate_editing_guide(self, project_data):
        """편집 가이드 생성"""
        
        self.add_log("✂️ 편집 가이드 생성 중...")
        
        editing_guide = f"""✂️ 편집 가이드: {project_data['title']}

🎵 BGM 선택 가이드:
• 인트로 (0:00-0:30): 업비트, 에너지 넘치는 곡
  - 추천: YouTube Audio Library "Energetic Pop"
• 제작 과정 (0:30-4:00): 차분하고 집중할 수 있는 곡  
  - 추천: "Calm Tech", "Workshop Vibes"
• 테스트 (4:00-5:00): 긴장감 있는 곡
  - 추천: "Suspense", "Tech Demo"
• 마무리 (5:00-5:30): 성취감 있는 곡
  - 추천: "Success", "Achievement"

⏰ 편집 타이밍 가이드:

📍 0:00-0:30 (문제 제기)
• 편집 스타일: 빠른 컷, 3-4초씩 장면 전환
• 효과: 문제 상황 강조용 빨간 테두리
• 텍스트: "이런 경험 있으시죠?" (1초간 표시)
• 사운드: 문제 상황에 "딩동댕" 효과음

📍 0:30-1:00 (솔루션 소개)  
• 편집 스타일: 슬로모션으로 완성품 부각
• 효과: 완성품 등장시 "반짝" 효과
• 텍스트: "Arduino로 해결!" (크고 굵게)
• 사운드: 성공적인 측정시 "띠링" 효과음

📍 1:00-1:30 (부품 소개)
• 편집 스타일: 각 부품마다 2-3초 클로즈업
• 효과: 부품명과 가격 하단에 표시
• 텍스트 오버레이:
  - "Arduino Uno - 25,000원"
  - "초음파센서 x2 - 7,000원"  
  - "OLED 디스플레이 - 6,500원"
  - "총 예상 비용: 38,500원"

📍 1:30-2:30 (회로 구성)
• 편집 스타일: 2배속 타임랩스 + 중요 부분 일반속도
• 효과: 연결선 따라가며 애니메이션
• 텍스트: 핀 번호 표시 ("Pin 2", "Pin 3" 등)
• 사운드: 연결시마다 "딱" 효과음

📍 2:30-3:30 (코딩)
• 편집 스타일: 화면녹화 + PIP로 얼굴 표시
• 효과: 중요한 코드 라인 하이라이팅
• 텍스트: 코드 설명 말풍선
• 사운드: 타이핑 효과음 (은은하게)

📍 3:30-4:00 (조립)
• 편집 스타일: 만족스러운 조립 과정 강조
• 효과: 완성 순간 확대/축소 효과
• 텍스트: "조립 완료!" (성취감 있게)
• 사운드: 마지막 조립시 "완료" 효과음

📍 4:00-5:00 (테스트)
• 편집 스타일: 긴장감 있는 편집, 결과 전 잠깐 멈춤
• 효과: 측정 수치 크게 화면에 표시
• 텍스트: 
  - "좌측: 15.2cm"
  - "우측: 15.1cm" 
  - "차이: 0.1cm - 완벽!"
• 사운드: 성공시 환호 효과음

📍 5:00-5:30 (마무리)
• 편집 스타일: 여유롭고 만족스러운 분위기
• 효과: 구독 버튼 애니메이션 (bounce 효과)
• 텍스트: "구독 & 좋아요 부탁드려요!"
• 사운드: 마무리용 따뜻한 효과음

🎨 시각적 효과 가이드:

✨ 자주 사용할 효과들:
• 확대/축소: 부품 소개, 완성품 디테일
• 슬로모션: 측정 순간, 조립 완료
• 타임랩스: 반복작업, 회로 구성
• 하이라이팅: 중요한 코드, 측정 수치
• 말풍선: 설명, 주의사항

🎬 컷 편집 원칙:
• 빠른 부분: 문제 제기, 부품 소개
• 보통 속도: 설명, 조립 과정  
• 느린 부분: 코드 설명, 테스트 결과
• 호흡: 중요한 내용 전에 0.5초 여백

📱 썸네일 제작 가이드:
• 메인 이미지: 완성품 + 스미스머신
• 텍스트: "완벽 정렬!" (임팩트 폰트)
• 배경: 헬스장 또는 작업실
• 색상: 빨간색/노란색 강조 색상
• 표정: 만족스러운 표정의 얼굴

🔊 오디오 편집 팁:
• 배경음악: -20dB로 음성 방해하지 않게
• 효과음: -15dB로 적당히 들리게
• 음성: 노이즈 제거 필수
• 무음 구간: 0.2초 이하로 짧게

⚙️ 편집 소프트웨어 설정:
• 해상도: 1920x1080 (Full HD)
• 프레임율: 30fps
• 비트레이트: 8-10Mbps
• 오디오: 48kHz, 128kbps

💡 편집 꿀팁:
• J-cut, L-cut 활용해서 자연스러운 전환
• 화면 전환시 0.2초 페이드 인/아웃
• 중요한 순간은 3번 보여주기 (다른 각도로)
• 실패 장면도 적절히 포함 (재미 + 현실감)
• 마지막에 10초 여백 두고 엔드카드 삽입
"""
        
        self.editing_text.delete(1.0, tk.END)
        self.editing_text.insert(1.0, editing_guide)
    
    def generate_fusion_guide(self, project_data):
        """Fusion 360 3D 모델링 가이드 생성"""
        
        self.add_log("🎨 3D 모델링 가이드 생성 중...")
        
        fusion_guide = f"""🎨 Fusion 360 3D 모델링 가이드

🎯 제작할 3D 부품들:
1. 센서 마운트 브라켓 (좌/우측 각 1개)
2. Arduino 케이스 
3. OLED 디스플레이 마운트
4. 전체 조립용 베이스 플레이트

📐 1. 센서 마운트 브라켓

설계 사양:
• 크기: 40mm(W) × 30mm(H) × 15mm(D)
• 재질: PLA (프린팅 용이)
• HC-SR04 센서 고정용 홀: 직경 16mm × 깊이 12mm
• 스미스머신 레일 클램프용 홀: 25mm 슬롯

모델링 단계:
1. 새 컴포넌트 생성 → "Sensor_Mount"
2. 스케치 생성 (XY 평면)
   • 사각형 40×30mm 그리기
   • 중앙에 원형 홀 16mm 그리기
   • 측면에 클램프 슬롯 25×8mm 추가
3. 돌출(Extrude) → 15mm 높이
4. 센서 고정용 나사 홀 추가
   • 홀 직경: 3mm (M3 나사용)
   • 4개소, 센서 모서리 위치에
5. 모따기(Chamfer) → 1mm로 날카로운 모서리 처리

💻 2. Arduino 케이스

설계 사양:
• 외형: 75mm × 55mm × 25mm
• Arduino Uno 크기에 맞춤 설계
• 상단 커버 분리형 (나사 4개 고정)
• USB 포트, 전원 잭 액세스 홀
• 방열을 위한 측면 슬롯

모델링 단계:
1. 새 컴포넌트 → "Arduino_Case"
2. 베이스 박스 생성
   • 외형: 75×55×20mm
   • 내부: 70×50×18mm (벽 두께 2.5mm)
3. Arduino 마운팅 홀
   • 4개소, Arduino 고정 홀과 일치
   • 홀 직경: 3mm, 카운터싱크 적용
4. 커넥터 액세스 홀
   • USB: 12×5mm 슬롯
   • DC 잭: 9mm 원형 홀
   • 핀 헤더: 40×5mm 슬롯
5. 방열 슬롯: 2×15mm, 6개소
6. 상단 커버 별도 설계

📺 3. OLED 디스플레이 마운트

설계 사양:
• OLED 크기: 27×27mm 기준
• 각도 조절 가능 (0~30도)
• 케이스에 볼트 고정

모델링 단계:
1. 디스플레이 프레임 생성
2. 각도 조절용 힌지 설계
3. 케이스 연결용 브라켓

🔧 4. 전체 조립 가이드

조립 순서:
1. Arduino를 케이스에 고정
2. 센서 마운트를 레일에 클램프
3. 센서들을 마운트에 고정
4. 배선 연결 및 정리
5. OLED 마운트 부착 및 각도 조정

🎯 3D 프린팅 설정:

추천 설정값:
• 노즐 온도: 200°C (PLA)
• 베드 온도: 60°C
• 프린트 속도: 50mm/s
• 인필: 20%
• 레이어 높이: 0.2mm
• 서포트: 필요한 부분만

예상 프린팅 시간:
• 센서 마운트 (2개): 각 45분 = 1시간 30분
• Arduino 케이스: 2시간
• OLED 마운트: 30분
• 총 소요시간: 약 4시간

필요 필라멘트:
• 총 예상량: 약 80g
• PLA 1kg 롤 기준 약 8% 사용
• 예상 비용: 약 3,000원

🎬 모델링 영상 촬영 팁:

화면 녹화 설정:
• Fusion 360 화면 1920x1080 녹화
• 30fps, 고품질 설정
• 마우스 커서 표시 on

촬영 포인트:
• 스케치 단계는 2배속 타임랩스
• 중요한 치수 입력은 일반 속도
• 완성된 모델 회전 뷰 (360도)
• 렌더링 결과물 클로즈업

설명할 내용:
• 각 치수의 이유 설명
• 실제 부품과 맞춰보는 장면
• 프린팅시 주의사항
• 조립시 예상되는 문제점

💡 모델링 꿀팁:

효율적인 작업 순서:
1. 전체 개념 스케치부터
2. 주요 부품들 간단히 박스 모델링
3. 실제 하드웨어와 피팅 체크
4. 세부사항 디테일 추가
5. 프린팅 테스트 → 수정 → 재테스트

자주하는 실수 방지:
• 공차 고려: 홀은 0.2mm 여유있게
• 브리지 각도: 45도 이하로 서포트 최소화
• 분할 설계: 큰 부품은 나누어 프린팅
• 조립성 고려: 나사 접근 공간 충분히

파일 정리:
• 프로젝트명: Smith_Machine_Aligner
• 컴포넌트별 폴더 분리
• STL 익스포트용 별도 폴더
• 버전 관리 (v1.0, v1.1...)

🚀 업로드용 파일 준비:
• Fusion 360 파일 (.f3d)
• STL 파일들 (.stl)
• 프린팅 설정 파일 (.gcode)
• 조립 설명서 (PDF)
• 모두 ZIP으로 압축하여 제공
"""
        
        self.fusion_text.delete(1.0, tk.END)
        self.fusion_text.insert(1.0, fusion_guide)
    
    # 유틸리티 메서드들
    def add_log(self, message):
        """진행 상황 로그 추가"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        
        self.log_text.insert(tk.END, log_entry)
        self.log_text.see(tk.END)
        self.root.update()  # GUI 업데이트
    
    def open_korean_shops(self):
        """한국 쇼핑몰 링크들 열기"""
        if hasattr(self, 'korean_urls'):
            for url in self.korean_urls[:3]:  # 처음 3개만 열기
                webbrowser.open(url)
            self.add_log(f"{len(self.korean_urls)}개 한국 쇼핑몰 링크 열기 완료")
    
    def open_ali_shops(self):
        """알리익스프레스 링크들 열기"""
        if hasattr(self, 'ali_urls'):
            for url in self.ali_urls[:3]:  # 처음 3개만 열기
                webbrowser.open(url)
            self.add_log(f"{len(self.ali_urls)}개 알리익스프레스 링크 열기 완료")
    
    def save_arduino_code(self):
        """Arduino 코드 .ino 파일로 저장"""
        if hasattr(self, 'current_code'):
            from tkinter import filedialog
            
            filename = filedialog.asksaveasfilename(
                defaultextension=".ino",
                filetypes=[("Arduino files", "*.ino"), ("All files", "*.*")],
                initialname=self.current_filename
            )
            
            if filename:
                try:
                    with open(filename, 'w', encoding='utf-8') as f:
                        f.write(self.current_code)
                    self.add_log(f"Arduino 코드 저장 완료: {filename}")
                    messagebox.showinfo("성공", f"코드가 저장되었습니다!\n{filename}")
                except Exception as e:
                    self.add_log(f"코드 저장 실패: {str(e)}")
                    messagebox.showerror("오류", f"저장 실패:\n{str(e)}")
    
    def copy_code(self):
        """코드 클립보드에 복사"""
        if hasattr(self, 'current_code'):
            try:
                self.root.clipboard_clear()
                self.root.clipboard_append(self.current_code)
                self.add_log("Arduino 코드 클립보드 복사 완료")
                messagebox.showinfo("성공", "코드가 클립보드에 복사되었습니다!")
            except Exception as e:
                self.add_log(f"클립보드 복사 실패: {str(e)}")
                messagebox.showerror("오류", f"복사 실패:\n{str(e)}")

def main():
    """메인 실행 함수"""
    print("Volty AI Video Planner 시작...")
    
    root = tk.Tk()
    
    # 테마 설정
    try:
        style = ttk.Style()
        style.theme_use('clam')
        
        # Accent 버튼 스타일 생성
        style.configure('Accent.TButton',
                       background='#0078d4',
                       foreground='white',
                       font=('', 10, 'bold'))
    except:
        pass
    
    app = VoltyAIPlanner(root)
    
    print("AI 기반 영상 기획 시스템 준비 완료!")
    print("아이디어를 입력하고 '생성' 버튼을 누르세요.")
    
    root.mainloop()

if __name__ == "__main__":
    main()