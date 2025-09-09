// 한국어 번역 리소스 (깨끗한 버전)
export const ko = {
  // 공통
  common: {
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    success: '성공했습니다',
    cancel: '취소',
    confirm: '확인',
    save: '저장',
    edit: '편집',
    delete: '삭제',
    search: '검색',
    close: '닫기',
    back: '뒤로',
    next: '다음',
    previous: '이전',
  },

  // 네비게이션 & 레이아웃
  nav: {
    home: '홈',
    dashboard: '대시보드',
    chat: 'AI 채팅',
    tutors: '튜터 목록',
    profile: '내 프로필',
    points: '포인트',
    settings: '설정',
    learningRecords: '학습 기록',
    logout: '로그아웃',
    notifications: '알림',
    homeTitle: 'AI 영어 튜터 - 홈으로'
  },

  // 홈페이지
  home: {
    heroTitle: 'AI로 먼저 연습하고',
    heroSubtitle: '실제 튜터',
    heroTitleEnd: '와 대화하세요',
    heroDescription: '세계 유일의 디지털 트윈 영어 학습법으로 외국인과의 대화 두려움을 완전히 극복하세요',
    startButton: '무료로 시작하기',
    dashboardButton: '대시보드로 가기',
    demoButton: '데모 보기',
    
    // 홈페이지 기능 섹션
    featuresTitle: '핵심 기능',
    featuresSubtitle: 'AI와 실제 튜터를 결합한 혁신적인 학습 경험',
    features: {
      aiTutor: {
        title: 'AI 디지털 트윈 튜터',
        description: '실제 튜터와 동일한 AI로 먼저 연습하고 자신감을 기르세요'
      },
      pronunciation: {
        title: '발음 교정 시스템',
        description: '실시간 발음 분석으로 정확한 발음을 배우세요'
      },
      realTutors: {
        title: '한국 거주 원어민 튜터',
        description: '시차 없이 언제든 한국에 거주하는 원어민과 대화하세요'
      }
    },
    
    // 튜터 소개 섹션
    tutorsTitle: '우수한 튜터진',
    tutorsSubtitle: '검증된 한국 거주 원어민 튜터들을 만나보세요',
    
    // CTA 섹션
    ctaTitle: '지금 바로 시작하세요!',
    ctaDescription: '무료 체험으로 AI 튜터와 대화해보고\n실제 튜터 매칭까지 경험해보세요',
    ctaButton: '무료 체험 시작',
    ctaButtonAuth: '대시보드로 이동'
  },

  // 로그인/인증
  auth: {
    login: '로그인',
    register: '회원가입',
    email: '이메일',
    password: '비밀번호',
    confirmPassword: '비밀번호 확인',
    name: '이름',
    forgotPassword: '비밀번호를 잊으셨나요?',
    noAccount: '계정이 없으신가요?',
    hasAccount: '이미 계정이 있으신가요?',
    loginButton: '로그인',
    registerButton: '회원가입',
    loginWithGoogle: 'Google로 로그인',
    loginWithKakao: 'Kakao로 로그인'
  },

  // 대시보드
  dashboard: {
    welcome: '환영합니다',
    todayLearning: '오늘의 학습',
    recentChats: '최근 채팅',
    learningStats: '학습 통계',
    quickStart: '빠른 시작',
    continueLearning: '학습 계속하기',
    viewAll: '전체 보기',
    aiChatSession: 'AI 채팅 세션',
    tutorSession: '튜터 세션',
    practiceTime: '연습 시간',
    wordsLearned: '학습한 단어',
    grammarPoints: '문법 포인트',
    pronunciationScore: '발음 점수',
    progress: '진행률',
    sessionsCompleted: '세션 완료',
    averageScore: '평균 점수',
    weeklyGoal: '주간 목표',
    learningStreak: '연속 학습',
    days: '일',
    
    // 대시보드 최근 활동 제목들
    recentChatTitles: {
      businessMeeting: '비즈니스 미팅 연습',
      jobInterview: '취업 면접 준비',
      dailyConversation: '일상 대화',
      presentation: '프레젠테이션 준비',
      phoneCall: '전화 영어'
    },
    
    // 대시보드 통계 및 성취
    stats: {
      level: '레벨',
      overallScore: '종합 점수',
      progressPercentage: '진행률',
      totalSessions: '총 세션',
      currentStreak: '현재 연속',
      longestStreak: '최장 연속',
      completedSessions: '완료 세션',
      targetSessions: '목표 세션',
      completedMinutes: '완료 시간',
      targetMinutes: '목표 시간',
      activityScore: '활동 점수',
      achievements: '업적',
      growthRate: '성장률',
      efficiencyScore: '효율성 점수',
      consistencyScore: '일관성 점수'
    },
    
    // 대시보드 목표 관련
    goals: {
      aiChat: 'AI와 대화하기',
      pronunciation: '발음 연습하기',
      vocabulary: '단어 학습하기',
      bookTutor: '튜터 예약하기'
    },
    
    // 다가오는 레슨 주제
    upcomingLessonSubjects: {
      conversationPractice: '회화 연습',
      pronunciationCorrection: '발음 교정',
      businessEnglish: '비즈니스 영어',
      grammarReview: '문법 복습'
    },
    
    // 기타 대시보드 용어
    todayGoals: '오늘의 목표',
    upcomingLessons: '예정된 레슨',
    tutor: '튜터',
    confirmed: '확정됨',
    pending: '대기 중'
  },

  // 채팅
  chat: {
    title: 'AI 채팅',
    startConversation: '대화 시작하기',
    typeMessage: '메시지를 입력하세요...',
    send: '전송',
    voiceInput: '음성 입력',
    stopRecording: '녹음 중지',
    aiThinking: 'AI가 생각 중...',
    connectionError: '연결 오류가 발생했습니다',
    reconnecting: '다시 연결 중...',
    newChat: '새 채팅',
    chatHistory: '채팅 기록',
    aiTutor: 'AI 튜터',
    online: '온라인',
    
    // 점수 관련
    scores: {
      perfect: '완벽해요!',
      excellent: '훌륭해요!',
      good: '잘했어요!',
      needsPractice: '연습이 필요해요'
    },
    
    // AI 튜터 정보
    businessEnglish: '비즈니스 영어',
    americanAccent: '미국식 발음'
  },

  // 튜터 목록
  tutors: {
    title: '튜터 찾기 👨‍🏫',
    subtitle: '한국 거주 원어민 튜터와 실시간으로 만나보세요',
    available: '이용 가능',
    busy: '통화 중',
    offline: '오프라인',
    rating: '평점',
    specialty: '전문 분야',
    experience: '경험',
    years: '년',
    bookSession: '세션 예약',
    viewProfile: '프로필 보기',
    searchPlaceholder: '튜터 이름이나 전문 분야로 검색',
    resetFilters: '필터 초기화',
    resultsFound: '명의 튜터를 찾았습니다',
    completedLessons: '완료 레슨',
    responseTime: '응답 시간',
    perHour: '/시간',
    message: '메시지',
    book: '예약',
    reviews: '개 리뷰',
    selfIntroduction: '자기소개',
    hourlyFee: '시간당 요금',
    completedLessonsCount: '완료된 레슨',
    availableHours: '수업 가능 시간',
    sendMessageButton: '메시지 보내기',
    bookLessonButton: '레슨 예약하기',
    filters: {
      all: '전체',
      available: '이용 가능',
      country: '국가',
      specialty: '전문 분야',
      rating: '평점',
      priceRange: '가격대'
    },
    countries: {
      usa: '미국',
      uk: '영국', 
      canada: '캐나다',
      australia: '호주'
    },
    
    // 튜터 전문분야 (간단버전)
    specialties: {
      business: '비즈니스 영어',
      conversation: '일상 회화',
      pronunciation: '발음 교정',
      toeic: 'TOEIC',
      ielts: 'IELTS',
      toefl: 'TOEFL',
      interview: '면접 준비',
      british: '영국식 발음',
      travel: '여행 영어',
      academic: '학술 영어',
      finance: '금융 영어',
      kids: '어린이 영어',
      beginner: '초급 회화'
    },
    
    // 튜터 언어 (간단버전)
    languages: {
      englishNative: '영어 (원어민)',
      koreanBeginner: '한국어 (초급)',
      koreanIntermediate: '한국어 (중급)',
      koreanAdvanced: '한국어 (상급)'
    },
    
    // 튜터 가능 시간 (간단버전)
    availability: {
      weekdayMorning: '평일 오전',
      weekdayAfternoon: '평일 오후', 
      weekdayEvening: '평일 저녁',
      weekend: '주말'
    },
    
    // 튜터 응답 시간 (간단버전)
    responseTime: {
      within1hour: '보통 1시간 내',
      within30min: '보통 30분 내',
      within2hours: '보통 2시간 내'
    },
    
    tutorSpecialties: {
      business: '비즈니스 영어',
      conversation: '일상 회화',
      pronunciation: '발음 교정',
      toeic: 'TOEIC',
      ielts: 'IELTS',
      toefl: 'TOEFL',
      interview: '면접 준비',
      british: '영국식 발음',
      travel: '여행 영어',
      academic: '학술 영어',
      finance: '금융 영어',
      kids: '어린이 영어',
      beginner: '초급 회화'
    },
    tutorLanguages: {
      englishNative: '영어 (원어민)',
      koreanBeginner: '한국어 (초급)',
      koreanIntermediate: '한국어 (중급)',
      koreanAdvanced: '한국어 (상급)'
    },
    tutorAvailability: {
      weekdayMorning: '평일 오전',
      weekdayAfternoon: '평일 오후', 
      weekdayEvening: '평일 저녁',
      weekend: '주말',
      saturday: '토요일',
      sunday: '일요일'
    },
    tutorResponseTime: {
      within1hour: '보통 1시간 내',
      within30min: '보통 30분 내',
      within2hours: '보통 2시간 내',
      within3hours: '보통 3시간 내',
      within4hours: '보통 4시간 내'
    }
  },

  // 학습기록
  learningRecords: {
    title: '학습 기록',
    subtitle: '나의 영어 학습 여정을 한눈에 확인하세요',
    totalTime: '총 학습 시간',
    totalSessions: '총 학습 세션',
    averageScore: '평균 점수',
    improvementRate: '향상률',
    allRecords: '전체 기록',
    performanceAnalysis: '성과 분석',
    type: '유형',
    all: '전체',
    aiChat: 'AI 대화',
    tutorSession: '튜터 수업',
    pronunciation: '발음 연습',
    lesson: '레슨',
    title_column: '제목',
    date: '날짜',
    time: '시간',
    score: '점수',
    topicsLabel: '주제',
    status: '상태',
    completed: '완료',
    inProgress: '진행중',
    cancelled: '취소',
    favoriteTopics: '선호 주제',
    completionRate: '학습 완료율',
    completionRateDesc: '를 성공적으로 완료했어요!',
    export: '내보내기',
    hours: '시간',
    minutes: '분',
    points: '점'
  }
}

export default ko