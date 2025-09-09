/**
 * 콘텐츠 분석 모듈
 * 파싱된 텍스트를 분석하여 문제 생성에 적합한 구조로 변환
 */

class ContentAnalyzer {
    constructor() {
        this.stopWords = new Set([
            '그리고', '그러나', '하지만', '또한', '따라서', '그러므로', '즉', '예를 들어',
            '이는', '이것', '그것', '이러한', '그런', '이런', '그리하여', '그래서',
            '때문에', '위해', '위한', '대한', '대해', '관한', '관해', '에서', '에게',
            '으로', '로서', '부터', '까지', '와', '과', '및', '그', '이', '저', '그녀',
            '그들', '우리', '나', '너', '당신', '여기', '거기', '저기', '어디', '언제',
            '무엇', '누구', '어떻게', '왜', '얼마나', '정도', '것', '수', '개', '명'
        ]);
        
        this.questionPatterns = [
            // 정의형 패턴
            {
                type: 'definition',
                patterns: [
                    /(.+)는\s*(.+)을\s*말한다/g,
                    /(.+)는\s*(.+)를\s*의미한다/g,
                    /(.+)란\s*(.+)이다/g,
                    /(.+)이란\s*(.+)을\s*말한다/g
                ]
            },
            // 특징형 패턴
            {
                type: 'characteristics',
                patterns: [
                    /(.+)의\s*특징은\s*(.+)이다/g,
                    /(.+)는\s*(.+)한\s*특징을\s*가진다/g,
                    /(.+)의\s*장점은\s*(.+)이다/g,
                    /(.+)의\s*단점은\s*(.+)이다/g
                ]
            },
            // 원인-결과형 패턴
            {
                type: 'cause_effect',
                patterns: [
                    /(.+)\s*때문에\s*(.+)/g,
                    /(.+)\s*으로\s*인해\s*(.+)/g,
                    /(.+)\s*하면\s*(.+)/g,
                    /(.+)\s*의\s*결과\s*(.+)/g
                ]
            },
            // 분류형 패턴
            {
                type: 'classification',
                patterns: [
                    /(.+)는\s*(.+)로\s*분류된다/g,
                    /(.+)의\s*종류는\s*(.+)이다/g,
                    /(.+)에는\s*(.+)\s*등이\s*있다/g
                ]
            },
            // 절차형 패턴
            {
                type: 'procedure',
                patterns: [
                    /첫째[,\s]*(.+)/g,
                    /둘째[,\s]*(.+)/g,
                    /셋째[,\s]*(.+)/g,
                    /먼저[,\s]*(.+)/g,
                    /다음으로[,\s]*(.+)/g,
                    /마지막으로[,\s]*(.+)/g
                ]
            }
        ];
    }

    /**
     * 텍스트를 분석하여 학습 단위로 분할
     */
    analyzeContent(text, metadata = {}) {
        try {
            // 1. 기본 전처리
            const preprocessedText = this.preprocessText(text);
            
            // 2. 문장 단위로 분할
            const sentences = this.extractSentences(preprocessedText);
            
            // 3. 개념 추출
            const concepts = this.extractConcepts(sentences);
            
            // 4. 관계 분석
            const relationships = this.analyzeRelationships(concepts, sentences);
            
            // 5. 중요도 계산
            const importance = this.calculateImportance(concepts, sentences);
            
            // 6. 카테고리 분류
            const categories = this.categorizeContent(concepts, sentences);
            
            // 7. 문제 생성 후보 추출
            const questionCandidates = this.extractQuestionCandidates(sentences);

            return {
                metadata,
                sentences,
                concepts,
                relationships,
                importance,
                categories,
                questionCandidates,
                statistics: {
                    totalSentences: sentences.length,
                    totalConcepts: concepts.length,
                    avgSentenceLength: sentences.reduce((sum, s) => sum + s.text.length, 0) / sentences.length,
                    difficulty: this.estimateDifficulty(sentences, concepts)
                }
            };
        } catch (error) {
            console.error('콘텐츠 분석 오류:', error);
            throw error;
        }
    }

    /**
     * 텍스트 전처리
     */
    preprocessText(text) {
        return text
            .replace(/\\s+/g, ' ')
            .replace(/\\n{3,}/g, '\\n\\n')
            .replace(/[\\u200B-\\u200D\\uFEFF]/g, '')
            .trim();
    }

    /**
     * 문장 추출 및 구조화
     */
    extractSentences(text) {
        const rawSentences = text.split(/[.!?\\n]\\s*/)
            .map(s => s.trim())
            .filter(s => s.length > 10);

        return rawSentences.map((sentence, index) => ({
            id: `sent_${index}`,
            text: sentence,
            length: sentence.length,
            wordCount: sentence.split(/\\s+/).length,
            position: index,
            hasNumbers: /\\d+/.test(sentence),
            hasDefinition: this.hasDefinitionPattern(sentence),
            questionType: this.identifyQuestionType(sentence)
        }));
    }

    /**
     * 개념 추출
     */
    extractConcepts(sentences) {
        const conceptMap = new Map();
        
        sentences.forEach(sentence => {
            // 명사 추출 (간단한 패턴 기반)
            const nouns = this.extractNouns(sentence.text);
            
            nouns.forEach(noun => {
                if (!this.stopWords.has(noun) && noun.length >= 2) {
                    if (!conceptMap.has(noun)) {
                        conceptMap.set(noun, {
                            term: noun,
                            frequency: 0,
                            sentences: [],
                            contexts: [],
                            importance: 0
                        });
                    }
                    
                    const concept = conceptMap.get(noun);
                    concept.frequency++;
                    concept.sentences.push(sentence.id);
                    concept.contexts.push(this.extractContext(sentence.text, noun));
                }
            });
        });

        return Array.from(conceptMap.values());
    }

    /**
     * 명사 추출 (간단한 패턴 기반)
     */
    extractNouns(text) {
        // 한글 명사 패턴 (조사 제거)
        const koreanNouns = text.match(/[가-힣]{2,}/g) || [];
        
        // 영어 명사 패턴
        const englishNouns = text.match(/[A-Z][a-z]+/g) || [];
        
        // 전문 용어 패턴
        const technicalTerms = text.match(/[가-힣]+(?:기사|사|법|식|제|방법|기술|시스템|장치)/g) || [];
        
        return [...koreanNouns, ...englishNouns, ...technicalTerms]
            .filter(noun => noun.length >= 2)
            .map(noun => noun.replace(/[이가을를은는에서와과]/g, ''));
    }

    /**
     * 맥락 추출
     */
    extractContext(sentence, term) {
        const termIndex = sentence.indexOf(term);
        if (termIndex === -1) return '';
        
        const start = Math.max(0, termIndex - 20);
        const end = Math.min(sentence.length, termIndex + term.length + 20);
        
        return sentence.substring(start, end).trim();
    }

    /**
     * 관계 분석
     */
    analyzeRelationships(concepts, sentences) {
        const relationships = [];
        
        // 공출현 기반 관계 추출
        concepts.forEach((concept1, i) => {
            concepts.slice(i + 1).forEach(concept2 => {
                const commonSentences = concept1.sentences.filter(s => 
                    concept2.sentences.includes(s)
                );
                
                if (commonSentences.length > 0) {
                    relationships.push({
                        term1: concept1.term,
                        term2: concept2.term,
                        strength: commonSentences.length,
                        type: this.identifyRelationshipType(concept1.term, concept2.term, sentences),
                        commonSentences
                    });
                }
            });
        });

        return relationships.sort((a, b) => b.strength - a.strength);
    }

    /**
     * 관계 유형 식별
     */
    identifyRelationshipType(term1, term2, sentences) {
        // 간단한 패턴 기반 관계 식별
        const relationshipPatterns = {
            'is-a': new RegExp(`${term1}.*는.*${term2}.*이다`, 'i'),
            'part-of': new RegExp(`${term1}.*의.*${term2}`, 'i'),
            'causes': new RegExp(`${term1}.*때문에.*${term2}`, 'i'),
            'related': new RegExp(`${term1}.*${term2}`, 'i')
        };

        for (const [type, pattern] of Object.entries(relationshipPatterns)) {
            const found = sentences.some(sentence => pattern.test(sentence.text));
            if (found) return type;
        }

        return 'related';
    }

    /**
     * 중요도 계산
     */
    calculateImportance(concepts, sentences) {
        const importanceScores = {};
        
        concepts.forEach(concept => {
            let score = 0;
            
            // 빈도 기반 점수
            score += concept.frequency * 2;
            
            // 위치 기반 점수 (앞부분에 나오는 개념일수록 중요)
            const avgPosition = concept.sentences.reduce((sum, sentId) => {
                const sentence = sentences.find(s => s.id === sentId);
                return sum + (sentence ? sentence.position : 0);
            }, 0) / concept.sentences.length;
            
            score += Math.max(0, 100 - avgPosition);
            
            // 정의 패턴 포함 여부
            const hasDefinition = concept.contexts.some(context => 
                this.hasDefinitionPattern(context)
            );
            if (hasDefinition) score += 50;
            
            // 전문 용어 여부
            if (this.isTechnicalTerm(concept.term)) score += 30;
            
            importanceScores[concept.term] = score;
        });

        return importanceScores;
    }

    /**
     * 정의 패턴 확인
     */
    hasDefinitionPattern(text) {
        const definitionPatterns = [
            /.*는.*이다$/,
            /.*란.*$/,
            /.*을\s*말한다$/,
            /.*를\s*의미한다$/,
            /.*라고\s*한다$/
        ];

        return definitionPatterns.some(pattern => pattern.test(text));
    }

    /**
     * 전문 용어 확인
     */
    isTechnicalTerm(term) {
        const technicalPatterns = [
            /.*기사$/,
            /.*사$/,
            /.*법$/,
            /.*제$/,
            /.*기술$/,
            /.*시스템$/,
            /.*장치$/,
            /.*방법$/
        ];

        return technicalPatterns.some(pattern => pattern.test(term));
    }

    /**
     * 문장 질문 유형 식별
     */
    identifyQuestionType(sentence) {
        for (const pattern of this.questionPatterns) {
            for (const regex of pattern.patterns) {
                if (regex.test(sentence)) {
                    return pattern.type;
                }
            }
        }
        return 'general';
    }

    /**
     * 콘텐츠 카테고리 분류
     */
    categorizeContent(concepts, sentences) {
        const categories = {
            'definition': { concepts: [], sentences: [], score: 0 },
            'procedure': { concepts: [], sentences: [], score: 0 },
            'classification': { concepts: [], sentences: [], score: 0 },
            'principle': { concepts: [], sentences: [], score: 0 },
            'application': { concepts: [], sentences: [], score: 0 }
        };

        sentences.forEach(sentence => {
            const type = sentence.questionType;
            if (categories[type]) {
                categories[type].sentences.push(sentence.id);
                categories[type].score += 1;
            }
        });

        concepts.forEach(concept => {
            if (this.isTechnicalTerm(concept.term)) {
                categories.definition.concepts.push(concept.term);
                categories.definition.score += concept.frequency;
            }
        });

        return categories;
    }

    /**
     * 문제 생성 후보 추출
     */
    extractQuestionCandidates(sentences) {
        return sentences
            .filter(sentence => 
                sentence.questionType !== 'general' &&
                sentence.wordCount >= 5 &&
                sentence.length >= 20
            )
            .map(sentence => ({
                sentenceId: sentence.id,
                text: sentence.text,
                type: sentence.questionType,
                difficulty: this.estimateSentenceDifficulty(sentence),
                keyTerms: this.extractKeyTermsFromSentence(sentence.text),
                questionPotential: this.calculateQuestionPotential(sentence)
            }))
            .sort((a, b) => b.questionPotential - a.questionPotential);
    }

    /**
     * 문장 난이도 추정
     */
    estimateSentenceDifficulty(sentence) {
        let difficulty = 1;
        
        // 길이 기반
        if (sentence.wordCount > 15) difficulty += 1;
        if (sentence.wordCount > 25) difficulty += 1;
        
        // 복잡성 기반
        if (sentence.hasNumbers) difficulty += 1;
        if (sentence.hasDefinition) difficulty += 1;
        
        // 전문 용어 포함 여부
        const technicalTerms = sentence.text.match(/[가-힣]+(?:기사|사|법|기술|시스템|장치|방법)/g);
        if (technicalTerms && technicalTerms.length > 0) {
            difficulty += technicalTerms.length;
        }

        return Math.min(5, difficulty);
    }

    /**
     * 문장에서 핵심 용어 추출
     */
    extractKeyTermsFromSentence(sentence) {
        const nouns = this.extractNouns(sentence);
        return nouns
            .filter(noun => !this.stopWords.has(noun) && noun.length >= 2)
            .slice(0, 5); // 상위 5개만
    }

    /**
     * 문제 생성 가능성 점수 계산
     */
    calculateQuestionPotential(sentence) {
        let score = 0;
        
        // 기본 점수
        score += sentence.wordCount * 0.5;
        
        // 질문 유형 보너스
        const typeBonus = {
            'definition': 10,
            'characteristics': 8,
            'cause_effect': 9,
            'classification': 7,
            'procedure': 6,
            'general': 3
        };
        score += typeBonus[sentence.questionType] || 0;
        
        // 정의 패턴 보너스
        if (sentence.hasDefinition) score += 15;
        
        // 숫자 포함 보너스
        if (sentence.hasNumbers) score += 5;
        
        // 문장 완성도 (마침표로 끝나는지)
        if (sentence.text.endsWith('.') || sentence.text.endsWith('다')) {
            score += 5;
        }

        return score;
    }

    /**
     * 전체 텍스트 난이도 추정
     */
    estimateDifficulty(sentences, concepts) {
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.wordCount, 0) / sentences.length;
        const technicalTermRatio = concepts.filter(c => this.isTechnicalTerm(c.term)).length / concepts.length;
        const definitionRatio = sentences.filter(s => s.hasDefinition).length / sentences.length;
        
        let difficulty = 1;
        
        if (avgSentenceLength > 15) difficulty += 1;
        if (avgSentenceLength > 25) difficulty += 1;
        if (technicalTermRatio > 0.3) difficulty += 2;
        if (technicalTermRatio > 0.5) difficulty += 1;
        if (definitionRatio > 0.2) difficulty += 1;
        
        return Math.min(5, difficulty);
    }
}

// 전역으로 사용할 수 있도록 내보내기
window.ContentAnalyzer = ContentAnalyzer;