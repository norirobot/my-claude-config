import React from 'react'
import { Box, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

interface GameCharacterProps {
  characterId: string
  emotion: string
  isTyping?: boolean
}

const GameCharacter: React.FC<GameCharacterProps> = ({
  characterId,
  emotion,
  isTyping = false
}) => {
  // 애니메이션 스타일 아바타 생성 (DiceBear Avatars)
  const getCharacterImage = () => {
    // DiceBear의 lorelei 스타일 - 애니메이션 스타일 아바타
    const characterSettings = {
      jennifer: {
        seed: 'Jennifer',
        hair: 'variant04',
        backgroundColor: 'b6e3f4',
        eyes: 'variant24',
        mouth: emotion === 'happy' ? 'happy01' : emotion === 'sad' ? 'sad08' : 'happy07'
      },
      alex: {
        seed: 'Alex',
        hair: 'variant01',
        backgroundColor: 'c0aede',
        eyes: 'variant12',
        mouth: emotion === 'happy' ? 'happy02' : emotion === 'sad' ? 'sad07' : 'happy06'
      },
      sophia: {
        seed: 'Sophia',
        hair: 'variant28',
        backgroundColor: 'ffd5dc',
        eyes: 'variant20',
        mouth: emotion === 'happy' ? 'happy03' : emotion === 'sad' ? 'sad06' : 'happy05'
      }
    }
    
    const settings = characterSettings[characterId as keyof typeof characterSettings] || characterSettings.jennifer
    
    // lorelei 스타일로 사람 같은 아바타 생성
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${settings.seed}&backgroundColor=${settings.backgroundColor}&hair=${settings.hair}&eyes=${settings.eyes}&mouth=${settings.mouth}&size=400`
  }

  // 캐릭터 정보
  const getCharacterInfo = () => {
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
          alignItems: 'flex-end',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {/* 캐릭터 실루엣/그림자 효과 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            width: '70%',
            height: '40px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scaleX(1.2)'
          }}
        />

        {/* 메인 캐릭터 컨테이너 */}
        <Box
          component={motion.div}
          animate={{
            rotate: emotion === 'happy' ? [0, -2, 2, 0] : 0,
            scale: emotion === 'surprised' ? [1, 1.05, 1] : 1
          }}
          transition={{
            duration: 2,
            repeat: emotion === 'happy' ? Infinity : 0
          }}
          sx={{
            width: '400px',
            height: '600px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {/* 캐릭터 이미지 - 애니메이션 스타일 */}
          <Box
            component="img"
            src={getCharacterImage()}
            alt={characterId}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
              borderRadius: '10px',
            }}
            onError={(e: any) => {
              // 이미지 로드 실패시 대체 이미지
              e.target.src = `https://ui-avatars.com/api/?name=${getCharacterInfo().name}&size=400&background=${getCharacterInfo().color.slice(1)}&color=fff&bold=true`
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              pointerEvents: 'none'
            }}
          >
            {/* 캐릭터 이름과 역할 표시 */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  backgroundColor: getCharacterInfo().color,
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '18px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  mb: 1
                }}
              >
                {getCharacterInfo().name}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '12px'
                }}
              >
                {getCharacterInfo().role}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 감정 표현 이펙트 */}
        {emotion !== 'normal' && (
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              fontSize: '48px'
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
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

        {/* 말하는 중 표시 */}
        {isTyping && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '50%',
              right: '-60px',
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
                  backgroundColor: '#4A90E2',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            ))}
          </Box>
        )}

        {/* 캐릭터 숨쉬기 애니메이션 */}
        <motion.div
          animate={{
            scaleY: [1, 1.02, 1],
            scaleX: [1, 0.98, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default GameCharacter