"""
간단한 테스트 - 실제로 학생을 찾을 수 있는지 확인
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style
import time

init()

def simple_test():
    """간단하게 학생 찾기 테스트"""
    
    # 브라우저 설정
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    driver = webdriver.Chrome(options=options)
    
    print(f"{Fore.GREEN}브라우저를 시작했습니다.{Style.RESET_ALL}")
    driver.get("https://attok.co.kr/")
    
    print(f"{Fore.YELLOW}로그인 후 Enter를 눌러주세요...{Style.RESET_ALL}")
    input()
    
    print(f"\n{Fore.CYAN}=== 학생 찾기 테스트 ==={Style.RESET_ALL}\n")
    
    # 1. 모든 요소의 텍스트를 확인
    print("페이지 전체 텍스트 확인...")
    page_text = driver.find_element(By.TAG_NAME, "body").text
    
    # 한글 이름 패턴 찾기
    lines = page_text.split('\n')
    korean_names = []
    
    for line in lines:
        line = line.strip()
        # 2-5글자 한글 (공백 포함)
        if 2 <= len(line) <= 5:
            # 모든 글자가 한글인지 확인
            if all(ord('가') <= ord(c) <= ord('힣') or c == ' ' for c in line):
                # 일반적인 버튼/메뉴 텍스트 제외
                exclude_words = ['정보수정', '출결', '수납', '등원', '하원', '출석', '결석', 
                               '등록', '퇴원', '전체', '조회', '검색', '추가', '삭제',
                               '수정', '확인', '취소', '저장', '닫기', '로그인', '로그아웃']
                if line not in exclude_words:
                    korean_names.append(line)
    
    print(f"\n{Fore.GREEN}발견된 한글 이름 후보:{Style.RESET_ALL}")
    unique_names = list(set(korean_names))  # set을 list로 변환
    for i, name in enumerate(unique_names[:20], 1):  # 중복 제거, 처음 20개만
        print(f"  {i}. {name}")
    
    # 2. 특정 CSS 클래스나 태그 확인
    print(f"\n{Fore.CYAN}=== CSS 선택자 테스트 ==={Style.RESET_ALL}")
    
    selectors_to_test = [
        "div.box",
        "div[class*='student']",
        "div[class*='member']",
        "td",  # 테이블 셀
        "span[class*='name']",
        "div[class*='card']",
        "div[class*='list']",
        "div[class*='item']"
    ]
    
    for selector in selectors_to_test:
        elements = driver.find_elements(By.CSS_SELECTOR, selector)
        if elements:
            print(f"\n{selector}: {len(elements)}개 발견")
            # 처음 3개 요소의 텍스트 출력
            for i, elem in enumerate(elements[:3]):
                text = elem.text.strip()
                if text:
                    # 텍스트가 너무 길면 처음 50자만
                    display_text = text[:50] + "..." if len(text) > 50 else text
                    # 줄바꿈을 공백으로 변경
                    display_text = display_text.replace('\n', ' | ')
                    print(f"  요소 {i+1}: {display_text}")
    
    # 3. 체크박스가 있는 요소 찾기
    print(f"\n{Fore.CYAN}=== 체크박스 부모 요소 ==={Style.RESET_ALL}")
    checkboxes = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
    print(f"체크박스 수: {len(checkboxes)}개")
    
    if checkboxes:
        # 처음 5개 체크박스의 부모 요소 확인
        for i, checkbox in enumerate(checkboxes[:5]):
            try:
                # 부모 요소 찾기
                parent = checkbox.find_element(By.XPATH, "..")
                grandparent = parent.find_element(By.XPATH, "..")
                
                # 부모나 조부모 요소의 텍스트
                parent_text = parent.text.strip()
                if parent_text:
                    print(f"\n체크박스 {i+1} 부모 텍스트:")
                    lines = parent_text.split('\n')[:3]  # 처음 3줄만
                    for line in lines:
                        print(f"  - {line[:30]}")
            except:
                pass
    
    input(f"\n{Fore.YELLOW}Enter를 눌러 브라우저를 종료하세요...{Style.RESET_ALL}")
    driver.quit()

if __name__ == "__main__":
    simple_test()