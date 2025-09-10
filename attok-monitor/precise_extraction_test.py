"""
정밀 추출 테스트 - 배경이 어떻게 추출되는지 확인
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style

init()

def precise_extraction():
    """라인별로 정확히 추출하여 배경이 어디서 나오는지 확인"""
    
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get("https://attok.co.kr/")
        print(f"{Fore.YELLOW}로그인 후 출결 페이지로 이동한 다음 Enter를 눌러주세요...{Style.RESET_ALL}")
        input()
        
        print(f"\n{Fore.CYAN}=== 정밀 라인별 분석 ==={Style.RESET_ALL}\n")
        
        # body 텍스트 가져오기
        body_element = driver.find_element(By.TAG_NAME, "body")
        full_text = body_element.text
        lines = full_text.split('\n')
        
        print(f"전체 라인 수: {len(lines)}개\n")
        
        # 배 관련 텍스트 찾기
        print(f"{Fore.YELLOW}['배'로 시작하는 모든 라인]{Style.RESET_ALL}")
        bae_lines = []
        for i, line in enumerate(lines):
            if line.strip().startswith('배'):
                bae_lines.append((i, line.strip()))
                print(f"  라인 {i+1:4d}: '{line.strip()}'")
                
                # 전후 라인도 출력
                if i > 0:
                    print(f"       이전: '{lines[i-1].strip()}'")
                if i < len(lines) - 1:
                    print(f"       다음: '{lines[i+1].strip()}'")
                print()
        
        # 등원/하원 패턴 찾기
        print(f"\n{Fore.YELLOW}[등원/하원 패턴 분석]{Style.RESET_ALL}")
        students_with_attendance = []
        
        for i in range(len(lines) - 1):
            current = lines[i].strip()
            next_line = lines[i+1].strip() if i+1 < len(lines) else ""
            
            # 등원과 하원이 있는 라인 찾기
            if "등원" in next_line and "하원" in next_line:
                students_with_attendance.append({
                    'line_num': i+1,
                    'name': current,
                    'attendance': next_line
                })
                
                # 배로 시작하는 이름 특별 출력
                if current.startswith('배'):
                    print(f"{Fore.RED}[!] 배로 시작: 라인 {i+1}{Style.RESET_ALL}")
                    print(f"    이름: '{current}'")
                    print(f"    출결: '{next_line}'")
                    
                    # 더 많은 컨텍스트 출력
                    if i >= 2:
                        print(f"    -2: '{lines[i-2].strip()}'")
                    if i >= 1:
                        print(f"    -1: '{lines[i-1].strip()}'")
                    print(f"     0: '{current}'")
                    print(f"    +1: '{next_line}'")
                    if i+2 < len(lines):
                        print(f"    +2: '{lines[i+2].strip()}'")
                    print()
        
        # 결과 요약
        print(f"\n{Fore.GREEN}=== 요약 ==={Style.RESET_ALL}")
        print(f"'배'로 시작하는 라인: {len(bae_lines)}개")
        print(f"출결 정보가 있는 학생: {len(students_with_attendance)}명")
        
        # 배로 시작하는 학생들만 출력
        bae_students = [s for s in students_with_attendance if s['name'].startswith('배')]
        print(f"\n배로 시작하는 학생:")
        for student in bae_students:
            print(f"  - {student['name']}")
        
        # 특수 패턴 확인
        print(f"\n{Fore.YELLOW}[특수 패턴 확인]{Style.RESET_ALL}")
        
        # 연속된 공백이나 특수문자 확인
        for i, line in enumerate(lines):
            # 탭이나 여러 공백이 있는 경우
            if '\t' in line or '  ' in line:
                if '배' in line:
                    print(f"라인 {i+1}에 탭/공백 + '배' 포함:")
                    print(f"  원본: '{line}'")
                    print(f"  strip: '{line.strip()}'")
                    # 바이트 단위로 출력
                    print(f"  길이: {len(line)}, strip 길이: {len(line.strip())}")
        
        # ul/li 구조 직접 확인
        print(f"\n{Fore.YELLOW}[UL/LI 구조 확인]{Style.RESET_ALL}")
        
        ul_elements = driver.find_elements(By.TAG_NAME, "ul")
        for ul_idx, ul in enumerate(ul_elements):
            li_items = ul.find_elements(By.TAG_NAME, "li")
            
            # 학생 목록일 가능성이 있는 ul (70-90개 li)
            if 70 <= len(li_items) <= 90:
                print(f"\nUL #{ul_idx+1}: {len(li_items)}개 항목")
                
                # 배로 시작하는 항목 찾기
                for li_idx, li in enumerate(li_items):
                    li_text = li.text.strip()
                    if li_text.startswith('배'):
                        print(f"  LI #{li_idx+1}: '{li_text}'")
                        
                        # innerHTML 확인
                        inner_html = li.get_attribute('innerHTML')
                        if '배경' in inner_html:
                            print(f"    {Fore.RED}[!] innerHTML에 '배경' 포함{Style.RESET_ALL}")
                            
                        # 자식 요소들 확인
                        children = li.find_elements(By.XPATH, "./*")
                        if children:
                            print(f"    자식 요소 {len(children)}개:")
                            for child in children:
                                child_text = child.text.strip()
                                if child_text:
                                    print(f"      - {child.tag_name}: '{child_text[:30]}'")
        
    except Exception as e:
        print(f"{Fore.RED}오류: {str(e)}{Style.RESET_ALL}")
    
    finally:
        input("\nEnter를 눌러 종료...")
        driver.quit()

if __name__ == "__main__":
    precise_extraction()