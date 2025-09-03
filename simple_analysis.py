# -*- coding: utf-8 -*-
import os
import re
import glob

def clean_vtt_content(vtt_file_path):
    try:
        with open(vtt_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        print(f"파일 읽기 실패: {vtt_file_path}")
        return ""
    
    lines = content.split('\n')
    text_lines = []
    
    for line in lines:
        line = line.strip()
        if '-->' in line or line.startswith(('WEBVTT', 'Kind:', 'Language:')):
            continue
        if not line or line.isdigit():
            continue
            
        clean_line = re.sub(r'<[^>]+>', '', line)
        clean_line = re.sub(r'<\d+:\d+:\d+\.\d+>', '', clean_line)
        clean_line = clean_line.strip()
        
        if clean_line and not re.match(r'^\d+:\d+:\d+', clean_line):
            text_lines.append(clean_line)
    
    return ' '.join(text_lines)

def filter_important_content(text):
    # 불필요한 내용 제거
    exclude_patterns = [
        r'안녕하세요.*?입니다',
        r'구독.*?좋아요',
        r'오늘은.*?하겠습니다',
        r'지금까지.*?였습니다',
        r'감사합니다',
        r'시청해.*?주셔서',
    ]
    
    for pattern in exclude_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    return text.strip()

def categorize_content(title, content):
    categories = {
        '기술분석': ['RSI', 'RSI', '이동평균', '차트', '패턴', '지표', '볼린저', '피보나치', '파동'],
        '투자전략': ['DCA', '적립', '분할', '매수', '포트폴리오', '비중', '자금관리', '전략'],
        '시장분석': ['사이클', '불장', '하락', '상승', '시나리오', '유동성', '시장'],
        '실전매매': ['진입', '청산', '손절', '익절', '타이밍', '매도', '수익실현', '매매'],
        '코인분석': ['비트', '이더', '알트', '리플', '솔라나', '스택스', '도지', '코인'],
    }
    
    text = (title + ' ' + content[:1000]).lower()
    
    scores = {}
    for category, keywords in categories.items():
        score = sum(1 for keyword in keywords if keyword.lower() in text)
        scores[category] = score
    
    best_category = max(scores.items(), key=lambda x: x[1])[0]
    
    # 중요도 점수
    important_keywords = ['전략', '방법', '매매', '분석', '투자', '리스크', '수익', '포트폴리오']
    importance_score = sum(1 for keyword in important_keywords if keyword in text)
    
    return best_category, importance_score

print("382개 VTT 파일 분석 시작...")

vtt_files = glob.glob("*.vtt")
print(f"찾은 파일: {len(vtt_files)}개")

# 결과 저장할 디렉토리 생성
output_dir = "puzzle_crypto_analysis"
os.makedirs(output_dir, exist_ok=True)

results = []

for i, vtt_file in enumerate(vtt_files, 1):
    if i % 10 == 0:
        print(f"진행률: {i}/{len(vtt_files)}")
    
    # 제목 추출
    title = re.sub(r'\s*\[[A-Za-z0-9_-]+\]\.ko\.vtt$', '', vtt_file)
    
    # 내용 추출
    content = clean_vtt_content(vtt_file)
    if not content:
        continue
    
    # 불필요한 내용 제거
    filtered_content = filter_important_content(content)
    
    # 분류
    category, importance = categorize_content(title, filtered_content)
    
    results.append({
        'title': title,
        'category': category,
        'importance': importance,
        'content': filtered_content,
        'original_file': vtt_file
    })

# 중요도순 정렬
results.sort(key=lambda x: x['importance'], reverse=True)

print(f"분석 완료! 총 {len(results)}개 영상 처리됨")

# 상위 50개만 마크다운으로 저장
top_results = results[:50]

for i, result in enumerate(top_results, 1):
    safe_title = re.sub(r'[<>:"/\\|?*]', '_', result['title'][:30])
    filename = f"{i:02d}_{result['category']}_{safe_title}.md"
    filepath = os.path.join(output_dir, filename)
    
    markdown_content = f"""# {result['title']}

**카테고리**: {result['category']}
**중요도**: {result['importance']}점
**원본파일**: {result['original_file']}

## 핵심 내용

{result['content']}

---
*자동 분석으로 생성된 파일입니다*
"""
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(markdown_content)

print(f"상위 50개 영상이 '{output_dir}' 폴더에 저장되었습니다!")

# 간단한 통계
categories = {}
for result in results:
    cat = result['category']
    categories[cat] = categories.get(cat, 0) + 1

print("\n카테고리별 분포:")
for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
    print(f"- {cat}: {count}개")