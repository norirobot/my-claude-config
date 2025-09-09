"""
하이브리드 문제 생성 엔진
텍스트 분석 기반 + OpenAI API 선택적 사용
"""

import json
import os
import re
import random
from typing import Dict, List, Optional, Literal
from dataclasses import dataclass, asdict
from collections import Counter


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


class TextAnalyzer:
    """텍스트 분석 및 키워드 추출"""
    
    def __init__(self):
        self.stop_words = {'은', '는', '이', '가', '을', '를', '의', '에', '와', '과', '도', '로', '으로', '에서', '부터', '까지'}
    
    def extract_key_sentences(self, text: str, num_sentences: int = 10) -> List[str]:
        """핵심 문장 추출"""
        # 문장 분리
        sentences = re.split('[.!?]\s+', text)
        
        # 중요 키워드가 포함된 문장 우선 선택
        important_keywords = ['정의', '특징', '장점', '단점', '목적', '기능', '구성', '원리', '방법', '종류']
        
        scored_sentences = []
        for sent in sentences:
            if len(sent) < 20 or len(sent) > 200:  # 너무 짧거나 긴 문장 제외
                continue
            
            score = 0
            for keyword in important_keywords:
                if keyword in sent:
                    score += 2
            
            # 특수 패턴 점수 부여
            if '란 ' in sent or '는 ' in sent:  # 정의 패턴
                score += 3
            if re.search(r'\d+', sent):  # 숫자 포함
                score += 1
            if '첫째' in sent or '둘째' in sent or '마지막' in sent:  # 나열 패턴
                score += 2
            
            scored_sentences.append((sent, score))
        
        # 점수 기준 정렬
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        
        return [sent for sent, _ in scored_sentences[:num_sentences]]
    
    def extract_definitions(self, text: str) -> Dict[str, str]:
        """정의 추출"""
        definitions = {}
        
        # 정의 패턴들
        patterns = [
            r'(\w+)(?:란|은|는)\s+(.+?)(?:[.]|이다|입니다)',
            r'(\w+)(?:을|를)\s+(.+?)(?:라고?\s+(?:한다|합니다|부른다|부릅니다))',
            r'(\w+):\s*(.+?)(?:[.]|\n)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if len(match) == 2:
                    term = match[0].strip()
                    definition = match[1].strip()
                    if 10 < len(definition) < 150:  # 적절한 길이의 정의만
                        definitions[term] = definition
        
        return definitions
    
    def extract_comparisons(self, text: str) -> List[tuple]:
        """비교 관계 추출"""
        comparisons = []
        
        # 비교 패턴
        patterns = [
            r'(\w+)(?:와|과)\s+(\w+)의?\s+(?:차이|비교|공통점)',
            r'(\w+)(?:는|은)\s+(.+?)(?:이지만|인\s+반면)',
            r'(\w+)보다\s+(\w+)(?:이|가)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if len(match) >= 2:
                    comparisons.append((match[0].strip(), match[1].strip()))
        
        return comparisons
    
    def extract_characteristics(self, text: str) -> Dict[str, List[str]]:
        """특징 추출"""
        characteristics = {}
        
        # 특징 나열 패턴
        patterns = [
            r'(\w+)의?\s+특징은\s+다음과\s+같다[:\.]?\s*(.+?)(?:\n\n|$)',
            r'(\w+)(?:은|는)\s+(.+?)\s+특징을\s+(?:가진다|갖는다|지닌다)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            for match in matches:
                if len(match) == 2:
                    subject = match[0].strip()
                    features = match[1].strip()
                    
                    # 특징들을 리스트로 분리
                    feature_list = re.split('[,\n•·-]', features)
                    feature_list = [f.strip() for f in feature_list if f.strip() and len(f.strip()) > 5]
                    
                    if feature_list:
                        characteristics[subject] = feature_list[:5]  # 최대 5개
        
        return characteristics


class SmartQuestionGenerator:
    """텍스트 분석 기반 스마트 문제 생성기"""
    
    def __init__(self):
        self.analyzer = TextAnalyzer()
        self.question_templates = {
            "정의형": [
                "{term}의 정의로 가장 적절한 것은?",
                "다음 중 {term}에 대한 설명으로 옳은 것은?",
                "{term}란 무엇인가?",
            ],
            "특징형": [
                "{subject}의 특징으로 옳지 않은 것은?",
                "다음 중 {subject}의 특징에 해당하는 것은?",
                "{subject}의 주요 특성으로 적절한 것은?",
            ],
            "비교형": [
                "{item1}와 {item2}의 차이점으로 옳은 것은?",
                "{item1}과 {item2}를 비교한 설명으로 적절한 것은?",
                "다음 중 {item1}와 {item2}의 공통점은?",
            ],
            "적용형": [
                "다음 상황에서 {concept}를 적용한 사례로 적절한 것은?",
                "{concept}의 실제 활용 예시로 옳은 것은?",
                "{concept}를 올바르게 적용한 것은?",
            ]
        }
    
    def generate_definition_question(self, text: str, difficulty: str = "중") -> Optional[Question]:
        """정의형 문제 생성"""
        definitions = self.analyzer.extract_definitions(text)
        
        if not definitions:
            return None
        
        # 랜덤하게 하나 선택
        term = random.choice(list(definitions.keys()))
        correct_def = definitions[term]
        
        # 문제 생성
        template = random.choice(self.question_templates["정의형"])
        question = template.format(term=term)
        
        # 오답 생성 (다른 정의들 또는 변형)
        wrong_options = []
        
        # 다른 용어의 정의를 오답으로 사용
        for other_term, other_def in definitions.items():
            if other_term != term:
                wrong_options.append(other_def)
        
        # 오답이 부족하면 정답을 변형하여 생성
        if len(wrong_options) < 3:
            # 일부 단어를 반대/유사 개념으로 변경
            modifications = [
                correct_def.replace("증가", "감소"),
                correct_def.replace("향상", "저하"),
                correct_def.replace("포함", "제외"),
                correct_def.replace("가능", "불가능"),
                correct_def[:len(correct_def)//2] + "하는 잘못된 개념",
                "일반적으로 " + term + "와 관련이 없는 내용",
            ]
            wrong_options.extend(modifications)
        
        # 선택지 구성
        wrong_options = wrong_options[:3]
        all_options = [correct_def] + wrong_options
        
        # 부족한 오답 채우기
        while len(all_options) < 4:
            all_options.append(f"{term}와 관련이 없는 설명 {len(all_options)}")
        
        # 선택지 섞기
        random.shuffle(all_options)
        correct_index = all_options.index(correct_def)
        
        return Question(
            question=question,
            options=all_options[:4],
            answer=correct_index,
            explanation=f"{term}의 올바른 정의는 '{correct_def}'입니다.",
            difficulty=difficulty,
            question_type="정의형"
        )
    
    def generate_characteristic_question(self, text: str, difficulty: str = "중") -> Optional[Question]:
        """특징형 문제 생성"""
        characteristics = self.analyzer.extract_characteristics(text)
        
        if not characteristics:
            # 대체 방법: 핵심 문장에서 특징 추출
            key_sentences = self.analyzer.extract_key_sentences(text, 5)
            if key_sentences:
                question = "다음 중 본문의 내용과 일치하는 것은?"
                
                correct_option = key_sentences[0]
                wrong_options = [
                    sent.replace("이다", "아니다") for sent in key_sentences[1:4]
                ]
                
                # 부족한 오답 채우기
                while len(wrong_options) < 3:
                    wrong_options.append("본문에 언급되지 않은 내용")
                
                all_options = [correct_option] + wrong_options[:3]
                random.shuffle(all_options)
                correct_index = all_options.index(correct_option)
                
                return Question(
                    question=question,
                    options=all_options,
                    answer=correct_index,
                    explanation=f"본문에 명시된 내용은 '{correct_option}'입니다.",
                    difficulty=difficulty,
                    question_type="특징형"
                )
            return None
        
        # 특징이 있는 경우
        subject = random.choice(list(characteristics.keys()))
        features = characteristics[subject]
        
        template = random.choice(self.question_templates["특징형"])
        question = template.format(subject=subject)
        
        # 정답과 오답 구성
        if "옳지 않은" in question:
            # 틀린 것 찾기
            correct_features = features[:3]
            wrong_feature = f"{subject}와 관련 없는 특징"
            all_options = correct_features + [wrong_feature]
            correct_index = 3
        else:
            # 맞는 것 찾기
            correct_feature = features[0]
            wrong_features = [
                f"{subject}의 반대 특징",
                f"{subject}와 무관한 내용",
                "일반적으로 틀린 설명"
            ]
            all_options = [correct_feature] + wrong_features
            random.shuffle(all_options)
            correct_index = all_options.index(correct_feature)
        
        return Question(
            question=question,
            options=all_options[:4],
            answer=correct_index,
            explanation=f"{subject}의 특징을 정확히 이해하는 것이 중요합니다.",
            difficulty=difficulty,
            question_type="특징형"
        )
    
    def generate_comparison_question(self, text: str, difficulty: str = "중") -> Optional[Question]:
        """비교형 문제 생성"""
        comparisons = self.analyzer.extract_comparisons(text)
        
        if not comparisons:
            return None
        
        item1, item2 = random.choice(comparisons)
        template = random.choice(self.question_templates["비교형"])
        question = template.format(item1=item1, item2=item2)
        
        # 간단한 비교 선택지 생성
        options = [
            f"{item1}은 {item2}보다 더 효율적이다",
            f"{item1}과 {item2}는 동일한 개념이다",
            f"{item1}은 {item2}의 하위 개념이다",
            f"{item1}과 {item2}는 서로 독립적이다"
        ]
        
        # 랜덤하게 정답 선택
        correct_index = random.randint(0, 3)
        
        return Question(
            question=question,
            options=options,
            answer=correct_index,
            explanation=f"{item1}과 {item2}의 관계를 정확히 이해해야 합니다.",
            difficulty=difficulty,
            question_type="비교형"
        )
    
    def generate_application_question(self, text: str, difficulty: str = "중") -> Optional[Question]:
        """적용형 문제 생성"""
        # 텍스트에서 주요 개념 추출
        definitions = self.analyzer.extract_definitions(text)
        
        if not definitions:
            return None
        
        concept = random.choice(list(definitions.keys()))
        template = random.choice(self.question_templates["적용형"])
        question = template.format(concept=concept)
        
        # 실제 적용 사례 생성
        options = [
            f"{concept}를 활용한 실제 사례 1",
            f"{concept}와 무관한 사례",
            f"{concept}를 잘못 적용한 사례",
            f"{concept}의 이론적 설명 (적용 아님)"
        ]
        
        # 첫 번째를 정답으로
        correct_index = 0
        
        return Question(
            question=question,
            options=options,
            answer=correct_index,
            explanation=f"{concept}의 실제 적용 방법을 이해하는 것이 중요합니다.",
            difficulty=difficulty,
            question_type="적용형"
        )
    
    def generate_question(
        self,
        text: str,
        question_type: str = "정의형",
        difficulty: str = "중"
    ) -> Question:
        """문제 생성 (실패시 기본 문제 반환)"""
        
        generators = {
            "정의형": self.generate_definition_question,
            "특징형": self.generate_characteristic_question,
            "비교형": self.generate_comparison_question,
            "적용형": self.generate_application_question
        }
        
        generator = generators.get(question_type, self.generate_definition_question)
        question = generator(text, difficulty)
        
        if question:
            return question
        
        # 생성 실패시 기본 문제 반환
        key_sentences = self.analyzer.extract_key_sentences(text, 4)
        if key_sentences:
            return Question(
                question="다음 중 본문의 내용과 일치하는 것은?",
                options=key_sentences[:4] if len(key_sentences) >= 4 else key_sentences + ["내용 없음"] * (4 - len(key_sentences)),
                answer=0,
                explanation="첫 번째 선택지가 본문의 핵심 내용입니다.",
                difficulty=difficulty,
                question_type=question_type
            )
        
        # 최후의 기본 문제
        return Question(
            question="본문의 주제로 가장 적절한 것은?",
            options=["주제 1", "주제 2", "주제 3", "주제 4"],
            answer=0,
            explanation="본문을 종합적으로 이해해야 합니다.",
            difficulty=difficulty,
            question_type=question_type
        )
    
    def generate_questions(
        self,
        text: str,
        question_type: str = "정의형",
        difficulty: str = "중",
        num_questions: int = 5
    ) -> List[Question]:
        """여러 문제 생성"""
        questions = []
        
        # 텍스트를 여러 부분으로 나누기
        text_parts = text.split('\n\n')
        if not text_parts:
            text_parts = [text]
        
        for i in range(num_questions):
            # 각 문제마다 다른 텍스트 부분 사용 (가능한 경우)
            text_part = text_parts[i % len(text_parts)] if text_parts else text
            
            question = self.generate_question(text_part, question_type, difficulty)
            
            # 중복 방지를 위해 문제 텍스트 약간 변경
            if i > 0 and question.question == questions[-1].question:
                question.question = f"[{i+1}번] " + question.question
            
            questions.append(question)
        
        return questions


class HybridQuestionGenerator:
    """하이브리드 문제 생성기 (로컬 우선, API 선택)"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        초기화
        Args:
            api_key: OpenAI API 키 (선택사항)
        """
        self.local_generator = SmartQuestionGenerator()
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.api_generator = None
        
        if self.api_key:
            try:
                from question_generator import QuestionGenerator
                self.api_generator = QuestionGenerator(self.api_key)
                print("[OK] API 모드 활성화 (고품질 문제 생성)")
            except Exception as e:
                print(f"[WARNING] API 초기화 실패, 로컬 모드로 진행: {e}")
    
    def generate_questions(
        self,
        text: str,
        question_type: str = "정의형",
        difficulty: str = "중",
        num_questions: int = 5,
        use_api: bool = False
    ) -> List[Question]:
        """
        문제 생성 (로컬 우선, API 선택 가능)
        Args:
            text: 원본 텍스트
            question_type: 문제 유형
            difficulty: 난이도
            num_questions: 문제 개수
            use_api: API 강제 사용 여부
        """
        
        # API 사용 가능하고 요청된 경우
        if use_api and self.api_generator:
            try:
                print("[API] API를 사용하여 고품질 문제 생성 중...")
                return self.api_generator.generate_questions(
                    content=text,
                    question_type=question_type,
                    difficulty=difficulty,
                    num_questions=num_questions
                )
            except Exception as e:
                print(f"[WARNING] API 오류, 로컬 모드로 전환: {e}")
        
        # 로컬 생성기 사용
        print("[LOCAL] 로컬 분석 엔진으로 문제 생성 중...")
        return self.local_generator.generate_questions(
            text=text,
            question_type=question_type,
            difficulty=difficulty,
            num_questions=num_questions
        )
    
    def preview_then_generate(
        self,
        text: str,
        question_type: str = "정의형",
        difficulty: str = "중",
        num_questions: int = 5
    ) -> List[Question]:
        """
        미리보기 후 생성 (로컬 1개 → 만족시 API로 나머지)
        """
        print("\n[샘플] 샘플 문제 생성 중 (로컬 엔진)...")
        
        # 로컬로 샘플 1개 생성
        sample = self.local_generator.generate_questions(
            text=text,
            question_type=question_type,
            difficulty=difficulty,
            num_questions=1
        )[0]
        
        print("\n" + "="*50)
        print("[샘플 문제]")
        print(f"문제: {sample.question}")
        for i, opt in enumerate(sample.options, 1):
            print(f"  {i}. {opt}")
        print(f"정답: {sample.answer + 1}번")
        print("="*50)
        
        if self.api_generator:
            print("\n[TIP] 더 나은 품질의 문제를 원하시면 API를 사용하세요.")
            print("   (API 사용시 비용이 발생할 수 있습니다)")
            
            # 실제 구현시 사용자 입력 받기
            # user_choice = input("API를 사용하시겠습니까? (y/n): ")
            # if user_choice.lower() == 'y':
            #     return self.generate_questions(text, question_type, difficulty, num_questions, use_api=True)
        
        # 로컬로 나머지 생성
        remaining = self.local_generator.generate_questions(
            text=text,
            question_type=question_type,
            difficulty=difficulty,
            num_questions=num_questions - 1
        )
        
        return [sample] + remaining