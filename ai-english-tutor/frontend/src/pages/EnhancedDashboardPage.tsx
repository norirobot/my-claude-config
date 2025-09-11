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
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Badge,
  useTheme,
  alpha
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as TrophyIcon,
  Chat as ChatIcon,
  PlayArrow as PlayIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Language as LanguageIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from 'recharts'

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
  weeklyProgress: any[];
  skillRadar: any[];
  recentActivities: any[];
}

const EnhancedDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const theme = useTheme()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('growth')

  useEffect(() => {
    const fetchUserStats = async () => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:3003/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = await response.json()
        
        // 더미 데이터 추가 (실제 API가 없을 경우)
        const enhancedData = {
          ...data,
          level: 'Intermediate',
          overallScore: 78,
          progressPercentage: 65,
          totalSessions: 42,
          currentStreak: 7,
          longestStreak: 15,
          completedSessions: 28,
          targetSessions: 50,
          completedMinutes: 840,
          targetMinutes: 1500,
          activityScore: 85,
          averageScore: 82,
          growthRate: 12.5,
          efficiencyScore: 88,
          consistencyScore: 76,
          weeklyProgress: [
            { day: 'Mon', score: 75, minutes: 30 },
            { day: 'Tue', score: 82, minutes: 45 },
            { day: 'Wed', score: 78, minutes: 35 },
            { day: 'Thu', score: 85, minutes: 50 },
            { day: 'Fri', score: 88, minutes: 40 },
            { day: 'Sat', score: 92, minutes: 60 },
            { day: 'Sun', score: 86, minutes: 45 }
          ],
          skillRadar: [
            { skill: 'Speaking', value: 75 },
            { skill: 'Listening', value: 82 },
            { skill: 'Grammar', value: 88 },
            { skill: 'Vocabulary', value: 70 },
            { skill: 'Pronunciation', value: 65 },
            { skill: 'Fluency', value: 78 }
          ],
          recentActivities: [
            { type: 'lesson', title: 'Business English', time: '2 hours ago', score: 85 },
            { type: 'chat', title: 'AI Conversation', time: '5 hours ago', score: 78 },
            { type: 'quiz', title: 'Grammar Quiz', time: 'Yesterday', score: 92 },
            { type: 'lesson', title: 'Pronunciation Practice', time: '2 days ago', score: 70 }
          ],
          achievements: [
            { id: 1, name: 'First Steps', icon: '🎯', unlocked: true },
            { id: 2, name: 'Week Warrior', icon: '🗓️', unlocked: true },
            { id: 3, name: 'Conversation Master', icon: '💬', unlocked: false },
            { id: 4, name: 'Speed Learner', icon: '⚡', unlocked: false }
          ]
        }
        
        setUserStats(enhancedData)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // 오프라인 데이터 사용
        setUserStats({
          level: 'Intermediate',
          overallScore: 78,
          progressPercentage: 65,
          totalSessions: 42,
          currentStreak: 7,
          longestStreak: 15,
          completedSessions: 28,
          targetSessions: 50,
          completedMinutes: 840,
          targetMinutes: 1500,
          activityScore: 85,
          averageScore: 82,
          growthRate: 12.5,
          efficiencyScore: 88,
          consistencyScore: 76,
          weeklyProgress: [
            { day: 'Mon', score: 75, minutes: 30 },
            { day: 'Tue', score: 82, minutes: 45 },
            { day: 'Wed', score: 78, minutes: 35 },
            { day: 'Thu', score: 85, minutes: 50 },
            { day: 'Fri', score: 88, minutes: 40 },
            { day: 'Sat', score: 92, minutes: 60 },
            { day: 'Sun', score: 86, minutes: 45 }
          ],
          skillRadar: [
            { skill: 'Speaking', value: 75 },
            { skill: 'Listening', value: 82 },
            { skill: 'Grammar', value: 88 },
            { skill: 'Vocabulary', value: 70 },
            { skill: 'Pronunciation', value: 65 },
            { skill: 'Fluency', value: 78 }
          ],
          recentActivities: [
            { type: 'lesson', title: 'Business English', time: '2 hours ago', score: 85 },
            { type: 'chat', title: 'AI Conversation', time: '5 hours ago', score: 78 },
            { type: 'quiz', title: 'Grammar Quiz', time: 'Yesterday', score: 92 },
            { type: 'lesson', title: 'Pronunciation Practice', time: '2 days ago', score: 70 }
          ],
          achievements: [
            { id: 1, name: 'First Steps', icon: '🎯', unlocked: true },
            { id: 2, name: 'Week Warrior', icon: '🗓️', unlocked: true },
            { id: 3, name: 'Conversation Master', icon: '💬', unlocked: false },
            { id: 4, name: 'Speed Learner', icon: '⚡', unlocked: false }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
    
    // 실시간 업데이트 시뮬레이션
    const interval = setInterval(() => {
      setUserStats(prev => {
        if (!prev) return prev
        return {
          ...prev,
          activityScore: Math.min(100, prev.activityScore + Math.random() * 2 - 1),
          growthRate: prev.growthRate + (Math.random() * 0.5 - 0.25)
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const MetricCard = ({ title, value, subtitle, icon, color, trend }: any) => (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
              {icon}
            </Avatar>
            {trend && (
              <Chip
                size="small"
                icon={<TrendingUpIcon />}
                label={`+${trend}%`}
                color="success"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {value}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (!userStats) return null

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Box mb={4}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back! 🎯
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You're on a {userStats.currentStreak} day streak! Keep it up!
            </Typography>
          </Box>
        </motion.div>

        {/* Quick Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="Current Level"
              value={userStats.level}
              subtitle={`${userStats.progressPercentage}% to next level`}
              icon={<SchoolIcon />}
              color={theme.palette.primary.main}
              trend={userStats.growthRate.toFixed(1)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="Learning Streak"
              value={`${userStats.currentStreak} days`}
              subtitle={`Best: ${userStats.longestStreak} days`}
              icon={<FireIcon />}
              color={theme.palette.error.main}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="Total Sessions"
              value={userStats.totalSessions}
              subtitle={`${userStats.completedMinutes} minutes`}
              icon={<ScheduleIcon />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="Average Score"
              value={`${userStats.averageScore}%`}
              subtitle="Last 7 days"
              icon={<TrophyIcon />}
              color={theme.palette.warning.main}
              trend={5.2}
            />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} mb={4}>
          {/* Weekly Progress Chart */}
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weekly Progress
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userStats.weeklyProgress}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke={theme.palette.primary.main} 
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="minutes" 
                        stroke={theme.palette.secondary.main} 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Skill Radar Chart */}
          <Grid item xs={12} lg={4}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Skill Analysis
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={userStats.skillRadar}>
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
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Recent Activities & Achievements */}
        <Grid container spacing={3}>
          {/* Recent Activities */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activities
                  </Typography>
                  <Stack spacing={2}>
                    {userStats.recentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                              {activity.type === 'lesson' && <SchoolIcon />}
                              {activity.type === 'chat' && <ChatIcon />}
                              {activity.type === 'quiz' && <AssessmentIcon />}
                            </Avatar>
                            <Box>
                              <Typography variant="body1">
                                {activity.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.time}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={`${activity.score}%`} 
                            color={activity.score >= 80 ? 'success' : 'warning'}
                            size="small"
                          />
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Achievements */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Achievements
                  </Typography>
                  <Grid container spacing={2}>
                    {userStats.achievements.map((achievement, index) => (
                      <Grid item xs={6} key={achievement.id}>
                        <motion.div
                          whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                          initial={{ rotate: 0 }}
                          animate={{ rotate: achievement.unlocked ? 0 : 0 }}
                        >
                          <Paper
                            sx={{
                              p: 2,
                              textAlign: 'center',
                              opacity: achievement.unlocked ? 1 : 0.3,
                              filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
                              cursor: 'pointer'
                            }}
                          >
                            <Typography variant="h2">
                              {achievement.icon}
                            </Typography>
                            <Typography variant="body2">
                              {achievement.name}
                            </Typography>
                            {achievement.unlocked && (
                              <Chip 
                                label="Unlocked" 
                                size="small" 
                                color="success" 
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Paper>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <motion.div variants={itemVariants}>
          <Box mt={4} display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              startIcon={<ChatIcon />}
              onClick={() => navigate('/chat')}
              sx={{ 
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                boxShadow: 3
              }}
            >
              Start AI Chat
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<SchoolIcon />}
              onClick={() => navigate('/tutors')}
            >
              Find a Tutor
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/learning-records')}
            >
              View Progress
            </Button>
          </Box>
        </motion.div>
      </motion.div>
    </Box>
  )
}

export default EnhancedDashboardPage