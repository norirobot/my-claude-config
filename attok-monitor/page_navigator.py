"""
페이지 네비게이션 분석 - 81명 학생을 모두 보기 위한 방법 찾기
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from colorama import init, Fore, Style
import time

init()

def analyze_pagination():
    """페이지네이션 및 탭 구조 분석"""
    
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
        
        print(f"\n{Fore.CYAN}=== 페이지 구조 분석 ==={Style.RESET_ALL}\n")
        
        # 1. 탭/메뉴 구조 확인
        print(f"{Fore.YELLOW}1. 탭/메뉴 구조:{Style.RESET_ALL}")
        
        # 가능한 탭 선택자들
        tab_selectors = [
            "ul.nav-tabs li",
            "div.tab-menu",
            "a[class*='tab']",
            "button[class*='tab']",
            "div[role='tab']",
            "a[href*='#']",  # 앵커 링크
            "span.tab",
            "div.menu-item"
        ]
        
        for selector in tab_selectors:
            tabs = driver.find_elements(By.CSS_SELECTOR, selector)
            if tabs and len(tabs) > 1:
                print(f"  {selector}: {len(tabs)}개 탭/메뉴 발견")
                for i, tab in enumerate(tabs[:5]):
                    text = tab.text.strip()
                    if text:
                        print(f"    - 탭 {i+1}: {text}")
        
        # 2. 페이지네이션 확인
        print(f"\n{Fore.YELLOW}2. 페이지네이션:{Style.RESET_ALL}")
        
        pagination_selectors = [
            "ul.pagination li",
            "div.paging",
            "a[class*='page']",
            "button[class*='page']",
            "span.page-number",
            "a[href*='page=']",
            "button.next",
            "button.prev",
            "div[class*='paginator']"
        ]
        
        for selector in pagination_selectors:
            pages = driver.find_elements(By.CSS_SELECTOR, selector)
            if pages:
                print(f"  {selector}: {len(pages)}개 페이지 요소 발견")
                for i, page in enumerate(pages[:5]):
                    text = page.text.strip()
                    if text:
                        print(f"    - {text}")
        
        # 3. 드롭다운/선택 박스 확인
        print(f"\n{Fore.YELLOW}3. 드롭다운/필터:{Style.RESET_ALL}")
        
        selects = driver.find_elements(By.TAG_NAME, "select")
        for i, select in enumerate(selects):
            options = select.find_elements(By.TAG_NAME, "option")
            print(f"  선택박스 {i+1}: {len(options)}개 옵션")
            for j, option in enumerate(options[:5]):
                print(f"    - {option.text}")
        
        # 4. 현재 보이는 학생 수 확인
        print(f"\n{Fore.YELLOW}4. 현재 화면 학생 분석:{Style.RESET_ALL}")
        
        # 체크박스가 있는 요소들
        visible_checkboxes = []
        all_checkboxes = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
        
        for cb in all_checkboxes:
            if cb.is_displayed():
                visible_checkboxes.append(cb)
        
        print(f"  전체 체크박스: {len(all_checkboxes)}개")
        print(f"  화면에 보이는 체크박스: {len(visible_checkboxes)}개")
        
        # 5. 스크롤 가능 영역 확인
        print(f"\n{Fore.YELLOW}5. 스크롤 가능 영역:{Style.RESET_ALL}")
        
        scroll_containers = driver.find_elements(By.CSS_SELECTOR, "div[style*='overflow']")
        print(f"  스크롤 가능 컨테이너: {len(scroll_containers)}개")
        
        for i, container in enumerate(scroll_containers[:3]):
            try:
                height = container.size['height']
                scroll_height = driver.execute_script("return arguments[0].scrollHeight", container)
                if scroll_height > height:
                    print(f"    컨테이너 {i+1}: 스크롤 필요 (높이: {height}px, 전체: {scroll_height}px)")
            except:
                pass
        
        # 6. AJAX 로딩 버튼 확인
        print(f"\n{Fore.YELLOW}6. 더보기/로드 버튼:{Style.RESET_ALL}")
        
        load_selectors = [
            "button[class*='more']",
            "button[class*='load']",
            "a[class*='more']",
            "div.load-more",
            "button:contains('더보기')",
            "button:contains('더 보기')",
            "button:contains('전체')"
        ]
        
        for selector in load_selectors:
            try:
                buttons = driver.find_elements(By.CSS_SELECTOR, selector)
                if buttons:
                    print(f"  {selector}: {len(buttons)}개 발견")
            except:
                pass
        
        # 버튼 텍스트로도 찾기
        all_buttons = driver.find_elements(By.TAG_NAME, "button")
        for button in all_buttons:
            text = button.text.strip().lower()
            if any(word in text for word in ['더', '전체', '모두', 'more', 'all', 'load']):
                print(f"  버튼 발견: '{button.text}'")
        
        # 7. 실제 학생 이름 샘플링
        print(f"\n{Fore.YELLOW}7. 현재 화면 학생 이름:{Style.RESET_ALL}")
        
        page_text = driver.find_element(By.TAG_NAME, "body").text
        lines = page_text.split('\n')
        
        student_names = []
        for line in lines:
            line = line.strip()
            # 2-5글자 한글 이름 패턴
            if 2 <= len(line) <= 5:
                if all(ord('가') <= ord(c) <= ord('힣') or c == ' ' for c in line):
                    # 명백한 비이름 제외
                    if line not in ['등원', '하원', '출결', '수납', '전체', '로그인', '납부', '보기', '생일', '반별', '학생별']:
                        student_names.append(line)
        
        # 중복 제거
        unique_names = list(set(student_names))
        print(f"  발견된 학생 이름: {len(unique_names)}명")
        for i, name in enumerate(unique_names[:10]):
            print(f"    {i+1}. {name}")
        
        # 8. JavaScript 변수 확인
        print(f"\n{Fore.YELLOW}8. JavaScript 데이터:{Style.RESET_ALL}")
        
        try:
            # 전역 변수에서 학생 데이터 찾기
            result = driver.execute_script("""
                var found = [];
                for(var key in window) {
                    if(key.toLowerCase().includes('student') || 
                       key.toLowerCase().includes('member') ||
                       key.toLowerCase().includes('data')) {
                        found.push(key);
                    }
                }
                return found;
            """)
            
            if result:
                print(f"  관련 JavaScript 변수 발견:")
                for var in result[:5]:
                    print(f"    - {var}")
        except:
            pass
        
        print(f"\n{Fore.GREEN}=== 분석 완료 ==={Style.RESET_ALL}")
        print(f"\n💡 권장사항:")
        print("1. 페이지네이션이 있다면 각 페이지를 순회")
        print("2. 탭이 있다면 각 탭 클릭하여 확인")
        print("3. 스크롤 가능한 영역이 있다면 스크롤")
        print("4. '더보기' 버튼이 있다면 클릭")
        
    except Exception as e:
        print(f"{Fore.RED}오류: {str(e)}{Style.RESET_ALL}")
        
    finally:
        if driver:
            input(f"\n{Fore.YELLOW}Enter를 눌러 브라우저를 종료하세요...{Style.RESET_ALL}")
            driver.quit()

if __name__ == "__main__":
    analyze_pagination()