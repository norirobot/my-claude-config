"""
수정된 문제 생성 엔진 - 실제 내용 기반 문제 생성
"""

import json
import os
import re
import random
from typing import Dict, List, Optional, Literal, Set
from dataclasses import dataclass, asdict
from collections import Counter
import hashlib


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


class SmartTextAnalyzer:
    """향상된 텍스트 분석기"""
    
    def __init__(self):
        self.stop_words = {'은', '는', '이', '가', '을', '를', '의', '에', '와', '과', '도', '로', '으로', '에서', '부터', '까지', '에게', '한다', '있다', '없다', '이다', '아니다'}
        
    def extract_key_sentences(self, text: str, min_length: int = 20) -> List[str]:
        """의미있는 핵심 문장 추출"""
        # 문장 분리 (더 정확한 패턴)
        sentences = re.split(r'[.!?]\s+', text.strip())
        
        good_sentences = []
        for sent in sentences:
            sent = sent.strip()
            
            # 길이 필터링
            if len(sent) < min_length or len(sent) > 200:
                continue
                
            # 의미없는 문장 제외
            if any(skip in sent for skip in ['그림', '표', '번호', '페이지', '참조', '출처']):
                continue
                
            # 정의나 설명이 포함된 문장 우선
            score = 0
            if any(word in sent for word in ['이란', '란', '는', '정의', '의미', '개념']):
                score += 3
            if any(word in sent for word in ['특징', '장점', '단점', '목적', '기능']):
                score += 2
            if re.search(r'[가-힣]+\s*:\s*', sent):  # 콜론이 있는 설명
                score += 2
                
            good_sentences.append((sent, score))
        
        # 점수순 정렬
        good_sentences.sort(key=lambda x: x[1], reverse=True)
        return [sent for sent, _ in good_sentences[:10]]
    
    def extract_definitions_smart(self, text: str) -> Dict[str, str]:
        """스마트한 정의 추출"""
        definitions = {}
        
        # 더 정확한 정의 패턴들
        patterns = [
            # "X란 Y이다" 형태
            r'([가-힣]{2,8})(?:이란|란)\s+(.{10,100})(?:이다|입니다|다)',
            # "X는 Y를 의미한다" 형태  
            r'([가-힣]{2,8})(?:는|은)\s+(.{10,100})(?:을|를)\s*(?:의미한다|뜻한다)',
            # "X: Y" 형태
            r'([가-힣]{2,8})\s*:\s+(.{10,100})',
            # "X(이)라고 한다" 형태
            r'(.{10,100})(?:이라고|라고)\s+(?:한다|부른다|불린다)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if len(match) == 2:
                    term, definition = match[0].strip(), match[1].strip()
                    
                    # 품질 검사
                    if (len(term) >= 2 and len(definition) >= 10 and 
                        not any(skip in definition for skip in ['그림', '표', '번호'])):
                        definitions[term] = definition
        
        return definitions
    
    def extract_key_facts(self, text: str) -> List[str]:
        """핵심 사실들 추출"""
        facts = []
        sentences = self.extract_key_sentences(text)
        
        for sent in sentences[:5]:  # 상위 5개 문장만
            # 숫자나 구체적 정보가 포함된 문장 선호
            if re.search(r'\d+|첫째|둘째|셋째|주요|중요|특징', sent):
                facts.append(sent)
        
        return facts


class FixedQuestionGenerator:
    """수정된 문제 생성기 - 실제 내용 기반"""
    
    def __init__(self):
        self.analyzer = SmartTextAnalyzer()
        
    def generate_content_based_question(self, text: str, difficulty: str = "중") -> Optional[Question]:
        """실제 내용 기반 문제 생성"""
        
        # 1. 정의 기반 문제 시도
        definitions = self.analyzer.extract_definitions_smart(text)
        if definitions:
            return self._create_definition_question(definitions, text, difficulty)
        
        # 2. 핵심 사실 기반 문제 시도
        key_facts = self.analyzer.extract_key_facts(text)
        if key_facts:
            return self._create_fact_question(key_facts, text, difficulty)
        
        # 3. 문장 기반 문제 (마지막 수단)
        key_sentences = self.analyzer.extract_key_sentences(text)
        if key_sentences:
            return self._create_sentence_question(key_sentences, difficulty)
        
        return None
    
    def _create_definition_question(self, definitions: Dict[str, str], text: str, difficulty: str) -> Question:
        """정의 기반 문제 생성"""
        term = random.choice(list(definitions.keys()))
        correct_def = definitions[term]
        
        # 문제 생성
        question_templates = [
            f"다음 중 '{term}'에 대한 설명으로 가장 적절한 것은?",
            f"'{term}'의 정의로 옳은 것은?",
            f"본문에서 설명하는 '{term}'은 무엇인가?"
        ]
        question = random.choice(question_templates)
        
        # 오답 생성
        wrong_options = []
        
        # 다른 정의들 사용
        for other_term, other_def in definitions.items():
            if other_term != term and len(wrong_options) < 2:
                wrong_options.append(other_def)
        
        # 변형된 오답 생성
        if len(wrong_options) < 3:
            modifications = [
                correct_def.replace('이다', '가 아니다'),
                correct_def.replace('한다', '하지 않는다'),
                f"{term}과 반대되는 개념을 설명한 것",
                f"일반적으로 {term}과 혼동되기 쉬운 다른 개념"
            ]
            for mod in modifications:
                if len(wrong_options) < 3 and mod != correct_def:
                    wrong_options.append(mod)
        
        # 선택지 구성
        all_options = [correct_def] + wrong_options[:3]
        random.shuffle(all_options)
        correct_index = all_options.index(correct_def)
        
        return Question(
            question=question,
            options=all_options,
            answer=correct_index,
            explanation=f"본문에서 {term}은(는) '{correct_def}'로 정의되고 있습니다.",
            difficulty=difficulty,
            question_type="정의형"
        )
    
    def _create_fact_question(self, facts: List[str], text: str, difficulty: str) -> Question:
        """사실 기반 문제 생성"""
        correct_fact = facts[0]
        
        question = "다음 중 본문의 내용과 일치하는 것은?"
        
        # 오답 생성 (사실 변형)
        wrong_options = []
        
        # 다른 사실들을 변형
        for fact in facts[1:4]:
            if '이다' in fact:
                wrong_option = fact.replace('이다', '가 아니다')
            elif '한다' in fact:
                wrong_option = fact.replace('한다', '하지 않는다')
            elif '있다' in fact:
                wrong_option = fact.replace('있다', '없다')
            else:
                wrong_option = fact + " (이는 잘못된 내용임)"
            
            wrong_options.append(wrong_option)
        
        # 부족한 경우 일반적 오답 추가
        generic_wrongs = [
            "본문에서 전혀 언급되지 않은 내용",
            "일반적으로 알려진 상식이지만 본문과 무관한 내용",
            "본문 내용과 반대되는 설명"
        ]
        
        for generic in generic_wrongs:
            if len(wrong_options) < 3:
                wrong_options.append(generic)
        
        # 선택지 구성
        all_options = [correct_fact] + wrong_options[:3]
        random.shuffle(all_options)
        correct_index = all_options.index(correct_fact)
        
        return Question(
            question=question,
            options=all_options,
            answer=correct_index,
            explanation=f"본문에 명시된 내용은 '{correct_fact}'입니다.",
            difficulty=difficulty,
            question_type="사실형"
        )
    
    def _create_sentence_question(self, sentences: List[str], difficulty: str) -> Question:
        """문장 기반 문제 생성"""
        correct_sentence = sentences[0]
        
        question = "본문에서 설명하는 주요 내용으로 가장 적절한 것은?"
        
        # 다른 문장들을 오답으로 사용 (일부 변형)
        wrong_options = []
        for sent in sentences[1:4]:
            if len(sent) < 100:  # 너무 긴 문장 제외
                wrong_options.append(sent)
        
        # 부족한 경우 추가
        if len(wrong_options) < 3:
            fallbacks = [
                "위 내용과 관련성이 낮은 설명",
                "본문에서 직접적으로 언급되지 않은 내용",
                "일반적인 상식이지만 본문과 무관한 설명"
            ]
            wrong_options.extend(fallbacks[:3-len(wrong_options)])
        
        # 선택지 구성
        all_options = [correct_sentence] + wrong_options[:3]
        random.shuffle(all_options)
        correct_index = all_options.index(correct_sentence)
        
        return Question(
            question=question,
            options=all_options,
            answer=correct_index,
            explanation=f"본문의 핵심 내용은 '{correct_sentence[:50]}...'입니다.",
            difficulty=difficulty,
            question_type="이해형"
        )
    
    def generate_questions(self, text: str, 
                          question_type: str = "혼합",
                          difficulty: str = "중", 
                          num_questions: int = 5) -> List[Question]:
        """여러 문제 생성"""
        questions = []
        
        for i in range(num_questions):
            question = self.generate_content_based_question(text, difficulty)
            if question:
                questions.append(question)
        
        return questions


# 테스트 코드
if __name__ == "__main__":
    test_text = """
    정보처리기사는 한국산업인력공단에서 시행하는 국가기술자격 시험으로, 정보시스템의 분석, 설계, 구현, 시험, 운영 및 유지보수와 관련된 전문 기술을 평가하는 자격증입니다.
    
    소프트웨어 개발 방법론은 소프트웨어를 체계적으로 개발하기 위한 절차와 방법을 정의한 것입니다. 
    
    폭포수 모델은 순차적으로 진행되는 전통적인 개발 방법론입니다. 요구사항 분석, 설계, 구현, 테스트, 유지보수의 단계를 거치며, 각 단계가 완료된 후 다음 단계로 진행됩니다.
    """
    
    generator = FixedQuestionGenerator()
    questions = generator.generate_questions(test_text, "정의형", "중", 3)
    
    for i, q in enumerate(questions, 1):
        print(f"\n문제 {i}:")
        print(f"Q: {q.question}")
        print("선택지:")
        for j, opt in enumerate(q.options, 1):
            mark = "→" if j-1 == q.answer else " "
            print(f"  {mark} {j}. {opt}")
        print(f"해설: {q.explanation}")