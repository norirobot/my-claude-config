"""
학생 명단 검증 도구
"""

# 실제 출결 리스트에서 추출한 이름들
actual_students = """231312423
권혜진
김도윤
김도윤(성광)
김도현
김도현(침산초)
김동현
김동훈 동변초
김민석
김보나
김소연
김승래
김시후
김우성
김은채
김정현
김종윤
김준엽
김현수
남수범
노민준
문지우
박상혁
박시우
박은우
박지현
배진우
백서연
백준호
서민욱
서민준
서상원
서수아
서율
서주현
서현준
석재범
손승빈
송지호
신명신원장님
안수아
안준혁
오시헌
외
원호연
유진섭
이게 된다고? 진
이범무
이범호
이승민
이시헌
이재윤
이지완(율원)
이지한(칠성)
이지환
이채민
이태윤
이한영
임서진
임예성
임예준
임준성
임준영
장도영
장유준
전강민
전지환
정도윤
정민규
정승진
조우영
조우준
조윤호
채아인
최문석
최승민
최시우
테스트1
한지후
허수혁
홍우택
홍지훈
황경민
황기민
흠먄 읗머야-+"""

# 리스트로 변환
students = [s.strip() for s in actual_students.strip().split('\n') if s.strip()]

print("=" * 60)
print("학생 명단 검증")
print("=" * 60)

print(f"\n총 학생 수: {len(students)}명")

# 특이한 이름들 확인
print("\n특이한 형식의 이름들:")
special_names = []

for name in students:
    # 숫자만 있는 이름
    if name.isdigit():
        special_names.append((name, "숫자만"))
    # 1글자 이름
    elif len(name) == 1:
        special_names.append((name, "1글자"))
    # 특수문자 포함
    elif any(c in name for c in "?!@#$%^&*()-+="):
        special_names.append((name, "특수문자"))
    # 공백 포함
    elif ' ' in name and '(' not in name:
        special_names.append((name, "공백포함"))
    # 괄호 포함
    elif '(' in name:
        special_names.append((name, "괄호포함"))
    # 직책 포함
    elif any(title in name for title in ['원장님', '선생님']):
        special_names.append((name, "직책포함"))

for name, type_desc in special_names:
    print(f"  - {name:20s} ({type_desc})")

print(f"\n일반 형식: {len(students) - len(special_names)}명")
print(f"특수 형식: {len(special_names)}명")

# 중복 확인
duplicates = []
seen = set()
for name in students:
    if name in seen:
        duplicates.append(name)
    seen.add(name)

if duplicates:
    print(f"\n중복된 이름: {duplicates}")
else:
    print("\n중복 없음")

# 알파벳 순 정렬 출력
print("\n전체 명단 (정렬):")
for i, name in enumerate(sorted(students), 1):
    print(f"{i:3d}. {name}")