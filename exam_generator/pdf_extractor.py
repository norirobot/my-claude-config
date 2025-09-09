"""
PDF 기출문제 추출 도구
PDF 파일에서 문제를 자동으로 추출하여 CSV 형식으로 변환합니다.
"""

import streamlit as st
import pdfplumber
import re
import pandas as pd
from datetime import datetime
import json

class PDFQuestionExtractor:
    """PDF에서 문제 추출하는 클래스"""
    
    def __init__(self):
        self.questions = []
        
    def extract_text_from_pdf(self, pdf_file):
        """PDF에서 텍스트 추출"""
        text = ""
        try:
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            st.error(f"PDF 읽기 오류: {e}")
            return None
        
        return text
    
    def parse_questions_auto(self, text):
        """자동으로 문제 패턴 인식하여 추출"""
        questions = []
        
        # 일반적인 문제 패턴들
        patterns = [
            # 패턴 1: "1. 문제내용 ① 선택지1 ② 선택지2 ③ 선택지3 ④ 선택지4"
            r'(\d+)\.\s*(.+?)(?=①|\d+\.|$)',
            # 패턴 2: "문제 1) 문제내용"
            r'문제\s*(\d+)\)\s*(.+?)(?=문제\s*\d+\)|$)',
            # 패턴 3: "[1] 문제내용"
            r'\[(\d+)\]\s*(.+?)(?=\[\d+\]|$)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            if matches:
                st.info(f"패턴 발견: {len(matches)}개 문제")
                break
        
        return matches
    
    def extract_options_from_text(self, question_text):
        """문제 텍스트에서 선택지 추출"""
        # 선택지 패턴들
        option_patterns = [
            r'①\s*(.+?)\s*②\s*(.+?)\s*③\s*(.+?)\s*④\s*(.+?)(?=\s*(?:정답|해설|문제|\d+\.|$))',
            r'1\)\s*(.+?)\s*2\)\s*(.+?)\s*3\)\s*(.+?)\s*4\)\s*(.+?)(?=\s*(?:정답|해설|문제|\d+\.|$))',
            r'가\.\s*(.+?)\s*나\.\s*(.+?)\s*다\.\s*(.+?)\s*라\.\s*(.+?)(?=\s*(?:정답|해설|문제|\d+\.|$))',
            r'ㄱ\.\s*(.+?)\s*ㄴ\.\s*(.+?)\s*ㄷ\.\s*(.+?)\s*ㄹ\.\s*(.+?)(?=\s*(?:정답|해설|문제|\d+\.|$))',
        ]
        
        for pattern in option_patterns:
            match = re.search(pattern, question_text, re.DOTALL)
            if match:
                options = [opt.strip() for opt in match.groups()]
                if len(options) == 4:
                    return options
        
        return None
    
    def extract_answer_from_text(self, question_text):
        """정답 추출"""
        answer_patterns = [
            r'정답[:\s]*([①②③④])',
            r'답[:\s]*([①②③④])',
            r'정답[:\s]*(\d+)',
            r'답[:\s]*(\d+)',
        ]
        
        for pattern in answer_patterns:
            match = re.search(pattern, question_text)
            if match:
                answer = match.group(1)
                # 동그라미 숫자를 일반 숫자로 변환
                if answer == '①': return 1
                elif answer == '②': return 2
                elif answer == '③': return 3
                elif answer == '④': return 4
                elif answer.isdigit(): return int(answer)
        
        return None
    
    def extract_explanation_from_text(self, question_text):
        """해설 추출"""
        explanation_patterns = [
            r'해설[:\s]*(.+?)(?=문제|\d+\.|$)',
            r'풀이[:\s]*(.+?)(?=문제|\d+\.|$)',
            r'설명[:\s]*(.+?)(?=문제|\d+\.|$)',
        ]
        
        for pattern in explanation_patterns:
            match = re.search(pattern, question_text, re.DOTALL)
            if match:
                return match.group(1).strip()
        
        return "해설이 제공되지 않았습니다."

def main():
    st.title("📄 PDF 기출문제 추출 도구")
    st.markdown("""
    **PDF 파일에서 기출문제를 자동으로 추출**하여 CSV 형식으로 변환합니다.
    
    📋 **지원하는 PDF 형식:**
    - 텍스트 기반 PDF (이미지 PDF는 OCR 필요)
    - 일반적인 시험 문제 형식
    - 선택지가 ①②③④ 또는 1)2)3)4) 형태
    """)
    
    extractor = PDFQuestionExtractor()
    
    # 탭 생성
    tab1, tab2, tab3 = st.tabs(["📄 PDF 업로드", "✏️ 수동 편집", "💾 CSV 생성"])
    
    with tab1:
        st.header("1️⃣ PDF 파일 업로드")
        
        uploaded_pdf = st.file_uploader(
            "PDF 파일을 선택하세요",
            type=['pdf'],
            help="기출문제가 포함된 PDF 파일을 업로드하세요"
        )
        
        if uploaded_pdf:
            # PDF 텍스트 추출
            with st.spinner("PDF에서 텍스트를 추출하는 중..."):
                extracted_text = extractor.extract_text_from_pdf(uploaded_pdf)
            
            if extracted_text:
                st.success("✅ PDF 텍스트 추출 완료!")
                
                # 텍스트 미리보기
                with st.expander("📖 추출된 텍스트 미리보기"):
                    st.text_area("", extracted_text[:2000] + "..." if len(extracted_text) > 2000 else extracted_text, height=300)
                
                # 세션 상태에 저장
                st.session_state.extracted_text = extracted_text
                
                # 자동 문제 인식
                if st.button("🔍 자동 문제 인식"):
                    matches = extractor.parse_questions_auto(extracted_text)
                    
                    if matches:
                        st.success(f"✅ {len(matches)}개의 문제를 발견했습니다!")
                        
                        # 인식된 문제들 저장
                        recognized_questions = []
                        for i, (num, content) in enumerate(matches):
                            # 선택지 추출
                            options = extractor.extract_options_from_text(content)
                            # 정답 추출
                            answer = extractor.extract_answer_from_text(content)
                            # 해설 추출
                            explanation = extractor.extract_explanation_from_text(content)
                            
                            # 문제 텍스트 정리 (선택지 부분 제거)
                            question_text = re.split(r'[①②③④]|1\)|2\)|3\)|4\)', content)[0].strip()
                            
                            question_data = {
                                'number': int(num) if num.isdigit() else i + 1,
                                'question': question_text,
                                'options': options,
                                'answer': answer,
                                'explanation': explanation
                            }
                            recognized_questions.append(question_data)
                        
                        st.session_state.recognized_questions = recognized_questions
                        
                        # 미리보기
                        st.subheader("🔍 인식된 문제 미리보기")
                        for i, q in enumerate(recognized_questions[:3]):
                            with st.expander(f"문제 {q['number']}"):
                                st.write(f"**문제**: {q['question']}")
                                if q['options']:
                                    for j, opt in enumerate(q['options']):
                                        st.write(f"{j+1}. {opt}")
                                else:
                                    st.warning("선택지를 인식하지 못했습니다.")
                                
                                if q['answer']:
                                    st.write(f"**정답**: {q['answer']}번")
                                else:
                                    st.warning("정답을 인식하지 못했습니다.")
                                
                                st.write(f"**해설**: {q['explanation']}")
                        
                        if len(recognized_questions) > 3:
                            st.info(f"... 총 {len(recognized_questions)}개 문제")
                    else:
                        st.warning("⚠️ 자동 인식에 실패했습니다. 수동 편집 탭을 이용해주세요.")
            else:
                st.error("❌ PDF에서 텍스트를 추출할 수 없습니다.")
    
    with tab2:
        st.header("2️⃣ 수동 편집 및 보완")
        
        if 'recognized_questions' in st.session_state:
            st.info(f"인식된 {len(st.session_state.recognized_questions)}개 문제를 편집할 수 있습니다.")
            
            # 문제별 편집
            for i, q in enumerate(st.session_state.recognized_questions):
                with st.expander(f"문제 {q['number']} 편집"):
                    # 기본 정보
                    col1, col2 = st.columns(2)
                    with col1:
                        year = st.selectbox(f"연도 (문제 {q['number']})", ["2024", "2023", "2022", "2021"], key=f"year_{i}")
                        round_num = st.selectbox(f"회차 (문제 {q['number']})", ["1회", "2회", "3회", "4회"], key=f"round_{i}")
                        category = st.selectbox(f"카테고리 (문제 {q['number']})", [
                            "소프트웨어설계", "소프트웨어개발", "데이터베이스구축", 
                            "프로그래밍언어활용", "정보시스템구축관리"
                        ], key=f"category_{i}")
                    
                    with col2:
                        difficulty = st.selectbox(f"난이도 (문제 {q['number']})", ["하", "중", "상"], key=f"difficulty_{i}")
                        question_id = st.text_input(f"문제 ID (문제 {q['number']})", 
                                                  value=f"{year}_{round_num.replace('회', '')}_{q['number']:03d}", 
                                                  key=f"id_{i}")
                    
                    # 문제 내용
                    question_text = st.text_area(f"문제 내용 (문제 {q['number']})", 
                                                value=q['question'], 
                                                key=f"question_{i}")
                    
                    # 선택지
                    options = []
                    for j in range(4):
                        default_value = q['options'][j] if q['options'] and j < len(q['options']) else ""
                        option = st.text_input(f"선택지 {j+1} (문제 {q['number']})", 
                                             value=default_value, 
                                             key=f"option_{i}_{j}")
                        options.append(option)
                    
                    # 정답 및 해설
                    col3, col4 = st.columns(2)
                    with col3:
                        correct_answer = st.selectbox(f"정답 (문제 {q['number']})", 
                                                    [1, 2, 3, 4], 
                                                    index=(q['answer'] - 1) if q['answer'] else 0,
                                                    key=f"answer_{i}")
                    
                    with col4:
                        explanation = st.text_area(f"해설 (문제 {q['number']})", 
                                                 value=q['explanation'], 
                                                 key=f"explanation_{i}")
                    
                    # 수정된 내용 저장
                    st.session_state.recognized_questions[i].update({
                        'id': question_id,
                        'category': category,
                        'difficulty': difficulty,
                        'year': year,
                        'round': round_num,
                        'question': question_text,
                        'options': options,
                        'answer': correct_answer,
                        'explanation': explanation
                    })
        else:
            st.info("먼저 PDF를 업로드하고 문제를 인식해주세요.")
    
    with tab3:
        st.header("3️⃣ CSV 파일 생성")
        
        if 'recognized_questions' in st.session_state:
            questions = st.session_state.recognized_questions
            
            # CSV 데이터 생성
            csv_data = []
            for q in questions:
                if all([q.get('question'), q.get('options'), q.get('answer')]):
                    csv_row = {
                        '문제ID': q.get('id', f"Q_{q['number']}"),
                        '카테고리': q.get('category', '소프트웨어설계'),
                        '난이도': q.get('difficulty', '중'),
                        '연도': q.get('year', '2024'),
                        '회차': q.get('round', '1회'),
                        '문제': q['question'],
                        '선택지1': q['options'][0] if len(q['options']) > 0 else "",
                        '선택지2': q['options'][1] if len(q['options']) > 1 else "",
                        '선택지3': q['options'][2] if len(q['options']) > 2 else "",
                        '선택지4': q['options'][3] if len(q['options']) > 3 else "",
                        '정답': q['answer'],
                        '해설': q.get('explanation', '해설이 없습니다.')
                    }
                    csv_data.append(csv_row)
            
            if csv_data:
                df = pd.DataFrame(csv_data)
                
                st.subheader("📊 생성될 CSV 미리보기")
                st.dataframe(df)
                
                st.success(f"✅ {len(csv_data)}개 문제가 CSV 형식으로 준비되었습니다!")
                
                # CSV 다운로드
                csv_string = df.to_csv(index=False, encoding='utf-8-sig')
                
                st.download_button(
                    label="📥 CSV 파일 다운로드",
                    data=csv_string,
                    file_name=f"extracted_questions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                    mime="text/csv"
                )
                
                st.info("""
                💡 **다음 단계:**
                1. CSV 파일을 다운로드하세요
                2. Excel에서 열어서 최종 검토하세요
                3. 안전한 업로드 시스템에서 업로드하세요
                """)
            else:
                st.warning("⚠️ 완전한 문제가 없습니다. 수동 편집에서 누락된 정보를 입력해주세요.")
        else:
            st.info("먼저 PDF에서 문제를 추출해주세요.")

if __name__ == "__main__":
    main()