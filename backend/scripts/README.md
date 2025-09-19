# 🛠️ 백엔드 유틸리티 스크립트

백엔드 유틸리티 스크립트들이 기능별로 체계적으로 정리된 디렉토리입니다.

## 📁 디렉토리 구조

```
scripts/
├── database/       # 데이터베이스 관리 스크립트 (10개)
├── problems/       # 문제 관리 및 수정 스크립트 (27개)
├── students/       # 학생 데이터 관리 스크립트 (5개)
├── testing/        # 테스트 및 검증 스크립트 (4개)
├── setup/          # 초기 설정 스크립트 (2개)
├── utilities/      # 기타 유틸리티 스크립트 (2개)
└── README.md       # 이 파일
```

## 🗄️ database/ - 데이터베이스 관리 (10개 스크립트)

### 데이터베이스 구조 관리
- `check_db.js` - 데이터베이스 연결 및 기본 구조 확인
- `check_table_structure.js` - 테이블 스키마 구조 검증
- `add_missing_columns.js` - 누락된 컬럼 추가
- `fix_updatedAt_column.js` - updatedAt 컬럼 수정
- `init_users_table.js` - users 테이블 초기화

### 데이터베이스 리셋
- `clean_database.js` - 데이터베이스 정리
- `complete_reset.js` - 완전한 데이터베이스 리셋
- `reset_database.js` - 기본 데이터베이스 리셋
- `reset-database.js` - 데이터베이스 리셋 (대체 버전)
- `reset_all_data.js` - 모든 데이터 초기화

### 사용 예시
```bash
# 데이터베이스 구조 확인
node scripts/database/check_db.js

# 완전한 초기화
node scripts/database/complete_reset.js
```

## 📚 problems/ - 문제 관리 (27개 스크립트)

### 문제 추가
- `add_problem.js` - 기본 문제 추가
- `add_arkeo_problem1.js` - Arkeo 문제 1 추가
- `add_arkeo_problem2.js` - Arkeo 문제 2 추가
- `add_arkeo_problem3.js` - Arkeo 문제 3 추가
- `add_new_hello_world.js` - 새로운 Hello World 문제 추가
- `add-problems.js` - 여러 문제 일괄 추가
- `add-more-problems.js` - 추가 문제들 삽입

### 문제 확인
- `check_all_problems.js` - 모든 문제 확인
- `check_first_problem.js` - 첫 번째 문제 확인
- `check_problem1.js` - 1번 문제 확인
- `check_problems_detail.js` - 문제 상세 정보 확인
- `check-problems.js` - 문제 목록 확인
- `check-problem-7.js` - 7번 문제 확인
- `check-problem-8.js` - 8번 문제 확인

### 문제 수정
- `fix_all_problems.js` - 모든 문제 일괄 수정
- `fix_expected_outputs.js` - 예상 출력값 수정
- `fix_problem1.js` - 1번 문제 수정
- `fix_problem10_hint.js` - 10번 문제 힌트 수정

### 힌트 관리
- `fix_hints.js` - 기본 힌트 수정
- `fix_hints_and_title.js` - 힌트와 제목 수정
- `fix_multiline_hints.js` - 멀티라인 힌트 수정
- `fix_grammar_hints.js` - 문법 힌트 수정
- `fix_practical_hints.js` - 실용적 힌트 수정
- `fix_proper_hints.js` - 적절한 힌트 수정
- `fix_simple_hints.js` - 간단한 힌트 수정

### 코멘트 관리
- `fix-all-comments.js` - 모든 주석 수정
- `fix-main-comments.js` - 메인 주석 수정

### 사용 예시
```bash
# 새 문제 추가
node scripts/problems/add_problem.js

# 모든 문제 확인
node scripts/problems/check_all_problems.js

# 힌트 일괄 수정
node scripts/problems/fix_practical_hints.js
```

## 👥 students/ - 학생 관리 (5개 스크립트)

### 학생 데이터 관리
- `add_more_students.js` - 추가 학생 등록
- `add_test_user.js` - 테스트 사용자 추가
- `check_students.js` - 학생 목록 확인
- `reset_to_5_students.js` - 5명의 학생으로 리셋
- `check-all-codes.js` - 모든 학생 코드 확인

### 사용 예시
```bash
# 학생 목록 확인
node scripts/students/check_students.js

# 테스트 사용자 추가
node scripts/students/add_test_user.js
```

## 🧪 testing/ - 테스트 및 검증 (4개 스크립트)

### 데이터 검증
- `check-duplicates.js` - 중복 데이터 확인
- `check-lesson2.js` - 2차시 데이터 확인
- `check-solutions.js` - 솔루션 검증
- `test_api_response.js` - API 응답 테스트

### 사용 예시
```bash
# 중복 데이터 검사
node scripts/testing/check-duplicates.js

# API 테스트
node scripts/testing/test_api_response.js
```

## ⚙️ setup/ - 초기 설정 (2개 스크립트)

### 시스템 설정
- `setup-curriculum-db.js` - 커리큘럼 데이터베이스 설정
- `fix_data.js` - 데이터 수정 및 정리

### 사용 예시
```bash
# 초기 커리큘럼 설정
node scripts/setup/setup-curriculum-db.js
```

## 🔧 utilities/ - 기타 유틸리티 (2개 스크립트)

### 클라이언트 관리
- `clear_all_localStorage.js` - 모든 로컬스토리지 정리
- `clear_problem3_localStorage.js` - 3번 문제 로컬스토리지 정리

### 사용 예시
```bash
# 로컬스토리지 정리
node scripts/utilities/clear_all_localStorage.js
```

## 📋 스크립트 사용 가이드

### 일반적인 개발 워크플로우

#### 1. 새 프로젝트 설정
```bash
# 1단계: 데이터베이스 초기화
node scripts/database/complete_reset.js

# 2단계: 커리큘럼 설정
node scripts/setup/setup-curriculum-db.js

# 3단계: 테스트 사용자 추가
node scripts/students/add_test_user.js
```

#### 2. 문제 관리
```bash
# 새 문제 추가
node scripts/problems/add_problem.js

# 문제 확인
node scripts/problems/check_all_problems.js

# 힌트 개선
node scripts/problems/fix_practical_hints.js
```

#### 3. 데이터 검증
```bash
# 중복 확인
node scripts/testing/check-duplicates.js

# API 테스트
node scripts/testing/test_api_response.js
```

#### 4. 시스템 정리
```bash
# 데이터베이스 정리
node scripts/database/clean_database.js

# 클라이언트 캐시 정리
node scripts/utilities/clear_all_localStorage.js
```

## 🔒 안전 사용 지침

### ⚠️ 주의사항
1. **백업 필수**: 데이터베이스 리셋 스크립트 실행 전 반드시 백업
2. **테스트 환경**: 프로덕션 환경에서는 테스트 스크립트만 실행
3. **단계별 실행**: 여러 스크립트를 연속 실행할 때는 각 단계 확인 후 진행

### 🛡️ 위험 스크립트들
- `scripts/database/complete_reset.js` - 모든 데이터 삭제
- `scripts/database/clean_database.js` - 데이터베이스 정리
- `scripts/database/reset_all_data.js` - 전체 데이터 초기화

### ✅ 안전 스크립트들
- `scripts/testing/` 디렉토리의 모든 스크립트 (읽기 전용)
- `scripts/problems/check_*.js` 스크립트들 (확인 전용)
- `scripts/students/check_*.js` 스크립트들 (확인 전용)

## 📈 스크립트 히스토리

### 정리 이전 상태 (2025-09-19 이전)
- 백엔드 루트에 60+ 개의 스크립트가 무작위로 분산
- 파일명 중복 및 기능 중복 다수 존재
- 스크립트 목적과 기능을 파악하기 어려운 상태

### 정리 후 현재 상태 (2025-09-19)
- 6개 카테고리로 체계적 분류
- 총 50개 스크립트가 기능별로 정리됨
- 각 스크립트의 목적과 사용법이 명확히 문서화됨

## 🔮 향후 개선 계획

### 단기 계획
- [ ] 중복 기능 스크립트 통합
- [ ] 스크립트별 CLI 인터페이스 추가
- [ ] 자동 테스트 스위트 구성

### 장기 계획
- [ ] GUI 기반 스크립트 실행 도구
- [ ] 스크립트 실행 로그 및 모니터링
- [ ] 스크립트 간 의존성 관리 시스템

---

**마지막 업데이트**: 2025-09-19
**정리된 스크립트 수**: 50개
**스크립트 카테고리**: 6개

이 문서는 새로운 스크립트 추가 및 기능 변경에 따라 지속적으로 업데이트됩니다.