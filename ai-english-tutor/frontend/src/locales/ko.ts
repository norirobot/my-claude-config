// 한국어 번역 리소스
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
    
    featuresTitle: '왜 AI 영어 튜터인가요?',
    featuresSubtitle: '기존 영어 학습의 한계를 완전히 뛰어넘는 혁신적인 방법',
    
    features: {
      aiTutor: {
        title: 'AI 디지털 트윈 튜터',
        description: '실제 튜터의 말투와 성격을 학습한 AI가 먼저 연습 상대가 됩니다'
      },
      pronunciation: {
        title: '발음 분석 & 교정',
        description: '음성 인식 기술로 발음을 정확하게 분석하고 즉시 피드백을 제공합니다'
      },
      realTutors: {
        title: '한국 거주 외국인 튜터',
        description: '시차 없이 실시간으로 한국 거주 원어민 튜터와 대화할 수 있습니다'
      }
    },

    tutorsTitle: '검증된 한국 거주 튜터들',
    tutorsSubtitle: '시차 걱정 없이 언제든 만날 수 있는 원어민 튜터들',
    
    ctaTitle: '지금 바로 시작하세요!',
    ctaDescription: '첫 AI 대화는 무료입니다.\n5분만 투자해서 영어 실력의 변화를 경험해보세요.',
    ctaButton: '무료 체험 시작하기',
    ctaButtonAuth: '지금 시작하기'
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
    todayGoals: '오늘의 목표',
    upcomingLessons: '다가오는 레슨',
    confirmed: '확정됨',
    pending: '대기 중',
    tutor: '튜터',
    goals: {
      aiChat: 'AI와 10분 대화하기',
      pronunciation: '발음 연습 완료하기',
      vocabulary: '새 단어 5개 학습하기',
      bookTutor: '실제 튜터와 세션 예약하기'
    },
    recentChatTitles: {
      businessMeeting: '비즈니스 미팅 연습',
      dailyRoutine: '일상 루틴 대화',
      travelHotel: '여행 영어 - 호텔 체크인'
    },
    upcomingLessonSubjects: {
      businessPresentation: '비즈니스 프레젠테이션',
      conversationPractice: '회화 연습',
      pronunciationCorrection: '발음 교정'
    }
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
    businessEnglish: '비즈니스 영어',
    americanAccent: '미국식 발음',
    loading: '답변 중...',
    inputPlaceholder: '영어로 메시지를 입력하거나 음성으로 녹음하세요...',
    recording: '음성 녹음 중... (탭해서 중지)',
    tip: '💡 팁: 자연스러운 대화를 위해 완전한 문장보다는 실제 대화처럼 말해보세요',
    scores: {
      perfect: '완벽!',
      excellent: '우수',
      good: '좋음',
      needsPractice: '연습 필요'
    }
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
    sortedBy: '🟢 온라인 • 평점 높은 순으로 정렬됨',
    completedLessons: '완료 레슨',
    responseTime: '응답 시간',
    perHour: '/시간',
    message: '메시지',
    book: '예약',
    reviews: '개 리뷰',
    selfIntroduction: '자기소개',
    specialties: '전문 분야',
    languages: '구사 언어',
    lessonInfo: '레슨 정보',
    hourlyFee: '시간당 요금',
    completedLessonsCount: '완료된 레슨',
    availableHours: '수업 가능 시간',
    close: '닫기',
    sendMessageButton: '메시지 보내기',
    bookLessonButton: '레슨 예약하기',
    filters: {
      all: '전체',
      available: '이용 가능',
      country: '국가',
      specialty: '전문 분야',
      rating: '평점',
      priceRange: '가격대',
      lowPrice: '~30,000원',
      midPrice: '30,000~40,000원',
      highPrice: '40,000원~'
    },
    specialties: {
      business: '비즈니스 영어',
      conversation: '일상 회화',
      pronunciation: '발음 교정',
      grammar: '문법',
      writing: '영작문',
      exam: '시험 준비',
      toeic: 'TOEIC',
      toefl: 'TOEFL',
      ielts: 'IELTS',
      interview: '면접 준비',
      presentation: '프레젠테이션',
      british: '영국식 발음',
      travel: '여행 영어',
      culture: '호주 문화',
      academic: '학술 영어',
      studyAbroad: '유학 준비',
      finance: '금융 영어',
      mba: 'MBA 준비',
      kids: '어린이 영어',
      beginner: '초급 회화',
      games: '게임 학습'
    },
    countries: {
      usa: '미국',
      uk: '영국', 
      canada: '캐나다',
      australia: '호주'
    },
    languages: {
      englishNative: '영어 (원어민)',
      koreanBeginner: '한국어 (초급)',
      koreanIntermediate: '한국어 (중급)',
      koreanAdvanced: '한국어 (상급)',
      frenchNative: '불어 (원어민)',
      chineseNative: '중국어 (원어민)',
      spanishNative: '스페인어 (원어민)'
    },
    availability: {
      weekdayMorning: '평일 오전',
      weekdayAfternoon: '평일 오후', 
      weekdayEvening: '평일 저녁',
      weekend: '주말',
      saturday: '토요일',
      sunday: '일요일',
      saturdayMorning: '토요일 오전'
    },
    responseTime: {
      within1hour: '보통 1시간 내',
      within30min: '보통 30분 내',
      within2hours: '보통 2시간 내',
      within3hours: '보통 3시간 내',
      within4hours: '보통 4시간 내'
    }
  },

  // 프로필
  profile: {
    title: '내 프로필',
    editProfile: '프로필 편집',
    personalInfo: '개인 정보',
    learningGoals: '학습 목표',
    preferences: '선호 설정',
    achievements: '성취',
    statistics: '통계',
    accountSettings: '계정 설정',
    changePassword: '비밀번호 변경',
    deleteAccount: '계정 삭제'
  },

  // 포인트
  points: {
    title: '포인트',
    currentPoints: '현재 포인트',
    pointHistory: '포인트 내역',
    buyPoints: '포인트 구매',
    earned: '획득',
    spent: '사용',
    expired: '만료',
    aiChatCost: 'AI 채팅 비용',
    tutorSessionCost: '튜터 세션 비용',
    packages: {
      basic: '기본 패키지',
      premium: '프리미엄 패키지',
      ultimate: '얼티밋 패키지'
    }
  },

  // 설정
  settings: {
    title: '설정',
    general: '일반',
    language: '언어',
    notifications: '알림',
    privacy: '개인정보',
    audio: '오디오',
    appearance: '테마',
    about: '정보',
    version: '버전',
    support: '지원',
    feedback: '피드백',
    languageSelection: '언어 선택',
    korean: '한국어',
    english: 'English'
  },

  // 학습 기록
  learningRecords: {
    title: '학습 기록',
    subtitle: '나의 영어 학습 여정을 한눈에 확인하세요',
    overview: '개요',
    detailed: '상세',
    calendar: '달력',
    progress: '진행률',
    achievements: '성취',
    totalTime: '총 학습 시간',
    totalSessions: '총 학습 세션',
    sessionsCompleted: '완료된 세션',
    averageScore: '평균 점수',
    improvementRate: '향상률',
    weeklyGoal: '주간 목표',
    monthlyGoal: '월간 목표',
    loading: '학습 기록 로딩 중...',
    export: '내보내기',
    allRecords: '전체 기록',
    performanceAnalysis: '성과 분석',
    detailedStats: '상세 통계',
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
    improvementAreas: '집중 개선 영역',
    completionRate: '학습 완료율',
    completionRateDesc: '를 성공적으로 완료했어요!',
    detailedStatsDesc: '상세 통계 기능은 곧 출시될 예정입니다. 월별 진척도, 학습 패턴 분석, 개인화된 추천 등을 제공할 예정이에요!',
    hours: '시간',
    minutes: '분',
    points: '점',
    topics: {
      dailyConversation: '일상 대화',
      hobby: '취미', 
      food: '음식',
      businessEnglish: '비즈니스 영어',
      presentation: '프레젠테이션',
      numbers: '숫자 표현',
      pronunciation: '발음',
      thSound: 'TH 사운드',
      travelEnglish: '여행 영어',
      airport: '공항',
      checkin: '체크인',
      culture: '문화',
      tradition: '전통',
      festival: '축제',
      grammar: '복잡한 문법',
      idioms: '관용어',
      fastSpeech: '빠른 속도 대화'
    },
    chatTitles: {
      dailyChat: 'Jennifer와 일상 대화',
      businessPresentation: '비즈니스 영어 - 프레젠테이션',
      pronunciationTH: '발음 교정 - TH 발음',
      travelAirport: '여행 영어 - 공항에서',
      cultureChat: 'Jennifer와 문화 이야기'
    }
  }
}

export default ko