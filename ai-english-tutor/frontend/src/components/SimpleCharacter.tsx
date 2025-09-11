import React from 'react'
import { Box } from '@mui/material'
import { motion } from 'framer-motion'

interface SimpleCharacterProps {
  characterId: string
  emotion: string
  isTyping?: boolean
}

const SimpleCharacter: React.FC<SimpleCharacterProps> = ({
  characterId,
  emotion,
  isTyping = false
}) => {
  // 간단한 SVG 캐릭터 생성
  const renderCharacter = () => {
    const colors = {
      jennifer: {
        hair: '#8B4513',
        skin: '#FDBCB4',
        outfit: '#4A90E2',
        eyes: '#4A5568'
      },
      alex: {
        hair: '#2C1810',
        skin: '#F5DEB3',
        outfit: '#48BB78',
        eyes: '#2D3748'
      },
      sophia: {
        hair: '#FFD700',
        skin: '#FFE4C4',
        outfit: '#9F7AEA',
        eyes: '#1A365D'
      }
    }

    const character = colors[characterId as keyof typeof colors] || colors.jennifer

    return (
      <svg
        width="300"
        height="400"
        viewBox="0 0 300 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 몸통 */}
        <ellipse
          cx="150"
          cy="320"
          rx="60"
          ry="80"
          fill={character.outfit}
        />
        
        {/* 목 */}
        <rect
          x="135"
          y="220"
          width="30"
          height="40"
          fill={character.skin}
        />
        
        {/* 얼굴 */}
        <ellipse
          cx="150"
          cy="180"
          rx="55"
          ry="65"
          fill={character.skin}
        />
        
        {/* 머리카락 뒷부분 */}
        <ellipse
          cx="150"
          cy="150"
          rx="60"
          ry="50"
          fill={character.hair}
        />
        
        {/* 앞머리 */}
        <path
          d={`M 90 150 Q 150 140 210 150 L 210 130 Q 150 110 90 130 Z`}
          fill={character.hair}
        />
        
        {/* 눈 */}
        <circle cx="130" cy="175" r="5" fill={character.eyes} />
        <circle cx="170" cy="175" r="5" fill={character.eyes} />
        
        {/* 눈동자 하이라이트 */}
        <circle cx="131" cy="174" r="2" fill="white" />
        <circle cx="171" cy="174" r="2" fill="white" />
        
        {/* 눈썹 */}
        <path
          d={emotion === 'angry' ? "M 120 165 L 135 160" : "M 120 160 L 135 162"}
          stroke={character.hair}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={emotion === 'angry' ? "M 165 160 L 180 165" : "M 165 162 L 180 160"}
          stroke={character.hair}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* 입 */}
        <path
          d={
            emotion === 'happy' ? "M 135 200 Q 150 210 165 200" :
            emotion === 'sad' ? "M 135 210 Q 150 200 165 210" :
            "M 135 205 L 165 205"
          }
          stroke="#E85D75"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* 팔 */}
        <ellipse
          cx="90"
          cy="280"
          rx="20"
          ry="60"
          fill={character.outfit}
          transform="rotate(-20 90 280)"
        />
        <ellipse
          cx="210"
          cy="280"
          rx="20"
          ry="60"
          fill={character.outfit}
          transform="rotate(20 210 280)"
        />
        
        {/* 손 */}
        <circle cx="75" cy="340" r="15" fill={character.skin} />
        <circle cx="225" cy="340" r="15" fill={character.skin} />
        
        {/* 옷 디테일 */}
        {characterId === 'jennifer' && (
          <rect x="140" y="270" width="20" height="30" fill="white" rx="2" />
        )}
        
        {characterId === 'alex' && (
          <circle cx="150" cy="280" r="5" fill="white" />
        )}
        
        {characterId === 'sophia' && (
          <path
            d="M 130 260 L 150 250 L 170 260"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        )}
      </svg>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: 1, 
        y: isTyping ? [0, -10, 0] : 0,
        scale: emotion === 'surprised' ? [1, 1.1, 1] : 1
      }}
      transition={{ 
        duration: 0.5,
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
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
        }}
      >
        {renderCharacter()}
      </Box>
      
      {/* 감정 이모티콘 */}
      {emotion !== 'normal' && (
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            fontSize: '40px'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {emotion === 'happy' && '✨'}
            {emotion === 'sad' && '💧'}
            {emotion === 'surprised' && '❗'}
            {emotion === 'angry' && '💢'}
            {emotion === 'thinking' && '💭'}
          </motion.div>
        </Box>
      )}
    </motion.div>
  )
}

export default SimpleCharacter