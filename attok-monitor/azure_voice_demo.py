"""
Azure Cognitive Services 음성 데모
- 매우 자연스러운 한국어 음성
- 감정 표현 가능
- 월 50만 문자 무료
"""
import time
import winsound

def demo_azure_install():
    """Azure Speech SDK 설치 안내"""
    print("=== Azure 고품질 음성 설치 방법 ===")
    print()
    print("1. Azure Speech SDK 설치:")
    print("   pip install azure-cognitiveservices-speech")
    print()
    print("2. Azure 무료 계정 생성:")
    print("   - https://azure.microsoft.com/ko-kr/free/ 접속")
    print("   - 월 50만 문자 무료 사용 가능")
    print("   - 신용카드 등록 필요하지만 무료 한도 내에서는 과금 없음")
    print()
    print("3. Speech Service 리소스 생성:")
    print("   - Azure Portal에서 Speech Service 생성")
    print("   - 키와 지역 정보 복사")
    print()
    print("4. 사용 가능한 한국어 음성:")
    print("   - ko-KR-SunHiNeural (여성, 매우 자연스러움)")
    print("   - ko-KR-InJoonNeural (남성, 매우 자연스러움)")
    print("   - ko-KR-BongJinNeural (남성)")
    print("   - ko-KR-GookMinNeural (남성)")
    print("   - ko-KR-JiMinNeural (여성)")
    print("   - ko-KR-SeoHyeonNeural (여성)")
    print("   - ko-KR-SoonBokNeural (여성)")
    print("   - ko-KR-YuJinNeural (여성)")
    print()
    print("5. 품질 비교:")
    print("   - 현재 Windows TTS: 기계음 (★★☆☆☆)")
    print("   - Azure Neural TTS: 거의 사람 수준 (★★★★★)")

def create_azure_version():
    """Azure 버전의 음성 알림 함수 예시 코드 생성"""
    azure_code = '''
"""
Azure Cognitive Services 기반 고품질 음성 알림
"""
import azure.cognitiveservices.speech as speechsdk
import time
import winsound

# Azure 설정 (실제 키와 지역으로 교체 필요)
AZURE_SPEECH_KEY = "YOUR_SPEECH_KEY_HERE"
AZURE_REGION = "koreacentral"  # 또는 다른 지역

def play_azure_notification(notification_type, student_name=None):
    """Azure 고품질 음성 알림"""
    try:
        if notification_type == "arrival":
            # 등원 알림음
            winsound.Beep(800, 200)
            time.sleep(0.1)
            winsound.Beep(1000, 200)
            
            if student_name:
                # Azure Speech 설정
                speech_config = speechsdk.SpeechConfig(
                    subscription=AZURE_SPEECH_KEY, 
                    region=AZURE_REGION
                )
                
                # 고품질 한국어 음성 선택
                speech_config.speech_synthesis_voice_name = "ko-KR-SunHiNeural"
                
                # 음성 속도와 톤 조절 (SSML 사용)
                text = f"""
                <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ko-KR">
                    <voice name="ko-KR-SunHiNeural">
                        <prosody rate="0.9" pitch="+5%">
                            {student_name}님, 등원하셨습니다.
                        </prosody>
                    </voice>
                </speak>
                """
                
                # 음성 합성 및 재생
                synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
                result = synthesizer.speak_ssml_async(text).get()
                
        elif notification_type == "departure":
            # 하원 알림음
            winsound.Beep(600, 400)
            
            if student_name:
                speech_config = speechsdk.SpeechConfig(
                    subscription=AZURE_SPEECH_KEY, 
                    region=AZURE_REGION
                )
                speech_config.speech_synthesis_voice_name = "ko-KR-SunHiNeural"
                
                text = f"""
                <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ko-KR">
                    <voice name="ko-KR-SunHiNeural">
                        <prosody rate="0.9" pitch="+3%">
                            {student_name}님, 하원하셨습니다.
                        </prosody>
                    </voice>
                </speak>
                """
                
                synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
                result = synthesizer.speak_ssml_async(text).get()
                
    except Exception as e:
        print(f"Azure 음성 알림 실패: {e}")
        # 실패 시 기존 TTS로 fallback
        import pyttsx3
        engine = pyttsx3.init()
        engine.say(f"{student_name}님")
        engine.runAndWait()
'''
    
    with open(r"C:\Users\sintt\attok-monitor\azure_voice_example.py", "w", encoding="utf-8") as f:
        f.write(azure_code)
    
    print("\n=== Azure 버전 예시 코드 생성 완료 ===")
    print("파일: C:\\Users\\sintt\\attok-monitor\\azure_voice_example.py")

if __name__ == "__main__":
    print("🎯 더 자연스러운 음성을 위한 Azure TTS 안내")
    print()
    
    demo_azure_install()
    create_azure_version()
    
    print()
    print("=== 결론 ===")
    print("✅ 현재 Windows TTS는 최대한 개선했습니다")
    print("✅ 진짜 네이티브급 음성을 원하시면 Azure TTS 추천!")
    print("✅ 월 50만 문자 무료로 충분히 사용 가능")
    print("✅ 설치 후 기존 코드 5줄만 교체하면 적용 완료")
    
    print()
    print("🤔 Azure 설치를 원하시면 말씀해주세요!")
    print("   현재 시스템을 Azure 버전으로 업그레이드해드리겠습니다.")