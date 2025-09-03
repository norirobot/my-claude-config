"""
개선된 Streamlit 웹 인터페이스
한국 국가공인자격증 시험 문제 생성 웹 애플리케이션
"""

import streamlit as st
import os
import tempfile
from datetime import datetime
import json
import pandas as pd
import time

from document_reader import DocumentReader
from question_generator_improved import ImprovedQuestionGenerator, Question
from data_manager import DataManager


# 페이지 설정
st.set_page_config(
    page_title="AI 시험 문제 생성기",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 커스텀 CSS
st.markdown("""
<style>
    /* 메인 컨테이너 스타일 */
    .main {
        padding: 0rem 1rem;
    }
    
    /* 버튼 스타일 */
    .stButton > button {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: bold;
        border-radius: 10px;
        border: none;
        padding: 0.5rem 1rem;
        transition: all 0.3s;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(0,0,0,0.2);
    }
    
    /* 문제 박스 스타일 */
    .question-box {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        color: white;
    }
    
    /* 정답 선택지 스타일 */
    .correct-option {
        background-color: #48bb78;
        color: white;
        padding: 10px;
        border-radius: 8px;
        margin: 5px 0;
        font-weight: bold;
    }
    
    /* 오답 선택지 스타일 */
    .wrong-option {
        background-color: #f0f2f6;
        padding: 10px;
        border-radius: 8px;
        margin: 5px 0;
    }
    
    /* 통계 카드 */
    .stat-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
    }
    
    /* 진행률 표시 */
    .progress-text {
        font-size: 14px;
        color: #666;
        margin-top: 10px;
    }
    
    /* 헤더 그라데이션 */
    h1 {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)


def init_session_state():
    """세션 상태 초기화"""
    if 'questions' not in st.session_state:
        st.session_state.questions = []
    if 'document_content' not in st.session_state:
        st.session_state.document_content = ""
    if 'generation_history' not in st.session_state:
        st.session_state.generation_history = []
    if 'total_questions_generated' not in st.session_state:
        st.session_state.total_questions_generated = 0


def display_question_card(question: Question, index: int):
    """문제 카드 표시"""
    with st.container():
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
                    padding: 20px; border-radius: 15px; margin: 20px 0;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            <h3 style="color: #2d3748;">문제 {index}</h3>
            <p style="font-size: 16px; color: #2d3748; font-weight: 500;">{question.question}</p>
        </div>
        """, unsafe_allow_html=True)
        
        # 선택지 표시
        for i, option in enumerate(question.options, 1):
            if i-1 == question.answer:
                st.success(f"✅ {i}. {option}")
            else:
                st.write(f"⭕ {i}. {option}")
        
        # 해설 표시 (접을 수 있는 형태로)
        with st.expander("💡 해설 보기"):
            st.info(question.explanation)
            st.caption(f"난이도: {question.difficulty} | 유형: {question.question_type}")


def display_statistics():
    """통계 표시"""
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("총 생성 문제", st.session_state.total_questions_generated)
    
    with col2:
        st.metric("현재 세션 문제", len(st.session_state.questions))
    
    with col3:
        if st.session_state.questions:
            difficulties = [q.difficulty for q in st.session_state.questions]
            most_common = max(set(difficulties), key=difficulties.count)
            st.metric("주요 난이도", most_common)
        else:
            st.metric("주요 난이도", "-")
    
    with col4:
        if st.session_state.questions:
            types = [q.question_type for q in st.session_state.questions]
            most_common = max(set(types), key=types.count)
            st.metric("주요 유형", most_common)
        else:
            st.metric("주요 유형", "-")


def main():
    """메인 함수"""
    init_session_state()
    
    # 헤더
    col1, col2 = st.columns([3, 1])
    with col1:
        st.title("🎓 AI 시험 문제 생성기")
        st.markdown("**국가공인자격증** 시험 대비 문제를 자동으로 생성합니다")
    
    with col2:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("🔄 초기화", help="모든 데이터를 초기화합니다"):
            st.session_state.questions = []
            st.session_state.document_content = ""
            st.rerun()
    
    # 통계 대시보드
    with st.container():
        st.markdown("### 📊 통계")
        display_statistics()
    
    st.divider()
    
    # 사이드바 설정
    with st.sidebar:
        st.header("⚙️ 설정")
        
        # 생성 모드 선택
        generation_mode = st.radio(
            "생성 모드",
            ["🚀 빠른 생성 (로컬)", "🔮 고품질 생성 (API)", "⚡ 하이브리드"],
            help="로컬: 빠르지만 단순한 문제\nAPI: 느리지만 고품질 문제\n하이브리드: 균형잡힌 선택"
        )
        
        # API 키 입력 (API 모드일 때만)
        if generation_mode in ["🔮 고품질 생성 (API)", "⚡ 하이브리드"]:
            api_key = st.text_input(
                "OpenAI API Key",
                type="password",
                help="OpenAI API 키를 입력하세요",
                value=os.getenv("OPENAI_API_KEY", "")
            )
        else:
            api_key = None
        
        st.divider()
        
        # 문제 생성 옵션
        st.subheader("📝 문제 설정")
        
        difficulty = st.select_slider(
            "난이도",
            options=["하", "중", "상"],
            value="중",
            help="하: 기초 개념\n중: 일반 수준\n상: 심화 내용"
        )
        
        question_type = st.selectbox(
            "문제 유형",
            ["혼합", "정의형", "특징형", "비교형", "적용형"],
            help="혼합: 모든 유형을 골고루"
        )
        
        num_questions = st.slider(
            "문제 개수",
            min_value=1,
            max_value=30,
            value=5,
            step=1,
            help="한 번에 생성할 문제 수"
        )
        
        st.divider()
        
        # 고급 옵션
        with st.expander("🔧 고급 옵션"):
            use_paragraphs = st.checkbox(
                "문단별 분석",
                help="긴 문서를 문단으로 나누어 분석"
            )
            
            randomize_order = st.checkbox(
                "선택지 순서 무작위",
                value=True,
                help="선택지 순서를 무작위로 섞기"
            )
            
            show_explanations = st.checkbox(
                "해설 자동 표시",
                value=False,
                help="문제 생성 시 해설 자동 표시"
            )
    
    # 메인 컨텐츠
    tab1, tab2, tab3 = st.tabs(["📄 문서 업로드", "❓ 생성된 문제", "📈 분석"])
    
    with tab1:
        st.header("문서 업로드")
        
        # 파일 업로더
        uploaded_file = st.file_uploader(
            "PDF 또는 TXT 파일을 선택하세요",
            type=['pdf', 'txt'],
            help="최대 10MB까지 업로드 가능합니다"
        )
        
        if uploaded_file is not None:
            # 파일 정보 표시
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("파일명", uploaded_file.name)
            with col2:
                file_size = uploaded_file.size / 1024
                st.metric("크기", f"{file_size:.1f} KB")
            with col3:
                st.metric("형식", uploaded_file.type.split('/')[-1].upper())
            
            # 문서 읽기 버튼
            if st.button("📖 문서 읽기", type="primary"):
                with st.spinner("문서를 읽는 중..."):
                    # 임시 파일로 저장
                    with tempfile.NamedTemporaryFile(delete=False, suffix=uploaded_file.name) as tmp_file:
                        tmp_file.write(uploaded_file.getbuffer())
                        tmp_path = tmp_file.name
                    
                    # 문서 읽기
                    reader = DocumentReader()
                    content = reader.read_file(tmp_path)
                    
                    if content:
                        st.session_state.document_content = content
                        st.success(f"✅ 문서를 성공적으로 읽었습니다! (총 {len(content)} 글자)")
                        
                        # 내용 미리보기
                        with st.expander("📄 문서 내용 미리보기"):
                            st.text_area("", content[:1000] + "...", height=200, disabled=True)
                    else:
                        st.error("❌ 문서를 읽을 수 없습니다.")
                    
                    # 임시 파일 삭제
                    os.unlink(tmp_path)
        
        # 문제 생성 버튼
        if st.session_state.document_content:
            st.divider()
            
            col1, col2 = st.columns([2, 1])
            with col1:
                if st.button("🎯 문제 생성", type="primary", use_container_width=True):
                    with st.spinner("AI가 문제를 생성하는 중... 잠시만 기다려주세요"):
                        # 진행률 표시
                        progress_bar = st.progress(0)
                        progress_text = st.empty()
                        
                        # 문제 생성기 초기화
                        generator = ImprovedQuestionGenerator()
                        
                        # 문제 생성
                        questions = []
                        for i in range(num_questions):
                            progress = (i + 1) / num_questions
                            progress_bar.progress(progress)
                            progress_text.text(f"생성 중... {i+1}/{num_questions}")
                            
                            q = generator.generate_definition_question(
                                st.session_state.document_content,
                                difficulty
                            )
                            if q:
                                questions.append(q)
                            
                            time.sleep(0.1)  # 시각적 효과
                        
                        if questions:
                            st.session_state.questions = questions
                            st.session_state.total_questions_generated += len(questions)
                            st.session_state.generation_history.append({
                                'timestamp': datetime.now(),
                                'count': len(questions),
                                'difficulty': difficulty,
                                'type': question_type
                            })
                            
                            progress_bar.progress(1.0)
                            progress_text.text("완료!")
                            time.sleep(0.5)
                            
                            st.success(f"🎉 {len(questions)}개의 문제를 생성했습니다!")
                            st.balloons()
                        else:
                            st.error("문제 생성에 실패했습니다.")
            
            with col2:
                st.metric("문서 길이", f"{len(st.session_state.document_content)} 글자")
    
    with tab2:
        st.header("생성된 문제")
        
        if st.session_state.questions:
            # 문제 필터링 옵션
            col1, col2 = st.columns([2, 1])
            with col1:
                filter_difficulty = st.multiselect(
                    "난이도 필터",
                    ["상", "중", "하"],
                    default=["상", "중", "하"]
                )
            
            # 필터링된 문제 표시
            filtered_questions = [
                q for q in st.session_state.questions 
                if q.difficulty in filter_difficulty
            ]
            
            if filtered_questions:
                for i, question in enumerate(filtered_questions, 1):
                    display_question_card(question, i)
                
                # 다운로드 버튼
                st.divider()
                col1, col2 = st.columns(2)
                
                with col1:
                    # JSON 다운로드
                    json_data = json.dumps(
                        [q.to_dict() for q in filtered_questions],
                        ensure_ascii=False,
                        indent=2
                    )
                    st.download_button(
                        label="📥 JSON 다운로드",
                        data=json_data,
                        file_name=f"questions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                        mime="application/json"
                    )
                
                with col2:
                    # Excel 다운로드
                    df = pd.DataFrame([q.to_dict() for q in filtered_questions])
                    csv = df.to_csv(index=False, encoding='utf-8-sig')
                    st.download_button(
                        label="📥 CSV 다운로드",
                        data=csv,
                        file_name=f"questions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                        mime="text/csv"
                    )
            else:
                st.info("선택한 필터에 해당하는 문제가 없습니다.")
        else:
            st.info("아직 생성된 문제가 없습니다. 문서를 업로드하고 문제를 생성해보세요!")
    
    with tab3:
        st.header("문제 분석")
        
        if st.session_state.questions:
            # 난이도 분포
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("난이도 분포")
                difficulty_counts = pd.DataFrame(
                    [(q.difficulty, 1) for q in st.session_state.questions],
                    columns=['난이도', '개수']
                ).groupby('난이도').sum()
                st.bar_chart(difficulty_counts)
            
            with col2:
                st.subheader("문제 유형 분포")
                type_counts = pd.DataFrame(
                    [(q.question_type, 1) for q in st.session_state.questions],
                    columns=['유형', '개수']
                ).groupby('유형').sum()
                st.bar_chart(type_counts)
            
            # 생성 이력
            if st.session_state.generation_history:
                st.subheader("생성 이력")
                history_df = pd.DataFrame(st.session_state.generation_history)
                history_df['timestamp'] = pd.to_datetime(history_df['timestamp'])
                history_df['시간'] = history_df['timestamp'].dt.strftime('%H:%M:%S')
                st.dataframe(
                    history_df[['시간', 'count', 'difficulty', 'type']].rename(
                        columns={'count': '문제수', 'difficulty': '난이도', 'type': '유형'}
                    ),
                    use_container_width=True
                )
        else:
            st.info("분석할 문제가 없습니다.")


if __name__ == "__main__":
    main()