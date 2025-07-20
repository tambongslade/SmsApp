import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useHOD } from '../HODContext';

const HODReportsScreen: React.FC = () => {
  const { departmentStats, teachers } = useHOD();
  const [refreshing, setRefreshing] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportSummary, setReportSummary] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const generateReport = (type: string) => {
    setReportType(type);
    setReportModal(true);
  };

  const submitReport = () => {
    if (!reportSummary.trim()) {
      Alert.alert('Error', 'Please add a report summary');
      return;
    }

    // Simulate report submission
    Alert.alert('Success', 'Report submitted to Principal');
    setReportModal(false);
    setReportSummary('');
    setReportType('');
  };

  const mockAnalytics = {
    performanceComparison: [
      { form: 'Form 6', current: 16.2, lastYear: 15.8, trend: 'up' },
      { form: 'Form 5', current: 15.1, lastYear: 14.9, trend: 'up' },
      { form: 'Form 4', current: 14.3, lastYear: 14.7, trend: 'down' },
      { form: 'Form 3', current: 13.8, lastYear: 13.2, trend: 'up' },
      { form: 'Form 2', current: 14.9, lastYear: 14.5, trend: 'up' },
      { form: 'Form 1', current: 15.2, lastYear: 14.9, trend: 'up' },
    ],
    monthlyTrends: [
      { month: 'Jan', score: 14.2 },
      { month: 'Feb', score: 14.5 },
      { month: 'Mar', score: 14.8 },
      { month: 'Apr', score: 14.7 },
      { month: 'May', score: 15.1 },
    ]
  };

  const topPerformer = teachers.reduce((top, teacher) => 
    teacher.averageScore > top.averageScore ? teacher : top
  );

  const needsSupport = teachers.filter(teacher => 
    teacher.status === 'NEEDS_REVIEW' || teacher.averageScore < 14
  );

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? '#27ae60' : '#e74c3c';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '📈' : '📉';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Department Performance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Department Performance</Text>
          
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Text style={styles.performanceTitle}>Overall Department Average</Text>
              <Text style={styles.performanceScore}>{departmentStats.departmentAverage.toFixed(1)}/20</Text>
            </View>
            
            <View style={styles.performanceDetails}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>School Ranking</Text>
                <Text style={styles.performanceValue}>#{departmentStats.schoolRanking}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Attendance</Text>
                <Text style={styles.performanceValue}>{departmentStats.attendanceRate}%</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Trend</Text>
                <Text style={[styles.performanceValue, { color: getTrendColor(departmentStats.trend.toLowerCase()) }]}>
                  {getTrendIcon(departmentStats.trend.toLowerCase())} {departmentStats.trendValue > 0 ? '+' : ''}{departmentStats.trendValue}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Class Performance Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Class Performance Analysis</Text>
          
          {mockAnalytics.performanceComparison.map((item, index) => (
            <View key={index} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{item.form}</Text>
                <View style={styles.classScores}>
                  <Text style={styles.currentScore}>{item.current.toFixed(1)}/20</Text>
                  <Text style={[styles.trendIndicator, { color: getTrendColor(item.trend) }]}>
                    {getTrendIcon(item.trend)} {item.trend === 'up' ? '+' : ''}{(item.current - item.lastYear).toFixed(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.classComparison}>
                <Text style={styles.comparisonText}>
                  Last Year: {item.lastYear.toFixed(1)}/20 • Current: {item.current.toFixed(1)}/20
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Teacher Performance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍🏫 Teacher Performance Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🏆</Text>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryTitle}>Top Performer</Text>
                <Text style={styles.summaryValue}>{topPerformer.name}</Text>
                <Text style={styles.summarySubtext}>{topPerformer.averageScore.toFixed(1)}/20 average</Text>
              </View>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>⚠️</Text>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryTitle}>Needs Support</Text>
                <Text style={styles.summaryValue}>{needsSupport.length} teacher{needsSupport.length !== 1 ? 's' : ''}</Text>
                <Text style={styles.summarySubtext}>Require attention</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Report Generation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Report Generation</Text>
          
          <View style={styles.reportsGrid}>
            <TouchableOpacity 
              style={styles.reportCard}
              onPress={() => generateReport('Monthly Performance')}
            >
              <Text style={styles.reportIcon}>📊</Text>
              <Text style={styles.reportTitle}>Monthly Report</Text>
              <Text style={styles.reportSubtitle}>Performance & Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reportCard}
              onPress={() => generateReport('Teacher Evaluation')}
            >
              <Text style={styles.reportIcon}>👨‍🏫</Text>
              <Text style={styles.reportTitle}>Teacher Report</Text>
              <Text style={styles.reportSubtitle}>Staff Performance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reportCard}
              onPress={() => generateReport('Resource Utilization')}
            >
              <Text style={styles.reportIcon}>📦</Text>
              <Text style={styles.reportTitle}>Resource Report</Text>
              <Text style={styles.reportSubtitle}>Budget & Inventory</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reportCard}
              onPress={() => generateReport('Department Overview')}
            >
              <Text style={styles.reportIcon}>🏢</Text>
              <Text style={styles.reportTitle}>Dept Overview</Text>
              <Text style={styles.reportSubtitle}>Complete Summary</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Communication Center */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Communication</Text>
          
          <View style={styles.communicationGrid}>
            <TouchableOpacity style={styles.commCard}>
              <Text style={styles.commIcon}>👨‍💼</Text>
              <Text style={styles.commTitle}>Principal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commCard}>
              <Text style={styles.commIcon}>👥</Text>
              <Text style={styles.commTitle}>All Teachers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commCard}>
              <Text style={styles.commIcon}>🏢</Text>
              <Text style={styles.commTitle}>Other HODs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commCard}>
              <Text style={styles.commIcon}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.commTitle}>Parents</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={reportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate {reportType}</Text>
            <Text style={styles.modalSubtitle}>Add summary and submit to Principal</Text>
            
            <TextInput
              style={styles.summaryInput}
              placeholder="Report summary and key points..."
              value={reportSummary}
              onChangeText={setReportSummary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setReportModal(false);
                  setReportSummary('');
                  setReportType('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitReport}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  performanceCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  performanceScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  performanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  classScores: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginRight: 8,
  },
  trendIndicator: {
    fontSize: 12,
    fontWeight: '600',
  },
  classComparison: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 8,
  },
  comparisonText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginTop: 2,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reportCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  reportSubtitle: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  communicationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  commCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  commIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  commTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  summaryInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 120,
    marginBottom: 16,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HODReportsScreen; 