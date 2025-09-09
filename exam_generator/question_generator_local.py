"""
문제 생성 엔진 - 로컬 LLM 버전
Hugging Face의 무료 모델을 사용하여 문제 생성
"""

import json
from typing import Dict, List, Literal
from dataclasses import dataclass, asdict
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


@dataclass
class Question:
    """문제 데이터 클래스"""
    question: str
    options: List[str]
    answer: int
    explanation: str
    difficulty: Literal["상", "중", "하"]
    question_type: str
    
    def to_dict(self) -> Dict:
        """딕셔너리로 변환"""
        return asdict(self)


class LocalQuestionGenerator:
    """로컬 LLM을 사용한 문제 생성 클래스"""
    
    QUESTION_TYPES = {
        "정의형": "핵심 개념이나 용어의 정의를 묻는 문제",
        "특징형": "특정 주제나 개념의 특징을 묻는 문제",
        "비교형": "두 개 이상의 개념을 비교하는 문제",
        "적용형": "이론을 실제 상황에 적용하는 문제"
    }
    
    def __init__(self, model_name: str = "beomi/KoAlpaca-Polyglot-5.8B"):
        """
        초기화
        Args:
            model_name: Hugging Face 모델 이름
        """
        print(f"모델 로딩 중: {model_name}")
        print("첫 실행시 모델 다운로드로 시간이 걸릴 수 있습니다 (약 10GB)")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        # 패딩 토큰 설정
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
    
    def create_prompt(self, content: str, question_type: str, difficulty: str) -> str:
        """문제 생성을 위한 프롬프트 생성"""
        prompt = f"""### 지시사항:
당신은 한국 국가공인자격증 시험 문제 출제 전문가입니다.
다음 내용을 바탕으로 {question_type} 유형의 4지선다형 객관식 문제를 1개 생성해주세요.

난이도: {difficulty}
- 상: 심화 개념, 복잡한 적용
- 중: 기본 개념의 이해
- 하: 단순 암기, 기초

### 내용:
{content[:1000]}

### 형식:
문제: [문제 내용]
1) [선택지1]
2) [선택지2]
3) [선택지3]
4) [선택지4]
정답: [번호]
해설: [설명]

### 응답:
"""
        return prompt
    
    def parse_response(self, response: str, question_type: str, difficulty: str) -> Question:
        """모델 응답을 Question 객체로 파싱"""
        try:
            lines = response.strip().split('\n')
            
            # 문제 추출
            question = ""
            options = []
            answer = 0
            explanation = ""
            
            for line in lines:
                line = line.strip()
                if line.startswith("문제:"):
                    question = line.replace("문제:", "").strip()
                elif line.startswith(("1)", "2)", "3)", "4)")):
                    option_text = line[2:].strip()
                    options.append(option_text)
                elif line.startswith("정답:"):
                    answer_text = line.replace("정답:", "").strip()
                    # 숫자 추출
                    for char in answer_text:
                        if char.isdigit():
                            answer = int(char) - 1
                            break
                elif line.startswith("해설:"):
                    explanation = line.replace("해설:", "").strip()
            
            # 기본값 설정
            if not question:
                question = "문제를 생성할 수 없습니다."
            if len(options) < 4:
                options = ["선택지1", "선택지2", "선택지3", "선택지4"]
            if not explanation:
                explanation = "해설이 제공되지 않았습니다."
            
            return Question(
                question=question,
                options=options[:4],
                answer=min(answer, 3),
                explanation=explanation,
                difficulty=difficulty,
                question_type=question_type
            )
            
        except Exception as e:
            # 파싱 실패시 기본값 반환
            return Question(
                question="문제 생성에 실패했습니다.",
                options=["선택지1", "선택지2", "선택지3", "선택지4"],
                answer=0,
                explanation="해설을 생성할 수 없습니다.",
                difficulty=difficulty,
                question_type=question_type
            )
    
    def generate_questions(
        self,
        content: str,
        question_type: str = "정의형",
        difficulty: str = "중",
        num_questions: int = 5
    ) -> List[Question]:
        """
        문제 생성
        Args:
            content: 문제 생성의 기반이 될 텍스트
            question_type: 문제 유형
            difficulty: 난이도 (상/중/하)
            num_questions: 생성할 문제 수
        Returns:
            생성된 문제 리스트
        """
        if question_type not in self.QUESTION_TYPES:
            raise ValueError(f"지원하지 않는 문제 유형: {question_type}")
        
        if difficulty not in ["상", "중", "하"]:
            raise ValueError(f"난이도는 '상', '중', '하' 중 하나여야 합니다: {difficulty}")
        
        questions = []
        
        for i in range(num_questions):
            print(f"문제 {i+1}/{num_questions} 생성 중...")
            
            # 프롬프트 생성
            prompt = self.create_prompt(content, question_type, difficulty)
            
            # 토크나이징
            inputs = self.tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024)
            
            # 생성
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs.input_ids,
                    max_new_tokens=300,
                    temperature=0.7,
                    do_sample=True,
                    top_p=0.9,
                    pad_token_id=self.tokenizer.pad_token_id
                )
            
            # 디코딩
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # 프롬프트 제거
            if prompt in response:
                response = response.replace(prompt, "").strip()
            
            # 파싱
            question = self.parse_response(response, question_type, difficulty)
            questions.append(question)
        
        return questions
    
    def generate_mixed_questions(
        self,
        content: str,
        num_questions_per_type: int = 2,
        difficulty: str = "중"
    ) -> List[Question]:
        """여러 유형의 문제를 혼합하여 생성"""
        all_questions = []
        
        for question_type in self.QUESTION_TYPES.keys():
            try:
                questions = self.generate_questions(
                    content=content,
                    question_type=question_type,
                    difficulty=difficulty,
                    num_questions=num_questions_per_type
                )
                all_questions.extend(questions)
            except Exception as e:
                print(f"{question_type} 문제 생성 실패: {str(e)}")
        
        return all_questions


# 간단한 규칙 기반 생성기 (모델 없이 사용 가능)
class SimpleQuestionGenerator:
    """규칙 기반 간단한 문제 생성기 (모델 불필요)"""
    
    def __init__(self):
        self.templates = {
            "정의형": [
                "{keyword}의 정의로 가장 적절한 것은?",
                "{keyword}란 무엇인가?",
                "다음 중 {keyword}에 대한 설명으로 옳은 것은?"
            ],
            "특징형": [
                "{keyword}의 특징으로 옳지 않은 것은?",
                "{keyword}의 주요 특징은?",
                "다음 중 {keyword}의 특성에 해당하는 것은?"
            ],
            "비교형": [
                "{keyword1}와 {keyword2}의 차이점은?",
                "{keyword1}과 {keyword2}를 비교한 설명으로 옳은 것은?",
                "다음 중 {keyword1}와 {keyword2}의 공통점은?"
            ],
            "적용형": [
                "{keyword}를 실제로 적용한 사례로 적절한 것은?",
                "{keyword}의 활용 방법으로 옳은 것은?",
                "다음 상황에서 {keyword}를 적용하는 방법은?"
            ]
        }
    
    def extract_keywords(self, text: str) -> List[str]:
        """텍스트에서 키워드 추출 (간단한 방법)"""
        # 명사 추출 (간단한 휴리스틱)
        keywords = []
        sentences = text.split('.')
        
        for sentence in sentences[:5]:  # 처음 5문장
            words = sentence.split()
            for word in words:
                if len(word) > 3 and word[0].isupper():
                    keywords.append(word)
        
        # 중복 제거
        return list(set(keywords))[:10]
    
    def generate_simple_question(
        self,
        content: str,
        question_type: str = "정의형",
        difficulty: str = "중"
    ) -> Question:
        """간단한 규칙 기반 문제 생성"""
        
        # 키워드 추출
        keywords = self.extract_keywords(content)
        if not keywords:
            keywords = ["개념", "이론", "방법"]
        
        # 템플릿 선택
        templates = self.templates.get(question_type, self.templates["정의형"])
        template = templates[0]
        
        # 문제 생성
        if "{keyword1}" in template:
            keyword1 = keywords[0] if len(keywords) > 0 else "개념A"
            keyword2 = keywords[1] if len(keywords) > 1 else "개념B"
            question = template.format(keyword1=keyword1, keyword2=keyword2)
        else:
            keyword = keywords[0] if keywords else "개념"
            question = template.format(keyword=keyword)
        
        # 선택지 생성 (간단한 예시)
        options = [
            f"{keywords[0] if keywords else '개념'}에 대한 정답 설명",
            "관련 없는 내용 1",
            "관련 없는 내용 2",
            "관련 없는 내용 3"
        ]
        
        return Question(
            question=question,
            options=options,
            answer=0,
            explanation="첫 번째 선택지가 정답입니다.",
            difficulty=difficulty,
            question_type=question_type
        )
    
    def generate_questions(
        self,
        content: str,
        question_type: str = "정의형",
        difficulty: str = "중",
        num_questions: int = 5
    ) -> List[Question]:
        """여러 문제 생성"""
        questions = []
        for i in range(num_questions):
            q = self.generate_simple_question(content, question_type, difficulty)
            questions.append(q)
        return questions