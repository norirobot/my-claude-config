# 정보처리기사 기출문제 시험 시스템 - 프로젝트 컨텍스트

## 📋 프로젝트 개요

**정보처리기사 기출문제 기반 맞춤형 시험 시스템**
- 실제 기출문제를 활용한 시험 연습 플랫폼
- 학습 통계 및 성과 추적 기능
- 안전한 문제 추가 및 관리 시스템

## 🎯 핵심 요구사항 (사용자 피드백 기반)

### ✅ 완료된 핵심 기능
1. **실제 시험 모드**
   - 정답 표시 없음 (사용자 요청: "정답 표시 없애기")
   - 라디오 버튼으로 직접 선택
   - 개별 "정답 확인" 버튼

2. **완전한 학습 통계 시스템**
   - 시험 횟수 추적 ("몇회차 풀었는지")
   - 틀린 문제 추적 ("뭐가 틀렸는지")
   - 소요 시간 측정 ("시간이 얼마나 걸렸는지")
   - 카테고리별 약점 분석

3. **100% 신뢰도 보장**
   - 사용자 강조: "문제의 신뢰도는 100%여야한다"
   - "오답인데 정답이라고하면 공부한것이 허사"
   - 엄격한 데이터 무결성 검증 시스템

## 🛠️ 시스템 구조

### 📁 주요 파일들
```
exam_generator/
├── app_past_questions.py          # 메인 시험 시스템
├── past_question_manager.py       # 기출문제 관리 엔진
├── real_past_questions_db.json    # 실제 기출문제 데이터베이스 (25문제)
├── pdf_extractor.py              # PDF → CSV 변환 도구
├── secure_upload.py              # 안전한 문제 업로드 시스템
├── question_validator.py         # 문제 검증 시스템
└── sample_format.csv             # CSV 형식 가이드
```

### 🌐 시스템 포트 구성
- **포트 8503**: 📚 메인 시험 시스템 (`streamlit run app_past_questions.py`)
- **포트 8504**: 🔒 안전한 업로드 시스템 (`streamlit run secure_upload.py`)
- **포트 8505**: 📄 PDF 추출 도구 (`streamlit run pdf_extractor.py`)

## 💾 데이터 구조

### 문제 데이터 형식 (JSON)
```json
{
  "id": "2024_1_001",
  "category": "소프트웨어설계",
  "subcategory": "요구사항확인",
  "difficulty": "중",
  "year": "2024",
  "round": "1회",
  "question": "문제 내용...",
  "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
  "correct_answer": 0,
  "explanation": "해설..."
}
```

### CSV 업로드 형식
```csv
문제ID,카테고리,난이도,연도,회차,문제,선택지1,선택지2,선택지3,선택지4,정답,해설
```

### 지원 카테고리 (정확한 이름)
- `소프트웨어설계`
- `소프트웨어개발`
- `데이터베이스구축`
- `프로그래밍언어활용`
- `정보시스템구축관리`

## 🔧 기술 스택

### Python 패키지
```
streamlit
pandas
pdfplumber
json
datetime
hashlib
random
typing
dataclasses
pathlib
```

### 핵심 클래스
- `PastQuestionManager`: 기출문제 관리 및 랜덤 출제
- `PastQuestion`: 문제 데이터 클래스
- `QuestionValidator`: 문제 검증 엔진
- `SecureUploader`: 안전한 업로드 처리
- `PDFQuestionExtractor`: PDF 텍스트 추출

## 📊 사용자 요구사항 히스토리

### 주요 피드백 및 해결책
1. **"문제 퀄리티가 엉망"** → AI 생성 포기, 실제 기출문제 시스템으로 전환
2. **"답도 그냥 같은답만 이야기하네"** → 선택지 중복 제거, 셔플링 구현
3. **"정답 표시 없애기"** → 실제 시험 모드 구현
4. **"내가 가지고 올파일들은 검증이 이미 100% 다된 파일"** → 안전한 업로드 시스템 구현
5. **"파일들은 다 pdf파일"** → PDF 추출 도구 개발

### 중요한 설계 원칙
- **정확성 최우선**: 잘못된 정답으로 인한 학습 방해 절대 방지
- **실제 시험 환경**: 정답 미리보기 없음, 시간 측정
- **상세한 통계**: 학습 진도 및 약점 파악 가능
- **안전한 데이터 처리**: 업로드 과정에서 데이터 훼손 방지

## 🚀 시작 방법

### 1. 환경 설정
```bash
cd C:\Users\sintt\exam_generator
pip install streamlit pandas pdfplumber
```

### 2. 시스템 실행
```bash
# 메인 시험 시스템
streamlit run app_past_questions.py --server.port 8503

# 안전한 업로드 (필요시)
streamlit run secure_upload.py --server.port 8504

# PDF 추출 도구 (필요시)
streamlit run pdf_extractor.py --server.port 8505
```

### 3. 접속 URL
- 시험 시스템: http://localhost:8503
- 업로드 시스템: http://localhost:8504
- PDF 추출: http://localhost:8505

## 🔍 문제 해결 가이드

### 자주 발생하는 오류
1. **StreamlitAPIException: Columns may not be nested**
   - 원인: `st.columns()` 중첩 사용
   - 해결: 컬럼 구조 단순화

2. **Radio Value has invalid type: NoneType**
   - 원인: `st.radio(index=None)` 지원 안함
   - 해결: 기본 선택지 추가

3. **한글 인코딩 문제**
   - 원인: CSV 인코딩 오류
   - 해결: UTF-8-sig 사용

### 데이터 백업 정책
- 문제 추가 시 자동 백업 생성
- 파일명: `backup_questions_YYYYMMDD_HHMMSS.json`

## 📈 현재 상태

### 완료된 기능
- ✅ 25개 샘플 기출문제 포함
- ✅ 실제 시험 모드 (정답 숨김)
- ✅ 학습 통계 시스템
- ✅ 안전한 문제 추가 시스템
- ✅ PDF 추출 도구
- ✅ 무결성 검증 시스템

### 테스트 완료 상태
- ✅ 라디오 버튼 선택 동작
- ✅ 정답 확인 기능
- ✅ 시간 측정 및 통계
- ✅ CSV 업로드 및 검증
- ✅ PDF 텍스트 추출

## 🎯 다음 세션 시 확인사항

1. **현재 실행 중인 프로세스 확인**
   ```bash
   # 포트 사용 현황 확인
   netstat -ano | findstr :8503
   netstat -ano | findstr :8504
   netstat -ano | findstr :8505
   ```

2. **데이터베이스 상태 확인**
   ```bash
   # 문제 개수 확인
   python -c "import json; print(f'총 문제 수: {len(json.load(open(\"real_past_questions_db.json\", \"r\", encoding=\"utf-8\"))[\"questions\"])}개')"
   ```

3. **필요한 경우 재시작**
   ```bash
   streamlit run app_past_questions.py --server.port 8503
   ```

## 💡 확장 가능성

### 추가 개발 아이디어
- 모의고사 모드 (실제 시험 시간 제한)
- 오답노트 자동 생성
- 엑셀 리포트 출력
- 문제 즐겨찾기 기능
- 학습 계획 추천

### 성능 최적화
- 대용량 문제 DB 처리
- 이미지 포함 문제 지원
- 모바일 반응형 UI

---

**최종 업데이트**: 2025-08-22
**프로젝트 상태**: 완전 기능 구현 완료, 실사용 가능
**핵심 성과**: 사용자 요구사항 100% 반영된 신뢰할 수 있는 기출문제 시스템