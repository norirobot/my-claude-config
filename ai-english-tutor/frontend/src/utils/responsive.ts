import { useTheme, useMediaQuery } from '@mui/material'
import { Breakpoint } from '@mui/material/styles'

// 반응형 브레이크포인트 훅
export const useBreakpoint = () => {
  const theme = useTheme()
  
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('md')),
    isTablet: useMediaQuery(theme.breakpoints.between('md', 'lg')),
    isDesktop: useMediaQuery(theme.breakpoints.up('lg')),
    isSmall: useMediaQuery(theme.breakpoints.down('sm')),
    isMedium: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isLarge: useMediaQuery(theme.breakpoints.up('md'))
  }
}

// 동적 컬럼 수 계산
export const useResponsiveColumns = () => {
  const { isSmall, isMobile, isDesktop } = useBreakpoint()
  
  if (isSmall) return 1
  if (isMobile) return 2
  if (isDesktop) return 4
  return 3
}

// 반응형 간격
export const getResponsiveSpacing = (mobile: number, tablet: number, desktop: number) => {
  return {
    xs: mobile,
    md: tablet,
    lg: desktop
  }
}

// 반응형 타이포그래피
export const getResponsiveTypography = () => {
  const { isSmall, isMobile } = useBreakpoint()
  
  return {
    h1: isSmall ? 'h3' : isMobile ? 'h2' : 'h1',
    h2: isSmall ? 'h4' : isMobile ? 'h3' : 'h2',
    h3: isSmall ? 'h5' : isMobile ? 'h4' : 'h3',
    h4: isSmall ? 'h6' : isMobile ? 'h5' : 'h4',
  } as const
}

// 반응형 그리드 시스템
export const getResponsiveGridProps = (mobileColumns = 12, tabletColumns = 6, desktopColumns = 4) => {
  return {
    xs: mobileColumns,
    md: tabletColumns,
    lg: desktopColumns
  }
}