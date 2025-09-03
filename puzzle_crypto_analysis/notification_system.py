"""
퍼즐 트레이딩 봇 알림 시스템
매수/매도 신호 발생시 다양한 방법으로 알림
"""

import os
import smtplib
import winsound
import requests
import json
import logging
from datetime import datetime
from typing import Optional, List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass
from enum import Enum

# Windows 10/11 알림용
try:
    from win10toast import ToastNotifier
    TOAST_AVAILABLE = True
except ImportError:
    TOAST_AVAILABLE = False

# 플랫폼별 알림용
try:
    import plyer
    PLYER_AVAILABLE = True
except ImportError:
    PLYER_AVAILABLE = False

logger = logging.getLogger(__name__)


class AlertType(Enum):
    """알림 유형"""
    BUY_SIGNAL = "매수_신호"
    SELL_SIGNAL = "매도_신호"
    PROFIT_TARGET = "익절_목표"
    STOP_LOSS = "손절_알림"
    SYSTEM_ERROR = "시스템_오류"
    PORTFOLIO_UPDATE = "포트폴리오_업데이트"


class AlertPriority(Enum):
    """알림 우선순위"""
    LOW = "낮음"
    MEDIUM = "보통"
    HIGH = "높음"
    CRITICAL = "긴급"


@dataclass
class AlertMessage:
    """알림 메시지"""
    type: AlertType
    priority: AlertPriority
    title: str
    message: str
    coin: Optional[str] = None
    price: Optional[float] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


class NotificationSystem:
    """통합 알림 시스템"""
    
    def __init__(self, config_file: str = "notification_config.json"):
        """
        알림 시스템 초기화
        
        Args:
            config_file: 알림 설정 파일
        """
        self.config_file = config_file
        self.config = self.load_config()
        
        # 알림 도구 초기화
        if TOAST_AVAILABLE and self.config.get("desktop_notifications", True):
            self.toast = ToastNotifier()
        else:
            self.toast = None
        
        logger.info("알림 시스템 초기화 완료")
    
    def load_config(self) -> dict:
        """알림 설정 로드"""
        default_config = {
            "desktop_notifications": True,
            "sound_alerts": True,
            "telegram_enabled": False,
            "email_enabled": False,
            "telegram_bot_token": "",
            "telegram_chat_id": "",
            "email_smtp_server": "smtp.gmail.com",
            "email_smtp_port": 587,
            "email_user": "",
            "email_password": "",
            "email_recipients": [],
            "sound_buy": "sounds/buy_signal.wav",
            "sound_sell": "sounds/sell_signal.wav",
            "sound_error": "sounds/error.wav"
        }
        
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    # 기본 설정과 병합
                    default_config.update(config)
            else:
                # 기본 설정 파일 생성
                self.save_config(default_config)
        except Exception as e:
            logger.warning(f"설정 파일 로드 실패: {e}, 기본 설정 사용")
        
        return default_config
    
    def save_config(self, config: dict):
        """알림 설정 저장"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"설정 파일 저장 실패: {e}")
    
    def send_alert(self, alert: AlertMessage):
        """
        알림 전송 (모든 활성화된 채널로)
        
        Args:
            alert: 알림 메시지 객체
        """
        try:
            logger.info(f"알림 발송: {alert.title} - {alert.message}")
            
            # 1. 데스크톱 알림
            if self.config.get("desktop_notifications", True):
                self._send_desktop_notification(alert)
            
            # 2. 소리 알림
            if self.config.get("sound_alerts", True):
                self._play_sound_alert(alert)
            
            # 3. 텔레그램 알림
            if self.config.get("telegram_enabled", False):
                self._send_telegram_alert(alert)
            
            # 4. 이메일 알림
            if self.config.get("email_enabled", False):
                self._send_email_alert(alert)
            
        except Exception as e:
            logger.error(f"알림 전송 실패: {e}")
    
    def _send_desktop_notification(self, alert: AlertMessage):
        """Windows 데스크톱 알림"""
        try:
            # 우선순위별 아이콘
            icon_map = {
                AlertPriority.LOW: None,
                AlertPriority.MEDIUM: None,
                AlertPriority.HIGH: None,
                AlertPriority.CRITICAL: None
            }
            
            if self.toast:
                # Win10Toast 사용
                duration = 10 if alert.priority == AlertPriority.CRITICAL else 5
                
                self.toast.show_toast(
                    title=f"🚀 {alert.title}",
                    msg=alert.message,
                    duration=duration,
                    threaded=True
                )
            
            elif PLYER_AVAILABLE:
                # Plyer 사용 (크로스 플랫폼)
                plyer.notification.notify(
                    title=f"🚀 {alert.title}",
                    message=alert.message,
                    timeout=10 if alert.priority == AlertPriority.CRITICAL else 5
                )
            
            else:
                # 콘솔 출력으로 대체
                print(f"\n{'='*50}")
                print(f"🔔 알림: {alert.title}")
                print(f"📄 내용: {alert.message}")
                if alert.coin:
                    print(f"💰 코인: {alert.coin}")
                if alert.price:
                    print(f"💵 가격: {alert.price:,}원")
                print(f"⏰ 시간: {alert.timestamp.strftime('%H:%M:%S')}")
                print(f"{'='*50}\n")
            
        except Exception as e:
            logger.error(f"데스크톱 알림 실패: {e}")
    
    def _play_sound_alert(self, alert: AlertMessage):
        """소리 알림"""
        try:
            if alert.type == AlertType.BUY_SIGNAL:
                # 매수 신호 소리 (높은 톤)
                winsound.Beep(1000, 500)  # 1000Hz, 500ms
                winsound.Beep(1200, 300)
            
            elif alert.type == AlertType.SELL_SIGNAL:
                # 매도 신호 소리 (낮은 톤)
                winsound.Beep(600, 500)   # 600Hz, 500ms
                winsound.Beep(400, 300)
            
            elif alert.type == AlertType.STOP_LOSS:
                # 손절 알림 (긴급)
                for _ in range(3):
                    winsound.Beep(800, 200)
                    winsound.Beep(400, 200)
            
            elif alert.type == AlertType.SYSTEM_ERROR:
                # 오류 알림
                winsound.Beep(300, 1000)  # 낮고 긴 소리
            
            else:
                # 기본 알림 소리
                winsound.Beep(800, 300)
        
        except Exception as e:
            logger.error(f"소리 알림 실패: {e}")
    
    def _send_telegram_alert(self, alert: AlertMessage):
        """텔레그램 알림"""
        try:
            bot_token = self.config.get("telegram_bot_token")
            chat_id = self.config.get("telegram_chat_id")
            
            if not bot_token or not chat_id:
                return
            
            # 메시지 포맷팅
            emoji_map = {
                AlertType.BUY_SIGNAL: "🟢",
                AlertType.SELL_SIGNAL: "🔴",
                AlertType.PROFIT_TARGET: "💰",
                AlertType.STOP_LOSS: "🚨",
                AlertType.SYSTEM_ERROR: "❌",
                AlertType.PORTFOLIO_UPDATE: "📊"
            }
            
            emoji = emoji_map.get(alert.type, "🔔")
            
            message = f"{emoji} *{alert.title}*\n\n"
            message += f"📄 {alert.message}\n"
            
            if alert.coin:
                message += f"💰 코인: {alert.coin}\n"
            if alert.price:
                message += f"💵 가격: {alert.price:,}원\n"
            
            message += f"⏰ {alert.timestamp.strftime('%H:%M:%S')}"
            
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            data = {
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "Markdown"
            }
            
            response = requests.post(url, data=data, timeout=10)
            
            if response.status_code == 200:
                logger.info("텔레그램 알림 전송 성공")
            else:
                logger.error(f"텔레그램 알림 실패: {response.text}")
        
        except Exception as e:
            logger.error(f"텔레그램 알림 오류: {e}")
    
    def _send_email_alert(self, alert: AlertMessage):
        """이메일 알림"""
        try:
            smtp_server = self.config.get("email_smtp_server")
            smtp_port = self.config.get("email_smtp_port")
            email_user = self.config.get("email_user")
            email_password = self.config.get("email_password")
            recipients = self.config.get("email_recipients", [])
            
            if not all([smtp_server, email_user, email_password, recipients]):
                return
            
            # 이메일 메시지 구성
            msg = MIMEMultipart()
            msg['From'] = email_user
            msg['To'] = ", ".join(recipients)
            msg['Subject'] = f"[퍼즐봇] {alert.title}"
            
            # 본문 HTML 구성
            html_body = f"""
            <html>
            <body>
                <h2>🚀 퍼즐 트레이딩 봇 알림</h2>
                <h3>{alert.title}</h3>
                <p><strong>메시지:</strong> {alert.message}</p>
                
                {"<p><strong>코인:</strong> " + alert.coin + "</p>" if alert.coin else ""}
                {"<p><strong>가격:</strong> " + f"{alert.price:,}원" + "</p>" if alert.price else ""}
                
                <p><strong>시간:</strong> {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p><strong>우선순위:</strong> {alert.priority.value}</p>
                
                <hr>
                <p><small>퍼즐 트레이딩 봇에서 자동 생성된 알림입니다.</small></p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html_body, 'html', 'utf-8'))
            
            # SMTP 서버 연결 및 전송
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(email_user, email_password)
                server.send_message(msg)
            
            logger.info("이메일 알림 전송 성공")
        
        except Exception as e:
            logger.error(f"이메일 알림 오류: {e}")
    
    def send_buy_signal(self, coin: str, price: float, reason: str, confidence: float):
        """매수 신호 알림"""
        priority = AlertPriority.HIGH if confidence > 0.8 else AlertPriority.MEDIUM
        
        alert = AlertMessage(
            type=AlertType.BUY_SIGNAL,
            priority=priority,
            title=f"매수 신호 - {coin}",
            message=f"{reason}\n신뢰도: {confidence*100:.1f}%",
            coin=coin,
            price=price
        )
        
        self.send_alert(alert)
    
    def send_sell_signal(self, coin: str, price: float, reason: str, confidence: float):
        """매도 신호 알림"""
        priority = AlertPriority.HIGH if confidence > 0.8 else AlertPriority.MEDIUM
        
        alert = AlertMessage(
            type=AlertType.SELL_SIGNAL,
            priority=priority,
            title=f"매도 신호 - {coin}",
            message=f"{reason}\n신뢰도: {confidence*100:.1f}%",
            coin=coin,
            price=price
        )
        
        self.send_alert(alert)
    
    def send_stop_loss_alert(self, coin: str, price: float, loss_percent: float):
        """손절 알림"""
        alert = AlertMessage(
            type=AlertType.STOP_LOSS,
            priority=AlertPriority.CRITICAL,
            title=f"손절 알림 - {coin}",
            message=f"손실률 {loss_percent:.1f}% 도달!\n즉시 매도를 고려하세요.",
            coin=coin,
            price=price
        )
        
        self.send_alert(alert)
    
    def send_profit_alert(self, coin: str, price: float, profit_percent: float):
        """익절 알림"""
        alert = AlertMessage(
            type=AlertType.PROFIT_TARGET,
            priority=AlertPriority.HIGH,
            title=f"익절 기회 - {coin}",
            message=f"수익률 {profit_percent:.1f}% 달성!\n익절을 고려하세요.",
            coin=coin,
            price=price
        )
        
        self.send_alert(alert)
    
    def send_portfolio_update(self, total_value: float, profit_rate: float):
        """포트폴리오 업데이트 알림"""
        alert = AlertMessage(
            type=AlertType.PORTFOLIO_UPDATE,
            priority=AlertPriority.LOW,
            title="포트폴리오 업데이트",
            message=f"총 자산: {total_value:,.0f}원\n수익률: {profit_rate:+.1f}%"
        )
        
        self.send_alert(alert)
    
    def send_system_error(self, error_message: str):
        """시스템 오류 알림"""
        alert = AlertMessage(
            type=AlertType.SYSTEM_ERROR,
            priority=AlertPriority.CRITICAL,
            title="시스템 오류",
            message=f"오류 발생: {error_message}\n즉시 확인이 필요합니다."
        )
        
        self.send_alert(alert)
    
    def test_all_notifications(self):
        """모든 알림 채널 테스트"""
        test_alert = AlertMessage(
            type=AlertType.BUY_SIGNAL,
            priority=AlertPriority.MEDIUM,
            title="알림 테스트",
            message="모든 알림 채널이 정상 작동하는지 테스트합니다.",
            coin="BTC",
            price=95000000
        )
        
        print("🔔 알림 테스트를 시작합니다...")
        self.send_alert(test_alert)
        print("✅ 알림 테스트 완료!")


# 설정 도우미
class NotificationSetup:
    """알림 설정 도우미"""
    
    @staticmethod
    def setup_telegram():
        """텔레그램 봇 설정 가이드"""
        print("""
🔔 텔레그램 알림 설정 가이드

1. 텔레그램에서 @BotFather 검색
2. /newbot 명령어로 새 봇 생성
3. 봇 이름 설정 (예: PuzzleTradingBot)
4. 봇 토큰 복사 (예: 123456789:ABCdefGHIjklMNOpqrSTUvwxyz)

5. 봇과 대화 시작
6. /start 명령어 전송

7. Chat ID 확인:
   https://api.telegram.org/bot[봇토큰]/getUpdates
   
8. 아래 설정에 입력:
        """)
        
        bot_token = input("봇 토큰 입력: ").strip()
        chat_id = input("Chat ID 입력: ").strip()
        
        if bot_token and chat_id:
            config = {
                "telegram_enabled": True,
                "telegram_bot_token": bot_token,
                "telegram_chat_id": chat_id
            }
            
            with open("notification_config.json", "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            print("✅ 텔레그램 설정 완료!")
            
            # 테스트 전송
            notifier = NotificationSystem()
            notifier.send_alert(AlertMessage(
                type=AlertType.BUY_SIGNAL,
                priority=AlertPriority.MEDIUM,
                title="텔레그램 테스트",
                message="설정이 완료되었습니다!"
            ))
        
        return bot_token, chat_id
    
    @staticmethod
    def setup_email():
        """이메일 알림 설정 가이드"""
        print("""
📧 이메일 알림 설정 가이드

Gmail 사용시:
1. Google 계정 → 보안 → 2단계 인증 활성화
2. 앱 비밀번호 생성
3. 아래에 입력

다른 이메일:
1. SMTP 서버 정보 확인 필요
        """)
        
        email_user = input("이메일 주소: ").strip()
        email_password = input("앱 비밀번호: ").strip()
        recipients = input("수신자 (콤마로 구분): ").strip().split(',')
        recipients = [r.strip() for r in recipients if r.strip()]
        
        if email_user and email_password and recipients:
            config = {
                "email_enabled": True,
                "email_user": email_user,
                "email_password": email_password,
                "email_recipients": recipients
            }
            
            with open("notification_config.json", "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            print("✅ 이메일 설정 완료!")
        
        return email_user, email_password, recipients


def main():
    """알림 시스템 테스트"""
    print("🔔 퍼즐 트레이딩 봇 알림 시스템 테스트")
    print("="*50)
    
    # 알림 시스템 초기화
    notifier = NotificationSystem()
    
    # 테스트 메뉴
    while True:
        print("""
선택하세요:
1. 매수 신호 테스트
2. 매도 신호 테스트  
3. 손절 알림 테스트
4. 익절 알림 테스트
5. 포트폴리오 업데이트 테스트
6. 시스템 오류 테스트
7. 모든 알림 테스트
8. 텔레그램 설정
9. 이메일 설정
0. 종료
        """)
        
        choice = input("선택: ").strip()
        
        if choice == "1":
            notifier.send_buy_signal("BTC", 95000000, "RSI 과매도 신호", 0.85)
        elif choice == "2":
            notifier.send_sell_signal("BTC", 98000000, "RSI 과매수 신호", 0.90)
        elif choice == "3":
            notifier.send_stop_loss_alert("BTC", 85000000, -15.5)
        elif choice == "4":
            notifier.send_profit_alert("BTC", 105000000, 25.3)
        elif choice == "5":
            notifier.send_portfolio_update(12500000, 8.7)
        elif choice == "6":
            notifier.send_system_error("업비트 API 연결 실패")
        elif choice == "7":
            notifier.test_all_notifications()
        elif choice == "8":
            NotificationSetup.setup_telegram()
        elif choice == "9":
            NotificationSetup.setup_email()
        elif choice == "0":
            break
        else:
            print("잘못된 선택입니다.")


if __name__ == "__main__":
    main()