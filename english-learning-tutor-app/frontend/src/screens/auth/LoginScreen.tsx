import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('입력 오류', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement actual login logic with backend
      console.log('Login attempt:', { email, password });
      
      // Mock successful login for UI testing
      setTimeout(() => {
        Alert.alert('로그인 성공', '환영합니다!', [
          { text: '확인', onPress: () => {
            // TODO: Dispatch login success action
            // dispatch(loginSuccess({ user: mockUser, token: 'mock-token' }));
          }}
        ]);
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      '비밀번호 재설정', 
      '등록된 이메일로 재설정 링크를 보내드리겠습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '전송', onPress: () => console.log('Password reset requested') }
      ]
    );
  };

  const handleGoToRegister = () => {
    navigation.navigate('Register');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleGoBack}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>← 뒤로</Text>
              </TouchableOpacity>
              
              <Text style={styles.title}>로그인</Text>
              <Text style={styles.subtitle}>
                계정에 로그인하여 학습을 계속하세요
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.text.secondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor={Colors.text.secondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotButtonText}>
                  비밀번호를 잊으셨나요?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? '로그인 중...' : '로그인'}
                </Text>
              </TouchableOpacity>

              <View style={styles.registerPrompt}>
                <Text style={styles.registerPromptText}>
                  계정이 없으신가요?{' '}
                </Text>
                <TouchableOpacity 
                  onPress={handleGoToRegister}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerLink}>회원가입</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Login Options */}
            <View style={styles.quickLoginContainer}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.demoButton}
                onPress={() => {
                  setEmail('demo@example.com');
                  setPassword('demo123');
                  Alert.alert('데모 계정', '데모용 계정 정보가 입력되었습니다.');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.demoButtonText}>📱 데모 계정으로 체험</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  backButtonText: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  title: {
    ...typography.h1,
    color: Colors.text.inverse,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 400,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    ...typography.label,
    color: Colors.text.inverse,
    marginBottom: 8,
    opacity: 0.9,
  },
  textInput: {
    backgroundColor: Colors.text.inverse,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    ...typography.body,
    color: Colors.text.primary,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 32,
  },
  forgotButtonText: {
    ...typography.bodySmall,
    color: Colors.text.inverse,
    opacity: 0.9,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: Colors.text.inverse,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...typography.buttonLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerPromptText: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  registerLink: {
    ...typography.body,
    color: Colors.text.inverse,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  quickLoginContainer: {
    paddingBottom: 30,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.text.inverse,
    opacity: 0.3,
  },
  dividerText: {
    ...typography.bodySmall,
    color: Colors.text.inverse,
    opacity: 0.8,
    paddingHorizontal: 16,
  },
  demoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  demoButtonText: {
    ...typography.button,
    color: Colors.text.inverse,
    opacity: 0.95,
  },
});

export default LoginScreen;