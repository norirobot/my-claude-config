"""
웹사이트 모니터링 모듈
"""
import time
import logging
from typing import List, Callable, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from models import Student, StudentStatus
import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AttokMonitor:
    """Attok 웹사이트 모니터링 클래스"""
    
    def __init__(self, headless: bool = True):
        self.driver: Optional[webdriver.Chrome] = None
        self.headless = headless
        self.is_logged_in = False
        self.students: dict[str, Student] = {}
        self.on_student_checkin: Optional[Callable] = None
        
    def setup_driver(self, headless: bool = None):
        """Chrome 드라이버 설정"""
        if headless is None:
            headless = self.headless
            
        options = webdriver.ChromeOptions()
        chrome_options = config.HEADLESS_OPTIONS if headless else config.CHROME_OPTIONS
        
        for option in chrome_options:
            options.add_argument(option)
            
        # 자동화 감지 방지
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
        except Exception as e:
            logger.error(f"Chrome 드라이버 초기화 실패: {e}")
            # 시스템에 설치된 Chrome 드라이버 사용 시도
            self.driver = webdriver.Chrome(options=options)
        logger.info(f"Chrome driver 초기화 완료 (headless={headless})")
        
    def login(self) -> bool:
        """로그인 처리 (사용자가 수동으로 로그인)"""
        try:
            # 일반 모드로 브라우저 열기
            self.setup_driver(headless=False)
            self.driver.get(config.ATTOK_URL)
            
            logger.info("브라우저에서 로그인해주세요...")
            
            # 로그인 대기 (특정 요소가 나타날 때까지)
            wait = WebDriverWait(self.driver, 300)  # 5분 대기
            
            # 로그인 후 나타나는 요소 확인 - attok 사이트의 실제 요소
            # attendance.asp 페이지나 로그아웃 버튼 등을 찾음
            logged_in = wait.until(
                lambda driver: "attendance" in driver.current_url or 
                driver.find_elements(By.XPATH, "//a[contains(@href, 'logout')]") or
                driver.find_elements(By.ID, "stdinfo_1")  # 학생 정보 div
            )
            
            if logged_in:
                self.is_logged_in = True
                logger.info("로그인 성공!")
                
                # 쿠키 저장 (나중에 재사용)
                cookies = self.driver.get_cookies()
                # TODO: 쿠키 저장 로직
                
                return True
                
        except Exception as e:
            logger.error(f"로그인 실패: {e}")
            return False
            
    def switch_to_headless(self):
        """헤드리스 모드로 전환"""
        if self.driver and self.is_logged_in:
            try:
                # 알림창 처리
                try:
                    alert = self.driver.switch_to.alert
                    alert.accept()
                    logger.info("세션 타임아웃 알림 처리됨")
                except:
                    pass  # 알림창이 없으면 계속 진행
                
                cookies = self.driver.get_cookies()
                current_url = self.driver.current_url
                
                # 기존 드라이버 종료
                self.driver.quit()
                
                # 헤드리스 모드로 재시작
                self.setup_driver(headless=True)
                self.driver.get(current_url)
                
                # 쿠키 복원 시 알림창 처리
                for cookie in cookies:
                    try:
                        self.driver.add_cookie(cookie)
                    except Exception as e:
                        # 알림창이 뜨면 처리
                        try:
                            alert = self.driver.switch_to.alert
                            alert.accept()
                            self.driver.add_cookie(cookie)
                        except:
                            logger.warning(f"쿠키 추가 실패: {cookie.get('name')}")
                    
                self.driver.refresh()
                logger.info("헤드리스 모드로 전환 완료")
            except Exception as e:
                logger.error(f"헤드리스 전환 실패: {e}")
                # 실패시 일반 모드 유지
                self.is_headless = False
            
    def check_students(self) -> List[Student]:
        """학생 출결 상태 확인"""
        if not self.driver or not self.is_logged_in:
            return []
            
        try:
            # attok 사이트의 실제 학생 요소 찾기
            # stdinfo_로 시작하는 div들
            student_elements = self.driver.find_elements(By.XPATH, "//div[starts-with(@id, 'stdinfo_')]")
            
            if not student_elements:
                # 다른 패턴 시도
                student_elements = self.driver.find_elements(By.XPATH, "//td[@bgcolor='#87CEEB' or @bgcolor='skyblue']")
            
            logger.info(f"찾은 학생 요소: {len(student_elements)}개")
            
            checked_in_students = []
            
            for element in student_elements:
                try:
                    # 배경색 확인
                    bg_color = element.value_of_css_property("background-color")
                    bg_attr = element.get_attribute("bgcolor")
                    
                    # 하늘색 확인 (여러 형식)
                    is_skyblue = (
                        "rgb(135, 206, 235)" in str(bg_color) or
                        "#87CEEB" in str(bg_attr).upper() or
                        "skyblue" in str(bg_attr).lower()
                    )
                    
                    if is_skyblue:
                        # 텍스트에서 한글 이름 추출
                        text = element.text
                        import re
                        name_match = re.search(r'[가-힣]{2,4}', text)
                        
                        if name_match:
                            student_name = name_match.group()
                            student_id = element.get_attribute("id") or student_name
                            
                            if student_id not in self.students:
                                # 새로운 출석 감지
                                student = Student(name=student_name, student_id=student_id)
                                student.start_class()
                                self.students[student_id] = student
                                checked_in_students.append(student)
                                
                                logger.info(f"학생 출석 감지: {student_name}")
                                
                                if self.on_student_checkin:
                                    self.on_student_checkin(student)
                            
                except Exception as e:
                    logger.debug(f"요소 처리 실패: {e}")
                    
            return checked_in_students
            
        except Exception as e:
            logger.error(f"학생 상태 확인 실패: {e}")
            return []
            
    def start_monitoring(self, callback: Callable = None):
        """모니터링 시작"""
        self.on_student_checkin = callback
        
        logger.info("모니터링 시작...")
        while True:
            try:
                self.check_students()
                time.sleep(config.CHECK_INTERVAL)
                
            except KeyboardInterrupt:
                logger.info("모니터링 중지")
                break
            except Exception as e:
                logger.error(f"모니터링 오류: {e}")
                time.sleep(config.CHECK_INTERVAL)
                
    def stop(self):
        """모니터링 중지 및 정리"""
        if self.driver:
            self.driver.quit()
            logger.info("드라이버 종료")