"""
문제 생성 엔진
OpenAI API를 활용하여 다양한 유형의 객관식 문제를 생성
"""

import json
import os
from typing import Dict, List, Optional, Literal
from dataclasses import dataclass, asdict
import openai
from openai import OpenAI


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


class QuestionGenerator:
    """문제 생성 클래스"""
    
    QUESTION_TYPES = {
        "정의형": "핵심 개념이나 용어의 정의를 묻는 문제",
        "특징형": "특정 주제나 개념의 특징을 묻는 문제",
        "비교형": "두 개 이상의 개념을 비교하는 문제",
        "적용형": "이론을 실제 상황에 적용하는 문제"
    }
    
    def __init__(self, api_key: Optional[str] = None):
        """
        초기화
        Args:
            api_key: OpenAI API 키 (None일 경우 환경변수에서 읽음)
        """
        if api_key:
            self.client = OpenAI(api_key=api_key)
        else:
            # 환경변수에서 API 키 읽기
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OpenAI API 키가 필요합니다. 환경변수 OPENAI_API_KEY를 설정하거나 직접 전달해주세요.")
            self.client = OpenAI(api_key=api_key)
    
    def create_prompt(self, content: str, question_type: str, difficulty: str, num_questions: int = 1) -> str:
        """문제 생성을 위한 프롬프트 생성"""
        prompt = f"""
당신은 한국 국가공인자격증 시험 문제 출제 전문가입니다.
다음 내용을 바탕으로 {question_type} 유형의 4지선다형 객관식 문제를 {num_questions}개 생성해주세요.

난이도: {difficulty}
- 상: 심화 개념, 복잡한 적용, 종합적 사고 필요
- 중: 기본 개념의 이해와 간단한 적용
- 하: 단순 암기, 기초 개념

내용:
{content}

다음 JSON 형식으로 각 문제를 작성해주세요:
{{
    "question": "문제 내용 (명확하고 간결하게)",
    "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "answer": 정답_인덱스(0-3),
    "explanation": "정답 해설 (왜 이것이 정답인지 상세히 설명)",
    "difficulty": "{difficulty}",
    "question_type": "{question_type}"
}}

주의사항:
1. 문제는 한국어로 작성하고, 전문 용어는 정확히 사용하세요.
2. 오답 선택지도 그럴듯하게 작성하되, 명확히 틀린 내용이어야 합니다.
3. 문제 내용은 주어진 텍스트를 벗어나지 않아야 합니다.
4. 각 문제는 독립적이어야 하며, 서로 답을 암시하지 않아야 합니다.

문제들을 JSON 배열로 반환해주세요.
"""
        return prompt
    
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
        
        prompt = self.create_prompt(content, question_type, difficulty, num_questions)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # 또는 gpt-3.5-turbo
                messages=[
                    {"role": "system", "content": "당신은 한국 국가공인자격증 시험 문제 출제 전문가입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            # 응답 파싱
            response_text = response.choices[0].message.content
            
            # JSON 파싱
            try:
                # JSON 배열 추출 (마크다운 코드 블록 제거)
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    response_text = response_text[json_start:json_end]
                elif "```" in response_text:
                    json_start = response_text.find("```") + 3
                    json_end = response_text.find("```", json_start)
                    response_text = response_text[json_start:json_end]
                
                questions_data = json.loads(response_text.strip())
                
                # 단일 문제인 경우 리스트로 변환
                if isinstance(questions_data, dict):
                    questions_data = [questions_data]
                
                # Question 객체로 변환
                questions = []
                for q_data in questions_data:
                    question = Question(
                        question=q_data["question"],
                        options=q_data["options"],
                        answer=q_data["answer"],
                        explanation=q_data["explanation"],
                        difficulty=q_data["difficulty"],
                        question_type=q_data["question_type"]
                    )
                    questions.append(question)
                
                return questions
                
            except json.JSONDecodeError as e:
                raise Exception(f"응답 파싱 오류: {str(e)}\n응답: {response_text}")
            
        except Exception as e:
            raise Exception(f"문제 생성 오류: {str(e)}")
    
    def generate_mixed_questions(
        self,
        content: str,
        num_questions_per_type: int = 2,
        difficulty: str = "중"
    ) -> List[Question]:
        """
        여러 유형의 문제를 혼합하여 생성
        Args:
            content: 문제 생성의 기반이 될 텍스트
            num_questions_per_type: 각 유형별 문제 수
            difficulty: 난이도
        Returns:
            생성된 문제 리스트
        """
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
    
    def generate_from_paragraphs(
        self,
        paragraphs: List[str],
        questions_per_paragraph: int = 2,
        question_type: str = "정의형",
        difficulty: str = "중"
    ) -> List[Question]:
        """
        여러 문단에서 문제 생성
        Args:
            paragraphs: 문단 리스트
            questions_per_paragraph: 문단당 문제 수
            question_type: 문제 유형
            difficulty: 난이도
        Returns:
            생성된 문제 리스트
        """
        all_questions = []
        
        for i, paragraph in enumerate(paragraphs):
            print(f"문단 {i+1}/{len(paragraphs)} 처리 중...")
            try:
                questions = self.generate_questions(
                    content=paragraph,
                    question_type=question_type,
                    difficulty=difficulty,
                    num_questions=questions_per_paragraph
                )
                all_questions.extend(questions)
            except Exception as e:
                print(f"문단 {i+1} 문제 생성 실패: {str(e)}")
        
        return all_questions