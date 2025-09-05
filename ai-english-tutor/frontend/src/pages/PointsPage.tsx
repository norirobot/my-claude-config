import React from 'react'
import {
  Box,
  Typography
} from '@mui/material'

const PointsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        포인트 관리
      </Typography>
      <Typography variant="h6" color="text.secondary">
        포인트 페이지 구현 예정
      </Typography>
    </Box>
  )
}

export default PointsPage