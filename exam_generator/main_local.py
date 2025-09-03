"""
한국 국가공인자격증 시험 대비 문제 생성 프로그램
로컬 LLM 버전 - API 키 불필요
"""

import argparse
import os
import sys
from pathlib import Path

from document_reader import DocumentReader
from question_generator_local import SimpleQuestionGenerator
from data_manager import DataManager


def print_banner():
    """프로그램 배너 출력"""
    print("=" * 60)
    print("  한국 국가공인자격증 시험 대비 문제 생성 프로그램")
    print("  [로컬 버전 - API 키 불필요]")
    print("=" * 60)
    print()


def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(
        description="PDF/TXT 파일에서 국가공인자격증 시험 문제를 자동 생성합니다. (로컬 버전)"
    )
    
    # 명령줄 인자 정의
    parser.add_argument(
        "input_file",
        help="입력 파일 경로 (PDF 또는 TXT)"
    )
    parser.add_argument(
        "--output",
        default=None,
        help="출력 파일명 (기본값: 자동 생성)"
    )
    parser.add_argument(
        "--difficulty",
        choices=["상", "중", "하"],
        default="중",
        help="문제 난이도 (기본값: 중)"
    )
    parser.add_argument(
        "--type",
        choices=["정의형", "특징형", "비교형", "적용형"],
        default="정의형",
        help="문제 유형 (기본값: 정의형)"
    )
    parser.add_argument(
        "--num-questions",
        type=int,
        default=5,
        help="생성할 문제 수 (기본값: 5)"
    )
    parser.add_argument(
        "--excel",
        action="store_true",
        help="Excel 파일로도 내보내기"
    )
    
    args = parser.parse_args()
    
    print_banner()
    
    # 입력 파일 확인
    if not os.path.exists(args.input_file):
        print(f"❌ 오류: 파일을 찾을 수 없습니다: {args.input_file}")
        sys.exit(1)
    
    try:
        # 1. 문서 읽기
        print(f"📖 문서 읽는 중: {args.input_file}")
        reader = DocumentReader()
        content = reader.read_document(args.input_file)
        
        if not content:
            print("❌ 오류: 문서에서 텍스트를 추출할 수 없습니다.")
            sys.exit(1)
        
        print(f"✅ 텍스트 추출 완료 (길이: {len(content)} 문자)")
        
        # 2. 문제 생성기 초기화 (로컬 버전)
        print("\n🤖 로컬 문제 생성기 초기화 중...")
        print("   ℹ️ API 키가 필요 없는 간단한 규칙 기반 생성기를 사용합니다.")
        generator = SimpleQuestionGenerator()
        
        # 3. 문제 생성
        print(f"\n📝 문제 생성 중...")
        print(f"   - 난이도: {args.difficulty}")
        print(f"   - 유형: {args.type}")
        print(f"   - 개수: {args.num_questions}")
        
        questions = generator.generate_questions(
            content=content,
            question_type=args.type,
            difficulty=args.difficulty,
            num_questions=args.num_questions
        )
        
        print(f"✅ {len(questions)}개 문제 생성 완료")
        
        # 4. 데이터 저장
        print("\n💾 데이터 저장 중...")
        manager = DataManager()
        
        # 딕셔너리로 변환
        questions_dict = [q.to_dict() for q in questions]
        
        # 메타데이터 생성
        metadata = {
            "source_file": os.path.basename(args.input_file),
            "difficulty": args.difficulty,
            "question_type": args.type,
            "generator": "local"
        }
        
        # JSON 저장
        json_path = manager.save_questions_to_json(
            questions_dict,
            filename=args.output,
            metadata=metadata
        )
        print(f"✅ JSON 파일 저장: {json_path}")
        
        # Excel 저장 (옵션)
        if args.excel:
            excel_filename = args.output.replace('.json', '.xlsx') if args.output else None
            excel_path = manager.export_to_excel(questions_dict, excel_filename)
            print(f"✅ Excel 파일 저장: {excel_path}")
        
        # 5. 샘플 문제 출력
        print("\n📋 샘플 문제:")
        print("-" * 50)
        sample = questions[0] if questions else None
        if sample:
            print(f"문제: {sample.question}")
            print("선택지:")
            for i, option in enumerate(sample.options, 1):
                print(f"  {i}. {option}")
            print(f"정답: {sample.answer + 1}번")
            print(f"해설: {sample.explanation}")
            print(f"난이도: {sample.difficulty}")
            print(f"유형: {sample.question_type}")
        
        print("\n✨ 문제 생성이 완료되었습니다! (로컬 버전)")
        print("⚠️ 참고: 로컬 버전은 간단한 규칙 기반으로 동작하여 품질이 제한적입니다.")
        print("   더 나은 품질을 원하시면 OpenAI API 버전을 사용해주세요.")
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()