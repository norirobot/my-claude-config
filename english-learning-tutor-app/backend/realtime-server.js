const express = require('express');
const http = require('http');
const cors = require('cors');
const socketService = require('./src/services/socketService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// 기본 미들웨어
app.use(express.json());
app.use(cors({
  origin: true,  // 모든 origin 허용
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 정적 파일 서빙 (HTML, CSS, JS 파일들)
app.use(express.static(__dirname));

// Socket.io 초기화
socketService.initialize(server);

// Health check
app.get('/health', (req, res) => {
  const sessionsInfo = socketService.getActiveSessionsInfo();
  res.json({
    status: 'OK',
    message: 'English Learning API Server with Socket.io is running!',
    timestamp: new Date().toISOString(),
    realtime: {
      enabled: true,
      activeSessions: sessionsInfo.length,
      sessions: sessionsInfo
    }
  });
});

// API 라우트
const conversationRoutes = require('./src/routes/conversation');
app.use('/api/conversation', conversationRoutes);

// Socket.io 상태 API
app.get('/api/socket/status', (req, res) => {
  const sessions = socketService.getActiveSessionsInfo();
  res.json({
    success: true,
    data: {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.isActive).length,
      sessions: sessions
    }
  });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '🎓 English Learning API with Real-time Communication!',
    features: [
      '💬 Real-time conversation practice',
      '🎤 Voice message analysis', 
      '🤖 AI-powered responses',
      '📊 Live pronunciation feedback'
    ],
    endpoints: [
      'GET /health - Health check with socket info',
      'GET /api/conversation/situations - Get practice situations',
      'POST /api/conversation/sessions/start - Start practice session',
      'POST /api/conversation/sessions/:id/voice - Upload voice message',
      'WS /socket.io - WebSocket connection for real-time features'
    ],
    socketEvents: [
      'authenticate - User authentication',
      'join-conversation - Join practice session',
      'send-message - Send text message',
      'send-voice - Send voice data',
      'typing - Typing indicator'
    ]
  });
});

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`,
    availableRoutes: ['/health', '/api/conversation/*', '/api/socket/status']
  });
});

// 에러 처리
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`🚀 English Learning API Server with Socket.io started on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 API Base: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io: ws://localhost:${PORT}/socket.io`);
  console.log(`📊 Real-time features: Voice analysis, Live chat, AI responses`);
});

// 우아한 종료 처리
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});