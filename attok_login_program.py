"""
ATTOK 사이트 자동 로그인 프로그램
분석 결과를 바탕으로 구현된 완전 자동화 로그인 시스템
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import getpass

class AttokLogin:
    def __init__(self, headless=False):
        """
        ATTOK 로그인 클래스 초기화
        
        Args:
            headless (bool): 헤드리스 모드 실행 여부
        """
        self.login_url = "https://attok.co.kr/center_login_lite_new.asp"
        self.driver = None
        self.headless = headless
        
    def setup_driver(self):
        """브라우저 드라이버 설정 및 초기화"""
        print("[설정] Chrome 브라우저 설정 중...")
        
        options = Options()
        if self.headless:
            options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1280,720')
        
        try:
            self.driver = webdriver.Chrome(options=options)
            self.driver.implicitly_wait(10)
            print("[성공] 브라우저 준비 완료")
            return True
        except Exception as e:
            print(f"[오류] 브라우저 설정 실패: {e}")
            return False
    
    def navigate_to_login(self):
        """로그인 페이지로 이동"""
        try:
            print(f"[이동] 로그인 페이지 접속 중: {self.login_url}")
            self.driver.get(self.login_url)
            
            # 페이지 로딩 대기
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "user_id"))
            )
            
            print(f"[성공] 로그인 페이지 로딩 완료")
            print(f"[페이지] 제목: {self.driver.title}")
            return True
            
        except Exception as e:
            print(f"[오류] 로그인 페이지 접속 실패: {e}")
            return False
    
    def perform_login(self, username, password):
        """
        실제 로그인 수행
        
        Args:
            username (str): 사용자 ID
            password (str): 비밀번호
            
        Returns:
            bool: 로그인 성공 여부
        """
        try:
            print("[진행] 로그인 정보 입력 중...")
            
            # 사용자 ID 입력
            user_id_field = self.driver.find_element(By.NAME, "user_id")
            user_id_field.clear()
            user_id_field.send_keys(username)
            print(f"[입력] 사용자 ID: {username}")
            
            # 비밀번호 입력
            password_field = self.driver.find_element(By.NAME, "user_pass")
            password_field.clear()
            password_field.send_keys(password)
            print("[입력] 비밀번호: ********")
            
            # 로그인 버튼 클릭 (여러 가지 방법으로 시도)
            login_button = None
            button_selectors = [
                "//input[@type='button' and @value='로그인']",
                "//button[text()='로그인']",
                "//input[@value='로그인']",
                "//button[contains(text(), '로그인')]"
            ]
            
            for selector in button_selectors:
                try:
                    login_button = self.driver.find_element(By.XPATH, selector)
                    print(f"[발견] 로그인 버튼 발견: {selector}")
                    break
                except:
                    continue
            
            if not login_button:
                print("[오류] 로그인 버튼을 찾을 수 없습니다.")
                return False
            
            print("[클릭] 로그인 버튼 클릭")
            login_button.click()
            
            # 로그인 결과 대기 및 확인
            time.sleep(3)
            
            # 로그인 성공 여부 확인 (URL 변경 또는 특정 요소 존재 여부)
            current_url = self.driver.current_url
            print(f"[결과] 현재 URL: {current_url}")
            
            # 로그인 성공 판정 (loginok.asp로 리다이렉트되거나 메인 페이지로 이동)
            if "loginok.asp" in current_url or current_url != self.login_url:
                print("[성공] 로그인이 성공적으로 완료되었습니다!")
                return True
            else:
                print("[실패] 로그인에 실패했습니다. 아이디나 비밀번호를 확인해주세요.")
                return False
                
        except Exception as e:
            print(f"[오류] 로그인 수행 중 오류 발생: {e}")
            return False
    
    def check_login_status(self):
        """로그인 상태 확인"""
        try:
            # 로그인 후 페이지에서 사용자 정보나 로그아웃 버튼 등을 확인
            page_source = self.driver.page_source
            
            if "로그아웃" in page_source or "logout" in page_source.lower():
                print("[확인] 로그인 상태: 성공")
                return True
            else:
                print("[확인] 로그인 상태: 미확인 또는 실패")
                return False
                
        except Exception as e:
            print(f"[오류] 로그인 상태 확인 실패: {e}")
            return False
    
    def close(self):
        """브라우저 종료"""
        if self.driver:
            print("[종료] 브라우저 종료 중...")
            self.driver.quit()
            print("[완료] 브라우저 종료 완료")

def main():
    """메인 실행 함수"""
    print("=" * 50)
    print("ATTOK 사이트 자동 로그인 프로그램")
    print("=" * 50)
    
    # 사용자 인증 정보 입력
    print("\n[입력] 로그인 정보를 입력해주세요:")
    username = input("사용자 ID: ").strip()
    
    if not username:
        print("[오류] 사용자 ID가 입력되지 않았습니다.")
        return
    
    password = getpass.getpass("비밀번호: ").strip()
    
    if not password:
        print("[오류] 비밀번호가 입력되지 않았습니다.")
        return
    
    # 실행 모드 선택
    print("\n[선택] 실행 모드를 선택해주세요:")
    print("1. 일반 모드 (브라우저 창 보임)")
    print("2. 헤드리스 모드 (백그라운드 실행)")
    
    mode_choice = input("선택 (1 또는 2): ").strip()
    headless_mode = mode_choice == "2"
    
    # 로그인 실행
    attok_login = AttokLogin(headless=headless_mode)
    
    try:
        # 1. 드라이버 설정
        if not attok_login.setup_driver():
            print("[실패] 브라우저 설정에 실패했습니다.")
            return
        
        # 2. 로그인 페이지 접속
        if not attok_login.navigate_to_login():
            print("[실패] 로그인 페이지 접속에 실패했습니다.")
            return
        
        # 3. 로그인 수행
        if attok_login.perform_login(username, password):
            print("\n" + "=" * 50)
            print("로그인 성공!")
            print("=" * 50)
            
            # 4. 로그인 상태 재확인
            attok_login.check_login_status()
            
            if not headless_mode:
                print("\n[대기] 브라우저를 확인해보세요. 30초 후 자동 종료됩니다...")
                time.sleep(30)
            
        else:
            print("\n" + "=" * 50)
            print("로그인 실패!")
            print("아이디와 비밀번호를 다시 확인해주세요.")
            print("=" * 50)
    
    except KeyboardInterrupt:
        print("\n[중단] 사용자에 의해 프로그램이 중단되었습니다.")
    
    except Exception as e:
        print(f"\n[오류] 예상치 못한 오류가 발생했습니다: {e}")
    
    finally:
        attok_login.close()

# 개별 기능 테스트용 함수들
def test_login_page_access():
    """로그인 페이지 접속 테스트"""
    print("=== 로그인 페이지 접속 테스트 ===")
    
    attok = AttokLogin(headless=True)
    try:
        if attok.setup_driver() and attok.navigate_to_login():
            print("[테스트 성공] 로그인 페이지 접속 가능")
            return True
        else:
            print("[테스트 실패] 로그인 페이지 접속 불가")
            return False
    finally:
        attok.close()

def test_form_elements():
    """로그인 폼 요소 확인 테스트"""
    print("=== 로그인 폼 요소 테스트 ===")
    
    attok = AttokLogin(headless=True)
    try:
        if not (attok.setup_driver() and attok.navigate_to_login()):
            print("[테스트 실패] 페이지 접속 실패")
            return False
        
        # 폼 요소들 존재 여부 확인
        elements_to_check = [
            ("user_id", By.NAME),
            ("user_pass", By.NAME)
        ]
        
        # 로그인 버튼 확인 (여러 방법으로)
        button_selectors = [
            "//input[@type='button' and @value='로그인']",
            "//button[text()='로그인']", 
            "//input[@value='로그인']",
            "//button[contains(text(), '로그인')]"
        ]
        
        all_found = True
        for element, locator_type in elements_to_check:
            try:
                attok.driver.find_element(locator_type, element)
                print(f"[확인] {element} 요소 발견")
            except:
                print(f"[오류] {element} 요소 없음")
                all_found = False
        
        # 로그인 버튼 확인
        button_found = False
        for selector in button_selectors:
            try:
                attok.driver.find_element(By.XPATH, selector)
                print(f"[확인] 로그인 버튼 발견: {selector}")
                button_found = True
                break
            except:
                continue
        
        if not button_found:
            print("[오류] 로그인 버튼 없음")
            all_found = False
        
        if all_found and button_found:
            print("[테스트 성공] 모든 필수 폼 요소 확인")
            return True
        else:
            print("[테스트 실패] 일부 폼 요소 누락")
            return False
            
    finally:
        attok.close()

if __name__ == "__main__":
    # 실행 모드 선택
    print("ATTOK 로그인 프로그램")
    print("1. 실제 로그인 실행")
    print("2. 로그인 페이지 접속 테스트")
    print("3. 폼 요소 확인 테스트")
    
    choice = input("선택하세요 (1-3): ").strip()
    
    if choice == "1":
        main()
    elif choice == "2":
        test_login_page_access()
    elif choice == "3":
        test_form_elements()
    else:
        print("잘못된 선택입니다. 프로그램을 종료합니다.")