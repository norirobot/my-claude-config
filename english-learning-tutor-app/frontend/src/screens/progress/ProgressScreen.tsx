import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

interface ProgressScreenProps {
  navigation: any;
}

// Mock progress data
const progressData = {
  currentLevel: 'Intermediate',
  levelProgress: 67, // percentage
  totalPoints: 2840,
  streak: 12,
  totalSessions: 45,
  totalHours: 32.5,
  weeklyGoal: 5, // sessions per week
  completedThisWeek: 3,
  
  skillBreakdown: {
    grammar: { current: 78, change: +5 },
    vocabulary: { current: 84, change: +3 },
    fluency: { current: 71, change: +8 },
    listening: { current: 89, change: +2 },
    pronunciation: { current: 66, change: +12 },
  },
  
  recentAchievements: [
    {
      id: '1',
      title: '연속 학습 10일 달성',
      description: '10일 연속으로 학습을 완료했습니다',
      icon: '🔥',
      earnedDate: '2일 전',
      points: 100,
    },
    {
      id: '2',
      title: '발음 마스터',
      description: '발음 점수 90점 이상 달성',
      icon: '🎯',
      earnedDate: '1주일 전',
      points: 150,
    },
    {
      id: '3',
      title: '대화의 달인',
      description: '30회 이상 대화 연습 완료',
      icon: '💬',
      earnedDate: '2주일 전',
      points: 200,
    },
  ],
  
  weeklyStats: [
    { day: '월', sessions: 1, target: 1 },
    { day: '화', sessions: 1, target: 1 },
    { day: '수', sessions: 0, target: 1 },
    { day: '목', sessions: 1, target: 1 },
    { day: '금', sessions: 0, target: 1 },
    { day: '토', sessions: 0, target: 0 },
    { day: '일', sessions: 0, target: 0 },
  ],
  
  levelMilestones: [
    { level: 'Beginner', completed: true, points: 500 },
    { level: 'Elementary', completed: true, points: 1000 },
    { level: 'Intermediate', completed: false, points: 1500, current: true },
    { level: 'Upper-Intermediate', completed: false, points: 2500 },
    { level: 'Advanced', completed: false, points: 4000 },
  ],
};

const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'skills' | 'achievements'>('overview');
  
  const getSkillColor = (score: number) => {
    if (score >= 90) return Colors.success;
    if (score >= 80) return Colors.primary;
    if (score >= 70) return Colors.accent;
    if (score >= 60) return Colors.warm;
    return Colors.error;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Level Progress Card */}
      <View style={styles.levelCard}>
        <LinearGradient
          colors={Colors.gradients.primary}
          style={styles.levelCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.levelTitle}>현재 레벨</Text>
          <Text style={styles.levelName}>{progressData.currentLevel}</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressData.levelProgress}%` }
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>{progressData.levelProgress}%</Text>
          </View>
          <Text style={styles.levelDescription}>
            다음 레벨까지 {100 - progressData.levelProgress}% 남았습니다
          </Text>
        </LinearGradient>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statNumber}>{progressData.totalPoints.toLocaleString()}</Text>
          <Text style={styles.statLabel}>총 포인트</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statNumber}>{progressData.streak}</Text>
          <Text style={styles.statLabel}>연속일</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📚</Text>
          <Text style={styles.statNumber}>{progressData.totalSessions}</Text>
          <Text style={styles.statLabel}>총 세션</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏰</Text>
          <Text style={styles.statNumber}>{progressData.totalHours}</Text>
          <Text style={styles.statLabel}>학습 시간</Text>
        </View>
      </View>

      {/* Weekly Goal */}
      <View style={styles.weeklyGoalCard}>
        <Text style={styles.cardTitle}>이번 주 목표</Text>
        <View style={styles.goalProgress}>
          <Text style={styles.goalText}>
            {progressData.completedThisWeek} / {progressData.weeklyGoal} 세션 완료
          </Text>
          <Text style={styles.goalPercentage}>
            {Math.round((progressData.completedThisWeek / progressData.weeklyGoal) * 100)}%
          </Text>
        </View>
        <View style={styles.weeklyChart}>
          {progressData.weeklyStats.map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <View style={styles.dayBar}>
                <View 
                  style={[
                    styles.dayBarFill,
                    { 
                      height: `${day.sessions > 0 ? 100 : 0}%`,
                      backgroundColor: day.sessions >= day.target ? Colors.success : Colors.lightGray
                    }
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{day.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Level Milestones */}
      <View style={styles.milestonesCard}>
        <Text style={styles.cardTitle}>레벨 진행 상황</Text>
        {progressData.levelMilestones.map((milestone, index) => (
          <View key={index} style={styles.milestoneItem}>
            <View style={[
              styles.milestoneIcon,
              milestone.completed && styles.milestoneCompleted,
              milestone.current && styles.milestoneCurrent
            ]}>
              <Text style={styles.milestoneIconText}>
                {milestone.completed ? '✓' : milestone.current ? '⭐' : '○'}
              </Text>
            </View>
            <View style={styles.milestoneContent}>
              <Text style={[
                styles.milestoneLevel,
                milestone.current && styles.milestoneCurrentText
              ]}>
                {milestone.level}
              </Text>
              <Text style={styles.milestonePoints}>
                {milestone.points.toLocaleString()} 포인트 필요
              </Text>
            </View>
            {index < progressData.levelMilestones.length - 1 && (
              <View style={styles.milestoneLine} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderSkillsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>영역별 실력</Text>
      
      {Object.entries(progressData.skillBreakdown).map(([skill, data]) => (
        <View key={skill} style={styles.skillCard}>
          <View style={styles.skillHeader}>
            <Text style={styles.skillName}>
              {skill === 'grammar' ? '문법' :
               skill === 'vocabulary' ? '어휘' :
               skill === 'fluency' ? '유창성' :
               skill === 'listening' ? '듣기' : '발음'}
            </Text>
            <View style={styles.skillChange}>
              <Text style={styles.skillChangeIcon}>{getChangeIcon(data.change)}</Text>
              <Text style={[
                styles.skillChangeText,
                { color: data.change > 0 ? Colors.success : data.change < 0 ? Colors.error : Colors.text.secondary }
              ]}>
                {data.change > 0 ? '+' : ''}{data.change}
              </Text>
            </View>
          </View>
          
          <View style={styles.skillProgressContainer}>
            <View style={styles.skillProgressBar}>
              <View 
                style={[
                  styles.skillProgressFill,
                  { 
                    width: `${data.current}%`,
                    backgroundColor: getSkillColor(data.current)
                  }
                ]}
              />
            </View>
            <Text style={[styles.skillScore, { color: getSkillColor(data.current) }]}>
              {data.current}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAchievementsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>최근 성취</Text>
      
      {progressData.recentAchievements.map((achievement) => (
        <View key={achievement.id} style={styles.achievementCard}>
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
            <Text style={styles.achievementDate}>{achievement.earnedDate}</Text>
          </View>
          <View style={styles.achievementPoints}>
            <Text style={styles.achievementPointsText}>+{achievement.points}</Text>
            <Text style={styles.achievementPointsLabel}>포인트</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.warm}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>학습 진도</Text>
        <Text style={styles.headerSubtitle}>
          여러분의 영어 실력 향상을 확인해보세요
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            종합
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'skills' && styles.activeTab]}
          onPress={() => setSelectedTab('skills')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, selectedTab === 'skills' && styles.activeTabText]}>
            영역별
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'achievements' && styles.activeTab]}
          onPress={() => setSelectedTab('achievements')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, selectedTab === 'achievements' && styles.activeTabText]}>
            성취
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'skills' && renderSkillsTab()}
        {selectedTab === 'achievements' && renderAchievementsTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerTitle: {
    ...typography.h1,
    color: Colors.text.inverse,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    padding: 4,
    elevation: 4,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...typography.button,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  tabTitle: {
    ...typography.h2,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  levelCard: {
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  levelCardGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  levelTitle: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
    marginBottom: 8,
  },
  levelName: {
    ...typography.h1,
    color: Colors.text.inverse,
    fontWeight: '700',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.text.inverse,
    borderRadius: 4,
  },
  progressPercentage: {
    ...typography.h3,
    color: Colors.text.inverse,
    textAlign: 'center',
    fontWeight: '600',
  },
  levelDescription: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    ...typography.h2,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  weeklyGoalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  goalProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalText: {
    ...typography.body,
    color: Colors.text.secondary,
  },
  goalPercentage: {
    ...typography.h4,
    color: Colors.primary,
    fontWeight: '600',
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 60,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayBar: {
    width: 24,
    height: 40,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  milestonesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  milestoneCompleted: {
    backgroundColor: Colors.success,
  },
  milestoneCurrent: {
    backgroundColor: Colors.primary,
  },
  milestoneIconText: {
    ...typography.body,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneLevel: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  milestoneCurrentText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  milestonePoints: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  milestoneLine: {
    position: 'absolute',
    left: 15,
    top: 44,
    bottom: -12,
    width: 2,
    backgroundColor: Colors.lightGray,
  },
  skillCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillName: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  skillChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillChangeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  skillChangeText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  skillProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginRight: 12,
  },
  skillProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillScore: {
    ...typography.h4,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  achievementCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  achievementDate: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  achievementPoints: {
    alignItems: 'center',
  },
  achievementPointsText: {
    ...typography.h4,
    color: Colors.success,
    fontWeight: '700',
  },
  achievementPointsLabel: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
});

export default ProgressScreen;