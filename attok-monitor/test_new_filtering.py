"""
개선된 필터링 로직 테스트
"""
from accurate_81_monitor import Accurate81Monitor

def test_new_filtering():
    """괄호 있는 이름과 미등록 같은 단어 테스트"""
    
    monitor = Accurate81Monitor()
    
    # 테스트할 텍스트들
    test_cases = [
        # 괄호가 있는 실제 학생들 (통과해야 함)
        ("김도윤(성광)", True, "학교명이 있는 학생"),
        ("김도현(침산초)", True, "학교명이 있는 학생"),
        ("김동훈 동변초", False, "괄호 없는 학교명 - 현재는 실패할 수 있음"),
        ("이지완(율원)", True, "학교명이 있는 학생"),
        ("이지한(칠성)", True, "학교명이 있는 학생"),
        
        # 제외되어야 할 것들
        ("신명신원장님", False, "원장님 직책"),
        ("테스트1", False, "숫자 포함"),
        ("미등록", False, "시스템 용어"),
        ("미지정", False, "시스템 용어"),
        ("등원(1)", False, "괄호 안 숫자"),
        ("결석(0)", False, "괄호 안 숫자"),
        ("담임", False, "직책"),
        
        # 정상적인 이름들 (통과해야 함)
        ("김현수", True, "정상 3글자"),
        ("박서준", True, "정상 3글자"),
        ("이민", True, "정상 2글자"),
        ("홍길동", True, "정상 3글자"),
        ("남궁민수", True, "정상 4글자"),
        
        # 엣지 케이스
        ("김", False, "1글자는 제외"),
        ("가나다라마바", False, "6글자는 너무 김"),
        ("123", False, "숫자만"),
        ("하하하", False, "반복 글자"),
    ]
    
    print("=" * 70)
    print("개선된 필터링 테스트")
    print("=" * 70)
    
    passed = 0
    failed = 0
    
    for text, expected, description in test_cases:
        result = monitor.is_valid_student_name(text)
        status = "PASS" if result == expected else "FAIL"
        
        if result == expected:
            passed += 1
            symbol = "[OK]"
        else:
            failed += 1
            symbol = "[X]"
            
        print(f"{symbol} {text:20s} | 예상: {str(expected):5s} | 결과: {str(result):5s} | {description}")
    
    print("\n" + "=" * 70)
    print(f"테스트 결과: {passed}/{len(test_cases)} 통과, {failed} 실패")
    
    if failed == 0:
        print("모든 테스트 통과!")
    else:
        print(f"주의: {failed}개 테스트 실패")

if __name__ == "__main__":
    test_new_filtering()