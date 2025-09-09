"""
Volty Advanced Integration - 핵심 메서드 구현부
실제 프로젝트 생성, Arduino 코드 생성, 장비 연동 메서드들
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog, simpledialog
import os
import subprocess
import tempfile
from datetime import datetime
import json

class VoltyAdvancedMethods:
    """고급 기능 메서드 모음"""
    
    def create_new_project(self):
        """새 프로젝트 생성"""
        dialog = ProjectCreationDialog(self.root, self.parts_db)
        self.root.wait_window(dialog.dialog)
        
        if dialog.result:
            project_data = dialog.result
            
            try:
                # 데이터베이스에 프로젝트 추가
                self.cursor.execute('''
                    INSERT INTO projects (name, description, status, created_date, 
                                        target_views, estimated_cost, parts_list)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    project_data['name'],
                    project_data['description'],
                    'planning',
                    datetime.now().isoformat(),
                    project_data['target_views'],
                    project_data['estimated_cost'],
                    json.dumps(project_data['parts'])
                ))
                
                self.conn.commit()
                self.load_projects()
                
                # 프로젝트 폴더 생성
                project_dir = self.data_dir / 'projects' / project_data['name']
                project_dir.mkdir(parents=True, exist_ok=True)
                
                # 기본 파일들 생성
                (project_dir / 'fusion_files').mkdir(exist_ok=True)
                (project_dir / 'arduino_code').mkdir(exist_ok=True)
                (project_dir / 'stl_files').mkdir(exist_ok=True)
                (project_dir / 'scan_files').mkdir(exist_ok=True)
                
                self.add_notification(f"프로젝트 '{project_data['name']}' 생성 완료!")
                self.add_system_log(f"새 프로젝트 생성: {project_data['name']}")
                
                # 자동으로 Arduino 코드 생성 (타입에 따라)
                if project_data['type'] == 'smith_alignment':
                    self.generate_smith_alignment_code()
                elif project_data['type'] == 'squat_guide':
                    self.generate_squat_guide_code()
                
            except sqlite3.IntegrityError:
                messagebox.showerror("오류", "같은 이름의 프로젝트가 이미 존재합니다.")
            except Exception as e:
                messagebox.showerror("오류", f"프로젝트 생성 실패: {str(e)}")
    
    def generate_smith_alignment_code(self):
        """스미스머신 벤치 정렬 Arduino 코드 생성"""
        code = '''
/*
 * 스미스머신 벤치 정렬 시스템
 * 초음파 센서로 양쪽 거리를 측정하여 중앙 정렬 확인
 * 작성자: Volty 자동생성
 */

// 핀 설정
#define LEFT_TRIG_PIN 2
#define LEFT_ECHO_PIN 3
#define RIGHT_TRIG_PIN 4
#define RIGHT_ECHO_PIN 5
#define BUZZER_PIN 8
#define LED_GREEN_PIN 9
#define LED_RED_PIN 10
#define OLED_SDA 11
#define OLED_SCL 12

#include <Wire.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// 허용 오차 (cm)
#define TOLERANCE 2

void setup() {
  Serial.begin(9600);
  
  // 핀 모드 설정
  pinMode(LEFT_TRIG_PIN, OUTPUT);
  pinMode(LEFT_ECHO_PIN, INPUT);
  pinMode(RIGHT_TRIG_PIN, OUTPUT);
  pinMode(RIGHT_ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  
  // OLED 초기화
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED 초기화 실패"));
    for(;;);
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("Smith Machine");
  display.println("Bench Aligner");
  display.println("Ready...");
  display.display();
  
  Serial.println("스미스머신 벤치 정렬 시스템 시작");
}

void loop() {
  // 양쪽 거리 측정
  float leftDistance = measureDistance(LEFT_TRIG_PIN, LEFT_ECHO_PIN);
  float rightDistance = measureDistance(RIGHT_TRIG_PIN, RIGHT_ECHO_PIN);
  
  // 차이 계산
  float difference = abs(leftDistance - rightDistance);
  
  // OLED 디스플레이 업데이트
  display.clearDisplay();
  display.setCursor(0,0);
  display.setTextSize(1);
  display.println("Smith Aligner");
  display.println("-------------");
  
  display.print("Left: ");
  display.print(leftDistance, 1);
  display.println(" cm");
  
  display.print("Right: ");
  display.print(rightDistance, 1);
  display.println(" cm");
  
  display.print("Diff: ");
  display.print(difference, 1);
  display.println(" cm");
  
  // 정렬 상태 판단 및 표시
  if (difference <= TOLERANCE) {
    // 정렬됨
    digitalWrite(LED_GREEN_PIN, HIGH);
    digitalWrite(LED_RED_PIN, LOW);
    
    display.setTextSize(2);
    display.println("ALIGNED!");
    
    // 성공 신호음
    tone(BUZZER_PIN, 1000, 200);
    
    Serial.println("✅ 벤치가 중앙에 정렬되었습니다!");
    
  } else {
    // 정렬 안됨
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_RED_PIN, HIGH);
    
    display.setTextSize(1);
    
    if (leftDistance < rightDistance) {
      display.println(">>> Move RIGHT");
    } else {
      display.println("<<< Move LEFT");
    }
    
    // 경고 신호음 (차이가 클수록 빠름)
    int beepDelay = map(difference * 10, 0, 100, 100, 1000);
    tone(BUZZER_PIN, 500, 100);
    
    Serial.print("⚠️ 정렬 필요 - 차이: ");
    Serial.print(difference, 1);
    Serial.println(" cm");
  }
  
  display.display();
  
  // 거리와 정렬 정보를 시리얼로 출력 (앱에서 수집 가능)
  Serial.print("DATA:");
  Serial.print(leftDistance);
  Serial.print(",");
  Serial.print(rightDistance);
  Serial.print(",");
  Serial.print(difference);
  Serial.print(",");
  Serial.println(difference <= TOLERANCE ? "ALIGNED" : "MISALIGNED");
  
  delay(500);
}

float measureDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH);
  float distance = duration / 58.2;
  
  // 측정 오류 처리
  if (distance > 400 || distance < 2) {
    return -1; // 측정 실패
  }
  
  return distance;
}

/*
 * 필요한 부품 리스트:
 * - Arduino Uno R3 x1
 * - HC-SR04 초음파센서 x2 
 * - 0.96인치 OLED 디스플레이 x1
 * - 부저 x1
 * - LED (빨강, 초록) x2
 * - 저항 220Ω x2
 * - 점퍼선 및 브레드보드
 * 
 * 예상 비용: 약 25,000원 (한국 구매 기준)
 * 
 * 설치 방법:
 * 1. 스미스머신 양쪽 기둥에 초음파 센서 장착
 * 2. 벤치 위나 벽면에 디스플레이와 LED 설치
 * 3. Arduino는 안전한 곳에 고정
 */
'''
        
        self.arduino_code_text.delete(1.0, tk.END)
        self.arduino_code_text.insert(1.0, code)
        self.add_notification("스미스머신 정렬 코드가 생성되었습니다!")
        
        # 현재 프로젝트에 코드 저장
        if self.current_project:
            self.save_code_to_project(code, "smith_alignment.ino")
    
    def generate_squat_guide_code(self):
        """스쿼트 발판 가이드 Arduino 코드 생성"""
        code = '''
/*
 * 스쿼트 발판 각도/위치 가이드 시스템
 * 압력 센서와 자이로 센서로 발 위치와 기울기 측정
 * 작성자: Volty 자동생성
 */

// 핀 설정
#define LEFT_PRESSURE_PIN A0
#define RIGHT_PRESSURE_PIN A1
#define BUZZER_PIN 6
#define LED_STRIP_PIN 7

#include <Wire.h>
#include <MPU6050.h>
#include <Adafruit_NeoPixel.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define NUM_LEDS 16

// 객체 선언
MPU6050 mpu;
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, LED_STRIP_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// 변수
float targetAngle = 15.0; // 목표 각도 (도)
float angleThreshold = 2.0; // 허용 오차
int leftPressure, rightPressure;
float currentAngle;
int squatCount = 0;
bool inSquat = false;

void setup() {
  Serial.begin(9600);
  
  // MPU6050 초기화
  Wire.begin();
  mpu.initialize();
  
  if (!mpu.testConnection()) {
    Serial.println("MPU6050 연결 실패!");
    while(1);
  }
  
  // OLED 초기화
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED 초기화 실패!");
    while(1);
  }
  
  // LED 스트립 초기화
  strip.begin();
  strip.show();
  
  // 부저 핀 설정
  pinMode(BUZZER_PIN, OUTPUT);
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("Squat Guide");
  display.println("System Ready");
  display.display();
  
  Serial.println("스쿼트 가이드 시스템 시작");
  delay(2000);
}

void loop() {
  // 압력 센서 읽기
  leftPressure = analogRead(LEFT_PRESSURE_PIN);
  rightPressure = analogRead(RIGHT_PRESSURE_PIN);
  
  // 자이로 센서에서 각도 읽기
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  
  currentAngle = atan2(ay, az) * 180.0 / PI;
  
  // 발 위치 균형 확인
  float pressureBalance = abs(leftPressure - rightPressure);
  bool balanceGood = pressureBalance < 50; // 임계값 조정 가능
  
  // 각도 확인
  float angleDiff = abs(currentAngle - targetAngle);
  bool angleGood = angleDiff < angleThreshold;
  
  // 스쿼트 카운트 (압력이 일정 수준 이상이고, 각도가 적절할 때)
  bool currentSquatPosition = (leftPressure > 300 && rightPressure > 300 && angleGood);
  
  if (currentSquatPosition && !inSquat) {
    squatCount++;
    inSquat = true;
    tone(BUZZER_PIN, 800, 200); // 성공 사운드
  } else if (!currentSquatPosition) {
    inSquat = false;
  }
  
  // OLED 디스플레이 업데이트
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("SQUAT GUIDE");
  display.println("------------");
  
  display.print("Count: ");
  display.println(squatCount);
  
  display.print("Angle: ");
  display.print(currentAngle, 1);
  display.print(" (");
  display.print(targetAngle, 1);
  display.println(")");
  
  display.print("L-Press: ");
  display.println(leftPressure);
  display.print("R-Press: ");
  display.println(rightPressure);
  
  // 상태 표시
  if (balanceGood && angleGood) {
    display.println("PERFECT FORM!");
  } else {
    if (!balanceGood) {
      display.println("Balance feet!");
    }
    if (!angleGood) {
      if (currentAngle < targetAngle - angleThreshold) {
        display.println("Lean forward!");
      } else {
        display.println("Lean back!");
      }
    }
  }
  
  display.display();
  
  // LED 스트립으로 시각적 피드백
  updateLEDFeedback(balanceGood, angleGood, pressureBalance, angleDiff);
  
  // 시리얼 데이터 출력 (앱에서 수집)
  Serial.print("SQUAT_DATA:");
  Serial.print(squatCount);
  Serial.print(",");
  Serial.print(currentAngle, 2);
  Serial.print(",");
  Serial.print(leftPressure);
  Serial.print(",");
  Serial.print(rightPressure);
  Serial.print(",");
  Serial.print(balanceGood ? "BALANCED" : "UNBALANCED");
  Serial.print(",");
  Serial.println(angleGood ? "ANGLE_OK" : "ANGLE_BAD");
  
  delay(100);
}

void updateLEDFeedback(bool balanceGood, bool angleGood, float pressureBalance, float angleDiff) {
  strip.clear();
  
  if (balanceGood && angleGood) {
    // 완벽한 자세 - 녹색
    for (int i = 0; i < NUM_LEDS; i++) {
      strip.setPixelColor(i, strip.Color(0, 255, 0));
    }
  } else {
    // 발 균형 표시 (왼쪽 8개 LED)
    uint8_t balanceIntensity = map(constrain(pressureBalance, 0, 200), 0, 200, 255, 0);
    uint32_t balanceColor = balanceGood ? 
      strip.Color(0, balanceIntensity, 0) : 
      strip.Color(255 - balanceIntensity, balanceIntensity, 0);
    
    for (int i = 0; i < 8; i++) {
      strip.setPixelColor(i, balanceColor);
    }
    
    // 각도 표시 (오른쪽 8개 LED)
    uint8_t angleIntensity = map(constrain(angleDiff * 10, 0, 50), 0, 50, 255, 0);
    uint32_t angleColor = angleGood ? 
      strip.Color(0, angleIntensity, 0) : 
      strip.Color(255 - angleIntensity, angleIntensity, 0);
    
    for (int i = 8; i < 16; i++) {
      strip.setPixelColor(i, angleColor);
    }
  }
  
  strip.show();
}

/*
 * 필요한 부품 리스트:
 * - Arduino Uno R3 x1
 * - MPU6050 자이로/가속도 센서 x1
 * - 압력센서 (FSR402) x2
 * - 0.96인치 OLED 디스플레이 x1
 * - WS2812B LED 스트립 (16개) x1
 * - 부저 x1
 * - 저항 10kΩ x2 (풀업용)
 * - 점퍼선 및 브레드보드
 * - 3D 프린팅된 발판 (STL 파일 제공)
 * 
 * 예상 비용: 약 35,000원 (한국 구매 기준)
 * 
 * 3D 프린팅 안내:
 * - 발판 크기: 30cm x 15cm x 3cm
 * - 재질: PLA+ 또는 PETG 권장
 * - 인필: 20% 이상
 * - 압력센서 삽입구 포함
 */
'''
        
        self.arduino_code_text.delete(1.0, tk.END)
        self.arduino_code_text.insert(1.0, code)
        self.add_notification("스쿼트 가이드 코드가 생성되었습니다!")
        
        if self.current_project:
            self.save_code_to_project(code, "squat_guide.ino")
    
    def generate_weight_sensor_code(self):
        """운동 무게 측정 코드 생성"""
        code = '''
/*
 * 운동 무게 측정 시스템
 * HX711 로드셀 앰프와 무게 센서로 정확한 중량 측정
 * 작성자: Volty 자동생성
 */

#include <HX711.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>

#define LOADCELL_DOUT_PIN 2
#define LOADCELL_SCK_PIN 3
#define BUZZER_PIN 8
#define BUTTON_TARE 9
#define BUTTON_UNIT 10

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

HX711 scale;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

float calibration_factor = -7050; // 보정 계수 (실제 무게로 조정 필요)
bool useKG = true;
float currentWeight = 0;
float maxWeight = 0;
int repCount = 0;
bool inRep = false;
float thresholdWeight = 5.0; // kg

void setup() {
  Serial.begin(9600);
  
  pinMode(BUTTON_TARE, INPUT_PULLUP);
  pinMode(BUTTON_UNIT, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare(); // 영점 조정
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED 초기화 실패!");
    while(1);
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("Weight Monitor");
  display.println("Calibrating...");
  display.display();
  
  delay(2000);
  
  Serial.println("운동 무게 측정 시스템 준비 완료");
}

void loop() {
  // 버튼 체크
  if (digitalRead(BUTTON_TARE) == LOW) {
    scale.tare();
    maxWeight = 0;
    repCount = 0;
    tone(BUZZER_PIN, 1000, 200);
    delay(500);
  }
  
  if (digitalRead(BUTTON_UNIT) == LOW) {
    useKG = !useKG;
    tone(BUZZER_PIN, 800, 100);
    delay(500);
  }
  
  // 무게 측정
  if (scale.is_ready()) {
    currentWeight = scale.get_units();
    
    if (currentWeight < 0) currentWeight = 0; // 음수 제거
    
    // 단위 변환
    float displayWeight = currentWeight;
    if (!useKG) {
      displayWeight *= 2.205; // kg to lbs
    }
    
    // 반복 카운트
    if (displayWeight > thresholdWeight && !inRep) {
      repCount++;
      inRep = true;
      tone(BUZZER_PIN, 600, 150);
    } else if (displayWeight < thresholdWeight * 0.5) {
      inRep = false;
    }
    
    // 최대 무게 기록
    if (displayWeight > maxWeight) {
      maxWeight = displayWeight;
    }
    
    // 디스플레이 업데이트
    display.clearDisplay();
    display.setTextSize(2);
    display.setCursor(0,0);
    display.print(displayWeight, 1);
    display.setTextSize(1);
    display.println(useKG ? " kg" : " lbs");
    
    display.setTextSize(1);
    display.println();
    display.print("Max: ");
    display.print(maxWeight, 1);
    display.println(useKG ? " kg" : " lbs");
    
    display.print("Reps: ");
    display.println(repCount);
    
    // 목표 무게 도달 시 알림
    float targetWeight = useKG ? 80.0 : 176.0;
    if (displayWeight >= targetWeight) {
      display.println("TARGET REACHED!");
    }
    
    display.display();
    
    // 시리얼 데이터
    Serial.print("WEIGHT_DATA:");
    Serial.print(displayWeight, 2);
    Serial.print(",");
    Serial.print(maxWeight, 2);
    Serial.print(",");
    Serial.print(repCount);
    Serial.print(",");
    Serial.println(useKG ? "KG" : "LBS");
  }
  
  delay(100);
}

/*
 * 필요한 부품 리스트:
 * - Arduino Uno R3 x1
 * - HX711 로드셀 앰프 x1
 * - 로드셀 (50kg or 100kg) x1
 * - 0.96인치 OLED 디스플레이 x1
 * - 택트 스위치 x2
 * - 부저 x1
 * - 점퍼선 및 브레드보드
 * 
 * 예상 비용: 약 45,000원
 */
'''
        self.arduino_code_text.delete(1.0, tk.END)
        self.arduino_code_text.insert(1.0, code)
        self.add_notification("무게 측정 코드가 생성되었습니다!")
    
    def generate_exercise_counter_code(self):
        """운동 카운터 코드 생성"""
        code = '''
/*
 * 운동 반복 카운터
 * 자이로센서로 운동 동작 자동 인식 및 카운트
 * 작성자: Volty 자동생성
 */

#include <Wire.h>
#include <MPU6050.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define BUZZER_PIN 8
#define BUTTON_RESET 9
#define BUTTON_MODE 10

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
MPU6050 mpu;

// 운동 모드
enum ExerciseMode {
  PUSH_UP,
  SQUAT,
  BICEP_CURL,
  BENCH_PRESS
};

ExerciseMode currentMode = PUSH_UP;
String modeNames[] = {"Push-up", "Squat", "Bicep Curl", "Bench Press"};

int repCount = 0;
float currentAngle = 0;
float lastAngle = 0;
bool inMotion = false;
int motionDirection = 0; // 1: up, -1: down, 0: neutral
int setCount = 1;
unsigned long setStartTime = 0;
unsigned long lastRepTime = 0;

// 각 운동별 임계값
float thresholds[][2] = {
  {-20, 20},    // Push-up: 아래(-20도) -> 위(20도)
  {-30, 10},    // Squat: 앉기(-30도) -> 서기(10도)
  {-40, 40},    // Bicep Curl: 아래(-40도) -> 위(40도)
  {-15, 45}     // Bench Press: 가슴(-15도) -> 위(45도)
};

void setup() {
  Serial.begin(9600);
  
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_RESET, INPUT_PULLUP);
  pinMode(BUTTON_MODE, INPUT_PULLUP);
  
  Wire.begin();
  mpu.initialize();
  
  if (!mpu.testConnection()) {
    Serial.println("MPU6050 연결 실패!");
    while(1);
  }
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED 초기화 실패!");
    while(1);
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("Exercise Counter");
  display.println("Ready!");
  display.display();
  
  setStartTime = millis();
  
  Serial.println("운동 카운터 시작");
}

void loop() {
  // 버튼 체크
  if (digitalRead(BUTTON_RESET) == LOW) {
    repCount = 0;
    setCount++;
    setStartTime = millis();
    tone(BUZZER_PIN, 1000, 200);
    delay(500);
  }
  
  if (digitalRead(BUTTON_MODE) == LOW) {
    currentMode = (ExerciseMode)((currentMode + 1) % 4);
    tone(BUZZER_PIN, 800, 100);
    delay(500);
  }
  
  // 각도 측정
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  
  currentAngle = atan2(ay, az) * 180.0 / PI;
  
  // 운동 동작 인식
  detectExerciseMotion();
  
  // 디스플레이 업데이트
  updateDisplay();
  
  // 시리얼 데이터
  outputSerialData();
  
  lastAngle = currentAngle;
  delay(50);
}

void detectExerciseMotion() {
  float lowerThreshold = thresholds[currentMode][0];
  float upperThreshold = thresholds[currentMode][1];
  
  // 각도 변화 감지
  float angleDiff = currentAngle - lastAngle;
  
  if (abs(angleDiff) > 2) { // 움직임 감지
    if (angleDiff > 0 && motionDirection <= 0) {
      // 상승 동작 시작
      motionDirection = 1;
      inMotion = true;
    } else if (angleDiff < 0 && motionDirection >= 0) {
      // 하강 동작 시작
      motionDirection = -1;
      inMotion = true;
    }
  }
  
  // 반복 완료 감지
  if (inMotion) {
    if (currentMode == PUSH_UP || currentMode == BENCH_PRESS) {
      // 푸시업/벤치프레스: 아래 -> 위 -> 아래로 돌아오면 1회
      if (motionDirection == -1 && currentAngle <= lowerThreshold) {
        completeRep();
      }
    } else {
      // 스쿼트/이두운동: 위 -> 아래 -> 위로 돌아오면 1회  
      if (motionDirection == 1 && currentAngle >= upperThreshold) {
        completeRep();
      }
    }
  }
}

void completeRep() {
  unsigned long currentTime = millis();
  
  // 너무 빠른 반복 방지 (최소 1초 간격)
  if (currentTime - lastRepTime > 1000) {
    repCount++;
    lastRepTime = currentTime;
    
    // 피드백
    tone(BUZZER_PIN, 600, 150);
    
    // 10회마다 축하 사운드
    if (repCount % 10 == 0) {
      for (int i = 0; i < 3; i++) {
        tone(BUZZER_PIN, 800, 100);
        delay(150);
      }
    }
    
    inMotion = false;
    motionDirection = 0;
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  
  // 운동 모드 표시
  display.print("Mode: ");
  display.println(modeNames[currentMode]);
  
  display.println("---------------");
  
  // 세트와 반복 횟수
  display.setTextSize(2);
  display.print("Set ");
  display.println(setCount);
  
  display.print(repCount);
  display.setTextSize(1);
  display.println(" reps");
  
  // 각도 정보
  display.print("Angle: ");
  display.print(currentAngle, 1);
  display.println("°");
  
  // 시간 정보
  unsigned long elapsedTime = (millis() - setStartTime) / 1000;
  display.print("Time: ");
  display.print(elapsedTime / 60);
  display.print(":");
  if (elapsedTime % 60 < 10) display.print("0");
  display.println(elapsedTime % 60);
  
  display.display();
}

void outputSerialData() {
  Serial.print("EXERCISE_DATA:");
  Serial.print(modeNames[currentMode]);
  Serial.print(",");
  Serial.print(setCount);
  Serial.print(",");
  Serial.print(repCount);
  Serial.print(",");
  Serial.print(currentAngle, 2);
  Serial.print(",");
  Serial.println(inMotion ? "ACTIVE" : "REST");
}

/*
 * 필요한 부품 리스트:
 * - Arduino Uno R3 x1
 * - MPU6050 자이로/가속도 센서 x1
 * - 0.96인치 OLED 디스플레이 x1
 * - 택트 스위치 x2
 * - 부저 x1
 * - 점퍼선 및 브레드보드
 * - 웨어러블 케이스 (3D 프린팅)
 * 
 * 예상 비용: 약 28,000원
 * 
 * 착용 위치:
 * - 푸시업: 등 중앙
 * - 스쿼트: 허리 또는 허벅지
 * - 이두운동: 팔뚝
 * - 벤치프레스: 가슴
 */
'''
        self.arduino_code_text.delete(1.0, tk.END)
        self.arduino_code_text.insert(1.0, code)
        self.add_notification("운동 카운터 코드가 생성되었습니다!")
    
    def check_fusion_status(self):
        """Fusion 360 상태 확인"""
        try:
            import psutil
            fusion_running = False
            for proc in psutil.process_iter(['pid', 'name']):
                if 'Fusion360' in proc.info['name']:
                    fusion_running = True
                    break
            
            if fusion_running != self.equipment_status['fusion_360']['connected']:
                self.equipment_status['fusion_360']['connected'] = fusion_running
                status_text = "✅ 연결됨" if fusion_running else "❌ 연결 안됨"
                color = 'green' if fusion_running else 'red'
                self.fusion_status.config(text=status_text, foreground=color)
                
                if fusion_running:
                    self.add_notification("Fusion 360이 연결되었습니다.")
                else:
                    self.add_notification("Fusion 360 연결이 끊어졌습니다.")
                    
        except Exception as e:
            self.add_system_log(f"Fusion 상태 확인 오류: {str(e)}")
    
    def check_printer_status(self):
        """Bambu Lab 프린터 상태 확인"""
        # 실제로는 네트워크 스캔이나 Bambu Lab API를 사용
        # 여기서는 데모용 시뮬레이션
        try:
            # 네트워크에서 프린터 찾기 (실제 구현 시)
            # scan_network_for_printers()
            
            # 임시로 랜덤 상태 시뮬레이션
            import random
            for i in range(4):
                if random.random() > 0.7:  # 30% 확률로 상태 변경
                    status_options = ["⚪ 대기중", "🟢 출력중", "🟡 일시정지", "🔴 오류"]
                    temp_options = ["🌡️ 25/210°C", "🌡️ 210/210°C", "🌡️ --/--°C"]
                    progress_options = ["📊 0%", "📊 35%", "📊 67%", "📊 100%"]
                    
                    status_label = getattr(self, f'printer_{i}_status')
                    temp_label = getattr(self, f'printer_{i}_temp')
                    progress_label = getattr(self, f'printer_{i}_progress')
                    
                    status_label.config(text=random.choice(status_options))
                    temp_label.config(text=random.choice(temp_options))
                    progress_label.config(text=random.choice(progress_options))
                    
        except Exception as e:
            self.add_system_log(f"프린터 상태 확인 오류: {str(e)}")
    
    def check_arduino_ports(self):
        """Arduino 포트 확인"""
        try:
            import serial.tools.list_ports
            current_ports = [port.device for port in serial.tools.list_ports.comports()]
            
            if current_ports != self.equipment_status['arduino_ports']:
                self.equipment_status['arduino_ports'] = current_ports
                self.arduino_port['values'] = current_ports
                
                if current_ports:
                    self.arduino_port.set(current_ports[0])
                    self.add_notification(f"Arduino 포트 발견: {', '.join(current_ports)}")
                else:
                    self.add_notification("연결된 Arduino가 없습니다.")
                    
        except Exception as e:
            self.add_system_log(f"Arduino 포트 확인 오류: {str(e)}")
    
    def save_code_to_project(self, code, filename):
        """현재 프로젝트에 Arduino 코드 저장"""
        if not self.current_project:
            return
            
        project_dir = self.data_dir / 'projects' / self.current_project / 'arduino_code'
        project_dir.mkdir(parents=True, exist_ok=True)
        
        code_file = project_dir / filename
        with open(code_file, 'w', encoding='utf-8') as f:
            f.write(code)
        
        self.add_system_log(f"Arduino 코드 저장됨: {filename}")
    
    def load_projects(self):
        """프로젝트 목록 로드"""
        self.project_tree.delete(*self.project_tree.get_children())
        
        try:
            self.cursor.execute("SELECT name, status, estimated_cost FROM projects ORDER BY created_date DESC")
            projects = self.cursor.fetchall()
            
            for project in projects:
                name, status, cost = project
                cost_str = f"₩{cost:,.0f}" if cost else "미정"
                self.project_tree.insert('', 'end', text=name, values=(status, cost_str))
                
        except Exception as e:
            self.add_system_log(f"프로젝트 로딩 오류: {str(e)}")

# 프로젝트 생성 대화상자
class ProjectCreationDialog:
    def __init__(self, parent, parts_db):
        self.result = None
        self.parts_db = parts_db
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("새 프로젝트 생성")
        self.dialog.geometry("600x700")
        self.dialog.grab_set()
        
        self.setup_dialog()
    
    def setup_dialog(self):
        # 프로젝트 기본 정보
        basic_frame = ttk.LabelFrame(self.dialog, text="기본 정보", padding=10)
        basic_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(basic_frame, text="프로젝트명:").grid(row=0, column=0, sticky=tk.W)
        self.name_entry = ttk.Entry(basic_frame, width=40)
        self.name_entry.grid(row=0, column=1, sticky=tk.EW, padx=(5, 0))
        
        ttk.Label(basic_frame, text="설명:").grid(row=1, column=0, sticky=tk.NW, pady=(5, 0))
        self.desc_text = tk.Text(basic_frame, height=3, width=40)
        self.desc_text.grid(row=1, column=1, sticky=tk.EW, padx=(5, 0), pady=(5, 0))
        
        basic_frame.grid_columnconfigure(1, weight=1)
        
        # 프로젝트 타입
        type_frame = ttk.LabelFrame(self.dialog, text="프로젝트 타입", padding=10)
        type_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.project_type = tk.StringVar(value="smith_alignment")
        
        types = [
            ("smith_alignment", "🎯 스미스머신 벤치 정렬", "초음파 센서로 벤치 중앙 정렬"),
            ("squat_guide", "🦶 스쿼트 발판 가이드", "압력센서와 각도 측정으로 자세 교정"),
            ("weight_monitor", "⚖️ 운동 무게 측정", "로드셀로 정확한 중량 측정"),
            ("exercise_counter", "🔢 운동 횟수 카운터", "자이로센서로 동작 인식"),
            ("custom", "🛠️ 커스텀 프로젝트", "직접 설정")
        ]
        
        for value, title, desc in types:
            frame = ttk.Frame(type_frame)
            frame.pack(fill=tk.X, pady=2)
            
            ttk.Radiobutton(frame, text=title, variable=self.project_type, 
                           value=value).pack(side=tk.LEFT)
            ttk.Label(frame, text=f"- {desc}", foreground='gray').pack(side=tk.LEFT, padx=(10, 0))
        
        # 예상 정보
        estimate_frame = ttk.LabelFrame(self.dialog, text="예상 정보", padding=10)
        estimate_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(estimate_frame, text="목표 조회수:").grid(row=0, column=0, sticky=tk.W)
        self.views_entry = ttk.Entry(estimate_frame, width=20)
        self.views_entry.grid(row=0, column=1, sticky=tk.W, padx=(5, 0))
        self.views_entry.insert(0, "50000")
        
        ttk.Label(estimate_frame, text="예상 비용:").grid(row=1, column=0, sticky=tk.W, pady=(5, 0))
        self.cost_entry = ttk.Entry(estimate_frame, width=20)
        self.cost_entry.grid(row=1, column=1, sticky=tk.W, padx=(5, 0), pady=(5, 0))
        self.cost_entry.insert(0, "30000")
        
        # 필요 부품 자동 계산 버튼
        ttk.Button(estimate_frame, text="🧮 비용 자동 계산", 
                  command=self.calculate_cost).grid(row=1, column=2, padx=(10, 0), pady=(5, 0))
        
        # 버튼
        button_frame = ttk.Frame(self.dialog)
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Button(button_frame, text="생성", command=self.create_project).pack(side=tk.RIGHT, padx=(5, 0))
        ttk.Button(button_frame, text="취소", command=self.dialog.destroy).pack(side=tk.RIGHT)
    
    def calculate_cost(self):
        """선택된 프로젝트 타입에 따른 비용 자동 계산"""
        project_type = self.project_type.get()
        
        # 각 프로젝트 타입별 필요 부품
        required_parts = {
            'smith_alignment': [
                ('arduino_boards', 'Arduino Uno R3', 1),
                ('sensors', 'HC-SR04 초음파센서', 2),
                ('displays', '0.96인치 OLED 128x64', 1)
            ],
            'squat_guide': [
                ('arduino_boards', 'Arduino Uno R3', 1),
                ('sensors', 'MPU6050 자이로센서', 1),
                ('displays', '0.96인치 OLED 128x64', 1)
            ],
            'weight_monitor': [
                ('arduino_boards', 'Arduino Uno R3', 1)
            ],
            'exercise_counter': [
                ('arduino_boards', 'Arduino Uno R3', 1),
                ('sensors', 'MPU6050 자이로센서', 1),
                ('displays', '0.96인치 OLED 128x64', 1)
            ]
        }
        
        if project_type in required_parts:
            total_cost = 0
            for category, part_name, quantity in required_parts[project_type]:
                if category in self.parts_db and part_name in self.parts_db[category]:
                    part_cost = self.parts_db[category][part_name]['price_kr']
                    total_cost += part_cost * quantity
            
            self.cost_entry.delete(0, tk.END)
            self.cost_entry.insert(0, str(int(total_cost)))
    
    def create_project(self):
        """프로젝트 생성"""
        name = self.name_entry.get().strip()
        description = self.desc_text.get(1.0, tk.END).strip()
        project_type = self.project_type.get()
        
        try:
            target_views = int(self.views_entry.get())
            estimated_cost = float(self.cost_entry.get())
        except ValueError:
            messagebox.showerror("오류", "목표 조회수와 예상 비용은 숫자여야 합니다.")
            return
        
        if not name:
            messagebox.showerror("오류", "프로젝트명을 입력해주세요.")
            return
        
        self.result = {
            'name': name,
            'description': description,
            'type': project_type,
            'target_views': target_views,
            'estimated_cost': estimated_cost,
            'parts': []  # 나중에 부품 목록 추가
        }
        
        self.dialog.destroy()

# 메서드를 기존 클래스에 추가하기 위한 함수들
def add_methods_to_class():
    """AdvancedVoltyManager 클래스에 메서드들을 동적으로 추가"""
    import types
    
    # VoltyAdvancedMethods의 모든 메서드를 가져와서 AdvancedVoltyManager에 추가
    for name, method in VoltyAdvancedMethods.__dict__.items():
        if callable(method) and not name.startswith('__'):
            # 메서드를 AdvancedVoltyManager 클래스에 바인딩
            setattr(AdvancedVoltyManager, name, method)

# 실행 시 메서드 추가
if __name__ == "__main__":
    add_methods_to_class()