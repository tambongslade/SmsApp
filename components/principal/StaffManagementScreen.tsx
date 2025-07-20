import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
} from 'react-native';
import { User } from '../LoginScreen';
import { API_BASE_URL } from '../../constants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Interfaces (Updated for Users API) ---
interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  roles: Array<{
    role: string;
    academicYearId?: number;
  }>;
  phone?: string;
  avatar: string; // URL to avatar image
  status?: string;
  createdAt: string;
}

interface StaffMetrics {
  total: number;
  teachers: number;
  admins: number;
  managers: number;
  onlineCount: number;
}

// Staff roles (excluding PARENT and STUDENT)
const STAFF_ROLES = [
  'SUPER_MANAGER',
  'MANAGER', 
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'BURSAR',
  'DISCIPLINE_MASTER',
  'TEACHER',
  'HOD'
];

// Helper function to get role-specific colors
const getRoleColor = (role: string) => {
  switch (role) {
    case 'SUPER_MANAGER':
      return { backgroundColor: '#9C27B0', color: '#fff' };
    case 'MANAGER':
      return { backgroundColor: '#673AB7', color: '#fff' };
    case 'PRINCIPAL':
      return { backgroundColor: '#3F51B5', color: '#fff' };
    case 'VICE_PRINCIPAL':
      return { backgroundColor: '#2196F3', color: '#fff' };
    case 'BURSAR':
      return { backgroundColor: '#009688', color: '#fff' };
    case 'DISCIPLINE_MASTER':
      return { backgroundColor: '#FF5722', color: '#fff' };
    case 'TEACHER':
      return { backgroundColor: '#4CAF50', color: '#fff' };
    case 'HOD':
      return { backgroundColor: '#FF9800', color: '#fff' };
    default:
      return { backgroundColor: '#757575', color: '#fff' };
  }
};

// --- Props ---
interface StaffManagementProps {
  user: User;
  token: string;
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
  academicYearId?: number | null;
}

// --- Main Component ---
const StaffManagementScreen: React.FC<StaffManagementProps> = ({ user, token, onBack, onNavigate, academicYearId }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffMetrics, setStaffMetrics] = useState<StaffMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStaffData = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First try the users endpoint to get individual staff members
      let response = await fetch(`${API_BASE_URL}/users?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      let transformedStaff: StaffMember[] = [];
      let metrics: StaffMetrics = { total: 0, teachers: 0, admins: 0, managers: 0, onlineCount: 0 };
      
      if (response.ok) {
        // If users endpoint works, use individual staff members
        const usersData = await response.json();
        console.log('🏢 Users API Response:', usersData);
        
        const users = usersData.data?.users || usersData.users || usersData.data || usersData || [];
        
        // Filter users to get only staff members (exclude PARENT role)
        const staffMembers = users.filter((user: any) => {
          // Check userRoles array instead of roles
          const hasStaffRole = user.userRoles?.some((roleObj: any) => 
            STAFF_ROLES.includes(roleObj.role)
          );
          return hasStaffRole;
        });
        
        console.log('🏢 Filtered staff members:', staffMembers);
        
        // Transform data to match our StaffMember interface
        transformedStaff = staffMembers.map((user: any) => {
          const primaryRole = user.userRoles?.find((roleObj: any) => 
            STAFF_ROLES.includes(roleObj.role)
          )?.role || 'STAFF';
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: primaryRole,
            roles: user.userRoles || [],
            phone: user.phone,
            avatar: user.photo || `https://i.pravatar.cc/150?u=${user.id}`,
            status: user.status || 'ACTIVE',
            createdAt: user.createdAt,
          };
        });
        
        console.log('🏢 Transformed staff:', transformedStaff);
        
        // Calculate metrics from individual staff data
        metrics = {
          total: transformedStaff.length,
          teachers: transformedStaff.filter(staff => staff.roles?.some((role: any) => role.role === 'TEACHER')).length,
          admins: transformedStaff.filter(staff => staff.roles?.some((role: any) => 
            ['PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DISCIPLINE_MASTER', 'HOD'].includes(role.role)
          )).length,
          managers: transformedStaff.filter(staff => staff.roles?.some((role: any) => 
            ['SUPER_MANAGER', 'MANAGER'].includes(role.role)
          )).length,
          onlineCount: transformedStaff.filter(staff => staff.status === 'ACTIVE').length,
        };
        
      } else {
        // If users endpoint fails, fall back to analytics endpoint
        console.log('🏢 Users endpoint failed, falling back to analytics endpoint');
        
        const analyticsEndpoint = academicYearId 
          ? `${API_BASE_URL}/principal/analytics/staff?academicYearId=${academicYearId}`
          : `${API_BASE_URL}/principal/analytics/staff`;
        
        const analyticsResponse = await fetch(analyticsEndpoint, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (!analyticsResponse.ok) {
          throw new Error(`HTTP error! status: ${analyticsResponse.status}`);
        }
        
        const analyticsData = await analyticsResponse.json();
        console.log('🏢 Analytics Response:', analyticsData);
        
        const roleData = analyticsData.data?.staffUtilization || [];
        
        // Create mock staff members from role summaries
        let staffIdCounter = 1;
        transformedStaff = roleData.flatMap((roleInfo: any) => {
          if (!STAFF_ROLES.includes(roleInfo.role)) return [];
          
          // Create individual staff members for each role count
          return Array.from({ length: roleInfo.count }, (_, index) => ({
            id: staffIdCounter++,
            name: `${roleInfo.role} ${index + 1}`,
            email: `${roleInfo.role.toLowerCase()}${index + 1}@school.com`,
            role: roleInfo.role,
            roles: [{ role: roleInfo.role, academicYearId }],
            phone: `+237${Math.floor(Math.random() * 1000000000)}`,
            avatar: `https://i.pravatar.cc/150?u=${staffIdCounter}`,
            status: 'active',
            createdAt: new Date().toISOString(),
          }));
        });
        
        // Use analytics metrics
        metrics = {
          total: analyticsData.data?.totalStaff || transformedStaff.length,
          teachers: analyticsData.data?.teacherCount || 0,
          admins: analyticsData.data?.administrativeStaff || 0,
          managers: roleData.find((r: any) => r.role === 'SUPER_MANAGER')?.count || 0,
          onlineCount: Math.floor(transformedStaff.length * 0.8), // Mock online count
        };
      }
      
      setStaffMetrics(metrics);
      setStaffList(transformedStaff);
      
    } catch (err) {
      console.error('❌ Failed to fetch staff data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staff data');
    } finally {
      setIsLoading(false);
    }
  }, [token, academicYearId]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffList;
    
    const query = searchQuery.toLowerCase();
    return staffList.filter(staff =>
      staff.name.toLowerCase().includes(query) ||
      staff.email.toLowerCase().includes(query) ||
      staff.role.toLowerCase().includes(query)
    );
  }, [staffList, searchQuery]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Loading Staff Data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStaffData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <KeyMetricsCard metrics={staffMetrics} />
        <StaffListCard 
          staff={filteredStaff} 
          onSearch={setSearchQuery} 
          onNavigate={onNavigate} 
          searchQuery={searchQuery}
        />
      </ScrollView>
      <FAB onPress={() => onNavigate('AddNewStaff')} />
    </SafeAreaView>
  );
};

// --- Sub-components ---

const Header: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backButtonText}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Staff Management</Text>
    <View style={{ width: 40 }} />
  </View>
);

const KeyMetricsCard: React.FC<{ metrics: StaffMetrics | null }> = ({ metrics }) => (
  <View style={styles.card}>
    <View style={styles.metricsGrid}>
      <MetricBox value={metrics?.total} label="Total Staff" />
      <MetricBox value={metrics?.teachers} label="Teachers" />
      <MetricBox value={metrics?.admins} label="Admins" />
      <MetricBox value={metrics?.managers} label="Managers" />
    </View>
  </View>
);

const MetricBox: React.FC<{ value?: number; label: string }> = ({ value = 0, label }) => (
  <View style={styles.metricBox}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const StaffListCard: React.FC<{
  staff: StaffMember[];
  onSearch: (query: string) => void;
  onNavigate: (screen: string, params?: any) => void;
  searchQuery: string;
}> = ({ staff, onSearch, onNavigate, searchQuery }) => (
  <View style={[styles.card, { flex: 1 }]}>
    <TextInput
      style={styles.searchInput}
      placeholder="Search by name or department..."
      onChangeText={onSearch}
      placeholderTextColor="#888"
    />
    <ScrollView nestedScrollEnabled>
      {staff.map(member => (
        <StaffListItem key={member.id} member={member} onNavigate={onNavigate} />
      ))}
    </ScrollView>
  </View>
);

const StaffListItem: React.FC<{ member: StaffMember; onNavigate: (screen: string, params?: any) => void }> = ({ member, onNavigate }) => (
  <TouchableOpacity style={styles.staffItem} onPress={() => onNavigate('StaffDetails', { staffId: member.id })}>
    <Image source={{ uri: member.avatar }} style={styles.avatar} />
    <View style={styles.staffInfo}>
      <Text style={styles.staffName}>{member.name}</Text>
      <Text style={styles.staffEmail}>{member.email}</Text>
      <View style={styles.rolesContainer}>
        {member.roles.map((roleObj: any, index: number) => {
          const roleColors = getRoleColor(roleObj.role);
          return (
            <View key={index} style={[styles.roleChip, { backgroundColor: roleColors.backgroundColor }]}>
              <Text style={[styles.roleText, { color: roleColors.color }]}>{roleObj.role}</Text>
            </View>
          );
        })}
      </View>
      {member.phone && (
        <Text style={styles.staffPhone}>{member.phone}</Text>
      )}
    </View>
    <View style={styles.statusContainer}>
      <View style={[styles.statusDot, { backgroundColor: member.status === 'ACTIVE' ? '#4CAF50' : '#FFC107' }]} />
      <Text style={styles.arrow}>›</Text>
    </View>
  </TouchableOpacity>
);

const FAB: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <Text style={styles.fabText}>+</Text>
  </TouchableOpacity>
);

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
  scrollViewContent: { padding: 16, paddingBottom: 80 },
  
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 24, color: '#0056b3' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricBox: { alignItems: 'center' },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: '#0056b3' },
  metricLabel: { fontSize: 14, color: '#666', marginTop: 4 },
  
  searchInput: {
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 18, fontWeight: '700', color: '#333' },
  staffEmail: { fontSize: 14, color: '#666', marginTop: 2 },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  roleChip: {
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  staffPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  arrow: { fontSize: 24, color: '#ccc' },
  
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0056b3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
    lineHeight: 30, // to center vertically
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0056b3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StaffManagementScreen; 