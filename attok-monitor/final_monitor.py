"""
최종 버전 - attok.co.kr 학원 출결 모니터링 시스템
실제 학생 이름들을 정확히 찾아내는 버전
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

# 컬러 출력 초기화
init()

class AttokMonitor:
    def __init__(self):
        self.driver = None
        self.students = {}  # 학생 정보 저장 {name: {status, check_in_time, timer_start, element}}
        self.total_students = 0
        self.monitoring = False
        
        # 필터링할 단어들 (학생 이름이 아닌 것들)
        self.exclude_words = [
            '정보수정', '출결', '수납', '등원', '하원', '출석', '결석',
            '등록', '퇴원', '전체', '조회', '검색', '추가', '삭제',
            '수정', '확인', '취소', '저장', '닫기', '로그인', '로그아웃',
            '납부', '보기', '재학생', '학생별', '반별', '생일', '로앤코로봇'
        ]
        
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
        """웹사이트 열기 및 로그인 대기"""
        try:
            self.driver.get("https://attok.co.kr/")
            print(f"{Fore.YELLOW}📌 로그인 페이지로 이동했습니다.{Style.RESET_ALL}")
            print(f"{Fore.CYAN}수동으로 로그인해주세요...{Style.RESET_ALL}")
            
            input(f"\n{Fore.GREEN}로그인 완료 후 Enter를 눌러주세요...{Style.RESET_ALL}")
            
            current_url = self.driver.current_url
            if "attendance" in current_url or "dashboard" in current_url:
                print(f"{Fore.GREEN}✓ 출석/대시보드 페이지로 이동 확인{Style.RESET_ALL}")
                return True
            else:
                print(f"{Fore.YELLOW}⚠ 현재 URL: {current_url}{Style.RESET_ALL}")
                return True  # 일단 진행
                
        except Exception as e:
            print(f"{Fore.RED}오류 발생: {str(e)}{Style.RESET_ALL}")
            return False
            
    def find_students_from_page(self):
        """페이지에서 학생 이름 찾기 - 개선된 버전"""
        try:
            print(f"\n{Fore.CYAN}학생 정보를 찾는 중...{Style.RESET_ALL}")
            
            # 페이지 전체 텍스트 가져오기
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            lines = page_text.split('\n')
            
            # 한글 이름 패턴으로 학생 찾기
            found_names = []
            for line in lines:
                line = line.strip()
                
                # 2-5글자 한글 이름 패턴
                if 2 <= len(line) <= 5:
                    # 모든 글자가 한글이거나 공백인지 확인
                    if all(ord('가') <= ord(c) <= ord('힣') or c == ' ' for c in line):
                        # 제외 단어가 아닌 경우만
                        if line not in self.exclude_words:
                            found_names.append(line)
            
            # 중복 제거
            unique_names = list(set(found_names))
            
            print(f"{Fore.GREEN}✓ {len(unique_names)}명의 학생을 찾았습니다:{Style.RESET_ALL}")
            for i, name in enumerate(unique_names, 1):
                print(f"  {i}. {name}")
            
            # 각 학생 정보 초기화
            for name in unique_names:
                self.students[name] = {
                    'status': 'unknown',  # 초기 상태는 unknown
                    'check_in_time': None,
                    'timer_start': None,
                    'element': None,  # 나중에 요소 찾기
                    'checkbox_index': None
                }
            
            self.total_students = len(self.students)
            
            # 체크박스와 학생 매칭 시도
            self.match_students_with_checkboxes()
            
            return True
            
        except Exception as e:
            print(f"{Fore.RED}학생 찾기 오류: {str(e)}{Style.RESET_ALL}")
            return False
            
    def match_students_with_checkboxes(self):
        """학생 이름과 체크박스 매칭"""
        try:
            print(f"\n{Fore.CYAN}체크박스와 학생 매칭 중...{Style.RESET_ALL}")
            
            # 모든 체크박스 찾기
            checkboxes = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
            print(f"체크박스 수: {len(checkboxes)}개")
            
            # 각 체크박스의 부모 요소에서 학생 이름 찾기
            matched_count = 0
            for i, checkbox in enumerate(checkboxes):
                try:
                    # 체크박스의 부모 요소들 탐색
                    parent = checkbox.find_element(By.XPATH, "..")
                    grandparent = parent.find_element(By.XPATH, "..")
                    great_grandparent = grandparent.find_element(By.XPATH, "..")
                    
                    # 부모 요소들의 텍스트 확인
                    parent_text = parent.text + " " + grandparent.text + " " + great_grandparent.text
                    
                    # 학생 이름 매칭
                    for name in self.students.keys():
                        if name in parent_text:
                            self.students[name]['checkbox_index'] = i
                            self.students[name]['element'] = grandparent
                            
                            # 체크박스 상태로 출석 여부 판단
                            is_checked = checkbox.is_selected()
                            
                            # 또는 배경색으로 판단
                            bg_color = grandparent.value_of_css_property("background-color")
                            is_present = self.is_student_present(bg_color)
                            
                            self.students[name]['status'] = 'present' if (is_checked or is_present) else 'absent'
                            matched_count += 1
                            break
                            
                except Exception:
                    continue
                    
            print(f"{Fore.GREEN}✓ {matched_count}명의 학생과 체크박스를 매칭했습니다.{Style.RESET_ALL}")
            
        except Exception as e:
            print(f"{Fore.YELLOW}체크박스 매칭 중 오류: {str(e)}{Style.RESET_ALL}")
            
    def is_student_present(self, bg_color):
        """배경색으로 출석 여부 판단"""
        if "rgb" in bg_color:
            try:
                rgb = bg_color.replace("rgba", "").replace("rgb", "").replace("(", "").replace(")", "").split(",")
                r, g, b = int(rgb[0].strip()), int(rgb[1].strip()), int(rgb[2].strip())
                
                # 회색 계열 (기본 색상)은 미출석
                is_gray = abs(r - g) < 20 and abs(g - b) < 20 and r > 200
                if is_gray:
                    return False
                
                # 파란색/하늘색 계열은 출석
                is_blue = b > r and b > g and b > 100
                is_cyan = g > 100 and b > 100 and r < g and r < b
                
                return is_blue or is_cyan
                
            except:
                return False
        return False
        
    def monitor_loop(self):
        """실시간 모니터링 루프"""
        print(f"\n{Fore.CYAN}=== 실시간 모니터링 시작 ==={Style.RESET_ALL}")
        self.monitoring = True
        check_count = 0
        
        # 현재 출석 상태 출력
        self.print_attendance_status()
        
        try:
            while self.monitoring:
                check_count += 1
                print(f"\n{Fore.YELLOW}[체크 #{check_count}] {datetime.now().strftime('%H:%M:%S')}{Style.RESET_ALL}")
                
                # 10초마다 페이지 새로고침하여 상태 업데이트
                if check_count % 2 == 0:  # 20초마다
                    print("페이지 새로고침...")
                    self.driver.refresh()
                    time.sleep(3)  # 새로고침 후 대기
                    
                    # 학생 정보 다시 찾기
                    self.find_students_from_page()
                    self.print_attendance_status()
                
                time.sleep(10)  # 10초 대기
                
        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}모니터링이 중단되었습니다.{Style.RESET_ALL}")
            
    def print_attendance_status(self):
        """현재 출석 현황 출력"""
        present = []
        absent = []
        unknown = []
        
        for name, info in self.students.items():
            if info['status'] == 'present':
                present.append(name)
            elif info['status'] == 'absent':
                absent.append(name)
            else:
                unknown.append(name)
        
        print(f"\n{Fore.CYAN}=== 현재 출석 현황 ==={Style.RESET_ALL}")
        print(f"{Fore.GREEN}출석 ({len(present)}명):{Style.RESET_ALL}")
        for name in present[:10]:  # 처음 10명만 표시
            print(f"  ✅ {name}")
        if len(present) > 10:
            print(f"  ... 외 {len(present)-10}명")
            
        print(f"\n{Fore.RED}미출석 ({len(absent)}명):{Style.RESET_ALL}")
        for name in absent[:10]:  # 처음 10명만 표시
            print(f"  ⭕ {name}")
        if len(absent) > 10:
            print(f"  ... 외 {len(absent)-10}명")
            
        if unknown:
            print(f"\n{Fore.YELLOW}상태 미확인 ({len(unknown)}명){Style.RESET_ALL}")
            
    def run(self):
        """메인 실행 함수"""
        print(f"{Fore.CYAN}{'='*50}")
        print(f"   attok.co.kr 출결 모니터링 시스템 Final")
        print(f"{'='*50}{Style.RESET_ALL}\n")
        
        # 1. 브라우저 시작
        self.setup_driver()
        
        # 2. 웹사이트 열기 및 로그인 대기
        if not self.open_website():
            return
            
        # 3. 학생 이름 찾기
        if not self.find_students_from_page():
            print(f"{Fore.RED}학생 정보를 찾을 수 없습니다.{Style.RESET_ALL}")
            return
            
        # 4. 실시간 모니터링 시작
        self.monitor_loop()
        
    def cleanup(self):
        """정리 작업"""
        if self.driver:
            self.driver.quit()
            print(f"{Fore.GREEN}브라우저를 종료했습니다.{Style.RESET_ALL}")


if __name__ == "__main__":
    monitor = AttokMonitor()
    try:
        monitor.run()
    finally:
        monitor.cleanup()