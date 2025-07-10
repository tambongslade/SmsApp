import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'early_dismissal';
  checkInTime?: string;
  checkOutTime?: string;
  reason?: string;
  approvedBy?: string;
}

interface AttendanceScreenProps {
  onBack: () => void;
  childName: string;
}

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ onBack, childName }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const attendanceData: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-12-01',
      status: 'present',
      checkInTime: '08:15 AM',
      checkOutTime: '03:30 PM',
    },
    {
      id: '2',
      date: '2024-12-02',
      status: 'late',
      checkInTime: '08:45 AM',
      checkOutTime: '03:30 PM',
      reason: 'Traffic delay',
    },
    {
      id: '3',
      date: '2024-12-03',
      status: 'present',
      checkInTime: '08:10 AM',
      checkOutTime: '03:30 PM',
    },
    {
      id: '4',
      date: '2024-12-04',
      status: 'absent',
      reason: 'Sick leave',
      approvedBy: 'Mrs. Thompson',
    },
    {
      id: '5',
      date: '2024-12-05',
      status: 'present',
      checkInTime: '08:20 AM',
      checkOutTime: '03:30 PM',
    },
    {
      id: '6',
      date: '2024-12-06',
      status: 'early_dismissal',
      checkInTime: '08:15 AM',
      checkOutTime: '01:00 PM',
      reason: 'Medical appointment',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#2ecc71';
      case 'late': return '#f39c12';
      case 'absent': return '#e74c3c';
      case 'early_dismissal': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✅';
      case 'late': return '⏰';
      case 'absent': return '❌';
      case 'early_dismissal': return '🔄';
      default: return '📋';
    }
  };

  const calculateStats = () => {
    const currentMonthData = attendanceData.filter(record => 
      new Date(record.date).getMonth() === selectedMonth
    );
    
    const totalDays = currentMonthData.length;
    const presentDays = currentMonthData.filter(r => r.status === 'present').length;
    const lateDays = currentMonthData.filter(r => r.status === 'late').length;
    const absentDays = currentMonthData.filter(r => r.status === 'absent').length;
    
    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      attendanceRate: totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0,
    };
  };

  const stats = calculateStats();

  const handleRequestAbsence = () => {
    Alert.alert(
      'Request Absence',
      'Submit an absence request for future dates',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit Request', onPress: () => Alert.alert('Request submitted for review') },
      ]
    );
  };

  const generateCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const calendar = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = attendanceData.find(r => r.date === dateStr);
      calendar.push({ day, record });
    }

    return calendar;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Attendance</Text>
          <Text style={styles.headerSubtitle}>{childName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#2ecc71' }]}>
            <Text style={styles.statNumber}>{stats.attendanceRate}%</Text>
            <Text style={styles.statLabel}>Attendance Rate</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
            <Text style={styles.statNumber}>{stats.presentDays}</Text>
            <Text style={styles.statLabel}>Present Days</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#e74c3c' }]}>
            <Text style={styles.statNumber}>{stats.absentDays}</Text>
            <Text style={styles.statLabel}>Absent Days</Text>
          </View>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity 
            style={styles.monthArrow}
            onPress={() => setSelectedMonth(selectedMonth > 0 ? selectedMonth - 1 : 11)}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {months[selectedMonth]} {selectedYear}
          </Text>
          
          <TouchableOpacity 
            style={styles.monthArrow}
            onPress={() => setSelectedMonth(selectedMonth < 11 ? selectedMonth + 1 : 0)}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar View */}
        <View style={styles.calendarContainer}>
          <View style={styles.weekDays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {generateCalendar().map((item, index) => (
              <View key={index} style={styles.calendarDay}>
                {item && (
                  <>
                    <Text style={styles.dayNumber}>{item.day}</Text>
                    {item.record && (
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.record.status) }]} />
                    )}
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f39c12' }]} />
              <Text style={styles.legendText}>Late</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.legendText}>Absent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3498db' }]} />
              <Text style={styles.legendText}>Early</Text>
            </View>
          </View>
        </View>

        {/* Recent Attendance */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {attendanceData.slice(0, 5).map((record) => (
          <View key={record.id} style={styles.attendanceCard}>
            <View style={styles.attendanceHeader}>
              <View style={styles.attendanceDate}>
                <Text style={styles.dateText}>
                  {new Date(record.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <View style={styles.attendanceStatus}>
                <Text style={styles.statusIcon}>{getStatusIcon(record.status)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                  {record.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.attendanceDetails}>
              {record.checkInTime && (
                <Text style={styles.timeText}>Check-in: {record.checkInTime}</Text>
              )}
              {record.checkOutTime && (
                <Text style={styles.timeText}>Check-out: {record.checkOutTime}</Text>
              )}
              {record.reason && (
                <Text style={styles.reasonText}>Reason: {record.reason}</Text>
              )}
              {record.approvedBy && (
                <Text style={styles.approvedText}>Approved by: {record.approvedBy}</Text>
              )}
            </View>
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.requestButton} onPress={handleRequestAbsence}>
            <Text style={styles.buttonText}>📝 Request Absence</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reportButton}>
            <Text style={styles.buttonText}>📊 Download Report</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>📞 Attendance Office</Text>
          <Text style={styles.contactText}>For attendance inquiries, call (555) 123-4567</Text>
          <Text style={styles.contactText}>Office hours: 8:00 AM - 4:00 PM</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#bdc3c7',
    fontSize: 14,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7f8c8d',
    paddingVertical: 5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayNumber: {
    fontSize: 14,
    color: '#2c3e50',
  },
  statusDot: {
    position: 'absolute',
    bottom: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  attendanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  attendanceDate: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  attendanceDetails: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  approvedText: {
    fontSize: 12,
    color: '#2ecc71',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  requestButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 3,
  },
});

export default AttendanceScreen; 