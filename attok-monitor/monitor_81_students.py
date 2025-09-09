"""
attok.co.kr 출결 모니터링 시스템 - 81명 학생 정확히 추적
전체(81) 표시된 실제 학생만 모니터링
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

# 컬러 출력 초기화
init()

class AttokMonitor81:
    def __init__(self):
        self.driver = None
        self.students = {}  # 학생 정보 저장
        self.total_students = 81  # 실제 학생 수
        self.monitoring = False
        
        # 학생 이름이 아닌 것들 (확실한 것만)
        self.not_names = [
            '로앤코로봇',  # 회사명/로그인ID
            '납부', '보기', '재학생', '학생별', '반별', '생일',
            '정보수정', '출결', '수납', '등원', '하원', '출석', '결석',
            '등록', '퇴원', '전체', '조회', '검색', '추가', '삭제',
            '수정', '확인', '취소', '저장', '닫기', '로그인', '로그아웃',
            '월', '화', '수', '목', '금', '토', '일',
            '오전', '오후', '시간', '분', '초',
            '전체반', '수업', '교실', '선생님', '관리', '설정',
            '메뉴', '홈', '대시보드', '리포트', '통계'
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
            
            # 전체 학생 수 확인
            self.verify_student_count()
            
            return True
                
        except Exception as e:
            print(f"{Fore.RED}오류 발생: {str(e)}{Style.RESET_ALL}")
            return False
            
    def verify_student_count(self):
        """전체(81) 확인"""
        try:
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            # "전체(81)" 패턴 찾기
            matches = re.findall(r'전체\s*\(\s*(\d+)\s*\)', page_text)
            if matches:
                count = int(matches[0])
                print(f"{Fore.GREEN}✓ 전체 학생 수 확인: {count}명{Style.RESET_ALL}")
                self.total_students = count
            else:
                print(f"{Fore.YELLOW}⚠ 전체 학생 수를 찾을 수 없습니다. 기본값 81명 사용{Style.RESET_ALL}")
                
        except Exception as e:
            print(f"{Fore.YELLOW}학생 수 확인 중 오류: {str(e)}{Style.RESET_ALL}")
            
    def find_all_students(self):
        """81명의 학생 찾기"""
        print(f"\n{Fore.CYAN}=== {self.total_students}명 학생 찾기 시작 ==={Style.RESET_ALL}")
        
        # 1. 페이지 스크롤하여 모든 학생 로드
        self.scroll_to_load_all()
        
        # 2. 다양한 방법으로 학생 찾기
        students_found = set()
        
        # 방법 1: 체크박스 기준
        self.find_students_by_checkbox(students_found)
        
        # 방법 2: 테이블 행 기준
        self.find_students_by_table_rows(students_found)
        
        # 방법 3: 페이지 텍스트에서 이름 패턴
        self.find_students_by_text_pattern(students_found)
        
        # 결과 정리
        print(f"\n{Fore.GREEN}=== 찾은 학생 정보 ==={Style.RESET_ALL}")
        print(f"목표: {self.total_students}명")
        print(f"찾음: {len(students_found)}명")
        
        # 학생 정보 저장
        for name in students_found:
            if name not in self.students:
                self.students[name] = {
                    'status': 'unknown',
                    'check_in_time': None,
                    'check_out_time': None,
                    'element': None
                }
        
        # 찾은 학생 이름 출력 (처음 20명)
        sorted_names = sorted(students_found)
        print(f"\n{Fore.CYAN}학생 명단:{Style.RESET_ALL}")
        for i, name in enumerate(sorted_names[:20], 1):
            print(f"  {i:2d}. {name}")
        if len(sorted_names) > 20:
            print(f"  ... 외 {len(sorted_names)-20}명")
            
        # 부족한 인원 수
        if len(students_found) < self.total_students:
            missing = self.total_students - len(students_found)
            print(f"\n{Fore.YELLOW}⚠ {missing}명을 찾지 못했습니다.{Style.RESET_ALL}")
            print("이름이 특수한 형태이거나 다른 위치에 있을 수 있습니다.")
            
    def scroll_to_load_all(self):
        """페이지 스크롤하여 모든 학생 로드"""
        print("페이지를 스크롤하여 모든 학생을 로드합니다...")
        
        last_height = self.driver.execute_script("return document.body.scrollHeight")
        scroll_count = 0
        
        while scroll_count < 5:  # 최대 5번 스크롤
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
            scroll_count += 1
            
        # 맨 위로 스크롤
        self.driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)
        
    def find_students_by_checkbox(self, students_found):
        """체크박스 주변에서 학생 이름 찾기"""
        print("\n체크박스 기준 검색...")
        
        checkboxes = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
        print(f"체크박스 {len(checkboxes)}개 발견")
        
        for checkbox in checkboxes[:100]:  # 처음 100개만 (81명이므로)
            try:
                # 체크박스 주변 텍스트 수집
                parent = checkbox.find_element(By.XPATH, "..")
                grandparent = parent.find_element(By.XPATH, "..")
                
                text = parent.text + " " + grandparent.text
                
                # 이름 추출
                name = self.extract_name(text)
                if name:
                    students_found.add(name)
                    
            except:
                continue
                
    def find_students_by_table_rows(self, students_found):
        """테이블 행에서 학생 이름 찾기"""
        print("\n테이블 행 기준 검색...")
        
        rows = self.driver.find_elements(By.TAG_NAME, "tr")
        
        for row in rows:
            try:
                row_text = row.text
                
                # 학생 행인지 확인 (등원/하원 텍스트 포함)
                if "등원" in row_text or "하원" in row_text:
                    name = self.extract_name(row_text)
                    if name:
                        students_found.add(name)
                        
            except:
                continue
                
    def find_students_by_text_pattern(self, students_found):
        """페이지 텍스트에서 이름 패턴 찾기"""
        print("\n텍스트 패턴 검색...")
        
        page_text = self.driver.find_element(By.TAG_NAME, "body").text
        lines = page_text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # 2-5글자 한글 이름 패턴
            if 2 <= len(line) <= 5:
                if self.is_korean_name(line) and line not in self.not_names:
                    students_found.add(line)
                    
    def extract_name(self, text):
        """텍스트에서 학생 이름 추출"""
        if not text:
            return None
            
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # 2-5글자 한글 체크
            if 2 <= len(line) <= 5:
                if self.is_korean_name(line) and line not in self.not_names:
                    return line
                    
        return None
        
    def is_korean_name(self, text):
        """한글 이름인지 확인"""
        if not text:
            return False
            
        # 최소 2글자는 한글이어야 함
        korean_count = sum(1 for c in text if ord('가') <= ord(c) <= ord('힣'))
        
        # 공백은 허용
        space_count = text.count(' ')
        
        # 특수문자는 최대 1개까지
        special_count = sum(1 for c in text if not (c.isalnum() or c.isspace()))
        
        return korean_count >= 2 and special_count <= 1
        
    def check_attendance_status(self):
        """현재 출석 상태 확인"""
        print(f"\n{Fore.CYAN}=== 출석 상태 확인 ==={Style.RESET_ALL}")
        
        present_count = 0
        absent_count = 0
        
        # 체크박스 상태로 출석 확인
        checkboxes = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']:checked")
        present_count = len(checkboxes)
        
        print(f"현재 출석: {present_count}명")
        print(f"미출석: {self.total_students - present_count}명")
        
        return present_count
        
    def monitor_loop(self):
        """실시간 모니터링"""
        print(f"\n{Fore.CYAN}=== 실시간 모니터링 시작 ==={Style.RESET_ALL}")
        print(f"총 {self.total_students}명 학생 모니터링 중...")
        print("10초마다 체크, Ctrl+C로 종료\n")
        
        self.monitoring = True
        check_count = 0
        last_present = 0
        
        try:
            while self.monitoring:
                check_count += 1
                
                # 현재 출석 인원 확인
                current_present = self.check_attendance_status()
                
                # 변화가 있으면 알림
                if current_present != last_present:
                    change = current_present - last_present
                    if change > 0:
                        print(f"{Fore.GREEN}✅ {change}명 추가 출석! (총 {current_present}명){Style.RESET_ALL}")
                    else:
                        print(f"{Fore.YELLOW}⚠ {abs(change)}명 상태 변경 (총 {current_present}명){Style.RESET_ALL}")
                    last_present = current_present
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 변화 없음 (출석: {current_present}/{self.total_students})")
                
                # 30초마다 새로고침
                if check_count % 3 == 0:
                    print("페이지 새로고침...")
                    self.driver.refresh()
                    time.sleep(3)
                    
                time.sleep(10)
                
        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}모니터링이 중단되었습니다.{Style.RESET_ALL}")
            
    def run(self):
        """메인 실행 함수"""
        print(f"{Fore.CYAN}{'='*60}")
        print(f"   attok.co.kr 출결 모니터링 시스템")
        print(f"   목표: {self.total_students}명 학생 추적")
        print(f"{'='*60}{Style.RESET_ALL}\n")
        
        # 1. 브라우저 시작
        self.setup_driver()
        
        # 2. 웹사이트 열기 및 로그인
        if not self.open_website():
            return
            
        # 3. 학생 찾기
        self.find_all_students()
        
        # 4. 모니터링 시작 여부 확인
        print(f"\n{Fore.GREEN}실시간 모니터링을 시작하시겠습니까? (y/n): {Style.RESET_ALL}", end="")
        if input().lower() == 'y':
            self.monitor_loop()
            
    def cleanup(self):
        """정리 작업"""
        if self.driver:
            self.driver.quit()
            print(f"{Fore.GREEN}브라우저를 종료했습니다.{Style.RESET_ALL}")


if __name__ == "__main__":
    monitor = AttokMonitor81()
    try:
        monitor.run()
    finally:
        monitor.cleanup()