import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
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
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🎯</Text>
            <Text style={styles.logoText}>English Friends</Text>
          </View>
          <Text style={styles.tagline}>
            AI와 함께하는 실전 영어 연습
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>실시간 AI 대화 연습</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎤</Text>
            <Text style={styles.featureText}>발음 분석 & 피드백</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureText}>전문 튜터 연결 서비스</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>개인 맞춤 학습 진도</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>이미 계정이 있나요? 로그인</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            무료로 시작하고 언제든 업그레이드하세요
          </Text>
        </View>
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
    paddingHorizontal: 20,
  },
  header: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    ...typography.h1,
    color: Colors.text.inverse,
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  tagline: {
    ...typography.bodyLarge,
    color: Colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 10,
  },
  featuresContainer: {
    flex: 2,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.95,
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  primaryButton: {
    backgroundColor: Colors.text.inverse,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    ...typography.buttonLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: Colors.text.inverse,
    opacity: 0.9,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: Colors.text.inverse,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default WelcomeScreen;