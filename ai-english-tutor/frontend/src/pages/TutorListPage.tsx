import React, { useState } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // 한국 거주 외국인 튜터 데이터 (실제적 프로필)
  const [tutors, setTutors] = useState<Tutor[]>([
    {
      id: '1',
      name: 'Jennifer Williams',
      country: '미국',
      flag: '🇺🇸',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 156,
      specialty: ['비즈니스 영어', '발음 교정', 'TOEIC'],
      languages: ['영어 (원어민)', '한국어 (중급)'],
      hourlyRate: 35000,
      experience: 5,
      description: '안녕하세요! 서울에서 5년째 거주하며 삼성전자에서 근무했습니다. 한국 직장 문화를 이해하며 실무 영어를 가르쳐드려요. 특히 회의, 프레젠테이션, 이메일 작성에 도움드릴 수 있습니다.',
      availability: ['평일 오전', '평일 오후', '토요일'],
      isOnline: true,
      responseTime: '보통 1시간 내',
      completedLessons: 892,
      favorited: false
    },
    {
      id: '2', 
      name: 'David Thompson',
      country: '영국',
      flag: '🇬🇧',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 203,
      specialty: ['일상 회화', '영국식 발음', 'IELTS'],
      languages: ['영어 (원어민)', '한국어 (초급)'],
      hourlyRate: 32000,
      experience: 3,
      description: '부산에서 3년째 영어 강사로 일하고 있습니다. 정통 영국식 발음과 문화를 전해드려요. 한국 학생들의 어려움을 잘 알고 있어 차근차근 가르쳐드립니다!',
      availability: ['평일 저녁', '주말'],
      isOnline: false,
      responseTime: '보통 3시간 내',
      completedLessons: 654,
      favorited: true
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      country: '캐나다',
      flag: '🇨🇦',
      avatar: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=400&h=400&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 89,
      specialty: ['발음 교정', '면접 준비', '프레젠테이션'],
      languages: ['영어 (원어민)', '불어 (원어민)', '한국어 (중급)'],
      hourlyRate: 38000,
      experience: 7,
      description: '대구에서 7년째 거주하며 현지 대학에서 강의하고 있습니다. 한국 취업 시장을 잘 알아 면접 준비와 이력서 작성도 도와드려요. 발음 교정은 제 특기입니다!',
      availability: ['평일 오전', '평일 저녁'],
      isOnline: true,
      responseTime: '보통 30분 내',
      completedLessons: 1247,
      favorited: false
    },
    {
      id: '4',
      name: 'Michael Chen',
      country: '호주',
      flag: '🇦🇺',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      rating: 4.7,
      reviewCount: 145,
      specialty: ['일상 회화', '여행 영어', '호주 문화'],
      languages: ['영어 (원어민)', '중국어 (원어민)', '한국어 (상급)'],
      hourlyRate: 30000,
      experience: 4,
      description: '인천에서 4년째 거주하며 IT 회사에서 일하고 있습니다. 한국어를 유창하게 구사해서 초보자도 편안하게 수업받을 수 있어요. 호주 생활 경험도 나눠드려요!',
      availability: ['평일 오후', '평일 저녁', '일요일'],
      isOnline: true,
      responseTime: '보통 2시간 내',
      completedLessons: 567,
      favorited: false
    },
    {
      id: '5',
      name: 'Emma Rodriguez',
      country: '미국',
      flag: '🇺🇸',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 98,
      specialty: ['TOEFL', '학술 영어', '유학 준비'],
      languages: ['영어 (원어민)', '스페인어 (원어민)', '한국어 (중급)'],
      hourlyRate: 42000,
      experience: 6,
      description: '서울대학교에서 교환 학생으로 와서 한국이 너무 좋아 6년째 거주 중입니다. 미국 대학 진학과 TOEFL 준비 전문가예요. 유학 생활의 모든 것을 알려드릴게요!',
      availability: ['평일 오전', '주말'],
      isOnline: true,
      responseTime: '보통 1시간 내',
      completedLessons: 723,
      favorited: false
    },
    {
      id: '6',
      name: 'James Wilson',
      country: '영국',
      flag: '🇬🇧',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 234,
      specialty: ['비즈니스 영어', '금융 영어', 'MBA 준비'],
      languages: ['영어 (원어민)', '한국어 (중급)'],
      hourlyRate: 45000,
      experience: 8,
      description: '런던에서 투자은행에서 일하다가 한국의 핀테크 회사로 이직해 8년째 강남에서 살고 있습니다. 금융, 비즈니스 영어와 MBA 준비에 특화되어 있어요.',
      availability: ['평일 저녁', '토요일 오전'],
      isOnline: false,
      responseTime: '보통 4시간 내',
      completedLessons: 1456,
      favorited: true
    },
    {
      id: '7',
      name: 'Lisa Park',
      country: '캐나다',
      flag: '🇨🇦',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 167,
      specialty: ['어린이 영어', '초급 회화', '게임 학습'],
      languages: ['영어 (원어민)', '한국어 (상급)'],
      hourlyRate: 28000,
      experience: 3,
      description: '한국인 남편과 결혼해서 제주도에서 3년째 살고 있어요! 아이들을 정말 좋아해서 어린이 영어 교육에 특화되어 있습니다. 재미있는 게임과 활동으로 영어를 가르쳐드려요.',
      availability: ['평일 오후', '주말'],
      isOnline: true,
      responseTime: '보통 1시간 내',
      completedLessons: 389,
      favorited: false
    },
    {
      id: '8',
      name: 'Robert Smith',
      country: '뉴질랜드',
      flag: '🇳🇿',
      avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
      rating: 4.7,
      reviewCount: 112,
      specialty: ['자연 영어', '환경 영어', '아웃도어 활동'],
      languages: ['영어 (원어민)', '한국어 (중급)'],
      hourlyRate: 33000,
      experience: 5,
      description: '강원도 춘천에서 환경 NGO에서 일하며 5년째 거주하고 있습니다. 자연과 환경에 관심이 많아서 관련 영어 표현들을 많이 가르쳐드려요. 등산하며 영어 배우는 수업도 가능해요!',
      availability: ['주말', '평일 오전'],
      isOnline: true,
      responseTime: '보통 3시간 내',
      completedLessons: 445,
      favorited: false
    }
  ])

  const specialties = [
    '비즈니스 영어', '일상 회화', '발음 교정', 'TOEIC', 'IELTS', 'TOEFL',
    '면접 준비', '프레젠테이션', '학술 영어', '여행 영어', '어린이 영어',
    '금융 영어', 'MBA 준비', '게임 학습', '환경 영어', '유학 준비'
  ]
  const countries = ['미국', '영국', '캐나다', '호주', '뉴질랜드']

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
          튜터 찾기 👨‍🏫
        </Typography>
        <Typography variant="h6" color="text.secondary">
          한국 거주 원어민 튜터와 실시간으로 만나보세요
        </Typography>
      </Box>

      {/* 검색 및 필터 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="튜터 이름이나 전문 분야로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>전문 분야</InputLabel>
                <Select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  label="전문 분야"
                >
                  <MenuItem value="">전체</MenuItem>
                  {specialties.map(specialty => (
                    <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>국가</InputLabel>
                <Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  label="국가"
                >
                  <MenuItem value="">전체</MenuItem>
                  {countries.map(country => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>가격대</InputLabel>
                <Select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  label="가격대"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="low">~30,000원</MenuItem>
                  <MenuItem value="mid">30,000~40,000원</MenuItem>
                  <MenuItem value="high">40,000원~</MenuItem>
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
                필터 초기화
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 검색 결과 헤더 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {sortedTutors.length}명의 튜터를 찾았습니다
        </Typography>
        <Typography variant="body2" color="text.secondary">
          🟢 온라인 • 평점 높은 순으로 정렬됨
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
                        {tutor.rating} ({tutor.reviewCount}개 리뷰)
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
                      경력
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {tutor.experience}년
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      완료 레슨
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {tutor.completedLessons}회
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      응답 시간
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {tutor.responseTime}
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
                      /시간
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
                      메시지
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
                      예약
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
                    {selectedTutor.flag} {selectedTutor.country} • {selectedTutor.experience}년 경력
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Rating value={selectedTutor.rating} readOnly size="small" precision={0.1} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {selectedTutor.rating} ({selectedTutor.reviewCount}개 리뷰)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    자기소개
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {selectedTutor.description}
                  </Typography>

                  <Typography variant="h6" sx={{ mb: 2 }}>
                    전문 분야
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                    {selectedTutor.specialty.map((spec) => (
                      <Chip key={spec} label={spec} color="primary" />
                    ))}
                  </Stack>

                  <Typography variant="h6" sx={{ mb: 2 }}>
                    구사 언어
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
                        레슨 정보
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">시간당 요금</Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="600">
                          ₩{selectedTutor.hourlyRate.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">완료된 레슨</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {selectedTutor.completedLessons}회
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">응답 시간</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {selectedTutor.responseTime}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>수업 가능 시간:</strong>
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
                닫기
              </Button>
              <Button
                variant="outlined"
                startIcon={<ChatIcon />}
                sx={{ mr: 1 }}
              >
                메시지 보내기
              </Button>
              <Button
                variant="contained"
                startIcon={<ScheduleIcon />}
                onClick={() => handleBookLesson(selectedTutor)}
              >
                레슨 예약하기
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default TutorListPage