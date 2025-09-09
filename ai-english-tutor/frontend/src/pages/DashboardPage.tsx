import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  Stack,
  IconButton
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as TrophyIcon,
  Chat as ChatIcon,
  PlayArrow as PlayIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

interface UserStats {
  level: string;
  overallScore: number;
  progressPercentage: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  completedSessions: number;
  targetSessions: number;
  completedMinutes: number;
  targetMinutes: number;
  activityScore: number;
  achievements: any[];
  averageScore: number;
  growthRate: number;
  efficiencyScore: number;
  consistencyScore: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock 데이터를 바로 사용 (API 서버가 실행되지 않은 상태를 고려)
  useEffect(() => {
    const loadMockData = () => {
      // 로딩 상태를 짧게 보여주기 위한 timeout
      setTimeout(() => {
        setUserStats({
          level: language === 'ko' ? '중급 레벨 2' : 'Intermediate Level 2',
          overallScore: 85,
          progressPercentage: 75,
          totalSessions: 48,
          currentStreak: 12,
          longestStreak: 18,
          completedSessions: 4,
          targetSessions: 6,
          completedMinutes: 180,
          targetMinutes: 300,
          activityScore: 85,
          achievements: [],
          averageScore: 82,
          growthRate: 15,
          efficiencyScore: 88,
          consistencyScore: 92
        })
        setIsLoading(false)
      }, 500) // 0.5초 후 로딩 완료
    }

    loadMockData()
  }, [language])

  const recentActivities = [
    {
      type: 'chat',
      title: t.dashboard.recentChatTitles.businessMeeting,
      time: language === 'ko' ? '2시간 전' : '2 hours ago',
      score: 85,
      duration: '15 min'
    },
    {
      type: 'pronunciation', 
      title: language === 'ko' ? '발음 교정 - R/L 구분' : 'Pronunciation correction - R/L distinction',
      time: language === 'ko' ? '어제' : 'Yesterday',
      score: 92,
      duration: '10 min'
    },
    {
      type: 'lesson',
      title: t.dashboard.recentChatTitles.travelHotel,
      time: language === 'ko' ? '2일 전' : '2 days ago',
      score: 78,
      duration: '20 min'
    }
  ]

  const todayGoals = [
    { id: 1, text: t.dashboard.goals.aiChat, completed: true },
    { id: 2, text: t.dashboard.goals.pronunciation, completed: true },
    { id: 3, text: t.dashboard.goals.vocabulary, completed: false },
    { id: 4, text: t.dashboard.goals.bookTutor, completed: false }
  ]

  const upcomingLessons = [
    {
      tutor: 'David',
      subject: t.dashboard.upcomingLessonSubjects.conversationPractice,
      time: language === 'ko' ? '오늘 오후 2:00' : 'Today 2:00 PM',
      status: 'confirmed'
    },
    {
      tutor: 'Sarah',
      subject: t.dashboard.upcomingLessonSubjects.pronunciationCorrection,
      time: language === 'ko' ? '내일 오전 10:00' : 'Tomorrow 10:00 AM',
      status: 'pending'
    }
  ]

  if (isLoading || !userStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>{t.common.loading}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* 환영 메시지 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          {t.dashboard.welcome}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Level: {userStats.level} • {t.dashboard.averageScore}: {userStats.averageScore}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 왼쪽 컬럼 */}
        <Grid item xs={12} lg={8}>
          {/* 학습 통계 카드들 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* 레벨 & 포인트 */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrophyIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight="600">
                      {language === 'ko' ? '현재 레벨' : 'Current Level'}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
                    {userStats.level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t.dashboard.progress || 'Progress'}: {Math.round(userStats.progressPercentage)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={userStats.progressPercentage} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption">{userStats.totalSessions} {t.dashboard.sessionsCompleted || 'sessions'}</Typography>
                    <Typography variant="caption">{t.dashboard.averageScore || 'Average'}: {userStats.averageScore}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 주간 목표 */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon sx={{ color: 'secondary.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight="600">
                      {t.dashboard.weeklyGoal || 'Weekly Goal'}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main' }}>
                    {userStats.completedSessions} / {userStats.targetSessions} {t.dashboard.aiChatSession || 'sessions'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t.dashboard.weeklyGoal || 'Weekly Goal'}: {Math.round((userStats.completedSessions / userStats.targetSessions) * 100)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(userStats.completedSessions / userStats.targetSessions) * 100}
                    color="secondary"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {userStats.targetMinutes - userStats.completedMinutes} {t.dashboard.practiceTime || 'minutes more needed'}!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 빠른 시작 액션 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t.dashboard.quickStart}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<ChatIcon />}
                    onClick={() => navigate('/chat')}
                    sx={{ py: 2 }}
                  >
                    {t.chat.startConversation || 'Start AI Chat'}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<SchoolIcon />}
                    onClick={() => {
                      console.log('튜터 찾기 버튼 클릭됨!')
                      navigate('/tutors')
                    }}
                    sx={{ py: 2 }}
                  >
                    {t.tutors.title || 'Find Tutors'}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate('/learning-records')}
                    sx={{ py: 2 }}
                  >
                    {t.learningRecords.title || 'Learning Records'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* 학습 성과 통계 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t.dashboard.learningStats || 'Learning Statistics'}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                      {Math.round(userStats.growthRate)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.learningRecords.improvementRate || 'Growth Rate'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                      {Math.round(userStats.efficiencyScore)}{language === 'ko' ? '점' : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'ko' ? '효율성' : 'Efficiency'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                      {Math.round(userStats.consistencyScore)}{language === 'ko' ? '점' : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'ko' ? '일관성' : 'Consistency'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                      {Math.round(userStats.activityScore)}{language === 'ko' ? '점' : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'ko' ? '활동 점수' : 'Activity Score'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* 최근 활동 */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t.dashboard.recentChats || 'Recent Activities'}
              </Typography>
              <Stack spacing={2}>
                {recentActivities.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: activity.type === 'chat' ? 'primary.main' : 
                               activity.type === 'pronunciation' ? 'secondary.main' : 'success.main',
                        mr: 2
                      }}
                    >
                      {activity.type === 'chat' ? <ChatIcon /> : 
                       activity.type === 'pronunciation' ? <PlayIcon /> : <SchoolIcon />}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight="600">
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.time} • {activity.duration}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${activity.score}점`}
                      color={activity.score >= 90 ? 'success' : activity.score >= 80 ? 'primary' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 오른쪽 사이드바 */}
        <Grid item xs={12} lg={4}>
          {/* 연속 학습 */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
{t.dashboard.learningStreak} 🔥
              </Typography>
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main' }}>
                {userStats.currentStreak} {t.dashboard.days}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {language === 'ko' ? `최고: ${userStats.longestStreak}일 • 꾸준한 학습이 실력 향상의 핵심입니다!` : `Best: ${userStats.longestStreak} days • Consistent learning is the key to improvement!`}
              </Typography>
            </CardContent>
          </Card>

          {/* 오늘의 목표 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t.dashboard.todayGoals}
              </Typography>
              <Stack spacing={1}>
                {todayGoals.map((goal) => (
                  <Box
                    key={goal.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: goal.completed ? 'success.50' : 'grey.50'
                    }}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: goal.completed ? 'success.main' : 'grey.300',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {goal.completed && (
                        <Typography sx={{ color: 'white', fontSize: '10px' }}>✓</Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: goal.completed ? 'line-through' : 'none',
                        color: goal.completed ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {goal.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* 예정된 수업 */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="600" sx={{ flexGrow: 1 }}>
                  {t.dashboard.upcomingLessons}
                </Typography>
                <IconButton size="small">
                  <NotificationIcon />
                </IconButton>
              </Box>
              <Stack spacing={2}>
                {upcomingLessons.map((lesson, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.875rem' }}>
                        {lesson.tutor[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {lesson.tutor} {t.dashboard.tutor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {lesson.subject}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {lesson.time}
                    </Typography>
                    <Chip
                      label={lesson.status === 'confirmed' ? t.dashboard.confirmed : t.dashboard.pending}
                      color={lesson.status === 'confirmed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage