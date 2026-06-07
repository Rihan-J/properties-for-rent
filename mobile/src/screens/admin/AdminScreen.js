/**
 * AdminScreen — tabs for analytics, approvals, reviews, and support management.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Alert, TextInput, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import Toast from '../../components/Toast';
import LoadingScreen from '../../components/LoadingScreen';
import { getOptimizedImageUrl } from '../../lib/cloudinary';

const { width } = Dimensions.get('window');

export default function AdminScreen() {
  const navigation = useNavigation();
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
      const [statsRes, propsRes, reviewsRes, supportRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/properties'),
        api.get('/admin/reviews'),
        api.get('/support')
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value?.data?.data || null);
      }
      if (propsRes.status === 'fulfilled') {
        const propsList = propsRes.value?.data?.data?.properties;
        setProperties(Array.isArray(propsList) ? propsList.filter(p => p != null) : []);
      }
      if (reviewsRes.status === 'fulfilled') {
        const reviewsList = reviewsRes.value?.data?.data?.reviews;
        setReviews(Array.isArray(reviewsList) ? reviewsList.filter(r => r != null) : []);
      }
      if (supportRes.status === 'fulfilled' && supportRes.value?.data?.data) {
        setSupportForm(prev => ({ ...prev, ...supportRes.value.data.data }));
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

  if (loading && !stats) return <LoadingScreen type="admin" />;

  const chartData = Array.isArray(stats?.categories)
    ? stats.categories.map(c => ({ label: c.category || 'unknown', value: Number(c.count) || 0 }))
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dashboardText}>DASHBOARD</Text>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Manage listings, reviews, and user activity</Text>
      </View>

      <View style={styles.tabsRow}>
        {[
          { id: 'analytics', label: 'Analytics', icon: '📊' },
          { id: 'approvals', label: 'Properties', icon: '📋' },
          { id: 'reviews', label: 'Reviews', icon: '⭐' },
          { id: 'support', label: 'Support Info', icon: '📞' }
        ].map(tab => (
          <TouchableOpacity 
            key={tab.id} 
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.icon} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'analytics' && stats && (
          <View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIconBg}>👤</Text>
                <Text style={styles.statLabel}>TOTAL USERS</Text>
                <Text style={styles.statValue}>{stats?.totalUsers ?? 0}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIconBg}>🔒</Text>
                <Text style={styles.statLabel}>TOTAL OWNERS</Text>
                <Text style={styles.statValue}>{stats?.totalOwners ?? 0}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIconBg}>🏠</Text>
                <Text style={styles.statLabel}>TOTAL PROPERTIES</Text>
                <Text style={styles.statValue}>{stats?.totalProperties ?? 0}</Text>
              </View>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Category Breakdown</Text>
                  <Text style={styles.chartSubtitle}>Distribution of properties across categories</Text>
                </View>
                <View style={styles.chartIconContainer}>
                  <Text style={styles.chartIcon}>📊</Text>
                </View>
              </View>
              <SimpleBarChart data={chartData} width={width - spacing.xl * 2 - 40} height={220} />
            </View>
          </View>
        )}

        {activeTab === 'approvals' && (
          <View>
            {properties.map(p => (
              <TouchableOpacity 
                key={p.id} 
                style={styles.itemCard}
                onPress={() => navigation.navigate('ExploreTab', { screen: 'PropertyDetail', params: { propertyId: p.id } })}
              >
                <View style={styles.propHeader}>
                  <Image 
                    source={{ uri: getOptimizedImageUrl(p.image_url, { width: 160 }) || 'https://via.placeholder.com/150' }} 
                    style={styles.propImage} 
                  />
                  <View style={styles.propInfo}>
                    <Text style={styles.itemTitle}>{p.title || 'Untitled'}</Text>
                    {p.category && (
                      <View style={styles.catBadge}>
                        <Text style={styles.catText}>{p.category.replace('_', ' ')}</Text>
                      </View>
                    )}
                    <Text style={styles.itemSub}>Owner: {p.owner_name || 'Unknown'}</Text>
                    <Text style={styles.itemPrice}>
                      {'\u20B9'}{Number(p.price || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.itemSub}>Status: <Text style={styles.statusText}>{p.status || 'N/A'}</Text></Text>
                  </View>
                </View>
                
                <View style={styles.actionsRow}>
                  {p.status === 'pending' && (
                    <>
                      <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={() => handleApproveProperty(p.id, 'approved')}><Text style={styles.btnText}>Approve</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.btn, styles.btnWarning]} onPress={() => handleApproveProperty(p.id, 'rejected')}><Text style={styles.btnText}>Reject</Text></TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => handleDeleteProperty(p.id)}><Text style={styles.btnText}>Delete</Text></TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            {properties.length === 0 && <Text style={styles.emptyText}>No properties found</Text>}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View>
            {reviews.map(r => {
              const date = new Date(r.created_at).toLocaleDateString('en-IN', {
                month: 'short', day: 'numeric', year: 'numeric'
              });
              return (
                <View key={r.id} style={styles.itemCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(r.user_name || 'A').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewerName}>{r.user_name || 'Anonymous'}</Text>
                      <Text style={styles.reviewerEmail}>{r.user_email || 'No email'}</Text>
                      <Text style={styles.reviewRating}>{r.rating ?? 0} ⭐</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.propRefText}>{r.property_title || r.property_id}</Text>
                  {r.comment ? <Text style={styles.itemSub}>{r.comment}</Text> : null}
                  <Text style={styles.reviewDate}>{date}</Text>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => handleDeleteReview(r.id)}><Text style={styles.btnText}>Delete Review</Text></TouchableOpacity>
                  </View>
                </View>
              );
            })}
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
  header: { padding: spacing.lg, backgroundColor: '#faf9f7', paddingTop: 50 },
  dashboardText: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.5, color: colors.text, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.text, marginBottom: 4 },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.textSecondary },
  tabsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, backgroundColor: '#faf9f7', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  tabBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2ddd8' },
  tabBtnActive: { backgroundColor: '#1a1815', borderColor: '#1a1815' },
  tabText: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.text },
  tabTextActive: { color: '#fff' },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'], backgroundColor: '#faf9f7' },
  statsGrid: { gap: spacing.md, marginBottom: spacing.md },
  statCard: { position: 'relative', overflow: 'hidden', backgroundColor: '#fff', padding: spacing.xl, borderRadius: 16, borderWidth: 1, borderColor: '#e2ddd8' },
  statIconBg: { position: 'absolute', right: 20, top: 30, fontSize: 50, opacity: 0.05, transform: [{scale: 1.2}] },
  statLabel: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.5, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.sm },
  statValue: { fontFamily: fonts.serif, fontSize: 36, color: colors.text },
  
  chartCard: { backgroundColor: '#fff', padding: spacing.xl, borderRadius: 16, borderWidth: 1, borderColor: '#e2ddd8', marginBottom: spacing.xl },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  chartTitle: { fontFamily: fonts.serif, fontSize: fontSizes.xl, color: colors.text, marginBottom: 4 },
  chartSubtitle: { fontFamily: fonts.medium, fontSize: fontSizes.xs, color: colors.textSecondary },
  chartIconContainer: { backgroundColor: '#fdf8f4', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2ddd8' },
  chartIcon: { fontSize: 16, color: '#8a6b4a' },
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
  submitBtnText: { fontFamily: fonts.bold, fontSize: fontSizes.base, color: '#fff' },
  
  // New Styles
  propHeader: { flexDirection: 'row', gap: spacing.md },
  propImage: { width: 80, height: 80, borderRadius: borderRadius.sm, backgroundColor: colors.borderLight },
  propInfo: { flex: 1, justifyContent: 'center' },
  catBadge: { backgroundColor: '#fdf8f4', borderColor: '#f0ece7', borderWidth: 1, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginVertical: 4 },
  catText: { fontFamily: fonts.bold, fontSize: 9, color: '#8a6b4a', textTransform: 'uppercase', letterSpacing: 0.5 },
  itemPrice: { fontFamily: fonts.semiBold, fontSize: fontSizes.md, color: colors.text, marginTop: 2 },
  statusText: { fontFamily: fonts.bold, textTransform: 'uppercase', fontSize: 10 },
  
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1815', justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  avatarText: { fontFamily: fonts.bold, fontSize: fontSizes.base, color: '#fff' },
  reviewMeta: { flex: 1 },
  reviewerName: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.text },
  reviewerEmail: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  reviewRating: { fontFamily: fonts.bold, fontSize: 12, color: '#f59e0b', marginTop: 2 },
  propRefText: { fontFamily: fonts.bold, fontSize: fontSizes.xs, color: '#8a6b4a', marginBottom: 4 },
  reviewDate: { fontFamily: fonts.medium, fontSize: 10, color: colors.textMuted, marginTop: 8 },
});
