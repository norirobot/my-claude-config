"""
개선된 문제 생성 엔진
선택지 다양성 및 품질 향상
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


class ImprovedTextAnalyzer:
    """개선된 텍스트 분석기"""
    
    def __init__(self):
        self.stop_words = {'은', '는', '이', '가', '을', '를', '의', '에', '와', '과', '도', '로', '으로', '에서', '부터', '까지'}
        self.extracted_nouns = set()  # 추출된 명사들 저장
        
    def extract_key_nouns(self, text: str) -> Set[str]:
        """텍스트에서 핵심 명사 추출"""
        # 간단한 한글 명사 추출 (2글자 이상의 한글 단어)
        nouns = set(re.findall(r'[가-힣]{2,}', text))
        
        # 불용어 제거
        nouns = {n for n in nouns if n not in self.stop_words and len(n) >= 2}
        
        # 빈도 기반 핵심 명사 선택
        word_freq = Counter(nouns)
        key_nouns = set([word for word, freq in word_freq.most_common(20)])
        
        self.extracted_nouns.update(key_nouns)
        return key_nouns
    
    def extract_key_sentences(self, text: str, num_sentences: int = 10) -> List[str]:
        """핵심 문장 추출 (개선된 버전)"""
        sentences = re.split('[.!?]\s+', text)
        
        # 중요 키워드와 가중치
        important_keywords = {
            '정의': 5, '특징': 4, '장점': 4, '단점': 4, 
            '목적': 4, '기능': 4, '구성': 3, '원리': 4, 
            '방법': 3, '종류': 3, '역할': 3, '의미': 4,
            '중요': 3, '필요': 3, '활용': 3, '적용': 3
        }
        
        scored_sentences = []
        for sent in sentences:
            sent = sent.strip()
            if len(sent) < 15 or len(sent) > 250:
                continue
            
            score = 0
            
            # 키워드 점수
            for keyword, weight in important_keywords.items():
                if keyword in sent:
                    score += weight
            
            # 정의 패턴 점수
            if re.search(r'[가-힣]+(?:란|은|는)\s+.+(?:이다|입니다|를?\s*의미)', sent):
                score += 5
            
            # 나열 패턴 점수
            if re.search(r'첫째|둘째|셋째|마지막|다음과\s*같', sent):
                score += 3
            
            # 숫자나 순서 포함
            if re.search(r'\d+|[①②③④⑤]', sent):
                score += 2
            
            # 문장 길이 보너스 (적당한 길이 선호)
            if 30 <= len(sent) <= 100:
                score += 2
            
            scored_sentences.append((sent, score))
        
        # 점수 기준 정렬 후 다양성을 위해 약간의 무작위성 추가
        scored_sentences.sort(key=lambda x: x[1] + random.random(), reverse=True)
        
        return [sent for sent, _ in scored_sentences[:num_sentences]]
    
    def extract_definitions(self, text: str) -> Dict[str, str]:
        """정의 추출 (개선된 버전)"""
        definitions = {}
        
        # 다양한 정의 패턴
        patterns = [
            # 기본 정의 패턴
            r'([가-힣]+)(?:란|은|는)\s+(.+?)(?:[.]|이다|입니다)',
            r'([가-힣]+)(?:을|를)\s+(.+?)(?:라고?\s*(?:한다|합니다|부른다|부릅니다))',
            r'([가-힣]+):\s*(.+?)(?:[.]|\n)',
            # 괄호 정의
            r'([가-힣]+)\(([^)]+)\)',
            # 영어 포함 정의
            r'([가-힣]+)\s*\(([A-Za-z\s]+)\)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if len(match) == 2:
                    term = match[0].strip()
                    definition = match[1].strip()
                    
                    # 품질 체크
                    if (10 < len(definition) < 200 and 
                        term not in self.stop_words and
                        len(term) >= 2):
                        definitions[term] = definition
        
        return definitions
    
    def extract_comparisons(self, text: str) -> List[tuple]:
        """비교 관계 추출 (개선된 버전)"""
        comparisons = []
        seen_pairs = set()
        
        patterns = [
            r'([가-힣]+)(?:와|과)\s+([가-힣]+)의?\s*(?:차이|비교|공통점|관계)',
            r'([가-힣]+)(?:는|은)\s+(.+?)(?:이지만|인\s*반면)\s*([가-힣]+)',
            r'([가-힣]+)보다\s+([가-힣]+)(?:이|가)',
            r'([가-힣]+)에\s*비해\s+([가-힣]+)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if len(match) >= 2:
                    item1, item2 = match[0].strip(), match[1].strip()
                    
                    # 중복 체크
                    pair_key = tuple(sorted([item1, item2]))
                    if pair_key not in seen_pairs and len(item1) >= 2 and len(item2) >= 2:
                        comparisons.append((item1, item2))
                        seen_pairs.add(pair_key)
        
        return comparisons


class ImprovedQuestionGenerator:
    """개선된 문제 생성기"""
    
    def __init__(self):
        self.analyzer = ImprovedTextAnalyzer()
        self.used_options = set()  # 사용된 선택지 추적
        
    def generate_unique_wrong_options(self, correct_answer: str, 
                                     context: str, 
                                     question_type: str,
                                     num_options: int = 3) -> List[str]:
        """중복되지 않는 다양한 오답 생성"""
        wrong_options = []
        option_strategies = []
        
        # 컨텍스트에서 명사 추출
        nouns = self.analyzer.extract_key_nouns(context)
        
        # 1. 반대/부정 변형
        negation_words = [
            ('가능', '불가능'), ('증가', '감소'), ('향상', '저하'),
            ('포함', '제외'), ('필요', '불필요'), ('적절', '부적절'),
            ('올바른', '잘못된'), ('효율적', '비효율적'), ('성공', '실패'),
            ('장점', '단점'), ('발전', '퇴보'), ('확대', '축소')
        ]
        
        for original, opposite in negation_words:
            if original in correct_answer:
                modified = correct_answer.replace(original, opposite)
                if modified != correct_answer and modified not in wrong_options:
                    option_strategies.append(('negation', modified))
        
        # 2. 유사 개념 대체
        if question_type == "정의형":
            # 다른 명사를 사용한 정의 생성
            for noun in list(nouns)[:5]:
                if noun not in correct_answer:
                    fake_def = f"{noun}을(를) 체계적으로 관리하고 운영하는 것"
                    option_strategies.append(('similar', fake_def))
                    
        # 3. 부분적 변형
        words = correct_answer.split()
        if len(words) > 3:
            # 앞부분은 유지, 뒷부분 변경
            partial = ' '.join(words[:len(words)//2]) + " 잘못된 설명이 추가된 내용"
            option_strategies.append(('partial', partial))
            
            # 순서 변경
            if len(words) > 5:
                shuffled_words = words.copy()
                random.shuffle(shuffled_words)
                shuffled = ' '.join(shuffled_words)
                if shuffled != correct_answer:
                    option_strategies.append(('shuffle', shuffled))
        
        # 4. 관련 없는 내용
        unrelated_templates = [
            "일반적으로 사용되지 않는 개념",
            "실무에서 권장되지 않는 방법",
            "이론적으로만 존재하는 가상의 개념",
            "구시대적이고 더 이상 사용되지 않는 방식",
            "아직 검증되지 않은 실험적 접근",
        ]
        
        for template in unrelated_templates:
            option_strategies.append(('unrelated', template))
        
        # 5. 컨텍스트 기반 오답
        key_sentences = self.analyzer.extract_key_sentences(context, 5)
        for sent in key_sentences:
            if sent != correct_answer and len(sent) < 150:
                # 문장 일부 변형
                if '는' in sent:
                    modified = sent.replace('는', '는 절대로', 1)
                    option_strategies.append(('context', modified))
                elif '이다' in sent:
                    modified = sent.replace('이다', '가 아니다')
                    option_strategies.append(('context', modified))
        
        # 전략별로 선택지 생성 (중복 제거)
        random.shuffle(option_strategies)
        
        for strategy_type, option in option_strategies:
            if len(wrong_options) >= num_options:
                break
                
            # 중복 체크
            option_hash = hashlib.md5(option.encode()).hexdigest()
            if (option not in wrong_options and 
                option != correct_answer and
                option_hash not in self.used_options and
                len(option) > 5):
                wrong_options.append(option)
                self.used_options.add(option_hash)
        
        # 부족한 경우 기본 오답 추가
        fallback_options = [
            "위 내용과 관련이 없는 설명",
            "본문에서 언급되지 않은 내용", 
            "일반적으로 틀린 것으로 알려진 내용",
            "실제와 다른 잘못된 설명",
            "정확하지 않은 부분적 설명"
        ]
        
        for fallback in fallback_options:
            if len(wrong_options) >= num_options:
                break
            if fallback not in wrong_options:
                wrong_options.append(fallback)
        
        return wrong_options[:num_options]
    
    def generate_definition_question(self, text: str, difficulty: str = "중") -> Optional[Question]:
        """정의형 문제 생성 (개선된 버전)"""
        definitions = self.analyzer.extract_definitions(text)
        
        if not definitions:
            return None
        
        term = random.choice(list(definitions.keys()))
        correct_def = definitions[term]
        
        # 난이도별 문제 템플릿
        templates_by_difficulty = {
            "하": [f"{term}의 정의로 가장 적절한 것은?"],
            "중": [f"다음 중 {term}에 대한 설명으로 옳은 것은?",
                  f"{term}을(를) 올바르게 설명한 것은?"],
            "상": [f"{term}의 개념을 가장 정확하게 설명한 것은?",
                  f"다음 중 {term}의 본질적 의미를 나타낸 것은?"]
        }
        
        question = random.choice(templates_by_difficulty.get(difficulty, templates_by_difficulty["중"]))
        
        # 다양한 오답 생성
        wrong_options = self.generate_unique_wrong_options(
            correct_def, text, "정의형", 3
        )
        
        # 다른 정의들도 오답으로 활용
        for other_term, other_def in definitions.items():
            if other_term != term and len(wrong_options) < 3:
                wrong_options.append(other_def)
        
        all_options = [correct_def] + wrong_options[:3]
        random.shuffle(all_options)
        correct_index = all_options.index(correct_def)
        
        return Question(
            question=question,
            options=all_options,
            answer=correct_index,
            explanation=f"{term}의 올바른 정의는 '{correct_def}'입니다.",
            difficulty=difficulty,
            question_type="정의형"
        )
    
    def generate_questions(self, text: str, 
                          question_type: str = "혼합",
                          difficulty: str = "중", 
                          num_questions: int = 5) -> List[Question]:
        """여러 문제 생성"""
        questions = []
        self.used_options.clear()  # 새로운 세션마다 초기화
        
        # 텍스트 분석
        self.analyzer.extract_key_nouns(text)
        
        if question_type == "혼합":
            types = ["정의형"] * num_questions  # 간단한 예시
        else:
            types = [question_type] * num_questions
        
        for qtype in types:
            q = self.generate_definition_question(text, difficulty)
            if q:
                questions.append(q)
        
        return questions


# 테스트 코드
if __name__ == "__main__":
    test_text = """
    소프트웨어 개발 방법론은 소프트웨어를 체계적으로 개발하기 위한 절차와 방법을 정의한 것입니다.
    
    폭포수 모델은 순차적으로 진행되는 전통적인 개발 방법론으로, 요구사항 분석, 설계, 구현, 테스트, 유지보수의 단계를 거칩니다.
    각 단계가 완료된 후 다음 단계로 진행되며, 이전 단계로의 회귀가 어렵다는 특징이 있습니다.
    
    애자일 방법론은 변화에 유연하게 대응하고 고객과의 소통을 중시하는 개발 방법론입니다.
    짧은 주기의 반복적인 개발을 통해 빠르게 동작하는 소프트웨어를 제공하며, 지속적인 피드백을 통해 품질을 향상시킵니다.
    """
    
    generator = ImprovedQuestionGenerator()
    questions = generator.generate_questions(test_text, "정의형", "중", 3)
    
    for i, q in enumerate(questions, 1):
        print(f"\n문제 {i}:")
        print(f"Q: {q.question}")
        print("선택지:")
        for j, opt in enumerate(q.options, 1):
            mark = "→" if j-1 == q.answer else " "
            print(f"  {mark} {j}. {opt}")
        
        # 중복 체크
        unique_options = len(set(q.options))
        print(f"선택지 다양성: {unique_options}/4")