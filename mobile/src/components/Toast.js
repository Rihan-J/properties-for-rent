/**
 * Toast — lightweight notification component.
 * Usage: <Toast message="Success!" type="success" visible={true} onHide={() => {}} />
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, borderRadius, spacing } from '../theme';

export default function Toast({ message, type = 'info', visible, onHide, duration = 3000 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide?.());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, opacity, translateY]);

  if (!visible) return null;

  const bgColor =
    type === 'success' ? colors.successBg :
    type === 'error'   ? colors.errorBg :
    colors.surface;

  const borderColor =
    type === 'success' ? colors.successBorder :
    type === 'error'   ? colors.errorBorder :
    colors.border;

  const textColor =
    type === 'success' ? colors.success :
    type === 'error'   ? colors.errorText :
    colors.text;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, borderColor, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.base,
    right: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  text: {
    fontSize: fontSizes.md,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },
});
