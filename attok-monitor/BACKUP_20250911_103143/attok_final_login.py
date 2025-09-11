"""
ATTOK 최종 로그인 시스템
- 아이디/비밀번호 암호화 저장
- 팝업 제거
- exe 파일로 변환 가능
"""
import tkinter as tk
from tkinter import messagebox
import threading
import time
import os
import base64
from cryptography.fernet import Fernet
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class AttokFinalLogin:
    def __init__(self, root):
        self.root = root
        self.root.title("ATTOK 자동 로그인 시스템 v1.0")
        self.root.geometry("650x400")
        self.root.configure(bg='#1e1e1e')
        
        self.driver = None
        self.login_url = "https://attok.co.kr/center_login_lite_new.asp"
        
        # 암호화 키 생성/로드
        self.key_file = "login.key"
        self.config_file = "login_config.dat"
        self.load_or_create_key()
        
        self.setup_ui()
        self.load_saved_credentials()
    
    def load_or_create_key(self):
        """암호화 키 생성/로드"""
        try:
            if os.path.exists(self.key_file):
                with open(self.key_file, 'rb') as f:
                    self.key = f.read()
            else:
                self.key = Fernet.generate_key()
                with open(self.key_file, 'wb') as f:
                    f.write(self.key)
            self.cipher = Fernet(self.key)
        except Exception as e:
            print(f"암호화 키 오류: {e}")
            # 기본 키 사용
            self.key = base64.urlsafe_b64encode(b"attok_login_key_2025")
            self.cipher = Fernet(self.key)
    
    def save_credentials(self, username, password):
        """아이디/비밀번호 암호화해서 저장"""
        try:
            data = {
                "username": username,
                "password": password
            }
            
            # JSON을 문자열로 변환 후 암호화
            json_str = json.dumps(data)
            encrypted_data = self.cipher.encrypt(json_str.encode())
            
            with open(self.config_file, 'wb') as f:
                f.write(encrypted_data)
            
            print("로그인 정보 저장 완료")
        except Exception as e:
            print(f"저장 오류: {e}")
    
    def load_saved_credentials(self):
        """저장된 아이디/비밀번호 로드"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'rb') as f:
                    encrypted_data = f.read()
                
                # 복호화 후 JSON 파싱
                decrypted_data = self.cipher.decrypt(encrypted_data)
                data = json.loads(decrypted_data.decode())
                
                # UI에 자동 입력
                self.username_entry.delete(0, tk.END)
                self.username_entry.insert(0, data.get("username", ""))
                
                self.password_entry.delete(0, tk.END)
                self.password_entry.insert(0, data.get("password", ""))
                
                print("저장된 로그인 정보 로드 완료")
                return True
        except Exception as e:
            print(f"로드 오류: {e}")
        return False
    
    def setup_ui(self):
        """UI 설정"""
        # 제목
        title_label = tk.Label(self.root, text="ATTOK 자동 로그인 시스템", 
                              font=('맑은 고딕', 18, 'bold'), 
                              fg='#ffffff', bg='#1e1e1e')
        title_label.pack(pady=20)
        
        # 메인 프레임
        main_frame = tk.Frame(self.root, bg='#2d2d30', padx=30, pady=30)
        main_frame.pack(pady=20, padx=50, fill='both', expand=True)
        
        # ID 입력
        tk.Label(main_frame, text="사용자 ID:", fg='#ffffff', bg='#2d2d30', 
                font=('맑은 고딕', 12)).grid(row=0, column=0, padx=10, pady=15, sticky='e')
        
        self.username_entry = tk.Entry(main_frame, width=25, font=('맑은 고딕', 11))
        self.username_entry.grid(row=0, column=1, padx=10, pady=15)
        
        # 비밀번호 입력
        tk.Label(main_frame, text="비밀번호:", fg='#ffffff', bg='#2d2d30',
                font=('맑은 고딕', 12)).grid(row=1, column=0, padx=10, pady=15, sticky='e')
        
        self.password_entry = tk.Entry(main_frame, width=25, show='*', font=('맑은 고딕', 11))
        self.password_entry.grid(row=1, column=1, padx=10, pady=15)
        
        # 저장 체크박스
        self.save_var = tk.BooleanVar(value=True)
        save_check = tk.Checkbutton(main_frame, text="로그인 정보 저장", 
                                   variable=self.save_var,
                                   fg='#ffffff', bg='#2d2d30',
                                   selectcolor='#2d2d30',
                                   font=('맑은 고딕', 10))
        save_check.grid(row=2, column=1, padx=10, pady=10, sticky='w')
        
        # 버튼 프레임
        button_frame = tk.Frame(main_frame, bg='#2d2d30')
        button_frame.grid(row=3, column=0, columnspan=2, pady=20)
        
        # 로그인 버튼
        self.login_btn = tk.Button(button_frame, text="🔑 자동 로그인", 
                                  command=self.start_login,
                                  bg='#007acc', fg='white', 
                                  font=('맑은 고딕', 14, 'bold'),
                                  width=15, height=2)
        self.login_btn.pack(side='left', padx=10)
        
        # 설정 삭제 버튼
        clear_btn = tk.Button(button_frame, text="저장정보 삭제", 
                             command=self.clear_saved_data,
                             bg='#dc3545', fg='white', 
                             font=('맑은 고딕', 11),
                             width=12, height=2)
        clear_btn.pack(side='left', padx=10)
        
        # 상태 표시
        self.status_label = tk.Label(self.root, text="저장된 로그인 정보가 있으면 자동으로 입력됩니다", 
                                   fg='#cccccc', bg='#1e1e1e',
                                   font=('맑은 고딕', 10))
        self.status_label.pack(pady=10)
        
        # Enter 키 바인딩
        self.username_entry.bind('<Return>', lambda e: self.password_entry.focus())
        self.password_entry.bind('<Return>', lambda e: self.start_login())
    
    def start_login(self):
        """로그인 시작"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            self.status_label.config(text="❌ 사용자 ID와 비밀번호를 모두 입력해주세요")
            return
        
        # 로그인 정보 저장 (체크박스 선택시)
        if self.save_var.get():
            self.save_credentials(username, password)
        
        self.login_btn.config(state='disabled')
        self.status_label.config(text="🔄 로그인 중...")
        
        # 별도 스레드에서 로그인 실행
        threading.Thread(target=self.perform_login, args=(username, password), daemon=True).start()
    
    def perform_login(self, username, password):
        """로그인 수행"""
        try:
            # 1. 브라우저 시작
            self.root.after(0, lambda: self.status_label.config(text="🌐 브라우저 시작 중..."))
            
            options = Options()
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1280,720')
            
            self.driver = webdriver.Chrome(options=options)
            self.driver.implicitly_wait(3)
            
            # 2. 로그인 페이지 접속
            self.root.after(0, lambda: self.status_label.config(text="📄 로그인 페이지 접속 중..."))
            
            self.driver.get(self.login_url)
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.NAME, "user_id"))
            )
            
            # 3. 로그인 정보 입력
            self.root.after(0, lambda: self.status_label.config(text="✏️ 로그인 정보 입력 중..."))
            
            user_id_field = self.driver.find_element(By.NAME, "user_id")
            user_id_field.clear()
            user_id_field.send_keys(username)
            
            password_field = self.driver.find_element(By.NAME, "user_pass")
            password_field.clear()
            password_field.send_keys(password)
            
            # 4. 로그인 버튼 클릭
            self.root.after(0, lambda: self.status_label.config(text="🔘 로그인 버튼 클릭 중..."))
            
            button_selectors = [
                "//input[@type='button' and @value='로그인']",
                "//button[text()='로그인']",
                "//input[@value='로그인']",
                "//button[contains(text(), '로그인')]"
            ]
            
            login_button = None
            for selector in button_selectors:
                try:
                    login_button = self.driver.find_element(By.XPATH, selector)
                    break
                except:
                    continue
            
            if not login_button:
                self.root.after(0, lambda: self.status_label.config(text="❌ 로그인 버튼을 찾을 수 없습니다"))
                self.root.after(0, lambda: self.login_btn.config(state='normal'))
                return
            
            # JavaScript로 빠른 클릭
            self.driver.execute_script("arguments[0].click();", login_button)
            time.sleep(1)
            
            # 5. 로그인 결과 확인
            current_url = self.driver.current_url
            
            if "loginok.asp" in current_url or current_url != self.login_url:
                # 로그인 성공 - 팝업 없이 상태만 표시
                self.root.after(0, lambda: self.status_label.config(text="✅ 로그인 성공! ATTOK 사이트가 열렸습니다"))
                self.root.after(0, lambda: self.login_btn.config(text="✅ 로그인 완료", state='disabled'))
                
                # 메인 페이지로 이동
                self.driver.get("https://attok.co.kr/")
                
                # 5초 후 버튼 다시 활성화 (재로그인 가능)
                self.root.after(5000, lambda: self.reset_login_button())
                
            else:
                # 로그인 실패
                self.root.after(0, lambda: self.status_label.config(text="❌ 로그인 실패 - 아이디나 비밀번호를 확인해주세요"))
                self.root.after(0, lambda: self.login_btn.config(state='normal'))
                
        except Exception as e:
            error_msg = f"❌ 오류 발생: {str(e)}"
            self.root.after(0, lambda: self.status_label.config(text=error_msg))
            self.root.after(0, lambda: self.login_btn.config(state='normal'))
    
    def reset_login_button(self):
        """로그인 버튼 리셋 (재로그인 가능)"""
        self.login_btn.config(text="🔑 자동 로그인", state='normal')
        self.status_label.config(text="재로그인이 필요하면 다시 버튼을 클릭하세요")
    
    def clear_saved_data(self):
        """저장된 로그인 정보 삭제"""
        try:
            if os.path.exists(self.config_file):
                os.remove(self.config_file)
            if os.path.exists(self.key_file):
                os.remove(self.key_file)
            
            self.username_entry.delete(0, tk.END)
            self.password_entry.delete(0, tk.END)
            
            self.status_label.config(text="🗑️ 저장된 로그인 정보가 삭제되었습니다")
        except Exception as e:
            self.status_label.config(text=f"❌ 삭제 오류: {str(e)}")
    
    def close_browser(self):
        """브라우저 종료"""
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
            self.driver = None

def main():
    """메인 실행 함수"""
    root = tk.Tk()
    app = AttokFinalLogin(root)
    
    # 창 닫기 이벤트 처리
    def on_closing():
        app.close_browser()
        root.destroy()
    
    root.protocol("WM_DELETE_WINDOW", on_closing)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        print("프로그램 종료")
    finally:
        app.close_browser()

if __name__ == "__main__":
    print("ATTOK 최종 로그인 시스템 시작")
    print("=" * 40)
    main()