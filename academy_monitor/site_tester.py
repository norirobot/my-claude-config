"""
실제 attok.co.kr 사이트 테스트 및 구조 분석
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

class AttokSiteTester:
    """Attok 사이트 테스터"""
    
    def __init__(self):
        self.driver = None
        self.analysis_data = {
            "login_success": False,
            "page_structure": {},
            "student_elements": [],
            "attendance_indicators": [],
            "css_selectors": {}
        }
        
    def setup_driver(self):
        """Chrome 드라이버 설정"""
        options = webdriver.ChromeOptions()
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
            print("✅ Chrome 드라이버 초기화 성공")
            return True
        except Exception as e:
            print(f"❌ Chrome 드라이버 초기화 실패: {e}")
            try:
                self.driver = webdriver.Chrome(options=options)
                print("✅ 시스템 Chrome 드라이버 사용")
                return True
            except Exception as e2:
                print(f"❌ 모든 드라이버 초기화 실패: {e2}")
                return False
    
    def open_site(self):
        """사이트 열기"""
        try:
            print("🌐 attok.co.kr 사이트 접속 중...")
            self.driver.get("https://attok.co.kr")
            time.sleep(3)
            
            print(f"✅ 사이트 접속 성공: {self.driver.title}")
            print(f"📍 현재 URL: {self.driver.current_url}")
            
            return True
        except Exception as e:
            print(f"❌ 사이트 접속 실패: {e}")
            return False
    
    def wait_for_login(self):
        """사용자 로그인 대기"""
        print("\n" + "="*50)
        print("🔑 로그인 안내")
        print("="*50)
        print("1. 브라우저에서 attok.co.kr에 로그인해주세요")
        print("2. 로그인이 완료되면 아무 키나 누르세요")
        print("3. 학생 목록이 보이는 페이지로 이동해주세요")
        print("="*50)
        
        input("로그인 완료 후 Enter를 누르세요...")
        
        # 로그인 후 페이지 확인
        current_url = self.driver.current_url
        page_title = self.driver.title
        
        print(f"✅ 로그인 후 URL: {current_url}")
        print(f"✅ 페이지 제목: {page_title}")
        
        self.analysis_data["login_success"] = True
        self.analysis_data["page_structure"]["url"] = current_url
        self.analysis_data["page_structure"]["title"] = page_title
        
        return True
    
    def analyze_page_structure(self):
        """페이지 구조 분석"""
        print("\n📊 페이지 구조 분석 중...")
        
        try:
            # 모든 div 요소 찾기
            divs = self.driver.find_elements(By.TAG_NAME, "div")
            print(f"📦 총 div 요소 개수: {len(divs)}")
            
            # 클래스가 있는 div들 분석
            div_classes = []
            for div in divs:
                class_name = div.get_attribute("class")
                if class_name:
                    div_classes.append(class_name)
            
            # 클래스 빈도 분석
            from collections import Counter
            class_counter = Counter(div_classes)
            
            print("📋 주요 클래스들 (상위 10개):")
            for class_name, count in class_counter.most_common(10):
                print(f"  • {class_name}: {count}개")
            
            self.analysis_data["page_structure"]["div_classes"] = class_counter
            
        except Exception as e:
            print(f"❌ 페이지 구조 분석 실패: {e}")
    
    def find_student_elements(self):
        """학생 관련 요소 찾기"""
        print("\n👥 학생 관련 요소 검색 중...")
        
        # 학생 이름으로 추정되는 텍스트 패턴들
        name_patterns = [
            "김", "이", "박", "최", "정", "강", "조", "윤", "장", "임",
            "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍"
        ]
        
        student_candidates = []
        
        try:
            # 모든 텍스트가 있는 요소들 검사
            all_elements = self.driver.find_elements(By.XPATH, "//*[text()]")
            
            for element in all_elements:
                text = element.text.strip()
                if text and len(text) >= 2 and len(text) <= 5:  # 이름 길이 추정
                    for pattern in name_patterns:
                        if pattern in text:
                            student_info = {
                                "text": text,
                                "tag": element.tag_name,
                                "class": element.get_attribute("class"),
                                "id": element.get_attribute("id"),
                                "parent_class": element.find_element(By.XPATH, "..").get_attribute("class") if element.find_element(By.XPATH, "..") else None
                            }
                            student_candidates.append(student_info)
                            break
            
            print(f"🎯 학생 후보 {len(student_candidates)}명 발견:")
            for i, candidate in enumerate(student_candidates[:10]):  # 상위 10개만 표시
                print(f"  {i+1}. {candidate['text']} (태그: {candidate['tag']}, 클래스: {candidate['class']})")
            
            self.analysis_data["student_elements"] = student_candidates
            
        except Exception as e:
            print(f"❌ 학생 요소 검색 실패: {e}")
    
    def analyze_colors_and_styles(self):
        """색상 및 스타일 분석"""
        print("\n🎨 색상 및 스타일 분석 중...")
        
        try:
            # 색상이 있는 요소들 찾기
            colored_elements = []
            
            all_elements = self.driver.find_elements(By.XPATH, "//*")[:100]  # 상위 100개만
            
            for element in all_elements:
                try:
                    bg_color = element.value_of_css_property("background-color")
                    text_color = element.value_of_css_property("color")
                    
                    if bg_color != "rgba(0, 0, 0, 0)" and bg_color != "transparent":  # 투명하지 않은 배경
                        color_info = {
                            "element": element.tag_name,
                            "class": element.get_attribute("class"),
                            "bg_color": bg_color,
                            "text_color": text_color,
                            "text": element.text[:20] if element.text else ""
                        }
                        colored_elements.append(color_info)
                        
                except Exception:
                    continue
            
            print(f"🌈 색상이 있는 요소 {len(colored_elements)}개 발견:")
            for i, color in enumerate(colored_elements[:10]):
                print(f"  {i+1}. {color['bg_color']} | {color['text'][:15]}...")
            
            self.analysis_data["attendance_indicators"] = colored_elements
            
        except Exception as e:
            print(f"❌ 색상 분석 실패: {e}")
    
    def suggest_selectors(self):
        """CSS 선택자 제안"""
        print("\n🎯 CSS 선택자 제안:")
        
        student_elements = self.analysis_data.get("student_elements", [])
        
        if student_elements:
            # 가장 많이 사용되는 클래스 찾기
            classes = [elem.get("class") for elem in student_elements if elem.get("class")]
            parent_classes = [elem.get("parent_class") for elem in student_elements if elem.get("parent_class")]
            
            from collections import Counter
            class_counter = Counter(classes)
            parent_counter = Counter(parent_classes)
            
            print("📋 제안하는 CSS 선택자:")
            
            if class_counter:
                most_common_class = class_counter.most_common(1)[0][0]
                print(f"  • 학생 이름: .{most_common_class}")
                self.analysis_data["css_selectors"]["student_name"] = f".{most_common_class}"
            
            if parent_counter:
                most_common_parent = parent_counter.most_common(1)[0][0]
                print(f"  • 학생 컨테이너: .{most_common_parent}")
                self.analysis_data["css_selectors"]["student_container"] = f".{most_common_parent}"
        
        # 색상 기반 출석 상태 제안
        attendance_elements = self.analysis_data.get("attendance_indicators", [])
        if attendance_elements:
            print("  • 출석 상태 색상 후보:")
            unique_colors = list(set([elem["bg_color"] for elem in attendance_elements]))[:5]
            for color in unique_colors:
                print(f"    - {color}")
    
    def save_analysis(self):
        """분석 결과 저장"""
        filename = "attok_analysis.json"
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.analysis_data, f, ensure_ascii=False, indent=2)
            print(f"✅ 분석 결과 저장: {filename}")
        except Exception as e:
            print(f"❌ 분석 결과 저장 실패: {e}")
    
    def run_full_analysis(self):
        """전체 분석 실행"""
        print("Attok.co.kr 사이트 분석 시작")
        print("="*50)
        
        # 1. 드라이버 설정
        if not self.setup_driver():
            return False
        
        try:
            # 2. 사이트 열기
            if not self.open_site():
                return False
            
            # 3. 로그인 대기
            if not self.wait_for_login():
                return False
            
            # 4. 페이지 구조 분석
            self.analyze_page_structure()
            
            # 5. 학생 요소 찾기
            self.find_student_elements()
            
            # 6. 색상/스타일 분석
            self.analyze_colors_and_styles()
            
            # 7. CSS 선택자 제안
            self.suggest_selectors()
            
            # 8. 결과 저장
            self.save_analysis()
            
            print("\n" + "="*50)
            print("✅ 분석 완료!")
            print("다음 단계: 이 정보를 바탕으로 web_monitor.py 수정")
            print("="*50)
            
            return True
            
        finally:
            input("분석 완료. Enter를 누르면 브라우저가 닫힙니다...")
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    tester = AttokSiteTester()
    tester.run_full_analysis()