"""
실제 출결 페이지 테스트 및 분석
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time
import json

def test_attendance_page():
    """출결 페이지 테스트"""
    print("=" * 50)
    print("Attok.co.kr 출결 페이지 분석")
    print("=" * 50)
    
    # 계정 정보
    username = "roncorobot"
    password = "Ronco6374!"
    attendance_url = "https://attok.co.kr/content/attendance/attendance.asp"
    
    print(f"테스트 계정: {username}")
    print(f"출결 페이지: {attendance_url}")
    
    # Chrome 드라이버 설정
    options = webdriver.ChromeOptions()
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-blink-features=AutomationControlled')
    
    driver = None
    
    try:
        # 드라이버 초기화
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
            print("Chrome 드라이버 초기화 성공")
        except:
            driver = webdriver.Chrome(options=options)
            print("시스템 Chrome 드라이버 사용")
        
        # 메인 페이지부터 시작
        print("\n1단계: 메인 페이지 접속")
        driver.get("https://attok.co.kr")
        time.sleep(2)
        
        # 로그인 페이지 찾기 시도
        print("\n2단계: 로그인 페이지 찾기")
        
        # 일반적인 로그인 링크들 찾기
        login_links = []
        possible_selectors = [
            "a[href*='login']",
            "a[href*='Login']", 
            "a[href*='signin']",
            "a[href*='auth']",
            "*[onclick*='login']",
            "a:contains('로그인')",
            "a:contains('Login')"
        ]
        
        for selector in possible_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                for elem in elements:
                    href = elem.get_attribute('href')
                    text = elem.text
                    if href:
                        login_links.append({'href': href, 'text': text})
            except:
                continue
        
        print(f"발견된 링크들: {len(login_links)}개")
        for link in login_links:
            print(f"  - {link['text']}: {link['href']}")
        
        # 직접 출결 페이지 접속 시도
        print(f"\n3단계: 출결 페이지 직접 접속 시도")
        driver.get(attendance_url)
        time.sleep(3)
        
        current_url = driver.current_url
        print(f"현재 URL: {current_url}")
        
        if "login" in current_url.lower() or "auth" in current_url.lower():
            print("로그인 페이지로 리다이렉트됨")
            
            # 로그인 폼 분석
            print("\n4단계: 로그인 폼 분석")
            analyze_login_form(driver, username, password)
            
        else:
            print("직접 접속 성공 또는 다른 페이지")
            
        # 현재 페이지 분석
        print("\n5단계: 현재 페이지 구조 분석")
        analyze_current_page(driver)
        
        # 수동 로그인 옵션 제공
        print("\n" + "="*50)
        print("수동 로그인 안내")
        print("="*50)
        print("브라우저에서 수동으로 로그인해주세요:")
        print(f"ID: {username}")
        print(f"PW: {password}")
        print("로그인 후 출결 페이지로 이동하면 Enter를 누르세요")
        print("="*50)
        
        # 사용자 입력 대기 (최대 5분)
        print("로그인 완료 후 Enter를 누르세요 (5분 대기)...")
        
        # 30초마다 페이지 체크
        for i in range(10):  # 5분간 대기 (30초 × 10)
            try:
                # 비차단 입력 시뮬레이션
                print(f"대기 중... {i*30}초 경과 (총 300초 중)")
                time.sleep(30)
                
                # URL 변화 확인
                new_url = driver.current_url
                if "attendance" in new_url:
                    print("출결 페이지 감지됨!")
                    break
                    
            except:
                continue
        
        # 최종 페이지 분석
        print("\n6단계: 최종 페이지 분석")
        final_analysis(driver)
        
    except Exception as e:
        print(f"오류 발생: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        if driver:
            print("\n분석 완료 - 60초 후 브라우저 닫힘")
            time.sleep(60)
            driver.quit()

def analyze_login_form(driver, username, password):
    """로그인 폼 분석 및 자동 로그인 시도"""
    try:
        # 모든 input 찾기
        inputs = driver.find_elements(By.TAG_NAME, "input")
        print(f"input 태그 {len(inputs)}개 발견:")
        
        username_field = None
        password_field = None
        
        for i, inp in enumerate(inputs):
            inp_type = inp.get_attribute('type') or ''
            inp_name = inp.get_attribute('name') or ''
            inp_id = inp.get_attribute('id') or ''
            
            print(f"  {i+1}. type={inp_type}, name={inp_name}, id={inp_id}")
            
            # 사용자명 필드 추정
            if inp_type.lower() == 'text' or 'user' in inp_name.lower() or 'id' in inp_name.lower():
                if not username_field:
                    username_field = inp
                    
            # 패스워드 필드 추정  
            if inp_type.lower() == 'password':
                if not password_field:
                    password_field = inp
        
        # 자동 로그인 시도
        if username_field and password_field:
            print("\n로그인 정보 입력 중...")
            username_field.clear()
            username_field.send_keys(username)
            
            password_field.clear()
            password_field.send_keys(password)
            
            # 로그인 버튼 찾기
            buttons = driver.find_elements(By.TAG_NAME, "button")
            inputs_submit = driver.find_elements(By.CSS_SELECTOR, "input[type='submit']")
            
            login_button = None
            for btn in buttons + inputs_submit:
                btn_text = btn.text.lower() if btn.text else ''
                btn_value = btn.get_attribute('value') or ''
                
                if '로그인' in btn_text or 'login' in btn_text or '로그인' in btn_value:
                    login_button = btn
                    break
            
            if login_button:
                print("로그인 버튼 클릭...")
                login_button.click()
                time.sleep(3)
                print("로그인 시도 완료")
            else:
                print("로그인 버튼을 찾을 수 없음")
        else:
            print("로그인 필드를 찾을 수 없음")
            
    except Exception as e:
        print(f"로그인 분석 실패: {e}")

def analyze_current_page(driver):
    """현재 페이지 분석"""
    try:
        current_url = driver.current_url
        page_title = driver.title
        
        print(f"URL: {current_url}")
        print(f"제목: {page_title}")
        
        # 페이지 텍스트 확인
        page_text = driver.find_element(By.TAG_NAME, "body").text
        print(f"페이지 텍스트 길이: {len(page_text)}자")
        
        # 주요 키워드 확인
        keywords = ['출석', '학생', '출결', '관리', '로그인', '오류', 'error']
        for keyword in keywords:
            if keyword in page_text:
                print(f"키워드 '{keyword}' 발견")
        
    except Exception as e:
        print(f"페이지 분석 실패: {e}")

def final_analysis(driver):
    """최종 상세 분석"""
    try:
        print("최종 분석 시작...")
        
        current_url = driver.current_url
        print(f"최종 URL: {current_url}")
        
        if "attendance" in current_url:
            print("✅ 출결 페이지 접근 성공!")
            
            # 학생 관련 요소 찾기
            print("\n학생 관련 요소 검색:")
            
            # 테이블 구조 확인
            tables = driver.find_elements(By.TAG_NAME, "table")
            print(f"테이블 {len(tables)}개 발견")
            
            # 한글 이름 패턴 찾기
            all_text_elements = driver.find_elements(By.XPATH, "//*[text()]")
            korean_names = []
            
            for elem in all_text_elements:
                text = elem.text.strip()
                if text and 2 <= len(text) <= 4:
                    if any('\uac00' <= char <= '\ud7a3' for char in text):
                        korean_names.append({
                            'text': text,
                            'tag': elem.tag_name,
                            'class': elem.get_attribute('class')
                        })
            
            # 중복 제거
            unique_names = list({item['text']: item for item in korean_names}.values())
            
            print(f"한글 이름 후보 {len(unique_names)}개:")
            for name in unique_names[:20]:
                print(f"  - {name['text']} ({name['tag']}, class={name['class']})")
            
            # 색상 분석
            print("\n색상 요소 분석:")
            colored_elements = []
            
            all_elements = driver.find_elements(By.XPATH, "//*")[:200]
            for elem in all_elements:
                try:
                    bg_color = elem.value_of_css_property("background-color")
                    if bg_color and bg_color not in ["rgba(0, 0, 0, 0)", "transparent"]:
                        colored_elements.append({
                            'color': bg_color,
                            'text': elem.text[:20] if elem.text else '',
                            'class': elem.get_attribute('class')
                        })
                except:
                    continue
            
            # 색상별 그룹화
            from collections import Counter
            color_counter = Counter([elem['color'] for elem in colored_elements])
            
            print("발견된 색상들:")
            for color, count in color_counter.most_common(10):
                print(f"  {color}: {count}개")
            
            # 결과 저장
            result = {
                'url': current_url,
                'student_names': [name['text'] for name in unique_names],
                'colors': dict(color_counter.most_common()),
                'analysis_time': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            with open('attendance_analysis.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
                
            print(f"\n분석 결과가 attendance_analysis.json에 저장됨")
            
        else:
            print("❌ 출결 페이지 접근 실패")
            
    except Exception as e:
        print(f"최종 분석 실패: {e}")

if __name__ == "__main__":
    test_attendance_page()