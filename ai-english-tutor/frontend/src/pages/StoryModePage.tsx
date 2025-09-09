import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Fade,
  Grow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  LinearProgress,
  useTheme
} from '@mui/material'
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Refresh as RefreshIcon,
  AutoStories as StoryIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface Character {
  id: string
  name: string
  avatar: string
  personality: string[]
  currentEmotion: string
  relationshipLevel: number
}

interface Message {
  id: string
  character: string
  text: string
  emotion: string
  timestamp: Date
  isUser?: boolean
}

interface Scenario {
  id: string
  name: string
  description: string
  image: string
  mood: string
}

const StoryModePage: React.FC = () => {
  const theme = useTheme()
  const [selectedCharacter, setSelectedCharacter] = useState<string>('jennifer')
  const [selectedScenario, setSelectedScenario] = useState<string>('cafe')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [relationshipLevel, setRelationshipLevel] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 캐릭터 데이터
  const characters: Character[] = [
    {
      id: 'jennifer',
      name: 'Jennifer',
      avatar: '👩‍🏫',
      personality: ['Friendly', 'Patient', 'Encouraging'],
      currentEmotion: 'happy',
      relationshipLevel: 3
    },
    {
      id: 'alex',
      name: 'Alex',
      avatar: '👨‍💻',
      personality: ['Energetic', 'Creative', 'Playful'],
      currentEmotion: 'excited',
      relationshipLevel: 2
    },
    {
      id: 'sophia',
      name: 'Sophia',
      avatar: '👩‍💼',
      personality: ['Wise', 'Calm', 'Thoughtful'],
      currentEmotion: 'serene',
      relationshipLevel: 1
    }
  ]

  // 시나리오 데이터
  const scenarios: Scenario[] = [
    {
      id: 'cafe',
      name: 'Cozy Cafe',
      description: 'A warm afternoon in a Seoul cafe',
      image: '☕',
      mood: 'relaxed'
    },
    {
      id: 'park',
      name: 'Sunset Park',
      description: 'Cherry blossoms at golden hour',
      image: '🌸',
      mood: 'romantic'
    },
    {
      id: 'classroom',
      name: 'Study Room',
      description: 'Language exchange session',
      image: '📚',
      mood: 'focused'
    },
    {
      id: 'restaurant',
      name: 'Korean BBQ',
      description: 'Trying authentic Korean cuisine',
      image: '🍖',
      mood: 'adventurous'
    }
  ]

  // 메시지 전송
  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      character: 'You',
      text: inputMessage,
      emotion: 'neutral',
      timestamp: new Date(),
      isUser: true
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // API 호출 (실제 구현시)
      const response = await fetch('http://localhost:3001/api/story/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: selectedCharacter,
          scenario: selectedScenario,
          message: inputMessage,
          sessionId: 'story-session-1'
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // AI 캐릭터 응답 추가
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          character: characters.find(c => c.id === selectedCharacter)?.name || 'AI',
          text: data.message,
          emotion: data.emotion,
          timestamp: new Date()
        }
        
        setTimeout(() => {
          setMessages(prev => [...prev, aiMessage])
          setIsTyping(false)
          
          // 관계 레벨 업데이트
          if (data.relationshipLevel) {
            setRelationshipLevel(data.relationshipLevel)
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Story chat error:', error)
      setIsTyping(false)
      
      // 폴백 응답 (데모용)
      const demoResponse: Message = {
        id: (Date.now() + 1).toString(),
        character: characters.find(c => c.id === selectedCharacter)?.name || 'AI',
        text: "That's interesting! Tell me more about that. I love hearing your stories!",
        emotion: 'happy',
        timestamp: new Date()
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, demoResponse])
        setIsTyping(false)
      }, 1000)
    }
  }

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 감정 이모지 매핑
  const getEmotionEmoji = (emotion: string) => {
    const emotions: { [key: string]: string } = {
      happy: '😊',
      excited: '🤩',
      thoughtful: '🤔',
      surprised: '😮',
      concerned: '😟',
      serene: '😌',
      neutral: '😐'
    }
    return emotions[emotion] || '😊'
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <StoryIcon sx={{ mr: 2 }} />
        AI Story Mode
      </Typography>

      <Grid container spacing={3}>
        {/* 캐릭터 선택 */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Choose Character
            </Typography>
            {characters.map((character) => (
              <Card
                key={character.id}
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  border: selectedCharacter === character.id ? 2 : 0,
                  borderColor: 'primary.main',
                  transform: selectedCharacter === character.id ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}
                onClick={() => setSelectedCharacter(character.id)}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ fontSize: '2rem', mr: 2 }}>
                    {character.avatar}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {character.name}
                    </Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                      {character.personality.map((trait) => (
                        <Chip
                          key={trait}
                          label={trait}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Box display="flex" alignItems="center" mt={1}>
                      {[...Array(5)].map((_, i) => (
                        <IconButton key={i} size="small" disabled>
                          {i < character.relationshipLevel ? 
                            <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} /> : 
                            <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                          }
                        </IconButton>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* 채팅 영역 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
            {/* 시나리오 헤더 */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Scenario</InputLabel>
                <Select
                  value={selectedScenario}
                  label="Scenario"
                  onChange={(e) => setSelectedScenario(e.target.value)}
                >
                  {scenarios.map((scenario) => (
                    <MenuItem key={scenario.id} value={scenario.id}>
                      <Box display="flex" alignItems="center">
                        <span style={{ marginRight: 8, fontSize: '1.2rem' }}>
                          {scenario.image}
                        </span>
                        {scenario.name} - {scenario.description}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* 메시지 영역 */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: message.isUser ? 'row-reverse' : 'row',
                          alignItems: 'flex-end'
                        }}
                      >
                        {!message.isUser && (
                          <Avatar sx={{ mr: 1 }}>
                            {characters.find(c => c.id === selectedCharacter)?.avatar}
                          </Avatar>
                        )}
                        <Paper
                          sx={{
                            p: 2,
                            backgroundColor: message.isUser ? 
                              theme.palette.primary.main : 
                              theme.palette.grey[100],
                            color: message.isUser ? 'white' : 'text.primary'
                          }}
                        >
                          <Box display="flex" alignItems="center" mb={0.5}>
                            <Typography variant="caption" fontWeight="bold">
                              {message.character}
                            </Typography>
                            {!message.isUser && (
                              <Chip
                                label={getEmotionEmoji(message.emotion)}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                          <Typography variant="body1">
                            {message.text}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <Box display="flex" alignItems="center" sx={{ ml: 6 }}>
                  <Avatar sx={{ mr: 1 }}>
                    {characters.find(c => c.id === selectedCharacter)?.avatar}
                  </Avatar>
                  <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Box display="flex" gap={0.5}>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      >
                        •
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      >
                        •
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      >
                        •
                      </motion.div>
                    </Box>
                  </Paper>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* 입력 영역 */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Enter your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  disabled={isTyping}
                  multiline
                  maxRows={3}
                />
                <Button
                  variant="contained"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  sx={{ minWidth: 100 }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 스토리 정보 */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Story Info
            </Typography>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Current Scene
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  {scenarios.find(s => s.id === selectedScenario)?.name}
                </Typography>
              </Box>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Relationship Level
              </Typography>
              <Box mt={1}>
                <LinearProgress
                  variant="determinate"
                  value={relationshipLevel * 20}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" sx={{ mt: 0.5 }}>
                  Level {relationshipLevel} / 5
                </Typography>
              </Box>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Story Tips
              </Typography>
              <Box sx={{ backgroundColor: theme.palette.grey[50], p: 1.5, borderRadius: 1 }}>
                <Typography variant="caption">
                  • Ask about their hobbies<br/>
                  • Share your experiences<br/>
                  • React to the setting<br/>
                  • Build relationships naturally
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setMessages([])
                setRelationshipLevel(1)
              }}
            >
              New Story
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default StoryModePage