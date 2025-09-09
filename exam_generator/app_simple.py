"""
간단한 Streamlit 웹 인터페이스
호환성 문제 해결 버전
"""

import streamlit as st
import os
import tempfile
from datetime import datetime
import json
import pandas as pd

from document_reader import DocumentReader
from question_generator_fixed import FixedQuestionGenerator
from data_manager import DataManager

# 페이지 설정
st.set_page_config(
    page_title="문제 생성기",
    page_icon="📚",
    layout="wide"
)

def init_session_state():
    """세션 상태 초기화"""
    if 'questions' not in st.session_state:
        st.session_state.questions = []
    if 'document_content' not in st.session_state:
        st.session_state.document_content = ""

def main():
    """메인 함수"""
    init_session_state()
    
    # 타이틀
    st.title("📚 한국 국가공인자격증 시험 문제 생성기")
    st.markdown("PDF 또는 TXT 파일을 업로드하여 자동으로 시험 문제를 생성합니다.")
    st.markdown("---")
    
    # 사이드바 설정
    with st.sidebar:
        st.header("⚙️ 설정")
        
        # 문제 생성 옵션
        st.subheader("문제 생성 옵션")
        
        difficulty = st.selectbox(
            "난이도",
            ["하", "중", "상"],
            index=1
        )
        
        question_type = st.selectbox(
            "문제 유형",
            ["정의형", "특징형", "비교형", "적용형", "혼합"],
            index=0
        )
        
        num_questions = st.slider(
            "문제 개수",
            min_value=1,
            max_value=20,
            value=5
        )
    
    # 메인 컨텐츠
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.header("📄 문서 업로드")
        
        # 파일 업로더
        uploaded_file = st.file_uploader(
            "PDF 또는 TXT 파일을 선택하세요",
            type=['pdf', 'txt']
        )
        
        if uploaded_file is not None:
            st.success(f"✅ 파일 업로드 완료: {uploaded_file.name}")
            
            # 문서 읽기 버튼
            if st.button("📖 문서 읽기"):
                with st.spinner("문서를 읽는 중..."):
                    # 임시 파일로 저장
                    with tempfile.NamedTemporaryFile(delete=False, suffix=uploaded_file.name) as tmp_file:
                        tmp_file.write(uploaded_file.getbuffer())
                        tmp_path = tmp_file.name
                    
                    # 문서 읽기
                    reader = DocumentReader()
                    content = reader.read_document(tmp_path)
                    
                    if content:
                        st.session_state.document_content = content
                        st.success(f"✅ 문서 읽기 성공! (총 {len(content)} 글자)")
                        
                        # 내용 미리보기
                        with st.expander("📄 문서 내용 미리보기"):
                            st.text(content[:500] + "...")
                    else:
                        st.error("❌ 문서를 읽을 수 없습니다.")
                    
                    # 임시 파일 삭제
                    os.unlink(tmp_path)
        
        # 문제 생성 버튼
        if st.session_state.document_content:
            st.markdown("---")
            if st.button("🎯 문제 생성"):
                with st.spinner("문제를 생성하는 중..."):
                    # 문제 생성기 초기화
                    generator = FixedQuestionGenerator()
                    
                    # 문제 생성
                    questions = generator.generate_questions(
                        text=st.session_state.document_content,
                        question_type=question_type,
                        difficulty=difficulty,
                        num_questions=num_questions
                    )
                    
                    if questions:
                        st.session_state.questions = questions
                        st.success(f"✅ {len(questions)}개의 문제를 생성했습니다!")
                    else:
                        st.error("문제 생성에 실패했습니다.")
    
    with col2:
        st.header("❓ 생성된 문제")
        
        if st.session_state.questions:
            for i, question in enumerate(st.session_state.questions, 1):
                st.subheader(f"문제 {i}")
                st.write(f"**Q:** {question.question}")
                
                # 선택지 표시
                for j, option in enumerate(question.options, 1):
                    if j-1 == question.answer:
                        st.success(f"✅ {j}. {option}")
                    else:
                        st.write(f"{j}. {option}")
                
                # 해설 표시
                with st.expander("해설 보기"):
                    st.info(question.explanation)
                    st.caption(f"난이도: {question.difficulty} | 유형: {question.question_type}")
                
                st.markdown("---")
            
            # 다운로드 버튼
            st.subheader("📥 다운로드")
            
            # JSON 다운로드
            json_data = json.dumps(
                [q.to_dict() for q in st.session_state.questions],
                ensure_ascii=False,
                indent=2
            )
            
            st.download_button(
                label="JSON 파일 다운로드",
                data=json_data,
                file_name=f"questions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )
            
            # CSV 다운로드
            df = pd.DataFrame([q.to_dict() for q in st.session_state.questions])
            csv = df.to_csv(index=False, encoding='utf-8-sig')
            
            st.download_button(
                label="CSV 파일 다운로드",
                data=csv,
                file_name=f"questions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )
        else:
            st.info("아직 생성된 문제가 없습니다.")

if __name__ == "__main__":
    main()