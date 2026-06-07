/**
 * AddPropertyScreen — form to create new property listing.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { CATEGORIES, BOOKING_TYPES } from '../../config/constants';
import { uploadImage } from '../../lib/cloudinary';
import ImagePicker from '../../components/ImagePicker';
import MapPicker from '../../components/MapPicker';
import Toast from '../../components/Toast';

export default function AddPropertyScreen() {
  const navigation = useNavigation();
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1].id); // Default to 'home'
  const [bookingType, setBookingType] = useState('hourly');
  const [pricePerHour, setPricePerHour] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  
  // Site specific fields
  const [dimensions, setDimensions] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  
  const [location, setLocation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!title || !price || !category || !location || !imageFile) {
      setErrorMsg('Please fill all required fields including image and location');
      return;
    }

    // Validate coordinates
    const lat = Number(location.lat);
    const lng = Number(location.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setErrorMsg('Invalid location selected. Please pick a location on the map.');
      return;
    }

    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Image
      const imageUrl = await uploadImage(imageFile);

      // 2. Prepare payload
      const payload = {
        title,
        description,
        price: priceNum,
        category,
        image_url: imageUrl,
        latitude: lat,
        longitude: lng,
      };

      if (category === 'lodge') {
        payload.booking_type = bookingType;
        if (bookingType === 'hourly' || bookingType === 'both') payload.price_per_hour = Number(pricePerHour) || 0;
        if (bookingType === 'daily' || bookingType === 'both') payload.price_per_day = Number(pricePerDay) || 0;
      }

      if (category === 'site') {
        payload.dimensions = dimensions;
        payload.area_sqft = Number(areaSqft) || 0;
      }

      // 3. Submit Property
      await api.post('/properties', payload);
      
      navigation.goBack();
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Property Image *</Text>
          <ImagePicker 
            imageUri={imageFile?.uri} 
            onImageSelect={setImageFile} 
            onError={setErrorMsg} 
          />
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Modern Apartment in Downtown" />
          
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe the property..." multiline numberOfLines={4} />
          
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <TouchableOpacity 
                key={c.id} 
                style={[styles.catPill, category === c.id && styles.catPillActive]}
                onPress={() => setCategory(c.id)}
              >
                <Text style={[styles.catText, category === c.id && styles.catTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.label}>Base Price / Month *</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g. 15000" keyboardType="numeric" />

          {category === 'lodge' && (
            <View style={styles.subSection}>
              <Text style={styles.label}>Booking Type</Text>
              <View style={styles.row}>
                {BOOKING_TYPES.filter(b => b.id !== 'all').map(b => (
                  <TouchableOpacity 
                    key={b.id} 
                    style={[styles.roleBtn, bookingType === b.id && styles.roleBtnActive]}
                    onPress={() => setBookingType(b.id)}
                  >
                    <Text style={[styles.roleBtnText, bookingType === b.id && styles.roleBtnTextActive]}>{b.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                    style={[styles.roleBtn, bookingType === 'both' && styles.roleBtnActive]}
                    onPress={() => setBookingType('both')}
                  >
                    <Text style={[styles.roleBtnText, bookingType === 'both' && styles.roleBtnTextActive]}>Both</Text>
                </TouchableOpacity>
              </View>
              
              {(bookingType === 'hourly' || bookingType === 'both') && (
                <View style={{marginTop: spacing.md}}>
                  <Text style={styles.label}>Price per Hour</Text>
                  <TextInput style={styles.input} value={pricePerHour} onChangeText={setPricePerHour} keyboardType="numeric" placeholder="e.g. 500" />
                </View>
              )}

              {(bookingType === 'daily' || bookingType === 'both') && (
                <View style={{marginTop: spacing.sm}}>
                  <Text style={styles.label}>Price per Day</Text>
                  <TextInput style={styles.input} value={pricePerDay} onChangeText={setPricePerDay} keyboardType="numeric" placeholder="e.g. 2000" />
                </View>
              )}
            </View>
          )}

          {category === 'site' && (
            <View style={styles.subSection}>
              <Text style={styles.label}>Dimensions</Text>
              <TextInput style={styles.input} value={dimensions} onChangeText={setDimensions} placeholder="e.g. 30x40" />
              <Text style={styles.label}>Area (sqft)</Text>
              <TextInput style={styles.input} value={areaSqft} onChangeText={setAreaSqft} keyboardType="numeric" placeholder="e.g. 1200" />
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <MapPicker onLocationSelect={setLocation} />
          {location && <Text style={styles.locationText}>Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</Text>}
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? 'Saving...' : 'Publish Property'}</Text>
        </TouchableOpacity>

      </ScrollView>
      <Toast message={errorMsg} visible={!!errorMsg} type="error" onHide={() => setErrorMsg('')} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  section: { marginBottom: spacing.xl },
  subSection: { marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.background, borderRadius: borderRadius.md },
  label: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.borderInput, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.text, marginBottom: spacing.md },
  textArea: { height: 100, textAlignVertical: 'top' },
  catScroll: { flexDirection: 'row', marginBottom: spacing.md },
  catPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm, backgroundColor: colors.background },
  catPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.text },
  catTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: spacing.sm },
  roleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surface },
  roleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleBtnText: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.text },
  roleBtnTextActive: { color: '#fff' },
  locationText: { fontFamily: fonts.medium, fontSize: fontSizes.xs, color: colors.success, marginTop: spacing.xs },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { fontFamily: fonts.bold, fontSize: fontSizes.base, color: '#fff' },
});
