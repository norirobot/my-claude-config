"""
안드로이드 APK 파일 생성
Kivy + Python으로 진짜 안드로이드 앱 만들기
"""

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.gridlayout import GridLayout
from kivy.uix.popup import Popup
from kivy.clock import Clock
from kivy.graphics import Color, Rectangle
import requests
import json
from datetime import datetime
import threading

class PuzzleTradingApp(App):
    """퍼즐 트레이딩 봇 안드로이드 앱"""
    
    def build(self):
        """메인 UI 구성"""
        self.title = "🚀 퍼즐 트레이딩 봇"
        
        # 메인 레이아웃
        main_layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        # 헤더
        header = Label(
            text='🚀 퍼즐 트레이딩 봇',
            font_size='24sp',
            size_hint=(1, 0.1),
            color=(0.4, 0.5, 0.9, 1)
        )
        main_layout.add_widget(header)
        
        # 포트폴리오 정보
        self.portfolio_layout = self.create_portfolio_section()
        main_layout.add_widget(self.portfolio_layout)
        
        # 버튼 그리드
        button_grid = self.create_button_grid()
        main_layout.add_widget(button_grid)
        
        # 상태 표시
        self.status_label = Label(
            text='📊 모의투자 모드',
            size_hint=(1, 0.1),
            color=(0.2, 0.8, 0.2, 1)
        )
        main_layout.add_widget(self.status_label)
        
        # 백그라운드 색상
        with main_layout.canvas.before:
            Color(0.95, 0.95, 0.97, 1)
            self.rect = Rectangle(size=main_layout.size, pos=main_layout.pos)
            main_layout.bind(size=self._update_rect, pos=self._update_rect)
        
        # 정기 업데이트 스케줄
        Clock.schedule_interval(self.update_data, 30)  # 30초마다
        
        return main_layout
    
    def _update_rect(self, instance, value):
        """배경 업데이트"""
        self.rect.pos = instance.pos
        self.rect.size = instance.size
    
    def create_portfolio_section(self):
        """포트폴리오 섹션 생성"""
        portfolio_layout = GridLayout(cols=2, size_hint=(1, 0.4), spacing=10)
        
        # 총 자산
        self.total_asset_label = Label(
            text='총 자산\n₩10,500,000',
            font_size='18sp',
            halign='center',
            color=(0.2, 0.2, 0.2, 1)
        )
        portfolio_layout.add_widget(self.total_asset_label)
        
        # 수익률
        self.profit_label = Label(
            text='수익률\n+5.0%',
            font_size='18sp',
            halign='center',
            color=(0.2, 0.8, 0.2, 1)
        )
        portfolio_layout.add_widget(self.profit_label)
        
        # BTC 보유량
        self.btc_label = Label(
            text='BTC\n0.11개',
            font_size='16sp',
            halign='center'
        )
        portfolio_layout.add_widget(self.btc_label)
        
        # ETH 보유량
        self.eth_label = Label(
            text='ETH\n0.65개',
            font_size='16sp',
            halign='center'
        )
        portfolio_layout.add_widget(self.eth_label)
        
        return portfolio_layout
    
    def create_button_grid(self):
        """버튼 그리드 생성"""
        button_grid = GridLayout(cols=2, size_hint=(1, 0.3), spacing=10)
        
        # 매매 시작/중지
        self.toggle_btn = Button(
            text='▶️ 시작',
            font_size='16sp',
            background_color=(0.4, 0.5, 0.9, 1)
        )
        self.toggle_btn.bind(on_press=self.toggle_trading)
        button_grid.add_widget(self.toggle_btn)
        
        # 새로고침
        refresh_btn = Button(
            text='🔄 새로고침',
            font_size='16sp',
            background_color=(0.2, 0.8, 0.2, 1)
        )
        refresh_btn.bind(on_press=self.refresh_data)
        button_grid.add_widget(refresh_btn)
        
        # 매매 신호
        signal_btn = Button(
            text='🎯 매매신호',
            font_size='16sp',
            background_color=(0.9, 0.5, 0.2, 1)
        )
        signal_btn.bind(on_press=self.show_signals)
        button_grid.add_widget(signal_btn)
        
        # 설정
        settings_btn = Button(
            text='⚙️ 설정',
            font_size='16sp',
            background_color=(0.5, 0.5, 0.5, 1)
        )
        settings_btn.bind(on_press=self.show_settings)
        button_grid.add_widget(settings_btn)
        
        return button_grid
    
    def toggle_trading(self, instance):
        """매매 시작/중지"""
        if instance.text == '▶️ 시작':
            instance.text = '⏹️ 정지'
            instance.background_color = (0.9, 0.2, 0.2, 1)
            self.status_label.text = '🟢 봇 실행 중'
            self.status_label.color = (0.2, 0.8, 0.2, 1)
            
            # 백그라운드에서 트레이딩 로직 시작
            threading.Thread(target=self.start_trading_logic, daemon=True).start()
            
        else:
            instance.text = '▶️ 시작'
            instance.background_color = (0.4, 0.5, 0.9, 1)
            self.status_label.text = '🔴 봇 정지'
            self.status_label.color = (0.9, 0.2, 0.2, 1)
    
    def start_trading_logic(self):
        """트레이딩 로직 시작 (백그라운드)"""
        # 여기서 실제 퍼즈 봇 로직 실행
        pass
    
    def refresh_data(self, instance):
        """데이터 새로고침"""
        self.update_portfolio_data()
        
        # 팝업으로 완료 알림
        popup = Popup(
            title='새로고침 완료',
            content=Label(text='데이터가 업데이트되었습니다.'),
            size_hint=(0.6, 0.3)
        )
        popup.open()
        Clock.schedule_once(popup.dismiss, 1.5)
    
    def show_signals(self, instance):
        """매매 신호 팝업"""
        content = BoxLayout(orientation='vertical')
        content.add_widget(Label(text='🎯 매매 신호'))
        content.add_widget(Label(text='🟢 BTC: 매수 (DCA 신호)'))
        content.add_widget(Label(text='🟡 ETH: 관망 (RSI 50)'))
        content.add_widget(Label(text='🔴 SOL: 매도 (RSI 80)'))
        
        close_btn = Button(text='닫기', size_hint=(1, 0.3))
        content.add_widget(close_btn)
        
        popup = Popup(
            title='매매 신호',
            content=content,
            size_hint=(0.8, 0.6)
        )
        close_btn.bind(on_press=popup.dismiss)
        popup.open()
    
    def show_settings(self, instance):
        """설정 팝업"""
        content = BoxLayout(orientation='vertical')
        content.add_widget(Label(text='⚙️ 설정'))
        content.add_widget(Label(text='DCA 금액: 300,000원'))
        content.add_widget(Label(text='투자 주기: 7일'))
        content.add_widget(Label(text='포트폴리오: BTC 60%'))
        
        close_btn = Button(text='닫기', size_hint=(1, 0.3))
        content.add_widget(close_btn)
        
        popup = Popup(
            title='설정',
            content=content,
            size_hint=(0.8, 0.6)
        )
        close_btn.bind(on_press=popup.dismiss)
        popup.open()
    
    def update_data(self, dt):
        """정기 데이터 업데이트"""
        self.update_portfolio_data()
    
    def update_portfolio_data(self):
        """포트폴리오 데이터 업데이트"""
        # 실제로는 서버나 로컬 데이터에서 가져옴
        import random
        
        # 더미 데이터로 업데이트
        profit_rate = random.uniform(-5, 10)
        total_asset = 10000000 * (1 + profit_rate/100)
        
        self.total_asset_label.text = f'총 자산\n₩{total_asset:,.0f}'
        self.profit_label.text = f'수익률\n{profit_rate:+.1f}%'
        
        # 수익률에 따라 색상 변경
        if profit_rate >= 0:
            self.profit_label.color = (0.2, 0.8, 0.2, 1)
        else:
            self.profit_label.color = (0.9, 0.2, 0.2, 1)


class PuzzleTradingAppLauncher:
    """앱 실행 도우미"""
    
    @staticmethod
    def create_buildozer_spec():
        """buildozer.spec 파일 생성 (APK 빌드용)"""
        spec_content = """
[app]
title = 퍼즐 트레이딩 봇
package.name = puzzletradingbot
package.domain = org.puzzle

source.dir = .
source.include_exts = py,png,jpg,kv,atlas,json

version = 1.0
requirements = python3,kivy,requests,numpy,pandas

[buildozer]
log_level = 2

[app]
presplash.filename = %(source.dir)s/presplash.png
icon.filename = %(source.dir)s/icon.png

android.permissions = INTERNET,ACCESS_NETWORK_STATE,WAKE_LOCK

[buildozer]
warn_on_root = 1
"""
        
        with open('buildozer.spec', 'w', encoding='utf-8') as f:
            f.write(spec_content)
        
        print("✅ buildozer.spec 파일 생성됨")
    
    @staticmethod
    def create_apk_build_script():
        """APK 빌드 스크립트"""
        script_content = """
#!/bin/bash

echo "🚀 퍼즐 트레이딩 봇 APK 빌드 시작"

# buildozer 설치
pip install buildozer

# Android 빌드 도구 설치
buildozer android debug

echo "✅ APK 빌드 완료!"
echo "📱 bin/puzzletradingbot-1.0-debug.apk 파일을 핸드폰에 설치하세요"
"""
        
        with open('build_apk.sh', 'w') as f:
            f.write(script_content)
        
        print("✅ APK 빌드 스크립트 생성됨")


if __name__ == "__main__":
    # 개발 모드에서 실행
    app = PuzzleTradingApp()
    app.run()