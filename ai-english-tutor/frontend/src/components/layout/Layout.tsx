import React, { ReactNode } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from '../../contexts/LanguageContext'

// Components
import Sidebar from './Sidebar'
import LanguageSwitcher from '../LanguageSwitcher'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null)

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null)
  }

  const handleLogout = () => {
    logout()
    handleProfileMenuClose()
    navigate('/')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 상단 앱바 */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="메뉴 열기"
            onClick={toggleSidebar}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              ml: 2,
              color: 'text.primary',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main'
              }
            }}
            onClick={() => navigate('/')}
          >
            🏠 {t.nav.homeTitle}
          </Typography>

          {/* 언어 전환 */}
          <Box sx={{ mr: 2 }}>
            <LanguageSwitcher variant="header" showLabel={false} />
          </Box>

          {/* 알림 버튼 */}
          <IconButton 
            color="inherit"
            sx={{ mr: 1, color: 'text.secondary' }}
          >
            <Badge badgeContent={3} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* 프로필 메뉴 */}
          <IconButton
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{ color: 'text.secondary' }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main',
                fontSize: '0.875rem'
              }}
              src={user?.avatar}
            >
              {user?.name ? user.name[0] : '사'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose() }}>
              <AccountCircle sx={{ mr: 2 }} />
              {t.nav.profile}
            </MenuItem>
            <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose() }}>
              <Settings sx={{ mr: 2 }} />
              {t.nav.settings}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              {t.nav.logout}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* 사이드바 */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* 메인 콘텐츠 영역 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8, // AppBar 높이만큼 여백
          p: 3,
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout