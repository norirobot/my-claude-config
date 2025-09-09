import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Fade,
  Grow,
  Slide,
  Avatar,
  LinearProgress,
  Chip,
  Menu,
  MenuItem,
  useTheme,
  alpha
} from '@mui/material'
import {
  Send as SendIcon,
  Settings as SettingsIcon,
  VolumeUp as VolumeIcon,
  Save as SaveIcon,
  Replay as ReplayIcon,
  ChevronRight as NextIcon,
  FavoriteBorder,
  Favorite
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import LocalAssetCharacter from '../components/LocalAssetCharacter'

interface Character {
  id: string
  name: string
  imageUrl: string
  currentEmotion: 'normal' | 'happy' | 'sad' | 'surprised' | 'angry' | 'thinking'
}

interface Scenario {
  id: string
  name: string
  backgroundUrl: string
  ambientSound?: string
}

interface DialogueMessage {
  id: string
  character: string
  text: string
  emotion: string
  isUser?: boolean
}

const VisualNovelStoryMode: React.FC = () => {
  const theme = useTheme()
  const [currentCharacter, setCurrentCharacter] = useState<string>('jennifer')
  const [currentScenario, setCurrentScenario] = useState<string>('cafe')
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [characterEmotion, setCharacterEmotion] = useState<string>('normal')
  const [showSettings, setShowSettings] = useState(false)
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null)
  const [relationshipLevel, setRelationshipLevel] = useState(3)
  const [autoMode, setAutoMode] = useState(false)
  const textFieldRef = useRef<HTMLInputElement>(null)

  // 캐릭터 데이터 - 전신 일러스트
  const characters: Record<string, Character> = {
    jennifer: {
      id: 'jennifer',
      name: 'Jennifer',
      imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Jennifer&size=500&backgroundColor=transparent',
      currentEmotion: 'normal'
    },
    alex: {
      id: 'alex',
      name: 'Alex',
      imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex&size=500&backgroundColor=transparent',
      currentEmotion: 'normal'
    },
    sophia: {
      id: 'sophia',
      name: 'Sophia',
      imageUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Sophia&size=500&backgroundColor=transparent',
      currentEmotion: 'normal'
    }
  }

  // 시나리오 배경 이미지 - 실제 작동하는 이미지
  const scenarios: Record<string, Scenario> = {
    cafe: {
      id: 'cafe',
      name: 'Cozy Cafe',
      backgroundUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1920&h=1080&fit=crop&auto=format',
      ambientSound: 'cafe-ambient.mp3'
    },
    park: {
      id: 'park',
      name: 'Cherry Blossom Park',
      backgroundUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&h=1080&fit=crop&auto=format',
      ambientSound: 'nature-ambient.mp3'
    },
    classroom: {
      id: 'classroom',
      name: 'Study Room',
      backgroundUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&h=1080&fit=crop&auto=format',
      ambientSound: 'quiet-room.mp3'
    },
    restaurant: {
      id: 'restaurant',
      name: 'Korean Restaurant',
      backgroundUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop&auto=format',
      ambientSound: 'restaurant-ambient.mp3'
    }
  }

  // 캐릭터 감정별 이미지 변화 (실제로는 다른 이미지 URL 사용)
  const getCharacterImage = (characterId: string, emotion: string) => {
    const emotionMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      surprised: '😮',
      angry: '😠',
      thinking: '🤔',
      normal: '😐'
    }
    
    // 실제로는 emotion별 다른 일러스트 URL 반환
    return characters[characterId]?.imageUrl || ''
  }

  // 대화 전송
  const sendMessage = async () => {
    if (!inputText.trim()) return

    // 사용자 메시지는 대화 기록에 추가하지만 화면에는 표시하지 않음
    const userMessage: DialogueMessage = {
      id: Date.now().toString(),
      character: 'You',
      text: inputText,
      emotion: 'normal',
      isUser: true
    }

    setInputText('')
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:3001/api/story/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: currentCharacter,
          scenario: currentScenario,
          message: inputText,
          sessionId: 'visual-novel-session-1'
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        setTimeout(() => {
          const aiMessage: DialogueMessage = {
            id: (Date.now() + 1).toString(),
            character: characters[currentCharacter]?.name || 'AI',
            text: data.message,
            emotion: data.emotion || 'normal',
            isUser: false
          }
          
          setDialogue([aiMessage]) // 한 번에 하나의 대화만 표시
          setCharacterEmotion(data.emotion || 'normal')
          setIsTyping(false)
          
          if (data.relationshipLevel) {
            setRelationshipLevel(data.relationshipLevel)
          }
        }, 1500)
      }
    } catch (error) {
      console.error('Story chat error:', error)
      setIsTyping(false)
      
      // 데모 응답
      const demoResponse: DialogueMessage = {
        id: (Date.now() + 1).toString(),
        character: characters[currentCharacter]?.name || 'AI',
        text: "Oh, that sounds wonderful! I'd love to hear more about your experiences. This place has such a nice atmosphere, doesn't it?",
        emotion: 'happy',
        isUser: false
      }
      
      setTimeout(() => {
        setDialogue([demoResponse])
        setCharacterEmotion('happy')
        setIsTyping(false)
      }, 1500)
    }
  }

  // 다음 대화로 진행
  const nextDialogue = () => {
    // 자동 모드에서 다음 대화 진행 로직
    if (autoMode && dialogue.length > 0) {
      setTimeout(() => {
        // 다음 대화 로드
      }, 3000)
    }
  }

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (inputText.trim()) {
          sendMessage()
        }
      }
      if (e.key === ' ' && dialogue.length > 0) {
        e.preventDefault()
        nextDialogue()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [inputText, dialogue])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        backgroundColor: '#000'
      }}
    >
      {/* 배경 이미지 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${scenarios[currentScenario]?.backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
          zIndex: 1
        }}
      />

      {/* 그라데이션 오버레이 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(to bottom, 
            ${alpha(theme.palette.background.default, 0)} 0%, 
            ${alpha(theme.palette.background.default, 0.3)} 60%, 
            ${alpha(theme.palette.background.default, 0.7)} 100%)`,
          zIndex: 2
        }}
      />

      {/* 상단 UI (설정, 저장 등) */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          gap: 2,
          zIndex: 10
        }}
      >
        <IconButton
          onClick={(e) => {
            setSettingsAnchor(e.currentTarget)
            setShowSettings(true)
          }}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.9)
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
        
        <IconButton
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.9)
            }
          }}
        >
          <SaveIcon />
        </IconButton>
      </Box>

      {/* 관계도 레벨 표시 */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10
        }}
      >
        <Paper
          sx={{
            px: 2,
            py: 1,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="caption" sx={{ mr: 1 }}>
            {characters[currentCharacter]?.name}
          </Typography>
          {[...Array(5)].map((_, i) => (
            <IconButton key={i} size="small" disabled>
              {i < relationshipLevel ? 
                <Favorite sx={{ fontSize: 16, color: 'error.main' }} /> : 
                <FavoriteBorder sx={{ fontSize: 16 }} />
              }
            </IconButton>
          ))}
        </Paper>
      </Box>

      {/* 메인 캐릭터 일러스트레이션 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '35%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          width: '400px',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <LocalAssetCharacter
          characterId={currentCharacter}
          emotion={characterEmotion}
          isTyping={isTyping}
        />
      </Box>

      {/* 대화창 (하단) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '35%',
          zIndex: 5
        }}
      >
        <Paper
          sx={{
            height: '100%',
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            borderTop: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '20px 20px 0 0',
            p: 3,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 캐릭터 이름 */}
          {dialogue.length > 0 && !dialogue[0].isUser && (
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.primary.main,
                mb: 1,
                fontWeight: 'bold'
              }}
            >
              {dialogue[0].character}
            </Typography>
          )}

          {/* 대화 텍스트 */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <AnimatePresence mode="wait">
              {dialogue.map((msg, index) => (
                !msg.isUser && (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        color: theme.palette.text.primary
                      }}
                    >
                      {isTyping && index === dialogue.length - 1 ? (
                        <TypewriterText text={msg.text} />
                      ) : (
                        msg.text
                      )}
                    </Typography>
                  </motion.div>
                )
              ))}
            </AnimatePresence>

            {isTyping && dialogue.length === 0 && (
              <Box display="flex" gap={1}>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Typography variant="h4">...</Typography>
                </motion.div>
              </Box>
            )}
          </Box>

          {/* 입력 영역 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`
            }}
          >
            <TextField
              ref={textFieldRef}
              fullWidth
              placeholder="Type your response... (Press Enter to send)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              disabled={isTyping}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha(theme.palette.background.default, 0.5)
                }
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!inputText.trim() || isTyping}
              endIcon={<SendIcon />}
              sx={{ minWidth: 120 }}
            >
              Send
            </Button>
            
            {/* 자동 진행 버튼 */}
            <Button
              variant={autoMode ? "contained" : "outlined"}
              onClick={() => setAutoMode(!autoMode)}
              sx={{ minWidth: 100 }}
            >
              {autoMode ? 'Auto ON' : 'Auto OFF'}
            </Button>
          </Box>

          {/* 컨트롤 힌트 */}
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              color: theme.palette.text.secondary,
              textAlign: 'center'
            }}
          >
            Press SPACE to continue • Press ENTER to send message
          </Typography>
        </Paper>
      </Box>

      {/* 시나리오 선택 메뉴 */}
      <Menu
        anchorEl={settingsAnchor}
        open={showSettings}
        onClose={() => {
          setShowSettings(false)
          setSettingsAnchor(null)
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Change Scene</Typography>
        </MenuItem>
        {Object.entries(scenarios).map(([id, scenario]) => (
          <MenuItem
            key={id}
            onClick={() => {
              setCurrentScenario(id)
              setShowSettings(false)
              setSettingsAnchor(null)
            }}
            selected={currentScenario === id}
          >
            {scenario.name}
          </MenuItem>
        ))}
        <MenuItem disabled>
          <Typography variant="subtitle2">Change Character</Typography>
        </MenuItem>
        {Object.entries(characters).map(([id, character]) => (
          <MenuItem
            key={id}
            onClick={() => {
              setCurrentCharacter(id)
              setShowSettings(false)
              setSettingsAnchor(null)
              setDialogue([])
            }}
            selected={currentCharacter === id}
          >
            {character.name}
          </MenuItem>
        ))}
      </Menu>

      {/* 플로팅 애니메이션 CSS */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateX(-50%) translateY(0px); }
            50% { transform: translateX(-50%) translateY(-10px); }
            100% { transform: translateX(-50%) translateY(0px); }
          }
        `}
      </style>
    </Box>
  )
}

// 타이핑 애니메이션 컴포넌트
const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 30)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, text])

  return <>{displayText}</>
}

export default VisualNovelStoryMode