import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useManager } from '../ManagerContext';

interface NewUser {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

const ManagerUsersScreen: React.FC = () => {
  const { userStats, createUser } = useManager();
  const [refreshing, setRefreshing] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    phone: '',
    role: 'TEACHER',
    status: 'ACTIVE'
  });

  const roles = [
    { label: 'Teacher', value: 'TEACHER' },
    { label: 'Parent', value: 'PARENT' },
    { label: 'HOD', value: 'HOD' },
    { label: 'Bursar', value: 'BURSAR' },
    { label: 'Counselor', value: 'GUIDANCE_COUNSELOR' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCreateUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      Alert.alert('Error', 'Please fill in name and email fields');
      return;
    }

    createUser(newUser);
    setCreateUserModal(false);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'TEACHER',
      status: 'ACTIVE'
    });
    Alert.alert('Success', 'User account created successfully');
  };

  const mockRecentUsers = [
    { id: 1, name: 'Mrs. Johnson', role: 'Teacher', action: 'Created', date: 'Jan 22', status: 'Active' },
    { id: 2, name: 'Mr. Smith', role: 'Parent', action: 'Password Reset', date: 'Jan 21', status: 'Active' },
    { id: 3, name: 'Dr. Williams', role: 'HOD', action: 'Role Updated', date: 'Jan 20', status: 'Active' },
    { id: 4, name: 'Ms. Davis', role: 'Bursar', action: 'Login Issue', date: 'Jan 19', status: 'Issue' },
  ];

  const mockPendingActions = [
    { type: 'New Account Requests', count: 5, color: '#3498db' },
    { type: 'Role Change Requests', count: 3, color: '#f39c12' },
    { type: 'Access Issues', count: 2, color: '#e74c3c' },
    { type: 'Deactivation Requests', count: 1, color: '#95a5a6' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#27ae60';
      case 'issue': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#7f8c8d';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* User Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 User Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.activeUsers}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.staffCount}</Text>
              <Text style={styles.statLabel}>Staff</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.newThisMonth}</Text>
              <Text style={styles.statLabel}>New This Month</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Parents:</Text>
              <Text style={styles.summaryValue}>{userStats.parentCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Students:</Text>
              <Text style={styles.summaryValue}>{userStats.studentCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Login Issues:</Text>
              <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>{userStats.loginIssues}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => setCreateUserModal(true)}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionLabel}>Create User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionLabel}>Search Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={styles.actionLabel}>Bulk Actions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent User Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Recent Activities</Text>
          
          {mockRecentUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userRole}>{user.role} • {user.action}</Text>
                </View>
                <View style={styles.userMeta}>
                  <Text style={styles.userDate}>{user.date}</Text>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(user.status) }]} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pending Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏳ Pending Actions</Text>
          
          {mockPendingActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.pendingCard}>
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingType}>{action.type}</Text>
                <Text style={styles.pendingDescription}>Requires your attention</Text>
              </View>
              <View style={[styles.pendingCount, { backgroundColor: action.color }]}>
                <Text style={styles.pendingCountText}>{action.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create User Modal */}
      <Modal visible={createUserModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New User</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={newUser.name}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email Address *"
              value={newUser.email}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={newUser.phone}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Role:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setRoleModal(true)}
              >
                <Text style={styles.dropdownText}>
                  {roles.find(r => r.value === newUser.role)?.label}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateUserModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateUser}
              >
                <Text style={styles.createButtonText}>Create User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Role Selection Modal */}
      <Modal visible={roleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <Text style={styles.optionsTitle}>Select Role</Text>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={styles.optionItem}
                onPress={() => {
                  setNewUser(prev => ({ ...prev, role: role.value }));
                  setRoleModal(false);
                }}
              >
                <Text style={styles.optionText}>{role.label}</Text>
                {newUser.role === role.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelOption}
              onPress={() => setRoleModal(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  userRole: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pendingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  pendingDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  pendingCount: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  createButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  optionsModal: {
    backgroundColor: '#fff',
    margin: 40,
    borderRadius: 12,
    padding: 20,
    maxHeight: '60%',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  checkmark: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },
  cancelOption: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
});

export default ManagerUsersScreen; 