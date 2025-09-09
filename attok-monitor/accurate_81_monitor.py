"""
정확한 81명 학생만 추출하는 개선된 모니터링 시스템
UI 요소와 실제 학생 이름을 정확히 구분
"""
import time
import json
import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from colorama import init, Fore, Style

init()

class Accurate81Monitor:
    def __init__(self):
        self.driver = None
        self.students = {}
        self.total_students = 81
        self.monitoring = False
        
        # UI 요소 필터링을 위한 확장된 제외 목록
        self.ui_elements = {
            # 괄호가 있는 패턴들 - 학교명이 아닌 경우만
            '등원', '하원', '출석', '결석', '지각', '조퇴', '미납',
            # 관리/시스템 용어
            '관리', '설정', '조회', '검색', '추가', '삭제', '수정', '저장',
            '확인', '취소', '닫기', '보기', '전체', '선택', '해제', '초기화',
            '미등록', '미지정', '미배정', '미분류', '출결', '학생', '학생등록', '등록',  # 추가
            # 메뉴/네비게이션
            '대시보드', '리포트', '통계', '분석', '홈', '메뉴', '로그인', '로그아웃',
            # 학원 관련 행정 용어
            '담임', '반장', '부반장', '수납', '납부', '미납처리', '수업료',
            '월납', '분납', '할인', '환불', '이월', '연체', '독촉',
            # 시간/날짜 관련
            '오전', '오후', '월', '화', '수', '목', '금', '토', '일',
            '시간', '분', '초', '년', '월', '일', '오늘', '어제', '내일',
            '금일', '익일', '전일', '주간', '월간', '연간',
            # 상태 표시
            '정상', '비정상', '활성', '비활성', '사용', '미사용', '완료', '미완료',
            # 기타 시스템 용어
            '로앤코로봇', '시스템', '서버', '데이터', '정보', '상세', '요약',
            '목록', '테이블', '그리드', '차트', '그래프', '필터', '정렬',
            # 교육 관련
            '수업', '강의', '교실', '학년', '반', '번호', '학번', '출석번호',
            '평가', '시험', '과제', '숙제', '성적', '점수', '등급',
            # 버튼/액션
            '클릭', '선택하세요', '입력하세요', '다운로드', '업로드', '인쇄',
            '내보내기', '가져오기', '새로고침', '되돌리기', '다시하기'
        }
        
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
            print(f"{Fore.CYAN}수동으로 로그인해주세요...{Style.RESET_ALL}")
            
            input(f"\n{Fore.GREEN}로그인 완료 후 Enter를 눌러주세요...{Style.RESET_ALL}")
            
            # 전체(81) 확인
            self.verify_student_count()
            
            return True
                
        except Exception as e:
            print(f"{Fore.RED}오류 발생: {str(e)}{Style.RESET_ALL}")
            return False
            
    def verify_student_count(self):
        """전체(81) 확인 및 실제 학생 수 파악"""
        try:
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            # "전체(81)" 또는 "전체 (81)" 패턴 찾기
            matches = re.findall(r'전체\s*\(\s*(\d+)\s*\)', page_text)
            if matches:
                count = int(matches[0])
                print(f"{Fore.GREEN}[OK] 전체 학생 수 확인: {count}명{Style.RESET_ALL}")
                self.total_students = count
            else:
                print(f"{Fore.YELLOW}[!] 전체 학생 수를 찾을 수 없습니다. 기본값 81명 사용{Style.RESET_ALL}")
                
        except Exception as e:
            print(f"{Fore.YELLOW}학생 수 확인 중 오류: {str(e)}{Style.RESET_ALL}")
            
    def is_valid_student_name(self, text):
        """실제 학생 이름인지 정밀 검증"""
        if not text or not text.strip():
            return False
            
        text = text.strip()
        
        # 괄호가 있는 경우 처리 (예: "김도윤(성광)")
        base_name = text
        school_info = ""
        if '(' in text and ')' in text:
            # 괄호 안이 숫자만 있으면 제외 (예: "등원(1)")
            paren_content = text[text.index('(')+1:text.index(')')]
            if paren_content.isdigit():
                return False
            # 괄호 앞부분을 이름으로 추출
            base_name = text[:text.index('(')].strip()
            school_info = paren_content
            
        # 공백으로 학교명이 붙은 경우 처리 (예: "김동훈 동변초")
        if ' ' in base_name:
            parts = base_name.split(' ')
            # 첫 부분이 한글 이름이면 허용
            if len(parts[0]) >= 2 and len(parts[0]) <= 5:
                if all('가' <= c <= '힣' for c in parts[0]):
                    base_name = parts[0]  # 이름 부분만 추출
        
        # 직책이 포함된 경우 길이 제한 완화
        has_title = False
        for title in ['원장님', '선생님', '관장님', '교수님']:
            if title in text and text != title:
                has_title = True
                break
        
        # 기본 이름 길이 체크 (2-5글자, 직책 포함시 10글자까지)
        max_length = 10 if has_title else 5
        if len(base_name) < 2 or len(base_name) > max_length:
            return False
            
        # UI 요소 키워드 체크 (전체 일치하는 경우만)
        # 단, 요일은 완전 일치할 때만 제외 (김현수의 '수'는 통과)
        # "요일"이라는 이름은 허용
        weekdays = ['월', '화', '수', '목', '금', '토', '일']
        if base_name in weekdays and base_name != "요일":
            return False
            
        # 다른 UI 요소들은 포함 여부로 체크 (요일 제외)
        for ui_word in self.ui_elements:
            if ui_word not in weekdays:  # 요일이 아닌 경우
                if ui_word in base_name or ui_word == base_name:
                    return False
                
        # 기본 이름에 숫자가 포함된 경우 - 테스트용 이름은 허용
        if any(char.isdigit() for char in base_name):
            # "테스트1", "테스트2" 같은 경우는 허용
            if base_name.startswith('테스트'):
                return True
            return False
            
        # 특수문자 체크 (한글과 공백만 허용)
        for char in base_name:
            if not ('가' <= char <= '힣' or char == ' '):
                return False
                
        # 최소 2글자 이상의 한글 포함 확인
        korean_chars = sum(1 for c in base_name if '가' <= c <= '힣')
        if korean_chars < 2:
            return False
            
        # 공백이 너무 많으면 제외
        if base_name.count(' ') > 1:
            return False
            
        # 단일 글자 반복 체크
        if len(set(base_name.replace(' ', ''))) == 1:
            return False
            
        # "원장님" 같은 직책이 포함된 경우 - 이름+직책 형태는 허용
        # 예: "신명신원장님"은 허용, 단독 "원장님"은 제외
        titles = ['원장님', '선생님', '관장님', '교수님', '원장', '선생', '관장', '교수']
        for title in titles:
            if text == title:  # 직책만 있는 경우만 제외
                return False
            # 이름+직책 형태는 허용 (예: 신명신원장님)
                
        return True
        
    def extract_students_from_checkboxes(self):
        """체크박스 주변에서 정확한 학생 이름 추출"""
        print(f"\n{Fore.CYAN}=== 체크박스 기반 학생 추출 ==={Style.RESET_ALL}")
        
        students_found = set()
        
        try:
            # 모든 체크박스 찾기
            checkboxes = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
            print(f"발견된 체크박스: {len(checkboxes)}개")
            
            for checkbox in checkboxes:
                try:
                    # 체크박스의 부모 요소들 탐색
                    parent = checkbox.find_element(By.XPATH, "..")
                    grandparent = parent.find_element(By.XPATH, "..")
                    
                    # 주변 텍스트 수집
                    texts = []
                    
                    # 같은 행의 텍스트 수집
                    row_elements = grandparent.find_elements(By.XPATH, ".//*[text()]")
                    for elem in row_elements:
                        text = elem.text.strip()
                        if text:
                            texts.append(text)
                    
                    # 텍스트에서 학생 이름 추출
                    for text in texts:
                        # 여러 줄로 나뉜 경우 처리
                        for line in text.split('\n'):
                            line = line.strip()
                            if self.is_valid_student_name(line):
                                students_found.add(line)
                                
                except Exception:
                    continue
                    
        except Exception as e:
            print(f"{Fore.YELLOW}체크박스 추출 중 오류: {str(e)}{Style.RESET_ALL}")
            
        return students_found
        
    def extract_students_from_table(self):
        """테이블 구조에서 학생 이름 추출"""
        print(f"\n{Fore.CYAN}=== 테이블 기반 학생 추출 ==={Style.RESET_ALL}")
        
        students_found = set()
        
        try:
            # 테이블 행 찾기
            rows = self.driver.find_elements(By.TAG_NAME, "tr")
            
            for row in rows:
                try:
                    cells = row.find_elements(By.TAG_NAME, "td")
                    
                    for cell in cells:
                        text = cell.text.strip()
                        
                        # 셀 내용이 여러 줄인 경우
                        for line in text.split('\n'):
                            line = line.strip()
                            if self.is_valid_student_name(line):
                                students_found.add(line)
                                
                except Exception:
                    continue
                    
        except Exception as e:
            print(f"{Fore.YELLOW}테이블 추출 중 오류: {str(e)}{Style.RESET_ALL}")
            
        return students_found
        
    def navigate_and_collect_students(self):
        """모든 탭과 페이지를 순회하며 학생 수집"""
        print(f"\n{Fore.CYAN}=== 전체 페이지 순회 ==={Style.RESET_ALL}")
        
        all_students = set()
        
        # 1. 현재 페이지에서 수집
        students_checkbox = self.extract_students_from_checkboxes()
        students_table = self.extract_students_from_table()
        all_students.update(students_checkbox)
        all_students.update(students_table)
        
        print(f"현재 페이지: {len(all_students)}명 발견")
        
        # 2. 드롭다운에서 "전체" 선택 시도
        try:
            selects = self.driver.find_elements(By.TAG_NAME, "select")
            for select in selects:
                options = select.find_elements(By.TAG_NAME, "option")
                for option in options:
                    if "전체" in option.text or "81" in option.text:
                        option.click()
                        print(f"'전체' 옵션 선택")
                        time.sleep(2)
                        
                        # 다시 수집
                        students_checkbox = self.extract_students_from_checkboxes()
                        students_table = self.extract_students_from_table()
                        all_students.update(students_checkbox)
                        all_students.update(students_table)
                        break
        except:
            pass
            
        # 3. 탭 순회
        try:
            tabs = self.driver.find_elements(By.CSS_SELECTOR, "a[class*='tab']")
            if not tabs:
                tabs = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='#']")
                
            for i, tab in enumerate(tabs[:10]):  # 최대 10개 탭만
                try:
                    tab_text = tab.text.strip()
                    if tab_text and not any(ui in tab_text for ui in ['로그아웃', '설정', '도움말']):
                        print(f"탭 이동: {tab_text}")
                        self.driver.execute_script("arguments[0].click();", tab)
                        time.sleep(2)
                        
                        # 수집
                        students_checkbox = self.extract_students_from_checkboxes()
                        students_table = self.extract_students_from_table()
                        all_students.update(students_checkbox)
                        all_students.update(students_table)
                        
                except:
                    continue
        except:
            pass
            
        # 4. 스크롤하여 추가 로드
        for _ in range(3):
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            
            students_checkbox = self.extract_students_from_checkboxes()
            students_table = self.extract_students_from_table()
            all_students.update(students_checkbox)
            all_students.update(students_table)
            
        return all_students
        
    def find_all_students(self):
        """81명의 정확한 학생 찾기"""
        print(f"\n{Fore.CYAN}=== 정확한 {self.total_students}명 학생 찾기 ==={Style.RESET_ALL}")
        
        # 모든 방법으로 학생 수집
        all_students = self.navigate_and_collect_students()
        
        # 결과 저장
        for name in all_students:
            self.students[name] = {
                'status': 'unknown',
                'checked': False,
                'check_time': None
            }
            
        # 결과 출력
        print(f"\n{Fore.GREEN}=== 최종 결과 ==={Style.RESET_ALL}")
        print(f"목표: {self.total_students}명")
        print(f"찾음: {len(self.students)}명")
        
        if len(self.students) == self.total_students:
            print(f"{Fore.GREEN}[SUCCESS] 정확히 {self.total_students}명을 찾았습니다!{Style.RESET_ALL}")
        elif len(self.students) < self.total_students:
            print(f"{Fore.YELLOW}[!] {self.total_students - len(self.students)}명이 부족합니다.{Style.RESET_ALL}")
        else:
            print(f"{Fore.YELLOW}[!] {len(self.students) - self.total_students}명이 초과되었습니다. 검증 필요{Style.RESET_ALL}")
            
        # 학생 명단 출력 (전체 표시)
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
        print(f"\n{Fore.CYAN}=== 실시간 출석 모니터링 시작 ==={Style.RESET_ALL}")
        print(f"10초마다 체크, Ctrl+C로 종료\n")
        
        last_checked_count = 0
        
        try:
            while True:
                # 체크된 체크박스 수 확인
                checked_boxes = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']:checked")
                current_count = len(checked_boxes)
                
                timestamp = datetime.now().strftime('%H:%M:%S')
                
                if current_count != last_checked_count:
                    change = current_count - last_checked_count
                    if change > 0:
                        print(f"[{timestamp}] {Fore.GREEN}[+] {change}명 추가 출석{Style.RESET_ALL} (총 {current_count}/{self.total_students}명)")
                    else:
                        print(f"[{timestamp}] {Fore.YELLOW}[-] {abs(change)}명 출석 취소{Style.RESET_ALL} (총 {current_count}/{self.total_students}명)")
                    last_checked_count = current_count
                else:
                    print(f"[{timestamp}] 출석: {current_count}/{self.total_students}명", end='\r')
                    
                time.sleep(10)
                
        except KeyboardInterrupt:
            print(f"\n\n{Fore.YELLOW}모니터링이 종료되었습니다.{Style.RESET_ALL}")
            
    def run(self):
        """메인 실행"""
        print(f"{Fore.CYAN}{'='*60}")
        print(f"   정확한 81명 출결 모니터링 시스템")
        print(f"   개선된 필터링으로 정확도 향상")
        print(f"{'='*60}{Style.RESET_ALL}\n")
        
        # 1. 브라우저 시작
        self.setup_driver()
        
        # 2. 로그인
        if not self.open_website():
            return
            
        # 3. 학생 찾기
        self.find_all_students()
        
        # 4. 모니터링 시작
        print(f"\n{Fore.GREEN}출석 모니터링을 시작하시겠습니까? (y/n): {Style.RESET_ALL}", end="")
        if input().lower() == 'y':
            self.monitor_attendance()
            
    def cleanup(self):
        """정리"""
        if self.driver:
            self.driver.quit()
            print(f"{Fore.GREEN}프로그램을 종료합니다.{Style.RESET_ALL}")


if __name__ == "__main__":
    monitor = Accurate81Monitor()
    try:
        monitor.run()
    finally:
        monitor.cleanup()