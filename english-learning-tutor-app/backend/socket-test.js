const { io } = require('socket.io-client');

// Socket.io 클라이언트 테스트 스크립트
class SocketTester {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // 서버 연결
  async connect(serverUrl = 'http://localhost:3000') {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Connecting to ${serverUrl}...`);
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      // 연결 성공
      this.socket.on('connect', () => {
        console.log('✅ Connected to server:', this.socket.id);
        this.isConnected = true;
        this.setupEventListeners();
        resolve(true);
      });

      // 연결 실패
      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });

      // 연결 타임아웃
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    if (!this.socket) return;

    // 인증 관련
    this.socket.on('authenticated', (data) => {
      console.log('🔐 Authenticated:', data);
    });

    this.socket.on('auth-error', (error) => {
      console.error('🔐❌ Auth error:', error);
    });

    // 대화 관련
    this.socket.on('conversation-joined', (data) => {
      console.log('🏠 Joined conversation:', data);
    });

    this.socket.on('new-message', (message) => {
      console.log('📨 New message:', message);
    });

    this.socket.on('message-sent', (data) => {
      console.log('✅ Message sent:', data.success);
    });

    // AI 관련
    this.socket.on('ai-response', (data) => {
      console.log('🤖 AI Response:', data.message.content);
      console.log('📊 Feedback:', data.feedback);
    });

    this.socket.on('ai-typing', (data) => {
      console.log(`🤖 AI ${data.typing ? 'is typing...' : 'stopped typing'}`);
    });

    // 음성 관련
    this.socket.on('voice-processing', (data) => {
      console.log('🎤 Voice processing:', data.message);
    });

    this.socket.on('voice-processed', (data) => {
      console.log('🎤✅ Voice processed:');
      console.log('  - Transcription:', data.transcription);
      console.log('  - Pronunciation Score:', data.pronunciationScore);
      console.log('  - Feedback:', data.feedback);
    });

    this.socket.on('voice-error', (error) => {
      console.error('🎤❌ Voice error:', error);
    });

    // 세션 관련
    this.socket.on('session-ended', (data) => {
      console.log('🏁 Session ended:', data);
    });

    // 에러
    this.socket.on('error', (error) => {
      console.error('❌ Error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
      this.isConnected = false;
    });
  }

  // 인증 테스트
  async testAuthentication(userId = 'test-user-123') {
    console.log('\\n🔐 Testing authentication...');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ Auth timeout');
        resolve(false);
      }, 5000);

      this.socket.once('authenticated', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      this.socket.once('auth-error', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      this.socket.emit('authenticate', { userId });
    });
  }

  // 대화 참여 테스트
  async testJoinConversation(sessionId = 'test-session-123', situationId = 'daegu_taxi') {
    console.log('\\n🏠 Testing conversation join...');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ Join timeout');
        resolve(false);
      }, 5000);

      this.socket.once('conversation-joined', (data) => {
        clearTimeout(timeout);
        resolve(data.success);
      });

      this.socket.once('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      this.socket.emit('join-conversation', { sessionId, situationId });
    });
  }

  // 메시지 전송 테스트
  async testSendMessage(message = 'Hello, I need help with directions.', sessionId = 'test-session-123') {
    console.log('\\n📨 Testing message sending...');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ Message timeout');
        resolve(false);
      }, 10000); // AI 응답 대기 시간

      let messageConfirmed = false;
      let aiResponseReceived = false;

      const checkComplete = () => {
        if (messageConfirmed && aiResponseReceived) {
          clearTimeout(timeout);
          resolve(true);
        }
      };

      this.socket.once('message-sent', () => {
        messageConfirmed = true;
        checkComplete();
      });

      this.socket.once('ai-response', () => {
        aiResponseReceived = true;
        checkComplete();
      });

      this.socket.once('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      this.socket.emit('send-message', { sessionId, message, messageType: 'text' });
    });
  }

  // 세션 종료 테스트
  async testEndSession(sessionId = 'test-session-123') {
    console.log('\\n🏁 Testing session end...');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ End session timeout');
        resolve(false);
      }, 10000);

      this.socket.once('session-ended', (data) => {
        clearTimeout(timeout);
        console.log('📊 Session summary:', {
          duration: data.duration,
          messageCount: data.messageCount,
          evaluation: data.evaluation
        });
        resolve(true);
      });

      this.socket.once('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      this.socket.emit('end-session', { sessionId });
    });
  }

  // 전체 워크플로우 테스트
  async runFullTest() {
    console.log('🧪 Starting full Socket.io test suite...\\n');

    try {
      // 1. 서버 연결
      await this.connect();
      console.log('✅ Step 1: Connection successful\\n');

      // 2. 인증
      const authSuccess = await this.testAuthentication();
      if (!authSuccess) {
        throw new Error('Authentication failed');
      }
      console.log('✅ Step 2: Authentication successful\\n');

      // 3. 대화 참여
      const joinSuccess = await this.testJoinConversation();
      if (!joinSuccess) {
        throw new Error('Join conversation failed');
      }
      console.log('✅ Step 3: Conversation join successful\\n');

      // 4. 메시지 전송
      const messageSuccess = await this.testSendMessage();
      if (!messageSuccess) {
        throw new Error('Message sending failed');
      }
      console.log('✅ Step 4: Message exchange successful\\n');

      // 5. 추가 메시지들
      console.log('📝 Testing multiple message exchanges...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.testSendMessage('Can you help me order food in Korean?');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await this.testSendMessage('Thank you for your help!');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 6. 세션 종료
      const endSuccess = await this.testEndSession();
      if (!endSuccess) {
        throw new Error('Session end failed');
      }
      console.log('✅ Step 5: Session end successful\\n');

      console.log('🎉 All tests passed! Socket.io integration is working correctly.\\n');
      
      return true;

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      return false;
    } finally {
      this.disconnect();
    }
  }

  // 연결 해제
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

// 스크립트 실행
async function runTest() {
  const tester = new SocketTester();
  
  console.log('🚀 Socket.io Integration Test');
  console.log('==============================\\n');
  
  const success = await tester.runFullTest();
  
  process.exit(success ? 0 : 1);
}

// 직접 실행시에만 테스트 실행
if (require.main === module) {
  runTest().catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = SocketTester;