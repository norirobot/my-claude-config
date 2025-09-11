# 비주얼 노벨 애셋 설치 가이드

## 🎨 무료 애셋 다운로드 사이트

### 1. Itch.io 무료 애셋 (추천)
```
캐릭터 애셋:
https://sutemo.itch.io/female-character
https://tokudaya.itch.io/otome-asset
https://noranekogames.itch.io/yuuko-free-visual-novel-sprite
https://konett.itch.io/anime-girl-free

배경 애셋:
https://noranekogames.itch.io/yumebackground
https://mugenjohncel.itch.io/visual-novel-backgrounds
```

### 2. 직접 다운로드 방법
1. 위 링크 접속
2. "Download Now" 클릭 (Name your own price에서 $0 입력)
3. ZIP 파일 다운로드
4. 압축 해제

### 3. 파일 배치 방법
```
frontend/public/assets/
├── characters/
│   ├── jennifer/
│   │   ├── normal.png
│   │   ├── happy.png
│   │   ├── sad.png
│   │   └── surprised.png
│   ├── alex/
│   │   └── (같은 구조)
│   └── sophia/
│       └── (같은 구조)
├── backgrounds/
│   ├── cafe.jpg
│   ├── park.jpg
│   ├── classroom.jpg
│   └── restaurant.jpg
└── ui/
    ├── dialogue_box.png
    └── name_plate.png
```

## 🖼️ 이미지 요구사항

### 캐릭터 이미지:
- 형식: PNG (투명 배경)
- 크기: 400x600px ~ 800x1200px
- 이름: emotion명.png (normal.png, happy.png 등)

### 배경 이미지:
- 형식: JPG 또는 PNG
- 크기: 1920x1080px (16:9 비율)
- 이름: 장소명.jpg

## 🎮 또는 AI로 직접 생성하기

### Bing Image Creator 사용법:
1. https://www.bing.com/images/create 접속
2. 프롬프트 입력:
```
캐릭터:
"anime visual novel character, female teacher, brown hair, friendly smile, full body, standing pose, transparent background, high quality illustration"

배경:
"anime style cafe interior, warm lighting, visual novel background, no people, detailed illustration, 16:9 aspect ratio"
```
3. 생성된 이미지 다운로드
4. 배경 제거 (캐릭터): remove.bg 사용

## 📝 파일명 규칙

캐릭터 표정:
- normal.png (기본)
- happy.png (행복)
- sad.png (슬픔)
- surprised.png (놀람)
- angry.png (화남)
- thinking.png (생각)

## 🔧 이미지 편집 도구

무료 온라인 도구:
- 배경 제거: https://www.remove.bg/
- 크기 조정: https://www.photopea.com/
- 형식 변환: https://convertio.co/kr/