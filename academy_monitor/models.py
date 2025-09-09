"""
데이터 모델 정의
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
from enum import Enum

class StudentStatus(Enum):
    """학생 상태"""
    WAITING = "대기"
    IN_CLASS = "수업중"
    FINISHED = "종료"
    
@dataclass
class Student:
    """학생 정보 모델"""
    name: str
    student_id: str
    status: StudentStatus = StudentStatus.WAITING
    check_in_time: Optional[datetime] = None
    class_duration: timedelta = timedelta(hours=1, minutes=30)
    end_time: Optional[datetime] = None
    
    def start_class(self):
        """수업 시작"""
        self.status = StudentStatus.IN_CLASS
        self.check_in_time = datetime.now()
        self.end_time = self.check_in_time + self.class_duration
        
    def end_class(self):
        """수업 종료"""
        self.status = StudentStatus.FINISHED
        
    def get_remaining_time(self) -> Optional[timedelta]:
        """남은 시간 계산"""
        if self.status != StudentStatus.IN_CLASS or not self.end_time:
            return None
        remaining = self.end_time - datetime.now()
        return remaining if remaining.total_seconds() > 0 else timedelta(0)
    
    def extend_time(self, minutes: int):
        """시간 연장"""
        if self.end_time:
            self.end_time += timedelta(minutes=minutes)
            
    def is_alert_needed(self, minutes_before: int) -> bool:
        """알림이 필요한지 확인"""
        if self.status != StudentStatus.IN_CLASS:
            return False
        remaining = self.get_remaining_time()
        if not remaining:
            return False
        remaining_minutes = remaining.total_seconds() / 60
        return minutes_before - 0.5 <= remaining_minutes <= minutes_before + 0.5