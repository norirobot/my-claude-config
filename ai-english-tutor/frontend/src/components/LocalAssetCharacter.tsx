import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

interface LocalAssetCharacterProps {
  characterId: string
  emotion: string
  isTyping?: boolean
}

const LocalAssetCharacter: React.FC<LocalAssetCharacterProps> = ({
  characterId,
  emotion,
  isTyping = false
}) => {
  const [imageError, setImageError] = useState(false)
  
  // 캐릭터 정보
  const getCharacterData = () => {
    const characters = {
      jennifer: {
        name: 'Jennifer',
        role: 'English Teacher',
        color: '#E91E63'
      },
      alex: {
        name: 'Alex',
        role: 'Game Developer',
        color: '#2196F3'
      },
      sophia: {
        name: 'Sophia',
        role: 'Business Consultant',
        color: '#9C27B0'
      }
    }
    
    return characters[characterId as keyof typeof characters] || characters.jennifer
  }

  const character = getCharacterData()
  
  // 로컬 이미지 경로
  const getImagePath = () => {
    // public 폴더의 애셋 사용
    return `/assets/characters/${characterId}/${emotion}.png`
  }

  // 폴백 이미지 경로
  const getFallbackImage = () => {
    // 기본 이미지가 없으면 normal.png 사용
    return `/assets/characters/${characterId}/normal.png`
  }

  // 플레이스홀더 (애셋이 아직 없을 경우)
  const getPlaceholder = () => {
    // DiceBear API를 임시로 사용
    return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${characterId}-${emotion}&backgroundColor=transparent&size=400`
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${characterId}-${emotion}`}
        initial={{ opacity: 0, x: -50, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          scale: 1,
          y: isTyping ? [0, -10, 0] : 0
        }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        transition={{ 
          duration: 0.6,
          type: "spring",
          stiffness: 100,
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
          justifyContent: 'flex-end',
          position: 'relative'
        }}
      >
        {/* 캐릭터 글로우 효과 */}
        <Box
          sx={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            background: `radial-gradient(circle, ${character.color}33 0%, transparent 70%)`,
            filter: 'blur(100px)',
            zIndex: 0
          }}
        />

        {/* 캐릭터 이미지 컨테이너 */}
        <Box
          sx={{
            width: '400px',
            height: '600px',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          {/* 캐릭터 이미지 */}
          <motion.img
            src={imageError ? getPlaceholder() : getImagePath()}
            alt={character.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))'
            }}
            onError={(e) => {
              console.log(`이미지를 찾을 수 없습니다: ${getImagePath()}`)
              console.log('플레이스홀더 이미지를 사용합니다.')
              setImageError(true)
            }}
            animate={{
              scale: emotion === 'surprised' ? [1, 1.05, 1] : 1,
              rotate: emotion === 'happy' ? [0, -2, 2, 0] : 0
            }}
            transition={{
              duration: 2,
              repeat: emotion === 'happy' ? Infinity : 0
            }}
          />

          {/* 캐릭터 이름표 */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -50,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              zIndex: 2
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${character.color}, ${character.color}dd)`,
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: '30px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {character.name}
                </Typography>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '12px',
                  letterSpacing: 1,
                  backdropFilter: 'blur(10px)'
                }}
              >
                {character.role}
              </Typography>
            </motion.div>
          </Box>

          {/* 감정 표시 이모티콘 */}
          {emotion !== 'normal' && (
            <Box
              sx={{
                position: 'absolute',
                top: 50,
                right: 20,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: '50%',
                width: 70,
                height: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
              }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
                style={{ fontSize: '35px' }}
              >
                {emotion === 'happy' && '😊'}
                {emotion === 'sad' && '😢'}
                {emotion === 'surprised' && '😮'}
                {emotion === 'angry' && '😠'}
                {emotion === 'thinking' && '🤔'}
              </motion.div>
            </Box>
          )}

          {/* 말하는 중 표시 */}
          {isTyping && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 100,
                right: -40,
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
        </Box>

        {/* 애셋 없음 안내 메시지 */}
        {imageError && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              p: 2,
              borderRadius: 2,
              textAlign: 'center',
              maxWidth: 300
            }}
          >
            <Typography variant="caption">
              캐릭터 이미지를 찾을 수 없습니다.
              <br />
              /public/assets/characters/{characterId}/{emotion}.png
              <br />
              위치에 이미지를 추가해주세요.
            </Typography>
          </Box>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default LocalAssetCharacter