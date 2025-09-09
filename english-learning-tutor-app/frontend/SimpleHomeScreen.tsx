import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

// 임시로 하드코딩된 데이터 (Redux 없이 테스트용)
const mockData = {
  user: { displayName: '테스트 사용자' },
  points: 1250,
  level: 3,
  streak: 7,
  todayGoal: 5,
  sessionsToday: 3,
};

const colors = {
  primary: { main: '#00C853' },
  accent: { main: '#FF9800' },
  background: { primary: '#FFFFFF', secondary: '#F8F9FA', tertiary: '#E9ECEF' },
  text: { primary: '#212529', secondary: '#6C757D' },
  status: { success: '#28A745' },
};

const typography = {
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
};

const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
  borderRadius: { sm: 4, md: 8, lg: 16 },
  elevation: { sm: 2, md: 4 },
};

const SimpleHomeScreen = () => {
  const { user, points, level, streak, todayGoal, sessionsToday } = mockData;
  const progressPercentage = Math.min((sessionsToday / todayGoal) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>안녕하세요, {user?.displayName}님!</Text>
          <Text style={styles.subText}>오늘도 영어 실력을 키워보세요</Text>
        </View>

        {/* Daily Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>오늘의 진도</Text>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {sessionsToday} / {todayGoal} 세션 완료
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>포인트</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{level}</Text>
            <Text style={styles.statLabel}>레벨</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>연속일</Text>
          </View>
        </View>

        {/* Main Action Button */}
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => alert('상황 연습 시작!')}
        >
          <Text style={styles.mainButtonText}>상황 연습 시작</Text>
          <Text style={styles.mainButtonSubtext}>랜덤 상황으로 실전 대화 연습</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>빠른 메뉴</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => alert('일일 챌린지')}
            >
              <Text style={styles.quickActionText}>🎯 일일 챌린지</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => alert('학습 통계')}
            >
              <Text style={styles.quickActionText}>📊 학습 통계</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => alert('튜터 찾기')}
            >
              <Text style={styles.quickActionText}>👥 튜터 찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => alert('성취 현황')}
            >
              <Text style={styles.quickActionText}>🏆 성취 현황</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 오늘의 팁</Text>
          <Text style={styles.tipText}>
            상황 연습에서는 완벽한 답을 찾으려 하지 말고, 
            자연스럽게 반응하는 연습을 해보세요!
          </Text>
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
  header: {
    marginBottom: spacing.lg,
  },
  welcomeText: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  progressCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: spacing.elevation.sm,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  progressPercent: {
    ...typography.h3,
    color: colors.primary.main,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
    elevation: spacing.elevation.sm,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    ...typography.h2,
    color: colors.accent.main,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  mainButton: {
    backgroundColor: colors.primary.main,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    elevation: spacing.elevation.md,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainButtonText: {
    ...typography.h2,
    color: colors.background.primary,
    marginBottom: spacing.xs,
  },
  mainButtonSubtext: {
    ...typography.body,
    color: colors.background.primary,
    opacity: 0.9,
  },
  quickActions: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.sm,
    elevation: spacing.elevation.sm,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});

export default SimpleHomeScreen;