"""
다양한 음성 엔진 옵션 테스트
"""
import time
import winsound
import pyttsx3

def test_all_available_voices():
    """시스템에서 사용 가능한 모든 음성 테스트"""
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        
        print("=== 사용 가능한 모든 음성 테스트 ===")
        test_message = "홍길동님, 등원하셨습니다."
        
        for i, voice in enumerate(voices):
            print(f"\n{i+1}. {voice.name}")
            print(f"   ID: {voice.id}")
            print(f"   언어: {voice.languages}")
            
            try:
                engine.setProperty('voice', voice.id)
                engine.setProperty('rate', 100)
                engine.setProperty('volume', 0.8)
                
                print(f"   재생 중: '{test_message}'")
                engine.say(test_message)
                engine.runAndWait()
                
                time.sleep(2)  # 음성 간 간격
                
            except Exception as e:
                print(f"   오류: {e}")
        
        engine.stop()
        
    except Exception as e:
        print(f"음성 테스트 실패: {e}")

def check_sapi_voices():
    """Windows SAPI 음성 상세 정보 확인"""
    try:
        import winreg
        
        print("\n=== Windows SAPI 음성 레지스트리 정보 ===")
        
        # SAPI 5.4 음성 확인
        try:
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                               r"SOFTWARE\Microsoft\Speech\Voices\Tokens")
            
            i = 0
            while True:
                try:
                    voice_key_name = winreg.EnumKey(key, i)
                    voice_key = winreg.OpenKey(key, voice_key_name)
                    
                    try:
                        name = winreg.QueryValueEx(voice_key, "")[0]
                        print(f"{i+1}. {name}")
                        print(f"   키: {voice_key_name}")
                    except:
                        print(f"{i+1}. (이름 불명)")
                        
                    winreg.CloseKey(voice_key)
                    i += 1
                    
                except OSError:
                    break
                    
            winreg.CloseKey(key)
            
        except Exception as e:
            print(f"레지스트리 접근 실패: {e}")
            
    except ImportError:
        print("winreg 모듈을 사용할 수 없습니다.")

def suggest_better_tts():
    """더 나은 TTS 옵션들 제안"""
    print("\n=== 더 자연스러운 음성을 위한 대안들 ===")
    
    print("1. 🎯 Azure Cognitive Services (추천!)")
    print("   - 매우 자연스러운 한국어 음성")
    print("   - 감정 표현 가능")
    print("   - 월 50만 문자 무료")
    print("   - 설치: pip install azure-cognitiveservices-speech")
    
    print("\n2. 🔊 Google Cloud Text-to-Speech")
    print("   - WaveNet 기반 고품질 음성")
    print("   - 다양한 한국어 목소리")
    print("   - 월 100만 문자 무료")
    print("   - 설치: pip install google-cloud-texttospeech")
    
    print("\n3. 🤖 Amazon Polly")
    print("   - Neural 음성 지원")
    print("   - 자연스러운 억양")
    print("   - 월 500만 문자 무료")
    print("   - 설치: pip install boto3")
    
    print("\n4. 💬 Windows Speech Platform")
    print("   - 추가 고품질 음성 팩 설치 가능")
    print("   - Microsoft Korean Language Pack")
    
    print("\n5. 🎵 기타 옵션")
    print("   - eSpeak-ng (오픈소스)")
    print("   - Festival (무료)")
    print("   - 상용 솔루션: CereProc, Acapela 등")

if __name__ == "__main__":
    print("=== 음성 품질 개선 옵션 분석 ===")
    
    # 현재 사용 가능한 음성들 테스트
    test_all_available_voices()
    
    # Windows 음성 정보 확인
    check_sapi_voices()
    
    # 더 나은 대안 제안
    suggest_better_tts()
    
    print("\n=== 분석 완료 ===")
    print("현재 시스템에서 가장 좋은 옵션을 확인했습니다.")
    print("더 자연스러운 음성을 원하시면 클라우드 TTS 서비스 사용을 추천합니다!")