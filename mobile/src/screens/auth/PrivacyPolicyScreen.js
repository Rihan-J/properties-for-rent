import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../../theme';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.lastUpdated}>Last updated: April 27, 2026</Text>
        
        <Text style={styles.paragraph}>
          At Properties for Rentz, your privacy matters. This policy explains what personal information we collect,
          why we collect it, and how we keep it safe. By creating an account, you agree to the practices
          described below.
        </Text>

        <Text style={styles.sectionTitle}>Data We Collect</Text>
        <View style={styles.bulletItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Name</Text> — to personalize your account and listings</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Email address</Text> — for account login, verification, and important notifications</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Phone number</Text> — so property seekers and owners can communicate</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Property details</Text> — title, description, images, and pricing you submit as a listing owner</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.paragraph}><Text style={styles.bold}>Location data</Text> — latitude and longitude of properties, only when you explicitly provide them</Text>
        </View>

        <Text style={styles.sectionTitle}>How We Use Your Data</Text>
        <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}>To create and manage your Properties for Rentz account</Text></View>
        <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}>To display property listings on the map and search results</Text></View>
        <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}>To connect property seekers with property owners</Text></View>
        <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}>To send transactional emails</Text></View>
        <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}>To improve our services and fix technical issues</Text></View>

        <Text style={styles.sectionTitle}>Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We use the following third-party services to operate the platform:
        </Text>
        <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}><Text style={styles.bold}>Cloudinary</Text> — stores and serves property images you upload on secure servers.</Text></View>
        <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}><Text style={styles.bold}>Render</Text> — hosts our backend API servers where your data is processed.</Text></View>
        <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}><Text style={styles.bold}>Vercel</Text> — hosts our website with standard web server logging.</Text></View>
        <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}><Text style={styles.bold}>Neon (PostgreSQL)</Text> — our database provider for secure data storage.</Text></View>
        <Text style={styles.paragraph}>
          We do not sell or share your personal data with third parties for advertising or marketing purposes.
        </Text>

        <Text style={styles.sectionTitle}>Cookies & Tracking</Text>
        <Text style={styles.paragraph}>
          Our mobile application does not use cookies. We do not use advertising cookies, tracking pixels, or any third-party analytics or advertising SDKs in our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>Analytics</Text>
        <Text style={styles.paragraph}>
          We do not use any third-party analytics tools (such as Google Analytics or Firebase Analytics) in our mobile application. We may collect basic server-side logs solely for maintaining service reliability. These logs do not contain personally identifiable information.
        </Text>

        <Text style={styles.sectionTitle}>Data Security</Text>
        <Text style={styles.paragraph}>
          Your password is hashed using industry-standard bcrypt encryption and is never stored in plain text.
          All communication between your browser and our servers is encrypted via HTTPS. We do not sell,
          rent, or share your personal data with third parties for marketing purposes.
        </Text>

        <Text style={styles.sectionTitle}>Data Retention & Your Rights</Text>
        <Text style={styles.paragraph}>
          We retain your data for as long as your account is active. You can request access, correction, or deletion of your data at any time by contacting support.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions, please reach out to us at propertiesforrentz.in@gmail.com
        </Text>

        <Text style={styles.footer}>© 2026 Properties for Rentz. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f4f0' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e8e2db', ...Platform.select({ ios: { paddingTop: 40 } }) },
  backBtn: { padding: 8, marginRight: 16 },
  backBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#1a1815' },
  headerTitle: { fontFamily: fonts.serif, fontSize: 20, color: '#1a1815' },
  scroll: { padding: 24, paddingBottom: 60 },
  lastUpdated: { fontFamily: fonts.regular, fontSize: 13, color: '#8a8580', marginBottom: 16 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 22, color: '#1a1815', marginTop: 24, marginBottom: 12 },
  paragraph: { fontFamily: fonts.regular, fontSize: 15, color: '#3d3a36', lineHeight: 22, marginBottom: 12 },
  bold: { fontFamily: fonts.bold, color: '#1a1815' },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  bullet: { fontSize: 18, color: '#b5936b', marginRight: 8, marginTop: -2 },
  footer: { fontFamily: fonts.regular, fontSize: 12, color: '#9e968d', textAlign: 'center', marginTop: 40 },
});
