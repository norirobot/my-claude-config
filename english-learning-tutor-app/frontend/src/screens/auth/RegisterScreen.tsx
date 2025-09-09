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

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const dispatch = useDispatch();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('입력 오류', '이름을 입력해주세요.');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('입력 오류', '이메일을 입력해주세요.');
      return false;
    }

    if (!isValidEmail(formData.email)) {
      Alert.alert('입력 오류', '올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return false;
    }

    if (!agreeToTerms) {
      Alert.alert('약관 동의', '이용약관 및 개인정보처리방침에 동의해주세요.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // TODO: Implement actual registration logic with backend
      console.log('Registration attempt:', formData);
      
      // Mock successful registration for UI testing
      setTimeout(() => {
        Alert.alert(
          '회원가입 완료', 
          '환영합니다! 이제 English Friends와 함께 영어 학습을 시작하세요.',
          [
            { 
              text: '시작하기', 
              onPress: () => {
                // TODO: Dispatch registration success action and navigate
                navigation.navigate('Login');
              }
            }
          ]
        );
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('회원가입 실패', '다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { text: '', color: Colors.text.secondary };
    if (password.length < 4) return { text: '약함', color: Colors.error };
    if (password.length < 6) return { text: '보통', color: Colors.warm };
    if (password.length < 8) return { text: '강함', color: Colors.success };
    return { text: '매우 강함', color: Colors.success };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
            showsVerticalScrollIndicator={false}
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
              
              <Text style={styles.title}>회원가입</Text>
              <Text style={styles.subtitle}>
                새로운 영어 학습 여정을 시작하세요
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이름</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="홍길동"
                  placeholderTextColor={Colors.text.secondary}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.text.secondary}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="최소 6자 이상"
                  placeholderTextColor={Colors.text.secondary}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                  autoComplete="password-new"
                />
                {formData.password.length > 0 && (
                  <Text style={[styles.passwordStrength, { color: passwordStrength.color }]}>
                    비밀번호 강도: {passwordStrength.text}
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호 확인</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formData.confirmPassword && 
                    formData.password !== formData.confirmPassword && 
                    styles.textInputError
                  ]}
                  placeholder="비밀번호를 다시 입력하세요"
                  placeholderTextColor={Colors.text.secondary}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry
                  autoComplete="password-new"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
                )}
              </View>

              {/* Terms Agreement */}
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  <Text style={styles.termsLink}>이용약관</Text> 및 {' '}
                  <Text style={styles.termsLink}>개인정보처리방침</Text>에 동의합니다
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? '가입 중...' : '회원가입'}
                </Text>
              </TouchableOpacity>

              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptText}>
                  이미 계정이 있으신가요?{' '}
                </Text>
                <TouchableOpacity 
                  onPress={handleGoToLogin}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}>로그인</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>가입하시면 이런 혜택이!</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🎁</Text>
                <Text style={styles.benefitText}>신규 가입 보너스 포인트</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>📈</Text>
                <Text style={styles.benefitText}>개인 맞춤 학습 진도 추적</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🏆</Text>
                <Text style={styles.benefitText}>성취 배지 및 리워드</Text>
              </View>
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
    paddingBottom: 30,
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
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  textInputError: {
    borderWidth: 2,
    borderColor: Colors.error,
  },
  passwordStrength: {
    ...typography.caption,
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    ...typography.caption,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.text.inverse,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: Colors.text.inverse,
  },
  checkmark: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    ...typography.bodySmall,
    color: Colors.text.inverse,
    opacity: 0.9,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    ...typography.buttonLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  loginLink: {
    ...typography.body,
    color: Colors.text.inverse,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  benefitsContainer: {
    paddingBottom: 30,
    paddingTop: 20,
  },
  benefitsTitle: {
    ...typography.h4,
    color: Colors.text.inverse,
    textAlign: 'center',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 32,
    textAlign: 'center',
  },
  benefitText: {
    ...typography.bodySmall,
    color: Colors.text.inverse,
    opacity: 0.9,
    flex: 1,
  },
});

export default RegisterScreen;