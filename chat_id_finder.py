"""
텔레그램 Chat ID 자동 찾기 스크립트
"""

import requests
import sys
import json

def find_chat_id(bot_token):
    """봇 토큰으로 Chat ID 찾기"""
    try:
        url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
        response = requests.get(url)
        data = response.json()
        
        if not data['ok']:
            print("❌ 봇 토큰이 올바르지 않습니다.")
            return None
            
        if not data['result']:
            print("📝 봇과 대화한 기록이 없습니다.")
            print("1. 텔레그램에서 봇을 찾아 대화를 시작하세요")
            print("2. 아무 메시지나 전송하세요")
            print("3. 다시 이 스크립트를 실행하세요")
            return None
        
        print("💬 발견된 대화:")
        chat_ids = set()
        
        for update in data['result']:
            if 'message' in update:
                chat = update['message']['chat']
                chat_id = chat['id']
                chat_type = chat['type']
                
                if chat_type == 'private':
                    first_name = chat.get('first_name', '')
                    last_name = chat.get('last_name', '')
                    username = chat.get('username', '')
                    
                    print(f"  👤 개인 채팅:")
                    print(f"     Chat ID: {chat_id}")
                    print(f"     이름: {first_name} {last_name}".strip())
                    if username:
                        print(f"     사용자명: @{username}")
                    print()
                    
                    chat_ids.add(chat_id)
                
                elif chat_type in ['group', 'supergroup']:
                    title = chat.get('title', 'Unknown Group')
                    print(f"  👥 그룹 채팅:")
                    print(f"     Chat ID: {chat_id}")
                    print(f"     그룹명: {title}")
                    print()
                    
                    chat_ids.add(chat_id)
        
        return list(chat_ids)
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return None

def main():
    if len(sys.argv) != 2:
        print("사용법: python chat_id_finder.py YOUR_BOT_TOKEN")
        print("\n예시:")
        print("python chat_id_finder.py 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz")
        return
    
    bot_token = sys.argv[1]
    
    print("🔍 Chat ID 검색 중...")
    print(f"봇 토큰: {bot_token[:10]}...")
    print()
    
    chat_ids = find_chat_id(bot_token)
    
    if chat_ids:
        print("✅ Chat ID를 찾았습니다!")
        print("\n📋 config.ini 파일에 다음과 같이 설정하세요:")
        print()
        print("[telegram]")
        print(f"token = {bot_token}")
        
        if len(chat_ids) == 1:
            print(f"chat_id = {chat_ids[0]}")
        else:
            print("# 사용할 Chat ID를 선택하세요:")
            for chat_id in chat_ids:
                print(f"# chat_id = {chat_id}")
            print(f"chat_id = {chat_ids[0]}  # 첫 번째 Chat ID 사용")

if __name__ == "__main__":
    main()