"""
attok.co.kr 학원 출결 모니터링 시스템
수동 로그인 후 학생 출결 상태를 실시간으로 감지하는 Python 애플리케이션
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
            
    def parse_student_count(self):
        """전체 학생 수 파싱"""
        try:
            # "전체반 (6)" 형태의 텍스트 찾기 - test_parser 결과 기반
            selectors = [
                "//a[contains(text(), '전체반')]",  # 가장 정확한 셀렉터
                "//a[contains(text(), '전체')]",
                "//span[contains(text(), '전체')]"
            ]
            
            for selector in selectors:
                try:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    for element in elements:
                        text = element.text
                        # "전체반 (6)" 또는 "전체 (숫자)" 형태에서 숫자 추출
                        if "(" in text and ")" in text:
                            count_str = text.split("(")[1].split(")")[0]
                            try:
                                self.total_students = int(count_str)
                                print(f"{Fore.GREEN}✓ 전체 학생 수: {self.total_students}명{Style.RESET_ALL}")
                                return True
                            except ValueError:
                                continue
                except:
                    continue
                    
            print(f"{Fore.YELLOW}⚠ 전체 학생 수를 찾을 수 없습니다.{Style.RESET_ALL}")
            return False
            
        except Exception as e:
            print(f"{Fore.RED}학생 수 파싱 오류: {str(e)}{Style.RESET_ALL}")
            return False
            
    def parse_students(self):
        """학생 목록 및 상태 파싱"""
        try:
            # test_parser 결과에 기반한 정확한 셀렉터 사용
            # "box join_hp_con" 클래스를 가진 div 요소
            student_boxes = []
            
            # 실제 발견된 셀렉터 사용
            box_selectors = [
                "div.box.join_hp_con",  # 실제 클래스명
                "div.box",  # 더 일반적인 셀렉터
                "div[class*='box']"  # 폴백 옵션
            ]
            
            for selector in box_selectors:
                try:
                    boxes = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if boxes and len(boxes) >= 5:  # 학생이 여러명이므로 최소 5개 이상
                        student_boxes = boxes
                        print(f"{Fore.GREEN}✓ {len(boxes)}개의 학생 박스를 찾았습니다.{Style.RESET_ALL}")
                        break
                except:
                    continue
                    
            if not student_boxes:
                print(f"{Fore.YELLOW}⚠ 학생 박스를 찾을 수 없습니다. HTML 구조를 확인하세요.{Style.RESET_ALL}")
                return False
                
            # 각 학생 박스에서 정보 추출
            for i, box in enumerate(student_boxes):
                try:
                    # 박스 내의 모든 텍스트 가져오기
                    box_text = box.text
                    
                    # 텍스트에서 학생 이름 추출 시도
                    # 보통 이름은 2-4글자 한글
                    lines = box_text.split('\n')
                    name = None
                    
                    for line in lines:
                        line = line.strip()
                        # 한글 이름 패턴 (2-4글자)
                        if 2 <= len(line) <= 4 and all(ord('가') <= ord(c) <= ord('힣') for c in line):
                            name = line
                            break
                    
                    # 이름을 찾지 못했으면 class*='name' 요소 탐색
                    if not name:
                        try:
                            name_elem = box.find_element(By.CSS_SELECTOR, "*[class*='name']")
                            potential_name = name_elem.text.strip()
                            if 2 <= len(potential_name) <= 4:
                                name = potential_name
                        except:
                            pass
                    
                    if not name:
                        # 박스 텍스트가 있으면 첫 번째 줄 사용
                        if lines and lines[0]:
                            name = f"학생_{i+1}"
                        else:
                            continue
                        
                    # 박스 색상 확인 (출석 상태)
                    bg_color = box.value_of_css_property("background-color")
                    is_present = self.is_student_present(bg_color)
                    
                    # 학생 정보 저장
                    if name not in self.students:
                        self.students[name] = {
                            'status': 'present' if is_present else 'absent',
                            'check_in_time': None,
                            'timer_start': None,
                            'element': box
                        }
                        print(f"  - {name}: {'출석' if is_present else '미출석'}")
                        
                except Exception as e:
                    continue
                    
            print(f"{Fore.GREEN}✓ {len(self.students)}명의 학생 정보를 파싱했습니다.{Style.RESET_ALL}")
            return True
            
        except Exception as e:
            print(f"{Fore.RED}학생 파싱 오류: {str(e)}{Style.RESET_ALL}")
            return False
            
    def is_student_present(self, bg_color):
        """배경색으로 출석 여부 판단"""
        # test_parser 결과: rgba(244, 243, 243, 1)이 기본 색상
        # 출석 시 하늘색으로 변경됨
        
        if "rgb" in bg_color:
            try:
                # rgba(244, 243, 243, 1) 형태 처리
                rgb = bg_color.replace("rgba", "").replace("rgb", "").replace("(", "").replace(")", "").split(",")
                r, g, b = int(rgb[0].strip()), int(rgb[1].strip()), int(rgb[2].strip())
                
                # 회색 계열 (244, 243, 243)은 미출석
                is_gray = abs(r - g) < 10 and abs(g - b) < 10 and r > 240
                if is_gray:
                    return False
                
                # 하늘색/파란색 계열은 출석
                is_blue = b > 150 and b > r and b > g
                is_light = (r + g + b) / 3 > 150
                
                return is_blue and is_light
            except Exception as e:
                print(f"색상 파싱 오류: {bg_color}, {str(e)}")
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
        print(f"   attok.co.kr 출결 모니터링 시스템")
        print(f"{'='*50}{Style.RESET_ALL}\n")
        
        # 1. 브라우저 시작
        self.setup_driver()
        
        # 2. 웹사이트 열기 및 로그인 대기
        if not self.open_website():
            return
            
        # 3. 학생 수 파싱
        self.parse_student_count()
        
        # 4. 학생 목록 파싱
        if not self.parse_students():
            print(f"{Fore.RED}학생 정보를 파싱할 수 없습니다.{Style.RESET_ALL}")
            return
            
        # 5. 실시간 모니터링 시작
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