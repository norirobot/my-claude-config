import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Stack
} from '@mui/material'
import {
  School as SchoolIcon,
  Psychology as AIIcon,
  Mic as MicIcon,
  Groups as GroupsIcon,
  Star as StarIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import MeetuLogo from '../components/MeetuLogo'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <AIIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'AI 디지털 트윈 튜터',
      description: '실제 튜터의 말투와 성격을 학습한 AI가 먼저 연습 상대가 됩니다'
    },
    {
      icon: <MicIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: '발음 분석 & 교정',
      description: '음성 인식 기술로 발음을 정확하게 분석하고 즉시 피드백을 제공합니다'
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '한국 거주 외국인 튜터',
      description: '시차 없이 실시간으로 한국 거주 원어민 튜터와 대화할 수 있습니다'
    }
  ]

  const tutorProfiles = [
    {
      name: 'Jennifer',
      country: '🇺🇸 미국',
      specialty: '비즈니스 영어',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'David',
      country: '🇬🇧 영국',
      specialty: '일상 회화',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Sarah',
      country: '🇨🇦 캐나다',
      specialty: '발음 교정',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=400&h=400&fit=crop&crop=face'
    }
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 히어로 섹션 */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" sx={{ mb: 3, fontWeight: 700 }}>
                AI로 먼저 연습하고
                <br />
                <Box component="span" sx={{ color: 'secondary.main' }}>
                  실제 튜터
                </Box>
                와 대화하세요
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                세계 유일의 디지털 트윈 영어 학습법으로
                <br />
                외국인과의 대화 두려움을 완전히 극복하세요
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  startIcon={<PlayIcon />}
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  {isAuthenticated ? '대시보드로 가기' : '무료로 시작하기'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  데모 보기
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {/* MEETU 로고 */}
                <Box
                  sx={{
                    mx: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MeetuLogo size={450} variant="gradient" showText={true} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 핵심 기능 섹션 */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" align="center" sx={{ mb: 2 }}>
          왜 AI 영어 튜터인가요?
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          기존 영어 학습의 한계를 완전히 뛰어넘는 혁신적인 방법
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  py: 4,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 튜터 소개 섹션 */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ mb: 2 }}>
            검증된 한국 거주 튜터들
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
            시차 걱정 없이 언제든 만날 수 있는 원어민 튜터들
          </Typography>

          <Grid container spacing={4}>
            {tutorProfiles.map((tutor, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    py: 3,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent>
                    <Avatar
                      src={tutor.image}
                      alt={tutor.name}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '2rem'
                      }}
                    >
                      {tutor.name[0]}
                    </Avatar>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {tutor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tutor.country}
                    </Typography>
                    <Chip 
                      label={tutor.specialty} 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <StarIcon sx={{ color: '#ffc107', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 600 }}>
                        {tutor.rating}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA 섹션 */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Card
            sx={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              color: 'white',
              p: 6,
              textAlign: 'center'
            }}
          >
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              지금 바로 시작하세요!
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              첫 AI 대화는 무료입니다. 
              <br />
              5분만 투자해서 영어 실력의 변화를 경험해보세요.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            >
              {isAuthenticated ? '지금 시작하기' : '무료 체험 시작하기'}
            </Button>
          </Card>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage