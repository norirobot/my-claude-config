"""
기출문제 관리 도구
새로운 문제를 쉽게 추가하고 관리할 수 있는 웹 인터페이스
"""

import streamlit as st
import json
import os
from datetime import datetime
from past_question_manager import PastQuestion

# 페이지 설정
st.set_page_config(
    page_title="기출문제 관리 도구",
    page_icon="⚙️",
    layout="wide"
)

def load_questions_db():
    """기출문제 DB 로드"""
    db_file = "real_past_questions_db.json"
    try:
        with open(db_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "metadata": {
                "exam_name": "정보처리기사",
                "total_questions": 0,
                "categories": ["소프트웨어설계", "소프트웨어개발", "데이터베이스구축", "프로그래밍언어활용", "정보시스템구축관리"],
                "difficulty_levels": ["하", "중", "상"],
                "last_updated": datetime.now().strftime("%Y-%m-%d")
            },
            "questions": []
        }

def save_questions_db(data):
    """기출문제 DB 저장"""
    db_file = "real_past_questions_db.json"
    data["metadata"]["total_questions"] = len(data["questions"])
    data["metadata"]["last_updated"] = datetime.now().strftime("%Y-%m-%d")
    
    with open(db_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    st.title("⚙️ 기출문제 관리 도구")
    st.markdown("새로운 기출문제를 추가하고 관리할 수 있습니다.")
    
    # 현재 데이터 로드
    if 'db_data' not in st.session_state:
        st.session_state.db_data = load_questions_db()
    
    # 탭 생성
    tab1, tab2, tab3 = st.tabs(["📝 새 문제 추가", "📊 문제 현황", "📋 문제 목록"])
    
    with tab1:
        st.header("새로운 기출문제 추가")
        
        # 문제 정보 입력
        col1, col2 = st.columns(2)
        
        with col1:
            year = st.selectbox("연도", ["2024", "2023", "2022", "2021"])
            round_num = st.selectbox("회차", ["1회", "2회", "3회", "4회"])
            category = st.selectbox(
                "카테고리", 
                st.session_state.db_data["metadata"]["categories"]
            )
        
        with col2:
            subcategory = st.text_input("세부 분야", placeholder="예: 요구사항확인")
            difficulty = st.selectbox("난이도", ["하", "중", "상"])
            question_id = st.text_input(
                "문제 ID", 
                value=f"{year}_{round_num.replace('회', '')}_{len([q for q in st.session_state.db_data['questions'] if q['year'] == year and q['round'] == round_num]) + 1:03d}"
            )
        
        # 문제 내용
        st.subheader("문제 내용")
        question_text = st.text_area(
            "문제 지문",
            placeholder="예: 소프트웨어 생명주기 모델 중 폭포수 모델의 특징으로 옳은 것은?",
            height=100
        )
        
        # 선택지
        st.subheader("선택지")
        options = []
        for i in range(4):
            option = st.text_input(f"{i+1}번 선택지", key=f"option_{i}")
            if option:
                options.append(option)
        
        # 정답 및 해설
        col3, col4 = st.columns(2)
        with col3:
            correct_answer = st.selectbox("정답", [1, 2, 3, 4]) - 1
        
        with col4:
            explanation = st.text_area(
                "해설",
                placeholder="정답에 대한 상세한 설명을 입력하세요.",
                height=80
            )
        
        # 저장 버튼
        if st.button("💾 문제 저장", type="primary"):
            if question_text and len(options) == 4 and explanation:
                new_question = {
                    "id": question_id,
                    "category": category,
                    "subcategory": subcategory,
                    "difficulty": difficulty,
                    "year": year,
                    "round": round_num,
                    "question": question_text,
                    "options": options,
                    "correct_answer": correct_answer,
                    "explanation": explanation
                }
                
                st.session_state.db_data["questions"].append(new_question)
                save_questions_db(st.session_state.db_data)
                
                st.success(f"✅ 문제가 성공적으로 저장되었습니다! (ID: {question_id})")
                st.balloons()
            else:
                st.error("❌ 모든 필드를 입력해주세요.")
    
    with tab2:
        st.header("📊 문제 현황")
        
        total = len(st.session_state.db_data["questions"])
        st.metric("전체 문제 수", f"{total}개")
        
        if total > 0:
            # 카테고리별 통계
            categories = {}
            years = {}
            difficulties = {}
            
            for q in st.session_state.db_data["questions"]:
                categories[q["category"]] = categories.get(q["category"], 0) + 1
                years[q["year"]] = years.get(q["year"], 0) + 1
                difficulties[q["difficulty"]] = difficulties.get(q["difficulty"], 0) + 1
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.subheader("카테고리별")
                for cat, count in categories.items():
                    st.write(f"- {cat}: {count}개")
            
            with col2:
                st.subheader("연도별")
                for year, count in sorted(years.items(), reverse=True):
                    st.write(f"- {year}년: {count}개")
            
            with col3:
                st.subheader("난이도별")
                for diff, count in difficulties.items():
                    st.write(f"- {diff}: {count}개")
    
    with tab3:
        st.header("📋 문제 목록")
        
        if st.session_state.db_data["questions"]:
            # 필터링 옵션
            filter_category = st.selectbox(
                "카테고리 필터", 
                ["전체"] + st.session_state.db_data["metadata"]["categories"]
            )
            
            # 문제 목록 표시
            filtered_questions = st.session_state.db_data["questions"]
            if filter_category != "전체":
                filtered_questions = [q for q in filtered_questions if q["category"] == filter_category]
            
            for i, q in enumerate(filtered_questions):
                with st.expander(f"[{q['id']}] {q['question'][:50]}..."):
                    st.write(f"**카테고리**: {q['category']}")
                    st.write(f"**난이도**: {q['difficulty']}")
                    st.write(f"**출처**: {q['year']}년 {q['round']}")
                    st.write(f"**문제**: {q['question']}")
                    
                    for j, opt in enumerate(q['options']):
                        if j == q['correct_answer']:
                            st.success(f"✅ {j+1}. {opt}")
                        else:
                            st.write(f"{j+1}. {opt}")
                    
                    st.info(f"**해설**: {q['explanation']}")
                    
                    # 삭제 버튼
                    if st.button(f"🗑️ 삭제", key=f"delete_{q['id']}"):
                        st.session_state.db_data["questions"] = [
                            question for question in st.session_state.db_data["questions"] 
                            if question["id"] != q["id"]
                        ]
                        save_questions_db(st.session_state.db_data)
                        st.success("문제가 삭제되었습니다.")
                        st.rerun()
        else:
            st.info("아직 등록된 문제가 없습니다.")

if __name__ == "__main__":
    main()