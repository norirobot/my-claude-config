"""
필터링 로직 테스트 - 실제 발견된 텍스트로 검증
"""
from accurate_81_monitor import Accurate81Monitor

def test_filtering():
    """이전에 발견된 110개 텍스트로 필터링 테스트"""
    
    monitor = Accurate81Monitor()
    
    # 실제로 발견된 110개 텍스트 (false positives 포함)
    test_texts = [
        # 실제 학생 이름들 (이것들은 통과해야 함)
        "김현수", "이민지", "박서준", "최지우", "정예진",
        "강민호", "윤서연", "조은별", "임하늘", "장준혁",
        "손승빈", "문재영", "안소희", "권태현", "홍길동",
        "배수진", "오정민", "유재석", "신동엽", "김종국",
        
        # False positives (이것들은 제외되어야 함)
        "미납처리", "미납", "등원(1)", "담임", "결석(0)",
        "관리", "등원", "하원", "출석", "결석",
        "로앤코로봇", "납부", "보기", "재학생", "학생별",
        "반별", "생일", "정보수정", "출결", "수납",
        "지각", "조퇴", "전체", "조회", "검색",
        "추가", "삭제", "수정", "확인", "취소",
        "저장", "닫기", "로그인", "로그아웃", "월",
        "화", "수", "목", "금", "토", "일",
        "오전", "오후", "시간", "분", "초",
        "전체반", "수업", "교실", "선생님", "설정",
        "메뉴", "홈", "대시보드", "리포트", "통계",
        "월납", "분납", "할인", "환불", "이월",
        "연체", "독촉", "정상", "비정상", "활성",
        "비활성", "사용", "미사용", "완료", "미완료",
        "시스템", "서버", "데이터", "정보", "상세",
        "요약", "목록", "테이블", "그리드", "차트",
        "그래프", "필터", "정렬", "학년", "반",
        "번호", "학번", "출석번호", "평가", "시험",
        "과제", "숙제", "성적", "점수", "등급",
        "클릭", "선택하세요", "입력하세요", "다운로드", "업로드",
        "인쇄", "내보내기", "가져오기", "새로고침", "되돌리기",
        "다시하기", "(0)", "(1)", "(2)", "123",
        "2024", "2025", "###", "@@@", "..."
    ]
    
    print("=" * 60)
    print("필터링 테스트 시작")
    print("=" * 60)
    
    valid_names = []
    filtered_out = []
    
    for text in test_texts:
        if monitor.is_valid_student_name(text):
            valid_names.append(text)
        else:
            filtered_out.append(text)
    
    print(f"\n[결과 요약]")
    print(f"입력: {len(test_texts)}개")
    print(f"유효한 이름: {len(valid_names)}개")
    print(f"필터링됨: {len(filtered_out)}개")
    
    print(f"\n[유효한 이름으로 판단됨] ({len(valid_names)}개)")
    for i, name in enumerate(valid_names, 1):
        print(f"  {i:3d}. {name}")
    
    print(f"\n[필터링되어 제외됨] (처음 30개)")
    for i, text in enumerate(filtered_out[:30], 1):
        print(f"  {i:3d}. {text}")
    
    # 검증
    print(f"\n[검증]")
    expected_invalid = ["미납처리", "등원(1)", "담임", "결석(0)", "로앤코로봇"]
    for text in expected_invalid:
        if text in valid_names:
            print(f"  [X] 오류: '{text}'가 유효한 이름으로 처리됨")
        else:
            print(f"  [OK] 정상: '{text}'가 올바르게 필터링됨")
    
    print(f"\n테스트 완료!")
    print(f"예상되는 실제 학생 수: 약 20-30명 (테스트 데이터 기준)")
    print(f"실제 찾은 유효한 이름: {len(valid_names)}명")

if __name__ == "__main__":
    test_filtering()