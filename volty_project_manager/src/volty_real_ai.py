"""
Volty Real AI Video Planner - Claude API 실제 연동 버전
진짜 AI가 아이디어를 분석하고 맞춤형 솔루션을 생성합니다.
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import requests
import json
import threading
from datetime import datetime
import os

class VoltyRealAI:
    def __init__(self, root):
        self.root = root
        self.root.title("Volty Real AI Planner - Claude API 연동 버전")
        self.root.geometry("1400x900")
        
        # Claude API 설정
        self.api_key = None
        self.api_base_url = "https://api.anthropic.com/v1/messages"
        
        # 실제 부품 데이터베이스
        self.init_parts_database()
        
        # GUI 설정
        self.setup_gui()
        
        self.add_log("🤖 Volty Real AI Planner 시작!")
        self.add_log("⚠️ Claude API 키가 필요합니다. 설정에서 입력해주세요.")
    
    def init_parts_database(self):
        """실제 부품 가격 데이터베이스"""
        self.parts_db = {
            "arduino_uno": {"name": "Arduino Uno R3", "price_kr": 25000, "price_ali": 8000},
            "arduino_nano": {"name": "Arduino Nano", "price_kr": 18000, "price_ali": 3500},
            "hc_sr04": {"name": "HC-SR04 초음파센서", "price_kr": 3500, "price_ali": 1200},
            "mpu6050": {"name": "MPU6050 자이로센서", "price_kr": 4500, "price_ali": 1800},
            "oled_display": {"name": "0.96인치 OLED", "price_kr": 6500, "price_ali": 2800},
            "servo_sg90": {"name": "SG90 서보모터", "price_kr": 3000, "price_ali": 1500},
            "load_cell": {"name": "로드셀 + HX711", "price_kr": 12000, "price_ali": 4500},
            "pressure_sensor": {"name": "압력센서 FSR402", "price_kr": 2500, "price_ali": 1000},
            "led_strip": {"name": "WS2812B LED 스트립", "price_kr": 8000, "price_ali": 3200},
            "buzzer": {"name": "피에조 부저", "price_kr": 1500, "price_ali": 500}
        }
    
    def setup_gui(self):
        """실제 AI GUI 설정"""
        
        # 상단 API 설정
        api_frame = ttk.Frame(self.root)
        api_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(api_frame, text="🔑 Claude API Key:").pack(side=tk.LEFT)
        
        self.api_key_var = tk.StringVar()
        self.api_entry = ttk.Entry(api_frame, textvariable=self.api_key_var, 
                                  show="*", width=50)
        self.api_entry.pack(side=tk.LEFT, padx=(10, 0))
        
        ttk.Button(api_frame, text="저장", 
                  command=self.save_api_key).pack(side=tk.LEFT, padx=(10, 0))
        
        self.api_status = ttk.Label(api_frame, text="❌ API 키 없음", foreground='red')
        self.api_status.pack(side=tk.LEFT, padx=(10, 0))
        
        # 메인 프레임
        main_paned = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        main_paned.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 왼쪽: 입력
        left_frame = ttk.Frame(main_paned)
        main_paned.add(left_frame, weight=1)
        
        # 오른쪽: 결과
        right_frame = ttk.Frame(main_paned)
        main_paned.add(right_frame, weight=2)
        
        self.setup_input_panel(left_frame)
        self.setup_output_panel(right_frame)
    
    def setup_input_panel(self, parent):
        """아이디어 입력 패널"""
        
        # 아이디어 입력
        idea_frame = ttk.LabelFrame(parent, text="💡 실제 아이디어 입력", padding=10)
        idea_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(idea_frame, text="어떤 문제를 해결하고 싶으신가요?").pack(anchor=tk.W)
        
        self.idea_text = scrolledtext.ScrolledText(idea_frame, height=4, wrap=tk.WORD)
        self.idea_text.pack(fill=tk.X, pady=5)
        self.idea_text.insert(1.0, "예: 헬스장에서 물병이 자꾸 굴러다녀서 운동에 방해가 돼요")
        
        # AI 분석 설정
        analysis_frame = ttk.LabelFrame(parent, text="🤖 AI 분석 설정", padding=10)
        analysis_frame.pack(fill=tk.X, pady=5)
        
        # 분석 깊이
        depth_row = ttk.Frame(analysis_frame)
        depth_row.pack(fill=tk.X, pady=2)
        
        ttk.Label(depth_row, text="분석 깊이:").pack(side=tk.LEFT)
        self.analysis_depth = ttk.Combobox(depth_row, 
                                          values=["빠른 분석", "표준 분석", "심층 분석"],
                                          state='readonly', width=15)
        self.analysis_depth.pack(side=tk.LEFT, padx=(10, 0))
        self.analysis_depth.set("표준 분석")
        
        # 타겟 시청자
        audience_row = ttk.Frame(analysis_frame)
        audience_row.pack(fill=tk.X, pady=2)
        
        ttk.Label(audience_row, text="타겟 시청자:").pack(side=tk.LEFT)
        self.target_audience = ttk.Combobox(audience_row,
                                           values=["Arduino 초보자", "DIY 애호가", "헬스장 이용자", "일반인"],
                                           state='readonly', width=15)
        self.target_audience.pack(side=tk.LEFT, padx=(10, 0))
        self.target_audience.set("Arduino 초보자")
        
        # 실제 AI 분석 버튼
        generate_frame = ttk.Frame(parent)
        generate_frame.pack(fill=tk.X, pady=10)
        
        self.ai_analyze_btn = ttk.Button(generate_frame, 
                                        text="🧠 Claude AI로 실제 분석 시작", 
                                        command=self.start_real_ai_analysis,
                                        style='Accent.TButton')
        self.ai_analyze_btn.pack(fill=tk.X)
        
        # 분석 진행 상황
        progress_frame = ttk.LabelFrame(parent, text="🔄 AI 분석 진행상황", padding=10)
        progress_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.progress_text = scrolledtext.ScrolledText(progress_frame, height=12, wrap=tk.WORD)
        self.progress_text.pack(fill=tk.BOTH, expand=True)
    
    def setup_output_panel(self, parent):
        """AI 분석 결과 패널"""
        
        self.result_notebook = ttk.Notebook(parent)
        self.result_notebook.pack(fill=tk.BOTH, expand=True)
        
        # AI 분석 결과 탭들
        self.analysis_frame = ttk.Frame(self.result_notebook)
        self.solution_frame = ttk.Frame(self.result_notebook)
        self.technical_frame = ttk.Frame(self.result_notebook)
        self.video_frame = ttk.Frame(self.result_notebook)
        self.parts_frame = ttk.Frame(self.result_notebook)
        self.code_frame = ttk.Frame(self.result_notebook)
        
        self.result_notebook.add(self.analysis_frame, text="🔍 AI 분석")
        self.result_notebook.add(self.solution_frame, text="💡 솔루션")  
        self.result_notebook.add(self.technical_frame, text="🔧 기술구현")
        self.result_notebook.add(self.video_frame, text="🎬 영상기획")
        self.result_notebook.add(self.parts_frame, text="🛒 부품목록")
        self.result_notebook.add(self.code_frame, text="💻 생성코드")
        
        # 각 탭 내용 설정
        self.setup_result_tabs()
    
    def setup_result_tabs(self):
        """결과 탭들 설정"""
        
        # AI 분석 탭
        self.analysis_text = scrolledtext.ScrolledText(self.analysis_frame, wrap=tk.WORD)
        self.analysis_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 솔루션 탭
        self.solution_text = scrolledtext.ScrolledText(self.solution_frame, wrap=tk.WORD)
        self.solution_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 기술구현 탭
        self.technical_text = scrolledtext.ScrolledText(self.technical_frame, wrap=tk.WORD)
        self.technical_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 영상기획 탭
        self.video_text = scrolledtext.ScrolledText(self.video_frame, wrap=tk.WORD)
        self.video_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 부품목록 탭
        parts_container = ttk.Frame(self.parts_frame)
        parts_container.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.parts_text = scrolledtext.ScrolledText(parts_container, wrap=tk.WORD)
        self.parts_text.pack(fill=tk.BOTH, expand=True)
        
        # 생성코드 탭
        code_container = ttk.Frame(self.code_frame)
        code_container.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.code_text = scrolledtext.ScrolledText(code_container, wrap=tk.WORD, 
                                                  font=('Consolas', 10))
        self.code_text.pack(fill=tk.BOTH, expand=True)
        
        code_btn_frame = ttk.Frame(code_container)
        code_btn_frame.pack(fill=tk.X, pady=5)
        
        ttk.Button(code_btn_frame, text="💾 .ino 파일로 저장", 
                  command=self.save_generated_code).pack(side=tk.LEFT, padx=5)
    
    def save_api_key(self):
        """API 키 저장"""
        key = self.api_key_var.get().strip()
        if key:
            self.api_key = key
            self.api_status.config(text="✅ API 키 설정됨", foreground='green')
            self.add_log("🔑 Claude API 키가 설정되었습니다.")
            
            # 간단한 연결 테스트
            self.test_api_connection()
        else:
            messagebox.showwarning("경고", "API 키를 입력해주세요.")
    
    def test_api_connection(self):
        """API 연결 테스트"""
        if not self.api_key:
            return
        
        self.add_log("🧪 API 연결 테스트 중...")
        
        def test():
            try:
                headers = {
                    'x-api-key': self.api_key,
                    'content-type': 'application/json',
                    'anthropic-version': '2023-06-01'
                }
                
                data = {
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 100,
                    "messages": [
                        {"role": "user", "content": "Hello, can you respond with 'API connection successful'?"}
                    ]
                }
                
                self.add_log(f"🔍 API 키 길이: {len(self.api_key)} 문자")
                self.add_log(f"🔍 API 키 시작: {self.api_key[:10]}...")
                
                response = requests.post(self.api_base_url, headers=headers, 
                                       json=data, timeout=10)
                
                self.add_log(f"🔍 응답 상태코드: {response.status_code}")
                
                if response.status_code == 200:
                    self.add_log("✅ Claude API 연결 성공!")
                    self.ai_analyze_btn.config(state='normal')
                else:
                    self.add_log(f"❌ API 연결 실패: {response.status_code}")
                    try:
                        error_detail = response.json()
                        self.add_log(f"❌ 오류 상세: {error_detail}")
                    except:
                        self.add_log(f"❌ 응답 텍스트: {response.text}")
                    self.api_status.config(text="❌ API 키 오류", foreground='red')
                    
            except Exception as e:
                self.add_log(f"❌ API 테스트 오류: {str(e)}")
                self.api_status.config(text="❌ 연결 실패", foreground='red')
        
        threading.Thread(target=test, daemon=True).start()
    
    def start_real_ai_analysis(self):
        """실제 Claude AI 분석 시작"""
        
        if not self.api_key:
            messagebox.showwarning("경고", "Claude API 키를 먼저 설정해주세요.")
            return
        
        user_idea = self.idea_text.get(1.0, tk.END).strip()
        if not user_idea or "예:" in user_idea:
            messagebox.showwarning("경고", "실제 아이디어를 입력해주세요.")
            return
        
        self.ai_analyze_btn.config(state='disabled', text='🧠 AI 분석 중...')
        self.add_log("🤖 Claude AI 분석 시작...")
        
        # 백그라운드에서 AI 분석 실행
        threading.Thread(target=self.run_ai_analysis, args=(user_idea,), daemon=True).start()
    
    def run_ai_analysis(self, user_idea):
        """실제 AI 분석 실행"""
        
        try:
            # 1단계: 문제 분석
            self.add_log("🔍 1단계: 문제 상황 분석 중...")
            analysis_result = self.call_claude_api(self.create_analysis_prompt(user_idea))
            
            if analysis_result:
                self.update_tab(self.analysis_text, analysis_result)
                self.add_log("✅ 문제 분석 완료")
            
            # 2단계: 솔루션 생성
            self.add_log("💡 2단계: 맞춤형 솔루션 생성 중...")
            solution_result = self.call_claude_api(self.create_solution_prompt(user_idea, analysis_result))
            
            if solution_result:
                self.update_tab(self.solution_text, solution_result)
                self.add_log("✅ 솔루션 생성 완료")
            
            # 3단계: 기술구현 방안
            self.add_log("🔧 3단계: 기술구현 방안 생성 중...")
            technical_result = self.call_claude_api(self.create_technical_prompt(user_idea, solution_result))
            
            if technical_result:
                self.update_tab(self.technical_text, technical_result)
                self.add_log("✅ 기술구현 방안 완료")
            
            # 4단계: 영상 기획
            self.add_log("🎬 4단계: 영상 제작 기획 중...")
            video_result = self.call_claude_api(self.create_video_prompt(user_idea, solution_result))
            
            if video_result:
                self.update_tab(self.video_text, video_result)
                self.add_log("✅ 영상 기획 완료")
            
            # 5단계: 부품 목록 및 코드 생성
            self.add_log("🛒 5단계: 부품 목록 및 코드 생성 중...")
            parts_and_code = self.call_claude_api(self.create_parts_code_prompt(user_idea, technical_result))
            
            if parts_and_code:
                # 부품과 코드 분리
                self.process_parts_and_code(parts_and_code)
                self.add_log("✅ 부품 목록 및 코드 생성 완료")
            
            self.add_log("🎉 모든 AI 분석 완료! 각 탭에서 결과를 확인하세요.")
            
        except Exception as e:
            self.add_log(f"❌ AI 분석 중 오류: {str(e)}")
        
        finally:
            self.ai_analyze_btn.config(state='normal', text='🧠 Claude AI로 실제 분석 시작')
    
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
            
            response = requests.post(self.api_base_url, headers=headers, 
                                   json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return result['content'][0]['text']
            else:
                self.add_log(f"❌ API 호출 실패: {response.status_code}")
                return None
                
        except Exception as e:
            self.add_log(f"❌ API 호출 오류: {str(e)}")
            return None
    
    def create_analysis_prompt(self, user_idea):
        """문제 분석 프롬프트 생성"""
        return f"""
사용자가 다음과 같은 문제를 제시했습니다:
"{user_idea}"

이 문제를 자세히 분석해주세요:

1. 문제의 핵심은 무엇인가요?
2. 이 문제가 발생하는 상황과 맥락을 설명해주세요
3. 현재 사람들이 이 문제를 어떻게 해결하고 있나요?
4. 기존 해결방법의 한계는 무엇인가요?
5. 이 문제를 해결하면 어떤 이점이 있을까요?
6. 유사한 문제들이나 연관된 불편함들이 있나요?

YouTube 영상으로 만들 가치가 있는 실용적인 관점에서 분석해주세요.
"""
    
    def create_solution_prompt(self, user_idea, analysis):
        """솔루션 생성 프롬프트"""
        return f"""
사용자 문제: "{user_idea}"
분석 결과: {analysis[:500]}...

Arduino를 활용한 창의적이고 실용적인 해결방안을 제시해주세요:

1. 메인 솔루션: 어떤 장치/시스템을 만들 것인가?
2. 핵심 기능: 정확히 어떻게 문제를 해결하는가?
3. 사용자 경험: 실제로 어떻게 사용하게 되는가?
4. 차별화 포인트: 기존 방법과 비교해 어떤 장점이 있는가?
5. 추가 기능: 기본 기능 외에 더할 수 있는 기능들
6. 실용성 평가: 실제로 사용할 가치가 있는가?

헬스장이나 운동 상황에 특화된 아이디어라면 그 환경을 고려해주세요.
YouTube 시청자들이 "오, 이거 만들어서 써보고 싶다"라고 생각할 만한 솔루션을 제안해주세요.
"""
    
    def create_technical_prompt(self, user_idea, solution):
        """기술구현 프롬프트"""
        return f"""
문제: "{user_idea}"
솔루션: {solution[:300]}...

이 솔루션을 Arduino로 실제 구현하기 위한 기술적 방안을 제시해주세요:

1. 필요한 센서들: 어떤 센서가 필요하고 왜 필요한가?
2. 액추에이터: 어떤 출력 장치들이 필요한가? (LED, 부저, 모터 등)
3. 메인 보드: Arduino Uno로 충분한가? 다른 보드가 필요한가?
4. 핵심 알고리즘: 어떤 로직으로 동작하게 할 것인가?
5. 데이터 처리: 센서 데이터를 어떻게 처리하고 판단할 것인가?
6. 사용자 인터페이스: 어떻게 정보를 표시하고 조작하게 할 것인가?
7. 전원 공급: 배터리인가? USB인가? 어떻게 전원을 공급할 것인가?
8. 케이스/마운팅: 어떻게 고정하고 보호할 것인가?
9. 구현 난이도: 초보자가 따라할 수 있는 수준인가?
10. 예상 문제점: 구현 중 발생할 수 있는 기술적 문제들

실제로 만들 수 있고, YouTube 시청자가 따라 할 수 있는 현실적인 구현 방안을 제시해주세요.
"""
    
    def create_video_prompt(self, user_idea, solution):
        """영상 기획 프롬프트"""
        return f"""
프로젝트: "{user_idea}"를 해결하는 {solution[:100]}... 

이 프로젝트로 YouTube 영상을 만든다면 어떻게 기획할지 상세한 시나리오를 작성해주세요:

1. 영상 길이: 몇 분이 적절할까요?
2. 타겟 시청자: 누구를 대상으로 하나요?
3. 후킹 전략: 첫 30초에 어떻게 시청자를 끌어들일까요?

시간대별 상세 시나리오:
- 0:00-0:30: 오프닝 (문제 제기, 후킹)
- 0:30-1:00: 솔루션 소개
- 1:00-2:00: 부품 소개
- 2:00-4:00: 제작 과정
- 4:00-5:00: 테스트 및 결과
- 5:00-5:30: 마무리

각 구간별로:
- 어떤 내용을 다룰지
- 어떻게 촬영할지 (각도, 연출)
- 어떤 점을 강조할지
- 시청자의 흥미를 어떻게 유지할지

촬영팁:
- 어떤 장면들을 미리 촬영해둘지
- 어떤 각도에서 촬영하면 좋을지
- 어떤 순간을 슬로우모션으로 보여줄지

편집 가이드:
- BGM은 어떤 느낌으로?
- 자막/텍스트는 언제 넣을지
- 효과음은 어디에?

실제 조회수 10만+ 받을 수 있는 수준의 기획을 해주세요.
"""
    
    def create_parts_code_prompt(self, user_idea, technical_plan):
        """부품 목록 및 코드 생성 프롬프트"""
        return f"""
프로젝트: "{user_idea}"
기술 구현: {technical_plan[:400]}...

다음 두 가지를 생성해주세요:

=== 부품 목록 ===
실제로 구매 가능한 부품들의 정확한 목록:
1. 메인보드: (Arduino Uno 등)
2. 센서류: (정확한 모델명)
3. 출력장치: (LED, 부저, 디스플레이 등)
4. 기타 부품: (저항, 케이블, 브레드보드 등)
5. 총 예상 비용: (한국 구매 기준)

=== Arduino 코드 ===
실제로 업로드해서 바로 사용 가능한 완전한 .ino 코드:

```cpp
/*
 * 프로젝트명: [프로젝트 이름]
 * 설명: [간단한 설명]
 * 
 * 필요한 라이브러리:
 * - [라이브러리1]
 * - [라이브러리2]
 * 
 * 하드웨어 연결:
 * - [핀 연결 정보]
 */

// 실제 동작하는 완전한 코드 작성
// 주석을 자세히 달아서 이해하기 쉽게
// 에러 처리도 포함
// 시리얼 모니터 출력도 포함

```

코드는 반드시 실제로 컴파일되고 동작하는 수준으로 작성해주세요.
초보자도 이해할 수 있도록 주석을 상세히 달아주세요.
"""
    
    def process_parts_and_code(self, parts_and_code_result):
        """부품 목록과 코드 분리 처리"""
        
        # 부품 목록과 코드를 분리
        if "=== Arduino 코드 ===" in parts_and_code_result:
            parts_section = parts_and_code_result.split("=== Arduino 코드 ===")[0]
            code_section = parts_and_code_result.split("=== Arduino 코드 ===")[1]
            
            # 부품 목록 업데이트
            self.update_tab(self.parts_text, parts_section)
            
            # 코드 추출 및 업데이트
            if "```cpp" in code_section:
                code_start = code_section.find("```cpp") + 6
                code_end = code_section.find("```", code_start)
                if code_end > code_start:
                    actual_code = code_section[code_start:code_end].strip()
                    self.update_tab(self.code_text, actual_code)
                    self.generated_code = actual_code
        else:
            self.update_tab(self.parts_text, parts_and_code_result)
    
    def update_tab(self, text_widget, content):
        """탭 내용 업데이트"""
        text_widget.delete(1.0, tk.END)
        text_widget.insert(1.0, content)
    
    def save_generated_code(self):
        """생성된 코드 저장"""
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
                    messagebox.showerror("오류", f"저장 실패:\n{str(e)}")
    
    def add_log(self, message):
        """로그 추가"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        
        self.progress_text.insert(tk.END, log_entry)
        self.progress_text.see(tk.END)
        self.root.update()

def main():
    """메인 실행"""
    print("=== Volty Real AI Planner ===")
    print("Claude API를 활용한 실제 AI 분석 시스템")
    
    root = tk.Tk()
    
    # 스타일 설정
    try:
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('Accent.TButton', foreground='white', background='#0078d4')
    except:
        pass
    
    app = VoltyRealAI(root)
    
    print("실행 완료! Claude API 키를 입력하고 테스트해보세요.")
    root.mainloop()

if __name__ == "__main__":
    main()