import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingSpinnerProps {
  message?: string
  size?: number
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({ 
  message = '로딩 중...', 
  size = 40 
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner