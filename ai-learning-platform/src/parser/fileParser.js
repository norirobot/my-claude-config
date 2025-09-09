/**
 * 파일 파싱 모듈
 * PDF, TXT 파일을 읽어 텍스트를 추출하고 구조화
 */

class FileParser {
    constructor() {
        this.supportedTypes = ['.pdf', '.txt'];
        this.pdfjsLib = window['pdfjs-dist/build/pdf'];
        if (this.pdfjsLib) {
            this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js';
        }
    }

    /**
     * 파일 유형 검증
     */
    validateFile(file) {
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        return this.supportedTypes.includes(fileExtension);
    }

    /**
     * 파일 크기 검증 (최대 10MB)
     */
    validateFileSize(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        return file.size <= maxSize;
    }

    /**
     * 메인 파싱 함수
     */
    async parseFile(file) {
        try {
            if (!this.validateFile(file)) {
                throw new Error('지원하지 않는 파일 형식입니다.');
            }

            if (!this.validateFileSize(file)) {
                throw new Error('파일 크기가 너무 큽니다. (최대 10MB)');
            }

            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            let content = '';
            switch (fileExtension) {
                case '.pdf':
                    content = await this.parsePDF(file);
                    break;
                case '.txt':
                    content = await this.parseTXT(file);
                    break;
                default:
                    throw new Error('지원하지 않는 파일 형식입니다.');
            }

            // 기본 메타데이터 생성
            const metadata = {
                fileName: file.name,
                fileSize: file.size,
                fileType: fileExtension,
                parsedAt: new Date().toISOString(),
                wordCount: this.countWords(content),
                characterCount: content.length
            };

            return {
                content: content.trim(),
                metadata,
                success: true
            };

        } catch (error) {
            console.error('파일 파싱 오류:', error);
            return {
                content: '',
                metadata: null,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * PDF 파일 파싱
     */
    async parsePDF(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = async function() {
                try {
                    const typedArray = new Uint8Array(this.result);
                    const pdf = await window['pdfjs-dist/build/pdf'].getDocument(typedArray).promise;
                    
                    let fullText = '';
                    
                    // 모든 페이지 순회
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        
                        let pageText = '';
                        textContent.items.forEach(item => {
                            pageText += item.str + ' ';
                        });
                        
                        fullText += pageText + '\\n\\n';
                    }
                    
                    resolve(fullText);
                } catch (error) {
                    reject(new Error('PDF 파싱 중 오류가 발생했습니다: ' + error.message));
                }
            };
            
            fileReader.onerror = () => {
                reject(new Error('파일 읽기 오류가 발생했습니다.'));
            };
            
            fileReader.readAsArrayBuffer(file);
        });
    }

    /**
     * TXT 파일 파싱
     */
    async parseTXT(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = function() {
                try {
                    // UTF-8 인코딩으로 읽기 시도
                    let content = this.result;
                    
                    // 인코딩 감지 및 변환
                    if (content.includes('�')) {
                        // EUC-KR로 재시도
                        const fileReaderEUCKR = new FileReader();
                        fileReaderEUCKR.onload = function() {
                            resolve(this.result);
                        };
                        fileReaderEUCKR.onerror = () => {
                            reject(new Error('텍스트 파일 인코딩 오류'));
                        };
                        fileReaderEUCKR.readAsText(file, 'euc-kr');
                    } else {
                        resolve(content);
                    }
                } catch (error) {
                    reject(new Error('텍스트 파일 파싱 오류: ' + error.message));
                }
            };
            
            fileReader.onerror = () => {
                reject(new Error('파일 읽기 오류가 발생했습니다.'));
            };
            
            fileReader.readAsText(file, 'utf-8');
        });
    }

    /**
     * 단어 수 계산
     */
    countWords(text) {
        return text.split(/\\s+/).filter(word => word.length > 0).length;
    }

    /**
     * 텍스트 전처리
     */
    preprocessText(text) {
        return text
            // 불필요한 공백 제거
            .replace(/\\s+/g, ' ')
            // 연속된 줄바꿈 정리
            .replace(/\\n{3,}/g, '\\n\\n')
            // 특수문자 정리
            .replace(/[\\u200B-\\u200D\\uFEFF]/g, '')
            // 앞뒤 공백 제거
            .trim();
    }

    /**
     * 문장 단위로 분리
     */
    splitIntoSentences(text) {
        // 한국어 문장 구분자
        const sentenceEnders = /[.!?\\n]\\s*/g;
        const sentences = text.split(sentenceEnders)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 10); // 너무 짧은 문장 제외
        
        return sentences;
    }

    /**
     * 단락 단위로 분리
     */
    splitIntoParagraphs(text) {
        const paragraphs = text.split(/\\n\\s*\\n/)
            .map(paragraph => paragraph.trim())
            .filter(paragraph => paragraph.length > 20); // 너무 짧은 단락 제외
        
        return paragraphs;
    }

    /**
     * 키워드 추출 (간단한 빈도 기반)
     */
    extractKeywords(text, minLength = 2, maxKeywords = 50) {
        // 한글, 영문, 숫자만 추출
        const words = text.match(/[가-힣a-zA-Z0-9]+/g) || [];
        
        // 단어 빈도 계산
        const wordFreq = {};
        words.forEach(word => {
            if (word.length >= minLength) {
                const normalizedWord = word.toLowerCase();
                wordFreq[normalizedWord] = (wordFreq[normalizedWord] || 0) + 1;
            }
        });

        // 빈도순 정렬
        const sortedKeywords = Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, maxKeywords)
            .map(([word, freq]) => ({ word, frequency: freq }));

        return sortedKeywords;
    }

    /**
     * 텍스트 난이도 추정 (간단한 지표 기반)
     */
    estimateTextDifficulty(text) {
        const sentences = this.splitIntoSentences(text);
        const words = text.match(/[가-힣a-zA-Z0-9]+/g) || [];
        
        // 평균 문장 길이
        const avgSentenceLength = words.length / sentences.length;
        
        // 복잡한 단어 비율 (4글자 이상)
        const complexWords = words.filter(word => word.length >= 4).length;
        const complexWordRatio = complexWords / words.length;
        
        // 난이도 점수 계산 (1-10)
        let difficulty = 1;
        
        if (avgSentenceLength > 20) difficulty += 2;
        if (avgSentenceLength > 30) difficulty += 2;
        if (complexWordRatio > 0.3) difficulty += 2;
        if (complexWordRatio > 0.5) difficulty += 2;
        
        // 전문 용어 패턴 감지
        const technicalPatterns = [
            /[가-힣]+기사/g,
            /[가-힣]+사/g,
            /제\\d+조/g,
            /[가-힣]+법/g,
            /규정|조항|항목/g
        ];
        
        technicalPatterns.forEach(pattern => {
            if (pattern.test(text)) {
                difficulty += 1;
            }
        });

        return Math.min(10, Math.max(1, Math.round(difficulty)));
    }

    /**
     * 주제 분류 (기본적인 키워드 기반)
     */
    classifySubject(text, filename = '') {
        const subjects = {
            '전기기능사': ['전기', '회로', '저항', '전압', '전류', '변압기', '모터', '배선', '접지'],
            '소방관리사': ['소방', '화재', '스프링클러', '소화기', '방재', '안전', '대피', '경보'],
            '정보처리기사': ['프로그래밍', '데이터베이스', '네트워크', '소프트웨어', '알고리즘', 'DB', 'SQL'],
            '건축기사': ['건축', '구조', '시공', '설계', '콘크리트', '철근', '건물', '도면'],
            '기계기사': ['기계', '엔진', '펌프', '터빈', '기어', '베어링', '가공', '용접'],
            '일반': ['일반', '기본', '상식', '교양']
        };

        const textLower = text.toLowerCase();
        const filenameLower = filename.toLowerCase();
        const combinedText = textLower + ' ' + filenameLower;

        let maxScore = 0;
        let predictedSubject = '일반';

        Object.entries(subjects).forEach(([subject, keywords]) => {
            let score = 0;
            keywords.forEach(keyword => {
                const regex = new RegExp(keyword, 'gi');
                const matches = combinedText.match(regex);
                if (matches) {
                    score += matches.length;
                }
            });

            if (score > maxScore) {
                maxScore = score;
                predictedSubject = subject;
            }
        });

        return {
            subject: predictedSubject,
            confidence: Math.min(1, maxScore / 10), // 0-1 사이의 신뢰도
            scores: Object.keys(subjects).reduce((acc, subject) => {
                acc[subject] = 0;
                subjects[subject].forEach(keyword => {
                    const regex = new RegExp(keyword, 'gi');
                    const matches = combinedText.match(regex);
                    if (matches) {
                        acc[subject] += matches.length;
                    }
                });
                return acc;
            }, {})
        };
    }
}

// 전역으로 사용할 수 있도록 내보내기
window.FileParser = FileParser;