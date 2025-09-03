import React from 'react';
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

interface FeedbackScreenProps {
  navigation: any;
  route: any;
}

// Mock feedback data
const mockFeedbackData = {
  overallScore: 85,
  sessionDuration: '12분 30초',
  totalMessages: 8,
  scores: {
    grammar: 82,
    vocabulary: 88,
    fluency: 85,
    appropriateness: 87,
  },
  strengths: [
    '자연스러운 대화 흐름을 보여주셨습니다',
    '상황에 맞는 적절한 표현을 사용했습니다',
    '적극적으로 대화에 참여하셨습니다',
  ],
  improvements: [
    '과거형 사용에 조금 더 주의해보세요',
    '전치사 사용을 더 정확하게 해보세요',
    '더 다양한 어휘를 사용해보세요',
  ],
  corrections: [
    {
      original: "I go to school yesterday",
      corrected: "I went to school yesterday",
      explanation: "과거의 일을 말할 때는 과거형을 사용해야 합니다."
    },
    {
      original: "I'm interesting in music",
      corrected: "I'm interested in music",
      explanation: "사람이 흥미를 느낄 때는 'interested'를 사용합니다."
    },
  ],
  pointsEarned: 125,
  streakCount: 5,
  nextGoal: "일주일 연속 연습하기",
};

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation, route }) => {
  const feedback = route?.params?.feedback || mockFeedbackData;

  const getScoreColor = (score: number) => {
    if (score >= 90) return Colors.success;
    if (score >= 80) return Colors.primary;
    if (score >= 70) return Colors.warm;
    return Colors.error;
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return '우수';
    if (score >= 80) return '좋음';
    if (score >= 70) return '보통';
    return '개선 필요';
  };

  const handlePracticeAgain = () => {
    navigation.navigate('PracticeMain');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Overall Score */}
        <LinearGradient
          colors={Colors.gradients.success}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>연습 완료!</Text>
          <View style={styles.overallScoreContainer}>
            <Text style={styles.overallScore}>{feedback.overallScore}</Text>
            <Text style={styles.overallScoreLabel}>점</Text>
          </View>
          <Text style={styles.sessionInfo}>
            {feedback.sessionDuration} • {feedback.totalMessages}번 대화
          </Text>
        </LinearGradient>

        {/* Score Breakdown */}
        <View style={styles.scoresSection}>
          <Text style={styles.sectionTitle}>세부 점수</Text>
          <View style={styles.scoresGrid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>문법</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(feedback.scores.grammar) }]}>
                {feedback.scores.grammar}
              </Text>
              <Text style={styles.scoreDescription}>
                {getScoreDescription(feedback.scores.grammar)}
              </Text>
            </View>
            
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>어휘</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(feedback.scores.vocabulary) }]}>
                {feedback.scores.vocabulary}
              </Text>
              <Text style={styles.scoreDescription}>
                {getScoreDescription(feedback.scores.vocabulary)}
              </Text>
            </View>
            
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>유창성</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(feedback.scores.fluency) }]}>
                {feedback.scores.fluency}
              </Text>
              <Text style={styles.scoreDescription}>
                {getScoreDescription(feedback.scores.fluency)}
              </Text>
            </View>
            
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>적절성</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(feedback.scores.appropriateness) }]}>
                {feedback.scores.appropriateness}
              </Text>
              <Text style={styles.scoreDescription}>
                {getScoreDescription(feedback.scores.appropriateness)}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>획득한 성과</Text>
          <View style={styles.achievementCards}>
            <View style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <Text style={styles.achievementNumber}>+{feedback.pointsEarned}</Text>
              <Text style={styles.achievementLabel}>포인트</Text>
            </View>
            <View style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>🔥</Text>
              <Text style={styles.achievementNumber}>{feedback.streakCount}</Text>
              <Text style={styles.achievementLabel}>연속일</Text>
            </View>
          </View>
        </View>

        {/* Strengths */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>잘한 점</Text>
          {feedback.strengths.map((strength: string, index: number) => (
            <View key={index} style={styles.feedbackItem}>
              <Text style={styles.feedbackIcon}>✅</Text>
              <Text style={styles.feedbackText}>{strength}</Text>
            </View>
          ))}
        </View>

        {/* Improvements */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>개선할 점</Text>
          {feedback.improvements.map((improvement: string, index: number) => (
            <View key={index} style={styles.feedbackItem}>
              <Text style={styles.feedbackIcon}>💡</Text>
              <Text style={styles.feedbackText}>{improvement}</Text>
            </View>
          ))}
        </View>

        {/* Corrections */}
        {feedback.corrections.length > 0 && (
          <View style={styles.correctionsSection}>
            <Text style={styles.sectionTitle}>교정 사항</Text>
            {feedback.corrections.map((correction: any, index: number) => (
              <View key={index} style={styles.correctionCard}>
                <View style={styles.correctionItem}>
                  <Text style={styles.correctionLabel}>원래 문장:</Text>
                  <Text style={styles.originalText}>{correction.original}</Text>
                </View>
                <View style={styles.correctionItem}>
                  <Text style={styles.correctionLabel}>올바른 문장:</Text>
                  <Text style={styles.correctedText}>{correction.corrected}</Text>
                </View>
                <Text style={styles.explanationText}>{correction.explanation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Next Goal */}
        <View style={styles.goalSection}>
          <Text style={styles.sectionTitle}>다음 목표</Text>
          <View style={styles.goalCard}>
            <Text style={styles.goalIcon}>🎯</Text>
            <Text style={styles.goalText}>{feedback.nextGoal}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePracticeAgain}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.gradients.primary}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>다시 연습하기</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    ...typography.h1,
    color: Colors.text.inverse,
    marginBottom: 16,
  },
  overallScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  overallScore: {
    ...typography.h1,
    fontSize: 64,
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  overallScoreLabel: {
    ...typography.h2,
    color: Colors.text.inverse,
    opacity: 0.9,
    marginLeft: 4,
  },
  sessionInfo: {
    ...typography.body,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  scoresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    ...typography.h2,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scoreCard: {
    width: (width - 50) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreLabel: {
    ...typography.label,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  scoreValue: {
    ...typography.h1,
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreDescription: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  achievementCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minWidth: 120,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementNumber: {
    ...typography.h2,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  achievementLabel: {
    ...typography.caption,
    color: Colors.text.secondary,
  },
  feedbackSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  feedbackIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  feedbackText: {
    ...typography.body,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  correctionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  correctionCard: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  correctionItem: {
    marginBottom: 8,
  },
  correctionLabel: {
    ...typography.label,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  originalText: {
    ...typography.body,
    color: Colors.error,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  correctedText: {
    ...typography.body,
    color: Colors.success,
    fontWeight: '600',
  },
  explanationText: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  goalSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  goalText: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  primaryButton: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.buttonLarge,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
  },
  secondaryButtonText: {
    ...typography.buttonLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default FeedbackScreen;