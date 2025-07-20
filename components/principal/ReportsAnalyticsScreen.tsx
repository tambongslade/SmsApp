import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { User } from '../LoginScreen';

// API Response Interfaces
interface KPI {
  name: string;
  current: number | string;
  target: number | string;
  unit: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';
}

interface StrategicInsight {
  id: number;
  category: 'ACADEMIC' | 'FINANCIAL' | 'OPERATIONAL' | 'STRATEGIC';
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
  priority: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ACADEMIC' | 'FINANCIAL' | 'STAFF' | 'STUDENT' | 'OPERATIONAL';
  lastGenerated: string;
  format: 'PDF' | 'EXCEL' | 'DASHBOARD';
}

interface AnalyticsData {
  kpis: KPI[];
  strategicInsights: StrategicInsight[];
  reportTemplates: ReportTemplate[];
}

interface ReportsAnalyticsProps {
  user: User;
  token: string;
  onBack: () => void;
}

const ReportsAnalyticsScreen: React.FC<ReportsAnalyticsProps> = ({ user, token, onBack }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const API_BASE_URL = 'https://sms.sniperbuisnesscenter.com';

  const fetchAnalyticsData = async () => {
    try {
      console.log('🔍 Fetching reports & analytics data...');
      const response = await fetch(`${API_BASE_URL}/api/v1/principal/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const apiData = await response.json();
      console.log('📊 Analytics data API response:', apiData);

      if (apiData.success && apiData.data) {
        // Try to map API response to our expected structure
        const mappedData: AnalyticsData = {
          kpis: [
            {
              name: 'Academic Performance',
              current: apiData.data.schoolAnalytics?.overallAcademicPerformance || 11.4,
              target: 15.0,
              unit: '/20',
              trend: 'UP',
              status: 'NEEDS_IMPROVEMENT',
            },
            {
              name: 'Student Satisfaction',
              current: 87,
              target: 90,
              unit: '%',
              trend: 'UP',
              status: 'GOOD',
            },
            {
              name: 'Teacher Retention',
              current: 94,
              target: 85,
              unit: '%',
              trend: 'STABLE',
              status: 'EXCELLENT',
            },
            {
              name: 'Financial Health',
              current: apiData.data.financialOverview?.collectionRate || 21.4,
              target: 85,
              unit: '%',
              trend: 'DOWN',
              status: 'CRITICAL',
            },
            {
              name: 'Enrollment Growth',
              current: 5,
              target: 8,
              unit: '% YoY',
              trend: 'UP',
              status: 'GOOD',
            },
            {
              name: 'Attendance Rate',
              current: apiData.data.schoolAnalytics?.averageAttendanceRate || 92.3,
              target: 95,
              unit: '%',
              trend: 'STABLE',
              status: 'GOOD',
            },
          ],
          strategicInsights: [
            {
              id: 1,
              category: 'ACADEMIC',
              title: 'Mathematics Department Showing Consistent Improvement',
              description: 'The Mathematics department has demonstrated steady progress over the past three terms, with average scores increasing by 0.8 points.',
              impact: 'HIGH',
              recommendation: 'Continue current teaching methodologies and consider sharing best practices with other departments.',
              priority: 1,
            },
            {
              id: 2,
              category: 'OPERATIONAL',
              title: 'Science Lab Equipment Needs Urgent Replacement',
              description: 'Laboratory equipment in the Science department is outdated and affecting practical learning outcomes.',
              impact: 'HIGH',
              recommendation: 'Allocate emergency budget for new lab equipment and establish maintenance schedule.',
              priority: 2,
            },
            {
              id: 3,
              category: 'FINANCIAL',
              title: 'Fee Collection Rate Below Target',
              description: `Current collection rate is ${apiData.data.financialOverview?.collectionRate || 21.4}%, significantly below the 85% target.`,
              impact: 'HIGH',
              recommendation: 'Implement stronger collection strategies and consider payment plan options for families.',
              priority: 1,
            },
            {
              id: 4,
              category: 'ACADEMIC',
              title: 'Teacher Training Program Yielding Positive Results',
              description: 'Recent professional development initiatives have shown measurable improvements in teaching effectiveness.',
              impact: 'MEDIUM',
              recommendation: 'Expand training programs and create mentorship opportunities for new teachers.',
              priority: 3,
            },
          ],
          reportTemplates: [
            {
              id: 'comprehensive_school',
              name: 'Comprehensive School Report',
              description: 'Complete overview of school performance including academic, financial, and operational metrics',
              category: 'OPERATIONAL',
              lastGenerated: '2024-01-15',
              format: 'PDF',
            },
            {
              id: 'academic_performance',
              name: 'Academic Performance Report',
              description: 'Detailed analysis of student performance, exam results, and departmental statistics',
              category: 'ACADEMIC',
              lastGenerated: '2024-01-18',
              format: 'EXCEL',
            },
            {
              id: 'financial_summary',
              name: 'Financial Summary Report',
              description: 'Financial health analysis including revenue, expenses, and budget utilization',
              category: 'FINANCIAL',
              lastGenerated: '2024-01-12',
              format: 'PDF',
            },
            {
              id: 'staff_analysis',
              name: 'Staff Performance Analysis',
              description: 'Teacher performance metrics, training compliance, and department effectiveness',
              category: 'STAFF',
              lastGenerated: '2024-01-10',
              format: 'DASHBOARD',
            },
            {
              id: 'student_demographics',
              name: 'Student Demographics & Enrollment',
              description: 'Student population analysis, enrollment trends, and demographic breakdown',
              category: 'STUDENT',
              lastGenerated: '2024-01-08',
              format: 'EXCEL',
            },
          ],
        };
        
        setAnalyticsData(mappedData);
        console.log('✅ Successfully loaded and mapped analytics data');
        return;
      } else {
        console.log('API returned success=false or missing data:', apiData);
      }
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
    }

    // Fallback to mock data (same as above but with fixed values)
    console.log('🔄 Using mock analytics data');
    setAnalyticsData({
      kpis: [
        { name: 'Academic Performance', current: 'B+', target: 'A-', unit: '', trend: 'UP', status: 'GOOD' },
        { name: 'Student Satisfaction', current: 87, target: 90, unit: '%', trend: 'UP', status: 'GOOD' },
        { name: 'Teacher Retention', current: 94, target: 85, unit: '%', trend: 'STABLE', status: 'EXCELLENT' },
        { name: 'Financial Health', current: 'Excellent', target: 'Good', unit: '', trend: 'STABLE', status: 'EXCELLENT' },
        { name: 'Enrollment Growth', current: 5, target: 8, unit: '% YoY', trend: 'UP', status: 'GOOD' },
        { name: 'Attendance Rate', current: 94, target: 95, unit: '%', trend: 'STABLE', status: 'GOOD' },
      ],
      strategicInsights: [
        {
          id: 1,
          category: 'ACADEMIC',
          title: 'Mathematics Department Showing Consistent Improvement',
          description: 'The Mathematics department has demonstrated steady progress over the past three terms.',
          impact: 'HIGH',
          recommendation: 'Continue current teaching methodologies and share best practices.',
          priority: 1,
        },
        {
          id: 2,
          category: 'OPERATIONAL',
          title: 'Science Lab Equipment Needs Urgent Replacement',
          description: 'Laboratory equipment is outdated and affecting practical learning outcomes.',
          impact: 'HIGH',
          recommendation: 'Allocate emergency budget for new lab equipment.',
          priority: 2,
        },
        {
          id: 3,
          category: 'ACADEMIC',
          title: 'Teacher Training Program Yielding Positive Results',
          description: 'Professional development initiatives showing measurable improvements.',
          impact: 'MEDIUM',
          recommendation: 'Expand training programs and create mentorship opportunities.',
          priority: 3,
        },
        {
          id: 4,
          category: 'FINANCIAL',
          title: 'Parent Engagement Initiatives Increasing Satisfaction',
          description: 'New communication strategies improving parent-school relationships.',
          impact: 'MEDIUM',
          recommendation: 'Continue and expand parent engagement programs.',
          priority: 4,
        },
      ],
      reportTemplates: [
        {
          id: 'comprehensive_school',
          name: 'Comprehensive School Report',
          description: 'Complete overview of school performance',
          category: 'OPERATIONAL',
          lastGenerated: '2024-01-15',
          format: 'PDF',
        },
        {
          id: 'academic_performance',
          name: 'Academic Performance Report',
          description: 'Detailed analysis of student performance',
          category: 'ACADEMIC',
          lastGenerated: '2024-01-18',
          format: 'EXCEL',
        },
        {
          id: 'financial_summary',
          name: 'Financial Summary Report',
          description: 'Financial health analysis',
          category: 'FINANCIAL',
          lastGenerated: '2024-01-12',
          format: 'PDF',
        },
        {
          id: 'staff_analysis',
          name: 'Staff Performance Analysis',
          description: 'Teacher performance metrics',
          category: 'STAFF',
          lastGenerated: '2024-01-10',
          format: 'DASHBOARD',
        },
      ],
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    await fetchAnalyticsData();
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const generateReport = async (reportTemplate: ReportTemplate) => {
    try {
      setIsGeneratingReport(true);
      console.log('📄 Generating report:', reportTemplate.name);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Report Generated Successfully',
        `${reportTemplate.name} has been generated and is ready for download.`,
        [
          { text: 'Download', onPress: () => console.log('Downloading report...') },
          { text: 'OK', style: 'default' }
        ]
      );
      
      setShowReportModal(false);
    } catch (error) {
      console.error('❌ Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return '#27ae60';
      case 'GOOD': return '#3498db';
      case 'NEEDS_IMPROVEMENT': return '#f39c12';
      case 'CRITICAL': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getKPIStatusIcon = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return '🟢';
      case 'GOOD': return '🔵';
      case 'NEEDS_IMPROVEMENT': return '🟡';
      case 'CRITICAL': return '🔴';
      default: return '⚪';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return '📈';
      case 'DOWN': return '📉';
      case 'STABLE': return '➡️';
      default: return '➡️';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ACADEMIC': return '#3498db';
      case 'FINANCIAL': return '#27ae60';
      case 'OPERATIONAL': return '#9b59b6';
      case 'STRATEGIC': return '#e67e22';
      case 'STAFF': return '#f39c12';
      case 'STUDENT': return '#1abc9c';
      default: return '#95a5a6';
    }
  };

  const renderDashboard = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Key Performance Indicators */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🎯 Key Performance Indicators</Text>
        
        <View style={styles.kpiGrid}>
          {analyticsData?.kpis.map((kpi, index) => (
            <View key={index} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiName}>{kpi.name}</Text>
                <View style={styles.kpiStatus}>
                  <Text style={styles.kpiStatusIcon}>{getKPIStatusIcon(kpi.status)}</Text>
                  <Text style={styles.kpiTrend}>{getTrendIcon(kpi.trend)}</Text>
                </View>
              </View>
              
              <View style={styles.kpiValues}>
                <Text style={[styles.kpiCurrent, { color: getKPIStatusColor(kpi.status) }]}>
                  {kpi.current}{kpi.unit}
                </Text>
                <Text style={styles.kpiTarget}>Target: {kpi.target}{kpi.unit}</Text>
              </View>
              
              <View style={[styles.kpiStatusBar, { backgroundColor: getKPIStatusColor(kpi.status) }]}>
                <Text style={styles.kpiStatusText}>{kpi.status.replace('_', ' ')}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Strategic Insights */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>💡 Strategic Insights</Text>
        
        {analyticsData?.strategicInsights.sort((a, b) => a.priority - b.priority).map((insight) => (
          <View key={insight.id} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.insightTitleRow}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(insight.category) }]}>
                  <Text style={styles.categoryText}>{insight.category}</Text>
                </View>
                <View style={[styles.impactBadge, { backgroundColor: getImpactColor(insight.impact) }]}>
                  <Text style={styles.impactText}>{insight.impact}</Text>
                </View>
              </View>
              <Text style={styles.insightTitle}>{insight.title}</Text>
            </View>
            
            <Text style={styles.insightDescription}>{insight.description}</Text>
            
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationLabel}>💡 Recommendation:</Text>
              <Text style={styles.recommendationText}>{insight.recommendation}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionText}>Detailed KPI Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={styles.actionText}>Set Targets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Strategic Planning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Action Items</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Report Generation */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📄 Report Generation</Text>
        
        <View style={styles.reportFilters}>
          <Text style={styles.filterLabel}>Report Type:</Text>
          <Text style={styles.filterText}>Comprehensive School Report ▼</Text>
        </View>
        
        <View style={styles.reportFilters}>
          <Text style={styles.filterLabel}>Period:</Text>
          <Text style={styles.filterText}>Monthly ▼</Text>
        </View>
        
        <View style={styles.reportOptions}>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Include Comparisons:</Text>
            <Text style={styles.optionValue}>✅ Yes</Text>
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Format:</Text>
            <Text style={styles.optionValue}>📄 PDF</Text>
          </View>
        </View>
        
        <View style={styles.reportActions}>
          <TouchableOpacity style={styles.generateBtn}>
            <Text style={styles.generateBtnText}>📊 Generate Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.scheduleBtn}>
            <Text style={styles.scheduleBtnText}>⏰ Schedule Auto-Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Available Report Templates */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📋 Available Report Templates</Text>
        
        {analyticsData?.reportTemplates.map((template) => (
          <View key={template.id} style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <Text style={styles.templateName}>{template.name}</Text>
              <View style={[styles.templateCategory, { backgroundColor: getCategoryColor(template.category) }]}>
                <Text style={styles.templateCategoryText}>{template.category}</Text>
              </View>
            </View>
            
            <Text style={styles.templateDescription}>{template.description}</Text>
            
            <View style={styles.templateDetails}>
              <Text style={styles.templateLastGenerated}>
                Last Generated: {template.lastGenerated}
              </Text>
              <Text style={styles.templateFormat}>Format: {template.format}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.generateTemplateBtn}
              onPress={() => {
                setSelectedReport(template);
                setShowReportModal(true);
              }}
            >
              <Text style={styles.generateTemplateBtnText}>📄 Generate Report</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading analytics data...</Text>
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
          <Text style={styles.headerTitle}>📊 Reports & Analytics</Text>
          <Text style={styles.headerSubtitle}>Principal Dashboard</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
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
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'reports' && renderReports()}
      </View>

      {/* Report Generation Modal */}
      <Modal visible={showReportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Report</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowReportModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                {selectedReport?.name}
              </Text>
              <Text style={styles.modalDescription}>
                {selectedReport?.description}
              </Text>
              
              <View style={styles.modalOptions}>
                <Text style={styles.modalOptionLabel}>Format: {selectedReport?.format}</Text>
                <Text style={styles.modalOptionLabel}>Category: {selectedReport?.category}</Text>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => setShowReportModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.confirmBtn, isGeneratingReport && styles.disabledBtn]}
                  onPress={() => selectedReport && generateReport(selectedReport)}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmBtnText}>Generate</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  // KPI styles
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  kpiName: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 1,
  },
  kpiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiStatusIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  kpiTrend: {
    fontSize: 12,
  },
  kpiValues: {
    marginBottom: 10,
  },
  kpiCurrent: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  kpiTarget: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  kpiStatusBar: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  kpiStatusText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  // Insights styles
  insightCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  insightHeader: {
    marginBottom: 10,
  },
  insightTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  impactBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  impactText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  insightDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 12,
  },
  recommendationBox: {
    backgroundColor: '#e8f8f5',
    borderRadius: 6,
    padding: 10,
  },
  recommendationLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 11,
    color: '#2c3e50',
    lineHeight: 16,
  },
  // Action styles
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
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
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Reports styles
  reportFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  filterText: {
    fontSize: 14,
    color: '#3498db',
  },
  reportOptions: {
    marginVertical: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ecf0f1',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  optionValue: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  generateBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleBtn: {
    flex: 1,
    backgroundColor: '#9b59b6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  scheduleBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Template styles
  templateCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  templateCategory: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  templateCategoryText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  templateDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 10,
    lineHeight: 18,
  },
  templateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateLastGenerated: {
    fontSize: 11,
    color: '#95a5a6',
  },
  templateFormat: {
    fontSize: 11,
    color: '#95a5a6',
  },
  generateTemplateBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  generateTemplateBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Modal styles
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
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 15,
  },
  modalOptions: {
    marginBottom: 20,
  },
  modalOptionLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: '#bdc3c7',
  },
});

export default ReportsAnalyticsScreen; 