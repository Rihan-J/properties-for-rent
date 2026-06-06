import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/explore/HomeScreen';
import PropertyDetailScreen from '../screens/explore/PropertyDetailScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function ExploreStack() {
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
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="PropertyDetail" 
        component={PropertyDetailScreen} 
        options={{ title: 'Property Details', headerBackTitle: 'Back' }} 
      />
    </Stack.Navigator>
  );
}
