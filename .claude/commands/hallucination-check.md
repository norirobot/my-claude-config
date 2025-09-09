# 할루시네이션 방지 필수 체크리스트

**목적**: AI 할루시네이션 방지를 위한 강제 검증 절차

## 코드 작성 전 MUST-DO

### 1. 기존 파일 반드시 읽기
```bash
# @filename으로 패턴/스타일 학습
@package.json  # 사용 가능한 라이브러리 확인
@filename.js   # 기존 코드 패턴 학습
```

### 2. 기존 유사 코드 검색
```bash
# Grep으로 중복 방지, 패턴 일관성 확인
grep -r "similar_function" .
grep -r "similar_pattern" .
```

### 3. 타입 정의 확인
```bash
# TypeScript 사용시 기존 타입 먼저 확인
grep -r "interface\|type" src/
```

## 코드 작성 중 실시간 검증

- ✅ 변수명 기존 패턴과 일치 확인 (camelCase vs snake_case)
- ✅ 함수명 네이밍 컨벤션 준수
- ✅ import 경로 정확성 검증 (상대경로 vs 절대경로)
- ✅ 에러 핸들링 방식 기존 코드와 일관성 유지

## 코드 완성 후 품질 검증

```bash
npm test          # 새 코드가 기존 테스트 안 깨뜨리는지
npm run lint      # 린트 검사 통과
npm run type-check # 타입 검사 통과 (TypeScript)
npm run build     # 빌드 성공 확인
```

## 절대 가정하지 말 것

- ❌ "아마 이 라이브러리가 있을 것이다"
- ❌ "보통 이렇게 한다"  
- ❌ "이 방법이 더 좋다"
- ✅ **반드시 기존 코드에서 확인 후 적용**

**이 체크리스트 위반시 즉시 작업 중단**