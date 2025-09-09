import React from 'react'
import { Box, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

interface RealisticCharacterProps {
  characterId: string
  emotion: string
  isTyping?: boolean
  scenario?: string
}

const RealisticCharacter: React.FC<RealisticCharacterProps> = ({
  characterId,
  emotion,
  isTyping = false,
  scenario = 'cafe'
}) => {
  // 실제 사람 사진 스타일 캐릭터 - Unsplash의 사람 사진 사용
  const getCharacterData = () => {
    const characters = {
      jennifer: {
        name: 'Jennifer',
        role: 'English Teacher',
        color: '#E91E63',
        // 카페, 공원, 교실 등 각 장소에 맞는 사람 사진
        images: {
          cafe: {
            normal: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=600&fit=crop&crop=faces'
          },
          park: {
            normal: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=600&fit=crop&crop=faces'
          },
          classroom: {
            normal: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=600&fit=crop&crop=faces'
          },
          restaurant: {
            normal: 'https://images.unsplash.com/photo-1557555187-23d685287bc3?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=600&fit=crop&crop=faces'
          }
        }
      },
      alex: {
        name: 'Alex',
        role: 'Game Developer',
        color: '#2196F3',
        images: {
          cafe: {
            normal: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces'
          },
          park: {
            normal: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=600&fit=crop&crop=faces'
          },
          classroom: {
            normal: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces'
          },
          restaurant: {
            normal: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=600&fit=crop&crop=faces'
          }
        }
      },
      sophia: {
        name: 'Sophia',
        role: 'Business Consultant',
        color: '#9C27B0',
        images: {
          cafe: {
            normal: 'https://images.unsplash.com/photo-1558898479-33c0057a5d12?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1608549036505-ead5b1de5417?w=400&h=600&fit=crop&crop=faces'
          },
          park: {
            normal: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=400&h=600&fit=crop&crop=faces'
          },
          classroom: {
            normal: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1608549036505-ead5b1de5417?w=400&h=600&fit=crop&crop=faces'
          },
          restaurant: {
            normal: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&crop=faces',
            happy: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=faces',
            sad: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=400&h=600&fit=crop&crop=faces'
          }
        }
      }
    }
    
    return characters[characterId as keyof typeof characters] || characters.jennifer
  }

  const character = getCharacterData()
  const scenarioImages = character.images[scenario as keyof typeof character.images] || character.images.cafe
  const currentImage = scenarioImages[emotion as keyof typeof scenarioImages] || scenarioImages.normal

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${characterId}-${emotion}-${scenario}`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          y: isTyping ? [0, -10, 0] : 0
        }}
        exit={{ opacity: 0, x: 50 }}
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
        {/* 캐릭터 컨테이너 */}
        <Box
          sx={{
            width: '350px',
            height: '500px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          {/* 캐릭터 이미지 - 실제 사람 사진 */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '0 0 20px 20px'
            }}
          >
            <Box
              component="img"
              src={currentImage}
              alt={character.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                filter: 'contrast(1.1) brightness(1.05)',
                transition: 'all 0.3s ease'
              }}
              onError={(e: any) => {
                // 폴백 이미지
                e.target.src = `https://ui-avatars.com/api/?name=${character.name}&size=400&background=${character.color.slice(1)}&color=fff&bold=true`
              }}
            />
            
            {/* 그라데이션 오버레이 - 하단 페이드 */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                pointerEvents: 'none'
              }}
            />
          </Box>

          {/* 캐릭터 이름표 */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box
              sx={{
                backgroundColor: character.color,
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {character.name}
              </Typography>
            </Box>
            
            <Box
              sx={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontSize: '11px',
                letterSpacing: 1,
                backdropFilter: 'blur(10px)'
              }}
            >
              {character.role}
            </Box>
          </Box>

          {/* 감정 표시 */}
          {emotion !== 'normal' && (
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: '50%',
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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
                style={{ fontSize: '30px' }}
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
                right: -30,
                display: 'flex',
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
      </motion.div>
    </AnimatePresence>
  )
}

export default RealisticCharacter