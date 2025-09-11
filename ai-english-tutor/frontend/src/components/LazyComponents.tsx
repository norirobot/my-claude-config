import { lazy, Suspense } from 'react'
import LoadingSpinner from './common/LoadingSpinner'

// Lazy load 페이지들
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const ChatPage = lazy(() => import('../pages/ChatPage'))
const TutorListPage = lazy(() => import('../pages/TutorListPageFixed'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const PointsPage = lazy(() => import('../pages/PointsPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))
const LearningRecordsPage = lazy(() => import('../pages/LearningRecordsPageSimple'))

// HOC로 Suspense 래핑
const withSuspense = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<LoadingSpinner message="페이지를 불러오는 중..." />}>
      <Component {...props} />
    </Suspense>
  )
  
  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`
  return WrappedComponent
}

// 래핑된 컴포넌트들
export const LazyDashboardPage = withSuspense(DashboardPage)
export const LazyChatPage = withSuspense(ChatPage)
export const LazyTutorListPage = withSuspense(TutorListPage)
export const LazyProfilePage = withSuspense(ProfilePage)
export const LazyPointsPage = withSuspense(PointsPage)
export const LazySettingsPage = withSuspense(SettingsPage)
export const LazyLearningRecordsPage = withSuspense(LearningRecordsPage)