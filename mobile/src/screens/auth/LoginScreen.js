/**
 * LoginScreen — authentication entry point.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import Toast from '../../components/Toast';

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  
  const redirect = route.params?.redirect;
  const redirectParams = route.params?.params;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Let the AuthContext trigger RootNavigator update
      // RootNavigator will send user to MainTabs.
      // If there's a redirect, we might handle it in RootNavigator or here.
      // Since it unmounts from AuthStack, RootNavigator will mount MainTabs.
      // We'll let RootNavigator handle deep linking/redirects later if needed, 
      // or we can dispatch a navigation action to the parent if we want.
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid credentials');
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue to Properties for Rentz</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.textPlaceholder}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register', route.params)}>
              <Text style={styles.footerLink}>Register</Text>
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
  header: { marginBottom: spacing['3xl'], alignItems: 'center' },
  title: { fontFamily: fonts.serif, fontSize: fontSizes['3xl'], color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.medium, fontSize: fontSizes.base, color: colors.textSecondary, textAlign: 'center' },
  form: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  label: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.borderInput, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.text, marginBottom: spacing.lg },
  button: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontFamily: fonts.bold, fontSize: fontSizes.base, color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.textSecondary },
  footerLink: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: colors.primary },
});
