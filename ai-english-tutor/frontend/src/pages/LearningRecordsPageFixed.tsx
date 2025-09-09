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
  Stack,
  Tabs,
  Tab,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
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
  status: 'completed' | 'in-progress' | 'cancelled'
  feedback?: string
}

const LearningRecordsPageFixed: React.FC = () => {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState(0)
  const [filterType, setFilterType] = useState('all')
  const [records, setRecords] = useState<LearningRecord[]>([])

  // 언어가 변경될 때마다 학습 기록 데이터 재생성
  useEffect(() => {
    const mockRecords: LearningRecord[] = [
      {
        id: '1',
        date: '2024-12-14',
        type: 'chat',
        title: t.learningRecords.chatTitles?.dailyChat || 'Daily Chat',
        duration: 30,
        score: 85,
        topics: [
          t.learningRecords.topics?.dailyConversation || 'Daily Conversation',
          t.learningRecords.topics?.hobby || 'Hobbies'
        ],
        status: 'completed',
        feedback: language === 'ko' ? '발음이 많이 개선되었어요!' : 'Your pronunciation has improved a lot!'
      },
      {
        id: '2',
        date: '2024-12-13',
        type: 'tutor',
        title: t.learningRecords.chatTitles?.businessPresentation || 'Business Presentation',
        tutor: 'Jennifer Williams',
        duration: 50,
        score: 92,
        topics: [
          t.learningRecords.topics?.businessEnglish || 'Business English',
          t.learningRecords.topics?.presentation || 'Presentation'
        ],
        status: 'completed',
        feedback: language === 'ko' ? '프레젠테이션 스킬이 훌륭합니다!' : 'Great presentation skills!'
      }
    ]
    setRecords(mockRecords)
  }, [language, t])

  const stats = {
    totalTime: 1450, // 분
    totalSessions: 48,
    averageScore: 88,
    improvementRate: 15
  }

  const filteredRecords = filterType === 'all' 
    ? records 
    : records.filter(record => record.type === filterType)

  return (
    <Box>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          {t.learningRecords.title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t.learningRecords.subtitle}
        </Typography>
      </Box>

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  {t.learningRecords.totalTime}
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {Math.floor(stats.totalTime / 60)}{t.learningRecords.hours} {stats.totalTime % 60}{t.learningRecords.minutes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  {t.learningRecords.totalSessions}
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats.totalSessions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  {t.learningRecords.averageScore}
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats.averageScore}{t.learningRecords.points}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  {t.learningRecords.improvementRate}
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                +{stats.improvementRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 탭 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={t.learningRecords.allRecords} />
          <Tab label={t.learningRecords.performanceAnalysis} />
        </Tabs>
      </Box>

      {/* 탭 내용 */}
      {activeTab === 0 && (
        <>
          {/* 필터 */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{t.learningRecords.type}</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label={t.learningRecords.type}
              >
                <MenuItem value="all">{t.learningRecords.all}</MenuItem>
                <MenuItem value="chat">{t.learningRecords.aiChat}</MenuItem>
                <MenuItem value="tutor">{t.learningRecords.tutorSession}</MenuItem>
                <MenuItem value="pronunciation">{t.learningRecords.pronunciation}</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ ml: 'auto' }}
            >
              {t.learningRecords.export}
            </Button>
          </Box>

          {/* 학습 기록 테이블 */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t.learningRecords.date}</TableCell>
                  <TableCell>{t.learningRecords.type}</TableCell>
                  <TableCell>{t.learningRecords.title_column}</TableCell>
                  <TableCell>{t.learningRecords.time}</TableCell>
                  <TableCell>{t.learningRecords.score}</TableCell>
                  <TableCell>{t.learningRecords.topics}</TableCell>
                  <TableCell>{t.learningRecords.status}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          record.type === 'chat' ? t.learningRecords.aiChat :
                          record.type === 'tutor' ? t.learningRecords.tutorSession :
                          record.type === 'pronunciation' ? t.learningRecords.pronunciation :
                          t.learningRecords.lesson
                        }
                        size="small"
                        color={record.type === 'chat' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {record.title}
                      </Typography>
                      {record.tutor && (
                        <Typography variant="caption" color="text.secondary">
                          {record.tutor}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{record.duration}{t.learningRecords.minutes}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {record.score}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                          /100
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {record.topics.slice(0, 2).map((topic) => (
                          <Chip
                            key={topic}
                            label={topic}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          record.status === 'completed' ? t.learningRecords.completed :
                          record.status === 'in-progress' ? t.learningRecords.inProgress :
                          t.learningRecords.cancelled
                        }
                        size="small"
                        color={record.status === 'completed' ? 'success' : 'default'}
                        variant={record.status === 'completed' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3 }}>
              {t.learningRecords.performanceAnalysis}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t.learningRecords.favoriteTopics}
                </Typography>
                <Stack spacing={1}>
                  {[
                    t.learningRecords.topics?.dailyConversation || 'Daily Conversation',
                    t.learningRecords.topics?.businessEnglish || 'Business English',
                    t.learningRecords.topics?.pronunciation || 'Pronunciation'
                  ].map((topic, index) => (
                    <Box key={topic} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {index + 1}. {topic}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={[75, 60, 45][index]}
                        sx={{ flex: 2, ml: 2 }}
                      />
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {[75, 60, 45][index]}%
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t.learningRecords.completionRate}
                </Typography>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h2" color="primary" fontWeight="bold">
                    92%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t.learningRecords.completionRateDesc}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default LearningRecordsPageFixed