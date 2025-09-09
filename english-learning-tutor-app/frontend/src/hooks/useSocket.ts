import { useEffect, useRef, useCallback, useState } from 'react';
import { Alert } from 'react-native';
import socketService, { MessageData } from '../services/socketService';

interface UseSocketProps {
  userId: string;
  sessionId?: string;
  situationId?: string;
}

interface SocketState {
  connected: boolean;
  authenticated: boolean;
  sessionJoined: boolean;
  loading: boolean;
  error: string | null;
}

interface UseSocketReturn extends SocketState {
  // Connection methods
  connect: () => Promise<boolean>;
  disconnect: () => void;
  
  // Session methods
  joinSession: (sessionId: string, situationId: string) => Promise<boolean>;
  endSession: () => boolean;
  
  // Messaging methods
  sendMessage: (message: string) => boolean;
  sendVoice: (audioData: string, duration: number) => boolean;
  setTyping: (typing: boolean) => void;
  
  // Event handlers
  onMessage: (callback: (message: MessageData) => void) => () => void;
  onVoiceProcessed: (callback: (data: any) => void) => () => void;
  onAIResponse: (callback: (data: any) => void) => () => void;
  onSessionEnded: (callback: (data: any) => void) => () => void;
  onTyping: (callback: (data: any) => void) => () => void;
  onError: (callback: (error: any) => void) => () => void;
}

export const useSocket = ({ userId, sessionId, situationId }: UseSocketProps): UseSocketReturn => {
  const [state, setState] = useState<SocketState>({
    connected: false,
    authenticated: false,
    sessionJoined: false,
    loading: false,
    error: null
  });

  const cleanupCallbacks = useRef<Array<() => void>>([]);

  // 상태 업데이트 헬퍼
  const updateState = useCallback((updates: Partial<SocketState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 연결
  const connect = useCallback(async (): Promise<boolean> => {
    updateState({ loading: true, error: null });
    
    try {
      if (!socketService.connected) {
        // 연결 대기
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
          
          const checkConnection = () => {
            if (socketService.connected) {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
        });
      }
      
      updateState({ connected: true });
      
      // 인증 시도
      const authSuccess = await socketService.authenticate(userId);
      if (authSuccess) {
        updateState({ authenticated: true, loading: false });
        return true;
      } else {
        updateState({ error: 'Authentication failed', loading: false });
        return false;
      }
    } catch (error: any) {
      updateState({ 
        error: error.message || 'Connection failed', 
        loading: false,
        connected: false,
        authenticated: false 
      });
      return false;
    }
  }, [userId, updateState]);

  // 연결 해제
  const disconnect = useCallback(() => {
    // 모든 이벤트 리스너 정리
    cleanupCallbacks.current.forEach(cleanup => cleanup());
    cleanupCallbacks.current = [];
    
    socketService.disconnect();
    
    updateState({
      connected: false,
      authenticated: false,
      sessionJoined: false,
      loading: false,
      error: null
    });
  }, [updateState]);

  // 세션 참여
  const joinSession = useCallback(async (sessionId: string, situationId: string): Promise<boolean> => {
    if (!state.authenticated) {
      updateState({ error: 'Not authenticated' });
      return false;
    }

    updateState({ loading: true, error: null });
    
    try {
      const success = await socketService.joinConversation(sessionId, situationId);
      if (success) {
        updateState({ sessionJoined: true, loading: false });
        return true;
      } else {
        updateState({ error: 'Failed to join session', loading: false });
        return false;
      }
    } catch (error: any) {
      updateState({ 
        error: error.message || 'Failed to join session', 
        loading: false 
      });
      return false;
    }
  }, [state.authenticated, updateState]);

  // 세션 종료
  const endSession = useCallback((): boolean => {
    const success = socketService.endSession();
    if (success) {
      updateState({ sessionJoined: false });
    }
    return success;
  }, [updateState]);

  // 메시지 전송
  const sendMessage = useCallback((message: string): boolean => {
    if (!state.sessionJoined) {
      updateState({ error: 'Not in session' });
      return false;
    }
    
    return socketService.sendMessage(message);
  }, [state.sessionJoined, updateState]);

  // 음성 전송
  const sendVoice = useCallback((audioData: string, duration: number): boolean => {
    if (!state.sessionJoined) {
      updateState({ error: 'Not in session' });
      return false;
    }
    
    return socketService.sendVoice({ audioData, duration });
  }, [state.sessionJoined, updateState]);

  // 타이핑 인디케이터
  const setTyping = useCallback((typing: boolean) => {
    socketService.sendTyping(typing);
  }, []);

  // 이벤트 리스너 등록 헬퍼
  const registerCallback = useCallback((registerFn: (callback: any) => () => void) => {
    return (callback: any) => {
      const cleanup = registerFn(callback);
      cleanupCallbacks.current.push(cleanup);
      return cleanup;
    };
  }, []);

  // 메시지 수신
  const onMessage = useCallback(
    registerCallback(socketService.onMessage.bind(socketService)),
    [registerCallback]
  );

  // 음성 처리 완료
  const onVoiceProcessed = useCallback(
    registerCallback(socketService.onVoiceProcessed.bind(socketService)),
    [registerCallback]
  );

  // AI 응답 수신
  const onAIResponse = useCallback(
    registerCallback(socketService.onAIResponse.bind(socketService)),
    [registerCallback]
  );

  // 세션 종료 알림
  const onSessionEnded = useCallback(
    registerCallback(socketService.onSessionEnded.bind(socketService)),
    [registerCallback]
  );

  // 타이핑 인디케이터
  const onTyping = useCallback(
    registerCallback(socketService.onTyping.bind(socketService)),
    [registerCallback]
  );

  // 에러 처리
  const onError = useCallback(
    registerCallback((callback: (error: any) => void) => {
      return socketService.onError((error) => {
        updateState({ error: error.message || 'Socket error' });
        callback(error);
      });
    }),
    [registerCallback, updateState]
  );

  // 컴포넌트 마운트 시 자동 연결
  useEffect(() => {
    if (userId && !state.connected) {
      connect();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      cleanupCallbacks.current.forEach(cleanup => cleanup());
      cleanupCallbacks.current = [];
    };
  }, [userId, connect, state.connected]);

  // 세션 자동 참여
  useEffect(() => {
    if (state.authenticated && !state.sessionJoined && sessionId && situationId) {
      joinSession(sessionId, situationId);
    }
  }, [state.authenticated, state.sessionJoined, sessionId, situationId, joinSession]);

  // 에러 알림 표시
  useEffect(() => {
    if (state.error) {
      Alert.alert('연결 오류', state.error, [
        { 
          text: '확인', 
          onPress: () => updateState({ error: null }) 
        }
      ]);
    }
  }, [state.error, updateState]);

  return {
    ...state,
    connect,
    disconnect,
    joinSession,
    endSession,
    sendMessage,
    sendVoice,
    setTyping,
    onMessage,
    onVoiceProcessed,
    onAIResponse,
    onSessionEnded,
    onTyping,
    onError
  };
};

export default useSocket;