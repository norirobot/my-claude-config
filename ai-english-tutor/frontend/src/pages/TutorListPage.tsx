import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  VideoCall as VideoCallIcon,
  Chat as ChatIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material'
import { useLanguage } from '../contexts/LanguageContext'

interface Tutor {
  id: string
  name: string
  country: string
  flag: string
  avatar: string
  rating: number
  reviewCount: number
  specialty: string[]
  languages: string[]
  hourlyRate: number
  experience: number
  description: string
  availability: string[]
  isOnline: boolean
  responseTime: string
  completedLessons: number
  favorited: boolean
}

const TutorListPage: React.FC = () => {
  const { t, language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [tutors, setTutors] = useState<Tutor[]>([])

  // 튜터 데이터 생성 함수
  const generateTutorData = () => {
    return [
      {
        id: '1',
        name: 'Jennifer Williams',
        country: t.tutors.countries.usa,
        flag: '🇺🇸',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
        rating: 4.9,
        reviewCount: 156,
        specialty: [t.tutors.specialties.business, t.tutors.specialties.pronunciation, t.tutors.specialties.toeic],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.koreanIntermediate],
        hourlyRate: 35000,
        experience: 5,
        description: language === 'ko' ? '안녕하세요! 서울에서 5년째 거주하며 삼성전자에서 근무했습니다. 한국 직장 문화를 이해하며 실무 영어를 가르쳐드려요. 특히 회의, 프레젠테이션, 이메일 작성에 도움드릴 수 있습니다.' : 'Hello! I\'ve been living in Seoul for 5 years and worked at Samsung Electronics. I understand Korean workplace culture and teach practical business English. I can especially help with meetings, presentations, and email writing.',
        availability: [t.tutors.availability.weekdayMorning, t.tutors.availability.weekdayAfternoon, t.tutors.availability.saturday],
        isOnline: true,
        responseTime: t.tutors.responseTime.within1hour,
        completedLessons: 892,
        favorited: false
      },
      {
        id: '2', 
        name: 'David Thompson',
        country: t.tutors.countries.uk,
        flag: '🇬🇧',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        rating: 4.8,
        reviewCount: 203,
        specialty: [t.tutors.specialties.conversation, t.tutors.specialties.british, t.tutors.specialties.ielts],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.koreanBeginner],
        hourlyRate: 32000,
        experience: 3,
        description: language === 'ko' ? '부산에서 3년째 영어 강사로 일하고 있습니다. 정통 영국식 발음과 문화를 전해드려요. 한국 학생들의 어려움을 잘 알고 있어 차근차근 가르쳐드립니다!' : 'I\'ve been working as an English teacher in Busan for 3 years. I teach authentic British pronunciation and culture. I understand Korean students\' difficulties and teach step by step!',
        availability: [t.tutors.availability.weekdayEvening, t.tutors.availability.weekend],
        isOnline: false,
        responseTime: t.tutors.responseTime.within3hours,
        completedLessons: 654,
        favorited: true
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        country: t.tutors.countries.canada,
        flag: '🇨🇦',
        avatar: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=400&h=400&fit=crop&crop=face',
        rating: 4.9,
        reviewCount: 89,
        specialty: [t.tutors.specialties.pronunciation, t.tutors.specialties.interview, t.tutors.specialties.presentation],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.frenchNative, t.tutors.languages.koreanIntermediate],
        hourlyRate: 38000,
        experience: 7,
        description: language === 'ko' ? '대구에서 7년째 거주하며 현지 대학에서 강의하고 있습니다. 한국 취업 시장을 잘 알아 면접 준비와 이력서 작성도 도와드려요. 발음 교정은 제 특기입니다!' : 'I\'ve been living in Daegu for 7 years and teaching at a local university. I know the Korean job market well and can help with interview preparation and resume writing. Pronunciation correction is my specialty!',
        availability: [t.tutors.availability.weekdayMorning, t.tutors.availability.weekdayEvening],
        isOnline: true,
        responseTime: t.tutors.responseTime.within30min,
        completedLessons: 1247,
        favorited: false
      },
      {
        id: '4',
        name: 'Michael Chen',
        country: t.tutors.countries.australia,
        flag: '🇦🇺',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        rating: 4.7,
        reviewCount: 145,
        specialty: [t.tutors.specialties.conversation, t.tutors.specialties.travel, t.tutors.specialties.culture],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.chineseNative, t.tutors.languages.koreanAdvanced],
        hourlyRate: 30000,
        experience: 4,
        description: language === 'ko' ? '인천에서 4년째 거주하며 IT 회사에서 일하고 있습니다. 한국어를 유창하게 구사해서 초보자도 편안하게 수업받을 수 있어요. 호주 생활 경험도 나눠드려요!' : 'I\'ve been living in Incheon for 4 years working at an IT company. I speak Korean fluently so beginners can feel comfortable in class. I can also share my Australian life experiences!',
        availability: [t.tutors.availability.weekdayAfternoon, t.tutors.availability.weekdayEvening, t.tutors.availability.sunday],
        isOnline: true,
        responseTime: t.tutors.responseTime.within2hours,
        completedLessons: 567,
        favorited: false
      },
      {
        id: '5',
        name: 'Emma Rodriguez',
        country: t.tutors.countries.usa,
        flag: '🇺🇸',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        rating: 4.8,
        reviewCount: 98,
        specialty: [t.tutors.specialties.toefl, t.tutors.specialties.academic, t.tutors.specialties.studyAbroad],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.spanishNative, t.tutors.languages.koreanIntermediate],
        hourlyRate: 42000,
        experience: 6,
        description: language === 'ko' ? '서울대학교에서 교환 학생으로 와서 한국이 너무 좋아 6년째 거주 중입니다. 미국 대학 진학과 TOEFL 준비 전문가예요. 유학 생활의 모든 것을 알려드릴게요!' : 'I came to Seoul National University as an exchange student and loved Korea so much that I\'ve been living here for 6 years. I\'m an expert in US college admission and TOEFL preparation. I\'ll tell you everything about studying abroad!',
        availability: [t.tutors.availability.weekdayMorning, t.tutors.availability.weekend],
        isOnline: true,
        responseTime: t.tutors.responseTime.within1hour,
        completedLessons: 723,
        favorited: false
      },
      {
        id: '6',
        name: 'James Wilson',
        country: t.tutors.countries.uk,
        flag: '🇬🇧',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        rating: 4.9,
        reviewCount: 234,
        specialty: [t.tutors.specialties.business, t.tutors.specialties.finance, t.tutors.specialties.mba],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.koreanIntermediate],
        hourlyRate: 45000,
        experience: 8,
        description: language === 'ko' ? '런던에서 투자은행에서 일하다가 한국의 핀테크 회사로 이직해 8년째 강남에서 살고 있습니다. 금융, 비즈니스 영어와 MBA 준비에 특화되어 있어요.' : 'I worked at an investment bank in London and then moved to a Korean fintech company. I\'ve been living in Gangnam for 8 years. I specialize in financial, business English and MBA preparation.',
        availability: [t.tutors.availability.weekdayEvening, t.tutors.availability.saturdayMorning],
        isOnline: false,
        responseTime: t.tutors.responseTime.within4hours,
        completedLessons: 1456,
        favorited: true
      },
      {
        id: '7',
        name: 'Lisa Park',
        country: t.tutors.countries.canada,
        flag: '🇨🇦',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
        rating: 4.8,
        reviewCount: 167,
        specialty: [t.tutors.specialties.kids, t.tutors.specialties.beginner, t.tutors.specialties.games],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.koreanAdvanced],
        hourlyRate: 28000,
        experience: 3,
        description: language === 'ko' ? '한국인 남편과 결혼해서 제주도에서 3년째 살고 있어요! 아이들을 정말 좋아해서 어린이 영어 교육에 특화되어 있습니다. 재미있는 게임과 활동으로 영어를 가르쳐드려요.' : 'I married a Korean husband and have been living in Jeju Island for 3 years! I really love children and specialize in kids\' English education. I teach English through fun games and activities.',
        availability: [t.tutors.availability.weekdayAfternoon, t.tutors.availability.weekend],
        isOnline: true,
        responseTime: t.tutors.responseTime.within1hour,
        completedLessons: 389,
        favorited: false
      }
    ]
  }

  // 언어가 변경될 때마다 튜터 데이터 재생성
  useEffect(() => {
    setTutors(generateTutorData())
  }, [language, t])

  const specialties = [
    t.tutors.specialties.business, t.tutors.specialties.conversation, t.tutors.specialties.pronunciation, 
    t.tutors.specialties.toeic, t.tutors.specialties.ielts, t.tutors.specialties.toefl,
    t.tutors.specialties.interview, t.tutors.specialties.presentation, t.tutors.specialties.academic, 
    t.tutors.specialties.travel, t.tutors.specialties.kids, t.tutors.specialties.finance, 
    t.tutors.specialties.mba, t.tutors.specialties.games
  ]
  const countries = [t.tutors.countries.usa, t.tutors.countries.uk, t.tutors.countries.canada, t.tutors.countries.australia]

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         tutor.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecialty = !selectedSpecialty || tutor.specialty.includes(selectedSpecialty)
    const matchesCountry = !selectedCountry || tutor.country === selectedCountry
    
    // 가격 필터링 로직
    const matchesPrice = () => {
      if (!priceRange) return true
      switch (priceRange) {
        case 'low': return tutor.hourlyRate <= 30000
        case 'mid': return tutor.hourlyRate > 30000 && tutor.hourlyRate <= 40000
        case 'high': return tutor.hourlyRate > 40000
        default: return true
      }
    }
    
    return matchesSearch && matchesSpecialty && matchesCountry && matchesPrice()
  })

  // 추천 알고리즘: 평점, 응답 시간, 온라인 상태에 따른 정렬
  const sortedTutors = filteredTutors.sort((a, b) => {
    // 온라인 상태 우선
    if (a.isOnline && !b.isOnline) return -1
    if (!a.isOnline && b.isOnline) return 1
    
    // 평점 높은 순
    if (a.rating !== b.rating) return b.rating - a.rating
    
    // 리뷰 수 많은 순
    return b.reviewCount - a.reviewCount
  })

  const handleTutorClick = (tutor: Tutor) => {
    setSelectedTutor(tutor)
    setDialogOpen(true)
  }

  const handleFavoriteToggle = (tutorId: string) => {
    setTutors(prev => prev.map(tutor => 
      tutor.id === tutorId 
        ? { ...tutor, favorited: !tutor.favorited }
        : tutor
    ))
  }

  const handleBookLesson = (tutor: Tutor) => {
    // TODO: 레슨 예약 로직
    console.log('레슨 예약:', tutor.name)
    setDialogOpen(false)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedSpecialty('')
    setSelectedCountry('')
    setPriceRange('')
  }

  return (
    <Box>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          {t.tutors.title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t.tutors.subtitle}
        </Typography>
      </Box>

      {/* 검색 및 필터 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder={t.tutors.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t.tutors.filters.specialty}</InputLabel>
                <Select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  label={t.tutors.filters.specialty}
                >
                  <MenuItem value="">{t.tutors.filters.all}</MenuItem>
                  {specialties.map(specialty => (
                    <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t.tutors.filters.country}</InputLabel>
                <Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  label={t.tutors.filters.country}
                >
                  <MenuItem value="">{t.tutors.filters.all}</MenuItem>
                  {countries.map(country => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t.tutors.filters.priceRange}</InputLabel>
                <Select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  label={t.tutors.filters.priceRange}
                >
                  <MenuItem value="">{t.tutors.filters.all}</MenuItem>
                  <MenuItem value="low">{t.tutors.filters.lowPrice}</MenuItem>
                  <MenuItem value="mid">{t.tutors.filters.midPrice}</MenuItem>
                  <MenuItem value="high">{t.tutors.filters.highPrice}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleResetFilters}
                sx={{ height: 56 }}
              >
                {t.tutors.resetFilters}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 검색 결과 헤더 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {sortedTutors.length}{t.tutors.resultsFound}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t.tutors.sortedBy}
        </Typography>
      </Box>

      {/* 튜터 목록 */}
      <Grid container spacing={3}>
        {sortedTutors.map((tutor) => (
          <Grid item xs={12} md={6} lg={4} key={tutor.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleTutorClick(tutor)}
            >
              <CardContent>
                {/* 튜터 기본 정보 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={tutor.avatar}
                    alt={tutor.name}
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: 'primary.main',
                      mr: 2,
                      fontSize: '1.5rem'
                    }}
                  >
                    {tutor.name[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight="600">
                        {tutor.name}
                      </Typography>
                      <Typography variant="body2">
                        {tutor.flag} {tutor.country}
                      </Typography>
                      {tutor.isOnline && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'success.main'
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Rating value={tutor.rating} readOnly size="small" precision={0.1} />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {tutor.rating} ({tutor.reviewCount}{t.tutors.reviews})
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFavoriteToggle(tutor.id)
                    }}
                    color={tutor.favorited ? 'error' : 'default'}
                  >
                    {tutor.favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>

                {/* 전문 분야 */}
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {tutor.specialty.slice(0, 3).map((spec) => (
                      <Chip
                        key={spec}
                        label={spec}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {tutor.specialty.length > 3 && (
                      <Chip
                        label={`+${tutor.specialty.length - 3}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>

                {/* 간단한 정보 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {tutor.description}
                  </Typography>
                </Box>

                {/* 통계 정보 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {t.tutors.experience}
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {tutor.experience}{t.tutors.years}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {t.tutors.completedLessons}
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {tutor.completedLessons}{language === 'ko' ? '회' : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {t.tutors.responseTime}
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {language === 'ko' ? tutor.responseTime : tutor.responseTime.replace('보통', 'Usually').replace('시간 내', ' hours').replace('분 내', ' min')}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* 가격 및 액션 버튼 */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="700" color="primary.main">
                      ₩{tutor.hourlyRate.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.tutors.perHour}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ChatIcon />}
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('메시지 보내기:', tutor.name)
                      }}
                    >
                      {t.tutors.message}
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VideoCallIcon />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBookLesson(tutor)
                      }}
                    >
                      {t.tutors.book}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 튜터 상세 다이얼로그 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTutor && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedTutor.avatar}
                  alt={selectedTutor.name}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'primary.main',
                    fontSize: '1.75rem'
                  }}
                >
                  {selectedTutor.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="600">
                    {selectedTutor.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedTutor.flag} {selectedTutor.country} • {selectedTutor.experience}{t.tutors.years} {t.tutors.experience}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Rating value={selectedTutor.rating} readOnly size="small" precision={0.1} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {selectedTutor.rating} ({selectedTutor.reviewCount}{t.tutors.reviews})
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t.tutors.selfIntroduction}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {selectedTutor.description}
                  </Typography>

                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t.tutors.specialties}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                    {selectedTutor.specialty.map((spec) => (
                      <Chip key={spec} label={spec} color="primary" />
                    ))}
                  </Stack>

                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t.tutors.languages}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                    {selectedTutor.languages.map((lang) => (
                      <Chip key={lang} label={lang} variant="outlined" />
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {t.tutors.lessonInfo}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">{t.tutors.hourlyFee}</Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="600">
                          ₩{selectedTutor.hourlyRate.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">{t.tutors.completedLessonsCount}</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {selectedTutor.completedLessons}{language === 'ko' ? '회' : ''}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">{t.tutors.responseTime}</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {language === 'ko' ? selectedTutor.responseTime : selectedTutor.responseTime.replace('보통', 'Usually').replace('시간 내', ' hours').replace('분 내', ' min')}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>{t.tutors.availableHours}:</strong>
                      </Typography>
                      {selectedTutor.availability.map((time) => (
                        <Chip
                          key={time}
                          label={time}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setDialogOpen(false)}>
                {t.tutors.close}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ChatIcon />}
                sx={{ mr: 1 }}
              >
                {t.tutors.sendMessageButton}
              </Button>
              <Button
                variant="contained"
                startIcon={<ScheduleIcon />}
                onClick={() => handleBookLesson(selectedTutor)}
              >
                {t.tutors.bookLessonButton}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default TutorListPage