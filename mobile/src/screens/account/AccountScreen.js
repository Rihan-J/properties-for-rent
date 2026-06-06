/**
 * AccountScreen — user profile, support info, privacy policy, logout, delete account.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import SupportInfoCard from '../../components/SupportInfoCard';
import Toast from '../../components/Toast';

export default function AccountScreen() {
  const { user, logout, isAdmin } = useAuth();
  const [support, setSupport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSupport = useCallback(async () => {
    try {
      const res = await api.get('/support');
      setSupport(res.data.data);
    } catch (err) {
      console.warn('Failed to load support data');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSupport();
    }, [fetchSupport])
  );

  const handlePrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync('https://properties-for-rentz.vercel.app/privacy');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently remove your properties, reviews, and images. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: async () => {
            try {
              await api.delete('/users/me');
              logout();
            } catch (err) {
              setErrorMsg('Failed to delete account');
            }
          } 
        }
      ]
    );
  };

  if (!user) return null; // RootNavigator handles auth gating mostly

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SupportInfoCard support={support} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <TouchableOpacity style={styles.listItem} onPress={handlePrivacyPolicy}>
          <Text style={styles.listText}>Privacy Policy</Text>
          <Text style={styles.listIcon}>↗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem}>
          <Text style={styles.listText}>Terms of Service</Text>
          <Text style={styles.listIcon}>↗</Text>
        </TouchableOpacity>
        <View style={styles.listItem}>
          <Text style={styles.listText}>App Version</Text>
          <Text style={styles.listSubtext}>1.0.0</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {!isAdmin && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        )}
      </View>

      <Toast message={errorMsg} visible={!!errorMsg} type="error" onHide={() => setErrorMsg('')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing['4xl'], paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: spacing['2xl'] },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontFamily: fonts.bold, fontSize: 32, color: '#fff' },
  name: { fontFamily: fonts.serif, fontSize: fontSizes['2xl'], color: colors.text, marginBottom: 4 },
  email: { fontFamily: fonts.medium, fontSize: fontSizes.base, color: colors.textSecondary, marginBottom: spacing.sm },
  roleBadge: { backgroundColor: colors.accentBg, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.borderLight },
  roleText: { fontFamily: fonts.bold, fontSize: 10, color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg, color: colors.text, marginBottom: spacing.md },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.borderLight },
  listText: { fontFamily: fonts.medium, fontSize: fontSizes.base, color: colors.text },
  listSubtext: { fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.textSecondary },
  listIcon: { fontSize: 16, color: colors.textMuted },
  logoutBtn: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginBottom: spacing.md },
  logoutText: { fontFamily: fonts.bold, fontSize: fontSizes.base, color: colors.text },
  deleteBtn: { padding: spacing.md, alignItems: 'center' },
  deleteText: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: colors.errorText },
});
