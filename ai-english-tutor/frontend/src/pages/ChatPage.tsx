import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Button,
  Avatar,
  Chip,
  Stack,
  Fade,
  CircularProgress
} from '@mui/material'
import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import { useLanguage } from '../contexts/LanguageContext'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  audioUrl?: string
  score?: number
}

const ChatPage: React.FC = () => {
  const { t, language } = useLanguage()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m Jennifer, your AI English tutor. I\'m excited to help you practice English today. What would you like to talk about?',
      timestamp: new Date(),
      score: 95
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTutor] = useState({
    name: 'Jennifer',
    avatar: 'J',
    specialty: language === 'ko' ? t.chat.businessEnglish : t.chat.businessEnglish,
    accent: language === 'ko' ? t.chat.americanAccent : t.chat.americanAccent
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 세션 완료 기록 함수
  const recordSessionCompletion = async (score: number) => {
    try {
      const response = await fetch('http://localhost:3001/api/progress/session/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'demo_student_001',
          sessionId: 'chat_session_' + Date.now(),
          subject: 'english',
          activityType: 'ai_chat',
          duration: Math.floor(Math.random() * 20) + 10, // 10-30분
          score,
          skillImprovements: ['speaking', 'listening']
        })
      })

      const data = await response.json()
      if (data.success && data.data.newAchievements?.length > 0) {
        console.log('새로운 업적 달성!', data.data.newAchievements)
        // TODO: 업적 달성 알림 표시
      }
    } catch (error) {
      console.error('세션 기록 실패:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = currentMessage
    setCurrentMessage('')
    setIsLoading(true)

    try {
      // 실제 백엔드 API 호출
      const response = await fetch('http://localhost:3001/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'demo_student_001',
          tutorId: 'ai_tutor_jennifer',
          sessionId: 'chat_session_' + Date.now(),
          message: messageToSend,
          conversationHistory: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })).slice(-6) // 최근 6개 메시지만 컨텍스트로 전송
        })
      })

      const data = await response.json()

      if (data.success && data.messages.length > 1) {
        // AI 튜터 응답 추가
        const aiMessage = data.messages[1] // 두 번째 메시지가 AI 응답
        const aiResponse: ChatMessage = {
          id: aiMessage.id,
          type: 'ai',
          content: aiMessage.message,
          timestamp: new Date(aiMessage.timestamp),
          score: Math.floor(Math.random() * 20) + 80 // 80-100 점수
        }
        setMessages(prev => [...prev, aiResponse])
        
        // 세션 완료 기록 (10개 메시지마다)
        if (messages.length > 0 && (messages.length + 2) % 10 === 0) {
          recordSessionCompletion(aiResponse.score || 85)
        }
      } else {
        throw new Error('AI 응답을 받지 못했습니다.')
      }
    } catch (error) {
      console.error('AI 채팅 API 오류:', error)
      // 폴백 응답
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I understand you're trying to say "${messageToSend}". That's a great attempt! Let me help you express that more naturally. Could you tell me more about what you meant?`,
        timestamp: new Date(),
        score: 85
      }
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: 음성 녹음 기능 구현
    if (!isRecording) {
      console.log('음성 녹음 시작')
    } else {
      console.log('음성 녹음 종료 및 처리')
    }
  }

  const playAudio = (messageId: string) => {
    // TODO: TTS 음성 재생
    console.log(`메시지 ${messageId} 음성 재생`)
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'default'
    if (score >= 95) return 'success'
    if (score >= 85) return 'primary' 
    if (score >= 75) return 'warning'
    return 'error'
  }

  const getScoreLabel = (score?: number) => {
    if (!score) return ''
    if (score >= 95) return t.chat.scores.perfect
    if (score >= 85) return t.chat.scores.excellent
    if (score >= 75) return t.chat.scores.good
    return t.chat.scores.needsPractice
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* 채팅 헤더 */}
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: 48,
                  height: 48
                }}
              >
                {selectedTutor.avatar}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  {selectedTutor.name} {t.chat.aiTutor}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip label={selectedTutor.specialty} size="small" color="primary" variant="outlined" />
                  <Chip label={selectedTutor.accent} size="small" variant="outlined" />
                  <Chip label={t.chat.online} size="small" color="success" />
                </Box>
              </Box>
            </Box>
            <Box>
              <IconButton onClick={() => setMessages([])}>
                <RefreshIcon />
              </IconButton>
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 채팅 메시지 영역 */}
      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {messages.map((message, index) => (
            <Fade in={true} key={message.id} timeout={500}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                    position: 'relative'
                  }}
                >
                  <Typography variant="body1">
                    {message.content}
                  </Typography>
                  
                  {/* AI 메시지 하단 액션 */}
                  {message.type === 'ai' && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => playAudio(message.id)}
                        sx={{ color: message.type === 'user' ? 'white' : 'primary.main' }}
                      >
                        <VolumeUpIcon fontSize="small" />
                      </IconButton>
                      {message.score && (
                        <Chip
                          label={getScoreLabel(message.score)}
                          size="small"
                          color={getScoreColor(message.score)}
                          sx={{ ml: 'auto' }}
                        />
                      )}
                    </Box>
                  )}
                  
                  {/* 타임스탬프 */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      opacity: 0.7,
                      display: 'block',
                      textAlign: message.type === 'user' ? 'right' : 'left'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Box>
            </Fade>
          ))}
          
          {/* 로딩 표시 */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Jennifer{language === 'ko' ? '가 ' : ' is '}{t.chat.loading}
                </Typography>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* 메시지 입력 영역 */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              ref={inputRef}
              fullWidth
              multiline
              maxRows={4}
              placeholder={t.chat.inputPlaceholder}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            {/* 음성 녹음 버튼 */}
            <IconButton
              color={isRecording ? 'secondary' : 'default'}
              onClick={toggleRecording}
              sx={{
                width: 48,
                height: 48,
                bgcolor: isRecording ? 'secondary.light' : 'grey.100',
                '&:hover': {
                  bgcolor: isRecording ? 'secondary.main' : 'grey.200'
                }
              }}
            >
              {isRecording ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            
            {/* 전송 버튼 */}
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading}
              sx={{
                minWidth: 48,
                height: 48,
                borderRadius: 2
              }}
            >
              <SendIcon />
            </Button>
          </Box>
          
          {/* 녹음 상태 표시 */}
          {isRecording && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'secondary.main',
                  animation: 'blink 1s infinite'
                }}
              />
              <Typography variant="body2" color="secondary.main">
                {t.chat.recording}
              </Typography>
            </Box>
          )}
          
          {/* 도움말 텍스트 */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {t.chat.tip}
          </Typography>
        </Box>
      </Card>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </Box>
  )
}

export default ChatPage