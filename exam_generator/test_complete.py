"""
통합 테스트 - 개선된 문제 생성 시스템
"""

import sys
import os

# 개선된 문제 생성기 임포트
from question_generator_improved import ImprovedQuestionGenerator
from document_reader import DocumentReader
from data_manager import DataManager


def test_improved_generator():
    """개선된 생성기 테스트"""
    
    print("=" * 70)
    print("한국 국가공인자격증 문제 생성기 - 개선 버전 테스트")
    print("=" * 70)
    print()
    
    # 테스트용 텍스트
    test_text = """
    정보처리기사는 한국산업인력공단에서 시행하는 국가기술자격 시험으로, 정보시스템의 분석, 설계, 구현, 시험, 운영 및 유지보수와 관련된 전문 기술을 평가하는 자격증입니다.
    
    소프트웨어 개발 방법론은 소프트웨어를 체계적으로 개발하기 위한 절차와 방법을 정의한 것입니다. 대표적인 방법론으로는 폭포수 모델, 애자일 방법론, 스크럼, 익스트림 프로그래밍(XP) 등이 있습니다.
    
    폭포수 모델은 순차적으로 진행되는 전통적인 개발 방법론으로, 요구사항 분석, 설계, 구현, 테스트, 유지보수의 단계를 거칩니다. 각 단계가 완료된 후 다음 단계로 진행되며, 이전 단계로의 회귀가 어렵다는 특징이 있습니다.
    
    애자일 방법론은 변화에 유연하게 대응하고 고객과의 소통을 중시하는 개발 방법론입니다. 짧은 주기의 반복적인 개발을 통해 빠르게 동작하는 소프트웨어를 제공하며, 지속적인 피드백을 통해 품질을 향상시킵니다.
    
    데이터베이스 관리 시스템(DBMS)은 데이터베이스를 구축하고 관리하는 소프트웨어입니다. 데이터의 저장, 검색, 수정, 삭제 등의 기능을 제공하며, 데이터의 무결성, 보안, 동시성 제어 등을 담당합니다.
    """
    
    # 생성기 초기화
    generator = ImprovedQuestionGenerator()
    
    # 각 유형별 테스트
    types = ["정의형", "정의형", "정의형"]  # 정의형 중심 테스트
    difficulties = ["하", "중", "상"]
    
    all_questions = []
    
    for qtype, difficulty in zip(types, difficulties):
        print(f"\n[{difficulty} 난이도 - {qtype} 문제 생성]")
        print("-" * 50)
        
        questions = generator.generate_questions(
            text=test_text,
            question_type=qtype,
            difficulty=difficulty,
            num_questions=2
        )
        
        for i, q in enumerate(questions, 1):
            print(f"\n문제 {i}:")
            print(f"Q: {q.question}")
            print("\n선택지:")
            for j, opt in enumerate(q.options, 1):
                mark = ">>" if j-1 == q.answer else "  "
                print(f"  {mark} {j}. {opt}")
            print(f"\n[해설] {q.explanation}")
            print(f"[난이도] {q.difficulty} | [유형] {q.question_type}")
            
            # 품질 체크
            unique_options = len(set(q.options))
            if unique_options < 4:
                print(f"[WARNING] 선택지 다양성 경고: {unique_options}/4")
            else:
                print(f"[OK] 선택지 다양성 정상: {unique_options}/4")
            
            all_questions.append(q)
    
    # 전체 통계
    print("\n" + "=" * 70)
    print("전체 테스트 결과")
    print("=" * 70)
    
    print(f"[OK] 총 생성된 문제: {len(all_questions)}개")
    
    # 선택지 다양성 통계
    diversity_scores = [len(set(q.options)) for q in all_questions]
    avg_diversity = sum(diversity_scores) / len(diversity_scores)
    print(f"[통계] 평균 선택지 다양성: {avg_diversity:.1f}/4.0")
    
    perfect_questions = sum(1 for score in diversity_scores if score == 4)
    print(f"[우수] 완벽한 다양성 문제: {perfect_questions}/{len(all_questions)}")
    
    # 데이터 저장 테스트
    print("\n[저장] 데이터 저장 테스트...")
    data_manager = DataManager()
    
    # JSON 저장 (Question 객체를 딕셔너리로 변환)
    questions_dict = [q.to_dict() for q in all_questions]
    output_file = data_manager.save_questions_to_json(questions_dict)
    if output_file:
        print(f"[OK] JSON 파일 저장 완료: {output_file}")
    
    # Excel 저장 테스트
    try:
        excel_filename = str(output_file).replace('.json', '.xlsx')
        excel_file = data_manager.export_to_excel(questions_dict, excel_filename)
        if excel_file:
            print(f"[OK] Excel 파일 저장 완료: {excel_file}")
    except Exception as e:
        print(f"[WARNING] Excel 저장 실패: {e}")
    
    print("\n" + "=" * 70)
    print("[성공] 모든 테스트 완료!")
    print("=" * 70)


def test_with_sample_file():
    """샘플 파일로 테스트"""
    
    print("\n" + "=" * 70)
    print("샘플 파일 테스트")
    print("=" * 70)
    
    sample_file = "sample_input.txt"
    
    if not os.path.exists(sample_file):
        print(f"[ERROR] 샘플 파일을 찾을 수 없습니다: {sample_file}")
        return
    
    # 문서 읽기
    reader = DocumentReader()
    content = reader.read_file(sample_file)
    
    if not content:
        print("[ERROR] 문서를 읽을 수 없습니다.")
        return
    
    print(f"[OK] 문서 읽기 성공: {len(content)} 글자")
    print(f"[미리보기] 첫 200자: {content[:200]}...")
    
    # 문제 생성
    generator = ImprovedQuestionGenerator()
    questions = generator.generate_questions(
        text=content,
        question_type="혼합",
        difficulty="중",
        num_questions=5
    )
    
    print(f"\n[OK] {len(questions)}개 문제 생성 완료")
    
    # 첫 번째 문제만 표시
    if questions:
        q = questions[0]
        print(f"\n[샘플 문제]")
        print(f"Q: {q.question}")
        print("선택지:")
        for i, opt in enumerate(q.options, 1):
            mark = "->" if i-1 == q.answer else "  "
            print(f"  {mark} {i}. {opt}")


if __name__ == "__main__":
    print("통합 테스트 시작\n")
    
    # 기본 테스트
    test_improved_generator()
    
    # 샘플 파일 테스트
    test_with_sample_file()
    
    print("\n[완료] 모든 테스트가 완료되었습니다!")
    print("\n사용 방법:")
    print("1. 웹 인터페이스: streamlit run app_improved.py")
    print("2. CLI: python main_smart.py sample_input.txt")
    print("3. API 사용: python main_smart.py sample_input.txt --api-key YOUR_KEY")