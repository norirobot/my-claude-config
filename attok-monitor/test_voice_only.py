"""
음성 알림 기능만 단독 테스트
"""
import time
import winsound
import pyttsx3

def play_notification_sound(notification_type, student_name=None):
    """알림음 및 음성 알림 재생 함수"""
    try:
        if notification_type == "arrival":
            print(f"[테스트] {student_name} 등원 알림 시작")
            # 등원 알림음 (높은 톤, 짧게 2번)
            winsound.Beep(800, 200)
            time.sleep(0.1)
            winsound.Beep(1000, 200)
            
            # 음성 알림 추가 (이름 → 1.5초 쉬기 → "등원")
            if student_name:
                print(f"[테스트] TTS 엔진 초기화 - 이름 부분")
                engine = pyttsx3.init()
                engine.setProperty('rate', 100)  # 더 천천히
                engine.setProperty('volume', 1.0)  # 최대 볼륨
                print(f"[테스트] '{student_name}' 음성 재생 시작")
                engine.say(student_name)  # 이름만 먼저
                engine.runAndWait()
                engine.stop()
                print(f"[테스트] '{student_name}' 음성 재생 완료, 1.5초 대기 시작")
                time.sleep(1.5)  # 1.5초 쉬기
                
                print(f"[테스트] TTS 엔진 재초기화 - 등원 부분")
                engine = pyttsx3.init()
                engine.setProperty('rate', 100)  # 더 천천히
                engine.setProperty('volume', 1.0)  # 최대 볼륨
                print(f"[테스트] '등원' 음성 재생 시작")
                engine.say("등원")  # "등원"만 따로
                engine.runAndWait()
                engine.stop()
                print(f"[테스트] '등원' 음성 재생 완료")
                
        elif notification_type == "departure":
            print(f"[테스트] {student_name} 하원 알림 시작")
            # 하원 알림음 (낮은 톤, 길게 1번)
            winsound.Beep(600, 400)
            
            # 음성 알림 추가 (이름 → 1.5초 쉬기 → "하원")
            if student_name:
                print(f"[테스트] TTS 엔진 초기화 - 이름 부분")
                engine = pyttsx3.init()
                engine.setProperty('rate', 100)  # 더 천천히
                engine.setProperty('volume', 1.0)  # 최대 볼륨
                print(f"[테스트] '{student_name}' 음성 재생 시작")
                engine.say(student_name)  # 이름만 먼저
                engine.runAndWait()
                engine.stop()
                print(f"[테스트] '{student_name}' 음성 재생 완료, 1.5초 대기 시작")
                time.sleep(1.5)  # 1.5초 쉬기
                
                print(f"[테스트] TTS 엔진 재초기화 - 하원 부분")
                engine = pyttsx3.init()
                engine.setProperty('rate', 100)  # 더 천천히
                engine.setProperty('volume', 1.0)  # 최대 볼륨
                print(f"[테스트] '하원' 음성 재생 시작")
                engine.say("하원")  # "하원"만 따로
                engine.runAndWait()
                engine.stop()
                print(f"[테스트] '하원' 음성 재생 완료")
                
        print(f"[테스트] {notification_type} 알림 완료")
                
    except Exception as e:
        print(f"[테스트] 알림 중 오류 발생: {e}")

if __name__ == "__main__":
    print("=== 음성 알림 단독 테스트 시작 ===")
    
    print("\n1. 등원 알림 테스트 (홍길동)")
    play_notification_sound("arrival", "홍길동")
    
    print("\n잠시 대기...")
    time.sleep(3)
    
    print("\n2. 하원 알림 테스트 (홍길동)")
    play_notification_sound("departure", "홍길동")
    
    print("\n=== 모든 테스트 완료 ===")