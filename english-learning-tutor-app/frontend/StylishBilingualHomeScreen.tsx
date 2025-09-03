import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.welcomeKorean}>안녕하세요, 민수님! 👋</Text>
          <Text style={styles.welcomeEnglish}>Hello, Minsu!</Text>
          <Text style={styles.subtitle}>오늘도 영어 실력을 키워보세요 • Let's improve your English today</Text>
        </View>

        {/* 진도 카드 */}
        <View style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitleKorean}>오늘의 학습 진도</Text>
              <Text style={styles.cardTitleEnglish}>Today's Learning Progress</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressPercent}>60%</Text>
            </View>
          </View>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressTextKorean}>3 / 5 세션 완료</Text>
            <Text style={styles.progressTextEnglish}>3 of 5 sessions completed</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, {width: '60%'}]} />
            <View style={styles.progressBarBg} />
          </View>
        </View>

        {/* 통계 카드들 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.iconText}>⭐</Text>
            </View>
            <Text style={styles.statNumber}>1,250</Text>
            <Text style={styles.statLabelKorean}>포인트</Text>
            <Text style={styles.statLabelEnglish}>Points</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.iconText}>🏆</Text>
            </View>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabelKorean}>레벨</Text>
            <Text style={styles.statLabelEnglish}>Level</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.iconText}>🔥</Text>
            </View>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabelKorean}>연속 학습일</Text>
            <Text style={styles.statLabelEnglish}>Day Streak</Text>
          </View>
        </View>

        {/* 메인 액션 버튼 */}
        <TouchableOpacity 
          style={styles.mainButton} 
          onPress={() => alert('상황 연습을 시작합니다! / Starting situation practice!')}
        >
          <View style={styles.mainButtonContent}>
            <Text style={styles.mainButtonIcon}>🎯</Text>
            <View style={styles.mainButtonTexts}>
              <Text style={styles.mainButtonKorean}>상황 연습 시작하기</Text>
              <Text style={styles.mainButtonEnglish}>Start Situation Practice</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </View>
          <Text style={styles.mainButtonSubtext}>
            랜덤 상황으로 실전 대화 연습 • Practice real conversations with random situations
          </Text>
        </TouchableOpacity>

        {/* 빠른 메뉴 */}
        <View style={styles.quickMenuSection}>
          <Text style={styles.sectionTitleKorean}>빠른 메뉴</Text>
          <Text style={styles.sectionTitleEnglish}>Quick Menu</Text>
          
          <View style={styles.quickMenuGrid}>
            <TouchableOpacity style={styles.quickMenuItem} onPress={() => alert('일일 챌린지 / Daily Challenge')}>
              <View style={styles.quickMenuIcon}>
                <Text style={styles.quickMenuEmoji}>🎯</Text>
              </View>
              <Text style={styles.quickMenuKorean}>일일 챌린지</Text>
              <Text style={styles.quickMenuEnglish}>Daily Challenge</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickMenuItem} onPress={() => alert('학습 통계 / Learning Stats')}>
              <View style={styles.quickMenuIcon}>
                <Text style={styles.quickMenuEmoji}>📊</Text>
              </View>
              <Text style={styles.quickMenuKorean}>학습 통계</Text>
              <Text style={styles.quickMenuEnglish}>Learning Stats</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickMenuItem} onPress={() => alert('원어민 튜터 / Native Tutor')}>
              <View style={styles.quickMenuIcon}>
                <Text style={styles.quickMenuEmoji}>👩‍🏫</Text>
              </View>
              <Text style={styles.quickMenuKorean}>원어민 튜터</Text>
              <Text style={styles.quickMenuEnglish}>Native Tutor</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickMenuItem} onPress={() => alert('성취 현황 / Achievements')}>
              <View style={styles.quickMenuIcon}>
                <Text style={styles.quickMenuEmoji}>🏅</Text>
              </View>
              <Text style={styles.quickMenuKorean}>성취 현황</Text>
              <Text style={styles.quickMenuEnglish}>Achievements</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 오늘의 팁 */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipEmoji}>💡</Text>
            <View>
              <Text style={styles.tipTitleKorean}>오늘의 팁</Text>
              <Text style={styles.tipTitleEnglish}>Today's Tip</Text>
            </View>
          </View>
          <Text style={styles.tipTextKorean}>
            완벽한 답을 찾으려 하지 말고, 자연스럽게 반응하는 연습을 해보세요!
          </Text>
          <Text style={styles.tipTextEnglish}>
            Don't try to find perfect answers - practice responding naturally!
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
    padding: 20,
  },
  
  // 헤더
  header: {
    marginBottom: 32,
    paddingTop: 10,
  },
  welcomeKorean: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  welcomeEnglish: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },

  // 진도 카드
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitleKorean: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  cardTitleEnglish: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  progressBadge: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  progressInfo: {
    marginBottom: 16,
  },
  progressTextKorean: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  progressTextEnglish: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBarContainer: {
    position: 'relative',
    height: 8,
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    zIndex: 1,
  },

  // 통계 카드들
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabelKorean: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 1,
  },
  statLabelEnglish: {
    fontSize: 11,
    color: '#6b7280',
  },

  // 메인 버튼
  mainButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainButtonIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  mainButtonTexts: {
    flex: 1,
  },
  mainButtonKorean: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  mainButtonEnglish: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dbeafe',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  mainButtonSubtext: {
    fontSize: 14,
    color: '#dbeafe',
    lineHeight: 20,
    textAlign: 'center',
  },

  // 빠른 메뉴
  quickMenuSection: {
    marginBottom: 32,
  },
  sectionTitleKorean: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  sectionTitleEnglish: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 20,
  },
  quickMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickMenuItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickMenuIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickMenuEmoji: {
    fontSize: 24,
  },
  quickMenuKorean: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  quickMenuEnglish: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },

  // 팁 카드
  tipCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  tipTitleKorean: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 1,
  },
  tipTitleEnglish: {
    fontSize: 13,
    fontWeight: '500',
    color: '#047857',
  },
  tipTextKorean: {
    fontSize: 14,
    color: '#065f46',
    lineHeight: 20,
    marginBottom: 8,
  },
  tipTextEnglish: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});