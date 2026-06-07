import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { GeoProvider } from './src/context/GeoContext';
import RootNavigator from './src/navigation/RootNavigator';
import LoadingScreen from './src/components/LoadingScreen';
import { navigationRef } from './src/config/api';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Inter-Regular': require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
        'Inter-Medium': require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
        'Inter-SemiBold': require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
        'Inter-Bold': require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
        'Inter-ExtraBold': require('@expo-google-fonts/inter/800ExtraBold/Inter_800ExtraBold.ttf'),
        'CormorantGaramond-SemiBold': require('@expo-google-fonts/cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf'),
      }).catch((e) => console.warn('Font load error, using fallback:', e));
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen message="Starting Properties for Rentz..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <GeoProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </GeoProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
