"""
정밀 분석기 - 실제 학생만 정확히 구분
테이블 구조와 패턴을 분석하여 학생 찾기
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style
import time

init()

def analyze_structure():
    """페이지 구조를 정밀 분석"""
    
    driver = None
    try:
        # 브라우저 시작
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        driver = webdriver.Chrome(options=options)
        
        print(f"{Fore.GREEN}브라우저를 시작했습니다.{Style.RESET_ALL}")
        driver.get("https://attok.co.kr/")
        
        print(f"{Fore.YELLOW}로그인 후 Enter를 눌러주세요...{Style.RESET_ALL}")
        input()
        
        print(f"\n{Fore.CYAN}=== 정밀 구조 분석 시작 ==={Style.RESET_ALL}\n")
        
        # 1. 테이블 구조 확인
        print(f"{Fore.YELLOW}1. 테이블 구조 분석:{Style.RESET_ALL}")
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"테이블 수: {len(tables)}개")
        
        for i, table in enumerate(tables[:3]):  # 처음 3개 테이블만
            rows = table.find_elements(By.TAG_NAME, "tr")
            print(f"\n테이블 {i+1}: {len(rows)}개 행")
            
            # 첫 번째 행 (헤더일 가능성)
            if rows:
                first_row = rows[0]
                cells = first_row.find_elements(By.TAG_NAME, "th") or first_row.find_elements(By.TAG_NAME, "td")
                print(f"  첫 행 셀 수: {len(cells)}개")
                for j, cell in enumerate(cells[:5]):
                    print(f"    셀 {j+1}: '{cell.text[:20]}'")
        
        # 2. 학생으로 보이는 행 찾기
        print(f"\n{Fore.YELLOW}2. 학생 패턴 분석:{Style.RESET_ALL}")
        
        # 모든 tr 요소
        all_rows = driver.find_elements(By.TAG_NAME, "tr")
        student_rows = []
        
        for row in all_rows:
            row_text = row.text
            
            # 학생 행 판별 조건
            # - 체크박스가 있음
            # - 한글 이름이 있음
            # - 등원/하원 텍스트가 있음
            
            has_checkbox = len(row.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")) > 0
            has_attendance = "등원" in row_text or "하원" in row_text
            
            # 한글 이름 패턴 찾기
            has_name = False
            cells = row.find_elements(By.TAG_NAME, "td")
            for cell in cells:
                cell_text = cell.text.strip()
                # 2-5글자 한글
                if 2 <= len(cell_text) <= 5:
                    if all(ord('가') <= ord(c) <= ord('힣') or c == ' ' for c in cell_text):
                        # 메뉴 단어가 아닌 경우
                        if cell_text not in ['등원', '하원', '출결', '수납', '정보수정', '전체', '조회']:
                            has_name = True
                            break
            
            if has_checkbox or (has_attendance and has_name):
                student_rows.append(row)
        
        print(f"학생으로 추정되는 행: {len(student_rows)}개")
        
        # 3. 학생 정보 추출
        print(f"\n{Fore.YELLOW}3. 학생 정보 추출:{Style.RESET_ALL}")
        
        students = []
        for i, row in enumerate(student_rows[:30]):  # 처음 30명만
            cells = row.find_elements(By.TAG_NAME, "td")
            
            student_info = {
                'index': i + 1,
                'name': None,
                'has_checkbox': False,
                'attendance_time': None,
                'row_text': row.text[:100]
            }
            
            # 체크박스 확인
            checkboxes = row.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
            if checkboxes:
                student_info['has_checkbox'] = True
                student_info['checked'] = checkboxes[0].is_selected()
            
            # 각 셀에서 정보 추출
            for j, cell in enumerate(cells):
                cell_text = cell.text.strip()
                
                # 이름 찾기 (2-5글자 한글)
                if not student_info['name'] and 2 <= len(cell_text) <= 5:
                    if all(ord('가') <= ord(c) <= ord('힣') or c == ' ' for c in cell_text):
                        if cell_text not in ['등원', '하원', '출결', '수납']:
                            student_info['name'] = cell_text
                
                # 시간 정보 찾기
                if ':' in cell_text and len(cell_text) <= 10:
                    student_info['attendance_time'] = cell_text
            
            if student_info['name']:
                students.append(student_info)
        
        # 결과 출력
        print(f"\n{Fore.GREEN}=== 추출된 학생 정보 ==={Style.RESET_ALL}")
        print(f"총 {len(students)}명 확인 (샘플)")
        
        for student in students[:20]:  # 처음 20명만 출력
            status = "✅" if student.get('checked') else "⭕"
            name = student['name'] or f"학생_{student['index']}"
            time = student.get('attendance_time', '-')
            print(f"{status} {name:6s} | 시간: {time:8s}")
        
        # 4. 실제 학생 수 추정
        print(f"\n{Fore.CYAN}=== 최종 분석 ==={Style.RESET_ALL}")
        
        # 다양한 방법으로 학생 수 추정
        checkbox_count = len(driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']"))
        row_count = len(student_rows)
        
        print(f"체크박스 총 개수: {checkbox_count}개")
        print(f"학생으로 추정되는 행: {row_count}개")
        print(f"이름이 확인된 학생: {len(students)}명 (샘플)")
        
        # 페이지에 표시된 "전체" 정보 찾기
        page_text = driver.find_element(By.TAG_NAME, "body").text
        import re
        matches = re.findall(r'전체[^\d]*(\d+)', page_text)
        if matches:
            print(f"\n페이지에 표시된 전체 수:")
            for match in set(matches):
                print(f"  - {match}명")
        
    except Exception as e:
        print(f"{Fore.RED}오류: {str(e)}{Style.RESET_ALL}")
        
    finally:
        if driver:
            input(f"\n{Fore.YELLOW}Enter를 눌러 브라우저를 종료하세요...{Style.RESET_ALL}")
            driver.quit()

if __name__ == "__main__":
    analyze_structure()