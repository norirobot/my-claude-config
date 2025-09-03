import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAppSelector, useAppDispatch } from '../store/store';
import { selectIsAuthenticated, selectAuthLoading } from '../store/slices/authSlice';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

// Import screens
import LoadingScreen from '../components/common/LoadingScreen';

// Auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main app screens
import HomeScreen from '../screens/main/HomeScreen';
import PracticeScreen from '../screens/practice/PracticeScreen';
import TutorScreen from '../screens/tutor/TutorScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Practice flow screens
import SituationPracticeScreen from '../screens/practice/SituationPracticeScreen';
import FeedbackScreen from '../screens/practice/FeedbackScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Practice Stack Navigator
function PracticeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          ...typography.h6,
          color: Colors.text.primary,
        },
      }}
    >
      <Stack.Screen 
        name="PracticeMain" 
        component={PracticeScreen}
        options={{ title: 'Practice English' }}
      />
      <Stack.Screen 
        name="SituationPractice" 
        component={SituationPracticeScreen}
        options={{ title: 'Situation Practice' }}
      />
      <Stack.Screen 
        name="Feedback" 
        component={FeedbackScreen}
        options={{ title: 'Your Results' }}
      />
    </Stack.Navigator>
  );
}

// Tutor Stack Navigator  
function TutorStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          ...typography.h6,
          color: Colors.text.primary,
        },
      }}
    >
      <Stack.Screen 
        name="TutorMain" 
        component={TutorScreen}
        options={{ title: 'Connect with Tutors' }}
      />
    </Stack.Navigator>
  );
}

// Progress Stack Navigator
function ProgressStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          ...typography.h6,
          color: Colors.text.primary,
        },
      }}
    >
      <Stack.Screen 
        name="ProgressMain" 
        component={ProgressScreen}
        options={{ title: 'Your Progress' }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          ...typography.h6,
          color: Colors.text.primary,
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: Colors.lightGray,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarLabelStyle: {
          ...typography.caption,
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Practice':
              iconName = focused ? 'mic' : 'mic-outline';
              break;
            case 'Tutor':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Progress':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen 
        name="Practice" 
        component={PracticeStack}
        options={{ tabBarLabel: '연습' }}
      />
      <Tab.Screen 
        name="Tutor" 
        component={TutorStack}
        options={{ tabBarLabel: '튜터' }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressStack}
        options={{ tabBarLabel: '진도' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: '프로필' }}
      />
    </Tab.Navigator>
  );
}

// Loading Component
function AppLoading() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: Colors.background 
    }}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={{
        ...typography.body,
        color: Colors.text.secondary,
        marginTop: 16,
      }}>
        Loading English Friends...
      </Text>
    </View>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const dispatch = useAppDispatch();

  // Auto-login or token refresh logic would go here
  useEffect(() => {
    // TODO: Implement token validation/refresh logic
    // For now, just check if we have stored auth data
  }, [dispatch]);

  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}