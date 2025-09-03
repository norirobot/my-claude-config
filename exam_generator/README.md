# 한국 국가공인자격증 시험 대비 문제 생성 프로그램 v2.0

PDF 또는 TXT 파일에서 한국 국가공인자격증 시험 대비 4지선다형 객관식 문제를 자동으로 생성하는 프로그램입니다.

## 🆕 v2.0 개선사항
- **선택지 중복 문제 해결**: 다양한 오답 생성 전략으로 선택지 품질 향상 (100% 다양성 달성)
- **개선된 UI/UX**: 더 나은 사용자 경험을 위한 Streamlit 인터페이스 개선
- **통계 대시보드**: 생성된 문제의 분석 및 통계 기능 추가
- **하이브리드 모드**: 로컬 및 API 모드를 선택적으로 사용 가능

## 주요 기능

- **문서 읽기**: PDF 및 TXT 파일 지원
- **문제 자동 생성**: OpenAI API를 활용한 지능형 문제 생성
- **다양한 문제 유형**: 정의형, 특징형, 비교형, 적용형
- **난이도 설정**: 상/중/하 난이도 선택 가능
- **JSON/Excel 내보내기**: 생성된 문제를 다양한 형식으로 저장
- **웹 인터페이스**: Streamlit 기반 사용자 친화적 UI

## 설치 방법

### 1. 저장소 클론 또는 다운로드
```bash
cd exam_generator
```

### 2. 가상환경 생성 및 활성화 (권장)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. 필수 패키지 설치
```bash
pip install -r requirements.txt
```

### 4. OpenAI API 키 설정

#### 방법 1: 환경변수 설정
```bash
# Windows
set OPENAI_API_KEY=your-api-key-here

# macOS/Linux
export OPENAI_API_KEY=your-api-key-here
```

#### 방법 2: .env 파일 생성
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용 추가:
```
OPENAI_API_KEY=your-api-key-here
```

## 사용 방법

### 명령줄 인터페이스 (CLI)

기본 사용법:
```bash
python main.py input.pdf
```

고급 옵션:
```bash
python main.py input.pdf --difficulty 상 --type 적용형 --num-questions 10 --excel
```

#### CLI 옵션
- `input_file`: 입력 파일 경로 (필수)
- `--api-key`: OpenAI API 키 (환경변수로 설정 가능)
- `--output`: 출력 파일명 (기본값: 자동 생성)
- `--difficulty`: 난이도 선택 [상/중/하] (기본값: 중)
- `--type`: 문제 유형 [정의형/특징형/비교형/적용형/혼합] (기본값: 혼합)
- `--num-questions`: 생성할 문제 수 (기본값: 5)
- `--excel`: Excel 파일로도 저장
- `--paragraph`: 문단별로 문제 생성

### 웹 인터페이스 (Streamlit)

```bash
streamlit run app.py
```

브라우저에서 `http://localhost:8501` 접속

#### 웹 인터페이스 사용법
1. 사이드바에서 OpenAI API 키 입력
2. 문제 생성 옵션 설정 (난이도, 유형, 개수)
3. PDF 또는 TXT 파일 업로드
4. "문서 읽기" 버튼 클릭
5. "문제 생성" 버튼 클릭
6. 생성된 문제 확인 및 다운로드

## 프로젝트 구조

```
exam_generator/
│
├── document_reader.py    # 문서 읽기 모듈
├── question_generator.py # 문제 생성 엔진
├── data_manager.py       # 데이터 관리 및 저장
├── main.py              # CLI 메인 실행 파일
├── app.py               # Streamlit 웹 인터페이스
├── requirements.txt     # 필수 패키지 목록
├── README.md           # 프로젝트 문서
└── output/             # 생성된 문제 저장 디렉토리
```

## 출력 형식

### JSON 형식
```json
{
  "metadata": {
    "created_at": "2024-01-01T12:00:00",
    "total_questions": 5,
    "difficulty": "중",
    "question_type": "혼합"
  },
  "questions": [
    {
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 0,
      "explanation": "정답 해설",
      "difficulty": "중",
      "question_type": "정의형"
    }
  ]
}
```

## 문제 유형 설명

- **정의형**: 핵심 개념이나 용어의 정의를 묻는 문제
- **특징형**: 특정 주제나 개념의 특징을 묻는 문제
- **비교형**: 두 개 이상의 개념을 비교하는 문제
- **적용형**: 이론을 실제 상황에 적용하는 문제
- **혼합**: 모든 유형을 골고루 포함

## 난이도 기준

- **상**: 심화 개념, 복잡한 적용, 종합적 사고 필요
- **중**: 기본 개념의 이해와 간단한 적용
- **하**: 단순 암기, 기초 개념

## 예시 명령어

### 정보처리기사 시험 문제 생성
```bash
python main.py 정보처리기사_교재.pdf --difficulty 중 --type 혼합 --num-questions 20 --excel
```

### 한국사능력검정시험 문제 생성
```bash
python main.py 한국사_요약.txt --difficulty 상 --type 적용형 --num-questions 15
```

### 토익 스피킹 관련 문제 생성
```bash
python main.py toeic_speaking.pdf --difficulty 하 --type 정의형 --num-questions 10 --paragraph
```

## 주의사항

1. **API 사용량**: OpenAI API는 사용량에 따라 비용이 발생합니다
2. **파일 크기**: 매우 큰 PDF 파일은 처리 시간이 오래 걸릴 수 있습니다
3. **텍스트 품질**: 스캔된 PDF의 경우 OCR 품질에 따라 결과가 달라질 수 있습니다
4. **한글 인코딩**: TXT 파일은 UTF-8 또는 CP949 인코딩을 지원합니다

## 문제 해결

### OpenAI API 키 오류
- API 키가 올바른지 확인
- 환경변수가 제대로 설정되었는지 확인
- API 사용 한도를 초과하지 않았는지 확인

### PDF 읽기 오류
- PDF 파일이 손상되지 않았는지 확인
- 암호화된 PDF는 지원하지 않음
- 스캔된 PDF의 경우 텍스트 추출이 어려울 수 있음

### 문제 생성 실패
- 입력 텍스트가 충분한지 확인 (최소 200자 이상 권장)
- 네트워크 연결 상태 확인
- API 응답 시간 초과 시 재시도

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여

버그 리포트, 기능 제안, 풀 리퀘스트를 환영합니다!