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
  Modal,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';

import { API_BASE_URL } from '../../constants';
import MessagingFAB from './MessagingFAB';

interface DisciplineReportsScreenProps {
  token: string;
  user: any;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  category: 'OVERVIEW' | 'DETAILED' | 'ANALYTICS' | 'COMPLIANCE';
  action?: () => void;
}

interface ReportData {
  period: string;
  totalIncidents: number;
  resolved: number;
  pending: number;
  avgResolutionTime: number;
  topIssues: { type: string; count: number }[];
  trends: { direction: 'UP' | 'DOWN' | 'STABLE'; percentage: number };
}

interface LatenessRecord {
  id: number;
  student: {
    id: number;
    name: string;
    matricule: string;
    class: string;
  };
  arrivalTime: string;
  date: string;
  reason: string;
  createdAt: string;
}

interface DisciplineIncident {
  id: number;
  student: {
    id: number;
    name: string;
    matricule: string;
    class: string;
  };
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'RESOLVED' | 'ESCALATED';
  dateOccurred: string;
  createdAt: string;
}

const DisciplineReportsScreen: React.FC<DisciplineReportsScreenProps> = ({
  token,
  user,
  onNavigateBack,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState('quick');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showLatenessReport, setShowLatenessReport] = useState(false);
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  
  // Data states
  const [analyticsData, setAnalyticsData] = useState<ReportData>({
    period: 'Current Month',
    totalIncidents: 0,
    resolved: 0,
    pending: 0,
    avgResolutionTime: 0,
    topIssues: [],
    trends: { direction: 'STABLE', percentage: 0 }
  });
  
  const [latenessRecords, setLatenessRecords] = useState<LatenessRecord[]>([]);
  const [disciplineIncidents, setDisciplineIncidents] = useState<DisciplineIncident[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingLateness, setIsLoadingLateness] = useState(false);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock report templates with real actions
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'record-lateness',
      title: 'Record Morning Lateness',
      description: 'Log students who arrived late today and optionally notify parents.',
      icon: '⏰',
      type: 'DAILY',
      category: 'OVERVIEW',
      action: () => onNavigate('RecordLatenessScreen', { token, user })
    },
    {
      id: 'lateness-report',
      title: 'Lateness Report',
      description: 'View all lateness records and patterns',
      icon: '📅',
      type: 'DAILY',
      category: 'OVERVIEW',
      action: () => {
        setShowLatenessReport(true);
        fetchLatenessRecords();
      }
    },
    {
      id: 'incident-report',
      title: 'Incident Report',
      description: 'View all discipline incidents and their status',
      icon: '🚨',
      type: 'DAILY',
      category: 'OVERVIEW',
      action: () => {
        setShowIncidentReport(true);
        fetchDisciplineIncidents();
      }
    },
    {
      id: 'weekly-trends',
      title: 'Weekly Trends',
      description: 'Behavioral patterns and incident analysis',
      icon: '📈',
      type: 'WEEKLY',
      category: 'ANALYTICS'
    },
    {
      id: 'monthly-report',
      title: 'Monthly Report',
      description: 'Comprehensive monthly discipline summary',
      icon: '📊',
      type: 'MONTHLY',
      category: 'DETAILED'
    },
    {
      id: 'student-profile',
      title: 'Student Profiles',
      description: 'Individual behavioral assessment reports',
      icon: '👤',
      type: 'CUSTOM',
      category: 'DETAILED',
      action: () => onNavigate('StudentProfilesScreen', { token, user })
    },
    {
      id: 'intervention-effectiveness',
      title: 'Intervention Analysis',
      description: 'Success rates and effectiveness metrics',
      icon: '🔧',
      type: 'MONTHLY',
      category: 'ANALYTICS'
    },
    {
      id: 'parent-communication',
      title: 'Parent Communications',
      description: 'Log of all parent contacts and responses',
      icon: '📞',
      type: 'CUSTOM',
      category: 'COMPLIANCE'
    },
    {
      id: 'class-analysis',
      title: 'Class Analysis',
      description: 'Discipline patterns by class and teacher',
      icon: '🏫',
      type: 'CUSTOM',
      category: 'ANALYTICS'
    }
  ];

  // API Functions
  const fetchAnalyticsData = async () => {
    try {
      setIsLoadingAnalytics(true);
      console.log('📊 [DisciplineReports] Fetching analytics data...');
      
      const response = await fetch(`${API_BASE_URL}/discipline-master/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📈 [DisciplineReports] Analytics data:', data);
        
        if (data.data) {
          setAnalyticsData({
            period: 'Current Month',
            totalIncidents: data.data.totalIncidents || 0,
            resolved: data.data.resolvedIncidents || 0,
            pending: data.data.pendingIncidents || 0,
            avgResolutionTime: data.data.avgResolutionTime || 0,
            topIssues: data.data.topIssues || [
              { type: 'Morning Lateness', count: data.data.latenessCount || 0 },
              { type: 'Misconduct', count: data.data.misconductCount || 0 },
              { type: 'Absence', count: data.data.absenceCount || 0 }
            ],
            trends: data.data.trends || { direction: 'STABLE', percentage: 0 }
          });
        }
      }
    } catch (error) {
      console.error('❌ [DisciplineReports] Error fetching analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchLatenessRecords = async () => {
    try {
      setIsLoadingLateness(true);
      console.log('⏰ [DisciplineReports] Fetching lateness records...');
      
      const response = await fetch(`${API_BASE_URL}/discipline/lateness`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📝 [DisciplineReports] Lateness records:', data);
        
        if (data.data) {
          setLatenessRecords(data.data);
        }
      }
    } catch (error) {
      console.error('❌ [DisciplineReports] Error fetching lateness records:', error);
    } finally {
      setIsLoadingLateness(false);
    }
  };

  const fetchDisciplineIncidents = async () => {
    try {
      setIsLoadingIncidents(true);
      console.log('🚨 [DisciplineReports] Fetching discipline incidents...');
      
      const response = await fetch(`${API_BASE_URL}/discipline/incidents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 [DisciplineReports] Discipline incidents:', data);
        
        if (data.data) {
          setDisciplineIncidents(data.data);
        }
      }
    } catch (error) {
      console.error('❌ [DisciplineReports] Error fetching discipline incidents:', error);
    } finally {
      setIsLoadingIncidents(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalyticsData();
    setIsRefreshing(false);
  };

  // Initialize data
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const quickReports = reportTemplates.filter(r => r.category === 'OVERVIEW');
  const detailedReports = reportTemplates.filter(r => r.category === 'DETAILED');
  const analyticsReports = reportTemplates.filter(r => r.category === 'ANALYTICS');
  const complianceReports = reportTemplates.filter(r => r.category === 'COMPLIANCE');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DAILY': return '#27ae60';
      case 'WEEKLY': return '#3498db';
      case 'MONTHLY': return '#8e44ad';
      case 'CUSTOM': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'UP': return '📈';
      case 'DOWN': return '📉';
      default: return '➡️';
    }
  };

  const handleGenerateReport = (report: ReportTemplate) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleQuickGenerate = (reportId: string) => {
    Alert.alert(
      'Generate Report',
      'Report is being generated...',
      [
        { text: 'View', onPress: () => Alert.alert('Report Ready', 'Report has been generated successfully') },
        { text: 'Email', onPress: () => Alert.alert('Email Sent', 'Report has been emailed to principal') },
        { text: 'Later', style: 'cancel' }
      ]
    );
  };

  const renderReportCard = (report: ReportTemplate) => (
    <TouchableOpacity
      key={report.id}
      style={styles.reportCard}
      onPress={report.action ? report.action : () => handleGenerateReport(report)}
    >
      <View style={styles.reportHeader}>
        <Text style={styles.reportIcon}>{report.icon}</Text>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(report.type) }]}>
          <Text style={styles.typeText}>{report.type}</Text>
        </View>
      </View>
      <Text style={styles.reportTitle}>{report.title}</Text>
      <Text style={styles.reportDescription}>{report.description}</Text>
      {!report.action && (
        <TouchableOpacity
          style={styles.quickGenerateButton}
          onPress={(e) => {
            e.stopPropagation();
            handleQuickGenerate(report.id);
          }}
        >
          <Text style={styles.quickGenerateText}>Quick Generate</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c0392b" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📊 Discipline Reports</Text>
          <Text style={styles.headerSubtitle}>Analytics & Documentation</Text>
        </View>
        <TouchableOpacity 
          style={styles.analyticsButton}
          onPress={() => setShowAnalytics(true)}
        >
          <Text style={styles.analyticsIcon}>📈</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 This Month Summary</Text>
        {isLoadingAnalytics ? (
          <View style={styles.loadingStats}>
            <ActivityIndicator size="large" color="#c0392b" />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statItem, { backgroundColor: '#3498db' }]}>
                <Text style={styles.statNumber}>{analyticsData.totalIncidents}</Text>
                <Text style={styles.statLabel}>Total Issues</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: '#27ae60' }]}>
                <Text style={styles.statNumber}>{analyticsData.resolved}</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: '#f39c12' }]}>
                <Text style={styles.statNumber}>{analyticsData.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: '#8e44ad' }]}>
                <Text style={styles.statNumber}>{analyticsData.avgResolutionTime}d</Text>
                <Text style={styles.statLabel}>Avg Resolution</Text>
              </View>
            </View>
            <View style={styles.trendContainer}>
              <Text style={styles.trendText}>
                {getTrendIcon(analyticsData.trends.direction)} Incidents {analyticsData.trends.direction === 'DOWN' ? 'decreased' : 'increased'} by {analyticsData.trends.percentage}% vs last month
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'quick' && styles.activeTab]}
          onPress={() => setActiveTab('quick')}
        >
          <Text style={[styles.tabText, activeTab === 'quick' && styles.activeTabText]}>Quick</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'detailed' && styles.activeTab]}
          onPress={() => setActiveTab('detailed')}
        >
          <Text style={[styles.tabText, activeTab === 'detailed' && styles.activeTabText]}>Detailed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'compliance' && styles.activeTab]}
          onPress={() => setActiveTab('compliance')}
        >
          <Text style={[styles.tabText, activeTab === 'compliance' && styles.activeTabText]}>Compliance</Text>
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
        {activeTab === 'quick' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Quick Reports</Text>
            <Text style={styles.sectionSubtitle}>Generate common reports instantly</Text>
            
            <View style={styles.reportsGrid}>
              {quickReports.map(renderReportCard)}
            </View>
          </View>
        )}

        {activeTab === 'detailed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📄 Detailed Reports</Text>
            <Text style={styles.sectionSubtitle}>Comprehensive analysis and documentation</Text>
            
            <View style={styles.reportsGrid}>
              {detailedReports.map(renderReportCard)}
            </View>
          </View>
        )}

        {activeTab === 'analytics' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Analytics Reports</Text>
            <Text style={styles.sectionSubtitle}>Trends, patterns, and insights</Text>
            
            <View style={styles.reportsGrid}>
              {analyticsReports.map(renderReportCard)}
            </View>
          </View>
        )}

        {activeTab === 'compliance' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Compliance Reports</Text>
            <Text style={styles.sectionSubtitle}>Documentation for audit and legal requirements</Text>
            
            <View style={styles.reportsGrid}>
              {complianceReports.map(renderReportCard)}
            </View>
          </View>
        )}

        {/* Add extra padding for bottom navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Report Generation Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReport && (
              <>
                <Text style={styles.modalTitle}>Generate Report</Text>
                
                <View style={styles.reportPreview}>
                  <Text style={styles.previewIcon}>{selectedReport.icon}</Text>
                  <Text style={styles.previewTitle}>{selectedReport.title}</Text>
                  <Text style={styles.previewDescription}>{selectedReport.description}</Text>
                </View>

                <View style={styles.optionsSection}>
                  <Text style={styles.optionsTitle}>Report Options:</Text>
                  
                  <View style={styles.option}>
                    <Text style={styles.optionLabel}>📅 Date Range:</Text>
                    <TouchableOpacity style={styles.optionButton}>
                      <Text style={styles.optionButtonText}>Last 30 days ▼</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.option}>
                    <Text style={styles.optionLabel}>📄 Format:</Text>
                    <View style={styles.formatOptions}>
                      <TouchableOpacity style={[styles.formatButton, styles.selectedFormat]}>
                        <Text style={styles.formatText}>PDF</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.formatButton}>
                        <Text style={styles.formatText}>Excel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.formatButton}>
                        <Text style={styles.formatText}>Summary</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.option}>
                    <Text style={styles.optionLabel}>📧 Distribution:</Text>
                    <View style={styles.distributionOptions}>
                      <TouchableOpacity style={styles.checkOption}>
                        <Text style={styles.checkBox}>✅</Text>
                        <Text style={styles.checkLabel}>Principal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.checkOption}>
                        <Text style={styles.checkBox}>☑️</Text>
                        <Text style={styles.checkLabel}>Vice Principal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.checkOption}>
                        <Text style={styles.checkBox}>☐</Text>
                        <Text style={styles.checkLabel}>Super Manager</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowReportModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.generateButton}
                    onPress={() => {
                      setShowReportModal(false);
                      Alert.alert('Report Generated', 'Report has been generated and distributed successfully');
                    }}
                  >
                    <Text style={styles.generateButtonText}>Generate Report</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        visible={showAnalytics}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAnalytics(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📈 Live Analytics</Text>
            
            <View style={styles.analyticsSection}>
              <Text style={styles.analyticsTitle}>Top Issues This Month</Text>
              {analyticsData.topIssues.map((issue, index) => (
                <View key={index} style={styles.issueRow}>
                  <Text style={styles.issueRank}>#{index + 1}</Text>
                  <Text style={styles.issueType}>{issue.type}</Text>
                  <Text style={styles.issueCount}>{issue.count}</Text>
                  <View style={styles.issueBar}>
                    <View 
                      style={[
                        styles.issueBarFill, 
                        { width: `${(issue.count / analyticsData.topIssues[0].count) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.analyticsSection}>
              <Text style={styles.analyticsTitle}>Resolution Rate</Text>
              <View style={styles.resolutionStats}>
                <Text style={styles.resolutionRate}>
                  {Math.round((analyticsData.resolved / analyticsData.totalIncidents) * 100)}%
                </Text>
                <Text style={styles.resolutionLabel}>
                  {analyticsData.resolved} of {analyticsData.totalIncidents} cases resolved
                </Text>
              </View>
            </View>

            <View style={styles.analyticsSection}>
              <Text style={styles.analyticsTitle}>Trend Analysis</Text>
              <View style={styles.trendAnalysis}>
                <Text style={styles.trendIcon}>{getTrendIcon(analyticsData.trends.direction)}</Text>
                <Text style={styles.trendDescription}>
                  Incidents have {analyticsData.trends.direction === 'DOWN' ? 'decreased' : 'increased'} by {analyticsData.trends.percentage}% compared to last month, indicating {analyticsData.trends.direction === 'DOWN' ? 'improving' : 'concerning'} behavioral trends.
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAnalytics(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lateness Report Modal */}
      <Modal
        visible={showLatenessReport}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLatenessReport(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📅 Lateness Records</Text>
            {isLoadingLateness ? (
              <ActivityIndicator size="large" color="#c0392b" />
            ) : latenessRecords.length === 0 ? (
              <Text style={styles.noDataText}>No lateness records found for this period.</Text>
            ) : (
              <FlatList
                data={latenessRecords}
                renderItem={({ item }) => (
                  <View style={styles.latenessRecordItem}>
                    <Text style={styles.latenessRecordStudentName}>{item.student.name}</Text>
                    <Text style={styles.latenessRecordMatricule}>Matricule: {item.student.matricule}</Text>
                    <Text style={styles.latenessRecordClass}>Class: {item.student.class}</Text>
                    <Text style={styles.latenessRecordTime}>Arrival Time: {item.arrivalTime}</Text>
                    <Text style={styles.latenessRecordDate}>Date: {item.date}</Text>
                    <Text style={styles.latenessRecordReason}>Reason: {item.reason}</Text>
                    <Text style={styles.latenessRecordCreatedAt}>Created At: {item.createdAt}</Text>
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                  <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
              />
            )}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowLatenessReport(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Incident Report Modal */}
      <Modal
        visible={showIncidentReport}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowIncidentReport(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📋 Discipline Incidents</Text>
            {isLoadingIncidents ? (
              <ActivityIndicator size="large" color="#c0392b" />
            ) : disciplineIncidents.length === 0 ? (
              <Text style={styles.noDataText}>No discipline incidents found for this period.</Text>
            ) : (
              <FlatList
                data={disciplineIncidents}
                renderItem={({ item }) => (
                  <View style={styles.incidentRecordItem}>
                    <Text style={styles.incidentRecordStudentName}>{item.student.name}</Text>
                    <Text style={styles.incidentRecordMatricule}>Matricule: {item.student.matricule}</Text>
                    <Text style={styles.incidentRecordClass}>Class: {item.student.class}</Text>
                    <Text style={styles.incidentRecordType}>Type: {item.type}</Text>
                    <Text style={styles.incidentRecordDescription}>Description: {item.description}</Text>
                    <Text style={styles.incidentRecordSeverity}>Severity: {item.severity}</Text>
                    <Text style={styles.incidentRecordStatus}>Status: {item.status}</Text>
                    <Text style={styles.incidentRecordDateOccurred}>Date Occurred: {item.dateOccurred}</Text>
                    <Text style={styles.incidentRecordCreatedAt}>Created At: {item.createdAt}</Text>
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                  <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
              />
            )}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowIncidentReport(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Messaging FAB */}
      <MessagingFAB
        token={token}
        user={user}
        onNavigate={onNavigate}
      />
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
  analyticsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsIcon: {
    fontSize: 20,
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
  trendContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
  },
  loadingStats: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  reportsGrid: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportIcon: {
    fontSize: 24,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    lineHeight: 20,
  },
  quickGenerateButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickGenerateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  reportPreview: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  previewIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  optionsSection: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  option: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  formatOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  formatButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  selectedFormat: {
    backgroundColor: '#c0392b',
    borderColor: '#c0392b',
  },
  formatText: {
    fontSize: 14,
    color: '#495057',
  },
  distributionOptions: {
    gap: 8,
  },
  checkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkBox: {
    fontSize: 16,
  },
  checkLabel: {
    fontSize: 14,
    color: '#495057',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  generateButton: {
    flex: 1,
    backgroundColor: '#c0392b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analyticsSection: {
    marginBottom: 20,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueRank: {
    width: 24,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c0392b',
  },
  issueType: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
  },
  issueCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    width: 32,
    textAlign: 'right',
  },
  issueBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginLeft: 8,
  },
  issueBarFill: {
    height: '100%',
    backgroundColor: '#c0392b',
    borderRadius: 2,
  },
  resolutionStats: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  resolutionRate: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  resolutionLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  trendAnalysis: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  trendIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  trendDescription: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 80,
  },
  noDataText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 20,
  },
  latenessRecordItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  latenessRecordStudentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  latenessRecordMatricule: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  latenessRecordClass: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  latenessRecordTime: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  latenessRecordDate: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  latenessRecordReason: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  latenessRecordCreatedAt: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  incidentRecordItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  incidentRecordStudentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  incidentRecordMatricule: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  incidentRecordClass: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  incidentRecordType: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  incidentRecordDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  incidentRecordSeverity: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  incidentRecordStatus: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  incidentRecordDateOccurred: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  incidentRecordCreatedAt: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
});

export default DisciplineReportsScreen; 