"""
세션 유지 및 실제 출결 모니터링 시스템
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time
import json
import threading
from datetime import datetime

class AttokSessionKeeper:
    """Attok 세션 유지 및 모니터링"""
    
    def __init__(self):
        self.driver = None
        self.is_running = False
        self.session_active = False
        self.student_data = {}
        self.attendance_changes = []
        
        # 계정 정보
        self.username = "roncorobot"
        self.password = "Ronco6374!"
        self.attendance_url = "https://attok.co.kr/content/attendance/attendance.asp"
        
        # 모니터링 설정
        self.check_interval = 30  # 30초마다 체크
        self.session_refresh_interval = 120  # 2분마다 세션 갱신
        
    def setup_driver(self):
        """Chrome 드라이버 설정"""
        options = webdriver.ChromeOptions()
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-blink-features=AutomationControlled')
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
            print("Chrome 드라이버 초기화 성공")
            return True
        except:
            try:
                self.driver = webdriver.Chrome(options=options)
                print("시스템 Chrome 드라이버 사용")
                return True
            except Exception as e:
                print(f"드라이버 초기화 실패: {e}")
                return False
    
    def login_and_navigate(self):
        """로그인 및 출결 페이지 이동"""
        try:
            print("출결 페이지 접속 시도...")
            self.driver.get(self.attendance_url)
            time.sleep(3)
            
            current_url = self.driver.current_url
            print(f"현재 URL: {current_url}")
            
            if "login" in current_url or "goslim" in current_url:
                print("로그인 페이지로 리다이렉트됨")
                return self.attempt_auto_login()
            else:
                print("이미 로그인된 상태 또는 직접 접근 성공")
                self.session_active = True
                return True
                
        except Exception as e:
            print(f"로그인/이동 오류: {e}")
            return False
    
    def attempt_auto_login(self):
        """자동 로그인 시도"""
        try:
            # 입력 필드 찾기
            inputs = self.driver.find_elements(By.TAG_NAME, "input")
            
            username_field = None
            password_field = None
            
            for inp in inputs:
                inp_type = inp.get_attribute('type') or ''
                inp_name = inp.get_attribute('name') or ''
                
                if inp_type.lower() == 'text' or 'id' in inp_name.lower() or 'user' in inp_name.lower():
                    username_field = inp
                elif inp_type.lower() == 'password':
                    password_field = inp
            
            if username_field and password_field:
                print("자동 로그인 시도...")
                username_field.clear()
                username_field.send_keys(self.username)
                
                password_field.clear()
                password_field.send_keys(self.password)
                
                # 로그인 버튼 찾기 및 클릭
                buttons = self.driver.find_elements(By.TAG_NAME, "button")
                submit_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='submit']")
                
                for btn in buttons + submit_inputs:
                    btn_text = btn.text.lower() if btn.text else ''
                    btn_value = btn.get_attribute('value') or ''
                    
                    if '로그인' in btn_text or 'login' in btn_text or '로그인' in btn_value:
                        btn.click()
                        time.sleep(3)
                        break
                
                # 로그인 성공 확인
                new_url = self.driver.current_url
                if "attendance" in new_url:
                    print("자동 로그인 성공!")
                    self.session_active = True
                    return True
                else:
                    print("자동 로그인 실패 - 수동 로그인 필요")
                    return False
            else:
                print("로그인 필드를 찾을 수 없음")
                return False
                
        except Exception as e:
            print(f"자동 로그인 오류: {e}")
            return False
    
    def extract_student_data(self):
        """현재 페이지에서 학생 데이터 추출"""
        try:
            current_url = self.driver.current_url
            if "attendance" not in current_url:
                print("출결 페이지가 아님 - 재이동 시도")
                self.driver.get(self.attendance_url)
                time.sleep(3)
            
            # 학생 데이터 추출
            text_elements = self.driver.find_elements(By.XPATH, "//*[text()]")
            current_students = {}
            
            for elem in text_elements:
                try:
                    text = elem.text.strip()
                    # 한글 이름 패턴 (2-4자)
                    if text and 2 <= len(text) <= 4 and any('\uac00' <= char <= '\ud7a3' for char in text):
                        # 일반적인 단어들 제외
                        exclude_words = ['출석', '결석', '지각', '조퇴', '관리', '학원', '시간', '검색', '등록', '수정', '삭제']
                        if not any(word in text for word in exclude_words):
                            
                            # 출석 상태 확인 (부모 요소의 배경색)
                            try:
                                parent = elem.find_element(By.XPATH, "..")
                                bg_color = parent.value_of_css_property("background-color")
                                
                                current_students[text] = {
                                    'name': text,
                                    'bg_color': bg_color,
                                    'class': elem.get_attribute('class') or '',
                                    'parent_class': parent.get_attribute('class') or '',
                                    'timestamp': datetime.now().strftime('%H:%M:%S')
                                }
                            except:
                                current_students[text] = {
                                    'name': text,
                                    'bg_color': 'unknown',
                                    'class': elem.get_attribute('class') or '',
                                    'timestamp': datetime.now().strftime('%H:%M:%S')
                                }
                                
                except:
                    continue
            
            return current_students
            
        except Exception as e:
            print(f"학생 데이터 추출 오류: {e}")
            return {}
    
    def detect_attendance_changes(self, new_data):
        """출석 상태 변화 감지"""
        changes = []
        
        for name, new_info in new_data.items():
            if name in self.student_data:
                old_info = self.student_data[name]
                # 배경색 변화 감지
                if old_info['bg_color'] != new_info['bg_color']:
                    change = {
                        'student': name,
                        'old_color': old_info['bg_color'],
                        'new_color': new_info['bg_color'],
                        'time': new_info['timestamp'],
                        'change_type': 'color_change'
                    }
                    changes.append(change)
                    print(f"[출석 변화] {name}: {old_info['bg_color']} -> {new_info['bg_color']}")
            else:
                # 새로운 학생 발견
                change = {
                    'student': name,
                    'new_color': new_info['bg_color'],
                    'time': new_info['timestamp'],
                    'change_type': 'new_student'
                }
                changes.append(change)
                print(f"[새 학생] {name}: {new_info['bg_color']}")
        
        # 변화 기록
        self.attendance_changes.extend(changes)
        
        return changes
    
    def keep_session_alive(self):
        """세션 유지 (페이지 새로고침)"""
        try:
            current_time = datetime.now().strftime('%H:%M:%S')
            print(f"[{current_time}] 세션 유지 - 페이지 새로고침")
            self.driver.refresh()
            time.sleep(2)
            
            # URL 확인
            current_url = self.driver.current_url
            if "login" in current_url or "goslim" in current_url:
                print("세션 만료됨 - 재로그인 필요")
                self.session_active = False
                return False
            else:
                print("세션 유지됨")
                return True
                
        except Exception as e:
            print(f"세션 유지 오류: {e}")
            return False
    
    def monitoring_loop(self):
        """메인 모니터링 루프"""
        last_session_refresh = time.time()
        
        while self.is_running:
            try:
                current_time = time.time()
                
                # 세션 유지 체크
                if current_time - last_session_refresh >= self.session_refresh_interval:
                    if not self.keep_session_alive():
                        print("세션 만료 - 재로그인 시도")
                        if not self.login_and_navigate():
                            print("재로그인 실패 - 모니터링 중단")
                            break
                    last_session_refresh = current_time
                
                # 학생 데이터 추출
                new_data = self.extract_student_data()
                
                if new_data:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 학생 {len(new_data)}명 확인")
                    
                    # 변화 감지
                    changes = self.detect_attendance_changes(new_data)
                    
                    # 데이터 업데이트
                    self.student_data = new_data
                    
                    # 변화가 있으면 파일 저장
                    if changes:
                        self.save_data()
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 학생 데이터 없음")
                
                # 대기
                time.sleep(self.check_interval)
                
            except Exception as e:
                print(f"모니터링 오류: {e}")
                time.sleep(self.check_interval)
    
    def save_data(self):
        """데이터 저장"""
        try:
            data = {
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'students': self.student_data,
                'changes': self.attendance_changes[-50:]  # 최근 50개 변화만
            }
            
            with open('attendance_monitoring.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            print(f"데이터 저장 오류: {e}")
    
    def start_monitoring(self):
        """모니터링 시작"""
        if not self.setup_driver():
            return False
        
        print("=" * 50)
        print("Attok 출결 실시간 모니터링 시작")
        print("=" * 50)
        print(f"체크 간격: {self.check_interval}초")
        print(f"세션 갱신: {self.session_refresh_interval}초")
        
        # 초기 로그인
        if not self.login_and_navigate():
            print("초기 로그인 실패")
            return False
        
        # 초기 데이터 추출
        self.student_data = self.extract_student_data()
        print(f"초기 학생 데이터: {len(self.student_data)}명")
        
        for name, info in self.student_data.items():
            print(f"  - {name}: {info['bg_color']}")
        
        # 모니터링 시작
        self.is_running = True
        
        try:
            self.monitoring_loop()
        except KeyboardInterrupt:
            print("사용자에 의한 모니터링 중단")
        finally:
            self.stop_monitoring()
    
    def stop_monitoring(self):
        """모니터링 중지"""
        self.is_running = False
        
        if self.driver:
            self.driver.quit()
        
        self.save_data()
        print("모니터링 종료 및 데이터 저장 완료")

if __name__ == "__main__":
    monitor = AttokSessionKeeper()
    monitor.start_monitoring()