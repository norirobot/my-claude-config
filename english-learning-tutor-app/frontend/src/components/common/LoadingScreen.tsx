import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'English Friends 준비 중...' 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo */}
          <Text style={styles.logo}>🎯</Text>
          
          {/* App Name */}
          <Text style={styles.appName}>English Friends</Text>
          
          {/* Loading Indicator */}
          <ActivityIndicator 
            size="large" 
            color={Colors.text.inverse}
            style={styles.spinner}
          />
          
          {/* Loading Message */}
          <Text style={styles.message}>{message}</Text>
          
          {/* Fun Facts */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              💡 매일 15분 연습하면 1년 후 유창한 회화가 가능해요!
            </Text>
          </View>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    ...typography.h1,
    color: Colors.text.inverse,
    marginBottom: 48,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 24,
  },
  message: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 48,
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipText: {
    ...typography.bodySmall,
    color: Colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoadingScreen;