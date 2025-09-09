import React from 'react'
import { Box, Typography } from '@mui/material'

const TestPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">테스트 페이지</Typography>
      <Typography variant="body1">이 페이지가 보이면 기본적인 컴포넌트는 작동합니다.</Typography>
    </Box>
  )
}

export default TestPage