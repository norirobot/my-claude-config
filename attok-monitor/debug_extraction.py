"""
학생 추출 디버깅 - 배경이 어디서 나오는지 확인
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style
import re

init()

def debug_extraction():
    """등원/하원 패턴 디버깅"""
    
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get("https://attok.co.kr/")
        print(f"{Fore.YELLOW}로그인 후 출결 페이지로 이동한 다음 Enter를 눌러주세요...{Style.RESET_ALL}")
        input()
        
        print(f"\n{Fore.CYAN}=== 학생 추출 디버깅 ==={Style.RESET_ALL}\n")
        
        # 전체 텍스트 가져오기
        page_text = driver.find_element(By.TAG_NAME, "body").text
        lines = page_text.split('\n')
        
        print(f"전체 라인 수: {len(lines)}개\n")
        
        # 등원/하원 패턴 찾기
        students_found = []
        
        for i in range(len(lines) - 1):
            current_line = lines[i].strip()
            next_line = lines[i + 1].strip() if i + 1 < len(lines) else ""
            
            # "등원"과 "하원"이 포함된 라인 찾기
            if "등원" in next_line and "하원" in next_line:
                students_found.append({
                    'line_num': i + 1,
                    'name': current_line,
                    'attendance': next_line
                })
                
                # "배"로 시작하는 이름들 특별히 체크
                if current_line.startswith("배"):
                    print(f"[배로 시작하는 이름 발견]")
                    print(f"  라인 {i+1}: '{current_line}'")
                    print(f"  다음 라인: '{next_line}'")
                    print(f"  이전 라인: '{lines[i-1] if i > 0 else 'N/A'}'")
                    print()
        
        print(f"\n총 {len(students_found)}명 발견\n")
        
        # 배로 시작하는 모든 이름 출력
        bae_names = [s for s in students_found if s['name'].startswith("배")]
        print(f"'배'로 시작하는 이름들:")
        for student in bae_names:
            print(f"  - {student['name']}")
        
        # 전체 목록에서 중복 확인
        all_names = [s['name'] for s in students_found]
        duplicates = []
        seen = set()
        
        for name in all_names:
            if name in seen:
                duplicates.append(name)
            seen.add(name)
        
        if duplicates:
            print(f"\n중복된 이름: {duplicates}")
        
        # "배경"이 포함된 라인 직접 검색
        print(f"\n'배경' 텍스트 검색:")
        for i, line in enumerate(lines):
            if "배경" in line:
                print(f"  라인 {i+1}: '{line}'")
                if i > 0:
                    print(f"    이전: '{lines[i-1]}'")
                if i < len(lines) - 1:
                    print(f"    다음: '{lines[i+1]}'")
        
    except Exception as e:
        print(f"{Fore.RED}오류: {str(e)}{Style.RESET_ALL}")
    
    finally:
        input("\nEnter를 눌러 종료...")
        driver.quit()

if __name__ == "__main__":
    debug_extraction()