"""
데이터 관리 모듈
생성된 문제를 JSON 형식으로 저장하고 관리
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Optional
import pandas as pd
from pathlib import Path


class DataManager:
    """문제 데이터 관리 클래스"""
    
    def __init__(self, output_dir: str = "output"):
        """
        초기화
        Args:
            output_dir: 출력 파일을 저장할 디렉토리
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def save_questions_to_json(
        self,
        questions: List[Dict],
        filename: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        문제를 JSON 파일로 저장
        Args:
            questions: 문제 리스트 (딕셔너리 형태)
            filename: 저장할 파일명 (None일 경우 자동 생성)
            metadata: 추가 메타데이터
        Returns:
            저장된 파일 경로
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"questions_{timestamp}.json"
        
        # 확장자 확인
        if not filename.endswith('.json'):
            filename += '.json'
        
        filepath = self.output_dir / filename
        
        # 저장할 데이터 구성
        data = {
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "total_questions": len(questions),
                "version": "1.0"
            },
            "questions": questions
        }
        
        # 추가 메타데이터가 있으면 병합
        if metadata:
            data["metadata"].update(metadata)
        
        # JSON 파일로 저장 (한글 깨짐 방지)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return str(filepath)
    
    def load_questions_from_json(self, filepath: str) -> Dict:
        """
        JSON 파일에서 문제 로드
        Args:
            filepath: JSON 파일 경로
        Returns:
            로드된 데이터
        """
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    
    def export_to_excel(
        self,
        questions: List[Dict],
        filename: Optional[str] = None
    ) -> str:
        """
        문제를 Excel 파일로 내보내기
        Args:
            questions: 문제 리스트
            filename: 저장할 파일명
        Returns:
            저장된 파일 경로
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"questions_{timestamp}.xlsx"
        
        # 확장자 확인
        if not filename.endswith('.xlsx'):
            filename += '.xlsx'
        
        filepath = self.output_dir / filename
        
        # DataFrame 생성
        df_data = []
        for i, q in enumerate(questions, 1):
            row = {
                "번호": i,
                "문제": q["question"],
                "선택지1": q["options"][0],
                "선택지2": q["options"][1],
                "선택지3": q["options"][2],
                "선택지4": q["options"][3],
                "정답": q["answer"] + 1,  # 1부터 시작하도록 조정
                "해설": q["explanation"],
                "난이도": q["difficulty"],
                "문제유형": q.get("question_type", "")
            }
            df_data.append(row)
        
        df = pd.DataFrame(df_data)
        
        # Excel 파일로 저장
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='문제', index=False)
            
            # 열 너비 자동 조정
            worksheet = writer.sheets['문제']
            for idx, col in enumerate(df.columns):
                max_length = max(
                    df[col].astype(str).map(len).max(),
                    len(col)
                ) + 2
                worksheet.column_dimensions[chr(65 + idx)].width = min(max_length, 50)
        
        return str(filepath)
    
    def merge_question_files(self, file_paths: List[str], output_filename: str) -> str:
        """
        여러 JSON 파일의 문제를 병합
        Args:
            file_paths: 병합할 JSON 파일 경로 리스트
            output_filename: 출력 파일명
        Returns:
            병합된 파일 경로
        """
        all_questions = []
        
        for filepath in file_paths:
            data = self.load_questions_from_json(filepath)
            all_questions.extend(data["questions"])
        
        # 중복 제거 (문제 텍스트 기준)
        unique_questions = []
        seen_questions = set()
        
        for q in all_questions:
            if q["question"] not in seen_questions:
                unique_questions.append(q)
                seen_questions.add(q["question"])
        
        # 병합된 데이터 저장
        metadata = {
            "merged_from": file_paths,
            "original_count": len(all_questions),
            "unique_count": len(unique_questions)
        }
        
        return self.save_questions_to_json(unique_questions, output_filename, metadata)
    
    def filter_questions(
        self,
        questions: List[Dict],
        difficulty: Optional[str] = None,
        question_type: Optional[str] = None
    ) -> List[Dict]:
        """
        조건에 따라 문제 필터링
        Args:
            questions: 문제 리스트
            difficulty: 난이도 필터 (상/중/하)
            question_type: 문제 유형 필터
        Returns:
            필터링된 문제 리스트
        """
        filtered = questions
        
        if difficulty:
            filtered = [q for q in filtered if q.get("difficulty") == difficulty]
        
        if question_type:
            filtered = [q for q in filtered if q.get("question_type") == question_type]
        
        return filtered
    
    def get_statistics(self, questions: List[Dict]) -> Dict:
        """
        문제 통계 정보 생성
        Args:
            questions: 문제 리스트
        Returns:
            통계 정보
        """
        stats = {
            "total": len(questions),
            "by_difficulty": {},
            "by_type": {}
        }
        
        # 난이도별 집계
        for difficulty in ["상", "중", "하"]:
            count = len([q for q in questions if q.get("difficulty") == difficulty])
            if count > 0:
                stats["by_difficulty"][difficulty] = count
        
        # 유형별 집계
        types = set(q.get("question_type", "기타") for q in questions)
        for qtype in types:
            count = len([q for q in questions if q.get("question_type", "기타") == qtype])
            if count > 0:
                stats["by_type"][qtype] = count
        
        return stats