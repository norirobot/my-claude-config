"""
기출문제 기반 Streamlit 웹 인터페이스
실제 기출문제를 활용한 시험 문제 생성
"""

import streamlit as st
import os
from datetime import datetime
import json
import pandas as pd

from past_question_manager import PastQuestionManager
from data_manager import DataManager

# 페이지 설정
st.set_page_config(
    page_title="정보처리기사 기출문제 시스템",
    page_icon="📚",
    layout="wide"
)

def init_session_state():
    """세션 상태 초기화"""
    if 'questions' not in st.session_state:
        st.session_state.questions = []
    if 'manager' not in st.session_state:
        st.session_state.manager = PastQuestionManager()
    if 'user_answers' not in st.session_state:
        st.session_state.user_answers = {}
    if 'show_results' not in st.session_state:
        st.session_state.show_results = {}
    if 'start_time' not in st.session_state:
        st.session_state.start_time = None
    if 'test_stats' not in st.session_state:
        st.session_state.test_stats = {
            'total_tests': 0,
            'total_questions': 0,
            'correct_answers': 0,
            'wrong_questions': [],
            'avg_time_per_question': 0,
            'category_stats': {}
        }

def display_question_stats():
    """문제 통계 표시"""
    if 'manager' in st.session_state:
        stats = st.session_state.manager.get_question_stats()
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("총 문제 수", f"{stats['total_questions']}개")
        
        with col2:
            categories = len(stats['categories'])
            st.metric("카테고리", f"{categories}개")
        
        with col3:
            years = len(stats['years'])
            st.metric("출제 연도", f"{years}개년")
        
        with col4:
            difficulties = len(stats['difficulties'])
            st.metric("난이도", f"{difficulties}단계")

def main():
    """메인 함수"""
    init_session_state()
    
    # 타이틀
    st.title("📚 정보처리기사 기출문제 시스템")
    st.markdown("**실제 기출문제**를 활용한 맞춤형 시험 문제 생성 시스템")
    st.markdown("---")
    
    # 통계 대시보드
    st.subheader("📊 문제 통계")
    display_question_stats()
    st.markdown("---")
    
    # 메인 레이아웃
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.header("⚙️ 시험 설정")
        
        # 기본 설정
        st.subheader("출제 범위")
        
        categories = ["전체"] + st.session_state.manager.get_categories()
        selected_category = st.selectbox(
            "카테고리",
            categories,
            help="특정 분야만 출제하거나 전체에서 출제"
        )
        
        difficulties = ["전체"] + st.session_state.manager.get_difficulties()
        selected_difficulty = st.selectbox(
            "난이도",
            difficulties,
            index=0,
            help="문제의 난이도 수준"
        )
        
        years = ["전체"] + st.session_state.manager.get_years()
        selected_year = st.selectbox(
            "출제 연도",
            years,
            help="특정 연도 기출문제만 선택"
        )
        
        st.subheader("출제 설정")
        
        num_questions = st.slider(
            "문제 개수",
            min_value=1,
            max_value=50,
            value=10,
            help="생성할 문제의 개수"
        )
        
        shuffle_options = st.checkbox(
            "선택지 순서 섞기",
            value=True,
            help="매번 다른 순서로 선택지 제공"
        )
        
        # 미리보기
        st.subheader("📋 선택된 조건")
        filter_category = selected_category if selected_category != "전체" else None
        filter_difficulty = selected_difficulty if selected_difficulty != "전체" else None
        filter_year = selected_year if selected_year != "전체" else None
        
        available_questions = st.session_state.manager.filter_questions(
            category=filter_category,
            difficulty=filter_difficulty,
            year=filter_year
        )
        
        st.info(f"조건에 맞는 문제: **{len(available_questions)}개**")
        
        if available_questions:
            st.success("✅ 문제 생성 가능")
        else:
            st.error("❌ 조건에 맞는 문제가 없습니다")
        
        # 문제 생성 버튼
        st.markdown("---")
        if st.button("🎯 기출문제 시험 생성", disabled=len(available_questions)==0):
            with st.spinner("기출문제를 준비하는 중..."):
                # 문제 생성
                questions = st.session_state.manager.generate_random_test(
                    num_questions=num_questions,
                    category=filter_category,
                    difficulty=filter_difficulty,
                    year=filter_year,
                    shuffle_options=shuffle_options
                )
                
                if questions:
                    # 이전 상태 초기화
                    st.session_state.questions = questions
                    st.session_state.user_answers = {}
                    st.session_state.show_results = {}
                    st.session_state.start_time = datetime.now()
                    st.success(f"✅ {len(questions)}개의 기출문제를 준비했습니다!")
                    st.balloons()
                else:
                    st.error("문제 생성에 실패했습니다.")
    
    with col2:
        st.header("❓ 생성된 기출문제")
        
        if st.session_state.questions:
            # 필터링 옵션
            show_explanations = st.checkbox(
                "해설 자동 표시",
                value=False,
                help="문제와 함께 해설을 바로 표시"
            )
            
            # 시험 완료 버튼
            if st.button("📊 시험 완료 및 결과"):
                # 통계 계산
                total_answered = len(st.session_state.user_answers)
                correct_count = 0
                wrong_questions = []
                
                for question in st.session_state.questions:
                    user_answer = st.session_state.user_answers.get(question.id)
                    if user_answer is not None:
                        if user_answer == question.correct_answer:
                            correct_count += 1
                        else:
                            wrong_questions.append({
                                'id': question.id,
                                'question': question.question,
                                'category': question.category,
                                'user_answer': user_answer,
                                'correct_answer': question.correct_answer
                            })
                
                # 시간 계산
                if st.session_state.start_time:
                    elapsed_time = (datetime.now() - st.session_state.start_time).total_seconds()
                    avg_time = elapsed_time / len(st.session_state.questions) if st.session_state.questions else 0
                else:
                    elapsed_time = 0
                    avg_time = 0
                
                # 통계 업데이트
                st.session_state.test_stats['total_tests'] += 1
                st.session_state.test_stats['total_questions'] += total_answered
                st.session_state.test_stats['correct_answers'] += correct_count
                st.session_state.test_stats['wrong_questions'].extend(wrong_questions)
                
                # 결과 표시
                st.success(f"시험 완료! 정답률: {correct_count}/{total_answered} ({(correct_count/total_answered*100):.1f}%)")
                st.info(f"⏱️ 총 시간: {elapsed_time/60:.1f}분 | 문제당 평균: {avg_time:.1f}초")
                
            # 새 문제 버튼
            if st.button("🔄 새로운 문제"):
                st.session_state.questions = []
                st.session_state.user_answers = {}
                st.session_state.show_results = {}
                st.session_state.start_time = None
                st.rerun()
            
            st.markdown("---")
            
            # 문제 표시
            for i, question in enumerate(st.session_state.questions, 1):
                # 문제 헤더
                st.subheader(f"문제 {i} ({question.year}년 {question.round})")
                
                # 문제 내용
                st.markdown(f"**{question.question}**")
                
                # 사용자 선택
                question_key = f"q_{question.id}"
                
                # 선택지를 라디오 버튼으로 표시
                user_choice = st.radio(
                    f"문제 {i} 선택:",
                    options=list(range(len(question.options))) + ["선택 안함"],
                    format_func=lambda x: f"{x+1}. {question.options[x]}" if isinstance(x, int) else "답을 선택하세요",
                    key=question_key,
                    index=len(question.options)  # "선택 안함"을 기본값으로
                )
                
                # 사용자 답안 저장
                if user_choice != "선택 안함" and isinstance(user_choice, int):
                    st.session_state.user_answers[question.id] = user_choice
                
                # 정답 확인 버튼
                result_key = f"result_{question.id}"
                if st.button(f"정답 확인", key=f"check_{question.id}"):
                    st.session_state.show_results[question.id] = True
                
                # 결과 표시
                if st.session_state.show_results.get(question.id, False):
                    user_answer = st.session_state.user_answers.get(question.id)
                    if user_answer is not None and isinstance(user_answer, int):
                        if user_answer == question.correct_answer:
                            st.success(f"✅ 정답! ({user_answer + 1}번)")
                        else:
                            st.error(f"❌ 오답. 정답: {question.correct_answer + 1}번, 선택: {user_answer + 1}번")
                            st.info(f"💡 **해설**: {question.explanation}")
                    else:
                        st.warning("답을 선택해주세요.")
                
                # 추가 정보
                st.caption(f"🏷️ {question.category} | 📊 난이도: {question.difficulty} | 🆔 {question.id}")
                
                # 해설 표시
                if show_explanations:
                    st.info(f"💡 **해설**: {question.explanation}")
                else:
                    with st.expander("💡 해설 보기"):
                        st.info(question.explanation)
                
                st.markdown("---")
            
            # 다운로드 섹션
            st.subheader("📥 다운로드")
            
            # JSON 다운로드
            json_data = json.dumps(
                [q.to_dict() for q in st.session_state.questions],
                ensure_ascii=False,
                indent=2
            )
            
            st.download_button(
                label="📄 JSON 파일 다운로드",
                data=json_data,
                file_name=f"past_exam_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )
            
            # CSV 다운로드
            df = pd.DataFrame([q.to_dict() for q in st.session_state.questions])
            csv = df.to_csv(index=False, encoding='utf-8-sig')
            
            st.download_button(
                label="📊 CSV 파일 다운로드",
                data=csv,
                file_name=f"past_exam_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )
            
            # 시험 결과 분석
            st.subheader("📈 시험 구성 분석")
            
            # 카테고리별 분포
            category_counts = {}
            difficulty_counts = {}
            
            for q in st.session_state.questions:
                category_counts[q.category] = category_counts.get(q.category, 0) + 1
                difficulty_counts[q.difficulty] = difficulty_counts.get(q.difficulty, 0) + 1
            
            st.write("**카테고리별 분포**")
            for cat, count in category_counts.items():
                st.write(f"- {cat}: {count}문제")
            
            st.write("**난이도별 분포**")
            for diff, count in difficulty_counts.items():
                st.write(f"- {diff}: {count}문제")
            
            # 학습 통계 대시보드
            st.subheader("📊 나의 학습 통계")
            
            stats = st.session_state.test_stats
            if stats['total_tests'] > 0:
                overall_accuracy = (stats['correct_answers'] / stats['total_questions'] * 100) if stats['total_questions'] > 0 else 0
                
                # 전체 통계
                st.metric("총 시험 횟수", f"{stats['total_tests']}회")
                st.metric("전체 정답률", f"{overall_accuracy:.1f}%")
                st.metric("총 풀이 문제 수", f"{stats['total_questions']}문제")
                
                # 틀린 문제 분석
                if stats['wrong_questions']:
                    st.subheader("❌ 자주 틀리는 문제 유형")
                    
                    # 카테고리별 오답 분석
                    category_errors = {}
                    for wrong in stats['wrong_questions']:
                        cat = wrong['category']
                        category_errors[cat] = category_errors.get(cat, 0) + 1
                    
                    for cat, count in sorted(category_errors.items(), key=lambda x: x[1], reverse=True):
                        st.write(f"- {cat}: {count}문제 오답")
                    
                    # 최근 틀린 문제들 (최대 5개)
                    st.subheader("🔍 최근 틀린 문제들")
                    recent_wrong = stats['wrong_questions'][-5:] if len(stats['wrong_questions']) > 5 else stats['wrong_questions']
                    
                    for wrong in recent_wrong:
                        with st.expander(f"❌ {wrong['question'][:50]}..."):
                            st.write(f"**카테고리**: {wrong['category']}")
                            st.write(f"**내 답**: {wrong['user_answer'] + 1}번")
                            st.write(f"**정답**: {wrong['correct_answer'] + 1}번")
                else:
                    st.info("아직 틀린 문제가 없습니다! 👏")
            else:
                st.info("아직 시험을 완료하지 않았습니다. 시험을 완료하면 상세한 학습 통계를 확인할 수 있습니다.")
        
        else:
            st.info("왼쪽에서 조건을 설정하고 '기출문제 시험 생성' 버튼을 클릭하세요!")
            
            # 샘플 문제 미리보기
            st.subheader("🔍 샘플 문제 미리보기")
            
            if st.button("샘플 문제 보기"):
                sample_questions = st.session_state.manager.generate_random_test(
                    num_questions=1,
                    shuffle_options=False
                )
                
                if sample_questions:
                    q = sample_questions[0]
                    st.markdown(f"**[샘플] {q.question}**")
                    
                    for j, opt in enumerate(q.options, 1):
                        if j-1 == q.correct_answer:
                            st.success(f"✅ {j}. {opt}")
                        else:
                            st.write(f"{j}. {opt}")
                    
                    st.caption(f"출처: {q.year}년 {q.round} | 카테고리: {q.category}")

if __name__ == "__main__":
    main()