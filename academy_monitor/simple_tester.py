"""
간단한 attok.co.kr 사이트 테스트
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

def test_attok_site():
    """Attok 사이트 테스트"""
    print("=" * 50)
    print("Attok.co.kr 사이트 구조 분석")
    print("=" * 50)
    
    # Chrome 드라이버 설정
    options = webdriver.ChromeOptions()
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    
    driver = None
    
    try:
        # 드라이버 초기화
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
            print("Chrome 드라이버 초기화 성공")
        except:
            driver = webdriver.Chrome(options=options)
            print("시스템 Chrome 드라이버 사용")
        
        # 사이트 접속
        print("attok.co.kr 접속 중...")
        driver.get("https://attok.co.kr")
        time.sleep(3)
        
        print(f"사이트 접속 성공: {driver.title}")
        print(f"현재 URL: {driver.current_url}")
        
        # 사용자 로그인 대기
        print("\n" + "=" * 50)
        print("로그인 안내")
        print("=" * 50)
        print("1. 브라우저에서 로그인해주세요")
        print("2. 학생 목록이 보이는 페이지로 이동해주세요")
        print("3. 로그인 완료 후 Enter를 누르세요")
        print("=" * 50)
        
        input("로그인 완료 후 Enter를 누르세요...")
        
        print("\n페이지 분석 시작...")
        
        # 현재 페이지 정보
        current_url = driver.current_url
        page_title = driver.title
        print(f"로그인 후 URL: {current_url}")
        print(f"페이지 제목: {page_title}")
        
        # HTML 전체 구조 확인
        page_source = driver.page_source
        print(f"페이지 소스 길이: {len(page_source)} 문자")
        
        # 모든 클래스명 수집
        elements_with_class = driver.find_elements(By.XPATH, "//*[@class]")
        all_classes = []
        for elem in elements_with_class:
            class_attr = elem.get_attribute("class")
            if class_attr:
                all_classes.extend(class_attr.split())
        
        # 클래스 빈도 계산
        from collections import Counter
        class_counter = Counter(all_classes)
        
        print(f"\n총 클래스 수: {len(set(all_classes))}")
        print("상위 20개 클래스:")
        for class_name, count in class_counter.most_common(20):
            print(f"  {class_name}: {count}개")
        
        # 텍스트가 있는 모든 요소 찾기
        text_elements = driver.find_elements(By.XPATH, "//*[text()]")
        print(f"\n텍스트가 있는 요소: {len(text_elements)}개")
        
        # 학생 이름으로 보이는 요소들 찾기
        print("\n학생 이름 후보들 (한글 2-4자):")
        student_candidates = []
        
        for elem in text_elements:
            text = elem.text.strip()
            if text and 2 <= len(text) <= 4:
                # 한글이 포함된 텍스트만
                if any('\uac00' <= char <= '\ud7a3' for char in text):
                    elem_info = {
                        'text': text,
                        'tag': elem.tag_name,
                        'class': elem.get_attribute('class'),
                        'id': elem.get_attribute('id')
                    }
                    student_candidates.append(elem_info)
        
        # 중복 제거 후 표시
        unique_texts = list(set([c['text'] for c in student_candidates]))
        print(f"고유한 이름 후보: {len(unique_texts)}개")
        
        for i, text in enumerate(unique_texts[:20]):  # 상위 20개만
            print(f"  {i+1}. {text}")
        
        # 색상이 있는 요소들 찾기
        print("\n배경색이 있는 요소들:")
        colored_elements = []
        
        all_elements = driver.find_elements(By.XPATH, "//*")[:200]  # 상위 200개만
        
        for elem in all_elements:
            try:
                bg_color = elem.value_of_css_property("background-color")
                if bg_color and bg_color not in ["rgba(0, 0, 0, 0)", "transparent"]:
                    colored_elements.append({
                        'color': bg_color,
                        'text': elem.text[:20] if elem.text else '',
                        'class': elem.get_attribute('class')
                    })
            except:
                continue
        
        # 색상별 그룹화
        color_groups = {}
        for elem in colored_elements:
            color = elem['color']
            if color not in color_groups:
                color_groups[color] = []
            color_groups[color].append(elem)
        
        print("색상별 요소 그룹:")
        for color, elements in list(color_groups.items())[:10]:  # 상위 10개 색상만
            print(f"  {color}: {len(elements)}개 요소")
            if elements[0]['text']:
                print(f"    예시: {elements[0]['text']}")
        
        # 결과 저장
        analysis_result = {
            'url': current_url,
            'title': page_title,
            'top_classes': class_counter.most_common(20),
            'student_candidates': unique_texts[:20],
            'color_groups': {k: len(v) for k, v in color_groups.items()}
        }
        
        with open('attok_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(analysis_result, f, ensure_ascii=False, indent=2)
        
        print("\n분석 결과가 attok_analysis.json 파일에 저장되었습니다.")
        
        # 추천 CSS 선택자 제안
        print("\n" + "=" * 50)
        print("CSS 선택자 추천")
        print("=" * 50)
        
        if class_counter:
            top_class = class_counter.most_common(1)[0][0]
            print(f"가장 많이 사용된 클래스: .{top_class}")
        
        print("\n다음 단계:")
        print("1. 실제 학생 이름들을 확인하세요")
        print("2. 출석 시 색상 변화를 관찰하세요") 
        print("3. web_monitor.py의 CSS 선택자를 수정하세요")
        
        input("분석 완료. Enter를 누르면 브라우저가 닫힙니다...")
        
    except Exception as e:
        print(f"오류 발생: {e}")
        
    finally:
        if driver:
            driver.quit()
            print("브라우저 종료")

if __name__ == "__main__":
    test_attok_site()