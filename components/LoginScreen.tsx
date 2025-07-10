import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

// Define user roles and test credentials
const USER_CREDENTIALS: Record<string, { password: string; role: UserRole; name: string }> = {
  // Super Manager
  'super@sms.edu': { password: 'super123', role: 'SUPER_MANAGER', name: 'System Administrator' },
  
  // Principal
  'principal@sms.edu': { password: 'principal123', role: 'PRINCIPAL', name: 'Dr. Jane Davis' },
  
  // Vice Principal
  'vp@sms.edu': { password: 'vp123', role: 'VICE_PRINCIPAL', name: 'Mrs. Sarah Wilson' },
  
  // Teacher
  'teacher@sms.edu': { password: 'teacher123', role: 'TEACHER', name: 'Ms. Elizabeth Thompson' },
  
  // Bursar
  'bursar@sms.edu': { password: 'bursar123', role: 'BURSAR', name: 'Mr. John Finance' },
  
  // Discipline Master
  'discipline@sms.edu': { password: 'discipline123', role: 'DISCIPLINE_MASTER', name: 'Mr. David Security' },
  
  // Guidance Counselor
  'counselor@sms.edu': { password: 'counselor123', role: 'GUIDANCE_COUNSELOR', name: 'Dr. Mary Support' },
  
  // Manager
  'manager@sms.edu': { password: 'manager123', role: 'MANAGER', name: 'Mr. Strategic Overview' },
  
  // Head of Department
  'hod@sms.edu': { password: 'hod123', role: 'HOD', name: 'Prof. Academic Head' },
  
  // Parent
  'parent@sms.edu': { password: 'parent123', role: 'PARENT', name: 'Johnson Family' },
};

export type UserRole = 
  | 'SUPER_MANAGER' 
  | 'PRINCIPAL' 
  | 'VICE_PRINCIPAL' 
  | 'TEACHER' 
  | 'BURSAR' 
  | 'DISCIPLINE_MASTER' 
  | 'GUIDANCE_COUNSELOR' 
  | 'MANAGER' 
  | 'HOD' 
  | 'PARENT';

export interface User {
  email: string;
  role: UserRole;
  name: string;
}

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ route }) => {
  const { onLoginSuccess } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  const backgroundImages = [
    require('../assets/backgrounds/St.-Stephen-img12-scaled.jpg'),
    require('../assets/backgrounds/St.-Stephen-img13-scaled.jpg'),
    require('../assets/backgrounds/St.-Stephen-img15-scaled.jpg'),
    require('../assets/backgrounds/St.-Stephen-img17-scaled.jpg'),
  ];

  // Auto-cycle through background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const credentials = USER_CREDENTIALS[email.toLowerCase()];
    
    if (!credentials || credentials.password !== password) {
      Alert.alert('Error', 'Invalid email or password');
      return;
    }

    const user: User = {
      email: email.toLowerCase(),
      role: credentials.role,
      name: credentials.name,
    };

    onLoginSuccess(user);
  };

  const handleTestLogin = (testEmail: string) => {
    const credentials = USER_CREDENTIALS[testEmail];
    setEmail(testEmail);
    setPassword(credentials.password);
    setShowTestAccounts(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SUPER_MANAGER': return '🎯';
      case 'PRINCIPAL': return '👨‍💼';
      case 'VICE_PRINCIPAL': return '👩‍💼';
      case 'TEACHER': return '👨‍🏫';
      case 'BURSAR': return '💰';
      case 'DISCIPLINE_MASTER': return '🛡️';
      case 'GUIDANCE_COUNSELOR': return '🧭';
      case 'MANAGER': return '📊';
      case 'HOD': return '🎓';
      case 'PARENT': return '👨‍👩‍👧‍👦';
      default: return '👤';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_MANAGER': return '#e74c3c';
      case 'PRINCIPAL': return '#2c3e50';
      case 'VICE_PRINCIPAL': return '#34495e';
      case 'TEACHER': return '#3498db';
      case 'BURSAR': return '#f39c12';
      case 'DISCIPLINE_MASTER': return '#e67e22';
      case 'GUIDANCE_COUNSELOR': return '#9b59b6';
      case 'MANAGER': return '#1abc9c';
      case 'HOD': return '#2ecc71';
      case 'PARENT': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  return (
    <ImageBackground 
      source={backgroundImages[currentImageIndex]} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.schoolName}>St. Stephen School</Text>
            <Text style={styles.systemTitle}>Management System</Text>
            <Text style={styles.subtitle}>Complete School Administration Platform</Text>
          </View>

          {/* Login Form - Compact Version */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Sign In</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#bdc3c7"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#bdc3c7"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Test Accounts Button */}
            <TouchableOpacity 
              style={styles.testAccountsButton}
              onPress={() => setShowTestAccounts(true)}
            >
              <Text style={styles.testAccountsButtonText}>🔑 Quick Login (Test Accounts)</Text>
            </TouchableOpacity>
          </View>

          {/* Image Indicators */}
          <View style={styles.indicators}>
            {backgroundImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>St. Stephen School Management System v2.0</Text>
            <Text style={styles.footerSubtext}>Multi-Role Administrative Platform</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Test Accounts Modal */}
      <Modal
        visible={showTestAccounts}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTestAccounts(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Test Accounts</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowTestAccounts(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.accountsList} showsVerticalScrollIndicator={false}>
              <Text style={styles.accountsSubtitle}>Tap any account to auto-fill credentials</Text>
              {Object.entries(USER_CREDENTIALS).map(([testEmail, credentials]) => (
                <TouchableOpacity
                  key={testEmail}
                  style={[styles.accountItem, { borderLeftColor: getRoleColor(credentials.role) }]}
                  onPress={() => handleTestLogin(testEmail)}
                >
                  <Text style={styles.accountIcon}>{getRoleIcon(credentials.role)}</Text>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountRole}>{credentials.role.replace(/_/g, ' ')}</Text>
                    <Text style={styles.accountName}>{credentials.name}</Text>
                    <Text style={styles.accountEmail}>{testEmail}</Text>
                  </View>
                  <Text style={styles.loginArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  schoolName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  systemTitle: {
    fontSize: 22,
    color: '#ecf0f1',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc3c7',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loginContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2c3e50',
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testAccountsButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
  },
  testAccountsButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#ecf0f1',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  footerSubtext: {
    color: '#bdc3c7',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  accountsList: {
    maxHeight: 400,
  },
  accountsSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  accountIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  accountInfo: {
    flex: 1,
  },
  accountRole: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  accountName: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 3,
  },
  accountEmail: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  loginArrow: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default LoginScreen; 