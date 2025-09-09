"""
시스템 트레이 기능 모듈
"""
import os
import threading
from PIL import Image
import pystray
from pystray import MenuItem as item
import tkinter as tk

class SystemTrayManager:
    """시스템 트레이 관리 클래스"""
    
    def __init__(self, gui_app):
        self.gui_app = gui_app
        self.tray_icon = None
        self.is_running = False
        
    def create_icon(self):
        """트레이 아이콘 생성"""
        # 간단한 아이콘 이미지 생성 (16x16 픽셀)
        width = 16
        height = 16
        color = (0, 128, 255)  # 파란색
        
        # PIL로 간단한 아이콘 생성
        image = Image.new('RGBA', (width, height), color + (255,))
        
        # 원 모양 그리기
        for x in range(width):
            for y in range(height):
                # 중심에서의 거리 계산
                center_x, center_y = width // 2, height // 2
                distance = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
                
                if distance <= width // 2 - 1:
                    # 원 내부는 파란색, 외부는 투명
                    pass
                else:
                    # 외부는 투명하게
                    image.putpixel((x, y), (0, 0, 0, 0))
        
        return image
    
    def create_menu(self):
        """트레이 메뉴 생성"""
        return pystray.Menu(
            item("학원 모니터링 시스템", self.show_window),
            item("---", None),  # 구분선
            item("모니터링 시작", self.start_monitoring, 
                 enabled=lambda item: self.gui_app.start_btn['state'] != 'disabled'),
            item("모니터링 중지", self.stop_monitoring,
                 enabled=lambda item: self.gui_app.stop_btn['state'] != 'disabled'),
            item("---", None),  # 구분선
            item("창 보이기", self.show_window),
            item("창 숨기기", self.hide_window),
            item("---", None),  # 구분선
            item("종료", self.quit_application)
        )
    
    def setup_tray(self):
        """트레이 아이콘 설정"""
        if not self.tray_icon:
            image = self.create_icon()
            menu = self.create_menu()
            
            self.tray_icon = pystray.Icon(
                name="AcademyMonitor",
                icon=image,
                title="학원 출결 모니터링 시스템",
                menu=menu
            )
    
    def show_window(self, icon=None, item=None):
        """창 보이기"""
        if self.gui_app and self.gui_app.root:
            self.gui_app.root.after(0, self._show_window)
    
    def _show_window(self):
        """창 보이기 (메인 스레드에서 실행)"""
        self.gui_app.root.deiconify()
        self.gui_app.root.lift()
        self.gui_app.root.focus_force()
    
    def hide_window(self, icon=None, item=None):
        """창 숨기기"""
        if self.gui_app and self.gui_app.root:
            self.gui_app.root.after(0, self._hide_window)
    
    def _hide_window(self):
        """창 숨기기 (메인 스레드에서 실행)"""
        self.gui_app.root.withdraw()
    
    def start_monitoring(self, icon=None, item=None):
        """모니터링 시작"""
        if self.gui_app:
            self.gui_app.root.after(0, self.gui_app.start_monitoring)
    
    def stop_monitoring(self, icon=None, item=None):
        """모니터링 중지"""
        if self.gui_app:
            self.gui_app.root.after(0, self.gui_app.stop_monitoring)
    
    def quit_application(self, icon=None, item=None):
        """애플리케이션 종료"""
        self.stop_tray()
        if self.gui_app and self.gui_app.root:
            self.gui_app.root.after(0, self.gui_app.root.quit)
    
    def start_tray(self):
        """트레이 아이콘 시작"""
        if not self.is_running:
            self.setup_tray()
            self.is_running = True
            
            # 별도 스레드에서 트레이 실행
            def run_tray():
                if self.tray_icon:
                    self.tray_icon.run()
            
            tray_thread = threading.Thread(target=run_tray, daemon=True)
            tray_thread.start()
    
    def stop_tray(self):
        """트레이 아이콘 중지"""
        if self.tray_icon and self.is_running:
            self.tray_icon.stop()
            self.is_running = False
    
    def update_tooltip(self, status_text):
        """툴팁 업데이트"""
        if self.tray_icon:
            self.tray_icon.title = f"학원 모니터링 - {status_text}"

class TrayIntegratedGUI:
    """트레이 기능이 통합된 GUI 클래스"""
    
    def __init__(self, gui_class):
        # 기존 GUI 초기화
        self.gui = gui_class()
        
        # 트레이 매니저 생성
        self.tray_manager = SystemTrayManager(self.gui)
        
        # 창 최소화 이벤트 처리
        self.gui.root.protocol("WM_DELETE_WINDOW", self.on_window_close)
        
        # 트레이 시작
        self.tray_manager.start_tray()
    
    def on_window_close(self):
        """창 닫기 버튼 클릭 시"""
        # 창을 완전히 닫지 않고 트레이로 숨김
        self.tray_manager.hide_window()
    
    def run(self):
        """GUI 실행"""
        try:
            # 상태 업데이트 주기적 실행
            self.update_tray_status()
            
            # GUI 실행
            self.gui.run()
            
        finally:
            # 정리
            self.tray_manager.stop_tray()
    
    def update_tray_status(self):
        """트레이 상태 업데이트"""
        if self.gui.status_label:
            status_text = self.gui.status_label.cget("text").replace("상태: ", "")
            self.tray_manager.update_tooltip(status_text)
        
        # 1초마다 업데이트
        self.gui.root.after(1000, self.update_tray_status)