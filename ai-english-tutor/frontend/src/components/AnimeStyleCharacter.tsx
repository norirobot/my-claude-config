import React from 'react'
import { Box, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimeStyleCharacterProps {
  characterId: string
  emotion: string
  isTyping?: boolean
}

const AnimeStyleCharacter: React.FC<AnimeStyleCharacterProps> = ({
  characterId,
  emotion,
  isTyping = false
}) => {
  // 실제 애니메이션 스타일 캐릭터 - 무료 일러스트 사용
  const getCharacterData = () => {
    const characters = {
      jennifer: {
        name: 'Jennifer',
        role: 'English Teacher',
        color: '#E91E63',
        // 실제 애니메이션 스타일 여성 교사 캐릭터
        images: {
          normal: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Teacher.png',
          happy: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Teacher.png',
          sad: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Teacher.png',
          surprised: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Teacher.png',
          thinking: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Teacher.png'
        },
        description: 'Friendly English teacher who loves helping students'
      },
      alex: {
        name: 'Alex',
        role: 'Game Developer',
        color: '#2196F3',
        // 실제 애니메이션 스타일 남성 개발자 캐릭터
        images: {
          normal: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png',
          happy: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png',
          sad: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png',
          surprised: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png',
          thinking: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png'
        },
        description: 'Creative game developer with passion for coding'
      },
      sophia: {
        name: 'Sophia',
        role: 'Business Consultant',
        color: '#9C27B0',
        // 실제 애니메이션 스타일 여성 비즈니스 캐릭터
        images: {
          normal: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Office%20Worker.png',
          happy: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Office%20Worker.png',
          sad: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Office%20Worker.png',
          surprised: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Office%20Worker.png',
          thinking: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Office%20Worker.png'
        },
        description: 'Professional business consultant with global experience'
      }
    }
    
    return characters[characterId as keyof typeof characters] || characters.jennifer
  }

  const character = getCharacterData()
  const currentImage = character.images[emotion as keyof typeof character.images] || character.images.normal

  // 감정별 얼굴 표정 오버레이
  const getEmotionOverlay = () => {
    const overlays = {
      happy: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Face%20with%20Big%20Eyes.png',
      sad: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Crying%20Face.png',
      surprised: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Open%20Mouth.png',
      angry: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Pouting%20Face.png',
      thinking: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Thinking%20Face.png',
      normal: null
    }
    return overlays[emotion as keyof typeof overlays]
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${characterId}-${emotion}`}
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: isTyping ? [0, -15, 0] : 0
        }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        transition={{ 
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          y: {
            duration: 2.5,
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
            background: `radial-gradient(circle, ${character.color}33 0%, transparent 60%)`,
            filter: 'blur(60px)',
            animation: 'pulse 3s ease-in-out infinite'
          }}
        />

        {/* 메인 캐릭터 */}
        <Box
          sx={{
            width: '300px',
            height: '300px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* 캐릭터 이미지 */}
          <motion.div
            animate={{
              rotate: emotion === 'happy' ? [0, -5, 5, 0] : 0,
              scale: emotion === 'surprised' ? [1, 1.1, 1] : 1
            }}
            transition={{
              duration: 2,
              repeat: emotion === 'happy' ? Infinity : 0
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
              component="img"
              src={currentImage}
              alt={character.name}
              sx={{
                width: '250px',
                height: '250px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.4))',
                transition: 'all 0.3s ease'
              }}
              onError={(e: any) => {
                // 폴백 - 심플한 아바타
                e.target.src = `https://api.dicebear.com/7.x/big-smile/svg?seed=${character.name}&backgroundColor=${character.color.slice(1)}&size=250`
              }}
            />
          </motion.div>

          {/* 감정 표현 오버레이 */}
          {emotion !== 'normal' && getEmotionOverlay() && (
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: '80px',
                height: '80px'
              }}
            >
              <motion.img
                src={getEmotionOverlay()}
                alt={emotion}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: 0
                }}
                transition={{ 
                  duration: 0.5,
                  scale: {
                    duration: 2,
                    repeat: Infinity
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}
              />
            </Box>
          )}

          {/* 말하는 중 표시 */}
          {isTyping && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 50,
                right: -50,
                display: 'flex',
                gap: 1
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3
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

        {/* 캐릭터 정보 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ marginTop: '20px' }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${character.color}ee, ${character.color}99)`,
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              px: 4,
              py: 2,
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              border: `2px solid ${character.color}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shimmer 3s infinite'
              }
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 0.5
              }}
            >
              {character.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                display: 'block',
                fontSize: '12px',
                letterSpacing: 1
              }}
            >
              {character.role}
            </Typography>
          </Box>
        </motion.div>

        {/* CSS 애니메이션 */}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.1); }
            }
            
            @keyframes shimmer {
              0% { left: -100%; }
              100% { left: 200%; }
            }
          `}
        </style>
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimeStyleCharacter