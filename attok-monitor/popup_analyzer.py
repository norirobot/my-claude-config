"""
attok.co.kr 팝업 구조 분석 도구
실제 팝업의 HTML 구조를 분석하여 정확한 선택자 찾기
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def analyze_popups():
    """팝업 구조 분석"""
    driver = webdriver.Chrome()
    
    try:
        print("attok.co.kr 접속 중...")
        driver.get("https://attok.co.kr/")
        
        print("브라우저에서 로그인 후 Enter를 눌러주세요...")
        input()
        
        print("\n=== 팝업 분석 시작 ===")
        
        # 1. 모든 iframe 찾기
        iframes = driver.find_elements(By.TAG_NAME, "iframe")
        print(f"\n발견된 iframe: {len(iframes)}개")
        for i, iframe in enumerate(iframes):
            try:
                src = iframe.get_attribute("src")
                id_attr = iframe.get_attribute("id")
                class_attr = iframe.get_attribute("class")
                print(f"  iframe {i+1}: id='{id_attr}', class='{class_attr}', src='{src}'")
            except:
                pass
        
        # 2. 팝업 관련 요소들 찾기
        popup_selectors = [
            # 일반적인 팝업
            "[id*='popup']", "[class*='popup']",
            "[id*='modal']", "[class*='modal']", 
            "[id*='dialog']", "[class*='dialog']",
            "[id*='layer']", "[class*='layer']",
            
            # 닫기 버튼
            "[id*='close']", "[class*='close']",
            "button[onclick*='close']",
            "a[onclick*='close']",
            
            # 특정 텍스트
            "//*[contains(text(), '닫기')]",
            "//*[contains(text(), '확인')]", 
            "//*[contains(text(), '×')]",
            "//*[contains(text(), 'X')]"
        ]
        
        print("\n=== 팝업 관련 요소 분석 ===")
        for selector in popup_selectors:
            try:
                if selector.startswith("//"):
                    elements = driver.find_elements(By.XPATH, selector)
                else:
                    elements = driver.find_elements(By.CSS_SELECTOR, selector)
                
                if elements:
                    print(f"\n선택자 '{selector}': {len(elements)}개 발견")
                    for i, elem in enumerate(elements[:3]):  # 최대 3개만 표시
                        try:
                            tag = elem.tag_name
                            id_attr = elem.get_attribute("id")
                            class_attr = elem.get_attribute("class")
                            text = elem.text[:50] if elem.text else ""
                            visible = elem.is_displayed()
                            print(f"  {i+1}. <{tag}> id='{id_attr}' class='{class_attr}' visible={visible}")
                            if text:
                                print(f"     텍스트: '{text}'")
                        except:
                            pass
            except:
                pass
        
        # 3. 현재 페이지 정보
        print(f"\n=== 현재 페이지 정보 ===")
        print(f"URL: {driver.current_url}")
        print(f"Title: {driver.title}")
        
        # 4. alert 확인
        try:
            alert = driver.switch_to.alert
            print(f"Alert 감지: {alert.text}")
            alert.accept()
            print("Alert 닫음")
        except:
            print("Alert 없음")
        
        # 5. 특수 요소들 찾기
        print(f"\n=== 특수 요소 분석 ===")
        
        # z-index가 높은 요소들 (팝업일 가능성)
        high_z_elements = driver.execute_script("""
            var elements = document.querySelectorAll('*');
            var highZ = [];
            for (var i = 0; i < elements.length; i++) {
                var zIndex = window.getComputedStyle(elements[i]).zIndex;
                if (zIndex && parseInt(zIndex) > 1000) {
                    highZ.push({
                        tag: elements[i].tagName,
                        id: elements[i].id,
                        className: elements[i].className,
                        zIndex: zIndex,
                        visible: elements[i].offsetParent !== null
                    });
                }
            }
            return highZ;
        """)
        
        print(f"높은 z-index 요소들: {len(high_z_elements)}개")
        for elem in high_z_elements[:5]:  # 최대 5개만 표시
            print(f"  <{elem['tag']}> id='{elem['id']}' class='{elem['className']}' z-index={elem['zIndex']} visible={elem['visible']}")
        
        print("\n분석 완료! 팝업이 나타나면 위 정보를 바탕으로 선택자를 만들 수 있습니다.")
        
    except Exception as e:
        print(f"오류 발생: {e}")
    
    finally:
        input("\nEnter를 눌러 브라우저를 닫습니다...")
        driver.quit()

if __name__ == "__main__":
    analyze_popups()