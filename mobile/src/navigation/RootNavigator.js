import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // We use a single stack. If a user is not logged in, they can still access MainTabs (Explore).
  // But we provide AuthStack for explicit login flows.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}
