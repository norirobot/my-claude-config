const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// 기본 미들웨어
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'English Learning API Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Conversation routes (Mock data)
const conversationRoutes = require('./src/routes/conversation');
app.use('/api/conversation', conversationRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Welcome to English Learning API!',
    endpoints: [
      'GET /health - Health check',
      'GET /api/conversation/situations - Get practice situations',
      'POST /api/conversation/sessions/start - Start practice session'
    ]
  });
});

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`
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
app.listen(PORT, () => {
  console.log(`🚀 Simple English Learning API Server started on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 API Base: http://localhost:${PORT}/api`);
});