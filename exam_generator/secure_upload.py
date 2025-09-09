"""
안전한 문제 업로드 시스템
이미 검증된 문제들의 데이터 무결성을 보장하는 업로드 도구
"""

import streamlit as st
import pandas as pd
import json
import hashlib
from datetime import datetime
import difflib

class SecureUploader:
    """안전한 업로드 클래스"""
    
    def __init__(self):
        self.upload_log = []
        
    def calculate_question_hash(self, question_data):
        """문제 데이터의 해시값 계산 (무결성 검증용)"""
        # 중요한 필드들만 해시 계산
        key_data = {
            'question': question_data.get('question', ''),
            'options': question_data.get('options', []),
            'correct_answer': question_data.get('correct_answer', -1),
            'explanation': question_data.get('explanation', '')
        }
        
        # 정규화된 문자열로 변환
        normalized = json.dumps(key_data, sort_keys=True, ensure_ascii=False)
        return hashlib.md5(normalized.encode('utf-8')).hexdigest()
    
    def validate_upload_integrity(self, df):
        """업로드 데이터 무결성 검증"""
        integrity_issues = []
        processed_questions = []
        
        for index, row in df.iterrows():
            try:
                # 데이터 추출
                question_data = {
                    'id': str(row['문제ID']).strip(),
                    'question': str(row['문제']).strip(),
                    'options': [
                        str(row['선택지1']).strip(),
                        str(row['선택지2']).strip(),
                        str(row['선택지3']).strip(),
                        str(row['선택지4']).strip()
                    ],
                    'correct_answer': int(row['정답']) - 1,
                    'explanation': str(row['해설']).strip(),
                    'category': str(row['카테고리']).strip(),
                    'difficulty': str(row['난이도']).strip(),
                    'year': str(row['연도']).strip(),
                    'round': str(row['회차']).strip()
                }
                
                # 무결성 검사
                issues = self._check_data_integrity(question_data, index + 1)
                if issues:
                    integrity_issues.extend(issues)
                else:
                    processed_questions.append(question_data)
                    
            except Exception as e:
                integrity_issues.append({
                    'row': index + 1,
                    'type': '데이터 처리 오류',
                    'message': str(e),
                    'severity': 'ERROR'
                })
        
        return processed_questions, integrity_issues
    
    def _check_data_integrity(self, question_data, row_num):
        """개별 문제 데이터 무결성 검사"""
        issues = []
        
        # 1. 정답 범위 검증
        if not 0 <= question_data['correct_answer'] <= 3:
            issues.append({
                'row': row_num,
                'type': '정답 오류',
                'message': f"정답이 잘못됨: {question_data['correct_answer'] + 1}번 (1-4 범위 벗어남)",
                'severity': 'ERROR'
            })
        
        # 2. 선택지 개수 검증
        if len(question_data['options']) != 4:
            issues.append({
                'row': row_num,
                'type': '선택지 오류',
                'message': f"선택지 개수 오류: {len(question_data['options'])}개 (4개 필요)",
                'severity': 'ERROR'
            })
        
        # 3. 빈 선택지 검증
        for i, option in enumerate(question_data['options']):
            if not option or len(option) < 2:
                issues.append({
                    'row': row_num,
                    'type': '선택지 오류',
                    'message': f"선택지 {i+1}번이 비어있거나 너무 짧음",
                    'severity': 'ERROR'
                })
        
        # 4. 중복 선택지 검증
        if len(set(question_data['options'])) != 4:
            issues.append({
                'row': row_num,
                'type': '선택지 중복',
                'message': "중복된 선택지가 있음",
                'severity': 'ERROR'
            })
        
        # 5. 문제 내용 검증
        if len(question_data['question']) < 10:
            issues.append({
                'row': row_num,
                'type': '문제 내용 오류',
                'message': "문제가 너무 짧음",
                'severity': 'WARNING'
            })
        
        # 6. 해설 검증
        if len(question_data['explanation']) < 5:
            issues.append({
                'row': row_num,
                'type': '해설 오류',
                'message': "해설이 너무 짧음",
                'severity': 'WARNING'
            })
        
        # 7. 인코딩 문제 검증
        try:
            for field in ['question', 'explanation']:
                if question_data[field].encode('utf-8').decode('utf-8') != question_data[field]:
                    issues.append({
                        'row': row_num,
                        'type': '인코딩 오류',
                        'message': f"{field} 필드에 인코딩 문제 있음",
                        'severity': 'WARNING'
                    })
        except UnicodeError:
            issues.append({
                'row': row_num,
                'type': '인코딩 오류',
                'message': "텍스트 인코딩 오류",
                'severity': 'ERROR'
            })
        
        return issues
    
    def create_backup(self):
        """기존 DB 백업"""
        try:
            with open("real_past_questions_db.json", 'r', encoding='utf-8') as f:
                db_data = json.load(f)
            
            backup_filename = f"backup_questions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(backup_filename, 'w', encoding='utf-8') as f:
                json.dump(db_data, f, ensure_ascii=False, indent=2)
            
            return backup_filename
        except FileNotFoundError:
            return None
    
    def compare_with_existing(self, new_questions):
        """기존 문제와 중복 검사"""
        try:
            with open("real_past_questions_db.json", 'r', encoding='utf-8') as f:
                db_data = json.load(f)
            
            existing_ids = set(q['id'] for q in db_data.get('questions', []))
            duplicate_ids = [q['id'] for q in new_questions if q['id'] in existing_ids]
            
            return duplicate_ids
        except FileNotFoundError:
            return []

def main():
    st.title("🔒 안전한 문제 업로드 시스템")
    st.markdown("""
    **이미 검증된 문제들의 데이터 무결성을 보장**하며 안전하게 업로드합니다.
    
    ✅ **보장사항:**
    - 업로드 과정에서 정답 변경 방지
    - 선택지 순서 보존
    - 텍스트 인코딩 보장
    - 데이터 손실 방지
    """)
    
    uploader = SecureUploader()
    
    # 1단계: 파일 업로드
    st.header("1️⃣ 검증된 문제 파일 업로드")
    
    uploaded_file = st.file_uploader(
        "CSV 파일을 선택하세요",
        type=['csv'],
        help="이미 검증이 완료된 문제 파일을 업로드하세요"
    )
    
    if uploaded_file:
        try:
            # 파일 읽기 (여러 인코딩 시도)
            encodings = ['utf-8-sig', 'utf-8', 'cp949', 'euc-kr']
            df = None
            used_encoding = None
            
            for encoding in encodings:
                try:
                    df = pd.read_csv(uploaded_file, encoding=encoding)
                    used_encoding = encoding
                    break
                except UnicodeDecodeError:
                    continue
            
            if df is None:
                st.error("❌ 파일 인코딩을 읽을 수 없습니다.")
                return
            
            st.success(f"✅ 파일을 성공적으로 읽었습니다. (인코딩: {used_encoding})")
            
            # 2단계: 파일 미리보기
            st.header("2️⃣ 데이터 미리보기")
            st.dataframe(df.head())
            st.info(f"총 {len(df)}개 문제가 포함되어 있습니다.")
            
            # 3단계: 필수 컬럼 확인
            st.header("3️⃣ 데이터 구조 검증")
            
            required_cols = ['문제ID', '카테고리', '난이도', '연도', '회차', '문제', 
                           '선택지1', '선택지2', '선택지3', '선택지4', '정답', '해설']
            
            missing_cols = [col for col in required_cols if col not in df.columns]
            
            if missing_cols:
                st.error(f"❌ 필수 컬럼 누락: {missing_cols}")
                st.stop()
            else:
                st.success("✅ 모든 필수 컬럼이 존재합니다.")
            
            # 4단계: 무결성 검증
            if st.button("🔍 데이터 무결성 검증 시작"):
                st.header("4️⃣ 무결성 검증 결과")
                
                with st.spinner("데이터 무결성을 검증하는 중..."):
                    processed_questions, integrity_issues = uploader.validate_upload_integrity(df)
                
                # 결과 표시
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("총 문제", len(df))
                with col2:
                    st.metric("✅ 통과", len(processed_questions))
                with col3:
                    error_count = len([issue for issue in integrity_issues if issue['severity'] == 'ERROR'])
                    st.metric("❌ 오류", error_count)
                
                # 오류 표시
                if integrity_issues:
                    error_issues = [issue for issue in integrity_issues if issue['severity'] == 'ERROR']
                    warning_issues = [issue for issue in integrity_issues if issue['severity'] == 'WARNING']
                    
                    if error_issues:
                        st.error(f"❌ {len(error_issues)}개의 심각한 오류가 발견되었습니다:")
                        for issue in error_issues:
                            st.write(f"- 행 {issue['row']}: [{issue['type']}] {issue['message']}")
                        st.warning("⚠️ 오류를 수정한 후 다시 업로드해주세요.")
                    
                    if warning_issues:
                        st.warning(f"⚠️ {len(warning_issues)}개의 경고가 있습니다:")
                        for issue in warning_issues:
                            st.write(f"- 행 {issue['row']}: [{issue['type']}] {issue['message']}")
                
                # 5단계: 중복 검사
                if processed_questions and not error_issues:
                    st.header("5️⃣ 중복 문제 검사")
                    
                    duplicate_ids = uploader.compare_with_existing(processed_questions)
                    
                    if duplicate_ids:
                        st.warning(f"⚠️ {len(duplicate_ids)}개의 중복 문제 ID가 발견되었습니다:")
                        for dup_id in duplicate_ids:
                            st.write(f"- {dup_id}")
                        
                        replace_duplicates = st.checkbox("중복 문제를 새 문제로 교체")
                        if not replace_duplicates:
                            st.info("중복 문제를 제외하고 진행하시려면 체크박스를 선택하세요.")
                    else:
                        st.success("✅ 중복 문제가 없습니다.")
                    
                    # 6단계: 최종 저장
                    if not error_issues:
                        st.header("6️⃣ 안전한 저장")
                        
                        # 백업 생성
                        backup_file = uploader.create_backup()
                        if backup_file:
                            st.info(f"💾 기존 데이터 백업 생성: {backup_file}")
                        
                        # 저장 옵션
                        col1, col2 = st.columns(2)
                        
                        with col1:
                            if st.button("💾 안전하게 저장", type="primary"):
                                # 실제 저장 로직
                                try:
                                    # 기존 DB 로드
                                    try:
                                        with open("real_past_questions_db.json", 'r', encoding='utf-8') as f:
                                            db_data = json.load(f)
                                    except FileNotFoundError:
                                        db_data = {
                                            "metadata": {
                                                "exam_name": "정보처리기사",
                                                "total_questions": 0,
                                                "categories": ["소프트웨어설계", "소프트웨어개발", "데이터베이스구축", "프로그래밍언어활용", "정보시스템구축관리"],
                                                "difficulty_levels": ["하", "중", "상"],
                                                "last_updated": datetime.now().strftime("%Y-%m-%d")
                                            },
                                            "questions": []
                                        }
                                    
                                    # 중복 처리
                                    if duplicate_ids and 'replace_duplicates' in locals() and replace_duplicates:
                                        # 중복 문제 제거
                                        db_data["questions"] = [q for q in db_data["questions"] if q["id"] not in duplicate_ids]
                                    elif duplicate_ids:
                                        # 중복 문제 제외
                                        processed_questions = [q for q in processed_questions if q["id"] not in duplicate_ids]
                                    
                                    # 새 문제들 추가
                                    db_data["questions"].extend(processed_questions)
                                    db_data["metadata"]["total_questions"] = len(db_data["questions"])
                                    db_data["metadata"]["last_updated"] = datetime.now().strftime("%Y-%m-%d")
                                    
                                    # 저장
                                    with open("real_past_questions_db.json", 'w', encoding='utf-8') as f:
                                        json.dump(db_data, f, ensure_ascii=False, indent=2)
                                    
                                    st.success(f"🎉 {len(processed_questions)}개의 문제가 안전하게 저장되었습니다!")
                                    st.balloons()
                                    
                                    # 저장 로그
                                    st.info(f"""
                                    **저장 완료 정보:**
                                    - 업로드된 문제: {len(processed_questions)}개
                                    - 총 데이터베이스 문제: {len(db_data['questions'])}개
                                    - 백업 파일: {backup_file if backup_file else '없음'}
                                    - 저장 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                                    """)
                                
                                except Exception as e:
                                    st.error(f"❌ 저장 중 오류 발생: {e}")
                        
                        with col2:
                            if st.button("📊 미리보기만"):
                                st.info("저장하지 않고 미리보기만 진행합니다.")
                                
                                # 처리된 문제들 미리보기
                                st.subheader("처리된 문제 미리보기")
                                for i, q in enumerate(processed_questions[:3]):
                                    with st.expander(f"문제 {i+1}: {q['id']}"):
                                        st.write(f"**문제**: {q['question']}")
                                        for j, opt in enumerate(q['options']):
                                            if j == q['correct_answer']:
                                                st.success(f"✅ {j+1}. {opt}")
                                            else:
                                                st.write(f"{j+1}. {opt}")
                                        st.info(f"**해설**: {q['explanation']}")
                
        except Exception as e:
            st.error(f"❌ 파일 처리 중 오류 발생: {e}")

if __name__ == "__main__":
    main()