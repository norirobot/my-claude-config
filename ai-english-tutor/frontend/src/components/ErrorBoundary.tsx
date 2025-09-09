import React from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={3}
        >
          <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 600 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <ErrorIcon />
              <Typography variant="h6">
                예기치 못한 오류가 발생했습니다
              </Typography>
            </Box>
          </Alert>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            문제가 지속되면 페이지를 새로고침하거나 관리자에게 문의해주세요.
          </Typography>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                mb: 3,
                width: '100%',
                maxWidth: 600,
                overflow: 'auto'
              }}
            >
              <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={this.resetError}
            size="large"
          >
            다시 시도
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary