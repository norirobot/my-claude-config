"""
궁극의 모니터링 시스템 - 근본 원인 해결
<strong>배경 :</strong> 같은 HTML 요소 제외
"""
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style

init()

class UltimateMonitor:
    def __init__(self):
        self.driver = None
        self.students = {}
        
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
            
    def extract_students_properly(self):
        """올바른 학생 추출 - strong 태그 제외"""
        print(f"\n{Fore.CYAN}=== 정확한 학생 추출 ==={Style.RESET_ALL}")
        
        students_found = {}
        
        try:
            # 방법 1: UL/LI 구조에서 추출
            ul_elements = self.driver.find_elements(By.TAG_NAME, "ul")
            
            for ul in ul_elements:
                li_items = ul.find_elements(By.TAG_NAME, "li")
                
                # 70-90개 정도의 li를 가진 ul이 학생 목록일 가능성
                if 70 <= len(li_items) <= 90:
                    print(f"  학생 목록 발견: {len(li_items)}개 항목")
                    
                    for li in li_items:
                        # strong 태그가 있는지 확인 (배경: 같은 라벨)
                        strong_tags = li.find_elements(By.TAG_NAME, "strong")
                        
                        # strong 태그가 없거나, strong 태그가 "배경"이 아닌 경우만
                        if not strong_tags or not any("배경" in s.text for s in strong_tags):
                            # li의 직접 텍스트 또는 첫 번째 텍스트 노드
                            li_text = li.text.strip()
                            
                            if li_text:
                                lines = li_text.split('\n')
                                if lines:
                                    student_name = lines[0].strip()
                                    
                                    # 출결 정보 확인
                                    attendance_info = ""
                                    checked_in = False
                                    checked_out = False
                                    
                                    for line in lines[1:]:
                                        if "등원" in line or "하원" in line:
                                            attendance_info = line
                                            checked_in = "등원" in line and "등원 -" not in line
                                            checked_out = "하원" in line and "하원 -" not in line
                                            break
                                    
                                    # 학생 이름 기본 검증
                                    if student_name and len(student_name) <= 30:
                                        # 시스템 키워드 제외
                                        system_keywords = ['ATTENDANCE', 'STUDENT', 'USER_', 
                                                         'PARENT', 'MOBILE', 'FIELD', 'DEVICE', 
                                                         'CLASS_', 'BIRTH', 'PRICE']
                                        
                                        if not any(kw in student_name for kw in system_keywords):
                                            students_found[student_name] = {
                                                'name': student_name,
                                                'attendance_info': attendance_info,
                                                'checked_in': checked_in,
                                                'checked_out': checked_out,
                                                'element': li
                                            }
                    
                    break  # 학생 목록을 찾았으면 종료
            
            # 방법 2: 텍스트 패턴 기반 (백업)
            if len(students_found) < 70:
                print(f"\n  추가 패턴 검색...")
                
                page_text = self.driver.find_element(By.TAG_NAME, "body").text
                lines = page_text.split('\n')
                
                i = 0
                while i < len(lines) - 1:
                    current_line = lines[i].strip()
                    next_line = lines[i+1].strip() if i+1 < len(lines) else ""
                    
                    # 등원/하원 패턴
                    if "등원" in next_line and "하원" in next_line:
                        # "배경"이 아닌 경우만
                        if current_line != "배경" and current_line != "배경 :":
                            if current_line not in students_found:
                                students_found[current_line] = {
                                    'name': current_line,
                                    'attendance_info': next_line,
                                    'checked_in': "등원 -" not in next_line and "등원" in next_line,
                                    'checked_out': "하원 -" not in next_line and "하원" in next_line,
                                    'element': None
                                }
                        i += 2
                    else:
                        i += 1
            
            print(f"  총 {len(students_found)}명 추출 완료")
            
        except Exception as e:
            print(f"  추출 오류: {str(e)}")
        
        self.students = students_found
        return students_found
        
    def display_results(self):
        """결과 출력"""
        print(f"\n{Fore.GREEN}=== 최종 결과 ==={Style.RESET_ALL}")
        print(f"찾은 학생: {len(self.students)}명")
        
        # 전체 명단 출력
        sorted_names = sorted(self.students.keys())
        print(f"\n{Fore.CYAN}학생 명단:{Style.RESET_ALL}")
        
        # 3열로 표시
        cols = 3
        for i in range(0, len(sorted_names), cols):
            row = []
            for j in range(cols):
                idx = i + j
                if idx < len(sorted_names):
                    name = sorted_names[idx]
                    status = " *" if self.students[name].get('checked_in', False) else "  "
                    display_name = name[:15] if len(name) <= 15 else name[:14] + "."
                    row.append(f"{idx+1:3d}. {display_name:<15s}{status}")
                else:
                    row.append(" " * 22)  # 빈 칸
            print("  ".join(row))
        
        # 현재 출석 상태
        checked_in = sum(1 for s in self.students.values() if s.get('checked_in', False))
        print(f"\n현재 출석: {checked_in}/{len(self.students)}명")
        
        # 출석한 학생 목록
        if checked_in > 0:
            print(f"\n{Fore.GREEN}출석한 학생:{Style.RESET_ALL}")
            for name, info in sorted(self.students.items()):
                if info.get('checked_in', False):
                    attendance = info.get('attendance_info', '')
                    print(f"  - {name}: {attendance}")
        
        # 검증: "배경"이 있는지 확인
        if "배경" in self.students or "배경 :" in self.students:
            print(f"\n{Fore.RED}[경고] '배경'이 여전히 포함되어 있습니다!{Style.RESET_ALL}")
        else:
            print(f"\n{Fore.GREEN}[확인] '배경'이 제외되었습니다.{Style.RESET_ALL}")
            
    def monitor_attendance(self):
        """실시간 출석 모니터링"""
        print(f"\n{Fore.CYAN}=== 실시간 출석 모니터링 ==={Style.RESET_ALL}")
        print(f"10초마다 체크, Ctrl+C로 종료\n")
        
        last_attendance = {name: info.get('checked_in', False) 
                          for name, info in self.students.items()}
        
        try:
            while True:
                # 재추출
                current_students = self.extract_students_properly()
                
                # 변경사항 확인
                changes = []
                for name, info in current_students.items():
                    current_status = info.get('checked_in', False)
                    if name in last_attendance:
                        if current_status != last_attendance[name]:
                            if current_status:
                                changes.append(f"{Fore.GREEN}[등원] {name}{Style.RESET_ALL}")
                            else:
                                changes.append(f"{Fore.YELLOW}[하원] {name}{Style.RESET_ALL}")
                            last_attendance[name] = current_status
                
                # 현재 출석 인원
                checked_in = sum(1 for s in current_students.values() if s.get('checked_in', False))
                
                timestamp = datetime.now().strftime('%H:%M:%S')
                
                if changes:
                    print(f"\n[{timestamp}] 변경사항:")
                    for change in changes:
                        print(f"  {change}")
                    print(f"현재 출석: {checked_in}/{len(current_students)}명")
                else:
                    print(f"[{timestamp}] 출석: {checked_in}/{len(current_students)}명", end='\r')
                
                time.sleep(10)
                
        except KeyboardInterrupt:
            print(f"\n\n{Fore.YELLOW}모니터링이 종료되었습니다.{Style.RESET_ALL}")
            
    def run(self):
        """메인 실행"""
        print(f"{Fore.CYAN}{'='*60}")
        print(f"   궁극의 출결 모니터링 시스템")
        print(f"   근본 원인 해결: <strong>배경</strong> 태그 제외")
        print(f"{'='*60}{Style.RESET_ALL}\n")
        
        # 1. 브라우저 시작
        self.setup_driver()
        
        # 2. 로그인
        if not self.open_website():
            return
            
        # 3. 학생 추출
        self.extract_students_properly()
        
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
    monitor = UltimateMonitor()
    try:
        monitor.run()
    finally:
        monitor.cleanup()