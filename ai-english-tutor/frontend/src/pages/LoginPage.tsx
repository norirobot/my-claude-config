import React, { useState } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material'
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, register, loading, error, clearError } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value })
    if (error) clearError() // 입력 시 에러 메시지 제거
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    clearError()

    // 간단한 유효성 검사
    if (!formData.email || !formData.password) {
      return
    }

    if (!isLogin) {
      if (!formData.name) {
        return
      }
      if (formData.password !== formData.confirmPassword) {
        return
      }
    }

    if (isLogin) {
      // 로그인
      const success = await login({
        email: formData.email,
        password: formData.password
      })

      if (success) {
        navigate('/dashboard')
      }
    } else {
      // 회원가입
      const success = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        confirmPassword: formData.confirmPassword
      })

      if (success) {
        navigate('/dashboard')
      }
    }
  }

  const handleSocialLogin = (provider: string) => {
    // TODO: 소셜 로그인 구현
    console.log(`${provider} 로그인`)
    navigate('/dashboard')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'background.paper'
          }}
        >
          {/* 헤더 */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
              AI 영어 튜터
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isLogin ? '로그인' : '회원가입'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isLogin 
                ? '계정이 없으시다면' 
                : '이미 계정이 있으시다면'
              }{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => setIsLogin(!isLogin)}
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                {isLogin ? '회원가입' : '로그인'}
              </Link>
            </Typography>
          </Box>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 로그인/회원가입 폼 */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* 이름 (회원가입시만) */}
            {!isLogin && (
              <TextField
                fullWidth
                label="이름"
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange('name')}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            )}

            {/* 이메일 */}
            <TextField
              fullWidth
              label="이메일"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleInputChange('email')}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                )
              }}
            />

            {/* 비밀번호 */}
            <TextField
              fullWidth
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={formData.password}
              onChange={handleInputChange('password')}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* 비밀번호 확인 (회원가입시만) */}
            {!isLogin && (
              <TextField
                fullWidth
                label="비밀번호 확인"
                type="password"
                variant="outlined"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            )}

            {/* 로그인 버튼 */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 3,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </Button>
          </Box>

          {/* 구분선 */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              또는
            </Typography>
          </Divider>

          {/* 소셜 로그인 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => handleSocialLogin('Google')}
              sx={{
                py: 1.5,
                borderColor: 'grey.300',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'grey.400',
                  bgcolor: 'grey.50'
                }
              }}
            >
              Google로 계속하기
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<FacebookIcon />}
              onClick={() => handleSocialLogin('Facebook')}
              sx={{
                py: 1.5,
                borderColor: '#1877f2',
                color: '#1877f2',
                '&:hover': {
                  borderColor: '#166fe5',
                  bgcolor: '#f0f8ff'
                }
              }}
            >
              Facebook으로 계속하기
            </Button>
          </Box>

          {/* 하단 링크 */}
          {isLogin && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link
                component="button"
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                비밀번호를 잊으셨나요?
              </Link>
            </Box>
          )}
        </Paper>

        {/* 데모 계정 안내 */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
            💡 데모 계정: demo@example.com / password123
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default LoginPage