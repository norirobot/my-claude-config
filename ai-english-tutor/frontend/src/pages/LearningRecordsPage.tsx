import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
  Tabs,
  Tab,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Chat as ChatIcon,
  School as SchoolIcon,
  PlayArrow as PlayIcon,
  Star as StarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material'

interface LearningRecord {
  id: string
  date: string
  type: 'chat' | 'tutor' | 'pronunciation' | 'lesson'
  title: string
  tutor?: string
  duration: number // 분 단위
  score: number
  topics: string[]
  feedback?: string
  status: 'completed' | 'in_progress' | 'cancelled'
}

interface LearningStats {
  totalSessions: number
  totalHours: number
  averageScore: number
  improvementRate: number
  completionRate: number
  favoriteTopics: string[]
  weakAreas: string[]
}

const LearningRecordsPage: React.FC = () => {
  const { t, language } = useLanguage()
  const [currentTab, setCurrentTab] = useState(0)
  const [records, setRecords] = useState<LearningRecord[]>([])
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  // 실제 API에서 데이터 가져오기
  useEffect(() => {
    const fetchLearningRecords = async () => {
      try {
        // Mock 데이터로 임시 구현
        const mockRecords: LearningRecord[] = [
          {
            id: '1',
            date: '2024-01-15T14:30:00Z',
            type: 'chat',
            title: t.learningRecords.chatTitles.dailyChat,
            duration: 25,
            score: 85,
            topics: [t.learningRecords.topics.dailyConversation, t.learningRecords.topics.hobby, t.learningRecords.topics.food],
            feedback: language === 'ko' ? '발음이 많이 개선되었어요! 특히 R 발음이 좋아졌습니다.' : 'Your pronunciation has improved a lot! Especially the R sound.',
            status: 'completed'
          },
          {
            id: '2',
            date: '2024-01-14T10:00:00Z',
            type: 'tutor',
            title: t.learningRecords.chatTitles.businessPresentation,
            tutor: 'David Wilson',
            duration: 50,
            score: 92,
            topics: [t.learningRecords.topics.businessEnglish, t.learningRecords.topics.presentation, t.learningRecords.topics.numbers],
            feedback: language === 'ko' ? '훌륭한 진전을 보이고 있어요. 자신감을 가지세요!' : 'You\'re making great progress. Have confidence!',
            status: 'completed'
          },
          {
            id: '3',
            date: '2024-01-13T16:45:00Z',
            type: 'pronunciation',
            title: t.learningRecords.chatTitles.pronunciationTH,
            duration: 15,
            score: 78,
            topics: [t.learningRecords.topics.pronunciation, t.learningRecords.topics.thSound],
            feedback: language === 'ko' ? '꾸준한 연습이 필요해요. 혀의 위치를 주의하세요.' : 'You need consistent practice. Pay attention to tongue position.',
            status: 'completed'
          },
          {
            id: '4',
            date: '2024-01-12T11:30:00Z',
            type: 'lesson',
            title: t.learningRecords.chatTitles.travelAirport,
            duration: 30,
            score: 88,
            topics: [t.learningRecords.topics.travelEnglish, t.learningRecords.topics.airport, t.learningRecords.topics.checkin],
            status: 'completed'
          },
          {
            id: '5',
            date: '2024-01-11T15:00:00Z',
            type: 'chat',
            title: t.learningRecords.chatTitles.cultureChat,
            duration: 35,
            score: 90,
            topics: [t.learningRecords.topics.culture, t.learningRecords.topics.tradition, t.learningRecords.topics.festival],
            feedback: language === 'ko' ? '문화적 표현을 잘 사용하고 있어요!' : 'You\'re using cultural expressions well!',
            status: 'completed'
          }
        ]

        const mockStats: LearningStats = {
          totalSessions: 48,
          totalHours: 32.5,
          averageScore: 86.2,
          improvementRate: 15.3,
          completionRate: 92.5,
          favoriteTopics: [t.learningRecords.topics.dailyConversation, t.learningRecords.topics.businessEnglish, t.learningRecords.topics.pronunciation],
          weakAreas: [t.learningRecords.topics.grammar, t.learningRecords.topics.idioms, t.learningRecords.topics.fastSpeech]
        }

        setRecords(mockRecords)
        setStats(mockStats)
      } catch (error) {
        console.error('학습 기록 로딩 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLearningRecords()
  }, [language, t])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <ChatIcon />
      case 'tutor':
        return <SchoolIcon />
      case 'pronunciation':
        return <PlayIcon />
      case 'lesson':
        return <AssessmentIcon />
      default:
        return <SchoolIcon />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'chat':
        return 'primary'
      case 'tutor':
        return 'secondary'
      case 'pronunciation':
        return 'success'
      case 'lesson':
        return 'info'
      default:
        return 'default'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'chat':
        return t.learningRecords.aiChat
      case 'tutor':
        return t.learningRecords.tutorSession
      case 'pronunciation':
        return t.learningRecords.pronunciation
      case 'lesson':
        return t.learningRecords.lesson
      default:
        return type
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 80) return 'primary'
    if (score >= 70) return 'warning'
    return 'error'
  }

  const filteredRecords = records.filter(record => {
    if (filterType !== 'all' && record.type !== filterType) return false
    return true
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>{t.learningRecords.loading}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            {t.learningRecords.title} 📚
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t.learningRecords.subtitle}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => console.log('학습 기록 내보내기')}
        >
          {t.learningRecords.export}
        </Button>
      </Box>

      {/* 통계 카드들 */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {stats.totalSessions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.learningRecords.totalSessions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1 }}>
                  {stats.totalHours}{t.learningRecords.hours}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.learningRecords.totalTime}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                  {stats.averageScore.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.learningRecords.averageScore}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                  +{stats.improvementRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.learningRecords.improvementRate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 탭 및 필터 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label={t.learningRecords.allRecords} />
              <Tab label={t.learningRecords.performanceAnalysis} />
              <Tab label={t.learningRecords.detailedStats} />
            </Tabs>
          </Box>

          {currentTab === 0 && (
            <>
              {/* 필터 영역 */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>{t.learningRecords.type}</InputLabel>
                  <Select
                    value={filterType}
                    label={t.learningRecords.type}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="all">{t.learningRecords.all}</MenuItem>
                    <MenuItem value="chat">{t.learningRecords.aiChat}</MenuItem>
                    <MenuItem value="tutor">{t.learningRecords.tutorSession}</MenuItem>
                    <MenuItem value="pronunciation">{t.learningRecords.pronunciation}</MenuItem>
                    <MenuItem value="lesson">{t.learningRecords.lesson}</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* 학습 기록 테이블 */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t.learningRecords.type}</TableCell>
                      <TableCell>{t.learningRecords.title_column}</TableCell>
                      <TableCell>{t.learningRecords.date}</TableCell>
                      <TableCell>{t.learningRecords.time}</TableCell>
                      <TableCell>{t.learningRecords.score}</TableCell>
                      <TableCell>{t.learningRecords.topics}</TableCell>
                      <TableCell>{t.learningRecords.status}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{ 
                                width: 32, 
                                height: 32, 
                                bgcolor: `${getTypeColor(record.type)}.main` 
                              }}
                            >
                              {getTypeIcon(record.type)}
                            </Avatar>
                            <Typography variant="body2">
                              {getTypeLabel(record.type)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {record.title}
                          </Typography>
                          {record.tutor && (
                            <Typography variant="caption" color="text.secondary">
                              {record.tutor}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(record.date).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(record.date).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {record.duration}{t.learningRecords.minutes}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${record.score}${t.learningRecords.points}`}
                            color={getScoreColor(record.score) as any}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {record.topics.slice(0, 2).map((topic, index) => (
                              <Chip
                                key={index}
                                label={topic}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {record.topics.length > 2 && (
                              <Chip
                                label={`+${record.topics.length - 2}`}
                                size="small"
                                variant="outlined"
                                color="default"
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status === 'completed' ? t.learningRecords.completed : 
                                  record.status === 'in_progress' ? t.learningRecords.inProgress : t.learningRecords.cancelled}
                            color={record.status === 'completed' ? 'success' : 
                                   record.status === 'in_progress' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {currentTab === 1 && stats && (
            <Grid container spacing={3}>
              {/* 강점 영역 */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                      🎯 {t.learningRecords.favoriteTopics}
                    </Typography>
                    <Stack spacing={1}>
                      {stats.favoriteTopics.map((topic, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                          <Typography variant="body1">{topic}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* 개선 필요 영역 */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
                      💪 {t.learningRecords.improvementAreas}
                    </Typography>
                    <Stack spacing={1}>
                      {stats.weakAreas.map((area, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUpIcon sx={{ color: 'info.main', fontSize: 20 }} />
                          <Typography variant="body1">{area}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* 완료율 */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      📊 {t.learningRecords.completionRate}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="body1" sx={{ minWidth: 60 }}>
                        {t.learningRecords.completionRate}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={stats.completionRate} 
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" fontWeight="600">
                        {stats.completionRate.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'ko' ? `예정된 학습 중 ${stats.completionRate.toFixed(1)}%` : `${stats.completionRate.toFixed(1)}% of scheduled learning`}{t.learningRecords.completionRateDesc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📈 {t.learningRecords.detailedStats}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.learningRecords.detailedStatsDesc}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default LearningRecordsPage