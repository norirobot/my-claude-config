import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import TutorListPage from './pages/TutorListPageFixed'
import ProfilePage from './pages/ProfilePage'
import PointsPage from './pages/PointsPage'
import SettingsPage from './pages/SettingsPage'
import LearningRecordsPage from './pages/LearningRecordsPageSimple'

// Layout Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Context Providers
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  return (
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
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Layout>
              <ChatPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tutors" element={
          <ProtectedRoute>
            <Layout>
              <TutorListPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/points" element={
          <ProtectedRoute>
            <Layout>
              <PointsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/learning-records" element={
          <ProtectedRoute>
            <Layout>
              <LearningRecordsPage />
            </Layout>
          </ProtectedRoute>
        } />
        </Routes>
      </Box>
    </LanguageProvider>
  )
}

export default App