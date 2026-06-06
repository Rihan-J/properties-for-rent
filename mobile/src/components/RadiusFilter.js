/**
 * RadiusFilter — simple picker for map radius.
 * Adapted from frontend/src/components/map/RadiusFilter.js
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';
import { RADIUS_OPTIONS } from '../config/constants';

export default function RadiusFilter({ value, onChange, disabled }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>🎯</Text>
        <Text style={styles.text}>{value} km</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Search Radius</Text>
            <FlatList
              data={RADIUS_OPTIONS}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value === item && styles.optionActive,
                  ]}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item && styles.optionTextActive,
                    ]}
                  >
                    Within {item} km
                  </Text>
                  {value === item && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 110, // Below SearchBar
    right: spacing.base,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 90,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 300,
    padding: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionActive: {
    backgroundColor: colors.surfaceHover,
  },
  optionText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.text,
  },
  optionTextActive: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  checkIcon: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
