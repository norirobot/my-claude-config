import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { 
  startSession, 
  nextSituation, 
  recordResponse, 
  completeSession 
} from '../../store/slices/situationSlice';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import useSocket from '../../hooks/useSocket';
import VoiceRecorder from '../../components/VoiceRecorder';
import { MessageData } from '../../services/socketService';

const SituationPracticeScreen = () => {
  const dispatch = useDispatch();
  const { 
    currentSituation, 
    sessionActive, 
    sessionProgress,
    currentResponse,
    loading 
  } = useSelector((state: RootState) => state.situation);
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [userResponse, setUserResponse] = useState('');
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Socket.io 훅 사용
  const socket = useSocket({
    userId: user?.id || 'anonymous-user',
    sessionId: sessionActive ? sessionId : undefined,
    situationId: currentSituation?.id || undefined,
  });

  useEffect(() => {
    if (!sessionActive) {
      dispatch(startSession());
    }
  }, [sessionActive, dispatch]);

  // Socket.io 이벤트 리스너 설정
  useEffect(() => {
    // 메시지 수신
    const unsubscribeMessage = socket.onMessage((message: MessageData) => {
      setMessages(prev => [...prev, message]);
    });

    // AI 응답 수신
    const unsubscribeAI = socket.onAIResponse((data: any) => {
      const aiMessage = data.message;
      const feedback = data.feedback;
      
      setMessages(prev => [...prev, aiMessage]);
      setAiTyping(false);
      
      // Redux 스토어 업데이트
      dispatch(recordResponse({
        response: userResponse,
        timestamp: Date.now(),
        confidence: feedback?.score || 0,
        aiMessage: aiMessage.content,
        feedback: feedback ? [
          ...feedback.suggestions || [],
          ...feedback.corrections || [],
          ...feedback.positives || []
        ].join(' ') : undefined
      }));
    });

    // 음성 처리 완료
    const unsubscribeVoice = socket.onVoiceProcessed((data: any) => {
      setVoiceProcessing(false);
      setUserResponse(data.transcription || '');
      
      // 음성 피드백을 별도로 표시할 수 있음
      if (data.pronunciationScore) {
        Alert.alert(
          '발음 분석 완료',
          `발음 점수: ${data.pronunciationScore}/100\n${data.feedback?.overallFeedback || '좋은 발음입니다!'}`,
          [{ text: '확인' }]
        );
      }
    });

    // 타이핑 인디케이터
    const unsubscribeTyping = socket.onTyping((data: any) => {
      if (data.isAI) {
        setAiTyping(data.typing);
      }
    });

    // 세션 종료
    const unsubscribeSession = socket.onSessionEnded((data: any) => {
      Alert.alert(
        '세션 완료',
        `총 ${data.messageCount}개 메시지\n평가 점수: ${data.evaluation?.score || 'N/A'}`,
        [
          { text: '확인', onPress: () => dispatch(completeSession()) }
        ]
      );
    });

    // 에러 처리
    const unsubscribeError = socket.onError((error: any) => {
      console.error('Socket error:', error);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeAI();
      unsubscribeVoice();
      unsubscribeTyping();
      unsubscribeSession();
      unsubscribeError();
    };
  }, [socket, dispatch, userResponse]);

  // 음성 녹음 완료 핸들러
  const handleVoiceRecordingComplete = (audioData: string, duration: number) => {
    if (!socket.sessionJoined) {
      Alert.alert('세션 오류', '세션에 참여하지 않았습니다.');
      return;
    }

    setVoiceProcessing(true);
    
    // Socket.io로 음성 데이터 전송
    const success = socket.sendVoice(audioData, duration);
    if (!success) {
      setVoiceProcessing(false);
      Alert.alert('전송 오류', '음성 데이터를 전송할 수 없습니다.');
    }
  };

  // 텍스트 메시지 전송
  const handleSubmitResponse = () => {
    if (!userResponse.trim()) {
      Alert.alert('알림', '응답을 입력하거나 녹음해주세요.');
      return;
    }

    if (!socket.sessionJoined) {
      Alert.alert('세션 오류', '세션에 참여하지 않았습니다.');
      return;
    }

    // 사용자 메시지를 로컬 상태에 추가
    const userMessage: MessageData = {
      id: Date.now().toString(),
      role: 'user',
      content: userResponse,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);

    // Socket.io로 메시지 전송
    const success = socket.sendMessage(userResponse);
    if (success) {
      setAiTyping(true);
      setUserResponse('');
    } else {
      Alert.alert('전송 오류', '메시지를 전송할 수 없습니다.');
    }
  };

  const handleNextSituation = () => {
    dispatch(nextSituation());
  };

  const handleEndSession = () => {
    Alert.alert(
      '세션 종료',
      '정말로 세션을 종료하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '종료', 
          style: 'destructive',
          onPress: () => {
            // Socket.io로 세션 종료 알림
            if (socket.sessionJoined) {
              socket.endSession();
            }
            dispatch(completeSession());
          }
        }
      ]
    );
  };

  if (!currentSituation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>상황 준비 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.sessionText}>상황 연습</Text>
            <Text style={styles.progressText}>
              {sessionProgress.current} / {sessionProgress.total}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.endButton} 
            onPress={handleEndSession}
          >
            <Text style={styles.endButtonText}>종료</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { 
                width: `${(sessionProgress.current / sessionProgress.total) * 100}%` 
              }
            ]}
          />
        </View>

        {/* Situation Card */}
        <View style={styles.situationCard}>
          <View style={styles.situationHeader}>
            <Text style={styles.situationCategory}>
              {currentSituation.category}
            </Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {currentSituation.difficulty}
              </Text>
            </View>
          </View>
          
          <Text style={styles.situationTitle}>
            {currentSituation.title}
          </Text>
          
          <Text style={styles.situationDescription}>
            {currentSituation.description}
          </Text>

          {currentSituation.context && (
            <View style={styles.contextContainer}>
              <Text style={styles.contextTitle}>상황 배경:</Text>
              <Text style={styles.contextText}>
                {currentSituation.context}
              </Text>
            </View>
          )}
        </View>

        {/* 실시간 메시지 히스토리 */}
        {messages.length > 0 && (
          <View style={styles.messagesContainer}>
            <Text style={styles.messagesTitle}>💬 대화 내용:</Text>
            {messages.slice(-3).map((message, index) => (
              <View key={message.id} style={[
                styles.messageItem,
                message.role === 'user' ? styles.userMessage : styles.aiMessage
              ]}>
                <Text style={styles.messageRole}>
                  {message.role === 'user' ? '나' : 'AI'}:
                </Text>
                <Text style={styles.messageContent}>
                  {message.content}
                </Text>
                {message.type === 'voice' && (
                  <Text style={styles.messageType}>🎤 음성</Text>
                )}
              </View>
            ))}
            {aiTyping && (
              <View style={[styles.messageItem, styles.aiMessage]}>
                <Text style={styles.messageRole}>AI:</Text>
                <Text style={[styles.messageContent, styles.typingIndicator]}>
                  💭 응답 중...
                </Text>
              </View>
            )}
          </View>
        )}

        {/* AI Response Display (기존 방식과 병행) */}
        {currentResponse && (
          <View style={styles.responseCard}>
            <Text style={styles.responseTitle}>AI 대화상대:</Text>
            <Text style={styles.responseText}>
              {currentResponse.aiMessage}
            </Text>
            {currentResponse.feedback && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackTitle}>피드백:</Text>
                <Text style={styles.feedbackText}>
                  {currentResponse.feedback}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Response Input Area */}
        <View style={styles.inputArea}>
          <Text style={styles.inputTitle}>당신의 응답:</Text>
          
          {/* Socket 연결 상태 표시 */}
          <View style={styles.connectionStatus}>
            <Text style={[
              styles.connectionText,
              socket.connected ? styles.connectedText : styles.disconnectedText
            ]}>
              {socket.connected ? (
                socket.sessionJoined ? '🟢 실시간 연결됨' : '🟡 연결 중...'
              ) : '🔴 연결 끊어짐'}
            </Text>
          </View>
          
          {/* Voice Recording Component */}
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecordingComplete}
            disabled={!socket.sessionJoined || voiceProcessing}
            maxDuration={30000} // 30초
            minDuration={1000}  // 1초
          />
          
          {/* 음성 처리 상태 */}
          {voiceProcessing && (
            <View style={styles.processingStatus}>
              <Text style={styles.processingText}>
                🤖 음성 분석 중...
              </Text>
            </View>
          )}

          {/* Text Response Display */}
          {userResponse ? (
            <View style={styles.responsePreview}>
              <Text style={styles.responsePreviewText}>
                {userResponse}
              </Text>
            </View>
          ) : (
            <View style={styles.responsePreview}>
              <Text style={styles.responsePreviewPlaceholder}>
                음성 버튼을 눌러 응답을 녹음하세요
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {userResponse ? (
              <>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmitResponse}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? '분석 중...' : '응답 제출'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => setUserResponse('')}
                >
                  <Text style={styles.retryButtonText}>다시 녹음</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={handleNextSituation}
              >
                <Text style={styles.skipButtonText}>다음 상황</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Suggested Expressions */}
        <View style={styles.suggestionsCard}>
          <Text style={styles.suggestionsTitle}>💡 도움이 될 표현들:</Text>
          {currentSituation.suggestedExpressions?.map((expression, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.suggestionItem}
              onPress={() => setUserResponse(expression)}
            >
              <Text style={styles.suggestionText}>{expression}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.h3,
    color: colors.text.secondary,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressInfo: {
    flex: 1,
  },
  sessionText: {
    ...typography.h3,
    color: colors.text.primary,
  },
  progressText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  endButton: {
    backgroundColor: colors.status.error,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  endButtonText: {
    ...typography.body,
    color: colors.background.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 2,
  },
  situationCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: spacing.elevation.sm,
  },
  situationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  situationCategory: {
    ...typography.caption,
    color: colors.primary.main,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    backgroundColor: colors.accent.light,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.accent.main,
    fontWeight: '600',
  },
  situationTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  situationDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  contextContainer: {
    backgroundColor: colors.secondary.light,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
  },
  contextTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  contextText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  responseCard: {
    backgroundColor: colors.primary.light,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  responseTitle: {
    ...typography.body,
    color: colors.primary.dark,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  responseText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  feedbackContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primary.main,
  },
  feedbackTitle: {
    ...typography.body,
    color: colors.primary.dark,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  feedbackText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  inputArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  inputTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  recordButton: {
    backgroundColor: colors.accent.main,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recordButtonActive: {
    backgroundColor: colors.status.error,
  },
  recordButtonText: {
    ...typography.body,
    color: colors.background.primary,
    fontWeight: '600',
  },
  responsePreview: {
    backgroundColor: colors.background.tertiary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 60,
  },
  responsePreviewText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  responsePreviewPlaceholder: {
    ...typography.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    ...typography.body,
    color: colors.background.primary,
    fontWeight: '600',
  },
  retryButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.body,
    color: colors.text.primary,
  },
  skipButton: {
    flex: 1,
    backgroundColor: colors.secondary.main,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.body,
    color: colors.background.primary,
    fontWeight: '600',
  },
  suggestionsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  suggestionsTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  suggestionItem: {
    backgroundColor: colors.background.tertiary,
    borderRadius: spacing.borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  suggestionText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  // 새로운 실시간 통신 관련 스타일들
  messagesContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    maxHeight: 200,
  },
  messagesTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  messageItem: {
    backgroundColor: colors.background.tertiary,
    borderRadius: spacing.borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  userMessage: {
    backgroundColor: colors.primary.light,
    alignSelf: 'flex-end',
    marginLeft: spacing.lg,
  },
  aiMessage: {
    backgroundColor: colors.secondary.light,
    alignSelf: 'flex-start',
    marginRight: spacing.lg,
  },
  messageRole: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  messageContent: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  messageType: {
    ...typography.caption,
    color: colors.accent.main,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  typingIndicator: {
    fontStyle: 'italic',
    color: colors.text.secondary,
  },
  connectionStatus: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  connectionText: {
    ...typography.caption,
    fontWeight: '600',
  },
  connectedText: {
    color: colors.status.success,
  },
  disconnectedText: {
    color: colors.status.error,
  },
  processingStatus: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  processingText: {
    ...typography.body,
    color: colors.accent.main,
    fontStyle: 'italic',
  },
});

export default SituationPracticeScreen;