import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { User, UserRole } from '../LoginScreen';

// --- Interfaces ---

interface MoreScreenOption {
  id: string;
  title: string;
  icon: string;
  screen: string;
  color: string;
}

interface SelectedRole {
    role: UserRole;
    academicYearId: number | null;
    academicYearName: string | null;
}

interface TeacherMoreScreenProps {
  user: User;
  selectedRole: SelectedRole;
  token: string;
  navigation: any;
  onLogout: () => void;
}

const TeacherMoreScreen: React.FC<TeacherMoreScreenProps> = ({
  user,
  selectedRole,
  token,
  navigation,
  onLogout,
}) => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: onLogout
        }
      ]
    );
  };

  const options: MoreScreenOption[] = [
    { id: 'profile', title: 'My Profile', icon: 'account-circle-outline', screen: 'TeacherProfile', color: '#10b981' },
    { id: 'classes', title: 'My Classes', icon: 'google-classroom', screen: 'TeacherClasses', color: '#3b82f6' },
    { id: 'settings', title: 'Settings', icon: 'cog-outline', screen: 'TeacherSettings', color: '#6366f1' },
    { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', screen: 'Help', color: '#f59e0b' },
  ];

  const renderOption = (option: MoreScreenOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionButton}
      onPress={() => navigation.navigate(option.screen, { user, token, selectedRole })}
    >
      <View style={[styles.optionIconContainer, { backgroundColor: `${option.color}20` }]}>
        <Text style={styles.optionIcon}>{option.icon}</Text>
      </View>
      <Text style={styles.optionTitle}>{option.title}</Text>
      <Text style={styles.optionArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image 
            source={{ uri: user.photo || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}` }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{selectedRole.role.replace('_', ' ')}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {options.map(renderOption)}
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },
  header: {
    backgroundColor: '#667eea',
    padding: 32,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userRole: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  optionsGrid: {
    paddingHorizontal: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  optionArrow: {
    fontSize: 20,
    color: '#94a3b8',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#fee2e2',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TeacherMoreScreen; 