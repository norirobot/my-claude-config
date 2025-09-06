/**
 * Speech Recognition & Pronunciation Analysis Service
 * 음성 인식 및 발음 교정 서비스
 */

export interface VoiceAnalysisResult {
  transcription: string;        // 음성 인식 결과 텍스트
  pronunciation_score: number; // 발음 점수 (0-100)
  accuracy_score: number;      // 정확도 점수 (0-100)
  fluency_score: number;       // 유창성 점수 (0-100)
  completeness_score: number;  // 완성도 점수 (0-100)
  
  // 세부 분석 결과
  word_scores: WordScore[];
  phoneme_errors: PhonemeError[];
  timing_analysis: TimingAnalysis;
  
  // 개선 제안
  feedback: PronunciationFeedback;
  recommendations: string[];
}

export interface WordScore {
  word: string;
  score: number;        // 0-100
  expected: string;     // 기대되는 발음
  actual: string;       // 실제 발음
  confidence: number;   // 인식 신뢰도
  is_correct: boolean;
}

export interface PhonemeError {
  position: number;     // 음소 위치
  expected: string;     // 기대 음소
  actual: string;       // 실제 음소
  error_type: 'substitution' | 'insertion' | 'deletion';
  severity: 'low' | 'medium' | 'high';
}

export interface TimingAnalysis {
  total_duration: number;       // 전체 발화 시간 (초)
  speech_rate: number;         // 말하기 속도 (단어/분)
  pause_count: number;         // 휴지 횟수
  average_pause_duration: number; // 평균 휴지 시간
  rhythm_score: number;        // 리듬 점수 (0-100)
}

export interface PronunciationFeedback {
  overall_assessment: string;   // 전체 평가
  strengths: string[];         // 잘한 점들
  areas_for_improvement: string[]; // 개선할 점들
  specific_tips: string[];     // 구체적 조언
}

export class SpeechRecognitionService {
  
  /**
   * 음성 데이터를 분석하여 발음 점수 및 피드백 생성
   */
  static async analyzeVoice(
    audioData: Buffer,
    expectedText: string,
    userLevel: number = 3 // 사용자 레벨 (1-5)
  ): Promise<VoiceAnalysisResult> {
    
    try {
      // 1. 음성 인식 (STT)
      const transcription = await this.performSpeechToText(audioData);
      
      // 2. 텍스트 유사도 분석
      const textAccuracy = this.calculateTextAccuracy(expectedText, transcription);
      
      // 3. 발음 분석 (모의 분석 - 실제로는 더 복잡한 음성 분석 필요)
      const pronunciationAnalysis = await this.analyzePronunciation(
        audioData, 
        expectedText, 
        transcription,
        userLevel
      );
      
      // 4. 종합 점수 계산
      const overallScore = this.calculateOverallScore(textAccuracy, pronunciationAnalysis);
      
      // 5. 개인화된 피드백 생성
      const feedback = this.generatePersonalizedFeedback(
        expectedText, 
        transcription, 
        pronunciationAnalysis,
        userLevel
      );
      
      return {
        transcription,
        pronunciation_score: overallScore.pronunciation,
        accuracy_score: overallScore.accuracy,
        fluency_score: overallScore.fluency,
        completeness_score: overallScore.completeness,
        word_scores: pronunciationAnalysis.word_scores,
        phoneme_errors: pronunciationAnalysis.phoneme_errors,
        timing_analysis: pronunciationAnalysis.timing,
        feedback,
        recommendations: this.generateRecommendations(pronunciationAnalysis, userLevel)
      };
      
    } catch (error) {
      console.error('Voice analysis error:', error);
      throw new Error('Failed to analyze voice data');
    }
  }
  
  /**
   * 음성 인식 (STT) 수행
   */
  private static async performSpeechToText(audioData: Buffer): Promise<string> {
    // 실제 구현에서는 Google Speech-to-Text, Azure Speech 등 사용
    // 현재는 모의 구현
    
    // 간단한 모의 음성 인식 결과
    const mockResponses = [
      "I would like a large cappuccino, please.",
      "I would like a large cappucino, please.", // 오타 포함
      "I wood like a large cappuccino, please.",  // 발음 오류
      "I would like... um... large cappuccino, please.", // 망설임
    ];
    
    // 랜덤하게 하나 선택 (실제로는 오디오 분석 결과)
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }
  
  /**
   * 텍스트 정확도 계산
   */
  private static calculateTextAccuracy(expected: string, actual: string): number {
    const expectedWords = expected.toLowerCase().split(/\s+/);
    const actualWords = actual.toLowerCase().split(/\s+/);
    
    let correctWords = 0;
    let totalWords = Math.max(expectedWords.length, actualWords.length);
    
    // 단어 단위 비교 (Levenshtein distance 기반)
    for (let i = 0; i < Math.min(expectedWords.length, actualWords.length); i++) {
      if (this.calculateLevenshteinDistance(expectedWords[i], actualWords[i]) <= 1) {
        correctWords++;
      }
    }
    
    return Math.round((correctWords / totalWords) * 100);
  }
  
  /**
   * Levenshtein Distance 계산 (문자열 유사도)
   */
  private static calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * 발음 분석 수행
   */
  private static async analyzePronunciation(
    audioData: Buffer, 
    expectedText: string, 
    transcription: string,
    userLevel: number
  ): Promise<{
    word_scores: WordScore[],
    phoneme_errors: PhonemeError[],
    timing: TimingAnalysis
  }> {
    
    const expectedWords = expectedText.split(' ');
    const actualWords = transcription.split(' ');
    
    // 단어별 점수 분석
    const word_scores: WordScore[] = expectedWords.map((word, index) => {
      const actualWord = actualWords[index] || '';
      const score = this.calculateWordScore(word, actualWord);
      
      return {
        word,
        score,
        expected: word,
        actual: actualWord,
        confidence: Math.random() * 30 + 70, // 모의 신뢰도 70-100%
        is_correct: score >= 80
      };
    });
    
    // 음소 오류 분석 (간단한 모의 분석)
    const phoneme_errors: PhonemeError[] = [];
    if (transcription.includes('cappucino')) {
      phoneme_errors.push({
        position: transcription.indexOf('cappucino'),
        expected: 'cappuccino',
        actual: 'cappucino',
        error_type: 'deletion',
        severity: 'medium'
      });
    }
    
    // 타이밍 분석 (모의 데이터)
    const timing: TimingAnalysis = {
      total_duration: Math.random() * 3 + 2, // 2-5초
      speech_rate: Math.random() * 50 + 120, // 120-170 단어/분
      pause_count: Math.floor(Math.random() * 3),
      average_pause_duration: Math.random() * 0.5 + 0.2,
      rhythm_score: Math.random() * 20 + 75 // 75-95
    };
    
    return { word_scores, phoneme_errors, timing };
  }
  
  /**
   * 단어 점수 계산
   */
  private static calculateWordScore(expected: string, actual: string): number {
    if (expected === actual) return 100;
    
    const distance = this.calculateLevenshteinDistance(expected, actual);
    const maxLength = Math.max(expected.length, actual.length);
    
    return Math.max(0, Math.round(100 * (1 - distance / maxLength)));
  }
  
  /**
   * 종합 점수 계산
   */
  private static calculateOverallScore(textAccuracy: number, analysis: any): {
    pronunciation: number,
    accuracy: number,
    fluency: number,
    completeness: number
  } {
    
    const wordScoreAvg = analysis.word_scores.reduce(
      (sum: number, word: WordScore) => sum + word.score, 0
    ) / analysis.word_scores.length;
    
    return {
      pronunciation: Math.round(wordScoreAvg),
      accuracy: textAccuracy,
      fluency: Math.round(analysis.timing.rhythm_score),
      completeness: analysis.word_scores.filter((w: WordScore) => w.is_correct).length / 
                   analysis.word_scores.length * 100
    };
  }
  
  /**
   * 개인화된 피드백 생성
   */
  private static generatePersonalizedFeedback(
    expected: string,
    actual: string,
    analysis: any,
    userLevel: number
  ): PronunciationFeedback {
    
    const strengths: string[] = [];
    const improvements: string[] = [];
    const tips: string[] = [];
    
    // 잘한 점 분석
    const correctWords = analysis.word_scores.filter((w: WordScore) => w.is_correct).length;
    if (correctWords > analysis.word_scores.length * 0.8) {
      strengths.push("대부분의 단어를 정확하게 발음했습니다!");
    }
    
    if (analysis.timing.speech_rate >= 120 && analysis.timing.speech_rate <= 160) {
      strengths.push("적절한 말하기 속도를 유지했습니다.");
    }
    
    // 개선점 분석
    analysis.phoneme_errors.forEach((error: PhonemeError) => {
      improvements.push(`"${error.actual}" → "${error.expected}" 발음에 주의하세요.`);
      tips.push(`"${error.expected}" 발음 시 혀의 위치를 확인하세요.`);
    });
    
    if (analysis.timing.pause_count > 2) {
      improvements.push("발화 중 망설임을 줄여보세요.");
      tips.push("문장을 먼저 머릿속으로 정리한 후 말하는 연습을 해보세요.");
    }
    
    // 레벨별 맞춤 조언
    if (userLevel <= 2) {
      tips.push("천천히 또박또박 말하는 것이 중요합니다.");
    } else if (userLevel >= 4) {
      tips.push("자연스러운 억양과 리듬에 집중해보세요.");
    }
    
    const overall_assessment = this.generateOverallAssessment(analysis, userLevel);
    
    return {
      overall_assessment,
      strengths,
      areas_for_improvement: improvements,
      specific_tips: tips
    };
  }
  
  /**
   * 전체 평가 생성
   */
  private static generateOverallAssessment(analysis: any, userLevel: number): string {
    const avgScore = analysis.word_scores.reduce(
      (sum: number, word: WordScore) => sum + word.score, 0
    ) / analysis.word_scores.length;
    
    if (avgScore >= 90) return "🌟 훌륭합니다! 매우 명확한 발음이에요.";
    if (avgScore >= 80) return "👍 좋아요! 전반적으로 잘 발음하고 있어요.";
    if (avgScore >= 70) return "👌 괜찮아요! 조금만 더 연습하면 완벽해질 거예요.";
    if (avgScore >= 60) return "💪 계속 연습하세요! 발전하고 있어요.";
    return "📚 더 많은 연습이 필요해요. 천천히 따라 해보세요.";
  }
  
  /**
   * 개선 권장사항 생성
   */
  private static generateRecommendations(analysis: any, userLevel: number): string[] {
    const recommendations: string[] = [];
    
    // 점수별 추천
    const avgScore = analysis.word_scores.reduce(
      (sum: number, word: WordScore) => sum + word.score, 0
    ) / analysis.word_scores.length;
    
    if (avgScore < 70) {
      recommendations.push("🎯 발음 연습: 어려운 단어를 반복 연습하세요.");
      recommendations.push("🗣️ 쉐도잉: 원어민 음성을 따라 말해보세요.");
    }
    
    if (analysis.timing.speech_rate < 100) {
      recommendations.push("⚡ 유창성 향상: 읽기 연습으로 말하기 속도를 높이세요.");
    } else if (analysis.timing.speech_rate > 180) {
      recommendations.push("🐌 속도 조절: 좀 더 천천히 또박또박 말해보세요.");
    }
    
    if (analysis.phoneme_errors.length > 2) {
      recommendations.push("🔍 음소 연습: 발음 기호를 학습하여 정확한 소리를 익히세요.");
    }
    
    return recommendations;
  }
}