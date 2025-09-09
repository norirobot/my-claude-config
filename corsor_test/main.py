import time
from datetime import datetime

weekdays = {
    'Monday': '월요일',
    'Tuesday': '화요일',
    'Wednesday': '수요일',
    'Thursday': '목요일',
    'Friday': '금요일',
    'Saturday': '토요일',
    'Sunday': '일요일'
}

while True:
    now = datetime.now()
    weekday_eng = now.strftime("%A")
    weekday_kor = weekdays[weekday_eng]
    current_time = now.strftime(f"%Y-%m-%d ({weekday_kor}) %H:%M:%S")
    print(current_time)
    time.sleep(5)
