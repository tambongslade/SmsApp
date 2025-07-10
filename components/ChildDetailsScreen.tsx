import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

// --- Interfaces based on parent.workflow.md ---
// These would typically be in a separate types file

interface FeePayment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: 'EXPRESS_UNION' | 'CCA' | '3DC';
  receiptNumber?: string;
  recordedBy: string;
}

interface DisciplineIssue {
  id: number;
  type: string;
  description: string;
  dateOccurred: string;
  status: string;
}

interface ChildDetails {
  id: number;
  name: string;
  matricule: string;
  classInfo: {
    className: string;
    subclassName: string;
    classMaster?: string;
  };
  attendance: {
    attendanceRate: number; // Percentage
  };
  academicPerformance: {
    overallAverage: number;
    positionInClass?: number;
  };
  fees: {
    totalExpected: number;
    totalPaid: number;
    outstandingBalance: number;
    paymentHistory: FeePayment[];
  };
  discipline: {
    totalIssues: number;
    recentIssues: DisciplineIssue[];
  };
  photo: string; // Added for UI
}

// --- Mock Data ---
const mockChildDetails: ChildDetails = {
  id: 1,
  name: 'John Doe',
  matricule: 'STU2024001',
  photo: 'https://via.placeholder.com/80',
  classInfo: {
    className: 'Form 5A',
    subclassName: 'Science Stream',
    classMaster: 'Mrs. Smith',
  },
  attendance: {
    attendanceRate: 92,
  },
  academicPerformance: {
    overallAverage: 15.2,
    positionInClass: 5,
  },
  fees: {
    totalExpected: 150000,
    totalPaid: 125000,
    outstandingBalance: 25000,
    paymentHistory: [
      { id: 1, amount: 125000, paymentDate: '2024-01-15', paymentMethod: 'EXPRESS_UNION', receiptNumber: '#R001', recordedBy: 'Bursar' }
    ],
  },
  discipline: {
    totalIssues: 0,
    recentIssues: [],
  },
};

// --- Tab Components ---

const OverviewTab: React.FC<{ data: ChildDetails }> = ({ data }) => (
  <View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Student Information</Text>
      <View style={styles.rowCenter}>
        <Image source={{ uri: data.photo }} style={styles.profilePhoto} />
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.studentName}>{data.name}</Text>
          <Text style={styles.infoText}>Matricule: {data.matricule}</Text>
          <Text style={styles.infoText}>Class: {data.classInfo.className}</Text>
          <Text style={styles.infoText}>Class Master: {data.classInfo.classMaster}</Text>
        </View>
      </View>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle}>Quick Metrics</Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, { color: '#2563eb' }]}>{data.attendance.attendanceRate}%</Text>
          <Text style={styles.metricLabel}>Attendance</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, { color: '#16a34a' }]}>{data.academicPerformance.overallAverage}/20</Text>
          <Text style={styles.metricLabel}>Overall Avg</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, { color: '#7c3aed' }]}>{data.academicPerformance.positionInClass}/30</Text>
          <Text style={styles.metricLabel}>Class Rank</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, { color: '#dc2626' }]}>{data.fees.outstandingBalance > 0 ? 'Partial' : 'Paid'}</Text>
          <Text style={styles.metricLabel}>Fee Status</Text>
        </View>
      </View>
    </View>
  </View>
);

const FeesTab: React.FC = () => <View style={styles.tabPlaceholder}><Text>Fees information will be displayed here.</Text></View>;
const AcademicsTab: React.FC = () => <View style={styles.tabPlaceholder}><Text>Academics information will be displayed here.</Text></View>;
const QuizzesTab: React.FC = () => <View style={styles.tabPlaceholder}><Text>Quizzes information will be displayed here.</Text></View>;
const DisciplineTab: React.FC = () => <View style={styles.tabPlaceholder}><Text>Discipline information will be displayed here.</Text></View>;
const AnalyticsTab: React.FC = () => <View style={styles.tabPlaceholder}><Text>Analytics information will be displayed here.</Text></View>;

// --- Main Component ---

type Tab = 'Overview' | 'Fees' | 'Academics' | 'Quizzes' | 'Discipline' | 'Analytics';

const tabs: Tab[] = ['Overview', 'Fees', 'Academics', 'Quizzes', 'Discipline', 'Analytics'];

// This component would receive route and navigation props from React Navigation
type ChildDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'ChildDetails'>;

const ChildDetailsScreen: React.FC<ChildDetailsScreenProps> = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const { studentId } = route.params;

  // In a real app, you would fetch data based on studentId
  const childData = mockChildDetails;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab data={childData} />;
      case 'Fees': return <FeesTab />;
      case 'Academics': return <AcademicsTab />;
      case 'Quizzes': return <QuizzesTab />;
      case 'Discipline': return <DisciplineTab />;
      case 'Analytics': return <AnalyticsTab />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{childData.name}'s Profile</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : styles.tabTextInactive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.tabContent}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  tabsBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#2563eb',
  },
  tabTextInactive: {
    color: '#6b7280',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  infoText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  metricBox: {
    alignItems: 'center',
    padding: 8,
    minWidth: 80,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#6b7280',
    fontSize: 13,
  },
  tabPlaceholder: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChildDetailsScreen; 