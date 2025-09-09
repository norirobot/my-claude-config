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
import { useTranslation } from '../contexts/LanguageContext'
import MeetuLogo from '../components/MeetuLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()

  const features = [
    {
      icon: <AIIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t.home.features.aiTutor.title,
      description: t.home.features.aiTutor.description
    },
    {
      icon: <MicIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: t.home.features.pronunciation.title,
      description: t.home.features.pronunciation.description
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t.home.features.realTutors.title,
      description: t.home.features.realTutors.description
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
      {/* 헤더 - 언어 전환 버튼 */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10
        }}
      >
        <LanguageSwitcher variant="compact" />
      </Box>

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
                {t.home.heroTitle}
                <br />
                <Box component="span" sx={{ color: 'secondary.main' }}>
                  {t.home.heroSubtitle}
                </Box>{' '}
                {t.home.heroTitleEnd}
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                {t.home.heroDescription}
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
                  {isAuthenticated ? t.home.dashboardButton : t.home.startButton}
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
                  {t.home.demoButton}
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
          {t.home.featuresTitle}
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          {t.home.featuresSubtitle}
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
            {t.home.tutorsTitle}
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
            {t.home.tutorsSubtitle}
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
              {t.home.ctaTitle}
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              {t.home.ctaDescription.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < t.home.ctaDescription.split('\n').length - 1 && <br />}
                </span>
              ))}
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
              {isAuthenticated ? t.home.ctaButtonAuth : t.home.ctaButton}
            </Button>
          </Card>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage