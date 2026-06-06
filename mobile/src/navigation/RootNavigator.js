import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
