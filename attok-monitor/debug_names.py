"""
이름 필터링 디버그
"""
from accurate_81_monitor import Accurate81Monitor

monitor = Accurate81Monitor()

# 실패한 이름들 디버그
test_names = ["김현수", "남궁민수", "수", "현수"]

for name in test_names:
    print(f"\n테스트: '{name}'")
    print(f"  길이: {len(name)}")
    
    # UI 요소 체크
    for ui_word in monitor.ui_elements:
        if ui_word in name or ui_word == name:
            print(f"  UI 요소 매치: '{ui_word}'")
            
    # 한글 체크
    korean_chars = sum(1 for c in name if '가' <= c <= '힣')
    print(f"  한글 글자 수: {korean_chars}")
    
    # 최종 결과
    result = monitor.is_valid_student_name(name)
    print(f"  결과: {result}")