import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { User } from '../LoginScreen';

interface Student {
  id: string;
  name: string;
  class: string;
  dateOfBirth: string;
  placeOfBirth: string;
  picture?: string;
  guardians: Guardian[];
  feeStatus: FeeStatus;
}

interface Guardian {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

interface FeeStatus {
  expectedFees: number;
  totalPaid: number;
  owing: number;
  status: 'Paid' | 'Partial' | 'Overdue' | 'Pending';
  lastPayment?: string;
}

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Bank Transfer' | 'Check' | 'Mobile Money';
  reference: string;
}

interface BursarDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const BursarDashboard: React.FC<BursarDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'payments' | 'reports'>('overview');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - in real app, this would come from your backend
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      class: 'Form 1A',
      dateOfBirth: '2008-05-15',
      placeOfBirth: 'Douala',
      guardians: [
        { id: '1', name: 'John Johnson', relationship: 'Father', phone: '+237-123-456-789', email: 'john@email.com' },
        { id: '2', name: 'Mary Johnson', relationship: 'Mother', phone: '+237-987-654-321' },
      ],
      feeStatus: { expectedFees: 150000, totalPaid: 150000, owing: 0, status: 'Paid', lastPayment: '2024-01-15' },
    },
    {
      id: '2',
      name: 'Michael Brown',
      class: 'Form 2B',
      dateOfBirth: '2007-08-22',
      placeOfBirth: 'Yaoundé',
      guardians: [
        { id: '3', name: 'David Brown', relationship: 'Father', phone: '+237-555-111-222' },
      ],
      feeStatus: { expectedFees: 175000, totalPaid: 100000, owing: 75000, status: 'Partial', lastPayment: '2023-12-10' },
    },
    {
      id: '3',
      name: 'Grace Mbeki',
      class: 'Form 3A',
      dateOfBirth: '2006-11-03',
      placeOfBirth: 'Bamenda',
      guardians: [
        { id: '4', name: 'Peter Mbeki', relationship: 'Uncle', phone: '+237-666-777-888' },
      ],
      feeStatus: { expectedFees: 200000, totalPaid: 50000, owing: 150000, status: 'Overdue', lastPayment: '2023-10-05' },
    },
  ]);

  const [recentPayments, setRecentPayments] = useState<Payment[]>([
    {
      id: '1',
      studentId: '1',
      studentName: 'Sarah Johnson',
      amount: 75000,
      date: '2024-01-15',
      method: 'Bank Transfer',
      reference: 'TXN001',
    },
    {
      id: '2',
      studentId: '2',
      studentName: 'Michael Brown',
      amount: 50000,
      date: '2023-12-10',
      method: 'Cash',
      reference: 'TXN002',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#2ecc71';
      case 'Partial': return '#f39c12';
      case 'Overdue': return '#e74c3c';
      case 'Pending': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return '✅';
      case 'Partial': return '⚠️';
      case 'Overdue': return '🚨';
      case 'Pending': return '⏳';
      default: return '❓';
    }
  };

  const totalExpectedFees = students.reduce((sum, student) => sum + student.feeStatus.expectedFees, 0);
  const totalCollectedFees = students.reduce((sum, student) => sum + student.feeStatus.totalPaid, 0);
  const totalOutstandingFees = students.reduce((sum, student) => sum + student.feeStatus.owing, 0);

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCollectedFees.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Collected (XAF)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalOutstandingFees.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Outstanding (XAF)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{((totalCollectedFees / totalExpectedFees) * 100).toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Collection Rate</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddStudent(true)}>
            <Text style={styles.actionIcon}>👨‍🎓</Text>
            <Text style={styles.actionText}>Add Student</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddPayment(true)}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Record Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('students')}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Student Lookup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('reports')}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Fee Status Overview</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>✅</Text>
            <Text style={styles.statusNumber}>{students.filter(s => s.feeStatus.status === 'Paid').length}</Text>
            <Text style={styles.statusLabel}>Paid</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>⚠️</Text>
            <Text style={styles.statusNumber}>{students.filter(s => s.feeStatus.status === 'Partial').length}</Text>
            <Text style={styles.statusLabel}>Partial</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>🚨</Text>
            <Text style={styles.statusNumber}>{students.filter(s => s.feeStatus.status === 'Overdue').length}</Text>
            <Text style={styles.statusLabel}>Overdue</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Payments</Text>
        {recentPayments.slice(0, 3).map((payment) => (
          <View key={payment.id} style={styles.paymentItem}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentStudent}>{payment.studentName}</Text>
              <Text style={styles.paymentDetails}>{payment.method} - {payment.reference}</Text>
              <Text style={styles.paymentDate}>{payment.date}</Text>
            </View>
            <Text style={styles.paymentAmount}>+{payment.amount.toLocaleString()} XAF</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStudents = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search students by name or class..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddStudent(true)}>
          <Text style={styles.addButtonText}>➕ Add</Text>
        </TouchableOpacity>
      </View>

      {filteredStudents.map((student) => (
        <View key={student.id} style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentClass}>{student.class}</Text>
              <Text style={styles.studentDetails}>DOB: {student.dateOfBirth} | Born: {student.placeOfBirth}</Text>
            </View>
            <View style={styles.studentStatus}>
              <Text style={styles.statusIcon}>{getStatusIcon(student.feeStatus.status)}</Text>
              <Text style={[styles.statusText, { color: getStatusColor(student.feeStatus.status) }]}>
                {student.feeStatus.status}
              </Text>
            </View>
          </View>

          <View style={styles.feeInfo}>
            <View style={styles.feeColumn}>
              <Text style={styles.feeLabel}>Expected</Text>
              <Text style={styles.feeAmount}>{student.feeStatus.expectedFees.toLocaleString()} XAF</Text>
            </View>
            <View style={styles.feeColumn}>
              <Text style={styles.feeLabel}>Paid</Text>
              <Text style={styles.feeAmount}>{student.feeStatus.totalPaid.toLocaleString()} XAF</Text>
            </View>
            <View style={styles.feeColumn}>
              <Text style={styles.feeLabel}>Owing</Text>
              <Text style={[styles.feeAmount, { color: student.feeStatus.owing > 0 ? '#e74c3c' : '#2ecc71' }]}>
                {student.feeStatus.owing.toLocaleString()} XAF
              </Text>
            </View>
          </View>

          <View style={styles.guardianInfo}>
            <Text style={styles.guardianLabel}>Guardians:</Text>
            {student.guardians.map((guardian, index) => (
              <Text key={guardian.id} style={styles.guardianText}>
                {guardian.name} ({guardian.relationship}) - {guardian.phone}
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.paymentButton}>
            <Text style={styles.paymentButtonText}>💳 Record Payment</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderPayments = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddPayment(true)}>
          <Text style={styles.addButtonText}>➕ Record</Text>
        </TouchableOpacity>
      </View>

      {recentPayments.map((payment) => (
        <View key={payment.id} style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentStudentInfo}>
              <Text style={styles.paymentStudentName}>{payment.studentName}</Text>
              <Text style={styles.paymentReference}>Ref: {payment.reference}</Text>
            </View>
            <Text style={styles.paymentAmountLarge}>+{payment.amount.toLocaleString()} XAF</Text>
          </View>
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentMethod}>📱 {payment.method}</Text>
            <Text style={styles.paymentDate}>📅 {payment.date}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Financial Reports</Text>
      
      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>📊 Fee Collection Summary</Text>
        <View style={styles.reportStats}>
          <View style={styles.reportStat}>
            <Text style={styles.reportLabel}>Total Expected</Text>
            <Text style={styles.reportValue}>{totalExpectedFees.toLocaleString()} XAF</Text>
          </View>
          <View style={styles.reportStat}>
            <Text style={styles.reportLabel}>Total Collected</Text>
            <Text style={styles.reportValue}>{totalCollectedFees.toLocaleString()} XAF</Text>
          </View>
          <View style={styles.reportStat}>
            <Text style={styles.reportLabel}>Collection Rate</Text>
            <Text style={styles.reportValue}>{((totalCollectedFees / totalExpectedFees) * 100).toFixed(1)}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>📋 Class-wise Breakdown</Text>
        {['Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 'Form 3A', 'Form 3B'].map((className) => {
          const classStudents = students.filter(s => s.class === className);
          const classExpected = classStudents.reduce((sum, s) => sum + s.feeStatus.expectedFees, 0);
          const classCollected = classStudents.reduce((sum, s) => sum + s.feeStatus.totalPaid, 0);
          const classRate = classExpected > 0 ? (classCollected / classExpected) * 100 : 0;
          
          return (
            <View key={className} style={styles.classReport}>
              <Text style={styles.className}>{className}</Text>
              <Text style={styles.classStats}>
                {classStudents.length} students | {classRate.toFixed(1)}% collected
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.reportActions}>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📄 Export Excel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📝 Export Word</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f39c12" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>💰 Bursar Dashboard</Text>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

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
          style={[styles.tab, activeTab === 'students' && styles.activeTab]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>
            Students
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
            Payments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            Reports
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'reports' && renderReports()}
      </View>

      {/* Add Student Modal */}
      <Modal visible={showAddStudent} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Student</Text>
            <Text style={styles.modalSubtitle}>Full student registration will be available on web platform</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowAddStudent(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Payment Modal */}
      <Modal visible={showAddPayment} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <Text style={styles.modalSubtitle}>Payment recording will be available on web platform</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowAddPayment(false)}
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
    backgroundColor: '#f39c12',
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
    borderBottomColor: '#f39c12',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#f39c12',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
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
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusCard: {
    alignItems: 'center',
    padding: 15,
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  statusNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentStudent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  paymentDetails: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  paymentDate: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#f39c12',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  studentClass: {
    fontSize: 14,
    color: '#3498db',
    marginTop: 2,
  },
  studentDetails: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  studentStatus: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  feeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  feeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  guardianInfo: {
    marginBottom: 15,
  },
  guardianLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  guardianText: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  paymentButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentStudentInfo: {
    flex: 1,
  },
  paymentStudentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  paymentReference: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  paymentAmountLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#3498db',
    marginRight: 15,
  },
  reportCard: {
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
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportStat: {
    flex: 1,
    alignItems: 'center',
  },
  reportLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  reportValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classReport: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  className: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  classStats: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: '#f39c12',
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

export default BursarDashboard; 