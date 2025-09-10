"""
학생 목록이 있는 정확한 테이블/구조 찾기
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style
import time
import re

init()

def find_student_table():
    """학생 목록 테이블 찾기"""
    
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get("https://attok.co.kr/")
        print(f"{Fore.YELLOW}로그인 후 출결 페이지로 이동한 다음 Enter를 눌러주세요...{Style.RESET_ALL}")
        input()
        
        print(f"\n{Fore.CYAN}=== 학생 목록 구조 찾기 ==={Style.RESET_ALL}\n")
        
        # 1. "전체(81)" 텍스트 근처 구조 찾기
        print("1. '전체(81)' 텍스트 근처 찾기...")
        page_text = driver.find_element(By.TAG_NAME, "body").text
        if "전체(81)" in page_text or "전체 (81)" in page_text:
            print(f"  {Fore.GREEN}✓ '전체(81)' 텍스트 발견!{Style.RESET_ALL}")
            
            # 전체(81)이 포함된 요소 찾기
            elements = driver.find_elements(By.XPATH, "//*[contains(text(), '전체')]")
            for elem in elements[:3]:
                print(f"  - 태그: {elem.tag_name}, 클래스: {elem.get_attribute('class')}")
        
        # 2. 테이블 구조 찾기
        print("\n2. 테이블 구조 분석...")
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"  테이블 개수: {len(tables)}개")
        
        for i, table in enumerate(tables):
            rows = table.find_elements(By.TAG_NAME, "tr")
            if len(rows) > 10:  # 학생 목록은 많은 행을 가질 것
                print(f"\n  테이블 #{i+1}: {len(rows)}개 행")
                
                # 처음 5개 행 분석
                for j, row in enumerate(rows[:5]):
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if not cells:
                        cells = row.find_elements(By.TAG_NAME, "th")
                    
                    cell_texts = [cell.text.strip()[:20] for cell in cells if cell.text.strip()]
                    if cell_texts:
                        print(f"    행 {j+1}: {cell_texts}")
        
        # 3. 한글 이름 패턴이 많은 영역 찾기
        print("\n3. 한글 이름이 집중된 영역 찾기...")
        
        # div 컨테이너들 검사
        divs = driver.find_elements(By.TAG_NAME, "div")
        name_containers = []
        
        for div in divs:
            text = div.text
            # 2-5글자 한글 이름 패턴 찾기
            korean_names = re.findall(r'[가-힣]{2,5}', text)
            
            # 한글 이름이 10개 이상 있는 컨테이너
            if len(korean_names) > 10:
                # UI 단어 제외
                ui_words = ['등원', '하원', '출결', '납부', '관리', '설정', '로그인']
                filtered_names = [name for name in korean_names if name not in ui_words]
                
                if len(filtered_names) > 10:
                    name_containers.append({
                        'element': div,
                        'class': div.get_attribute('class'),
                        'id': div.get_attribute('id'),
                        'name_count': len(filtered_names),
                        'sample_names': filtered_names[:5]
                    })
        
        # 가장 많은 이름을 가진 컨테이너 출력
        name_containers.sort(key=lambda x: x['name_count'], reverse=True)
        
        for i, container in enumerate(name_containers[:3]):
            print(f"\n  컨테이너 #{i+1}:")
            print(f"    클래스: {container['class']}")
            print(f"    ID: {container['id']}")
            print(f"    이름 개수: {container['name_count']}개")
            print(f"    샘플: {container['sample_names']}")
        
        # 4. 리스트 구조 찾기 (ul/ol)
        print("\n4. 리스트 구조 찾기...")
        lists = driver.find_elements(By.TAG_NAME, "ul") + driver.find_elements(By.TAG_NAME, "ol")
        
        for lst in lists:
            items = lst.find_elements(By.TAG_NAME, "li")
            if len(items) > 10:
                print(f"  리스트 발견: {len(items)}개 항목")
                for item in items[:3]:
                    print(f"    - {item.text.strip()[:30]}")
        
        # 5. CSS 클래스명으로 추측
        print("\n5. 학생 관련 CSS 클래스 찾기...")
        class_keywords = ['student', 'member', 'user', 'person', 'attendance', 'check']
        
        for keyword in class_keywords:
            elements = driver.find_elements(By.CSS_SELECTOR, f"[class*='{keyword}']")
            if elements:
                print(f"  '{keyword}' 클래스 발견: {len(elements)}개")
                for elem in elements[:2]:
                    print(f"    - {elem.tag_name}: {elem.text.strip()[:50]}")
        
        # 6. data 속성 확인
        print("\n6. data 속성 확인...")
        data_elements = driver.find_elements(By.CSS_SELECTOR, "[data-student-id], [data-member-id], [data-user-id], [data-id]")
        if data_elements:
            print(f"  data 속성 가진 요소: {len(data_elements)}개")
            for elem in data_elements[:3]:
                print(f"    - {elem.tag_name}: {elem.text.strip()[:30]}")
        
        # 7. JavaScript 변수 재확인
        print("\n7. JavaScript 전역 변수 확인...")
        js_result = driver.execute_script("""
            var results = [];
            for(var key in window) {
                if(key.toLowerCase().includes('student') || 
                   key.toLowerCase().includes('member') ||
                   key.toLowerCase().includes('attendance')) {
                    var value = window[key];
                    if(value && (Array.isArray(value) || typeof value === 'object')) {
                        results.push({
                            key: key,
                            type: Array.isArray(value) ? 'array' : 'object',
                            length: Array.isArray(value) ? value.length : Object.keys(value).length
                        });
                    }
                }
            }
            return results;
        """)
        
        if js_result:
            print("  JavaScript 변수 발견:")
            for var in js_result:
                print(f"    - {var['key']}: {var['type']} ({var['length']}개)")
        
        print(f"\n{Fore.GREEN}=== 분석 완료 ==={Style.RESET_ALL}")
        print("\n찾은 구조를 바탕으로 정확한 선택자를 만들 수 있습니다.")
        
    except Exception as e:
        print(f"{Fore.RED}오류: {str(e)}{Style.RESET_ALL}")
    
    finally:
        input("\nEnter를 눌러 종료...")
        driver.quit()

if __name__ == "__main__":
    find_student_table()