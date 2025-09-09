const { Server } = require('socket.io');
const openaiService = require('./openaiService');
const speechAnalysisService = require('./speechAnalysisService');
const conversationController = require('../controllers/conversationController');

// 활성 소켓 연결 저장
const activeConnections = new Map();
const activeSessions = new Map();

class SocketService {
  constructor() {
    this.io = null;
  }

  // Socket.io 서버 초기화
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',  // 모든 origin 허용 (개발 환경용)
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
      },
      transports: ['polling', 'websocket'],  // polling을 먼저
      allowEIO3: true
    });

    this.setupEventHandlers();
    console.log('🔌 Socket.io initialized with real-time communication');
  }

  // 이벤트 핸들러 설정
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 User connected: ${socket.id}`);
      
      // 사용자 인증
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data);
      });

      // 대화 세션 관련 이벤트
      socket.on('join-conversation', (data) => {
        this.handleJoinConversation(socket, data);
      });

      socket.on('send-message', (data) => {
        this.handleSendMessage(socket, data);
      });

      socket.on('send-voice', (data) => {
        this.handleSendVoice(socket, data);
      });

      socket.on('typing', (data) => {
        this.handleTyping(socket, data);
      });

      socket.on('end-session', (data) => {
        this.handleEndSession(socket, data);
      });

      // 연결 해제
      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      // 에러 처리
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  // 사용자 인증 처리
  async handleAuthentication(socket, data) {
    try {
      const { token, userId } = data;
      
      // 간단한 토큰 검증 (실제로는 JWT 검증)
      if (!userId) {
        socket.emit('auth-error', { message: 'Authentication failed' });
        return;
      }

      // 사용자 정보 저장
      socket.userId = userId;
      activeConnections.set(socket.id, {
        userId,
        joinedAt: new Date(),
        currentSession: null
      });

      socket.emit('authenticated', { 
        success: true, 
        userId,
        message: 'Successfully authenticated'
      });

      console.log(`✅ User ${userId} authenticated via socket ${socket.id}`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('auth-error', { message: 'Authentication failed' });
    }
  }

  // 대화방 참여
  async handleJoinConversation(socket, data) {
    try {
      const { sessionId, situationId } = data;
      const userId = socket.userId;

      if (!userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // 세션 룸 참여
      socket.join(`session:${sessionId}`);
      
      // 연결 정보 업데이트
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.currentSession = sessionId;
      }

      // 세션 정보 확인 또는 생성
      let session = activeSessions.get(sessionId);
      if (!session) {
        session = {
          sessionId,
          userId,
          situationId,
          participants: new Set(),
          messages: [],
          startTime: new Date(),
          isActive: true
        };
        activeSessions.set(sessionId, session);
      }
      
      session.participants.add(socket.id);

      socket.emit('conversation-joined', {
        success: true,
        sessionId,
        situationId,
        participantCount: session.participants.size,
        messageHistory: session.messages.slice(-10) // 최근 10개 메시지
      });

      console.log(`👥 User ${userId} joined conversation session ${sessionId}`);
    } catch (error) {
      console.error('Join conversation error:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  }

  // 텍스트 메시지 전송
  async handleSendMessage(socket, data) {
    try {
      const { sessionId, message, messageType = 'text' } = data;
      const userId = socket.userId;

      if (!userId || !sessionId) {
        socket.emit('error', { message: 'Invalid request' });
        return;
      }

      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // 사용자 메시지 저장
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        userId,
        type: messageType
      };

      session.messages.push(userMessage);

      // 클라이언트에 메시지 전송 확인
      socket.emit('message-sent', { 
        success: true, 
        message: userMessage 
      });

      // 방의 다른 참여자들에게 메시지 브로드캐스트
      socket.to(`session:${sessionId}`).emit('new-message', userMessage);

      // AI 응답 생성 (비동기)
      this.generateAIResponse(sessionId, session, message);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  // 음성 메시지 전송
  async handleSendVoice(socket, data) {
    try {
      const { sessionId, audioData, duration } = data;
      const userId = socket.userId;

      if (!userId || !sessionId || !audioData) {
        socket.emit('error', { message: 'Invalid voice data' });
        return;
      }

      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // 음성 처리 시작 알림
      socket.emit('voice-processing', { message: 'Processing your voice...' });

      // 임시 파일로 음성 저장 (실제로는 적절한 파일 처리 필요)
      const tempAudioPath = await this.saveTemporaryAudio(audioData);

      // 음성을 텍스트로 변환
      const transcription = await speechAnalysisService.transcribeAudio(tempAudioPath);
      
      // 발음 분석
      const pronunciationAnalysis = await speechAnalysisService.analyzePronunciation(
        "Expected text", // 실제로는 상황에 맞는 기대 텍스트
        transcription.text,
        tempAudioPath
      );

      // 음성 메시지 저장
      const voiceMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: transcription.text,
        originalAudio: audioData,
        duration,
        timestamp: new Date(),
        userId,
        type: 'voice',
        analysis: pronunciationAnalysis
      };

      session.messages.push(voiceMessage);

      // 음성 처리 결과 전송
      socket.emit('voice-processed', {
        success: true,
        message: voiceMessage,
        transcription: transcription.text,
        pronunciationScore: pronunciationAnalysis.pronunciationScore,
        feedback: pronunciationAnalysis.feedback
      });

      // AI 응답 생성
      this.generateAIResponse(sessionId, session, transcription.text);

    } catch (error) {
      console.error('Voice message error:', error);
      socket.emit('voice-error', { 
        message: 'Failed to process voice message',
        error: error.message 
      });
    }
  }

  // AI 응답 생성 (비동기)
  async generateAIResponse(sessionId, session, userMessage) {
    try {
      // 타이핑 인디케이터 시작
      this.io.to(`session:${sessionId}`).emit('ai-typing', { typing: true });

      // AI 응답 생성 (사용자 메시지 포함)
      const aiResponse = await openaiService.generateResponse(
        { title: session.situationId }, // 상황 정보
        session.messages.slice(-5), // 최근 5개 메시지
        userMessage // 현재 사용자 메시지
      );

      // 디버깅용 로그
      console.log('🤖 AI Response received:', typeof aiResponse, aiResponse);

      // 피드백 생성
      const feedback = await openaiService.analyzeFeedback(
        userMessage,
        { title: session.situationId }
      );

      console.log('📝 Feedback received:', typeof feedback, feedback);

      // AI 응답 content 안전하게 추출
      let responseContent = '';
      if (typeof aiResponse === 'string') {
        responseContent = aiResponse;
      } else if (aiResponse && typeof aiResponse.content === 'string') {
        responseContent = aiResponse.content;
      } else if (aiResponse && aiResponse.content) {
        responseContent = String(aiResponse.content);
      } else {
        responseContent = "I understand. Could you tell me more about that?";
      }

      console.log('✅ Final response content:', responseContent);

      // AI 메시지 저장
      const aiMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        type: 'text',
        feedback
      };

      session.messages.push(aiMessage);

      // 타이핑 인디케이터 중지
      this.io.to(`session:${sessionId}`).emit('ai-typing', { typing: false });

      // AI 응답 전송
      this.io.to(`session:${sessionId}`).emit('ai-response', {
        message: aiMessage,
        feedback
      });

    } catch (error) {
      console.error('AI response error:', error);
      this.io.to(`session:${sessionId}`).emit('ai-typing', { typing: false });
      this.io.to(`session:${sessionId}`).emit('ai-error', { 
        message: 'AI response failed' 
      });
    }
  }

  // 타이핑 인디케이터 처리
  handleTyping(socket, data) {
    const { sessionId, typing } = data;
    const userId = socket.userId;

    if (!sessionId || !userId) return;

    socket.to(`session:${sessionId}`).emit('user-typing', {
      userId,
      typing,
      timestamp: new Date()
    });
  }

  // 세션 종료
  async handleEndSession(socket, data) {
    try {
      const { sessionId } = data;
      const userId = socket.userId;

      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // 세션 종료 처리
      session.isActive = false;
      session.endTime = new Date();

      // 최종 평가 생성
      const evaluation = await openaiService.evaluateSession(
        session.messages,
        { title: session.situationId },
        []
      );

      // 세션 종료 알림
      this.io.to(`session:${sessionId}`).emit('session-ended', {
        sessionId,
        duration: session.endTime - session.startTime,
        messageCount: session.messages.length,
        evaluation
      });

      // 세션 정리
      activeSessions.delete(sessionId);
      
      console.log(`🏁 Session ${sessionId} ended by user ${userId}`);
    } catch (error) {
      console.error('End session error:', error);
      socket.emit('error', { message: 'Failed to end session' });
    }
  }

  // 연결 해제 처리
  handleDisconnect(socket, reason) {
    const connection = activeConnections.get(socket.id);
    
    if (connection) {
      const { userId, currentSession } = connection;
      
      // 세션에서 제거
      if (currentSession) {
        const session = activeSessions.get(currentSession);
        if (session) {
          session.participants.delete(socket.id);
          
          // 세션에 참여자가 없으면 정리
          if (session.participants.size === 0) {
            activeSessions.delete(currentSession);
          }
        }
      }
      
      activeConnections.delete(socket.id);
      console.log(`👋 User ${userId} disconnected: ${reason}`);
    }
  }

  // 임시 오디오 파일 저장
  async saveTemporaryAudio(audioData) {
    const fs = require('fs');
    const path = require('path');
    const { audioDir } = require('../middleware/upload');
    
    try {
      // Base64 데이터인지 확인 및 변환
      let audioBuffer;
      if (typeof audioData === 'string') {
        // Base64 문자열인 경우
        const base64Data = audioData.replace(/^data:audio\/[a-z]+;base64,/, '');
        audioBuffer = Buffer.from(base64Data, 'base64');
      } else {
        // 이미 Buffer인 경우
        audioBuffer = audioData;
      }

      // 파일명 생성
      const fileName = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.wav`;
      const filePath = path.join(audioDir, fileName);

      // 파일 저장
      fs.writeFileSync(filePath, audioBuffer);

      // 파일 정보 로깅
      const stats = fs.statSync(filePath);
      console.log(`💾 Audio file saved: ${fileName} (${stats.size} bytes)`);

      return filePath;
    } catch (error) {
      console.error('❌ Audio save error:', error);
      throw new Error(`Failed to save audio: ${error.message}`);
    }
  }

  // 현재 활성 세션 정보 조회
  getActiveSessionsInfo() {
    return Array.from(activeSessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      userId: session.userId,
      situationId: session.situationId,
      participantCount: session.participants.size,
      messageCount: session.messages.length,
      duration: new Date() - session.startTime,
      isActive: session.isActive
    }));
  }

  // 특정 사용자에게 메시지 전송
  sendToUser(userId, event, data) {
    for (const [socketId, connection] of activeConnections.entries()) {
      if (connection.userId === userId) {
        this.io.to(socketId).emit(event, data);
      }
    }
  }

  // 모든 연결된 사용자에게 브로드캐스트
  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

// 싱글톤 인스턴스
const socketService = new SocketService();

module.exports = socketService;