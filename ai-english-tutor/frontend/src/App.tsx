import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'

// Pages (Immediate load for public pages)
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

// Lazy loaded pages
import {
  LazyDashboardPage,
  LazyChatPage,
  LazyTutorListPage,
  LazyProfilePage,
  LazyPointsPage,
  LazySettingsPage,
  LazyLearningRecordsPage
} from './components/LazyComponents'

// Layout Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Context Providers
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { QueryProvider } from './providers/QueryProvider'
import { NotificationProvider } from './contexts/NotificationContext'

// Lazy load the optimized dashboard
const OptimizedDashboardPage = lazy(() => import('./pages/OptimizedDashboardPage'))
const StoryModePage = lazy(() => import('./pages/StoryModePage'))
const VisualNovelStoryMode = lazy(() => import('./pages/VisualNovelStoryMode'))

// Loading fallback component
const PageLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
)

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <NotificationProvider>
            <LanguageProvider>
              <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Routes>
        {/* 공개 경로 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* 인증된 사용자 경로 - ProtectedRoute와 Layout으로 감싸기 */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <OptimizedDashboardPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Layout>
              <LazyChatPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tutors" element={
          <ProtectedRoute>
            <Layout>
              <LazyTutorListPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <LazyProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/points" element={
          <ProtectedRoute>
            <Layout>
              <LazyPointsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <LazySettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/learning-records" element={
          <ProtectedRoute>
            <Layout>
              <LazyLearningRecordsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/story" element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <StoryModePage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/visual-story" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <VisualNovelStoryMode />
            </Suspense>
          </ProtectedRoute>
        } />
          </Routes>
              </Box>
            </LanguageProvider>
          </NotificationProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App