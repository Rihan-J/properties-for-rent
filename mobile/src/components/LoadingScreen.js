/**
 * LoadingScreen — Animated skeleton loaders tailored to the app context.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

export default function LoadingScreen({ type = 'default' }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  const Skeleton = ({ style }) => (
    <Animated.View style={[styles.skeleton, style, { opacity }]} />
  );

  if (type === 'list') {
    return (
      <View style={styles.container}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.cardSkeleton}>
            <Skeleton style={styles.cardImage} />
            <Skeleton style={styles.cardTitle} />
            <Skeleton style={styles.cardSubtitle} />
          </View>
        ))}
      </View>
    );
  }

  if (type === 'detail') {
    return (
      <View style={styles.container}>
        <Skeleton style={styles.heroImage} />
        <View style={styles.detailContent}>
          <Skeleton style={styles.title} />
          <Skeleton style={styles.price} />
          <View style={styles.divider} />
          <Skeleton style={styles.paraLine} />
          <Skeleton style={styles.paraLine} />
          <Skeleton style={styles.paraLineShort} />
          <View style={styles.divider} />
          <Skeleton style={styles.box} />
        </View>
      </View>
    );
  }

  if (type === 'admin') {
    return (
      <View style={styles.container}>
        <Skeleton style={styles.tabs} />
        <View style={styles.adminGrid}>
          <Skeleton style={styles.adminMetric} />
          <Skeleton style={styles.adminMetric} />
          <Skeleton style={styles.adminMetric} />
        </View>
        <Skeleton style={styles.adminChart} />
      </View>
    );
  }

  // Default generic skeleton
  return (
    <View style={styles.centerContainer}>
      <Skeleton style={styles.genericBox} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e2ddd8',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  genericBox: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  
  // List Skeleton
  cardSkeleton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardImage: {
    height: 180,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    height: 24,
    width: '70%',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    height: 16,
    width: '40%',
    borderRadius: borderRadius.sm,
  },

  // Detail Skeleton
  heroImage: {
    height: 350,
    width: '100%',
  },
  detailContent: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    flex: 1,
  },
  title: {
    height: 36,
    width: '80%',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  price: {
    height: 80,
    width: '100%',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
  },
  paraLine: {
    height: 16,
    width: '100%',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  paraLineShort: {
    height: 16,
    width: '60%',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  box: {
    height: 120,
    width: '100%',
    borderRadius: borderRadius.lg,
  },

  // Admin Skeleton
  tabs: {
    height: 50,
    width: '100%',
    marginBottom: spacing.xl,
    marginTop: 60,
  },
  adminGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  adminMetric: {
    flex: 1,
    height: 100,
    borderRadius: borderRadius.md,
  },
  adminChart: {
    marginHorizontal: spacing.xl,
    height: 300,
    borderRadius: borderRadius.lg,
  },
});
