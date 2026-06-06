/**
 * SupportInfoCard — displays support contact info fetched from backend.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';
import { openWhatsApp, openPhone, openEmail, openInstagram } from '../lib/geo';

export default function SupportInfoCard({ support }) {
  if (!support) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Need Help?</Text>
      <Text style={styles.subtitle}>Our support team is always here for you.</Text>

      <View style={styles.links}>
        {support.phone && (
          <TouchableOpacity style={styles.linkRow} onPress={() => openPhone(support.phone)}>
            <Text style={styles.icon}>📞</Text>
            <Text style={styles.linkText}>{support.phone}</Text>
          </TouchableOpacity>
        )}
        
        {support.email && (
          <TouchableOpacity style={styles.linkRow} onPress={() => openEmail(support.email)}>
            <Text style={styles.icon}>✉️</Text>
            <Text style={styles.linkText}>{support.email}</Text>
          </TouchableOpacity>
        )}

        {support.whatsapp && (
          <TouchableOpacity style={styles.linkRow} onPress={() => openWhatsApp(support.whatsapp)}>
            <Text style={styles.icon}>💬</Text>
            <Text style={styles.linkText}>WhatsApp Support</Text>
          </TouchableOpacity>
        )}

        {support.instagram && (
          <TouchableOpacity style={styles.linkRow} onPress={() => openInstagram(support.instagram)}>
            <Text style={styles.icon}>📸</Text>
            <Text style={styles.linkText}>{support.instagram}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: { fontFamily: fonts.serif, fontSize: fontSizes.xl, color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.md },
  links: { gap: spacing.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  icon: { fontSize: 18, marginRight: spacing.md },
  linkText: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.primary },
});
