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
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { API_BASE_URL } from '../constants';

const { width } = Dimensions.get('window');

interface ClassData {
  id: number;
  name: string;
  level: string;
  currentCapacity: number;
  maxCapacity: number;
  utilizationRate: number;
  availableSlots: number;
  teacher: string;
  students: Array<{
    id: number;
    name: string;
    matricule: string;
    enrollmentDate: string;
  }>;
  lastUpdated: string;
  subclasses?: Array<{
    id: number;
    name: string;
    currentEnrollment: number;
    maxCapacity: number;
    utilizationRate: number;
    availableSpots: number;
    status: string;
  }>;
}

interface ClassIssue {
  id: string;
  classId: number;
  className: string;
  type: 'OVERCAPACITY' | 'UNDERCAPACITY' | 'NO_TEACHER' | 'MAINTENANCE';
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dateReported: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

interface ClassManagementScreenProps {
  token: string;
  user: any;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const ClassManagementScreen: React.FC<ClassManagementScreenProps> = ({
  token,
  user,
  onNavigateBack,
  onNavigate,
}) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [issues, setIssues] = useState<ClassIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'CLASSES' | 'ISSUES'>('CLASSES');
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [targetClass, setTargetClass] = useState<ClassData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      console.log('📊 Class Management: Fetching data...');
      console.log('📊 Class Management: Token:', token ? 'Present' : 'Missing');
      console.log('📊 Class Management: API Base URL:', API_BASE_URL);

      // Fetch subclass optimization data (includes capacity info)
      const subclassOptimizationResponse = await fetch(`${API_BASE_URL}/vice-principal/subclass-optimization`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      console.log('📊 Class Management: Subclass Optimization Response Status:', subclassOptimizationResponse.status);
      
      if (subclassOptimizationResponse.ok) {
        const subclassOptimizationResult = await subclassOptimizationResponse.json();
        console.log('📊 Class Management: Subclass Optimization Data:', subclassOptimizationResult);
        
        if (subclassOptimizationResult.success) {
          // Transform the subclass optimization data into our expected format
          const transformedClasses = subclassOptimizationResult.data.map((classData: any) => ({
            id: classData.classId,
            name: classData.className,
            level: classData.className.split(' ')[0], // Extract level from class name
            currentCapacity: classData.subclasses.reduce((sum: number, sub: any) => sum + sub.currentEnrollment, 0),
            maxCapacity: classData.subclasses.reduce((sum: number, sub: any) => sum + sub.maxCapacity, 0),
            utilizationRate: classData.overallUtilization,
            availableSlots: classData.subclasses.reduce((sum: number, sub: any) => sum + sub.availableSpots, 0),
            teacher: classData.subclasses[0]?.teacherName || 'Not Assigned', // Use first subclass teacher
            students: [], // We'll populate this from enrollment data if needed
            lastUpdated: new Date().toISOString().split('T')[0],
            subclasses: classData.subclasses.map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              currentEnrollment: sub.currentEnrollment,
              maxCapacity: sub.maxCapacity,
              utilizationRate: sub.utilizationRate,
              availableSpots: sub.availableSpots,
              status: sub.status
            }))
          }));
          
          setClasses(transformedClasses);
          console.log('✅ Class Management: Classes data set successfully', transformedClasses);
          
          // Create issues from recommendations
          const transformedIssues = subclassOptimizationResult.data.flatMap((classData: any) => 
            classData.recommendations.map((rec: any, index: number) => ({
              id: `${classData.classId}-${index}`,
              classId: classData.classId,
              className: classData.className,
              type: rec.type === 'BALANCE_ENROLLMENT' ? 'OVERCAPACITY' : 
                   rec.type === 'CREATE_SUBCLASS' ? 'OVERCAPACITY' : 
                   rec.type === 'MERGE_SUBCLASS' ? 'UNDERCAPACITY' : 'OTHER',
              description: rec.description,
              priority: rec.priority,
              dateReported: new Date().toISOString().split('T')[0],
              status: 'OPEN'
            }))
          );
          
          setIssues(transformedIssues);
          console.log('✅ Class Management: Issues data set successfully', transformedIssues);
        } else {
          console.log('❌ Class Management: API returned success=false, using mock data');
          setClasses(mockClasses);
          setIssues(mockIssues);
        }
      } else {
        console.log('❌ Class Management: API request failed, using mock data');
        setClasses(mockClasses);
        setIssues(mockIssues);
      }
    } catch (error) {
      console.error('❌ Class Management: Error fetching data:', error);
      setClasses(mockClasses);
      setIssues(mockIssues);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const mockClasses: ClassData[] = [
    {
      id: 1,
      name: 'Form 1A',
      level: 'Form 1',
      currentCapacity: 28,
      maxCapacity: 30,
      utilizationRate: 93,
      availableSlots: 2,
      teacher: 'Mrs. Johnson',
      students: [
        { id: 1, name: 'Alice Brown', matricule: 'ST2024001', enrollmentDate: '2024-03-15' },
        { id: 2, name: 'Bob Smith', matricule: 'ST2024002', enrollmentDate: '2024-03-16' },
      ],
      lastUpdated: '2024-03-20'
    },
    {
      id: 2,
      name: 'Form 1B',
      level: 'Form 1',
      currentCapacity: 32,
      maxCapacity: 30,
      utilizationRate: 107,
      availableSlots: -2,
      teacher: 'Mr. Davis',
      students: [
        { id: 3, name: 'Carol Wilson', matricule: 'ST2024003', enrollmentDate: '2024-03-17' },
        { id: 4, name: 'David Lee', matricule: 'ST2024004', enrollmentDate: '2024-03-18' },
      ],
      lastUpdated: '2024-03-20'
    },
    {
      id: 3,
      name: 'Form 2A',
      level: 'Form 2',
      currentCapacity: 22,
      maxCapacity: 30,
      utilizationRate: 73,
      availableSlots: 8,
      teacher: 'Ms. Garcia',
      students: [
        { id: 5, name: 'Emma Johnson', matricule: 'ST2024005', enrollmentDate: '2024-03-19' },
      ],
      lastUpdated: '2024-03-20'
    }
  ];

  const mockIssues: ClassIssue[] = [
    {
      id: '1',
      classId: 2,
      className: 'Form 1B',
      type: 'OVERCAPACITY',
      description: 'Class has exceeded maximum capacity by 2 students',
      priority: 'HIGH',
      dateReported: '2024-03-20',
      status: 'OPEN'
    },
    {
      id: '2',
      classId: 3,
      className: 'Form 2A',
      type: 'UNDERCAPACITY',
      description: 'Class is significantly under capacity',
      priority: 'MEDIUM',
      dateReported: '2024-03-19',
      status: 'IN_PROGRESS'
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

  const viewClassDetails = (classData: ClassData) => {
    setSelectedClass(classData);
    setShowClassModal(true);
  };

  const initiateTransfer = (student: any) => {
    setSelectedStudent(student);
    setTargetClass(null);
    setShowTransferModal(true);
  };

  const transferStudent = async () => {
    if (!selectedStudent || !targetClass) {
      Alert.alert('Error', 'Please select a target class');
      return;
    }

    if (targetClass.availableSlots <= 0) {
      Alert.alert('Error', 'Target class is full');
      return;
    }

    try {
      console.log('📝 Class Management: Transferring student...');
      console.log('📝 Class Management: Student ID:', selectedStudent.id);
      console.log('📝 Class Management: From Class ID:', selectedClass?.id);
      console.log('📝 Class Management: To Class ID:', targetClass.id);
      
      // Use the assign-subclass endpoint for student transfers
      const response = await fetch(`${API_BASE_URL}/enrollment/assign-subclass`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          subClassId: targetClass.id, // Use class ID as subclass ID
        }),
      });

      console.log('📝 Class Management: Transfer Response Status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Class Management: Transfer successful:', result);
        Alert.alert('Success', 'Student transferred successfully');
        setShowTransferModal(false);
        setShowClassModal(false);
        fetchData();
      } else {
        const errorData = await response.json();
        console.error('❌ Class Management: Transfer failed:', errorData);
        Alert.alert('Error', errorData.error || 'Failed to transfer student');
      }
    } catch (error) {
      console.error('❌ Class Management: Transfer error:', error);
      Alert.alert('Error', 'Failed to transfer student');
    }
  };

  const resolveIssue = async (issueId: string) => {
    try {
      console.log('🔧 Class Management: Resolving issue...');
      console.log('🔧 Class Management: Issue ID:', issueId);
      
      // Since these are capacity/optimization issues, we'll mark them as resolved locally
      // In a real implementation, this might involve creating an intervention or updating class capacity
      const updatedIssues = issues.map(issue => 
        issue.id === issueId 
          ? { ...issue, status: 'RESOLVED' as const }
          : issue
      );
      
      setIssues(updatedIssues);
      console.log('✅ Class Management: Issue resolved successfully');
      Alert.alert('Success', 'Issue marked as resolved');
      
      // Optionally refresh data to get latest state
      fetchData();
    } catch (error) {
      console.error('❌ Class Management: Error resolving issue:', error);
      Alert.alert('Error', 'Failed to resolve issue');
    }
  };

  const getCapacityColor = (rate: number) => {
    if (rate > 100) return '#e74c3c';      // Red for overcapacity
    if (rate >= 95) return '#f39c12';      // Orange for near capacity
    if (rate >= 70) return '#27ae60';      // Green for optimal
    if (rate >= 30) return '#3498db';      // Blue for moderate
    if (rate >= 10) return '#f39c12';      // Orange for low utilization
    return '#e74c3c';                      // Red for severely underutilized
  };

  const getIssueColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#e74c3c';
      case 'IN_PROGRESS': return '#f39c12';
      case 'RESOLVED': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'OVERCAPACITY': return '🚨';
      case 'UNDERCAPACITY': return '📉';
      case 'NO_TEACHER': return '👨‍🏫';
      case 'MAINTENANCE': return '🔧';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8e44ad" />
          <Text style={styles.loadingText}>Loading Classes...</Text>
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
          <Text style={styles.headerTitle}>Class Management</Text>
          <Text style={styles.headerSubtitle}>Monitor & Manage Classes</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'CLASSES' && styles.activeTab]}
          onPress={() => setActiveTab('CLASSES')}
        >
          <Text style={[styles.tabText, activeTab === 'CLASSES' && styles.activeTabText]}>
            Classes ({classes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ISSUES' && styles.activeTab]}
          onPress={() => setActiveTab('ISSUES')}
        >
          <Text style={[styles.tabText, activeTab === 'ISSUES' && styles.activeTabText]}>
            Issues ({issues.filter(i => i.status !== 'RESOLVED').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'CLASSES' && (
          <View style={styles.section}>
            {classes.map((classData) => (
              <TouchableOpacity
                key={classData.id}
                style={styles.classCard}
                onPress={() => viewClassDetails(classData)}
              >
                <View style={styles.classHeader}>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{classData.name}</Text>
                    <Text style={styles.classTeacher}>Teacher: {classData.teacher}</Text>
                    {classData.subclasses && classData.subclasses.length > 0 && (
                      <Text style={styles.subclassCount}>
                        {classData.subclasses.length} subclass{classData.subclasses.length > 1 ? 'es' : ''}
                      </Text>
                    )}
                  </View>
                  <View style={styles.capacityBadge}>
                    <Text style={[styles.capacityText, { color: getCapacityColor(classData.utilizationRate) }]}>
                      {classData.currentCapacity}/{classData.maxCapacity}
                    </Text>
                    <Text style={[styles.utilizationText, { color: getCapacityColor(classData.utilizationRate) }]}>
                      {classData.utilizationRate.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.capacityBar}>
                  <View
                    style={[
                      styles.capacityFill,
                      {
                        width: `${Math.max(Math.min(classData.utilizationRate, 100), 2)}%`, // Minimum 2% width for visibility
                        backgroundColor: getCapacityColor(classData.utilizationRate)
                      }
                    ]}
                  />
                  {classData.utilizationRate > 100 && (
                    <View style={styles.overflowIndicator}>
                      <Text style={styles.overflowText}>OVER</Text>
                    </View>
                  )}
                  {classData.utilizationRate < 10 && (
                    <View style={styles.underutilizedIndicator}>
                      <Text style={styles.underutilizedText}>UNDERUTILIZED</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.classMetrics}>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Utilization</Text>
                    <Text style={[styles.metricValue, { color: getCapacityColor(classData.utilizationRate) }]}>
                      {classData.utilizationRate.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Available Slots</Text>
                    <Text style={[styles.metricValue, { color: classData.availableSlots < 0 ? '#e74c3c' : '#27ae60' }]}>
                      {classData.availableSlots}
                    </Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Students</Text>
                    <Text style={[styles.metricValue, { color: classData.currentCapacity < 5 ? '#e74c3c' : '#2c3e50' }]}>
                      {classData.currentCapacity}
                    </Text>
                  </View>
                </View>
                
                {/* Warning for severely underutilized classes */}
                {classData.utilizationRate < 10 && (
                  <View style={styles.warningBanner}>
                    <Text style={styles.warningIcon}>⚠️</Text>
                    <Text style={styles.warningText}>
                      This class is severely underutilized. Consider merging subclasses or reducing capacity.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'ISSUES' && (
          <View style={styles.section}>
            {issues.map((issue) => (
              <View key={issue.id} style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <View style={styles.issueInfo}>
                    <Text style={styles.issueTitle}>
                      {getIssueTypeIcon(issue.type)} {issue.className}
                    </Text>
                    <Text style={styles.issueDescription}>{issue.description}</Text>
                    <Text style={styles.issueRecommendation}>
                      💡 Recommendation: Merge or consolidate subclasses to optimize capacity utilization
                    </Text>
                  </View>
                  <View style={styles.issueStatus}>
                    <View style={[styles.priorityBadge, { backgroundColor: getIssueColor(issue.priority) }]}>
                      <Text style={styles.priorityText}>{issue.priority}</Text>
                    </View>
                    <Text style={[styles.statusText, { color: getStatusColor(issue.status) }]}>
                      {issue.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.issueFooter}>
                  <Text style={styles.issueDate}>Reported: {issue.dateReported}</Text>
                  {issue.status !== 'RESOLVED' && (
                    <TouchableOpacity
                      style={styles.resolveButton}
                      onPress={() => resolveIssue(issue.id)}
                    >
                      <Text style={styles.resolveButtonText}>Resolve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            
            {issues.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No issues found</Text>
                <Text style={styles.emptyStateSubtext}>All classes are running smoothly</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Class Details Modal */}
      <Modal visible={showClassModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedClass?.name}</Text>
            <Text style={styles.modalSubtitle}>
              Capacity: {selectedClass?.currentCapacity}/{selectedClass?.maxCapacity} • 
              Teacher: {selectedClass?.teacher}
            </Text>
            
            <View style={styles.studentsList}>
              <Text style={styles.studentsTitle}>
                {selectedClass?.subclasses && selectedClass.subclasses.length > 0 
                  ? `Subclasses (${selectedClass.subclasses.length})`
                  : `Students (${selectedClass?.students.length || 0})`
                }
              </Text>
              <ScrollView style={styles.studentsScroll} showsVerticalScrollIndicator={false}>
                {selectedClass?.subclasses && selectedClass.subclasses.length > 0 ? (
                  // Show subclasses if available
                  selectedClass.subclasses.map((subclass) => (
                    <View key={subclass.id} style={styles.studentItem}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{subclass.name}</Text>
                        <Text style={styles.studentMatricule}>
                          {subclass.currentEnrollment}/{subclass.maxCapacity} students • {subclass.utilizationRate.toFixed(1)}%
                        </Text>
                      </View>
                      <View style={styles.transferButton}>
                        <Text style={[styles.transferButtonText, { 
                          backgroundColor: subclass.status === 'OPTIMAL' ? '#27ae60' : 
                                         subclass.status === 'OVERLOADED' ? '#e74c3c' : '#f39c12'
                        }]}>
                          {subclass.status}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  // Show students if no subclasses available
                  selectedClass?.students.map((student) => (
                    <View key={student.id} style={styles.studentItem}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentMatricule}>{student.matricule}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.transferButton}
                        onPress={() => initiateTransfer(student)}
                      >
                        <Text style={styles.transferButtonText}>Transfer</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowClassModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transfer Modal */}
      <Modal visible={showTransferModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Transfer Student</Text>
            <Text style={styles.modalSubtitle}>
              {selectedStudent?.name} • {selectedStudent?.matricule}
            </Text>
            
            <View style={styles.classSelection}>
              <Text style={styles.selectionTitle}>Select Target Class:</Text>
              {classes.filter(c => c.id !== selectedClass?.id).map((classData) => (
                <TouchableOpacity
                  key={classData.id}
                  style={[
                    styles.classOption,
                    targetClass?.id === classData.id && styles.selectedClassOption,
                    classData.availableSlots <= 0 && styles.fullClassOption
                  ]}
                  onPress={() => classData.availableSlots > 0 && setTargetClass(classData)}
                  disabled={classData.availableSlots <= 0}
                >
                  <View style={styles.classOptionInfo}>
                    <Text style={[
                      styles.classOptionName,
                      classData.availableSlots <= 0 && styles.fullClassText
                    ]}>
                      {classData.name}
                    </Text>
                    <Text style={[
                      styles.classOptionCapacity,
                      classData.availableSlots <= 0 && styles.fullClassText
                    ]}>
                      {classData.currentCapacity}/{classData.maxCapacity}
                      {classData.availableSlots <= 0 && ' (FULL)'}
                    </Text>
                  </View>
                  {targetClass?.id === classData.id && (
                    <Text style={styles.selectedIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTransferModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.transferModalButton]}
                onPress={transferStudent}
              >
                <Text style={styles.transferModalButtonText}>Transfer</Text>
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
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('StudentAssignments', { user, token })}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navLabel}>Assignments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>🏫</Text>
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Classes</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#8e44ad',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#8e44ad',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  classCard: {
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
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classTeacher: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  subclassCount: {
    fontSize: 12,
    color: '#8e44ad',
    marginTop: 2,
    fontStyle: 'italic',
  },
  capacityBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  utilizationText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  capacityBar: {
    height: 8,
    backgroundColor: '#f1f3f4',
    borderRadius: 4,
    marginBottom: 12,
    position: 'relative',
  },
  capacityFill: {
    height: 8,
    borderRadius: 4,
  },
  overflowIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overflowText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  underutilizedIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#f39c12',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  underutilizedText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  classMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  warningBanner: {
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    padding: 8,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  issueCard: {
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
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  issueInfo: {
    flex: 1,
    marginRight: 12,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  issueDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  issueRecommendation: {
    fontSize: 13,
    color: '#f39c12',
    marginTop: 6,
    fontStyle: 'italic',
  },
  issueStatus: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  resolveButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resolveButtonText: {
    color: '#ffffff',
    fontSize: 12,
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
  studentsList: {
    marginBottom: 24,
  },
  studentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  studentsScroll: {
    maxHeight: 200,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  studentMatricule: {
    fontSize: 12,
    color: '#6c757d',
  },
  transferButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  transferButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
    borderColor: 'transparent',
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
  transferModalButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transferModalButtonText: {
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

export default ClassManagementScreen; 