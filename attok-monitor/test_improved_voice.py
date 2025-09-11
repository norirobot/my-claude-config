"""
잡음 더 개선되고 속도 느려진 음성 테스트
"""
import time
import winsound
import pyttsx3

def play_notification_sound(notification_type, student_name=None):
    """잡음 더 개선되고 속도 느려진 음성 알림 재생 함수"""
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
                engine.setProperty('rate', 120)  # 좀 더 천천히 (150→120)
                engine.setProperty('volume', 0.8)  # 볼륨 더 낮춤 (잡음 더 감소)
                
                # 음성 품질 개선을 위한 voice 설정
                voices = engine.getProperty('voices')
                if voices and len(voices) > 1:
                    # 두 번째 음성 시도 (첫 번째가 잡음 있을 수 있음)
                    engine.setProperty('voice', voices[1].id)
                    print(f"[테스트] 사용 중인 음성 (2번째): {voices[1].name}")
                elif voices:
                    engine.setProperty('voice', voices[0].id)
                    print(f"[테스트] 사용 중인 음성 (1번째): {voices[0].name}")
                
                # 전체 메시지를 하나로 구성 (자연스러운 간격)
                full_message = f"{student_name} 등원"
                print(f"[테스트] 개선된 음성 재생 (속도 120, 볼륨 0.8): '{full_message}'")
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
                engine.setProperty('rate', 120)  # 좀 더 천천히 (150→120)
                engine.setProperty('volume', 0.8)  # 볼륨 더 낮춤 (잡음 더 감소)
                
                # 음성 품질 개선을 위한 voice 설정
                voices = engine.getProperty('voices')
                if voices and len(voices) > 1:
                    # 두 번째 음성 시도 (첫 번째가 잡음 있을 수 있음)
                    engine.setProperty('voice', voices[1].id)
                    print(f"[테스트] 사용 중인 음성 (2번째): {voices[1].name}")
                elif voices:
                    engine.setProperty('voice', voices[0].id)
                    print(f"[테스트] 사용 중인 음성 (1번째): {voices[0].name}")
                
                # 전체 메시지를 하나로 구성 (자연스러운 간격)
                full_message = f"{student_name} 하원"
                print(f"[테스트] 개선된 음성 재생 (속도 120, 볼륨 0.8): '{full_message}'")
                engine.say(full_message)
                engine.runAndWait()
                
                # 엔진 정리
                try:
                    engine.stop()
                except:
                    pass
                    
    except Exception as e:
        print(f"[오류] 음성 알림 실패: {e}")

# 사용 가능한 모든 음성 확인
def list_available_voices():
    """시스템에서 사용 가능한 모든 음성 목록 확인"""
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        print("=== 사용 가능한 음성 목록 ===")
        for i, voice in enumerate(voices):
            print(f"{i+1}. {voice.name} (ID: {voice.id})")
        engine.stop()
        return voices
    except Exception as e:
        print(f"음성 목록 확인 실패: {e}")
        return []

if __name__ == "__main__":
    print("=== 잡음 더 개선된 음성 테스트 시작 ===")
    
    # 먼저 사용 가능한 음성 확인
    list_available_voices()
    
    print("\n1. 등원 알림 테스트 (홍길동) - 개선된 음성 (속도 120, 볼륨 0.8)")
    play_notification_sound("arrival", "홍길동")
    
    print("\n잠시 대기...")
    time.sleep(3)
    
    print("\n2. 하원 알림 테스트 (홍길동) - 개선된 음성 (속도 120, 볼륨 0.8)")
    play_notification_sound("departure", "홍길동")
    
    print("\n=== 모든 테스트 완료 ===")