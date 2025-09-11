"""
한국어 음성 강제 선택 + 속도 느리게 + 잡음 감소 테스트
"""
import time
import winsound
import pyttsx3

def play_notification_sound(notification_type, student_name=None):
    """최종 개선된 한국어 음성 알림 재생 함수"""
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
                
                # 음성 품질 개선을 위한 voice 설정 (한국어 음성 강제 선택)
                voices = engine.getProperty('voices')
                if voices:
                    # 한국어 음성 우선 찾기 (Heami)
                    korean_voice = None
                    for voice in voices:
                        if 'KO-KR' in voice.id or 'HEAMI' in voice.id:
                            korean_voice = voice
                            break
                    
                    if korean_voice:
                        engine.setProperty('voice', korean_voice.id)
                        print(f"[테스트] 한국어 음성 사용: {korean_voice.name}")
                    else:
                        # 한국어 음성이 없으면 첫 번째 사용
                        engine.setProperty('voice', voices[0].id)
                        print(f"[테스트] 기본 음성 사용: {voices[0].name}")
                
                # 전체 메시지를 하나로 구성 (자연스러운 간격)
                full_message = f"{student_name} 등원"
                print(f"[테스트] 최종 음성 재생 (속도 120, 볼륨 0.8, 한국어): '{full_message}'")
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
                
                # 음성 품질 개선을 위한 voice 설정 (한국어 음성 강제 선택)
                voices = engine.getProperty('voices')
                if voices:
                    # 한국어 음성 우선 찾기 (Heami)
                    korean_voice = None
                    for voice in voices:
                        if 'KO-KR' in voice.id or 'HEAMI' in voice.id:
                            korean_voice = voice
                            break
                    
                    if korean_voice:
                        engine.setProperty('voice', korean_voice.id)
                        print(f"[테스트] 한국어 음성 사용: {korean_voice.name}")
                    else:
                        # 한국어 음성이 없으면 첫 번째 사용
                        engine.setProperty('voice', voices[0].id)
                        print(f"[테스트] 기본 음성 사용: {voices[0].name}")
                
                # 전체 메시지를 하나로 구성 (자연스러운 간격)
                full_message = f"{student_name} 하원"
                print(f"[테스트] 최종 음성 재생 (속도 120, 볼륨 0.8, 한국어): '{full_message}'")
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
    print("=== 최종 개선된 한국어 음성 테스트 시작 ===")
    
    print("\n1. 등원 알림 테스트 (홍길동) - 한국어 음성 + 속도 120 + 볼륨 0.8")
    play_notification_sound("arrival", "홍길동")
    
    print("\n잠시 대기...")
    time.sleep(3)
    
    print("\n2. 하원 알림 테스트 (홍길동) - 한국어 음성 + 속도 120 + 볼륨 0.8")
    play_notification_sound("departure", "홍길동")
    
    print("\n=== 모든 테스트 완료 ===")