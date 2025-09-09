const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// OpenAI 클라이언트 초기화 (유효한 API 키가 있을 때만)
let openai = null;
const apiKey = process.env.OPENAI_API_KEY;

if (apiKey && apiKey.startsWith('sk-') && !apiKey.includes('demo') && !apiKey.includes('test')) {
  try {
    openai = new OpenAI({
      apiKey: apiKey
    });
    console.log('✅ OpenAI Whisper client initialized with API key');
  } catch (error) {
    console.warn('⚠️ OpenAI Whisper initialization failed:', error.message);
    openai = null;
  }
} else if (apiKey) {
  console.warn('⚠️ Demo/test OpenAI API key detected. Speech analysis will use fallback responses.');
} else {
  console.warn('⚠️ OpenAI API key not found. Speech analysis will use fallback responses.');
}

const speechAnalysisService = {
  // 음성을 텍스트로 변환 (Speech-to-Text)
  async transcribeAudio(audioFilePath, language = 'en') {
    if (!openai) {
      // OpenAI 없이 Mock 응답 반환
      return {
        text: "Hello, could you take me to Suseong Lake please?",
        duration: 3.5,
        confidence: 0.85
      };
    }

    try {
      const audioFile = await fs.readFile(audioFilePath);
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: language,
        response_format: "json",
        temperature: 0
      });

      return {
        text: transcription.text,
        duration: transcription.duration || null,
        confidence: this.calculateConfidenceFromText(transcription.text)
      };
    } catch (error) {
      console.error('Speech transcription error:', error);
      throw new Error('Failed to transcribe audio: ' + error.message);
    }
  },

  // 발음 분석 및 평가
  async analyzePronunciation(originalText, transcribedText, audioFilePath) {
    try {
      // 텍스트 유사도 계산
      const similarity = this.calculateTextSimilarity(originalText, transcribedText);
      
      // 발음 피드백 생성
      const pronunciationFeedback = await this.generatePronunciationFeedback(
        originalText, 
        transcribedText
      );

      // 음성 품질 분석 (기본적인 분석)
      const audioAnalysis = await this.analyzeAudioQuality(audioFilePath);

      return {
        pronunciationScore: Math.round(similarity * 100),
        transcribedText,
        originalText,
        similarity,
        feedback: pronunciationFeedback,
        audioQuality: audioAnalysis,
        detailedAnalysis: {
          wordAccuracy: this.analyzeWordAccuracy(originalText, transcribedText),
          fluency: this.analyzeFluency(transcribedText),
          rhythm: audioAnalysis.rhythm || 'normal'
        }
      };
    } catch (error) {
      console.error('Pronunciation analysis error:', error);
      return this.getDefaultPronunciationAnalysis(originalText, transcribedText);
    }
  },

  // OpenAI를 통한 발음 피드백 생성
  async generatePronunciationFeedback(originalText, transcribedText) {
    try {
      const prompt = `
Analyze the pronunciation based on the following:
Original text: "${originalText}"
What the user said: "${transcribedText}"

Please provide pronunciation feedback in JSON format with:
- correctWords: array of words pronounced correctly
- mispronunciations: array of objects with {word, expected, actual, tip}
- overallFeedback: general advice for improvement
- strengths: what the user did well
- difficulty: estimated difficulty level (easy/medium/hard)
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a pronunciation coach. Analyze pronunciation and provide constructive feedback." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Pronunciation feedback generation error:', error);
      return {
        correctWords: [],
        mispronunciations: [],
        overallFeedback: "Keep practicing! Your pronunciation is improving.",
        strengths: ["Good effort at speaking clearly"],
        difficulty: "medium"
      };
    }
  },

  // 음성 품질 분석 (기본적인 구현)
  async analyzeAudioQuality(audioFilePath) {
    try {
      // 실제 구현에서는 음성 처리 라이브러리를 사용해야 함
      // 여기서는 기본적인 분석만 제공
      const stats = await fs.stat(audioFilePath);
      const fileSize = stats.size;
      
      // 파일 크기를 바탕으로 기본적인 품질 추정
      let quality = 'good';
      if (fileSize < 10000) quality = 'poor';
      else if (fileSize < 50000) quality = 'fair';
      else if (fileSize > 500000) quality = 'excellent';

      return {
        quality,
        fileSize,
        estimatedDuration: Math.round(fileSize / 16000), // 대략적인 계산
        clarity: quality === 'excellent' ? 'high' : quality === 'poor' ? 'low' : 'medium',
        volume: 'adequate',
        rhythm: 'normal'
      };
    } catch (error) {
      console.error('Audio quality analysis error:', error);
      return {
        quality: 'unknown',
        fileSize: 0,
        estimatedDuration: 0,
        clarity: 'medium',
        volume: 'adequate',
        rhythm: 'normal'
      };
    }
  },

  // 텍스트 유사도 계산 (레벤슈타인 거리 기반)
  calculateTextSimilarity(text1, text2) {
    const normalize = (text) => text.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);
    
    if (normalized1 === normalized2) return 1.0;
    
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    
    return maxLength === 0 ? 0 : 1 - (distance / maxLength);
  },

  // 레벤슈타인 거리 계산
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  },

  // 단어별 정확도 분석
  analyzeWordAccuracy(originalText, transcribedText) {
    const originalWords = originalText.toLowerCase().split(/\s+/);
    const transcribedWords = transcribedText.toLowerCase().split(/\s+/);
    
    let correctWords = 0;
    let totalWords = originalWords.length;
    
    // 간단한 단어 매칭 (실제로는 더 정교한 알고리즘이 필요)
    const minLength = Math.min(originalWords.length, transcribedWords.length);
    
    for (let i = 0; i < minLength; i++) {
      if (originalWords[i] === transcribedWords[i] || 
          this.calculateTextSimilarity(originalWords[i], transcribedWords[i]) > 0.8) {
        correctWords++;
      }
    }
    
    return {
      correctWords,
      totalWords,
      accuracy: totalWords > 0 ? (correctWords / totalWords) : 0,
      wordLevelFeedback: this.generateWordLevelFeedback(originalWords, transcribedWords)
    };
  },

  // 유창성 분석
  analyzeFluency(transcribedText) {
    const words = transcribedText.trim().split(/\s+/);
    const wordCount = words.length;
    
    // 기본적인 유창성 지표들
    const averageWordLength = wordCount > 0 ? 
      words.reduce((sum, word) => sum + word.length, 0) / wordCount : 0;
    
    const hasFillers = /\b(um|uh|er|ah|like|you know)\b/i.test(transcribedText);
    const hasRepetitions = this.detectRepetitions(words);
    
    let fluencyScore = 70; // 기본 점수
    
    if (!hasFillers) fluencyScore += 15;
    if (!hasRepetitions) fluencyScore += 15;
    if (wordCount >= 5) fluencyScore += 10; // 적절한 길이
    if (averageWordLength > 4) fluencyScore += 5; // 복잡한 단어 사용
    
    return Math.min(100, Math.max(0, fluencyScore));
  },

  // 반복 감지
  detectRepetitions(words) {
    const wordCounts = {};
    let hasRepetition = false;
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      if (wordCounts[cleanWord] > 2) hasRepetition = true;
    });
    
    return hasRepetition;
  },

  // 단어별 피드백 생성
  generateWordLevelFeedback(originalWords, transcribedWords) {
    const feedback = [];
    const maxLength = Math.max(originalWords.length, transcribedWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      const original = originalWords[i] || '';
      const transcribed = transcribedWords[i] || '';
      
      if (original && !transcribed) {
        feedback.push({
          position: i,
          type: 'missing',
          expected: original,
          message: `Missing word: "${original}"`
        });
      } else if (!original && transcribed) {
        feedback.push({
          position: i,
          type: 'extra',
          actual: transcribed,
          message: `Extra word: "${transcribed}"`
        });
      } else if (original && transcribed && original !== transcribed) {
        const similarity = this.calculateTextSimilarity(original, transcribed);
        if (similarity < 0.8) {
          feedback.push({
            position: i,
            type: 'mispronounced',
            expected: original,
            actual: transcribed,
            similarity: similarity,
            message: `"${original}" was heard as "${transcribed}"`
          });
        }
      }
    }
    
    return feedback;
  },

  // 텍스트에서 신뢰도 추정
  calculateConfidenceFromText(text) {
    // 실제로는 Whisper API에서 제공하는 신뢰도를 사용해야 함
    // 여기서는 텍스트 길이와 품질을 바탕으로 추정
    if (!text || text.trim().length === 0) return 0;
    
    const wordCount = text.trim().split(/\s+/).length;
    let confidence = 0.7; // 기본 신뢰도
    
    if (wordCount >= 3) confidence += 0.1;
    if (wordCount >= 5) confidence += 0.1;
    if (!/\[.*\]/.test(text)) confidence += 0.1; // 불확실한 단어 표시가 없으면
    
    return Math.min(0.99, confidence);
  },

  // 기본 발음 분석 결과 (오류 시 사용)
  getDefaultPronunciationAnalysis(originalText, transcribedText) {
    const similarity = this.calculateTextSimilarity(originalText, transcribedText);
    
    return {
      pronunciationScore: Math.round(similarity * 100),
      transcribedText: transcribedText || originalText,
      originalText,
      similarity,
      feedback: {
        correctWords: [],
        mispronunciations: [],
        overallFeedback: "Audio analysis unavailable. Keep practicing!",
        strengths: ["Attempted the exercise"],
        difficulty: "medium"
      },
      audioQuality: {
        quality: 'unknown',
        clarity: 'medium',
        volume: 'adequate'
      },
      detailedAnalysis: {
        wordAccuracy: { accuracy: similarity, correctWords: 0, totalWords: 0 },
        fluency: 70,
        rhythm: 'normal'
      }
    };
  }
};

module.exports = speechAnalysisService;