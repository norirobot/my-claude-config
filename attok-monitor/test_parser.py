"""
HTML 구조 파싱 테스트 스크립트
실제 페이지 구조를 분석하여 적절한 셀렉터를 찾기 위한 도구
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from colorama import init, Fore, Style

init()

def test_parse_structure():
    """페이지 구조 분석"""
    driver = None
    
    try:
        # 브라우저 시작
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        driver = webdriver.Chrome(options=options)
        
        print(f"{Fore.GREEN}브라우저를 시작했습니다.{Style.RESET_ALL}")
        driver.get("https://attok.co.kr/")
        
        print(f"{Fore.YELLOW}수동으로 로그인 후 Enter를 눌러주세요...{Style.RESET_ALL}")
        input()
        
        print(f"\n{Fore.CYAN}=== 페이지 구조 분석 시작 ==={Style.RESET_ALL}\n")
        
        # 1. 전체 학생 수 찾기
        print(f"{Fore.YELLOW}1. 전체 학생 수 요소 찾기:{Style.RESET_ALL}")
        total_selectors = [
            ("XPATH", "//span[contains(text(), '전체')]"),
            ("XPATH", "//div[contains(text(), '전체')]"),
            ("XPATH", "//a[contains(text(), '전체')]"),
            ("XPATH", "//*[contains(text(), '전체')]"),
            ("CSS", "span:contains('전체')"),
            ("CSS", ".total-count"),
            ("CSS", "#total-students")
        ]
        
        for method, selector in total_selectors:
            try:
                if method == "XPATH":
                    elements = driver.find_elements(By.XPATH, selector)
                else:
                    elements = driver.find_elements(By.CSS_SELECTOR, selector)
                    
                if elements:
                    print(f"  ✓ {method}: {selector} -> {len(elements)}개 찾음")
                    for i, elem in enumerate(elements[:3]):
                        print(f"    - 요소 {i+1}: '{elem.text[:50]}...' (태그: {elem.tag_name})")
            except:
                continue
                
        # 2. 학생 박스/카드 찾기
        print(f"\n{Fore.YELLOW}2. 학생 박스 요소 찾기:{Style.RESET_ALL}")
        box_selectors = [
            "div.student",
            "div.student-box",
            "div.student-card",
            "div.member",
            "div.member-box",
            "div.card",
            "div.box",
            "div[class*='student']",
            "div[class*='member']",
            "div[class*='card']",
            "div[class*='box']",
            "table tr",  # 테이블 구조일 경우
            "ul li",  # 리스트 구조일 경우
            "div[style*='border']",
            "div[style*='radius']"
        ]
        
        for selector in box_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements and len(elements) > 5:  # 학생이 여러명이므로 5개 이상일 때만
                    print(f"  ✓ {selector} -> {len(elements)}개 찾음")
                    
                    # 첫 번째 요소의 구조 분석
                    if elements:
                        elem = elements[0]
                        print(f"    첫 번째 요소 분석:")
                        print(f"      - 클래스: {elem.get_attribute('class')}")
                        print(f"      - ID: {elem.get_attribute('id')}")
                        print(f"      - 배경색: {elem.value_of_css_property('background-color')}")
                        print(f"      - 텍스트 일부: '{elem.text[:100]}...'")
                        
                        # 하위 요소 분석
                        children = elem.find_elements(By.XPATH, ".//*")
                        print(f"      - 하위 요소 수: {len(children)}개")
            except:
                continue
                
        # 3. 체크박스 찾기
        print(f"\n{Fore.YELLOW}3. 체크박스 요소 찾기:{Style.RESET_ALL}")
        checkbox_selectors = [
            "input[type='checkbox']",
            "input.checkbox",
            ".checkbox",
            "input[name*='check']"
        ]
        
        for selector in checkbox_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    print(f"  ✓ {selector} -> {len(elements)}개 찾음")
            except:
                continue
                
        # 4. 이름 요소 찾기
        print(f"\n{Fore.YELLOW}4. 학생 이름 요소 찾기:{Style.RESET_ALL}")
        name_selectors = [
            "span.name",
            "span.student-name",
            "div.name",
            "div.student-name",
            "td.name",
            "a.name",
            "*[class*='name']",
            "label"
        ]
        
        for selector in name_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements and len(elements) > 5:
                    print(f"  ✓ {selector} -> {len(elements)}개 찾음")
                    # 샘플 출력
                    for i, elem in enumerate(elements[:3]):
                        text = elem.text.strip()
                        if text and not text.isdigit():
                            print(f"    - 샘플 {i+1}: '{text}'")
            except:
                continue
                
        # 5. 버튼 찾기
        print(f"\n{Fore.YELLOW}5. 출결/수납 버튼 찾기:{Style.RESET_ALL}")
        button_selectors = [
            "button",
            "input[type='button']",
            "a.button",
            "div.button",
            "*[class*='btn']",
            "*[onclick]"
        ]
        
        for selector in button_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    print(f"  ✓ {selector} -> {len(elements)}개 찾음")
                    # 버튼 텍스트 샘플
                    unique_texts = set()
                    for elem in elements[:20]:
                        text = elem.text.strip()
                        if text:
                            unique_texts.add(text)
                    if unique_texts:
                        print(f"    버튼 텍스트 종류: {', '.join(list(unique_texts)[:10])}")
            except:
                continue
                
        # 6. JavaScript로 추가 분석
        print(f"\n{Fore.YELLOW}6. JavaScript 분석:{Style.RESET_ALL}")
        try:
            # 모든 div 개수
            div_count = driver.execute_script("return document.querySelectorAll('div').length")
            print(f"  - 전체 div 개수: {div_count}개")
            
            # 클래스명에 특정 단어가 포함된 요소
            keywords = ['student', 'member', 'attendance', 'check', 'name', 'box', 'card']
            for keyword in keywords:
                count = driver.execute_script(f"return document.querySelectorAll('[class*=\"{keyword}\"]').length")
                if count > 0:
                    print(f"  - '{keyword}' 포함 클래스: {count}개")
                    
        except Exception as e:
            print(f"  JavaScript 실행 오류: {str(e)}")
            
        print(f"\n{Fore.GREEN}=== 분석 완료 ==={Style.RESET_ALL}")
        print(f"\n위 정보를 바탕으로 monitor.py의 셀렉터를 수정하세요.")
        
    except Exception as e:
        print(f"{Fore.RED}오류 발생: {str(e)}{Style.RESET_ALL}")
        
    finally:
        if driver:
            input(f"\n{Fore.YELLOW}Enter를 눌러 브라우저를 종료하세요...{Style.RESET_ALL}")
            driver.quit()

if __name__ == "__main__":
    test_parse_structure()