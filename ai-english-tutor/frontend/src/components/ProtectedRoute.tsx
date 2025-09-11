import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Box, CircularProgress, Typography } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // 테스트 모드: 인증 체크 비활성화
  // 모든 페이지 바로 접근 가능
  return <>{children}</>
  
  /* 실제 인증 로직 (배포시 사용)
  const { isAuthenticated, loading } = useAuth()

  // 로딩 중일 때 스피너 표시
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          로그인 상태를 확인하는 중...
        </Typography>
      </Box>
    )
  }

  // 인증되지 않은 경우 로그인 페이지로 리디렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 인증된 사용자는 자식 컴포넌트 렌더링
  return <>{children}</>
  */
}

export default ProtectedRoute