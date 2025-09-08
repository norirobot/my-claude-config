const Tutor = require('../models/Tutor');

class MatchingService {
  /**
   * 학생의 선호도와 요구사항에 따라 최적의 튜터를 찾는다
   */
  static async findBestMatches(studentPreferences, options = {}) {
    try {
      const {
        specialty,
        maxHourlyRate,
        minRating = 4.0,
        preferredLanguages = [],
        timeSlots = [], // [{dayOfWeek: 'monday', time: '09:00'}]
        location,
        isVerifiedOnly = false,
        limit = 10
      } = studentPreferences;

      // 기본 필터 조건
      const filters = {
        minRating,
        sortBy: 'rating',
        limit: limit * 2, // 더 많은 후보를 가져와서 매칭 점수로 재정렬
        isVerified: isVerifiedOnly
      };

      if (specialty) filters.specialty = specialty;
      if (maxHourlyRate) filters.maxRate = maxHourlyRate;
      if (location) filters.location_city = location;

      // 모든 튜터 조회
      const tutors = await Tutor.findAll(filters);
      
      // 각 튜터에 대해 매칭 점수 계산
      const scoredTutors = tutors.map(tutor => ({
        ...tutor,
        matchScore: this.calculateMatchScore(tutor, studentPreferences)
      }));

      // 매칭 점수로 정렬
      const sortedTutors = scoredTutors
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      // 시간대 필터링 (선택사항)
      let availableTutors = sortedTutors;
      if (timeSlots.length > 0) {
        availableTutors = await this.filterByTimeSlots(sortedTutors, timeSlots);
      }

      return availableTutors;
    } catch (error) {
      throw new Error(`Error finding tutor matches: ${error.message}`);
    }
  }

  /**
   * 튜터와 학생 선호도 간의 매칭 점수 계산
   */
  static calculateMatchScore(tutor, preferences) {
    let score = 0;
    let maxScore = 0;

    // 1. 평점 점수 (40%)
    const ratingWeight = 40;
    const ratingScore = (tutor.rating / 5) * ratingWeight;
    score += ratingScore;
    maxScore += ratingWeight;

    // 2. 전문 분야 일치 (30%)
    const specialtyWeight = 30;
    if (preferences.specialty && tutor.specialty === preferences.specialty) {
      score += specialtyWeight;
    } else if (preferences.specialty) {
      // 부분 일치 점수
      const similarity = this.calculateStringSimilarity(tutor.specialty, preferences.specialty);
      score += similarity * specialtyWeight;
    }
    maxScore += specialtyWeight;

    // 3. 가격 적정성 (20%)
    const priceWeight = 20;
    if (preferences.maxHourlyRate) {
      if (tutor.hourly_rate <= preferences.maxHourlyRate) {
        // 가격이 예산 내에 있으면 점수 부여 (저렴할수록 높은 점수)
        const priceRatio = tutor.hourly_rate / preferences.maxHourlyRate;
        score += (1 - priceRatio * 0.5) * priceWeight;
      }
    } else {
      score += priceWeight * 0.7; // 가격 선호도 없으면 중간 점수
    }
    maxScore += priceWeight;

    // 4. 언어 일치 (10%)
    const languageWeight = 10;
    if (preferences.preferredLanguages.length > 0) {
      const tutorLanguages = tutor.languages_spoken || [];
      const commonLanguages = preferences.preferredLanguages.filter(lang => 
        tutorLanguages.some(tutorLang => 
          tutorLang.toLowerCase().includes(lang.toLowerCase())
        )
      );
      const languageMatch = commonLanguages.length / preferences.preferredLanguages.length;
      score += languageMatch * languageWeight;
    } else {
      score += languageWeight * 0.8; // 언어 선호도 없으면 높은 점수
    }
    maxScore += languageWeight;

    // 5. 인증 여부 보너스 (추가 점수)
    if (tutor.is_verified) {
      score += 5;
    }

    // 6. 경험 보너스 (추가 점수)
    const experienceBonus = Math.min(tutor.years_experience * 0.5, 5);
    score += experienceBonus;

    // 7. 세션 수 보너스 (신뢰도)
    const sessionBonus = Math.min(tutor.total_sessions * 0.1, 3);
    score += sessionBonus;

    // 정규화된 점수 (0-100)
    return Math.round((score / maxScore) * 100);
  }

  /**
   * 문자열 유사도 계산 (간단한 포함 관계 기반)
   */
  static calculateStringSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.7;
    
    // 공통 단어 찾기
    const words1 = s1.split(' ');
    const words2 = s2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    
    if (commonWords.length > 0) {
      return commonWords.length / Math.max(words1.length, words2.length);
    }
    
    return 0;
  }

  /**
   * 시간대별 필터링
   */
  static async filterByTimeSlots(tutors, timeSlots) {
    const availableTutors = [];
    
    for (const tutor of tutors) {
      const availability = tutor.available_times || {};
      let hasMatchingSlot = false;
      
      for (const slot of timeSlots) {
        const daySlots = availability[slot.dayOfWeek] || [];
        if (daySlots.includes(slot.time)) {
          hasMatchingSlot = true;
          break;
        }
      }
      
      if (hasMatchingSlot) {
        availableTutors.push(tutor);
      }
    }
    
    return availableTutors;
  }

  /**
   * 추천 튜터 (간단한 버전)
   */
  static async getRecommended(userId, limit = 5) {
    try {
      // 기본적으로 높은 평점과 많은 세션 수를 가진 튜터 추천
      return await Tutor.findAll({
        minRating: 4.0,
        sortBy: 'rating',
        limit,
        isVerified: true
      });
    } catch (error) {
      throw new Error(`Error getting recommended tutors: ${error.message}`);
    }
  }

  /**
   * 특정 시간에 즉시 예약 가능한 튜터 찾기
   */
  static async findAvailableNow(preferences = {}) {
    try {
      const now = new Date();
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const currentHour = now.getHours();
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:00`;

      return await Tutor.searchByAvailability(dayOfWeek, timeSlot);
    } catch (error) {
      throw new Error(`Error finding available tutors: ${error.message}`);
    }
  }
}

module.exports = MatchingService;