"""
현재 열린 브라우저에서 학생 데이터 분석
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time
import json

def analyze_current_attendance():
    """현재 출결 페이지 분석"""
    print("=" * 50)
    print("출결 페이지 실시간 분석")
    print("=" * 50)
    
    options = webdriver.ChromeOptions()
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    
    driver = None
    
    try:
        # 새 드라이버 인스턴스 생성
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
            print("새 브라우저 창 생성")
        except:
            driver = webdriver.Chrome(options=options)
            print("새 브라우저 창 생성")
        
        # 출결 페이지 직접 접속
        attendance_url = "https://attok.co.kr/content/attendance/attendance.asp"
        print(f"출결 페이지 접속: {attendance_url}")
        
        driver.get(attendance_url)
        time.sleep(5)
        
        current_url = driver.current_url
        print(f"현재 URL: {current_url}")
        
        if "login" in current_url or "goslim" in current_url:
            print("로그인 페이지로 리다이렉트됨")
            print("수동 로그인 필요:")
            print("ID: roncorobot")
            print("PW: Ronco6374!")
            print("\n로그인 완료 후 Enter를 누르세요...")
            input()
        
        # 페이지 분석 시작
        print("\n=== 페이지 구조 분석 ===")
        
        try:
            page_title = driver.title
            print(f"페이지 제목: {page_title}")
            
            # HTML 전체 구조 확인
            page_source = driver.page_source
            print(f"페이지 소스 크기: {len(page_source)} 문자")
            
            # 테이블 요소 찾기
            tables = driver.find_elements(By.TAG_NAME, "table")
            print(f"테이블 개수: {len(tables)}")
            
            # 모든 텍스트 요소 수집
            text_elements = driver.find_elements(By.XPATH, "//*[text()]")
            print(f"텍스트 요소 개수: {len(text_elements)}")
            
            # 한글 이름 패턴 찾기
            student_candidates = []
            
            for elem in text_elements:
                try:
                    text = elem.text.strip()
                    if text and 2 <= len(text) <= 4:
                        # 한글 포함 여부 확인
                        if any('\uac00' <= char <= '\ud7a3' for char in text):
                            # 일반적인 단어들 제외
                            exclude = ['출석', '결석', '지각', '조퇴', '관리', '학원', '시간', '날짜', '검색', '등록']
                            if not any(word in text for word in exclude):
                                student_info = {
                                    'name': text,
                                    'tag': elem.tag_name,
                                    'class': elem.get_attribute('class') or '',
                                    'id': elem.get_attribute('id') or '',
                                    'parent_tag': elem.find_element(By.XPATH, "..").tag_name if elem.find_element(By.XPATH, "..") else ''
                                }
                                student_candidates.append(student_info)
                except:
                    continue
            
            # 중복 제거
            unique_students = []
            seen_names = set()
            for student in student_candidates:
                if student['name'] not in seen_names:
                    unique_students.append(student)
                    seen_names.add(student['name'])
            
            print(f"\n=== 학생 이름 후보 {len(unique_students)}명 ===")
            for i, student in enumerate(unique_students):
                print(f"{i+1:2d}. {student['name']} (태그: {student['tag']}, 클래스: {student['class']})")
            
            # 색상 분석
            print(f"\n=== 색상 분석 ===")
            colored_elements = []
            
            all_elements = driver.find_elements(By.XPATH, "//*")[:500]  # 상위 500개만
            
            color_map = {}
            for elem in all_elements:
                try:
                    bg_color = elem.value_of_css_property("background-color")
                    if bg_color and bg_color not in ["rgba(0, 0, 0, 0)", "transparent", "rgba(255, 255, 255, 1)"]:
                        text = elem.text.strip()[:20] if elem.text else ''
                        class_name = elem.get_attribute('class') or ''
                        
                        if bg_color not in color_map:
                            color_map[bg_color] = []
                        
                        color_map[bg_color].append({
                            'text': text,
                            'class': class_name,
                            'tag': elem.tag_name
                        })
                except:
                    continue
            
            print("발견된 배경색 종류:")
            for color, elements in color_map.items():
                print(f"  {color}: {len(elements)}개 요소")
                if elements and elements[0]['text']:
                    print(f"    예시: '{elements[0]['text']}'")
            
            # CSS 클래스 분석
            print(f"\n=== CSS 클래스 분석 ===")
            all_classes = []
            elements_with_class = driver.find_elements(By.XPATH, "//*[@class]")
            
            for elem in elements_with_class:
                class_attr = elem.get_attribute('class')
                if class_attr:
                    all_classes.extend(class_attr.split())
            
            from collections import Counter
            class_counter = Counter(all_classes)
            
            print("상위 20개 클래스:")
            for class_name, count in class_counter.most_common(20):
                print(f"  .{class_name}: {count}개")
            
            # 출석 상태 추정
            print(f"\n=== 출석 상태 추정 ===")
            
            # 학생 이름과 연관된 색상 요소들 찾기
            attendance_patterns = []
            
            for student in unique_students[:10]:  # 상위 10명만 체크
                student_name = student['name']
                
                # 해당 학생 이름 주변의 요소들 확인
                try:
                    name_elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{student_name}')]")
                    for name_elem in name_elements:
                        # 부모 요소들 확인
                        parent = name_elem.find_element(By.XPATH, "..")
                        parent_bg = parent.value_of_css_property("background-color")
                        parent_class = parent.get_attribute('class')
                        
                        if parent_bg and parent_bg not in ["rgba(0, 0, 0, 0)", "transparent"]:
                            attendance_patterns.append({
                                'student': student_name,
                                'bg_color': parent_bg,
                                'parent_class': parent_class,
                                'parent_tag': parent.tag_name
                            })
                except:
                    continue
            
            print("학생별 색상 패턴:")
            for pattern in attendance_patterns:
                print(f"  {pattern['student']}: {pattern['bg_color']} (클래스: {pattern['parent_class']})")
            
            # 결과 저장
            analysis_result = {
                'url': current_url,
                'title': page_title,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'students': [s['name'] for s in unique_students],
                'student_details': unique_students,
                'colors': {color: len(elements) for color, elements in color_map.items()},
                'top_classes': class_counter.most_common(10),
                'attendance_patterns': attendance_patterns
            }
            
            with open('real_attendance_data.json', 'w', encoding='utf-8') as f:
                json.dump(analysis_result, f, ensure_ascii=False, indent=2)
            
            print(f"\n분석 완료! 결과가 real_attendance_data.json에 저장됨")
            print(f"총 {len(unique_students)}명의 학생 발견")
            print(f"색상 패턴 {len(color_map)}개 발견")
            
            # CSS 선택자 제안
            print(f"\n=== CSS 선택자 제안 ===")
            if unique_students:
                most_common_tag = Counter([s['tag'] for s in unique_students]).most_common(1)[0][0]
                most_common_class = Counter([s['class'] for s in unique_students if s['class']]).most_common(1) 
                
                print(f"학생 이름 태그: {most_common_tag}")
                if most_common_class:
                    print(f"학생 이름 클래스: .{most_common_class[0][0]}")
                    
                print("\nweb_monitor.py 수정 제안:")
                print(f"  student_elements = driver.find_elements(By.TAG_NAME, '{most_common_tag}')")
                if most_common_class:
                    print(f"  또는")
                    print(f"  student_elements = driver.find_elements(By.CLASS_NAME, '{most_common_class[0][0]}')")
        
        except Exception as e:
            print(f"분석 중 오류: {e}")
            import traceback
            traceback.print_exc()
            
    except Exception as e:
        print(f"전체 오류: {e}")
        
    finally:
        if driver:
            print("\n30초 후 브라우저가 닫힙니다...")
            time.sleep(30)
            driver.quit()

if __name__ == "__main__":
    analyze_current_attendance()