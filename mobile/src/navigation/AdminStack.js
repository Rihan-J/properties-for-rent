import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminScreen from '../screens/admin/AdminScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: 'DMSans-Bold' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Admin" 
        component={AdminScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}
