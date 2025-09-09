import React from 'react'
import { Box, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

interface ProfessionalCharacterProps {
  characterId: string
  emotion: string
  isTyping?: boolean
}

const ProfessionalCharacter: React.FC<ProfessionalCharacterProps> = ({
  characterId,
  emotion,
  isTyping = false
}) => {
  // 전문적인 애니메이션 스타일 캐릭터 이미지
  // 실제 비주얼 노벨 게임에서 사용하는 스타일의 이미지
  const getCharacterData = () => {
    const characters = {
      jennifer: {
        name: 'Jennifer',
        role: 'English Teacher',
        color: '#E91E63',
        // Anime/Manga 스타일 아바타 생성
        images: {
          normal: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Jennifer&backgroundColor=transparent&size=400`,
          happy: `https://api.dicebear.com/7.x/notionists/svg?seed=Jennifer-happy&backgroundColor=transparent&size=400`,
          sad: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Jennifer-sad&backgroundColor=transparent&size=400`,
          surprised: `https://api.dicebear.com/7.x/notionists/svg?seed=Jennifer-surprised&backgroundColor=transparent&size=400`,
          thinking: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Jennifer-thinking&backgroundColor=transparent&size=400`
        }
      },
      alex: {
        name: 'Alex',
        role: 'Game Developer',
        color: '#2196F3',
        images: {
          normal: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Alex&backgroundColor=transparent&size=400`,
          happy: `https://api.dicebear.com/7.x/notionists/svg?seed=Alex-happy&backgroundColor=transparent&size=400`,
          sad: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Alex-sad&backgroundColor=transparent&size=400`,
          surprised: `https://api.dicebear.com/7.x/notionists/svg?seed=Alex-surprised&backgroundColor=transparent&size=400`,
          thinking: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Alex-thinking&backgroundColor=transparent&size=400`
        }
      },
      sophia: {
        name: 'Sophia',
        role: 'Business Consultant',
        color: '#9C27B0',
        images: {
          normal: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Sophia&backgroundColor=transparent&size=400`,
          happy: `https://api.dicebear.com/7.x/notionists/svg?seed=Sophia-happy&backgroundColor=transparent&size=400`,
          sad: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Sophia-sad&backgroundColor=transparent&size=400`,
          surprised: `https://api.dicebear.com/7.x/notionists/svg?seed=Sophia-surprised&backgroundColor=transparent&size=400`,
          thinking: `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Sophia-thinking&backgroundColor=transparent&size=400`
        }
      }
    }
    
    return characters[characterId as keyof typeof characters] || characters.jennifer
  }

  const character = getCharacterData()
  const currentImage = character.images[emotion as keyof typeof character.images] || character.images.normal

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${characterId}-${emotion}`}
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: isTyping ? [0, -10, 0] : 0
        }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative'
        }}
      >
        {/* 캐릭터 백그라운드 글로우 효과 */}
        <Box
          sx={{
            position: 'absolute',
            width: '120%',
            height: '120%',
            background: `radial-gradient(circle, ${character.color}22 0%, transparent 70%)`,
            filter: 'blur(40px)',
            zIndex: -1
          }}
        />

        {/* 메인 캐릭터 컨테이너 */}
        <Box
          sx={{
            width: '350px',
            height: '500px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* 캐릭터 이미지 */}
          <Box
            component="img"
            src={currentImage}
            alt={character.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
              transition: 'all 0.3s ease'
            }}
            onError={(e: any) => {
              // 폴백 이미지
              e.target.src = `https://ui-avatars.com/api/?name=${character.name}&size=400&background=${character.color.slice(1)}&color=fff&bold=true&font-size=0.5`
            }}
          />

          {/* 캐릭터 정보 패널 */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -60,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}
          >
            {/* 이름 태그 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Box
                sx={{
                  backgroundColor: character.color,
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: `8px solid ${character.color}`
                  }
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {character.name}
                </Typography>
              </Box>
            </motion.div>

            {/* 역할 태그 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '12px',
                  letterSpacing: 1
                }}
              >
                {character.role}
              </Box>
            </motion.div>
          </Box>

          {/* 감정 이펙트 */}
          {emotion !== 'normal' && (
            <Box
              sx={{
                position: 'absolute',
                top: '10%',
                right: '-20px'
              }}
            >
              <motion.div
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
                style={{ fontSize: '48px' }}
              >
                {emotion === 'happy' && '😊'}
                {emotion === 'sad' && '😢'}
                {emotion === 'surprised' && '😮'}
                {emotion === 'angry' && '😠'}
                {emotion === 'thinking' && '🤔'}
              </motion.div>
            </Box>
          )}

          {/* 말하는 중 인디케이터 */}
          {isTyping && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '40%',
                right: '-40px',
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
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: character.color,
                    boxShadow: `0 0 10px ${character.color}`
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* 바닥 그림자 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            width: '60%',
            height: '40px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scaleX(1.5)'
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default ProfessionalCharacter