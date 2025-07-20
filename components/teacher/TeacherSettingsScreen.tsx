import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  TextInput,
  Switch,
} from 'react-native';
import { User, UserRole } from '../LoginScreen';

// --- Interfaces ---

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

interface NotificationPreferences {
  newGrades: boolean;
  parentMessages: boolean;
  quizSubmissions: boolean;
}

interface TeacherSettingsScreenProps {
  route: any;
  navigation: any;
  onLogout: () => void;
}

const TeacherSettingsScreen: React.FC<TeacherSettingsScreenProps> = ({
  route,
  navigation,
  onLogout,
}) => {
  const { user, token, selectedRole } = route.params as { user: User, token: string, selectedRole: any };
  
  const [profile, setProfile] = useState<UserProfile>({
    name: user.name,
    email: user.email,
    phone: user.phone || 'N/A',
  });
  
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    newGrades: true,
    parentMessages: true,
    quizSubmissions: false,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = () => {
    // TODO: API call to save profile
    console.log('Saving profile:', profile);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully.');
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    // TODO: API call to save preference
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: user.photo || `https://ui-avatars.com/api/?name=${profile.name.replace(' ', '+')}` }} 
            style={styles.avatar} 
          />
          {!isEditing ? (
            <>
              <Text style={styles.userName}>{profile.name}</Text>
              <Text style={styles.userEmail}>{profile.email}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.editForm}>
              <TextInput style={styles.input} value={profile.name} onChangeText={text => setProfile(p => ({...p, name: text}))} />
              <TextInput style={styles.input} value={profile.email} onChangeText={text => setProfile(p => ({...p, email: text}))} keyboardType="email-address" />
              <TextInput style={styles.input} value={profile.phone} onChangeText={text => setProfile(p => ({...p, phone: text}))} keyboardType="phone-pad" />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>New Grades Submitted</Text>
            <Switch value={prefs.newGrades} onValueChange={() => togglePreference('newGrades')} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>New Parent Messages</Text>
            <Switch value={prefs.parentMessages} onValueChange={() => togglePreference('parentMessages')} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Quiz Submissions</Text>
            <Switch value={prefs.quizSubmissions} onValueChange={() => togglePreference('quizSubmissions')} />
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Change Password</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={onLogout}>
            <Text style={[styles.settingLabel, {color: '#ef4444'}]}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#667eea',
    paddingVertical: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  scrollView: { flex: 1 },
  profileSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 24,
    margin: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginTop: -40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#667eea',
    marginBottom: 12,
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  userEmail: { fontSize: 16, color: '#64748b', marginTop: 4, marginBottom: 16 },
  editButton: {
    backgroundColor: '#667eea15',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: { color: '#667eea', fontWeight: 'bold' },
  editForm: { width: '100%' },
  input: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLabel: { fontSize: 16, color: '#334155' },
  arrow: { fontSize: 20, color: '#94a3b8' },
});

export default TeacherSettingsScreen; 