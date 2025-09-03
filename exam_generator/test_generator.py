"""
문제 생성기 테스트 및 검증
로컬 생성 품질 확인용
"""

from question_generator_hybrid import SmartQuestionGenerator, HybridQuestionGenerator


def test_local_generator():
    """로컬 생성기 테스트"""
    
    # 테스트용 텍스트
    test_text = """
    소프트웨어 개발 방법론은 소프트웨어를 체계적으로 개발하기 위한 절차와 방법을 정의한 것입니다. 
    
    폭포수 모델은 순차적으로 진행되는 전통적인 개발 방법론으로, 요구사항 분석, 설계, 구현, 테스트, 유지보수의 단계를 거칩니다. 
    각 단계가 완료된 후 다음 단계로 진행되며, 이전 단계로의 회귀가 어렵다는 특징이 있습니다.
    
    애자일 방법론은 변화에 유연하게 대응하고 고객과의 소통을 중시하는 개발 방법론입니다. 
    짧은 주기의 반복적인 개발을 통해 빠르게 동작하는 소프트웨어를 제공하며, 지속적인 피드백을 통해 품질을 향상시킵니다.
    
    폭포수 모델과 애자일 방법론의 주요 차이점은 다음과 같습니다:
    1. 폭포수는 순차적, 애자일은 반복적
    2. 폭포수는 문서 중심, 애자일은 동작하는 소프트웨어 중심
    3. 폭포수는 변경이 어려움, 애자일은 변화 수용
    """
    
    print("=" * 60)
    print("로컬 문제 생성기 테스트")
    print("=" * 60)
    
    generator = SmartQuestionGenerator()
    
    # 각 유형별 테스트
    types = ["정의형", "특징형", "비교형", "적용형"]
    
    for qtype in types:
        print(f"\n[{qtype} 문제 생성]")
        
        questions = generator.generate_questions(
            text=test_text,
            question_type=qtype,
            difficulty="중",
            num_questions=2
        )
        
        for i, q in enumerate(questions, 1):
            print(f"\n문제 {i}:")
            print(f"Q: {q.question}")
            print("선택지:")
            for j, opt in enumerate(q.options, 1):
                mark = "→" if j-1 == q.answer else " "
                print(f"  {mark} {j}. {opt}")
            print(f"해설: {q.explanation}")
            
            # 선택지 다양성 체크
            unique_options = len(set(q.options))
            if unique_options < 4:
                print(f"[WARNING] 중복 선택지 발견! (고유 선택지: {unique_options}/4)")
            else:
                print(f"[OK] 선택지 다양성: 정상")
    
    print("\n" + "=" * 60)
    print("테스트 완료!")
    print("=" * 60)


def test_hybrid_generator():
    """하이브리드 생성기 테스트"""
    
    test_text = """
    데이터베이스 관리 시스템(DBMS)은 데이터베이스를 구축하고 관리하는 소프트웨어입니다. 
    데이터의 저장, 검색, 수정, 삭제 등의 기능을 제공하며, 데이터의 무결성, 보안, 동시성 제어 등을 담당합니다.
    
    관계형 데이터베이스는 테이블 형태로 데이터를 저장하며, SQL을 사용하여 데이터를 조작합니다. 
    주요 특징으로는 데이터 무결성, 정규화, 트랜잭션 처리 등이 있습니다.
    
    NoSQL 데이터베이스는 비정형 데이터를 효율적으로 처리하기 위한 데이터베이스로, 
    문서형, 키-값, 그래프, 컬럼 패밀리 등의 유형이 있습니다.
    """
    
    print("\n하이브리드 생성기 테스트 (API 키 없이)")
    print("=" * 60)
    
    # API 키 없이 테스트
    generator = HybridQuestionGenerator(api_key=None)
    
    # 미리보기 모드 테스트
    questions = generator.preview_then_generate(
        text=test_text,
        question_type="정의형",
        difficulty="중",
        num_questions=3
    )
    
    print(f"\n총 {len(questions)}개 문제 생성됨")
    
    # 품질 분석
    print("\n[품질 분석]")
    for i, q in enumerate(questions, 1):
        unique_opts = len(set(q.options))
        status = 'OK' if unique_opts == 4 else 'WARNING'
        print(f"문제 {i}: 선택지 다양성 {unique_opts}/4 [{status}]")


if __name__ == "__main__":
    print("문제 생성기 테스트 시작\n")
    
    # 로컬 생성기 테스트
    test_local_generator()
    
    print("\n" + "="*70 + "\n")
    
    # 하이브리드 생성기 테스트
    test_hybrid_generator()
    
    print("\n[SUCCESS] 모든 테스트 완료!")
    print("\n사용 방법:")
    print("1. 로컬 전용: python main_smart.py sample_input.txt")
    print("2. API 사용: python main_smart.py sample_input.txt --api-key YOUR_KEY --use-api")
    print("3. 미리보기: python main_smart.py sample_input.txt --preview")