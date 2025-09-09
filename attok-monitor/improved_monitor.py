"""
개선된 attok.co.kr 학원 출결 모니터링 시스템
모든 학생을 정확히 파싱하는 버전
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
        self.students = {}  # 학생 정보 저장 {name: {status, check_in_time, timer_start}}
        self.total_students = 0
        self.monitoring = False
        
    def setup_driver(self):
        """Chrome 드라이버 설정 (헤드리스 모드 비활성화)"""
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(options=options)
        print(f"{Fore.GREEN}✓ Chrome 브라우저가 시작되었습니다.{Style.RESET_ALL}")
        
    def open_website(self):
        """웹사이트 열기"""
        try:
            self.driver.get("https://attok.co.kr/")
            print(f"{Fore.YELLOW}📌 로그인 페이지로 이동했습니다.{Style.RESET_ALL}")
            print(f"{Fore.CYAN}수동으로 로그인해주세요...{Style.RESET_ALL}")
            
            # 사용자가 로그인할 때까지 대기
            input(f"\n{Fore.GREEN}로그인 완료 후 Enter를 눌러주세요...{Style.RESET_ALL}")
            
            # 현재 URL 확인
            current_url = self.driver.current_url
            if "attendance" in current_url:
                print(f"{Fore.GREEN}✓ 출석 페이지로 이동 확인{Style.RESET_ALL}")
                return True
            else:
                print(f"{Fore.RED}⚠ 출석 페이지가 아닙니다. URL: {current_url}{Style.RESET_ALL}")
                return False
                
        except Exception as e:
            print(f"{Fore.RED}오류 발생: {str(e)}{Style.RESET_ALL}")
            return False
            
    def parse_students(self):
        """학생 목록 및 상태 파싱 - 개선된 버전"""
        try:
            print(f"\n{Fore.CYAN}학생 정보 파싱 시작...{Style.RESET_ALL}")
            
            # 1. 페이지 스크롤 다운하여 모든 학생 로드
            print("페이지를 스크롤하여 모든 학생을 로드합니다...")
            last_height = self.driver.execute_script("return document.body.scrollHeight")
            
            while True:
                # 페이지 끝까지 스크롤
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)  # 로딩 대기
                
                # 새로운 높이 확인
                new_height = self.driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height
            
            # 페이지 상단으로 다시 스크롤
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1)
            
            # 2. 모든 div.box 요소 찾기 (제한 없음)
            all_boxes = self.driver.find_elements(By.CSS_SELECTOR, "div.box")
            print(f"전체 박스 수: {len(all_boxes)}개")
            
            # 3. 학생 박스만 필터링 (등원/하원 텍스트 또는 체크박스 포함)
            student_boxes = []
            
            for box in all_boxes:
                box_text = box.text.strip()
                
                # 학생 박스 판별 조건
                # 1) "등원" 또는 "하원" 텍스트 포함
                # 2) 체크박스 포함
                # 3) 한글 이름 패턴 포함
                
                has_attendance_text = "등원" in box_text or "하원" in box_text
                has_checkbox = len(box.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")) > 0
                
                # 한글 이름 패턴 찾기 (2-5글자로 확장)
                has_korean_name = False
                if box_text:
                    lines = box_text.split('\n')
                    for line in lines:
                        line = line.strip()
                        # 이름 길이를 2-5글자로 확장 (김가나다라 같은 경우)
                        if 2 <= len(line) <= 5 and all(ord('가') <= ord(c) <= ord('힣') or c == ' ' for c in line):
                            has_korean_name = True
                            break
                
                # 학생 박스로 판단
                if has_attendance_text or has_checkbox or has_korean_name:
                    student_boxes.append(box)
            
            print(f"{Fore.GREEN}✓ {len(student_boxes)}개의 학생 박스를 찾았습니다.{Style.RESET_ALL}")
            
            # 3. 각 학생 박스에서 정보 추출
            for i, box in enumerate(student_boxes):
                try:
                    box_text = box.text.strip()
                    if not box_text:
                        continue
                    
                    # 텍스트 줄 단위로 분리
                    lines = [line.strip() for line in box_text.split('\n') if line.strip()]
                    
                    # 학생 이름 찾기 (여러 방법 시도)
                    name = None
                    
                    # 방법 1: 한글 이름 패턴 (2-5글자로 확장)
                    for line in lines:
                        if 2 <= len(line) <= 5 and all(ord('가') <= ord(c) <= ord('힣') or c == ' ' for c in line):
                            # "정보수정" 같은 버튼 텍스트 제외
                            if line not in ['정보수정', '출결', '수납', '등원', '하원', '출석', '결석', '등록', '퇴원']:
                                name = line
                                break
                    
                    # 방법 2: 첫 번째 의미 있는 텍스트
                    if not name:
                        for line in lines:
                            # 숫자, 시간, 버튼 텍스트 제외
                            if (len(line) >= 2 and 
                                not line[0].isdigit() and 
                                ':' not in line and 
                                '-' not in line and
                                line not in ['정보수정', '출결', '수납', '등원', '하원', '출석', '결석']):
                                name = line[:10]  # 최대 10글자
                                break
                    
                    # 이름을 찾지 못한 경우 번호로 대체
                    if not name:
                        name = f"학생_{i+1}"
                    
                    # 배경색으로 출석 상태 확인
                    bg_color = box.value_of_css_property("background-color")
                    is_present = self.is_student_present(bg_color)
                    
                    # 학생 정보 저장
                    self.students[name] = {
                        'status': 'present' if is_present else 'absent',
                        'check_in_time': datetime.now().strftime('%H:%M:%S') if is_present else None,
                        'timer_start': time.time() if is_present else None,
                        'element': box,
                        'box_index': i
                    }
                    
                    status_emoji = "✅" if is_present else "⭕"
                    print(f"  {status_emoji} {name}: {'출석' if is_present else '미출석'}")
                    
                except Exception as e:
                    print(f"  ⚠ 박스 {i+1} 파싱 실패: {str(e)}")
                    continue
            
            self.total_students = len(self.students)
            print(f"\n{Fore.GREEN}✓ 총 {self.total_students}명의 학생 정보를 파싱했습니다.{Style.RESET_ALL}")
            
            # 출석 현황 요약
            present_count = sum(1 for s in self.students.values() if s['status'] == 'present')
            print(f"{Fore.CYAN}현재 출석: {present_count}명 / 전체: {self.total_students}명{Style.RESET_ALL}")
            
            return True
            
        except Exception as e:
            print(f"{Fore.RED}학생 파싱 오류: {str(e)}{Style.RESET_ALL}")
            return False
            
    def is_student_present(self, bg_color):
        """배경색으로 출석 여부 판단"""
        if "rgb" in bg_color:
            try:
                # rgba(244, 243, 243, 1) 형태 처리
                rgb = bg_color.replace("rgba", "").replace("rgb", "").replace("(", "").replace(")", "").split(",")
                r, g, b = int(rgb[0].strip()), int(rgb[1].strip()), int(rgb[2].strip())
                
                # 회색 계열 (240 이상의 밝은 회색)은 미출석
                is_gray = abs(r - g) < 10 and abs(g - b) < 10 and r > 240
                if is_gray:
                    return False
                
                # 하늘색/파란색 계열은 출석
                # 파란색이 다른 색보다 높고, 전체적으로 밝은 색
                is_blue = b > r and b > g and b > 100
                
                # 또는 청록색 계열 (g와 b가 모두 높음)
                is_cyan = g > 100 and b > 100 and r < g and r < b
                
                return is_blue or is_cyan
                
            except Exception as e:
                return False
        return False
        
    def monitor_loop(self):
        """실시간 모니터링 루프"""
        print(f"\n{Fore.CYAN}=== 실시간 모니터링 시작 ==={Style.RESET_ALL}")
        self.monitoring = True
        check_count = 0
        
        try:
            while self.monitoring:
                check_count += 1
                print(f"\n{Fore.YELLOW}[체크 #{check_count}] {datetime.now().strftime('%H:%M:%S')}{Style.RESET_ALL}")
                
                # 학생 상태 업데이트
                changes_detected = False
                
                for name, info in self.students.items():
                    try:
                        element = info['element']
                        
                        # 현재 배경색 확인
                        current_bg = element.value_of_css_property("background-color")
                        is_present_now = self.is_student_present(current_bg)
                        
                        # 상태 변화 감지
                        if info['status'] == 'absent' and is_present_now:
                            # 출석 상태로 변경됨
                            now = datetime.now()
                            info['status'] = 'present'
                            info['check_in_time'] = now.strftime('%H:%M:%S')
                            info['timer_start'] = time.time()
                            
                            print(f"{Fore.GREEN}✅ [{now.strftime('%H:%M:%S')}] {name} 학생이 출석했습니다!{Style.RESET_ALL}")
                            changes_detected = True
                            
                        elif info['status'] == 'present' and not is_present_now:
                            # 미출석 상태로 변경됨
                            info['status'] = 'absent'
                            
                            if info['timer_start']:
                                duration = time.time() - info['timer_start']
                                minutes = int(duration / 60)
                                print(f"{Fore.RED}🚪 [{datetime.now().strftime('%H:%M:%S')}] {name} 학생이 하원했습니다. (수업시간: {minutes}분){Style.RESET_ALL}")
                                
                            info['timer_start'] = None
                            changes_detected = True
                            
                    except Exception as e:
                        continue
                        
                if not changes_detected:
                    # 현재 상태 요약
                    present_count = sum(1 for s in self.students.values() if s['status'] == 'present')
                    print(f"  현재 출석: {present_count}/{len(self.students)}명")
                
                # 대기
                time.sleep(5)  # 5초마다 체크
                
        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}모니터링이 중단되었습니다.{Style.RESET_ALL}")
            
    def run(self):
        """메인 실행 함수"""
        print(f"{Fore.CYAN}{'='*50}")
        print(f"   attok.co.kr 출결 모니터링 시스템 v2.0")
        print(f"{'='*50}{Style.RESET_ALL}\n")
        
        # 1. 브라우저 시작
        self.setup_driver()
        
        # 2. 웹사이트 열기 및 로그인 대기
        if not self.open_website():
            return
            
        # 3. 학생 목록 파싱
        if not self.parse_students():
            print(f"{Fore.RED}학생 정보를 파싱할 수 없습니다.{Style.RESET_ALL}")
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