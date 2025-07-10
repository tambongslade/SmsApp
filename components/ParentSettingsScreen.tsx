import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, SafeAreaView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

// --- Interfaces based on parent.workflow.md ---

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

type ParentSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'ParentSettings'>;

// --- Mock Data ---

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

// --- Tab Components ---

const ProfileTab: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Profile Information</Text>
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Name</Text>
      <Text style={styles.infoValue}>{profile.name}</Text>
    </View>
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Email</Text>
      <Text style={styles.infoValue}>{profile.email}</Text>
    </View>
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Phone</Text>
      <Text style={styles.infoValue}>{profile.phone}</Text>
    </View>
    <TouchableOpacity style={styles.updateButton}>
      <Text style={styles.updateButtonText}>Update Profile</Text>
    </TouchableOpacity>
  </View>
);

const NotificationsTab: React.FC = () => {
    const [prefs, setPrefs] = useState(mockPreferences);

    const toggleSwitch = (key: keyof NotificationPreferences) => {
        setPrefs(prev => ({...prev, [key]: !prev[key]}));
    };

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Notification Preferences</Text>
            {Object.keys(prefs).map((key) => (
                <View key={key} style={styles.switchRow}>
                    <Text style={styles.switchLabel}>{key.replace(/([A-Z])/g, ' $1')}</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={prefs[key as keyof NotificationPreferences] ? "#3b82f6" : "#f4f3f4"}
                        onValueChange={() => toggleSwitch(key as keyof NotificationPreferences)}
                        value={prefs[key as keyof NotificationPreferences]}
                    />
                </View>
            ))}
             <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Preferences</Text>
            </TouchableOpacity>
        </View>
    );
};

// --- Main Component ---

type Tab = 'Profile' | 'Notifications';
const tabs: Tab[] = ['Profile', 'Notifications'];

const ParentSettingsScreen: React.FC<ParentSettingsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Profile');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : styles.tabTextInactive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'Profile' && <ProfileTab profile={mockProfile} />}
        {activeTab === 'Notifications' && <NotificationsTab />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  tabsBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#2563eb',
  },
  tabTextInactive: {
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  infoValue: {
    color: '#222',
    fontSize: 15,
    marginLeft: 8,
    marginBottom: 2,
  },
  updateButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchLabel: {
    fontSize: 15,
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ParentSettingsScreen; 