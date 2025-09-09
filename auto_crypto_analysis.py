#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
대량 YouTube 자막 파일 자동 분석 및 분류 시스템
퍼즐 채널 72개 영상 → 스마트 필터링 → 중요한 것만 선별 → 마크다운 변환
"""

import os
import re
import glob
from pathlib import Path
from collections import Counter
import json

def clean_vtt_content(vtt_file_path):
    """VTT 파일에서 순수 텍스트만 추출"""
    try:
        with open(vtt_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        print(f"❌ 파일 읽기 실패: {vtt_file_path}")
        return ""
    
    lines = content.split('\n')
    text_lines = []
    
    for line in lines:
        line = line.strip()
        # 시간코드, 헤더 등 제거
        if '-->' in line or line.startswith(('WEBVTT', 'Kind:', 'Language:', 'align:', 'position:')):
            continue
        if not line or line.isdigit():
            continue
            
        # HTML 태그와 타임스탬프 제거
        clean_line = re.sub(r'<[^>]+>', '', line)
        clean_line = re.sub(r'<\d+:\d+:\d+\.\d+>', '', clean_line)
        clean_line = clean_line.strip()
        
        if clean_line and not re.match(r'^\d+:\d+:\d+', clean_line):
            text_lines.append(clean_line)
    
    # 중복 제거하되 순서 유지
    unique_lines = []
    seen = set()
    for line in text_lines:
        if line not in seen:
            unique_lines.append(line)
            seen.add(line)
    
    return ' '.join(unique_lines)

def categorize_video(title, content):
    """제목과 내용을 바탕으로 카테고리 분류 및 우선순위 설정"""
    
    # 우선순위 키워드 (높을수록 중요)
    high_priority = ['전략', '방법', '매매', '분석', '포트폴리오', 'DCA', '투자', '리스크', '관리']
    medium_priority = ['시나리오', '전망', '예측', '목표', '수익', '차트', '기술적', '패턴']
    low_priority = ['브리핑', '단순', '짧은', '일상', '개인']
    
    # 제외 키워드 (이런 건 스킵)
    exclude_keywords = ['인사', '안녕', '5분', '간단', '짧게', '빠르게']
    
    # 카테고리 분류
    categories = {
        '기술분석': ['RSI', '이동평균', '차트', '패턴', '지표', '볼린저', '피보나치', '파동'],
        '투자전략': ['DCA', '적립', '분할', '매수', '포트폴리오', '비중', '자금관리'],
        '시장분석': ['사이클', '불장', '하락', '상승', '시나리오', 'M2', '유동성'],
        '실전매매': ['진입', '청산', '손절', '익절', '타이밍', '매도', '수익실현'],
        '리스크관리': ['손절', '리스크', '위험', '관리', '방어', '보호'],
        '코인분석': ['비트', '이더', '알트', '리플', '솔라나', '스택스', '도지'],
        '심리/멘탈': ['심리', '멘탈', '감정', '두려움', '욕심', '인내'],
        '시황브리핑': ['브리핑', '시황', '뉴스', '현황', '상황', '업데이트']
    }
    
    # 점수 계산
    priority_score = 0
    category_scores = {cat: 0 for cat in categories.keys()}
    
    text = (title + ' ' + content[:1000]).lower()  # 제목 + 앞부분만
    
    # 우선순위 점수
    for keyword in high_priority:
        if keyword in text:
            priority_score += 3
    for keyword in medium_priority:
        if keyword in text:
            priority_score += 2
    for keyword in low_priority:
        if keyword in text:
            priority_score -= 1
    
    # 제외 키워드 체크
    for keyword in exclude_keywords:
        if keyword in text:
            priority_score -= 5
    
    # 카테고리 점수
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in text:
                category_scores[category] += 1
    
    # 최고 점수 카테고리
    best_category = max(category_scores.items(), key=lambda x: x[1])[0]
    
    return {
        'category': best_category,
        'priority_score': priority_score,
        'category_scores': category_scores,
        'is_important': priority_score >= 5  # 중요한 영상 여부
    }

def analyze_all_vtt_files():
    """모든 VTT 파일 분석 및 분류"""
    vtt_files = glob.glob("*.vtt")
    
    if not vtt_files:
        print("❌ VTT 파일을 찾을 수 없습니다.")
        return
    
    print(f"📊 {len(vtt_files)}개의 VTT 파일 발견!")
    
    results = []
    
    for i, vtt_file in enumerate(vtt_files, 1):
        print(f"분석 중: {i}/{len(vtt_files)} - {vtt_file[:50]}...")
        
        # 제목 추출
        title = re.sub(r'\s*\[[A-Za-z0-9_-]+\]\.ko\.vtt$', '', vtt_file).strip()
        
        # 내용 추출
        content = clean_vtt_content(vtt_file)
        
        if not content:
            continue
            
        # 분류 및 점수화
        analysis = categorize_video(title, content)
        
        results.append({
            'filename': vtt_file,
            'title': title,
            'content_length': len(content),
            'category': analysis['category'],
            'priority_score': analysis['priority_score'],
            'is_important': analysis['is_important'],
            'content_preview': content[:300] + '...' if len(content) > 300 else content
        })
    
    # 우선순위별 정렬
    results.sort(key=lambda x: x['priority_score'], reverse=True)
    
    return results

def generate_analysis_report(results):
    """분석 결과 리포트 생성"""
    
    # 통계 생성
    total_videos = len(results)
    important_videos = [r for r in results if r['is_important']]
    category_stats = Counter([r['category'] for r in results])
    
    # 마크다운 리포트 생성
    report = f"""# 📊 퍼즐 채널 자동 분석 리포트

## 🎯 분석 결과 요약

- **총 영상 수**: {total_videos}개
- **중요 영상**: {len(important_videos)}개 ({len(important_videos)/total_videos*100:.1f}%)
- **분석 대상**: 우선순위 5점 이상

## 📈 카테고리별 분포

"""
    
    for category, count in category_stats.most_common():
        percentage = count / total_videos * 100
        report += f"- **{category}**: {count}개 ({percentage:.1f}%)\n"
    
    report += f"""

## ⭐ 최우선 분석 대상 (TOP 20)

"""
    
    for i, video in enumerate(important_videos[:20], 1):
        report += f"""### {i}. {video['title']}
- **점수**: {video['priority_score']}점
- **카테고리**: {video['category']}
- **길이**: {video['content_length']:,}자
- **미리보기**: {video['content_preview'][:100]}...

---

"""
    
    report += f"""

## 🔍 카테고리별 추천 영상

"""
    
    for category in category_stats.keys():
        category_videos = [r for r in results if r['category'] == category and r['is_important']][:3]
        if category_videos:
            report += f"\n### {category}\n"
            for video in category_videos:
                report += f"- **{video['title']}** (점수: {video['priority_score']}점)\n"
    
    return report

def create_priority_markdown_files(results):
    """우선순위 높은 영상들의 마크다운 파일 생성"""
    
    # 결과 저장할 디렉토리 생성
    output_dir = "crypto_analysis_priority"
    os.makedirs(output_dir, exist_ok=True)
    
    important_videos = [r for r in results if r['is_important']]
    
    print(f"\n📝 {len(important_videos)}개의 중요 영상 마크다운 생성 중...")
    
    for i, video in enumerate(important_videos, 1):
        # 파일명 생성
        safe_title = re.sub(r'[<>:"/\\|?*]', '_', video['title'][:50])
        filename = f"{i:02d}_{safe_title}_{video['category']}.md"
        filepath = os.path.join(output_dir, filename)
        
        # 전체 내용 다시 읽기
        full_content = clean_vtt_content(video['filename'])
        
        # 마크다운 내용 생성
        markdown_content = f"""# 📊 {video['title']}

> **우선순위**: {video['priority_score']}점  
> **카테고리**: {video['category']}  
> **원본 파일**: {video['filename']}  
> **내용 길이**: {len(full_content):,}자

## 🎯 핵심 추출 내용

{full_content}

---

**💡 분석 노트**: 
- 이 영상은 자동 분석에서 {video['priority_score']}점을 받아 중요 영상으로 분류되었습니다
- 주요 카테고리: {video['category']}
- 추가 분석이 필요한 핵심 내용을 포함하고 있습니다
"""
        
        # 파일 저장
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
    
    print(f"✅ {len(important_videos)}개 파일이 '{output_dir}' 폴더에 저장되었습니다!")
    return output_dir

if __name__ == "__main__":
    print("🚀 퍼즐 채널 대량 분석 시작!")
    
    # 1단계: 모든 파일 분석
    results = analyze_all_vtt_files()
    
    if not results:
        print("❌ 분석할 파일이 없습니다.")
        exit()
    
    # 2단계: 분석 리포트 생성
    report = generate_analysis_report(results)
    
    with open('analysis_report.md', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("📊 분석 리포트 생성 완료: analysis_report.md")
    
    # 3단계: 우선순위 마크다운 생성
    output_dir = create_priority_markdown_files(results)
    
    print(f"\n🎉 자동 분석 완료!")
    print(f"📁 리포트: analysis_report.md")
    print(f"📁 중요 영상들: {output_dir}/")
    print(f"💡 다음 단계: 중요 영상들을 수동으로 정밀 분석하세요!")