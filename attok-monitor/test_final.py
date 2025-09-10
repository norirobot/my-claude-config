"""
최종 필터링 테스트
"""
from accurate_81_monitor import Accurate81Monitor

monitor = Accurate81Monitor()

# 테스트할 이름들
test_cases = [
    # 제외되어야 할 것들
    ("출결", False),
    ("학생", False),
    ("학생등록", False),
    ("등록", False),
    ("미등록", False),
    
    # 포함되어야 할 것들
    ("테스트1", True),
    ("테스트2", True),
    ("김도윤(성광)", True),
    ("김현수", True),
    ("남궁민수", True),
    ("이지완(율원)", True),
]

print("최종 필터링 테스트")
print("=" * 50)

for name, expected in test_cases:
    result = monitor.is_valid_student_name(name)
    status = "[OK]" if result == expected else "[X]"
    print(f"{status} {name:20s} -> 예상: {expected}, 결과: {result}")

print("=" * 50)