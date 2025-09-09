"""
알림 시스템 모듈
"""
import os
import threading
import winsound
from tkinter import messagebox, Toplevel, Label
import tkinter as tk
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class AlertSystem:
    """알림 시스템 클래스"""
    
    def __init__(self, parent_window: Optional[tk.Tk] = None):
        self.parent_window = parent_window
        self.alert_history = []
        
    def play_sound(self, sound_file: Optional[str] = None, duration: int = 1000):
        """소리 재생"""
        try:
            if sound_file and os.path.exists(sound_file):
                # WAV 파일 재생
                winsound.PlaySound(sound_file, winsound.SND_FILENAME | winsound.SND_ASYNC)
            else:
                # 기본 비프음
                winsound.Beep(1000, duration)
        except Exception as e:
            logger.error(f"소리 재생 실패: {e}")
            
    def show_popup(self, title: str, message: str, auto_close: int = 5):
        """팝업 알림 표시"""
        def create_popup():
            popup = Toplevel(self.parent_window)
            popup.title(title)
            popup.geometry("400x200")
            popup.attributes('-topmost', True)
            
            # 중앙 배치
            popup.update_idletasks()
            x = (popup.winfo_screenwidth() // 2) - (popup.winfo_width() // 2)
            y = (popup.winfo_screenheight() // 2) - (popup.winfo_height() // 2)
            popup.geometry(f"+{x}+{y}")
            
            # 메시지 표시
            label = Label(popup, text=message, font=('Arial', 14), wraplength=350)
            label.pack(pady=30)
            
            # 확인 버튼
            ok_button = tk.Button(popup, text="확인", command=popup.destroy, 
                                width=10, height=2)
            ok_button.pack(pady=10)
            
            # 자동 닫기
            if auto_close > 0:
                popup.after(auto_close * 1000, popup.destroy)
                
            popup.focus_force()
            
        if self.parent_window:
            self.parent_window.after(0, create_popup)
        else:
            # parent_window가 없으면 messagebox 사용
            messagebox.showinfo(title, message)
            
    def send_alert(self, student_name: str, alert_type: str = "종료", 
                   sound: bool = True, popup: bool = True):
        """통합 알림 전송"""
        timestamp = datetime.now()
        
        # 알림 내역 저장
        self.alert_history.append({
            'timestamp': timestamp,
            'student': student_name,
            'type': alert_type
        })
        
        # 메시지 생성
        if alert_type == "종료":
            message = f"{student_name} 학생의 수업이 종료되었습니다!"
            title = "수업 종료 알림"
        elif alert_type == "5분전":
            message = f"{student_name} 학생의 수업이 5분 후 종료됩니다."
            title = "수업 종료 예정"
        elif alert_type == "10분전":
            message = f"{student_name} 학생의 수업이 10분 후 종료됩니다."
            title = "수업 종료 예정"
        else:
            message = f"{student_name} - {alert_type}"
            title = "알림"
            
        # 소리 알림
        if sound:
            threading.Thread(target=self.play_sound, daemon=True).start()
            
        # 팝업 알림
        if popup:
            self.show_popup(title, message)
            
        logger.info(f"알림 전송: {message}")
        
    def test_alert(self):
        """알림 테스트"""
        self.send_alert("테스트 학생", "종료")
        
class TimerManager:
    """타이머 관리 클래스"""
    
    def __init__(self, alert_system: AlertSystem):
        self.alert_system = alert_system
        self.timers = {}
        self.alerted_students = {}  # 알림 전송 기록
        
    def check_alerts(self, students: dict):
        """학생들의 알림 시간 체크"""
        for student_id, student in students.items():
            if student.status.value != "수업중":
                continue
                
            remaining = student.get_remaining_time()
            if not remaining:
                continue
                
            remaining_minutes = remaining.total_seconds() / 60
            
            # 알림 키 생성
            alert_key_10 = f"{student_id}_10min"
            alert_key_5 = f"{student_id}_5min"
            alert_key_end = f"{student_id}_end"
            
            # 10분 전 알림
            if 9.5 <= remaining_minutes <= 10.5 and alert_key_10 not in self.alerted_students:
                self.alert_system.send_alert(student.name, "10분전")
                self.alerted_students[alert_key_10] = True
                
            # 5분 전 알림
            elif 4.5 <= remaining_minutes <= 5.5 and alert_key_5 not in self.alerted_students:
                self.alert_system.send_alert(student.name, "5분전")
                self.alerted_students[alert_key_5] = True
                
            # 종료 알림
            elif remaining_minutes <= 0.5 and alert_key_end not in self.alerted_students:
                self.alert_system.send_alert(student.name, "종료")
                self.alerted_students[alert_key_end] = True
                student.end_class()
                
    def reset_alerts(self, student_id: str):
        """특정 학생의 알림 기록 초기화"""
        keys_to_remove = [k for k in self.alerted_students.keys() if k.startswith(student_id)]
        for key in keys_to_remove:
            del self.alerted_students[key]