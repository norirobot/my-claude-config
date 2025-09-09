"""
디버깅용 모니터 - 각 박스의 내용을 자세히 출력
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from colorama import init, Fore, Style
import time

init()

def debug_parse():
    """각 박스의 내용을 자세히 분석"""
    
    # 브라우저 설정
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    driver = webdriver.Chrome(options=options)
    
    print(f"{Fore.GREEN}브라우저를 시작했습니다.{Style.RESET_ALL}")
    driver.get("https://attok.co.kr/")
    
    print(f"{Fore.YELLOW}수동으로 로그인 후 Enter를 눌러주세요...{Style.RESET_ALL}")
    input()
    
    print(f"\n{Fore.CYAN}=== 상세 디버깅 시작 ==={Style.RESET_ALL}\n")
    
    # 1. 모든 box 요소 찾기
    boxes = driver.find_elements(By.CSS_SELECTOR, "div.box")
    print(f"{Fore.GREEN}총 {len(boxes)}개의 box 요소를 찾았습니다.{Style.RESET_ALL}\n")
    
    # 2. 각 박스 상세 분석 (처음 10개만)
    student_count = 0
    for i, box in enumerate(boxes[:15]):  # 처음 15개 박스 확인
        print(f"\n{Fore.YELLOW}--- 박스 #{i+1} 분석 ---{Style.RESET_ALL}")
        
        try:
            # 박스 클래스명
            class_name = box.get_attribute("class")
            print(f"클래스: {class_name}")
            
            # 박스 배경색
            bg_color = box.value_of_css_property("background-color")
            print(f"배경색: {bg_color}")
            
            # 박스 전체 텍스트
            box_text = box.text.strip()
            if box_text:
                print(f"전체 텍스트 길이: {len(box_text)}자")
                lines = box_text.split('\n')
                print(f"줄 수: {len(lines)}줄")
                
                # 각 줄 출력
                for j, line in enumerate(lines[:5]):  # 처음 5줄만
                    line = line.strip()
                    if line:
                        # 한글 이름인지 체크
                        is_korean_name = 2 <= len(line) <= 4 and all(ord('가') <= ord(c) <= ord('힣') for c in line)
                        if is_korean_name:
                            print(f"  {j+1}줄: '{line}' {Fore.GREEN}← 한글 이름 감지!{Style.RESET_ALL}")
                            student_count += 1
                        else:
                            print(f"  {j+1}줄: '{line[:30]}...' (길이: {len(line)})")
            else:
                print("텍스트 없음")
                
            # 하위 요소 수
            children = box.find_elements(By.XPATH, ".//*")
            print(f"하위 요소: {len(children)}개")
            
            # name 클래스 포함 요소 찾기
            name_elements = box.find_elements(By.CSS_SELECTOR, "*[class*='name']")
            if name_elements:
                print(f"'name' 클래스 요소 {len(name_elements)}개 발견:")
                for elem in name_elements:
                    elem_text = elem.text.strip()
                    if elem_text:
                        print(f"  - '{elem_text}'")
                        
        except Exception as e:
            print(f"{Fore.RED}오류: {str(e)}{Style.RESET_ALL}")
    
    print(f"\n{Fore.CYAN}=== 요약 ==={Style.RESET_ALL}")
    print(f"총 박스 수: {len(boxes)}개")
    print(f"학생으로 추정되는 수: {student_count}명")
    
    # 3. 특정 텍스트 패턴 검색
    print(f"\n{Fore.CYAN}=== 특정 패턴 검색 ==={Style.RESET_ALL}")
    
    # "등원", "하원" 텍스트가 있는 박스 찾기
    attendance_boxes = []
    for box in boxes:
        text = box.text
        if "등원" in text or "하원" in text:
            attendance_boxes.append(box)
    
    print(f"'등원/하원' 텍스트 포함 박스: {len(attendance_boxes)}개")
    
    # 체크박스가 있는 박스 찾기
    checkbox_boxes = []
    for box in boxes:
        checkboxes = box.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
        if checkboxes:
            checkbox_boxes.append(box)
    
    print(f"체크박스 포함 박스: {len(checkbox_boxes)}개")
    
    input(f"\n{Fore.YELLOW}Enter를 눌러 브라우저를 종료하세요...{Style.RESET_ALL}")
    driver.quit()

if __name__ == "__main__":
    debug_parse()