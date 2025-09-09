"""
자동 로그인 테스트 - 제공된 계정으로 테스트
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

def auto_login_test():
    """자동 로그인 테스트"""
    print("=" * 50)
    print("Attok.co.kr 자동 로그인 테스트")
    print("=" * 50)
    
    # 계정 정보
    username = "roncorobot"
    password = "Ronco6374!"
    
    print(f"테스트 계정: {username}")
    
    # Chrome 드라이버 설정
    options = webdriver.ChromeOptions()
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    
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
        
        # 사이트 접속
        print("attok.co.kr 접속 중...")
        driver.get("https://attok.co.kr")
        time.sleep(3)
        
        print(f"사이트 접속 성공: {driver.title}")
        print(f"현재 URL: {driver.current_url}")
        
        # 로그인 폼 찾기
        print("\n로그인 폼 검색 중...")
        
        # 다양한 로그인 입력 필드 패턴 시도
        username_selectors = [
            "input[name='username']",
            "input[name='user']", 
            "input[name='id']",
            "input[name='userid']",
            "input[name='login']",
            "input[type='text']",
            "input[id*='user']",
            "input[id*='id']",
            "input[id*='login']"
        ]
        
        password_selectors = [
            "input[name='password']",
            "input[name='passwd']",
            "input[name='pwd']",
            "input[type='password']",
            "input[id*='pass']",
            "input[id*='pwd']"
        ]
        
        username_field = None
        password_field = None
        
        # 사용자명 필드 찾기
        for selector in username_selectors:
            try:
                username_field = driver.find_element(By.CSS_SELECTOR, selector)
                print(f"사용자명 필드 발견: {selector}")
                break
            except:
                continue
        
        # 패스워드 필드 찾기  
        for selector in password_selectors:
            try:
                password_field = driver.find_element(By.CSS_SELECTOR, selector)
                print(f"패스워드 필드 발견: {selector}")
                break
            except:
                continue
        
        if username_field and password_field:
            print("\n로그인 시도 중...")
            
            # 로그인 정보 입력
            username_field.clear()
            username_field.send_keys(username)
            time.sleep(1)
            
            password_field.clear()
            password_field.send_keys(password)
            time.sleep(1)
            
            print("로그인 정보 입력 완료")
            
            # 로그인 버튼 찾기
            login_button_selectors = [
                "button[type='submit']",
                "input[type='submit']", 
                "button",
                "input[value*='로그인']",
                "button:contains('로그인')",
                "*[onclick*='login']"
            ]
            
            login_button = None
            for selector in login_button_selectors:
                try:
                    login_button = driver.find_element(By.CSS_SELECTOR, selector)
                    print(f"로그인 버튼 발견: {selector}")
                    break
                except:
                    continue
            
            if login_button:
                login_button.click()
                print("로그인 버튼 클릭")
                time.sleep(5)  # 로그인 처리 대기
                
                # 로그인 성공 여부 확인
                current_url = driver.current_url
                page_title = driver.title
                
                print(f"로그인 후 URL: {current_url}")
                print(f"로그인 후 제목: {page_title}")
                
                if current_url != "https://attok.co.kr/":
                    print("로그인 성공! 페이지 이동됨")
                    
                    # 학생 목록 분석 시작
                    analyze_student_data(driver)
                    
                else:
                    print("로그인 실패 - URL 변경 없음")
                    
                    # 에러 메시지 확인
                    try:
                        error_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '오류') or contains(text(), '실패') or contains(text(), '잘못')]")
                        if error_elements:
                            print("에러 메시지:")
                            for elem in error_elements:
                                print(f"  - {elem.text}")
                    except:
                        pass
            else:
                print("로그인 버튼을 찾을 수 없습니다")
                print("수동 로그인이 필요할 수 있습니다")
                
                input("수동으로 로그인 후 Enter를 누르세요...")
                analyze_student_data(driver)
        else:
            print("로그인 폼을 찾을 수 없습니다")
            print("페이지 구조가 예상과 다를 수 있습니다")
            
            # 현재 페이지 구조 간단 분석
            print("\n현재 페이지 모든 input 태그:")
            inputs = driver.find_elements(By.TAG_NAME, "input")
            for i, inp in enumerate(inputs):
                input_type = inp.get_attribute('type')
                input_name = inp.get_attribute('name')
                input_id = inp.get_attribute('id')
                print(f"  {i+1}. type={input_type}, name={input_name}, id={input_id}")
            
            input("수동 로그인 후 Enter를 누르세요...")
            analyze_student_data(driver)
        
    except Exception as e:
        print(f"오류 발생: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        if driver:
            input("Enter를 누르면 브라우저가 닫힙니다...")
            driver.quit()
            print("브라우저 종료")

def analyze_student_data(driver):
    """학생 데이터 분석"""
    print("\n" + "=" * 50)
    print("학생 목록 분석 시작")
    print("=" * 50)
    
    try:
        # 현재 페이지 정보
        current_url = driver.current_url
        page_title = driver.title
        print(f"분석 페이지 URL: {current_url}")
        print(f"페이지 제목: {page_title}")
        
        # 모든 텍스트 요소에서 한글 이름 찾기
        print("\n한글 이름 후보 검색 중...")
        text_elements = driver.find_elements(By.XPATH, "//*[text()]")
        
        korean_names = []
        for elem in text_elements:
            text = elem.text.strip()
            if text and 2 <= len(text) <= 5:
                # 한글이 포함되고 이름 패턴과 유사한 경우
                if any('\uac00' <= char <= '\ud7a3' for char in text):
                    # 공통 단어들 제외
                    exclude_words = ['학원', '출석', '관리', '시스템', '로그인', '로그아웃', '메뉴', '홈페이지', '공지사항', '게시판']
                    if not any(word in text for word in exclude_words):
                        korean_names.append({
                            'name': text,
                            'element': elem.tag_name,
                            'class': elem.get_attribute('class'),
                            'id': elem.get_attribute('id')
                        })
        
        # 중복 제거
        unique_names = []
        seen_names = set()
        for item in korean_names:
            if item['name'] not in seen_names:
                unique_names.append(item)
                seen_names.add(item['name'])
        
        print(f"발견된 한글 이름 후보: {len(unique_names)}개")
        for i, item in enumerate(unique_names[:20]):  # 상위 20개만
            print(f"  {i+1}. {item['name']} (태그: {item['element']}, 클래스: {item['class']})")
        
        # 출석 상태를 나타낼 수 있는 색상 요소들 찾기
        print("\n색상 요소 분석 중...")
        colored_elements = []
        
        # 모든 요소의 배경색 확인
        all_elements = driver.find_elements(By.XPATH, "//*")[:300]  # 상위 300개만
        
        color_count = {}
        for elem in all_elements:
            try:
                bg_color = elem.value_of_css_property("background-color")
                if bg_color and bg_color not in ["rgba(0, 0, 0, 0)", "transparent", "rgba(255, 255, 255, 1)"]:
                    if bg_color not in color_count:
                        color_count[bg_color] = 0
                    color_count[bg_color] += 1
                    
                    if color_count[bg_color] <= 3:  # 각 색상별 최대 3개 예시만
                        colored_elements.append({
                            'color': bg_color,
                            'text': elem.text[:30] if elem.text else '',
                            'class': elem.get_attribute('class'),
                            'tag': elem.tag_name
                        })
            except:
                continue
        
        print("발견된 배경색들:")
        for color, count in sorted(color_count.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {color}: {count}개 요소")
        
        # 출석 상태로 추정되는 요소들
        print("\n출석 상태 후보 요소들:")
        attendance_candidates = []
        
        for elem in colored_elements:
            if elem['text'] and any(name['name'] in elem['text'] for name in unique_names):
                attendance_candidates.append(elem)
        
        for candidate in attendance_candidates[:10]:
            print(f"  색상: {candidate['color']}")
            print(f"  텍스트: {candidate['text']}")
            print(f"  클래스: {candidate['class']}")
            print("  ---")
        
        # 결과 저장
        analysis_result = {
            'url': current_url,
            'title': page_title,
            'student_names': [name['name'] for name in unique_names],
            'color_analysis': color_count,
            'attendance_candidates': attendance_candidates
        }
        
        with open('student_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(analysis_result, f, ensure_ascii=False, indent=2)
        
        print(f"\n분석 완료! student_analysis.json 파일에 저장됨")
        print(f"총 {len(unique_names)}개의 학생 이름 후보 발견")
        
    except Exception as e:
        print(f"분석 중 오류: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    auto_login_test()