import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { API_BASE_URL } from '../constants';

const { width } = Dimensions.get('window');

interface Student {
  id: number;
  name: string;
  matricule: string;
  interviewScore: number;
  interviewDate: string;
  preferredClass: string;
  status: 'AWAITING_ASSIGNMENT' | 'ASSIGNED' | 'ENROLLED';
  assignedClass?: string;
  assignmentDate?: string;
}

interface ClassOption {
  id: number;
  name: string;
  currentCapacity: number;
  maxCapacity: number;
  availableSlots: number;
  utilizationRate: number;
}

interface StudentAssignmentsScreenProps {
  token: string;
  user: any;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const StudentAssignmentsScreen: React.FC<StudentAssignmentsScreenProps> = ({
  token,
  user,
  onNavigateBack,
  onNavigate,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassOption | null>(null);

  // Add error handling for missing props
  if (!user || !token) {
    console.error('❌ Student Assignments: Missing required props - user:', !!user, 'token:', !!token);
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Missing user or token data</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fetchData = useCallback(async () => {
    // Double check token exists before API call
    if (!token) {
      console.error('❌ Student Assignments: Token is undefined, cannot make API call');
      setStudents(mockStudents);
      setClassOptions(mockClasses);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔵 Student Assignments: Starting API call to fetch assignment data');
      console.log('🔵 Student Assignments: Students API URL:', `${API_BASE_URL}/vice-principal/students-awaiting-assignment`);
      console.log('🔵 Student Assignments: Classes API URL:', `${API_BASE_URL}/vice-principal/available-classes`);
      console.log('🔵 Student Assignments: Token:', token ? 'Token present' : 'Token missing');
      
      // Fetch students awaiting assignment
      const studentsResponse = await fetch(`${API_BASE_URL}/vice-principal/students-awaiting-assignment`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      // Fetch available classes
      const classesResponse = await fetch(`${API_BASE_URL}/vice-principal/available-classes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      console.log('🔵 Student Assignments: Students Response status:', studentsResponse.status);
      console.log('🔵 Student Assignments: Students Response ok:', studentsResponse.ok);
      console.log('🔵 Student Assignments: Classes Response status:', classesResponse.status);
      console.log('🔵 Student Assignments: Classes Response ok:', classesResponse.ok);
      
      if (studentsResponse.ok && classesResponse.ok) {
        const studentsResult = await studentsResponse.json();
        const classesResult = await classesResponse.json();
        
        console.log('🔵 Student Assignments: Students Response data:', JSON.stringify(studentsResult, null, 2));
        console.log('🔵 Student Assignments: Classes Response data:', JSON.stringify(classesResult, null, 2));
        
        if (studentsResult.success && classesResult.success) {
          console.log('✅ Student Assignments: API calls successful, using real data');
          setStudents(studentsResult.data);
          setClassOptions(classesResult.data);
        } else {
          console.log('⚠️ Student Assignments: API returned success=false, using mock data');
          console.log('⚠️ Student Assignments: Students API error message:', studentsResult.message || 'No error message');
          console.log('⚠️ Student Assignments: Classes API error message:', classesResult.message || 'No error message');
          setStudents(mockStudents);
          setClassOptions(mockClasses);
        }
      } else {
        console.log('❌ Student Assignments: One or both API calls failed');
        if (!studentsResponse.ok) {
          const errorText = await studentsResponse.text();
          console.log('❌ Student Assignments: Students API error response:', errorText);
        }
        if (!classesResponse.ok) {
          const errorText = await classesResponse.text();
          console.log('❌ Student Assignments: Classes API error response:', errorText);
        }
        setStudents(mockStudents);
        setClassOptions(mockClasses);
      }
    } catch (error) {
      console.log('❌ Student Assignments: API Error:', error);
      console.log('❌ Student Assignments: Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      setStudents(mockStudents);
      setClassOptions(mockClasses);
    } finally {
      console.log('🔵 Student Assignments: API calls completed, setting loading to false');
      setIsLoading(false);
    }
  }, [token]);

  const mockStudents: Student[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      matricule: 'ST2024001',
      interviewScore: 92,
      interviewDate: '2024-03-15',
      preferredClass: 'Form 1A',
      status: 'AWAITING_ASSIGNMENT'
    },
    {
      id: 2,
      name: 'Bob Smith',
      matricule: 'ST2024002',
      interviewScore: 78,
      interviewDate: '2024-03-14',
      preferredClass: 'Form 1B',
      status: 'AWAITING_ASSIGNMENT'
    },
    {
      id: 3,
      name: 'Carol Davis',
      matricule: 'ST2024003',
      interviewScore: 85,
      interviewDate: '2024-03-13',
      preferredClass: 'Form 2A',
      status: 'ASSIGNED',
      assignedClass: 'Form 2A',
      assignmentDate: '2024-03-18'
    }
  ];

  const mockClasses: ClassOption[] = [
    {
      id: 1,
      name: 'Form 1A',
      currentCapacity: 25,
      maxCapacity: 30,
      availableSlots: 5,
      utilizationRate: 83
    },
    {
      id: 2,
      name: 'Form 1B',
      currentCapacity: 28,
      maxCapacity: 30,
      availableSlots: 2,
      utilizationRate: 93
    },
    {
      id: 3,
      name: 'Form 2A',
      currentCapacity: 22,
      maxCapacity: 30,
      availableSlots: 8,
      utilizationRate: 73
    },
    {
      id: 4,
      name: 'Form 2B',
      currentCapacity: 30,
      maxCapacity: 30,
      availableSlots: 0,
      utilizationRate: 100
    }
  ];

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.matricule || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAssignmentModal = (student: Student) => {
    setSelectedStudent(student);
    setSelectedClass(null);
    setShowAssignmentModal(true);
  };

  const assignStudent = async () => {
    if (!selectedStudent || !selectedClass) {
      Alert.alert('Error', 'Please select a class for assignment');
      return;
    }

    if (selectedClass.availableSlots === 0) {
      Alert.alert('Error', 'Selected class is full');
      return;
    }

    if (!token) {
      console.error('❌ Assign Student: Token is undefined, cannot make API call');
      Alert.alert('Error', 'Authentication token is missing');
      return;
    }

    try {
      console.log('🔵 Assign Student: Starting API call to assign student');
      console.log('🔵 Assign Student: API URL:', `${API_BASE_URL}/vice-principal/assign-student`);
      console.log('🔵 Assign Student: Token:', token ? 'Token present' : 'Token missing');
      console.log('🔵 Assign Student: Student ID:', selectedStudent.id);
      console.log('🔵 Assign Student: Class ID:', selectedClass.id);
      console.log('🔵 Assign Student: Class Name:', selectedClass.name);
      
      const response = await fetch(`${API_BASE_URL}/vice-principal/assign-student`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          classId: selectedClass.id,
        }),
      });

      console.log('🔵 Assign Student: Response status:', response.status);
      console.log('🔵 Assign Student: Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Assign Student: API call successful');
        console.log('✅ Assign Student: Response data:', JSON.stringify(result, null, 2));
        Alert.alert('Success', 'Student assigned successfully');
        setShowAssignmentModal(false);
        fetchData();
      } else {
        console.log('❌ Assign Student: API call failed with status:', response.status);
        const errorText = await response.text();
        console.log('❌ Assign Student: Error response:', errorText);
        Alert.alert('Error', 'Failed to assign student');
      }
    } catch (error) {
      console.log('❌ Assign Student: API Error:', error);
      console.log('❌ Assign Student: Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      Alert.alert('Error', 'Failed to assign student');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#f39c12';
    if (score >= 70) return '#3498db';
    return '#e74c3c';
  };

  const getCapacityColor = (rate: number) => {
    if (rate >= 95) return '#e74c3c';
    if (rate >= 85) return '#f39c12';
    if (rate >= 70) return '#3498db';
    return '#27ae60';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AWAITING_ASSIGNMENT': return '#f39c12';
      case 'ASSIGNED': return '#27ae60';
      case 'ENROLLED': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AWAITING_ASSIGNMENT': return 'Awaiting Assignment';
      case 'ASSIGNED': return 'Assigned';
      case 'ENROLLED': return 'Enrolled';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8e44ad" />
          <Text style={styles.loadingText}>Loading Assignments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Student Assignments</Text>
          <Text style={styles.headerSubtitle}>Assign Students to Classes</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#6c757d"
        />
      </View>

      {/* Class Capacity Overview */}
      <View style={styles.capacityOverview}>
        <Text style={styles.sectionTitle}>Class Capacity Overview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.capacityScroll}>
          {classOptions.map((classOption) => (
            <View key={classOption.id} style={styles.capacityCard}>
              <Text style={styles.capacityClassName}>{classOption.name}</Text>
              <View style={styles.capacityInfo}>
                <Text style={styles.capacityNumbers}>
                  {classOption.currentCapacity}/{classOption.maxCapacity}
                </Text>
                <Text style={[styles.capacityRate, { color: getCapacityColor(classOption.utilizationRate) }]}>
                  {classOption.utilizationRate}%
                </Text>
              </View>
              <View style={styles.capacityBar}>
                <View
                  style={[
                    styles.capacityFill,
                    {
                      width: `${classOption.utilizationRate}%`,
                      backgroundColor: getCapacityColor(classOption.utilizationRate)
                    }
                  ]}
                />
              </View>
              <Text style={styles.availableSlots}>
                {classOption.availableSlots} slots available
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Students List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Students</Text>
        
        {filteredStudents.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentDetails}>
                  {student.matricule} • Interview: {student.interviewDate}
                </Text>
              </View>
              <View style={styles.studentScore}>
                <Text style={[styles.scoreText, { color: getScoreColor(student.interviewScore) }]}>
                  {student.interviewScore}/100
                </Text>
              </View>
            </View>

            <View style={styles.studentMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Preferred Class:</Text>
                <Text style={styles.metaValue}>{student.preferredClass}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Status:</Text>
                <Text style={[styles.metaValue, { color: getStatusColor(student.status) }]}>
                  {getStatusText(student.status)}
                </Text>
              </View>
            </View>

            {student.assignedClass && (
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentText}>
                  Assigned to: {student.assignedClass} on {student.assignmentDate}
                </Text>
              </View>
            )}

            {student.status === 'AWAITING_ASSIGNMENT' && (
              <View style={styles.studentActions}>
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => openAssignmentModal(student)}
                >
                  <Text style={styles.assignButtonText}>Assign to Class</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {filteredStudents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No students found</Text>
            <Text style={styles.emptyStateSubtext}>All students have been assigned</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Assignment Modal */}
      <Modal visible={showAssignmentModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Student to Class</Text>
            <Text style={styles.modalSubtitle}>
              {selectedStudent?.name} • Score: {selectedStudent?.interviewScore}/100
            </Text>
            
            <View style={styles.classSelection}>
              <Text style={styles.selectionTitle}>Select Class:</Text>
              {classOptions.map((classOption) => (
                <TouchableOpacity
                  key={classOption.id}
                  style={[
                    styles.classOption,
                    selectedClass?.id === classOption.id && styles.selectedClassOption,
                    classOption.availableSlots === 0 && styles.fullClassOption
                  ]}
                  onPress={() => classOption.availableSlots > 0 && setSelectedClass(classOption)}
                  disabled={classOption.availableSlots === 0}
                >
                  <View style={styles.classOptionInfo}>
                    <Text style={[
                      styles.classOptionName,
                      classOption.availableSlots === 0 && styles.fullClassText
                    ]}>
                      {classOption.name}
                    </Text>
                    <Text style={[
                      styles.classOptionCapacity,
                      classOption.availableSlots === 0 && styles.fullClassText
                    ]}>
                      {classOption.currentCapacity}/{classOption.maxCapacity}
                      {classOption.availableSlots === 0 && ' (FULL)'}
                    </Text>
                  </View>
                  {selectedClass?.id === classOption.id && (
                    <Text style={styles.selectedIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAssignmentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.assignModalButton]}
                onPress={assignStudent}
              >
                <Text style={styles.assignModalButtonText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Dashboard', { user, selectedRole: { role: 'VICE_PRINCIPAL', academicYearId: null, academicYearName: null }, token })}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('StudentInterviews', { user, token })}>
          <Text style={styles.navIcon}>🎤</Text>
          <Text style={styles.navLabel}>Interviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>📚</Text>
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Assignments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('ClassManagement', { user, token })}>
          <Text style={styles.navIcon}>🏫</Text>
          <Text style={styles.navLabel}>Classes</Text>
        </TouchableOpacity>
      </View>
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
    color: '#6c757d',
  },
  header: {
    backgroundColor: '#8e44ad',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 2,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  capacityOverview: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  capacityScroll: {
    marginBottom: 16,
  },
  capacityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  capacityClassName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  capacityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  capacityNumbers: {
    fontSize: 12,
    color: '#6c757d',
  },
  capacityRate: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  capacityBar: {
    height: 6,
    backgroundColor: '#f1f3f4',
    borderRadius: 3,
    marginBottom: 6,
  },
  capacityFill: {
    height: 6,
    borderRadius: 3,
  },
  availableSlots: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  studentDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  studentScore: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  assignmentInfo: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  assignmentText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  assignButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  assignButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: width - 32,
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  classSelection: {
    marginBottom: 24,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  classOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#transparent',
  },
  selectedClassOption: {
    borderColor: '#27ae60',
    backgroundColor: '#e8f5e8',
  },
  fullClassOption: {
    backgroundColor: '#f8f8f8',
    opacity: 0.6,
  },
  classOptionInfo: {
    flex: 1,
  },
  classOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classOptionCapacity: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  fullClassText: {
    color: '#95a5a6',
  },
  selectedIcon: {
    fontSize: 20,
    color: '#27ae60',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  assignModalButton: {
    backgroundColor: '#27ae60',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 80,
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeNavIcon: {
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#8e44ad',
    fontWeight: 'bold',
  },
});

export default StudentAssignmentsScreen; 