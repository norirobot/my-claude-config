"""
빠른 사이트 구조 확인
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time

def quick_site_check():
    """빠른 사이트 확인"""
    print("Attok.co.kr 빠른 구조 확인")
    print("=" * 40)
    
    options = webdriver.ChromeOptions()
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    
    driver = None
    
    try:
        # 드라이버 초기화
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        except:
            driver = webdriver.Chrome(options=options)
        
        print("Chrome 드라이버 준비 완료")
        
        # 사이트 접속
        driver.get("https://attok.co.kr")
        time.sleep(3)
        
        print(f"사이트 접속: {driver.title}")
        print(f"URL: {driver.current_url}")
        
        # 페이지 소스 간단 분석
        page_source = driver.page_source
        print(f"페이지 크기: {len(page_source)}자")
        
        # input 태그들 모두 찾기
        inputs = driver.find_elements(By.TAG_NAME, "input")
        print(f"\n총 input 태그: {len(inputs)}개")
        
        for i, inp in enumerate(inputs):
            inp_type = inp.get_attribute('type') or '없음'
            inp_name = inp.get_attribute('name') or '없음'
            inp_id = inp.get_attribute('id') or '없음'
            inp_placeholder = inp.get_attribute('placeholder') or '없음'
            print(f"  {i+1}. type={inp_type}, name={inp_name}, id={inp_id}")
            if inp_placeholder != '없음':
                print(f"      placeholder={inp_placeholder}")
        
        # form 태그들 찾기
        forms = driver.find_elements(By.TAG_NAME, "form")
        print(f"\n총 form 태그: {len(forms)}개")
        
        # button 태그들 찾기  
        buttons = driver.find_elements(By.TAG_NAME, "button")
        print(f"총 button 태그: {len(buttons)}개")
        
        for i, btn in enumerate(buttons):
            btn_text = btn.text or '텍스트없음'
            btn_type = btn.get_attribute('type') or '없음'
            print(f"  {i+1}. 텍스트='{btn_text}', type={btn_type}")
        
        # 로그인 관련 키워드 검색
        print("\n로그인 관련 텍스트 검색:")
        login_keywords = ['로그인', 'login', 'Login', 'LOGIN', '아이디', 'ID', 'id', '비밀번호', 'password', 'Password']
        
        for keyword in login_keywords:
            try:
                elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{keyword}')]")
                if elements:
                    print(f"  '{keyword}' 발견: {len(elements)}개")
                    for elem in elements[:3]:  # 상위 3개만
                        print(f"    - {elem.tag_name}: '{elem.text[:50]}'")
            except:
                continue
        
        print(f"\n현재 시간: {time.strftime('%H:%M:%S')}")
        print("브라우저가 열려있습니다.")
        print("수동으로 로그인을 시도해보세요.")
        
        # 계정 정보 출력
        print("\n제공된 테스트 계정:")
        print("ID: roncorobot")
        print("PW: Ronco6374!")
        
        # 30초 대기
        print("\n30초 후 자동으로 브라우저가 닫힙니다...")
        for i in range(30, 0, -1):
            print(f"남은 시간: {i}초", end='\r')
            time.sleep(1)
        
        print("\n시간 만료 - 브라우저 종료")
        
    except Exception as e:
        print(f"오류: {e}")
        
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    quick_site_check()