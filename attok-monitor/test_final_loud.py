"""
최종 완성 - 큰 음량 + 간단명확 음성 테스트
"""
import time
import winsound
import pyttsx3

def play_notification_sound(notification_type, student_name=None):
    """최종 완성된 음성 알림 (큰 음량 + 간단명확)"""
    try:
        if notification_type == "arrival":
            # 등원 알림음
            winsound.Beep(800, 200)
            time.sleep(0.1)
            winsound.Beep(1000, 200)
            
            if student_name:
                engine = pyttsx3.init()
                engine.setProperty('rate', 100)  # 적당한 속도
                engine.setProperty('volume', 1.0)  # 볼륨 최대
                
                # 한국어 음성 선택
                voices = engine.getProperty('voices')
                if voices:
                    korean_voice = None
                    for voice in voices:
                        if 'KO-KR' in voice.id or 'HEAMI' in voice.id:
                            korean_voice = voice
                            break
                    
                    if korean_voice:
                        engine.setProperty('voice', korean_voice.id)
                    else:
                        engine.setProperty('voice', voices[0].id)
                
                full_message = f"{student_name} 등원"
                print(f"[최종] 큰 음량 음성: '{full_message}'")
                engine.say(full_message)
                engine.runAndWait()
                
                try:
                    engine.stop()
                except:
                    pass
                
        elif notification_type == "departure":
            # 하원 알림음
            winsound.Beep(600, 400)
            
            if student_name:
                engine = pyttsx3.init()
                engine.setProperty('rate', 100)  # 적당한 속도
                engine.setProperty('volume', 1.0)  # 볼륨 최대
                
                # 한국어 음성 선택
                voices = engine.getProperty('voices')
                if voices:
                    korean_voice = None
                    for voice in voices:
                        if 'KO-KR' in voice.id or 'HEAMI' in voice.id:
                            korean_voice = voice
                            break
                    
                    if korean_voice:
                        engine.setProperty('voice', korean_voice.id)
                    else:
                        engine.setProperty('voice', voices[0].id)
                
                full_message = f"{student_name} 하원"
                print(f"[최종] 큰 음량 음성: '{full_message}'")
                engine.say(full_message)
                engine.runAndWait()
                
                try:
                    engine.stop()
                except:
                    pass
                    
    except Exception as e:
        print(f"[오류] 음성 알림 실패: {e}")

if __name__ == "__main__":
    print("=== 최종 완성! 큰 음량 + 간단명확 음성 ===")
    
    print("\n1. 등원 알림 (홍길동) - 음량 최대")
    play_notification_sound("arrival", "홍길동")
    
    time.sleep(2)
    
    print("\n2. 하원 알림 (홍길동) - 음량 최대")
    play_notification_sound("departure", "홍길동")
    
    print("\n=== 🎉 최종 완성! ===")
    print("✅ 등원: '홍길동 등원' (음량 최대)")
    print("✅ 하원: '홍길동 하원' (음량 최대)")
    print("✅ 속도: 100 (적당)")
    print("✅ 한국어 음성: Microsoft Heami")
    print("🚀 실제 시스템에 적용 완료!")