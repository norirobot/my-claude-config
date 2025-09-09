"""
메인 애플리케이션 엔트리포인트
"""
import sys
import os
import tkinter as tk
from tkinter import messagebox
import threading
import time
import logging
from datetime import datetime

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join('logs', 'app.log')),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class AcademyMonitorApp:
    """메인 애플리케이션 클래스"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.gui = None
        self.alert_system = None
        self.timer_manager = None
        
        # 시작 시 체크
        self.check_dependencies()
        
    def check_dependencies(self):
        """의존성 체크"""
        try:
            import selenium
            import webdriver_manager
            logger.info("모든 의존성이 설치되어 있습니다.")
        except ImportError as e:
            messagebox.showerror(
                "의존성 오류",
                f"필요한 패키지가 설치되지 않았습니다:\\n{e}\\n\\n"
                "pip install -r requirements.txt 명령어를 실행해주세요."
            )
            sys.exit(1)
            
    def initialize_components(self):
        """컴포넌트 초기화"""
        from gui import AcademyMonitorGUI
        from alert_system import AlertSystem, TimerManager
        
        # GUI 초기화
        self.gui = AcademyMonitorGUI()
        
        # 알림 시스템 초기화
        self.alert_system = AlertSystem(self.gui.root)
        
        # 타이머 관리자 초기화
        self.timer_manager = TimerManager(self.alert_system)
        
        # 알림 체크 스레드 시작
        self.start_alert_checker()
        
    def start_alert_checker(self):
        """알림 체크 스레드 시작"""
        def alert_checker():
            while True:
                try:
                    if self.gui and self.gui.students:
                        self.timer_manager.check_alerts(self.gui.students)
                    time.sleep(30)  # 30초마다 체크
                except Exception as e:
                    logger.error(f"알림 체크 오류: {e}")
                    time.sleep(30)
                    
        alert_thread = threading.Thread(target=alert_checker, daemon=True)
        alert_thread.start()
        logger.info("알림 체크 시스템 시작")
        
    def run(self):
        """애플리케이션 실행"""
        try:
            self.initialize_components()
            logger.info("학원 출결 모니터링 시스템 시작")
            
            # GUI 실행
            self.gui.run()
            
        except Exception as e:
            logger.error(f"애플리케이션 실행 오류: {e}")
            messagebox.showerror("오류", f"애플리케이션 실행 중 오류가 발생했습니다:\\n{e}")
            
        finally:
            self.cleanup()
            
    def cleanup(self):
        """정리 작업"""
        try:
            if self.gui and self.gui.monitor:
                self.gui.monitor.stop()
            logger.info("애플리케이션 정리 완료")
        except Exception as e:
            logger.error(f"정리 작업 오류: {e}")

if __name__ == "__main__":
    try:
        app = AcademyMonitorApp()
        app.run()
    except KeyboardInterrupt:
        logger.info("사용자에 의한 프로그램 종료")
    except Exception as e:
        logger.error(f"예상치 못한 오류: {e}")
        messagebox.showerror("치명적 오류", str(e))