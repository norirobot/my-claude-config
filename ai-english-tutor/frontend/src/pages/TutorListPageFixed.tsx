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

const TutorListPageFixed: React.FC = () => {
  const { t, language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tutors, setTutors] = useState<Tutor[]>([])

  // 언어가 변경될 때마다 튜터 데이터 재생성
  useEffect(() => {
    // 튜터 데이터 생성
    const tutorData = [
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
        description: language === 'ko' ? '안녕하세요! 서울에서 5년째 거주하며 삼성전자에서 근무했습니다. 한국 직장 문화를 이해하며 실무 영어를 가르쳐드려요.' : 'Hello! I\'ve been living in Seoul for 5 years and worked at Samsung Electronics.',
        availability: [t.tutors.availability.weekdayMorning, t.tutors.availability.weekdayAfternoon],
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
        description: language === 'ko' ? '부산에서 3년째 영어 강사로 일하고 있습니다.' : 'I\'ve been working as an English teacher in Busan for 3 years.',
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
        specialty: [t.tutors.specialties.pronunciation, t.tutors.specialties.interview],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.koreanIntermediate],
        hourlyRate: 38000,
        experience: 7,
        description: language === 'ko' ? '대구에서 7년째 거주하며 현지 대학에서 강의하고 있습니다.' : 'I\'ve been living in Daegu for 7 years and teaching at a local university.',
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
        specialty: [t.tutors.specialties.conversation, t.tutors.specialties.travel],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.koreanAdvanced],
        hourlyRate: 30000,
        experience: 4,
        description: language === 'ko' ? '인천에서 4년째 거주하며 IT 회사에서 일하고 있습니다.' : 'I\'ve been living in Incheon for 4 years working at an IT company.',
        availability: [t.tutors.availability.weekdayAfternoon, t.tutors.availability.sunday],
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
        specialty: [t.tutors.specialties.toefl, t.tutors.specialties.academic],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.koreanIntermediate],
        hourlyRate: 42000,
        experience: 6,
        description: language === 'ko' ? '서울대학교에서 교환 학생으로 와서 한국이 너무 좋아 6년째 거주 중입니다.' : 'I came to Seoul National University as an exchange student and loved Korea so much.',
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
        specialty: [t.tutors.specialties.business, t.tutors.specialties.finance],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.koreanIntermediate],
        hourlyRate: 45000,
        experience: 8,
        description: language === 'ko' ? '런던에서 투자은행에서 일하다가 한국의 핀테크 회사로 이직해 8년째 강남에서 살고 있습니다.' : 'I worked at an investment bank in London and then moved to a Korean fintech company.',
        availability: [t.tutors.availability.weekdayEvening, t.tutors.availability.saturday],
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
        specialty: [t.tutors.specialties.kids, t.tutors.specialties.beginner],
        languages: [t.tutors.languages.englishNative, t.tutors.languages.koreanAdvanced],
        hourlyRate: 28000,
        experience: 3,
        description: language === 'ko' ? '한국인 남편과 결혼해서 제주도에서 3년째 살고 있어요!' : 'I married a Korean husband and have been living in Jeju Island for 3 years!',
        availability: [t.tutors.availability.weekdayAfternoon, t.tutors.availability.weekend],
        isOnline: true,
        responseTime: t.tutors.responseTime.within1hour,
        completedLessons: 389,
        favorited: false
      }
    ]

    setTutors(tutorData)
  }, [language, t])

  const specialties = [
    t.tutors.specialties.business, 
    t.tutors.specialties.conversation, 
    t.tutors.specialties.pronunciation
  ]
  
  const countries = [
    t.tutors.countries.usa, 
    t.tutors.countries.uk, 
    t.tutors.countries.canada, 
    t.tutors.countries.australia
  ]

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = !selectedSpecialty || tutor.specialty.includes(selectedSpecialty)
    const matchesCountry = !selectedCountry || tutor.country === selectedCountry
    return matchesSearch && matchesSpecialty && matchesCountry
  })

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
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
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
          </Grid>
        </CardContent>
      </Card>

      {/* 튜터 목록 */}
      <Grid container spacing={3}>
        {filteredTutors.map((tutor) => (
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
                      mr: 2
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
                  </Stack>
                </Box>

                {/* 간단한 설명 */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {tutor.description}
                </Typography>

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
                    >
                      {t.tutors.message}
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VideoCallIcon />}
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
    </Box>
  )
}

export default TutorListPageFixed