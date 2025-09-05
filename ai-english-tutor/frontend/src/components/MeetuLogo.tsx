import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'

interface MeetuLogoProps {
  size?: number
  showText?: boolean
  variant?: 'light' | 'dark' | 'gradient'
}

const MeetuLogo: React.FC<MeetuLogoProps> = ({ 
  size = 300, 
  showText = true, 
  variant = 'gradient' 
}) => {
  const [imageExists, setImageExists] = useState(false)
  
  // Public 폴더의 이미지 경로 (Vite에서는 /public 폴더 내용을 / 경로로 접근)
  const logoImagePath = '/meetu.png'
  
  // 이미지 존재 여부 체크
  useEffect(() => {
    const img = new Image()
    img.src = logoImagePath
    img.onload = () => setImageExists(true)
    img.onerror = () => setImageExists(false)
  }, [])
  
  // 실제 PNG 이미지가 있을 때 사용할 컴포넌트
  const renderImageLogo = () => {
    return (
      <Box
        component="img"
        src={logoImagePath}
        alt="MEETU Logo"
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
          // 세련된 다층 그림자와 글로우 효과
          filter: `
            drop-shadow(0 2px 8px rgba(0,0,0,0.15))
            drop-shadow(0 8px 16px rgba(0,0,0,0.1))
            drop-shadow(0 16px 32px rgba(0,0,0,0.05))
            drop-shadow(0 0 20px rgba(25,118,210,0.2))
            drop-shadow(0 0 40px rgba(66,165,245,0.1))
          `.replace(/\s+/g, ' ').trim()
        }}
      />
    )
  }
  
  // SVG 기반 커스텀 로고
  const renderSvgLogo = () => {
    const iconSize = size * 0.4
    const textColor = variant === 'dark' ? '#1976d2' : '#fff'
    
    return (
      <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* SVG 아이콘 */}
        <Box sx={{ mb: showText ? 1.5 : 0 }}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 200 200">
            {/* 외곽 원 */}
            <circle 
              cx="100" 
              cy="100" 
              r="90" 
              fill="none" 
              stroke={textColor}
              strokeWidth="6"
              opacity="0.3"
            />
            
            {/* 내부 디자인 - AI 뇌파 모양 */}
            <path 
              d="M50 100 Q70 70, 90 100 T130 100 T170 100" 
              fill="none" 
              stroke={textColor}
              strokeWidth="4"
              opacity="0.8"
            />
            <path 
              d="M40 120 Q65 90, 85 120 T125 120 T165 120" 
              fill="none" 
              stroke={textColor}
              strokeWidth="3"
              opacity="0.6"
            />
            <path 
              d="M45 80 Q70 60, 95 80 T135 80 T175 80" 
              fill="none" 
              stroke={textColor}
              strokeWidth="3"
              opacity="0.6"
            />
            
            {/* 중앙 점들 - 연결점 */}
            <circle cx="100" cy="100" r="4" fill={textColor} opacity="0.9" />
            <circle cx="70" cy="90" r="2" fill={textColor} opacity="0.7" />
            <circle cx="130" cy="110" r="2" fill={textColor} opacity="0.7" />
            <circle cx="85" cy="120" r="2" fill={textColor} opacity="0.5" />
            <circle cx="115" cy="80" r="2" fill={textColor} opacity="0.5" />
          </svg>
        </Box>
        
        {/* 텍스트 로고 */}
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 700, 
            fontSize: `${size / 150}rem`,
            mb: showText ? 0.5 : 0,
            background: variant === 'gradient' 
              ? 'linear-gradient(45deg, #fff, #e3f2fd)'
              : variant === 'dark'
              ? 'linear-gradient(45deg, #1976d2, #42a5f5)'
              : textColor,
            backgroundClip: variant === 'gradient' || variant === 'dark' ? 'text' : 'unset',
            WebkitBackgroundClip: variant === 'gradient' || variant === 'dark' ? 'text' : 'unset',
            WebkitTextFillColor: variant === 'gradient' || variant === 'dark' ? 'transparent' : textColor,
            color: variant === 'gradient' || variant === 'dark' ? 'transparent' : textColor,
            letterSpacing: '0.1em'
          }}
        >
          MEETU
        </Typography>
        
        {showText && (
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.8,
              fontSize: `${size / 400}rem`,
              color: textColor,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            AI English Learning Platform
          </Typography>
        )}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {/* 이미지 우선 → SVG 로고 순서 */}
      {imageExists ? renderImageLogo() : renderSvgLogo()}
      
      {/* 장식용 배경 원들 (gradient 버전일 때만, SVG 로고 사용 시) */}
      {variant === 'gradient' && !imageExists && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              width: size * 0.15,
              height: size * 0.15,
              bgcolor: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
              zIndex: -1
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '25%',
              right: '20%',
              width: size * 0.1,
              height: size * 0.1,
              bgcolor: 'rgba(255,255,255,0.06)',
              borderRadius: '50%',
              zIndex: -1
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '40%',
              right: '10%',
              width: size * 0.08,
              height: size * 0.08,
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: '50%',
              zIndex: -1
            }}
          />
        </>
      )}
    </Box>
  )
}

export default MeetuLogo