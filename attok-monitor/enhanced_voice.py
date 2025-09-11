"""
더 자연스러운 음성을 위한 개선된 TTS
Azure 없이도 기존보다 훨씬 자연스럽게
"""
import time
import winsound
import pyttsx3

def play_notification_sound_enhanced(notification_type, student_name=None):
    """향상된 자연스러운 음성 알림"""
    try:
        if notification_type == "arrival":
            # 등원 알림음
            winsound.Beep(800, 200)
            time.sleep(0.1)
            winsound.Beep(1000, 200)
            
            if student_name:
                speak_naturally(f"{student_name}님, 등원하셨습니다.")
                
        elif notification_type == "departure":
            # 하원 알림음
            winsound.Beep(600, 400)
            
            if student_name:
                speak_naturally(f"{student_name}님, 하원하셨습니다.")
                
    except Exception as e:
        print(f"[오류] 음성 알림 실패: {e}")

def speak_naturally(text):
    """더 자연스러운 음성으로 말하기"""
    try:
        engine = pyttsx3.init()
        
        # 더 자연스러운 설정
        engine.setProperty('rate', 90)    # 더 천천히 (100→90)
        engine.setProperty('volume', 0.9) # 볼륨 약간 높임
        
        # 모든 음성 확인하여 가장 좋은 것 선택
        voices = engine.getProperty('voices')
        if voices:
            # 한국어 음성 우선
            korean_voice = None
            for voice in voices:
                if 'KO-KR' in voice.id or 'HEAMI' in voice.id:
                    korean_voice = voice
                    break
            
            if korean_voice:
                engine.setProperty('voice', korean_voice.id)
            else:
                # 한국어가 없으면 첫 번째
                engine.setProperty('voice', voices[0].id)
        
        # 더 자연스러운 발음을 위한 텍스트 가공
        enhanced_text = enhance_pronunciation(text)
        
        print(f"[향상] 자연스러운 음성 재생: '{enhanced_text}'")
        engine.say(enhanced_text)
        engine.runAndWait()
        
        try:
            engine.stop()
        except:
            pass
            
    except Exception as e:
        print(f"[오류] 자연스러운 음성 실패: {e}")

def enhance_pronunciation(text):
    """발음을 더 자연스럽게 개선하는 함수"""
    # 한국어 TTS가 더 자연스럽게 읽도록 조정
    enhanced = text
    
    # 쉼표 후 간격 추가 (더 자연스러운 호흡)
    enhanced = enhanced.replace(',', ', ')
    enhanced = enhanced.replace('님,', '님~')  # "님" 뒤에 자연스러운 억양
    
    # 존댓말 어미를 더 자연스럽게
    enhanced = enhanced.replace('하셨습니다', '하셨습니다~')
    
    # 이름 뒤에 약간의 강조
    if '님' in enhanced:
        # 이름을 강조하여 더 또렷하게
        enhanced = enhanced.replace('님~', ' 님~')
    
    return enhanced

def test_enhanced_voice():
    """향상된 음성 테스트"""
    print("=== 향상된 자연스러운 음성 테스트 ===")
    
    test_names = ["홍길동", "김영희", "박철수"]
    
    for name in test_names:
        print(f"\n{name} 등원 테스트:")
        speak_naturally(f"{name}님, 등원하셨습니다.")
        time.sleep(2)
        
        print(f"{name} 하원 테스트:")
        speak_naturally(f"{name}님, 하원하셨습니다.")
        time.sleep(2)
    
    print("\n=== 테스트 완료 ===")

if __name__ == "__main__":
    print("더 자연스러운 음성으로 개선")
    print("Azure 없이도 기존보다 훨씬 자연스럽게!")
    
    test_enhanced_voice()