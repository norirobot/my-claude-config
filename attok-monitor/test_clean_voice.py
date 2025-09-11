"""
잡음 개선된 고품질 음성 테스트
"""
import time
import winsound
import pyttsx3

def play_notification_sound(notification_type, student_name=None):
    """잡음 개선된 고품질 음성 알림 재생 함수"""
    try:
        if notification_type == "arrival":
            # 등원 알림음 (높은 톤, 짧게 2번)
            winsound.Beep(800, 200)
            time.sleep(0.1)
            winsound.Beep(1000, 200)
            
            # 음성 알림 추가
            if student_name:
                # 하나의 엔진으로 연속 재생 (엔진 재생성 문제 해결)
                engine = pyttsx3.init()
                engine.setProperty('rate', 150)  # 자연스러운 속도
                engine.setProperty('volume', 0.9)  # 볼륨 약간 낮춤 (잡음 감소)
                
                # 음성 품질 개선을 위한 voice 설정
                voices = engine.getProperty('voices')
                if voices:
                    # 첫 번째 음성으로 설정 (보통 기본 품질이 좋음)
                    engine.setProperty('voice', voices[0].id)
                    print(f"[테스트] 사용 중인 음성: {voices[0].name}")
                
                # 전체 메시지를 하나로 구성 (자연스러운 간격)
                full_message = f"{student_name} 등원"
                print(f"[테스트] 고품질 음성 재생: '{full_message}'")
                engine.say(full_message)
                engine.runAndWait()
                
                # 엔진 정리
                try:
                    engine.stop()
                except:
                    pass
                
        elif notification_type == "departure":
            # 하원 알림음 (낮은 톤, 길게 1번)
            winsound.Beep(600, 400)
            
            # 음성 알림 추가
            if student_name:
                # 하나의 엔진으로 연속 재생 (엔진 재생성 문제 해결)
                engine = pyttsx3.init()
                engine.setProperty('rate', 150)  # 자연스러운 속도
                engine.setProperty('volume', 0.9)  # 볼륨 약간 낮춤 (잡음 감소)
                
                # 음성 품질 개선을 위한 voice 설정
                voices = engine.getProperty('voices')
                if voices:
                    # 첫 번째 음성으로 설정 (보통 기본 품질이 좋음)
                    engine.setProperty('voice', voices[0].id)
                    print(f"[테스트] 사용 중인 음성: {voices[0].name}")
                
                # 전체 메시지를 하나로 구성 (자연스러운 간격)
                full_message = f"{student_name} 하원"
                print(f"[테스트] 고품질 음성 재생: '{full_message}'")
                engine.say(full_message)
                engine.runAndWait()
                
                # 엔진 정리
                try:
                    engine.stop()
                except:
                    pass
                    
    except Exception as e:
        print(f"[오류] 음성 알림 실패: {e}")

if __name__ == "__main__":
    print("=== 잡음 개선된 고품질 음성 테스트 시작 ===")
    
    print("\n1. 등원 알림 테스트 (홍길동) - 고품질 음성")
    play_notification_sound("arrival", "홍길동")
    
    print("\n잠시 대기...")
    time.sleep(3)
    
    print("\n2. 하원 알림 테스트 (홍길동) - 고품질 음성")
    play_notification_sound("departure", "홍길동")
    
    print("\n=== 모든 테스트 완료 ===")