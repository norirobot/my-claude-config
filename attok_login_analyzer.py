"""
ATTOK 사이트 로그인 구조 분석 스크립트 (독립 버전)
기존 프로젝트와 분리하여 새롭게 구현
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def analyze_attok_login():
    print("[분석] ATTOK 사이트 로그인 구조 분석 시작...")
    
    driver = None
    
    try:
        # 일반 모드로 브라우저 실행 (분석을 위해 화면에 표시)
        driver = webdriver.Chrome()
        driver.get("https://attok.co.kr/")
        
        print(f"[페이지] 제목: {driver.title}")
        print(f"[URL] 현재: {driver.current_url}")
        
        # 페이지 로딩 대기
        time.sleep(5)
        
        print("\n=== [분석] 로그인 폼 요소 분석 ===")
        
        # 1. 모든 폼 요소 검색
        login_forms = driver.find_elements(By.TAG_NAME, "form")
        print(f"[폼] 발견된 수: {len(login_forms)}")
        
        for i, form in enumerate(login_forms):
            print(f"\n--- [폼 {i+1}] 정보 ---")
            action = form.get_attribute('action') or '없음'
            method = form.get_attribute('method') or '없음'
            form_class = form.get_attribute('class') or '없음'
            form_id = form.get_attribute('id') or '없음'
            
            print(f"  Action: {action}")
            print(f"  Method: {method}")  
            print(f"  Class: {form_class}")
            print(f"  ID: {form_id}")
        
        # 2. 입력 필드 검색
        input_fields = driver.find_elements(By.TAG_NAME, "input")
        print(f"\n[입력필드] 발견된 수: {len(input_fields)}")
        
        login_related_inputs = []
        for i, field in enumerate(input_fields):
            field_type = field.get_attribute('type') or '없음'
            field_name = field.get_attribute('name') or '없음'
            field_id = field.get_attribute('id') or '없음'
            field_placeholder = field.get_attribute('placeholder') or '없음'
            field_value = field.get_attribute('value') or '없음'
            
            # 로그인 관련 필드인지 확인
            if field_type in ['text', 'password', 'email'] or any(keyword in field_name.lower() for keyword in ['user', 'id', 'login', 'pass']):
                login_related_inputs.append({
                    'index': i+1,
                    'type': field_type,
                    'name': field_name,
                    'id': field_id,
                    'placeholder': field_placeholder,
                    'value': field_value
                })
                print(f"  [입력] {i+1}: type={field_type}, name={field_name}, id={field_id}, placeholder={field_placeholder}")
        
        # 3. 버튼 요소 검색  
        buttons = driver.find_elements(By.TAG_NAME, "button")
        submit_inputs = driver.find_elements(By.XPATH, "//input[@type='submit']")
        
        print(f"\n[버튼] 발견된 수: {len(buttons)}")
        print(f"[제출] 발견된 submit 입력 수: {len(submit_inputs)}")
        
        login_buttons = []
        for i, button in enumerate(buttons):
            button_type = button.get_attribute('type') or '없음'
            button_text = button.text.strip() or '없음'
            button_onclick = button.get_attribute('onclick') or '없음'
            button_class = button.get_attribute('class') or '없음'
            
            if any(keyword in button_text.lower() for keyword in ['로그인', 'login', '확인']):
                login_buttons.append({
                    'index': i+1,
                    'type': button_type,
                    'text': button_text,
                    'onclick': button_onclick,
                    'class': button_class
                })
                print(f"  [버튼] {i+1}: type={button_type}, text='{button_text}', onclick={button_onclick}")
        
        # 4. JavaScript 이벤트 확인
        print(f"\n=== [JS분석] JavaScript 분석 ===")
        scripts = driver.find_elements(By.TAG_NAME, "script")
        print(f"[스크립트] 태그 수: {len(scripts)}")
        
        # 5. 페이지 소스에서 중요 키워드 검색
        page_source = driver.page_source
        important_keywords = [
            'login', '로그인', 'username', 'userid', 'user_id', 'email',
            'password', '비밀번호', 'submit', 'ajax', 'csrf', 'token'
        ]
        
        print(f"\n=== [키워드] 검색 결과 ===")
        for keyword in important_keywords:
            count = page_source.lower().count(keyword.lower())
            if count > 0:
                print(f"  '{keyword}': {count}회 발견")
        
        # 6. 분석 요약
        print(f"\n=== [요약] 분석 결과 ===")
        print(f"  - 로그인 관련 입력 필드: {len(login_related_inputs)}개")
        print(f"  - 로그인 관련 버튼: {len(login_buttons)}개")
        print(f"  - 폼 요소: {len(login_forms)}개")
        
        # 사용자에게 추가 분석을 위한 대기 시간 제공
        print(f"\n[대기] 브라우저에서 페이지를 직접 확인해보세요. 30초 후 자동 종료됩니다...")
        time.sleep(30)
        
        return {
            'forms': login_forms,
            'inputs': login_related_inputs,
            'buttons': login_buttons,
            'page_source': page_source
        }
        
    except Exception as e:
        print(f"[오류] 발생: {e}")
        return None
        
    finally:
        if driver:
            print("[종료] 브라우저 종료 중...")
            driver.quit()

if __name__ == "__main__":
    result = analyze_attok_login()
    if result:
        print("\n[완료] 분석 완료! 다음 단계로 로그인 프로그램 구현을 진행할 수 있습니다.")
    else:
        print("\n[실패] 분석 실패. 사이트 접근 또는 분석에 문제가 발생했습니다.")