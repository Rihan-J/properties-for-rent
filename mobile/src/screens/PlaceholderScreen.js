import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../theme';

export default function PlaceholderScreen({ title }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Coming in next phase</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  title: { fontFamily: fonts.serif, fontSize: fontSizes['2xl'], color: colors.text },
  subtitle: { fontFamily: fonts.medium, fontSize: fontSizes.base, color: colors.textSecondary, marginTop: 8 },
});
