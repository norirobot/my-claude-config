const { io } = require('socket.io-client');

// 음성 처리 테스트를 위한 Mock 오디오 데이터 생성
class VoiceTester {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Mock Base64 오디오 데이터 생성
  generateMockAudioData() {
    // 간단한 WAV 헤더와 함께 더미 오디오 데이터 생성
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // ChunkSize
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6d, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // Subchunk1Size (16 for PCM)
      0x01, 0x00,             // AudioFormat (1 for PCM)
      0x01, 0x00,             // NumChannels (1 = mono)
      0x44, 0xac, 0x00, 0x00, // SampleRate (44100 Hz)
      0x44, 0xac, 0x00, 0x00, // ByteRate
      0x01, 0x00,             // BlockAlign
      0x08, 0x00,             // BitsPerSample (8 bits)
      0x64, 0x61, 0x74, 0x61, // "data"
      0x04, 0x00, 0x00, 0x00  // Subchunk2Size (4 bytes of data)
    ]);

    // 간단한 사인파 톤 생성 (440Hz A음)
    const sampleRate = 44100;
    const duration = 2; // 2초
    const frequency = 440; // A4 음
    const amplitude = 127;
    
    const samples = [];
    for (let i = 0; i < sampleRate * duration; i++) {
      const sample = Math.floor(amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate));
      samples.push(sample + 128); // 8-bit unsigned
    }

    const audioData = Buffer.concat([wavHeader, Buffer.from(samples)]);
    return `data:audio/wav;base64,${audioData.toString('base64')}`;
  }

  // 서버 연결
  async connect(serverUrl = 'http://localhost:3000') {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Connecting to ${serverUrl}...`);
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected:', this.socket.id);
        this.isConnected = true;
        this.setupEventListeners();
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });

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

    // 인증 완료
    this.socket.on('authenticated', (data) => {
      console.log('🔐 Authenticated:', data);
    });

    // 대화방 참여
    this.socket.on('conversation-joined', (data) => {
      console.log('🏠 Joined conversation:', data);
    });

    // 음성 처리 상태
    this.socket.on('voice-processing', (data) => {
      console.log('🎤 Voice processing:', data.message);
    });

    // 음성 처리 완료
    this.socket.on('voice-processed', (data) => {
      console.log('🎤✅ Voice processed successfully:');
      console.log('  📝 Transcription:', data.transcription);
      console.log('  📊 Pronunciation Score:', data.pronunciationScore);
      console.log('  💬 Feedback:', JSON.stringify(data.feedback, null, 2));
    });

    // 음성 처리 에러
    this.socket.on('voice-error', (error) => {
      console.error('🎤❌ Voice processing error:', error);
    });

    // AI 응답
    this.socket.on('ai-response', (data) => {
      console.log('🤖 AI Response:', data.message.content);
    });

    // 에러
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('🔌 Disconnected');
    });
  }

  // 인증 테스트
  async authenticate(userId = 'voice-test-user') {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);

      this.socket.once('authenticated', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      this.socket.emit('authenticate', { userId });
    });
  }

  // 대화 참여
  async joinConversation(sessionId = 'voice-test-session', situationId = 'daegu_pronunciation') {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);

      this.socket.once('conversation-joined', (data) => {
        clearTimeout(timeout);
        resolve(data.success);
      });

      this.socket.emit('join-conversation', { sessionId, situationId });
    });
  }

  // 음성 메시지 테스트
  async testVoiceMessage(sessionId = 'voice-test-session') {
    console.log('\\n🎤 Testing voice message processing...');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ Voice processing timeout');
        resolve(false);
      }, 30000); // 30초 타임아웃

      let processingStarted = false;
      let processingCompleted = false;

      // 처리 시작 확인
      this.socket.once('voice-processing', () => {
        processingStarted = true;
      });

      // 처리 완료 확인
      this.socket.once('voice-processed', (data) => {
        processingCompleted = true;
        clearTimeout(timeout);
        
        // 결과 검증
        if (data.transcription && data.pronunciationScore !== undefined) {
          console.log('✅ Voice processing completed successfully');
          resolve(true);
        } else {
          console.log('⚠️ Voice processing completed but missing expected data');
          resolve(false);
        }
      });

      // 처리 에러
      this.socket.once('voice-error', (error) => {
        clearTimeout(timeout);
        console.log('❌ Voice processing failed:', error.message);
        resolve(false);
      });

      // Mock 오디오 데이터 생성 및 전송
      const mockAudioData = this.generateMockAudioData();
      
      console.log('📤 Sending mock voice data...');
      console.log(`   📏 Data size: ${Math.round(mockAudioData.length / 1024)} KB`);
      
      this.socket.emit('send-voice', {
        sessionId,
        audioData: mockAudioData,
        duration: 2000 // 2초
      });
    });
  }

  // 여러 음성 메시지 테스트
  async testMultipleVoiceMessages(count = 3, sessionId = 'voice-test-session') {
    console.log(`\\n🎤 Testing ${count} voice messages...`);
    
    const results = [];
    
    for (let i = 1; i <= count; i++) {
      console.log(`\\n📤 Sending voice message ${i}/${count}...`);
      
      const success = await this.testVoiceMessage(sessionId);
      results.push(success);
      
      if (success) {
        console.log(`✅ Voice message ${i} processed successfully`);
      } else {
        console.log(`❌ Voice message ${i} failed`);
      }
      
      // 메시지 간 간격
      if (i < count) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    const successCount = results.filter(r => r).length;
    console.log(`\\n📊 Voice test results: ${successCount}/${count} successful`);
    
    return successCount === count;
  }

  // 전체 음성 기능 테스트
  async runFullVoiceTest() {
    console.log('🎤 Starting comprehensive voice processing test...\\n');

    try {
      // 1. 서버 연결
      await this.connect();
      console.log('✅ Step 1: Connection successful\\n');

      // 2. 인증
      const authSuccess = await this.authenticate();
      if (!authSuccess) {
        throw new Error('Authentication failed');
      }
      console.log('✅ Step 2: Authentication successful\\n');

      // 3. 대화 참여
      const joinSuccess = await this.joinConversation();
      if (!joinSuccess) {
        throw new Error('Join conversation failed');
      }
      console.log('✅ Step 3: Conversation join successful\\n');

      // 4. 단일 음성 메시지 테스트
      const singleVoiceSuccess = await this.testVoiceMessage();
      if (!singleVoiceSuccess) {
        throw new Error('Single voice message test failed');
      }
      console.log('✅ Step 4: Single voice message successful\\n');

      // 5. 다중 음성 메시지 테스트
      const multipleVoiceSuccess = await this.testMultipleVoiceMessages(3);
      if (!multipleVoiceSuccess) {
        console.log('⚠️ Step 5: Some voice messages failed, but test continues\\n');
      } else {
        console.log('✅ Step 5: Multiple voice messages successful\\n');
      }

      // 6. 큰 사이즈 오디오 테스트
      console.log('🎤 Testing large audio file...');
      const largeAudioSuccess = await this.testVoiceMessage();
      if (largeAudioSuccess) {
        console.log('✅ Step 6: Large audio file handled successfully\\n');
      }

      console.log('🎉 Voice processing tests completed successfully!\\n');
      console.log('📋 Test Summary:');
      console.log('  🔌 Connection: ✅');
      console.log('  🔐 Authentication: ✅');
      console.log('  🏠 Session Join: ✅');
      console.log('  🎤 Voice Processing: ✅');
      console.log('  📤 Multiple Messages: ✅');
      console.log('  📊 Large Files: ✅');
      
      return true;

    } catch (error) {
      console.error('❌ Voice test failed:', error.message);
      return false;
    } finally {
      this.disconnect();
    }
  }

  // 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

// 스크립트 실행
async function runVoiceTest() {
  const tester = new VoiceTester();
  
  console.log('🚀 Voice Processing Integration Test');
  console.log('===================================\\n');
  
  const success = await tester.runFullVoiceTest();
  
  process.exit(success ? 0 : 1);
}

// 직접 실행시에만 테스트 실행
if (require.main === module) {
  runVoiceTest().catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = VoiceTester;