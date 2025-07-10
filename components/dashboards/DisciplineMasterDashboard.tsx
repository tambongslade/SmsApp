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
  TextInput,
  Alert,
} from 'react-native';
import { User } from '../LoginScreen';

interface DisciplinaryIncident {
  id: string;
  studentName: string;
  studentClass: string;
  incidentType: 'minor' | 'major' | 'severe';
  description: string;
  location: string;
  reportedBy: string;
  timestamp: string;
  status: 'reported' | 'investigating' | 'resolved' | 'escalated';
  actionTaken?: string;
}

interface StudentRecord {
  id: string;
  name: string;
  class: string;
  totalIncidents: number;
  recentIncidents: number;
  behaviorScore: number;
  lastIncidentDate: string;
  status: 'good' | 'warning' | 'concern' | 'critical';
  parentContact: string;
}

interface DisciplinaryAction {
  id: string;
  studentName: string;
  studentClass: string;
  actionType: 'warning' | 'detention' | 'suspension' | 'parent_meeting' | 'counseling';
  description: string;
  assignedBy: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface DisciplineMasterDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const DisciplineMasterDashboard: React.FC<DisciplineMasterDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'students' | 'actions' | 'reports'>('overview');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  
  const [newIncident, setNewIncident] = useState({
    studentName: '',
    studentClass: '',
    incidentType: 'minor' as 'minor' | 'major' | 'severe',
    description: '',
    location: '',
  });

  const [newAction, setNewAction] = useState({
    studentName: '',
    studentClass: '',
    actionType: 'warning' as 'warning' | 'detention' | 'suspension' | 'parent_meeting' | 'counseling',
    description: '',
    dueDate: '',
  });

  // Sample data - in real app, this would come from your backend
  const [incidents] = useState<DisciplinaryIncident[]>([
    {
      id: '1',
      studentName: 'Michael Johnson',
      studentClass: 'Form 3A',
      incidentType: 'major',
      description: 'Disruptive behavior in Mathematics class, refusing to follow teacher instructions',
      location: 'Mathematics Classroom',
      reportedBy: 'Mrs. Elizabeth Thompson',
      timestamp: '2024-12-06 10:30 AM',
      status: 'investigating',
    },
    {
      id: '2',
      studentName: 'Sarah Williams',
      studentClass: 'Form 2B',
      incidentType: 'minor',
      description: 'Late arrival to school without valid excuse',
      location: 'School Gate',
      reportedBy: 'Security Guard',
      timestamp: '2024-12-06 8:45 AM',
      status: 'resolved',
      actionTaken: 'Verbal warning given',
    },
    {
      id: '3',
      studentName: 'David Brown',
      studentClass: 'Form 4A',
      incidentType: 'severe',
      description: 'Fighting with another student during lunch break',
      location: 'Cafeteria',
      reportedBy: 'Mr. James Wilson',
      timestamp: '2024-12-05 1:15 PM',
      status: 'escalated',
      actionTaken: 'Parents contacted, suspension pending',
    },
    {
      id: '4',
      studentName: 'Emily Davis',
      studentClass: 'Form 1A',
      incidentType: 'minor',
      description: 'Talking during class after repeated warnings',
      location: 'English Classroom',
      reportedBy: 'Ms. Patricia Lee',
      timestamp: '2024-12-05 11:20 AM',
      status: 'resolved',
      actionTaken: 'After-school detention assigned',
    },
  ]);

  const [studentRecords] = useState<StudentRecord[]>([
    {
      id: '1',
      name: 'Michael Johnson',
      class: 'Form 3A',
      totalIncidents: 5,
      recentIncidents: 2,
      behaviorScore: 65,
      lastIncidentDate: '2024-12-06',
      status: 'concern',
      parentContact: '+237 670 123 456',
    },
    {
      id: '2',
      name: 'Sarah Williams',
      class: 'Form 2B',
      totalIncidents: 2,
      recentIncidents: 1,
      behaviorScore: 85,
      lastIncidentDate: '2024-12-06',
      status: 'good',
      parentContact: '+237 677 234 567',
    },
    {
      id: '3',
      name: 'David Brown',
      class: 'Form 4A',
      totalIncidents: 8,
      recentIncidents: 3,
      behaviorScore: 45,
      lastIncidentDate: '2024-12-05',
      status: 'critical',
      parentContact: '+237 681 345 678',
    },
    {
      id: '4',
      name: 'Emily Davis',
      class: 'Form 1A',
      totalIncidents: 1,
      recentIncidents: 1,
      behaviorScore: 92,
      lastIncidentDate: '2024-12-05',
      status: 'good',
      parentContact: '+237 654 456 789',
    },
    {
      id: '5',
      name: 'James Miller',
      class: 'Form 5B',
      totalIncidents: 4,
      recentIncidents: 1,
      behaviorScore: 75,
      lastIncidentDate: '2024-12-03',
      status: 'warning',
      parentContact: '+237 675 567 890',
    },
  ]);

  const [disciplinaryActions] = useState<DisciplinaryAction[]>([
    {
      id: '1',
      studentName: 'Michael Johnson',
      studentClass: 'Form 3A',
      actionType: 'parent_meeting',
      description: 'Meeting with parents to discuss recent behavioral issues',
      assignedBy: user.name,
      dueDate: '2024-12-08',
      status: 'pending',
    },
    {
      id: '2',
      studentName: 'David Brown',
      studentClass: 'Form 4A',
      actionType: 'suspension',
      description: '3-day suspension for fighting incident',
      assignedBy: user.name,
      dueDate: '2024-12-07',
      status: 'pending',
    },
    {
      id: '3',
      studentName: 'Emily Davis',
      studentClass: 'Form 1A',
      actionType: 'detention',
      description: 'After-school detention for disruptive behavior',
      assignedBy: user.name,
      dueDate: '2024-12-06',
      status: 'completed',
    },
    {
      id: '4',
      studentName: 'James Miller',
      studentClass: 'Form 5B',
      actionType: 'counseling',
      description: 'Guidance counseling session for attitude improvement',
      assignedBy: user.name,
      dueDate: '2024-12-09',
      status: 'pending',
    },
  ]);

  const getIncidentTypeColor = (type: string) => {
    switch (type) {
      case 'severe': return '#e74c3c';
      case 'major': return '#f39c12';
      case 'minor': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#27ae60';
      case 'investigating': return '#f39c12';
      case 'escalated': return '#e74c3c';
      case 'completed': return '#27ae60';
      case 'overdue': return '#e74c3c';
      case 'pending': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getBehaviorStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#27ae60';
      case 'warning': return '#f39c12';
      case 'concern': return '#e67e22';
      case 'critical': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const handleSubmitIncident = () => {
    if (!newIncident.studentName || !newIncident.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert('Success', 'Incident reported successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setNewIncident({
            studentName: '',
            studentClass: '',
            incidentType: 'minor',
            description: '',
            location: '',
          });
          setShowIncidentModal(false);
        },
      },
    ]);
  };

  const handleSubmitAction = () => {
    if (!newAction.studentName || !newAction.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert('Success', 'Disciplinary action assigned successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setNewAction({
            studentName: '',
            studentClass: '',
            actionType: 'warning',
            description: '',
            dueDate: '',
          });
          setShowActionModal(false);
        },
      },
    ]);
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>📊</Text>
          <Text style={styles.metricValue}>{incidents.length}</Text>
          <Text style={styles.metricLabel}>Total Incidents</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>⚠️</Text>
          <Text style={styles.metricValue}>{incidents.filter(i => i.status === 'investigating').length}</Text>
          <Text style={styles.metricLabel}>Under Investigation</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>🎯</Text>
          <Text style={styles.metricValue}>{disciplinaryActions.filter(a => a.status === 'pending').length}</Text>
          <Text style={styles.metricLabel}>Pending Actions</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>👥</Text>
          <Text style={styles.metricValue}>{studentRecords.filter(s => s.status !== 'good').length}</Text>
          <Text style={styles.metricLabel}>Students at Risk</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Incidents</Text>
        {incidents.slice(0, 3).map((incident) => (
          <View key={incident.id} style={styles.incidentItem}>
            <View style={styles.incidentHeader}>
              <View style={styles.incidentInfo}>
                <Text style={styles.studentName}>{incident.studentName}</Text>
                <Text style={styles.classInfo}>{incident.studentClass}</Text>
              </View>
              <View style={styles.incidentBadges}>
                <View style={[styles.typeBadge, { backgroundColor: getIncidentTypeColor(incident.incidentType) }]}>
                  <Text style={styles.badgeText}>{incident.incidentType.toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                  <Text style={styles.badgeText}>{incident.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.incidentDescription} numberOfLines={2}>
              {incident.description}
            </Text>
            <Text style={styles.incidentTime}>{incident.timestamp}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowIncidentModal(true)}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>Report Incident</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowActionModal(true)}>
            <Text style={styles.actionIcon}>⚖️</Text>
            <Text style={styles.actionText}>Assign Action</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('students')}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>View Students</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('reports')}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Critical Students</Text>
        {studentRecords
          .filter(student => student.status === 'critical' || student.status === 'concern')
          .map((student) => (
            <View key={student.id} style={styles.studentItem}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.classInfo}>{student.class}</Text>
              </View>
              <View style={styles.studentStats}>
                <Text style={styles.incidentCount}>{student.totalIncidents} incidents</Text>
                <View style={[styles.statusBadge, { backgroundColor: getBehaviorStatusColor(student.status) }]}>
                  <Text style={styles.badgeText}>{student.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );

  const renderIncidents = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.headerActions}>
        <Text style={styles.sectionTitle}>Disciplinary Incidents</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowIncidentModal(true)}>
          <Text style={styles.addButtonText}>+ Report</Text>
        </TouchableOpacity>
      </View>

      {incidents.map((incident) => (
        <View key={incident.id} style={styles.incidentCard}>
          <View style={styles.incidentHeader}>
            <View style={styles.incidentInfo}>
              <Text style={styles.studentName}>{incident.studentName}</Text>
              <Text style={styles.classInfo}>{incident.studentClass} • {incident.location}</Text>
            </View>
            <View style={styles.incidentBadges}>
              <View style={[styles.typeBadge, { backgroundColor: getIncidentTypeColor(incident.incidentType) }]}>
                <Text style={styles.badgeText}>{incident.incidentType.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                <Text style={styles.badgeText}>{incident.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.incidentDescription}>{incident.description}</Text>
          
          <View style={styles.incidentFooter}>
            <Text style={styles.reportedBy}>Reported by: {incident.reportedBy}</Text>
            <Text style={styles.incidentTime}>{incident.timestamp}</Text>
          </View>

          {incident.actionTaken && (
            <View style={styles.actionTakenSection}>
              <Text style={styles.actionTakenLabel}>Action Taken:</Text>
              <Text style={styles.actionTakenText}>{incident.actionTaken}</Text>
            </View>
          )}

          <View style={styles.incidentActions}>
            <TouchableOpacity style={styles.investigateButton}>
              <Text style={styles.buttonText}>🔍 Investigate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resolveButton}>
              <Text style={styles.buttonText}>✅ Resolve</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderStudents = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Student Behavior Records</Text>
      
      {studentRecords.map((student) => (
        <View key={student.id} style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.classInfo}>{student.class}</Text>
            </View>
            <View style={styles.studentBadges}>
              <View style={[styles.statusBadge, { backgroundColor: getBehaviorStatusColor(student.status) }]}>
                <Text style={styles.badgeText}>{student.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.behaviorScore}>{student.behaviorScore}/100</Text>
            </View>
          </View>

          <View style={styles.studentStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{student.totalIncidents}</Text>
              <Text style={styles.statLabel}>Total Incidents</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{student.recentIncidents}</Text>
              <Text style={styles.statLabel}>Recent (30 days)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{student.lastIncidentDate}</Text>
              <Text style={styles.statLabel}>Last Incident</Text>
            </View>
          </View>

          <View style={styles.studentActions}>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>📞 Contact Parent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewRecordButton}>
              <Text style={styles.buttonText}>📋 View Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderActions = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.headerActions}>
        <Text style={styles.sectionTitle}>Disciplinary Actions</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowActionModal(true)}>
          <Text style={styles.addButtonText}>+ Assign</Text>
        </TouchableOpacity>
      </View>

      {disciplinaryActions.map((action) => (
        <View key={action.id} style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <View style={styles.actionInfo}>
              <Text style={styles.studentName}>{action.studentName}</Text>
              <Text style={styles.classInfo}>{action.studentClass}</Text>
            </View>
            <View style={styles.actionBadges}>
              <View style={styles.actionTypeBadge}>
                <Text style={styles.actionTypeText}>{action.actionType.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(action.status) }]}>
                <Text style={styles.badgeText}>{action.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.actionDescription}>{action.description}</Text>
          
          <View style={styles.actionFooter}>
            <Text style={styles.assignedBy}>Assigned by: {action.assignedBy}</Text>
            <Text style={styles.dueDate}>Due: {action.dueDate}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.buttonText}>✅ Mark Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.buttonText}>✏️ Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Behavior Reports</Text>
      
      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>📊 Incident Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{incidents.filter(i => i.incidentType === 'minor').length}</Text>
            <Text style={styles.statCategory}>Minor Incidents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{incidents.filter(i => i.incidentType === 'major').length}</Text>
            <Text style={styles.statCategory}>Major Incidents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{incidents.filter(i => i.incidentType === 'severe').length}</Text>
            <Text style={styles.statCategory}>Severe Incidents</Text>
          </View>
        </View>
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>🎯 Action Effectiveness</Text>
        <View style={styles.effectivenessStats}>
          <View style={styles.effectivenessItem}>
            <Text style={styles.effectivenessLabel}>Completed Actions</Text>
            <Text style={styles.effectivenessValue}>
              {disciplinaryActions.filter(a => a.status === 'completed').length}/{disciplinaryActions.length}
            </Text>
          </View>
          <View style={styles.effectivenessItem}>
            <Text style={styles.effectivenessLabel}>Pending Actions</Text>
            <Text style={styles.effectivenessValue}>
              {disciplinaryActions.filter(a => a.status === 'pending').length}
            </Text>
          </View>
          <View style={styles.effectivenessItem}>
            <Text style={styles.effectivenessLabel}>Overdue Actions</Text>
            <Text style={styles.effectivenessValue}>
              {disciplinaryActions.filter(a => a.status === 'overdue').length}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>📈 Trends & Insights</Text>
        <View style={styles.trendItem}>
          <Text style={styles.trendIcon}>📉</Text>
          <View style={styles.trendContent}>
            <Text style={styles.trendText}>Incidents decreased by 15% compared to last month</Text>
            <Text style={styles.trendType}>Positive Trend</Text>
          </View>
        </View>
        <View style={styles.trendItem}>
          <Text style={styles.trendIcon}>⚠️</Text>
          <View style={styles.trendContent}>
            <Text style={styles.trendText}>Form 4A has highest incident rate - needs attention</Text>
            <Text style={styles.trendType}>Action Required</Text>
          </View>
        </View>
        <View style={styles.trendItem}>
          <Text style={styles.trendIcon}>👍</Text>
          <View style={styles.trendContent}>
            <Text style={styles.trendText}>85% of assigned actions completed on time</Text>
            <Text style={styles.trendType}>Good Performance</Text>
          </View>
        </View>
      </View>

      <View style={styles.exportSection}>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📄 Export Full Behavior Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e67e22" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🛡️ Discipline Master</Text>
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
          style={[styles.tab, activeTab === 'incidents' && styles.activeTab]}
          onPress={() => setActiveTab('incidents')}
        >
          <Text style={[styles.tabText, activeTab === 'incidents' && styles.activeTabText]}>
            Incidents
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'students' && styles.activeTab]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>
            Students
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'actions' && styles.activeTab]}
          onPress={() => setActiveTab('actions')}
        >
          <Text style={[styles.tabText, activeTab === 'actions' && styles.activeTabText]}>
            Actions
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'incidents' && renderIncidents()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'actions' && renderActions()}
        {activeTab === 'reports' && renderReports()}
      </View>

      {/* Report Incident Modal */}
      <Modal visible={showIncidentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report New Incident</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Student Name"
              value={newIncident.studentName}
              onChangeText={(text) => setNewIncident({...newIncident, studentName: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Class (e.g., Form 3A)"
              value={newIncident.studentClass}
              onChangeText={(text) => setNewIncident({...newIncident, studentClass: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Location"
              value={newIncident.location}
              onChangeText={(text) => setNewIncident({...newIncident, location: text})}
            />
            
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Describe the incident..."
              multiline
              numberOfLines={4}
              value={newIncident.description}
              onChangeText={(text) => setNewIncident({...newIncident, description: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowIncidentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitIncident}>
                <Text style={styles.submitButtonText}>Report Incident</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Action Modal */}
      <Modal visible={showActionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Disciplinary Action</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Student Name"
              value={newAction.studentName}
              onChangeText={(text) => setNewAction({...newAction, studentName: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Class"
              value={newAction.studentClass}
              onChangeText={(text) => setNewAction({...newAction, studentClass: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Due Date (YYYY-MM-DD)"
              value={newAction.dueDate}
              onChangeText={(text) => setNewAction({...newAction, dueDate: text})}
            />
            
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Action description..."
              multiline
              numberOfLines={4}
              value={newAction.description}
              onChangeText={(text) => setNewAction({...newAction, description: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowActionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAction}>
                <Text style={styles.submitButtonText}>Assign Action</Text>
              </TouchableOpacity>
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
  header: {
    backgroundColor: '#e67e22',
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#e67e22',
  },
  tabText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#e67e22',
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#e67e22',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  incidentItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  incidentCard: {
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
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  incidentInfo: {
    flex: 1,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classInfo: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  incidentBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 10,
  },
  incidentTime: {
    fontSize: 11,
    color: '#95a5a6',
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  reportedBy: {
    fontSize: 12,
    color: '#7f8c8d',
    flex: 1,
  },
  actionTakenSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  actionTakenLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 5,
  },
  actionTakenText: {
    fontSize: 13,
    color: '#2c3e50',
  },
  incidentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  investigateButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  resolveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  studentBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  behaviorScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e67e22',
    marginLeft: 10,
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    backgroundColor: '#e67e22',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewRecordButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  incidentCount: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 10,
  },
  actionCard: {
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
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionInfo: {
    flex: 1,
  },
  actionBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionTypeBadge: {
    backgroundColor: '#95a5a6',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  actionTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionDescription: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 10,
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  assignedBy: {
    fontSize: 12,
    color: '#7f8c8d',
    flex: 1,
  },
  dueDate: {
    fontSize: 12,
    color: '#e67e22',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  completeButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  reportCard: {
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
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 5,
  },
  statCategory: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  effectivenessStats: {
    flexDirection: 'column',
  },
  effectivenessItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  effectivenessLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  effectivenessValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  trendIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  trendContent: {
    flex: 1,
  },
  trendText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  trendType: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  exportSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: '#e67e22',
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
    marginHorizontal: 40,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#e67e22',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DisciplineMasterDashboard; 