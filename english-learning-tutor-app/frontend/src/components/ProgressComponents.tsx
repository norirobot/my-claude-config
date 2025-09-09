import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing } from '../constants/spacing';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  color = colors.primary.main,
  backgroundColor = colors.background.tertiary,
  height = 8,
  showPercentage = false,
  animated = true,
}) => {
  const percentage = Math.min((current / total) * 100, 100);
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [percentage, animated, animatedWidth]);

  return (
    <View style={styles.progressContainer}>
      <View 
        style={[
          styles.progressBarContainer, 
          { height, backgroundColor }
        ]}
      >
        {animated ? (
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                height,
                backgroundColor: color,
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.progressBarFill,
              {
                height,
                backgroundColor: color,
                width: `${percentage}%`,
              },
            ]}
          />
        )}
      </View>
      {showPercentage && (
        <Text style={styles.percentageText}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
};

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = colors.primary.main,
  backgroundColor = colors.background.tertiary,
  showText = true,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.circularSvg}>
        <Circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <Circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.circularContent}>
        {showText && (
          <Text style={styles.circularText}>
            {Math.round(progress)}%
          </Text>
        )}
        {children}
      </View>
    </View>
  );
};

interface PointsDisplayProps {
  points: number;
  level: number;
  pointsToNextLevel: number;
  animated?: boolean;
  onPress?: () => void;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({
  points,
  level,
  pointsToNextLevel,
  animated = true,
  onPress,
}) => {
  const levelProgress = Math.max(0, Math.min(100, ((points % 1000) / 1000) * 100));
  
  return (
    <TouchableOpacity 
      style={styles.pointsContainer}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.pointsHeader}>
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>포인트</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{level}</Text>
        </View>
      </View>
      
      <ProgressBar
        current={points % 1000}
        total={1000}
        color={colors.accent.main}
        animated={animated}
      />
      
      <Text style={styles.nextLevelText}>
        다음 레벨까지 {pointsToNextLevel}P
      </Text>
    </TouchableOpacity>
  );
};

interface StreakDisplayProps {
  streak: number;
  maxStreak: number;
  todayCompleted: boolean;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  maxStreak,
  todayCompleted,
}) => {
  return (
    <View style={styles.streakContainer}>
      <View style={styles.streakHeader}>
        <Text style={styles.streakTitle}>🔥 연속 학습</Text>
        <Text style={styles.streakRecord}>최고: {maxStreak}일</Text>
      </View>
      
      <View style={styles.streakContent}>
        <Text style={styles.streakValue}>{streak}</Text>
        <Text style={styles.streakUnit}>일</Text>
      </View>
      
      <View style={[
        styles.streakStatus,
        { backgroundColor: todayCompleted ? colors.status.success : colors.status.warning }
      ]}>
        <Text style={styles.streakStatusText}>
          {todayCompleted ? '✅ 오늘 완료' : '⏰ 오늘 학습 필요'}
        </Text>
      </View>
    </View>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = colors.primary.main,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.statCard}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon && (
        <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      )}
      <Text style={[styles.statValue, { color }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && (
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      )}
    </TouchableOpacity>
  );
};

interface DailyGoalProps {
  current: number;
  target: number;
  title: string;
  unit?: string;
}

export const DailyGoal: React.FC<DailyGoalProps> = ({
  current,
  target,
  title,
  unit = '회',
}) => {
  const progress = Math.min((current / target) * 100, 100);
  const isCompleted = current >= target;

  return (
    <View style={styles.goalContainer}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{title}</Text>
        <Text style={[
          styles.goalStatus,
          { color: isCompleted ? colors.status.success : colors.text.secondary }
        ]}>
          {isCompleted ? '🎉 완료!' : `${current}/${target}${unit}`}
        </Text>
      </View>
      
      <ProgressBar
        current={current}
        total={target}
        color={isCompleted ? colors.status.success : colors.primary.main}
        animated={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    width: '100%',
  },
  progressBarContainer: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 4,
  },
  percentageText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularSvg: {
    position: 'absolute',
  },
  circularContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularText: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  pointsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    elevation: spacing.elevation.sm,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsValue: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  pointsLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  levelBadge: {
    backgroundColor: colors.accent.main,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  levelText: {
    ...typography.caption,
    color: colors.background.primary,
    fontWeight: 'bold',
  },
  nextLevelText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  streakContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    elevation: spacing.elevation.sm,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  streakTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  streakRecord: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  streakValue: {
    ...typography.h1,
    color: colors.accent.main,
    fontWeight: 'bold',
  },
  streakUnit: {
    ...typography.h4,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  streakStatus: {
    borderRadius: spacing.borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  streakStatusText: {
    ...typography.caption,
    color: colors.background.primary,
    fontWeight: '600',
  },
  statCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
    elevation: spacing.elevation.sm,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 10,
  },
  goalContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  goalStatus: {
    ...typography.body,
    fontWeight: '600',
  },
});

export default {
  ProgressBar,
  CircularProgress,
  PointsDisplay,
  StreakDisplay,
  StatCard,
  DailyGoal,
};