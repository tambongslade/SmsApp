import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { User } from '../LoginScreen';

interface HODDashboardProps { user: User; onLogout: () => void; onNavigate: (screen: string) => void; }

const HODDashboard: React.FC<HODDashboardProps> = ({ user, onLogout }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2ecc71" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎓 Head of Department</Text>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>HOD Dashboard</Text>
        <Text style={styles.submessage}>Department-specific management</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#2ecc71', padding: 20, flexDirection: 'row', alignItems: 'center' },
  headerContent: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  welcomeText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginTop: 5 },
  logoutButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  logoutIcon: { fontSize: 20 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  message: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
  submessage: { fontSize: 14, color: '#7f8c8d', textAlign: 'center', marginTop: 10 },
});

export default HODDashboard; 