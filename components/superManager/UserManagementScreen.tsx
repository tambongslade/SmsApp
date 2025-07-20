import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';

interface User {
  id: number;
  name: string;
  email: string;
  matricule: string;
  phone: string;
  status: string;
  userRoles: Array<{
    id: number;
    role: string;
    academicYearId: number | null;
  }>;
  createdAt: string;
}

interface UserManagementProps {
  token: string;
  onNavigateBack: () => void;
}

const UserManagementScreen: React.FC<UserManagementProps> = ({ token, onNavigateBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create user form state
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    dateOfBirth: '',
    phone: '',
    address: '',
    roles: [] as Array<{ role: string; academicYearId?: number }>
  });

  const roleOptions = [
    'SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 
    'DISCIPLINE_MASTER', 'TEACHER', 'HOD', 'PARENT', 'MANAGER'
  ];

  // Fetch users from API
  const fetchUsers = async (pageNum = 1, search = '', role = '') => {
    try {
      console.log('👥 Fetching users...');
      
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...(search && { name: search }),
        ...(role && { role })
      });

      const response = await fetch(`https://sms.sniperbuisnesscenter.com/api/v1/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Users API Response Status:', response.status);

      if (response.ok) {
        const apiData = await response.json();
        console.log('Users API Response:', JSON.stringify(apiData, null, 2));
        
        if (apiData.success && apiData.data && Array.isArray(apiData.data)) {
          setUsers(apiData.data);
          setTotalPages(apiData.meta?.totalPages || 1);
          console.log('✅ Successfully loaded users');
          return;
        }
      } else {
        console.log('Users API Error:', response.status);
      }
    } catch (error) {
      console.log('Users API call failed:', error);
    }

    // Fallback to mock data
    console.log('📋 Using mock users data');
    setUsers(mockUsers);
  };

  // Mock data fallback
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'John Principal',
      email: 'john@school.com',
      matricule: 'PRIN001',
      phone: '+237123456789',
      status: 'ACTIVE',
      userRoles: [{ id: 1, role: 'PRINCIPAL', academicYearId: 1 }],
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 2,
      name: 'Mary Bursar',
      email: 'mary@school.com',
      matricule: 'BURS001',
      phone: '+237987654321',
      status: 'ACTIVE',
      userRoles: [{ id: 2, role: 'BURSAR', academicYearId: 1 }],
      createdAt: '2024-01-16T00:00:00Z'
    },
    {
      id: 3,
      name: 'Paul Teacher',
      email: 'paul@school.com',
      matricule: 'TEACH001',
      phone: '+237456789123',
      status: 'ACTIVE',
      userRoles: [
        { id: 3, role: 'TEACHER', academicYearId: 1 },
        { id: 4, role: 'HOD', academicYearId: 1 }
      ],
      createdAt: '2024-01-17T00:00:00Z'
    }
  ];

  useEffect(() => {
    fetchUsers().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(1, searchQuery, selectedRole);
    setPage(1);
    setRefreshing(false);
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, searchQuery, selectedRole);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(nextPage, searchQuery, selectedRole);
    }
  };

  // Create user
  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('https://sms.sniperbuisnesscenter.com/api/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          Alert.alert('Success', 'User created successfully');
          setShowCreateModal(false);
          setCreateForm({
            name: '', email: '', password: '', gender: 'MALE', 
            dateOfBirth: '', phone: '', address: '', roles: []
          });
          handleRefresh();
          return;
        }
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      Alert.alert('Error', 'Failed to create user. Please try again.');
      console.log('Create user error:', error);
    }
  };

  // Delete user
  const handleDeleteUser = (userId: number, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const response = await fetch(`https://sms.sniperbuisnesscenter.com/api/v1/users/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'User deleted successfully');
                handleRefresh();
              } else {
                throw new Error('Failed to delete user');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user. Please try again.');
            }
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'SUPER_MANAGER': '#e74c3c',
      'PRINCIPAL': '#3498db',
      'VICE_PRINCIPAL': '#2ecc71',
      'BURSAR': '#f39c12',
      'TEACHER': '#9b59b6',
      'HOD': '#1abc9c',
      'PARENT': '#95a5a6',
      'DISCIPLINE_MASTER': '#e67e22',
      'MANAGER': '#34495e'
    };
    return colors[role] || '#7f8c8d';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text style={styles.loadingText}>Loading User Management...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterChip, selectedRole === '' && styles.filterChipActive]}
            onPress={() => { setSelectedRole(''); handleSearch(); }}
          >
            <Text style={[styles.filterChipText, selectedRole === '' && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {roleOptions.map((role) => (
            <TouchableOpacity 
              key={role}
              style={[styles.filterChip, selectedRole === role && styles.filterChipActive]}
              onPress={() => { setSelectedRole(role); handleSearch(); }}
            >
              <Text style={[styles.filterChipText, selectedRole === role && styles.filterChipTextActive]}>
                {role.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Users List */}
        {users && users.length > 0 ? (
          users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userMatricule}>📱 {user.phone} | 🆔 {user.matricule}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: user.status === 'ACTIVE' ? '#2ecc71' : '#e74c3c' }]}>
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
            </View>
            
            {/* Roles */}
            <View style={styles.rolesSection}>
              <Text style={styles.rolesLabel}>Roles:</Text>
              <View style={styles.rolesContainer}>
                {user.userRoles.map((userRole) => (
                  <View 
                    key={userRole.id} 
                    style={[styles.roleTag, { backgroundColor: getRoleColor(userRole.role) }]}
                  >
                    <Text style={styles.roleText}>{userRole.role.replace('_', ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.userActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>👁️ View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteUser(user.id, user.name)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.userDate}>Created: {formatDate(user.createdAt)}</Text>
          </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No users found</Text>
            <Text style={styles.emptyStateSubtext}>Create your first user to get started</Text>
          </View>
        )}

        {/* Load More */}
        {page < totalPages && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
            <Text style={styles.loadMoreText}>Load More Users</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Create User Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New User</Text>
            
            <ScrollView style={styles.formContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="Full Name *"
                value={createForm.name}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, name: text }))}
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Email *"
                value={createForm.email}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Password *"
                value={createForm.password}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, password: text }))}
                secureTextEntry
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Phone Number"
                value={createForm.phone}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Date of Birth (YYYY-MM-DD)"
                value={createForm.dateOfBirth}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, dateOfBirth: text }))}
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Address"
                value={createForm.address}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, address: text }))}
                multiline
              />
              
              {/* Gender Selection */}
              <Text style={styles.formLabel}>Gender:</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity 
                  style={[styles.genderOption, createForm.gender === 'MALE' && styles.genderSelected]}
                  onPress={() => setCreateForm(prev => ({ ...prev, gender: 'MALE' }))}
                >
                  <Text style={styles.genderText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderOption, createForm.gender === 'FEMALE' && styles.genderSelected]}
                  onPress={() => setCreateForm(prev => ({ ...prev, gender: 'FEMALE' }))}
                >
                  <Text style={styles.genderText}>Female</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleCreateUser}>
                <Text style={styles.modalButtonText}>Create User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#e74c3c',
  },
  filterChipText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  userMatricule: {
    fontSize: 12,
    color: '#95a5a6',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rolesSection: {
    marginBottom: 10,
  },
  rolesLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 5,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '500',
  },
  userDate: {
    fontSize: 11,
    color: '#95a5a6',
    textAlign: 'right',
  },
  loadMoreButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreText: {
    color: '#fff',
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
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: 400,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  genderSelected: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  genderText: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default UserManagementScreen; 