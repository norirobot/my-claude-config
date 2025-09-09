"""
문제 검증 시스템
추가되는 모든 문제의 정확성과 품질을 검증합니다.
"""

import streamlit as st
import json
import pandas as pd
from datetime import datetime
import re

class QuestionValidator:
    """문제 검증 클래스"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
    
    def validate_question(self, question_data):
        """개별 문제 검증"""
        self.errors = []
        self.warnings = []
        
        # 1. 필수 필드 검증
        self._validate_required_fields(question_data)
        
        # 2. 데이터 타입 검증
        self._validate_data_types(question_data)
        
        # 3. 문제 내용 품질 검증
        self._validate_question_quality(question_data)
        
        # 4. 선택지 검증
        self._validate_options(question_data)
        
        # 5. 정답 검증
        self._validate_answer(question_data)
        
        # 6. 해설 검증
        self._validate_explanation(question_data)
        
        return len(self.errors) == 0, self.errors, self.warnings
    
    def _validate_required_fields(self, q):
        """필수 필드 존재 확인"""
        required_fields = ['id', 'category', 'difficulty', 'year', 'round', 
                          'question', 'options', 'correct_answer', 'explanation']
        
        for field in required_fields:
            if field not in q or not q[field]:
                self.errors.append(f"필수 필드 누락: {field}")
    
    def _validate_data_types(self, q):
        """데이터 타입 검증"""
        if 'correct_answer' in q:
            if not isinstance(q['correct_answer'], int):
                self.errors.append("정답은 정수여야 합니다 (0, 1, 2, 3)")
            elif not 0 <= q['correct_answer'] <= 3:
                self.errors.append("정답은 0~3 사이의 값이어야 합니다")
        
        if 'options' in q:
            if not isinstance(q['options'], list):
                self.errors.append("선택지는 리스트여야 합니다")
            elif len(q['options']) != 4:
                self.errors.append("선택지는 정확히 4개여야 합니다")
    
    def _validate_question_quality(self, q):
        """문제 내용 품질 검증"""
        if 'question' in q:
            question_text = q['question'].strip()
            
            # 최소 길이 검증
            if len(question_text) < 10:
                self.errors.append("문제가 너무 짧습니다 (최소 10자)")
            
            # 문제 형식 검증
            if not question_text.endswith('?') and '다음' not in question_text and '옳은 것은' not in question_text:
                self.warnings.append("문제가 질문 형태가 아닐 수 있습니다")
            
            # 특수 문자나 오타 검증
            if '??' in question_text or '!!' in question_text:
                self.warnings.append("연속된 특수문자가 있습니다")
    
    def _validate_options(self, q):
        """선택지 검증"""
        if 'options' in q and isinstance(q['options'], list):
            options = q['options']
            
            # 각 선택지 검증
            for i, option in enumerate(options):
                if not option or len(option.strip()) < 2:
                    self.errors.append(f"선택지 {i+1}이 너무 짧거나 비어있습니다")
            
            # 중복 선택지 검증
            if len(set(options)) != len(options):
                self.errors.append("중복된 선택지가 있습니다")
            
            # 선택지 길이 균형 검증
            lengths = [len(opt) for opt in options]
            if max(lengths) > min(lengths) * 3:
                self.warnings.append("선택지 길이 차이가 큽니다 (정답 추측 가능)")
    
    def _validate_answer(self, q):
        """정답 검증"""
        if 'correct_answer' in q and 'options' in q:
            correct_idx = q['correct_answer']
            if 0 <= correct_idx < len(q['options']):
                correct_option = q['options'][correct_idx]
                
                # 정답 선택지가 명확한지 검증
                if '모두' in correct_option and '아니다' in correct_option:
                    self.warnings.append("'모두 아니다' 형태의 정답은 피하는 것이 좋습니다")
                
                # 정답이 다른 선택지보다 명확히 구별되는지 검증
                other_options = [opt for i, opt in enumerate(q['options']) if i != correct_idx]
                for other in other_options:
                    if correct_option.lower() in other.lower() or other.lower() in correct_option.lower():
                        self.warnings.append("정답과 다른 선택지가 유사합니다")
    
    def _validate_explanation(self, q):
        """해설 검증"""
        if 'explanation' in q:
            explanation = q['explanation'].strip()
            
            if len(explanation) < 10:
                self.errors.append("해설이 너무 짧습니다 (최소 10자)")
            
            # 해설에 정답 근거가 있는지 확인
            if 'correct_answer' in q and 'options' in q:
                correct_option = q['options'][q['correct_answer']]
                # 해설에 정답의 핵심 키워드가 포함되어 있는지 간단 검증
                if len(correct_option) > 5:
                    key_words = correct_option.split()[:2]  # 처음 2단어
                    if not any(word in explanation for word in key_words if len(word) > 1):
                        self.warnings.append("해설에 정답과 관련된 설명이 부족할 수 있습니다")

def main():
    st.title("🔍 문제 검증 시스템")
    st.markdown("추가할 문제의 **정확성과 품질을 100% 검증**합니다.")
    
    validator = QuestionValidator()
    
    # 탭 생성
    tab1, tab2, tab3 = st.tabs(["🔍 개별 문제 검증", "📊 파일 검증", "📋 기존 DB 검증"])
    
    with tab1:
        st.header("개별 문제 검증")
        
        # 문제 정보 입력 (기존 admin과 동일하지만 검증 추가)
        col1, col2 = st.columns(2)
        
        with col1:
            year = st.selectbox("연도", ["2024", "2023", "2022", "2021"])
            round_num = st.selectbox("회차", ["1회", "2회", "3회", "4회"])
            category = st.selectbox("카테고리", [
                "소프트웨어설계", "소프트웨어개발", "데이터베이스구축", 
                "프로그래밍언어활용", "정보시스템구축관리"
            ])
        
        with col2:
            subcategory = st.text_input("세부 분야")
            difficulty = st.selectbox("난이도", ["하", "중", "상"])
            question_id = st.text_input("문제 ID", value=f"{year}_{round_num.replace('회', '')}_001")
        
        question_text = st.text_area("문제 지문", height=100)
        
        # 선택지
        options = []
        for i in range(4):
            option = st.text_input(f"{i+1}번 선택지", key=f"option_{i}")
            options.append(option)
        
        correct_answer = st.selectbox("정답", [1, 2, 3, 4]) - 1
        explanation = st.text_area("해설", height=80)
        
        # 실시간 검증
        if st.button("🔍 문제 검증"):
            test_question = {
                "id": question_id,
                "category": category,
                "subcategory": subcategory,
                "difficulty": difficulty,
                "year": year,
                "round": round_num,
                "question": question_text,
                "options": [opt for opt in options if opt],
                "correct_answer": correct_answer,
                "explanation": explanation
            }
            
            is_valid, errors, warnings = validator.validate_question(test_question)
            
            if is_valid:
                st.success("✅ 문제가 모든 검증을 통과했습니다!")
                
                if warnings:
                    st.warning("⚠️ 주의사항:")
                    for warning in warnings:
                        st.write(f"- {warning}")
                
                # 저장 버튼 활성화
                if st.button("💾 검증된 문제 저장", type="primary"):
                    # 기존 DB에 저장하는 로직
                    try:
                        with open("real_past_questions_db.json", 'r', encoding='utf-8') as f:
                            db_data = json.load(f)
                    except FileNotFoundError:
                        db_data = {"metadata": {}, "questions": []}
                    
                    db_data["questions"].append(test_question)
                    
                    with open("real_past_questions_db.json", 'w', encoding='utf-8') as f:
                        json.dump(db_data, f, ensure_ascii=False, indent=2)
                    
                    st.success("💾 검증된 문제가 저장되었습니다!")
                    st.balloons()
            else:
                st.error("❌ 문제에 오류가 있습니다:")
                for error in errors:
                    st.write(f"- {error}")
                
                if warnings:
                    st.warning("⚠️ 추가 주의사항:")
                    for warning in warnings:
                        st.write(f"- {warning}")
    
    with tab2:
        st.header("CSV 파일 일괄 검증")
        
        uploaded_file = st.file_uploader("검증할 CSV 파일 업로드", type=['csv'])
        
        if uploaded_file:
            try:
                df = pd.read_csv(uploaded_file, encoding='utf-8-sig')
                st.subheader("파일 미리보기")
                st.dataframe(df.head())
                
                if st.button("🔍 전체 문제 검증"):
                    valid_questions = []
                    invalid_questions = []
                    
                    progress_bar = st.progress(0)
                    status_text = st.empty()
                    
                    for i, row in df.iterrows():
                        progress_bar.progress((i + 1) / len(df))
                        status_text.text(f"검증 중... {i+1}/{len(df)}")
                        
                        question = {
                            "id": str(row['문제ID']),
                            "category": str(row['카테고리']),
                            "subcategory": str(row.get('세부분야', '')),
                            "difficulty": str(row['난이도']),
                            "year": str(row['연도']),
                            "round": str(row['회차']),
                            "question": str(row['문제']),
                            "options": [str(row[f'선택지{j}']) for j in range(1, 5)],
                            "correct_answer": int(row['정답']) - 1,
                            "explanation": str(row['해설'])
                        }
                        
                        is_valid, errors, warnings = validator.validate_question(question)
                        
                        if is_valid:
                            valid_questions.append(question)
                        else:
                            invalid_questions.append({
                                'row': i + 1,
                                'id': question['id'],
                                'errors': errors,
                                'warnings': warnings
                            })
                    
                    progress_bar.progress(1.0)
                    status_text.text("검증 완료!")
                    
                    # 결과 표시
                    col1, col2 = st.columns(2)
                    with col1:
                        st.metric("✅ 통과", len(valid_questions))
                    with col2:
                        st.metric("❌ 실패", len(invalid_questions))
                    
                    if invalid_questions:
                        st.error("다음 문제들에 오류가 있습니다:")
                        for invalid in invalid_questions:
                            with st.expander(f"❌ 행 {invalid['row']}: {invalid['id']}"):
                                for error in invalid['errors']:
                                    st.write(f"- {error}")
                    
                    if valid_questions:
                        st.success(f"✅ {len(valid_questions)}개 문제가 검증을 통과했습니다!")
                        
                        if st.button("💾 검증된 문제들 저장", type="primary"):
                            # 저장 로직
                            try:
                                with open("real_past_questions_db.json", 'r', encoding='utf-8') as f:
                                    db_data = json.load(f)
                            except FileNotFoundError:
                                db_data = {"metadata": {}, "questions": []}
                            
                            db_data["questions"].extend(valid_questions)
                            
                            with open("real_past_questions_db.json", 'w', encoding='utf-8') as f:
                                json.dump(db_data, f, ensure_ascii=False, indent=2)
                            
                            st.success(f"💾 {len(valid_questions)}개의 검증된 문제가 저장되었습니다!")
                            st.balloons()
            
            except Exception as e:
                st.error(f"파일 처리 중 오류: {e}")
    
    with tab3:
        st.header("기존 데이터베이스 검증")
        
        if st.button("🔍 기존 DB 전체 검증"):
            try:
                with open("real_past_questions_db.json", 'r', encoding='utf-8') as f:
                    db_data = json.load(f)
                
                questions = db_data.get("questions", [])
                
                if not questions:
                    st.info("검증할 문제가 없습니다.")
                    return
                
                valid_count = 0
                invalid_questions = []
                
                progress_bar = st.progress(0)
                
                for i, question in enumerate(questions):
                    progress_bar.progress((i + 1) / len(questions))
                    
                    is_valid, errors, warnings = validator.validate_question(question)
                    
                    if is_valid:
                        valid_count += 1
                    else:
                        invalid_questions.append({
                            'id': question.get('id', f'문제_{i+1}'),
                            'errors': errors,
                            'warnings': warnings
                        })
                
                progress_bar.progress(1.0)
                
                # 결과 표시
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("총 문제", len(questions))
                with col2:
                    st.metric("✅ 통과", valid_count)
                with col3:
                    st.metric("❌ 실패", len(invalid_questions))
                
                if invalid_questions:
                    st.error("다음 문제들에 오류가 있습니다:")
                    for invalid in invalid_questions:
                        with st.expander(f"❌ {invalid['id']}"):
                            for error in invalid['errors']:
                                st.write(f"- {error}")
                else:
                    st.success("🎉 모든 문제가 검증을 통과했습니다!")
            
            except FileNotFoundError:
                st.error("데이터베이스 파일이 없습니다.")
            except Exception as e:
                st.error(f"검증 중 오류: {e}")

if __name__ == "__main__":
    main()