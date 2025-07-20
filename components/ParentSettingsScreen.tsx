import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Switch, 
  SafeAreaView, 
  StyleSheet, 
  Alert,
  Dimensions,
  Platform 
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const { width } = Dimensions.get('window');

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  academicUpdates: boolean;
  feeReminders: boolean;
  disciplineAlerts: boolean;
  marketingMessages: boolean;
}

type ParentSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'ParentSettings'> & {
  onLogout?: () => void;
};

const mockProfile: UserProfile = {
  name: 'Mr. John Doe',
  email: 'john.doe@email.com',
  phone: '677123456',
  whatsapp: '677123456',
  address: '123 Main Street, Douala',
};

const mockPreferences: NotificationPreferences = {
  email: true,
  sms: true,
  academicUpdates: true,
  feeReminders: true,
  disciplineAlerts: true,
  marketingMessages: false,
};

const ParentSettingsScreen: React.FC<ParentSettingsScreenProps> = ({ navigation, onLogout }) => {
  const [profile, setProfile] = useState(mockProfile);
  const [preferences, setPreferences] = useState(mockPreferences);
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            if (onLogout) {
              onLogout();
            } else {
              navigation.navigate('Login');
            }
          }
        }
      ]
    );
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleSavePreferences = () => {
    Alert.alert('Success', 'Notification preferences saved!');
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateProfile = (key: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const settingsOptions = [
    { id: 'help', title: 'Help & Support', icon: '❓', color: '#4facfe' },
    { id: 'privacy', title: 'Privacy Policy', icon: '🔒', color: '#43e97b' },
    { id: 'terms', title: 'Terms of Service', icon: '📋', color: '#f093fb' },
    { id: 'about', title: 'About App', icon: 'ℹ️', color: '#667eea' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerRight} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Profile Information</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{profile.name.charAt(0)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileEmail}>{profile.email}</Text>
              </View>
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            {isEditing && (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.name}
                    onChangeText={(text) => updateProfile('name', text)}
                    placeholder="Enter your name"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.email}
                    onChangeText={(text) => updateProfile('email', text)}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.phone}
                    onChangeText={(text) => updateProfile('phone', text)}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>WhatsApp</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.whatsapp}
                    onChangeText={(text) => updateProfile('whatsapp', text)}
                    placeholder="Enter your WhatsApp number"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.address}
                    onChangeText={(text) => updateProfile('address', text)}
                    placeholder="Enter your address"
                    multiline
                  />
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          <View style={styles.notificationCard}>
            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Email Notifications</Text>
                <Text style={styles.notificationSubtitle}>Receive updates via email</Text>
              </View>
              <Switch
                trackColor={{ false: "#e2e8f0", true: "#667eea" }}
                thumbColor={preferences.email ? "#ffffff" : "#f4f3f4"}
                onValueChange={() => togglePreference('email')}
                value={preferences.email}
              />
            </View>
            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>SMS Notifications</Text>
                <Text style={styles.notificationSubtitle}>Get alerts via SMS</Text>
              </View>
              <Switch
                trackColor={{ false: "#e2e8f0", true: "#667eea" }}
                thumbColor={preferences.sms ? "#ffffff" : "#f4f3f4"}
                onValueChange={() => togglePreference('sms')}
                value={preferences.sms}
              />
            </View>
            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Academic Updates</Text>
                <Text style={styles.notificationSubtitle}>Grades and attendance alerts</Text>
              </View>
              <Switch
                trackColor={{ false: "#e2e8f0", true: "#667eea" }}
                thumbColor={preferences.academicUpdates ? "#ffffff" : "#f4f3f4"}
                onValueChange={() => togglePreference('academicUpdates')}
                value={preferences.academicUpdates}
              />
            </View>
            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Fee Reminders</Text>
                <Text style={styles.notificationSubtitle}>Payment due notifications</Text>
              </View>
              <Switch
                trackColor={{ false: "#e2e8f0", true: "#667eea" }}
                thumbColor={preferences.feeReminders ? "#ffffff" : "#f4f3f4"}
                onValueChange={() => togglePreference('feeReminders')}
                value={preferences.feeReminders}
              />
            </View>
            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Discipline Alerts</Text>
                <Text style={styles.notificationSubtitle}>Important behavior notifications</Text>
              </View>
              <Switch
                trackColor={{ false: "#e2e8f0", true: "#667eea" }}
                thumbColor={preferences.disciplineAlerts ? "#ffffff" : "#f4f3f4"}
                onValueChange={() => togglePreference('disciplineAlerts')}
                value={preferences.disciplineAlerts}
              />
            </View>
            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Marketing Messages</Text>
                <Text style={styles.notificationSubtitle}>Promotional updates</Text>
              </View>
              <Switch
                trackColor={{ false: "#e2e8f0", true: "#667eea" }}
                thumbColor={preferences.marketingMessages ? "#ffffff" : "#f4f3f4"}
                onValueChange={() => togglePreference('marketingMessages')}
                value={preferences.marketingMessages}
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePreferences}>
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ More Options</Text>
          <View style={styles.optionsCard}>
            {settingsOptions.map((option) => (
              <TouchableOpacity key={option.id} style={styles.optionItem}>
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
                    <Text style={styles.optionIconText}>{option.icon}</Text>
                  </View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          ))}
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.logoutCard}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoText}>School Management System</Text>
          <Text style={styles.appVersionText}>Version 1.0.0</Text>
      </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    backgroundColor: '#667eea',
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  editButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  editForm: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  optionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 18,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  optionArrow: {
    fontSize: 18,
    color: '#94a3b8',
  },
  logoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  appVersionText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ParentSettingsScreen; 