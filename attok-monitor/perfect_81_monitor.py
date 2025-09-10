"""
완벽한 81명 추출 - HTML 구조 기반
텍스트 필터링 없이 정확한 위치에서만 추출
"""
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from colorama import init, Fore, Style

init()

class Perfect81Monitor:
    def __init__(self):
        self.driver = None
        self.students = {}
        self.total_students = 81
        
    def setup_driver(self):
        """Chrome 드라이버 설정"""
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(options=options)
        print(f"{Fore.GREEN}[OK] Chrome 브라우저가 시작되었습니다.{Style.RESET_ALL}")
        
    def open_website(self):
        """웹사이트 열기 및 로그인"""
        try:
            self.driver.get("https://attok.co.kr/")
            print(f"{Fore.YELLOW}[LOGIN] 로그인 페이지로 이동했습니다.{Style.RESET_ALL}")
            print(f"{Fore.CYAN}수동으로 로그인 후 출결 페이지로 이동해주세요...{Style.RESET_ALL}")
            
            input(f"\n{Fore.GREEN}준비되면 Enter를 눌러주세요...{Style.RESET_ALL}")
            return True
                
        except Exception as e:
            print(f"{Fore.RED}오류 발생: {str(e)}{Style.RESET_ALL}")
            return False
            
    def get_students_from_structure(self):
        """HTML 구조에서 정확히 81명 추출"""
        print(f"\n{Fore.CYAN}=== 구조 기반 학생 추출 ==={Style.RESET_ALL}")
        
        students_found = {}
        
        # 방법 1: UL 리스트에서 추출 (가장 정확 - 81개 항목)
        try:
            print("\n1. UL 리스트에서 추출 시도...")
            
            # 모든 ul 찾기
            ul_elements = self.driver.find_elements(By.TAG_NAME, "ul")
            
            for ul in ul_elements:
                li_items = ul.find_elements(By.TAG_NAME, "li")
                
                # 81개 항목을 가진 ul이 학생 목록
                if len(li_items) == 81:
                    print(f"  [OK] 81개 항목을 가진 리스트 발견!")
                    
                    for i, li in enumerate(li_items, 1):
                        # li의 첫 번째 텍스트가 학생 이름
                        text = li.text.strip()
                        
                        # 첫 줄이 이름 (등원/하원 텍스트 제외)
                        lines = text.split('\n')
                        if lines:
                            name = lines[0].strip()
                            
                            # 간단한 검증 (최소한의 필터)
                            if name and len(name) >= 2 and len(name) <= 20:
                                # "등원", "하원" 같은 단독 단어가 아닌 경우
                                if name not in ['등원', '하원', '출결', '수납']:
                                    students_found[name] = {
                                        'index': i,
                                        'element': li,
                                        'full_text': text
                                    }
                    
                    print(f"  추출된 학생: {len(students_found)}명")
                    break
                    
        except Exception as e:
            print(f"  리스트 추출 오류: {str(e)}")
        
        # 방법 2: student_List ID에서 추출 (백업)
        if len(students_found) != 81:
            try:
                print("\n2. student_List ID에서 추출 시도...")
                
                student_list = self.driver.find_element(By.ID, "student_List")
                
                # 이름 패턴 찾기 (여기서는 최소한의 필터만)
                text = student_list.text
                lines = text.split('\n')
                
                temp_names = set()
                for line in lines:
                    line = line.strip()
                    # 2글자 이상, 20글자 이하
                    if 2 <= len(line) <= 20:
                        # 명백한 시스템 단어만 제외
                        if line not in ['출결수납', '등원', '하원', '출결', '수납', '-']:
                            # 숫자나 특수문자만 있는 경우 제외
                            if any(c for c in line if '가' <= c <= '힣'):
                                temp_names.add(line)
                
                # 기존 결과와 병합
                for name in temp_names:
                    if name not in students_found:
                        students_found[name] = {
                            'index': len(students_found) + 1,
                            'element': None,
                            'full_text': name
                        }
                
                print(f"  추가 추출: {len(temp_names)}명")
                
            except Exception as e:
                print(f"  student_List 추출 오류: {str(e)}")
        
        # 방법 3: JavaScript 변수 활용 (추가 정보)
        try:
            print("\n3. JavaScript 변수 확인...")
            
            js_names = self.driver.execute_script("""
                if(typeof studentInfoName !== 'undefined' && Array.isArray(studentInfoName)) {
                    return studentInfoName;
                }
                return [];
            """)
            
            if js_names:
                print(f"  JavaScript에서 {len(js_names)}명 발견")
                
                for name in js_names:
                    if isinstance(name, str) and name not in students_found:
                        students_found[name] = {
                            'index': len(students_found) + 1,
                            'element': None,
                            'full_text': name
                        }
                        
        except Exception as e:
            print(f"  JavaScript 추출 오류: {str(e)}")
        
        # 결과 저장
        self.students = students_found
        
        return students_found
        
    def display_results(self):
        """결과 출력"""
        print(f"\n{Fore.GREEN}=== 최종 결과 ==={Style.RESET_ALL}")
        print(f"목표: {self.total_students}명")
        print(f"찾음: {len(self.students)}명")
        
        if len(self.students) == self.total_students:
            print(f"{Fore.GREEN}[SUCCESS] 정확히 {self.total_students}명을 찾았습니다!{Style.RESET_ALL}")
        elif len(self.students) < self.total_students:
            print(f"{Fore.YELLOW}[!] {self.total_students - len(self.students)}명이 부족합니다.{Style.RESET_ALL}")
        else:
            print(f"{Fore.YELLOW}[!] {len(self.students) - self.total_students}명이 초과되었습니다.{Style.RESET_ALL}")
        
        # 전체 명단 출력
        sorted_names = sorted(self.students.keys())
        print(f"\n{Fore.CYAN}학생 명단 (전체 {len(sorted_names)}명):{Style.RESET_ALL}")
        
        # 3열로 표시
        cols = 3
        rows = (len(sorted_names) + cols - 1) // cols
        
        for row in range(rows):
            line = ""
            for col in range(cols):
                idx = row + col * rows
                if idx < len(sorted_names):
                    line += f"  {idx+1:3d}. {sorted_names[idx]:15s}"
            print(line)
            
    def monitor_attendance(self):
        """실시간 출석 모니터링"""
        print(f"\n{Fore.CYAN}=== 실시간 출석 모니터링 ==={Style.RESET_ALL}")
        print(f"10초마다 체크, Ctrl+C로 종료\n")
        
        try:
            while True:
                # ul 리스트에서 출석 상태 확인
                ul_elements = self.driver.find_elements(By.TAG_NAME, "ul")
                
                for ul in ul_elements:
                    li_items = ul.find_elements(By.TAG_NAME, "li")
                    
                    if len(li_items) == 81:
                        # 각 학생의 등원/하원 상태 체크
                        attendance_count = 0
                        
                        for li in li_items:
                            text = li.text
                            # "등원 -" 이 아니면 출석
                            if "등원 -" not in text:
                                attendance_count += 1
                        
                        timestamp = datetime.now().strftime('%H:%M:%S')
                        print(f"[{timestamp}] 출석: {attendance_count}/{self.total_students}명", end='\r')
                        break
                
                time.sleep(10)
                
        except KeyboardInterrupt:
            print(f"\n\n{Fore.YELLOW}모니터링이 종료되었습니다.{Style.RESET_ALL}")
            
    def run(self):
        """메인 실행"""
        print(f"{Fore.CYAN}{'='*60}")
        print(f"   완벽한 81명 출결 모니터링 시스템")
        print(f"   HTML 구조 기반 정확한 추출")
        print(f"{'='*60}{Style.RESET_ALL}\n")
        
        # 1. 브라우저 시작
        self.setup_driver()
        
        # 2. 로그인
        if not self.open_website():
            return
            
        # 3. 구조에서 학생 추출
        self.get_students_from_structure()
        
        # 4. 결과 표시
        self.display_results()
        
        # 5. 모니터링 시작
        print(f"\n{Fore.GREEN}출석 모니터링을 시작하시겠습니까? (y/n): {Style.RESET_ALL}", end="")
        if input().lower() == 'y':
            self.monitor_attendance()
            
    def cleanup(self):
        """정리"""
        if self.driver:
            self.driver.quit()
            print(f"{Fore.GREEN}프로그램을 종료합니다.{Style.RESET_ALL}")


if __name__ == "__main__":
    monitor = Perfect81Monitor()
    try:
        monitor.run()
    finally:
        monitor.cleanup()