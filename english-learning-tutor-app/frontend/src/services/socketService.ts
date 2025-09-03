import { io, Socket } from 'socket.io-client';

interface MessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userId?: string;
  type: 'text' | 'voice';
  analysis?: any;
  feedback?: any;
}

interface SessionData {
  sessionId: string;
  situationId: string;
  userId: string;
}

interface VoiceData {
  audioData: string;
  duration: number;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private currentSession: string | null = null;

  // 이벤트 리스너들
  private messageCallbacks: Array<(message: MessageData) => void> = [];
  private voiceProcessedCallbacks: Array<(data: any) => void> = [];
  private aiResponseCallbacks: Array<(data: any) => void> = [];
  private sessionEndedCallbacks: Array<(data: any) => void> = [];
  private typingCallbacks: Array<(data: any) => void> = [];
  private errorCallbacks: Array<(error: any) => void> = [];

  constructor() {
    this.setupSocket();
  }

  // Socket 초기화 및 연결
  private setupSocket() {
    const SERVER_URL = __DEV__ 
      ? 'http://localhost:3000' 
      : 'https://your-production-api.com';

    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  // 이벤트 리스너 설정
  private setupEventListeners() {
    if (!this.socket) return;

    // 연결 성공
    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    // 연결 해제
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
    });

    // 인증 성공
    this.socket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
    });

    // 인증 실패
    this.socket.on('auth-error', (error) => {
      console.error('❌ Socket auth error:', error);
      this.notifyError(error);
    });

    // 대화방 참여 성공
    this.socket.on('conversation-joined', (data) => {
      console.log('👥 Joined conversation:', data);
      this.currentSession = data.sessionId;
    });

    // 새 메시지 수신
    this.socket.on('new-message', (message: MessageData) => {
      console.log('📨 New message received:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    // 메시지 전송 확인
    this.socket.on('message-sent', (data) => {
      console.log('✅ Message sent confirmed:', data);
    });

    // 음성 처리 완료
    this.socket.on('voice-processed', (data) => {
      console.log('🎤 Voice processed:', data);
      this.voiceProcessedCallbacks.forEach(callback => callback(data));
    });

    // 음성 처리 중
    this.socket.on('voice-processing', (data) => {
      console.log('🔄 Voice processing:', data.message);
    });

    // 음성 처리 에러
    this.socket.on('voice-error', (error) => {
      console.error('🎤❌ Voice error:', error);
      this.notifyError(error);
    });

    // AI 응답 수신
    this.socket.on('ai-response', (data) => {
      console.log('🤖 AI response:', data);
      this.aiResponseCallbacks.forEach(callback => callback(data));
    });

    // AI 타이핑 인디케이터
    this.socket.on('ai-typing', (data) => {
      console.log('🤖✍️ AI typing:', data.typing);
      this.typingCallbacks.forEach(callback => callback({
        isAI: true,
        typing: data.typing
      }));
    });

    // 사용자 타이핑 인디케이터
    this.socket.on('user-typing', (data) => {
      console.log('👤✍️ User typing:', data);
      this.typingCallbacks.forEach(callback => callback({
        isAI: false,
        userId: data.userId,
        typing: data.typing
      }));
    });

    // 세션 종료
    this.socket.on('session-ended', (data) => {
      console.log('🏁 Session ended:', data);
      this.currentSession = null;
      this.sessionEndedCallbacks.forEach(callback => callback(data));
    });

    // AI 에러
    this.socket.on('ai-error', (error) => {
      console.error('🤖❌ AI error:', error);
      this.notifyError(error);
    });

    // 일반 에러
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.notifyError(error);
    });

    // 연결 에러
    this.socket.on('connect_error', (error) => {
      console.error('🔌❌ Connection error:', error);
      this.notifyError({ message: 'Connection failed', error });
    });
  }

  // 사용자 인증
  async authenticate(userId: string, token?: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve(false);
        return;
      }

      // 인증 성공 리스너
      const authSuccessHandler = () => {
        this.socket?.off('authenticated', authSuccessHandler);
        this.socket?.off('auth-error', authErrorHandler);
        resolve(true);
      };

      // 인증 실패 리스너
      const authErrorHandler = () => {
        this.socket?.off('authenticated', authSuccessHandler);
        this.socket?.off('auth-error', authErrorHandler);
        resolve(false);
      };

      this.socket.once('authenticated', authSuccessHandler);
      this.socket.once('auth-error', authErrorHandler);

      // 인증 요청
      this.socket.emit('authenticate', { userId, token });
    });
  }

  // 대화 세션 참여
  async joinConversation(sessionId: string, situationId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve(false);
        return;
      }

      const joinSuccessHandler = (data: any) => {
        this.socket?.off('conversation-joined', joinSuccessHandler);
        this.socket?.off('error', joinErrorHandler);
        resolve(data.success);
      };

      const joinErrorHandler = () => {
        this.socket?.off('conversation-joined', joinSuccessHandler);
        this.socket?.off('error', joinErrorHandler);
        resolve(false);
      };

      this.socket.once('conversation-joined', joinSuccessHandler);
      this.socket.once('error', joinErrorHandler);

      this.socket.emit('join-conversation', { sessionId, situationId });
    });
  }

  // 텍스트 메시지 전송
  sendMessage(message: string, messageType: 'text' | 'voice' = 'text'): boolean {
    if (!this.socket || !this.isConnected || !this.currentSession) {
      console.warn('Cannot send message: not connected or no active session');
      return false;
    }

    this.socket.emit('send-message', {
      sessionId: this.currentSession,
      message,
      messageType
    });

    return true;
  }

  // 음성 메시지 전송
  sendVoice(voiceData: VoiceData): boolean {
    if (!this.socket || !this.isConnected || !this.currentSession) {
      console.warn('Cannot send voice: not connected or no active session');
      return false;
    }

    this.socket.emit('send-voice', {
      sessionId: this.currentSession,
      audioData: voiceData.audioData,
      duration: voiceData.duration
    });

    return true;
  }

  // 타이핑 인디케이터 전송
  sendTyping(typing: boolean): void {
    if (!this.socket || !this.isConnected || !this.currentSession) {
      return;
    }

    this.socket.emit('typing', {
      sessionId: this.currentSession,
      typing
    });
  }

  // 세션 종료
  endSession(): boolean {
    if (!this.socket || !this.isConnected || !this.currentSession) {
      console.warn('Cannot end session: not connected or no active session');
      return false;
    }

    this.socket.emit('end-session', {
      sessionId: this.currentSession
    });

    return true;
  }

  // 이벤트 리스너 등록
  onMessage(callback: (message: MessageData) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  onVoiceProcessed(callback: (data: any) => void): () => void {
    this.voiceProcessedCallbacks.push(callback);
    return () => {
      const index = this.voiceProcessedCallbacks.indexOf(callback);
      if (index > -1) {
        this.voiceProcessedCallbacks.splice(index, 1);
      }
    };
  }

  onAIResponse(callback: (data: any) => void): () => void {
    this.aiResponseCallbacks.push(callback);
    return () => {
      const index = this.aiResponseCallbacks.indexOf(callback);
      if (index > -1) {
        this.aiResponseCallbacks.splice(index, 1);
      }
    };
  }

  onSessionEnded(callback: (data: any) => void): () => void {
    this.sessionEndedCallbacks.push(callback);
    return () => {
      const index = this.sessionEndedCallbacks.indexOf(callback);
      if (index > -1) {
        this.sessionEndedCallbacks.splice(index, 1);
      }
    };
  }

  onTyping(callback: (data: any) => void): () => void {
    this.typingCallbacks.push(callback);
    return () => {
      const index = this.typingCallbacks.indexOf(callback);
      if (index > -1) {
        this.typingCallbacks.splice(index, 1);
      }
    };
  }

  onError(callback: (error: any) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  // 에러 알림
  private notifyError(error: any): void {
    this.errorCallbacks.forEach(callback => callback(error));
  }

  // 현재 연결 상태
  get connected(): boolean {
    return this.isConnected;
  }

  // 현재 세션 ID
  get currentSessionId(): string | null {
    return this.currentSession;
  }

  // Socket 연결 해제
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentSession = null;
  }

  // Socket 재연결
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.setupSocket();
    }
  }
}

// 싱글톤 인스턴스
const socketService = new SocketService();

export default socketService;
export type { MessageData, SessionData, VoiceData };