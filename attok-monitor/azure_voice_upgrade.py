"""
Azure 고품질 음성으로 업그레이드된 알림 함수
기존 시스템은 그대로, 음성만 교체
"""
import time
import winsound
import pyttsx3

# Azure TTS를 사용할지 결정하는 플래그
USE_AZURE_TTS = False  # True로 변경하면 Azure 사용

# Azure 설정 (실제 사용 시 입력 필요)
AZURE_SPEECH_KEY = "YOUR_KEY_HERE"  # Azure Speech Service 키
AZURE_REGION = "koreacentral"       # 서울 리전

def play_notification_sound_upgraded(notification_type, student_name=None):
    """업그레이드된 음성 알림 함수 (Azure TTS + 기존 TTS fallback)"""
    try:
        if notification_type == "arrival":
            # 등원 알림음 (기존과 동일)
            winsound.Beep(800, 200)
            time.sleep(0.1)
            winsound.Beep(1000, 200)
            
            if student_name:
                message = f"{student_name}님, 등원하셨습니다."
                
                # Azure TTS 시도
                if USE_AZURE_TTS and azure_speak(message):
                    print(f"[Azure] 고품질 음성 재생: '{message}'")
                else:
                    # 실패시 기존 TTS 사용
                    fallback_speak(message)
                    print(f"[기존] 음성 재생: '{message}'")
                
        elif notification_type == "departure":
            # 하원 알림음 (기존과 동일)
            winsound.Beep(600, 400)
            
            if student_name:
                message = f"{student_name}님, 하원하셨습니다."
                
                # Azure TTS 시도
                if USE_AZURE_TTS and azure_speak(message):
                    print(f"[Azure] 고품질 음성 재생: '{message}'")
                else:
                    # 실패시 기존 TTS 사용
                    fallback_speak(message)
                    print(f"[기존] 음성 재생: '{message}'")
                    
    except Exception as e:
        print(f"[오류] 음성 알림 실패: {e}")

def azure_speak(text):
    """Azure 고품질 음성 재생"""
    try:
        import azure.cognitiveservices.speech as speechsdk
        
        # Azure 키가 설정되지 않으면 False 반환
        if AZURE_SPEECH_KEY == "YOUR_KEY_HERE":
            return False
            
        # Speech 설정
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY, 
            region=AZURE_REGION
        )
        
        # 가장 자연스러운 한국어 여성 음성 선택
        speech_config.speech_synthesis_voice_name = "ko-KR-SunHiNeural"
        
        # SSML로 더 자연스럽게 조절
        ssml_text = f"""
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ko-KR">
            <voice name="ko-KR-SunHiNeural">
                <prosody rate="0.85" pitch="+2%">
                    {text}
                </prosody>
            </voice>
        </speak>
        """
        
        # 음성 합성 및 재생
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
        result = synthesizer.speak_ssml_async(ssml_text).get()
        
        return result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted
        
    except Exception as e:
        print(f"[Azure 오류] {e}")
        return False

def fallback_speak(text):
    """기존 Windows TTS (fallback)"""
    try:
        engine = pyttsx3.init()
        engine.setProperty('rate', 100)
        engine.setProperty('volume', 0.8)
        
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
        
        engine.say(text)
        engine.runAndWait()
        
        try:
            engine.stop()
        except:
            pass
            
    except Exception as e:
        print(f"[Fallback 오류] {e}")

def test_voice_comparison():
    """음성 품질 비교 테스트"""
    test_name = "홍길동"
    
    print("=== 음성 품질 비교 테스트 ===")
    
    print("\n1. 기존 Windows TTS:")
    fallback_speak(f"{test_name}님, 등원하셨습니다.")
    
    time.sleep(2)
    
    print("\n2. Azure TTS (데모 - 키 필요):")
    if azure_speak(f"{test_name}님, 등원하셨습니다."):
        print("Azure 음성 재생 완료!")
    else:
        print("Azure 키가 설정되지 않음. 설정 후 사용 가능")
    
    print("\n=== 비교 완료 ===")

if __name__ == "__main__":
    print("=== 업그레이드된 음성 시스템 테스트 ===")
    
    # 현재는 기존 TTS 사용
    print("현재 설정: 기존 Windows TTS 사용")
    test_voice_comparison()
    
    print("\n=== Azure 설정 방법 ===")
    print("1. https://portal.azure.com 접속")
    print("2. Speech Service 리소스 생성")
    print("3. 키와 지역 복사")
    print("4. 이 파일에서 AZURE_SPEECH_KEY와 AZURE_REGION 수정")
    print("5. USE_AZURE_TTS = True로 변경")
    print("6. 기존 시스템에 적용")
    
    print("\n월 50만 문자 무료, 신용카드 등록 필요하지만 무료 한도 내 과금 없음")