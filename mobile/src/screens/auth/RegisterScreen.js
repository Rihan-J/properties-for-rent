/**
 * RegisterScreen — user and owner registration.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import Toast from '../../components/Toast';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      setErrorMsg('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role, phone, true); // true for accepted_terms
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Properties for Rentz today</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor={colors.textPlaceholder}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="john@example.com"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            placeholderTextColor={colors.textPlaceholder}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
              onPress={() => setRole('user')}
            >
              <Text style={[styles.roleBtnText, role === 'user' && styles.roleBtnTextActive]}>Tenant / Buyer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleBtn, role === 'owner' && styles.roleBtnActive]}
              onPress={() => setRole('owner')}
            >
              <Text style={[styles.roleBtnText, role === 'owner' && styles.roleBtnTextActive]}>Property Owner</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Register'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', route.params)}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast message={errorMsg} visible={!!errorMsg} type="error" onHide={() => setErrorMsg('')} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header: { marginBottom: spacing.xl, alignItems: 'center', marginTop: spacing.xl },
  title: { fontFamily: fonts.serif, fontSize: fontSizes['3xl'], color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.medium, fontSize: fontSizes.base, color: colors.textSecondary, textAlign: 'center' },
  form: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  label: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.borderInput, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.text, marginBottom: spacing.md },
  roleContainer: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  roleBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.background },
  roleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleBtnText: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.text },
  roleBtnTextActive: { color: '#fff' },
  button: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontFamily: fonts.bold, fontSize: fontSizes.base, color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.textSecondary },
  footerLink: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: colors.primary },
});
