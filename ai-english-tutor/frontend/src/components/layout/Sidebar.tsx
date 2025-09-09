import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  AccountBalance as PointsIcon,
  Settings as SettingsIcon,
  EmojiEvents as TrophyIcon,
  Notifications as NotificationIcon,
  Home as HomeIcon,
  AutoStories as StoryIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBreakpoint } from '../../utils/responsive'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const sidebarWidth = 280

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, language } = useLanguage()

  // 네비게이션 메뉴 아이템들
  const menuItems = [
    {
      text: t.nav.home,
      path: '/',
      icon: <HomeIcon />,
      description: language === 'ko' ? '메인 홈페이지로 이동' : 'Navigate to main homepage',
      badge: 'HOME'
    },
    {
      text: t.nav.dashboard,
      path: '/dashboard',
      icon: <DashboardIcon />,
      description: language === 'ko' ? '학습 현황 한눈에 보기' : 'View your learning overview'
    },
    {
      text: t.nav.chat,
      path: '/chat',
      icon: <ChatIcon />,
      description: language === 'ko' ? 'AI 튜터와 영어 대화' : 'Chat with AI tutor',
      badge: 'HOT'
    },
    {
      text: language === 'ko' ? '스토리 모드' : 'Story Mode',
      path: '/story',
      icon: <StoryIcon />,
      description: language === 'ko' ? 'AI 캐릭터와 스토리 만들기' : 'Create stories with AI characters',
      badge: 'NEW'
    },
    {
      text: t.nav.tutors,
      path: '/tutors',
      icon: <SchoolIcon />,
      description: language === 'ko' ? '실제 외국인 튜터 매칭' : 'Find real foreign tutors'
    },
    {
      text: t.nav.learningRecords,
      path: '/learning-records',
      icon: <AssessmentIcon />,
      description: language === 'ko' ? '내 실력 향상 추적' : 'Track your progress'
    }
  ]

  const bottomMenuItems = [
    {
      text: t.nav.points,
      path: '/points',
      icon: <PointsIcon />,
      description: language === 'ko' ? '적립/사용 내역' : 'Points history'
    },
    {
      text: t.nav.profile,
      path: '/profile',
      icon: <PersonIcon />,
      description: language === 'ko' ? '개인정보 관리' : 'Manage personal info'
    },
    {
      text: t.nav.settings,
      path: '/settings',
      icon: <SettingsIcon />,
      description: language === 'ko' ? '앱 설정' : 'App settings'
    }
  ]

  const handleMenuClick = (path: string) => {
    console.log('사이드바 메뉴 클릭:', path)
    navigate(path)
    onClose()
  }

  const drawer = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      {/* 사용자 프로필 섹션 */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white', minHeight: 160 }}>
        {/* 앱 타이틀 */}
        <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, textAlign: 'center' }}>
          AI English Tutor
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              mr: 2, 
              width: 42, 
              height: 42,
              fontSize: '0.85rem',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            김영희
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5 }}>
              User
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', lineHeight: 1.2 }}>
              Intermediate • 42 days 🔥
            </Typography>
          </Box>
        </Box>
        
        {/* 레벨 진행상황 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          p: 2,
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon sx={{ fontSize: 16, color: 'warning.light' }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              230P to next level
            </Typography>
          </Box>
          
          {/* 알림 & 설정 아이콘 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <NotificationIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* 메인 메뉴 */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleMenuClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="500">
                      {item.text}
                    </Typography>
                    {item.badge && (
                      <Chip 
                        label={item.badge} 
                        size="small" 
                        color="secondary"
                        sx={{ height: 20, fontSize: '0.625rem' }}
                      />
                    )}
                  </Box>
                }
                secondary={item.description}
                secondaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* 하단 메뉴 */}
      <List>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleMenuClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                secondary={item.description}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: '500'
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* 앱 정보 */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary" align="center">
          AI English Tutor v1.0.0
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      {drawer}
    </Drawer>
  )
}

export default Sidebar