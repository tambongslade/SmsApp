import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
} from 'react-native';
import { User } from '../LoginScreen';

interface ClassSummary {
  className: string;
  subClasses: string[];
  expectedFees: number;
  collectedFees: number;
  remainingFees: number;
  studentCount: number;
  collectionRate: number;
}

interface AcademicMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  averageAttendance: number;
}

interface FinancialMetrics {
  totalExpectedRevenue: number;
  totalCollectedRevenue: number;
  totalOutstanding: number;
  collectionRate: number;
  monthlyCollection: number;
}

interface ManagerDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'academic' | 'analytics'>('overview');
  const [showExportModal, setShowExportModal] = useState(false);

  // Sample data - in real app, this would come from your backend
  const [classSummaries] = useState<ClassSummary[]>([
    {
      className: 'Form 1',
      subClasses: ['Form 1A', 'Form 1B'],
      expectedFees: 3000000, // 30 students × 100,000 XAF
      collectedFees: 2850000,
      remainingFees: 150000,
      studentCount: 30,
      collectionRate: 95.0,
    },
    {
      className: 'Form 2',
      subClasses: ['Form 2A', 'Form 2B'],
      expectedFees: 3500000, // 28 students × 125,000 XAF
      collectedFees: 3150000,
      remainingFees: 350000,
      studentCount: 28,
      collectionRate: 90.0,
    },
    {
      className: 'Form 3',
      subClasses: ['Form 3A', 'Form 3B'],
      expectedFees: 4000000, // 25 students × 160,000 XAF
      collectedFees: 3200000,
      remainingFees: 800000,
      studentCount: 25,
      collectionRate: 80.0,
    },
    {
      className: 'Form 4',
      subClasses: ['Form 4A', 'Form 4B'],
      expectedFees: 4500000, // 22 students × 204,545 XAF
      collectedFees: 3600000,
      remainingFees: 900000,
      studentCount: 22,
      collectionRate: 80.0,
    },
    {
      className: 'Form 5',
      subClasses: ['Form 5A', 'Form 5B'],
      expectedFees: 5000000, // 20 students × 250,000 XAF
      collectedFees: 4250000,
      remainingFees: 750000,
      studentCount: 20,
      collectionRate: 85.0,
    },
  ]);

  const academicMetrics: AcademicMetrics = {
    totalStudents: classSummaries.reduce((sum, cls) => sum + cls.studentCount, 0),
    totalTeachers: 25,
    totalSubjects: 12,
    averageAttendance: 92.5,
  };

  const financialMetrics: FinancialMetrics = {
    totalExpectedRevenue: classSummaries.reduce((sum, cls) => sum + cls.expectedFees, 0),
    totalCollectedRevenue: classSummaries.reduce((sum, cls) => sum + cls.collectedFees, 0),
    totalOutstanding: classSummaries.reduce((sum, cls) => sum + cls.remainingFees, 0),
    collectionRate: 0,
    monthlyCollection: 2500000,
  };

  financialMetrics.collectionRate = (financialMetrics.totalCollectedRevenue / financialMetrics.totalExpectedRevenue) * 100;

  const getCollectionRateColor = (rate: number) => {
    if (rate >= 95) return '#27ae60';
    if (rate >= 85) return '#f39c12';
    return '#e74c3c';
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>💰</Text>
          <Text style={styles.metricValue}>{(financialMetrics.totalCollectedRevenue / 1000000).toFixed(1)}M</Text>
          <Text style={styles.metricLabel}>Collected (XAF)</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>📊</Text>
          <Text style={styles.metricValue}>{financialMetrics.collectionRate.toFixed(1)}%</Text>
          <Text style={styles.metricLabel}>Collection Rate</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>👨‍🎓</Text>
          <Text style={styles.metricValue}>{academicMetrics.totalStudents}</Text>
          <Text style={styles.metricLabel}>Total Students</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>👩‍🏫</Text>
          <Text style={styles.metricValue}>{academicMetrics.totalTeachers}</Text>
          <Text style={styles.metricLabel}>Total Teachers</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <View style={styles.financialSummary}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Expected Revenue</Text>
            <Text style={styles.financialAmount}>{(financialMetrics.totalExpectedRevenue / 1000000).toFixed(1)}M XAF</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Collected Revenue</Text>
            <Text style={[styles.financialAmount, { color: '#27ae60' }]}>
              {(financialMetrics.totalCollectedRevenue / 1000000).toFixed(1)}M XAF
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Outstanding</Text>
            <Text style={[styles.financialAmount, { color: '#e74c3c' }]}>
              {(financialMetrics.totalOutstanding / 1000000).toFixed(1)}M XAF
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Monthly Target</Text>
            <Text style={styles.financialAmount}>{(financialMetrics.monthlyCollection / 1000000).toFixed(1)}M XAF</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('classes')}>
            <Text style={styles.actionIcon}>🏫</Text>
            <Text style={styles.actionText}>Class Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('academic')}>
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.actionText}>Academic Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('analytics')}>
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowExportModal(true)}>
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionText}>Export Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Top Performing Classes</Text>
        {classSummaries
          .sort((a, b) => b.collectionRate - a.collectionRate)
          .slice(0, 3)
          .map((cls, index) => (
            <View key={cls.className} style={styles.performanceItem}>
              <View style={styles.performanceRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.performanceInfo}>
                <Text style={styles.performanceClass}>{cls.className}</Text>
                <Text style={styles.performanceDetails}>
                  {cls.studentCount} students • {cls.subClasses.join(', ')}
                </Text>
              </View>
              <View style={styles.performanceRate}>
                <Text style={[styles.rateText, { color: getCollectionRateColor(cls.collectionRate) }]}>
                  {cls.collectionRate.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );

  const renderClassSummaries = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Class-Level Fee Summary</Text>
      
      {classSummaries.map((cls) => (
        <View key={cls.className} style={styles.classCard}>
          <View style={styles.classHeader}>
            <View style={styles.classInfo}>
              <Text style={styles.className}>{cls.className}</Text>
              <Text style={styles.classDetails}>
                {cls.studentCount} students • {cls.subClasses.join(', ')}
              </Text>
            </View>
            <View style={styles.classRate}>
              <Text style={[styles.ratePercentage, { color: getCollectionRateColor(cls.collectionRate) }]}>
                {cls.collectionRate.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.feeBreakdown}>
            <View style={styles.feeColumn}>
              <Text style={styles.feeLabel}>Expected</Text>
              <Text style={styles.feeAmount}>{(cls.expectedFees / 1000000).toFixed(2)}M</Text>
            </View>
            <View style={styles.feeColumn}>
              <Text style={styles.feeLabel}>Collected</Text>
              <Text style={[styles.feeAmount, { color: '#27ae60' }]}>
                {(cls.collectedFees / 1000000).toFixed(2)}M
              </Text>
            </View>
            <View style={styles.feeColumn}>
              <Text style={styles.feeLabel}>Remaining</Text>
              <Text style={[styles.feeAmount, { color: '#e74c3c' }]}>
                {(cls.remainingFees / 1000000).toFixed(2)}M
              </Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${cls.collectionRate}%`,
                  backgroundColor: getCollectionRateColor(cls.collectionRate)
                }
              ]} 
            />
          </View>
        </View>
      ))}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Overall Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Expected</Text>
            <Text style={styles.summaryValue}>
              {(financialMetrics.totalExpectedRevenue / 1000000).toFixed(1)}M XAF
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Collected</Text>
            <Text style={[styles.summaryValue, { color: '#27ae60' }]}>
              {(financialMetrics.totalCollectedRevenue / 1000000).toFixed(1)}M XAF
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Collection Rate</Text>
            <Text style={[styles.summaryValue, { color: getCollectionRateColor(financialMetrics.collectionRate) }]}>
              {financialMetrics.collectionRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Outstanding</Text>
            <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>
              {(financialMetrics.totalOutstanding / 1000000).toFixed(1)}M XAF
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderAcademicData = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Academic Performance Overview</Text>
      
      <View style={styles.academicGrid}>
        <View style={styles.academicCard}>
          <Text style={styles.academicIcon}>👨‍🎓</Text>
          <Text style={styles.academicValue}>{academicMetrics.totalStudents}</Text>
          <Text style={styles.academicLabel}>Total Students</Text>
        </View>
        <View style={styles.academicCard}>
          <Text style={styles.academicIcon}>👩‍🏫</Text>
          <Text style={styles.academicValue}>{academicMetrics.totalTeachers}</Text>
          <Text style={styles.academicLabel}>Teaching Staff</Text>
        </View>
        <View style={styles.academicCard}>
          <Text style={styles.academicIcon}>📚</Text>
          <Text style={styles.academicValue}>{academicMetrics.totalSubjects}</Text>
          <Text style={styles.academicLabel}>Subjects Offered</Text>
        </View>
        <View style={styles.academicCard}>
          <Text style={styles.academicIcon}>📈</Text>
          <Text style={styles.academicValue}>{academicMetrics.averageAttendance}%</Text>
          <Text style={styles.academicLabel}>Avg Attendance</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Class Enrollment Distribution</Text>
        {classSummaries.map((cls) => (
          <View key={cls.className} style={styles.enrollmentItem}>
            <View style={styles.enrollmentInfo}>
              <Text style={styles.enrollmentClass}>{cls.className}</Text>
              <Text style={styles.enrollmentSubClasses}>{cls.subClasses.join(' • ')}</Text>
            </View>
            <View style={styles.enrollmentStats}>
              <Text style={styles.enrollmentCount}>{cls.studentCount}</Text>
              <Text style={styles.enrollmentLabel}>students</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Academic Year Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Current Academic Year</Text>
          <Text style={styles.settingValue}>2023/2024</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Current Semester</Text>
          <Text style={styles.settingValue}>2nd Semester</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Fee Payment Deadline</Text>
          <Text style={styles.settingValue}>31st March 2024</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Exam Period</Text>
          <Text style={styles.settingValue}>15-30 June 2024</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Financial Analytics</Text>
      
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>💰 Revenue Trends</Text>
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>This Month</Text>
          <Text style={styles.trendValue}>2.5M XAF</Text>
          <Text style={styles.trendChange}>+12% ⬆️</Text>
        </View>
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Last Month</Text>
          <Text style={styles.trendValue}>2.2M XAF</Text>
          <Text style={styles.trendChange}>+8% ⬆️</Text>
        </View>
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>3 Months Ago</Text>
          <Text style={styles.trendValue}>2.0M XAF</Text>
          <Text style={styles.trendChange}>+5% ⬆️</Text>
        </View>
      </View>

      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>📊 Collection Efficiency</Text>
        <View style={styles.efficiencyGrid}>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyValue}>95%</Text>
            <Text style={styles.efficiencyLabel}>On-time Payments</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyValue}>3.2 days</Text>
            <Text style={styles.efficiencyLabel}>Avg Payment Delay</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyValue}>12%</Text>
            <Text style={styles.efficiencyLabel}>Outstanding Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>🎯 Performance Insights</Text>
        <View style={styles.insightItem}>
          <Text style={styles.insightIcon}>⭐</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightText}>Form 1 has the highest collection rate at 95%</Text>
            <Text style={styles.insightType}>Positive Trend</Text>
          </View>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightIcon}>⚠️</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightText}>Form 3 & 4 need attention - 80% collection rate</Text>
            <Text style={styles.insightType}>Action Required</Text>
          </View>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightIcon}>📈</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightText}>Overall collection improved by 5% this semester</Text>
            <Text style={styles.insightType}>Growth</Text>
          </View>
        </View>
      </View>

      <View style={styles.exportSection}>
        <TouchableOpacity style={styles.exportButton} onPress={() => setShowExportModal(true)}>
          <Text style={styles.exportButtonText}>📊 Export Full Analytics Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1abc9c" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📊 Manager Dashboard</Text>
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
          style={[styles.tab, activeTab === 'classes' && styles.activeTab]}
          onPress={() => setActiveTab('classes')}
        >
          <Text style={[styles.tabText, activeTab === 'classes' && styles.activeTabText]}>
            Classes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'academic' && styles.activeTab]}
          onPress={() => setActiveTab('academic')}
        >
          <Text style={[styles.tabText, activeTab === 'academic' && styles.activeTabText]}>
            Academic
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'classes' && renderClassSummaries()}
        {activeTab === 'academic' && renderAcademicData()}
        {activeTab === 'analytics' && renderAnalytics()}
      </View>

      {/* Export Modal */}
      <Modal visible={showExportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Data</Text>
            <Text style={styles.modalSubtitle}>Full export functionality available on web platform</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowExportModal(false)}
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
    backgroundColor: '#1abc9c',
    padding: 20,
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
    borderBottomColor: '#1abc9c',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1abc9c',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 10,
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
  financialSummary: {
    flexDirection: 'column',
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  financialLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  financialAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  performanceRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1abc9c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  performanceInfo: {
    flex: 1,
  },
  performanceClass: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  performanceDetails: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  performanceRate: {
    alignItems: 'flex-end',
  },
  rateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  classCard: {
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
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classDetails: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  classRate: {
    alignItems: 'flex-end',
  },
  ratePercentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  feeBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  feeColumn: {
    alignItems: 'center',
    flex: 1,
  },
  feeLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#1abc9c',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  academicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  academicCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  academicIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  academicValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  academicLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  enrollmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  enrollmentInfo: {
    flex: 1,
  },
  enrollmentClass: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  enrollmentSubClasses: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  enrollmentStats: {
    alignItems: 'center',
  },
  enrollmentCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1abc9c',
  },
  enrollmentLabel: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  analyticsCard: {
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
  analyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  trendLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
  },
  trendChange: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27ae60',
    flex: 1,
    textAlign: 'right',
  },
  efficiencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  efficiencyItem: {
    alignItems: 'center',
    flex: 1,
  },
  efficiencyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 5,
  },
  efficiencyLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  insightType: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  exportSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: '#1abc9c',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
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
    backgroundColor: '#1abc9c',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManagerDashboard; 