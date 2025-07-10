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
  Linking,
} from 'react-native';

interface EmergencyContact {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  extension?: string;
  availability: string;
  type: 'primary' | 'medical' | 'security' | 'admin';
}

interface MedicalInfo {
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyMedicalContact: string;
  bloodType: string;
  lastUpdate: string;
}

interface EmergencyContactScreenProps {
  onBack: () => void;
  childName: string;
}

const EmergencyContactScreen: React.FC<EmergencyContactScreenProps> = ({ onBack, childName }) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'medical' | 'procedures'>('contacts');

  const emergencyContacts: EmergencyContact[] = [
    {
      id: '1',
      name: 'School Reception',
      title: 'Main Office',
      phone: '+1 (555) 123-4567',
      email: 'reception@stsephen.edu',
      extension: '100',
      availability: '24/7',
      type: 'primary',
    },
    {
      id: '2',
      name: 'Principal Jane Davis',
      title: 'School Principal',
      phone: '+1 (555) 123-4568',
      email: 'principal@stsephen.edu',
      extension: '101',
      availability: 'Mon-Fri 8AM-5PM',
      type: 'admin',
    },
    {
      id: '3',
      name: 'School Nurse Mary Johnson',
      title: 'Medical Officer',
      phone: '+1 (555) 123-4569',
      email: 'nurse@stsephen.edu',
      extension: '102',
      availability: 'Mon-Fri 8AM-4PM',
      type: 'medical',
    },
    {
      id: '4',
      name: 'Security Office',
      title: 'Campus Security',
      phone: '+1 (555) 123-4570',
      email: 'security@stsephen.edu',
      extension: '911',
      availability: '24/7',
      type: 'security',
    },
    {
      id: '5',
      name: 'Transportation Office',
      title: 'Bus Services',
      phone: '+1 (555) 123-4571',
      email: 'transport@stsephen.edu',
      extension: '103',
      availability: 'Mon-Fri 6AM-6PM',
      type: 'admin',
    },
  ];

  const medicalInfo: MedicalInfo = {
    allergies: ['Peanuts', 'Shellfish'],
    medications: ['Inhaler (as needed)'],
    conditions: ['Mild Asthma'],
    emergencyMedicalContact: 'Dr. Sarah Wilson - +1 (555) 987-6543',
    bloodType: 'O+',
    lastUpdate: '2024-11-15',
  };

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'primary': return '🏢';
      case 'medical': return '🏥';
      case 'security': return '🛡️';
      case 'admin': return '👨‍💼';
      default: return '📞';
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return '#3498db';
      case 'medical': return '#e74c3c';
      case 'security': return '#f39c12';
      case 'admin': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      'Make Call',
      `Call ${name} at ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${phone}`)
        },
      ]
    );
  };

  const handleEmail = (email: string, name: string) => {
    Alert.alert(
      'Send Email',
      `Send email to ${name} at ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL(`mailto:${email}`)
        },
      ]
    );
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'Are you sure you want to call emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call 911', 
          style: 'destructive',
          onPress: () => Linking.openURL('tel:911')
        },
      ]
    );
  };

  const renderContacts = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Emergency Button */}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <Text style={styles.emergencyIcon}>🚨</Text>
        <Text style={styles.emergencyText}>EMERGENCY CALL 911</Text>
        <Text style={styles.emergencySubtext}>For immediate emergencies only</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleCall('+1 (555) 123-4567', 'School Reception')}
        >
          <Text style={styles.quickActionIcon}>📞</Text>
          <Text style={styles.quickActionText}>Call School</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleCall('+1 (555) 123-4569', 'School Nurse')}
        >
          <Text style={styles.quickActionIcon}>🏥</Text>
          <Text style={styles.quickActionText}>Call Nurse</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleCall('+1 (555) 123-4570', 'Security')}
        >
          <Text style={styles.quickActionIcon}>🛡️</Text>
          <Text style={styles.quickActionText}>Security</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Contacts List */}
      <Text style={styles.sectionTitle}>Emergency Contacts</Text>
      
      {emergencyContacts.map((contact) => (
        <View key={contact.id} style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactIcon}>{getContactTypeIcon(contact.type)}</Text>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactTitle}>{contact.title}</Text>
                <Text style={styles.contactAvailability}>{contact.availability}</Text>
              </View>
            </View>
            <View style={[styles.contactTypeBadge, { backgroundColor: getContactTypeColor(contact.type) }]}>
              <Text style={styles.contactTypeText}>{contact.type.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.contactActions}>
            <TouchableOpacity 
              style={styles.contactActionButton}
              onPress={() => handleCall(contact.phone, contact.name)}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>{contact.phone}</Text>
              {contact.extension && (
                <Text style={styles.extensionText}>Ext. {contact.extension}</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactActionButton}
              onPress={() => handleEmail(contact.email, contact.name)}
            >
              <Text style={styles.actionIcon}>📧</Text>
              <Text style={styles.actionText}>{contact.email}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderMedical = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.medicalContainer}>
        <Text style={styles.sectionTitle}>Medical Information</Text>
        <Text style={styles.sectionSubtitle}>For {childName}</Text>
        
        {/* Medical Summary */}
        <View style={styles.medicalCard}>
          <View style={styles.medicalHeader}>
            <Text style={styles.medicalTitle}>📋 Medical Summary</Text>
            <Text style={styles.lastUpdate}>Updated: {medicalInfo.lastUpdate}</Text>
          </View>
          
          <View style={styles.medicalInfo}>
            <View style={styles.medicalRow}>
              <Text style={styles.medicalLabel}>Blood Type:</Text>
              <Text style={styles.medicalValue}>{medicalInfo.bloodType}</Text>
            </View>
            
            <View style={styles.medicalRow}>
              <Text style={styles.medicalLabel}>Emergency Doctor:</Text>
              <TouchableOpacity onPress={() => handleCall('+1 (555) 987-6543', 'Dr. Sarah Wilson')}>
                <Text style={styles.medicalValue}>{medicalInfo.emergencyMedicalContact}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.medicalCard}>
          <Text style={styles.medicalTitle}>⚠️ Allergies</Text>
          {medicalInfo.allergies.length > 0 ? (
            medicalInfo.allergies.map((allergy, index) => (
              <View key={index} style={styles.alertItem}>
                <Text style={styles.alertIcon}>🚨</Text>
                <Text style={styles.alertText}>{allergy}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No known allergies</Text>
          )}
        </View>

        {/* Medical Conditions */}
        <View style={styles.medicalCard}>
          <Text style={styles.medicalTitle}>🩺 Medical Conditions</Text>
          {medicalInfo.conditions.length > 0 ? (
            medicalInfo.conditions.map((condition, index) => (
              <View key={index} style={styles.conditionItem}>
                <Text style={styles.conditionIcon}>📋</Text>
                <Text style={styles.conditionText}>{condition}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No medical conditions</Text>
          )}
        </View>

        {/* Medications */}
        <View style={styles.medicalCard}>
          <Text style={styles.medicalTitle}>💊 Current Medications</Text>
          {medicalInfo.medications.length > 0 ? (
            medicalInfo.medications.map((medication, index) => (
              <View key={index} style={styles.medicationItem}>
                <Text style={styles.medicationIcon}>💊</Text>
                <Text style={styles.medicationText}>{medication}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No current medications</Text>
          )}
        </View>

        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>📝 Update Medical Information</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProcedures = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Emergency Procedures</Text>
      
      <View style={styles.procedureCard}>
        <Text style={styles.procedureTitle}>🚨 School Emergency Lockdown</Text>
        <Text style={styles.procedureText}>
          1. Students remain in classrooms with doors locked{'\n'}
          2. Teachers take attendance and await further instructions{'\n'}
          3. Parents will be notified via SMS and email{'\n'}
          4. DO NOT come to school during lockdown{'\n'}
          5. Await official all-clear notification
        </Text>
      </View>

      <View style={styles.procedureCard}>
        <Text style={styles.procedureTitle}>🔥 Fire Emergency</Text>
        <Text style={styles.procedureText}>
          1. Students evacuate to designated assembly areas{'\n'}
          2. Teachers take attendance at assembly points{'\n'}
          3. Parents will be notified of pickup location{'\n'}
          4. Follow instructions from emergency personnel{'\n'}
          5. Reunification site: Community Center (if needed)
        </Text>
      </View>

      <View style={styles.procedureCard}>
        <Text style={styles.procedureTitle}>🏥 Medical Emergency</Text>
        <Text style={styles.procedureText}>
          1. School nurse provides immediate care{'\n'}
          2. Emergency services called if necessary{'\n'}
          3. Parents contacted immediately{'\n'}
          4. Student transported to nearest hospital if needed{'\n'}
          5. Parent/guardian meets at hospital or school
        </Text>
      </View>

      <View style={styles.procedureCard}>
        <Text style={styles.procedureTitle}>🌪️ Severe Weather</Text>
        <Text style={styles.procedureText}>
          1. Students moved to interior safe areas{'\n'}
          2. Shelter in place until weather passes{'\n'}
          3. Parents notified of extended stay if necessary{'\n'}
          4. Pickup procedures may be modified{'\n'}
          5. School closure decisions communicated promptly
        </Text>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactInfoTitle}>📞 Important Numbers</Text>
        <Text style={styles.contactInfoText}>Emergency Services: 911</Text>
        <Text style={styles.contactInfoText}>School Main: +1 (555) 123-4567</Text>
        <Text style={styles.contactInfoText}>School Emergency Line: +1 (555) 123-4570</Text>
        <Text style={styles.contactInfoText}>District Office: +1 (555) 123-4500</Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Emergency Contact</Text>
          <Text style={styles.headerSubtitle}>{childName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
            Contacts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'medical' && styles.activeTab]}
          onPress={() => setActiveTab('medical')}
        >
          <Text style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
            Medical
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'procedures' && styles.activeTab]}
          onPress={() => setActiveTab('procedures')}
        >
          <Text style={[styles.tabText, activeTab === 'procedures' && styles.activeTabText]}>
            Procedures
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'contacts' && renderContacts()}
        {activeTab === 'medical' && renderMedical()}
        {activeTab === 'procedures' && renderProcedures()}
      </View>
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
    borderBottomColor: '#e74c3c',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emergencyButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emergencyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emergencySubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionButton: {
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
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  contactCard: {
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
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  contactTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  contactAvailability: {
    fontSize: 12,
    color: '#2ecc71',
    marginTop: 2,
    fontWeight: '600',
  },
  contactTypeBadge: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  contactTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contactActions: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 15,
  },
  contactActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    flex: 1,
  },
  extensionText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  medicalContainer: {
    flex: 1,
  },
  medicalCard: {
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
  medicalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  medicalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  medicalInfo: {
    marginTop: 10,
  },
  medicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  medicalLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  medicalValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeaea',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  alertIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  alertText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  conditionIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  conditionText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fff0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  medicationIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  medicationText: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  updateButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  procedureCard: {
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
  procedureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  procedureText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 22,
  },
  contactInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  contactInfoText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
});

export default EmergencyContactScreen; 