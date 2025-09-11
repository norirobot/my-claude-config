import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

interface CharacterIllustrationProps {
  characterId: string
  emotion: string
  isTyping?: boolean
}

const CharacterIllustration: React.FC<CharacterIllustrationProps> = ({
  characterId,
  emotion,
  isTyping = false
}) => {
  const [gesture, setGesture] = useState('idle')

  // 캐릭터별 SVG 일러스트레이션 생성
  const getCharacterSVG = () => {
    // 실제로는 각 캐릭터/감정별 SVG 파일을 사용하거나
    // React 컴포넌트로 직접 그려야 합니다
    return (
      <svg
        width="400"
        height="600"
        viewBox="0 0 400 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 몸통 */}
        <motion.ellipse
          cx="200"
          cy="400"
          rx="80"
          ry="150"
          fill="#4A90E2"
          initial={{ scaleY: 1 }}
          animate={{ 
            scaleY: isTyping ? [1, 1.02, 1] : 1,
          }}
          transition={{ 
            duration: 2,
            repeat: isTyping ? Infinity : 0
          }}
        />
        
        {/* 팔 - 왼쪽 */}
        <motion.path
          d="M 120 350 Q 80 380 70 450"
          stroke="#4A90E2"
          strokeWidth="30"
          fill="none"
          strokeLinecap="round"
          initial={{ rotate: 0 }}
          animate={{ 
            rotate: emotion === 'happy' ? [-5, 5, -5] : 
                   emotion === 'thinking' ? [0, -10, 0] : 0,
            originX: '120px',
            originY: '350px'
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 팔 - 오른쪽 */}
        <motion.path
          d="M 280 350 Q 320 380 330 450"
          stroke="#4A90E2"
          strokeWidth="30"
          fill="none"
          strokeLinecap="round"
          initial={{ rotate: 0 }}
          animate={{ 
            rotate: emotion === 'happy' ? [5, -5, 5] : 
                   emotion === 'surprised' ? [0, 20, 0] : 
                   isTyping ? [0, -15, 0, -15, 0] : 0,
            originX: '280px',
            originY: '350px'
          }}
          transition={{ 
            duration: isTyping ? 1 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 머리 */}
        <motion.circle
          cx="200"
          cy="200"
          r="80"
          fill="#FFD4A3"
          initial={{ y: 0 }}
          animate={{ 
            y: emotion === 'happy' ? [0, -5, 0] : 0,
            scale: emotion === 'surprised' ? [1, 1.1, 1] : 1
          }}
          transition={{ 
            duration: 2,
            repeat: emotion === 'happy' ? Infinity : 0
          }}
        />
        
        {/* 머리카락 */}
        {characterId === 'jennifer' && (
          <motion.path
            d="M 120 180 Q 200 140 280 180 L 280 160 Q 200 100 120 160 Z"
            fill="#8B4513"
            initial={{ scaleY: 1 }}
            animate={{ 
              scaleY: emotion === 'surprised' ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.5 }}
          />
        )}
        
        {characterId === 'alex' && (
          <motion.path
            d="M 140 180 Q 200 160 260 180 L 260 170 Q 200 140 140 170 Z"
            fill="#2C1810"
          />
        )}
        
        {characterId === 'sophia' && (
          <motion.path
            d="M 120 180 Q 200 150 280 180 L 280 200 Q 200 180 120 200 Z"
            fill="#FFD700"
          />
        )}
        
        {/* 눈 */}
        <motion.circle
          cx="170"
          cy="190"
          r="8"
          fill="#000"
          animate={{ 
            scaleY: emotion === 'happy' ? 0.3 : 
                    emotion === 'sad' ? 1.2 : 1,
            y: emotion === 'sad' ? 5 : 0
          }}
        />
        <motion.circle
          cx="230"
          cy="190"
          r="8"
          fill="#000"
          animate={{ 
            scaleY: emotion === 'happy' ? 0.3 : 
                    emotion === 'sad' ? 1.2 : 1,
            y: emotion === 'sad' ? 5 : 0
          }}
        />
        
        {/* 눈썹 */}
        <motion.path
          d="M 160 175 L 180 175"
          stroke="#8B4513"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ 
            d: emotion === 'angry' ? "M 160 180 L 180 170" :
               emotion === 'sad' ? "M 160 170 L 180 175" :
               emotion === 'surprised' ? "M 160 165 L 180 165" :
               "M 160 175 L 180 175"
          }}
        />
        <motion.path
          d="M 220 175 L 240 175"
          stroke="#8B4513"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ 
            d: emotion === 'angry' ? "M 220 170 L 240 180" :
               emotion === 'sad' ? "M 220 175 L 240 170" :
               emotion === 'surprised' ? "M 220 165 L 240 165" :
               "M 220 175 L 240 175"
          }}
        />
        
        {/* 입 */}
        <motion.path
          d="M 180 220 Q 200 230 220 220"
          stroke="#E85D75"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={{ 
            d: emotion === 'happy' ? "M 170 220 Q 200 240 230 220" :
               emotion === 'sad' ? "M 180 230 Q 200 220 220 230" :
               emotion === 'surprised' ? "M 190 225 Q 200 235 210 225" :
               emotion === 'thinking' ? "M 185 225 L 215 225" :
               "M 180 220 Q 200 230 220 220"
          }}
        />
        
        {/* 다리 */}
        <motion.rect
          x="170"
          y="500"
          width="25"
          height="100"
          fill="#4A90E2"
          rx="12"
          animate={{
            rotate: isTyping ? [0, -2, 0, 2, 0] : 0,
            originX: '182px',
            originY: '500px'
          }}
          transition={{
            duration: 4,
            repeat: Infinity
          }}
        />
        <motion.rect
          x="205"
          y="500"
          width="25"
          height="100"
          fill="#4A90E2"
          rx="12"
          animate={{
            rotate: isTyping ? [0, 2, 0, -2, 0] : 0,
            originX: '217px',
            originY: '500px'
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 0.5
          }}
        />
        
        {/* 감정 표현 추가 요소 */}
        {emotion === 'happy' && (
          <>
            <motion.text
              x="250"
              y="150"
              fontSize="30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.text>
            <motion.text
              x="130"
              y="150"
              fontSize="30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              ✨
            </motion.text>
          </>
        )}
        
        {emotion === 'thinking' && (
          <motion.text
            x="250"
            y="150"
            fontSize="40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            💭
          </motion.text>
        )}
        
        {emotion === 'surprised' && (
          <>
            <motion.text
              x="250"
              y="180"
              fontSize="30"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              ❗
            </motion.text>
          </>
        )}
        
        {/* 말하는 중 표시 */}
        {isTyping && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.circle
              cx="280"
              cy="250"
              r="5"
              fill="#666"
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: 0
              }}
            />
            <motion.circle
              cx="295"
              cy="245"
              r="5"
              fill="#666"
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: 0.2
              }}
            />
            <motion.circle
              cx="310"
              cy="240"
              r="5"
              fill="#666"
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: 0.4
              }}
            />
          </motion.g>
        )}
      </svg>
    )
  }

  // 랜덤 제스처 애니메이션
  useEffect(() => {
    const gestures = ['wave', 'nod', 'idle', 'think']
    const interval = setInterval(() => {
      if (!isTyping) {
        const randomGesture = gestures[Math.floor(Math.random() * gestures.length)]
        setGesture(randomGesture)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isTyping])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${characterId}-${emotion}`}
        initial={{ opacity: 0, scale: 0.8, x: -100 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          x: 0,
          rotate: gesture === 'wave' ? [0, -5, 5, -5, 0] : 0
        }}
        exit={{ opacity: 0, scale: 0.8, x: 100 }}
        transition={{ 
          duration: 0.5,
          rotate: { duration: 1 }
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
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
            animation: gesture === 'nod' ? 'nod 2s ease-in-out' : 
                      gesture === 'idle' ? 'float 4s ease-in-out infinite' : 
                      'none'
          }}
        >
          {getCharacterSVG()}
        </Box>
      </motion.div>
      
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes nod {
            0%, 100% { transform: rotateX(0deg); }
            25% { transform: rotateX(10deg); }
            75% { transform: rotateX(-10deg); }
          }
        `}
      </style>
    </AnimatePresence>
  )
}

export default CharacterIllustration