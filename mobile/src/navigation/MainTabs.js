import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ExploreStack from './ExploreStack';
import DashboardStack from './DashboardStack';
import AdminStack from './AdminStack';
import AccountStack from './AccountStack';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { user, isOwner, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(8, insets.bottom);
  const tabHeight = 52 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e8e2db',
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semiBold,
          fontSize: 11,
        },
      }}
    >
      {/* Explore tab — always visible, even for guests */}
      <Tab.Screen 
        name="ExploreTab" 
        component={ExploreStack} 
        options={{ tabBarLabel: 'Explore', tabBarIcon: () => <Text style={{fontSize:20}}>🗺️</Text> }}
      />
      
      {/* Dashboard tab — only for owners/admins who are logged in */}
      {isOwner && (
        <Tab.Screen 
          name="DashboardTab" 
          component={DashboardStack}
          options={{ tabBarLabel: 'My Listings', tabBarIcon: () => <Text style={{fontSize:20}}>🏢</Text> }}
        />
      )}
      
      {/* Admin tab — only for admins */}
      {isAdmin && (
        <Tab.Screen 
          name="AdminTab" 
          component={AdminStack}
          options={{ tabBarLabel: 'Admin', tabBarIcon: () => <Text style={{fontSize:20}}>🛡️</Text> }}
        />
      )}

      {/* Account tab — always visible, shows login prompt for guests */}
      <Tab.Screen 
        name="AccountTab" 
        component={AccountStack}
        options={{ tabBarLabel: 'Account', tabBarIcon: () => <Text style={{fontSize:20}}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}
