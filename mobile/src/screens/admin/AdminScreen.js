/**
 * AdminScreen — tabs for analytics, approvals, reviews, and support management.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import Toast from '../../components/Toast';
import LoadingScreen from '../../components/LoadingScreen';

const { width } = Dimensions.get('window');

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Analytics State
  const [stats, setStats] = useState(null);
  
  // Approvals State
  const [properties, setProperties] = useState([]);
  
  // Reviews State
  const [reviews, setReviews] = useState([]);

  // Support State
  const [supportForm, setSupportForm] = useState({ phone: '', email: '', whatsapp: '', instagram: '' });
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, propsRes, reviewsRes, supportRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/properties'),
        api.get('/admin/reviews'),
        api.get('/support')
      ]);

      setStats(statsRes.data.data);
      setProperties(propsRes.data.data.properties || []);
      setReviews(reviewsRes.data.data.reviews || []);
      if (supportRes.data.data) {
        setSupportForm(supportRes.data.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleApproveProperty = async (id, status) => {
    try {
      await api.patch(`/admin/properties/${id}/approve`, { status });
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      setSuccessMsg(`Property ${status}`);
    } catch (err) {
      setErrorMsg('Approval failed');
    }
  };

  const handleDeleteProperty = (id) => {
    Alert.alert('Delete Property', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/admin/properties/${id}`);
          setProperties(prev => prev.filter(p => p.id !== id));
          setSuccessMsg('Property deleted');
        } catch (err) {
          setErrorMsg('Delete failed');
        }
      }}
    ]);
  };

  const handleDeleteReview = (id) => {
    Alert.alert('Delete Review', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/admin/reviews/${id}`);
          setReviews(prev => prev.filter(r => r.id !== id));
          setSuccessMsg('Review deleted');
        } catch (err) {
          setErrorMsg('Delete failed');
        }
      }}
    ]);
  };

  const handleSaveSupport = async () => {
    try {
      await api.put('/admin/support', supportForm);
      setSuccessMsg('Support info updated');
    } catch (err) {
      setErrorMsg('Update failed');
    }
  };

  if (loading && !stats) return <LoadingScreen />;

  const chartData = stats?.propertiesByCategory ? 
    Object.entries(stats.propertiesByCategory).map(([k, v]) => ({ label: k, value: v })) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
      </View>

      <View style={styles.tabsRow}>
        {['analytics', 'approvals', 'reviews', 'support'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'analytics' && stats && (
          <View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}><Text style={styles.statValue}>{stats.totalUsers}</Text><Text style={styles.statLabel}>Total Users</Text></View>
              <View style={styles.statCard}><Text style={styles.statValue}>{stats.totalOwners}</Text><Text style={styles.statLabel}>Total Owners</Text></View>
              <View style={styles.statCard}><Text style={styles.statValue}>{stats.totalProperties}</Text><Text style={styles.statLabel}>Properties</Text></View>
            </View>
            <Text style={styles.sectionTitle}>Properties by Category</Text>
            <SimpleBarChart data={chartData} width={width - spacing.xl * 2} height={220} />
          </View>
        )}

        {activeTab === 'approvals' && (
          <View>
            {properties.map(p => (
              <View key={p.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{p.title}</Text>
                <Text style={styles.itemSub}>Owner: {p.owner_name} | Status: {p.status}</Text>
                <View style={styles.actionsRow}>
                  {p.status === 'pending' && (
                    <>
                      <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={() => handleApproveProperty(p.id, 'approved')}><Text style={styles.btnText}>Approve</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.btn, styles.btnWarning]} onPress={() => handleApproveProperty(p.id, 'rejected')}><Text style={styles.btnText}>Reject</Text></TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => handleDeleteProperty(p.id)}><Text style={styles.btnText}>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
            {properties.length === 0 && <Text style={styles.emptyText}>No properties found</Text>}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View>
            {reviews.map(r => (
              <View key={r.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>Rating: {r.rating} ⭐</Text>
                <Text style={styles.itemSub}>{r.comment}</Text>
                <Text style={styles.itemSub}>By: {r.user_name} | Property ID: {r.property_id}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => handleDeleteReview(r.id)}><Text style={styles.btnText}>Delete Review</Text></TouchableOpacity>
                </View>
              </View>
            ))}
            {reviews.length === 0 && <Text style={styles.emptyText}>No reviews found</Text>}
          </View>
        )}

        {activeTab === 'support' && (
          <View style={styles.formCard}>
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={supportForm.phone} onChangeText={t => setSupportForm(p => ({...p, phone: t}))} />
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={supportForm.email} onChangeText={t => setSupportForm(p => ({...p, email: t}))} />
            <Text style={styles.label}>WhatsApp</Text>
            <TextInput style={styles.input} value={supportForm.whatsapp} onChangeText={t => setSupportForm(p => ({...p, whatsapp: t}))} />
            <Text style={styles.label}>Instagram Handle</Text>
            <TextInput style={styles.input} value={supportForm.instagram} onChangeText={t => setSupportForm(p => ({...p, instagram: t}))} />
            
            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveSupport}>
              <Text style={styles.submitBtnText}>Save Support Info</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Toast message={errorMsg} visible={!!errorMsg} type="error" onHide={() => setErrorMsg('')} />
      <Toast message={successMsg} visible={!!successMsg} type="success" onHide={() => setSuccessMsg('')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingTop: 50 },
  title: { fontFamily: fonts.serif, fontSize: fontSizes['2xl'], color: colors.text },
  tabsRow: { flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabText: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  content: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { flex: 1, minWidth: '30%', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  statValue: { fontFamily: fonts.bold, fontSize: fontSizes.xl, color: colors.primary },
  statLabel: { fontFamily: fonts.medium, fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg, color: colors.text, marginBottom: spacing.md },
  itemCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  itemTitle: { fontFamily: fonts.semiBold, fontSize: fontSizes.base, color: colors.text },
  itemSub: { fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: borderRadius.sm },
  btnSuccess: { backgroundColor: colors.success },
  btnWarning: { backgroundColor: colors.warning },
  btnDanger: { backgroundColor: colors.error },
  btnText: { fontFamily: fonts.bold, fontSize: 10, color: '#fff', textTransform: 'uppercase' },
  emptyText: { fontFamily: fonts.medium, fontSize: fontSizes.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  formCard: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  label: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.borderInput, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.text, marginBottom: spacing.md },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm },
  submitBtnText: { fontFamily: fonts.bold, fontSize: fontSizes.base, color: '#fff' }
});
