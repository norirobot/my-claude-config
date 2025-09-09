"""
엣지 케이스 테스트
"""
from accurate_81_monitor import Accurate81Monitor

monitor = Accurate81Monitor()

# 테스트할 이름들
test_cases = [
    # 새로 추가해야 할 것들
    ("요일", True, "요일이라는 이름"),
    ("김동훈 동변초", True, "공백으로 구분된 학교명"),
    ("신명신원장님", True, "이름+직책"),
    
    # 여전히 제외되어야 할 것들
    ("원장님", False, "직책만"),
    ("월", False, "요일 단독"),
    ("화", False, "요일 단독"),
    ("출결", False, "시스템 용어"),
    ("학생", False, "시스템 용어"),
    
    # 기존 테스트
    ("테스트1", True, "테스트용 이름"),
    ("김도윤(성광)", True, "괄호 학교명"),
    ("김현수", True, "일반 이름"),
]

print("엣지 케이스 테스트")
print("=" * 60)

passed = 0
failed = 0

for name, expected, desc in test_cases:
    result = monitor.is_valid_student_name(name)
    if result == expected:
        status = "[OK]"
        passed += 1
    else:
        status = "[X]"
        failed += 1
    
    print(f"{status} {name:20s} | 예상: {str(expected):5s} | 결과: {str(result):5s} | {desc}")

print("=" * 60)
print(f"결과: {passed}/{len(test_cases)} 통과")

if failed > 0:
    print(f"실패: {failed}개")