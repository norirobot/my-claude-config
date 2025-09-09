# 실제 사용 예시 - Volty 프로젝트 매니저

## 실제 시나리오: 스미스머신 정렬 시스템 만들기

### 1단계: 프로젝트 생성
```
앱 실행 → Projects 탭 → "새 프로젝트" 클릭
이름: "Smith Machine Bench Aligner"
설명: "헬스장에서 벤치가 정확히 중앙에 왔는지 확인하는 시스템"
```

### 2단계: 하드웨어 확인
```
Equipment Monitor 탭 → "Auto-monitor" 체크
→ Arduino 연결하면 실시간으로 "Found ports: COM3" 표시
→ Fusion 360 실행하면 "Running" 상태 표시
```

### 3단계: 코드 작성
```
Code Templates 탭 → Category: "Sensors" → Template: "Ultrasonic Sensor"
→ Load 클릭 → 기본 초음파 센서 코드 로드됨
→ 코드 수정: 센서 2개 사용하도록 변경
→ "Save As" → "smith_aligner.ino" 저장
```

### 4단계: 하드웨어 테스트  
```
Arduino Scanner 탭 → Port: COM3 선택 → "Test Connection"
→ "Connected successfully" 메시지 확인
→ "Send 'ping'" → Arduino가 응답하는지 테스트
→ "Request Info" → 보드 정보 확인
```

### 5단계: 실제 구현
- Arduino IDE에서 생성된 코드 열어서 업로드
- 하드웨어 조립: HC-SR04 센서 2개 + Arduino Uno + OLED
- 실제 테스트: 스미스머신에서 벤치 정렬 확인

## 실제 사용자 워크플로우

### 아침 루틴 (촬영 준비)
1. **시스템 체크**: Equipment Monitor 실행해서 모든 장비 상태 확인
2. **포트 스캔**: Arduino Scanner로 모든 Arduino 보드 연결 확인  
3. **Fusion 360 실행**: 모델링 작업 준비

### 프로젝트 개발 중
1. **아이디어 정리**: Projects에서 새 프로젝트 생성
2. **코드 베이스**: Templates에서 관련 코드 로드
3. **반복 테스트**: Scanner로 Arduino 통신 테스트
4. **진행사항 기록**: 프로젝트 설명에 시행착오 내용 저장

### 촬영 직전
1. **최종 점검**: 모든 하드웨어 연결 상태 확인
2. **데모 준비**: 완성된 코드로 실제 동작 테스트
3. **백업 계획**: 문제 발생시 대체 방법 준비

## 구체적인 활용 사례

### 케이스 1: 스쿼트 발판 가이드
```
목적: 스쿼트할 때 발 각도를 일정하게 유지
하드웨어: 압력센서 + 자이로센서 + Arduino
템플릿 사용: "Button Input" + "Temperature Sensor" 조합
실제 구현: 3D 프린팅 발판 + 센서 임베드
```

### 케이스 2: 운동 횟수 카운터
```
목적: 푸시업, 스쿼트 등 자동 카운트
하드웨어: MPU6050 자이로센서 + Arduino Nano
템플릿 사용: "Serial Commands" 수정
실제 구현: 웨어러블 케이스에 장착
```

### 케이스 3: 무게 측정 시스템
```
목적: 운동 중량을 정확히 측정
하드웨어: 로드셀 + HX711 + Arduino
템플릿 사용: "Serial Monitor" 기반으로 커스텀
실제 구현: 바벨/덤벨에 센서 부착
```

## 실제 시간 절약 효과

### 기존 방식 (시스템 없이):
- 아이디어 → 구글링 → 코드 찾기 → 수정 → 테스트 → 문제 해결 → 재테스트
- **소요시간: 2-3시간**

### 시스템 사용 후:
- 프로젝트 생성 → 템플릿 로드 → 약간 수정 → 스캐너로 테스트 → 완료
- **소요시간: 30분-1시간**

## 실제 하드웨어 호환성

### 테스트된 Arduino 보드:
- Arduino Uno R3 ✅
- Arduino Nano ✅  
- NodeMCU (ESP8266) ✅
- Arduino Pro Mini ✅

### 감지되는 USB-Serial 칩:
- CH340/CH341 (중국산 클론) ✅
- CP2102 (Silicon Labs) ✅
- FTDI (정품 Arduino) ✅
- Standard Serial ✅

## 문제 해결 실제 사례

### 문제: "Arduino가 연결되어 있는데 포트가 안 보여요"
**해결**: 
1. Arduino Scanner → Refresh 클릭
2. 드라이버 설치 확인 (CH340 드라이버 등)
3. USB 케이블 교체 (데이터 전송 가능한 케이블 사용)

### 문제: "코드 업로드 후 통신이 안 돼요"
**해결**:
1. Serial Monitor 열고 Baud Rate 확인 (9600)
2. Arduino Scanner에서 다른 Baud Rate 시도
3. "Request Info" 대신 "Send 'ping'" 먼저 테스트

### 문제: "Fusion 360이 실행 중인데 감지 안 됨"
**해결**:
1. 프로세스 이름 확인 (작업 관리자에서)
2. Equipment Monitor → 수동으로 "Check" 클릭
3. 관리자 권한으로 앱 실행

## 실제 YouTube 영상 제작에 활용

### 영상 1: "Arduino로 스미스머신 완벽 정렬 시스템"
- 시스템으로 30분 만에 코드 완성
- 실제 작동하는 프로토타입으로 촬영
- 시청자들이 바로 따라 할 수 있는 완성된 코드 제공

### 영상 2: "헬스장에서 쓸 수 있는 실용적인 Arduino 프로젝트"
- 여러 템플릿 조합해서 다양한 운동 보조 도구 제작
- 실제 헬스장에서 테스트하는 모습 촬영
- 각 프로젝트별 부품 리스트와 예상 비용 제공

이렇게 **실제로 사용 가능한** 도구로 만들어서, 영상 제작 시간을 단축하고 **더 완성도 높은 컨텐츠**를 만들 수 있습니다.