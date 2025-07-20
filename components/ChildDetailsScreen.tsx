import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StyleSheet, ActivityIndicator, LayoutAnimation, UIManager, Platform, Linking, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { formatCurrency, formatNumber, safeNumber } from '../constants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Interfaces based on API Response ---

interface FeePayment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
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

interface Mark {
  sequence: string;
  mark: number;
  total: number;
  date: string;
}

interface SubjectPerformance {
  subjectName: string;
  teacherName: string;
  marks: Mark[];
  average: number;
}

interface ReportAvailability {
  available: boolean;
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'NOT_ENROLLED' | 'SEQUENCE_NOT_FOUND' | 'NO_MARKS' | 'NOT_GENERATED';
  message: string;
  reportData?: any;
}

interface AcademicYearForReports {
  id: number;
  name: string;
  isCurrent: boolean;
  examSequences: { id: number; sequenceNumber: number; termId: number; name: string }[];
  terms: { id: number; name: string }[];
}


interface ChildDetails {
  id: number;
  name: string;
  matricule: string;
  dateOfBirth: string;
  photo: string;
  classInfo: {
    className: string;
    subclassName: string;
  };
  attendance: {
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: number;
  };
  academicPerformance: {
    subjects: SubjectPerformance[];
    overallAverage: number;
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
}

// --- Helper Functions ---
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

const getAttendanceColor = (rate: number) => {
  if (rate >= 95) return '#2ecc71'; // green
  if (rate >= 85) return '#f39c12'; // orange
  return '#e74c3c'; // red
};

const getGradeColor = (avg: number) => {
    if (avg >= 14) return '#2ecc71';
    if (avg >= 10) return '#3498db';
    if (avg >= 8) return '#f39c12';
    return '#e74c3c';
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'COMPLETED': return '#2ecc71'; // Green
        case 'PENDING': return '#f39c12'; // Orange
        case 'PROCESSING': return '#3498db'; // Blue
        case 'FAILED': return '#e74c3c'; // Red
        case 'NOT_ENROLLED': return '#6b7280'; // Gray
        case 'SEQUENCE_NOT_FOUND': return '#e74c3c'; // Red
        case 'NO_MARKS': return '#f39c12'; // Orange
        case 'NOT_GENERATED': return '#6b7280'; // Gray
        default: return '#6b7280'; // Default gray
    }
}

// --- Tab Components ---

const OverviewTab: React.FC<{ data: ChildDetails }> = ({ data }) => (
  <View>
    {/* Student Info Card */}
    <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: data.photo || 'https://via.placeholder.com/80' }} style={styles.profilePhoto} />
            <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.studentName}>{data.name}</Text>
                <Text style={styles.infoText}>Matricule: {data.matricule}</Text>
                <Text style={styles.infoText}>Class: {data.classInfo.className} ({data.classInfo.subclassName})</Text>
                <Text style={styles.infoText}>Born: {formatDate(data.dateOfBirth)}</Text>
            </View>
        </View>
    </View>

    {/* Key Metrics Card */}
    <View style={styles.card}>
      <Text style={styles.cardTitle}>At a Glance</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, {color: getGradeColor(data.academicPerformance.overallAverage)}]}>
            {data.academicPerformance.overallAverage.toFixed(2)}/20
          </Text>
          <Text style={styles.metricLabel}>Overall Avg.</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, {color: getAttendanceColor(data.attendance.attendanceRate)}]}>
            {data.attendance.attendanceRate}%
          </Text>
          <Text style={styles.metricLabel}>Attendance</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, {color: (() => {
            const expected = safeNumber(data.fees.totalExpected);
            const paid = safeNumber(data.fees.totalPaid);
            const outstanding = data.fees.outstandingBalance != null ? safeNumber(data.fees.outstandingBalance) : (expected - paid);
            console.log('📊 Outstanding amount:', outstanding, 'Expected:', expected, 'Paid:', paid);
            return outstanding > 0 ? '#e74c3c' : '#2ecc71';
          })()}]}>
            {(() => {
              const expected = safeNumber(data.fees.totalExpected);
              const paid = safeNumber(data.fees.totalPaid);
              const outstanding = data.fees.outstandingBalance != null ? safeNumber(data.fees.outstandingBalance) : (expected - paid);
              return formatNumber(outstanding);
            })()}
          </Text>
          <Text style={styles.metricLabel}>FCFA Owed</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, {color: data.discipline.totalIssues > 0 ? '#e74c3c' : '#2ecc71'}]}>
            {data.discipline.totalIssues}
          </Text>
          <Text style={styles.metricLabel}>Issues</Text>
        </View>
      </View>
    </View>
  </View>
);

const SubjectCard: React.FC<{ subject: SubjectPerformance }> = ({ subject }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    }

    return (
        <TouchableOpacity style={styles.card} onPress={toggleExpand}>
            <View style={styles.subjectHeader}>
                <View style={{flex: 1}}>
                    <Text style={styles.subjectName}>{subject.subjectName}</Text>
                    <Text style={styles.teacherName}>Taught by {subject.teacherName}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    <Text style={[styles.subjectAverage, {color: getGradeColor(subject.average)}]}>{subject.average.toFixed(2)}/20</Text>
                    <Text style={styles.metricLabel}>Average</Text>
                </View>
                 <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
            </View>
            {expanded && (
                <View style={styles.marksContainer}>
                    <View style={styles.markRowHeader}>
                        <Text style={styles.markHeaderText}>Sequence</Text>
                        <Text style={styles.markHeaderText}>Mark</Text>
                        <Text style={styles.markHeaderText}>Date</Text>
                    </View>
                    {subject.marks.map((mark, index) => (
                        <View key={index} style={styles.markRow}>
                            <Text style={styles.markText}>{mark.sequence}</Text>
                            <Text style={styles.markText}>{mark.mark}/{mark.total}</Text>
                            <Text style={styles.markText}>{formatDate(mark.date)}</Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
};

const AcademicsTab: React.FC<{ data: ChildDetails }> = ({ data }) => (
  <View>
    <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Performance</Text>
        <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Overall Average:</Text>
            <Text style={[styles.performanceValue, {color: getGradeColor(data.academicPerformance.overallAverage)}]}>
                {data.academicPerformance.overallAverage.toFixed(2)}/20
            </Text>
        </View>
    </View>

    <Text style={styles.sectionTitle}>Subjects</Text>
    {data.academicPerformance.subjects.length > 0 ? (
        data.academicPerformance.subjects.map((subject, index) => (
            <SubjectCard key={index} subject={subject} />
        ))
    ) : (
        <View style={styles.card}>
            <Text style={styles.emptyText}>No subject data available.</Text>
        </View>
    )}
  </View>
);

const AttendanceTab: React.FC<{ data: ChildDetails }> = ({ data }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Attendance Summary</Text>
      <View style={styles.attendanceSummary}>
        <Text style={[styles.attendanceRate, {color: getAttendanceColor(data.attendance.attendanceRate)}]}>
            {data.attendance.attendanceRate}%
        </Text>
        <Text style={styles.metricLabel}>Overall Rate</Text>
      </View>
       <View style={styles.attendanceDetails}>
          <View style={[styles.attendanceBox, {backgroundColor: '#e8f5e9'}]}>
              <Text style={styles.attendanceNumber}>{data.attendance.presentDays}</Text>
              <Text style={styles.attendanceLabel}>Present</Text>
          </View>
           <View style={[styles.attendanceBox, {backgroundColor: '#fff3e0'}]}>
              <Text style={styles.attendanceNumber}>{data.attendance.lateDays}</Text>
              <Text style={styles.attendanceLabel}>Late</Text>
          </View>
           <View style={[styles.attendanceBox, {backgroundColor: '#ffebee'}]}>
              <Text style={styles.attendanceNumber}>{data.attendance.absentDays}</Text>
              <Text style={styles.attendanceLabel}>Absent</Text>
          </View>
      </View>
    </View>
);

const FeesTab: React.FC<{ data: ChildDetails }> = ({ data }) => (
  <View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>💰 Fee Summary</Text>
      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Total School Fees:</Text>
        <Text style={styles.feeValue}>{formatCurrency(data.fees.totalExpected)}</Text>
      </View>
      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Total Paid:</Text>
        <Text style={[styles.feeValue, { color: '#2ecc71' }]}>{formatCurrency(data.fees.totalPaid)}</Text>
      </View>
      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Outstanding Balance:</Text>
        <Text style={[styles.feeValue, { color: '#e74c3c' }]}>{(() => {
          const expected = safeNumber(data.fees.totalExpected);
          const paid = safeNumber(data.fees.totalPaid);
          const outstanding = data.fees.outstandingBalance != null ? safeNumber(data.fees.outstandingBalance) : (expected - paid);
          return formatCurrency(outstanding);
        })()}</Text>
      </View>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle}>💳 Payment History</Text>
      {data.fees.paymentHistory.length > 0 ? data.fees.paymentHistory.map((payment) => (
        <View key={payment.id} style={styles.paymentRow}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentDate}>{formatDate(payment.paymentDate)}</Text>
            <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>
          </View>
          <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
        </View>
      )) : (
        <Text style={styles.emptyText}>No payment history found.</Text>
      )}
    </View>
  </View>
);

const DisciplineTab: React.FC<{ data: ChildDetails }> = ({ data }) => (
  <View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>⚠️ Discipline Summary</Text>
      <View style={styles.disciplineRow}>
        <Text style={styles.disciplineLabel}>Total Recorded Issues:</Text>
        <Text style={styles.disciplineValue}>{data.discipline.totalIssues}</Text>
      </View>
    </View>

    {data.discipline.recentIssues.length > 0 ? (
      data.discipline.recentIssues.map((issue) => (
        <View key={issue.id} style={styles.issueCard}>
          <Text style={styles.issueType}>{issue.type}</Text>
          <Text style={styles.issueDescription}>{issue.description}</Text>
          <View style={styles.issueFooter}>
            <Text style={styles.issueDate}>{formatDate(issue.dateOccurred)}</Text>
            <Text style={[styles.issueStatus, {color: issue.status === 'PENDING' ? '#f39c12' : '#2ecc71'}]}>{issue.status}</Text>
          </View>
        </View>
      ))
    ) : (
      <View style={styles.card}>
        <Text style={styles.emptyText}>✅ No discipline issues recorded.</Text>
      </View>
    )}
  </View>
);

const ReportsTab: React.FC<{ studentId: number; token: string }> = ({ studentId, token }) => {
    const [academicYears, setAcademicYears] = useState<AcademicYearForReports[]>([]);
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
    const [selectedSequenceId, setSelectedSequenceId] = useState<number | null>(null);

    const [reportStatus, setReportStatus] = useState<ReportAvailability | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Dropdown state
    const [openYearPicker, setOpenYearPicker] = useState(false);
    const [openSequencePicker, setOpenSequencePicker] = useState(false);

    const yearItems = useMemo(() => academicYears.map(y => ({ label: y.name, value: y.id })), [academicYears]);
    const sequenceItems = useMemo(() => {
        const selectedYear = academicYears.find(y => y.id === selectedYearId);
        if (!selectedYear) return [];
        return selectedYear.examSequences.map(s => ({ label: s.name, value: s.id }));
    }, [selectedYearId, academicYears]);

    // Initial data fetch for academic years
    useEffect(() => {
        const fetchAcademicData = async () => {
            setIsDataLoading(true);
            try {
                const response = await fetch('https://sms.sniperbuisnesscenter.com/api/v1/academic-years', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to load academic years');

                const apiData = await response.json();
                const years: AcademicYearForReports[] = (apiData.data || []).map((year: any) => ({
                    ...year,
                    examSequences: year.examSequences.map((seq: any) => {
                        const term = year.terms.find((t: any) => t.id === seq.termId);
                        return { ...seq, name: `Sequence ${seq.sequenceNumber}${term ? ` - ${term.name}` : ''}` };
                    }),
                }));

                setAcademicYears(years);

                const currentYear = years.find(y => y.isCurrent) || years[0];
                if (currentYear) {
                    setSelectedYearId(currentYear.id);
                    if (currentYear.examSequences.length > 0) {
                        // Default to the last sequence of the current year
                        setSelectedSequenceId(currentYear.examSequences[currentYear.examSequences.length - 1].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch academic data for reports tab:", error);
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchAcademicData();
    }, [token]);

    // Fetch report status when selection changes
    useEffect(() => {
        const fetchReportAvailability = async () => {
            if (!selectedYearId || !selectedSequenceId) return;

            setIsReportLoading(true);
            setReportStatus(null);
            try {
                const url = `https://sms.sniperbuisnesscenter.com/api/v1/report-cards/student/${studentId}/availability?academicYearId=${selectedYearId}&examSequenceId=${selectedSequenceId}`;
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const apiData = await response.json();
                    if(apiData.success) {
                        setReportStatus(apiData.data);
                    } else {
                        throw new Error(apiData.error || 'Failed to check availability');
                    }
                } else {
                    const errorText = await response.text();
                    throw new Error(`Server error ${response.status}: ${errorText}`);
                }
            } catch (error) {
                console.error("Failed to fetch report availability:", error);
                setReportStatus({ available: false, status: 'FAILED', message: error instanceof Error ? error.message : 'An unknown error occurred' });
            } finally {
                setIsReportLoading(false);
            }
        };

        fetchReportAvailability();

    }, [studentId, token, selectedYearId, selectedSequenceId]);

    const handleDownload = async () => {
        if (!selectedYearId || !selectedSequenceId) return;

        setIsDownloading(true);
        try {
            const url = `https://sms.sniperbuisnesscenter.com/api/v1/report-cards/student/${studentId}?academicYearId=${selectedYearId}&examSequenceId=${selectedSequenceId}`;

            if (Platform.OS === 'web') {
                 // On web, we cannot easily download with auth headers. A backend change would be ideal.
                 // For now, we can try to fetch as blob and create a download link.
                 const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                 if(!response.ok) throw new Error("Failed to fetch PDF.");
                 const blob = await response.blob();
                 const downloadUrl = window.URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = downloadUrl;
                 a.download = `report-card-${studentId}-${selectedSequenceId}.pdf`;
                 document.body.appendChild(a);
                 a.click();
                 window.URL.revokeObjectURL(downloadUrl);
                 a.remove();
                 return;
            }

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Error', 'Sharing is not available on your device.');
                return;
            }

            const fileUri = FileSystem.cacheDirectory + `report-${studentId}-${selectedSequenceId}.pdf`;
            const { uri } = await FileSystem.downloadAsync(url, fileUri, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await Sharing.shareAsync(uri, { dialogTitle: 'Download Report Card' });

        } catch (error) {
            console.error("Download failed:", error);
            Alert.alert("Download Error", "Could not download the report card. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    }

    if (isDataLoading) {
        return <View style={styles.card}><ActivityIndicator /><Text style={styles.emptyText}>Loading options...</Text></View>;
    }

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>📄 Report Cards</Text>

            <View style={{ zIndex: 20, marginBottom: 16 }}>
                 <Text style={styles.settingLabel}>Academic Year</Text>
                 <DropDownPicker
                    listMode="MODAL"
                    open={openYearPicker}
                    value={selectedYearId}
                    items={yearItems}
                    setOpen={setOpenYearPicker}
                    setValue={setSelectedYearId}
                    style={styles.dropdownPicker}
                    dropDownContainerStyle={styles.dropdownContainer}
                    placeholder="Select a year"
                 />
            </View>

            <View style={{ zIndex: 10, marginBottom: 20 }}>
                <Text style={styles.settingLabel}>Exam / Sequence</Text>
                <DropDownPicker
                    listMode="MODAL"
                    open={openSequencePicker}
                    value={selectedSequenceId}
                    items={sequenceItems}
                    setOpen={setOpenSequencePicker}
                    setValue={setSelectedSequenceId}
                    style={styles.dropdownPicker}
                    dropDownContainerStyle={styles.dropdownContainer}
                    placeholder="Select a sequence"
                    disabled={!selectedYearId}
                />
            </View>

            {isReportLoading ? (
                <ActivityIndicator size="small" />
            ) : reportStatus ? (
                <View style={styles.reportStatusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reportStatus.status) }]}>
                        <Text style={styles.statusBadgeText}>{reportStatus.status.replace('_', ' ')}</Text>
                    </View>
                    <Text style={styles.statusMessage}>{reportStatus.message}</Text>

                    {reportStatus.status === 'COMPLETED' && (
                        <TouchableOpacity
                            style={[styles.downloadButton, isDownloading && styles.disabledButton]}
                            onPress={handleDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.downloadButtonText}>Download Report</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <Text style={styles.emptyText}>Select a year and sequence to check for a report.</Text>
            )}
        </View>
    );
};


// --- Main Component ---

type Tab = 'Overview' | 'Academics' | 'Attendance' | 'Fees' | 'Discipline' | 'Reports';

const tabs: Tab[] = ['Overview', 'Academics', 'Attendance', 'Fees', 'Discipline', 'Reports'];

type ChildDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'ChildDetails'>;

const ChildDetailsScreen: React.FC<ChildDetailsScreenProps> = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [childData, setChildData] = useState<ChildDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { studentId, token } = route.params;

  const fetchChildDetails = async () => {
    setIsLoading(true);
    setChildData(null); // Reset data

    const endpointsToTry = [
      `https://sms.sniperbuisnesscenter.com/api/v1/parents/me/children/${studentId}`,
      `https://sms.sniperbuisnesscenter.com/api/v1/parents/children/${studentId}`,
      `https://sms.sniperbuisnesscenter.com/api/v1/students/${studentId}/details`,
      `https://sms.sniperbuisnesscenter.com/api/v1/students/${studentId}`,
    ];

    let dataFound = false;

    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const apiData = await response.json();
          if (apiData.success && apiData.data) {
            setChildData(apiData.data);
            dataFound = true;
            console.log(`✅ Successfully loaded data from: ${endpoint}`);
            break; // Exit loop on success
          }
        } else {
          console.log(`Endpoint ${endpoint} failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
      }
    }

    if (!dataFound) {
      console.error('All endpoints failed. Could not fetch child details.');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (studentId && token) {
        fetchChildDetails();
    }
  }, [studentId, token]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading Student Details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!childData) {
    return (
      <SafeAreaView style={styles.safeArea}>
         <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load student details. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchChildDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab data={childData} />;
      case 'Academics': return <AcademicsTab data={childData} />;
      case 'Attendance': return <AttendanceTab data={childData} />;
      case 'Fees': return <FeesTab data={childData} />;
      case 'Discipline': return <DisciplineTab data={childData} />;
      case 'Reports': return <ReportsTab studentId={studentId} token={token} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{childData.name}'s Profile</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
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

      <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 20 }}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    backIcon: {
        fontSize: 24,
        color: '#333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
    },
    tabsBar: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tabButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: '#3b82f6',
    },
    tabText: {
        fontWeight: '600',
        fontSize: 15,
    },
    tabTextActive: {
        color: '#3b82f6',
    },
    tabTextInactive: {
        color: '#6b7280',
    },
    tabContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#171717',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4b5563',
        marginHorizontal: 4,
        marginBottom: 8,
    },
    profilePhoto: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#e5e7eb',
    },
    studentName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    infoText: {
        color: '#4b5563',
        fontSize: 14,
        marginBottom: 2,
    },
    metricsGrid: {
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
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    metricLabel: {
        color: '#6b7280',
        fontSize: 13,
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 15,
        paddingVertical: 20,
    },
    // Academic Tab
    subjectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    teacherName: {
        fontSize: 13,
        color: '#6b7280',
    },
    subjectAverage: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    expandIcon: {
        fontSize: 16,
        color: '#9ca3af',
        marginLeft: 16,
    },
    marksContainer: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 8,
    },
    markRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    markRowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 4,
    },
    markHeaderText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    markText: {
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
        flex: 1,
    },
    performanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    performanceLabel: {
        fontSize: 16,
        color: '#4b5563',
        fontWeight: '500',
    },
    performanceValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Attendance Tab
    attendanceSummary: {
        alignItems: 'center',
        marginBottom: 16,
    },
    attendanceRate: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    attendanceDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    attendanceBox: {
        alignItems: 'center',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    attendanceNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    attendanceLabel: {
        fontSize: 13,
        color: '#4b5563',
        marginTop: 2,
    },
    // Fee Tab
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    feeLabel: {
        fontSize: 15,
        color: '#4b5563',
    },
    feeValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentDate: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    paymentMethod: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 2,
    },
    paymentAmount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2ecc71',
    },
    // Discipline Tab
    disciplineRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    disciplineLabel: {
        fontSize: 16,
        color: '#4b5563',
    },
    disciplineValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    issueCard: {
        backgroundColor: '#fffbeb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    issueType: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#b45309',
        marginBottom: 4,
    },
    issueDescription: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
    },
    issueFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    issueDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    issueStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    // Reports Tab
    reportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    reportName: {
        fontSize: 15,
        color: '#3b82f6',
        fontWeight: '600',
        marginBottom: 2,
    },
    reportDetails: {
        fontSize: 13,
        color: '#6b7280',
    },
    downloadIcon: {
        fontSize: 20,
        color: '#3b82f6',
    },
    // New Styles for ReportsTab
    settingLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
        marginBottom: 8,
    },
    dropdownPicker: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
    },
    dropdownContainer: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
    },
    reportStatusContainer: {
        marginTop: 20,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    statusBadge: {
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    statusBadgeText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    statusMessage: {
        fontSize: 14,
        color: '#4b5563',
        textAlign: 'center',
        marginBottom: 16,
    },
    downloadButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
    },
    downloadButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Loading & Error
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ChildDetailsScreen; 