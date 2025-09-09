"""
업비트 RSI 모니터 실행 및 관리 스크립트
"""

import subprocess
import sys
import os
import configparser
from pathlib import Path

def install_requirements():
    """필요한 패키지 설치"""
    print("📦 필요한 패키지 설치 중...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✅ 패키지 설치 완료")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 패키지 설치 실패: {e}")
        return False

def check_config():
    """설정 파일 확인"""
    config_file = Path('config.ini')
    
    if not config_file.exists():
        print("⚠️  설정 파일이 없습니다. 기본 설정 파일을 생성합니다...")
        try:
            subprocess.run([sys.executable, 'upbit_rsi_monitor.py', '--create-config'], check=True)
            print("📝 기본 설정 파일 'config.ini'가 생성되었습니다.")
            print("✏️  텔레그램 봇 토큰과 Chat ID를 설정하세요.")
            return False
        except subprocess.CalledProcessError:
            print("❌ 설정 파일 생성 실패")
            return False
    
    # 설정 파일 유효성 검사
    config = configparser.ConfigParser()
    try:
        config.read('config.ini', encoding='utf-8')
        
        # 필수 섹션 확인
        required_sections = ['monitoring', 'telegram']
        for section in required_sections:
            if not config.has_section(section):
                print(f"❌ 설정 파일에 [{section}] 섹션이 없습니다.")
                return False
        
        # 텔레그램 설정 확인
        token = config.get('telegram', 'token', fallback='')
        chat_id = config.get('telegram', 'chat_id', fallback='')
        
        if token == 'YOUR_TELEGRAM_BOT_TOKEN' or not token:
            print("❌ 텔레그램 봇 토큰이 설정되지 않았습니다.")
            print("   config.ini 파일에서 telegram.token을 설정하세요.")
            return False
            
        if chat_id == 'YOUR_CHAT_ID' or not chat_id:
            print("❌ 텔레그램 Chat ID가 설정되지 않았습니다.")
            print("   config.ini 파일에서 telegram.chat_id를 설정하세요.")
            print("   Chat ID 찾기: python chat_id_finder.py YOUR_BOT_TOKEN")
            return False
        
        print("✅ 설정 파일 확인 완료")
        
        # 현재 설정 표시
        markets = config.get('monitoring', 'markets', fallback='ALL')
        rsi_low = config.get('monitoring', 'rsi_low', fallback='30')
        rsi_high = config.get('monitoring', 'rsi_high', fallback='70')
        interval = config.get('monitoring', 'interval', fallback='1m')
        
        print(f"📊 모니터링 설정:")
        print(f"   - 코인: {markets}")
        print(f"   - RSI 임계값: {rsi_low} ~ {rsi_high}")
        print(f"   - 시간봉: {interval}")
        
        return True
        
    except Exception as e:
        print(f"❌ 설정 파일 읽기 오류: {e}")
        return False

def run_monitor():
    """모니터링 시작"""
    print("\n🚀 업비트 RSI 실시간 모니터링 시작")
    print("   Ctrl+C로 중단할 수 있습니다.")
    print("-" * 50)
    
    try:
        subprocess.run([sys.executable, 'upbit_rsi_monitor.py'], check=True)
    except KeyboardInterrupt:
        print("\n⏹️  사용자에 의해 모니터링이 중단되었습니다.")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ 모니터링 실행 중 오류 발생: {e}")

def show_help():
    """도움말 표시"""
    print("""
🔧 업비트 RSI 모니터 관리 도구

사용법:
  python run_monitor.py [옵션]

옵션:
  --install    필요한 패키지만 설치
  --config     설정 파일만 생성/확인
  --help       이 도움말 표시
  (옵션 없음)   전체 설정 확인 후 모니터링 시작

설정 파일 위치: config.ini
로그 파일 위치: upbit_rsi_monitor.log

텔레그램 설정:
1. @BotFather로 봇 생성
2. python chat_id_finder.py YOUR_BOT_TOKEN
3. config.ini에서 token과 chat_id 설정
""")

def main():
    """메인 함수"""
    if len(sys.argv) > 1:
        if sys.argv[1] == '--help':
            show_help()
            return
        elif sys.argv[1] == '--install':
            install_requirements()
            return
        elif sys.argv[1] == '--config':
            check_config()
            return
    
    # 전체 프로세스 실행
    print("🔍 업비트 RSI 모니터 시작 준비")
    print("=" * 50)
    
    # 1. 패키지 설치
    if not install_requirements():
        return
    
    print()
    
    # 2. 설정 확인
    if not check_config():
        print("\n⚠️  설정을 완료한 후 다시 실행하세요.")
        return
    
    print()
    
    # 3. 모니터링 시작
    run_monitor()

if __name__ == "__main__":
    main()