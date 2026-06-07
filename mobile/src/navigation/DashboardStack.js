import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AddPropertyScreen from '../screens/dashboard/AddPropertyScreen';
import PropertyDetailScreen from '../screens/explore/PropertyDetailScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
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
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AddProperty" 
        component={AddPropertyScreen} 
        options={{ title: 'Add Property', headerBackTitle: 'Back' }} 
      />
      <Stack.Screen 
        name="PropertyDetail" 
        component={PropertyDetailScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}
