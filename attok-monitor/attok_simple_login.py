"""
ATTOK 자동 로그인 시스템 (간단 버전)
- 로그인만 정확히 작동
- 복잡한 기능 제거
"""
import tkinter as tk
from tkinter import messagebox
import threading
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class AttokSimpleLogin:
    def __init__(self, root):
        self.root = root
        self.root.title("ATTOK 자동 로그인 시스템")
        self.root.geometry("500x300")
        self.root.configure(bg='#1e1e1e')
        
        self.driver = None
        self.login_url = "https://attok.co.kr/center_login_lite_new.asp"
        
        self.setup_ui()
    
    def setup_ui(self):
        """UI 설정"""
        # 제목
        title_label = tk.Label(self.root, text="ATTOK 자동 로그인", 
                              font=('맑은 고딕', 16, 'bold'), 
                              fg='#ffffff', bg='#1e1e1e')
        title_label.pack(pady=20)
        
        # 로그인 프레임
        login_frame = tk.Frame(self.root, bg='#2d2d30', padx=20, pady=20)
        login_frame.pack(pady=20)
        
        # ID 입력
        tk.Label(login_frame, text="사용자 ID:", fg='#ffffff', bg='#2d2d30', 
                font=('맑은 고딕', 10)).grid(row=0, column=0, padx=5, pady=10, sticky='e')
        
        self.username_entry = tk.Entry(login_frame, width=20, font=('맑은 고딕', 10))
        self.username_entry.grid(row=0, column=1, padx=5, pady=10)
        
        # 비밀번호 입력
        tk.Label(login_frame, text="비밀번호:", fg='#ffffff', bg='#2d2d30',
                font=('맑은 고딕', 10)).grid(row=1, column=0, padx=5, pady=10, sticky='e')
        
        self.password_entry = tk.Entry(login_frame, width=20, show='*', font=('맑은 고딕', 10))
        self.password_entry.grid(row=1, column=1, padx=5, pady=10)
        
        # 로그인 버튼
        self.login_btn = tk.Button(login_frame, text="자동 로그인", 
                                  command=self.start_login,
                                  bg='#007acc', fg='white', 
                                  font=('맑은 고딕', 12, 'bold'),
                                  width=15)
        self.login_btn.grid(row=2, column=0, columnspan=2, pady=20)
        
        # 상태 표시
        self.status_label = tk.Label(self.root, text="ID와 비밀번호를 입력하고 로그인 버튼을 클릭하세요", 
                                   fg='#cccccc', bg='#1e1e1e',
                                   font=('맑은 고딕', 10))
        self.status_label.pack(pady=10)
        
        # Enter 키 바인딩
        self.password_entry.bind('<Return>', lambda e: self.start_login())
    
    def start_login(self):
        """로그인 시작"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("입력 오류", "사용자 ID와 비밀번호를 모두 입력해주세요.")
            return
        
        self.login_btn.config(state='disabled')
        self.status_label.config(text="로그인 중...")
        
        # 별도 스레드에서 로그인 실행
        threading.Thread(target=self.perform_login, args=(username, password), daemon=True).start()
    
    def perform_login(self, username, password):
        """로그인 수행"""
        try:
            # 1. 브라우저 시작
            self.root.after(0, lambda: self.status_label.config(text="브라우저 시작 중..."))
            
            options = Options()
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1280,720')
            
            self.driver = webdriver.Chrome(options=options)
            self.driver.implicitly_wait(3)  # 10초 → 3초로 단축
            
            # 2. 로그인 페이지 접속
            self.root.after(0, lambda: self.status_label.config(text="로그인 페이지 접속 중..."))
            
            self.driver.get(self.login_url)
            WebDriverWait(self.driver, 5).until(  # 10초 → 5초로 단축
                EC.presence_of_element_located((By.NAME, "user_id"))
            )
            
            # 3. 로그인 정보 입력
            self.root.after(0, lambda: self.status_label.config(text="로그인 정보 입력 중..."))
            
            user_id_field = self.driver.find_element(By.NAME, "user_id")
            user_id_field.clear()
            user_id_field.send_keys(username)
            
            password_field = self.driver.find_element(By.NAME, "user_pass")
            password_field.clear()
            password_field.send_keys(password)
            
            # 4. 로그인 버튼 클릭
            self.root.after(0, lambda: self.status_label.config(text="로그인 버튼 클릭 중..."))
            
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
                self.root.after(0, lambda: self.status_label.config(text="로그인 버튼을 찾을 수 없습니다"))
                self.root.after(0, lambda: self.login_btn.config(state='normal'))
                return
            
            # JavaScript로 빠른 클릭
            self.driver.execute_script("arguments[0].click();", login_button)
            time.sleep(1)  # 3초 → 1초로 단축
            
            # 5. 로그인 결과 확인
            current_url = self.driver.current_url
            
            if "loginok.asp" in current_url or current_url != self.login_url:
                # 로그인 성공
                self.root.after(0, lambda: self.status_label.config(text="✅ 로그인 성공! 브라우저에서 확인하세요"))
                self.root.after(0, lambda: self.login_btn.config(text="로그인 완료", state='disabled'))
                
                # 메인 페이지로 이동
                self.driver.get("https://attok.co.kr/")
                
                messagebox.showinfo("로그인 성공", "로그인이 완료되었습니다!\n브라우저에서 ATTOK 사이트를 확인하세요.")
                
            else:
                # 로그인 실패
                self.root.after(0, lambda: self.status_label.config(text="❌ 로그인 실패 - 아이디나 비밀번호를 확인해주세요"))
                self.root.after(0, lambda: self.login_btn.config(state='normal'))
                
        except Exception as e:
            error_msg = f"오류 발생: {str(e)}"
            self.root.after(0, lambda: self.status_label.config(text=error_msg))
            self.root.after(0, lambda: self.login_btn.config(state='normal'))
    
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
    app = AttokSimpleLogin(root)
    
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
    print("ATTOK 간단 로그인 시스템 시작")
    print("=" * 40)
    main()