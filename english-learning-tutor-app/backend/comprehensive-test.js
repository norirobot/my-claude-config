const axios = require('axios');
const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// API 테스트 스크립트 - 종합적인 기능 테스트
const API_BASE_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';

let authToken = '';
let sessionId = '';
let socket = null;

// 테스트 사용자 데이터
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  username: 'testuser',
  display_name: 'Test User'
};

// API 요청 헬퍼 함수
const apiRequest = async (method, endpoint, data = null, token = null, isFormData = false) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    if (isFormData) {
      config.headers = { ...config.headers, ...data.getHeaders() };
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Socket 연결 헬퍼
const connectSocket = () => {
  return new Promise((resolve, reject) => {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      reject(error);
    });

    // 테스트용 이벤트 리스너들
    socket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
    });

    socket.on('conversation-joined', (data) => {
      console.log('👥 Joined conversation:', data);
    });

    socket.on('ai-response', (data) => {
      console.log('🤖 AI Response:', data.message.content.substring(0, 50) + '...');
    });

    socket.on('voice-processed', (data) => {
      console.log('🎤 Voice processed:', data.transcription);
    });
  });
};

// 테스트 함수들
const tests = {
  // 1. 서버 상태 확인
  async testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    const result = await apiRequest('GET', '/../health');
    
    if (result.success) {
      console.log('Health Check: ✅ PASS');
      console.log('  Server Status:', result.data.status);
      console.log('  Real-time:', result.data.realtime?.enabled ? 'Enabled' : 'Disabled');
      console.log('  Active Sessions:', result.data.realtime?.activeSessions || 0);
      return true;
    } else {
      console.log('Health Check: ❌ FAIL');
      console.log('Error:', result.error);
      return false;
    }
  },

  // 2. Socket 연결 테스트
  async testSocketConnection() {
    console.log('\n🔌 Testing Socket Connection...');
    try {
      await connectSocket();
      
      // 인증 테스트
      socket.emit('authenticate', { userId: 'test-user-123', token: 'test-token' });
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      
      console.log('Socket Connection: ✅ PASS');
      return true;
    } catch (error) {
      console.log('Socket Connection: ❌ FAIL');
      console.log('Error:', error.message);
      return false;
    }
  },

  // 3. 상황 목록 조회
  async testGetSituations() {
    console.log('\n📋 Testing Get Situations...');
    const result = await apiRequest('GET', '/conversation/situations');
    
    if (result.success && result.data.data) {
      console.log('Get Situations: ✅ PASS');
      console.log(`  Found ${result.data.data.length} situations`);
      console.log('  Sample situations:', result.data.data.slice(0, 2).map(s => s.title));
      return true;
    } else {
      console.log('Get Situations: ❌ FAIL');
      console.log('Error:', result.error);
      return false;
    }
  },

  // 4. 대화 세션 시작 (HTTP)
  async testStartSession() {
    console.log('\n🎬 Testing Start Session (HTTP)...');
    const result = await apiRequest('POST', '/conversation/sessions/start', {
      situationId: 'daegu_taxi'
    });

    if (result.success && result.data.data?.sessionId) {
      sessionId = result.data.data.sessionId;
      console.log('Start Session: ✅ PASS');
      console.log('  Session ID:', sessionId);
      console.log('  Situation:', result.data.data.situation.title);
      console.log('  First Message:', result.data.data.firstMessage);
      return true;
    } else {
      console.log('Start Session: ❌ FAIL');
      console.log('Error:', result.error);
      return false;
    }
  },

  // 5. Socket을 통한 대화방 참여
  async testSocketJoinConversation() {
    if (!socket || !sessionId) {
      console.log('\n👥 Socket Join Conversation: ❌ SKIP (No socket or session)');
      return false;
    }

    console.log('\n👥 Testing Socket Join Conversation...');
    return new Promise((resolve) => {
      socket.emit('join-conversation', {
        sessionId: sessionId,
        situationId: 'daegu_taxi'
      });

      socket.once('conversation-joined', (data) => {
        if (data.success) {
          console.log('Socket Join Conversation: ✅ PASS');
          console.log('  Session ID:', data.sessionId);
          console.log('  Participants:', data.participantCount);
          resolve(true);
        } else {
          console.log('Socket Join Conversation: ❌ FAIL');
          resolve(false);
        }
      });

      // 타임아웃
      setTimeout(() => {
        console.log('Socket Join Conversation: ❌ TIMEOUT');
        resolve(false);
      }, 3000);
    });
  },

  // 6. 텍스트 메시지 전송 (HTTP)
  async testSendMessage() {
    if (!sessionId) {
      console.log('\n💬 Send Message: ❌ SKIP (No session)');
      return false;
    }

    console.log('\n💬 Testing Send Message (HTTP)...');
    const result = await apiRequest('POST', `/conversation/sessions/${sessionId}/message`, {
      message: "Hello, I need to go to Suseong Lake please. How much will it cost?",
      audioUrl: null
    });

    if (result.success) {
      console.log('Send Message: ✅ PASS');
      console.log('  AI Response:', result.data.data?.aiResponse?.substring(0, 50) + '...');
      console.log('  Feedback Score:', result.data.data?.feedback?.score || 'N/A');
      console.log('  Message Count:', result.data.data?.messageCount);
      return true;
    } else {
      console.log('Send Message: ❌ FAIL');
      console.log('Error:', result.error);
      return false;
    }
  },

  // 7. Socket을 통한 실시간 메시지
  async testSocketSendMessage() {
    if (!socket || !sessionId) {
      console.log('\n📡 Socket Send Message: ❌ SKIP (No socket or session)');
      return false;
    }

    console.log('\n📡 Testing Socket Send Message...');
    return new Promise((resolve) => {
      let responseReceived = false;

      socket.emit('send-message', {
        sessionId: sessionId,
        message: "Thank you! Is there any traffic at this time?"
      });

      socket.once('message-sent', (data) => {
        console.log('  📤 Message sent confirmation received');
      });

      socket.once('ai-response', (data) => {
        if (!responseReceived) {
          responseReceived = true;
          console.log('Socket Send Message: ✅ PASS');
          console.log('  AI Response:', data.message?.content?.substring(0, 50) + '...');
          console.log('  Feedback available:', !!data.feedback);
          resolve(true);
        }
      });

      // 타임아웃
      setTimeout(() => {
        if (!responseReceived) {
          console.log('Socket Send Message: ❌ TIMEOUT');
          resolve(false);
        }
      }, 5000);
    });
  },

  // 8. 음성 파일 업로드 테스트 (Mock)
  async testVoiceUpload() {
    if (!sessionId) {
      console.log('\n🎤 Voice Upload: ❌ SKIP (No session)');
      return false;
    }

    console.log('\n🎤 Testing Voice Upload...');
    
    try {
      // 간단한 테스트 오디오 파일 생성 (실제로는 WAV 파일이어야 함)
      const testAudioContent = Buffer.from('fake-audio-data-for-testing', 'utf8');
      const testFilePath = path.join(__dirname, 'temp-test-audio.wav');
      fs.writeFileSync(testFilePath, testAudioContent);

      const formData = new FormData();
      formData.append('audio', fs.createReadStream(testFilePath), {
        filename: 'test-audio.wav',
        contentType: 'audio/wav'
      });

      const result = await apiRequest('POST', `/conversation/sessions/${sessionId}/voice`, formData, null, true);
      
      // 테스트 파일 정리
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }

      if (result.success) {
        console.log('Voice Upload: ✅ PASS');
        console.log('  Transcription:', result.data.data?.transcription || 'Mock processing');
        console.log('  Pronunciation Score:', result.data.data?.pronunciationScore || 'N/A');
        console.log('  AI Response:', result.data.data?.aiResponse?.substring(0, 50) + '...');
        return true;
      } else {
        console.log('Voice Upload: ❌ FAIL');
        console.log('Error:', result.error);
        return false;
      }
    } catch (error) {
      console.log('Voice Upload: ❌ ERROR');
      console.log('Error:', error.message);
      return false;
    }
  },

  // 9. 진행률 조회
  async testGetProgress() {
    console.log('\n📊 Testing Get Progress...');
    const result = await apiRequest('GET', '/conversation/progress');
    
    if (result.success) {
      console.log('Get Progress: ✅ PASS');
      console.log('  Total Situations:', result.data.summary?.totalSituations || 0);
      console.log('  Practiced Situations:', result.data.summary?.practicedSituations || 0);
      console.log('  Total Practices:', result.data.summary?.totalPractices || 0);
      return true;
    } else {
      console.log('Get Progress: ❌ FAIL');
      console.log('Error:', result.error);
      return false;
    }
  },

  // 10. 세션 종료
  async testEndSession() {
    if (!sessionId) {
      console.log('\n🏁 End Session: ❌ SKIP (No session)');
      return false;
    }

    console.log('\n🏁 Testing End Session...');
    const result = await apiRequest('POST', `/conversation/sessions/${sessionId}/end`, {});
    
    if (result.success) {
      console.log('End Session: ✅ PASS');
      console.log('  Final Score:', result.data.data?.evaluation?.score || 'N/A');
      console.log('  Duration:', result.data.data?.duration || 'N/A');
      console.log('  Message Count:', result.data.data?.messageCount || 0);
      return true;
    } else {
      console.log('End Session: ❌ FAIL');
      console.log('Error:', result.error);
      return false;
    }
  },

  // 11. Socket 상태 확인
  async testSocketStatus() {
    console.log('\n📡 Testing Socket Status API...');
    const result = await apiRequest('GET', '/socket/status');
    
    if (result.success) {
      console.log('Socket Status: ✅ PASS');
      console.log('  Total Sessions:', result.data.data?.totalSessions || 0);
      console.log('  Active Sessions:', result.data.data?.activeSessions || 0);
      return true;
    } else {
      console.log('Socket Status: ❌ FAIL');
      console.log('Error:', result.error);
      return false;
    }
  }
};

// 전체 테스트 실행
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive API & Socket Tests for English Learning App');
  console.log('=' .repeat(80));

  const testResults = [];
  
  // 순차적으로 테스트 실행
  testResults.push(await tests.testHealthCheck());
  testResults.push(await tests.testSocketConnection());
  testResults.push(await tests.testGetSituations());
  testResults.push(await tests.testStartSession());
  testResults.push(await tests.testSocketJoinConversation());
  testResults.push(await tests.testSendMessage());
  testResults.push(await tests.testSocketSendMessage());
  testResults.push(await tests.testVoiceUpload());
  testResults.push(await tests.testGetProgress());
  testResults.push(await tests.testEndSession());
  testResults.push(await tests.testSocketStatus());

  // Socket 연결 종료
  if (socket) {
    socket.disconnect();
    console.log('\n🔌 Socket disconnected');
  }

  console.log('\n' + '=' .repeat(80));
  console.log('📊 Comprehensive Test Results Summary');
  console.log('=' .repeat(80));
  
  const passedTests = testResults.filter(result => result).length;
  const totalTests = testResults.length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  console.log(`📈 Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! The English Learning App is fully functional.');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('\n✅ Most tests passed! The app is largely functional with minor issues.');
  } else {
    console.log('\n⚠️  Several tests failed. Please check the implementation.');
  }
  
  console.log('\n💡 Test Coverage:');
  console.log('   - HTTP API endpoints');
  console.log('   - Socket.io real-time communication');
  console.log('   - File upload (voice messages)');
  console.log('   - AI response generation');
  console.log('   - Session management');
  console.log('   - Progress tracking');
}

// 개별 테스트 실행 함수
async function runSpecificTest(testName) {
  if (tests[testName]) {
    console.log(`🔍 Running specific test: ${testName}`);
    
    // Socket 연결이 필요한 테스트면 먼저 연결
    if (['testSocketConnection', 'testSocketJoinConversation', 'testSocketSendMessage'].includes(testName)) {
      await tests.testSocketConnection();
    }
    
    await tests[testName]();
    
    if (socket) {
      socket.disconnect();
    }
  } else {
    console.log(`❌ Test '${testName}' not found`);
    console.log('Available tests:', Object.keys(tests).join(', '));
  }
}

// 스크립트 실행
if (require.main === module) {
  const testName = process.argv[2];
  if (testName) {
    runSpecificTest(testName);
  } else {
    runComprehensiveTests();
  }
}

module.exports = { tests, apiRequest, connectSocket };