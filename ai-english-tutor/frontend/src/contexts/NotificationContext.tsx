import React, { createContext, useContext, useState, useCallback } from 'react'
import { Snackbar, Alert, AlertColor, Slide } from '@mui/material'

interface Notification {
  id: string
  message: string
  severity: AlertColor
  duration?: number
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor, duration?: number) => void
  showError: (message: string) => void
  showSuccess: (message: string) => void
  showWarning: (message: string) => void
  showInfo: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null)

  const showNotification = useCallback((
    message: string, 
    severity: AlertColor = 'info', 
    duration: number = 5000
  ) => {
    const id = `${Date.now()}-${Math.random()}`
    const notification: Notification = { id, message, severity, duration }
    
    setNotifications(prev => [...prev, notification])
    setCurrentNotification(notification)
    setOpen(true)
  }, [])

  const showError = useCallback((message: string) => {
    showNotification(message, 'error', 7000)
  }, [showNotification])

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success', 4000)
  }, [showNotification])

  const showWarning = useCallback((message: string) => {
    showNotification(message, 'warning', 6000)
  }, [showNotification])

  const showInfo = useCallback((message: string) => {
    showNotification(message, 'info', 5000)
  }, [showNotification])

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    
    setOpen(false)
    setTimeout(() => {
      setNotifications(prev => prev.slice(1))
      if (notifications.length > 1) {
        setCurrentNotification(notifications[1])
        setOpen(true)
      }
    }, 300)
  }

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showError,
      showSuccess,
      showWarning,
      showInfo
    }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={currentNotification?.duration || 5000}
        onClose={handleClose}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {currentNotification && (
          <Alert 
            onClose={handleClose} 
            severity={currentNotification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {currentNotification.message}
          </Alert>
        )}
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export default NotificationContext