"""
최종 버전 - JavaScript를 활용한 81명 학생 완벽 추적
studentInfo 변수와 탭 네비게이션을 활용
"""
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from colorama import init, Fore, Style
import re

init()

class Final81Monitor:
    def __init__(self):
        self.driver = None
        self.students = {}
        self.total_students = 81
        self.monitoring = False
        
    def setup_driver(self):
        """Chrome 드라이버 설정"""
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(options=options)
        print(f"{Fore.GREEN}✓ Chrome 브라우저가 시작되었습니다.{Style.RESET_ALL}")
        
    def open_website(self):
        """웹사이트 열기 및 로그인"""
        try:
            self.driver.get("https://attok.co.kr/")
            print(f"{Fore.YELLOW}📌 로그인 페이지로 이동했습니다.{Style.RESET_ALL}")
            print(f"{Fore.CYAN}수동으로 로그인해주세요...{Style.RESET_ALL}")
            
            input(f"\n{Fore.GREEN}로그인 완료 후 Enter를 눌러주세요...{Style.RESET_ALL}")
            
            return True
                
        except Exception as e:
            print(f"{Fore.RED}오류 발생: {str(e)}{Style.RESET_ALL}")
            return False
            
    def get_all_students_from_javascript(self):
        """JavaScript 변수에서 학생 정보 추출"""
        print(f"\n{Fore.CYAN}=== JavaScript에서 학생 정보 추출 ==={Style.RESET_ALL}")
        
        try:
            # studentInfo 변수 확인
            student_data = self.driver.execute_script("""
                if(typeof studentInfo !== 'undefined') {
                    return studentInfo;
                }
                return null;
            """)
            
            if student_data:
                print(f"{Fore.GREEN}✓ studentInfo 변수에서 데이터 발견!{Style.RESET_ALL}")
                
                # 데이터가 배열인지 객체인지 확인
                if isinstance(student_data, list):
                    print(f"  학생 배열: {len(student_data)}명")
                    for item in student_data:
                        if isinstance(item, dict):
                            # 이름 필드 찾기
                            name = item.get('name') or item.get('studentName') or item.get('student_name')
                            if name:
                                self.students[name] = {
                                    'data': item,
                                    'status': 'unknown'
                                }
                elif isinstance(student_data, dict):
                    print(f"  학생 객체 발견")
                    # 딕셔너리 구조 분석
                    for key, value in student_data.items():
                        if isinstance(value, dict):
                            name = value.get('name') or value.get('studentName') or key
                            self.students[name] = {
                                'data': value,
                                'status': 'unknown'
                            }
                            
            # 다른 JavaScript 함수나 변수 시도
            other_data = self.driver.execute_script("""
                var students = [];
                
                // 전역 변수 검색
                for(var key in window) {
                    if(key.toLowerCase().includes('student') && typeof window[key] === 'object') {
                        students.push({key: key, data: window[key]});
                    }
                }
                
                // 함수 호출 시도
                if(typeof setAttendance_studentSearch === 'function') {
                    students.push({key: 'function_result', data: 'function exists'});
                }
                
                return students;
            """)
            
            if other_data:
                print(f"  추가 JavaScript 객체: {len(other_data)}개")
                
        except Exception as e:
            print(f"{Fore.YELLOW}JavaScript 추출 중 오류: {str(e)}{Style.RESET_ALL}")
            
    def navigate_all_tabs(self):
        """모든 탭을 순회하며 학생 찾기"""
        print(f"\n{Fore.CYAN}=== 탭 네비게이션으로 학생 찾기 ==={Style.RESET_ALL}")
        
        # 탭 찾기
        tabs = self.driver.find_elements(By.CSS_SELECTOR, "a[class*='tab']")
        if not tabs:
            tabs = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='#']")
            
        print(f"발견된 탭: {len(tabs)}개")
        
        for i, tab in enumerate(tabs):
            try:
                tab_text = tab.text.strip()
                if tab_text:
                    print(f"\n탭 {i+1}: {tab_text}")
                    
                    # 탭 클릭
                    self.driver.execute_script("arguments[0].click();", tab)
                    time.sleep(2)  # 로딩 대기
                    
                    # 현재 탭에서 학생 찾기
                    self.find_students_in_current_view()
                    
            except Exception as e:
                print(f"  탭 클릭 실패: {str(e)}")
                continue
                
    def find_students_in_current_view(self):
        """현재 화면에서 학생 찾기"""
        
        # 체크박스 찾기
        checkboxes = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']:not([disabled])")
        visible_checkboxes = [cb for cb in checkboxes if cb.is_displayed()]
        
        print(f"  현재 화면 체크박스: {len(visible_checkboxes)}개")
        
        # 페이지 텍스트에서 이름 추출
        page_text = self.driver.find_element(By.TAG_NAME, "body").text
        lines = page_text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # 한글 이름 패턴 (2-5글자)
            if 2 <= len(line) <= 5:
                if self.is_korean_name(line):
                    if line not in self.students:
                        self.students[line] = {
                            'status': 'found',
                            'check_in_time': None
                        }
                        
    def is_korean_name(self, text):
        """한글 이름 판별"""
        if not text:
            return False
            
        # 제외할 단어들
        exclude = ['등원', '하원', '출결', '수납', '전체', '로그인', '납부', 
                  '보기', '생일', '반별', '학생별', '조회', '검색', '추가',
                  '삭제', '수정', '확인', '취소', '저장', '로앤코로봇']
        
        if text in exclude:
            return False
            
        # 한글 개수 확인
        korean_count = sum(1 for c in text if ord('가') <= ord(c) <= ord('힣'))
        
        return korean_count >= 2
        
    def try_load_all_students(self):
        """다양한 방법으로 81명 모두 로드 시도"""
        print(f"\n{Fore.CYAN}=== 81명 전체 로드 시도 ==={Style.RESET_ALL}")
        
        # 1. 드롭다운에서 "전체" 선택 시도
        selects = self.driver.find_elements(By.TAG_NAME, "select")
        for select in selects:
            try:
                options = select.find_elements(By.TAG_NAME, "option")
                for option in options:
                    if "전체" in option.text or "81" in option.text:
                        option.click()
                        print(f"  '전체' 옵션 선택됨")
                        time.sleep(2)
                        break
            except:
                continue
                
        # 2. 페이지 크기 변경 시도
        for select in selects:
            try:
                options = select.find_elements(By.TAG_NAME, "option")
                # 가장 큰 숫자 찾기
                max_option = None
                max_value = 0
                
                for option in options:
                    text = option.text.strip()
                    if text.isdigit():
                        value = int(text)
                        if value > max_value:
                            max_value = value
                            max_option = option
                            
                if max_option and max_value >= 50:
                    max_option.click()
                    print(f"  페이지 크기 {max_value}로 변경")
                    time.sleep(2)
                    
            except:
                continue
                
        # 3. 스크롤로 추가 로드
        last_count = len(self.students)
        for _ in range(5):
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            self.find_students_in_current_view()
            
            new_count = len(self.students)
            if new_count > last_count:
                print(f"  스크롤로 {new_count - last_count}명 추가 발견")
                last_count = new_count
                
    def display_results(self):
        """결과 출력"""
        print(f"\n{Fore.GREEN}=== 최종 결과 ==={Style.RESET_ALL}")
        print(f"목표: {self.total_students}명")
        print(f"찾음: {len(self.students)}명")
        
        if len(self.students) > 0:
            sorted_names = sorted(self.students.keys())
            
            print(f"\n{Fore.CYAN}학생 명단:{Style.RESET_ALL}")
            for i, name in enumerate(sorted_names, 1):
                if i <= 30:  # 처음 30명만
                    print(f"  {i:2d}. {name}")
                    
            if len(sorted_names) > 30:
                print(f"  ... 외 {len(sorted_names)-30}명")
                
        if len(self.students) < self.total_students:
            missing = self.total_students - len(self.students)
            print(f"\n{Fore.YELLOW}⚠ {missing}명을 찾지 못했습니다.{Style.RESET_ALL}")
            print("팁: 다른 탭이나 필터를 확인해보세요.")
            
    def monitor_attendance(self):
        """출석 상태 모니터링"""
        print(f"\n{Fore.CYAN}=== 출석 모니터링 ==={Style.RESET_ALL}")
        
        # 현재 체크된 체크박스 수 확인
        checked = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']:checked")
        print(f"현재 출석: {len(checked)}명")
        
        # 실시간 모니터링
        print("\n10초마다 체크, Ctrl+C로 종료")
        
        try:
            last_count = len(checked)
            while True:
                time.sleep(10)
                
                checked = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']:checked")
                current_count = len(checked)
                
                if current_count != last_count:
                    change = current_count - last_count
                    timestamp = datetime.now().strftime('%H:%M:%S')
                    
                    if change > 0:
                        print(f"[{timestamp}] ✅ {change}명 추가 출석 (총 {current_count}명)")
                    else:
                        print(f"[{timestamp}] ⚠ 출석 변경 (총 {current_count}명)")
                        
                    last_count = current_count
                else:
                    print(f".", end="", flush=True)
                    
        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}모니터링 종료{Style.RESET_ALL}")
            
    def run(self):
        """메인 실행"""
        print(f"{Fore.CYAN}{'='*60}")
        print(f"   최종 출결 모니터링 시스템")
        print(f"   JavaScript + 탭 네비게이션 활용")
        print(f"{'='*60}{Style.RESET_ALL}\n")
        
        # 1. 브라우저 시작
        self.setup_driver()
        
        # 2. 로그인
        if not self.open_website():
            return
            
        # 3. JavaScript에서 학생 정보 추출
        self.get_all_students_from_javascript()
        
        # 4. 전체 학생 로드 시도
        self.try_load_all_students()
        
        # 5. 모든 탭 순회
        self.navigate_all_tabs()
        
        # 6. 결과 출력
        self.display_results()
        
        # 7. 모니터링 시작
        print(f"\n{Fore.GREEN}출석 모니터링을 시작하시겠습니까? (y/n): {Style.RESET_ALL}", end="")
        if input().lower() == 'y':
            self.monitor_attendance()
            
    def cleanup(self):
        """정리"""
        if self.driver:
            self.driver.quit()
            print(f"{Fore.GREEN}프로그램을 종료합니다.{Style.RESET_ALL}")


if __name__ == "__main__":
    monitor = Final81Monitor()
    try:
        monitor.run()
    finally:
        monitor.cleanup()