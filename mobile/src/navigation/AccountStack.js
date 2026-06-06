import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountScreen from '../screens/account/AccountScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AccountStack() {
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
        name="Account" 
        component={AccountScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}
