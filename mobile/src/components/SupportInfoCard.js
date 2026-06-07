/**
 * SupportInfoCard — displays support contact info fetched from backend.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';
import { openWhatsApp, openPhone, openEmail, openInstagram } from '../lib/geo';

export default function SupportInfoCard({ support }) {
  if (!support) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Need Help?</Text>
      <Text style={styles.subtitle}>Our support team is always here for you.</Text>

      <View style={styles.iconRow}>
        {support.phone && (
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#10b981' }]} onPress={() => openPhone(support.phone)}>
            <FontAwesome5 name="phone-alt" size={20} color="#fff" />
          </TouchableOpacity>
        )}
        
        {support.email && (
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#f59e0b' }]} onPress={() => openEmail(support.email)}>
            <MaterialIcons name="email" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {support.whatsapp && (
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#25D366' }]} onPress={() => openWhatsApp(support.whatsapp)}>
            <FontAwesome5 name="whatsapp" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {support.instagram && (
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#E1306C' }]} onPress={() => openInstagram(support.instagram)}>
            <FontAwesome5 name="instagram" size={24} color="#fff" />
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
    alignItems: 'center',
  },
  title: { fontFamily: fonts.serif, fontSize: fontSizes.xl, color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.lg, textAlign: 'center' },
  iconRow: { flexDirection: 'row', gap: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  iconBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
});
