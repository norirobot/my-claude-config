import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

interface TutorScreenProps {
  navigation: any;
}

// Mock tutor data
const mockTutors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    nationality: '미국',
    languages: ['영어 (원어민)', '한국어 (중급)'],
    specialties: ['일상 회화', '비즈니스 영어', '발음 교정'],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 25000,
    availability: 'online',
    profileImage: '👩🏻‍🦰',
    experience: '3년',
    introduction: '안녕하세요! 미국에서 온 Sarah입니다. 한국에서 3년째 영어를 가르치고 있어요.',
    isVerified: true,
  },
  {
    id: '2',
    name: 'David Kim',
    nationality: '캐나다',
    languages: ['영어 (원어민)', '한국어 (고급)'],
    specialties: ['TOEIC', 'TOEFL', '대학 입시'],
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 30000,
    availability: 'online',
    profileImage: '👨🏻‍💼',
    experience: '5년',
    introduction: '캐나다 출신 David입니다. 한국 학생들의 영어 실력 향상을 도와드립니다.',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    nationality: '영국',
    languages: ['영어 (원어민)', '프랑스어 (고급)'],
    specialties: ['여행 영어', '문화 교류', '자유 대화'],
    rating: 4.7,
    reviewCount: 156,
    hourlyRate: 22000,
    availability: 'busy',
    profileImage: '👩🏼‍🎓',
    experience: '2년',
    introduction: '영국에서 온 Emma입니다. 재미있고 자연스러운 영어 대화를 함께해요!',
    isVerified: true,
  },
  {
    id: '4',
    name: 'Michael Chen',
    nationality: '호주',
    languages: ['영어 (원어민)', '중국어 (원어민)'],
    specialties: ['초보자 환영', '문법 기초', '회화 입문'],
    rating: 4.6,
    reviewCount: 73,
    hourlyRate: 20000,
    availability: 'online',
    profileImage: '👨🏻‍🏫',
    experience: '4년',
    introduction: '호주 출신 Michael입니다. 영어가 처음인 분들도 편하게 시작하세요!',
    isVerified: false,
  },
];

const filterOptions = [
  { id: 'all', label: '전체', icon: '👥' },
  { id: 'online', label: '온라인 가능', icon: '💻' },
  { id: 'beginner', label: '초보자 환영', icon: '🌱' },
  { id: 'business', label: '비즈니스', icon: '💼' },
  { id: 'conversation', label: '일상 회화', icon: '💬' },
];

const TutorScreen: React.FC<TutorScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [tutors, setTutors] = useState(mockTutors);

  const handleTutorPress = (tutor: any) => {
    Alert.alert(
      `${tutor.name} 튜터`,
      `${tutor.introduction}\n\n레슨을 예약하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '프로필 보기', 
          onPress: () => showTutorProfile(tutor)
        },
        { 
          text: '레슨 예약', 
          style: 'default',
          onPress: () => bookLesson(tutor)
        }
      ]
    );
  };

  const showTutorProfile = (tutor: any) => {
    Alert.alert(
      `${tutor.name} 상세 정보`,
      `국적: ${tutor.nationality}\n경력: ${tutor.experience}\n평점: ${tutor.rating}/5.0 (${tutor.reviewCount}개 리뷰)\n시간당: ${tutor.hourlyRate.toLocaleString()}원\n\n전문 분야:\n${tutor.specialties.map((s: string) => `• ${s}`).join('\n')}\n\n${tutor.introduction}`
    );
  };

  const bookLesson = (tutor: any) => {
    Alert.alert(
      '레슨 예약',
      `${tutor.name} 튜터와의 레슨 예약 기능은 곧 출시될 예정입니다!`,
      [{ text: '확인' }]
    );
  };

  const handleFilterPress = (filterId: string) => {
    setSelectedFilter(filterId);
    
    // Mock filtering logic
    let filteredTutors = mockTutors;
    
    if (filterId === 'online') {
      filteredTutors = mockTutors.filter(tutor => tutor.availability === 'online');
    } else if (filterId === 'beginner') {
      filteredTutors = mockTutors.filter(tutor => 
        tutor.specialties.some(specialty => 
          specialty.includes('초보') || specialty.includes('입문') || specialty.includes('기초')
        )
      );
    } else if (filterId === 'business') {
      filteredTutors = mockTutors.filter(tutor => 
        tutor.specialties.some(specialty => 
          specialty.includes('비즈니스') || specialty.includes('TOEIC') || specialty.includes('TOEFL')
        )
      );
    } else if (filterId === 'conversation') {
      filteredTutors = mockTutors.filter(tutor => 
        tutor.specialties.some(specialty => 
          specialty.includes('회화') || specialty.includes('대화')
        )
      );
    }
    
    setTutors(filteredTutors);
  };

  const getAvailabilityStatus = (availability: string) => {
    switch (availability) {
      case 'online': return { text: '온라인', color: Colors.success, icon: '🟢' };
      case 'busy': return { text: '수업 중', color: Colors.warm, icon: '🟡' };
      case 'offline': return { text: '오프라인', color: Colors.text.secondary, icon: '⚫' };
      default: return { text: '알 수 없음', color: Colors.text.secondary, icon: '⚫' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.accent}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>튜터 찾기</Text>
        <Text style={styles.headerSubtitle}>
          전문 튜터와 1:1 맞춤 레슨을 받아보세요
        </Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="튜터 이름이나 전문 분야로 검색하세요"
            placeholderTextColor={Colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollView}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipSelected
              ]}
              onPress={() => handleFilterPress(filter.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextSelected
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tutors List */}
      <ScrollView style={styles.tutorsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsText}>
          {tutors.length}명의 튜터를 찾았습니다
        </Text>

        {tutors.map((tutor) => {
          const availability = getAvailabilityStatus(tutor.availability);
          
          return (
            <TouchableOpacity
              key={tutor.id}
              style={styles.tutorCard}
              onPress={() => handleTutorPress(tutor)}
              activeOpacity={0.8}
            >
              <View style={styles.tutorCardHeader}>
                <View style={styles.tutorInfo}>
                  <View style={styles.tutorNameRow}>
                    <Text style={styles.tutorProfileImage}>{tutor.profileImage}</Text>
                    <View style={styles.tutorNameContainer}>
                      <View style={styles.tutorTitleRow}>
                        <Text style={styles.tutorName}>{tutor.name}</Text>
                        {tutor.isVerified && (
                          <Text style={styles.verifiedIcon}>✅</Text>
                        )}
                      </View>
                      <Text style={styles.tutorNationality}>{tutor.nationality} • {tutor.experience}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.tutorStats}>
                    <View style={styles.availabilityContainer}>
                      <Text style={styles.availabilityIcon}>{availability.icon}</Text>
                      <Text style={[styles.availabilityText, { color: availability.color }]}>
                        {availability.text}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.tutorDetails}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingIcon}>⭐</Text>
                  <Text style={styles.ratingText}>
                    {tutor.rating} ({tutor.reviewCount}개 리뷰)
                  </Text>
                </View>

                <View style={styles.specialtiesContainer}>
                  {tutor.specialties.slice(0, 3).map((specialty, index) => (
                    <View key={index} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.tutorFooter}>
                  <Text style={styles.hourlyRate}>
                    시간당 {tutor.hourlyRate.toLocaleString()}원
                  </Text>
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => bookLesson(tutor)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bookButtonText}>예약하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Empty State */}
        {tutors.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>검색 결과가 없습니다</Text>
            <Text style={styles.emptyStateText}>
              다른 필터나 검색어로 다시 시도해보세요
            </Text>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>튜터 서비스 안내</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>💰</Text>
            <Text style={styles.infoText}>첫 레슨 30% 할인</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>24시간 전까지 취소 가능</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🎯</Text>
            <Text style={styles.infoText}>개인 맞춤 학습 플랜 제공</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 20,
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
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.text.inverse,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.body,
    color: Colors.text.primary,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  filtersContainer: {
    backgroundColor: Colors.background,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  filtersScrollView: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    ...typography.bodySmall,
    color: Colors.text.primary,
  },
  filterTextSelected: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  tutorsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsText: {
    ...typography.body,
    color: Colors.text.secondary,
    marginVertical: 16,
  },
  tutorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  tutorCardHeader: {
    padding: 16,
  },
  tutorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tutorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tutorProfileImage: {
    fontSize: 40,
    marginRight: 12,
  },
  tutorNameContainer: {
    flex: 1,
  },
  tutorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorName: {
    ...typography.h4,
    color: Colors.text.primary,
    marginRight: 8,
  },
  verifiedIcon: {
    fontSize: 16,
  },
  tutorNationality: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  tutorStats: {
    alignItems: 'flex-end',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  availabilityText: {
    ...typography.caption,
    fontWeight: '600',
  },
  tutorDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  ratingText: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  specialtyText: {
    ...typography.caption,
    color: Colors.accent,
    fontWeight: '500',
  },
  tutorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourlyRate: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookButtonText: {
    ...typography.button,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    ...typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  infoTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 24,
  },
  infoText: {
    ...typography.body,
    color: Colors.text.secondary,
    flex: 1,
  },
});

export default TutorScreen;