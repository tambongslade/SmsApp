import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { User } from '../LoginScreen';

interface Staff {
  id: string;
  name: string;
  role: 'Super Manager' | 'Manager' | 'Principal' | 'Vice Principal' | 'Teacher' | 'Bursar' | 'Discipline Master' | 'Guidance Counselor';
  email: string;
  phone: string;
  department?: string;
  subjects?: string[];
  classes?: string[];
  permissions: string[];
  hireDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  picture?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  assignedTeachers: string[];
}

interface Class {
  id: string;
  name: string;
  subClasses: string[];
  assignedTeachers: { [subject: string]: string[] };
}

interface PrincipalDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'roles' | 'assignments' | 'permissions'>('overview');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Sample data - in real app, this would come from your backend
  const [staffMembers, setStaffMembers] = useState<Staff[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'Vice Principal',
      email: 'sarah.johnson@school.edu',
      phone: '+237-123-456-789',
      department: 'Administration',
      permissions: ['view_reports', 'manage_teachers', 'generate_report_cards'],
      hireDate: '2020-01-15',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Mr. David Wilson',
      role: 'Teacher',
      email: 'david.wilson@school.edu',
      phone: '+237-987-654-321',
      department: 'Science',
      subjects: ['Mathematics', 'Physics'],
      classes: ['Form 1A', 'Form 2B'],
      permissions: ['create_exams', 'enter_marks', 'view_students'],
      hireDate: '2019-09-01',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Mrs. Elizabeth Thompson',
      role: 'Teacher',
      email: 'elizabeth.thompson@school.edu',
      phone: '+237-555-123-456',
      department: 'Mathematics',
      subjects: ['Mathematics', 'Statistics'],
      classes: ['Form 3A', 'Form 3B'],
      permissions: ['create_exams', 'enter_marks', 'view_students'],
      hireDate: '2018-03-10',
      status: 'Active',
    },
    {
      id: '4',
      name: 'Mr. James Brown',
      role: 'Bursar',
      email: 'james.brown@school.edu',
      phone: '+237-777-888-999',
      department: 'Finance',
      permissions: ['manage_fees', 'create_students', 'view_payments'],
      hireDate: '2021-06-01',
      status: 'Active',
    },
    {
      id: '5',
      name: 'Ms. Mary Davis',
      role: 'Discipline Master',
      email: 'mary.davis@school.edu',
      phone: '+237-444-555-666',
      department: 'Administration',
      permissions: ['record_attendance', 'manage_discipline', 'view_students'],
      hireDate: '2020-08-15',
      status: 'Active',
    },
  ]);

  const [subjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', code: 'MATH', department: 'Science', assignedTeachers: ['2', '3'] },
    { id: '2', name: 'Physics', code: 'PHY', department: 'Science', assignedTeachers: ['2'] },
    { id: '3', name: 'Chemistry', code: 'CHEM', department: 'Science', assignedTeachers: [] },
    { id: '4', name: 'English Language', code: 'ENG', department: 'Languages', assignedTeachers: [] },
    { id: '5', name: 'French', code: 'FR', department: 'Languages', assignedTeachers: [] },
  ]);

  const [classes] = useState<Class[]>([
    { 
      id: '1', 
      name: 'Form 1', 
      subClasses: ['Form 1A', 'Form 1B'], 
      assignedTeachers: { 'Mathematics': ['2'], 'Physics': ['2'] }
    },
    { 
      id: '2', 
      name: 'Form 2', 
      subClasses: ['Form 2A', 'Form 2B'], 
      assignedTeachers: { 'Mathematics': ['2'], 'Physics': ['2'] }
    },
    { 
      id: '3', 
      name: 'Form 3', 
      subClasses: ['Form 3A', 'Form 3B'], 
      assignedTeachers: { 'Mathematics': ['3'] }
    },
  ]);

  const rolePermissions = {
    'Super Manager': ['all_permissions'],
    'Manager': ['manage_finances', 'view_all_data', 'modify_settings'],
    'Principal': ['manage_teachers', 'generate_reports', 'assign_subjects', 'view_all_data'],
    'Vice Principal': ['manage_teachers', 'generate_reports', 'assign_subjects', 'view_students'],
    'Teacher': ['create_exams', 'enter_marks', 'view_students', 'communicate'],
    'Bursar': ['manage_fees', 'create_students', 'view_payments'],
    'Discipline Master': ['record_attendance', 'manage_discipline', 'view_students'],
    'Guidance Counselor': ['add_remarks', 'view_students', 'communicate'],
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      'Super Manager': '👑',
      'Manager': '🏢',
      'Principal': '👨‍💼',
      'Vice Principal': '👩‍💼',
      'Teacher': '👩‍🏫',
      'Bursar': '💰',
      'Discipline Master': '⚖️',
      'Guidance Counselor': '🤝',
    };
    return icons[role as keyof typeof icons] || '👤';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#2ecc71';
      case 'Inactive': return '#e74c3c';
      case 'On Leave': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{staffMembers.length}</Text>
          <Text style={styles.statLabel}>Total Staff</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{staffMembers.filter(s => s.role === 'Teacher').length}</Text>
          <Text style={styles.statLabel}>Teachers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{staffMembers.filter(s => s.status === 'Active').length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{subjects.length}</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddStaff(true)}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Staff</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('assignments')}>
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.actionText}>Assign Subjects</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('permissions')}>
            <Text style={styles.actionIcon}>🔐</Text>
            <Text style={styles.actionText}>Manage Permissions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Generate Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>👩‍🏫</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>Mrs. Elizabeth Thompson assigned to Form 3A Mathematics</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>➕</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>New staff member added: Mr. James Brown (Bursar)</Text>
            <Text style={styles.activityTime}>1 day ago</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>🔐</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>Permissions updated for Ms. Mary Davis</Text>
            <Text style={styles.activityTime}>3 days ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderStaffDirectory = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Staff Directory</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddStaff(true)}>
          <Text style={styles.addButtonText}>➕ Add Staff</Text>
        </TouchableOpacity>
      </View>

      {staffMembers.map((staff) => (
        <TouchableOpacity 
          key={staff.id} 
          style={styles.staffCard}
          onPress={() => setSelectedStaff(staff)}
        >
          <View style={styles.staffHeader}>
            <View style={styles.staffInfo}>
              <Text style={styles.staffIcon}>{getRoleIcon(staff.role)}</Text>
              <View style={styles.staffDetails}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffRole}>{staff.role}</Text>
                <Text style={styles.staffDepartment}>{staff.department}</Text>
              </View>
            </View>
            <View style={styles.staffStatus}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(staff.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(staff.status) }]}>
                {staff.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.staffContact}>
            <Text style={styles.contactInfo}>📧 {staff.email}</Text>
            <Text style={styles.contactInfo}>📞 {staff.phone}</Text>
          </View>

          {staff.subjects && (
            <View style={styles.subjectsContainer}>
              <Text style={styles.subjectsLabel}>Subjects:</Text>
              <View style={styles.subjectsList}>
                {staff.subjects.map((subject, index) => (
                  <View key={index} style={styles.subjectTag}>
                    <Text style={styles.subjectText}>{subject}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {staff.classes && (
            <View style={styles.classesContainer}>
              <Text style={styles.classesLabel}>Classes:</Text>
              <Text style={styles.classesText}>{staff.classes.join(', ')}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRoleManagement = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Role Management</Text>
      
      {Object.entries(rolePermissions).map(([role, permissions]) => (
        <View key={role} style={styles.roleCard}>
          <View style={styles.roleHeader}>
            <Text style={styles.roleIcon}>{getRoleIcon(role)}</Text>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>{role}</Text>
              <Text style={styles.roleCount}>
                {staffMembers.filter(s => s.role === role).length} staff members
              </Text>
            </View>
          </View>
          
          <View style={styles.permissionsContainer}>
            <Text style={styles.permissionsLabel}>Permissions:</Text>
            <View style={styles.permissionsList}>
              {permissions.map((permission, index) => (
                <View key={index} style={styles.permissionTag}>
                  <Text style={styles.permissionText}>{permission.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderSubjectAssignments = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Subject Assignments</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAssignModal(true)}>
          <Text style={styles.addButtonText}>📝 Assign</Text>
        </TouchableOpacity>
      </View>

      {subjects.map((subject) => (
        <View key={subject.id} style={styles.subjectCard}>
          <View style={styles.subjectHeader}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectCode}>{subject.code} - {subject.department}</Text>
            </View>
          </View>
          
          <View style={styles.assignedTeachers}>
            <Text style={styles.assignedLabel}>Assigned Teachers:</Text>
            {subject.assignedTeachers.length > 0 ? (
              <View style={styles.teachersList}>
                {subject.assignedTeachers.map((teacherId) => {
                  const teacher = staffMembers.find(s => s.id === teacherId);
                  return teacher ? (
                    <View key={teacherId} style={styles.teacherTag}>
                      <Text style={styles.teacherText}>{teacher.name}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            ) : (
              <Text style={styles.noTeachers}>No teachers assigned</Text>
            )}
          </View>

          <View style={styles.assignedClasses}>
            <Text style={styles.assignedLabel}>Classes:</Text>
            {classes.filter(c => c.assignedTeachers[subject.name]).map((cls) => (
              <Text key={cls.id} style={styles.classText}>
                {cls.subClasses.join(', ')}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderPermissions = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Permission Management</Text>
      
      {staffMembers.map((staff) => (
        <View key={staff.id} style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <View style={styles.staffInfo}>
              <Text style={styles.staffIcon}>{getRoleIcon(staff.role)}</Text>
              <View style={styles.staffDetails}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffRole}>{staff.role}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.currentPermissions}>
            <Text style={styles.permissionsLabel}>Current Permissions:</Text>
            <View style={styles.permissionsList}>
              {staff.permissions.map((permission, index) => (
                <View key={index} style={styles.permissionTag}>
                  <Text style={styles.permissionText}>{permission.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>👨‍💼 Principal Dashboard</Text>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'staff' && styles.activeTab]}
          onPress={() => setActiveTab('staff')}
        >
          <Text style={[styles.tabText, activeTab === 'staff' && styles.activeTabText]}>
            Staff
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'roles' && styles.activeTab]}
          onPress={() => setActiveTab('roles')}
        >
          <Text style={[styles.tabText, activeTab === 'roles' && styles.activeTabText]}>
            Roles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'assignments' && styles.activeTab]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>
            Assignments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'permissions' && styles.activeTab]}
          onPress={() => setActiveTab('permissions')}
        >
          <Text style={[styles.tabText, activeTab === 'permissions' && styles.activeTabText]}>
            Permissions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'staff' && renderStaffDirectory()}
        {activeTab === 'roles' && renderRoleManagement()}
        {activeTab === 'assignments' && renderSubjectAssignments()}
        {activeTab === 'permissions' && renderPermissions()}
      </View>

      {/* Add Staff Modal */}
      <Modal visible={showAddStaff} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Staff Member</Text>
            <Text style={styles.modalSubtitle}>This feature will be implemented soon</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowAddStaff(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assignment Modal */}
      <Modal visible={showAssignModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Subject to Teacher</Text>
            <Text style={styles.modalSubtitle}>This feature will be implemented soon</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowAssignModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
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
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  logoutButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 20,
  },
  tabContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  activityTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  staffCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  staffIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  staffRole: {
    fontSize: 14,
    color: '#3498db',
    marginTop: 2,
  },
  staffDepartment: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  staffStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  staffContact: {
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  subjectsContainer: {
    marginBottom: 10,
  },
  subjectsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectTag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  subjectText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '600',
  },
  classesContainer: {
    marginTop: 5,
  },
  classesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  classesText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  roleIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  roleCount: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  permissionsContainer: {
    marginTop: 10,
  },
  permissionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionTag: {
    backgroundColor: '#f1f8e9',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  permissionText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '600',
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectHeader: {
    marginBottom: 15,
  },
  subjectInfo: {
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subjectCode: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  assignedTeachers: {
    marginBottom: 10,
  },
  assignedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  teachersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teacherTag: {
    backgroundColor: '#fff3e0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  teacherText: {
    fontSize: 11,
    color: '#f57c00',
    fontWeight: '600',
  },
  noTeachers: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  assignedClasses: {
    marginTop: 10,
  },
  classText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#f39c12',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  currentPermissions: {
    marginTop: 10,
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
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PrincipalDashboard; 