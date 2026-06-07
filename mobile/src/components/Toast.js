/**
 * Toast — lightweight notification component.
 * Usage: <Toast message="Success!" type="success" visible={true} onHide={() => {}} />
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, borderRadius, spacing } from '../theme';

export default function Toast({ message, type = 'info', visible, onHide, duration = 3000 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => onHide?.());
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, onHide, opacity, scale]);

  if (!visible) return null;

  const bgColor =
    type === 'success' ? colors.successBg :
    type === 'error'   ? colors.errorBg :
    'rgba(30, 30, 30, 0.85)'; // Darker pill for default info toast

  const borderColor =
    type === 'success' ? colors.successBorder :
    type === 'error'   ? colors.errorBorder :
    'transparent';

  const textColor =
    type === 'success' ? colors.success :
    type === 'error'   ? colors.errorText :
    '#ffffff';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, borderColor, opacity, transform: [{ scale }] },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {type === 'info' && '✨ '}
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 30, // pill shape
    borderWidth: 1,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  text: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
