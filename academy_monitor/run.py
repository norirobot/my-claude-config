"""
메인 실행 파일 - 트레이 기능 포함
"""
import sys
import os
import logging
from tkinter import messagebox

# 현재 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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

def main():
    """메인 함수"""
    try:
        # GUI와 시스템 트레이 통합 실행
        from gui import AcademyMonitorGUI
        from system_tray import TrayIntegratedGUI
        
        logger.info("학원 출결 모니터링 시스템 시작 (트레이 기능 포함)")
        
        # 트레이 통합 GUI 실행
        app = TrayIntegratedGUI(AcademyMonitorGUI)
        app.run()
        
    except ImportError as e:
        error_msg = f"필요한 모듈을 찾을 수 없습니다: {e}\n\n다음 명령어를 실행하세요:\npip install pystray pillow"
        logger.error(error_msg)
        messagebox.showerror("모듈 오류", error_msg)
        
    except Exception as e:
        error_msg = f"애플리케이션 실행 중 오류가 발생했습니다: {e}"
        logger.error(error_msg)
        messagebox.showerror("실행 오류", error_msg)
        
    finally:
        logger.info("애플리케이션 종료")

if __name__ == "__main__":
    main()