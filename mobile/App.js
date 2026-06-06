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
        'DMSans-Regular': require('@expo-google-fonts/dm-sans/DMSans_400Regular.ttf'),
        'DMSans-Medium': require('@expo-google-fonts/dm-sans/DMSans_500Medium.ttf'),
        'DMSans-SemiBold': require('@expo-google-fonts/dm-sans/DMSans_600SemiBold.ttf'),
        'DMSans-Bold': require('@expo-google-fonts/dm-sans/DMSans_700Bold.ttf'),
        'CormorantGaramond-SemiBold': require('@expo-google-fonts/cormorant-garamond/CormorantGaramond_600SemiBold.ttf'),
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
