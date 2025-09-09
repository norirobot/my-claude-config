import React from 'react'
import { Box } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimeCharacterProps {
  characterId: string
  emotion: string
  isTyping?: boolean
}

const AnimeCharacter: React.FC<AnimeCharacterProps> = ({
  characterId,
  emotion,
  isTyping = false
}) => {
  // 캐릭터별 일러스트 설정
  const getCharacterData = () => {
    const characters = {
      jennifer: {
        // 실제 애니메이션 스타일 캐릭터 이미지 URL
        normal: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Teacher.png',
        happy: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Face%20with%20Big%20Eyes.png',
        style: {
          hairColor: '#8B4513',
          outfit: 'teacher'
        }
      },
      alex: {
        normal: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png',
        happy: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png',
        style: {
          hairColor: '#2C1810',
          outfit: 'casual'
        }
      },
      sophia: {
        normal: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Office%20Worker.png',
        happy: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Smiling%20Eyes.png',
        style: {
          hairColor: '#FFD700',
          outfit: 'business'
        }
      }
    }

    return characters[characterId as keyof typeof characters] || characters.jennifer
  }

  const character = getCharacterData()

  // AI 생성 캐릭터 이미지 서비스 사용
  const getAICharacterImage = () => {
    // 실제 게임에서는 미리 준비된 캐릭터 일러스트를 사용하거나
    // AI 이미지 생성 서비스를 활용합니다
    
    const characterStyles = {
      jennifer: {
        prompt: 'anime style, female teacher, brown hair, gentle smile, professional outfit, full body, standing pose',
        seed: 'jennifer123'
      },
      alex: {
        prompt: 'anime style, young male developer, casual clothes, energetic pose, full body',
        seed: 'alex456'
      },
      sophia: {
        prompt: 'anime style, professional woman, business suit, confident pose, full body',
        seed: 'sophia789'
      }
    }

    // Waifu Labs API 스타일 URL (예시)
    return `https://api.waifu.im/search?included_tags=uniform&height=>=2000`
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${characterId}-${emotion}`}
        initial={{ opacity: 0, x: -100 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          y: isTyping ? [0, -10, 0] : 0
        }}
        exit={{ opacity: 0, x: 100 }}
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
          justifyContent: 'center'
        }}
      >
        {/* 임시 고품질 캐릭터 일러스트 */}
        <Box
          sx={{
            width: '400px',
            height: '600px',
            backgroundImage: `url(https://picsum.photos/400/600?random=${characterId})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(180deg, 
                transparent 0%, 
                transparent 70%, 
                rgba(0,0,0,0.1) 100%
              )`,
              pointerEvents: 'none'
            }
          }}
        >
          {/* 캐릭터 이름표 */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: 1
            }}
          >
            {characterId.toUpperCase()}
          </Box>

          {/* 감정 이모티콘 오버레이 */}
          {emotion !== 'normal' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                position: 'absolute',
                top: '10%',
                right: '-20px',
                fontSize: '60px',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              }}
            >
              {emotion === 'happy' && '😊'}
              {emotion === 'sad' && '😢'}
              {emotion === 'surprised' && '😮'}
              {emotion === 'angry' && '😠'}
              {emotion === 'thinking' && '🤔'}
            </motion.div>
          )}

          {/* 말하는 중 인디케이터 */}
          {isTyping && (
            <Box
              sx={{
                position: 'absolute',
                top: '30%',
                right: '-80px',
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
                    delay: i * 0.2
                  }}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#4A90E2'
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* 제스처 애니메이션 효과 */}
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
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

// 실제 프로덕션에서 사용할 고품질 캐릭터 컴포넌트
export const ProCharacter: React.FC<AnimeCharacterProps> = ({ characterId, emotion, isTyping }) => {
  // 실제 캐릭터 애셋 경로
  const characterAssets = {
    jennifer: {
      base: '/assets/characters/jennifer/base.png',
      emotions: {
        normal: '/assets/characters/jennifer/normal.png',
        happy: '/assets/characters/jennifer/happy.png',
        sad: '/assets/characters/jennifer/sad.png',
        surprised: '/assets/characters/jennifer/surprised.png',
        angry: '/assets/characters/jennifer/angry.png',
        thinking: '/assets/characters/jennifer/thinking.png'
      }
    },
    alex: {
      base: '/assets/characters/alex/base.png',
      emotions: {
        normal: '/assets/characters/alex/normal.png',
        happy: '/assets/characters/alex/happy.png',
        sad: '/assets/characters/alex/sad.png',
        surprised: '/assets/characters/alex/surprised.png',
        angry: '/assets/characters/alex/angry.png',
        thinking: '/assets/characters/alex/thinking.png'
      }
    },
    sophia: {
      base: '/assets/characters/sophia/base.png',
      emotions: {
        normal: '/assets/characters/sophia/normal.png',
        happy: '/assets/characters/sophia/happy.png',
        sad: '/assets/characters/sophia/sad.png',
        surprised: '/assets/characters/sophia/surprised.png',
        angry: '/assets/characters/sophia/angry.png',
        thinking: '/assets/characters/sophia/thinking.png'
      }
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        textAlign: 'center',
        flexDirection: 'column'
      }}
    >
      <motion.img
        src={characterAssets[characterId as keyof typeof characterAssets]?.emotions[emotion as keyof typeof characterAssets.jennifer.emotions] || ''}
        alt={characterId}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: isTyping ? [0, -10, 0] : 0
        }}
        transition={{
          duration: 0.5,
          y: {
            duration: 2,
            repeat: isTyping ? Infinity : 0
          }
        }}
      />
    </Box>
  )
}

export default AnimeCharacter