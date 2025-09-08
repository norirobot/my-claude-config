import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Badge,
  Paper,
  Stack,
  Divider
} from '@mui/material'
import {
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as LevelIcon,
  Leaderboard as LeaderboardIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material'
import { useLanguage } from '../contexts/LanguageContext'

interface LevelData {
  currentLevel: number
  experience: number
  experienceToNextLevel: number
  experienceInCurrentLevel: number
  experienceForCurrentLevel: number
  levelName: string
  levelDescription: string
  perks: string[]
  nextLevelName: string
  nextLevelPerks: string[]
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  unlockedAt?: string
  progress?: number
  target?: number
  reward: string
}

interface AchievementData {
  unlocked: Achievement[]
  inProgress: Achievement[]
  locked: Achievement[]
  stats: {
    totalUnlocked: number
    totalAvailable: number
    totalPointsEarned: number
    favoriteCategory: string
  }
}

interface LeaderboardUser {
  rank: number
  name: string
  score: number
  level: number
  avatar: string
}

interface LeaderboardData {
  type: string
  currentUser: {
    rank: number
    score: number
    name: string
  }
  topUsers: LeaderboardUser[]
}

const ProfilePage: React.FC = () => {
  const { t } = useLanguage()
  const [tabValue, setTabValue] = useState(0)
  const [levelData, setLevelData] = useState<LevelData | null>(null)
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const [levelResponse, achievementResponse, leaderboardResponse] = await Promise.all([
        fetch('http://localhost:3001/api/levels/1'),
        fetch('http://localhost:3001/api/achievements/1'), 
        fetch('http://localhost:3001/api/leaderboard?type=weekly')
      ])

      const [levelData, achievementData, leaderboardData] = await Promise.all([
        levelResponse.json(),
        achievementResponse.json(),
        leaderboardResponse.json()
      ])

      setLevelData(levelData)
      setAchievementData(achievementData)
      setLeaderboardData(leaderboardData)
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getProgressPercentage = () => {
    if (!levelData) return 0
    return (levelData.experienceInCurrentLevel / levelData.experienceForCurrentLevel) * 100
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'milestone': return 'primary'
      case 'consistency': return 'secondary'
      case 'performance': return 'success'
      case 'social': return 'info'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>로딩 중...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
        <PersonIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
        나의 프로필
      </Typography>

      {/* 사용자 정보 & 레벨 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" fontWeight="bold">
                User
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                <LevelIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Level {levelData?.currentLevel} - {levelData?.levelName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {levelData?.levelDescription}
              </Typography>
              
              {/* 경험치 바 */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  다음 레벨까지: {levelData?.experienceInCurrentLevel} / {levelData?.experienceForCurrentLevel} XP
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getProgressPercentage()}
                  sx={{ height: 8, borderRadius: 4, mt: 1 }}
                />
              </Box>
              
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                다음: {levelData?.nextLevelName}
              </Typography>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  #{leaderboardData?.currentUser.rank}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  주간 순위
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 탭 메뉴 */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<TrophyIcon />}
            label="업적"
            iconPosition="start"
          />
          <Tab
            icon={<LeaderboardIcon />}
            label="리더보드"
            iconPosition="start"
          />
          <Tab
            icon={<StarIcon />}
            label="혜택"
            iconPosition="start"
          />
        </Tabs>

        <CardContent>
          {/* 업적 탭 */}
          {tabValue === 0 && achievementData && (
            <Box>
              {/* 업적 통계 */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      {achievementData.stats.totalUnlocked}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      획득한 업적
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                      {achievementData.stats.totalAvailable}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      전체 업적
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                    <Typography variant="h5" color="warning.main" fontWeight="bold">
                      {achievementData.stats.totalPointsEarned}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      획득 포인트
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50' }}>
                    <Typography variant="h5" color="secondary.main" fontWeight="bold">
                      {Math.round((achievementData.stats.totalUnlocked / achievementData.stats.totalAvailable) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      완료율
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* 획득한 업적 */}
              <Typography variant="h6" gutterBottom>
                🏆 획득한 업적 ({achievementData.unlocked.length})
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {achievementData.unlocked.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: 'success.main',
                        bgcolor: 'success.50'
                      }}
                    >
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {achievement.icon}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {achievement.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {achievement.description}
                      </Typography>
                      <Chip
                        label={achievement.reward}
                        color="success"
                        size="small"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* 진행 중인 업적 */}
              <Typography variant="h6" gutterBottom>
                🎯 진행 중인 업적 ({achievementData.inProgress.length})
              </Typography>
              <Stack spacing={2} sx={{ mb: 3 }}>
                {achievementData.inProgress.map((achievement) => (
                  <Paper key={achievement.id} sx={{ p: 2 }}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item>
                        <Typography variant="h6">{achievement.icon}</Typography>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {achievement.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {achievement.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(achievement.progress! / achievement.target!) * 100}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {achievement.progress} / {achievement.target}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item>
                        <Chip
                          label={achievement.reward}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* 리더보드 탭 */}
          {tabValue === 1 && leaderboardData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                🏁 주간 리더보드
              </Typography>
              <List>
                {leaderboardData.topUsers.map((user) => (
                  <ListItem key={user.rank} sx={{ bgcolor: user.rank <= 3 ? 'primary.50' : 'transparent' }}>
                    <ListItemIcon>
                      <Badge badgeContent={user.rank} color="primary">
                        <Avatar src={user.avatar} />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user.name}
                          </Typography>
                          {user.rank === 1 && <Typography>🥇</Typography>}
                          {user.rank === 2 && <Typography>🥈</Typography>}
                          {user.rank === 3 && <Typography>🥉</Typography>}
                        </Box>
                      }
                      secondary={`Level ${user.level}`}
                    />
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      {user.score.toLocaleString()}
                    </Typography>
                  </ListItem>
                ))}
                <Divider sx={{ my: 2 }} />
                <ListItem sx={{ bgcolor: 'warning.50' }}>
                  <ListItemIcon>
                    <Badge badgeContent={leaderboardData.currentUser.rank} color="secondary">
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {leaderboardData.currentUser.name} (나)
                      </Typography>
                    }
                    secondary="내 순위"
                  />
                  <Typography variant="h6" color="secondary.main" fontWeight="bold">
                    {leaderboardData.currentUser.score.toLocaleString()}
                  </Typography>
                </ListItem>
              </List>
            </Box>
          )}

          {/* 혜택 탭 */}
          {tabValue === 2 && levelData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                🎁 현재 레벨 혜택
              </Typography>
              <List sx={{ mb: 3 }}>
                {levelData.perks.map((perk, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <FireIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={perk} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom>
                ⭐ 다음 레벨 혜택 ({levelData.nextLevelName})
              </Typography>
              <List>
                {levelData.nextLevelPerks.map((perk, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <StarIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={perk}
                      sx={{ opacity: 0.7 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProfilePage