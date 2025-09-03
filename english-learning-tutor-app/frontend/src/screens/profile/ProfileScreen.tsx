import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface ProfileScreenProps {
  navigation: any;
}

// Mock user data
const userData = {
  name: '김영희',
  email: 'younghee.kim@example.com',
  joinDate: '2024년 1월',
  profileImage: '👩🏻‍💼',
  currentLevel: 'Intermediate',
  totalPoints: 2840,
  completedSessions: 45,
  streak: 12,
  
  preferences: {
    notifications: true,
    soundEffects: true,
    autoPlay: false,
    darkMode: false,
  },
  
  goals: {
    dailyMinutes: 30,
    weeklyGoal: 5,
    difficultyLevel: 'intermediate',
  },
  
  subscription: {
    type: 'Free',
    validUntil: null,
    featuresUsed: {
      aiSessions: 15,
      maxAiSessions: 20,
    },
  },
};

const menuSections = [
  {
    title: '학습 관리',
    items: [
      { id: 'goals', title: '학습 목표 설정', icon: '🎯', hasArrow: true },
      { id: 'history', title: '학습 기록', icon: '📚', hasArrow: true },
      { id: 'achievements', title: '성취 현황', icon: '🏆', hasArrow: true },
      { id: 'bookmarks', title: '즐겨찾기', icon: '⭐', hasArrow: true },
    ],
  },
  {
    title: '계정 설정',
    items: [
      { id: 'profile-edit', title: '프로필 수정', icon: '👤', hasArrow: true },
      { id: 'notifications', title: '알림 설정', icon: '🔔', hasArrow: true },
      { id: 'privacy', title: '개인정보 보호', icon: '🔒', hasArrow: true },
      { id: 'language', title: '언어 설정', icon: '🌐', hasArrow: true },
    ],
  },
  {
    title: '구독 및 결제',
    items: [
      { id: 'subscription', title: '구독 관리', icon: '💎', hasArrow: true },
      { id: 'billing', title: '결제 내역', icon: '💳', hasArrow: true },
      { id: 'upgrade', title: '프리미엄 업그레이드', icon: '⬆️', hasArrow: true, highlight: true },
    ],
  },
  {
    title: '지원 및 정보',
    items: [
      { id: 'help', title: '도움말', icon: '❓', hasArrow: true },
      { id: 'contact', title: '문의하기', icon: '📞', hasArrow: true },
      { id: 'terms', title: '이용약관', icon: '📄', hasArrow: true },
      { id: 'privacy-policy', title: '개인정보처리방침', icon: '📋', hasArrow: true },
    ],
  },
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState(userData.preferences.notifications);
  const [soundEffects, setSoundEffects] = useState(userData.preferences.soundEffects);

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'goals':
        showGoalsModal();
        break;
      case 'history':
        Alert.alert('학습 기록', '학습 기록 화면으로 이동합니다.');
        break;
      case 'achievements':
        navigation.navigate('Progress');
        break;
      case 'profile-edit':
        showProfileEditModal();
        break;
      case 'notifications':
        showNotificationSettings();
        break;
      case 'subscription':
        showSubscriptionInfo();
        break;
      case 'upgrade':
        showUpgradeModal();
        break;
      case 'help':
        showHelpModal();
        break;
      case 'contact':
        showContactModal();
        break;
      case 'logout':
        showLogoutConfirm();
        break;
      default:
        Alert.alert('준비 중', '해당 기능은 곧 업데이트될 예정입니다.');
    }
  };

  const showGoalsModal = () => {
    Alert.alert(
      '학습 목표 설정',
      `현재 설정:\n• 일일 목표: ${userData.goals.dailyMinutes}분\n• 주간 목표: ${userData.goals.weeklyGoal}회\n• 난이도: ${userData.goals.difficultyLevel}`,
      [
        { text: '취소', style: 'cancel' },
        { text: '수정', onPress: () => Alert.alert('알림', '목표 수정 기능이 곧 추가됩니다.') }
      ]
    );
  };

  const showProfileEditModal = () => {
    Alert.alert(
      '프로필 수정',
      `현재 정보:\n• 이름: ${userData.name}\n• 이메일: ${userData.email}\n• 가입일: ${userData.joinDate}`,
      [
        { text: '취소', style: 'cancel' },
        { text: '수정', onPress: () => Alert.alert('알림', '프로필 수정 기능이 곧 추가됩니다.') }
      ]
    );
  };

  const showNotificationSettings = () => {
    Alert.alert(
      '알림 설정',
      '알림 설정을 변경하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정', onPress: () => Alert.alert('알림', '설정이 저장되었습니다.') }
      ]
    );
  };

  const showSubscriptionInfo = () => {
    const { subscription } = userData;
    Alert.alert(
      '구독 정보',
      `현재 플랜: ${subscription.type}\n\nAI 대화 사용량:\n${subscription.featuresUsed.aiSessions} / ${subscription.featuresUsed.maxAiSessions}회`,
      [
        { text: '확인' },
        subscription.type === 'Free' && { 
          text: '업그레이드', 
          onPress: () => showUpgradeModal() 
        }
      ].filter(Boolean) as any
    );
  };

  const showUpgradeModal = () => {
    Alert.alert(
      '프리미엄 업그레이드',
      '프리미엄으로 업그레이드하면:\n\n• 무제한 AI 대화\n• 전문 튜터 매칭\n• 상세한 발음 분석\n• 개인 맞춤 학습 플랜\n\n월 9,900원',
      [
        { text: '나중에', style: 'cancel' },
        { text: '업그레이드', onPress: () => Alert.alert('알림', '업그레이드 기능이 곧 추가됩니다.') }
      ]
    );
  };

  const showHelpModal = () => {
    Alert.alert(
      '도움말',
      '자주 묻는 질문:\n\n• 어떻게 연습을 시작하나요?\n• 포인트는 어떻게 얻나요?\n• 발음 분석은 어떻게 작동하나요?\n\n더 많은 도움이 필요하시면 문의하기를 이용해주세요.',
      [{ text: '확인' }]
    );
  };

  const showContactModal = () => {
    Alert.alert(
      '문의하기',
      '어떤 방법으로 문의하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '이메일', onPress: () => Alert.alert('이메일', 'support@englishfriends.com') },
        { text: '채팅', onPress: () => Alert.alert('채팅', '실시간 채팅 지원이 곧 추가됩니다.') },
      ]
    );
  };

  const showLogoutConfirm = () => {
    Alert.alert(
      '로그아웃',
      '정말로 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement actual logout logic
            Alert.alert('로그아웃 완료', '성공적으로 로그아웃되었습니다.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={Colors.gradients.accent}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.profileImage}>{userData.profileImage}</Text>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.userLevel}>{userData.currentLevel} • {userData.joinDate} 가입</Text>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{userData.totalPoints.toLocaleString()}</Text>
              <Text style={styles.quickStatLabel}>포인트</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{userData.completedSessions}</Text>
              <Text style={styles.quickStatLabel}>세션</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{userData.streak}</Text>
              <Text style={styles.quickStatLabel}>연속일</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Subscription Status */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>
              {userData.subscription.type === 'Free' ? '무료 플랜' : '프리미엄 플랜'}
            </Text>
            {userData.subscription.type === 'Free' && (
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={() => showUpgradeModal()}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeButtonText}>업그레이드</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {userData.subscription.type === 'Free' && (
            <View style={styles.usageInfo}>
              <Text style={styles.usageText}>
                AI 대화: {userData.subscription.featuresUsed.aiSessions} / {userData.subscription.featuresUsed.maxAiSessions}회 사용
              </Text>
              <View style={styles.usageBar}>
                <View 
                  style={[
                    styles.usageBarFill, 
                    { 
                      width: `${(userData.subscription.featuresUsed.aiSessions / userData.subscription.featuresUsed.maxAiSessions) * 100}%` 
                    }
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Quick Settings */}
        <View style={styles.quickSettingsCard}>
          <Text style={styles.cardTitle}>빠른 설정</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={styles.settingTitle}>알림</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.lightGray, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔊</Text>
              <Text style={styles.settingTitle}>효과음</Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={setSoundEffects}
              trackColor={{ false: Colors.lightGray, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    item.highlight && styles.highlightMenuItem,
                    itemIndex === section.items.length - 1 && styles.lastMenuItem
                  ]}
                  onPress={() => handleMenuPress(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={[
                      styles.menuTitle,
                      item.highlight && styles.highlightMenuTitle
                    ]}>
                      {item.title}
                    </Text>
                  </View>
                  {item.hasArrow && (
                    <Text style={styles.menuArrow}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => showLogoutConfirm()}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>English Friends v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    fontSize: 80,
    marginBottom: 16,
  },
  userName: {
    ...typography.h1,
    color: Colors.text.inverse,
    marginBottom: 4,
  },
  userEmail: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
    marginBottom: 8,
  },
  userLevel: {
    ...typography.bodySmall,
    color: Colors.text.inverse,
    opacity: 0.8,
    marginBottom: 24,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatNumber: {
    ...typography.h2,
    color: Colors.text.inverse,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickStatLabel: {
    ...typography.caption,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  subscriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionTitle: {
    ...typography.h4,
    color: Colors.text.primary,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  upgradeButtonText: {
    ...typography.caption,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  usageInfo: {
    marginTop: 8,
  },
  usageText: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  usageBar: {
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  quickSettingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingTitle: {
    ...typography.body,
    color: Colors.text.primary,
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...typography.h4,
    color: Colors.text.secondary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  highlightMenuItem: {
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  menuTitle: {
    ...typography.body,
    color: Colors.text.primary,
  },
  highlightMenuTitle: {
    color: Colors.accent,
    fontWeight: '600',
  },
  menuArrow: {
    ...typography.h3,
    color: Colors.text.secondary,
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutButtonText: {
    ...typography.buttonLarge,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  versionText: {
    ...typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default ProfileScreen;