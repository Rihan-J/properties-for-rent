import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, fontSizes, spacing } from '../theme';

export default function NetworkBanner() {
  const [isConnected, setIsConnected] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // Ignore initial null state, treat as connected until proven otherwise
      setIsConnected(state.isConnected !== false);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ef4444',
    paddingBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    color: '#ffffff',
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
});
