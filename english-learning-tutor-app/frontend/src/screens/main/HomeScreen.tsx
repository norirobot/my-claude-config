import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

const HomeScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { points, level, streak } = useSelector((state: RootState) => state.user);
  const { todayGoal, sessionsToday } = useSelector((state: RootState) => state.learning);

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
        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.mainButtonText}>상황 연습 시작</Text>
          <Text style={styles.mainButtonSubtext}>랜덤 상황으로 실전 대화 연습</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>빠른 메뉴</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>🎯 일일 챌린지</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>📊 학습 통계</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>👥 튜터 찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
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
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    ...typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subText: {
    ...typography.body,
    color: Colors.text.secondary,
  },
  progressCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    elevation: Spacing.elevation.sm,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressText: {
    ...typography.body,
    color: Colors.text.secondary,
  },
  progressPercent: {
    ...typography.h3,
    color: Colors.primary.main,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.xs,
    elevation: Spacing.elevation.sm,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    ...typography.h2,
    color: Colors.accent.main,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  mainButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    elevation: Spacing.elevation.md,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainButtonText: {
    ...typography.h2,
    color: Colors.background.primary,
    marginBottom: Spacing.xs,
  },
  mainButtonSubtext: {
    ...typography.body,
    color: Colors.background.primary,
    opacity: 0.9,
  },
  quickActions: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    width: '48%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    elevation: Spacing.elevation.sm,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    ...typography.body,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: Colors.secondary.light,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  tipTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  tipText: {
    ...typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
});

export default HomeScreen;