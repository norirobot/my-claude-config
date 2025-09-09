"""
기본 기능 테스트 스크립트
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from models import Student, StudentStatus
from datetime import datetime, timedelta
from alert_system import AlertSystem
import tkinter as tk

def test_student_model():
    """Student 모델 테스트"""
    print("=== Student 모델 테스트 ===")
    
    # 학생 생성
    student = Student(name="김철수", student_id="student_001")
    print(f"학생 생성: {student.name} (상태: {student.status.value})")
    
    # 수업 시작
    student.start_class()
    print(f"수업 시작: {student.check_in_time}")
    print(f"예상 종료: {student.end_time}")
    print(f"현재 상태: {student.status.value}")
    
    # 남은 시간 확인
    remaining = student.get_remaining_time()
    if remaining:
        print(f"남은 시간: {remaining}")
    
    # 시간 연장
    student.extend_time(30)
    print(f"30분 연장 후 종료 시간: {student.end_time}")
    
    # 수업 종료
    student.end_class()
    print(f"수업 종료 상태: {student.status.value}")
    
    print("Student 모델 테스트 완료!\n")

def test_alert_system():
    """알림 시스템 테스트"""
    print("=== 알림 시스템 테스트 ===")
    
    # 테스트용 Tkinter 루트 생성
    root = tk.Tk()
    root.withdraw()  # 창 숨기기
    
    alert_system = AlertSystem(root)
    
    print("소리 알림 테스트...")
    alert_system.play_sound(duration=500)
    
    print("팝업 알림 테스트...")
    alert_system.show_popup("테스트", "이것은 테스트 메시지입니다.", auto_close=2)
    
    print("통합 알림 테스트...")
    alert_system.send_alert("테스트 학생", "종료")
    
    # 잠깐 대기 후 창 정리
    root.after(3000, root.quit)
    root.mainloop()
    root.destroy()
    
    print("알림 시스템 테스트 완료!\n")

def test_config():
    """설정 파일 테스트"""
    print("=== 설정 파일 테스트 ===")
    
    import config
    
    print(f"기본 수업 시간: {config.DEFAULT_CLASS_DURATION}")
    print(f"체크 간격: {config.CHECK_INTERVAL}초")
    print(f"창 크기: {config.WINDOW_WIDTH}x{config.WINDOW_HEIGHT}")
    print(f"Attok URL: {config.ATTOK_URL}")
    
    # 디렉토리 존재 확인
    for dir_name, dir_path in [
        ("데이터", config.DATA_DIR),
        ("로그", config.LOGS_DIR),
        ("사운드", config.SOUNDS_DIR)
    ]:
        if os.path.exists(dir_path):
            print(f"{dir_name} 디렉토리 존재: {dir_path}")
        else:
            print(f"X {dir_name} 디렉토리 없음: {dir_path}")
    
    print("설정 파일 테스트 완료!\n")

def test_imports():
    """필수 라이브러리 Import 테스트"""
    print("=== 라이브러리 Import 테스트 ===")
    
    try:
        import selenium
        print("O Selenium 설치됨")
        
        from selenium import webdriver
        print("O Selenium webdriver 사용 가능")
        
        from webdriver_manager.chrome import ChromeDriverManager
        print("O ChromeDriverManager 사용 가능")
        
        import tkinter as tk
        print("O Tkinter 사용 가능")
        
        import winsound
        print("O winsound (Windows 알림) 사용 가능")
        
        print("모든 필수 라이브러리가 정상적으로 설치되어 있습니다!")
        
    except ImportError as e:
        print(f"X 라이브러리 Import 실패: {e}")
        print("pip install -r requirements.txt 명령어를 실행해주세요.")
        return False
    
    print("라이브러리 테스트 완료!\n")
    return True

def main():
    """메인 테스트 함수"""
    print("학원 출결 모니터링 시스템 - 기본 기능 테스트\n")
    
    # 1. 라이브러리 테스트
    if not test_imports():
        print("X 라이브러리 테스트 실패 - 테스트 중단")
        return
    
    # 2. 설정 테스트
    test_config()
    
    # 3. 모델 테스트  
    test_student_model()
    
    # 4. 알림 시스템 테스트
    try:
        test_alert_system()
    except Exception as e:
        print(f"알림 시스템 테스트 중 오류: {e}")
    
    print("모든 기본 테스트가 완료되었습니다!")
    print("\n다음 단계:")
    print("1. python main.py - 메인 애플리케이션 실행")
    print("2. 'Attok 로그인' 버튼으로 실제 테스트")

if __name__ == "__main__":
    main()