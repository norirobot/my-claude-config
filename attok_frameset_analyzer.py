"""
ATTOK 사이트 Frameset 내부 로그인 페이지 분석 스크립트
frameset 구조에서 실제 로그인 폼이 있는 페이지들을 직접 분석
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def analyze_frameset_login_pages():
    print("[시작] ATTOK Frameset 로그인 페이지 분석 시작...")
    
    # 분석할 페이지 목록 (사용자가 제공한 정보 기반)
    login_pages = [
        "https://attok.co.kr/center_login_lite_new.asp",
        "https://attok.co.kr/center_login_lite.asp"
    ]
    
    driver = None
    results = {}
    
    try:
        # 헤드리스 모드로 실행 (빠른 분석을 위해)
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        driver = webdriver.Chrome(options=options)
        
        for page_url in login_pages:
            print(f"\n=== [{page_url}] 분석 중 ===")
            
            try:
                driver.get(page_url)
                time.sleep(3)  # 페이지 로딩 대기
                
                print(f"[페이지] 제목: {driver.title}")
                print(f"[상태] 로딩 완료")
                
                # 1. 폼 요소 분석
                forms = driver.find_elements(By.TAG_NAME, "form")
                print(f"[폼] 발견된 수: {len(forms)}")
                
                page_analysis = {
                    'url': page_url,
                    'title': driver.title,
                    'forms': [],
                    'inputs': [],
                    'buttons': [],
                    'page_content': driver.page_source[:1000]  # 첫 1000자만
                }
                
                for i, form in enumerate(forms):
                    action = form.get_attribute('action') or '없음'
                    method = form.get_attribute('method') or '없음'
                    form_id = form.get_attribute('id') or '없음'
                    form_name = form.get_attribute('name') or '없음'
                    
                    form_info = {
                        'index': i+1,
                        'action': action,
                        'method': method,
                        'id': form_id,
                        'name': form_name
                    }
                    page_analysis['forms'].append(form_info)
                    
                    print(f"  [폼{i+1}] Action: {action}, Method: {method}, ID: {form_id}")
                
                # 2. 입력 필드 분석
                inputs = driver.find_elements(By.TAG_NAME, "input")
                print(f"[입력] 발견된 수: {len(inputs)}")
                
                for i, input_elem in enumerate(inputs):
                    input_type = input_elem.get_attribute('type') or '없음'
                    input_name = input_elem.get_attribute('name') or '없음'
                    input_id = input_elem.get_attribute('id') or '없음'
                    placeholder = input_elem.get_attribute('placeholder') or '없음'
                    
                    if input_type in ['text', 'password', 'email', 'submit', 'button']:
                        input_info = {
                            'index': i+1,
                            'type': input_type,
                            'name': input_name,
                            'id': input_id,
                            'placeholder': placeholder
                        }
                        page_analysis['inputs'].append(input_info)
                        print(f"  [입력{i+1}] Type: {input_type}, Name: {input_name}, ID: {input_id}")
                
                # 3. 버튼 분석
                buttons = driver.find_elements(By.TAG_NAME, "button")
                submit_inputs = driver.find_elements(By.XPATH, "//input[@type='submit']")
                
                all_buttons = buttons + submit_inputs
                print(f"[버튼] 총 발견된 수: {len(all_buttons)}")
                
                for i, button in enumerate(all_buttons):
                    if button.tag_name == 'button':
                        button_text = button.text or '없음'
                        button_type = button.get_attribute('type') or '없음'
                    else:  # input[type=submit]
                        button_text = button.get_attribute('value') or '없음'
                        button_type = 'submit'
                    
                    button_onclick = button.get_attribute('onclick') or '없음'
                    
                    button_info = {
                        'index': i+1,
                        'text': button_text,
                        'type': button_type,
                        'onclick': button_onclick
                    }
                    page_analysis['buttons'].append(button_info)
                    print(f"  [버튼{i+1}] Text: {button_text}, Type: {button_type}")
                
                # 4. 중요 키워드 검색
                page_source = driver.page_source.lower()
                keywords = ['user', 'id', 'password', 'login', '로그인', '아이디', '비밀번호']
                keyword_counts = {}
                
                for keyword in keywords:
                    count = page_source.count(keyword.lower())
                    if count > 0:
                        keyword_counts[keyword] = count
                        print(f"  [키워드] '{keyword}': {count}회 발견")
                
                page_analysis['keyword_counts'] = keyword_counts
                results[page_url] = page_analysis
                
                print(f"[완료] {page_url} 분석 완료")
                
            except Exception as e:
                print(f"[오류] {page_url} 분석 실패: {e}")
                results[page_url] = {'error': str(e)}
        
        # 5. 종합 분석 결과 출력
        print(f"\n=== [종합] 분석 결과 요약 ===")
        
        login_candidates = []
        for url, analysis in results.items():
            if 'error' in analysis:
                print(f"[실패] {url}: {analysis['error']}")
                continue
                
            form_count = len(analysis.get('forms', []))
            input_count = len(analysis.get('inputs', []))
            button_count = len(analysis.get('buttons', []))
            
            print(f"[페이지] {url}")
            print(f"  - 폼: {form_count}개, 입력: {input_count}개, 버튼: {button_count}개")
            
            # 로그인 가능성 점수 계산
            score = 0
            if form_count > 0:
                score += 3
            if input_count >= 2:  # ID, Password 최소 2개
                score += 2
            if button_count > 0:
                score += 1
            
            keyword_score = sum(analysis.get('keyword_counts', {}).values())
            score += min(keyword_score, 5)  # 키워드 점수는 최대 5점
            
            if score >= 5:
                login_candidates.append((url, score))
                print(f"  [추천] 로그인 페이지 후보 (점수: {score})")
            else:
                print(f"  [일반] 일반 페이지 (점수: {score})")
        
        # 최적 로그인 페이지 추천
        if login_candidates:
            best_candidate = max(login_candidates, key=lambda x: x[1])
            print(f"\n[결론] 최적 로그인 페이지: {best_candidate[0]} (점수: {best_candidate[1]})")
        else:
            print(f"\n[결론] 로그인 페이지를 찾지 못했습니다.")
        
        return results
        
    except Exception as e:
        print(f"[전체오류] 분석 중 오류 발생: {e}")
        return None
        
    finally:
        if driver:
            print("[종료] 브라우저 종료 중...")
            driver.quit()

if __name__ == "__main__":
    results = analyze_frameset_login_pages()
    if results:
        print("\n[성공] Frameset 로그인 페이지 분석 완료!")
        print("[다음단계] 로그인 구현을 위한 세부 정보가 수집되었습니다.")
    else:
        print("\n[실패] 분석에 실패했습니다.")