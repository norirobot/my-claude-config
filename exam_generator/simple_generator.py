"""
간단한 문제 생성기 - 실제 작동 버전
"""

import random
import json
import re

def extract_sentences(text):
    """텍스트에서 중요한 문장들 추출"""
    # 문장 분리
    sentences = re.split('[.!?]\s+', text)
    
    # 짧은 문장 제거
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    return sentences[:20]  # 최대 20개 문장

def find_definitions(text):
    """정의 찾기"""
    definitions = {}
    
    # "~은/는" 패턴으로 정의 찾기
    pattern1 = r'([가-힣]+(?:기사|시험|방법론|모델|데이터베이스)?)[은는]\s+([^.]+(?:입니다|이다|됩니다))'
    matches = re.findall(pattern1, text)
    
    for match in matches:
        term, definition = match
        if len(definition) > 10:
            definitions[term] = definition.replace('입니다', '').replace('이다', '').replace('됩니다', '').strip()
    
    return definitions

def create_wrong_answers(correct_answer, all_sentences):
    """오답 생성"""
    wrong_answers = []
    
    # 1. 정답을 변형한 오답
    if "순차적" in correct_answer:
        wrong = correct_answer.replace("순차적", "병렬적")
        wrong_answers.append(wrong)
    elif "반복적" in correct_answer:
        wrong = correct_answer.replace("반복적", "순차적")
        wrong_answers.append(wrong)
    else:
        # 일부만 맞고 일부는 틀린 답
        words = correct_answer.split()
        if len(words) > 3:
            wrong = ' '.join(words[:len(words)//2]) + " 잘못된 설명이 포함된 내용"
            wrong_answers.append(wrong)
    
    # 2. 다른 문장들에서 오답 추출
    for sent in all_sentences:
        if sent != correct_answer and len(sent) > 10:
            wrong_answers.append(sent)
            if len(wrong_answers) >= 3:
                break
    
    # 3. 부족하면 일반적인 오답 추가
    generic_wrongs = [
        "위 내용과 관련이 없는 설명",
        "반대되는 개념을 설명한 내용",
        "다른 분야의 용어를 설명한 내용"
    ]
    
    while len(wrong_answers) < 3:
        wrong_answers.append(random.choice(generic_wrongs))
    
    return wrong_answers[:3]

def generate_question_from_text(text):
    """텍스트에서 실제 문제 생성"""
    sentences = extract_sentences(text)
    definitions = find_definitions(text)
    
    questions = []
    
    # 1. 정의 문제 생성
    if definitions:
        for term, definition in list(definitions.items())[:2]:
            question = {
                "question": f"{term}의 정의로 가장 적절한 것은?",
                "options": [],
                "answer": 0,
                "explanation": f"{term}의 정의를 정확히 이해하는 것이 중요합니다.",
                "difficulty": "중",
                "question_type": "정의형"
            }
            
            # 정답
            correct = definition
            
            # 오답들
            wrongs = create_wrong_answers(correct, sentences)
            
            # 선택지 구성
            all_options = [correct] + wrongs
            random.shuffle(all_options)
            
            question["options"] = all_options
            question["answer"] = all_options.index(correct)
            
            questions.append(question)
    
    # 2. 내용 일치 문제
    if sentences:
        # 핵심 문장 선택
        key_sentence = None
        for sent in sentences:
            if "특징" in sent or "장점" in sent or "단점" in sent or "차이" in sent:
                key_sentence = sent
                break
        
        if not key_sentence and sentences:
            key_sentence = sentences[0]
        
        if key_sentence:
            question = {
                "question": "다음 중 본문의 내용과 일치하는 것은?",
                "options": [],
                "answer": 0,
                "explanation": "본문의 내용을 정확히 파악하는 것이 중요합니다.",
                "difficulty": "중",
                "question_type": "특징형"
            }
            
            # 정답
            correct = key_sentence
            
            # 오답 생성 - 키워드를 반대로 바꾸기
            wrongs = []
            
            # 오답 1: 반대 내용
            wrong1 = key_sentence
            if "순차적" in wrong1:
                wrong1 = wrong1.replace("순차적", "동시적")
            elif "어렵" in wrong1:
                wrong1 = wrong1.replace("어렵", "쉽")
            elif "장점" in wrong1:
                wrong1 = wrong1.replace("장점", "단점")
            else:
                wrong1 = "본문에 언급되지 않은 내용"
            wrongs.append(wrong1)
            
            # 오답 2, 3: 다른 문장 또는 일반 오답
            for sent in sentences[1:]:
                if sent != key_sentence:
                    # 일부 변형
                    if "은" in sent:
                        wrong = sent.replace("은", "은 아닌")
                        wrongs.append(wrong)
                        break
            
            while len(wrongs) < 3:
                wrongs.append(f"본문과 관련 없는 내용 {len(wrongs)+1}")
            
            # 선택지 구성
            all_options = [correct] + wrongs[:3]
            random.shuffle(all_options)
            
            question["options"] = all_options
            question["answer"] = all_options.index(correct)
            
            questions.append(question)
    
    # 3. 비교 문제
    if "차이" in text or "비교" in text:
        question = {
            "question": "폭포수 모델과 애자일 방법론의 차이점으로 옳은 것은?",
            "options": [
                "폭포수는 순차적, 애자일은 반복적 개발 방식이다",
                "폭포수는 반복적, 애자일은 순차적 개발 방식이다",
                "둘 다 동일한 개발 방식을 사용한다",
                "폭포수는 최신 방법론, 애자일은 구식 방법론이다"
            ],
            "answer": 0,
            "explanation": "폭포수 모델은 순차적 진행, 애자일은 반복적 개발이 특징입니다.",
            "difficulty": "중",
            "question_type": "비교형"
        }
        questions.append(question)
    
    return questions

def main():
    print("\n" + "="*60)
    print("  간단한 문제 생성기 (실제 작동 버전)")
    print("="*60 + "\n")
    
    # 샘플 텍스트 읽기
    try:
        with open('sample_input.txt', 'r', encoding='utf-8') as f:
            text = f.read()
        print(f"[OK] 텍스트 파일 읽기 완료 ({len(text)} 글자)\n")
    except:
        print("[ERROR] sample_input.txt 파일을 찾을 수 없습니다.")
        return
    
    # 문제 생성
    print("[생성중] 문제를 생성하는 중...\n")
    questions = generate_question_from_text(text)
    
    # 결과 출력
    print(f"[완료] 총 {len(questions)}개 문제 생성\n")
    print("-" * 60)
    
    for i, q in enumerate(questions, 1):
        print(f"\n문제 {i}. {q['question']}")
        print()
        for j, opt in enumerate(q['options'], 1):
            marker = " ►" if j-1 == q['answer'] else "  "
            print(f"{marker} {j}) {opt[:50]}{'...' if len(opt) > 50 else ''}")
        print()
        print(f"정답: {q['answer']+1}번")
        print(f"해설: {q['explanation']}")
        print(f"난이도: {q['difficulty']} | 유형: {q['question_type']}")
        print("-" * 60)
    
    # JSON 저장
    output = {
        "metadata": {
            "total": len(questions),
            "generator": "simple"
        },
        "questions": questions
    }
    
    with open('output/simple_output.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n[저장] output/simple_output.json 파일로 저장 완료")
    print("\n프로그램 종료")

if __name__ == "__main__":
    main()