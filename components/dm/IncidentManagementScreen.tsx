import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';


interface IncidentManagementScreenProps {
  token: string;
  user: any;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

interface Incident {
  id: number;
  studentName: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  date: string;
  time: string;
  status: 'PENDING' | 'RESOLVED' | 'ESCALATED';
  description: string;
  actionTaken?: string;
}

const IncidentManagementScreen: React.FC<IncidentManagementScreenProps> = ({
  token,
  user,
  onNavigateBack,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState('active');
  const [showNewIncidentModal, setShowNewIncidentModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    studentName: '',
    type: '',
    severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    description: '',
    actionTaken: '',
  });

  // Mock data
  const incidents: Incident[] = [
    {
      id: 1,
      studentName: 'Alice Brown',
      type: 'Misconduct',
      severity: 'HIGH',
      date: '2024-01-22',
      time: '10:30',
      status: 'ESCALATED',
      description: 'Disruptive behavior during math class',
      actionTaken: 'Principal review scheduled'
    },
    {
      id: 2,
      studentName: 'John Doe',
      type: 'Lateness',
      severity: 'LOW',
      date: '2024-01-22',
      time: '08:15',
      status: 'PENDING',
      description: 'Arrived 45 minutes late',
      actionTaken: 'Warning issued'
    },
    {
      id: 3,
      studentName: 'Mary Smith',
      type: 'Fighting',
      severity: 'HIGH',
      date: '2024-01-21',
      time: '12:45',
      status: 'PENDING',
      description: 'Physical altercation in cafeteria',
      actionTaken: 'Under investigation'
    },
    {
      id: 4,
      studentName: 'Peter Johnson',
      type: 'Uniform Violation',
      severity: 'LOW',
      date: '2024-01-21',
      time: '07:30',
      status: 'RESOLVED',
      description: 'Improper uniform',
      actionTaken: 'Corrected, parent contacted'
    }
  ];

  const incidentTypes = [
    'Misconduct',
    'Fighting',
    'Lateness',
    'Uniform Violation',
    'Disrespect',
    'Vandalism',
    'Bullying',
    'Other'
  ];

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED');

  const getSeverityColor = (severity: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (severity) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return '#27ae60';
      case 'ESCALATED': return '#e74c3c';
      default: return '#f39c12';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fighting': return '👊';
      case 'misconduct': return '⚠️';
      case 'lateness': return '⏰';
      case 'uniform violation': return '👔';
      case 'disrespect': return '🗣️';
      case 'vandalism': return '🔨';
      case 'bullying': return '😠';
      default: return '📝';
    }
  };

  const handleNewIncident = () => {
    if (!newIncident.studentName || !newIncident.type || !newIncident.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert('Success', 'Incident recorded successfully');
    setShowNewIncidentModal(false);
    setNewIncident({
      studentName: '',
      type: '',
      severity: 'MEDIUM',
      description: '',
      actionTaken: '',
    });
  };

  const handleUpdateIncident = (incidentId: number, action: string) => {
    Alert.alert(
      'Update Incident',
      `${action} for incident #${incidentId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => Alert.alert('Updated', `Incident ${action.toLowerCase()}`) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c0392b" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>⚠️ Incident Management</Text>
          <Text style={styles.headerSubtitle}>Track & Resolve Issues</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowNewIncidentModal(true)}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: '#e74c3c' }]}>
            <Text style={styles.statNumber}>{activeIncidents.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#f39c12' }]}>
            <Text style={styles.statNumber}>{incidents.filter(i => i.status === 'ESCALATED').length}</Text>
            <Text style={styles.statLabel}>Escalated</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#27ae60' }]}>
            <Text style={styles.statNumber}>{resolvedIncidents.length}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({activeIncidents.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'resolved' && styles.activeTab]}
          onPress={() => setActiveTab('resolved')}
        >
          <Text style={[styles.tabText, activeTab === 'resolved' && styles.activeTabText]}>
            Resolved ({resolvedIncidents.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'priority' && styles.activeTab]}
          onPress={() => setActiveTab('priority')}
        >
          <Text style={[styles.tabText, activeTab === 'priority' && styles.activeTabText]}>
            Priority
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Active Incidents</Text>
            
            {activeIncidents.map((incident) => (
              <View key={incident.id} style={styles.incidentCard}>
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentIcon}>
                    <Text style={styles.typeIcon}>{getTypeIcon(incident.type)}</Text>
                  </View>
                  <View style={styles.incidentInfo}>
                    <Text style={styles.studentName}>{incident.studentName}</Text>
                    <Text style={styles.incidentType}>{incident.type} • {incident.date}</Text>
                  </View>
                  <View style={styles.severityBadge}>
                    <View style={[
                      styles.severityDot,
                      { backgroundColor: getSeverityColor(incident.severity) }
                    ]} />
                    <Text style={styles.severityText}>{incident.severity}</Text>
                  </View>
                </View>

                <Text style={styles.description}>{incident.description}</Text>
                
                {incident.actionTaken && (
                  <Text style={styles.actionTaken}>🔧 {incident.actionTaken}</Text>
                )}

                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(incident.status) }
                  ]}>
                    <Text style={styles.statusText}>{incident.status}</Text>
                  </View>
                </View>

                <View style={styles.incidentActions}>
                  <TouchableOpacity 
                    style={styles.updateButton}
                    onPress={() => handleUpdateIncident(incident.id, 'Update')}
                  >
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.escalateButton}
                    onPress={() => handleUpdateIncident(incident.id, 'Escalate')}
                  >
                    <Text style={styles.escalateButtonText}>Escalate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.resolveButton}
                    onPress={() => handleUpdateIncident(incident.id, 'Resolve')}
                  >
                    <Text style={styles.resolveButtonText}>Resolve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {activeIncidents.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyText}>No active incidents</Text>
                <Text style={styles.emptySubtext}>All issues have been resolved</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'resolved' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Resolved Incidents</Text>
            
            {resolvedIncidents.map((incident) => (
              <View key={incident.id} style={[styles.incidentCard, styles.resolvedCard]}>
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentIcon}>
                    <Text style={styles.typeIcon}>{getTypeIcon(incident.type)}</Text>
                  </View>
                  <View style={styles.incidentInfo}>
                    <Text style={styles.studentName}>{incident.studentName}</Text>
                    <Text style={styles.incidentType}>{incident.type} • {incident.date}</Text>
                  </View>
                  <View style={styles.resolvedBadge}>
                    <Text style={styles.resolvedText}>✅ RESOLVED</Text>
                  </View>
                </View>

                <Text style={styles.description}>{incident.description}</Text>
                
                {incident.actionTaken && (
                  <Text style={styles.actionTaken}>🔧 {incident.actionTaken}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'priority' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Priority Cases</Text>
            
            {incidents.filter(i => i.severity === 'HIGH' && i.status !== 'RESOLVED').map((incident) => (
              <View key={incident.id} style={[styles.incidentCard, styles.priorityCard]}>
                <View style={styles.priorityHeader}>
                  <Text style={styles.priorityLabel}>🚨 HIGH PRIORITY</Text>
                  <Text style={styles.priorityTime}>⏰ {incident.time}</Text>
                </View>
                
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentIcon}>
                    <Text style={styles.typeIcon}>{getTypeIcon(incident.type)}</Text>
                  </View>
                  <View style={styles.incidentInfo}>
                    <Text style={styles.studentName}>{incident.studentName}</Text>
                    <Text style={styles.incidentType}>{incident.type}</Text>
                  </View>
                </View>

                <Text style={styles.description}>{incident.description}</Text>
                
                <View style={styles.urgentActions}>
                  <TouchableOpacity style={styles.urgentButton}>
                    <Text style={styles.urgentButtonText}>🏃‍♂️ Take Action</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.escalateUrgentButton}>
                    <Text style={styles.escalateUrgentButtonText}>📞 Call Principal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add extra padding for bottom navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* New Incident Modal */}
      <Modal
        visible={showNewIncidentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewIncidentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Record New Incident</Text>
            
            <Text style={styles.inputLabel}>Student Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter student name..."
              value={newIncident.studentName}
              onChangeText={(text) => setNewIncident({...newIncident, studentName: text})}
            />
            
            <Text style={styles.inputLabel}>Incident Type *</Text>
            <View style={styles.typeGrid}>
              {incidentTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newIncident.type === type && styles.selectedType
                  ]}
                  onPress={() => setNewIncident({...newIncident, type})}
                >
                  <Text style={[
                    styles.typeText,
                    newIncident.type === type && styles.selectedTypeText
                  ]}>
                    {getTypeIcon(type)} {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Severity</Text>
            <View style={styles.severityOptions}>
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((severity) => (
                <TouchableOpacity
                  key={severity}
                  style={[
                    styles.severityOption,
                    newIncident.severity === severity && styles.selectedSeverity,
                    { borderColor: getSeverityColor(severity) }
                  ]}
                  onPress={() => setNewIncident({...newIncident, severity})}
                >
                  <Text style={[
                    styles.severityOptionText,
                    newIncident.severity === severity && { color: getSeverityColor(severity) }
                  ]}>
                    {severity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe what happened..."
              value={newIncident.description}
              onChangeText={(text) => setNewIncident({...newIncident, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.inputLabel}>Action Taken</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What action was taken?"
              value={newIncident.actionTaken}
              onChangeText={(text) => setNewIncident({...newIncident, actionTaken: text})}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowNewIncidentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleNewIncident}
              >
                <Text style={styles.saveButtonText}>Record Incident</Text>
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
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
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
    fontSize: 14,
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
    marginBottom: 12,
  },
  incidentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resolvedCard: {
    backgroundColor: '#f8fff9',
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  priorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    backgroundColor: '#fef9f9',
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  incidentIcon: {
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 24,
  },
  incidentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  incidentType: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
  },
  description: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  actionTaken: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  incidentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  escalateButton: {
    flex: 1,
    backgroundColor: '#f39c12',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  escalateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resolveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resolvedBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resolvedText: {
    color: '#155724',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  priorityTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  urgentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  urgentButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  urgentButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  escalateUrgentButton: {
    flex: 1,
    backgroundColor: '#8e44ad',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  escalateUrgentButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  selectedType: {
    backgroundColor: '#c0392b',
    borderColor: '#c0392b',
  },
  typeText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  selectedTypeText: {
    color: 'white',
  },
  severityOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  severityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedSeverity: {
    backgroundColor: 'white',
  },
  severityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  saveButton: {
    flex: 1,
    backgroundColor: '#c0392b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 80,
  },
});

export default IncidentManagementScreen; 