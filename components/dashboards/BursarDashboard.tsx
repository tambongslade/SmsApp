import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { User } from '../LoginScreen';
import BursarBottomNavigation from '../BursarBottomNavigation';
import { API_BASE_URL, formatCurrency, formatNumber, safeNumber } from '../../constants';

// API Response Interfaces
interface BursarDashboardData {
  totalFeesExpected: number;
  totalFeesCollected: number;
  pendingPayments: number;
  collectionRate: number;
  recentTransactions: number;
  newStudentsThisMonth: number;
  studentsWithParents: number;
  studentsWithoutParents: number;
  paymentMethods: Array<{
    method: string;
    count: number;
    totalAmount: number;
  }>;
  recentRegistrations: Array<{
    studentName: string;
    parentName: string;
    registrationDate: string;
    className: string;
  }>;
}

interface Fee {
  id: number;
  studentName: string;
  studentMatricule: string;
  className: string;
  amountExpected: number;
  totalPaid: number;
  outstanding: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  lastPaymentDate?: string;
}

interface Payment {
  id: number;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber?: string;
  recordedBy: string;
}

interface Student {
  id: number;
  matricule: string;
  name: string;
  className?: string;
  fees?: Fee[];
}

interface PaymentFormData {
  studentId: number | null;
  feeId: number | null;
  amount: string;
  paymentDate: string;
  paymentMethod: 'EXPRESS_UNION' | 'CCA' | '3DC';
  receiptNumber: string;
  notes: string;
}

interface Class {
  id: number;
  name: string;
  maxStudents: number;
  academicYearId: number;
  baseFee: number;
  firstTermFee: number;
  secondTermFee: number;
  thirdTermFee: number;
  newStudentFee: number;
  oldStudentFee: number;
  miscellaneousFee: number;
  studentCount: number;
  subClasses: any[];
  createdAt: string;
  updatedAt: string;
}

interface BursarDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const BursarDashboard: React.FC<BursarDashboardProps> = ({ user, token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<BursarDashboardData | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    residence: '',
    formerSchool: '',
    classId: 0,
    isNewStudent: true,
    parentName: '',
    parentPhone: '',
    parentWhatsapp: '',
    parentEmail: '',
    parentAddress: '',
  });
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    studentId: null,
    feeId: null,
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0], // Today's date
    paymentMethod: 'EXPRESS_UNION',
    receiptNumber: '',
    notes: '',
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentStudentType, setPaymentStudentType] = useState<'existing' | 'new'>('existing');

  // Helper function for safe API calls with better error handling
  const makeAPICall = async (endpoint: string, description: string): Promise<any> => {
    try {
      console.log(`🔍 ${description}...`);
      console.log('🔗 API URL:', `${API_BASE_URL}${endpoint}`);
      console.log('🔑 Token present:', !!token);
      console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response OK:', response.ok);
      console.log('📡 Response URL:', response.url);
      
      // Log all response headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('📡 Response headers:', headers);
      
      // Get response text first to check what we're actually receiving
      const responseText = await response.text();
      console.log('📡 Raw response (first 500 chars):', responseText.substring(0, 500));
      
      // Check if response is successful
      if (!response.ok) {
        console.error(`❌ ${description} returned error status:`, response.status, responseText);
        throw new Error(`API Error: ${response.status} - ${responseText.substring(0, 200)}`);
      }
      
      // Check if response is JSON by trying to parse it
      try {
        const apiData = JSON.parse(responseText);
        console.log(`📊 ${description} API response:`, apiData);
        return apiData;
      } catch (parseError) {
        console.error(`❌ ${description} returned non-JSON response:`, responseText);
        throw new Error(`Expected JSON but got: ${responseText.substring(0, 200)}`);
      }
    } catch (error) {
      console.error(`❌ Error in ${description}:`, error);
      throw error;
    }
  };

  const fetchBursarDashboard = async () => {
    try {
      const apiData = await makeAPICall('/bursar/dashboard', 'Fetching bursar dashboard data');

      if (apiData.success && apiData.data) {
        setDashboardData(apiData.data);
        console.log('✅ Successfully loaded real bursar dashboard data');
        return;
      } else {
        console.log('API returned success=false or missing data:', apiData);
        setDashboardData({
          totalFeesExpected: 0,
          totalFeesCollected: 0,
          pendingPayments: 0,
          collectionRate: 0,
          recentTransactions: 0,
          newStudentsThisMonth: 0,
          studentsWithParents: 0,
          studentsWithoutParents: 0,
          paymentMethods: [],
          recentRegistrations: [],
        });
      }
    } catch (error) {
      console.error('❌ Error fetching bursar dashboard:', error);
      setDashboardData({
        totalFeesExpected: 0,
        totalFeesCollected: 0,
        pendingPayments: 0,
        collectionRate: 0,
        recentTransactions: 0,
        newStudentsThisMonth: 0,
        studentsWithParents: 0,
        studentsWithoutParents: 0,
        paymentMethods: [],
        recentRegistrations: [],
      });
    }
  };

  const fetchFees = async () => {
    try {
      const apiData = await makeAPICall('/fees', 'Fetching fees data');

      if (apiData.success && apiData.data && apiData.data.data && Array.isArray(apiData.data.data)) {
        setFees(apiData.data.data);
        console.log('✅ Successfully loaded real fees data');
        return;
      } else {
        console.log('API returned success=false or missing/invalid data:', apiData);
        setFees([]);
      }
    } catch (error) {
      console.error('❌ Error fetching fees:', error);
      setFees([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const apiData = await makeAPICall('/classes', 'Fetching classes data');

      if (apiData.success && apiData.data) {
        // Check if data is nested like the fees API
        const classesData = apiData.data.data || apiData.data;
        if (Array.isArray(classesData)) {
          setClasses(classesData);
          console.log('✅ Successfully loaded real classes data');
          return;
        }
      } else {
        console.log('API returned success=false or missing data:', apiData);
      }
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
    }

    // Set empty array if API fails
    setClasses([]);
  };

  const fetchPayments = async () => {
    try {
      const apiData = await makeAPICall('/dashboard/bursar/enhanced', 'Fetching payments data from enhanced dashboard');

      if (apiData.success && apiData.data && apiData.data.recentTransactions) {
        // Transform recent transactions to match our Payment interface
        const transformedPayments = apiData.data.recentTransactions.map((transaction: any) => ({
          id: transaction.id,
          studentName: transaction.studentName,
          amount: transaction.amount,
          paymentDate: transaction.date,
          paymentMethod: transaction.type || 'EXPRESS_UNION', // Default if not provided
          receiptNumber: transaction.receiptNumber || undefined,
          recordedBy: transaction.recordedBy || 'System',
        }));
        
        setPayments(transformedPayments);
        console.log('✅ Successfully loaded real payments data from enhanced dashboard');
        return;
      } else {
        console.log('API returned success=false or missing recentTransactions:', apiData);
      }
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
    }

    // Set empty array if API fails
    setPayments([]);
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchBursarDashboard(), fetchFees(), fetchClasses(), fetchPayments()]);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleCreateStudent = async () => {
    try {
      console.log('👤 Registering student to class...');
      const response = await fetch(`${API_BASE_URL}/enrollment/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: studentForm.name,
          dateOfBirth: studentForm.dateOfBirth,
          placeOfBirth: studentForm.placeOfBirth,
          gender: studentForm.gender,
          residence: studentForm.residence,
          formerSchool: studentForm.formerSchool || undefined,
          classId: studentForm.classId,
          isNewStudent: studentForm.isNewStudent,
        }),
      });
      
      const result = await response.json();
      console.log('📝 Student registration response:', result);

      if (result.success) {
        Alert.alert('Success', 'Student registered successfully. Awaiting VP interview.');
        setShowAddStudent(false);
        setStudentForm({
          name: '',
          dateOfBirth: '',
          placeOfBirth: '',
          gender: 'MALE',
          residence: '',
          formerSchool: '',
          classId: 0,
          isNewStudent: true,
          parentName: '',
          parentPhone: '',
          parentWhatsapp: '',
          parentEmail: '',
          parentAddress: '',
        });
        await loadData(); // Refresh data
      } else {
        Alert.alert('Error', result.message || 'Failed to register student');
      }
    } catch (error) {
      console.error('❌ Error registering student:', error);
      Alert.alert('Error', 'An error occurred while registering the student');
    }
  };

  const searchStudents = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('🔍 Searching students with query:', query);
      const response = await fetch(`${API_BASE_URL}/students/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const apiData = await response.json();
      console.log('👥 Student search response:', apiData);

      if (apiData.success && apiData.data) {
        // Check if data is nested like the fees API
        const studentsData = apiData.data.data || apiData.data;
        if (Array.isArray(studentsData)) {
          setSearchResults(studentsData);
        } else {
          setSearchResults([]);
        }
      } else {
        console.log('API returned success=false or missing data:', apiData);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Error searching students:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchStudentFees = async (studentId: number) => {
    try {
      console.log('💰 Fetching fees for student:', studentId);
      const response = await fetch(`${API_BASE_URL}/fees/student/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const apiData = await response.json();
      console.log('💸 Student fees response:', apiData);

      if (apiData.success && apiData.data) {
        // Check if data is nested like the fees API
        const feesData = apiData.data.data || apiData.data;
        if (Array.isArray(feesData)) {
          return feesData;
        }
      } else {
        console.log('API returned success=false or missing data:', apiData);
      }
    } catch (error) {
      console.error('❌ Error fetching student fees:', error);
    }
    
    return [];
  };

  const createFeeRecord = async (studentId: number) => {
    try {
      console.log('📝 Creating fee record for student:', studentId);
      const response = await fetch(`${API_BASE_URL}/fees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: studentId, // Assuming studentId maps to enrollmentId
          amountExpected: 150000, // Default amount, should be configurable
          feeType: 'SCHOOL_FEES',
          description: 'School fees for academic year',
        }),
      });
      
      const result = await response.json();
      console.log('💰 Fee creation response:', result);

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create fee record');
      }
    } catch (error) {
      console.error('❌ Error creating fee record:', error);
      throw error;
    }
  };

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    setStudentSearch(student.name);
    setSearchResults([]);
    setPaymentForm(prev => ({ ...prev, studentId: student.id }));

    console.log('🔍 Fetching fees for selected student:', student.name);
    
    // Fetch student's fees using the correct endpoint
    const studentFees = await fetchStudentFees(student.id);
    
    if (studentFees.length > 0) {
      // Student has existing fees - prioritize fees with outstanding amounts
      const unpaidFees = studentFees.filter((fee: Fee) => fee.outstanding > 0);
      const activeFee = unpaidFees.length > 0 ? unpaidFees[0] : studentFees[0];
      
      setPaymentForm(prev => ({ ...prev, feeId: activeFee.id }));
      setSelectedStudent(prev => prev ? { ...prev, fees: studentFees } : null);
      
      console.log('💰 Found existing fees for student. Active fee ID:', activeFee.id);
      console.log('📊 Outstanding amount:', activeFee.outstanding);
    } else {
      // No existing fees, will need to create one
      setPaymentForm(prev => ({ ...prev, feeId: null }));
      setSelectedStudent(prev => prev ? { ...prev, fees: [] } : null);
      
      console.log('📝 No existing fees found. Will create new fee record during payment.');
    }
  };

  const handleRecordPayment = async () => {
    // Validation
    if (paymentStudentType === 'existing' && !selectedStudent) {
      Alert.alert('Validation Error', 'Please select a student');
      return;
    }
    
    if (paymentStudentType === 'new' && (!studentForm.name || !studentForm.classId)) {
      Alert.alert('Validation Error', 'Please enter student name and select a class');
      return;
    }

    if (!paymentForm.amount) {
      Alert.alert('Validation Error', 'Please enter payment amount');
      return;
    }

    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid payment amount');
      return;
    }

    setIsRecordingPayment(true);
    try {
      let studentId: number;
      let studentName: string;

      if (paymentStudentType === 'new') {
        // First, register the new student
        console.log('👤 Registering new student for payment...');
        const registrationResponse = await fetch(`${API_BASE_URL}/enrollment/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: studentForm.name,
            dateOfBirth: studentForm.dateOfBirth || '2000-01-01',
            placeOfBirth: studentForm.placeOfBirth || 'Unknown',
            gender: studentForm.gender,
            residence: studentForm.residence || 'Unknown',
            formerSchool: studentForm.formerSchool || undefined,
            classId: studentForm.classId,
            isNewStudent: studentForm.isNewStudent,
          }),
        });

        const registrationResult = await registrationResponse.json();
        console.log('📝 Student registration response:', registrationResult);

        if (!registrationResult.success) {
          Alert.alert('Error', registrationResult.message || 'Failed to register student');
          return;
        }

        studentId = registrationResult.data.student.id;
        studentName = registrationResult.data.student.name;
        console.log('✅ Student registered successfully:', studentName);
      } else {
        // Use existing student
        studentId = selectedStudent!.id;
        studentName = selectedStudent!.name;
      }

      let feeId = paymentForm.feeId;

      // If no existing fee, create one first
      if (!feeId) {
        console.log('📝 No existing fee found, creating new fee record...');
        const newFee = await createFeeRecord(studentId);
        feeId = newFee.id;
      }

      console.log('💳 Recording payment for fee:', feeId, 'Student:', studentName);
      const paymentData = {
        amount: amount,
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        receiptNumber: paymentForm.receiptNumber || undefined,
        notes: paymentForm.notes || undefined,
      };
      
      console.log('📋 Payment data being sent:', paymentData);
      
      const response = await fetch(`${API_BASE_URL}/fees/${feeId}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      const result = await response.json();
      console.log('💰 Payment recording response:', result);

      if (result.success) {
        const successMessage = paymentStudentType === 'new' 
          ? `Student registered and payment of ${formatNumber(amount)} FCFA recorded for ${studentName}`
          : `Payment of ${formatNumber(amount)} FCFA recorded for ${studentName}`;

        Alert.alert(
          'Payment Recorded Successfully', 
          successMessage,
          [
            { text: 'Record Another', onPress: resetPaymentForm },
            { text: 'Close', onPress: () => setShowAddPayment(false) }
          ]
        );
        await loadData(); // Refresh data
      } else {
        Alert.alert('Error', result.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('❌ Error recording payment:', error);
      Alert.alert('Error', 'An error occurred while recording the payment');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      studentId: null,
      feeId: null,
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'EXPRESS_UNION',
      receiptNumber: '',
      notes: '',
    });
    setSelectedStudent(null);
    setStudentSearch('');
    setSearchResults([]);
    setPaymentStudentType('existing');
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#27ae60';
      case 'PARTIAL': return '#f39c12';
      case 'UNPAID': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return '✅';
      case 'PARTIAL': return '⚠️';
      case 'UNPAID': return '❌';
      default: return '❓';
    }
  };

  // Using the safe formatCurrency function from constants.ts

  const renderOverview = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Financial Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatCurrency(dashboardData?.totalFeesExpected || 0)}</Text>
          <Text style={styles.statLabel}>Total Expected</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatCurrency(dashboardData?.totalFeesCollected || 0)}</Text>
          <Text style={styles.statLabel}>Collected</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardData?.collectionRate || 0}%</Text>
          <Text style={styles.statLabel}>Collection Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatCurrency(dashboardData?.pendingPayments || 0)}</Text>
          <Text style={styles.statLabel}>Outstanding</Text>
        </View>
      </View>

      {/* Monthly Highlights */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📈 This Month</Text>
        <View style={styles.monthlyHighlight}>
          <Text style={styles.monthlyTitle}>{dashboardData?.newStudentsThisMonth || 0} New Students</Text>
          <Text style={styles.monthlySubtitle}>{dashboardData?.recentTransactions || 0} recent transactions recorded</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddStudent(true)}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Register Student</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddPayment(true)}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Record Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('students')}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Manage Fees</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('reports')}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Methods Breakdown */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>💳 Payment Methods</Text>
        {(dashboardData?.paymentMethods || []).map((method, index) => {
          const percentage = dashboardData?.totalFeesCollected && dashboardData.totalFeesCollected > 0 
            ? (method.totalAmount / dashboardData.totalFeesCollected) * 100 
            : 0;
          
          return (
            <View key={index} style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodHeader}>
                <Text style={styles.paymentMethodName}>{method.method}</Text>
                <Text style={styles.paymentMethodAmount}>{formatCurrency(method.totalAmount)}</Text>
              </View>
              <Text style={styles.paymentMethodCount}>{method.count} transactions</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: index === 0 ? '#3498db' : index === 1 ? '#f39c12' : '#27ae60'
                    }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Recent Registrations */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🆕 Recent Registrations</Text>
        {(dashboardData?.recentRegistrations || []).map((registration, index) => (
          <View key={index} style={styles.registrationItem}>
            <View style={styles.registrationInfo}>
              <Text style={styles.registrationStudent}>{registration.studentName}</Text>
              <Text style={styles.registrationDetails}>Parent: {registration.parentName}</Text>
              <Text style={styles.registrationClass}>{registration.className} • {registration.registrationDate}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderStudents = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Search and Add */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddStudent(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced Analytics Overview */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📊 Fee Collection Analytics</Text>
        
        {/* Key Metrics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{fees?.length || 0}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {fees?.length > 0 ? Math.round(((fees?.filter(f => f.status === 'PAID').length || 0) / fees.length) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Collection Rate</Text>
          </View>
        </View>

        {/* Payment Status with Progress */}
        <View style={styles.statusProgressContainer}>
          <Text style={styles.statusProgressTitle}>Payment Status Distribution</Text>
          
          {/* Paid Status */}
          <View style={styles.statusProgressItem}>
            <View style={styles.statusProgressHeader}>
              <View style={styles.statusProgressInfo}>
                <Text style={styles.statusIcon}>✅</Text>
                <Text style={styles.statusProgressLabel}>Fully Paid</Text>
              </View>
              <View style={styles.statusProgressStats}>
                <Text style={styles.statusProgressCount}>{fees?.filter(f => f.status === 'PAID').length || 0}</Text>
                <Text style={styles.statusProgressPercentage}>
                  {fees?.length > 0 ? Math.round(((fees?.filter(f => f.status === 'PAID').length || 0) / fees.length) * 100) : 0}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${fees?.length > 0 ? ((fees?.filter(f => f.status === 'PAID').length || 0) / fees.length) * 100 : 0}%`,
                    backgroundColor: '#27ae60'
                  }
                ]} 
              />
            </View>
            <Text style={styles.statusProgressAmount}>
              Collected: {formatCurrency(fees?.filter(f => f.status === 'PAID').reduce((sum, f) => sum + f.totalPaid, 0) || 0)}
            </Text>
          </View>

          {/* Partial Status */}
          <View style={styles.statusProgressItem}>
            <View style={styles.statusProgressHeader}>
              <View style={styles.statusProgressInfo}>
                <Text style={styles.statusIcon}>⚠️</Text>
                <Text style={styles.statusProgressLabel}>Partial Payment</Text>
              </View>
              <View style={styles.statusProgressStats}>
                <Text style={styles.statusProgressCount}>{fees?.filter(f => f.status === 'PARTIAL').length || 0}</Text>
                <Text style={styles.statusProgressPercentage}>
                  {fees?.length > 0 ? Math.round(((fees?.filter(f => f.status === 'PARTIAL').length || 0) / fees.length) * 100) : 0}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${fees?.length > 0 ? ((fees?.filter(f => f.status === 'PARTIAL').length || 0) / fees.length) * 100 : 0}%`,
                    backgroundColor: '#f39c12'
                  }
                ]} 
              />
            </View>
            <Text style={styles.statusProgressAmount}>
              Outstanding: {formatCurrency(fees?.filter(f => f.status === 'PARTIAL').reduce((sum, f) => sum + f.outstanding, 0) || 0)}
            </Text>
          </View>

          {/* Unpaid Status */}
          <View style={styles.statusProgressItem}>
            <View style={styles.statusProgressHeader}>
              <View style={styles.statusProgressInfo}>
                <Text style={styles.statusIcon}>❌</Text>
                <Text style={styles.statusProgressLabel}>Unpaid</Text>
              </View>
              <View style={styles.statusProgressStats}>
                <Text style={styles.statusProgressCount}>{fees?.filter(f => f.status === 'UNPAID').length || 0}</Text>
                <Text style={styles.statusProgressPercentage}>
                  {fees?.length > 0 ? Math.round(((fees?.filter(f => f.status === 'UNPAID').length || 0) / fees.length) * 100) : 0}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${fees?.length > 0 ? ((fees?.filter(f => f.status === 'UNPAID').length || 0) / fees.length) * 100 : 0}%`,
                    backgroundColor: '#e74c3c'
                  }
                ]} 
              />
            </View>
            <Text style={styles.statusProgressAmount}>
              Expected: {formatCurrency(fees?.filter(f => f.status === 'UNPAID').reduce((sum, f) => sum + f.amountExpected, 0) || 0)}
            </Text>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.financialSummaryContainer}>
          <Text style={styles.financialSummaryTitle}>💰 Financial Summary</Text>
          <View style={styles.financialSummaryRow}>
            <View style={styles.financialSummaryCard}>
              <Text style={styles.financialSummaryLabel}>Total Expected</Text>
              <Text style={styles.financialSummaryValue}>
                {formatCurrency(fees?.reduce((sum, f) => sum + f.amountExpected, 0) || 0)}
              </Text>
            </View>
          </View>
          <View style={styles.financialSummaryRow}>
            <View style={styles.financialSummaryCard}>
              <Text style={styles.financialSummaryLabel}>Total Collected</Text>
              <Text style={[styles.financialSummaryValue, { color: '#27ae60' }]}>
                {formatCurrency(fees?.reduce((sum, f) => sum + f.totalPaid, 0) || 0)}
              </Text>
            </View>
          </View>
          <View style={styles.financialSummaryRow}>
            <View style={styles.financialSummaryCard}>
              <Text style={styles.financialSummaryLabel}>Outstanding</Text>
              <Text style={[styles.financialSummaryValue, { color: '#e74c3c' }]}>
                {formatCurrency(fees?.reduce((sum, f) => sum + f.outstanding, 0) || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Class-wise Collection Analytics */}
        <View style={styles.classAnalyticsContainer}>
          <Text style={styles.classAnalyticsTitle}>🏫 Class-wise Collection Analytics</Text>
          
          {(classes || []).map((classItem) => {
            const classStudents = (fees || []).filter(f => f.className?.includes(classItem.name || ''));
            const expectedFromStudents = classStudents.reduce((sum, f) => sum + f.amountExpected, 0);
            const collectedFromStudents = classStudents.reduce((sum, f) => sum + f.totalPaid, 0);
            const outstandingFromStudents = classStudents.reduce((sum, f) => sum + f.outstanding, 0);
            const collectionRate = expectedFromStudents > 0 ? (collectedFromStudents / expectedFromStudents) * 100 : 0;
            
            return (
              <View key={classItem.id} style={styles.classAnalyticsCard}>
                <View style={styles.classAnalyticsHeader}>
                  <Text style={styles.classAnalyticsName}>{classItem.name}</Text>
                  <View style={styles.classAnalyticsRate}>
                    <Text style={[
                      styles.classAnalyticsRateText,
                      { color: collectionRate >= 80 ? '#27ae60' : collectionRate >= 50 ? '#f39c12' : '#e74c3c' }
                    ]}>
                      {collectionRate.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.classAnalyticsStats}>
                  <View style={styles.classAnalyticsStatItem}>
                    <Text style={styles.classAnalyticsStatLabel}>Enrolled</Text>
                    <Text style={styles.classAnalyticsStatValue}>{classItem.studentCount}</Text>
                  </View>
                  <View style={styles.classAnalyticsStatItem}>
                    <Text style={styles.classAnalyticsStatLabel}>With Fees</Text>
                    <Text style={styles.classAnalyticsStatValue}>{classStudents.length}</Text>
                  </View>
                  <View style={styles.classAnalyticsStatItem}>
                    <Text style={styles.classAnalyticsStatLabel}>Max Capacity</Text>
                    <Text style={styles.classAnalyticsStatValue}>{classItem.maxStudents}</Text>
                  </View>
                </View>

                <View style={styles.classFeeStructure}>
                  <Text style={styles.classFeeStructureTitle}>Fee Structure (FCFA)</Text>
                  <View style={styles.classFeeStructureGrid}>
                    <View style={styles.classFeeStructureItem}>
                      <Text style={styles.classFeeStructureLabel}>Base Fee</Text>
                      <Text style={styles.classFeeStructureValue}>{formatCurrency(classItem.baseFee)}</Text>
                    </View>
                    <View style={styles.classFeeStructureItem}>
                      <Text style={styles.classFeeStructureLabel}>New Student</Text>
                      <Text style={styles.classFeeStructureValue}>{formatCurrency(classItem.newStudentFee)}</Text>
                    </View>
                    <View style={styles.classFeeStructureItem}>
                      <Text style={styles.classFeeStructureLabel}>Old Student</Text>
                      <Text style={styles.classFeeStructureValue}>{formatCurrency(classItem.oldStudentFee)}</Text>
                    </View>
                    <View style={styles.classFeeStructureItem}>
                      <Text style={styles.classFeeStructureLabel}>Miscellaneous</Text>
                      <Text style={styles.classFeeStructureValue}>{formatCurrency(classItem.miscellaneousFee)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.classTermFees}>
                  <Text style={styles.classTermFeesTitle}>Term Fees</Text>
                  <View style={styles.classTermFeesGrid}>
                    <View style={styles.classTermFeesItem}>
                      <Text style={styles.classTermFeesLabel}>1st Term</Text>
                      <Text style={styles.classTermFeesValue}>{formatCurrency(classItem.firstTermFee)}</Text>
                    </View>
                    <View style={styles.classTermFeesItem}>
                      <Text style={styles.classTermFeesLabel}>2nd Term</Text>
                      <Text style={styles.classTermFeesValue}>{formatCurrency(classItem.secondTermFee)}</Text>
                    </View>
                    <View style={styles.classTermFeesItem}>
                      <Text style={styles.classTermFeesLabel}>3rd Term</Text>
                      <Text style={styles.classTermFeesValue}>{formatCurrency(classItem.thirdTermFee)}</Text>
                    </View>
                  </View>
                </View>

                {classStudents.length > 0 && (
                  <View style={styles.classCollectionSummary}>
                    <Text style={styles.classCollectionSummaryTitle}>Collection Summary</Text>
                    <View style={styles.classCollectionSummaryGrid}>
                      <View style={styles.classCollectionSummaryItem}>
                        <Text style={styles.classCollectionSummaryLabel}>Expected</Text>
                        <Text style={styles.classCollectionSummaryValue}>{formatCurrency(expectedFromStudents)}</Text>
                      </View>
                      <View style={styles.classCollectionSummaryItem}>
                        <Text style={styles.classCollectionSummaryLabel}>Collected</Text>
                        <Text style={[styles.classCollectionSummaryValue, { color: '#27ae60' }]}>
                          {formatCurrency(collectedFromStudents)}
                        </Text>
                      </View>
                      <View style={styles.classCollectionSummaryItem}>
                        <Text style={styles.classCollectionSummaryLabel}>Outstanding</Text>
                        <Text style={[styles.classCollectionSummaryValue, { color: '#e74c3c' }]}>
                          {formatCurrency(outstandingFromStudents)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.classProgressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${collectionRate}%`,
                              backgroundColor: collectionRate >= 80 ? '#27ae60' : collectionRate >= 50 ? '#f39c12' : '#e74c3c'
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.classProgressText}>
                        {collectionRate.toFixed(1)}% collection rate
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Students List */}
      {(fees || [])
        .filter(fee => fee.studentName?.toLowerCase().includes(searchQuery?.toLowerCase() || ''))
        .map((fee) => (
          <View key={fee.id} style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{fee.studentName}</Text>
                <Text style={styles.studentClass}>{fee.className} • {fee.studentMatricule}</Text>
              </View>
              <View style={styles.studentStatus}>
                <Text style={styles.statusIcon}>{getStatusIcon(fee.status)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(fee.status) }]}>
                  {fee.status}
                </Text>
              </View>
            </View>

            <View style={styles.feeInfo}>
              <View style={styles.feeColumn}>
                <Text style={styles.feeLabel}>Expected</Text>
                <Text style={styles.feeAmount}>{formatCurrency(fee.amountExpected)}</Text>
              </View>
              <View style={styles.feeColumn}>
                <Text style={styles.feeLabel}>Paid</Text>
                <Text style={styles.feeAmount}>{formatCurrency(fee.totalPaid)}</Text>
              </View>
              <View style={styles.feeColumn}>
                <Text style={styles.feeLabel}>Outstanding</Text>
                <Text style={[styles.feeAmount, { color: fee.outstanding > 0 ? '#e74c3c' : '#27ae60' }]}>
                  {formatCurrency(fee.outstanding)}
                </Text>
              </View>
            </View>

            {fee.lastPaymentDate && (
              <Text style={styles.lastPayment}>
                Last payment: {fee.lastPaymentDate}
              </Text>
            )}

            {fee.outstanding > 0 && (
              <TouchableOpacity style={styles.paymentButton} onPress={() => setShowAddPayment(true)}>
                <Text style={styles.paymentButtonText}>Record Payment</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
    </ScrollView>
  );

  const renderPayments = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💰 Recent Payments</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddPayment(true)}>
          <Text style={styles.addButtonText}>+ Record</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Summary */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📊 Payment Summary</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{(payments || []).length}</Text>
            <Text style={styles.statLabel}>Total Payments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {formatCurrency((payments || []).reduce((sum, p) => sum + p.amount, 0))}
            </Text>
            <Text style={styles.statLabel}>Total Amount</Text>
          </View>
        </View>

        {/* Payment Methods Breakdown */}
        <View style={styles.paymentMethodsBreakdown}>
          <Text style={styles.paymentMethodsTitle}>Payment Methods</Text>
          {['EXPRESS_UNION', 'CCA', '3DC'].map((method) => {
            const methodPayments = (payments || []).filter(p => p.paymentMethod === method);
            const methodTotal = methodPayments.reduce((sum, p) => sum + p.amount, 0);
            const totalPayments = (payments || []).reduce((sum, p) => sum + p.amount, 0);
            const percentage = totalPayments > 0 ? (methodTotal / totalPayments) * 100 : 0;
            
            return (
              <View key={method} style={styles.paymentMethodBreakdownItem}>
                <View style={styles.paymentMethodBreakdownHeader}>
                  <Text style={styles.paymentMethodBreakdownName}>{method}</Text>
                  <Text style={styles.paymentMethodBreakdownAmount}>{formatCurrency(methodTotal)}</Text>
                </View>
                <View style={styles.paymentMethodBreakdownDetails}>
                  <Text style={styles.paymentMethodBreakdownCount}>{methodPayments.length} payments</Text>
                  <Text style={styles.paymentMethodBreakdownPercentage}>{percentage.toFixed(1)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${percentage}%`,
                        backgroundColor: method === 'EXPRESS_UNION' ? '#3498db' : method === 'CCA' ? '#f39c12' : '#27ae60'
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Payments List */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📋 Recent Transactions</Text>
        {(payments || []).length > 0 ? (
          (payments || []).map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentStudentInfo}>
                  <Text style={styles.paymentStudentName}>{payment.studentName}</Text>
                  <Text style={styles.paymentReference}>Receipt: {payment.receiptNumber || 'N/A'}</Text>
                </View>
                <Text style={styles.paymentAmountLarge}>{formatCurrency(payment.amount)}</Text>
              </View>
              
              <View style={styles.paymentDetails}>
                <View style={styles.paymentDetailItem}>
                  <Text style={styles.paymentDetailLabel}>Method:</Text>
                  <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>
                </View>
                <View style={styles.paymentDetailItem}>
                  <Text style={styles.paymentDetailLabel}>Date:</Text>
                  <Text style={styles.paymentDate}>{payment.paymentDate}</Text>
                </View>
                <View style={styles.paymentDetailItem}>
                  <Text style={styles.paymentDetailLabel}>Recorded by:</Text>
                  <Text style={styles.paymentNotes}>{payment.recordedBy}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💳</Text>
            <Text style={styles.emptyStateTitle}>No payments recorded yet</Text>
            <Text style={styles.emptyStateSubtitle}>Start recording payments to see them here</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => setShowAddPayment(true)}>
              <Text style={styles.emptyStateButtonText}>Record First Payment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Financial Summary */}
      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>💰 Financial Summary</Text>
        <View style={styles.reportStats}>
          <View style={styles.reportStat}>
            <Text style={styles.reportLabel}>Collection Rate</Text>
            <Text style={styles.reportValue}>{dashboardData?.collectionRate || 0}%</Text>
          </View>
          <View style={styles.reportStat}>
            <Text style={styles.reportLabel}>Total Students</Text>
            <Text style={styles.reportValue}>{fees?.length || 0}</Text>
          </View>
          <View style={styles.reportStat}>
            <Text style={styles.reportLabel}>Outstanding</Text>
            <Text style={styles.reportValue}>{formatCurrency(dashboardData?.pendingPayments || 0)}</Text>
          </View>
        </View>
      </View>

      {/* Class-wise Breakdown */}
      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>📋 Class-wise Breakdown</Text>
        {(classes || []).map((classItem) => {
          const classStudents = fees?.filter(f => f.className?.includes(classItem.name || '') || false) || [];
          const classExpected = classStudents.reduce((sum, f) => sum + f.amountExpected, 0);
          const classCollected = classStudents.reduce((sum, f) => sum + f.totalPaid, 0);
          const classRate = classExpected > 0 ? (classCollected / classExpected) * 100 : 0;
          
          return (
            <View key={classItem.id} style={styles.classReport}>
              <Text style={styles.className}>{classItem.name}</Text>
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f39c12" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

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



      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'reports' && renderReports()}
      </View>

      <BursarBottomNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      {/* Add Student Modal */}
      <Modal visible={showAddStudent} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.studentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👤 Register Student</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAddStudent(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.studentForm} showsVerticalScrollIndicator={false}>
              {/* Student Type Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>📋 Student Type</Text>
                <View style={styles.studentTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.studentTypeButton,
                      studentForm.isNewStudent && styles.studentTypeButtonActive
                    ]}
                    onPress={() => setStudentForm(prev => ({ ...prev, isNewStudent: true }))}
                  >
                    <Text style={[
                      styles.studentTypeText,
                      studentForm.isNewStudent && styles.studentTypeTextActive
                    ]}>
                      🆕 New Student
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.studentTypeButton,
                      !studentForm.isNewStudent && styles.studentTypeButtonActive
                    ]}
                    onPress={() => setStudentForm(prev => ({ ...prev, isNewStudent: false }))}
                  >
                    <Text style={[
                      styles.studentTypeText,
                      !studentForm.isNewStudent && styles.studentTypeTextActive
                    ]}>
                      🎓 Old Student
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Student Information */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>👤 Student Information</Text>
                
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter student's full name"
                    value={studentForm.name}
                    onChangeText={(text) => setStudentForm(prev => ({ ...prev, name: text }))}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Date of Birth *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="YYYY-MM-DD"
                    value={studentForm.dateOfBirth}
                    onChangeText={(text) => setStudentForm(prev => ({ ...prev, dateOfBirth: text }))}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Place of Birth *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter place of birth"
                    value={studentForm.placeOfBirth}
                    onChangeText={(text) => setStudentForm(prev => ({ ...prev, placeOfBirth: text }))}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Gender *</Text>
                  <View style={styles.genderContainer}>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        studentForm.gender === 'MALE' && styles.genderButtonActive
                      ]}
                      onPress={() => setStudentForm(prev => ({ ...prev, gender: 'MALE' }))}
                    >
                      <Text style={[
                        styles.genderText,
                        studentForm.gender === 'MALE' && styles.genderTextActive
                      ]}>
                        Male
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        studentForm.gender === 'FEMALE' && styles.genderButtonActive
                      ]}
                      onPress={() => setStudentForm(prev => ({ ...prev, gender: 'FEMALE' }))}
                    >
                      <Text style={[
                        styles.genderText,
                        studentForm.gender === 'FEMALE' && styles.genderTextActive
                      ]}>
                        Female
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Residence *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter residence address"
                    value={studentForm.residence}
                    onChangeText={(text) => setStudentForm(prev => ({ ...prev, residence: text }))}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Former School</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter former school (optional)"
                    value={studentForm.formerSchool}
                    onChangeText={(text) => setStudentForm(prev => ({ ...prev, formerSchool: text }))}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Class *</Text>
                  <View style={styles.classSelector}>
                    <Text style={styles.classSelectorText}>
                      {studentForm.classId > 0 
                        ? classes?.find(c => c.id === studentForm.classId)?.name || 'Select Class'
                        : 'Select Class'
                      }
                    </Text>
                    <TouchableOpacity
                      style={styles.classSelectorButton}
                      onPress={() => {
                        Alert.alert(
                          'Select Class',
                          'Choose a class for the student',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            ...(classes || []).map(classItem => ({
                              text: classItem.name,
                              onPress: () => setStudentForm(prev => ({ ...prev, classId: classItem.id }))
                            }))
                          ]
                        );
                      }}
                    >
                      <Text style={styles.classSelectorButtonText}>Choose</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.studentActions}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleCreateStudent}
                >
                  <Text style={styles.buttonText}>📝 Register Student</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddStudent(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Payment Modal */}
      <Modal visible={showAddPayment} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💳 Record Payment</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowAddPayment(false);
                  resetPaymentForm();
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.paymentForm} showsVerticalScrollIndicator={false}>
              {/* Student Type Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>🎯 Payment Type</Text>
                <View style={styles.paymentTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paymentTypeButton,
                      paymentStudentType === 'existing' && styles.paymentTypeButtonActive
                    ]}
                    onPress={() => {
                      setPaymentStudentType('existing');
                      setSelectedStudent(null);
                      setStudentSearch('');
                      setSearchResults([]);
                      setPaymentForm(prev => ({ ...prev, studentId: null, feeId: null }));
                    }}
                  >
                    <Text style={[
                      styles.paymentTypeText,
                      paymentStudentType === 'existing' && styles.paymentTypeTextActive
                    ]}>
                      👥 Existing Student
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paymentTypeButton,
                      paymentStudentType === 'new' && styles.paymentTypeButtonActive
                    ]}
                    onPress={() => {
                      setPaymentStudentType('new');
                      setSelectedStudent(null);
                      setStudentSearch('');
                      setSearchResults([]);
                      setPaymentForm(prev => ({ ...prev, studentId: null, feeId: null }));
                    }}
                  >
                    <Text style={[
                      styles.paymentTypeText,
                      paymentStudentType === 'new' && styles.paymentTypeTextActive
                    ]}>
                      👤 New Student
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Student Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>
                  {paymentStudentType === 'existing' ? '👤 Find Existing Student' : '👤 New Student Information'}
                </Text>
                {paymentStudentType === 'existing' ? (
                  <View style={styles.studentSearchContainer}>
                    <TextInput
                      style={styles.studentSearchInput}
                      placeholder="Search student by name or matricule..."
                      value={studentSearch}
                      onChangeText={(text) => {
                        setStudentSearch(text);
                        searchStudents(text);
                      }}
                      editable={!isRecordingPayment}
                    />
                    {isSearching && (
                      <ActivityIndicator style={styles.searchLoader} size="small" color="#f39c12" />
                    )}
                  </View>
                ) : (
                  <View style={styles.newStudentFormContainer}>
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Student Name *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Enter student's full name"
                        value={studentForm.name}
                        onChangeText={(text) => setStudentForm(prev => ({ ...prev, name: text }))}
                        editable={!isRecordingPayment}
                      />
                    </View>
                    
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Date of Birth *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="YYYY-MM-DD"
                        value={studentForm.dateOfBirth}
                        onChangeText={(text) => setStudentForm(prev => ({ ...prev, dateOfBirth: text }))}
                        editable={!isRecordingPayment}
                      />
                    </View>

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Class *</Text>
                      <View style={styles.classSelector}>
                        <Text style={styles.classSelectorText}>
                          {studentForm.classId > 0 
                            ? classes?.find(c => c.id === studentForm.classId)?.name || 'Select Class'
                            : 'Select Class'
                          }
                        </Text>
                        <TouchableOpacity
                          style={styles.classSelectorButton}
                          onPress={() => {
                            if (!isRecordingPayment) {
                              Alert.alert(
                                'Select Class',
                                'Choose a class for the student',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  ...(classes || []).map(classItem => ({
                                    text: classItem.name,
                                    onPress: () => setStudentForm(prev => ({ ...prev, classId: classItem.id }))
                                  }))
                                ]
                              );
                            }
                          }}
                          disabled={isRecordingPayment}
                        >
                          <Text style={styles.classSelectorButtonText}>Choose</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.newStudentNote}>
                      <Text style={styles.newStudentNoteText}>
                        💡 The student will be registered first, then the payment will be recorded.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Search Results - Only for existing students */}
                {paymentStudentType === 'existing' && searchResults.length > 0 && (
                  <View style={styles.searchResults}>
                    {searchResults.map((student) => (
                      <TouchableOpacity
                        key={student.id}
                        style={styles.searchResultItem}
                        onPress={() => handleStudentSelect(student)}
                      >
                        <Text style={styles.studentResultName}>{student.name}</Text>
                        <Text style={styles.studentResultDetails}>
                          {student.matricule} • {student.className}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* No Results - Register New Student (only for existing student search) */}
                {paymentStudentType === 'existing' && studentSearch.length > 0 && searchResults.length === 0 && !isSearching && (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No student found with "{studentSearch}"</Text>
                    <TouchableOpacity
                      style={styles.registerNewStudentButton}
                      onPress={() => {
                        setShowAddPayment(false);
                        setShowAddStudent(true);
                      }}
                    >
                      <Text style={styles.registerNewStudentText}>👤 Register New Student</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Selected Student Info */}
                {paymentStudentType === 'existing' && selectedStudent && (
                  <View style={styles.selectedStudentInfo}>
                    <Text style={styles.selectedStudentName}>✅ {selectedStudent.name}</Text>
                    <Text style={styles.selectedStudentDetails}>
                      {selectedStudent.matricule} • {selectedStudent.className}
                    </Text>
                    
                    {selectedStudent.fees && selectedStudent.fees.length > 0 ? (
                      <View style={styles.feeInfoContainer}>
                        <View style={styles.feeInfoRow}>
                          <Text style={styles.feeInfoLabel}>Total Expected:</Text>
                          <Text style={styles.feeInfoValue}>
                            {formatCurrency(selectedStudent.fees[0].amountExpected)}
                          </Text>
                        </View>
                        <View style={styles.feeInfoRow}>
                          <Text style={styles.feeInfoLabel}>Already Paid:</Text>
                          <Text style={[styles.feeInfoValue, { color: '#27ae60' }]}>
                            {formatCurrency(selectedStudent.fees[0].totalPaid)}
                          </Text>
                        </View>
                        <View style={styles.feeInfoRow}>
                          <Text style={styles.feeInfoLabel}>Outstanding:</Text>
                          <Text style={[styles.feeInfoValue, { 
                            color: selectedStudent.fees[0].outstanding > 0 ? '#e74c3c' : '#27ae60',
                            fontWeight: 'bold'
                          }]}>
                            {formatCurrency(selectedStudent.fees[0].outstanding)}
                          </Text>
                        </View>
                        <View style={styles.feeStatusBadge}>
                          <Text style={[styles.feeStatusText, { 
                            color: getStatusColor(selectedStudent.fees[0].status) 
                          }]}>
                            {getStatusIcon(selectedStudent.fees[0].status)} {selectedStudent.fees[0].status}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.noFeesContainer}>
                        <Text style={styles.noFeesText}>
                          📝 No existing fees found. A new fee record will be created.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* New Student Summary */}
                {paymentStudentType === 'new' && studentForm.name && studentForm.classId > 0 && (
                  <View style={styles.newStudentSummary}>
                    <Text style={styles.newStudentSummaryTitle}>✅ New Student Ready</Text>
                    <Text style={styles.newStudentSummaryDetails}>
                      {studentForm.name} • {classes?.find(c => c.id === studentForm.classId)?.name}
                    </Text>
                    <Text style={styles.newStudentSummaryNote}>
                      Student will be registered during payment processing
                    </Text>
                  </View>
                )}
              </View>

              {/* Payment Details */}
              {((paymentStudentType === 'existing' && selectedStudent) || 
                (paymentStudentType === 'new' && studentForm.name && studentForm.classId > 0)) && (
                <>
                  <View style={styles.formSection}>
                    <Text style={styles.formSectionTitle}>💰 Payment Details</Text>
                    
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Payment Amount (FCFA)</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Enter amount"
                        value={paymentForm.amount}
                        onChangeText={(text) => setPaymentForm(prev => ({ ...prev, amount: text }))}
                        keyboardType="numeric"
                        editable={!isRecordingPayment}
                      />
                    </View>

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Payment Date</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="YYYY-MM-DD"
                        value={paymentForm.paymentDate}
                        onChangeText={(text) => setPaymentForm(prev => ({ ...prev, paymentDate: text }))}
                        editable={!isRecordingPayment}
                      />
                    </View>

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Payment Method</Text>
                      <View style={styles.paymentMethodContainer}>
                        {(['EXPRESS_UNION', 'CCA', '3DC'] as const).map((method) => (
                          <TouchableOpacity
                            key={method}
                            style={[
                              styles.paymentMethodButton,
                              paymentForm.paymentMethod === method && styles.paymentMethodButtonActive
                            ]}
                            onPress={() => setPaymentForm(prev => ({ ...prev, paymentMethod: method }))}
                            disabled={isRecordingPayment}
                          >
                            <Text style={[
                              styles.paymentMethodText,
                              paymentForm.paymentMethod === method && styles.paymentMethodTextActive
                            ]}>
                              {method}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Receipt Number (Optional)</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Enter receipt number"
                        value={paymentForm.receiptNumber}
                        onChangeText={(text) => setPaymentForm(prev => ({ ...prev, receiptNumber: text }))}
                        editable={!isRecordingPayment}
                      />
                    </View>

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Notes (Optional)</Text>
                      <TextInput
                        style={[styles.formInput, styles.notesInput]}
                        placeholder="Additional notes..."
                        value={paymentForm.notes}
                        onChangeText={(text) => setPaymentForm(prev => ({ ...prev, notes: text }))}
                        multiline
                        numberOfLines={3}
                        editable={!isRecordingPayment}
                      />
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.paymentActions}>
                    <TouchableOpacity
                      style={[styles.recordPaymentButton, isRecordingPayment && styles.buttonDisabled]}
                      onPress={handleRecordPayment}
                      disabled={isRecordingPayment}
                    >
                      {isRecordingPayment ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color="#fff" size="small" />
                          <Text style={styles.buttonText}>Recording...</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>💳 Record Payment</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={resetPaymentForm}
                      disabled={isRecordingPayment}
                    >
                      <Text style={styles.clearButtonText}>Clear Form</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
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

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
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
  monthlyHighlight: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  monthlyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  monthlySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
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
  paymentMethodCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  paymentMethodAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  paymentMethodCount: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  registrationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  registrationInfo: {
    flex: 1,
  },
  registrationStudent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  registrationDetails: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  registrationClass: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 2,
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
  lastPayment: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 10,
    fontStyle: 'italic',
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
  paymentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#3498db',
    marginRight: 15,
  },
  paymentDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 15,
  },
  paymentNotes: {
    fontSize: 12,
    color: '#95a5a6',
    flex: 1,
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
  // Payment Modal Styles
  paymentModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  paymentForm: {
    maxHeight: 500,
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  studentSearchContainer: {
    position: 'relative',
  },
  studentSearchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  searchLoader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  searchResults: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    maxHeight: 150,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  studentResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  studentResultDetails: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  selectedStudentInfo: {
    backgroundColor: '#d5f4e6',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  selectedStudentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  selectedStudentDetails: {
    fontSize: 14,
    color: '#2c3e50',
    marginTop: 2,
  },
  studentBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 5,
  },
  formRow: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
  },
  paymentMethodButtonActive: {
    backgroundColor: '#f39c12',
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  paymentMethodTextActive: {
    color: '#fff',
  },
  paymentActions: {
    padding: 20,
    gap: 10,
  },
  recordPaymentButton: {
    backgroundColor: '#f39c12',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#f39c12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '600',
  },

  // Analytics Styles
  analyticsContainer: {
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
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statusAnalytics: {
    marginBottom: 25,
  },
  statusAnalyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statusAnalyticsItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  statusAnalyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusAnalyticsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusAnalyticsIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  statusAnalyticsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusAnalyticsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusAnalyticsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusAnalyticsPercentage: {
    fontSize: 12,
    color: '#7f8c8d',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusProgressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 8,
  },
  statusProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusAnalyticsAmount: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  financialSummary: {
    marginBottom: 25,
  },
  financialSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  financialSummaryGrid: {
    gap: 10,
  },
  financialSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  financialSummaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  financialSummaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classPerformance: {
    marginBottom: 10,
  },
  classPerformanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  classPerformanceItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  classPerformanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classPerformanceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classPerformanceRate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  classPerformanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  classPerformanceStudents: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  classPerformanceAmount: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  classProgressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
  },
  classProgressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Status Progress Styles
  statusProgressContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  statusProgressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statusProgressItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  statusProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusProgressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  statusProgressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusProgressCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusProgressPercentage: {
    fontSize: 12,
    color: '#7f8c8d',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusProgressAmount: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
    marginTop: 5,
  },

  // Financial Summary Styles
  financialSummaryContainer: {
    marginTop: 20,
  },
  financialSummaryRow: {
    marginBottom: 10,
  },
  financialSummaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },

  // Class Analytics Styles
  classAnalyticsContainer: {
    marginTop: 20,
  },
  classAnalyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  classAnalyticsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classAnalyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  classAnalyticsName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classAnalyticsRate: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  classAnalyticsRateText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  classAnalyticsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  classAnalyticsStatItem: {
    alignItems: 'center',
  },
  classAnalyticsStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  classAnalyticsStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classFeeStructure: {
    marginBottom: 20,
  },
  classFeeStructureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  classFeeStructureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  classFeeStructureItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  classFeeStructureLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  classFeeStructureValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  classTermFees: {
    marginBottom: 20,
  },
  classTermFeesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  classTermFeesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classTermFeesItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    alignItems: 'center',
  },
  classTermFeesLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  classTermFeesValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f39c12',
    textAlign: 'center',
  },
  classCollectionSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  classCollectionSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  classCollectionSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  classCollectionSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  classCollectionSummaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  classCollectionSummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  classProgressContainer: {
    alignItems: 'center',
  },
  classProgressText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
  },

  // Student Modal Styles
  studentModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  studentForm: {
    maxHeight: 500,
  },
  studentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  studentTypeButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ecf0f1',
    alignItems: 'center',
  },
  studentTypeButtonActive: {
    backgroundColor: '#f39c12',
    borderColor: '#f39c12',
  },
  studentTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  studentTypeTextActive: {
    color: '#fff',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  genderTextActive: {
    color: '#fff',
  },
  classSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  classSelectorText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  classSelectorButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  classSelectorButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  studentActions: {
    padding: 20,
    gap: 10,
  },
  registerButton: {
    backgroundColor: '#f39c12',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#f39c12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '600',
  },

  // Payment Methods Breakdown Styles
  paymentMethodsBreakdown: {
    marginTop: 20,
  },
  paymentMethodsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  paymentMethodBreakdownItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  paymentMethodBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  paymentMethodBreakdownName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
  },
  paymentMethodBreakdownAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3498db',
  },
  paymentMethodBreakdownDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodBreakdownCount: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  paymentMethodBreakdownPercentage: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  
  // Payment Detail Styles
  paymentDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  paymentDetailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 8,
    minWidth: 70,
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // No Results Styles
  noResultsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  noResultsText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    textAlign: 'center',
  },
  registerNewStudentButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  registerNewStudentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Payment Type Selection Styles
  paymentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  paymentTypeButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ecf0f1',
    alignItems: 'center',
  },
  paymentTypeButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  paymentTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  paymentTypeTextActive: {
    color: '#fff',
  },

  // New Student Form Styles
  newStudentFormContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  newStudentNote: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  newStudentNoteText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
    textAlign: 'center',
  },

  // New Student Summary Styles
  newStudentSummary: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  newStudentSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  newStudentSummaryDetails: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  newStudentSummaryNote: {
    fontSize: 12,
    color: '#3498db',
    fontStyle: 'italic',
  },

  // Fee Info Display Styles
  feeInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  feeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeInfoLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  feeInfoValue: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '600',
  },
  feeStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 5,
  },
  feeStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noFeesContainer: {
    backgroundColor: '#fff9e6',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  noFeesText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '500',
    textAlign: 'center',
  },

});

export default BursarDashboard; 