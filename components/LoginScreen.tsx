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
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { API_BASE_URL } from '../constants';

// API response types based on the actual server response
interface ApiLoginResponse {
  success: boolean;
  data?: {
    token?: string;
    expiresIn?: string;
    user?: {
      id?: number;
      name?: string;
      gender?: string;
      dateOfBirth?: string;
      photo?: string | null;
      phone?: string;
      whatsappNumber?: string | null;
      address?: string;
      email?: string;
      idCardNum?: string | null;
      matricule?: string;
      status?: string;
      totalHoursPerWeek?: number | null;
      createdAt?: string;
      updatedAt?: string;
      userRoles?: Array<{
        id?: number;
        userId?: number;
        role?: string;
        academicYearId?: number | null;
        createdAt?: string;
        updatedAt?: string;
      }>;
      // Legacy support
      profilePhoto?: string;
      roles?: Array<{
        role?: string;
        academicYearId?: number | null;
        academicYearName?: string | null;
      }>;
    };
  };
  error?: string;
  message?: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: {
    field: string;
    code: string;
  };
}

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
  id: number;
  name: string;
  email: string;
  photo: string;
  phone?: string; // Optional phone number
  roles: Array<{
    role: UserRole;
    academicYearId: number | null;
    academicYearName: string | null;
  }>;
}

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginTypeToggle, setLoginTypeToggle] = useState<'email' | 'matricule'>('email');

  const backgroundImages = [
    require('../assets/backgrounds/St.-Stephen-img12-scaled.jpg'),
    require('../assets/backgrounds/St.-Stephen-img13-scaled.jpg'),
    require('../assets/backgrounds/St.-Stephen-img15-scaled.jpg'),
    require('../assets/backgrounds/St.-Stephen-img17-scaled.jpg'),
  ];

  // Test credentials for demo purposes (fallback when API is not available)
  const TEST_CREDENTIALS: Record<string, { password: string; mockUser: User }> = {
    'super@sms.edu': {
      password: 'super123',
      mockUser: {
        id: 1,
        name: 'System Administrator',
        email: 'super@sms.edu',
        photo: '/uploads/profiles/super.jpg',
        roles: [{ role: 'SUPER_MANAGER', academicYearId: null, academicYearName: null }]
      }
    },
    'principal@sms.edu': {
      password: 'principal123',
      mockUser: {
        id: 2,
        name: 'Dr. Jane Davis',
        email: 'principal@sms.edu',
        photo: '/uploads/profiles/principal.jpg',
        roles: [{ role: 'PRINCIPAL', academicYearId: 1, academicYearName: '2024-2025' }]
      }
    },
    'teacher@sms.edu': {
      password: 'teacher123',
      mockUser: {
        id: 3,
        name: 'Ms. Elizabeth Thompson',
        email: 'teacher@sms.edu',
        photo: '/uploads/profiles/teacher.jpg',
        roles: [
          { role: 'TEACHER', academicYearId: 1, academicYearName: '2024-2025' },
          { role: 'HOD', academicYearId: 1, academicYearName: '2024-2025' }
        ]
      }
    },
    'parent@sms.edu': {
      password: 'parent123',
      mockUser: {
        id: 4,
        name: 'Johnson Family',
        email: 'parent@sms.edu',
        photo: '/uploads/profiles/parent.jpg',
        roles: [{ role: 'PARENT', academicYearId: null, academicYearName: null }]
      }
    }
  };

  // Auto-cycle through background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to convert API response to our User type
  const convertApiUserToUser = (apiUser: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
    profilePhoto?: string;
    photo?: string; // Server uses 'photo' instead of 'profilePhoto'
    userRoles?: Array<{
      id?: number;
      userId?: number;
      role?: string;
      academicYearId?: number | null;
      createdAt?: string;
      updatedAt?: string;
    }>;
    // Legacy support for different API versions
    roles?: Array<{
      role?: string;
      academicYearId?: number | null;
      academicYearName?: string | null;
    }>;
  }): User => {
    // Handle different role structures from API
    let processedRoles: Array<{
      role: UserRole;
      academicYearId: number | null;
      academicYearName: string | null;
    }> = [];

    // Try userRoles first (actual API structure)
    if (apiUser.userRoles && Array.isArray(apiUser.userRoles)) {
      processedRoles = apiUser.userRoles
        .filter(roleObj => roleObj.role) // Filter out roles without a role field
        .map((roleObj) => ({
          role: roleObj.role as UserRole,
          academicYearId: roleObj.academicYearId || null,
          academicYearName: null, // Server doesn't provide year name in this structure
        }));
    }
    // Fallback to legacy roles structure
    else if (apiUser.roles && Array.isArray(apiUser.roles)) {
      processedRoles = apiUser.roles
        .filter(role => role.role) // Filter out roles without a role field
        .map((role) => ({
          role: role.role as UserRole,
          academicYearId: role.academicYearId || null,
          academicYearName: role.academicYearName || null,
        }));
    }

    return {
      id: apiUser.id || 0,
      name: apiUser.name || 'Unknown User',
      email: apiUser.email || '',
      photo: apiUser.photo || apiUser.profilePhoto || '/uploads/profiles/default.jpg',
      phone: apiUser.phone,
      roles: processedRoles
    };
  };

  // Real API login function
  const apiLogin = async (loginData: { email: string; password: string }): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [loginTypeToggle]: loginData.email, // Use either 'email' or 'matricule' based on toggle
          password: loginData.password,
        }),
      });

      // Log the response for debugging
      console.log('Login API Response Status:', response.status);
      
      const apiData = await response.json();
      console.log('Login API Response Data:', JSON.stringify(apiData, null, 2));

      if (!response.ok) {
        return {
          success: false,
          error: apiData?.error || apiData?.message || `HTTP error! status: ${response.status}`
        };
      }

      // Handle different API response structures
      if (!apiData) {
        return {
          success: false,
          error: 'Empty response from server'
        };
      }

      // Convert API response to our expected format
      if (apiData.success && apiData.data) {
        // Add additional safety checks
        if (!apiData.data.user) {
          console.log('API response missing user data');
          return {
            success: false,
            error: 'Invalid response: missing user data'
          };
        }

        if (!apiData.data.token) {
          console.log('API response missing token');
          return {
            success: false,
            error: 'Invalid response: missing authentication token'
          };
        }

        try {
          const convertedUser = convertApiUserToUser(apiData.data.user);
          console.log('Converted User:', JSON.stringify(convertedUser, null, 2));
          
          return {
            success: true,
            data: {
              token: apiData.data.token,
              user: convertedUser
            }
          };
        } catch (conversionError) {
          console.log('Error converting user data:', conversionError);
          return {
            success: false,
            error: 'Failed to process user data'
          };
        }
      }

      return {
        success: false,
        error: 'Invalid response structure from server'
      };

    } catch (error) {
      // If API fails, fall back to mock implementation for demo
      console.log('API call failed, using mock data for demo:', error);
      return mockApiLogin(loginData);
    }
  };

  // Fallback mock API for demo purposes
  const mockApiLogin = async (loginData: { email: string; password: string }): Promise<LoginResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const credentials = TEST_CREDENTIALS[loginData.email?.toLowerCase() || ''];
    
    if (!credentials || credentials.password !== loginData.password) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    return {
      success: true,
      data: {
        token: 'mock_jwt_token_' + Date.now(),
        user: credentials.mockUser
      }
    };
  };

  const validateInputs = (): boolean => {
    if (!email.trim()) {
      Alert.alert('Validation Error', `Please enter your ${loginTypeToggle}`);
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password');
      return false;
    }

    if (loginTypeToggle === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      const loginData = {
        email: (email || '').toLowerCase().trim(),
        password: (password || '').trim()
      };

      const response = await apiLogin(loginData);

      if (!response.success || !response.data) {
        Alert.alert('Login Failed', response.error || 'An error occurred during login');
        return;
      }

      const { token, user } = response.data;

      // Store token in AsyncStorage for API calls
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      // Handle different authentication flows based on user roles
      if (user.roles.length === 1) {
        const userRole = user.roles[0];
        
        // Single role - check if academic year selection is needed
        if (userRole.role === 'SUPER_MANAGER' || userRole.role === 'PARENT') {
          // Global roles - go directly to dashboard
          navigation.navigate('Dashboard', { user, selectedRole: userRole, token });
        } else {
          // Role requires academic year - go to academic year selection
          navigation.navigate('AcademicYearSelection', { user, selectedRole: userRole, token });
        }
      } else {
        // Multiple roles - go to role selection
        navigation.navigate('RoleSelection', { user, token });
      }

    } catch (error) {
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = (testEmail: string) => {
    const credentials = TEST_CREDENTIALS[testEmail];
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

          {/* Login Form */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Sign In</Text>
            
            {/* Login Type Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, loginTypeToggle === 'email' && styles.toggleButtonActive]}
                onPress={() => setLoginTypeToggle('email')}
              >
                <Text style={[styles.toggleText, loginTypeToggle === 'email' && styles.toggleTextActive]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, loginTypeToggle === 'matricule' && styles.toggleButtonActive]}
                onPress={() => setLoginTypeToggle('matricule')}
              >
                <Text style={[styles.toggleText, loginTypeToggle === 'matricule' && styles.toggleTextActive]}>
                  Matricule
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>
                {loginTypeToggle === 'email' ? '📧' : '🆔'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={loginTypeToggle === 'email' ? 'Email Address' : 'Matricule Number'}
                placeholderTextColor="#bdc3c7"
                value={email}
                onChangeText={setEmail}
                keyboardType={loginTypeToggle === 'email' ? 'email-address' : 'default'}
                autoCapitalize="none"
                editable={!isLoading}
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
                editable={!isLoading}
              />
            </View>

            {/* Remember Me Checkbox */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkboxIcon}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.loadingText}>Signing In...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Test Accounts Button */}
            {/* <TouchableOpacity 
              style={styles.testAccountsButton}
              onPress={() => setShowTestAccounts(true)}
              disabled={isLoading}
            >
              <Text style={styles.testAccountsButtonText}>🔑 Quick Login (Test Accounts)</Text>
            </TouchableOpacity> */}
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
              {Object.entries(TEST_CREDENTIALS).map(([testEmail, credentials]) => (
                <TouchableOpacity
                  key={testEmail}
                  style={[styles.accountItem, { borderLeftColor: getRoleColor(credentials.mockUser.roles[0].role) }]}
                  onPress={() => handleTestLogin(testEmail)}
                >
                  <Text style={styles.accountIcon}>{getRoleIcon(credentials.mockUser.roles[0].role)}</Text>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountRole}>
                      {credentials.mockUser.roles[0].role.replace(/_/g, ' ')}
                      {credentials.mockUser.roles.length > 1 && ` (+${credentials.mockUser.roles.length - 1} more)`}
                    </Text>
                    <Text style={styles.accountName}>{credentials.mockUser.name}</Text>
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f2f6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#3498db',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  toggleTextActive: {
    color: '#fff',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3498db',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#7f8c8d',
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
  loginButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
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