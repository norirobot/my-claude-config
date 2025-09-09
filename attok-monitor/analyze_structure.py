"""
HTML 구조를 정확히 분석하여 이름 위치 파악
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style
import time

init()

def analyze_structure():
    """체크박스 주변 HTML 구조 상세 분석"""
    
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get("https://attok.co.kr/")
        print(f"{Fore.YELLOW}로그인 후 Enter를 눌러주세요...{Style.RESET_ALL}")
        input()
        
        print(f"\n{Fore.CYAN}=== HTML 구조 분석 ==={Style.RESET_ALL}\n")
        
        # 체크박스 찾기
        checkboxes = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
        print(f"체크박스 개수: {len(checkboxes)}개\n")
        
        # 처음 5개 체크박스의 구조 분석
        for i, checkbox in enumerate(checkboxes[:5]):
            print(f"\n{Fore.YELLOW}체크박스 #{i+1} 구조:{Style.RESET_ALL}")
            
            try:
                # 부모 요소들 추적
                parent = checkbox.find_element(By.XPATH, "..")
                grandparent = parent.find_element(By.XPATH, "..")
                greatgrandparent = grandparent.find_element(By.XPATH, "..")
                
                print(f"  체크박스 태그: {checkbox.tag_name}")
                print(f"  부모 태그: {parent.tag_name} (class: {parent.get_attribute('class')})")
                print(f"  조부모 태그: {grandparent.tag_name} (class: {grandparent.get_attribute('class')})")
                print(f"  증조부모 태그: {greatgrandparent.tag_name}")
                
                # 같은 행의 모든 요소
                if grandparent.tag_name == 'tr' or parent.tag_name == 'tr':
                    row = grandparent if grandparent.tag_name == 'tr' else parent
                    cells = row.find_elements(By.TAG_NAME, "td")
                    print(f"\n  같은 행의 셀 개수: {len(cells)}개")
                    for j, cell in enumerate(cells):
                        text = cell.text.strip()
                        if text:
                            print(f"    셀 {j+1}: '{text[:30]}...' " if len(text) > 30 else f"    셀 {j+1}: '{text}'")
                
                # 형제 요소들
                siblings = parent.find_elements(By.XPATH, "../*")
                print(f"\n  형제 요소 개수: {len(siblings)}개")
                for sibling in siblings[:5]:
                    sibling_text = sibling.text.strip()
                    if sibling_text and len(sibling_text) < 20:
                        print(f"    - {sibling.tag_name}: '{sibling_text}'")
                
                # JavaScript로 더 정확한 구조 파악
                structure = driver.execute_script("""
                    var elem = arguments[0];
                    var parent = elem.parentElement;
                    var result = {
                        parentTag: parent.tagName,
                        parentClass: parent.className,
                        parentId: parent.id,
                        siblingCount: parent.children.length,
                        textNodes: []
                    };
                    
                    // 같은 부모의 모든 자식 텍스트
                    for(var i = 0; i < parent.children.length; i++) {
                        var text = parent.children[i].innerText || parent.children[i].textContent;
                        if(text && text.trim()) {
                            result.textNodes.push(text.trim());
                        }
                    }
                    
                    return result;
                """, checkbox)
                
                print(f"\n  JavaScript 분석:")
                print(f"    부모 클래스: {structure['parentClass']}")
                print(f"    텍스트 노드들: {structure['textNodes'][:5]}")
                
            except Exception as e:
                print(f"  분석 오류: {str(e)}")
        
        # 패턴 찾기
        print(f"\n{Fore.GREEN}=== 패턴 분석 ==={Style.RESET_ALL}")
        
        # 모든 체크박스에서 이름 위치 패턴 찾기
        name_positions = {}
        for checkbox in checkboxes[:20]:
            try:
                parent = checkbox.find_element(By.XPATH, "..")
                siblings = parent.find_elements(By.XPATH, "../*")
                
                for idx, sibling in enumerate(siblings):
                    text = sibling.text.strip()
                    # 2-5글자 한글이면 이름일 가능성
                    if 2 <= len(text) <= 5 and any('가' <= c <= '힣' for c in text):
                        if idx not in name_positions:
                            name_positions[idx] = []
                        name_positions[idx].append(text)
            except:
                continue
        
        print("\n이름이 있을 가능성이 높은 위치:")
        for pos, names in sorted(name_positions.items()):
            print(f"  위치 {pos}: {names[:5]}")
        
        print(f"\n{Fore.CYAN}분석 완료!{Style.RESET_ALL}")
        print("\n제안: 체크박스와 같은 행/부모의 특정 위치에서만 텍스트를 추출하세요.")
        
    except Exception as e:
        print(f"{Fore.RED}오류: {str(e)}{Style.RESET_ALL}")
    
    finally:
        input("\nEnter를 눌러 종료...")
        driver.quit()

if __name__ == "__main__":
    analyze_structure()