import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { UserRole } from './LoginScreen';
import { API_BASE_URL } from '../constants';

type RoleSelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'RoleSelection'>;

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ route, navigation }) => {
  const { user, token } = route.params;

  const handleRoleSelect = async (selectedRole: { role: UserRole; academicYearId: number | null; academicYearName: string | null }) => {
    try {
      // Try to make API call to select role
      try {
        const response = await fetch(`${API_BASE_URL}/auth/select-role`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: selectedRole.role,
            academicYearId: selectedRole.academicYearId
          }),
        });

        if (response.ok) {
          const apiData = await response.json();
          
          if (apiData.success && apiData.data) {
            // Store the updated token if provided
            const sessionToken = apiData.data.sessionToken || token;
            await AsyncStorage.setItem('authToken', sessionToken);
            
            if (apiData.data.nextStep === 'academic-year-selection') {
              // Role requires academic year selection
              navigation.navigate('AcademicYearSelection', { 
                user, 
                selectedRole: apiData.data.selectedRole || selectedRole, 
                token: sessionToken 
              });
            } else {
              // Go directly to dashboard
              navigation.navigate('Dashboard', { 
                user, 
                selectedRole: apiData.data.selectedRole || selectedRole, 
                token: sessionToken 
              });
            }
            return;
          }
        }
      } catch (apiError) {
        console.log('API call failed, proceeding with local logic:', apiError);
      }
      
      // Fallback to local logic
      if (selectedRole.role === 'SUPER_MANAGER' || selectedRole.role === 'PARENT') {
        // Global roles - go directly to dashboard
        navigation.navigate('Dashboard', { user, selectedRole, token });
      } else {
        // Role requires academic year selection
        navigation.navigate('AcademicYearSelection', { user, selectedRole, token });
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to select role. Please try again.');
    }
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

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'SUPER_MANAGER': return 'Complete system administration';
      case 'PRINCIPAL': return 'School-wide oversight and management';
      case 'VICE_PRINCIPAL': return 'Student affairs and enrollment';
      case 'TEACHER': return 'Classroom teaching and student assessment';
      case 'BURSAR': return 'Financial management and fee collection';
      case 'DISCIPLINE_MASTER': return 'Student discipline and behavior management';
      case 'GUIDANCE_COUNSELOR': return 'Student counseling and support';
      case 'MANAGER': return 'Administrative operations and coordination';
      case 'HOD': return 'Department leadership and curriculum oversight';
      case 'PARENT': return 'Monitor children\'s academic progress';
      default: return 'Access school management features';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.profileImageContainer}>
            {user.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>
          You have access to {user.roles.length} role{user.roles.length > 1 ? 's' : ''}. 
          Please choose how you'd like to proceed.
        </Text>

        <ScrollView style={styles.rolesList} showsVerticalScrollIndicator={false}>
          {user.roles.map((role, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.roleCard, { borderLeftColor: getRoleColor(role.role) }]}
              onPress={() => handleRoleSelect(role)}
              activeOpacity={0.7}
            >
              <View style={styles.roleContent}>
                <View style={styles.roleHeader}>
                  <Text style={styles.roleIcon}>{getRoleIcon(role.role)}</Text>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>
                      {role.role.replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.roleDescription}>
                      {getRoleDescription(role.role)}
                    </Text>
                    {role.academicYearName && (
                      <Text style={styles.academicYear}>
                        Academic Year: {role.academicYearName}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.selectArrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutButtonText}>🚪 Return to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#95a5a6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  rolesList: {
    flex: 1,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  roleDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 5,
  },
  academicYear: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  selectArrow: {
    fontSize: 24,
    color: '#3498db',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  logoutButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoleSelectionScreen; 