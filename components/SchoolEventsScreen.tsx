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

interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'academic' | 'sports' | 'cultural' | 'parent' | 'exam';
  priority: 'normal' | 'high' | 'urgent';
  rsvpRequired: boolean;
  rsvpStatus?: 'pending' | 'accepted' | 'declined';
  organizer: string;
  maxAttendees?: number;
  currentAttendees?: number;
}

interface SchoolEventsScreenProps {
  onBack: () => void;
  childName: string;
}

const SchoolEventsScreen: React.FC<SchoolEventsScreenProps> = ({ onBack, childName }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'academic' | 'sports' | 'cultural' | 'parent' | 'exam'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const events: SchoolEvent[] = [
    {
      id: '1',
      title: 'Parent-Teacher Meeting',
      description: 'Quarterly parent-teacher conference to discuss student progress and development.',
      date: '2024-12-13',
      time: '2:00 PM - 5:00 PM',
      location: 'School Auditorium',
      category: 'parent',
      priority: 'high',
      rsvpRequired: true,
      rsvpStatus: 'pending',
      organizer: 'School Administration',
      maxAttendees: 200,
      currentAttendees: 150,
    },
    {
      id: '2',
      title: 'Winter Science Fair',
      description: 'Students will showcase their science projects and experiments. Parents and community members are welcome.',
      date: '2024-12-15',
      time: '10:00 AM - 3:00 PM',
      location: 'Main Hall',
      category: 'academic',
      priority: 'normal',
      rsvpRequired: false,
      organizer: 'Science Department',
    },
    {
      id: '3',
      title: 'Term End Examinations',
      description: 'Final examinations for the current term. Please ensure students are well-prepared.',
      date: '2024-12-18',
      time: '9:00 AM - 12:00 PM',
      location: 'Classrooms',
      category: 'exam',
      priority: 'urgent',
      rsvpRequired: false,
      organizer: 'Academic Office',
    },
    {
      id: '4',
      title: 'Christmas Carol Concert',
      description: 'Annual Christmas celebration with carol singing, performances, and festive activities.',
      date: '2024-12-20',
      time: '6:00 PM - 8:00 PM',
      location: 'School Auditorium',
      category: 'cultural',
      priority: 'normal',
      rsvpRequired: true,
      rsvpStatus: 'accepted',
      organizer: 'Music Department',
      maxAttendees: 300,
      currentAttendees: 275,
    },
    {
      id: '5',
      title: 'Winter Sports Day',
      description: 'Annual sports competition featuring various games and activities for all grade levels.',
      date: '2024-12-22',
      time: '8:00 AM - 4:00 PM',
      location: 'Sports Ground',
      category: 'sports',
      priority: 'normal',
      rsvpRequired: false,
      organizer: 'Physical Education Department',
    },
    {
      id: '6',
      title: 'New Year Assembly',
      description: 'Special assembly to welcome the new year with motivational speeches and resolutions.',
      date: '2025-01-02',
      time: '8:30 AM - 9:30 AM',
      location: 'School Assembly Hall',
      category: 'academic',
      priority: 'normal',
      rsvpRequired: false,
      organizer: 'Principal Office',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return '#3498db';
      case 'sports': return '#e74c3c';
      case 'cultural': return '#9b59b6';
      case 'parent': return '#2ecc71';
      case 'exam': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return '📚';
      case 'sports': return '⚽';
      case 'cultural': return '🎭';
      case 'parent': return '👨‍👩‍👧‍👦';
      case 'exam': return '📝';
      default: return '📅';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      default: return '📌';
    }
  };

  const getRsvpStatusIcon = (status?: string) => {
    switch (status) {
      case 'accepted': return '✅';
      case 'declined': return '❌';
      case 'pending': return '⏳';
      default: return '📝';
    }
  };

  const filterEvents = () => {
    if (selectedCategory === 'all') return events;
    return events.filter(event => event.category === selectedCategory);
  };

  const handleRsvp = (eventId: string, response: 'accepted' | 'declined') => {
    Alert.alert(
      'RSVP Confirmation',
      `You have ${response} the invitation for this event.`,
      [{ text: 'OK' }]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate >= today;
  };

  const categories = [
    { key: 'all', label: 'All Events', count: events.length },
    { key: 'academic', label: 'Academic', count: events.filter(e => e.category === 'academic').length },
    { key: 'sports', label: 'Sports', count: events.filter(e => e.category === 'sports').length },
    { key: 'cultural', label: 'Cultural', count: events.filter(e => e.category === 'cultural').length },
    { key: 'parent', label: 'Parent', count: events.filter(e => e.category === 'parent').length },
    { key: 'exam', label: 'Exams', count: events.filter(e => e.category === 'exam').length },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>School Events</Text>
          <Text style={styles.headerSubtitle}>{childName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
          <Text style={styles.statNumber}>{events.filter(e => isUpcoming(e.date)).length}</Text>
          <Text style={styles.statLabel}>Upcoming Events</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#2ecc71' }]}>
          <Text style={styles.statNumber}>{events.filter(e => e.rsvpRequired && e.rsvpStatus === 'accepted').length}</Text>
          <Text style={styles.statLabel}>RSVP Confirmed</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#f39c12' }]}>
          <Text style={styles.statNumber}>{events.filter(e => e.rsvpRequired && e.rsvpStatus === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending RSVP</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.activeCategoryButton,
                { borderColor: getCategoryColor(category.key) }
              ]}
              onPress={() => setSelectedCategory(category.key as any)}
            >
              <Text style={styles.categoryIcon}>
                {category.key === 'all' ? '📅' : getCategoryIcon(category.key)}
              </Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.key && styles.activeCategoryText
              ]}>
                {category.label}
              </Text>
              <Text style={styles.categoryCount}>({category.count})</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Events List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Events' : categories.find(c => c.key === selectedCategory)?.label}
          </Text>
          <Text style={styles.eventCount}>{filterEvents().length} events</Text>
        </View>

        {filterEvents().map((event) => (
          <View key={event.id} style={[
            styles.eventCard,
            !isUpcoming(event.date) && styles.pastEvent
          ]}>
            <View style={styles.eventHeader}>
              <View style={styles.eventTitleContainer}>
                <Text style={styles.eventIcon}>
                  {getCategoryIcon(event.category)}
                </Text>
                <View style={styles.eventTitleInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventOrganizer}>by {event.organizer}</Text>
                </View>
              </View>
              <View style={styles.eventBadges}>
                {event.priority !== 'normal' && (
                  <Text style={styles.priorityIcon}>{getPriorityIcon(event.priority)}</Text>
                )}
                {!isUpcoming(event.date) && (
                  <Text style={styles.pastBadge}>Past</Text>
                )}
              </View>
            </View>

            <Text style={styles.eventDescription}>{event.description}</Text>

            <View style={styles.eventDetails}>
              <View style={styles.eventDetailRow}>
                <Text style={styles.detailIcon}>📅</Text>
                <Text style={styles.detailText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Text style={styles.detailIcon}>⏰</Text>
                <Text style={styles.detailText}>{event.time}</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            </View>

            {event.maxAttendees && (
              <View style={styles.attendanceInfo}>
                <Text style={styles.attendanceText}>
                  👥 {event.currentAttendees}/{event.maxAttendees} attendees
                </Text>
                <View style={styles.attendanceBar}>
                  <View 
                    style={[
                      styles.attendanceFill,
                      { width: `${((event.currentAttendees || 0) / event.maxAttendees) * 100}%` }
                    ]}
                  />
                </View>
              </View>
            )}

            {event.rsvpRequired && isUpcoming(event.date) && (
              <View style={styles.rsvpContainer}>
                <Text style={styles.rsvpLabel}>
                  RSVP Status: {getRsvpStatusIcon(event.rsvpStatus)} {event.rsvpStatus || 'Not responded'}
                </Text>
                {event.rsvpStatus === 'pending' && (
                  <View style={styles.rsvpButtons}>
                    <TouchableOpacity 
                      style={[styles.rsvpButton, styles.acceptButton]}
                      onPress={() => handleRsvp(event.id, 'accepted')}
                    >
                      <Text style={styles.rsvpButtonText}>✓ Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.rsvpButton, styles.declineButton]}
                      onPress={() => handleRsvp(event.id, 'declined')}
                    >
                      <Text style={styles.rsvpButtonText}>✗ Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <View style={styles.eventActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>📄 View Details</Text>
              </TouchableOpacity>
              {isUpcoming(event.date) && (
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>📅 Add to Calendar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>📅</Text>
            <Text style={styles.quickActionText}>View School Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>📧</Text>
            <Text style={styles.quickActionText}>Event Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Information Note */}
        <View style={styles.infoNote}>
          <Text style={styles.infoTitle}>📋 Event Information</Text>
          <Text style={styles.infoText}>• RSVP deadlines are typically 3 days before the event</Text>
          <Text style={styles.infoText}>• Check your email for event updates and reminders</Text>
          <Text style={styles.infoText}>• Contact the school office for event inquiries</Text>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    minWidth: 80,
  },
  activeCategoryButton: {
    backgroundColor: '#f0f8ff',
  },
  categoryIcon: {
    fontSize: 16,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  activeCategoryText: {
    color: '#3498db',
  },
  categoryCount: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  eventCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pastEvent: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventTitleInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  eventOrganizer: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  eventBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  pastBadge: {
    backgroundColor: '#95a5a6',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  eventDescription: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
    marginBottom: 15,
  },
  eventDetails: {
    marginBottom: 15,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 10,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  attendanceInfo: {
    marginBottom: 15,
  },
  attendanceText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  attendanceBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
  },
  attendanceFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
    borderRadius: 3,
  },
  rsvpContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  rsvpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  rsvpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
  },
  declineButton: {
    backgroundColor: '#e74c3c',
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
  infoNote: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default SchoolEventsScreen; 