/**
 * RegisterScreen — user and owner registration.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import Toast from '../../components/Toast';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { register } = useAuth();

  const redirect = route.params?.redirect;
  const redirectParams = route.params?.params;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      setErrorMsg('Please fill all fields');
      return;
    }
    
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email, password, phone, accepted_terms: agreeTerms };
      await register(name, email, password, 'user', phone, true);
      // Dismiss the auth modal and navigate
      if (redirect === 'PropertyDetail') {
        navigation.getParent()?.goBack();
      } else if (redirect) {
        navigation.getParent()?.goBack();
        navigation.getParent()?.navigate(redirect, redirectParams);
      } else {
        navigation.getParent()?.goBack();
        navigation.getParent()?.navigate('MainTabs', { screen: 'ExploreTab' });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.scroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraHeight={100}
        extraScrollHeight={20}
      >
        
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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join Properties for Rentz to find or list properties</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor="#b8b0a6"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#b8b0a6"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Strong password"
              placeholderTextColor="#b8b0a6"
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
          <Text style={styles.helperText}>Must include uppercase, lowercase, number, and special character.</Text>

          <Text style={styles.label}>PHONE NUMBER</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +919876543210"
            placeholderTextColor="#b8b0a6"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />



          {/* Terms Checkbox */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, agreeTerms && styles.checkboxChecked]} 
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              {agreeTerms && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>I agree to the </Text>
              <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync('https://properties-for-rent.vercel.app/privacy')}>
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <Toast message={errorMsg} visible={!!errorMsg} type="error" onHide={() => setErrorMsg('')} />
    </View>
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
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#faf9f7', borderWidth: 1, borderColor: '#e8e2db', borderRadius: 12, height: 50, marginBottom: 8 },
  passwordInput: { flex: 1, paddingHorizontal: 16, height: '100%', fontFamily: fonts.regular, fontSize: 15, color: '#1a1815' },
  eyeButton: { paddingHorizontal: 16, height: '100%', justifyContent: 'center' },
  eyeIcon: { fontSize: 16 },
  helperText: { fontFamily: fonts.regular, fontSize: 12, color: '#8a8580', marginBottom: 20, lineHeight: 16 },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  roleBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e8e2db', alignItems: 'center', backgroundColor: '#faf9f7', height: 90, justifyContent: 'center' },
  roleBtnActive: { borderColor: '#b5936b', backgroundColor: '#fdfbf9' },
  roleEmoji: { fontSize: 24, marginBottom: 8 },
  roleBtnText: { fontFamily: fonts.bold, fontSize: 13, color: '#1a1815' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: '#8a8580', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: '#1a1815', borderColor: '#1a1815' },
  checkIcon: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  termsTextContainer: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  termsText: { fontFamily: fonts.regular, fontSize: 14, color: '#3d3a36' },
  termsLink: { fontFamily: fonts.bold, fontSize: 14, color: '#b5936b', textDecorationLine: 'underline' },
  button: { backgroundColor: '#1a1815', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontFamily: fonts.bold, fontSize: 15, color: '#ffffff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontFamily: fonts.regular, fontSize: 14, color: '#1a1815' },
  footerLink: { fontFamily: fonts.bold, fontSize: 14, color: '#1a1815' },
});
