/**
 * DashboardScreen — owner property management list.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import PropertyCard from '../../components/PropertyCard';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties');
      const propsList = res?.data?.data?.properties;
      setProperties(Array.isArray(propsList) ? propsList.filter(p => p != null) : []);
    } catch (err) {
      setErrorMsg('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              await api.delete(`/properties/${id}`);
              setProperties(prev => prev.filter(p => p.id !== id));
              setSuccessMsg('Property deleted successfully');
            } catch (err) {
              setErrorMsg('Failed to delete property');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  if (loading) return <LoadingScreen type="list" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Properties</Text>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item, index) => item?.id ?? `dash-${index}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (!item) return null;
          return (
            <PropertyCard
              property={item}
              showDelete
              onDelete={handleDelete}
              isDeleting={deletingId === item.id}
              style={styles.card}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No properties listed yet"
            subtitle="Start earning by listing your first property."
            actionLabel="Add Property"
            onAction={() => navigation.navigate('AddProperty')}
          />
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddProperty')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Toast message={errorMsg} visible={!!errorMsg} type="error" onHide={() => setErrorMsg('')} />
      <Toast message={successMsg} visible={!!successMsg} type="success" onHide={() => setSuccessMsg('')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  title: { fontFamily: fonts.serif, fontSize: fontSizes['2xl'], color: colors.text },
  list: { padding: spacing.md, paddingBottom: 100 },
  card: { marginBottom: spacing.md },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  fabIcon: { fontSize: 32, color: '#fff', lineHeight: 36 },
});
