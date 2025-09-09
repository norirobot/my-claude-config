import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View } from 'react-native';

import { store, persistor } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/components/common/LoadingScreen';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            <AppNavigator />
            <StatusBar style="auto" />
          </View>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}