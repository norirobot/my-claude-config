"""
문서 읽기 모듈
PDF와 TXT 파일을 읽어서 텍스트를 추출하는 기능
"""

import os
from typing import Optional
import pdfplumber
from pathlib import Path


class DocumentReader:
    """문서 파일을 읽고 텍스트를 추출하는 클래스"""
    
    @staticmethod
    def read_pdf(file_path: str) -> str:
        """PDF 파일에서 텍스트 추출"""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            raise Exception(f"PDF 파일 읽기 오류: {str(e)}")
        return text.strip()
    
    @staticmethod
    def read_txt(file_path: str, encoding: str = 'utf-8') -> str:
        """TXT 파일에서 텍스트 추출"""
        try:
            with open(file_path, 'r', encoding=encoding) as file:
                text = file.read()
        except UnicodeDecodeError:
            # 인코딩 오류 시 다른 인코딩 시도
            try:
                with open(file_path, 'r', encoding='cp949') as file:
                    text = file.read()
            except Exception as e:
                raise Exception(f"TXT 파일 읽기 오류: {str(e)}")
        except Exception as e:
            raise Exception(f"TXT 파일 읽기 오류: {str(e)}")
        return text.strip()
    
    @classmethod
    def read_document(cls, file_path: str) -> str:
        """파일 확장자에 따라 적절한 읽기 메서드 호출"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")
        
        file_extension = Path(file_path).suffix.lower()
        
        if file_extension == '.pdf':
            return cls.read_pdf(file_path)
        elif file_extension in ['.txt', '.text']:
            return cls.read_txt(file_path)
        else:
            raise ValueError(f"지원하지 않는 파일 형식입니다: {file_extension}")
    
    @staticmethod
    def extract_paragraphs(text: str, min_length: int = 50) -> list:
        """텍스트를 문단 단위로 분리"""
        paragraphs = []
        current_paragraph = []
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line:
                current_paragraph.append(line)
            elif current_paragraph:
                paragraph_text = ' '.join(current_paragraph)
                if len(paragraph_text) >= min_length:
                    paragraphs.append(paragraph_text)
                current_paragraph = []
        
        # 마지막 문단 처리
        if current_paragraph:
            paragraph_text = ' '.join(current_paragraph)
            if len(paragraph_text) >= min_length:
                paragraphs.append(paragraph_text)
        
        return paragraphs