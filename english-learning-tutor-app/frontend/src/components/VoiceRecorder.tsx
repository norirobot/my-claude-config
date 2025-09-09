import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

interface VoiceRecorderProps {
  onRecordingComplete: (audioData: string, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  disabled?: boolean;
  maxDuration?: number; // 최대 녹음 시간 (milliseconds)
  minDuration?: number; // 최소 녹음 시간 (milliseconds)
}

interface RecordingState {
  isRecording: boolean;
  isPreparing: boolean;
  duration: number;
  hasPermission: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  disabled = false,
  maxDuration = 60000, // 1분
  minDuration = 1000,  // 1초
}) => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPreparing: false,
    duration: 0,
    hasPermission: false,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 애니메이션
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // 권한 요청
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const hasPermission = status === 'granted';
      setState(prev => ({ ...prev, hasPermission }));
      
      if (!hasPermission) {
        Alert.alert(
          '마이크 권한 필요',
          '음성 녹음을 위해 마이크 권한이 필요합니다.',
          [{ text: '확인' }]
        );
      }
      
      return hasPermission;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  // 녹음 설정
  const configureAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('Audio configuration failed:', error);
    }
  };

  // 녹음 시작
  const startRecording = async () => {
    if (disabled || state.isRecording) return;

    setState(prev => ({ ...prev, isPreparing: true }));

    try {
      // 권한 확인
      if (!state.hasPermission) {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          setState(prev => ({ ...prev, isPreparing: false }));
          return;
        }
      }

      // 오디오 설정
      await configureAudio();

      // 기존 녹음 정리
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      // 새 녹음 시작
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;

      // 상태 업데이트
      setState(prev => ({
        ...prev,
        isRecording: true,
        isPreparing: false,
        duration: 0,
      }));

      // 애니메이션 시작
      startPulseAnimation();
      startWaveAnimation();

      // 녹음 시간 카운터 시작
      durationTimerRef.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 100;
          
          // 최대 시간 초과 시 자동 중지
          if (newDuration >= maxDuration) {
            stopRecording();
            return prev;
          }
          
          return { ...prev, duration: newDuration };
        });
      }, 100);

      onRecordingStart?.();

    } catch (error) {
      console.error('Recording start failed:', error);
      setState(prev => ({ ...prev, isPreparing: false, isRecording: false }));
      Alert.alert('녹음 오류', '녹음을 시작할 수 없습니다.');
    }
  };

  // 녹음 중지
  const stopRecording = async () => {
    if (!state.isRecording || !recordingRef.current) return;

    try {
      // 타이머 정리
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }

      // 애니메이션 중지
      stopPulseAnimation();
      stopWaveAnimation();

      // 녹음 중지
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      setState(prev => ({ ...prev, isRecording: false }));
      
      if (uri) {
        // 최소 녹음 시간 확인
        if (state.duration < minDuration) {
          Alert.alert(
            '녹음 시간 부족', 
            `최소 ${Math.ceil(minDuration / 1000)}초 이상 녹음해주세요.`
          );
          setState(prev => ({ ...prev, duration: 0 }));
          return;
        }

        // 오디오 파일을 Base64로 변환
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64);
            };
            reader.readAsDataURL(blob);
          });

          onRecordingComplete(base64Data, state.duration);
          onRecordingStop?.();
        } catch (error) {
          console.error('Audio conversion failed:', error);
          Alert.alert('변환 오류', '녹음 파일을 처리할 수 없습니다.');
        }
      }

      recordingRef.current = null;
      setState(prev => ({ ...prev, duration: 0 }));

    } catch (error) {
      console.error('Recording stop failed:', error);
      Alert.alert('녹음 오류', '녹음을 중지할 수 없습니다.');
    }
  };

  // 펄스 애니메이션
  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start((finished) => {
        if (finished && state.isRecording) {
          pulse();
        }
      });
    };
    pulse();
  };

  const stopPulseAnimation = () => {
    pulseAnim.setValue(1);
  };

  // 웨이브 애니메이션
  const startWaveAnimation = () => {
    const wave = () => {
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start((finished) => {
        if (finished && state.isRecording) {
          waveAnim.setValue(0);
          wave();
        }
      });
    };
    wave();
  };

  const stopWaveAnimation = () => {
    waveAnim.setValue(0);
  };

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    requestPermissions();
    
    return () => {
      // 정리
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  // 시간 포맷팅
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const maxDurationSeconds = Math.floor(maxDuration / 1000);

  return (
    <View style={styles.container}>
      {/* 녹음 버튼 */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          state.isRecording && styles.recordButtonActive,
          disabled && styles.recordButtonDisabled,
        ]}
        onPress={state.isRecording ? stopRecording : startRecording}
        disabled={disabled || state.isPreparing}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.recordButtonInner,
            { transform: [{ scale: state.isRecording ? pulseAnim : 1 }] }
          ]}
        >
          <Text style={[
            styles.recordButtonText,
            state.isRecording && styles.recordButtonTextActive
          ]}>
            {state.isPreparing ? '🔄' : state.isRecording ? '🔴' : '🎤'}
          </Text>
        </Animated.View>

        {/* 녹음 중 파형 효과 */}
        {state.isRecording && (
          <Animated.View
            style={[
              styles.waveEffect,
              {
                transform: [{
                  scale: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  })
                }],
                opacity: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 0],
                }),
              }
            ]}
          />
        )}
      </TouchableOpacity>

      {/* 상태 텍스트 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {state.isPreparing ? '준비 중...' :
           state.isRecording ? `🔴 녹음 중 ${formatDuration(state.duration)}` :
           '음성 버튼을 눌러 녹음하세요'}
        </Text>
        
        {state.isRecording && (
          <Text style={styles.maxDurationText}>
            최대 {maxDurationSeconds}초
          </Text>
        )}
      </View>

      {/* 진행 바 */}
      {state.isRecording && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(state.duration / maxDuration) * 100}%` }
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: Spacing.md,
  },
  recordButtonActive: {
    backgroundColor: Colors.status.error,
  },
  recordButtonDisabled: {
    backgroundColor: Colors.background.tertiary,
    opacity: 0.6,
  },
  recordButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  recordButtonText: {
    fontSize: 32,
  },
  recordButtonTextActive: {
    fontSize: 28,
  },
  waveEffect: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.status.error,
  },
  statusContainer: {
    alignItems: 'center',
    minHeight: 50,
  },
  statusText: {
    ...typography.body,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  maxDurationText: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  progressBarContainer: {
    width: Dimensions.get('window').width * 0.7,
    height: 4,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 2,
    marginTop: Spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.status.error,
    borderRadius: 2,
  },
});

export default VoiceRecorder;