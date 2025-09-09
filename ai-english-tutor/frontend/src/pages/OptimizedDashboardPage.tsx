import React, { useMemo, Suspense, lazy } from 'react'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
  useTheme,
  alpha,
  Alert,
  Button
} from '@mui/material'
import {
  TrendingUp,
  School,
  Timer,
  EmojiEvents,
  Speed,
  Psychology,
  Refresh,
  ErrorOutline
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useUserStats } from '../hooks/useUserStats'
import { useNotification } from '../contexts/NotificationContext'
import { useQueryClient } from '@tanstack/react-query'

// Lazy load heavy chart components
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })))
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })))
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })))
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })))
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })))
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })))
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })))
const RadarChart = lazy(() => import('recharts').then(module => ({ default: module.RadarChart })))
const PolarGrid = lazy(() => import('recharts').then(module => ({ default: module.PolarGrid })))
const PolarAngleAxis = lazy(() => import('recharts').then(module => ({ default: module.PolarAngleAxis })))
const PolarRadiusAxis = lazy(() => import('recharts').then(module => ({ default: module.PolarRadiusAxis })))
const Radar = lazy(() => import('recharts').then(module => ({ default: module.Radar })))

// Memoized metric card component
const MetricCard = React.memo<{
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  gradient: string
  delay?: number
}>(({ title, value, subtitle, icon, gradient, delay = 0 }) => {
  const theme = useTheme()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${gradient})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold" my={1}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
})

MetricCard.displayName = 'MetricCard'

// Chart loading skeleton
const ChartSkeleton: React.FC = () => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="text" width="40%" height={30} />
    <Skeleton variant="rectangular" height={250} sx={{ mt: 2 }} />
  </Box>
)

const OptimizedDashboardPage: React.FC = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showError, showSuccess } = useNotification()
  const queryClient = useQueryClient()
  
  // Use React Query for data fetching
  const { data: stats, isLoading, error, refetch } = useUserStats(user?.id, {
    onError: (error) => {
      showError(`Failed to load dashboard data: ${error.message}`)
    },
    onSuccess: () => {
      console.log('Dashboard data loaded successfully')
    }
  })

  // Memoized chart data
  const weeklyProgressData = useMemo(() => {
    if (!stats) return []
    return [
      { day: 'Mon', minutes: 45, score: 82 },
      { day: 'Tue', minutes: 60, score: 85 },
      { day: 'Wed', minutes: 30, score: 78 },
      { day: 'Thu', minutes: 75, score: 88 },
      { day: 'Fri', minutes: 50, score: 84 },
      { day: 'Sat', minutes: 90, score: 92 },
      { day: 'Sun', minutes: 40, score: 80 }
    ]
  }, [stats])

  const skillRadarData = useMemo(() => {
    if (!stats) return []
    return [
      { skill: 'Speaking', value: stats?.speakingScore || 75 },
      { skill: 'Listening', value: stats?.listeningScore || 80 },
      { skill: 'Reading', value: stats?.readingScore || 85 },
      { skill: 'Writing', value: stats?.writingScore || 70 },
      { skill: 'Grammar', value: stats?.grammarScore || 78 },
      { skill: 'Vocabulary', value: stats?.vocabularyScore || 82 }
    ]
  }, [stats])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['userStats'] })
    showSuccess('Dashboard data refreshed')
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
          icon={<ErrorOutline />}
        >
          {error.message || 'Failed to load dashboard data'}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {t.dashboard.title}
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <AnimatePresence>
          <Grid container spacing={3}>
            {/* Metric Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title={t.dashboard.studyStreak}
                value={`${stats?.studyStreak || 0} ${t.common.days}`}
                subtitle={t.dashboard.keepItUp}
                icon={<EmojiEvents fontSize="large" />}
                gradient="#667eea 0%, #764ba2 100%"
                delay={0.1}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title={t.dashboard.totalLearningTime}
                value={`${Math.floor((stats?.totalMinutes || 0) / 60)}h ${(stats?.totalMinutes || 0) % 60}m`}
                subtitle={t.dashboard.thisWeek}
                icon={<Timer fontSize="large" />}
                gradient="#f093fb 0%, #f5576c 100%"
                delay={0.2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title={t.dashboard.level}
                value={`Lv. ${stats?.level || 1}`}
                subtitle={`${stats?.experiencePoints || 0} XP`}
                icon={<School fontSize="large" />}
                gradient="#4facfe 0%, #00f2fe 100%"
                delay={0.3}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title={t.dashboard.accuracy}
                value={`${stats?.accuracy || 0}%`}
                subtitle={t.dashboard.weeklyAverage}
                icon={<Speed fontSize="large" />}
                gradient="#43e97b 0%, #38f9d7 100%"
                delay={0.4}
              />
            </Grid>

            {/* Charts Section */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {t.dashboard.weeklyProgress}
                </Typography>
                <Suspense fallback={<ChartSkeleton />}>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weeklyProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="minutes"
                        stroke={theme.palette.primary.main}
                        name="Minutes"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="score"
                        stroke={theme.palette.secondary.main}
                        name="Score"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Suspense>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {t.dashboard.skillRadar}
                </Typography>
                <Suspense fallback={<ChartSkeleton />}>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={skillRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Skills"
                        dataKey="value"
                        stroke={theme.palette.primary.main}
                        fill={theme.palette.primary.main}
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Suspense>
              </Paper>
            </Grid>

            {/* Recent Activities */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Psychology sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {t.dashboard.recentActivities}
                  </Typography>
                </Box>
                {stats?.recentActivities?.length ? (
                  <Box>
                    {stats.recentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box
                          sx={{
                            py: 1.5,
                            px: 2,
                            mb: 1,
                            borderRadius: 1,
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <Typography variant="body2">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent activities
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </AnimatePresence>
      )}
    </Container>
  )
}

export default OptimizedDashboardPage