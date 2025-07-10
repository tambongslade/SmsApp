import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { User } from '../LoginScreen';

interface TimeSlot {
  id: string;
  period: string;
  startTime: string;
  endTime: string;
  type: 'lesson' | 'break' | 'lunch';
}

interface TimetableEntry {
  day: string;
  timeSlotId: string;
  subject: string;
  teacher: string;
  classroom: string;
  class: string;
}

interface ClassSchedule {
  className: string;
  schedule: TimetableEntry[];
}

interface VicePrincipalDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const VicePrincipalDashboard: React.FC<VicePrincipalDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'school' | 'teachers' | 'timeslots'>('overview');
  const [selectedClass, setSelectedClass] = useState<string>('Form 1A');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const timeSlots: TimeSlot[] = [
    { id: '1', period: '1st Period', startTime: '08:00', endTime: '08:40', type: 'lesson' },
    { id: '2', period: '2nd Period', startTime: '08:40', endTime: '09:20', type: 'lesson' },
    { id: '3', period: 'Break', startTime: '09:20', endTime: '09:40', type: 'break' },
    { id: '4', period: '3rd Period', startTime: '09:40', endTime: '10:20', type: 'lesson' },
    { id: '5', period: '4th Period', startTime: '10:20', endTime: '11:00', type: 'lesson' },
    { id: '6', period: '5th Period', startTime: '11:00', endTime: '11:40', type: 'lesson' },
    { id: '7', period: 'Lunch', startTime: '11:40', endTime: '12:40', type: 'lunch' },
    { id: '8', period: '6th Period', startTime: '12:40', endTime: '13:20', type: 'lesson' },
    { id: '9', period: '7th Period', startTime: '13:20', endTime: '14:00', type: 'lesson' },
    { id: '10', period: '8th Period', startTime: '14:00', endTime: '14:40', type: 'lesson' },
  ];

  const classes = ['Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 'Form 3A', 'Form 3B', 'Form 4A', 'Form 4B'];
  const subjects = ['Mathematics', 'English', 'French', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'];
  const teachers = ['Mrs. Thompson', 'Mr. Wilson', 'Dr. Johnson', 'Ms. Davis', 'Mr. Brown', 'Mrs. Lee'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Sample timetable data
  const [timetables, setTimetables] = useState<ClassSchedule[]>([
    {
      className: 'Form 1A',
      schedule: [
        { day: 'Monday', timeSlotId: '1', subject: 'Mathematics', teacher: 'Mrs. Thompson', classroom: 'Room 101', class: 'Form 1A' },
        { day: 'Monday', timeSlotId: '2', subject: 'English', teacher: 'Mr. Wilson', classroom: 'Room 102', class: 'Form 1A' },
        { day: 'Monday', timeSlotId: '4', subject: 'Physics', teacher: 'Dr. Johnson', classroom: 'Lab 1', class: 'Form 1A' },
        { day: 'Tuesday', timeSlotId: '1', subject: 'French', teacher: 'Ms. Davis', classroom: 'Room 103', class: 'Form 1A' },
        { day: 'Tuesday', timeSlotId: '2', subject: 'Chemistry', teacher: 'Mr. Brown', classroom: 'Lab 2', class: 'Form 1A' },
      ]
    },
    {
      className: 'Form 1B',
      schedule: [
        { day: 'Monday', timeSlotId: '1', subject: 'English', teacher: 'Mr. Wilson', classroom: 'Room 104', class: 'Form 1B' },
        { day: 'Monday', timeSlotId: '2', subject: 'Mathematics', teacher: 'Mrs. Thompson', classroom: 'Room 105', class: 'Form 1B' },
        { day: 'Tuesday', timeSlotId: '1', subject: 'Biology', teacher: 'Mrs. Lee', classroom: 'Lab 3', class: 'Form 1B' },
      ]
    }
  ]);

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{classes.length}</Text>
          <Text style={styles.statLabel}>Total Classes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{timeSlots.filter(ts => ts.type === 'lesson').length}</Text>
          <Text style={styles.statLabel}>Periods/Day</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{subjects.length}</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teachers.length}</Text>
          <Text style={styles.statLabel}>Teachers</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('classes')}>
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.actionText}>Class Timetables</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('school')}>
            <Text style={styles.actionIcon}>🏫</Text>
            <Text style={styles.actionText}>School Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('teachers')}>
            <Text style={styles.actionIcon}>👩‍🏫</Text>
            <Text style={styles.actionText}>Teacher Schedules</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowCreateModal(true)}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Today's Schedule Conflicts</Text>
        <View style={styles.conflictItem}>
          <Text style={styles.conflictIcon}>⚠️</Text>
          <View style={styles.conflictContent}>
            <Text style={styles.conflictText}>Mrs. Thompson scheduled for 2 classes at 08:00</Text>
            <Text style={styles.conflictTime}>Form 1A & Form 2A - Mathematics</Text>
          </View>
        </View>
        <View style={styles.conflictItem}>
          <Text style={styles.conflictIcon}>🔄</Text>
          <View style={styles.conflictContent}>
            <Text style={styles.conflictText}>Room 101 double-booked at 10:20</Text>
            <Text style={styles.conflictTime}>Form 1A Physics & Form 3A Chemistry</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderClassTimetables = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.classSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {classes.map((className) => (
            <TouchableOpacity
              key={className}
              style={[styles.classButton, selectedClass === className && styles.activeClassButton]}
              onPress={() => setSelectedClass(className)}
            >
              <Text style={[styles.classButtonText, selectedClass === className && styles.activeClassButtonText]}>
                {className}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.timetableContainer}>
        <View style={styles.timetableHeader}>
          <View style={styles.timeColumn}>
            <Text style={styles.headerText}>Time</Text>
          </View>
          {days.map((day) => (
            <View key={day} style={styles.dayColumn}>
              <Text style={styles.headerText}>{day.slice(0, 3)}</Text>
            </View>
          ))}
        </View>

        {timeSlots.map((slot) => (
          <View key={slot.id} style={styles.timetableRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{slot.startTime}</Text>
              <Text style={styles.periodText}>{slot.period}</Text>
            </View>
            {days.map((day) => {
              const entry = timetables
                .find(t => t.className === selectedClass)
                ?.schedule.find(s => s.day === day && s.timeSlotId === slot.id);
              
              return (
                <TouchableOpacity key={day} style={[styles.dayColumn, styles.scheduleCell]}>
                  {slot.type === 'break' ? (
                    <Text style={styles.breakText}>Break</Text>
                  ) : slot.type === 'lunch' ? (
                    <Text style={styles.lunchText}>Lunch</Text>
                  ) : entry ? (
                    <View style={styles.scheduleEntry}>
                      <Text style={styles.subjectText}>{entry.subject}</Text>
                      <Text style={styles.teacherText}>{entry.teacher}</Text>
                      <Text style={styles.roomText}>{entry.classroom}</Text>
                    </View>
                  ) : (
                    <Text style={styles.emptySlot}>Free</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSchoolOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Whole School Timetable Overview</Text>
      
      {timeSlots.filter(slot => slot.type === 'lesson').map((slot) => (
        <View key={slot.id} style={styles.schoolPeriodCard}>
          <View style={styles.periodHeader}>
            <Text style={styles.periodTitle}>{slot.period}</Text>
            <Text style={styles.periodTime}>{slot.startTime} - {slot.endTime}</Text>
          </View>
          
          <View style={styles.classGrid}>
            {classes.map((className) => {
              const classSchedule = timetables.find(t => t.className === className);
              const hasSchedule = classSchedule?.schedule.some(s => s.timeSlotId === slot.id);
              
              return (
                <View key={className} style={[styles.classStatusCard, hasSchedule ? styles.scheduledClass : styles.unscheduledClass]}>
                  <Text style={styles.classStatusText}>{className}</Text>
                  <Text style={styles.classStatusLabel}>{hasSchedule ? 'Scheduled' : 'Free'}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderTeacherSchedules = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Teacher Workload Overview</Text>
      
      {teachers.map((teacher) => {
        const teacherClasses = timetables.flatMap(t => 
          t.schedule.filter(s => s.teacher === teacher)
        );
        
        return (
          <View key={teacher} style={styles.teacherCard}>
            <View style={styles.teacherHeader}>
              <Text style={styles.teacherName}>{teacher}</Text>
              <Text style={styles.teacherWorkload}>{teacherClasses.length} periods/week</Text>
            </View>
            
            <View style={styles.teacherSchedule}>
              {days.map((day) => {
                const dayClasses = teacherClasses.filter(tc => tc.day === day);
                return (
                  <View key={day} style={styles.teacherDayColumn}>
                    <Text style={styles.teacherDayHeader}>{day.slice(0, 3)}</Text>
                    {dayClasses.map((tc, index) => {
                      const slot = timeSlots.find(ts => ts.id === tc.timeSlotId);
                      return (
                        <View key={index} style={styles.teacherPeriod}>
                          <Text style={styles.teacherPeriodTime}>{slot?.startTime}</Text>
                          <Text style={styles.teacherPeriodClass}>{tc.class}</Text>
                          <Text style={styles.teacherPeriodSubject}>{tc.subject}</Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderTimeSlots = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Time Slots Management</Text>
      
      {timeSlots.map((slot) => (
        <View key={slot.id} style={styles.timeSlotCard}>
          <View style={styles.timeSlotHeader}>
            <Text style={styles.timeSlotPeriod}>{slot.period}</Text>
            <Text style={[styles.timeSlotType, 
              slot.type === 'lesson' ? styles.lessonType :
              slot.type === 'break' ? styles.breakType : styles.lunchType
            ]}>
              {slot.type.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.timeSlotTime}>{slot.startTime} - {slot.endTime}</Text>
          {slot.type === 'lesson' && (
            <Text style={styles.timeSlotDuration}>40 minutes</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#34495e" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>👩‍💼 Vice Principal</Text>
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
          style={[styles.tab, activeTab === 'school' && styles.activeTab]}
          onPress={() => setActiveTab('school')}
        >
          <Text style={[styles.tabText, activeTab === 'school' && styles.activeTabText]}>
            School
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'teachers' && styles.activeTab]}
          onPress={() => setActiveTab('teachers')}
        >
          <Text style={[styles.tabText, activeTab === 'teachers' && styles.activeTabText]}>
            Teachers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'timeslots' && styles.activeTab]}
          onPress={() => setActiveTab('timeslots')}
        >
          <Text style={[styles.tabText, activeTab === 'timeslots' && styles.activeTabText]}>
            Time Slots
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'classes' && renderClassTimetables()}
        {activeTab === 'school' && renderSchoolOverview()}
        {activeTab === 'teachers' && renderTeacherSchedules()}
        {activeTab === 'timeslots' && renderTimeSlots()}
      </View>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Schedule Entry</Text>
            <Text style={styles.modalSubtitle}>This feature will be implemented soon</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowCreateModal(false)}
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
    backgroundColor: '#34495e',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
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
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  conflictItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  conflictIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  conflictContent: {
    flex: 1,
  },
  conflictText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  conflictTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  classSelector: {
    marginBottom: 20,
  },
  classButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  activeClassButton: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  classButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeClassButtonText: {
    color: '#fff',
  },
  timetableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timetableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 10,
    marginBottom: 10,
  },
  timetableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    paddingVertical: 5,
  },
  timeColumn: {
    width: 80,
    padding: 5,
    justifyContent: 'center',
  },
  dayColumn: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3498db',
  },
  periodText: {
    fontSize: 9,
    color: '#7f8c8d',
  },
  scheduleCell: {
    minHeight: 60,
    justifyContent: 'center',
  },
  scheduleEntry: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
  },
  teacherText: {
    fontSize: 9,
    color: '#757575',
    textAlign: 'center',
  },
  roomText: {
    fontSize: 8,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  breakText: {
    fontSize: 10,
    color: '#f39c12',
    fontWeight: '600',
    textAlign: 'center',
  },
  lunchText: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySlot: {
    fontSize: 9,
    color: '#bdc3c7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  schoolPeriodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  periodTime: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  classStatusCard: {
    width: '23%',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduledClass: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  unscheduledClass: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  classStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classStatusLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  teacherWorkload: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  teacherSchedule: {
    flexDirection: 'row',
  },
  teacherDayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  teacherDayHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 10,
  },
  teacherPeriod: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
    alignItems: 'center',
    width: '90%',
  },
  teacherPeriodTime: {
    fontSize: 10,
    color: '#3498db',
    fontWeight: 'bold',
  },
  teacherPeriodClass: {
    fontSize: 9,
    color: '#2c3e50',
    fontWeight: '600',
  },
  teacherPeriodSubject: {
    fontSize: 8,
    color: '#7f8c8d',
  },
  timeSlotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeSlotPeriod: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  timeSlotType: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  lessonType: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  breakType: {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
  },
  lunchType: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  },
  timeSlotTime: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  timeSlotDuration: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
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
    padding: 20,
    width: '80%',
    alignItems: 'center',
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
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VicePrincipalDashboard; 