"""
기출문제 관리 시스템
실제 기출문제를 로드하고 랜덤 출제하는 시스템
"""

import json
import random
from typing import List, Dict, Optional
from dataclasses import dataclass
from pathlib import Path


@dataclass
class PastQuestion:
    """기출문제 데이터 클래스"""
    id: str
    category: str
    subcategory: str
    difficulty: str
    year: str
    round: str
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    
    def shuffle_options(self):
        """선택지 순서를 섞고 정답 인덱스 업데이트"""
        # 현재 정답 저장
        correct_option = self.options[self.correct_answer]
        
        # 선택지 섞기
        random.shuffle(self.options)
        
        # 새로운 정답 인덱스 찾기
        self.correct_answer = self.options.index(correct_option)
    
    def to_dict(self) -> Dict:
        """딕셔너리로 변환"""
        return {
            "id": self.id,
            "category": self.category,
            "subcategory": self.subcategory,
            "difficulty": self.difficulty,
            "year": self.year,
            "round": self.round,
            "question": self.question,
            "options": self.options,
            "answer": self.correct_answer,
            "explanation": self.explanation,
            "question_type": self.category
        }


class PastQuestionManager:
    """기출문제 관리 클래스"""
    
    def __init__(self, db_file: str = "past_questions_db.json"):
        """
        초기화
        Args:
            db_file: 기출문제 데이터베이스 파일 경로
        """
        self.db_file = Path(db_file)
        self.questions: List[PastQuestion] = []
        self.metadata: Dict = {}
        self.load_questions()
    
    def load_questions(self):
        """기출문제 데이터베이스 로드"""
        try:
            with open(self.db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            self.metadata = data.get('metadata', {})
            
            # 문제들을 PastQuestion 객체로 변환
            for q_data in data.get('questions', []):
                question = PastQuestion(
                    id=q_data['id'],
                    category=q_data['category'],
                    subcategory=q_data['subcategory'],
                    difficulty=q_data['difficulty'],
                    year=q_data['year'],
                    round=q_data['round'],
                    question=q_data['question'],
                    options=q_data['options'].copy(),  # 원본 보존을 위해 복사
                    correct_answer=q_data['correct_answer'],
                    explanation=q_data['explanation']
                )
                self.questions.append(question)
            
            print(f"[OK] {len(self.questions)}개의 기출문제를 로드했습니다.")
            
        except FileNotFoundError:
            print(f"[ERROR] 기출문제 파일을 찾을 수 없습니다: {self.db_file}")
        except Exception as e:
            print(f"[ERROR] 기출문제 로드 중 오류: {e}")
    
    def get_categories(self) -> List[str]:
        """사용 가능한 카테고리 목록 반환"""
        return list(set(q.category for q in self.questions))
    
    def get_difficulties(self) -> List[str]:
        """사용 가능한 난이도 목록 반환"""
        return list(set(q.difficulty for q in self.questions))
    
    def get_years(self) -> List[str]:
        """사용 가능한 연도 목록 반환"""
        return sorted(list(set(q.year for q in self.questions)), reverse=True)
    
    def filter_questions(self, 
                        category: Optional[str] = None,
                        difficulty: Optional[str] = None,
                        year: Optional[str] = None) -> List[PastQuestion]:
        """조건에 따라 문제 필터링"""
        filtered = self.questions
        
        if category and category != "전체":
            filtered = [q for q in filtered if q.category == category]
        
        if difficulty and difficulty != "전체":
            filtered = [q for q in filtered if q.difficulty == difficulty]
        
        if year and year != "전체":
            filtered = [q for q in filtered if q.year == year]
        
        return filtered
    
    def generate_random_test(self, 
                           num_questions: int = 10,
                           category: Optional[str] = None,
                           difficulty: Optional[str] = None,
                           year: Optional[str] = None,
                           shuffle_options: bool = True) -> List[PastQuestion]:
        """
        랜덤 시험 문제 생성
        
        Args:
            num_questions: 출제할 문제 수
            category: 카테고리 필터 (None이면 전체)
            difficulty: 난이도 필터 (None이면 전체)
            year: 연도 필터 (None이면 전체)
            shuffle_options: 선택지 순서 섞기 여부
        
        Returns:
            선택된 문제들의 리스트
        """
        # 조건에 맞는 문제들 필터링
        available_questions = self.filter_questions(category, difficulty, year)
        
        if not available_questions:
            print("[ERROR] 조건에 맞는 문제가 없습니다.")
            return []
        
        # 요청한 문제 수보다 적으면 조정
        actual_num = min(num_questions, len(available_questions))
        if actual_num < num_questions:
            print(f"[WARNING] 요청한 {num_questions}개보다 적은 {actual_num}개 문제만 사용 가능합니다.")
        
        # 랜덤하게 문제 선택
        selected_questions = random.sample(available_questions, actual_num)
        
        # 선택지 순서 섞기 (원본 보존을 위해 깊은 복사)
        result_questions = []
        for q in selected_questions:
            # 새로운 객체 생성 (원본 보존)
            new_question = PastQuestion(
                id=q.id,
                category=q.category,
                subcategory=q.subcategory,
                difficulty=q.difficulty,
                year=q.year,
                round=q.round,
                question=q.question,
                options=q.options.copy(),
                correct_answer=q.correct_answer,
                explanation=q.explanation
            )
            
            # 선택지 섞기
            if shuffle_options:
                new_question.shuffle_options()
            
            result_questions.append(new_question)
        
        return result_questions
    
    def get_question_stats(self) -> Dict:
        """문제 통계 정보 반환"""
        stats = {
            "total_questions": len(self.questions),
            "categories": {},
            "difficulties": {},
            "years": {}
        }
        
        for q in self.questions:
            # 카테고리별 통계
            if q.category not in stats["categories"]:
                stats["categories"][q.category] = 0
            stats["categories"][q.category] += 1
            
            # 난이도별 통계
            if q.difficulty not in stats["difficulties"]:
                stats["difficulties"][q.difficulty] = 0
            stats["difficulties"][q.difficulty] += 1
            
            # 연도별 통계
            if q.year not in stats["years"]:
                stats["years"][q.year] = 0
            stats["years"][q.year] += 1
        
        return stats
    
    def search_questions(self, keyword: str) -> List[PastQuestion]:
        """키워드로 문제 검색"""
        keyword = keyword.lower()
        results = []
        
        for q in self.questions:
            if (keyword in q.question.lower() or 
                keyword in q.explanation.lower() or
                any(keyword in opt.lower() for opt in q.options)):
                results.append(q)
        
        return results


# 테스트 코드
if __name__ == "__main__":
    print("기출문제 관리 시스템 테스트")
    print("=" * 50)
    
    # 관리자 생성
    manager = PastQuestionManager()
    
    # 통계 출력
    stats = manager.get_question_stats()
    print(f"\n[통계] 문제 통계:")
    print(f"   총 문제 수: {stats['total_questions']}개")
    print(f"   카테고리별:")
    for cat, count in stats['categories'].items():
        print(f"     - {cat}: {count}개")
    
    # 랜덤 테스트 생성
    print(f"\n[테스트] 랜덤 테스트 생성 (5문제)")
    test_questions = manager.generate_random_test(
        num_questions=5,
        category="소프트웨어설계",
        shuffle_options=True
    )
    
    for i, q in enumerate(test_questions, 1):
        print(f"\n[문제 {i}] ({q.difficulty})")
        print(f"Q: {q.question}")
        print("선택지:")
        for j, opt in enumerate(q.options, 1):
            mark = "→" if j-1 == q.correct_answer else " "
            print(f"  {mark} {j}. {opt}")
        print(f"출처: {q.year}년 {q.round} ({q.id})")