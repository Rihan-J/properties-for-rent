import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExploreStack from './ExploreStack';
import DashboardStack from './DashboardStack';
import AdminStack from './AdminStack';
import AccountStack from './AccountStack';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { user } = useAuth();
  
  const isOwner = user?.role === 'owner' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semiBold,
          fontSize: 10,
        },
      }}
    >
      <Tab.Screen 
        name="ExploreTab" 
        component={ExploreStack} 
        options={{ tabBarLabel: 'Explore', tabBarIcon: () => <Text style={{fontSize:20}}>🗺️</Text> }}
      />
      
      {isOwner && (
        <Tab.Screen 
          name="DashboardTab" 
          component={DashboardStack}
          options={{ tabBarLabel: 'My Listings', tabBarIcon: () => <Text style={{fontSize:20}}>🏢</Text> }}
        />
      )}
      
      {isAdmin && (
        <Tab.Screen 
          name="AdminTab" 
          component={AdminStack}
          options={{ tabBarLabel: 'Admin', tabBarIcon: () => <Text style={{fontSize:20}}>🛡️</Text> }}
        />
      )}

      <Tab.Screen 
        name="AccountTab" 
        component={AccountStack}
        options={{ tabBarLabel: 'Account', tabBarIcon: () => <Text style={{fontSize:20}}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}
