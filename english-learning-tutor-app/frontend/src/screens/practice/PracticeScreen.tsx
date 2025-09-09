import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

interface PracticeScreenProps {
  navigation: any;
}

// Mock data for practice categories
const practiceCategories = [
  {
    id: 'daily_life',
    title: '일상 대화',
    description: '카페, 식당, 쇼핑 등 일상적인 상황',
    icon: '☕',
    difficulty: 'beginner',
    situations: 8,
    color: Colors.gradients.success,
  },
  {
    id: 'daegu_local',
    title: '대구 지역 특화',
    description: '동대구역, 서문시장, 동인동 등',
    icon: '🚇',
    difficulty: 'intermediate',
    situations: 6,
    color: Colors.gradients.accent,
  },
  {
    id: 'business',
    title: '비즈니스 영어',
    description: '회의, 프레젠테이션, 이메일',
    icon: '💼',
    difficulty: 'advanced',
    situations: 12,
    color: Colors.gradients.warm,
  },
  {
    id: 'travel',
    title: '여행 영어',
    description: '공항, 호텔, 관광지에서의 대화',
    icon: '✈️',
    difficulty: 'intermediate',
    situations: 10,
    color: Colors.gradients.primary,
  },
];

// Mock recent practice data
const recentPractices = [
  {
    id: '1',
    title: '카페에서 커피 주문하기',
    category: '일상 대화',
    score: 85,
    completedAt: '2시간 전',
    difficulty: 'beginner',
  },
  {
    id: '2',
    title: '동대구역에서 택시 타기',
    category: '대구 지역',
    score: 78,
    completedAt: '어제',
    difficulty: 'intermediate',
  },
];

const PracticeScreen: React.FC<PracticeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = practiceCategories.find(cat => cat.id === categoryId);
    
    if (category) {
      Alert.alert(
        category.title,
        `${category.situations}개의 상황이 준비되어 있습니다. 바로 시작하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '시작하기', 
            onPress: () => {
              navigation.navigate('SituationPractice', { 
                category: categoryId,
                categoryTitle: category.title 
              });
            }
          }
        ]
      );
    }
  };

  const handleQuickPractice = () => {
    navigation.navigate('SituationPractice', { 
      category: 'random',
      categoryTitle: '랜덤 연습'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.accent;
      case 'advanced': return Colors.warm;
      default: return Colors.primary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return '전체';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={Colors.gradients.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>연습하기</Text>
          <Text style={styles.headerSubtitle}>
            다양한 상황에서 영어 실력을 늘려보세요
          </Text>
        </LinearGradient>

        {/* Quick Practice Button */}
        <View style={styles.quickPracticeSection}>
          <TouchableOpacity 
            style={styles.quickPracticeButton}
            onPress={handleQuickPractice}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.gradients.accent}
              style={styles.quickPracticeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.quickPracticeIcon}>🎯</Text>
              <View style={styles.quickPracticeTextContainer}>
                <Text style={styles.quickPracticeTitle}>빠른 연습</Text>
                <Text style={styles.quickPracticeSubtitle}>랜덤 상황으로 즉시 시작</Text>
              </View>
              <Text style={styles.quickPracticeArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>카테고리별 연습</Text>
          <View style={styles.categoriesGrid}>
            {practiceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected
                ]}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={category.color}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                  
                  <View style={styles.categoryFooter}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categorySituations}>
                        {category.situations}개 상황
                      </Text>
                      <View style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(category.difficulty) }
                      ]}>
                        <Text style={styles.difficultyText}>
                          {getDifficultyText(category.difficulty)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Practice */}
        {recentPractices.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>최근 연습</Text>
            {recentPractices.map((practice) => (
              <TouchableOpacity
                key={practice.id}
                style={styles.recentCard}
                onPress={() => {
                  Alert.alert(
                    '연습 다시하기',
                    `"${practice.title}" 연습을 다시 시작하시겠습니까?`,
                    [
                      { text: '취소', style: 'cancel' },
                      { text: '시작', onPress: () => handleQuickPractice() }
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <View style={styles.recentCardContent}>
                  <View style={styles.recentCardMain}>
                    <Text style={styles.recentTitle}>{practice.title}</Text>
                    <Text style={styles.recentCategory}>{practice.category}</Text>
                    <Text style={styles.recentTime}>{practice.completedAt}</Text>
                  </View>
                  <View style={styles.recentCardScore}>
                    <Text style={styles.recentScoreNumber}>{practice.score}</Text>
                    <Text style={styles.recentScoreLabel}>점</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Practice Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>연습 팁</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>효과적인 연습 방법</Text>
              <Text style={styles.tipText}>
                • 매일 15-20분씩 꾸준히 연습하세요{'\n'}
                • 틀려도 괜찮으니 자신감을 가지세요{'\n'}
                • 발음보다는 의사소통에 집중하세요{'\n'}
                • 실제 상황을 상상하며 연습하세요
              </Text>
            </View>
          </View>
        </View>
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
    marginBottom: 20,
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
  quickPracticeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickPracticeButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickPracticeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  quickPracticeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  quickPracticeTextContainer: {
    flex: 1,
  },
  quickPracticeTitle: {
    ...typography.h3,
    color: Colors.text.inverse,
    marginBottom: 4,
  },
  quickPracticeSubtitle: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  quickPracticeArrow: {
    ...typography.h2,
    color: Colors.text.inverse,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    ...typography.h2,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 50) / 2,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  categoryCardSelected: {
    elevation: 6,
    shadowOpacity: 0.3,
  },
  categoryGradient: {
    padding: 16,
    borderRadius: 16,
    minHeight: 160,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  categoryTitle: {
    ...typography.h4,
    color: Colors.text.inverse,
    marginBottom: 8,
  },
  categoryDescription: {
    ...typography.bodySmall,
    color: Colors.text.inverse,
    opacity: 0.9,
    flex: 1,
    lineHeight: 18,
  },
  categoryFooter: {
    marginTop: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categorySituations: {
    ...typography.caption,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    ...typography.caption,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  recentCardMain: {
    flex: 1,
  },
  recentTitle: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentCategory: {
    ...typography.caption,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  recentTime: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  recentCardScore: {
    alignItems: 'center',
  },
  recentScoreNumber: {
    ...typography.h3,
    color: Colors.success,
    fontWeight: '700',
  },
  recentScoreLabel: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  tipCard: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tipText: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

export default PracticeScreen;