"""
배경이 나타나는 근본 원인 찾기
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style

init()

def find_root_cause():
    """배경이 어디서 오는지 정확히 찾기"""
    
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get("https://attok.co.kr/")
        print(f"{Fore.YELLOW}로그인 후 출결 페이지로 이동한 다음 Enter를 눌러주세요...{Style.RESET_ALL}")
        input()
        
        print(f"\n{Fore.CYAN}=== '배경' 텍스트 원인 분석 ==={Style.RESET_ALL}\n")
        
        # 1. 페이지 전체 HTML 확인
        page_source = driver.page_source
        if "배경" in page_source:
            print(f"{Fore.RED}[발견] HTML 소스에 '배경' 텍스트 존재{Style.RESET_ALL}")
            
            # 배경이 포함된 요소 찾기
            elements_with_baekyung = driver.find_elements(By.XPATH, "//*[contains(text(), '배경')]")
            print(f"  '배경'이 포함된 요소: {len(elements_with_baekyung)}개")
            
            for i, elem in enumerate(elements_with_baekyung[:5], 1):
                print(f"\n  요소 #{i}:")
                print(f"    태그: {elem.tag_name}")
                print(f"    클래스: {elem.get_attribute('class')}")
                print(f"    ID: {elem.get_attribute('id')}")
                print(f"    텍스트: '{elem.text[:50]}...'" if len(elem.text) > 50 else f"    텍스트: '{elem.text}'")
                print(f"    표시 상태: {'보임' if elem.is_displayed() else '숨김'}")
                
                # 부모 요소 확인
                parent = elem.find_element(By.XPATH, "..")
                print(f"    부모 태그: {parent.tag_name}")
                print(f"    부모 클래스: {parent.get_attribute('class')}")
        
        # 2. CSS 스타일시트 확인
        print(f"\n{Fore.CYAN}=== CSS/스타일 관련 ==={Style.RESET_ALL}")
        
        # background 관련 스타일 확인
        style_elements = driver.find_elements(By.TAG_NAME, "style")
        for style in style_elements:
            style_text = style.get_attribute("innerHTML")
            if "배경" in style_text or "background" in style_text.lower():
                print("  스타일시트에서 background 관련 설정 발견")
                break
        
        # 3. JavaScript 변수 확인
        print(f"\n{Fore.CYAN}=== JavaScript 변수 확인 ==={Style.RESET_ALL}")
        
        js_check = driver.execute_script("""
            var found = [];
            
            // 전역 변수 검색
            for(var key in window) {
                if(typeof window[key] === 'string' && window[key].includes('배경')) {
                    found.push({type: 'global_var', name: key, value: window[key]});
                }
            }
            
            // DOM 속성 검색
            var allElements = document.querySelectorAll('*');
            for(var i = 0; i < allElements.length; i++) {
                var elem = allElements[i];
                // title, alt, placeholder 등 속성 확인
                if(elem.title && elem.title.includes('배경')) {
                    found.push({type: 'title', tag: elem.tagName, value: elem.title});
                }
                if(elem.alt && elem.alt.includes('배경')) {
                    found.push({type: 'alt', tag: elem.tagName, value: elem.alt});
                }
                if(elem.placeholder && elem.placeholder.includes('배경')) {
                    found.push({type: 'placeholder', tag: elem.tagName, value: elem.placeholder});
                }
            }
            
            return found;
        """)
        
        if js_check:
            print("  JavaScript에서 '배경' 발견:")
            for item in js_check:
                print(f"    - {item}")
        else:
            print("  JavaScript 변수에서 '배경' 없음")
        
        # 4. 정확한 위치 찾기
        print(f"\n{Fore.CYAN}=== 정확한 위치 분석 ==={Style.RESET_ALL}")
        
        # 배진우 근처 확인
        try:
            # 배진우가 포함된 요소 찾기
            baejinwoo_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '배진우')]")
            
            for elem in baejinwoo_elements:
                print(f"\n'배진우' 요소 분석:")
                print(f"  태그: {elem.tag_name}")
                print(f"  전체 텍스트: '{elem.text}'")
                
                # 형제 요소들 확인
                siblings = elem.find_elements(By.XPATH, "../*")
                print(f"  형제 요소 {len(siblings)}개:")
                for sib in siblings[:5]:
                    sib_text = sib.text.strip()
                    if sib_text:
                        print(f"    - {sib_text[:30]}")
                
                # 부모의 전체 HTML
                parent = elem.find_element(By.XPATH, "..")
                parent_html = parent.get_attribute("innerHTML")
                if "배경" in parent_html:
                    print(f"{Fore.RED}  [!] 부모 HTML에 '배경' 포함됨{Style.RESET_ALL}")
                    # HTML 일부 출력
                    start = parent_html.find("배경")
                    snippet = parent_html[max(0, start-50):min(len(parent_html), start+50)]
                    print(f"    HTML 조각: ...{snippet}...")
        except:
            pass
        
        # 5. 숨겨진 요소 확인
        print(f"\n{Fore.CYAN}=== 숨겨진 요소 확인 ==={Style.RESET_ALL}")
        
        hidden_elements = driver.execute_script("""
            var hidden = [];
            var all = document.querySelectorAll('*');
            
            for(var i = 0; i < all.length; i++) {
                var elem = all[i];
                if(elem.textContent && elem.textContent.includes('배경')) {
                    var style = window.getComputedStyle(elem);
                    if(style.display === 'none' || style.visibility === 'hidden' || 
                       style.opacity === '0' || elem.offsetWidth === 0 || elem.offsetHeight === 0) {
                        hidden.push({
                            tag: elem.tagName,
                            class: elem.className,
                            text: elem.textContent.substring(0, 50),
                            display: style.display,
                            visibility: style.visibility
                        });
                    }
                }
            }
            
            return hidden;
        """)
        
        if hidden_elements:
            print(f"  숨겨진 '배경' 요소 {len(hidden_elements)}개 발견:")
            for elem in hidden_elements[:3]:
                print(f"    - {elem}")
        
        print(f"\n{Fore.GREEN}=== 분석 완료 ==={Style.RESET_ALL}")
        
    except Exception as e:
        print(f"{Fore.RED}오류: {str(e)}{Style.RESET_ALL}")
    
    finally:
        input("\nEnter를 눌러 종료...")
        driver.quit()

if __name__ == "__main__":
    find_root_cause()