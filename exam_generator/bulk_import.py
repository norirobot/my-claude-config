"""
대량 문제 추가 도구
Excel/CSV 파일로 한 번에 여러 문제를 추가할 수 있습니다.
"""

import streamlit as st
import pandas as pd
import json
from datetime import datetime

def convert_csv_to_questions(df):
    """CSV 데이터를 문제 형식으로 변환"""
    questions = []
    
    for _, row in df.iterrows():
        try:
            # 선택지들을 리스트로 변환
            options = [
                str(row['선택지1']).strip(),
                str(row['선택지2']).strip(), 
                str(row['선택지3']).strip(),
                str(row['선택지4']).strip()
            ]
            
            question = {
                "id": str(row['문제ID']),
                "category": str(row['카테고리']),
                "subcategory": str(row['세부분야']),
                "difficulty": str(row['난이도']),
                "year": str(row['연도']),
                "round": str(row['회차']),
                "question": str(row['문제']),
                "options": options,
                "correct_answer": int(row['정답']) - 1,  # 1번->0, 2번->1, ...
                "explanation": str(row['해설'])
            }
            questions.append(question)
        except Exception as e:
            st.error(f"행 {_+1} 처리 중 오류: {e}")
    
    return questions

def main():
    st.title("📊 대량 문제 추가 도구")
    st.markdown("Excel/CSV 파일로 한 번에 여러 문제를 추가할 수 있습니다.")
    
    # 샘플 파일 다운로드
    st.subheader("1️⃣ 샘플 파일 다운로드")
    
    sample_data = {
        '문제ID': ['2024_1_001', '2024_1_002'],
        '카테고리': ['소프트웨어설계', '데이터베이스구축'],
        '세부분야': ['요구사항확인', 'SQL응용'],
        '난이도': ['중', '상'],
        '연도': ['2024', '2024'],
        '회차': ['1회', '1회'],
        '문제': [
            '소프트웨어 생명주기 모델 중 폭포수 모델의 특징은?',
            'SQL에서 JOIN의 종류가 아닌 것은?'
        ],
        '선택지1': ['순차적 진행', 'INNER JOIN'],
        '선택지2': ['반복적 진행', 'LEFT JOIN'],
        '선택지3': ['병렬적 진행', 'RIGHT JOIN'],
        '선택지4': ['무작위 진행', 'MIDDLE JOIN'],
        '정답': [1, 4],
        '해설': [
            '폭포수 모델은 순차적으로 진행되는 전통적인 개발 방법론입니다.',
            'MIDDLE JOIN은 존재하지 않는 조인 방식입니다.'
        ]
    }
    
    sample_df = pd.DataFrame(sample_data)
    csv_data = sample_df.to_csv(index=False, encoding='utf-8-sig')
    
    st.download_button(
        label="📄 샘플 CSV 파일 다운로드",
        data=csv_data,
        file_name="sample_questions.csv",
        mime="text/csv"
    )
    
    st.info("💡 위 샘플 파일을 다운로드해서 형식을 확인하고, 여러분의 문제를 추가하세요!")
    
    # 파일 업로드
    st.subheader("2️⃣ 문제 파일 업로드")
    
    uploaded_file = st.file_uploader(
        "CSV 파일을 선택하세요",
        type=['csv'],
        help="위 샘플 형식에 맞춰 작성된 CSV 파일을 업로드하세요."
    )
    
    if uploaded_file is not None:
        try:
            # CSV 파일 읽기
            df = pd.read_csv(uploaded_file, encoding='utf-8-sig')
            
            st.subheader("3️⃣ 데이터 미리보기")
            st.dataframe(df)
            
            st.subheader("4️⃣ 데이터 검증")
            
            required_columns = [
                '문제ID', '카테고리', '세부분야', '난이도', '연도', '회차',
                '문제', '선택지1', '선택지2', '선택지3', '선택지4', '정답', '해설'
            ]
            
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                st.error(f"❌ 필수 컬럼이 누락되었습니다: {missing_columns}")
            else:
                st.success("✅ 모든 필수 컬럼이 있습니다!")
                
                # 데이터 변환
                questions = convert_csv_to_questions(df)
                
                st.subheader("5️⃣ 변환된 문제 미리보기")
                
                for i, q in enumerate(questions[:3]):  # 처음 3개만 미리보기
                    with st.expander(f"문제 {i+1} 미리보기"):
                        st.write(f"**ID**: {q['id']}")
                        st.write(f"**카테고리**: {q['category']}")
                        st.write(f"**문제**: {q['question']}")
                        
                        for j, opt in enumerate(q['options']):
                            if j == q['correct_answer']:
                                st.success(f"✅ {j+1}. {opt}")
                            else:
                                st.write(f"{j+1}. {opt}")
                        
                        st.info(f"**해설**: {q['explanation']}")
                
                if len(questions) > 3:
                    st.info(f"... 총 {len(questions)}개 문제가 있습니다.")
                
                # 저장 버튼
                if st.button("💾 모든 문제 저장", type="primary"):
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
                    
                    # 새 문제들 추가
                    db_data["questions"].extend(questions)
                    db_data["metadata"]["total_questions"] = len(db_data["questions"])
                    db_data["metadata"]["last_updated"] = datetime.now().strftime("%Y-%m-%d")
                    
                    # 저장
                    with open("real_past_questions_db.json", 'w', encoding='utf-8') as f:
                        json.dump(db_data, f, ensure_ascii=False, indent=2)
                    
                    st.success(f"✅ {len(questions)}개의 문제가 성공적으로 추가되었습니다!")
                    st.balloons()
        
        except Exception as e:
            st.error(f"파일 처리 중 오류가 발생했습니다: {e}")

if __name__ == "__main__":
    main()