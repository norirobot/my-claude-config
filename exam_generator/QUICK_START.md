# 🚀 빠른 시작 가이드

## 즉시 실행 명령어

```bash
# 1. 디렉토리 이동
cd C:\Users\sintt\exam_generator

# 2. 메인 시험 시스템 실행
streamlit run app_past_questions.py --server.port 8503
```

**접속**: http://localhost:8503

## 📋 핵심 사용법

### 시험 보기
1. 왼쪽에서 조건 설정 (카테고리, 난이도, 문제 수)
2. "기출문제 시험 생성" 클릭
3. 라디오 버튼으로 답 선택
4. "정답 확인" 클릭 (개별 확인)
5. "시험 완료 및 결과" 클릭 (전체 통계)

### 문제 추가 (PDF가 있는 경우)
```bash
# PDF 추출 도구 실행
streamlit run pdf_extractor.py --server.port 8505
```
1. PDF 업로드 → 자동 인식 → 수동 편집 → CSV 다운로드

```bash
# 안전한 업로드 시스템 실행  
streamlit run secure_upload.py --server.port 8504
```
2. CSV 업로드 → 무결성 검증 → 안전한 저장

## ⚠️ 중요 사항
- **정답 신뢰도 100% 보장** - 검증된 문제만 추가
- **실제 시험 모드** - 정답 미리보기 없음
- **학습 통계** - 시험 횟수, 틀린 문제, 소요 시간 추적

## 🆘 문제 발생 시
1. 브라우저 새로고침
2. 터미널에서 Ctrl+C 후 재실행
3. 포트 변경: `--server.port 8504` 등 다른 포트 사용