"""
최종 완벽 버전 - 등원/하원 패턴으로 정확한 학생 추출
"""
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style
import re

init()

class FinalPerfectMonitor:
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
            
    def extract_students_by_attendance_pattern(self):
        """등원/하원 패턴으로 정확한 학생 추출"""
        print(f"\n{Fore.CYAN}=== 출결 패턴으로 학생 추출 ==={Style.RESET_ALL}")
        
        students_found = {}
        
        try:
            # 전체 페이지 텍스트 가져오기
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            # 등원/하원 패턴으로 학생 찾기
            # 패턴: "이름 등원 시간/- 하원 시간/-"
            lines = page_text.split('\n')
            
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                
                # 다음 줄 확인
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    
                    # "등원"이 포함된 줄 찾기
                    if "등원" in next_line and "하원" in next_line:
                        # 현재 줄이 학생 이름
                        name = line
                        
                        # 이름 검증 (최소한의 체크만)
                        if name and len(name) >= 1 and len(name) <= 30:
                            # 시스템 텍스트가 아닌 경우
                            if not any(keyword in name for keyword in 
                                     ['ATTENDANCE', 'STUDENT', 'USER_', 'PARENT', 
                                      'MOBILE', 'FIELD', 'DEVICE', 'CLASS_']):
                                # "배경" 제외 (배진우와 혼동 방지)
                                if name != "배경" and name != "배경 :":
                                    students_found[name] = {
                                        'name': name,
                                        'attendance_info': next_line,
                                        'checked_in': "등원 -" not in next_line,
                                        'checked_out': "하원 -" not in next_line
                                    }
                        i += 2  # 이름과 출결 정보를 처리했으므로 2줄 건너뛰기
                        continue
                
                i += 1
            
            print(f"  출결 패턴으로 {len(students_found)}명 발견")
            
        except Exception as e:
            print(f"  추출 오류: {str(e)}")
        
        # 백업: ul/li 구조에서도 시도
        try:
            ul_elements = self.driver.find_elements(By.TAG_NAME, "ul")
            
            for ul in ul_elements:
                li_items = ul.find_elements(By.TAG_NAME, "li")
                
                # 81개 근처의 li를 가진 ul 찾기
                if 70 <= len(li_items) <= 90:
                    print(f"\n  리스트에서 {len(li_items)}개 항목 발견")
                    
                    for li in li_items:
                        text = li.text.strip()
                        lines = text.split('\n')
                        
                        if len(lines) >= 2:
                            name = lines[0].strip()
                            attendance = lines[1] if len(lines) > 1 else ""
                            
                            # 등원/하원 정보가 있는 경우만
                            if "등원" in attendance or "하원" in attendance:
                                if name not in students_found:
                                    students_found[name] = {
                                        'name': name,
                                        'attendance_info': attendance,
                                        'checked_in': "등원 -" not in attendance,
                                        'checked_out': "하원 -" not in attendance
                                    }
                    break
                    
        except Exception as e:
            print(f"  리스트 추출 오류: {str(e)}")
        
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
        
        # 3열로 표시 (수정된 버전)
        cols = 3
        total = len(sorted_names)
        rows = (total + cols - 1) // cols
        
        for row in range(rows):
            line_parts = []
            for col in range(cols):
                idx = row * cols + col  # 수정: 행 우선 순서로 변경
                if idx < total:
                    name = sorted_names[idx]
                    status = ""
                    if self.students[name].get('checked_in', False):
                        status = "*"  # 출석 표시
                    # 이름이 너무 길면 자르기
                    display_name = name[:14] + "." if len(name) > 15 else name
                    # 출석 상태를 이름 뒤에 표시
                    if status:
                        display_line = f"{idx+1:3d}. {display_name:<15s} {status}"
                    else:
                        display_line = f"{idx+1:3d}. {display_name:<15s}"
                    line_parts.append(display_line)
            print("  ".join(line_parts))
        
        # 현재 출석 상태
        checked_in = sum(1 for s in self.students.values() if s['checked_in'])
        print(f"\n현재 출석: {checked_in}/{len(self.students)}명")
            
    def monitor_attendance(self):
        """실시간 출석 모니터링"""
        print(f"\n{Fore.CYAN}=== 실시간 출석 모니터링 ==={Style.RESET_ALL}")
        print(f"10초마다 체크, Ctrl+C로 종료\n")
        
        last_attendance = {}
        for name, info in self.students.items():
            last_attendance[name] = info['checked_in']
        
        try:
            while True:
                # 페이지 새로고침 또는 재추출
                current_students = self.extract_students_by_attendance_pattern()
                
                # 변경사항 확인
                changes = []
                for name, info in current_students.items():
                    if name in last_attendance:
                        if info['checked_in'] != last_attendance[name]:
                            if info['checked_in']:
                                changes.append(f"{name} 등원")
                            else:
                                changes.append(f"{name} 하원")
                            last_attendance[name] = info['checked_in']
                
                # 현재 출석 인원
                checked_in = sum(1 for s in current_students.values() if s['checked_in'])
                
                timestamp = datetime.now().strftime('%H:%M:%S')
                
                if changes:
                    print(f"[{timestamp}] 변경사항:")
                    for change in changes:
                        print(f"  - {change}")
                    print(f"  현재 출석: {checked_in}/{len(current_students)}명")
                else:
                    print(f"[{timestamp}] 출석: {checked_in}/{len(current_students)}명", end='\r')
                
                time.sleep(10)
                
        except KeyboardInterrupt:
            print(f"\n\n{Fore.YELLOW}모니터링이 종료되었습니다.{Style.RESET_ALL}")
            
    def run(self):
        """메인 실행"""
        print(f"{Fore.CYAN}{'='*60}")
        print(f"   최종 완벽 출결 모니터링 시스템")
        print(f"   등원/하원 패턴 기반 정확한 추출")
        print(f"{'='*60}{Style.RESET_ALL}\n")
        
        # 1. 브라우저 시작
        self.setup_driver()
        
        # 2. 로그인
        if not self.open_website():
            return
            
        # 3. 출결 패턴으로 학생 추출
        self.extract_students_by_attendance_pattern()
        
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
    monitor = FinalPerfectMonitor()
    try:
        monitor.run()
    finally:
        monitor.cleanup()