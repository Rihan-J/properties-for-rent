/**
 * ImagePicker — reusable component for selecting images from gallery/camera.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';

export default function ImagePicker({ imageUri, onImageSelect, onError }) {
  const requestPermissions = async () => {
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Slightly compress to save bandwidth
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelect({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        });
      }
    } catch (err) {
      onError?.('Failed to pick image');
    }
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
            <Text style={styles.changeBtnText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
          <Text style={styles.icon}>📸</Text>
          <Text style={styles.text}>Tap to select an image</Text>
          <Text style={styles.subtext}>JPG, PNG up to 5MB</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  placeholder: {
    width: '100%',
    height: 160,
    backgroundColor: colors.inputBg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 32, marginBottom: spacing.sm },
  text: { fontFamily: fonts.semiBold, fontSize: fontSizes.base, color: colors.text, marginBottom: spacing.xs },
  subtext: { fontFamily: fonts.regular, fontSize: fontSizes.xs, color: colors.textSecondary },
  previewContainer: { width: '100%', height: 200, borderRadius: borderRadius.lg, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  changeBtn: { position: 'absolute', bottom: spacing.sm, right: spacing.sm, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  changeBtnText: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: colors.primary },
});
