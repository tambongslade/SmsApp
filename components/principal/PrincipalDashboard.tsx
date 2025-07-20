import React, { useState, useEffect, useCallback, useReducer } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { User } from '../LoginScreen';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: screenWidth } = Dimensions.get('window');

// --- Enhanced Interfaces for comprehensive data ---
interface SchoolAnalytics {
  totalStudents: number;
  totalTeachers: number;
  averageAttendanceRate: number;
  disciplineIssuesThisMonth: number;
  performanceGrowth?: number;
  staffSatisfaction?: number;
}

interface PerformanceMetrics {
  overallGPA: number;
  improvementRate: number;
  subjectPerformance: Array<{
    subject: string;
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  topPerformers: Array<{
    name: string;
    class: string;
    score: number;
  }>;
}

interface FinancialOverview {
  totalRevenue: number;
  totalExpenses: number;
  feeCollectionRate: number;
  outstandingFees: number;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
}

interface DisciplineOverview {
  totalIncidents: number;
  resolvedIncidents: number;
  pendingIncidents: number;
  trendAnalysis: string;
  commonIssues: Array<{
    type: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

interface StaffOverview {
  totalStaff: number;
  presentToday: number;
  onLeave: number;
  performanceRating: number;
  departments: Array<{
    name: string;
    headCount: number;
    vacancies: number;
  }>;
}

interface PriorityAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

// --- Dashboard State Management ---
interface DashboardState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: string | null;
  schoolAnalytics: SchoolAnalytics | null;
  performanceMetrics: PerformanceMetrics | null;
  financialOverview: FinancialOverview | null;
  disciplineOverview: DisciplineOverview | null;
  staffOverview: StaffOverview | null;
  priorityAlerts: PriorityAlert[];
  activeTab: 'overview' | 'analytics' | 'reports' | 'alerts';
}

type DashboardAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SCHOOL_ANALYTICS'; payload: SchoolAnalytics }
  | { type: 'SET_PERFORMANCE_METRICS'; payload: PerformanceMetrics }
  | { type: 'SET_FINANCIAL_OVERVIEW'; payload: FinancialOverview }
  | { type: 'SET_DISCIPLINE_OVERVIEW'; payload: DisciplineOverview }
  | { type: 'SET_STAFF_OVERVIEW'; payload: StaffOverview }
  | { type: 'SET_PRIORITY_ALERTS'; payload: PriorityAlert[] }
  | { type: 'SET_ACTIVE_TAB'; payload: 'overview' | 'analytics' | 'reports' | 'alerts' }
  | { type: 'SET_LAST_UPDATED'; payload: string };

const initialState: DashboardState = {
  loading: true,
  refreshing: false,
  error: null,
  lastUpdated: null,
  schoolAnalytics: null,
  performanceMetrics: null,
  financialOverview: null,
  disciplineOverview: null,
  staffOverview: null,
  priorityAlerts: [],
  activeTab: 'overview',
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SCHOOL_ANALYTICS':
      return { ...state, schoolAnalytics: action.payload };
    case 'SET_PERFORMANCE_METRICS':
      return { ...state, performanceMetrics: action.payload };
    case 'SET_FINANCIAL_OVERVIEW':
      return { ...state, financialOverview: action.payload };
    case 'SET_DISCIPLINE_OVERVIEW':
      return { ...state, disciplineOverview: action.payload };
    case 'SET_STAFF_OVERVIEW':
      return { ...state, staffOverview: action.payload };
    case 'SET_PRIORITY_ALERTS':
      return { ...state, priorityAlerts: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload, loading: false };
    default:
      return state;
  }
}

// --- Props ---
interface PrincipalDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const API_BASE_URL = 'https://sms.sniperbuisnesscenter.com';

// --- Helper Functions ---
const generatePriorityAlerts = (dashboard: any, performance: any, financial: any, discipline: any): PriorityAlert[] => {
  const alerts: PriorityAlert[] = [];
  
  // Generate alerts based on data thresholds
  if (dashboard?.schoolAnalytics?.averageAttendanceRate < 85) {
    alerts.push({
      id: 'attendance-low',
      type: 'warning',
      title: 'Low Attendance Alert',
      message: `School attendance is below 85% (${dashboard.schoolAnalytics.averageAttendanceRate}%)`,
      timestamp: new Date().toISOString(),
      actionRequired: true,
    });
  }

  if (financial?.feeCollectionRate < 80) {
    alerts.push({
      id: 'fees-low',
      type: 'urgent',
      title: 'Fee Collection Alert',
      message: `Fee collection rate is below 80% (${financial.feeCollectionRate}%)`,
      timestamp: new Date().toISOString(),
      actionRequired: true,
    });
  }

  if (discipline?.pendingIncidents > 5) {
    alerts.push({
      id: 'discipline-pending',
      type: 'warning',
      title: 'Pending Discipline Issues',
      message: `${discipline.pendingIncidents} discipline issues require attention`,
      timestamp: new Date().toISOString(),
      actionRequired: true,
    });
  }

  return alerts;
};

// --- Main Component ---
const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ user, token, onLogout, onNavigate }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Fetch data from multiple endpoints
  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      // Fetch multiple endpoints in parallel for better performance
      const [
        dashboardResponse,
        schoolAnalyticsResponse,
        performanceResponse,
        financialResponse,
        disciplineResponse,
        staffResponse,
        summaryResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/principal/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/principal/analytics/school`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/principal/analytics/performance`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/principal/analytics/financial`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/principal/analytics/discipline`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/principal/analytics/staff`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/principal/overview/summary`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      // Process dashboard data
      const dashboardData = await dashboardResponse.json();
      let schoolAnalyticsData = null;
      
      if (dashboardData.success && dashboardData.data) {
        schoolAnalyticsData = dashboardData.data.schoolAnalytics;
        dispatch({ type: 'SET_SCHOOL_ANALYTICS', payload: dashboardData.data.schoolAnalytics });
      }

      // Process school analytics and merge with dashboard data
      const schoolData = await schoolAnalyticsResponse.json();
      if (schoolData.success && schoolData.data) {
        // Merge school analytics data properly
        const mergedSchoolAnalytics = {
          ...schoolAnalyticsData,
          ...schoolData.data,
        };
        dispatch({ type: 'SET_SCHOOL_ANALYTICS', payload: mergedSchoolAnalytics });
      }

      // Process performance metrics
      const performanceData = await performanceResponse.json();
      if (performanceData.success && performanceData.data) {
        dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: performanceData.data });
      }

      // Process financial overview
      const financialData = await financialResponse.json();
      if (financialData.success && financialData.data) {
        dispatch({ type: 'SET_FINANCIAL_OVERVIEW', payload: financialData.data });
      }

      // Process discipline overview
      const disciplineData = await disciplineResponse.json();
      if (disciplineData.success && disciplineData.data) {
        dispatch({ type: 'SET_DISCIPLINE_OVERVIEW', payload: disciplineData.data });
      }

      // Process staff overview
      const staffData = await staffResponse.json();
      if (staffData.success && staffData.data) {
        dispatch({ type: 'SET_STAFF_OVERVIEW', payload: staffData.data });
      }

      // Generate priority alerts based on data
      const alerts = generatePriorityAlerts(
        dashboardData.data, 
        performanceData.data, 
        financialData.data, 
        disciplineData.data
      );
      dispatch({ type: 'SET_PRIORITY_ALERTS', payload: alerts });

      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date().toISOString() });
      dispatch({ type: 'SET_ERROR', payload: null });

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data. Please try again.' });
    }
  }, [token]); // Remove state.schoolAnalytics dependency to prevent infinite loop

  const loadDashboard = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(async () => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
    await fetchDashboardData();
    dispatch({ type: 'SET_REFRESHING', payload: false });
  }, [fetchDashboardData]);

  const handleTabChange = useCallback((tab: 'overview' | 'analytics' | 'reports' | 'alerts') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const handleAlertAction = useCallback((alert: PriorityAlert) => {
    Alert.alert(
      alert.title,
      alert.message,
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'Take Action', onPress: () => {
          // Navigate to relevant screen based on alert type
          if (alert.id === 'attendance-low') {
            onNavigate('AttendanceAnalysis');
          } else if (alert.id === 'fees-low') {
            onNavigate('FinancialOverview');
          } else if (alert.id === 'discipline-pending') {
            onNavigate('DisciplineOverview');
          }
        }},
      ]
    );
  }, [onNavigate]);

  useEffect(() => {
    console.log('🔄 PrincipalDashboard: Loading dashboard data...');
    
    const initializeDashboard = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      await fetchDashboardData();
    };
    
    if (token) {
      initializeDashboard();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, fetchDashboardData]); // Include fetchDashboardData but it's now stable

  if (state.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Loading Executive Dashboard...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {state.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} colors={['#0056b3']} />}
      >
        <Header user={user} onLogout={onLogout} lastUpdated={state.lastUpdated} />
        
        <TabNavigation activeTab={state.activeTab} onTabChange={handleTabChange} />

        {state.activeTab === 'overview' && (
          <OverviewContent 
            schoolAnalytics={state.schoolAnalytics}
            performanceMetrics={state.performanceMetrics}
            financialOverview={state.financialOverview}
            onNavigate={onNavigate}
          />
        )}

        {state.activeTab === 'analytics' && (
          <AnalyticsContent 
            schoolAnalytics={state.schoolAnalytics}
            performanceMetrics={state.performanceMetrics}
            disciplineOverview={state.disciplineOverview}
            staffOverview={state.staffOverview}
            onNavigate={onNavigate}
          />
        )}

        {state.activeTab === 'reports' && (
          <ReportsContent onNavigate={onNavigate} />
        )}

        {state.activeTab === 'alerts' && (
          <AlertsContent alerts={state.priorityAlerts} onAlertAction={handleAlertAction} />
        )}

        <QuickActions onNavigate={onNavigate} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Sub-components ---

const Header: React.FC<{ user: User; onLogout: () => void; lastUpdated: string | null }> = ({ 
  user, 
  onLogout, 
  lastUpdated 
}) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerInfo}>
      <Text style={styles.headerWelcome}>Executive Dashboard</Text>
      <Text style={styles.headerUserName}>{user.name || 'Principal'}</Text>
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </Text>
      )}
    </View>
    <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

const TabNavigation: React.FC<{ 
  activeTab: string; 
  onTabChange: (tab: 'overview' | 'analytics' | 'reports' | 'alerts') => void;
}> = ({ activeTab, onTabChange }) => (
  <View style={styles.tabContainer}>
    <TouchableOpacity 
      style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
      onPress={() => onTabChange('overview')}
    >
      <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
      onPress={() => onTabChange('analytics')}
    >
      <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
      onPress={() => onTabChange('reports')}
    >
      <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Reports</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
      onPress={() => onTabChange('alerts')}
    >
      <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>Alerts</Text>
    </TouchableOpacity>
  </View>
);

const OverviewContent: React.FC<{
  schoolAnalytics: SchoolAnalytics | null;
  performanceMetrics: PerformanceMetrics | null;
  financialOverview: FinancialOverview | null;
  onNavigate: (screen: string) => void;
}> = ({ schoolAnalytics, performanceMetrics, financialOverview, onNavigate }) => (
  <>
    <KeyMetrics stats={schoolAnalytics} />
    <PerformanceSnapshot metrics={performanceMetrics} onNavigate={onNavigate} />
    <FinancialSnapshot financial={financialOverview} onNavigate={onNavigate} />
  </>
);

const AnalyticsContent: React.FC<{
  schoolAnalytics: SchoolAnalytics | null;
  performanceMetrics: PerformanceMetrics | null;
  disciplineOverview: DisciplineOverview | null;
  staffOverview: StaffOverview | null;
  onNavigate: (screen: string) => void;
}> = ({ schoolAnalytics, performanceMetrics, disciplineOverview, staffOverview, onNavigate }) => (
  <>
    <DetailedAnalytics 
      school={schoolAnalytics} 
      performance={performanceMetrics}
      discipline={disciplineOverview}
      staff={staffOverview}
      onNavigate={onNavigate}
    />
  </>
);

const ReportsContent: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>📊 Available Reports</Text>
    <View style={styles.reportsList}>
      <ReportItem 
        title="Academic Performance Report" 
        description="Detailed analysis of student performance across all subjects"
        onPress={() => onNavigate('AcademicPerformanceReport')}
      />
      <ReportItem 
        title="Attendance Analysis" 
        description="Comprehensive attendance tracking and trends"
        onPress={() => onNavigate('AttendanceAnalysis')}
      />
      <ReportItem 
        title="Teacher Performance Report" 
        description="Staff performance metrics and evaluations"
        onPress={() => onNavigate('TeacherPerformanceReport')}
      />
      <ReportItem 
        title="Financial Performance Report" 
        description="Revenue, expenses, and financial health analysis"
        onPress={() => onNavigate('FinancialPerformanceReport')}
      />
    </View>
  </View>
);

const AlertsContent: React.FC<{ 
  alerts: PriorityAlert[]; 
  onAlertAction: (alert: PriorityAlert) => void;
}> = ({ alerts, onAlertAction }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>🚨 Priority Alerts</Text>
    {alerts.length === 0 ? (
      <Text style={styles.noAlertsText}>✅ No urgent alerts at this time</Text>
    ) : (
      <View style={styles.alertsList}>
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onPress={() => onAlertAction(alert)} />
        ))}
      </View>
    )}
  </View>
);

const KeyMetrics: React.FC<{ stats?: SchoolAnalytics }> = ({ stats }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>🏫 School Overview</Text>
    <View style={styles.metricsGrid}>
      <MetricBox 
        value={stats?.totalStudents ?? '-'} 
        label="Students" 
        icon="👥" 
        color="#0056b3"
        change={stats?.performanceGrowth ? `+${stats.performanceGrowth}%` : null}
      />
      <MetricBox 
        value={stats?.totalTeachers ?? '-'} 
        label="Teachers" 
        icon="👨‍🏫" 
        color="#28a745"
      />
      <MetricBox 
        value={`${stats?.averageAttendanceRate ?? '-'}%`} 
        label="Attendance" 
        icon="✅" 
        color={stats?.averageAttendanceRate ? (stats.averageAttendanceRate >= 85 ? '#28a745' : '#dc3545') : '#6c757d'}
      />
      <MetricBox 
        value={stats?.disciplineIssuesThisMonth ?? '-'} 
        label="Issues" 
        icon="⚠️" 
        color="#ffc107"
      />
    </View>
  </View>
);

const MetricBox: React.FC<{ 
  value: string | number; 
  label: string; 
  icon: string; 
  color?: string;
  change?: string | null;
}> = ({ value, label, icon, color = '#0056b3', change }) => (
  <View style={styles.metricBox}>
    <Text style={styles.metricIcon}>{icon}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
    {change && (
      <Text style={[styles.metricChange, { color: change.startsWith('+') ? '#28a745' : '#dc3545' }]}>
        {change}
      </Text>
    )}
  </View>
);

const PerformanceSnapshot: React.FC<{ 
  metrics: PerformanceMetrics | null; 
  onNavigate: (screen: string) => void;
}> = ({ metrics, onNavigate }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>📈 Performance Snapshot</Text>
      <TouchableOpacity onPress={() => onNavigate('PerformanceDetails')}>
        <Text style={styles.viewAllLink}>View All</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.performanceGrid}>
      <MetricBox 
        value={metrics?.overallGPA ?? '-'} 
        label="Overall GPA" 
        icon="🎯" 
        color="#0056b3"
      />
      <MetricBox 
        value={`${metrics?.improvementRate ?? '-'}%`} 
        label="Improvement" 
        icon="📊" 
        color="#28a745"
      />
    </View>
    {metrics?.topPerformers && (
      <View style={styles.topPerformers}>
        <Text style={styles.sectionTitle}>🏆 Top Performers</Text>
        {metrics.topPerformers.slice(0, 3).map((performer, index) => (
          <View key={index} style={styles.performerRow}>
            <Text style={styles.performerName}>{performer.name}</Text>
            <Text style={styles.performerClass}>{performer.class}</Text>
            <Text style={styles.performerScore}>{performer.score}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

const FinancialSnapshot: React.FC<{ 
  financial: FinancialOverview | null; 
  onNavigate: (screen: string) => void;
}> = ({ financial, onNavigate }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>💰 Financial Snapshot</Text>
      <TouchableOpacity onPress={() => onNavigate('FinancialOverview')}>
        <Text style={styles.viewAllLink}>View All</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.financialGrid}>
      <MetricBox 
        value={financial?.totalRevenue ?? '-'} 
        label="Revenue" 
        icon="💵" 
        color="#28a745"
      />
      <MetricBox 
        value={`${financial?.feeCollectionRate ?? '-'}%`} 
        label="Collection Rate" 
        icon="📊" 
        color={financial?.feeCollectionRate ? (financial.feeCollectionRate >= 80 ? '#28a745' : '#dc3545') : '#6c757d'}
      />
    </View>
  </View>
);

const DetailedAnalytics: React.FC<{
  school: SchoolAnalytics | null;
  performance: PerformanceMetrics | null;
  discipline: DisciplineOverview | null;
  staff: StaffOverview | null;
  onNavigate: (screen: string) => void;
}> = ({ school, performance, discipline, staff, onNavigate }) => (
  <>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📊 Detailed Analytics</Text>
      <View style={styles.analyticsGrid}>
        <AnalyticsCard 
          title="Academic Performance" 
          value={performance?.overallGPA ?? '-'} 
          trend={performance?.improvementRate ? 'up' : 'stable'}
          onPress={() => onNavigate('AcademicAnalytics')}
        />
        <AnalyticsCard 
          title="Discipline Management" 
          value={discipline?.totalIncidents ?? '-'} 
          trend={discipline?.trendAnalysis === 'improving' ? 'down' : 'up'}
          onPress={() => onNavigate('DisciplineAnalytics')}
        />
        <AnalyticsCard 
          title="Staff Performance" 
          value={staff?.performanceRating ?? '-'} 
          trend="stable"
          onPress={() => onNavigate('StaffAnalytics')}
        />
        <AnalyticsCard 
          title="Attendance Rate" 
          value={`${school?.averageAttendanceRate ?? '-'}%`} 
          trend={school?.averageAttendanceRate && school.averageAttendanceRate >= 85 ? 'up' : 'down'}
          onPress={() => onNavigate('AttendanceAnalytics')}
        />
      </View>
    </View>
  </>
);

const AnalyticsCard: React.FC<{
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  onPress: () => void;
}> = ({ title, value, trend, onPress }) => (
  <TouchableOpacity style={styles.analyticsCard} onPress={onPress}>
    <Text style={styles.analyticsTitle}>{title}</Text>
    <Text style={styles.analyticsValue}>{value}</Text>
    <Text style={styles.analyticsTrend}>
      {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'}
    </Text>
  </TouchableOpacity>
);

const ReportItem: React.FC<{
  title: string;
  description: string;
  onPress: () => void;
}> = ({ title, description, onPress }) => (
  <TouchableOpacity style={styles.reportItem} onPress={onPress}>
    <Text style={styles.reportTitle}>{title}</Text>
    <Text style={styles.reportDescription}>{description}</Text>
    <Text style={styles.reportArrow}>→</Text>
  </TouchableOpacity>
);

const AlertItem: React.FC<{
  alert: PriorityAlert;
  onPress: () => void;
}> = ({ alert, onPress }) => (
  <TouchableOpacity style={[styles.alertItem, styles[`alert${alert.type}`]]} onPress={onPress}>
    <Text style={styles.alertTitle}>{alert.title}</Text>
    <Text style={styles.alertMessage}>{alert.message}</Text>
    <Text style={styles.alertTime}>
      {new Date(alert.timestamp).toLocaleTimeString()}
    </Text>
  </TouchableOpacity>
);

const QuickActions: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
    <View style={styles.actionsGrid}>
      <ActionButton icon="👨‍🏫" label="Manage Staff" onPress={() => onNavigate('StaffManagement')} />
      <ActionButton icon="👥" label="Student Affairs" onPress={() => onNavigate('StudentAffairs')} />
      <ActionButton icon="📢" label="Communicate" onPress={() => onNavigate('CommunicationCenter')} />
      <ActionButton icon="📊" label="View Reports" onPress={() => onNavigate('ReportsAnalytics')} />
      <ActionButton icon="🎓" label="Academic Management" onPress={() => onNavigate('AcademicManagement')} />
      <ActionButton icon="💰" label="Financial Overview" onPress={() => onNavigate('FinancialOverview')} />
    </View>
  </View>
);

const ActionButton: React.FC<{ icon: string; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

// --- Enhanced Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
  scrollViewContent: { padding: 16, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6c757d', textAlign: 'center' },
  errorText: { fontSize: 16, color: '#dc3545', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#0056b3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 16,
  },
  headerInfo: { flex: 1 },
  headerWelcome: { fontSize: 16, color: '#6c757d', marginBottom: 4 },
  headerUserName: { fontSize: 26, fontWeight: 'bold', color: '#1a2b48', marginBottom: 4 },
  lastUpdated: { fontSize: 12, color: '#6c757d' },
  logoutButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: { color: '#495057', fontWeight: '600' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#0056b3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#fff',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  viewAllLink: {
    fontSize: 14,
    color: '#0056b3',
    fontWeight: '600',
  },

  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricBox: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  metricIcon: { fontSize: 24, marginBottom: 8 },
  metricValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  metricLabel: { fontSize: 12, color: '#6c757d', textAlign: 'center' },
  metricChange: { fontSize: 12, fontWeight: '600', marginTop: 4 },

  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topPerformers: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  performerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  performerName: { fontSize: 14, fontWeight: '600', color: '#343a40', flex: 1 },
  performerClass: { fontSize: 12, color: '#6c757d', width: 60 },
  performerScore: { fontSize: 14, fontWeight: '600', color: '#0056b3', width: 40, textAlign: 'right' },

  financialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 4,
  },
  analyticsTrend: {
    fontSize: 16,
  },

  reportsList: {
    gap: 8,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
    flex: 1,
  },
  reportDescription: {
    fontSize: 12,
    color: '#6c757d',
    flex: 2,
    marginLeft: 8,
  },
  reportArrow: {
    fontSize: 16,
    color: '#0056b3',
    marginLeft: 8,
  },

  alertsList: {
    gap: 8,
  },
  alertItem: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  alerturgent: {
    backgroundColor: '#fff5f5',
    borderLeftColor: '#dc3545',
  },
  alertwarning: {
    backgroundColor: '#fffbf0',
    borderLeftColor: '#ffc107',
  },
  alertinfo: {
    backgroundColor: '#f0f8ff',
    borderLeftColor: '#0056b3',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 10,
    color: '#6c757d',
  },
  noAlertsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 20,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 12, color: '#495057', fontWeight: '600', textAlign: 'center' },
});

export default PrincipalDashboard; 