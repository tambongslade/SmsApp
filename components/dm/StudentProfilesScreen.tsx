import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { API_BASE_URL } from '../../constants';
// import MessagingFAB from './MessagingFAB';

interface StudentProfilesScreenProps {
  token: string;
  user: any;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

interface StudentProfile {
  studentId: number;
  studentName: string;
  matricule: string;
  className: string;
  subClassName: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  behaviorScore: number;
  totalIncidents: number;
  recentIncidents: number;
  interventionsReceived: number;
  lastIncidentDate?: string;
  behaviorPattern?: {
    mostCommonIssues: Array<string>;
    triggerFactors: Array<string>;
    improvementAreas: Array<string>;
    strengths: Array<string>;
  };
  interventionHistory?: Array<{
    id: number;
    type: string;
    date: string;
    description: string;
    outcome: "SUCCESSFUL" | "PARTIALLY_SUCCESSFUL" | "UNSUCCESSFUL" | "ONGOING";
    followUpDate?: string;
  }>;
  recommendedActions?: Array<{
    priority: "HIGH" | "MEDIUM" | "LOW";
    action: string;
    timeline: string;
    responsible: string;
  }>;
}

interface ClassData {
  id: number;
  name: string;
  subClasses: Array<{
    id: number;
    name: string;
    studentCount: number;
  }>;
}

interface ApiError {
  message: string;
  status?: number;
}

const StudentProfilesScreen: React.FC<StudentProfilesScreenProps> = ({
  token,
  user,
  onNavigateBack,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState('high-risk');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // API Data States
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [selectedSubClass, setSelectedSubClass] = useState<{id: number; name: string} | null>(null);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [detailedProfile, setDetailedProfile] = useState<StudentProfile | null>(null);
  
  // Loading States
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Error States
  const [error, setError] = useState<string | null>(null);
  
  // Intervention Form States
  const [interventionType, setInterventionType] = useState('');
  const [interventionDescription, setInterventionDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isCreatingIntervention, setIsCreatingIntervention] = useState(false);

  // API Functions
  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      setError(null);
      
      // For discipline master, we'll create a simple structure
      // since the main focus is on behavioral data, not class structure
      const mockClasses = [
        {
          id: 1,
          name: 'All Classes',
          subClasses: [
            { id: 1, name: 'All Students', studentCount: 0 }
          ]
        }
      ];

      setClasses(mockClasses);
      
      // Auto-select the default option
      setSelectedClass(mockClasses[0]);
      setSelectedSubClass(mockClasses[0].subClasses[0]);
    } catch (err) {
      console.error('Error setting up classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const fetchStudentsBySubClass = async (subClassId?: number) => {
    try {
      setIsLoadingStudents(true);
      setError(null);
      
      console.log('🔍 [StudentProfiles] Starting API calls...');
      
      // Use discipline master endpoints instead of general student endpoints
      const [dashboardResponse, earlyWarningResponse, riskAssessmentResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/discipline-master/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/discipline-master/early-warning`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/discipline-master/risk-assessment`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      console.log('📊 [StudentProfiles] API Response Status:', {
        dashboard: dashboardResponse.status,
        earlyWarning: earlyWarningResponse.status,
        riskAssessment: riskAssessmentResponse.status
      });

      const dashboardData = dashboardResponse.ok ? await dashboardResponse.json() : null;
      const earlyWarningData = earlyWarningResponse.ok ? await earlyWarningResponse.json() : null;
      const riskAssessmentData = riskAssessmentResponse.ok ? await riskAssessmentResponse.json() : null;

      console.log('📝 [StudentProfiles] API Response Data:', {
        dashboardData: dashboardData,
        earlyWarningData: earlyWarningData,
        riskAssessmentData: riskAssessmentData
      });

      // Combine data from multiple sources
      const allStudents = new Map();

      // Add students from dashboard urgent interventions
      if (dashboardData?.data?.urgentInterventions) {
        console.log('🚨 [StudentProfiles] Processing urgent interventions:', dashboardData.data.urgentInterventions.length, 'students');
        dashboardData.data.urgentInterventions.forEach((intervention: any) => {
          console.log('👤 [StudentProfiles] Adding dashboard student:', {
            studentId: intervention.studentId,
            studentName: intervention.studentName,
            riskLevel: intervention.riskLevel
          });
          allStudents.set(intervention.studentId, {
            studentId: intervention.studentId,
            studentName: intervention.studentName || 'Unknown Student',
            matricule: intervention.matricule || `STU${intervention.studentId}`,
            className: intervention.className || 'Unknown',
            subClassName: intervention.subClassName || 'Unknown',
            riskLevel: intervention.riskLevel || 'NONE',
            behaviorScore: intervention.behaviorScore || 100,
            totalIncidents: intervention.issueCount || 0,
            recentIncidents: intervention.recentIncidents || 0,
            interventionsReceived: intervention.interventionsReceived || 0,
            lastIncidentDate: intervention.lastIncident,
          });
        });
      } else {
        console.log('⚠️ [StudentProfiles] No urgent interventions found in dashboard data');
      }

      // Add students from early warning system
      if (earlyWarningData?.data?.atRiskStudents) {
        console.log('⚠️ [StudentProfiles] Processing early warning students:', earlyWarningData.data.atRiskStudents.length, 'students');
        earlyWarningData.data.atRiskStudents.forEach((student: any) => {
          console.log('👤 [StudentProfiles] Adding early warning student:', {
            studentId: student.studentId || student.id,
            studentName: student.studentName || student.name,
            riskLevel: student.riskLevel
          });
          allStudents.set(student.studentId || student.id, {
            studentId: student.studentId || student.id,
            studentName: student.studentName || student.name || 'Unknown Student',
            matricule: student.matricule || `STU${student.studentId || student.id}`,
            className: student.className || 'Unknown',
            subClassName: student.subClassName || 'Unknown',
            riskLevel: student.riskLevel || 'NONE',
            behaviorScore: student.behaviorScore || 100,
            totalIncidents: student.totalIncidents || 0,
            recentIncidents: student.recentIncidents || 0,
            interventionsReceived: student.interventionsReceived || 0,
            lastIncidentDate: student.lastIncidentDate,
          });
        });
      } else {
        console.log('⚠️ [StudentProfiles] No early warning students found or different data structure');
        console.log('🔍 [StudentProfiles] Early warning data structure:', earlyWarningData?.data);
      }

      // Add students from risk assessment
      if (riskAssessmentData?.data) {
        const riskData = Array.isArray(riskAssessmentData.data) ? riskAssessmentData.data : [riskAssessmentData.data];
        console.log('📊 [StudentProfiles] Processing risk assessment students:', riskData.length, 'students');
        riskData.forEach((student: any) => {
          console.log('👤 [StudentProfiles] Adding risk assessment student:', {
            studentId: student.studentId || student.id,
            studentName: student.studentName || student.name,
            riskLevel: student.riskLevel
          });
          allStudents.set(student.studentId || student.id, {
            studentId: student.studentId || student.id,
            studentName: student.studentName || student.name || 'Unknown Student',
            matricule: student.matricule || `STU${student.studentId || student.id}`,
            className: student.className || 'Unknown',
            subClassName: student.subClassName || 'Unknown',
            riskLevel: student.riskLevel || 'NONE',
            behaviorScore: student.behaviorScore || 100,
            totalIncidents: student.totalIncidents || 0,
            recentIncidents: student.recentIncidents || 0,
            interventionsReceived: student.interventionsReceived || 0,
            lastIncidentDate: student.lastIncidentDate,
          });
        });
      } else {
        console.log('⚠️ [StudentProfiles] No risk assessment data found');
        console.log('🔍 [StudentProfiles] Risk assessment data structure:', riskAssessmentData);
      }

      // If no students found, try to get discipline issues for this subclass
      if (allStudents.size === 0) {
        console.log('📚 [StudentProfiles] No students found from main sources, trying discipline fallback...');
        try {
          const disciplineResponse = await fetch(`${API_BASE_URL}/discipline?subClassId=${subClassId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('📚 [StudentProfiles] Discipline fallback response status:', disciplineResponse.status);

          if (disciplineResponse.ok) {
            const disciplineData = await disciplineResponse.json();
            console.log('📚 [StudentProfiles] Discipline fallback data:', disciplineData);
            
            if (disciplineData.data && Array.isArray(disciplineData.data)) {
              console.log('📚 [StudentProfiles] Processing discipline issues:', disciplineData.data.length, 'issues');
              disciplineData.data.forEach((issue: any) => {
                if (issue.student) {
                  console.log('👤 [StudentProfiles] Adding discipline student:', {
                    studentId: issue.student.id,
                    studentName: issue.student.name
                  });
                  allStudents.set(issue.student.id, {
                    studentId: issue.student.id,
                    studentName: issue.student.name || 'Unknown Student',
                    matricule: issue.student.matricule || `STU${issue.student.id}`,
                    className: issue.student.className || 'Unknown',
                    subClassName: issue.student.subClassName || 'Unknown',
                    riskLevel: issue.student.riskLevel || 'NONE',
                    behaviorScore: issue.student.behaviorScore || 100,
                    totalIncidents: issue.student.totalIncidents || 1,
                    recentIncidents: issue.student.recentIncidents || 1,
                    interventionsReceived: issue.student.interventionsReceived || 0,
                    lastIncidentDate: issue.dateOccurred,
                  });
                }
              });
            }
          }
        } catch (disciplineError) {
          console.error('❌ [StudentProfiles] Error fetching discipline issues:', disciplineError);
        }
      }

      const finalStudents = Array.from(allStudents.values());
      console.log('✅ [StudentProfiles] Final student list:', {
        totalStudents: finalStudents.length,
        students: finalStudents.map(s => ({ id: s.studentId, name: s.studentName, risk: s.riskLevel }))
      });

      setStudentProfiles(finalStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchStudentProfile = async (studentId: number) => {
    try {
      setIsLoadingProfile(true);
      console.log('👤 [StudentProfiles] Fetching detailed profile for student ID:', studentId);
      
      const response = await fetch(
        `${API_BASE_URL}/discipline-master/student-profile/${studentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📋 [StudentProfiles] Student profile response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch student profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 [StudentProfiles] Student profile data:', data);
      setDetailedProfile(data.data);
    } catch (err) {
      console.error('❌ [StudentProfiles] Error fetching student profile:', err);
      Alert.alert('Error', 'Failed to load student profile details');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStudentsBySubClass();
    setIsRefreshing(false);
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch students when component mounts
  useEffect(() => {
    fetchStudentsBySubClass();
  }, []);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#f1c40f';
      default: return '#95a5a6';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESSFUL': return '#27ae60';
      case 'PARTIALLY_SUCCESSFUL': return '#f39c12';
      case 'UNSUCCESSFUL': return '#e74c3c';
      default: return '#3498db';
    }
  };

  // Calculate risk distribution with fallback for missing data
  const calculateRiskLevel = (student: StudentProfile): 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' => {
    if (student.riskLevel && student.riskLevel !== 'NONE') {
      console.log('🎯 [StudentProfiles] Using existing risk level for', student.studentName, ':', student.riskLevel);
      return student.riskLevel;
    }
    
    // Fallback calculation based on behavior metrics
    const { behaviorScore, totalIncidents, recentIncidents } = student;
    
    console.log('🔢 [StudentProfiles] Calculating risk for', student.studentName, ':', {
      behaviorScore,
      totalIncidents,
      recentIncidents
    });
    
    let calculatedRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    
    if (behaviorScore < 50 || totalIncidents >= 5 || recentIncidents >= 3) {
      calculatedRisk = 'HIGH';
    } else if (behaviorScore < 70 || totalIncidents >= 3 || recentIncidents >= 2) {
      calculatedRisk = 'MEDIUM';
    } else if (behaviorScore < 85 || totalIncidents >= 1 || recentIncidents >= 1) {
      calculatedRisk = 'LOW';
    } else {
      calculatedRisk = 'NONE';
    }
    
    console.log('✅ [StudentProfiles] Calculated risk for', student.studentName, ':', calculatedRisk);
    return calculatedRisk;
  };

  const filteredStudents = studentProfiles.filter(student => {
    // Safety check for undefined values before calling toLowerCase
    const studentName = student.studentName || '';
    const matricule = student.matricule || '';
    const query = searchQuery || '';
    
    const matchesSearch = studentName.toLowerCase().includes(query.toLowerCase()) ||
                         matricule.toLowerCase().includes(query.toLowerCase());
    
    const riskLevel = calculateRiskLevel(student);
    
    switch (activeTab) {
      case 'high-risk':
        return matchesSearch && riskLevel === 'HIGH';
      case 'medium-risk':
        return matchesSearch && riskLevel === 'MEDIUM';
      case 'low-risk':
        return matchesSearch && (riskLevel === 'LOW' || riskLevel === 'NONE');
      case 'all':
        return matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const riskCounts = {
    high: studentProfiles.filter(s => calculateRiskLevel(s) === 'HIGH').length,
    medium: studentProfiles.filter(s => calculateRiskLevel(s) === 'MEDIUM').length,
    low: studentProfiles.filter(s => ['LOW', 'NONE'].includes(calculateRiskLevel(s))).length,
  };

  // Log component state when rendering
  console.log('🎨 [StudentProfiles] Component render state:', {
    totalStudents: studentProfiles.length,
    filteredStudents: filteredStudents.length,
    activeTab,
    searchQuery,
    riskCounts,
    isLoadingStudents,
    isLoadingClasses,
    error
  });

  const handleViewProfile = async (student: StudentProfile) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
    await fetchStudentProfile(student.studentId);
  };

  const handleCreateIntervention = (student: StudentProfile) => {
    setSelectedStudent(student);
    setShowInterventionModal(true);
    // Reset form
    setInterventionType('');
    setInterventionDescription('');
    setAssignedTo('');
  };

  const createIntervention = async (interventionData: {
    type: string;
    description: string;
    assignedTo: string;
    studentId: number;
  }) => {
    try {
      console.log('🔧 [StudentProfiles] Creating intervention:', interventionData);
      
      const response = await fetch(`${API_BASE_URL}/discipline-master/interventions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interventionData),
      });

      console.log('🔧 [StudentProfiles] Intervention creation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔧 [StudentProfiles] Intervention creation failed:', errorText);
        throw new Error(`Failed to create intervention: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔧 [StudentProfiles] Intervention created successfully:', data);
      Alert.alert('Success', 'Intervention plan created successfully');
      setShowInterventionModal(false);
      
      // Refresh the student list to show updated data
      await fetchStudentsBySubClass();
    } catch (error) {
      console.error('❌ [StudentProfiles] Error creating intervention:', error);
      Alert.alert('Error', 'Failed to create intervention plan. Please try again.');
    }
  };

  const handleContactParent = (student: StudentProfile) => {
    Alert.alert(
      'Contact Parent',
      `Contact parent of ${student.studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling...', 'Calling parent') },
        { text: 'SMS', onPress: () => Alert.alert('SMS Sent', 'Behavioral concern message sent') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c0392b" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>👥 Student Profiles</Text>
          <Text style={styles.headerSubtitle}>Behavioral Management</Text>
        </View>
      </View>

            {/* Data Source Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>📊 Student Data Sources</Text>
        <Text style={styles.infoText}>
          Data from: Dashboard urgent interventions, Early warning system, Risk assessment, and Discipline records
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or matricule..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Risk Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: '#e74c3c' }]}>
            <Text style={styles.statNumber}>{riskCounts.high}</Text>
            <Text style={styles.statLabel}>High Risk</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#f39c12' }]}>
            <Text style={styles.statNumber}>{riskCounts.medium}</Text>
            <Text style={styles.statLabel}>Medium Risk</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#f1c40f' }]}>
            <Text style={styles.statNumber}>{riskCounts.low}</Text>
            <Text style={styles.statLabel}>Low Risk</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'high-risk' && styles.activeTab]}
          onPress={() => setActiveTab('high-risk')}
        >
          <Text style={[styles.tabText, activeTab === 'high-risk' && styles.activeTabText]}>
            High Risk ({riskCounts.high})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'medium-risk' && styles.activeTab]}
          onPress={() => setActiveTab('medium-risk')}
        >
          <Text style={[styles.tabText, activeTab === 'medium-risk' && styles.activeTabText]}>
            Medium ({riskCounts.medium})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'low-risk' && styles.activeTab]}
          onPress={() => setActiveTab('low-risk')}
        >
          <Text style={[styles.tabText, activeTab === 'low-risk' && styles.activeTabText]}>
            Low Risk ({riskCounts.low})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#c0392b']}
            tintColor="#c0392b"
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'high-risk' ? '🚨 High Risk Students' :
             activeTab === 'medium-risk' ? '⚠️ Medium Risk Students' :
             '✅ Low Risk Students'}
          </Text>
          
          {isLoadingStudents ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#c0392b" />
              <Text style={styles.loadingText}>Loading students...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>{error}</Text>
                             <TouchableOpacity style={styles.retryButton} onPress={() => fetchStudentsBySubClass()}>
                 <Text style={styles.retryButtonText}>Retry</Text>
               </TouchableOpacity>
            </View>
          ) : filteredStudents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No students found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'No students in this risk category'}
              </Text>
            </View>
          ) : (
            filteredStudents.map((student) => (
              <View key={student.studentId} style={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.studentName}</Text>
                    <Text style={styles.studentClass}>{student.className} • {student.matricule}</Text>
                  </View>
                                  <View style={[
                  styles.riskBadge,
                  { backgroundColor: getRiskColor(calculateRiskLevel(student)) }
                ]}>
                  <Text style={styles.riskText}>{calculateRiskLevel(student)}</Text>
                </View>
                </View>

                <View style={styles.studentStats}>
                  <View style={styles.statColumn}>
                    <Text style={styles.statValue}>{student.totalIncidents}</Text>
                    <Text style={styles.statKey}>Total Issues</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={styles.statValue}>{student.recentIncidents}</Text>
                    <Text style={styles.statKey}>Recent (30d)</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={[styles.statValue, { color: getScoreColor(student.behaviorScore) }]}>
                      {student.behaviorScore}%
                    </Text>
                    <Text style={styles.statKey}>Behavior Score</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={styles.statValue}>{student.interventionsReceived}</Text>
                    <Text style={styles.statKey}>Interventions</Text>
                  </View>
                </View>

                {student.lastIncidentDate && (
                  <Text style={styles.lastIncident}>
                    📅 Last incident: {student.lastIncidentDate}
                  </Text>
                )}

                {/* The 'notes' field is not directly available in the new StudentProfile interface,
                    so we'll display a placeholder or remove it if not needed.
                    For now, we'll keep it as is, but it might need adjustment based on the API. */}
                {/* {student.notes && (
                  <Text style={styles.notes}>💭 {student.notes}</Text>
                )} */}

                <View style={styles.studentActions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewProfile(student)}
                  >
                    <Text style={styles.viewButtonText}>View Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.interventionButton}
                    onPress={() => handleCreateIntervention(student)}
                  >
                    <Text style={styles.interventionButtonText}>New Plan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => handleContactParent(student)}
                  >
                    <Text style={styles.contactButtonText}>Contact</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add extra padding for bottom navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Student Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📋 Student Profile</Text>
            
            {isLoadingProfile ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color="#c0392b" />
                <Text style={styles.loadingText}>Loading profile...</Text>
              </View>
            ) : detailedProfile ? (
              <>
                <View style={styles.profileHeader}>
                  <Text style={styles.profileName}>{detailedProfile.studentName}</Text>
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskColor(detailedProfile.riskLevel) }
                  ]}>
                    <Text style={styles.riskText}>{detailedProfile.riskLevel}</Text>
                  </View>
                </View>

                <Text style={styles.profileDetail}>📚 Class: {detailedProfile.className}</Text>
                <Text style={styles.profileDetail}>🆔 Matricule: {detailedProfile.matricule}</Text>
                <Text style={styles.profileDetail}>
                  📊 Behavior Score: 
                  <Text style={{ color: getScoreColor(detailedProfile.behaviorScore) }}>
                    {' '}{detailedProfile.behaviorScore}%
                  </Text>
                </Text>

                <View style={styles.profileStats}>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatNumber}>{detailedProfile.totalIncidents}</Text>
                    <Text style={styles.profileStatLabel}>Total Incidents</Text>
                  </View>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatNumber}>{detailedProfile.interventionsReceived}</Text>
                    <Text style={styles.profileStatLabel}>Interventions</Text>
                  </View>
                </View>

                {detailedProfile.behaviorPattern && (
                  <View style={styles.behaviorSection}>
                    <Text style={styles.behaviorTitle}>📊 Behavior Pattern:</Text>
                    {detailedProfile.behaviorPattern.mostCommonIssues.length > 0 && (
                      <View style={styles.behaviorItem}>
                        <Text style={styles.behaviorLabel}>Most Common Issues:</Text>
                        <Text style={styles.behaviorText}>
                          {detailedProfile.behaviorPattern.mostCommonIssues.join(', ')}
                        </Text>
                      </View>
                    )}
                    {detailedProfile.behaviorPattern.strengths.length > 0 && (
                      <View style={styles.behaviorItem}>
                        <Text style={styles.behaviorLabel}>Strengths:</Text>
                        <Text style={styles.behaviorText}>
                          {detailedProfile.behaviorPattern.strengths.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <Text style={styles.interventionsTitle}>🔧 Recent Interventions:</Text>
                {detailedProfile.interventionHistory && detailedProfile.interventionHistory.length > 0 ? (
                  detailedProfile.interventionHistory
                    .slice(0, 3)
                    .map((intervention) => (
                      <View key={intervention.id} style={styles.interventionItem}>
                        <Text style={styles.interventionType}>{intervention.type}</Text>
                        <Text style={styles.interventionDate}>{intervention.date}</Text>
                        <View style={[
                          styles.outcomeBadge,
                          { backgroundColor: getOutcomeColor(intervention.outcome) }
                        ]}>
                          <Text style={styles.outcomeText}>{intervention.outcome}</Text>
                        </View>
                      </View>
                    ))
                ) : (
                  <Text style={styles.noInterventionsText}>No recent interventions found.</Text>
                )}

                {detailedProfile.recommendedActions && detailedProfile.recommendedActions.length > 0 && (
                  <View style={styles.recommendedSection}>
                    <Text style={styles.recommendedTitle}>🎯 Recommended Actions:</Text>
                    {detailedProfile.recommendedActions.slice(0, 3).map((action, index) => (
                      <View key={`${action.action}-${action.priority}-${index}`} style={styles.recommendedItem}>
                        <View style={[
                          styles.priorityBadge,
                          { backgroundColor: action.priority === 'HIGH' ? '#e74c3c' : action.priority === 'MEDIUM' ? '#f39c12' : '#27ae60' }
                        ]}>
                          <Text style={styles.priorityText}>{action.priority}</Text>
                        </View>
                        <Text style={styles.actionText}>{action.action}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : selectedStudent ? (
              <>
                <View style={styles.profileHeader}>
                  <Text style={styles.profileName}>{selectedStudent.studentName}</Text>
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskColor(selectedStudent.riskLevel) }
                  ]}>
                    <Text style={styles.riskText}>{selectedStudent.riskLevel}</Text>
                  </View>
                </View>

                <Text style={styles.profileDetail}>📚 Class: {selectedStudent.className}</Text>
                <Text style={styles.profileDetail}>🆔 Matricule: {selectedStudent.matricule}</Text>
                <Text style={styles.profileDetail}>
                  📊 Behavior Score: 
                  <Text style={{ color: getScoreColor(selectedStudent.behaviorScore) }}>
                    {' '}{selectedStudent.behaviorScore}%
                  </Text>
                </Text>

                <View style={styles.profileStats}>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatNumber}>{selectedStudent.totalIncidents}</Text>
                    <Text style={styles.profileStatLabel}>Total Incidents</Text>
                  </View>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatNumber}>{selectedStudent.interventionsReceived}</Text>
                    <Text style={styles.profileStatLabel}>Interventions</Text>
                  </View>
                </View>

                <Text style={styles.noInterventionsText}>Loading detailed profile...</Text>
              </>
            ) : null}

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowProfileModal(false);
                setDetailedProfile(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Intervention Modal */}
      <Modal
        visible={showInterventionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInterventionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔧 Create Intervention Plan</Text>
            
            {selectedStudent && (
              <Text style={styles.interventionStudent}>
                Student: {selectedStudent.studentName} ({selectedStudent.className})
              </Text>
            )}

            <Text style={styles.inputLabel}>Intervention Type</Text>
            <View style={styles.typeGrid}>
              {['Behavioral Counseling', 'Parent Conference', 'Peer Mediation', 'Academic Support', 'Mentorship Program'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    interventionType === type && styles.selectedOption
                  ]}
                  onPress={() => setInterventionType(type)}
                >
                  <Text style={[
                    styles.typeText,
                    interventionType === type && styles.selectedText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe the intervention plan..."
              multiline
              numberOfLines={3}
              value={interventionDescription}
              onChangeText={setInterventionDescription}
            />

            <Text style={styles.inputLabel}>Assigned To</Text>
            <TextInput
              style={styles.textInput}
              placeholder="School Counselor, Teacher, etc."
              value={assignedTo}
              onChangeText={setAssignedTo}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowInterventionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  (!interventionType || !interventionDescription || !assignedTo || isCreatingIntervention) && styles.disabledButton
                ]}
                onPress={async () => {
                  if (!interventionType || !interventionDescription || !assignedTo || !selectedStudent) {
                    Alert.alert('Error', 'Please fill in all required fields');
                    return;
                  }
                  
                  setIsCreatingIntervention(true);
                  await createIntervention({
                    type: interventionType,
                    description: interventionDescription,
                    assignedTo: assignedTo,
                    studentId: selectedStudent.studentId,
                  });
                  setIsCreatingIntervention(false);
                }}
                disabled={!interventionType || !interventionDescription || !assignedTo || isCreatingIntervention}
              >
                {isCreatingIntervention ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Create Plan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Messaging FAB
      <MessagingFAB
        token={token}
        user={user}
        onNavigate={onNavigate}
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#c0392b',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
  tabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#c0392b',
  },
  tabText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#c0392b',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  studentClass: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statColumn: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statKey: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  lastIncident: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
    fontStyle: 'italic',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
  },
  studentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  interventionButton: {
    flex: 1,
    backgroundColor: '#8e44ad',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  interventionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  profileDetail: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 16,
  },
  profileStatItem: {
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c0392b',
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  notesSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  interventionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  interventionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  interventionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    flex: 1,
  },
  interventionDate: {
    fontSize: 12,
    color: '#6c757d',
    marginRight: 8,
  },
  outcomeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  outcomeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  interventionStudent: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  typeText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#c0392b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  bottomPadding: {
    height: 80,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#6c757d',
    fontSize: 16,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noInterventionsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 10,
  },
  // Info container styles
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  // Selector styles
  selectorContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectorRow: {
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  selectorDropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    backgroundColor: '#c0392b',
    borderColor: '#c0392b',
  },
  selectorText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
  },
  // Behavior pattern styles
  behaviorSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  behaviorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  behaviorItem: {
    marginBottom: 8,
  },
  behaviorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  behaviorText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  // Recommended actions styles
  recommendedSection: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  recommendedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  recommendedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  actionText: {
    fontSize: 12,
    color: '#2c3e50',
    flex: 1,
  },
});

export default StudentProfilesScreen; 