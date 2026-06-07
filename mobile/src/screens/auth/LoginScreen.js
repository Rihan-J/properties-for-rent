/**
 * LoginScreen — authentication entry point.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
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
  const [showPassword, setShowPassword] = useState(false);
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
      // Dismiss the auth modal and navigate
      if (redirect === 'PropertyDetail') {
        navigation.navigate('MainTabs', {
          screen: 'ExploreTab',
          params: { screen: 'PropertyDetail', params: redirectParams }
        });
      } else if (redirect) {
        navigation.navigate(redirect, redirectParams);
      } else {
        navigation.navigate('MainTabs', { screen: 'ExploreTab' });
      }
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
        
        {/* Top Left Header (simulate logo) */}
        <View style={styles.topLeftHeader}>
          <View style={styles.smallLogoPlaceholder}>
             <Image source={require('../../../assets/app-logo.jpeg')} style={{ width: '100%', height: '100%', borderRadius: 6 }} resizeMode="cover" />
          </View>
          <Text style={styles.topLeftText}>Properties for Rentz</Text>
        </View>

        <View style={styles.header}>
          {/* Main Logo */}
          <View style={styles.mainLogoPlaceholder}>
             <Image source={require('../../../assets/app-logo.jpeg')} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your Properties for Rentz account</Text>
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
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={colors.textPlaceholder}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
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
  container: { flex: 1, backgroundColor: '#f7f4f0' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 100, paddingBottom: 40 },
  topLeftHeader: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallLogoPlaceholder: { width: 28, height: 28, backgroundColor: '#ffffff', borderRadius: 6, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  topLeftText: { fontFamily: fonts.serif, fontSize: 18, color: '#1a1815' },
  header: { marginBottom: 32, alignItems: 'center' },
  mainLogoPlaceholder: { width: 64, height: 64, backgroundColor: '#ffffff', borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20 },
  title: { fontFamily: fonts.serif, fontSize: 36, color: '#1a1815', marginBottom: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: '#1a1815', textAlign: 'center' },
  form: { backgroundColor: '#ffffff', padding: 28, borderRadius: 20, borderWidth: 1, borderColor: '#e8e2db', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  label: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#1a1815', marginBottom: 8 },
  input: { backgroundColor: '#faf9f7', borderWidth: 1, borderColor: '#e8e2db', borderRadius: 12, paddingHorizontal: 16, height: 50, fontFamily: fonts.regular, fontSize: 15, color: '#1a1815', marginBottom: 20 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#faf9f7', borderWidth: 1, borderColor: '#e8e2db', borderRadius: 12, height: 50, marginBottom: 20 },
  passwordInput: { flex: 1, paddingHorizontal: 16, height: '100%', fontFamily: fonts.regular, fontSize: 15, color: '#1a1815' },
  eyeButton: { paddingHorizontal: 16, height: '100%', justifyContent: 'center' },
  eyeIcon: { fontSize: 16 },
  button: { backgroundColor: '#1a1815', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontFamily: fonts.bold, fontSize: 15, color: '#ffffff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontFamily: fonts.regular, fontSize: 14, color: '#1a1815' },
  footerLink: { fontFamily: fonts.bold, fontSize: 14, color: '#1a1815' },
});
