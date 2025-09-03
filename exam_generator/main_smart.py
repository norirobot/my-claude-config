"""
스마트 문제 생성 프로그램
텍스트 분석 기반 + API 선택적 사용
"""

import argparse
import os
import sys
from pathlib import Path

from document_reader import DocumentReader
from question_generator_hybrid import HybridQuestionGenerator
from data_manager import DataManager


def print_banner():
    """프로그램 배너 출력"""
    print("=" * 60)
    print("  스마트 국가공인자격증 문제 생성기")
    print("  [텍스트 분석 + API 하이브리드]")
    print("=" * 60)
    print()


def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(
        description="스마트 문제 생성기 - 로컬 분석으로 시작, API로 품질 향상"
    )
    
    parser.add_argument("input_file", help="입력 파일 경로 (PDF/TXT)")
    parser.add_argument("--api-key", help="OpenAI API 키 (선택사항)")
    parser.add_argument("--use-api", action="store_true", help="API 즉시 사용")
    parser.add_argument("--preview", action="store_true", help="샘플 미리보기 모드")
    parser.add_argument("--output", help="출력 파일명")
    parser.add_argument("--difficulty", choices=["상", "중", "하"], default="중")
    parser.add_argument("--type", choices=["정의형", "특징형", "비교형", "적용형", "혼합"], default="혼합")
    parser.add_argument("--num-questions", type=int, default=5)
    parser.add_argument("--excel", action="store_true", help="Excel 파일로도 저장")
    
    args = parser.parse_args()
    
    print_banner()
    
    # 파일 확인
    if not os.path.exists(args.input_file):
        print(f"❌ 파일을 찾을 수 없습니다: {args.input_file}")
        sys.exit(1)
    
    try:
        # 1. 문서 읽기
        print(f"[읽기] 문서 읽는 중: {args.input_file}")
        reader = DocumentReader()
        content = reader.read_document(args.input_file)
        
        if not content:
            print("❌ 텍스트를 추출할 수 없습니다.")
            sys.exit(1)
        
        print(f"[완료] 텍스트 추출 완료 ({len(content)} 문자)")
        
        # 2. 하이브리드 생성기 초기화
        generator = HybridQuestionGenerator(api_key=args.api_key)
        
        if args.api_key:
            print("[API] API 키 감지됨 - 고품질 모드 사용 가능")
        else:
            print("[LOCAL] 로컬 분석 모드 - API 키 없이 진행")
        
        # 3. 문제 생성
        print(f"\n[설정] 문제 생성 설정:")
        print(f"   난이도: {args.difficulty}")
        print(f"   유형: {args.type}")
        print(f"   개수: {args.num_questions}")
        
        questions = []
        
        if args.preview:
            # 미리보기 모드
            print("\n[미리보기] 미리보기 모드 - 샘플 확인 후 진행")
            questions = generator.preview_then_generate(
                text=content,
                question_type=args.type if args.type != "혼합" else "정의형",
                difficulty=args.difficulty,
                num_questions=args.num_questions
            )
        elif args.type == "혼합":
            # 각 유형별로 생성
            types = ["정의형", "특징형", "비교형", "적용형"]
            per_type = max(1, args.num_questions // 4)
            
            for qtype in types:
                print(f"\n   {qtype} 생성 중...")
                type_questions = generator.generate_questions(
                    text=content,
                    question_type=qtype,
                    difficulty=args.difficulty,
                    num_questions=per_type,
                    use_api=args.use_api
                )
                questions.extend(type_questions)
        else:
            # 단일 유형 생성
            questions = generator.generate_questions(
                text=content,
                question_type=args.type,
                difficulty=args.difficulty,
                num_questions=args.num_questions,
                use_api=args.use_api
            )
        
        # 문제 수 조정
        questions = questions[:args.num_questions]
        
        print(f"\n[완료] {len(questions)}개 문제 생성 완료!")
        
        # 4. 품질 체크
        print("\n[검사] 문제 품질 검사 중...")
        unique_questions = set()
        unique_options = []
        
        for q in questions:
            # 중복 문제 체크
            if q.question not in unique_questions:
                unique_questions.add(q.question)
                
                # 선택지 다양성 체크
                option_set = set(q.options)
                if len(option_set) == 4:  # 모든 선택지가 다른 경우
                    print(f"   [OK] 문제 {len(unique_options)+1}: 선택지 다양성 정상")
                else:
                    print(f"   [수정] 문제 {len(unique_options)+1}: 선택지 중복 발견 - 자동 수정")
                    # 중복 선택지 자동 수정
                    new_options = list(option_set)
                    while len(new_options) < 4:
                        new_options.append(f"추가 선택지 {len(new_options)+1}")
                    q.options = new_options[:4]
                
                unique_options.append(q)
        
        questions = unique_options
        
        # 5. 저장
        print("\n[저장] 데이터 저장 중...")
        manager = DataManager()
        
        questions_dict = [q.to_dict() for q in questions]
        
        metadata = {
            "source_file": os.path.basename(args.input_file),
            "difficulty": args.difficulty,
            "question_type": args.type,
            "generator": "hybrid" if not args.use_api else "api",
            "quality_checked": True
        }
        
        json_path = manager.save_questions_to_json(
            questions_dict,
            filename=args.output,
            metadata=metadata
        )
        print(f"[JSON] 저장 완료: {json_path}")
        
        if args.excel:
            excel_path = manager.export_to_excel(questions_dict)
            print(f"[Excel] 저장 완료: {excel_path}")
        
        # 6. 결과 표시
        print("\n" + "="*50)
        print("[결과] 생성 완료!")
        print("="*50)
        
        # 첫 번째 문제 샘플
        if questions:
            q = questions[0]
            print(f"\n[샘플] 첫 번째 문제:")
            print(f"Q: {q.question}")
            for i, opt in enumerate(q.options, 1):
                mark = "->" if i-1 == q.answer else "  "
                print(f" {mark} {i}. {opt}")
            print(f"\n[해설] {q.explanation}")
        
        # 통계
        stats = manager.get_statistics(questions_dict)
        print(f"\n[통계]")
        print(f"   총 {stats['total']}개 문제")
        if stats['by_type']:
            print(f"   유형: {', '.join(f'{k}({v})' for k,v in stats['by_type'].items())}")
        
        if not args.api_key:
            print("\n[TIP] OpenAI API 키를 사용하면 더 높은 품질의 문제를 생성할 수 있습니다.")
            print("   --api-key 옵션 또는 OPENAI_API_KEY 환경변수를 설정하세요.")
        
    except Exception as e:
        print(f"\n[ERROR] 오류: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()