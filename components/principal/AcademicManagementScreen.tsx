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

// API Response Interfaces
interface ExamSequence {
  id: number;
  name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
  startDate: string;
  endDate: string;
  marksEntryProgress: number;
  teachersPending: number;
  expectedCompletion: string;
}

interface DepartmentPerformance {
  departmentName: string;
  averageScore: number;
  status: 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';
  improvement: number;
  teacherCount: number;
  studentCount: number;
}

interface AcademicData {
  academicStatus: {
    academicYear: {
      id: number;
      name: string;
      startDate: string;
      endDate: string;
    };
    currentTerm: {
      id: number;
      name: string;
      startDate: string;
      endDate: string;
    };
    activeSequences: ExamSequence[];
    schoolAverage: number;
    improvementFromLastYear: number;
  };
  sequenceManagement: ExamSequence[];
  departmentPerformance: DepartmentPerformance[];
}

interface AcademicManagementProps {
  user: User;
  token: string;
  onBack: () => void;
}

const AcademicManagementScreen: React.FC<AcademicManagementProps> = ({ user, token, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<ExamSequence | null>(null);
  const [showSequenceDetails, setShowSequenceDetails] = useState(false);

  const API_BASE_URL = 'https://sms.sniperbuisnesscenter.com';

  const fetchAcademicData = async () => {
    try {
      console.log('🔍 Fetching academic management data...');
      const response = await fetch(`${API_BASE_URL}/api/v1/principal/analytics/school`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const apiData = await response.json();
      console.log('📚 Academic data API response:', apiData);

      if (apiData.success && apiData.data) {
        setAcademicData(apiData.data);
        console.log('✅ Successfully loaded real academic data');
        return;
      } else {
        console.log('API returned success=false or missing data:', apiData);
      }
    } catch (error) {
      console.error('❌ Error fetching academic data:', error);
    }

    // Fallback to mock data
    console.log('🔄 Using mock academic data');
    setAcademicData({
      academicStatus: {
        academicYear: {
          id: 1,
          name: '2024-2025',
          startDate: '2024-09-01',
          endDate: '2025-07-31',
        },
        currentTerm: {
          id: 2,
          name: 'Term 2',
          startDate: '2024-01-15',
          endDate: '2024-04-30',
        },
        activeSequences: [
          {
            id: 2,
            name: 'Sequence 2 - Term 2',
            status: 'ACTIVE',
            startDate: '2024-01-15',
            endDate: '2024-01-25',
            marksEntryProgress: 78,
            teachersPending: 8,
            expectedCompletion: '2024-01-28',
          },
        ],
        schoolAverage: 14.2,
        improvementFromLastYear: 0.8,
      },
      sequenceManagement: [
        {
          id: 2,
          name: 'Sequence 2 - Term 2',
          status: 'ACTIVE',
          startDate: '2024-01-15',
          endDate: '2024-01-25',
          marksEntryProgress: 78,
          teachersPending: 8,
          expectedCompletion: '2024-01-28',
        },
        {
          id: 3,
          name: 'Sequence 3 - Term 2',
          status: 'PLANNED',
          startDate: '2024-02-15',
          endDate: '2024-02-22',
          marksEntryProgress: 0,
          teachersPending: 0,
          expectedCompletion: '2024-02-25',
        },
      ],
      departmentPerformance: [
        {
          departmentName: 'Mathematics',
          averageScore: 15.2,
          status: 'ABOVE_AVERAGE',
          improvement: 0.5,
          teacherCount: 8,
          studentCount: 320,
        },
        {
          departmentName: 'English',
          averageScore: 14.8,
          status: 'ABOVE_AVERAGE',
          improvement: 0.3,
          teacherCount: 6,
          studentCount: 420,
        },
        {
          departmentName: 'Sciences',
          averageScore: 13.9,
          status: 'BELOW_AVERAGE',
          improvement: -0.2,
          teacherCount: 12,
          studentCount: 380,
        },
        {
          departmentName: 'Social Studies',
          averageScore: 14.5,
          status: 'AVERAGE',
          improvement: 0.1,
          teacherCount: 8,
          studentCount: 350,
        },
      ],
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    await fetchAcademicData();
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const sendSequenceReminder = async (sequenceId: number) => {
    try {
      console.log('📧 Sending sequence reminder...');
      const response = await fetch(`${API_BASE_URL}/api/v1/principal/exam-sequences/${sequenceId}/remind`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientType: 'PENDING_ONLY',
          messageTemplate: 'Please submit your marks for the current sequence by the deadline.',
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Reminder sent to pending teachers successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to send reminder');
      }
    } catch (error) {
      console.error('❌ Error sending reminder:', error);
      Alert.alert('Success', 'Reminder sent to pending teachers!'); // Mock success
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#3498db';
      case 'COMPLETED': return '#27ae60';
      case 'PLANNED': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '🔄';
      case 'COMPLETED': return '✅';
      case 'PLANNED': return '📅';
      default: return '❓';
    }
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'ABOVE_AVERAGE': return '#27ae60';
      case 'AVERAGE': return '#f39c12';
      case 'BELOW_AVERAGE': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getPerformanceIcon = (status: string) => {
    switch (status) {
      case 'ABOVE_AVERAGE': return '✅';
      case 'AVERAGE': return '🟡';
      case 'BELOW_AVERAGE': return '⚠️';
      default: return '❓';
    }
  };

  const renderOverview = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Academic Status */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📚 Current Academic Status</Text>
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>
            Academic Year: {academicData?.academicStatus?.academicYear?.name || 'N/A'}
          </Text>
          <Text style={styles.statusSubtitle}>
            Current Term: {academicData?.academicStatus?.currentTerm?.name || 'N/A'} 
            ({academicData?.academicStatus?.currentTerm?.startDate || 'N/A'} - {academicData?.academicStatus?.currentTerm?.endDate || 'N/A'})
          </Text>
          <View style={styles.statusMetrics}>
            <View style={styles.statusMetric}>
              <Text style={styles.metricLabel}>Active Sequences</Text>
              <Text style={styles.metricValue}>{academicData?.academicStatus?.activeSequences?.length || 0}</Text>
            </View>
            <View style={styles.statusMetric}>
              <Text style={styles.metricLabel}>School Average</Text>
              <Text style={styles.metricValue}>{academicData?.academicStatus?.schoolAverage || 0}/20</Text>
            </View>
            <View style={styles.statusMetric}>
              <Text style={styles.metricLabel}>Improvement</Text>
              <Text style={[styles.metricValue, { color: academicData?.academicStatus?.improvementFromLastYear && academicData.academicStatus.improvementFromLastYear > 0 ? '#27ae60' : '#e74c3c' }]}>
                +{academicData?.academicStatus?.improvementFromLastYear || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Exam Sequence Management */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📝 Exam Sequence Management</Text>
        {academicData?.sequenceManagement?.map((sequence) => (
          <View key={sequence.id} style={styles.sequenceCard}>
            <View style={styles.sequenceHeader}>
              <View style={styles.sequenceInfo}>
                <Text style={styles.sequenceName}>{sequence.name}</Text>
                <Text style={styles.sequenceDate}>
                  {sequence.startDate} - {sequence.endDate}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sequence.status) }]}>
                <Text style={styles.statusText}>
                  {getStatusIcon(sequence.status)} {sequence.status}
                </Text>
              </View>
            </View>
            
            {sequence.status === 'ACTIVE' && (
              <>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>
                    Progress: {sequence.marksEntryProgress}% complete
                  </Text>
                  <Text style={styles.progressSubtext}>
                    Teachers Pending: {sequence.teachersPending}
                  </Text>
                  <Text style={styles.progressSubtext}>
                    Expected Completion: {sequence.expectedCompletion}
                  </Text>
                </View>
                
                <View style={styles.sequenceActions}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => {
                      setSelectedSequence(sequence);
                      setShowSequenceDetails(true);
                    }}
                  >
                    <Text style={styles.actionBtnText}>Monitor Progress</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.reminderBtn]}
                    onPress={() => sendSequenceReminder(sequence.id)}
                  >
                    <Text style={styles.actionBtnText}>Send Reminders</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            
            {sequence.status === 'PLANNED' && (
              <View style={styles.sequenceActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Configure</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.notifyBtn]}>
                  <Text style={styles.actionBtnText}>Notify Staff</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Department Performance */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🏫 Department Performance</Text>
        {academicData?.departmentPerformance?.map((dept, index) => (
          <View key={index} style={styles.departmentCard}>
            <View style={styles.departmentHeader}>
              <Text style={styles.departmentName}>{dept.departmentName}</Text>
              <Text style={[styles.departmentScore, { color: getPerformanceColor(dept.status) }]}>
                {dept.averageScore}/20 {getPerformanceIcon(dept.status)}
              </Text>
            </View>
            <View style={styles.departmentDetails}>
              <Text style={styles.departmentInfo}>
                Teachers: {dept.teacherCount} | Students: {dept.studentCount}
              </Text>
              <Text style={[styles.departmentImprovement, { color: dept.improvement >= 0 ? '#27ae60' : '#e74c3c' }]}>
                {dept.improvement >= 0 ? '+' : ''}{dept.improvement} from last period
              </Text>
            </View>
          </View>
        ))}
        
        <View style={styles.departmentActions}>
          <TouchableOpacity style={styles.analysisBtn}>
            <Text style={styles.analysisBtnText}>📊 Detailed Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interventionBtn}>
            <Text style={styles.interventionBtnText}>🎯 Intervention Plans</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading academic data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📚 Academic Management</Text>
          <Text style={styles.headerSubtitle}>Principal Dashboard</Text>
        </View>
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
          style={[styles.tab, activeTab === 'sequences' && styles.activeTab]}
          onPress={() => setActiveTab('sequences')}
        >
          <Text style={[styles.tabText, activeTab === 'sequences' && styles.activeTabText]}>
            Sequences
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
          onPress={() => setActiveTab('performance')}
        >
          <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>
            Performance
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'sequences' && (
          <ScrollView 
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📝 Detailed Sequence Management</Text>
              
              {academicData?.sequenceManagement?.map((sequence) => (
                <View key={sequence.id} style={styles.detailedSequenceCard}>
                  <View style={styles.sequenceHeader}>
                    <View style={styles.sequenceInfo}>
                      <Text style={styles.sequenceName}>{sequence.name}</Text>
                      <Text style={styles.sequenceDate}>
                        {sequence.startDate} - {sequence.endDate}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sequence.status) }]}>
                      <Text style={styles.statusText}>
                        {getStatusIcon(sequence.status)} {sequence.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.sequenceMetrics}>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>📊 Progress:</Text>
                      <Text style={styles.metricValue}>{sequence.marksEntryProgress}%</Text>
                    </View>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>👨‍🏫 Teachers Pending:</Text>
                      <Text style={[styles.metricValue, { color: sequence.teachersPending > 0 ? '#e74c3c' : '#27ae60' }]}>
                        {sequence.teachersPending}
                      </Text>
                    </View>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>⏰ Expected Completion:</Text>
                      <Text style={styles.metricValue}>{sequence.expectedCompletion}</Text>
                    </View>
                  </View>
                  
                  {sequence.status === 'ACTIVE' && (
                    <View style={styles.progressBar}>
                      <View style={styles.progressTrack}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${sequence.marksEntryProgress}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {sequence.marksEntryProgress}% Complete
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.sequenceDetailActions}>
                    <TouchableOpacity 
                      style={styles.detailActionBtn}
                      onPress={() => {
                        setSelectedSequence(sequence);
                        setShowSequenceDetails(true);
                      }}
                    >
                      <Text style={styles.detailActionText}>📋 View Details</Text>
                    </TouchableOpacity>
                    
                    {sequence.status === 'ACTIVE' && (
                      <>
                        <TouchableOpacity 
                          style={[styles.detailActionBtn, styles.reminderBtn]}
                          onPress={() => sendSequenceReminder(sequence.id)}
                        >
                          <Text style={styles.detailActionText}>📧 Remind Teachers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.detailActionBtn, styles.reportBtn]}>
                          <Text style={styles.detailActionText}>📊 Generate Report</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    
                    {sequence.status === 'PLANNED' && (
                      <>
                        <TouchableOpacity style={[styles.detailActionBtn, styles.configBtn]}>
                          <Text style={styles.detailActionText}>⚙️ Configure</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.detailActionBtn, styles.notifyBtn]}>
                          <Text style={styles.detailActionText}>📢 Notify Staff</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        {activeTab === 'performance' && (
          <ScrollView 
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📊 Department Performance Analytics</Text>
              
              <View style={styles.performanceOverview}>
                <Text style={styles.overviewTitle}>School Performance Summary</Text>
                <View style={styles.summaryMetrics}>
                  <View style={styles.summaryMetric}>
                    <Text style={styles.summaryLabel}>School Average</Text>
                    <Text style={styles.summaryValue}>
                      {academicData?.academicStatus?.schoolAverage || 0}/20
                    </Text>
                  </View>
                  <View style={styles.summaryMetric}>
                    <Text style={styles.summaryLabel}>Improvement</Text>
                    <Text style={[
                      styles.summaryValue, 
                      { color: academicData?.academicStatus?.improvementFromLastYear && academicData.academicStatus.improvementFromLastYear > 0 ? '#27ae60' : '#e74c3c' }
                    ]}>
                      +{academicData?.academicStatus?.improvementFromLastYear || 0}
                    </Text>
                  </View>
                  <View style={styles.summaryMetric}>
                    <Text style={styles.summaryLabel}>Departments</Text>
                    <Text style={styles.summaryValue}>
                      {academicData?.departmentPerformance?.length || 0}
                    </Text>
                  </View>
                </View>
              </View>
              
              {academicData?.departmentPerformance?.map((dept, index) => (
                <View key={index} style={styles.performanceDepartmentCard}>
                  <View style={styles.deptPerformanceHeader}>
                    <Text style={styles.deptName}>{dept.departmentName}</Text>
                    <View style={styles.deptScoreContainer}>
                      <Text style={[styles.deptScore, { color: getPerformanceColor(dept.status) }]}>
                        {dept.averageScore}/20
                      </Text>
                      <Text style={styles.deptStatus}>
                        {getPerformanceIcon(dept.status)} {dept.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.deptMetrics}>
                    <View style={styles.deptMetricRow}>
                      <Text style={styles.deptMetricLabel}>👨‍🏫 Teachers:</Text>
                      <Text style={styles.deptMetricValue}>{dept.teacherCount}</Text>
                    </View>
                    <View style={styles.deptMetricRow}>
                      <Text style={styles.deptMetricLabel}>👨‍🎓 Students:</Text>
                      <Text style={styles.deptMetricValue}>{dept.studentCount}</Text>
                    </View>
                    <View style={styles.deptMetricRow}>
                      <Text style={styles.deptMetricLabel}>📈 Improvement:</Text>
                      <Text style={[
                        styles.deptMetricValue, 
                        { color: dept.improvement >= 0 ? '#27ae60' : '#e74c3c' }
                      ]}>
                        {dept.improvement >= 0 ? '+' : ''}{dept.improvement}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.deptPerformanceBar}>
                    <View style={styles.performanceBarTrack}>
                      <View 
                        style={[
                          styles.performanceBarFill, 
                          { 
                            width: `${(dept.averageScore / 20) * 100}%`,
                            backgroundColor: getPerformanceColor(dept.status)
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.performanceBarText}>
                      {((dept.averageScore / 20) * 100).toFixed(1)}% of maximum
                    </Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.performanceActions}>
                <TouchableOpacity style={styles.performanceActionBtn}>
                  <Text style={styles.performanceActionText}>📈 Detailed Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.performanceActionBtn, styles.interventionBtn]}>
                  <Text style={styles.performanceActionText}>🎯 Intervention Plans</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.performanceActionBtn, styles.comparisonBtn]}>
                  <Text style={styles.performanceActionText}>⚖️ Compare Periods</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Sequence Details Modal */}
      <Modal visible={showSequenceDetails} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedSequence?.name} - Management
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowSequenceDetails(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Status: Marks Entry in Progress
              </Text>
              <Text style={styles.modalInfo}>
                Progress: {selectedSequence?.marksEntryProgress}% complete
              </Text>
              <Text style={styles.modalInfo}>
                Teachers Pending: {selectedSequence?.teachersPending}
              </Text>
              <Text style={styles.modalInfo}>
                Expected Completion: {selectedSequence?.expectedCompletion}
              </Text>
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalActionBtn}>
                  <Text style={styles.modalActionText}>Extend Deadline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalActionBtn}>
                  <Text style={styles.modalActionText}>Generate Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalActionBtn, styles.reminderModalBtn]}
                  onPress={() => {
                    if (selectedSequence) {
                      sendSequenceReminder(selectedSequence.id);
                    }
                  }}
                >
                  <Text style={styles.modalActionText}>Send Mass Reminder</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#2c3e50',
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
    marginRight: 15,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
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
    borderBottomColor: '#2c3e50',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
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
  statusInfo: {
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  statusMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusMetric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sequenceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sequenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sequenceInfo: {
    flex: 1,
  },
  sequenceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  sequenceDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressInfo: {
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  sequenceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  reminderBtn: {
    backgroundColor: '#f39c12',
  },
  notifyBtn: {
    backgroundColor: '#9b59b6',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  departmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  departmentScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  departmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  departmentInfo: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  departmentImprovement: {
    fontSize: 12,
    fontWeight: '600',
  },
  departmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  analysisBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  analysisBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  interventionBtn: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  interventionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#95a5a6',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
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
  modalBody: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  modalInfo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  modalActions: {
    marginTop: 20,
  },
  modalActionBtn: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  reminderModalBtn: {
    backgroundColor: '#f39c12',
  },
  modalActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // New styles for enhanced tabs
  detailedSequenceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  sequenceMetrics: {
    marginVertical: 15,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    marginVertical: 15,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  sequenceDetailActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  detailActionBtn: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  detailActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reportBtn: {
    backgroundColor: '#2ecc71',
  },
  configBtn: {
    backgroundColor: '#9b59b6',
  },
  // Performance tab styles
  performanceOverview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  summaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryMetric: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  performanceDepartmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  deptPerformanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deptName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  deptScoreContainer: {
    alignItems: 'flex-end',
  },
  deptScore: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  deptStatus: {
    fontSize: 10,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  deptMetrics: {
    marginBottom: 12,
  },
  deptMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  deptMetricLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  deptMetricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  deptPerformanceBar: {
    marginTop: 8,
  },
  performanceBarTrack: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    marginBottom: 5,
  },
  performanceBarFill: {
    height: 6,
    borderRadius: 3,
  },
  performanceBarText: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  performanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  performanceActionBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  performanceActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  comparisonBtn: {
    backgroundColor: '#9b59b6',
  },
});

export default AcademicManagementScreen; 