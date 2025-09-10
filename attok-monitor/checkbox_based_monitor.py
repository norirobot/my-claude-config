"""
체크박스 기반 학생 찾기 - 모든 학생을 정확히 찾는 버전
161개의 체크박스 = 161명의 학생
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style
import time
import re

init()

class CheckboxBasedMonitor:
    def __init__(self):
        self.driver = None
        self.students = {}
        
        # 학생 이름이 아닌 것들 (확실한 것만)
        self.not_names = [
            '로앤코로봇',  # 회사명/로그인ID
            '납부', '보기', '재학생', '학생별', '반별', '생일',  # 메뉴/필터 단어
            '정보수정', '출결', '수납', '등원', '하원', '출석', '결석',
            '등록', '퇴원', '전체', '조회', '검색', '추가', '삭제',
            '수정', '확인', '취소', '저장', '닫기', '로그인', '로그아웃',
            '월', '화', '수', '목', '금', '토', '일',  # 요일
            '오전', '오후', '시간', '분', '초',
            '전체반', '수업', '교실', '선생님'
        ]
        
    def setup_driver(self):
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        self.driver = webdriver.Chrome(options=options)
        print(f"{Fore.GREEN}브라우저를 시작했습니다.{Style.RESET_ALL}")
        
    def open_and_login(self):
        self.driver.get("https://attok.co.kr/")
        print(f"{Fore.YELLOW}로그인 후 Enter를 눌러주세요...{Style.RESET_ALL}")
        input()
        return True
        
    def find_all_students(self):
        """체크박스를 기준으로 모든 학생 찾기"""
        print(f"\n{Fore.CYAN}=== 체크박스 기반 학생 찾기 ==={Style.RESET_ALL}")
        
        # 모든 체크박스 찾기
        checkboxes = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
        print(f"총 체크박스 수: {len(checkboxes)}개")
        
        # 각 체크박스 주변에서 학생 이름 찾기
        for i, checkbox in enumerate(checkboxes):
            try:
                # 체크박스의 부모/조부모 요소들 탐색
                parent = checkbox.find_element(By.XPATH, "..")
                grandparent = parent.find_element(By.XPATH, "..")
                great_grandparent = grandparent.find_element(By.XPATH, "..")
                
                # 여러 레벨의 부모 요소 텍스트 수집
                texts = []
                texts.append(parent.text)
                texts.append(grandparent.text)
                texts.append(great_grandparent.text)
                
                # 더 넓은 범위 탐색 (형제 요소들)
                try:
                    siblings = parent.find_elements(By.XPATH, "../*")
                    for sibling in siblings[:5]:  # 처음 5개 형제만
                        texts.append(sibling.text)
                except:
                    pass
                
                # 모든 텍스트 합치기
                combined_text = " ".join(texts)
                
                # 학생 이름 추출
                student_name = self.extract_student_name(combined_text, i)
                
                if student_name:
                    # 체크박스 상태 확인
                    is_checked = checkbox.is_selected()
                    
                    # 배경색 확인
                    bg_color = grandparent.value_of_css_property("background-color")
                    is_colored = not self.is_default_color(bg_color)
                    
                    self.students[student_name] = {
                        'checkbox_index': i,
                        'checked': is_checked,
                        'colored': is_colored,
                        'status': 'present' if (is_checked or is_colored) else 'absent',
                        'element': grandparent
                    }
                    
            except Exception as e:
                # 체크박스는 있지만 이름을 못 찾은 경우
                self.students[f"학생_{i+1}"] = {
                    'checkbox_index': i,
                    'checked': False,
                    'colored': False,
                    'status': 'unknown',
                    'element': None
                }
                
        print(f"\n{Fore.GREEN}=== 결과 ==={Style.RESET_ALL}")
        print(f"총 {len(self.students)}명의 학생 발견")
        
        # 이름이 확인된 학생들
        named_students = [name for name in self.students.keys() if not name.startswith("학생_")]
        print(f"\n이름 확인된 학생: {len(named_students)}명")
        
        # 처음 20명 출력
        for i, name in enumerate(sorted(named_students)[:20], 1):
            status = self.students[name]['status']
            emoji = "✅" if status == 'present' else "⭕"
            print(f"  {i}. {emoji} {name}")
            
        if len(named_students) > 20:
            print(f"  ... 외 {len(named_students)-20}명")
            
        # 이름 미확인 학생
        unnamed_count = len(checkboxes) - len(named_students)
        if unnamed_count > 0:
            print(f"\n{Fore.YELLOW}이름 미확인: {unnamed_count}명{Style.RESET_ALL}")
            
        # 출석 통계
        present_count = sum(1 for s in self.students.values() if s['status'] == 'present')
        absent_count = sum(1 for s in self.students.values() if s['status'] == 'absent')
        
        print(f"\n{Fore.CYAN}=== 출석 현황 ==={Style.RESET_ALL}")
        print(f"출석: {present_count}명")
        print(f"미출석: {absent_count}명")
        print(f"미확인: {len(self.students) - present_count - absent_count}명")
        
    def extract_student_name(self, text, index):
        """텍스트에서 학생 이름 추출"""
        if not text:
            return None
            
        # 줄 단위로 분리
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # 빈 줄 건너뛰기
            if not line:
                continue
                
            # 확실히 이름이 아닌 것들 제외
            if line in self.not_names:
                continue
                
            # 숫자로만 이루어진 것 제외
            if line.isdigit():
                continue
                
            # 시간 형식 제외 (00:00 형태)
            if ':' in line and len(line) <= 8:
                continue
                
            # 한글 이름 패턴 체크 (2-5글자)
            if 2 <= len(line) <= 5:
                # 최소 1개 이상의 한글 포함
                korean_count = sum(1 for c in line if ord('가') <= ord(c) <= ord('힣'))
                if korean_count >= 2:  # 최소 2글자는 한글
                    # 특수문자가 너무 많으면 제외
                    special_count = sum(1 for c in line if not (c.isalnum() or c.isspace()))
                    if special_count <= 1:
                        return line
                        
        return None
        
    def is_default_color(self, bg_color):
        """기본 색상(회색)인지 확인"""
        if "rgb" in bg_color:
            try:
                rgb = bg_color.replace("rgba", "").replace("rgb", "").replace("(", "").replace(")", "").split(",")
                r, g, b = int(rgb[0].strip()), int(rgb[1].strip()), int(rgb[2].strip())
                
                # 회색 계열 (RGB 값이 비슷하고 200 이상)
                is_gray = abs(r - g) < 20 and abs(g - b) < 20 and r > 200
                return is_gray
            except:
                return True
        return True
        
    def monitor_loop(self):
        """실시간 모니터링"""
        print(f"\n{Fore.CYAN}=== 실시간 모니터링 시작 ==={Style.RESET_ALL}")
        print("10초마다 상태 확인, Ctrl+C로 종료")
        
        check_count = 0
        try:
            while True:
                check_count += 1
                
                if check_count % 3 == 0:  # 30초마다 새로고침
                    print(f"\n새로고침...")
                    self.driver.refresh()
                    time.sleep(3)
                    self.find_all_students()
                else:
                    print(f".", end="", flush=True)
                    
                time.sleep(10)
                
        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}모니터링 종료{Style.RESET_ALL}")
            
    def run(self):
        print(f"{Fore.CYAN}{'='*60}")
        print(f"   체크박스 기반 출결 모니터링 시스템")
        print(f"{'='*60}{Style.RESET_ALL}\n")
        
        self.setup_driver()
        
        if not self.open_and_login():
            return
            
        # 학생 찾기
        self.find_all_students()
        
        # 모니터링 시작
        print(f"\n{Fore.GREEN}모니터링을 시작하시겠습니까? (y/n): {Style.RESET_ALL}", end="")
        if input().lower() == 'y':
            self.monitor_loop()
            
        self.driver.quit()
        print(f"{Fore.GREEN}프로그램을 종료합니다.{Style.RESET_ALL}")


if __name__ == "__main__":
    monitor = CheckboxBasedMonitor()
    monitor.run()