"""
Streamlit 웹 인터페이스
한국 국가공인자격증 시험 문제 생성 웹 애플리케이션
"""

import streamlit as st
import os
import tempfile
from datetime import datetime
import json
import pandas as pd

from document_reader import DocumentReader
from question_generator import QuestionGenerator
from data_manager import DataManager


# 페이지 설정
st.set_page_config(
    page_title="국가공인자격증 문제 생성기",
    page_icon="📚",
    layout="wide"
)

# CSS 스타일
st.markdown("""
<style>
    .stButton > button {
        width: 100%;
        background-color: #4CAF50;
        color: white;
        font-weight: bold;
    }
    .question-box {
        background-color: #f0f2f6;
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
    }
</style>
""", unsafe_allow_html=True)


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
    
    # 사이드바 설정
    with st.sidebar:
        st.header("⚙️ 설정")
        
        # API 키 입력
        api_key = st.text_input(
            "OpenAI API Key",
            type="password",
            help="OpenAI API 키를 입력하세요. 환경변수로도 설정 가능합니다.",
            value=os.getenv("OPENAI_API_KEY", "")
        )
        
        st.divider()
        
        # 문제 생성 옵션
        st.subheader("📝 문제 생성 옵션")
        
        difficulty = st.selectbox(
            "난이도",
            ["하", "중", "상"],
            index=1,
            help="문제의 난이도를 선택하세요."
        )
        
        question_type = st.selectbox(
            "문제 유형",
            ["혼합", "정의형", "특징형", "비교형", "적용형"],
            help="생성할 문제의 유형을 선택하세요."
        )
        
        num_questions = st.slider(
            "문제 개수",
            min_value=1,
            max_value=20,
            value=5,
            help="생성할 문제의 개수를 선택하세요."
        )
        
        use_paragraphs = st.checkbox(
            "문단별 문제 생성",
            help="문서를 문단으로 나누어 각 문단에서 문제를 생성합니다."
        )
        
        st.divider()
        
        # 내보내기 옵션
        st.subheader("💾 내보내기 옵션")
        export_excel = st.checkbox("Excel 파일로도 저장", value=True)
    
    # 메인 컨텐츠
    tabs = st.tabs(["📤 파일 업로드", "📋 생성된 문제", "📊 통계"])
    
    with tabs[0]:
        st.header("파일 업로드")
        
        # 파일 업로더
        uploaded_file = st.file_uploader(
            "PDF 또는 TXT 파일을 선택하세요",
            type=['pdf', 'txt'],
            help="문제를 생성할 소스 문서를 업로드하세요."
        )
        
        if uploaded_file is not None:
            # 파일 정보 표시
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("파일명", uploaded_file.name)
            with col2:
                st.metric("파일 크기", f"{uploaded_file.size / 1024:.2f} KB")
            with col3:
                st.metric("파일 타입", uploaded_file.type)
            
            # 임시 파일로 저장
            with tempfile.NamedTemporaryFile(delete=False, suffix=uploaded_file.name) as tmp_file:
                tmp_file.write(uploaded_file.getbuffer())
                tmp_file_path = tmp_file.name
            
            # 문서 읽기
            if st.button("📖 문서 읽기", type="primary"):
                with st.spinner("문서를 읽는 중..."):
                    try:
                        reader = DocumentReader()
                        content = reader.read_document(tmp_file_path)
                        st.session_state.document_content = content
                        
                        st.success(f"✅ 문서 읽기 완료! (텍스트 길이: {len(content)} 문자)")
                        
                        # 미리보기
                        with st.expander("📄 문서 내용 미리보기"):
                            st.text(content[:2000] + "..." if len(content) > 2000 else content)
                    
                    except Exception as e:
                        st.error(f"❌ 문서 읽기 실패: {str(e)}")
                    finally:
                        # 임시 파일 삭제
                        os.unlink(tmp_file_path)
        
        # 문제 생성 버튼
        if st.session_state.document_content and api_key:
            st.divider()
            
            if st.button("🤖 문제 생성", type="primary", use_container_width=True):
                with st.spinner("문제를 생성하는 중... (시간이 다소 걸릴 수 있습니다)"):
                    try:
                        generator = QuestionGenerator(api_key=api_key)
                        
                        if use_paragraphs:
                            # 문단별 문제 생성
                            reader = DocumentReader()
                            paragraphs = reader.extract_paragraphs(st.session_state.document_content)
                            
                            if question_type == "혼합":
                                questions = []
                                progress_bar = st.progress(0)
                                for i, para in enumerate(paragraphs[:min(len(paragraphs), 5)]):
                                    para_questions = generator.generate_mixed_questions(
                                        content=para,
                                        num_questions_per_type=1,
                                        difficulty=difficulty
                                    )
                                    questions.extend(para_questions)
                                    progress_bar.progress((i+1) / min(len(paragraphs), 5))
                                    if len(questions) >= num_questions:
                                        break
                            else:
                                questions = generator.generate_from_paragraphs(
                                    paragraphs=paragraphs[:min(len(paragraphs), 5)],
                                    questions_per_paragraph=max(1, num_questions // min(len(paragraphs), 5)),
                                    question_type=question_type,
                                    difficulty=difficulty
                                )
                        else:
                            # 전체 텍스트에서 문제 생성
                            if question_type == "혼합":
                                questions = generator.generate_mixed_questions(
                                    content=st.session_state.document_content,
                                    num_questions_per_type=max(1, num_questions // 4),
                                    difficulty=difficulty
                                )
                            else:
                                questions = generator.generate_questions(
                                    content=st.session_state.document_content,
                                    question_type=question_type,
                                    difficulty=difficulty,
                                    num_questions=num_questions
                                )
                        
                        # 문제 수 제한
                        questions = questions[:num_questions]
                        
                        # 세션에 저장
                        st.session_state.questions = [q.to_dict() for q in questions]
                        
                        st.success(f"✅ {len(questions)}개의 문제가 생성되었습니다!")
                        st.balloons()
                        
                    except Exception as e:
                        st.error(f"❌ 문제 생성 실패: {str(e)}")
        
        elif st.session_state.document_content and not api_key:
            st.warning("⚠️ OpenAI API 키를 입력해주세요.")
    
    with tabs[1]:
        st.header("생성된 문제")
        
        if st.session_state.questions:
            # 문제 표시
            for i, q in enumerate(st.session_state.questions, 1):
                with st.container():
                    st.markdown(f"### 문제 {i}")
                    
                    # 문제 정보
                    col1, col2 = st.columns([3, 1])
                    with col1:
                        st.markdown(f"**{q['question']}**")
                    with col2:
                        st.markdown(f"난이도: **{q['difficulty']}** | 유형: **{q.get('question_type', '기타')}**")
                    
                    # 선택지
                    for j, option in enumerate(q['options'], 1):
                        if j == q['answer'] + 1:
                            st.markdown(f"✅ {j}. {option}")
                        else:
                            st.markdown(f"{j}. {option}")
                    
                    # 해설
                    with st.expander("💡 해설 보기"):
                        st.info(q['explanation'])
                    
                    st.divider()
            
            # 다운로드 섹션
            st.header("💾 다운로드")
            
            col1, col2 = st.columns(2)
            
            with col1:
                # JSON 다운로드
                manager = DataManager()
                json_data = {
                    "metadata": {
                        "created_at": datetime.now().isoformat(),
                        "total_questions": len(st.session_state.questions),
                        "difficulty": difficulty,
                        "question_type": question_type
                    },
                    "questions": st.session_state.questions
                }
                
                json_str = json.dumps(json_data, ensure_ascii=False, indent=2)
                
                st.download_button(
                    label="📥 JSON 파일 다운로드",
                    data=json_str,
                    file_name=f"questions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                    mime="application/json"
                )
            
            with col2:
                if export_excel:
                    # Excel 다운로드를 위한 데이터 준비
                    df_data = []
                    for i, q in enumerate(st.session_state.questions, 1):
                        row = {
                            "번호": i,
                            "문제": q["question"],
                            "선택지1": q["options"][0],
                            "선택지2": q["options"][1],
                            "선택지3": q["options"][2],
                            "선택지4": q["options"][3],
                            "정답": q["answer"] + 1,
                            "해설": q["explanation"],
                            "난이도": q["difficulty"],
                            "문제유형": q.get("question_type", "")
                        }
                        df_data.append(row)
                    
                    df = pd.DataFrame(df_data)
                    
                    # Excel 파일로 변환
                    from io import BytesIO
                    output = BytesIO()
                    with pd.ExcelWriter(output, engine='openpyxl') as writer:
                        df.to_excel(writer, sheet_name='문제', index=False)
                    excel_data = output.getvalue()
                    
                    st.download_button(
                        label="📥 Excel 파일 다운로드",
                        data=excel_data,
                        file_name=f"questions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    )
        else:
            st.info("아직 생성된 문제가 없습니다. '파일 업로드' 탭에서 문서를 업로드하고 문제를 생성해주세요.")
    
    with tabs[2]:
        st.header("통계")
        
        if st.session_state.questions:
            # 통계 계산
            manager = DataManager()
            stats = manager.get_statistics(st.session_state.questions)
            
            # 메트릭 표시
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("총 문제 수", stats['total'])
            
            # 난이도별 통계
            if stats['by_difficulty']:
                st.subheader("📊 난이도별 분포")
                df_difficulty = pd.DataFrame(
                    list(stats['by_difficulty'].items()),
                    columns=['난이도', '문제 수']
                )
                st.bar_chart(df_difficulty.set_index('난이도'))
            
            # 유형별 통계
            if stats['by_type']:
                st.subheader("📊 유형별 분포")
                df_type = pd.DataFrame(
                    list(stats['by_type'].items()),
                    columns=['유형', '문제 수']
                )
                st.bar_chart(df_type.set_index('유형'))
            
            # 상세 테이블
            st.subheader("📋 문제 목록")
            df_questions = pd.DataFrame([
                {
                    "번호": i,
                    "문제": q["question"][:50] + "..." if len(q["question"]) > 50 else q["question"],
                    "난이도": q["difficulty"],
                    "유형": q.get("question_type", "기타"),
                    "정답": q["answer"] + 1
                }
                for i, q in enumerate(st.session_state.questions, 1)
            ])
            st.dataframe(df_questions, use_container_width=True)
        else:
            st.info("아직 생성된 문제가 없습니다.")


if __name__ == "__main__":
    main()