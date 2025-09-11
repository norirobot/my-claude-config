import React from 'react'
import { Box, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

interface VisualNovelCharacterProps {
  characterId: string
  emotion: string
  isTyping?: boolean
}

const VisualNovelCharacter: React.FC<VisualNovelCharacterProps> = ({
  characterId,
  emotion,
  isTyping = false
}) => {
  // 비주얼 노벨 스타일 캐릭터 정의
  const getCharacterData = () => {
    const characters = {
      jennifer: {
        name: 'Jennifer',
        role: 'English Teacher',
        color: '#E91E63',
        description: '친근하고 열정적인 영어 선생님'
      },
      alex: {
        name: 'Alex',
        role: 'Game Developer',
        color: '#2196F3',
        description: '창의적이고 재미있는 게임 개발자'
      },
      sophia: {
        name: 'Sophia',
        role: 'Business Consultant',
        color: '#9C27B0',
        description: '전문적이고 똑똑한 비즈니스 컨설턴트'
      }
    }
    
    return characters[characterId as keyof typeof characters] || characters.jennifer
  }

  const character = getCharacterData()

  // 애니메이션 스타일 캐릭터 실루엣 생성
  const renderCharacterSilhouette = () => {
    return (
      <svg
        width="300"
        height="450"
        viewBox="0 0 300 450"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`gradient-${characterId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={character.color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={character.color} stopOpacity="0.3" />
          </linearGradient>
          <filter id="shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="10" result="offsetblur"/>
            <feFlood floodColor="#000000" floodOpacity="0.3"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 실루엣 몸체 */}
        <g filter="url(#shadow)">
          {/* 머리 */}
          <ellipse 
            cx="150" 
            cy="100" 
            rx="45" 
            ry="55" 
            fill={`url(#gradient-${characterId})`}
          />
          
          {/* 머리카락 */}
          {characterId === 'jennifer' && (
            <>
              <path
                d="M 105 80 Q 90 70 85 90 Q 85 110 95 120"
                fill={character.color}
                opacity="0.6"
              />
              <path
                d="M 195 80 Q 210 70 215 90 Q 215 110 205 120"
                fill={character.color}
                opacity="0.6"
              />
            </>
          )}
          
          {/* 목 */}
          <rect 
            x="135" 
            y="140" 
            width="30" 
            height="30" 
            fill={`url(#gradient-${characterId})`}
          />
          
          {/* 몸통 */}
          <path
            d="M 120 170 Q 100 180 90 220 L 90 350 Q 90 380 110 380 L 190 380 Q 210 380 210 350 L 210 220 Q 200 180 180 170 Z"
            fill={`url(#gradient-${characterId})`}
          />
          
          {/* 팔 */}
          <ellipse 
            cx="85" 
            cy="250" 
            rx="15" 
            ry="60" 
            fill={`url(#gradient-${characterId})`}
            transform="rotate(-10 85 250)"
          />
          <ellipse 
            cx="215" 
            cy="250" 
            rx="15" 
            ry="60" 
            fill={`url(#gradient-${characterId})`}
            transform="rotate(10 215 250)"
          />
        </g>

        {/* 얼굴 특징 (최소한) */}
        <g opacity="0.8">
          {/* 눈 */}
          <circle cx="130" cy="95" r="3" fill="white" />
          <circle cx="170" cy="95" r="3" fill="white" />
          
          {/* 입 - 감정 표현 */}
          <path
            d={
              emotion === 'happy' ? "M 135 115 Q 150 125 165 115" :
              emotion === 'sad' ? "M 135 120 Q 150 115 165 120" :
              "M 140 118 L 160 118"
            }
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* 캐릭터별 특징 */}
        {characterId === 'jennifer' && (
          <rect x="140" y="200" width="20" height="3" fill="white" opacity="0.5" />
        )}
        {characterId === 'alex' && (
          <circle cx="150" cy="200" r="5" fill="white" opacity="0.5" />
        )}
        {characterId === 'sophia' && (
          <path d="M 130 195 L 150 190 L 170 195" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
        )}
      </svg>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${characterId}-${emotion}`}
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: isTyping ? [0, -10, 0] : 0
        }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          y: {
            duration: 2,
            repeat: isTyping ? Infinity : 0,
            ease: "easeInOut"
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {/* 캐릭터 글로우 효과 */}
        <Box
          sx={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, ${character.color}22 0%, transparent 60%)`,
            filter: 'blur(80px)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />

        {/* 캐릭터 실루엣 */}
        <Box
          sx={{
            position: 'relative',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
          }}
        >
          {renderCharacterSilhouette()}
        </Box>

        {/* 캐릭터 정보 패널 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          {/* 이름 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${character.color}, ${character.color}aa)`,
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: '25px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                {character.name}
              </Typography>
            </Box>
          </motion.div>

          {/* 역할 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontSize: '11px',
                letterSpacing: 1,
                backdropFilter: 'blur(10px)'
              }}
            >
              {character.role}
            </Typography>
          </motion.div>
        </Box>

        {/* 감정 이펙트 */}
        {emotion !== 'normal' && (
          <Box
            sx={{
              position: 'absolute',
              top: '15%',
              right: '20%'
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity
              }}
              style={{ 
                fontSize: '60px',
                filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))'
              }}
            >
              {emotion === 'happy' && '✨'}
              {emotion === 'sad' && '💧'}
              {emotion === 'surprised' && '❗'}
              {emotion === 'angry' && '💢'}
              {emotion === 'thinking' && '💭'}
            </motion.div>
          </Box>
        )}

        {/* 말하는 중 표시 */}
        {isTyping && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '30%',
              right: '15%',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: character.color,
                  boxShadow: `0 0 15px ${character.color}`
                }}
              />
            ))}
          </Box>
        )}

        {/* CSS 애니메이션 */}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { 
                opacity: 0.4; 
                transform: scale(0.9);
              }
              50% { 
                opacity: 0.8; 
                transform: scale(1.1);
              }
            }
          `}
        </style>
      </motion.div>
    </AnimatePresence>
  )
}

export default VisualNovelCharacter